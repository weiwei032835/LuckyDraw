import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PRIZES, TOTAL_SLOTS, START_SPEED, MIN_SPEED, SPEED_STEP, SLOW_STEP, MIN_ROUNDS } from './constants';
import { GameStatus, Prize } from './types';
import { audioManager } from './services/audioManager';
import GridCell from './components/GridCell';
import ResultModal from './components/ResultModal';
import ControlPanel from './components/ControlPanel';
import { Play, Loader2 } from 'lucide-react';

// Map grid visual positions (0-8) to logic loop indices (0-7)
// Grid Visual Index:
// 0 1 2
// 3 4 5
// 6 7 8
// Note: Index 4 is the center button.
// Logic Map (Clockwise from top-left):
// 0->0, 1->1, 2->2, 5->3, 8->4, 7->5, 6->6, 3->7
const GRID_TO_LOGIC_MAP: { [key: number]: number } = {
  0: 0, 1: 1, 2: 2,
  5: 3, 8: 4, 7: 5,
  6: 6, 3: 7
};

// Inverse map for rendering: Loop Index -> Prize Data
const getPrizeForGridIndex = (gridIndex: number): Prize | null => {
  if (gridIndex === 4) return null; // Center
  const logicIndex = GRID_TO_LOGIC_MAP[gridIndex];
  return PRIZES[logicIndex] || null;
};

