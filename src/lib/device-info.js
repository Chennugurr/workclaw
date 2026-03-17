import UAParser from 'ua-parser-js';

export function getDeviceInfo(req) {
  const userAgent = req.headers.get('user-agent');
  const parser = new UAParser(userAgent);
  const parsedResult = parser.getResult();

  return {
    browser: {
      name: parsedResult.browser.name,
      version: parsedResult.browser.version,
    },
    os: {
      name: parsedResult.os.name,
      version: parsedResult.os.version,
    },
    device: parsedResult.device.type || 'desktop',
    screenResolution:
      req.headers.get('sec-ch-viewport-width') &&
      req.headers.get('sec-ch-viewport-height')
        ? `${req.headers.get('sec-ch-viewport-width')}x${req.headers.get('sec-ch-viewport-height')}`
        : 'unknown',
    language: req.headers.get('accept-language') || 'unknown',
  };
}
