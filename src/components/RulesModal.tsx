import React from 'react';
import { X, Target, Calculator, Grid, Trophy, Sparkles } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-pop-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-modal-title"
        className="w-full max-w-md bg-slate-900 border border-violet-500/30 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 id="rules-modal-title" className="text-xl font-bold tracking-tight text-white">How to Play</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close rules"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 py-4 text-sm text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">1. Target Rush (Classic)</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Tap combinations of number tiles that add up exactly to the target number.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">2. Equation Blitz (Alternative)</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Construct mathematical expressions with numbers and operators (+, −, ×, ÷) to calculate the target result.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">3. Speed Grid (Alternative)</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Look at the active rule (e.g. "Multiples of 5", "Evens", "Primes") and tap all matching matrix tiles before time expires.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">30s Rush & Scoring</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Every mode gives you 30 seconds to solve as many challenges as possible. Each correct solution awards <strong className="text-amber-300">+10 points</strong>.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-[0.98] transition-all shadow-lg shadow-purple-600/30"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
