import crypto from 'crypto';

export function certificateId(): string {
  return `LEA-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
}

export function certificateHash(input: { userId: string; sessionId: string; cefrLevel: string; issuedAt: string }): string {
  const key = process.env.CERTIFICATE_SIGNING_KEY;
  if (!key) throw new Error('CERTIFICATE_SIGNING_KEY missing');
  return crypto
    .createHmac('sha256', key)
    .update(`${input.userId}:${input.sessionId}:${input.cefrLevel}:${input.issuedAt}`)
    .digest('hex');
}
