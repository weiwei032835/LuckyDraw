import React from 'react';
import { Volume2, VolumeX, HelpCircle } from 'lucide-react';

interface ControlPanelProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ volume, isMuted, onVolumeChange, onToggleMute }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-md mt-8 px-4 py-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50">
      
      {/* Volume Control */}
      <div className="flex items-center gap-3 flex-1">
        <button 
          onClick={onToggleMute}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
        />
      </div>

      <div className="w-px h-6 bg-gray-200 mx-4"></div>

      {/* Keyboard Hint */}
      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
        <span className="hidden sm:inline">Shortcuts:</span>
        <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-gray-500 font-sans">Space</kbd>
      </div>

    </div>
  );
};

export default ControlPanel;