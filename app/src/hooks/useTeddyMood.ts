import { useMemo } from 'react';
import { MascotMood } from '../components/Mascot';
import { useDevMode } from '../dev/DevModeContext';

interface TeddyMoodResult {
  mood: MascotMood;
  message: string;
}

const messages: Record<MascotMood, string[]> = {
  thinking: [
    "Haven't seen you in a while!",
    'Where have you been?',
    'I missed tracking with you!',
  ],
  celebrating: [
    "You're on a roll!",
    'Streak champion!',
    'Keep it going!',
  ],
  excited: [
    'Great logging today!',
    "You're crushing it!",
    'Love the consistency!',
  ],
  happy: [
    'Good to see you!',
    "Let's keep it up!",
    'Nice start today!',
  ],
  sleepy: [
    'What did you eat today?',
    "Log something, I'm curious!",
    "Let's get started!",
  ],
};

// Milestone messages take priority over regular mood logic
const milestoneMessages: { streak: number; message: string }[] = [
  { streak: 100, message: '100 days! Legendary!' },
  { streak: 30, message: '30 days! Unstoppable!' },
  { streak: 7, message: '1 week streak! Amazing!' },
];

/**
 * Derive Teddy's mood and message from logging engagement.
 * Priority: milestones > thinking > celebrating > excited > happy > sleepy
 */
export function deriveTeddyMood(
  entriesCount: number,
  currentStreak: number,
  daysSince: number,
): TeddyMoodResult {
  // Check for streak milestones first
  for (const milestone of milestoneMessages) {
    if (currentStreak === milestone.streak) {
      return { mood: 'celebrating', message: milestone.message };
    }
  }

  let mood: MascotMood;

  if (daysSince >= 2 && isFinite(daysSince) && entriesCount === 0) {
    mood = 'thinking';
  } else if (currentStreak >= 3) {
    mood = 'celebrating';
  } else if (entriesCount >= 2) {
    mood = 'excited';
  } else if (entriesCount >= 1) {
    mood = 'happy';
  } else {
    mood = 'sleepy';
  }

  // Deterministic daily rotation via day-of-month
  const dayOfMonth = new Date().getDate();
  const pool = messages[mood];
  const message = pool[dayOfMonth % pool.length];

  return { mood, message };
}

export function useTeddyMood(
  entriesCount: number,
  currentStreak: number,
  daysSince: number,
): TeddyMoodResult {
  const dev = useDevMode();

  return useMemo(() => {
    if (dev.enabled && dev.moodOverride) {
      return { mood: dev.moodOverride, message: 'Dev mode override' };
    }
    return deriveTeddyMood(entriesCount, currentStreak, daysSince);
  }, [entriesCount, currentStreak, daysSince, dev.enabled, dev.moodOverride]);
}
