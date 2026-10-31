import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Pause, RotateCcw, Lightbulb, Volume2, VolumeX, Sparkles, AlertCircle, CheckCircle2, Flame, FastForward } from 'lucide-react';
import { Difficulty, Challenge, TileItem } from '../types/game';
import { soundManager } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';
import { ComboStreakMeter } from './ComboStreakMeter';

interface GameScreenProps {
  difficulty: Difficulty;
  challenge: Challenge;
  score: number;
  timeLeft: number;
  streak: number;
  bestStreak: number;
  hintsRemaining: number;
  isMuted: boolean;
  onTileToggle: (tileId: string) => void;
  onClearSelection: () => void;
  onUseHint: () => void;
  onSkipChallenge: () => void;
  onPause: () => void;
  onToggleSound: () => void;
  floatingScore: string | number | null;
  feedbackState: 'idle' | 'correct' | 'bust';
}

export const GameScreen: React.FC<GameScreenProps> = ({
  difficulty,
  challenge,
  score,
  timeLeft,
  streak,
  hintsRemaining,
  isMuted,
  onTileToggle,
  onClearSelection,
  onUseHint,
  onSkipChallenge,
  onPause,
  onToggleSound,
  floatingScore,
  feedbackState,
}) => {
  // Selected tiles calculation
  const selectedTiles = useMemo(() => {
    return challenge.tiles.filter((t) => t.isSelected);
  }, [challenge.tiles]);

  const currentSum = useMemo(() => {
    return selectedTiles.reduce((acc, t) => acc + t.value, 0);
  }, [selectedTiles]);

  const diff = challenge.target - currentSum;
  const isTargetMatched = currentSum === challenge.target && selectedTiles.length > 0;
  const isOverTarget = currentSum > challenge.target;

  // Sound ticking in the last 5 seconds
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0) {
      soundManager.playTick();
    }
  }, [timeLeft]);

  // Determine grid columns based on tile count and screen
  const gridClass = useMemo(() => {
    const count = challenge.tiles.length;
    if (count <= 6) {
      return 'grid-cols-3';
    }
    if (count <= 8) {
      return 'grid-cols-4';
    }
    return 'grid-cols-5';
  }, [challenge.tiles.length]);

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

      {/* Top HUD Bar */}
      <div className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-3 backdrop-blur-md shadow-lg space-y-2">
        {/* Score and Controls row */}
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
              title={isMuted ? 'Sound Off' : 'Sound On'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onPause}
              aria-label="Pause game"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-purple-200 hover:text-white flex items-center justify-center transition-all border border-white/10"
              title="Pause round"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Fire-Themed Streak & Combo Multiplier Indicator */}
        <ComboStreakMeter streak={streak} />

        {/* Timer Bar & Countdown */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="text-purple-200/80 capitalize">{difficulty} Round</span>
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
                  : timeLeft <= 10
                  ? 'bg-gradient-to-r from-amber-500 to-blue-500'
                  : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, (timeLeft / 30) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Target & Running Calculation Focal Card */}
      <div
        className={`my-3 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all text-center relative overflow-hidden backdrop-blur-md ${
          feedbackState === 'correct'
            ? 'bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-500/20'
            : feedbackState === 'bust'
            ? 'bg-red-950/40 border-red-500 animate-wiggle shadow-xl shadow-red-500/20'
            : 'bg-gradient-to-b from-slate-900/90 to-purple-950/70 border-purple-500/30 shadow-2xl shadow-purple-900/30'
        }`}
      >
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-[11px] font-bold uppercase tracking-widest text-purple-200/80 mb-1">
          Target Number
        </div>

        {/* Target display */}
        <div className="text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-lg tabular-nums">
          {challenge.target}
        </div>

        {/* Selected Formula & Calculation */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-col items-center justify-center min-h-[44px]">
          {selectedTiles.length === 0 ? (
            <span className="text-xs text-purple-200/60 font-medium">
              Tap number tiles below to reach <strong className="text-white">{challenge.target}</strong>
            </span>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-sm sm:text-base font-bold tabular-nums">
              {selectedTiles.map((tile, i) => (
                <React.Fragment key={tile.id}>
                  {i > 0 && <span className="text-purple-300 text-xs">+</span>}
                  <span className="px-2 py-0.5 rounded-md bg-white/15 border border-white/20 text-white">
                    {tile.value}
                  </span>
                </React.Fragment>
              ))}
              <span className="text-purple-300">=</span>
              <span
                className={`px-2.5 py-0.5 rounded-md font-black ${
                  isTargetMatched
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : isOverTarget
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-blue-600/60 text-white'
                }`}
              >
                {currentSum}
              </span>
            </div>
          )}

          {/* Feedback Guidance Message */}
          <div className="mt-2 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[20px]">
            {isTargetMatched ? (
              <span className="text-emerald-400 flex items-center gap-1 animate-pop-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Solved! +10 Points
              </span>
            ) : isOverTarget ? (
              <span className="text-red-400 flex items-center gap-1 animate-wiggle">
                <AlertCircle className="w-3.5 h-3.5" />
                Over target by {Math.abs(diff)}! Tap to remove a tile
              </span>
            ) : selectedTiles.length > 0 ? (
              <span className="text-blue-300">
                Need <strong className="text-white font-bold">+{diff}</strong> more to reach {challenge.target}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Selectable Number Tiles Grid */}
      <div className="w-full flex-1 flex flex-col justify-center my-2">
        <div className={`grid ${gridClass} gap-2.5 sm:gap-3.5 max-w-lg mx-auto w-full`}>
          {challenge.tiles.map((tile) => {
            const isSelected = tile.isSelected;
            const isHinted = tile.isHinted;

            return (
              <button
                key={tile.id}
                onClick={() => onTileToggle(tile.id)}
                className={`relative aspect-square rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl tabular-nums transition-all duration-150 active:scale-90 cursor-pointer select-none shadow-lg ${
                  isSelected
                    ? 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white border-2 border-white/60 shadow-purple-600/40 ring-4 ring-purple-500/30 -translate-y-1'
                    : isHinted
                    ? 'bg-white text-slate-900 border-2 border-amber-400 shadow-amber-400/30 ring-4 ring-amber-400/40 hover:bg-slate-50'
                    : 'bg-white/95 hover:bg-white text-slate-900 border border-slate-200/80 shadow-slate-950/20 hover:scale-[1.02]'
                }`}
                aria-pressed={isSelected}
                aria-label={`Number tile ${tile.value}${isSelected ? ', selected' : ''}${isHinted ? ', hinted' : ''}`}
              >
                {/* Check badge when selected */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white text-purple-600 flex items-center justify-center text-[10px] font-black shadow-xs">
                    ✓
                  </div>
                )}

                {/* Hint badge */}
                {isHinted && !isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px] font-black">
                    ★
                  </div>
                )}

                <span className="drop-shadow-xs">{tile.value}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* In-Game Action Bar */}
      <div className="w-full max-w-lg mx-auto grid grid-cols-3 gap-2 pt-2">
        <button
          onClick={onClearSelection}
          disabled={selectedTiles.length === 0}
          className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:pointer-events-none active:scale-95 text-xs font-bold text-white border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-md"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        <button
          onClick={onUseHint}
          disabled={hintsRemaining <= 0}
          className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:pointer-events-none active:scale-95 text-xs font-bold text-amber-300 border border-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-md"
          title="Highlight 1 tile in solution (-1s timer cost)"
        >
          <Lightbulb className="w-3.5 h-3.5 fill-amber-300/40" />
          <span>Hint ({hintsRemaining})</span>
        </button>

        <button
          onClick={onSkipChallenge}
          className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-bold text-purple-200 hover:text-white border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-md"
          title="Skip to next puzzle (-2s timer cost)"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip (-2s)</span>
        </button>
      </div>
    </div>
  );
};
