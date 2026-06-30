import { Pool, type QueryResultRow } from 'pg';
const g = globalThis as unknown as { beaPgPool?: Pool };
if (!g.beaPgPool) {
  g.beaPgPool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL==='true' ? { rejectUnauthorized:false } : undefined });
  g.beaPgPool.on('connect', (client) => { client.query('SET search_path TO bea, public'); });
}
export const beaPool = g.beaPgPool;
export async function query<T extends QueryResultRow = QueryResultRow>(sql:string, params:unknown[]=[]){ return beaPool.query<T>(sql, params); }
export async function one<T extends QueryResultRow = QueryResultRow>(sql:string, params:unknown[]=[]){ const r = await query<T>(sql, params); return r.rows[0] ?? null; }
