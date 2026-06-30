import Link from 'next/link';

async function getCertificate(certificateId: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/certificate/${certificateId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function CertificatePage({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = await params;
  const cert = await getCertificate(certificateId);
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/" className="text-sm font-semibold text-oxford">← Home</Link>
      <section className="mt-6 rounded-[2rem] border-4 border-navy bg-white p-10 text-center shadow-sm">
        {!cert && <><h1 className="text-3xl font-black">Certificate not found</h1><p className="mt-2 text-slate-600">The verification ID was not found in the certificate registry.</p></>}
        {cert && <>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-oxford">British English Academy</p>
          <h1 className="mt-4 text-5xl font-black">Certificate of English Level</h1>
          <p className="mt-5 text-xl">This verifies that</p>
          <p className="mt-2 text-3xl font-black text-navy">{cert.fullName}</p>
          <p className="mt-5 text-xl">completed the British English Academy Adaptive CEFR Placement Test and was placed at</p>
          <p className="mt-4 text-6xl font-black text-oxford">CEFR {cert.cefrLevel}</p>
          <p className="mt-5 text-sm text-slate-500">Certificate ID: {certificateId}<br/>Issued: {new Date(cert.issuedAt).toLocaleString()}<br/>Verification hash: {cert.verificationSha.slice(0, 24)}…</p>
          <p className="mt-8 text-xs text-slate-500">Platform-issued diagnostic certificate. Institutional acceptance depends on each receiving organisation and on any future independent validation or accreditation.</p>
        </>}
      </section>
    </main>
  );
}
