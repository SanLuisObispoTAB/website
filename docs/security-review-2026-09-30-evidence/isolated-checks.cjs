// Isolated security checks. All fetch calls are mocked; no real services are used.
// Usage: node slotab-security-checks.cjs /path/to/review-copy-with-node_modules
const path = require('node:path');
const fs = require('node:fs');
const { createHmac } = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(process.argv[2]);
const ts = require(path.join(root, 'node_modules/typescript'));
const Module = require('node:module');
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (request.startsWith('.') && parent?.filename && !path.extname(request)) {
    const candidate = path.resolve(path.dirname(parent.filename), request);
    for (const ext of ['.ts', '.tsx']) {
      if (fs.existsSync(candidate + ext)) return resolveFilename.call(this, candidate + ext, parent, ...rest);
    }
  }
  return resolveFilename.call(this, request, parent, ...rest);
};
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
        esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
      fileName: filename,
    });
    module._compile(compiled.outputText, filename);
  };
}
const read = p => require(path.join(root, p));
const results = [];
const record = (check, evidence) => results.push({ check, ...evidence });
global.fetch = async () => { throw new Error('External network disabled by review harness'); };
Object.assign(process.env, {
  NODE_ENV: 'production', BOARD_PASSWORD: 'synthetic-review-password',
  SITE_URL: 'https://slotab.org', GITHUB_TOKEN: 'synthetic-github-token',
  GITHUB_REPO: 'review-fixture/website', GITHUB_BRANCH: 'main',
  SQUARE_ACCESS_TOKEN: 'synthetic-square-token', SQUARE_LOCATION_ID: 'review-location',
  SQUARE_ENVIRONMENT: 'sandbox', SQUARE_WEBHOOK_SIGNATURE_KEY: 'synthetic-signature-key',
  SQUARE_WEBHOOK_URL: 'https://slotab.org/api/square/webhook',
  RESEND_API_KEY: 'synthetic-resend-key', EMAIL_FROM: 'review@example.invalid',
  DONATION_NOTIFICATION_EMAIL: 'review@example.invalid', SPONSOR_FULFILMENT_EMAIL: 'review@example.invalid',
});

