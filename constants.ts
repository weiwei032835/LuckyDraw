import { Coins, Trophy, Sparkles, Zap, Crown, Star, Gift, Ticket } from 'lucide-react';
import { Prize } from './types';

// The visual order in the 3x3 grid is:
// 0 1 2
// 7 C 3  (C is center button)
// 6 5 4
// This creates a clockwise loop around the center.

export const PRIZES: Prize[] = [
  { id: 0, label: "100 Coins", value: 100, type: 'coin', icon: Coins, color: "text-yellow-600" },
  { id: 1, label: "500 Pts", value: 500, type: 'point', icon: Trophy, color: "text-orange-500" },
  { id: 2, label: "Mystery", value: 999, type: 'special', icon: Sparkles, color: "text-purple-500" },
  { id: 3, label: "50 Coins", value: 50, type: 'coin', icon: Coins, color: "text-yellow-600" },
  { id: 4, label: "1000 Pts", value: 1000, type: 'point', icon: Crown, color: "text-red-500" },
  { id: 5, label: "Bonus", value: 200, type: 'special', icon: Gift, color: "text-pink-500" },
  { id: 6, label: "200 Pts", value: 200, type: 'point', icon: Star, color: "text-orange-500" },
  { id: 7, label: "Ticket", value: 1, type: 'special', icon: Ticket, color: "text-blue-500" },
];

export const TOTAL_SLOTS = 8;
export const MIN_SPEED = 50; // Fastest speed (ms)
export const START_SPEED = 300; // Initial speed (ms)
export const SPEED_STEP = 0.85; // Acceleration multiplier
export const SLOW_STEP = 1.1; // Deceleration multiplier
export const MIN_ROUNDS = 3; // Minimum full loops before stopping