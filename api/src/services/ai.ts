import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { ParsedFood, MicronutrientAnalysis, FoodForAnalysis, MicronutrientsPerServing } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// --- Helpers ---

/** Strip ```json ... ``` fences that LLMs sometimes add despite instructions */
export function stripMarkdownWrapper(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  return match ? match[1].trim() : trimmed;
}

/** Sanitize user input before interpolating into the AI prompt */
export function sanitizeUserInput(input: string): string {
  return input
    .slice(0, 500)
    .replace(/[""]/g, '"')
    .replace(/[\n\r]+/g, ' ')
    .replace(/\\/g, '');
}

// --- Zod schemas ---

const MicronutrientsSchema = z.object({
  vitamin_a_mcg: z.number().nonnegative().default(0),
  vitamin_b1_mg: z.number().nonnegative().default(0),
  vitamin_b2_mg: z.number().nonnegative().default(0),
  vitamin_b3_mg: z.number().nonnegative().default(0),
  vitamin_b5_mg: z.number().nonnegative().default(0),
  vitamin_b6_mg: z.number().nonnegative().default(0),
  vitamin_b7_mcg: z.number().nonnegative().default(0),
  vitamin_b9_mcg: z.number().nonnegative().default(0),
  vitamin_b12_mcg: z.number().nonnegative().default(0),
  vitamin_c_mg: z.number().nonnegative().default(0),
  vitamin_d_mcg: z.number().nonnegative().default(0),
  vitamin_e_mg: z.number().nonnegative().default(0),
  vitamin_k_mcg: z.number().nonnegative().default(0),
  calcium_mg: z.number().nonnegative().default(0),
  iron_mg: z.number().nonnegative().default(0),
  magnesium_mg: z.number().nonnegative().default(0),
  phosphorus_mg: z.number().nonnegative().default(0),
  potassium_mg: z.number().nonnegative().default(0),
  sodium_mg: z.number().nonnegative().default(0),
  zinc_mg: z.number().nonnegative().default(0),
  copper_mg: z.number().nonnegative().default(0),
  manganese_mg: z.number().nonnegative().default(0),
  selenium_mcg: z.number().nonnegative().default(0),
}).default({
  vitamin_a_mcg: 0, vitamin_b1_mg: 0, vitamin_b2_mg: 0, vitamin_b3_mg: 0,
  vitamin_b5_mg: 0, vitamin_b6_mg: 0, vitamin_b7_mcg: 0, vitamin_b9_mcg: 0,
  vitamin_b12_mcg: 0, vitamin_c_mg: 0, vitamin_d_mcg: 0, vitamin_e_mg: 0,
  vitamin_k_mcg: 0, calcium_mg: 0, iron_mg: 0, magnesium_mg: 0,
  phosphorus_mg: 0, potassium_mg: 0, sodium_mg: 0, zinc_mg: 0,
  copper_mg: 0, manganese_mg: 0, selenium_mcg: 0,
});

const ParsedFoodSchema = z.object({
  name: z.string().min(1),
  servings: z.number().positive().max(100).default(1),
  serving_unit: z.string().default('1 serving'),
  calories_per_serving: z.number().nonnegative().default(0),
  protein_per_serving: z.number().nonnegative().default(0),
  carbs_per_serving: z.number().nonnegative().default(0),
  fat_per_serving: z.number().nonnegative().default(0),
  micronutrients: MicronutrientsSchema,
});

const NutrientValueSchema = z.object({
  amount: z.number().nonnegative().default(0),
  unit: z.string(),
  percentDV: z.number().nonnegative().default(0),
});

const MicronutrientAnalysisSchema = z.object({
  vitamins: z.object({
    a: NutrientValueSchema,
    b1: NutrientValueSchema,
    b2: NutrientValueSchema,
    b3: NutrientValueSchema,
    b5: NutrientValueSchema,
    b6: NutrientValueSchema,
    b7: NutrientValueSchema,
    b9: NutrientValueSchema,
    b12: NutrientValueSchema,
    c: NutrientValueSchema,
    d: NutrientValueSchema,
    e: NutrientValueSchema,
    k: NutrientValueSchema,
  }),
  minerals: z.object({
    calcium: NutrientValueSchema,
    iron: NutrientValueSchema,
    magnesium: NutrientValueSchema,
    phosphorus: NutrientValueSchema,
    potassium: NutrientValueSchema,
    sodium: NutrientValueSchema,
    zinc: NutrientValueSchema,
    copper: NutrientValueSchema,
    manganese: NutrientValueSchema,
    selenium: NutrientValueSchema,
  }),
  summary: z.string().default('No summary available.'),
});

const DEFAULT_MICRONUTRIENTS: MicronutrientsPerServing = {
  vitamin_a_mcg: 0,
  vitamin_b1_mg: 0,
  vitamin_b2_mg: 0,
  vitamin_b3_mg: 0,
  vitamin_b5_mg: 0,
  vitamin_b6_mg: 0,
  vitamin_b7_mcg: 0,
  vitamin_b9_mcg: 0,
  vitamin_b12_mcg: 0,
  vitamin_c_mg: 0,
  vitamin_d_mcg: 0,
  vitamin_e_mg: 0,
  vitamin_k_mcg: 0,
  calcium_mg: 0,
  iron_mg: 0,
  magnesium_mg: 0,
  phosphorus_mg: 0,
  potassium_mg: 0,
  sodium_mg: 0,
  zinc_mg: 0,
  copper_mg: 0,
  manganese_mg: 0,
  selenium_mcg: 0,
};

