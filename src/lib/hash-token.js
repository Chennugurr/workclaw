export function hashToken(token) {
  return new Bun.CryptoHasher('sha256').update(token).digest('hex');
}
