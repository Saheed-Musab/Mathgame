import { Difficulty, EquationChallenge } from '../types/game';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateEquationChallenge(difficulty: Difficulty, index: number): EquationChallenge {
  if (difficulty === 'easy') {
    // Generate simple 2 or 3 number equation: e.g. a * b + c or a + b + c
    const a = getRandomInt(2, 9);
    const b = getRandomInt(2, 9);
    const op = Math.random() > 0.4 ? '×' : '+';
    let target = op === '×' ? a * b : a + b;

    let c = 0;
    let op2 = '+';
    if (Math.random() > 0.4) {
      c = getRandomInt(1, 10);
      op2 = Math.random() > 0.5 ? '+' : '−';
      if (op2 === '+') {
        target += c;
      } else {
        if (target > c + 2) {
          target -= c;
        } else {
          op2 = '+';
          target += c;
        }
      }
    }

    const baseNumbers = c > 0 ? [a, b, c] : [a, b];
    // Add 2 or 3 distractor numbers
    const distractors = [getRandomInt(1, 12), getRandomInt(2, 15)];
    const allNumbers = [...baseNumbers, ...distractors].sort(() => Math.random() - 0.5);

    return {
      id: index,
      target,
      numbers: allNumbers,
      operators: ['+', '−', '×'],
    };
  }

  if (difficulty === 'medium') {
    // Medium: 3 numbers with multiplication / division / addition
    const a = getRandomInt(3, 12);
    const b = getRandomInt(2, 9);
    const c = getRandomInt(2, 15);
    const useMult = Math.random() > 0.3;
    let target = useMult ? a * b : a + b;
    const op2 = Math.random() > 0.5 ? '+' : '−';
    if (op2 === '+') target += c;
    else if (target > c + 3) target -= c;
    else target += c;

    const baseNumbers = [a, b, c];
    const distractors = [getRandomInt(2, 20), getRandomInt(3, 25)];
    const allNumbers = [...baseNumbers, ...distractors].sort(() => Math.random() - 0.5);

    return {
      id: index,
      target,
      numbers: allNumbers,
      operators: ['+', '−', '×', '÷'],
    };
  }

  // Hard: Multi-step with larger ranges
  const a = getRandomInt(4, 15);
  const b = getRandomInt(3, 12);
  const c = getRandomInt(2, 10);
  const d = getRandomInt(1, 8);
  const target = (a * b) - (c * d) > 10 ? (a * b) - (c * d) : (a * b) + c + d;

  const baseNumbers = [a, b, c, d];
  const distractors = [getRandomInt(2, 30), getRandomInt(4, 40)];
  const allNumbers = [...baseNumbers, ...distractors].sort(() => Math.random() - 0.5);

  return {
    id: index,
    target,
    numbers: allNumbers,
    operators: ['+', '−', '×', '÷'],
  };
}

export function evaluateExpression(tokens: Array<{ type: 'num' | 'op'; value: string | number }>): number | null {
  if (tokens.length === 0) return null;
  // Last token shouldn't be an operator for completed evaluation
  if (tokens[tokens.length - 1].type === 'op') return null;

  try {
    // Build standard arithmetic string
    let expr = '';
    for (const t of tokens) {
      if (t.type === 'num') {
        expr += t.value;
      } else {
        if (t.value === '×') expr += ' * ';
        else if (t.value === '÷') expr += ' / ';
        else if (t.value === '−') expr += ' - ';
        else expr += ` ${t.value} `;
      }
    }

    // Basic safe mathematical evaluation (only contains digits, +, -, *, /, spaces)
    if (!/^[\d\s+\-*/.]+$/.test(expr)) return null;
    
    // Custom order-of-operations evaluator without unsafe eval
    const parts = expr.trim().split(/\s+/);
    if (parts.length === 0) return null;

    // Process * and /
    const intermediate: Array<number | string> = [];
    let i = 0;
    while (i < parts.length) {
      const part = parts[i];
      if (part === '*' || part === '/') {
        const prev = intermediate.pop();
        const next = parseFloat(parts[i + 1]);
        if (prev === undefined || isNaN(next)) return null;
        if (part === '/' && next === 0) return null; // zero div
        const res = part === '*' ? (prev as number) * next : (prev as number) / next;
        intermediate.push(res);
        i += 2;
      } else if (!isNaN(Number(part))) {
        intermediate.push(Number(part));
        i++;
      } else {
        intermediate.push(part);
        i++;
      }
    }

    // Process + and -
    let finalVal = Number(intermediate[0]);
    let j = 1;
    while (j < intermediate.length) {
      const op = intermediate[j];
      const next = Number(intermediate[j + 1]);
      if (isNaN(next)) return null;
      if (op === '+') finalVal += next;
      else if (op === '-') finalVal -= next;
      j += 2;
    }

    return Math.round(finalVal * 1000) / 1000;
  } catch {
    return null;
  }
}
