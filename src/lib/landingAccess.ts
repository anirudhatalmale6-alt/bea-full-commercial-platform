export type LandingUserState = {
  isAuthenticated: boolean;
  hasPaidLevelTest: boolean;
  hasCompletedLevelTest: boolean;
  mappedLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  hasUnlockedAppetiser: boolean;
  hasPaidFullCourse: boolean;
  enrolledCourseId?: string;
};

export type LandingAccessResult = {
  canPreviewCourseSnippets: boolean;
  canStartLevelTest: boolean;
  canUnlockAppetiser: boolean;
  canStartFullCourse: boolean;
  nextActionLabel: string;
  nextActionHref: string;
  statusMessage: string;
};

export function evaluateLandingAccess(state: LandingUserState, courseId: string): LandingAccessResult {
  if (!state.isAuthenticated) {
    return {
      canPreviewCourseSnippets: true,
      canStartLevelTest: true,
      canUnlockAppetiser: false,
      canStartFullCourse: false,
      nextActionLabel: "Sign up and take the BEA Level Test",
      nextActionHref: "/register?next=/checkout/placement",
      statusMessage: "Preview lessons and games now. Sign up and take the paid BEA Level Test to unlock your pathway."
    };
  }

  if (!state.hasPaidLevelTest) {
    return {
      canPreviewCourseSnippets: true,
      canStartLevelTest: true,
      canUnlockAppetiser: false,
      canStartFullCourse: false,
      nextActionLabel: "Pay for BEA Level Test",
      nextActionHref: "/checkout/placement?source=landing",
      statusMessage: "Preview available. Pay for the BEA Level Test to map your course pathway."
    };
  }

  if (!state.hasCompletedLevelTest || !state.mappedLevel) {
    return {
      canPreviewCourseSnippets: true,
      canStartLevelTest: true,
      canUnlockAppetiser: false,
      canStartFullCourse: false,
      nextActionLabel: "Continue BEA Level Test",
      nextActionHref: "/placement-test/start",
      statusMessage: "Your BEA Level Test is paid. Complete it to unlock your short trial lesson."
    };
  }

  if (!state.hasUnlockedAppetiser) {
    return {
      canPreviewCourseSnippets: true,
      canStartLevelTest: false,
      canUnlockAppetiser: true,
      canStartFullCourse: false,
      nextActionLabel: "Unlock Short Trial Lesson",
      nextActionHref: `/appetiser/unlock?courseId=${courseId}`,
      statusMessage: `Your pathway is mapped to ${state.mappedLevel}. Unlock your short BEA trial lesson before buying the full course.`
    };
  }

  if (!state.hasPaidFullCourse) {
    return {
      canPreviewCourseSnippets: true,
      canStartLevelTest: false,
      canUnlockAppetiser: true,
      canStartFullCourse: true,
      nextActionLabel: "Start Full Course After Payment",
      nextActionHref: `/checkout/course?courseId=${courseId}&source=appetiser`,
      statusMessage: "Your short BEA trial lesson is unlocked. Start the full course after payment."
    };
  }

  return {
    canPreviewCourseSnippets: true,
    canStartLevelTest: false,
    canUnlockAppetiser: true,
    canStartFullCourse: true,
    nextActionLabel: "Continue Full Course",
    nextActionHref: `/dashboard/courses/${state.enrolledCourseId ?? courseId}`,
    statusMessage: "Your full BEA course is unlocked. Continue learning in your dashboard."
  };
}
