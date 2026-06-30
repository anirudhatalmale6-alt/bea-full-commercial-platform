import BEALandingPage from "@/components/landing/BEALandingPage";
import { beaBrand } from "@/config/brand";

export const metadata = {
  title: `${beaBrand.displayName} | British English Level Test, Trial Lesson and Courses`,
  description:
    "Preview British English course content, check your English level, unlock a short trial lesson and start your recommended full course.",
};

export default function HomePage() {
  return <BEALandingPage />;
}
