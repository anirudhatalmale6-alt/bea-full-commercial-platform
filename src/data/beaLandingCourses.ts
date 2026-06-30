import { beaBrand } from "@/config/brand";

export type BEACoursePreview = {
  id: string;
  slug: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  title: string;
  ageBand: string;
  colourClass: "sun" | "sky" | "mint" | "coral" | "violet" | "lime";
  icon: string;
  subtitle: string;
  pathway: string;
  lockedUntil: "placement_test_paid_and_pathway_mapped";
  previewSnippets: {
    type: "lesson" | "game" | "worksheet" | "assessment";
    icon: string;
    title: string;
    description: string;
    sample: string;
  }[];
  appetiserLesson: {
    id: string;
    title: string;
    durationMinutes: number;
    objective: string;
    contentPreview: string;
    callToAction: string;
  };
  fullCourse: {
    lessons: number;
    modules: number;
    assessments: number;
    worksheets: number;
    certificate: boolean;
    checkoutPath: string;
  };
};

export const beaCoursePreviews: BEACoursePreview[] = [
  {
    id: "bea-a1-starter",
    slug: "a1-starter-english",
    level: "A1",
    title: "A1 Starter English",
    ageBand: "Starter learners",
    colourClass: "sun",
    icon: "🌞",
    subtitle: "Names, places, family, classroom English and simple routines.",
    pathway: "Beginner pathway",
    lockedUntil: "placement_test_paid_and_pathway_mapped",
    previewSnippets: [
      { type: "lesson", icon: "👋", title: "Say who you are", description: "Introduce yourself using short clear sentences.", sample: "I am a learner. I am from London. I study English." },
      { type: "game", icon: "🧩", title: "Build the sentence", description: "Drag words into the correct order.", sample: "I / am / from / London" },
      { type: "worksheet", icon: "📝", title: "Personal information worksheet", description: "Practise names, countries and short answers.", sample: "Where are you from? I am from..." }
    ],
    appetiserLesson: {
      id: "APP-A1-001",
      title: "Short trial: Say who you are",
      durationMinutes: 7,
      objective: "Use three short sentences to introduce yourself.",
      contentPreview: "Watch a short model, complete three playful practice items and record one answer.",
      callToAction: `Unlock this short trial lesson after your paid ${beaBrand.shortName} Level Test.`
    },
    fullCourse: { lessons: 36, modules: 6, assessments: 7, worksheets: 36, certificate: true, checkoutPath: "/checkout/course?courseId=bea-a1-starter" }
  },
  {
    id: "bea-a2-everyday",
    slug: "a2-everyday-english",
    level: "A2",
    title: "A2 Everyday English",
    ageBand: "Everyday learners",
    colourClass: "sky",
    icon: "🛒",
    subtitle: "Shopping, travel, routines, health, simple messages and plans.",
    pathway: "Elementary pathway",
    lockedUntil: "placement_test_paid_and_pathway_mapped",
    previewSnippets: [
      { type: "lesson", icon: "🚌", title: "Ask for help politely", description: "Use everyday phrases for shops, travel and appointments.", sample: "Could I have...? I would like..." },
      { type: "game", icon: "🎯", title: "Match the request", description: "Choose the best polite phrase.", sample: "I need help. → Could you help me, please?" },
      { type: "assessment", icon: "✅", title: "A2 quick check", description: "Write a short message about a plan or past event.", sample: "Write 60 words to invite a friend." }
    ],
    appetiserLesson: {
      id: "APP-A2-001",
      title: "Short trial: Ask for help",
      durationMinutes: 8,
      objective: "Use polite phrases to ask for help in everyday situations.",
      contentPreview: "Complete a short listen-and-choose task and build two polite requests.",
      callToAction: `Unlock this short trial lesson after your paid ${beaBrand.shortName} Level Test.`
    },
    fullCourse: { lessons: 36, modules: 6, assessments: 7, worksheets: 36, certificate: true, checkoutPath: "/checkout/course?courseId=bea-a2-everyday" }
  },
  {
    id: "bea-b1-independent",
    slug: "b1-independent-english",
    level: "B1",
    title: "B1 Independent English",
    ageBand: "Independent learners",
    colourClass: "mint",
    icon: "💬",
    subtitle: "Opinions, stories, work, study, travel and problem-solving.",
    pathway: "Intermediate pathway",
    lockedUntil: "placement_test_paid_and_pathway_mapped",
    previewSnippets: [
      { type: "lesson", icon: "💡", title: "Give an opinion with a reason", description: "Explain what you think and why.", sample: "I agree because... In my opinion..." },
      { type: "game", icon: "🔀", title: "Opinion sentence builder", description: "Build connected answers with because and however.", sample: "I prefer online lessons because they are flexible." },
      { type: "worksheet", icon: "📄", title: "Speaking confidence worksheet", description: "Guided frames for discussion and interviews.", sample: "I think... because... Another reason is..." }
    ],
    appetiserLesson: {
      id: "APP-B1-001",
      title: "Short trial: Give an opinion",
      durationMinutes: 9,
      objective: "Give a clear opinion and support it with one reason.",
      contentPreview: "Read a model answer, reorder phrases and record a short opinion.",
      callToAction: `Unlock this short trial lesson after your paid ${beaBrand.shortName} Level Test.`
    },
    fullCourse: { lessons: 36, modules: 6, assessments: 7, worksheets: 36, certificate: true, checkoutPath: "/checkout/course?courseId=bea-b1-independent" }
  },
  {
    id: "bea-b2-confident",
    slug: "b2-confident-english",
    level: "B2",
    title: "B2 Confident English",
    ageBand: "Confident learners",
    colourClass: "coral",
    icon: "🚀",
    subtitle: "Detailed academic, workplace and social communication.",
    pathway: "Upper-intermediate pathway",
    lockedUntil: "placement_test_paid_and_pathway_mapped",
    previewSnippets: [
      { type: "lesson", icon: "⚖️", title: "Build a balanced argument", description: "Use contrast, evidence and conclusion.", sample: "Although some people argue..., it is also important..." },
      { type: "game", icon: "🛠️", title: "Improve the paragraph", description: "Choose stronger linking and evidence.", sample: "This suggests that... In contrast..." },
      { type: "assessment", icon: "📊", title: "B2 report task", description: "Write a structured report using recommendations.", sample: "The aim of this report is to..." }
    ],
    appetiserLesson: {
      id: "APP-B2-001",
      title: "Short trial: Strengthen an argument",
      durationMinutes: 10,
      objective: "Improve one short argument with a reason, contrast and example.",
      contentPreview: "Edit a weak paragraph and compare it with a stronger model.",
      callToAction: `Unlock this short trial lesson after your paid ${beaBrand.shortName} Level Test.`
    },
    fullCourse: { lessons: 36, modules: 6, assessments: 7, worksheets: 36, certificate: true, checkoutPath: "/checkout/course?courseId=bea-b2-confident" }
  },
  {
    id: "bea-c1-advanced",
    slug: "c1-advanced-english",
    level: "C1",
    title: "C1 Advanced English",
    ageBand: "Advanced learners",
    colourClass: "violet",
    icon: "🎓",
    subtitle: "Precise professional, academic and high-level communication.",
    pathway: "Advanced pathway",
    lockedUntil: "placement_test_paid_and_pathway_mapped",
    previewSnippets: [
      { type: "lesson", icon: "🔍", title: "Make claims carefully", description: "Use hedging and academic caution.", sample: "This may indicate that... It is likely that..." },
      { type: "game", icon: "✨", title: "Rewrite for nuance", description: "Transform direct claims into precise statements.", sample: "This proves... → This may suggest..." },
      { type: "worksheet", icon: "📘", title: "Register control worksheet", description: "Formal, neutral and persuasive versions.", sample: "I want... → I would appreciate..." }
    ],
    appetiserLesson: {
      id: "APP-C1-001",
      title: "Short trial: Sound more professional",
      durationMinutes: 10,
      objective: "Rewrite direct statements with precise and appropriate register.",
      contentPreview: "Compare three versions of a message and improve one response.",
      callToAction: `Unlock this short trial lesson after your paid ${beaBrand.shortName} Level Test.`
    },
    fullCourse: { lessons: 36, modules: 6, assessments: 7, worksheets: 36, certificate: true, checkoutPath: "/checkout/course?courseId=bea-c1-advanced" }
  },
  {
    id: "bea-c2-mastery",
    slug: "c2-mastery-english",
    level: "C2",
    title: "C2 Mastery English",
    ageBand: "Mastery learners",
    colourClass: "lime",
    icon: "🏆",
    subtitle: "Nuanced, sophisticated control across complex communication.",
    pathway: "Mastery pathway",
    lockedUntil: "placement_test_paid_and_pathway_mapped",
    previewSnippets: [
      { type: "lesson", icon: "🎭", title: "Control tone with precision", description: "Use emphasis, implication and persuasive nuance.", sample: "The issue is not merely..., but rather..." },
      { type: "game", icon: "🎚️", title: "Tone transformation", description: "Rewrite a message for diplomacy or authority.", sample: "That is wrong. → That interpretation may overlook..." },
      { type: "assessment", icon: "🧠", title: "Critical synthesis task", description: "Synthesize complex sources into one argument.", sample: "While the evidence appears contradictory..." }
    ],
    appetiserLesson: {
      id: "APP-C2-001",
      title: "Short trial: Master tone",
      durationMinutes: 10,
      objective: "Rewrite one direct message into a diplomatic and precise response.",
      contentPreview: "Choose tone, improve phrasing and compare with an expert model.",
      callToAction: `Unlock this short trial lesson after your paid ${beaBrand.shortName} Level Test.`
    },
    fullCourse: { lessons: 36, modules: 6, assessments: 7, worksheets: 36, certificate: true, checkoutPath: "/checkout/course?courseId=bea-c2-mastery" }
  }
];

export const beaLibraryTiles = [
  { title: "English Games", subtitle: "Sentence builders, matching and word order", icon: "🎮", href: "/courses?type=games" },
  { title: "Worksheets", subtitle: "Printable practice for every level", icon: "📝", href: "/downloadables" },
  { title: "Speaking Tasks", subtitle: "Short recorded fluency practice", icon: "🎙️", href: "/courses?skill=speaking" },
  { title: "Writing Tasks", subtitle: "Rubrics, models and guided answers", icon: "✍️", href: "/courses?skill=writing" },
  { title: "Teacher Tools", subtitle: "Class tracking, reports and assignments", icon: "🍎", href: "/teacher-dashboard" },
  { title: "Level Test", subtitle: "Paid test and mapped pathway", icon: "⭐", href: "/checkout/placement" }
];

export function getRecommendedCourse(level?: string | null): BEACoursePreview {
  const match = beaCoursePreviews.find((course) => course.level === level);
  return match ?? beaCoursePreviews[2];
}