const App: React.FC = () => {
  // --- State ---
  const [activeIndex, setActiveIndex] = useState<number | null>(null); // Logic index 0-7
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [resultPrize, setResultPrize] = useState<Prize | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Audio State
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // --- Refs for Game Loop (Mutable values without re-renders) ---
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedRef = useRef<number>(START_SPEED);
  const roundRef = useRef<number>(0);
  const currentIdxRef = useRef<number>(-1);
  const targetIdxRef = useRef<number>(-1);
  const statusRef = useRef<GameStatus>(GameStatus.IDLE); // Sync ref with state for timeout closures

  // --- Audio Handlers ---
  const handleVolumeChange = (val: number) => {
    setVolume(val);
    audioManager.setVolume(val);
    if (val > 0 && isMuted) setIsMuted(false);
  };

  const handleToggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  // --- Game Logic ---
  const endGame = useCallback(() => {
    setStatus(GameStatus.WON);
    statusRef.current = GameStatus.WON;
    const prize = PRIZES[currentIdxRef.current];
    setResultPrize(prize);
    
    audioManager.playWin();
    // Slight delay before modal
    setTimeout(() => {
      setShowModal(true);
    }, 500);
  }, []);

  const stopGame = useCallback(() => {
    // Determine Random Target
    const randomTarget = Math.floor(Math.random() * TOTAL_SLOTS);
    targetIdxRef.current = randomTarget;

    setStatus(GameStatus.STOPPING);
    statusRef.current = GameStatus.STOPPING;
    
    // Reset rounds to ensure at least one full spin happens during deceleration if needed
    roundRef.current = 0; 
  }, []);

  const runStep = useCallback(() => {
    // 1. Move to next index
    let nextIndex = currentIdxRef.current + 1;
    if (nextIndex >= TOTAL_SLOTS) {
      nextIndex = 0;
      roundRef.current += 1;
    }
    currentIdxRef.current = nextIndex;
    setActiveIndex(nextIndex);
    
    // Play Sound
    audioManager.playTick();

    // 2. Determine Next Speed/Action based on State
    if (statusRef.current === GameStatus.SPINNING) {
      // Accelerate
      if (speedRef.current > MIN_SPEED) {
        speedRef.current = Math.max(MIN_SPEED, speedRef.current * SPEED_STEP);
      }
    } else if (statusRef.current === GameStatus.STOPPING) {
      // Decelerate logic
      const dist = (targetIdxRef.current - nextIndex + TOTAL_SLOTS) % TOTAL_SLOTS;
      
      // If we are close to target and speed is slow enough, check stop condition
      if (dist === 0 && roundRef.current >= MIN_ROUNDS && speedRef.current > 200) {
        endGame();
        return; 
      }

      // Slow down
      if (roundRef.current >= MIN_ROUNDS && dist < 4) {
         speedRef.current = Math.min(START_SPEED + 200, speedRef.current * 1.2);
      } else {
         speedRef.current = Math.min(START_SPEED, speedRef.current * SLOW_STEP);
      }
    }

    // 3. Schedule next step
    timerRef.current = setTimeout(runStep, speedRef.current);
  }, [endGame]);

  const startGame = () => {
    if (status !== GameStatus.IDLE && status !== GameStatus.WON) return;
    
    // Start Audio Context (Browser requirement)
    audioManager.startBGM();

    // Reset State
    setShowModal(false);
    setStatus(GameStatus.SPINNING);
    statusRef.current = GameStatus.SPINNING;
    
    speedRef.current = START_SPEED;
    roundRef.current = 0;
    currentIdxRef.current = activeIndex !== null ? activeIndex : -1;
    targetIdxRef.current = -1;

    // Start Loop
    if (timerRef.current) clearTimeout(timerRef.current);
    runStep();

    // Auto stop after fixed duration (5 seconds)
    if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
    autoStopTimerRef.current = setTimeout(() => {
      stopGame();
    }, 3000);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setStatus(GameStatus.IDLE);
    statusRef.current = GameStatus.IDLE;
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        if (showModal) return;
        
        if (status === GameStatus.IDLE || status === GameStatus.WON) {
          startGame();
        } 
        // Note: Manual stop via spacebar disabled for fixed-time mode
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, showModal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
      audioManager.stopBGM();
    };
  }, []);

  // --- Render Helpers ---
  const renderGrid = () => {
    const gridItemsRender = [];
    for (let i = 0; i < 9; i++) {
       if (i === 4) {
        // Center Button
        gridItemsRender.push(
          <div key="center-btn" className="w-full h-24 sm:h-28 md:h-32 flex items-center justify-center relative">
             {/* Decorative Ring */}
             <div className="absolute inset-0 bg-orange-200 rounded-full scale-90 opacity-20 animate-ping"></div>
             
             <button
              onClick={startGame}
              disabled={status === GameStatus.SPINNING || status === GameStatus.STOPPING}
              className={`
                relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full 
                flex flex-col items-center justify-center
                shadow-xl border-4 border-white
                transition-all duration-150 active:scale-95
                ${(status === GameStatus.SPINNING || status === GameStatus.STOPPING)
                  ? 'bg-orange-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400'
                }
              `}
            >
              {(status === GameStatus.SPINNING || status === GameStatus.STOPPING) ? (
                <>
                  <Loader2 className="w-8 h-8 text-white animate-spin mb-1" />
                  <span className="text-[10px] text-white font-bold uppercase tracking-widest">Wait</span>
                </>
              ) : (
                <>
                  <Play className="w-8 h-8 text-white fill-current ml-1 mb-1" />
                  <span className="text-[10px] text-white font-bold uppercase tracking-widest">Start</span>
                </>
              )}
            </button>
          </div>
        );
      } else {
        const prize = getPrizeForGridIndex(i);
        if (prize) {
          const logicIndex = GRID_TO_LOGIC_MAP[i];
          const isActive = activeIndex === logicIndex;
          gridItemsRender.push(
            <GridCell 
              key={prize.id} 
              prize={prize} 
              isActive={isActive} 
              index={logicIndex}
            />
          );
        }
      }
    }
    return gridItemsRender;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-100 selection:bg-orange-200">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-bold tracking-wide mb-2">
          LUCKY DRAW EVENT
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
          Summer <span className="text-orange-500">Bonanza</span>
        </h1>
        <p className="text-gray-500 mt-2">Press Start to try your luck!</p>
      </div>

      {/* Game Grid Container */}
      <div className="relative p-6 bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(249,115,22,0.3)] border border-white/50 backdrop-blur-sm">
        
        {/* Grid Layout */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-lg mx-auto">
          {renderGrid()}
        </div>

      
       
      </div>

      {/* Controls */}
      <ControlPanel 
        volume={volume} 
        isMuted={isMuted}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
      />

      {/* Result Popup */}
      <ResultModal 
        prize={resultPrize} 
        isOpen={showModal} 
        onClose={handleCloseModal} 
      />

    </div>
  );
};

export default App;