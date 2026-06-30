import curriculum from '../../../data/cefr-curriculum.json';
import catalog from '../../../data/course-catalog.json';
import Link from 'next/link';

export default function CurriculumPage() {
  const pathways = catalog as any[];
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="badge">100% content-ready curriculum</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-navy">A1-C2 CEFR English curriculum architecture</h1>
        <p className="mt-3 max-w-3xl text-slate-600">The platform contains original course pathways, outcomes, modules, activities, assessments, adaptive placement item bank and reporting language. All content is structured for PostgreSQL seeding and live platform display.</p>
      </section>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {pathways.map((course) => (
          <Link href={`/course/${course.slug}`} className="course-card" key={course.slug}>
            <span className="badge">{course.cefr}</span>
            <h2 className="mt-4 text-2xl font-black">{course.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{course.summary}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {course.modules.slice(0,3).map((m: any) => <li key={m.module}>• Module {m.module}: {m.title}</li>)}
            </ul>
          </Link>
        ))}
      </div>
      <pre className="mt-8 overflow-auto rounded-3xl bg-navy p-6 text-xs text-slate-100">{JSON.stringify((curriculum as any).curriculum_principles, null, 2)}</pre>
    </main>
  );
}
