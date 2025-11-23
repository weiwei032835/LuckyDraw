import React from 'react';
import { GridItemProps } from '../types';

const GridCell: React.FC<GridItemProps> = ({ prize, isActive, index }) => {
  const Icon = prize.icon;

  return (
    <div 
      className={`
        relative flex flex-col items-center justify-center 
        h-24 sm:h-28 md:h-32 w-full 
        rounded-2xl transition-all duration-200 
        border-2
        ${isActive 
          ? 'bg-orange-50 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)] scale-105 z-10 ring-4 ring-orange-300' 
          : 'bg-white border-orange-100 shadow-md hover:shadow-lg'
        }
      `}
    >
      {/* Index indicator (optional, for debug or aesthetic) */}
      <div className="absolute top-1 right-2 text-[10px] text-gray-300 font-mono">
        #{index + 1}
      </div>

      {/* Icon Container */}
      <div className={`
        p-3 rounded-full mb-1 transition-colors duration-300
        ${isActive ? 'bg-orange-100' : 'bg-gray-50'}
      `}>
        <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${prize.color}`} />
      </div>

      {/* Labels */}
      <div className="text-center">
        <div className={`font-bold text-sm sm:text-base ${isActive ? 'text-orange-900' : 'text-gray-700'}`}>
          {prize.label}
        </div>
        {prize.subLabel && (
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">
            {prize.subLabel}
          </div>
        )}
      </div>
      
      {/* Active Glow Effect Overlay */}
      {isActive && (
        <div className="absolute inset-0 rounded-2xl bg-orange-400 opacity-10 pointer-events-none animate-pulse" />
      )}
    </div>
  );
};

export default GridCell;