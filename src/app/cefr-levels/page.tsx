import Link from 'next/link';
import { cefrBandDescription } from '@/lib/cefr';

const levels = ['A1','A2','B1','B2','C1','C2'] as const;

export default function CefrLevelsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <Link href="/" className="text-sm font-black text-oxford">← Home</Link>
      <section className="mt-6 rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="badge">CEFR levels</p>
        <h1 className="mt-4 text-5xl font-black tracking-tight text-navy">A1–C2 English level pathway</h1>
        <p className="mt-3 max-w-3xl text-slate-600">British English Academy maps placement outcomes, courses, lessons, activities and reports to the six CEFR reference levels.</p>
      </section>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {levels.map((level) => <Link href={`/courses?level=${level}`} className="course-card" key={level}><span className="badge">{level}</span><h2 className="mt-4 text-3xl font-black text-navy">CEFR {level}</h2><p className="mt-2 text-slate-600">{cefrBandDescription(level)}</p></Link>)}
      </div>
    </main>
  );
}
