import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';

export type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

// 1. Sliding Window In-Memory Rate Limiter
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(ip: string, maxRequests: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { timestamps: [] };

  // Prune timestamps outside current sliding window
  record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    return false; // Rate limit exceeded
  }

  record.timestamps.push(now);
  rateLimitMap.set(ip, record);

  // Periodic cleanup if map grows large
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.timestamps.length === 0 || now - value.timestamps[value.timestamps.length - 1] > windowMs) {
        rateLimitMap.delete(key);
      }
    }
  }

  return true;
}

export function getClientIp(req: RequestLike): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].split(',')[0].trim();
  }
  const realIp = req.headers?.['x-real-ip'];
  if (typeof realIp === 'string') return realIp.trim();
  return '127.0.0.1';
}

// 2. Strict CORS Helper
export function applyCors(req: RequestLike, res: ResponseLike): boolean {
  const rawOrigin = req.headers?.['origin'] || req.headers?.['Origin'];
  const origin = Array.isArray(rawOrigin) ? rawOrigin[0] : (rawOrigin || '');

  // Whitelist: same-origin, localhost / 127.0.0.1, or Vercel preview/production domains
  const isAllowed =
    !origin ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:') ||
    origin.endsWith('.vercel.app') ||
    origin === 'https://admitroute.kz' ||
    origin === 'https://www.admitroute.kz';

  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.status(200).json({ ok: true });
    return true;
  }
  return false;
}

// 3. Cryptographically Strong Password Hashing (PBKDF2-SHA256 with 16-byte Salt)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 100000;
  const keyLength = 64;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256').toString('hex');
  return `pbkdf2$sha256$${iterations}$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;

  // Modern salted hash
  if (stored.startsWith('pbkdf2$sha256$')) {
    const parts = stored.split('$');
    if (parts.length !== 5) return false;
    const iterations = parseInt(parts[2], 10);
    const salt = parts[3];
    const expectedHash = parts[4];

    const testHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha256').toString('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(expectedHash, 'hex'));
    } catch {
      return false;
    }
  }

  // Legacy plain-text fallback comparison (timing safe)
  try {
    const bufA = Buffer.from(password);
    const bufB = Buffer.from(stored);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return password === stored;
  }
}

// 4. Session Tokens (HMAC-SHA256 Signed Session Token)
export interface SessionPayload {
  userId: string;
  email: string;
  role: 'admin' | 'customer' | 'guest';
  isSuperAdmin?: boolean;
  exp: number; // Unix timestamp in seconds
}

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'admitroute_secure_default_session_secret_2026_xyz';
}

export function signSessionToken(data: Omit<SessionPayload, 'exp'>, expiresInSeconds: number = 86400 * 7): string {
  const payload: SessionPayload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  };

  const headerB64 = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  return `${headerB64}.${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getJwtSecret())
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  try {
    const isSigValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
    if (!isSigValid) return null;

    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson) as SessionPayload;

    if (!payload || typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired or malformed
    }
    return payload;
  } catch {
    return null;
  }
}

export function getRequesterSession(req: RequestLike): SessionPayload | null {
  const authHeader = req.headers?.['authorization'] || req.headers?.['Authorization'];
  let token = '';

  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    const customHeader = req.headers?.['x-session-token'];
    if (typeof customHeader === 'string') token = customHeader.trim();
  }

  if (!token) return null;
  return verifySessionToken(token);
}

// 5. Parameterized Database Connection (Neon Serverless)
export function getDb() {
  const connString = process.env.DATABASE_URL;
  if (!connString) {
    throw new Error('DATABASE_URL environment variable is not configured on the server.');
  }
  return neon(connString);
}

// 6. Have I Been Pwned (HIBP) k-Anonymity Leak Check
export async function checkPasswordBreach(password: string): Promise<boolean> {
  if (!password || password.length < 4) return false;

  try {
    const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1.substring(0, 5);
    const suffix = sha1.substring(5);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'User-Agent': 'AdmitRoute-Security-Validator' },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) return false;
    const body = await res.text();
    const lines = body.split('\n');

    for (const line of lines) {
      const [hashSuffix] = line.split(':');
      if (hashSuffix && hashSuffix.trim().toUpperCase() === suffix) {
        return true; // Password found in breach database!
      }
    }
    return false;
  } catch {
    // Fail safely without blocking legitimate users if external API is unreachable
    return false;
  }
}

// 7. Safe Error Handling without Stack Trace Leaks
export function sendSanitizedError(res: ResponseLike, error: unknown, statusCode: number = 500, publicMessage?: string) {
  console.error('[AdmitRoute Server Error]:', error);
  return res.status(statusCode).json({
    error: publicMessage || 'Внутренняя ошибка сервера. Обратитесь к администратору.'
  });
}
