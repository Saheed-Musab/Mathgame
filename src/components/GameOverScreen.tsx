import React, { useEffect, useState } from 'react';
import { RotateCcw, Trophy, Sparkles, Flame, CheckCircle, Home, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { Difficulty, GameMode, GameStats } from '../types/game';
import { soundManager } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

interface GameOverScreenProps {
  gameMode: GameMode;
  difficulty: Difficulty;
  stats: GameStats;
  highScore: number;
  isNewHighScore: boolean;
  isMuted: boolean;
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
  onToggleSound: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  gameMode,
  difficulty,
  stats,
  highScore,
  isNewHighScore,
  isMuted,
  onPlayAgain,
  onReturnToMenu,
  onToggleSound,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  const modeNames: Record<GameMode, string> = {
    'target-sum': 'Target Rush',
    'equation-builder': 'Equation Blitz',
    'grid-sprint': 'Speed Grid',
  };

  useEffect(() => {
    if (isNewHighScore) {
      soundManager.playHighScore();
      triggerConfetti();
      const timer = setTimeout(() => {
        triggerConfetti();
      }, 400);
      return () => clearTimeout(timer);
    } else {
      soundManager.playGameOver();
    }
  }, [isNewHighScore]);

  useEffect(() => {
    let start = 0;
    const target = stats.score;
    if (target === 0) {
      setAnimatedScore(0);
      return;
    }
    const stepTime = Math.max(10, Math.floor(600 / target));
    const timer = setInterval(() => {
      start += 2;
      if (start >= target) {
        setAnimatedScore(target);
        clearInterval(timer);
      } else {
        setAnimatedScore(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [stats.score]);

  const getRating = () => {
    if (stats.score >= 120) return { title: 'Legendary Rush!', color: 'text-amber-400' };
    if (stats.score >= 80) return { title: 'Math Wizard!', color: 'text-purple-300' };
    if (stats.score >= 40) return { title: 'Great Speed!', color: 'text-blue-300' };
    return { title: 'Good Effort!', color: 'text-slate-300' };
  };

  const rating = getRating();

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-between min-h-[92vh] px-4 py-6 text-white animate-pop-in">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between">
        <span className="text-xs uppercase font-bold tracking-wider text-purple-200/70">
          {modeNames[gameMode]} Summary
        </span>

        <button
          onClick={onToggleSound}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md transition-all active:scale-95 ${
            isMuted
              ? 'bg-red-500/20 border-red-500/40 text-red-200'
              : 'bg-white/10 border-white/10 text-purple-200 hover:bg-white/20'
          }`}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span>{isMuted ? 'Sound Off' : 'Sound On'}</span>
        </button>
      </div>

      {/* Main Score Showcase Card */}
      <div className="w-full my-auto py-2 flex flex-col items-center text-center">
        {/* New High Score Pill */}
        {isNewHighScore ? (
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider mb-3 shadow-lg shadow-amber-500/30 animate-pulse">
            <Trophy className="w-3.5 h-3.5 fill-current" />
            New Best Record!
          </div>
        ) : (
          <div className="text-xs font-bold uppercase tracking-widest text-purple-200/80 mb-2">
            Time's Up!
          </div>
        )}

        <h2 className={`text-2xl font-black ${rating.color}`}>
          {rating.title}
        </h2>

        {/* Huge Animated Score */}
        <div className="relative my-4">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-2xl opacity-40" />
          <div className="relative bg-slate-900/90 border border-white/20 rounded-3xl px-8 py-6 shadow-2xl backdrop-blur-xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-purple-200/70 block mb-1">
              Final Score
            </span>
            <div className="text-6xl font-black tracking-tight text-white tabular-nums">
              {animatedScore}
            </div>
            <span className="text-xs text-purple-200/80 font-semibold mt-1 block">
              Points (+10 each)
            </span>
          </div>
        </div>

        {/* Game Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-2.5 mt-4">
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-center text-emerald-400 mb-1">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="text-lg font-black text-white tabular-nums">
              {stats.solvedCount}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Solved</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-center text-amber-400 mb-1">
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-lg font-black text-white tabular-nums">
              {stats.bestStreak}x
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Best Streak</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-center text-purple-400 mb-1">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="text-lg font-black text-white tabular-nums">
              {highScore}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400">High Score</div>
          </div>
        </div>

        <div className="mt-3 text-xs text-purple-200/70">
          Mode: <strong className="text-white">{modeNames[gameMode]}</strong> · <span className="capitalize">{difficulty}</span> (30s round)
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-2.5 pt-2">
        <button
          onClick={() => {
            soundManager.playClick();
            onPlayAgain();
          }}
          className="w-full py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 active:scale-[0.98] transition-all shadow-xl shadow-purple-600/35 border-t border-white/30 flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Play Again</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            onReturnToMenu();
          }}
          className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Switch Mode / Main Menu</span>
        </button>
      </div>
    </div>
  );
};
