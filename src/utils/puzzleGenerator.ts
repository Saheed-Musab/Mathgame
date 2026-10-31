import { Difficulty, Challenge, TileItem } from '../types/game';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generatePuzzle(difficulty: Difficulty, challengeIndex: number = 1): Challenge {
  let tileCount = 6;
  let minNum = 1;
  let maxNum = 15;
  let minSubset = 2;
  let maxSubset = 3;

  if (difficulty === 'medium') {
    tileCount = 8;
    minNum = 2;
    maxNum = 30;
    minSubset = 2;
    maxSubset = 4;
  } else if (difficulty === 'hard') {
    tileCount = 10;
    minNum = 3;
    maxNum = 50;
    minSubset = 3;
    maxSubset = 5;
  }

  // 1. Pick subset size
  const subsetSize = getRandomInt(minSubset, maxSubset);

  // 2. Generate solution numbers
  const solutionNumbers: number[] = [];
  const usedNumbers = new Set<number>();

  for (let i = 0; i < subsetSize; i++) {
    let attempts = 0;
    let num = getRandomInt(minNum, maxNum);
    while (usedNumbers.has(num) && attempts < 15) {
      num = getRandomInt(minNum, maxNum);
      attempts++;
    }
    usedNumbers.add(num);
    solutionNumbers.push(num);
  }

  // Target is the sum of the solution numbers
  const target = solutionNumbers.reduce((acc, curr) => acc + curr, 0);

  // 3. Generate distractor numbers (none should equal target itself)
  const distractorCount = tileCount - subsetSize;
  const distractorNumbers: number[] = [];

  for (let i = 0; i < distractorCount; i++) {
    let attempts = 0;
    let distractor = getRandomInt(minNum, maxNum);
    // Never let a single distractor tile equal the target (user must combine tiles)
    while ((distractor === target || (usedNumbers.has(distractor) && attempts < 10)) && attempts < 25) {
      distractor = getRandomInt(minNum, maxNum);
      attempts++;
    }
    distractorNumbers.push(distractor);
  }

  // 4. Assemble tiles
  const rawSolutionTiles = solutionNumbers.map((val, idx) => ({
    id: `tile-sol-${challengeIndex}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
    value: val,
    isSelected: false,
  }));

  const rawDistractorTiles = distractorNumbers.map((val, idx) => ({
    id: `tile-dis-${challengeIndex}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
    value: val,
    isSelected: false,
  }));

  const solutionIds = rawSolutionTiles.map(t => t.id);
  const allTiles: TileItem[] = shuffleArray([...rawSolutionTiles, ...rawDistractorTiles]);

  return {
    id: challengeIndex,
    target,
    tiles: allTiles,
    solutionIds,
  };
}
