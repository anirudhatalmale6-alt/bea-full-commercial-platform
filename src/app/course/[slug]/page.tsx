import Link from 'next/link';
import { notFound } from 'next/navigation';
import catalog from '../../../../data/course-catalog.json';

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = (catalog as any[]).find((item) => item.slug === slug);
  if (!course) return notFound();
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/courses" className="text-sm font-black text-oxford">← Back to catalogue</Link>
      <section className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card">
          <span className="badge">{course.cefr} · {course.levelLabel}</span>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-navy">{course.title}</h1>
          <p className="mt-4 text-lg text-slate-600">{course.summary}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-blue-50 p-4"><b>{course.duration}</b><p className="text-sm text-slate-500">course duration</p></div>
            <div className="rounded-2xl bg-amber-50 p-4"><b>{course.lessons}</b><p className="text-sm text-slate-500">lessons</p></div>
            <div className="rounded-2xl bg-emerald-50 p-4"><b>{course.activities}</b><p className="text-sm text-slate-500">activities</p></div>
          </div>
          <h2 className="mt-8 text-2xl font-black">Modules</h2>
          <div className="mt-4 grid gap-3">
            {course.modules.map((module: any) => (
              <div className="rounded-2xl border border-slate-200 p-4" key={module.module}>
                <b>Module {module.module}: {module.title}</b>
                <p className="mt-1 text-sm text-slate-600">{module.outcome}</p>
                <div className="mt-3 flex flex-wrap gap-2">{module.lessonTypes.map((type: string) => <span key={type} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{type}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
        <aside className="card h-max">
          <h2 className="text-2xl font-black">Start correctly</h2>
          <p className="mt-2 text-slate-600">Candidates should take the adaptive placement test before entering this pathway.</p>
          <Link href="/checkout/placement" className="btn-primary mt-5 w-full">Take placement test</Link>
          <Link href={`/activities?level=${course.cefr}`} className="btn-secondary mt-3 w-full">View {course.cefr} activities</Link>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600"><b>Certificate pathway:</b><br/>{course.certificatePathway}</div>
        </aside>
      </section>
    </main>
  );
}
