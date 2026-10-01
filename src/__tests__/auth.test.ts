import { describe, it, expect, vi } from 'vitest';
import { checkActionAllowed, isSuperAdmin, SUPER_ADMIN_EMAIL } from '../services/auth';
import { hashPassword, verifyPassword, signSessionToken, verifySessionToken, getRequesterSession, checkRateLimit } from '../../api/_security';

describe('Auth & Role Security Tests', () => {
  it('correctly identifies super admin by role or isSuperAdmin flag', () => {
    expect(isSuperAdmin({
      id: 'admin-1',
      email: SUPER_ADMIN_EMAIL,
      name: 'Admin',
      role: 'admin',
      subscriptionTier: 'pro',
      isSuperAdmin: true,
      isBanned: false,
      createdAt: '2026-01-01',
      usageStats: { searchesCount: 0, recalculationsCount: 0 }
    })).toBe(true);

    expect(isSuperAdmin({
      id: 'customer-1',
      email: 'student@example.com',
      name: 'Student',
      role: 'customer',
      subscriptionTier: 'free',
      isBanned: false,
      createdAt: '2026-01-01',
      usageStats: { searchesCount: 0, recalculationsCount: 0 }
    })).toBe(false);

    expect(isSuperAdmin(null)).toBe(false);
  });

  it('does not block an admin with an old exhausted search quota', () => {
    const values = new Map<string, string>();
    const admin = {
      id: 'user-admin-01', email: SUPER_ADMIN_EMAIL, name: 'Admin', role: 'admin',
      subscriptionTier: 'pro', isSuperAdmin: true, isBanned: false,
      createdAt: '2026-01-01', usageStats: { searchesCount: 99, recalculationsCount: 99 }
    };
    values.set('admitroute_auth_user_v1', JSON.stringify(admin));
    values.set('admitroute_users_db_v1', JSON.stringify([admin]));
    values.set('admitroute_ai_search_quota_v1', JSON.stringify({
      [admin.id]: { used: 2, max: 2, remaining: 0, resetsAt: '2099-01-01T00:00:00.000Z' }
    }));
    vi.stubGlobal('window', { dispatchEvent: vi.fn() });
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); }
    });
    try {
      expect(checkActionAllowed('search').allowed).toBe(true);
      expect(checkActionAllowed('recalculation').allowed).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('securely hashes and verifies passwords using PBKDF2 with salt', () => {
    const rawPass = 'SecretPassword2026!';
    const hash = hashPassword(rawPass);

    expect(hash).toContain('pbkdf2$sha256$100000$');
    expect(verifyPassword(rawPass, hash)).toBe(true);
    expect(verifyPassword('WrongPassword123', hash)).toBe(false);
  });

  it('generates different hashes for the same password due to random salting', () => {
    const pass = 'IdenticalPassword123';
    const hash1 = hashPassword(pass);
    const hash2 = hashPassword(pass);

    expect(hash1).not.toBe(hash2);
    expect(verifyPassword(pass, hash1)).toBe(true);
    expect(verifyPassword(pass, hash2)).toBe(true);
  });

  it('accepts a valid session cookie when a stale bearer token is present', () => {
    const token = signSessionToken({
      userId: 'admin-1', email: SUPER_ADMIN_EMAIL, role: 'admin', isSuperAdmin: true
    });
    const session = getRequesterSession({ headers: {
      authorization: 'Bearer expired-token', cookie: `admitroute_token=${encodeURIComponent(token)}`
    } });
    expect(session?.userId).toBe('admin-1');
    expect(session?.role).toBe('admin');
  });

  it('signs and verifies session tokens securely with HMAC-SHA256', () => {
    const payload = {
      userId: 'user-uuid-1234',
      email: 'test@admitroute.kz',
      role: 'customer' as const,
      isSuperAdmin: false
    };

    const token = signSessionToken(payload, 3600);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const verified = verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe('user-uuid-1234');
    expect(verified?.email).toBe('test@admitroute.kz');
    expect(verified?.role).toBe('customer');

    // Tampered token must fail verification
    const tampered = token.slice(0, -4) + 'abcd';
    expect(verifySessionToken(tampered)).toBeNull();
  });

  it('rate limiter enforces sliding window request limits', () => {
    const testIp = '192.168.1.100';
    // Max 3 requests in 1000ms
    expect(checkRateLimit(testIp, 3, 1000)).toBe(true);
    expect(checkRateLimit(testIp, 3, 1000)).toBe(true);
    expect(checkRateLimit(testIp, 3, 1000)).toBe(true);
    // 4th request must be blocked
    expect(checkRateLimit(testIp, 3, 1000)).toBe(false);
  });
});
