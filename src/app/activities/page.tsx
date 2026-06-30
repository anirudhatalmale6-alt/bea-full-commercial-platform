import activities from '../../../data/activity-library.json';
import Link from 'next/link';

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<{ level?: string; skill?: string; type?: string }> }) {
  const params = await searchParams;
  const level = params.level;
  const skill = params.skill;
  const type = params.type;
  const filtered = (activities as any[]).filter((a) => (!level || a.cefr === level) && (!skill || a.skill === skill) && (!type || a.type === type)).slice(0, 72);
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="badge">Interactive activity library</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-navy">Games, activities, lessons and worksheets</h1>
        <p className="mt-3 max-w-3xl text-slate-600">A SplashLearn/Starfall-inspired library architecture for ESL: explore by CEFR level, skill, topic and activity type. The content is original and ready for teachers and learners.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {['A1','A2','B1','B2','C1','C2'].map((l) => <Link className="chip" href={`/activities?level=${l}`} key={l}>{l}</Link>)}
          {['Game','Activity','Lesson','Worksheet','Story','Speaking Quest'].map((t) => <Link className="chip" href={`/activities?type=${encodeURIComponent(t)}`} key={t}>{t}</Link>)}
          {['Grammar','Vocabulary','Reading','Listening','Speaking','Writing'].map((s) => <Link className="chip" href={`/activities?skill=${s}`} key={s}>{s}</Link>)}
        </div>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {filtered.map((activity: any) => (
          <article className="star-card" key={activity.id}>
            <div className="flex items-center justify-between"><span className="badge">{activity.cefr}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">{activity.points} pts</span></div>
            <h2 className="mt-4 text-xl font-black tracking-tight">{activity.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{activity.studentGoal}</p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm"><b>Game loop:</b> {activity.gameLoop.join(' → ')}</div>
            <details className="mt-3 text-sm text-slate-600"><summary className="cursor-pointer font-black text-oxford">Teacher setup and differentiation</summary><p className="mt-2">{activity.teacherSetup}</p><p className="mt-2"><b>Support:</b> {activity.differentiation.support}</p><p><b>Challenge:</b> {activity.differentiation.challenge}</p></details>
          </article>
        ))}
      </div>
    </main>
  );
}
