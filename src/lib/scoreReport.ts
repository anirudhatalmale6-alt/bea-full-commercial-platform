import { cefrBandDescription, recommendedPath, type CefrLevel } from './cefr';

export function buildReport(level: CefrLevel, theta: number, sem: number, correct: number, total: number) {
  const confidence = sem <= 0.35 ? 'High diagnostic confidence' : sem <= 0.55 ? 'Moderate diagnostic confidence' : 'Provisional diagnostic confidence';
  return {
    cefrLevel: level,
    theta,
    standardError: sem,
    confidence,
    accuracy: total ? Math.round((correct / total) * 100) : 0,
    summary: cefrBandDescription(level),
    recommendedPath: recommendedPath(level),
    limitations: 'This is a British English Academy platform diagnostic certificate. External acceptance depends on each institution and on future independent validation/accreditation.'
  };
}
