import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/bea-flow/auth';
import { createCheckout } from '@/lib/bea-flow/checkoutService';
export async function POST(req:NextRequest){ const user=await getCurrentUser(req); if(!user) return NextResponse.json({ok:false,error:'AUTH_REQUIRED'},{status:401}); const body=await req.json().catch(()=>({})); const checkout=await createCheckout({userId:body.learnerUserId ?? user.id, productType:'level_test', productId:'bea_level_test', successUrl:body.successUrl, cancelUrl:body.cancelUrl}); return NextResponse.json({ok:true,checkout}); }
