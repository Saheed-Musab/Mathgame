import React from 'react';
import { Volume2, VolumeX, HelpCircle, Trophy } from 'lucide-react';
import { Difficulty } from '../types/game';

interface HeaderProps {
  difficulty: Difficulty;
  highScore: number;
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
  showRulesButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  difficulty,
  highScore,
  isMuted,
  onToggleSound,
  onOpenRules,
  showRulesButton = true,
}) => {
  return (
    <header className="w-full max-w-xl mx-auto flex items-center justify-between px-4 py-3 select-none">
      {/* Brand Zone */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-purple-500/20 text-white font-black text-sm">
          #R
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight text-white drop-shadow-sm">
            Number Rush
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-200/80 font-medium capitalize">
            <span>{difficulty}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5">
              <Trophy className="w-2.5 h-2.5 text-amber-400" />
              Best: {highScore}
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {showRulesButton && (
          <button
            onClick={onOpenRules}
            aria-label="How to play rules"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-purple-200 hover:text-white flex items-center justify-center transition-all border border-white/10 backdrop-blur-md"
            title="How to play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onToggleSound}
          aria-label={isMuted ? 'Unmute game sounds' : 'Mute game sounds'}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border backdrop-blur-md active:scale-95 ${
            isMuted
              ? 'bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30'
              : 'bg-white/10 border-white/10 text-purple-200 hover:text-white hover:bg-white/20'
          }`}
          title={isMuted ? 'Sound muted (tap to enable)' : 'Sound enabled (tap to mute)'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
