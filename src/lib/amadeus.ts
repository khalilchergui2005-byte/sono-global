import { db } from '@/lib/db';

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export const AMADEUS_BASE =
  process.env.AMADEUS_ENV === 'production'
    ? 'https://api.amadeus.com'
    : 'https://test.api.amadeus.com';

export async function getAmadeusToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  const [idRow, secretRow] = await Promise.all([
    db.siteConfig.findUnique({ where: { key: 'amadeus_client_id' } }),
    db.siteConfig.findUnique({ where: { key: 'amadeus_client_secret' } }),
  ]);

  const clientId     = idRow?.value?.trim();
  const clientSecret = secretRow?.value?.trim();

  if (!clientId || !clientSecret) {
    throw new Error('Amadeus credentials not configured');
  }

  const res = await fetch(`${AMADEUS_BASE}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Amadeus auth failed: ${err}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = data.access_token;
  tokenExpiry = now + 29 * 60 * 1000;
  return cachedToken;
}