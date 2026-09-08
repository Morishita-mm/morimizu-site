import { createRemoteJWKSet, jwtVerify } from 'jose';
import { digest } from './store.mjs';

export async function secretMatches(value, expected) {
  if (!value || !expected || expected.length < 32) return false;
  // Constant-length digests and a timing-safe comparison on Workers and Node.
  const { timingSafeEqual } = await import('node:crypto');
  return timingSafeEqual(
    Buffer.from(await digest(value)),
    Buffer.from(await digest(expected)),
  );
}
export async function isAdmin(request, env) {
  // Local testing uses the same JWT validation as production, with a local JWKS
  // resolver supplied by the test harness. There is no deployed auth bypass.
  if (
    !env.JOURNAL_ACCESS_TEAM ||
    !env.JOURNAL_ACCESS_AUD ||
    !env.JOURNAL_ADMIN_EMAIL
  )
    return false;
  if (
    !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(
      env.JOURNAL_ACCESS_TEAM,
    )
  )
    return false;
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return false;
  try {
    const keys = createRemoteJWKSet(
      new URL(`${env.JOURNAL_ACCESS_TEAM}/cdn-cgi/access/certs`),
    );
    const { payload } = await jwtVerify(token, keys, {
      issuer: env.JOURNAL_ACCESS_TEAM,
      audience: env.JOURNAL_ACCESS_AUD,
      algorithms: ['RS256'],
      requiredClaims: ['exp', 'iat', 'email', 'sub'],
    });
    return payload.type === 'app' && payload.email === env.JOURNAL_ADMIN_EMAIL;
  } catch {
    return false;
  }
}
