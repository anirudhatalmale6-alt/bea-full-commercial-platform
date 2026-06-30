import Link from 'next/link';
import catalog from '../../../data/course-catalog.json';

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ level?: string; skill?: string; goal?: string }> }) {
  const params = await searchParams;
  const level = params.level;
  const skill = params.skill;
  const courses = (catalog as any[]).filter((course) => (!level || course.cefr === level) && (!skill || course.skills.includes(skill)));
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <Link href="/" className="text-sm font-black text-oxford">← Home</Link>
      <div className="mt-6 rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="badge">Course catalogue</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-navy">English pathways by CEFR level</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Browse structured ESL courses in a course-marketplace layout. Every course connects to the paid placement test, activities library, progress checks and certificate pathway.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {['A1','A2','B1','B2','C1','C2'].map((l) => <Link className="chip" href={`/catalog?level=${l}`} key={l}>{l}</Link>)}
          {['Grammar','Vocabulary','Reading','Listening','Speaking','Writing'].map((s) => <Link className="chip" href={`/catalog?skill=${s}`} key={s}>{s}</Link>)}
        </div>
      </div>
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
