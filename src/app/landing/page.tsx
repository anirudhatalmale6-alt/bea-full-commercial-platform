import BEALandingPage from "@/components/landing/BEALandingPage";
import { beaBrand } from "@/config/brand";

export const metadata = {
  title: `${beaBrand.shortName} Course Preview and Level Test`,
  description:
    "Preview British English Academy course snippets, check your English level and unlock your pathway.",
};

export default function LandingPage() {
  return <BEALandingPage />;
}
