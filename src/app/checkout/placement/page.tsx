'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CheckoutPlacementPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('Enter candidate details to create a secure Stripe checkout session.');
  const [loading, setLoading] = useState(false);

  async function beginCheckout() {
    setLoading(true);
    setMessage('Creating secure checkout...');
    try {
      const res = await fetch('/api/checkout/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Checkout could not be created.');
        return;
      }
      window.location.href = data.checkoutUrl;
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/" className="text-sm font-black text-oxford">← Home</Link>
      <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-navy p-8 text-white">
          <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">Paid CEFR Placement Test</p>
          <h1 className="mt-5 text-5xl font-black tracking-tight">Unlock the British English Academy placement test.</h1>
          <p className="mt-4 text-slate-200">Payment unlocks the adaptive test session, score report, CEFR band, recommended course pathway and diagnostic certificate.</p>
          <div className="mt-6 grid gap-3 text-sm font-bold">
            <div className="rounded-2xl bg-white/10 p-4">A1–C2 CEFR placement band</div>
            <div className="rounded-2xl bg-white/10 p-4">Adaptive item routing</div>
            <div className="rounded-2xl bg-white/10 p-4">Score report and verifiable certificate</div>
            <div className="rounded-2xl bg-white/10 p-4">Recommended paid course pathway</div>
          </div>
        </div>
        <div className="card">
          <h2 className="text-3xl font-black text-navy">Candidate details</h2>
          <label className="mt-6 block text-sm font-black">Full name</label>
          <input className="input mt-2" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Candidate full name" />
          <label className="mt-4 block text-sm font-black">Email address</label>
          <input className="input mt-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="candidate@example.com" />
          <button disabled={loading} onClick={beginCheckout} className="btn-primary mt-6 w-full disabled:opacity-60">{loading ? 'Creating checkout...' : 'Pay and unlock placement test'}</button>
          <Link href="/placement-test" className="btn-secondary mt-3 w-full">Open placement-test page</Link>
          <p className="mt-5 rounded-2xl bg-skysoft p-4 text-sm font-semibold text-oxford">{message}</p>
        </div>
      </section>
    </main>
  );
}
