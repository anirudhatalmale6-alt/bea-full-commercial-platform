export const beaFlowConfig = {
  currency: 'gbp',
  levelTest: { productId:'bea_level_test', stripePriceEnv:'STRIPE_PRICE_BEA_LEVEL_TEST', amountPence:999, name:'BEA/BEA Level Test, Score Report and Diagnostic Certificate' },
  courses: [
    { id:'bea_a1_starter', level:'A1', slug:'a1-beginner', title:'BEA A1 Beginner Course', stripePriceEnv:'STRIPE_PRICE_A1', amountPence:3900 },
    { id:'bea_a2_everyday', level:'A2', slug:'a2-elementary', title:'BEA A2 Elementary Course', stripePriceEnv:'STRIPE_PRICE_A2', amountPence:4900 },
    { id:'bea_b1_independent', level:'B1', slug:'b1-intermediate', title:'BEA B1 Intermediate Course', stripePriceEnv:'STRIPE_PRICE_B1', amountPence:5900 },
    { id:'bea_b2_confident', level:'B2', slug:'b2-upper-intermediate', title:'BEA B2 Upper-Intermediate Course', stripePriceEnv:'STRIPE_PRICE_B2', amountPence:6900 },
    { id:'bea_c1_advanced', level:'C1', slug:'c1-advanced', title:'BEA C1 Advanced Course', stripePriceEnv:'STRIPE_PRICE_C1', amountPence:7900 },
    { id:'bea_c2_mastery', level:'C2', slug:'c2-proficiency', title:'BEA C2 Proficiency Course', stripePriceEnv:'STRIPE_PRICE_C2', amountPence:8900 }
  ]
} as const;
export function courseForLevel(level?: string|null){ return beaFlowConfig.courses.find(c=>c.level===level) ?? beaFlowConfig.courses[2]; }
export function courseById(id:string){ return beaFlowConfig.courses.find(c=>c.id===id); }
