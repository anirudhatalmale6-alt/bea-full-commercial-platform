import Link from 'next/link';

const validity = [
  ['Purpose definition', 'The test is designed for placement, learning pathway recommendation and platform diagnostic certification. It is not positioned as an official immigration, university-admission or government qualification until an institution accepts it.'],
  ['CEFR relationship', 'Items, score bands, report language and course recommendations are mapped to A1-C2 can-do outcomes across reading, listening, grammar/vocabulary, speaking prompts and writing prompts.'],
  ['Scoring model', 'Objective items use adaptive IRT routing and theta-to-CEFR banding; productive skills can be added through rubric-based teacher or AI-assisted scoring.'],
  ['Fairness', 'Items should be reviewed for bias, accessibility, cultural load, item exposure and differential performance across learner groups.'],
  ['Evidence plan', 'The platform includes a validation roadmap: pilot testing, item calibration, reliability checks, standard error reporting, external benchmark studies and annual review.']
];

export default function FitnessForPurposePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="rounded-[2.25rem] bg-navy p-8 text-white md:p-12">
        <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">Fitness for purpose · CEFR relationship</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight">How British English Academy connects placement scores to CEFR learning decisions</h1>
        <p className="mt-4 max-w-3xl text-slate-200">This page explains the intended use, CEFR alignment, evidence requirements and limitations of the British English Academy placement test and platform certificate.</p>
        <div className="mt-6 flex flex-wrap gap-3"><Link className="btn-primary bg-gold text-navy" href="/placement-test">Check Your English Level</Link><Link className="btn-secondary border-white/30 bg-white/10 text-white" href="/curriculum">View curriculum map</Link></div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {validity.map(([title, body]) => (
          <article className="card" key={title}>
            <h2 className="text-2xl font-black text-navy">{title}</h2>
            <p className="mt-3 text-slate-600">{body}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-[2rem] bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-black text-navy">Certificate wording for ethical deployment</h2>
        <p className="mt-3 text-slate-600">The certificate should say: “This British English Academy diagnostic certificate reports the candidate’s assessed CEFR band for platform placement and learning-pathway purposes. Acceptance is subject to the receiving institution’s own policy.”</p>
        <div className="mt-6 grid gap-3 md:grid-cols-6">
          {['A1','A2','B1','B2','C1','C2'].map((level) => <div className="rounded-2xl bg-slate-50 p-4 text-center" key={level}><b className="text-3xl text-oxford">{level}</b><p className="text-xs font-bold text-slate-500">report band</p></div>)}
        </div>
      </section>
    </main>
  );
}
