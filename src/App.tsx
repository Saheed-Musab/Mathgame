/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Difficulty, GameState, GameMode, Challenge, EquationChallenge, GridSprintPrompt, GameStats, HighScoreRecord } from './types/game';
import { generatePuzzle } from './utils/puzzleGenerator';
import { generateEquationChallenge } from './utils/equationGenerator';
import { generateGridSprint } from './utils/gridSprintGenerator';
import { soundManager } from './utils/sound';
import { triggerConfetti } from './utils/confetti';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GameScreen } from './components/GameScreen';
import { EquationGameScreen } from './components/EquationGameScreen';
import { GridSprintGameScreen } from './components/GridSprintGameScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { RulesModal } from './components/RulesModal';
import { PauseModal } from './components/PauseModal';
import { getComboTier } from './components/ComboStreakMeter';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [gameMode, setGameMode] = useState<GameMode>('target-sum');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  const [hintsRemaining, setHintsRemaining] = useState<number>(2);
  const [challengeIndex, setChallengeIndex] = useState<number>(1);

  // Challenges per game mode
  const [targetChallenge, setTargetChallenge] = useState<Challenge>(() => generatePuzzle('easy', 1));
  const [equationChallenge, setEquationChallenge] = useState<EquationChallenge>(() => generateEquationChallenge('easy', 1));
  const [gridChallenge, setGridChallenge] = useState<GridSprintPrompt>(() => generateGridSprint('easy', 1));
  const [wrongGridTileId, setWrongGridTileId] = useState<string | null>(null);

  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.isMuted());
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [floatingScore, setFloatingScore] = useState<string | number | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'bust'>('idle');

  // Multi-mode high scores persistence
  const [highScoresByMode, setHighScoresByMode] = useState<Record<GameMode, HighScoreRecord>>(() => {
    try {
      const stored = localStorage.getItem('number_rush_all_scores_v2');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return {
      'target-sum': { easy: 0, medium: 0, hard: 0 },
      'equation-builder': { easy: 0, medium: 0, hard: 0 },
      'grid-sprint': { easy: 0, medium: 0, hard: 0 },
    };
  });

  const saveHighScores = useCallback((mode: GameMode, updated: HighScoreRecord) => {
    setHighScoresByMode((prev) => {
      const next = {
        ...prev,
        [mode]: updated,
      };
      try {
        localStorage.setItem('number_rush_all_scores_v2', JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggleSound = useCallback(() => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Start / Restart round
  const startRound = useCallback((selectedDifficulty?: Difficulty) => {
    const diff = selectedDifficulty || difficulty;
    setDifficulty(diff);
    setScore(0);
    setTimeLeft(30);
    setStreak(0);
    setBestStreak(0);
    setSolvedCount(0);
    setWrongAttempts(0);
    setHintsRemaining(2);
    setChallengeIndex(1);
    setIsNewHighScore(false);
    setFloatingScore(null);
    setFeedbackState('idle');
    setWrongGridTileId(null);

    if (gameMode === 'target-sum') {
      setTargetChallenge(generatePuzzle(diff, 1));
    } else if (gameMode === 'equation-builder') {
      setEquationChallenge(generateEquationChallenge(diff, 1));
    } else if (gameMode === 'grid-sprint') {
      setGridChallenge(generateGridSprint(diff, 1));
    }

    setGameState('playing');
  }, [difficulty, gameMode]);

  // Handle Game Over
  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setGameState('gameover');

    const modeScores = highScoresByMode[gameMode] || { easy: 0, medium: 0, hard: 0 };
    const currentHigh = modeScores[difficulty] || 0;
    if (score > currentHigh) {
      const updated = {
        ...modeScores,
        [difficulty]: score,
      };
      saveHighScores(gameMode, updated);
      setIsNewHighScore(true);
    } else {
      setIsNewHighScore(false);
    }
  }, [score, difficulty, gameMode, highScoresByMode, saveHighScores]);

  // Main countdown timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState]);

  // Watch for timer expiring
  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameState, endGame]);

  // --- MODE 1: Target Sum Handlers ---
  const handleTileToggle = useCallback((tileId: string) => {
    if (gameState !== 'playing' || feedbackState === 'correct') return;

    setTargetChallenge((prev) => {
      let toggledTileWasSelected = false;
      const updatedTiles = prev.tiles.map((t) => {
        if (t.id === tileId) {
          toggledTileWasSelected = t.isSelected;
          return { ...t, isSelected: !t.isSelected };
        }
        return t;
      });

      const selected = updatedTiles.filter((t) => t.isSelected);
      const sum = selected.reduce((acc, t) => acc + t.value, 0);

      if (sum === prev.target && selected.length > 0) {
        const tier = getComboTier(streak);
        const awardedPoints = Math.round(10 * tier.multiplier);

        soundManager.playCorrect();
        triggerConfetti();
        setFeedbackState('correct');
        setFloatingScore(tier.multiplier > 1 ? `+${awardedPoints} (${tier.label})` : `+${awardedPoints}`);

        setScore((s) => s + awardedPoints);
        setSolvedCount((c) => c + 1);
        setStreak((st) => {
          const newStreak = st + 1;
          setBestStreak((b) => Math.max(b, newStreak));
          return newStreak;
        });

        setTimeLeft((t) => Math.min(30, t + 2));

        setTimeout(() => {
          setChallengeIndex((idx) => {
            const nextIdx = idx + 1;
            setTargetChallenge(generatePuzzle(difficulty, nextIdx));
            return nextIdx;
          });
          setFeedbackState('idle');
          setFloatingScore(null);
        }, 420);
      } else if (sum > prev.target) {
        soundManager.playBust();
        setFeedbackState('bust');
        setWrongAttempts((w) => w + 1);
        setStreak(0);

        setTimeout(() => {
          setFeedbackState('idle');
        }, 550);
      } else {
        if (toggledTileWasSelected) {
          soundManager.playDeselect();
        } else {
          soundManager.playSelect();
        }
        setFeedbackState('idle');
      }

      return { ...prev, tiles: updatedTiles };
    });
  }, [gameState, feedbackState, difficulty, streak]);

  const handleClearSelection = useCallback(() => {
    if (gameState !== 'playing') return;
    soundManager.playDeselect();
    setTargetChallenge((prev) => ({
      ...prev,
      tiles: prev.tiles.map((t) => ({ ...t, isSelected: false })),
    }));
    setFeedbackState('idle');
  }, [gameState]);

  const handleUseHint = useCallback(() => {
    if (gameState !== 'playing' || hintsRemaining <= 0) return;

    soundManager.playHint();
    setHintsRemaining((h) => h - 1);
    setTimeLeft((t) => Math.max(1, t - 1));

    setTargetChallenge((prev) => {
      const unhintedSolTile = prev.tiles.find(
        (t) => prev.solutionIds.includes(t.id) && !t.isHinted && !t.isSelected
      );

      if (!unhintedSolTile) return prev;

      return {
        ...prev,
        tiles: prev.tiles.map((t) => (t.id === unhintedSolTile.id ? { ...t, isHinted: true } : t)),
      };
    });
  }, [gameState, hintsRemaining]);

  const handleSkipTarget = useCallback(() => {
    if (gameState !== 'playing') return;
    soundManager.playClick();
    setTimeLeft((t) => Math.max(1, t - 2));
    setStreak(0);
    setChallengeIndex((idx) => {
      const nextIdx = idx + 1;
      setTargetChallenge(generatePuzzle(difficulty, nextIdx));
      return nextIdx;
    });
    setFeedbackState('idle');
  }, [gameState, difficulty]);

  // --- MODE 2: Equation Blitz Handlers ---
  const handleEquationSuccess = useCallback(() => {
    const tier = getComboTier(streak);
    const awardedPoints = Math.round(10 * tier.multiplier);

    soundManager.playCorrect();
    triggerConfetti();
    setFeedbackState('correct');
    setFloatingScore(tier.multiplier > 1 ? `+${awardedPoints} (${tier.label})` : `+${awardedPoints}`);

    setScore((s) => s + awardedPoints);
    setSolvedCount((c) => c + 1);
    setStreak((st) => {
      const newStreak = st + 1;
      setBestStreak((b) => Math.max(b, newStreak));
      return newStreak;
    });

    setTimeLeft((t) => Math.min(30, t + 2));

    setTimeout(() => {
      setChallengeIndex((idx) => {
        const nextIdx = idx + 1;
        setEquationChallenge(generateEquationChallenge(difficulty, nextIdx));
        return nextIdx;
      });
      setFeedbackState('idle');
      setFloatingScore(null);
    }, 450);
  }, [difficulty, streak]);

  const handleEquationBust = useCallback(() => {
    soundManager.playBust();
    setFeedbackState('bust');
    setWrongAttempts((w) => w + 1);
    setStreak(0);

    setTimeout(() => {
      setFeedbackState('idle');
    }, 550);
  }, []);

  const handleEquationSkip = useCallback(() => {
    if (gameState !== 'playing') return;
    soundManager.playClick();
    setTimeLeft((t) => Math.max(1, t - 2));
    setStreak(0);
    setChallengeIndex((idx) => {
      const nextIdx = idx + 1;
      setEquationChallenge(generateEquationChallenge(difficulty, nextIdx));
      return nextIdx;
    });
    setFeedbackState('idle');
  }, [gameState, difficulty]);

  // --- MODE 3: Speed Grid Handlers ---
  const handleGridTileClick = useCallback((tileId: string) => {
    if (gameState !== 'playing') return;

    setGridChallenge((prev) => {
      const clickedTile = prev.gridNumbers.find((g) => g.id === tileId);
      if (!clickedTile || clickedTile.isTapped) return prev;

      if (clickedTile.isTarget) {
        // Correct target tapped!
        soundManager.playSelect();
        const nextGrid = prev.gridNumbers.map((g) => (g.id === tileId ? { ...g, isTapped: true } : g));

        // Check if all targets are found
        const remainingTargets = nextGrid.filter((g) => g.isTarget && !g.isTapped);
        if (remainingTargets.length === 0) {
          // Finished board!
          const tier = getComboTier(streak);
          const awardedPoints = Math.round(10 * tier.multiplier);

          soundManager.playCorrect();
          triggerConfetti();
          setFloatingScore(tier.multiplier > 1 ? `+${awardedPoints} (${tier.label})` : `+${awardedPoints}`);
          setScore((s) => s + awardedPoints);
          setSolvedCount((c) => c + 1);
          setStreak((st) => {
            const nextSt = st + 1;
            setBestStreak((b) => Math.max(b, nextSt));
            return nextSt;
          });
          setTimeLeft((t) => Math.min(30, t + 3));

          setTimeout(() => {
            setChallengeIndex((idx) => {
              const nextIdx = idx + 1;
              setGridChallenge(generateGridSprint(difficulty, nextIdx));
              return nextIdx;
            });
            setFloatingScore(null);
          }, 350);
        }

        return { ...prev, gridNumbers: nextGrid };
      } else {
        // Wrong tile tapped!
        soundManager.playBust();
        setWrongGridTileId(tileId);
        setStreak(0);
        setWrongAttempts((w) => w + 1);

        setTimeout(() => {
          setWrongGridTileId(null);
        }, 500);

        return prev;
      }
    });
  }, [gameState, difficulty, streak]);

  // Stats object for game over
  const currentStats: GameStats = {
    score,
    solvedCount,
    wrongAttempts,
    currentStreak: streak,
    bestStreak,
  };

  const currentModeScores = highScoresByMode[gameMode] || { easy: 0, medium: 0, hard: 0 };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-x-hidden">
      {/* Dynamic atmospheric background with blue and purple gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl transform -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl transform translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-96 bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      {/* Main View Container */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center">
        {gameState === 'welcome' && (
          <WelcomeScreen
            gameMode={gameMode}
            onSelectGameMode={(m) => setGameMode(m)}
            difficulty={difficulty}
            onSelectDifficulty={(d) => setDifficulty(d)}
            onStartGame={() => startRound()}
            highScores={currentModeScores}
            isMuted={isMuted}
            onToggleSound={handleToggleSound}
            onOpenRules={() => setIsRulesOpen(true)}
          />
        )}

        {gameState === 'playing' && gameMode === 'target-sum' && (
          <GameScreen
            difficulty={difficulty}
            challenge={targetChallenge}
            score={score}
            timeLeft={timeLeft}
            streak={streak}
            bestStreak={bestStreak}
            hintsRemaining={hintsRemaining}
            isMuted={isMuted}
            onTileToggle={handleTileToggle}
            onClearSelection={handleClearSelection}
            onUseHint={handleUseHint}
            onSkipChallenge={handleSkipTarget}
            onPause={() => setGameState('paused')}
            onToggleSound={handleToggleSound}
            floatingScore={floatingScore}
            feedbackState={feedbackState}
          />
        )}

        {gameState === 'playing' && gameMode === 'equation-builder' && (
          <EquationGameScreen
            difficulty={difficulty}
            challenge={equationChallenge}
            score={score}
            timeLeft={timeLeft}
            streak={streak}
            isMuted={isMuted}
            onSuccess={handleEquationSuccess}
            onBust={handleEquationBust}
            onSkip={handleEquationSkip}
            onPause={() => setGameState('paused')}
            onToggleSound={handleToggleSound}
            floatingScore={floatingScore}
            feedbackState={feedbackState}
          />
        )}

        {gameState === 'playing' && gameMode === 'grid-sprint' && (
          <GridSprintGameScreen
            difficulty={difficulty}
            challenge={gridChallenge}
            score={score}
            timeLeft={timeLeft}
            streak={streak}
            isMuted={isMuted}
            onTileClick={handleGridTileClick}
            onPause={() => setGameState('paused')}
            onToggleSound={handleToggleSound}
            floatingScore={floatingScore}
            wrongTileId={wrongGridTileId}
          />
        )}

        {gameState === 'gameover' && (
          <GameOverScreen
            gameMode={gameMode}
            difficulty={difficulty}
            stats={currentStats}
            highScore={currentModeScores[difficulty] || 0}
            isNewHighScore={isNewHighScore}
            isMuted={isMuted}
            onPlayAgain={() => startRound()}
            onReturnToMenu={() => setGameState('welcome')}
            onToggleSound={handleToggleSound}
          />
        )}
      </main>

      {/* Pause Modal */}
      <PauseModal
        isOpen={gameState === 'paused'}
        onResume={() => setGameState('playing')}
        onRestart={() => startRound()}
        onQuit={() => setGameState('welcome')}
        currentScore={score}
        timeLeft={timeLeft}
      />

      {/* Rules Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
}
