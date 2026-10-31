import React from 'react';
import { Play, Trophy, Sparkles, Volume2, VolumeX, HelpCircle, Zap, Calculator, Grid, Target } from 'lucide-react';
import { Difficulty, GameMode, HighScoreRecord } from '../types/game';
import { soundManager } from '../utils/sound';

interface WelcomeScreenProps {
  gameMode: GameMode;
  onSelectGameMode: (m: GameMode) => void;
  difficulty: Difficulty;
  onSelectDifficulty: (d: Difficulty) => void;
  onStartGame: () => void;
  highScores: HighScoreRecord;
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  gameMode,
  onSelectGameMode,
  difficulty,
  onSelectDifficulty,
  onStartGame,
  highScores,
  isMuted,
  onToggleSound,
  onOpenRules,
}) => {
  const currentBest = highScores[difficulty] || 0;

  const gameModes: Array<{ id: GameMode; name: string; tag: string; icon: React.ReactNode; desc: string }> = [
    {
      id: 'target-sum',
      name: 'Target Rush',
      tag: 'Classic',
      icon: <Target className="w-4 h-4" />,
      desc: 'Select tiles to sum up to the target number',
    },
    {
      id: 'equation-builder',
      name: 'Equation Blitz',
      tag: 'Arithmetic',
      icon: <Calculator className="w-4 h-4" />,
      desc: 'Combine numbers and operators (+, −, ×, ÷) to forge equations',
    },
    {
      id: 'grid-sprint',
      name: 'Speed Grid',
      tag: 'Reflex',
      icon: <Grid className="w-4 h-4" />,
      desc: 'Rapidly tap matrix numbers matching active directives',
    },
  ];

  const difficultyDetails: Record<Difficulty, { label: string; desc: string }> = {
    easy: {
      label: 'Easy',
      desc: 'Relaxed warm-up with numbers up to 15',
    },
    medium: {
      label: 'Medium',
      desc: 'Balanced rush with medium targets',
    },
    hard: {
      label: 'Hard',
      desc: 'High-speed challenge with complex numbers',
    },
  };

  const activeModeObj = gameModes.find((m) => m.id === gameMode) || gameModes[0];

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-between min-h-[92vh] px-4 py-5 text-white">
      {/* Top utility row */}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={onOpenRules}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold text-purple-200 border border-white/10 transition-all backdrop-blur-md"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>How to Play</span>
        </button>

        <button
          onClick={onToggleSound}
          aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
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

      {/* Hero Branding & Visual */}
      <div className="flex flex-col items-center text-center my-auto py-2">
        {/* Emblem */}
        <div className="relative mb-3 group">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-60 group-hover:opacity-85 transition-opacity" />
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-slate-900">
            <img
              src="/src/assets/images/number_rush_emblem_1793455440762.jpg"
              alt="Number Rush Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
          NUMBER{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300">
            RUSH
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-purple-200/90 mt-1 max-w-xs font-medium">
          30-second rapid number puzzle challenge
        </p>

        {/* High Score Banner */}
        <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/60 border border-purple-500/30 text-xs font-semibold text-purple-200 shadow-inner">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>
            Best ({difficulty}):{' '}
            <strong className="text-amber-300 text-sm tabular-nums">{currentBest}</strong> pts
          </span>
        </div>
      </div>

      {/* Game Mode Switcher & Difficulty */}
      <div className="w-full space-y-3">
        {/* Game Mode Tabs */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-2.5 backdrop-blur-md shadow-xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-200/80 mb-1.5 px-1 flex items-center justify-between">
            <span>Select Game App Mode</span>
            <span className="text-white/50 text-[10px]">{activeModeObj.tag}</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {gameModes.map((mode) => {
              const isSelected = gameMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    soundManager.playClick();
                    onSelectGameMode(mode.id);
                  }}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-purple-600/30 border border-white/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="p-1 rounded-lg bg-white/10">{mode.icon}</div>
                  <span className="text-[11px] font-bold truncate max-w-full">{mode.name}</span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-center text-purple-200/70 mt-2">
            {activeModeObj.desc}
          </p>
        </div>

        {/* Difficulty Selector */}
        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-2.5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-xs text-purple-200 font-semibold mb-1.5 px-1">
            <span className="flex items-center gap-1 text-[11px]">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Difficulty
            </span>
            <span className="text-white/60 text-[10px]">{difficultyDetails[difficulty].desc}</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => {
              const isSelected = difficulty === level;
              return (
                <button
                  key={level}
                  onClick={() => {
                    soundManager.playClick();
                    onSelectDifficulty(level);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-purple-600/30 border border-white/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-transparent'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Play CTA Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onStartGame();
          }}
          className="w-full py-3.5 px-6 rounded-2xl font-black text-base sm:text-lg tracking-wide uppercase text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 active:scale-[0.98] transition-all shadow-xl shadow-purple-600/40 border-t border-white/30 flex items-center justify-center gap-3 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
          </div>
          <span>Start {activeModeObj.name}</span>
        </button>

        {/* Micro footer */}
        <div className="flex items-center justify-center gap-3 text-[11px] text-purple-200/60 font-medium pt-0.5">
          <span>+10 pts per answer</span>
          <span aria-hidden="true">·</span>
          <span>30 sec round</span>
          <span aria-hidden="true">·</span>
          <span>Zero login</span>
        </div>
      </div>
    </div>
  );
};