export async function parseFoodInput(input: string): Promise<ParsedFood> {
  const safeInput = sanitizeUserInput(input);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Parse the following food description and return nutritional information including micronutrients.

Input: "${safeInput}"

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "name": "food name",
  "servings": 1,
  "serving_unit": "description of one serving (e.g., '1 large egg', '1 cup', '100g')",
  "calories_per_serving": number,
  "protein_per_serving": number in grams,
  "carbs_per_serving": number in grams,
  "fat_per_serving": number in grams,
  "micronutrients": {
    "vitamin_a_mcg": number,
    "vitamin_b1_mg": number,
    "vitamin_b2_mg": number,
    "vitamin_b3_mg": number,
    "vitamin_b5_mg": number,
    "vitamin_b6_mg": number,
    "vitamin_b7_mcg": number,
    "vitamin_b9_mcg": number,
    "vitamin_b12_mcg": number,
    "vitamin_c_mg": number,
    "vitamin_d_mcg": number,
    "vitamin_e_mg": number,
    "vitamin_k_mcg": number,
    "calcium_mg": number,
    "iron_mg": number,
    "magnesium_mg": number,
    "phosphorus_mg": number,
    "potassium_mg": number,
    "sodium_mg": number,
    "zinc_mg": number,
    "copper_mg": number,
    "manganese_mg": number,
    "selenium_mcg": number
  }
}

Micronutrient estimates should be per serving. Use realistic values based on typical nutrient content of the food.

Examples:
- "2 eggs" -> name: "Egg", servings: 2, serving_unit: "1 large egg", calories: 78, protein: 6g, with micronutrients like vitamin_a_mcg: 80, vitamin_b12_mcg: 0.6, etc.
- "bowl of oatmeal" -> name: "Oatmeal", servings: 1, serving_unit: "1 cup cooked", calories: 150, protein: 5g, with micronutrients like iron_mg: 2.1, magnesium_mg: 63, etc.

Use your knowledge of nutrition to provide accurate estimates. If quantities are mentioned (like "2 eggs"), set servings accordingly. Return only the JSON object.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }

  try {
    const json = JSON.parse(stripMarkdownWrapper(content.text));
    return ParsedFoodSchema.parse(json);
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error('AI response failed validation:', err.issues);
    } else {
      console.error('Failed to parse AI response:', content.text);
    }
    throw new Error('Failed to parse food information');
  }
}

export function getDefaultMicronutrients(): MicronutrientsPerServing {
  return { ...DEFAULT_MICRONUTRIENTS };
}

export async function analyzeMicronutrients(foods: FoodForAnalysis[]): Promise<MicronutrientAnalysis> {
  if (foods.length === 0) {
    return getEmptyMicronutrientAnalysis();
  }

  const foodList = foods.map(f => `- ${f.servings} x ${f.name} (${f.serving_unit})`).join('\n');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Analyze the micronutrient content of these foods consumed today:

${foodList}

Estimate the total micronutrients (vitamins and minerals) from these foods combined.

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "vitamins": {
    "a": { "amount": number in mcg, "unit": "mcg", "percentDV": number },
    "b1": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "b2": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "b3": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "b5": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "b6": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "b7": { "amount": number in mcg, "unit": "mcg", "percentDV": number },
    "b9": { "amount": number in mcg, "unit": "mcg", "percentDV": number },
    "b12": { "amount": number in mcg, "unit": "mcg", "percentDV": number },
    "c": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "d": { "amount": number in mcg, "unit": "mcg", "percentDV": number },
    "e": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "k": { "amount": number in mcg, "unit": "mcg", "percentDV": number }
  },
  "minerals": {
    "calcium": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "iron": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "magnesium": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "phosphorus": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "potassium": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "sodium": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "zinc": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "copper": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "manganese": { "amount": number in mg, "unit": "mg", "percentDV": number },
    "selenium": { "amount": number in mcg, "unit": "mcg", "percentDV": number }
  },
  "summary": "Brief 1-2 sentence summary of notable nutrients - what's good and what might be lacking"
}

Use standard Daily Values (DV) for adults. Be realistic based on typical nutrient content of these foods. Return only the JSON object.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }

  try {
    const json = JSON.parse(stripMarkdownWrapper(content.text));
    return MicronutrientAnalysisSchema.parse(json);
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error('Micronutrient response failed validation:', err.issues);
    } else {
      console.error('Failed to parse micronutrient response:', content.text);
    }
    throw new Error('Failed to analyze micronutrients');
  }
}

function getEmptyMicronutrientAnalysis(): MicronutrientAnalysis {
  const emptyNutrient = { amount: 0, unit: 'mg', percentDV: 0 };
  const emptyNutrientMcg = { amount: 0, unit: 'mcg', percentDV: 0 };

  return {
    vitamins: {
      a: emptyNutrientMcg,
      b1: emptyNutrient,
      b2: emptyNutrient,
      b3: emptyNutrient,
      b5: emptyNutrient,
      b6: emptyNutrient,
      b7: emptyNutrientMcg,
      b9: emptyNutrientMcg,
      b12: emptyNutrientMcg,
      c: emptyNutrient,
      d: emptyNutrientMcg,
      e: emptyNutrient,
      k: emptyNutrientMcg,
    },
    minerals: {
      calcium: emptyNutrient,
      iron: emptyNutrient,
      magnesium: emptyNutrient,
      phosphorus: emptyNutrient,
      potassium: emptyNutrient,
      sodium: emptyNutrient,
      zinc: emptyNutrient,
      copper: emptyNutrient,
      manganese: emptyNutrient,
      selenium: emptyNutrientMcg,
    },
    summary: 'No foods logged yet today.',
  };
}
