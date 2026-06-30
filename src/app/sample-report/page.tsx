import Link from 'next/link';

const skillRows = [
  ['Reading', 'B2', 'Understands main ideas and supporting detail in extended texts.'],
  ['Listening', 'B1+', 'Follows standard speech on familiar study and workplace topics.'],
  ['Grammar & Vocabulary', 'B2', 'Uses a broad range of structures with generally clear control.'],
  ['Writing/Speaking prompts', 'B1+', 'Can organise ideas but needs stronger accuracy and development.']
];

export default function SampleReportPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/" className="text-sm font-black text-oxford">← Home</Link>
      <section className="card mt-6">
        <p className="badge">Sample score report</p>
        <h1 className="mt-4 text-5xl font-black text-navy">British English Academy CEFR Score Report</h1>
        <p className="mt-3 max-w-3xl text-slate-600">This sample shows the structure of the paid report. A live report is generated only after a paid adaptive placement session.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-skysoft p-6"><b className="text-5xl text-oxford">B2</b><p className="mt-2 text-sm font-bold text-slate-600">Overall CEFR estimate</p></div>
          <div className="rounded-3xl bg-slate-50 p-6"><b className="text-3xl text-navy">0.86</b><p className="mt-2 text-sm font-bold text-slate-600">Theta estimate</p></div>
          <div className="rounded-3xl bg-amber-50 p-6"><b className="text-3xl text-navy">Moderate</b><p className="mt-2 text-sm font-bold text-slate-600">Diagnostic confidence</p></div>
        </div>
        <h2 className="mt-8 text-2xl font-black text-navy">Skill breakdown</h2>
        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200">
          {skillRows.map(([skill, band, note]) => <div key={skill} className="grid gap-2 border-b border-slate-200 p-4 md:grid-cols-[0.6fr_0.3fr_1.4fr]"><b>{skill}</b><span className="font-black text-oxford">{band}</span><span className="text-slate-600">{note}</span></div>)}
        </div>
        <h2 className="mt-8 text-2xl font-black text-navy">Recommended pathway</h2>
        <ul className="mt-3 list-disc pl-6 text-slate-700"><li>B2 Academic and Professional English</li><li>Writing accuracy clinic</li><li>Speaking fluency and presentation module</li></ul>
      </section>
    </main>
  );
}
