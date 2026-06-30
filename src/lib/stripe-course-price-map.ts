export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type CoursePriceConfig = {
  level: CefrLevel;
  productName: string;
  envVar: string;
  displayPrice: string;
  amountPence: number;
  accessDurationDays: number;
  courseSlug: string;
};

export const BEA_COURSE_PRICE_CONFIG: Record<CefrLevel, CoursePriceConfig> = {
  A1: {
    level: 'A1',
    productName: 'BEA A1 Beginner Course',
    envVar: 'STRIPE_PRICE_A1',
    displayPrice: '£39',
    amountPence: 3900,
    accessDurationDays: 180,
    courseSlug: 'a1-beginner'
  },
  A2: {
    level: 'A2',
    productName: 'BEA A2 Elementary Course',
    envVar: 'STRIPE_PRICE_A2',
    displayPrice: '£49',
    amountPence: 4900,
    accessDurationDays: 180,
    courseSlug: 'a2-elementary'
  },
  B1: {
    level: 'B1',
    productName: 'BEA B1 Intermediate Course',
    envVar: 'STRIPE_PRICE_B1',
    displayPrice: '£59',
    amountPence: 5900,
    accessDurationDays: 180,
    courseSlug: 'b1-intermediate'
  },
  B2: {
    level: 'B2',
    productName: 'BEA B2 Upper-Intermediate Course',
    envVar: 'STRIPE_PRICE_B2',
    displayPrice: '£69',
    amountPence: 6900,
    accessDurationDays: 180,
    courseSlug: 'b2-upper-intermediate'
  },
  C1: {
    level: 'C1',
    productName: 'BEA C1 Advanced Course',
    envVar: 'STRIPE_PRICE_C1',
    displayPrice: '£79',
    amountPence: 7900,
    accessDurationDays: 180,
    courseSlug: 'c1-advanced'
  },
  C2: {
    level: 'C2',
    productName: 'BEA C2 Proficiency Course',
    envVar: 'STRIPE_PRICE_C2',
    displayPrice: '£89',
    amountPence: 8900,
    accessDurationDays: 180,
    courseSlug: 'c2-proficiency'
  }
};

export function normalizeCefrLevel(value: unknown): CefrLevel | null {
  if (typeof value !== 'string') return null;
  const level = value.trim().toUpperCase();
  return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level) ? (level as CefrLevel) : null;
}

export function getStripePriceIdForLevel(level: CefrLevel): string {
  const config = BEA_COURSE_PRICE_CONFIG[level];
  const priceId = process.env[config.envVar];

  if (!priceId || !priceId.startsWith('price_')) {
    throw new Error(`Missing or invalid ${config.envVar}. Expected a live Stripe Price ID beginning with price_.`);
  }

  return priceId;
}

export function getCourseCheckoutMetadata(params: { level: CefrLevel; learnerId?: string; email?: string }) {
  const config = BEA_COURSE_PRICE_CONFIG[params.level];
  return {
    brand: 'BEA',
    business: 'British English Academy',
    product_type: 'course_level',
    cefr_level: params.level,
    course_slug: config.courseSlug,
    entitlement_scope: `course:${params.level}`,
    access_type: 'one_time',
    access_duration_days: String(config.accessDurationDays),
    certificate_included: 'true',
    ai_tutor_included: 'true',
    learner_id: params.learnerId || '',
    learner_email: params.email || ''
  };
}
