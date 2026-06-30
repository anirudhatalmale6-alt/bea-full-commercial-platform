import { NextResponse } from "next/server";
import { beaCoursePreviews, beaLibraryTiles } from "@/data/beaLandingCourses";
import { beaBrand } from "@/config/brand";

export async function GET() {
  return NextResponse.json({
    ok: true,
    brand: beaBrand,
    libraryTiles: beaLibraryTiles,
    courses: beaCoursePreviews.map((course) => ({
      id: course.id,
      slug: course.slug,
      level: course.level,
      title: course.title,
      icon: course.icon,
      colourClass: course.colourClass,
      subtitle: course.subtitle,
      pathway: course.pathway,
      previewSnippets: course.previewSnippets,
      fullCourseSummary: course.fullCourse,
    })),
  });
}
