import bs58 from 'bs58';
import nacl from 'tweetnacl';

function generateNonce() {
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto !== 'undefined') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    // Node.js fallback
    const { randomBytes } = require('crypto');
    const buf = randomBytes(16);
    bytes.set(buf);
  }
  return btoa(String.fromCharCode(...bytes));
}

function toBase64(str) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64');
  }
  return btoa(str);
}

function fromBase64(b64) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64, 'base64').toString('utf8');
  }
  return atob(b64);
}

export class SiwsMessage {
  constructor({ domain, address, statement, message, signature } = {}) {
    this.domain = domain;
    this.address = address;
    this.statement = statement;
    this.message = message;
    this.signature = signature;
  }

  prepare() {
    const nonce = generateNonce();
    const timestamp = new Date();
    const message = `${this.domain} wants you to sign in with your Solana account:\n${this.address}\n\n${this.statement}.\n\nNonce: ${nonce}\nIssued At: ${timestamp}`;
    this.message = message;
    return new TextEncoder().encode(message);
  }

  token(signature) {
    this.signature = bs58.encode(signature);
    return toBase64(JSON.stringify(this));
  }

  decode(token) {
    const siwsMessage = JSON.parse(fromBase64(token));
    this.domain = siwsMessage.domain;
    this.address = siwsMessage.address;
    this.statement = siwsMessage.statement;
    this.signature = siwsMessage.signature;
    this.message = siwsMessage.message;
    return this;
  }

  validate() {
    const messageBytes = new TextEncoder().encode(this.message);
    const publicKeyBytes = bs58.decode(this.address);
    const signatureBytes = bs58.decode(this.signature);
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  }
}
