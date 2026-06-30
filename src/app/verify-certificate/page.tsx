'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VerifyCertificatePage() {
  const [id, setId] = useState('');
  function verify() {
    if (!id.trim()) return;
    window.location.href = `/certificate/${encodeURIComponent(id.trim())}`;
  }
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm font-black text-oxford">← Home</Link>
      <section className="card mt-6">
        <p className="badge">Certificate verification</p>
        <h1 className="mt-4 text-4xl font-black text-navy">Verify a British English Academy diagnostic certificate</h1>
        <p className="mt-3 text-slate-600">Enter the certificate ID shown on the candidate’s certificate. The registry confirms the name, CEFR level, issue date and verification hash.</p>
        <input className="input mt-6" value={id} onChange={(e) => setId(e.target.value)} placeholder="Example: LEA-XXXXXXXXXX" />
        <button className="btn-primary mt-4 w-full" onClick={verify}>Verify certificate</button>
        <p className="mt-5 text-xs text-slate-500">This confirms a platform-issued diagnostic certificate only. Acceptance remains subject to the receiving institution’s policy.</p>
      </section>
    </main>
  );
}
