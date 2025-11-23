import React, { useEffect } from 'react';
import { Prize } from '../types';
import { X, Share2 } from 'lucide-react';

interface ResultModalProps {
  prize: Prize | null;
  isOpen: boolean;
  onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ prize, isOpen, onClose }) => {
  if (!isOpen || !prize) return null;

  const Icon = prize.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-[bounce_0.5s_ease-out]">
        
        {/* Header Background Pattern */}
        <div className="h-32 bg-gradient-to-br from-yellow-400 to-orange-500 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent animate-pulse"></div>
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 pt-0 text-center relative -mt-16">
          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-full shadow-xl mb-4 ring-4 ring-orange-100">
            <Icon className={`w-14 h-14 ${prize.color}`} />
          </div>

          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
            Congratulations!
          </h2>
          <p className="text-gray-500 mb-6">
            You've won <span className={`font-bold ${prize.color}`}>{prize.label}</span>
          </p>

          {/* Reward Details Card */}
          <div className="bg-orange-50 rounded-xl p-4 mb-6 border border-orange-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm font-semibold">Value Recieved</span>
              <span className="text-orange-600 font-bold text-lg">+{prize.value}</span>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-95"
          >
            Claim Reward (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;