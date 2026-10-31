import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  currentScore: number;
  timeLeft: number;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onQuit,
  currentScore,
  timeLeft,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-pop-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-modal-title"
        className="w-full max-w-sm bg-slate-900 border border-blue-500/30 rounded-2xl p-6 text-white shadow-2xl text-center"
      >
        <h2 id="pause-modal-title" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-white">
          GAME PAUSED
        </h2>
        <p className="text-xs text-slate-400 mt-1">Take a breath, your game is safe.</p>

        <div className="grid grid-cols-2 gap-3 my-5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Score</div>
            <div className="text-xl font-black text-blue-400 tabular-nums">{currentScore}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Time Left</div>
            <div className="text-xl font-black text-purple-400 tabular-nums">{timeLeft}s</div>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Resume Game
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Round
          </button>

          <button
            onClick={onQuit}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            Return to Welcome Screen
          </button>
        </div>
      </div>
    </div>
  );
};
