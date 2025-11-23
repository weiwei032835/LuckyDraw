import { LucideIcon } from 'lucide-react';

export interface Prize {
  id: number;
  label: string;
  subLabel?: string;
  value: number; // e.g., coin amount
  type: 'coin' | 'point' | 'special';
  icon: LucideIcon;
  color: string;
}

export interface GridItemProps {
  prize: Prize;
  isActive: boolean;
  index: number;
}

export enum GameStatus {
  IDLE = 'IDLE',
  SPINNING = 'SPINNING',
  STOPPING = 'STOPPING',
  WON = 'WON',
}

export interface AudioConfig {
  volume: number;
  isMuted: boolean;
}