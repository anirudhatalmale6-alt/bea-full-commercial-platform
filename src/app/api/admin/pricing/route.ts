import { NextRequest, NextResponse } from "next/server";
import { getAllPricingItems } from "@/lib/pricingRules";

/**
 * Production integration:
 * - protect with platform_admin or super_admin role
 * - persist changes into database pricing tables
 * - write audit log
 * - sync changed price to Stripe or require new Stripe price ID
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    pricing: getAllPricingItems(),
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  return NextResponse.json({
    ok: false,
    status: "TODO_CONNECT_ADMIN_DB_UPDATE",
    message: "Pricing edits must be persisted in pricing tables and Stripe price IDs must be immutable or replaced safely.",
    received: body,
  }, { status: 501 });
}
