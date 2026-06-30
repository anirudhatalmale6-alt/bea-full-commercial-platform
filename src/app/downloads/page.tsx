import Link from 'next/link';
import assets from '../../../data/downloadables.json';

export default async function DownloadsPage({ searchParams }: { searchParams: Promise<{ level?: string; type?: string }> }) {
  const params = await searchParams;
  const filtered = (assets as any[]).filter((a) => (!params.level || a.cefr === params.level || a.cefr === 'A1-C2') && (!params.type || a.type === params.type));
  return <main className="mx-auto max-w-7xl px-6 py-10"><Link href="/" className="text-sm font-black text-oxford">← Home</Link><section className="card mt-6"><p className="badge">Downloadable learning items</p><h1 className="mt-3 text-5xl font-black text-navy">Printable checklists, writing frames and trackers</h1><p className="mt-3 text-slate-600">Ready-made downloadable items for learners, teachers and institutions.</p><div className="mt-6 flex flex-wrap gap-2">{['A1','A2','B1','B2','C1','C2'].map(l=><Link className="chip" href={`/downloads?level=${l}`} key={l}>{l}</Link>)}</div></section><div className="mt-8 grid gap-5 md:grid-cols-3">{filtered.map((a:any)=><a className="course-card" href={a.href} key={a.id}><span className="badge">{a.type}</span><h2 className="mt-4 text-2xl font-black text-navy">{a.title}</h2><p className="mt-2 text-sm text-slate-600">{a.description}</p><p className="mt-4 font-black text-oxford">Open / download →</p></a>)}</div></main>;
}
