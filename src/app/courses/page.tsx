import Link from 'next/link';
import catalog from '../../../data/course-catalog.json';

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ level?: string; skill?: string; q?: string; goal?: string }> }) {
  const params = await searchParams;
  const level = params.level;
  const skill = params.skill;
  const q = params.q?.toLowerCase();
  const courses = (catalog as any[]).filter((course) => {
    const levelMatch = !level || course.cefr === level;
    const skillMatch = !skill || course.skills.map((s: string) => s.toLowerCase()).includes(skill.toLowerCase());
    const qMatch = !q || `${course.title} ${course.summary} ${course.skills.join(' ')}`.toLowerCase().includes(q);
    return levelMatch && skillMatch && qMatch;
  });
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <Link href="/" className="text-sm font-black text-oxford">← Home</Link>
      <section className="mt-6 rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="badge">Course marketplace</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-navy">Browse British English Academy courses</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Explore structured CEFR pathways, then take the paid placement test to unlock the correct starting level.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {['A1','A2','B1','B2','C1','C2'].map((l) => <Link className="chip" href={`/courses?level=${l}`} key={l}>{l}</Link>)}
          {['Speaking','Listening','Reading','Writing','Grammar','Vocabulary'].map((s) => <Link className="chip" href={`/courses?skill=${s}`} key={s}>{s}</Link>)}
        </div>
      </section>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {courses.map((course: any) => (
          <Link href={`/courses/${course.slug}`} className="course-card" key={course.slug}>
            <div className="flex items-center justify-between"><span className="badge">{course.cefr}</span><span className="text-sm font-black text-slate-500">{course.lessons} lessons</span></div>
            <h2 className="mt-4 text-2xl font-black tracking-tight">{course.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{course.summary}</p>
            <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">{course.assessment}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
