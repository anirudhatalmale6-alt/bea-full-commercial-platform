export const beaFlowConfig = {
  currency: 'gbp',
  levelTest: { productId:'bea_level_test', stripePriceEnv:'STRIPE_PRICE_BEA_LEVEL_TEST', amountPence:999, name:'BEA/BEA Level Test, Score Report and Diagnostic Certificate' },
  courses: [
    { id:'bea_a1_starter', level:'A1', slug:'a1-starter-english', title:'A1 Starter English', stripePriceEnv:'STRIPE_PRICE_BEA_A1_STARTER', amountPence:2700 },
    { id:'bea_a2_everyday', level:'A2', slug:'a2-everyday-english', title:'A2 Everyday English', stripePriceEnv:'STRIPE_PRICE_BEA_A2_EVERYDAY', amountPence:2700 },
    { id:'bea_b1_independent', level:'B1', slug:'b1-independent-english', title:'B1 Independent English', stripePriceEnv:'STRIPE_PRICE_BEA_B1_INDEPENDENT', amountPence:2700 },
    { id:'bea_b2_confident', level:'B2', slug:'b2-confident-english', title:'B2 Confident English', stripePriceEnv:'STRIPE_PRICE_BEA_B2_CONFIDENT', amountPence:2700 },
    { id:'bea_c1_advanced', level:'C1', slug:'c1-advanced-english', title:'C1 Advanced English', stripePriceEnv:'STRIPE_PRICE_BEA_C1_ADVANCED', amountPence:2700 },
    { id:'bea_c2_mastery', level:'C2', slug:'c2-mastery-english', title:'C2 Mastery English', stripePriceEnv:'STRIPE_PRICE_BEA_C2_MASTERY', amountPence:2700 }
  ]
} as const;
export function courseForLevel(level?: string|null){ return beaFlowConfig.courses.find(c=>c.level===level) ?? beaFlowConfig.courses[2]; }
export function courseById(id:string){ return beaFlowConfig.courses.find(c=>c.id===id); }
