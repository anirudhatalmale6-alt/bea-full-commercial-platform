import { leaPricingCatalog } from "@/data/leaPricingCatalog";
import PricingCards from "@/components/pricing/PricingCards";

export const metadata = {
  title: "British English Academy Pricing",
  description: "BEA Level Test, course, bundle, subscription and institution pricing.",
};

export default function PricingPage() {
  return <PricingCards catalog={leaPricingCatalog} />;
}
