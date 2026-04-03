import crypto from 'crypto';

const SUMSUB_BASE_URL = 'https://api.sumsub.com';
const SUMSUB_LEVEL_NAME = process.env.SUMSUB_LEVEL_NAME || 'basic-kyc-level';

/**
 * Sign a Sumsub API request.
 * https://developers.sumsub.com/api-reference/#app-tokens
 */
function signRequest(method, url, ts, body = '') {
  const secret = process.env.SUMSUB_SECRET_KEY;
  const data = ts + method.toUpperCase() + url + (body ? body : '');
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

async function sumsubRequest(method, path, body = null) {
  const ts = Math.floor(Date.now() / 1000).toString();
  const bodyStr = body ? JSON.stringify(body) : '';
  const signature = signRequest(method, path, ts, bodyStr);

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-App-Token': process.env.SUMSUB_APP_TOKEN,
    'X-App-Access-Ts': ts,
    'X-App-Access-Sig': signature,
  };

  const res = await fetch(`${SUMSUB_BASE_URL}${path}`, {
    method,
    headers,
    body: bodyStr || undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sumsub API error ${res.status}: ${err}`);
  }

  return res.json();
}

/**
 * Create or retrieve a Sumsub applicant for a user.
 * externalUserId should be the HumanLayer user ID.
 */
export async function createApplicant(externalUserId) {
  return sumsubRequest('POST', '/resources/applicants?levelName=${SUMSUB_LEVEL_NAME}', {
    externalUserId,
    type: 'individual',
  });
}

/**
 * Generate a short-lived access token for the Sumsub WebSDK.
 */
export async function generateSdkToken(externalUserId) {
  const path = `/resources/accessTokens?userId=${externalUserId}&levelName=${SUMSUB_LEVEL_NAME}&ttlInSecs=1800`;
  const ts = Math.floor(Date.now() / 1000).toString();
  const signature = signRequest('POST', path, ts);

  const res = await fetch(`${SUMSUB_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-App-Token': process.env.SUMSUB_APP_TOKEN,
      'X-App-Access-Ts': ts,
      'X-App-Access-Sig': signature,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sumsub token error ${res.status}: ${err}`);
  }

  return res.json();
}

/**
 * Verify a Sumsub webhook signature.
 * https://developers.sumsub.com/api-reference/#webhook-security
 */
export function verifyWebhookSignature(rawBody, signature) {
  const expected = crypto
    .createHmac('sha256', process.env.SUMSUB_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
}

/**
 * Map Sumsub review status to our KYCStatus enum.
 */
export function mapSumsubStatus(reviewResult, reviewStatus) {
  if (reviewStatus === 'completed') {
    if (reviewResult?.reviewAnswer === 'GREEN') return 'VERIFIED';
    if (reviewResult?.reviewAnswer === 'RED') return 'REJECTED';
  }
  if (reviewStatus === 'pending' || reviewStatus === 'onHold') return 'PENDING';
  return null;
}
