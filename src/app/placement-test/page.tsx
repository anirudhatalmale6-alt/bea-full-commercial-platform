'use client';

import { useEffect, useState } from 'react';

type Item = {
  id: string;
  content: { stem: string; options: string[]; correctIndex?: number; rationale?: string };
  difficulty: number;
  discrimination: number;
  guessing: number;
};

type HistoryItem = { itemId: string; difficulty: number; discrimination: number; guessing: number; isCorrect: boolean };

export default function PlacementTestPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [message, setMessage] = useState('Register to start. The live pathway uses Stripe paid access before the adaptive test opens.');
  const [cefr, setCefr] = useState('B1');
  const [completeUrl, setCompleteUrl] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutSessionId = params.get('session_id');
    if (!checkoutSessionId) return;
    (async () => {
      setMessage('Checking paid access...');
      const res = await fetch('/api/placement/unlock', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checkoutSessionId })
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || 'Payment not confirmed yet.'); return; }
      if (data.status === 'COMPLETE') { setCompleteUrl(data.reportUrl); return; }
      setSessionId(data.sessionId);
      setItem(data.nextItem);
      setMessage(data.message || 'Paid access confirmed.');
    })();
  }, []);

  useEffect(() => {
    if (!completeUrl) return;
    window.BEAAgent?.event('postTest', { courseId: 'bea-b1-independent', level: cefr });
  }, [cefr, completeUrl]);

  async function startDemo() {
    const res = await fetch('/api/placement/start', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, fullName, demoAccess: true })
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Unable to start'); return; }
    setSessionId(data.sessionId);
    setItem(data.nextItem);
    setMessage(data.message || 'Adaptive test started.');
  }

  async function payAndUnlock() {
    const res = await fetch('/api/checkout/test', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, fullName })
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Unable to create checkout.'); return; }
    window.location.href = data.checkoutUrl;
  }

  async function answer(choiceIndex: number) {
    if (!item || !sessionId) return;
    const res = await fetch('/api/placement/answer', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, itemId: item.id, choiceIndex, clientHistory: history })
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Unable to submit answer'); return; }
    setCefr(data.cefrLevel);
    setHistory(data.history || history);
    if (data.status === 'COMPLETE') {
      setItem(null);
      setCompleteUrl(data.reportUrl);
      setMessage('Test complete. Your score report and certificate are ready.');
    } else {
      setItem(data.nextItem);
      setMessage(`${data.cefrLevel} estimate · SEM ${data.standardError} · ${data.itemsAnswered} items answered`);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <a href="/" className="text-sm font-semibold text-oxford">← Home</a>
      <div className="mt-6 grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
        <section className="card">
          <h1 className="text-3xl font-black">Check Your English Level</h1>
          <p className="mt-2 text-slate-600">The adaptive engine estimates your CEFR level, then unlocks a score report, course pathway and verifiable diagnostic certificate.</p>
          <label className="mt-5 block text-sm font-bold">Full name</label>
          <input className="mt-1 w-full rounded-xl border p-3" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Candidate name" />
          <label className="mt-4 block text-sm font-bold">Email</label>
          <input className="mt-1 w-full rounded-xl border p-3" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="candidate@example.com" />
          <button className="btn-primary mt-5 w-full" onClick={payAndUnlock}>Check Your English Level</button>
          <button className="btn-secondary mt-3 w-full" onClick={startDemo}>Start local demo only</button>
          <p className="mt-5 rounded-2xl bg-skysoft p-4 text-sm text-oxford">Current estimate: <b>{cefr}</b><br/>{message}</p>
        </section>
        <section className="card">
          {!item && !completeUrl && <div><h2 className="text-2xl font-bold">Ready when you are</h2><p className="mt-2 text-slate-600">Register and pay to unlock the adaptive test. The first item begins near B1/B2 and adjusts quickly.</p></div>}
          {item && <div>
            <div className="mb-4 flex items-center justify-between"><span className="badge">Question {history.length + 1}</span><span className="text-sm text-slate-500">Adaptive item</span></div>
            <h2 className="text-2xl font-bold">{item.content.stem}</h2>
            <div className="mt-6 grid gap-3">
              {item.content.options.map((option, index) => <button key={option} onClick={() => answer(index)} className="rounded-2xl border p-4 text-left font-semibold hover:bg-slate-100">{String.fromCharCode(65 + index)}. {option}</button>)}
            </div>
          </div>}
          {completeUrl && <div>
            <h2 className="text-3xl font-black text-oxford">Placement complete</h2>
            <p className="mt-2 text-slate-600">Open the report to view CEFR result, diagnostic confidence, recommended course pathway and certificate.</p>
            <a href={completeUrl} className="btn-primary mt-6">Open score report</a>
          </div>}
        </section>
      </div>
    </main>
  );
}
