import { NextRequest, NextResponse } from "next/server";
import { beaCoursePreviews } from "@/data/beaLandingCourses";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const course = beaCoursePreviews.find((item) => item.id === body.courseId);

  if (!course) {
    return NextResponse.json({ ok: false, error: "Course not found" }, { status: 404 });
  }

  if (!body.hasPaidLevelTest || !body.hasCompletedLevelTest || !body.mappedLevel) {
    return NextResponse.json({
      ok: false,
      code: "BEA_LEVEL_TEST_REQUIRED",
      message: "Complete and pay for the BEA Level Test before unlocking the short trial lesson.",
      redirectTo: "/checkout/placement?source=short-trial-lock"
    }, { status: 402 });
  }

  return NextResponse.json({
    ok: true,
    appetiserLesson: course.appetiserLesson,
    next: `/appetiser/${course.appetiserLesson.id}`,
    fullCourseCheckout: course.fullCourse.checkoutPath,
  });
}
