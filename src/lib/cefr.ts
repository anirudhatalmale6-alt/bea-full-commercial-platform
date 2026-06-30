export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const CEFR_BOUNDARIES: Record<CefrLevel, [number, number]> = {
  A1: [-3.0, -2.0],
  A2: [-2.0, -0.5],
  B1: [-0.5, 0.5],
  B2: [0.5, 1.5],
  C1: [1.5, 2.5],
  C2: [2.5, 3.0]
};

export function thetaToCefr(theta: number): CefrLevel {
  if (theta < -2.0) return 'A1';
  if (theta < -0.5) return 'A2';
  if (theta < 0.5) return 'B1';
  if (theta < 1.5) return 'B2';
  if (theta < 2.5) return 'C1';
  return 'C2';
}

export function cefrBandDescription(level: CefrLevel): string {
  const descriptions: Record<CefrLevel, string> = {
    A1: 'Basic breakthrough user: can manage simple familiar exchanges with support.',
    A2: 'Basic waystage user: can handle routine tasks and familiar everyday information.',
    B1: 'Independent threshold user: can communicate in common travel, study and work contexts.',
    B2: 'Independent vantage user: can understand and produce detailed language on concrete and abstract topics.',
    C1: 'Proficient operational user: can use English flexibly and effectively for academic and professional purposes.',
    C2: 'Mastery user: can understand with ease and express fine shades of meaning precisely.'
  };
  return descriptions[level];
}

export function recommendedPath(level: CefrLevel): string[] {
  const map: Record<CefrLevel, string[]> = {
    A1: ['A1 Foundation: people, classroom language, daily routines', 'A2 Bridge after 60 guided hours'],
    A2: ['A2 Core: past events, travel, health and plans', 'B1 Bridge after 80 guided hours'],
    B1: ['B1 Core: opinions, media, study and community projects', 'B2 Bridge after portfolio review'],
    B2: ['B2 Academic/Professional: argument, reports and fluency', 'C1 Bridge after writing sample moderation'],
    C1: ['C1 Advanced: evidence, nuance, presentation and professional writing', 'C2 precision modules'],
    C2: ['C2 Mastery maintenance: rhetoric, specialist discourse and high-stakes communication']
  };
  return map[level];
}
