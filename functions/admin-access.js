export const DANA_ADMIN_ID = 'admin_001';
export const DANA_ADMIN_EMAIL = 'admin@hnguyenworks.id.vn';

const SEED_PASSWORD_HASHES = new Set([
  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  'ea554d403eec8485c738aa8ec19bf7a6f5bd229b4b1d0f089a1eae749aff2115',
  'dummy_hash'
]);

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function isLegacyAdminEmail(email) {
  const value = normalizeEmail(email);
  return value.includes('sinhngo110705') || value.includes('vuhoangnguyen3009');
}

export function isDanaAdminEmail(email) {
  return normalizeEmail(email) === DANA_ADMIN_EMAIL;
}

export function isDanaAdminAccount(user) {
  return !!user && (user.id ?? user.user_id) === DANA_ADMIN_ID && isDanaAdminEmail(user.email);
}

export function canBeAdmin(user) {
  return isDanaAdminAccount(user) || isLegacyAdminEmail(user?.email);
}

export function isSeedPasswordHash(hash) {
  return SEED_PASSWORD_HASHES.has(hash);
}
