import React, { useMemo } from 'react';
import { Flame, Zap } from 'lucide-react';

interface ComboStreakMeterProps {
  streak: number;
  className?: string;
}

export interface ComboTier {
  multiplier: number;
  label: string;
  minStreak: number;
  nextStreak: number;
  colorName: string;
  gradientClass: string;
  glowClass: string;
  flameColor: string;
}

export function getComboTier(streak: number): ComboTier {
  if (streak >= 7) {
    return {
      multiplier: 5,
      label: '5x Ultra',
      minStreak: 7,
      nextStreak: 10,
      colorName: 'electric',
      gradientClass: 'from-blue-400 via-indigo-400 to-purple-400',
      glowClass: 'shadow-blue-500/40 ring-blue-400/50',
      flameColor: 'fill-blue-400 text-blue-300',
    };
  }
  if (streak >= 5) {
    return {
      multiplier: 3,
      label: '3x Blaze',
      minStreak: 5,
      nextStreak: 7,
      colorName: 'purple',
      gradientClass: 'from-purple-500 via-pink-500 to-amber-500',
      glowClass: 'shadow-purple-500/40 ring-purple-400/50',
      flameColor: 'fill-purple-400 text-pink-300',
    };
  }
  if (streak >= 3) {
    return {
      multiplier: 2,
      label: '2x Fire',
      minStreak: 3,
      nextStreak: 5,
      colorName: 'orange',
      gradientClass: 'from-amber-500 via-orange-500 to-red-500',
      glowClass: 'shadow-orange-500/40 ring-orange-400/50',
      flameColor: 'fill-orange-400 text-amber-300',
    };
  }
  if (streak >= 1) {
    return {
      multiplier: 1.5,
      label: '1.5x Warm',
      minStreak: 1,
      nextStreak: 3,
      colorName: 'amber',
      gradientClass: 'from-amber-400 to-orange-400',
      glowClass: 'shadow-amber-500/30 ring-amber-400/30',
      flameColor: 'fill-amber-400 text-amber-300',
    };
  }
  return {
    multiplier: 1,
    label: '1x Base',
    minStreak: 0,
    nextStreak: 1,
    colorName: 'idle',
    gradientClass: 'from-slate-600 to-slate-500',
    glowClass: '',
    flameColor: 'text-slate-500 fill-transparent',
  };
}

export const ComboStreakMeter: React.FC<ComboStreakMeterProps> = ({ streak, className = '' }) => {
  const tier = useMemo(() => getComboTier(streak), [streak]);

  // Calculate percentage to the next multiplier threshold
  const progressPercent = useMemo(() => {
    if (streak <= 0) return 0;
    if (streak >= 7) return 100;
    const range = tier.nextStreak - tier.minStreak;
    const current = streak - tier.minStreak;
    const fraction = Math.min(1, Math.max(0, current / range));
    // Base tier starts with at least some fill for immediate feedback
    return Math.round(20 + fraction * 80);
  }, [streak, tier]);

  const isFireActive = streak >= 2;
  const isSuperCharged = streak >= 5;

  return (
    <div
      className={`w-full bg-slate-950/70 border border-white/10 rounded-xl p-2 backdrop-blur-md transition-all ${className} ${
        isSuperCharged ? 'ring-2 ring-purple-500/40 shadow-lg shadow-purple-600/20' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-xs mb-1.5 px-0.5">
        {/* Flame + Streak Count */}
        <div className="flex items-center gap-1.5">
          <div
            className={`relative transition-transform duration-200 ${
              isSuperCharged
                ? 'scale-125 animate-pulse'
                : isFireActive
                ? 'scale-110'
                : 'scale-100'
            }`}
          >
            <Flame className={`w-4 h-4 transition-colors ${tier.flameColor}`} />
            {isFireActive && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping pointer-events-none" />
            )}
          </div>

          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-white text-xs tracking-tight">
              {streak > 0 ? `${streak} Streak` : 'Streak Meter'}
            </span>
            {streak > 0 && (
              <span className="text-[10px] text-purple-200/70 font-semibold">
                ({streak < tier.nextStreak ? `${tier.nextStreak - streak} to ${tier.multiplier < 5 ? (tier.multiplier === 1 ? '1.5x' : tier.multiplier === 1.5 ? '2x' : tier.multiplier === 2 ? '3x' : '5x') : 'MAX'}` : 'MAX FIRE'})
              </span>
            )}
          </div>
        </div>

        {/* Multiplier Badge */}
        <div className="flex items-center gap-1">
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-black tracking-wide uppercase transition-all ${
              tier.multiplier > 1
                ? `bg-gradient-to-r ${tier.gradientClass} text-slate-950 shadow-sm font-extrabold animate-pop-in`
                : 'bg-white/10 text-slate-300'
            }`}
          >
            {tier.multiplier > 1 && <Zap className="w-3 h-3 fill-current" />}
            <span>{tier.label}</span>
          </div>
          {tier.multiplier > 1 && (
            <span className="text-[10px] font-bold text-amber-300 tabular-nums">
              +{Math.round(10 * tier.multiplier)} pts
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="relative w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r ${tier.gradientClass} ${
            isFireActive ? 'shadow-sm shadow-amber-500/50' : ''
          }`}
          style={{ width: `${progressPercent}%` }}
        />
        {/* Animated sheen when supercharged */}
        {isSuperCharged && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Threshold tick indicators */}
      <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold px-1 mt-1">
        <span className={streak >= 0 ? 'text-slate-400' : ''}>1x</span>
        <span className={streak >= 1 ? 'text-amber-400 font-black' : ''}>1.5x</span>
        <span className={streak >= 3 ? 'text-orange-400 font-black' : ''}>2x</span>
        <span className={streak >= 5 ? 'text-purple-400 font-black' : ''}>3x</span>
        <span className={streak >= 7 ? 'text-blue-400 font-black' : ''}>5x MAX 🔥</span>
      </div>
    </div>
  );
};