(async () => {
  const auth = read('src/lib/board-auth.ts');
  const { NextRequest } = read('node_modules/next/server.js');
  const cookie = await auth.makeBoardCookieValue(process.env.BOARD_PASSWORD);
  assert.equal(await auth.isBoardCookieValid(cookie, process.env.BOARD_PASSWORD), true);
  const logout = await read('src/app/api/board/logout/route.ts').POST();
  const replayAccepted = await auth.requestHasBoardSession(new Request('https://slotab.org/api/board/square-report', {
    headers: { cookie: `slotab_board=${cookie}` },
  }));
  assert.equal(replayAccepted, true);
  record('session_replay_after_logout', { logoutStatus: logout.status,
    logoutClearsBrowserCookie: /Max-Age=0/i.test(logout.headers.get('set-cookie')),
    previouslyIssuedCookieStillAccepted: replayAccepted, lifetimeDays: auth.BOARD_COOKIE_TTL_MS / 86400000 });

  const limiterPath = path.join(root, 'src/lib/rate-limit.ts');
  const first = read('src/lib/rate-limit.ts');
  for (let i = 0; i < 10; i++) first.rateLimit('board-login:review-ip', 10, 900000);
  const blocked = first.rateLimit('board-login:review-ip', 10, 900000, { peek: true });
  assert.equal(blocked.ok, false);
  delete require.cache[require.resolve(limiterPath)];
  const second = read('src/lib/rate-limit.ts');
  const fresh = second.rateLimit('board-login:review-ip', 10, 900000, { peek: true });
  assert.equal(fresh.ok, true);
  for (let i = 0; i < 10000; i++) first.rateLimit(`synthetic-other:${i}`, 10, 900000);
  const cleared = first.rateLimit('board-login:review-ip', 10, 900000, { peek: true });
  assert.equal(cleared.ok, true);
  record('rate_limit_state_loss', { firstInstanceBlocks: !blocked.ok,
    independentModuleInstanceAllows: fresh.ok, capacityClearAllows: cleared.ok });

  const login = read('src/app/api/board/login/route.ts');
  const loginStatuses = [];
  for (let i = 0; i < 11; i++) {
    const response = await login.POST(new NextRequest('https://slotab.org/api/board/login', {
      method: 'POST', headers: { host: 'slotab.org', origin: 'https://slotab.org',
        'x-forwarded-for': '192.0.2.123', 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'deliberately-incorrect-review-fixture' }),
    }));
    loginStatuses.push(response.status);
  }
  assert.deepEqual(loginStatuses, [...Array(10).fill(401), 429]);
  record('login_local_throttle_positive_control', { statuses: loginStatuses });

  // A same-site sibling can submit a form without being able to read its response.
  let githubWrites = 0;
  let wroteName = false;
  global.fetch = async (url, init = {}) => {
    if (!String(url).startsWith('https://api.github.com/')) throw new Error('Unexpected mocked destination');
    if (init.method === 'PUT') {
      githubWrites++;
      const body = JSON.parse(init.body);
      const wall = JSON.parse(Buffer.from(body.content, 'base64').toString());
      wroteName = wall.tiers.some(t => t.donors.some(d => d.name === 'Security Review Fixture'));
      return Response.json({ commit: { sha: 'synthetic-commit-sha' } });
    }
    return Response.json({ sha: 'synthetic-file-sha', content: Buffer.from(JSON.stringify({
      season: '2026-27', tiers: [], unverified: [{ name: 'Security Review Fixture' }],
    })).toString('base64') });
  };
  const donorResponse = await read('src/app/api/board/donor-wall/route.ts').POST(new Request(
    'https://slotab.ravens-peak-consulting.com/api/board/donor-wall', {
      method: 'POST', headers: { cookie: `slotab_board=${cookie}`,
        host: 'slotab.ravens-peak-consulting.com', origin: 'https://untrusted.ravens-peak-consulting.com',
        'sec-fetch-site': 'same-site', 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'carryover-accept', name: 'Security Review Fixture' }),
    }));
  assert.equal(githubWrites, 1);
  assert.equal(wroteName, true);
  record('donor_wall_cross_origin_form_with_valid_cookie', { status: donorResponse.status,
    mockedGithubWrites: githubWrites, syntheticNameWritten: wroteName,
    caveat: 'Handler-level proof; browser exploit requires an attacker-controlled same-site origin and a logged-in board member.' });

  let emailSends = 0;
  let mailFails = false;
  let orderFails = false;
  global.fetch = async (url, init = {}) => {
    if (String(url).startsWith('https://connect.squareupsandbox.com/v2/orders/')) {
      if (orderFails) return Response.json({ error: 'synthetic upstream failure' }, { status: 503 });
      return Response.json({ order: { metadata: { kind: 'donation', designation: 'general', donor: 'Security Review Fixture' } } });
    }
    if (String(url) === 'https://api.resend.com/emails') {
      emailSends++;
      return mailFails ? Response.json({ error: 'synthetic failure' }, { status: 503 })
        : Response.json({ id: `synthetic-email-${emailSends}` });
    }
    throw new Error('Unexpected mocked destination');
  };
  const webhook = read('src/app/api/square/webhook/route.ts');
  const body = JSON.stringify({ event_id: 'same-synthetic-event', type: 'payment.updated',
    created_at: '2026-01-01T00:00:00Z', data: { object: { payment: {
      id: 'same-synthetic-payment', status: 'COMPLETED', order_id: 'synthetic-order',
      created_at: '2026-01-01T00:00:00Z', amount_money: { amount: 2500, currency: 'USD' },
      buyer_email_address: 'review@example.invalid',
    } } } });
  const signature = createHmac('sha256', process.env.SQUARE_WEBHOOK_SIGNATURE_KEY)
    .update(process.env.SQUARE_WEBHOOK_URL + body).digest('base64');
  const request = (sig = signature) => new Request(process.env.SQUARE_WEBHOOK_URL, {
    method: 'POST', headers: { 'x-square-hmacsha256-signature': sig }, body,
  });
  const invalid = await webhook.POST(request('not-a-valid-signature'));
  assert.equal(invalid.status, 401);
  assert.equal(emailSends, 0);
  const r1 = await webhook.POST(request());
  const r2 = await webhook.POST(request());
  assert.equal(emailSends, 2);
  record('webhook_replay', { invalidSignatureStatus: invalid.status,
    identicalSignedRequestStatuses: [r1.status, r2.status], mockedEmailSends: emailSends });
  mailFails = true;
  const r3 = await webhook.POST(request());
  const mailFailure = await r3.json();
  assert.equal(r3.status, 200);
  assert.equal(mailFailure.email, 'failed');
  orderFails = true;
  const before = emailSends;
  const r4 = await webhook.POST(request());
  const orderFailure = await r4.json();
  assert.equal(r4.status, 200);
  assert.equal(emailSends, before);
  record('webhook_acknowledges_downstream_failure', { mailFailureHttpStatus: r3.status,
    mailFailureResponse: mailFailure, orderFailureHttpStatus: r4.status, orderFailureResponse: orderFailure });
  fs.writeFileSync('/tmp/slotab-security-local-check-results.json', JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results, null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; });
