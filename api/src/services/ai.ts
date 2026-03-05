import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { ParsedFood, MicronutrientAnalysis, FoodForAnalysis } from '../types';
import { logger } from '../logger';

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

const ParsedFoodSchema = z.object({
  name: z.string().min(1),
  servings: z.number().positive().max(100).default(1),
  serving_unit: z.string().default('1 serving'),
  calories_per_serving: z.number().nonnegative().default(0),
  protein_per_serving: z.number().nonnegative().default(0),
  carbs_per_serving: z.number().nonnegative().default(0),
  fat_per_serving: z.number().nonnegative().default(0),
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

export async function parseFoodInput(input: string): Promise<ParsedFood> {
  const safeInput = sanitizeUserInput(input);

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Parse this food description and return macronutrient information.

Input: "${safeInput}"

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "name": "food name",
  "servings": 1,
  "serving_unit": "description of one serving (e.g., '1 large egg', '1 cup', '100g')",
  "calories_per_serving": number,
  "protein_per_serving": number in grams,
  "carbs_per_serving": number in grams,
  "fat_per_serving": number in grams
}

Examples:
- "2 eggs" -> name: "Egg", servings: 2, serving_unit: "1 large egg", calories_per_serving: 78, protein_per_serving: 6, carbs_per_serving: 1, fat_per_serving: 5
- "bowl of oatmeal" -> name: "Oatmeal", servings: 1, serving_unit: "1 cup cooked", calories_per_serving: 150, protein_per_serving: 5, carbs_per_serving: 27, fat_per_serving: 3

If quantities are mentioned (like "2 eggs"), set servings accordingly. Return only the JSON object.`,
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
      logger.error({ issues: err.issues }, 'AI response failed validation');
    } else {
      logger.error({ response: content.text }, 'Failed to parse AI response');
    }
    throw new Error('Failed to parse food information');
  }
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
      logger.error({ issues: err.issues }, 'Micronutrient response failed validation');
    } else {
      logger.error({ response: content.text }, 'Failed to parse micronutrient response');
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
