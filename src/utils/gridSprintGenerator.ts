import { Difficulty, GridSprintPrompt } from '../types/game';

function isPrime(num: number): boolean {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

export function generateGridSprint(difficulty: Difficulty, index: number): GridSprintPrompt {
  const gridSize = 16; // 4x4
  const rules = [
    {
      type: 'even',
      instruction: 'Tap all EVEN numbers',
      check: (n: number) => n % 2 === 0,
    },
    {
      type: 'odd',
      instruction: 'Tap all ODD numbers',
      check: (n: number) => n % 2 !== 0,
    },
    {
      type: 'mult3',
      instruction: 'Tap all MULTIPLES OF 3',
      check: (n: number) => n % 3 === 0,
    },
    {
      type: 'mult5',
      instruction: 'Tap all MULTIPLES OF 5',
      check: (n: number) => n % 5 === 0,
    },
    {
      type: 'greater20',
      instruction: 'Tap all numbers GREATER THAN 20',
      check: (n: number) => n > 20,
    },
    {
      type: 'less15',
      instruction: 'Tap all numbers LESS THAN 15',
      check: (n: number) => n < 15,
    },
    {
      type: 'prime',
      instruction: 'Tap all PRIME numbers',
      check: (n: number) => isPrime(n),
    },
  ];

  const selectedRule = rules[index % rules.length];
  const maxNumber = difficulty === 'easy' ? 25 : difficulty === 'medium' ? 45 : 70;

  // Generate 16 distinct or well-distributed numbers, ensuring at least 3 to 6 targets exist
  const numbers: number[] = [];
  const used = new Set<number>();

  let targetCount = 0;
  const desiredTargets = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;

  // First seed some target numbers
  let attempts = 0;
  while (targetCount < desiredTargets && attempts < 100) {
    attempts++;
    const n = Math.floor(Math.random() * maxNumber) + 1;
    if (!used.has(n) && selectedRule.check(n)) {
      used.add(n);
      numbers.push(n);
      targetCount++;
    }
  }

  // Fill the rest with non-targets
  attempts = 0;
  while (numbers.length < gridSize && attempts < 200) {
    attempts++;
    const n = Math.floor(Math.random() * maxNumber) + 1;
    if (!used.has(n)) {
      used.add(n);
      numbers.push(n);
    }
  }

  // Fallback if needed
  while (numbers.length < gridSize) {
    numbers.push(numbers.length + 1);
  }

  // Shuffle the grid
  const shuffled = numbers.sort(() => Math.random() - 0.5);

  const gridNumbers = shuffled.map((value, idx) => ({
    id: `grid-${index}-${idx}-${value}`,
    value,
    isTarget: selectedRule.check(value),
    isTapped: false,
  }));

  const targetValues = gridNumbers.filter((g) => g.isTarget).map((g) => g.value);

  return {
    id: index,
    instruction: selectedRule.instruction,
    targetValues,
    gridNumbers,
  };
}
