import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Pause, RotateCcw, Delete, Volume2, VolumeX, Sparkles, CheckCircle2, Flame, FastForward, Calculator } from 'lucide-react';
import { Difficulty, EquationChallenge } from '../types/game';
import { soundManager } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';
import { evaluateExpression } from '../utils/equationGenerator';
import { ComboStreakMeter } from './ComboStreakMeter';

interface EquationToken {
  id: string;
  type: 'num' | 'op';
  value: string | number;
  sourceNumberIndex?: number;
}

interface EquationGameScreenProps {
  difficulty: Difficulty;
  challenge: EquationChallenge;
  score: number;
  timeLeft: number;
  streak: number;
  isMuted: boolean;
  onSuccess: () => void;
  onBust: () => void;
  onSkip: () => void;
  onPause: () => void;
  onToggleSound: () => void;
  floatingScore: string | number | null;
  feedbackState: 'idle' | 'correct' | 'bust';
}

export const EquationGameScreen: React.FC<EquationGameScreenProps> = ({
  difficulty,
  challenge,
  score,
  timeLeft,
  streak,
  isMuted,
  onSuccess,
  onBust,
  onSkip,
  onPause,
  onToggleSound,
  floatingScore,
  feedbackState,
}) => {
  const [tokens, setTokens] = useState<EquationToken[]>([]);
  const [usedNumberIndices, setUsedNumberIndices] = useState<Set<number>>(new Set());

  // Reset expression when challenge changes
  useEffect(() => {
    setTokens([]);
    setUsedNumberIndices(new Set());
  }, [challenge.id]);

  // Evaluate current expression
  const currentResult = useMemo(() => {
    return evaluateExpression(tokens);
  }, [tokens]);

  const isMatched = currentResult === challenge.target && tokens.length > 0;

  // Sound ticking in last 5 seconds
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0) {
      soundManager.playTick();
    }
  }, [timeLeft]);

  // Check if expression reached target
  useEffect(() => {
    if (isMatched && feedbackState !== 'correct') {
      onSuccess();
    }
  }, [isMatched, feedbackState, onSuccess]);

  const handleAddNumber = useCallback(
    (num: number, idx: number) => {
      if (usedNumberIndices.has(idx) || feedbackState === 'correct') return;
      // Cannot add two numbers back-to-back without an operator
      if (tokens.length > 0 && tokens[tokens.length - 1].type === 'num') {
        soundManager.playBust();
        return;
      }
      soundManager.playSelect();
      setTokens((prev) => [
        ...prev,
        { id: `t-${Date.now()}-${Math.random()}`, type: 'num', value: num, sourceNumberIndex: idx },
      ]);
      setUsedNumberIndices((prev) => new Set([...prev, idx]));
    },
    [usedNumberIndices, tokens, feedbackState]
  );

  const handleAddOperator = useCallback(
    (op: string) => {
      if (feedbackState === 'correct') return;
      // Cannot start with operator or add two operators in a row
      if (tokens.length === 0 || tokens[tokens.length - 1].type === 'op') {
        soundManager.playBust();
        return;
      }
      soundManager.playClick();
      setTokens((prev) => [
        ...prev,
        { id: `t-${Date.now()}-${Math.random()}`, type: 'op', value: op },
      ]);
    },
    [tokens, feedbackState]
  );

  const handleBackspace = useCallback(() => {
    if (tokens.length === 0 || feedbackState === 'correct') return;
    soundManager.playDeselect();
    const lastToken = tokens[tokens.length - 1];
    if (lastToken.type === 'num' && lastToken.sourceNumberIndex !== undefined) {
      setUsedNumberIndices((prev) => {
        const next = new Set(prev);
        next.delete(lastToken.sourceNumberIndex!);
        return next;
      });
    }
    setTokens((prev) => prev.slice(0, -1));
  }, [tokens, feedbackState]);

  const handleClearAll = useCallback(() => {
    soundManager.playDeselect();
    setTokens([]);
    setUsedNumberIndices(new Set());
  }, []);

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
              <Calculator className="w-3.5 h-3.5 text-blue-400" />
              Equation Rush ({difficulty})
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

      {/* Target & Equation Formula Workspace */}
      <div
        className={`my-3 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all text-center relative overflow-hidden backdrop-blur-md ${
          feedbackState === 'correct'
            ? 'bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-500/20'
            : 'bg-gradient-to-b from-slate-900/90 to-purple-950/70 border-purple-500/30 shadow-2xl'
        }`}
      >
        <div className="text-[11px] font-bold uppercase tracking-widest text-purple-200/80 mb-1">
          Target Result
        </div>

        <div className="text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-lg tabular-nums">
          {challenge.target}
        </div>

        {/* Live Equation Formula Bar */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-col items-center justify-center min-h-[52px]">
          {tokens.length === 0 ? (
            <span className="text-xs text-purple-200/60 font-medium">
              Combine numbers and operators (+, −, ×, ÷) to equal <strong className="text-white">{challenge.target}</strong>
            </span>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-base sm:text-lg font-black tabular-nums">
              {tokens.map((token) => (
                <span
                  key={token.id}
                  className={`px-2.5 py-1 rounded-xl shadow-xs ${
                    token.type === 'num'
                      ? 'bg-white text-slate-950 border border-slate-200'
                      : 'bg-blue-600 text-white font-mono'
                  }`}
                >
                  {token.value}
                </span>
              ))}

              <span className="text-purple-300 font-bold mx-1">=</span>

              <span
                className={`px-3 py-1 rounded-xl font-black ${
                  isMatched
                    ? 'bg-emerald-500 text-white shadow-md'
                    : currentResult !== null
                    ? 'bg-purple-600/70 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {currentResult !== null ? currentResult : '...'}
              </span>
            </div>
          )}

          {isMatched && (
            <div className="mt-2 text-xs font-bold text-emerald-400 flex items-center gap-1 animate-pop-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Equation Solved! +10 Points
            </div>
          )}
        </div>
      </div>

      {/* Interactive Controls Bank */}
      <div className="w-full space-y-3 my-2">
        {/* Operators Row */}
        <div className="flex items-center justify-center gap-2">
          {challenge.operators.map((op) => (
            <button
              key={op}
              onClick={() => handleAddOperator(op)}
              className="flex-1 py-3 px-3 rounded-2xl bg-blue-600/40 hover:bg-blue-600/60 active:scale-95 text-white font-black text-xl border border-blue-400/30 shadow-md backdrop-blur-md transition-all cursor-pointer"
              aria-label={`Operator ${op}`}
            >
              {op}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            disabled={tokens.length === 0}
            className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 active:scale-95 text-slate-200 border border-white/10 transition-all flex items-center justify-center cursor-pointer"
            aria-label="Delete last token"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Number Tiles Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
          {challenge.numbers.map((num, idx) => {
            const isUsed = usedNumberIndices.has(idx);
            return (
              <button
                key={idx}
                onClick={() => handleAddNumber(num, idx)}
                disabled={isUsed}
                className={`aspect-square rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl tabular-nums transition-all active:scale-90 cursor-pointer shadow-lg ${
                  isUsed
                    ? 'bg-slate-800/40 text-slate-600 border border-transparent opacity-40 cursor-not-allowed scale-95'
                    : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200/90 hover:scale-[1.02]'
                }`}
                aria-label={`Number tile ${num}`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="w-full max-w-lg mx-auto grid grid-cols-2 gap-2 pt-2">
        <button
          onClick={handleClearAll}
          disabled={tokens.length === 0}
          className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:pointer-events-none active:scale-95 text-xs font-bold text-white border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-md"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Equation</span>
        </button>

        <button
          onClick={onSkip}
          className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-bold text-purple-200 hover:text-white border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-md"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip (-2s)</span>
        </button>
      </div>
    </div>
  );
};
