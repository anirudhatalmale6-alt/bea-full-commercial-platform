import { thetaToCefr } from './cefr';

export interface AssessmentHistoryItem {
  itemId: string;
  difficulty: number;
  discrimination: number;
  guessing: number;
  isCorrect: boolean;
}

export interface IrtResult {
  theta: number;
  standardError: number;
  cefrLevel: ReturnType<typeof thetaToCefr>;
  reliabilityNote: string;
}

export function probability3pl(theta: number, difficulty: number, discrimination: number, guessing: number): number {
  return guessing + (1 - guessing) / (1 + Math.exp(-discrimination * (theta - difficulty)));
}

export function fisherInformation(theta: number, difficulty: number, discrimination: number, guessing: number): number {
  const p = probability3pl(theta, difficulty, discrimination, guessing);
  const q = 1 - p;
  if (p <= 0 || q <= 0 || guessing >= 1) return 0;
  const pPrime = discrimination * (p - guessing) * q / (1 - guessing);
  return (pPrime * pPrime) / (p * q);
}

export function optimizeTheta(history: AssessmentHistoryItem[]): IrtResult {
  if (!history.length) {
    return { theta: 0, standardError: 99, cefrLevel: 'B1', reliabilityNote: 'Initial calibration only.' };
  }
  let theta = 0;
  for (let iter = 0; iter < 20; iter++) {
    let gradient = 0;
    let information = 0;
    for (const item of history) {
      const p = probability3pl(theta, item.difficulty, item.discrimination, item.guessing);
      const q = 1 - p;
      if (p <= 0.0001 || q <= 0.0001) continue;
      const score = item.isCorrect ? 1 : 0;
      const pPrime = item.discrimination * (p - item.guessing) * q / Math.max(0.0001, 1 - item.guessing);
      gradient += (pPrime * (score - p)) / (p * q);
      information += fisherInformation(theta, item.difficulty, item.discrimination, item.guessing);
    }
    const step = information > 0 ? gradient / information : 0;
    theta += Math.max(-0.75, Math.min(0.75, step));
    theta = Math.max(-3, Math.min(3, theta));
  }
  const totalInfo = history.reduce((sum, item) => sum + fisherInformation(theta, item.difficulty, item.discrimination, item.guessing), 0);
  const sem = totalInfo > 0 ? 1 / Math.sqrt(totalInfo) : 99;
  return {
    theta: Number(theta.toFixed(3)),
    standardError: Number(sem.toFixed(3)),
    cefrLevel: thetaToCefr(theta),
    reliabilityNote: sem <= 0.35 ? 'Placement estimate has reached the platform reliability threshold.' : 'Placement estimate is provisional; more responses improve precision.'
  };
}

export function shouldTerminate(historyLength: number, sem: number): boolean {
  return (historyLength >= 12 && sem <= 0.35) || historyLength >= 30;
}
