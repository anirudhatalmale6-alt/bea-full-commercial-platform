import { NextRequest, NextResponse } from "next/server";
import { getRecommendedCourse } from "@/data/beaLandingCourses";
import { evaluateLandingAccess } from "@/lib/landingAccess";
import { beaBrand } from "@/config/brand";

export async function GET(req: NextRequest) {
  const level = req.nextUrl.searchParams.get("level");
  const course = getRecommendedCourse(level);
  const state = {
    isAuthenticated: req.nextUrl.searchParams.get("auth") === "1",
    hasPaidLevelTest: req.nextUrl.searchParams.get("paidTest") === "1",
    hasCompletedLevelTest: req.nextUrl.searchParams.get("completedTest") === "1",
    mappedLevel: level as any,
    hasUnlockedAppetiser: req.nextUrl.searchParams.get("appetiser") === "1",
    hasPaidFullCourse: req.nextUrl.searchParams.get("paidCourse") === "1",
    enrolledCourseId: course.id,
  };

  return NextResponse.json({
    ok: true,
    brand: beaBrand.shortName,
    recommendedCourse: course,
    access: evaluateLandingAccess(state, course.id),
  });
}
