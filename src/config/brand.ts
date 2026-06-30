export const beaBrand = {
  displayName: "British English Academy",
  shortName: "BEA",
  productName: "BEA English Learning Platform",
  legalEntityName: "British English Academy",
  domain: "britishenglishacademy.com",
  appDomain: "app.britishenglishacademy.com",
  supportEmail: "support@britishenglishacademy.com",
  certificate: {
    diagnosticTitle: "British English Academy Diagnostic Certificate",
    completionTitle: "British English Academy Course Completion Certificate",
    verificationPath: "/verify-certificate",
    disclaimer:
      "British English Academy certificates are platform diagnostic or course-completion certificates. They are not official UK government, Council of Europe, Cambridge, Pearson, Oxford University or exam-board qualifications."
  },
  colours: {
    navy: "#102a43",
    royalBlue: "#2667ff",
    sky: "#62d2ff",
    sunshine: "#ffd166",
    orange: "#ff8c42",
    coral: "#ff5d73",
    mint: "#43e6b5",
    violet: "#8b5cf6",
    lime: "#c8f560",
    cream: "#fff7df",
    cloud: "#f2fbff"
  },
  publicPositioning:
    "A bright, playful British English learning platform. Check your English level, get your mapped pathway, try a short trial lesson and access full CEFR courses.",
  cta: {
    primary: "Check Your English Level",
    preview: "Preview Course Content",
    trial: "Unlock Short Trial Lesson",
    fullCourse: "Start Full Course After Payment"
  }
} as const;

export const brand = {
  name: beaBrand.displayName,
  shortName: beaBrand.shortName,
  platformName: beaBrand.productName,
  placementTestName: "British English Academy CEFR Placement Test",
  certificateName: beaBrand.certificate.diagnosticTitle,
  scoreReportName: "British English Academy CEFR Score Report",
  tagline: "Find your English level. Start your British English pathway.",
  disclaimer: beaBrand.certificate.disclaimer
} as const;

export type BEABrand = typeof beaBrand;
