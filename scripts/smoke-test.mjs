const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const res = await fetch(`${base}/api/health`);
if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
console.log(await res.json());
