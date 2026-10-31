import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Pause, Volume2, VolumeX, Sparkles, Flame, CheckCircle2, Zap } from 'lucide-react';
import { Difficulty, GridSprintPrompt } from '../types/game';
import { soundManager } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';
import { ComboStreakMeter } from './ComboStreakMeter';

interface GridSprintGameScreenProps {
  difficulty: Difficulty;
  challenge: GridSprintPrompt;
  score: number;
  timeLeft: number;
  streak: number;
  isMuted: boolean;
  onTileClick: (tileId: string) => void;
  onPause: () => void;
  onToggleSound: () => void;
  floatingScore: string | number | null;
  wrongTileId: string | null;
}

export const GridSprintGameScreen: React.FC<GridSprintGameScreenProps> = ({
  difficulty,
  challenge,
  score,
  timeLeft,
  streak,
  isMuted,
  onTileClick,
  onPause,
  onToggleSound,
  floatingScore,
  wrongTileId,
}) => {
  const totalTargets = useMemo(() => {
    return challenge.gridNumbers.filter((g) => g.isTarget).length;
  }, [challenge.gridNumbers]);

  const foundTargets = useMemo(() => {
    return challenge.gridNumbers.filter((g) => g.isTarget && g.isTapped).length;
  }, [challenge.gridNumbers]);

  // Sound ticking in the last 5 seconds
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0) {
      soundManager.playTick();
    }
  }, [timeLeft]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col justify-between min-h-[92vh] px-3 sm:px-4 py-3 select-none text-white relative">
      {/* Floating score indicator */}
      {floatingScore !== null && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-float-up">
          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-orange-500 text-white font-black text-sm sm:text-base shadow-xl shadow-amber-500/30 flex items-center gap-1.5 whitespace-nowrap border border-white/20">
            <Sparkles className="w-4 h-4 fill-white" />
            <span>{typeof floatingScore === 'number' ? `+${floatingScore}` : floatingScore}</span>
          </div>
        </div>
      )}

      {/* Top HUD */}
      <div className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-3 backdrop-blur-md shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200/70 block">
              Score
            </span>
            <span className="text-2xl font-black text-white tabular-nums tracking-tight">
              {score}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-purple-200 hover:text-white flex items-center justify-center transition-all border border-white/10"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onPause}
              aria-label="Pause game"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-purple-200 hover:text-white flex items-center justify-center transition-all border border-white/10"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Fire-Themed Streak & Combo Multiplier Indicator */}
        <ComboStreakMeter streak={streak} />

        {/* Timer Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="text-purple-200/80 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Speed Grid ({difficulty})
            </span>
            <span
              className={`tabular-nums font-black transition-colors ${
                timeLeft <= 5 ? 'text-red-400 animate-pulse text-sm' : 'text-purple-200'
              }`}
            >
              ⏱️ {timeLeft}s remaining
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-linear ${
                timeLeft <= 5
                  ? 'bg-gradient-to-r from-red-500 to-amber-500'
                  : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, (timeLeft / 30) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Target Rule Focal Card */}
      <div className="my-3 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-purple-500/30 bg-gradient-to-b from-slate-900/90 to-purple-950/70 shadow-2xl text-center relative overflow-hidden backdrop-blur-md">
        <div className="text-[11px] font-bold uppercase tracking-widest text-purple-200/80 mb-1">
          Active Directive
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300 leading-tight">
          {challenge.instruction}
        </h2>

        {/* Progress Tracker */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-xs font-bold">
          <span className="text-purple-200/80">Progress:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-600/60 text-white tabular-nums">
            {foundTargets} / {totalTargets} Found
          </span>
          {foundTargets === totalTargets && (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Clear!
            </span>
          )}
        </div>
      </div>

      {/* 4x4 Number Grid */}
      <div className="w-full flex-1 flex flex-col justify-center my-2">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 max-w-md mx-auto w-full">
          {challenge.gridNumbers.map((tile) => {
            const isWrong = wrongTileId === tile.id;
            const isCorrectFound = tile.isTarget && tile.isTapped;

            return (
              <button
                key={tile.id}
                onClick={() => onTileClick(tile.id)}
                disabled={isCorrectFound}
                className={`relative aspect-square rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl tabular-nums transition-all active:scale-90 cursor-pointer shadow-lg ${
                  isCorrectFound
                    ? 'bg-emerald-600 text-white border-2 border-emerald-400 opacity-90 scale-95 shadow-emerald-500/30'
                    : isWrong
                    ? 'bg-red-600 text-white border-2 border-red-400 animate-wiggle shadow-red-500/40'
                    : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/90 hover:scale-[1.02]'
                }`}
                aria-label={`Number tile ${tile.value}`}
              >
                {isCorrectFound && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white text-emerald-700 flex items-center justify-center text-[10px] font-black shadow-xs">
                    ✓
                  </div>
                )}
                <span>{tile.value}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Micro instructions footer */}
      <div className="text-center text-xs text-purple-200/60 font-medium py-1">
        Tap all numbers matching the directive to earn +10 points & speed to the next round!
      </div>
    </div>
  );
};
