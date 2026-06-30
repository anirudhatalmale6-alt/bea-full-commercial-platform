import BEALandingPage from "@/components/landing/BEALandingPage";
import { beaBrand } from "@/config/brand";

export const metadata = {
  title: `${beaBrand.shortName} Course Preview and Level Test`,
  description:
    "Preview British English Academy course snippets before taking the paid Level Test and unlocking your pathway.",
};

export default function LandingPage() {
  return <BEALandingPage />;
}
