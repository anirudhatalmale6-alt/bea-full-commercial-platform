import { NextResponse } from "next/server";
import { getAllPricingItems } from "@/lib/pricingRules";

export async function GET() {
  return NextResponse.json({
    ok: true,
    currency: "GBP",
    pricing: getAllPricingItems(),
  });
}
