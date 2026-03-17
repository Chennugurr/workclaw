const alphabet = `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`;
const base = BigInt(alphabet.length);

export function nanoIdToInt(id) {
  let value = 0n;
  for (let i = 0; i < id.length; i++) {
    value = value * base + BigInt(alphabet.indexOf(id[i]));
  }
  return value;
}

export function intToNanoId(value) {
  let id = '';
  while (value > 0n) {
    id = alphabet[Number(value % base)] + id;
    value = value / base;
  }
  return id || alphabet[0];
}
