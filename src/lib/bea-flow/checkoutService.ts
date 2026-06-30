import Stripe from 'stripe';
import { one } from './db';
import { markLevelTestPaid, enrolLearnerInCourse } from './flowService';
import { beaFlowConfig, courseById } from '@/data/beaFlowConfig';
import type { ProductType } from '@/types/beaFlow';
function stripeClient(){ const key=process.env.STRIPE_SECRET_KEY; if(!key) throw new Error('STRIPE_SECRET_KEY missing'); return new Stripe(key, { apiVersion:'2024-06-20' as any }); }
export async function createCheckout(input:{userId:string; productType:ProductType; productId:string; successUrl?:string; cancelUrl?:string}){
  const site=process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; const isTest=input.productType==='level_test'; const course=input.productType==='single_course'?courseById(input.productId):null; const amount=isTest?beaFlowConfig.levelTest.amountPence:course?.amountPence; const env=isTest?beaFlowConfig.levelTest.stripePriceEnv:course?.stripePriceEnv; if(!amount) throw new Error('UNKNOWN_PRODUCT');
  const pay=await one<any>(`INSERT INTO bea_payments (user_id,product_type,product_id,status,amount_pence,currency,metadata) VALUES ($1,$2,$3,'pending',$4,'gbp',$5::jsonb) RETURNING id`, [input.userId,input.productType,input.productId,amount,JSON.stringify({source:'bea_flow_checkout'})]);
  if(process.env.ALLOW_MOCK_PAYMENTS==='true'){
    await one(`UPDATE bea_payments SET status='paid', paid_at=NOW() WHERE id=$1`, [pay.id]);
    if(input.productType==='level_test') await markLevelTestPaid({learnerUserId:input.userId,paymentId:pay.id});
    if(input.productType==='single_course') await enrolLearnerInCourse({learnerUserId:input.userId, courseId:input.productId, source:'single_course_payment', paymentId:pay.id});
    return { mock:true, paymentId:pay.id, url: input.productType==='level_test'?'/placement-test/start?mockPaid=1':`/dashboard?courseUnlocked=${input.productId}` };
  }
  const priceId = env ? process.env[env] : undefined; if(!priceId) throw new Error(`Stripe price ID missing for ${env}`);
  const session = await stripeClient().checkout.sessions.create({ mode: input.productType==='subscription'||input.productType==='institution_licence'?'subscription':'payment', line_items:[{price:priceId,quantity:1}], success_url: input.successUrl ?? `${site}/payment/success?session_id={CHECKOUT_SESSION_ID}`, cancel_url: input.cancelUrl ?? `${site}/payment/cancelled`, metadata:{paymentId:pay.id,userId:input.userId,productType:input.productType,productId:input.productId} });
  await one(`UPDATE bea_payments SET stripe_checkout_session_id=$2, metadata=metadata || $3::jsonb WHERE id=$1`, [pay.id,session.id,JSON.stringify({stripeSessionUrl:session.url})]); return { mock:false, paymentId:pay.id, sessionId:session.id, url:session.url };
}
export async function handleStripeCheckoutCompleted(session:Stripe.Checkout.Session){ const paymentId=session.metadata?.paymentId, userId=session.metadata?.userId, productType=session.metadata?.productType as ProductType|undefined, productId=session.metadata?.productId; if(!paymentId||!userId||!productType||!productId) throw new Error('Missing checkout metadata'); await one(`UPDATE bea_payments SET status='paid', paid_at=NOW(), stripe_customer_id=$2 WHERE id=$1`, [paymentId,String(session.customer ?? '')]); if(productType==='level_test') await markLevelTestPaid({learnerUserId:userId,paymentId}); if(productType==='single_course') await enrolLearnerInCourse({learnerUserId:userId,courseId:productId,source:'single_course_payment',paymentId}); return {ok:true,paymentId,productType,productId,userId}; }
export async function constructStripeEvent(rawBody:string, signature:string|null){ const secret=process.env.STRIPE_WEBHOOK_SECRET; if(!secret) throw new Error('STRIPE_WEBHOOK_SECRET missing'); if(!signature) throw new Error('Stripe signature missing'); return stripeClient().webhooks.constructEvent(rawBody, signature, secret); }
