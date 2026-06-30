import { NextRequest } from 'next/server';
export type CurrentUser = { id:string; role:string; email?:string };
export async function getCurrentUser(req:NextRequest):Promise<CurrentUser|null>{
  const id = req.headers.get('x-bea-user-id') || req.cookies.get('bea_user_id')?.value;
  if(!id) return null;
  return { id, role:req.headers.get('x-bea-role') || req.cookies.get('bea_role')?.value || 'learner', email:req.headers.get('x-bea-email') || undefined };
}
export function requireRole(user:CurrentUser|null, roles:string[]){ if(!user) throw new Error('AUTH_REQUIRED'); if(!roles.includes(user.role)) throw new Error('FORBIDDEN'); return user; }
