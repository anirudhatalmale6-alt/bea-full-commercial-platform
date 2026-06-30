import Link from 'next/link';

async function getReport(sessionId: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/report/${sessionId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function ReportPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const report = await getReport(sessionId);
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/" className="text-sm font-semibold text-oxford">← Home</Link>
      {!report && <div className="card mt-6"><h1 className="text-3xl font-black">Report not found</h1></div>}
      {report && <div className="card mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="badge">Score Report</p><h1 className="mt-3 text-4xl font-black">CEFR {report.cefrLevel}</h1></div><div className="text-right text-sm text-slate-500">Theta {report.theta}<br/>SEM {report.standardError}</div></div>
        <p className="mt-5 text-lg text-slate-700">{report.summary}</p>
        <div className="mt-6 rounded-2xl bg-skysoft p-5"><b>{report.confidence}</b><p className="mt-1 text-sm text-oxford">Accuracy: {report.accuracy}%</p></div>
        <h2 className="mt-8 text-2xl font-bold">Recommended course pathway</h2>
        <ul className="mt-3 list-disc pl-6 text-slate-700">{report.recommendedPath.map((p: string) => <li key={p}>{p}</li>)}</ul>
        {report.certificateId && <a className="btn-primary mt-8" href={`/certificate/${report.certificateId}`}>Verify certificate</a>}
        <p className="mt-6 text-xs text-slate-500">{report.limitations}</p>
      </div>}
    </main>
  );
}
