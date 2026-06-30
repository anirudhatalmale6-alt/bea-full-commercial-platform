import { query } from './db';
export async function auditLog(input:{actorUserId?:string|null; action:string; entityType?:string; entityId?:string; metadata?:Record<string,unknown>}){
  await query(`INSERT INTO bea_audit_logs (actor_user_id, action, entity_type, entity_id, metadata) VALUES ($1,$2,$3,$4,$5::jsonb)`, [input.actorUserId ?? null, input.action, input.entityType ?? null, input.entityId ?? null, JSON.stringify(input.metadata ?? {})]);
}
