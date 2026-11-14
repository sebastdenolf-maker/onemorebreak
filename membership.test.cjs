// Run: node --experimental-vm-modules --test membership.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

async function boot({ configured = true, user = null, row = null, sendError = null } = {}) {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, {
      textContent: '', dataset: {}, hidden: false, disabled: false, value: '',
      listeners: {}, children: [], reportValidity: () => true,
      addEventListener(name, fn) { this.listeners[name] = fn; },
      replaceChildren() { this.children = []; this.textContent = ''; },
      append(...nodes) { this.children.push(...nodes); }
    });
    return elements.get(id);
  };
  let unlocked = false;
  let sent = null;
  let claimed = 0;
  const client = {
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      onAuthStateChange: () => {},
      signInWithOtp: async input => { sent = input; return { error: sendError }; },
      verifyOtp: async input => {
        if (input.token !== '123456') return { error: new Error('Invalid code') };
        user = { user_metadata: {} };
        return { error: null };
      },
      signOut: async () => ({ error: null })
    },
    rpc: async () => { claimed++; return { data: row ? [row] : [], error: null }; }
  };
  const context = vm.createContext({
    document: { readyState: 'complete', getElementById: get, querySelectorAll: () => [] },
    location: { origin: 'https://example.org', pathname: '/index.html', search: '' },
    history: { replaceState() {} }, URL, URLSearchParams, setTimeout,
    window: {
      OMB_MEMBERSHIP: configured ? { supabaseUrl: 'https://example.supabase.co', publishableKey: 'public-key' } : {},
      go() {}, unlockMemberActivities() { unlocked = true; }
    }
  });
  const sdk = new vm.SyntheticModule(['createClient'], function () {
    this.setExport('createClient', () => client);
  }, { context });
  await sdk.link(() => {}); await sdk.evaluate();
  const script = new vm.Script(fs.readFileSync(__dirname + '/membership.js', 'utf8'), {
    importModuleDynamically: async () => sdk
  });
  script.runInContext(context);
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  return { get, client, context, unlocked: () => unlocked, sent: () => sent, claimed: () => claimed };
}

test('anonymous visitor gets no member number or unlocked access', async () => {
  const app = await boot();
  assert.equal(app.claimed(), 0);
  assert.equal(app.unlocked(), false);
  assert.equal(app.get('memberTools').hidden, true);
  assert.equal(app.get('memberNumber').textContent, '—');
});

test('only an active database membership restores access and its stored number', async () => {
  const app = await boot({ user: { user_metadata: {} }, row: { member_number: 123456, active: true } });
  assert.equal(app.unlocked(), true);
  assert.equal(app.get('finalMemberStatus').textContent, 'MEMBER #123456');
  assert.equal(app.get('memberAction').hidden, true);
});

test('inactive membership stays locked', async () => {
  const app = await boot({ user: { user_metadata: {} }, row: { member_number: 123456, active: false } });
  assert.equal(app.unlocked(), false);
  assert.equal(app.get('memberTools').hidden, true);
});

test('sending a link does not invent a membership; repeat request is throttled', async () => {
  const app = await boot();
  app.get('memberEmail').value = 'member@example.org';
  await app.get('membershipForm').listeners.submit({ preventDefault() {} });
  assert.equal(app.sent().email, 'member@example.org');
  assert.equal(app.get('membershipVerifyForm').hidden, false);
  assert.equal(app.get('memberEmail').readOnly, true);
  assert.equal(app.unlocked(), false);
  assert.match(app.get('membershipStatus').textContent, /CHECK YOUR EMAIL/);
  await app.get('membershipForm').listeners.submit({ preventDefault() {} });
  assert.match(app.get('membershipStatus').textContent, /wait a minute/);
});

test('missing setup and email delivery errors never show success', async () => {
  const missing = await boot({ configured: false });
  await missing.get('membershipForm').listeners.submit({ preventDefault() {} });
  assert.equal(missing.sent(), null);
  assert.match(missing.get('membershipStatus').textContent, /not open yet/);
  const failed = await boot({ sendError: new Error('SMTP unavailable') });
  await failed.get('membershipForm').listeners.submit({ preventDefault() {} });
  assert.match(failed.get('membershipStatus').textContent, /could not be sent/);
  assert.equal(failed.get('membershipSubmit').disabled, false);
  assert.equal(failed.unlocked(), false);
});


test('an incorrect email code cannot unlock access, a correct code restores the stored member number', async () => {
  const app = await boot({ row: { member_number: 100000, active: true } });
  app.get('memberEmail').value = 'member@example.org';
  await app.get('membershipForm').listeners.submit({ preventDefault() {} });
  app.get('membershipCode').value = '999999';
  await app.get('membershipVerifyForm').listeners.submit({ preventDefault() {} });
  assert.equal(app.unlocked(), false);
  assert.match(app.get('membershipStatus').textContent, /invalid or expired/);
  app.get('membershipCode').value = '123456';
  await app.get('membershipVerifyForm').listeners.submit({ preventDefault() {} });
  assert.equal(app.unlocked(), true);
  assert.equal(app.get('memberNumber').textContent, 100000);
});
