import Link from "next/link";

const options = [
  { title: "For Learners", href: "/courses", note: "Preview courses, take the paid Level Test and start your mapped pathway." },
  { title: "For Parents", href: "/parent-dashboard", note: "Track your child’s Level Test, progress, feedback and certificates." },
  { title: "For Teachers & Educators", href: "/teachers-educators", note: "Assign courses, track learners and review progress." },
  { title: "For Schools & Institutions", href: "/schools", note: "Manage licences, teachers, classes and institutional reports." },
];

export default function FindCoursePage() {
  return <main className="page-shell"><section className="hero-card"><p className="eyebrow">Find Course</p><h1>Choose your BEA pathway</h1><p>Start with public previews, then use the paid Level Test to unlock the correct course journey.</p><div className="grid cards">{options.map((item) => <Link className="card-link" href={item.href} key={item.title}><strong>{item.title}</strong><span>{item.note}</span></Link>)}</div></section></main>;
}
