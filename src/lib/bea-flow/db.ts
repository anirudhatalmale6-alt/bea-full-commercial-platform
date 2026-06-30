import { Pool, type QueryResultRow } from 'pg';
const g = globalThis as unknown as { beaPgPool?: Pool };
export const beaPool = g.beaPgPool ?? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL==='true' ? { rejectUnauthorized:false } : undefined });
if (process.env.NODE_ENV !== 'production') g.beaPgPool = beaPool;
export async function query<T extends QueryResultRow = QueryResultRow>(sql:string, params:unknown[]=[]){ return beaPool.query<T>(sql, params); }
export async function one<T extends QueryResultRow = QueryResultRow>(sql:string, params:unknown[]=[]){ const r = await query<T>(sql, params); return r.rows[0] ?? null; }
