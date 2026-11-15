import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const origin = 'https://onemorebreak.com';
const headers = {
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
};
const reply = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { ...headers, 'Content-Type': 'application/json' },
});

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return reply(405, { error: 'Method not allowed' });
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return reply(401, { error: 'Sign in first' });
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return reply(503, { error: 'Welcome email temporarily unavailable' });
  const admin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  try {
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user?.email_confirmed_at) return reply(401, { error: 'Verify your email first' });
    // Recipient and number come exclusively from the protected database queue.
    // Request bodies never select recipients or member numbers.
    const { data, error } = await admin.rpc('omb_take_welcome_email', { p_user_id: user.id });
    if (error) throw error;
    const row = data?.[0];
    if (!row) return reply(200, { status: 'No pending welcome email' });
    const number = String(row.member_number);
    if (!/^\d+$/.test(number)) throw new Error('Invalid member number');
    const text = `WELCOME TO THE BREAK.\n\nYou're officially in. Your member number is #${number}.\n\nA place to dance, cry, laugh, make mistakes and just be yourself. No productivity required.\n\nYour number stays yours. Use the same email and a new access code whenever you come back.\n\nTake one more break: https://onemorebreak.com/\n\nBLACKSTAR\n\nYou received this email because you confirmed your ONEMOREBREAK membership.`;
    const html = `<div style="background:#050505;color:#fffdf5;padding:32px 16px;font-family:Courier New,monospace"><div style="max-width:560px;margin:auto;border:3px solid #fffdf5;padding:28px"><p style="letter-spacing:2px">ONEMOREBREAK™</p><h1 style="font-size:32px;line-height:1.1">WELCOME TO<br>THE BREAK.</h1><p>You're officially in.</p><p style="margin-bottom:8px">YOUR MEMBER NUMBER</p><p style="font-size:36px;font-weight:bold;background:#fffdf5;color:#050505;padding:18px;text-align:center;margin-top:0">#${number}</p><p style="line-height:1.7">A place to dance, cry, laugh, make mistakes and just be yourself. No productivity required.</p><p style="line-height:1.7">Your number stays yours. Use the same email and a new access code whenever you come back.</p><p style="margin:28px 0"><a href="https://onemorebreak.com/" style="background:#fffdf5;color:#050505;padding:14px 18px;display:inline-block;text-decoration:none;font-weight:bold">TAKE ONE MORE BREAK →</a></p><p>BLACKSTAR</p><p style="font-size:12px;line-height:1.6;color:#bbb">You received this email because you confirmed your ONEMOREBREAK membership.</p></div></div>`;
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `omb-welcome-v1/${row.user_id}` },
      body: JSON.stringify({ from: 'ONEMOREBREAK <members@onemorebreak.com>', to: [row.recipient], subject: 'WELCOME TO THE BREAK — MEMBER #' + number, html, text }),
      signal: AbortSignal.timeout(15000),
    });
    if (!result.ok) return reply(502, { error: 'Welcome email pending retry' });
    const delivered = await result.json();
    if (!delivered.id) throw new Error('Missing email receipt');
    const { error: saveError } = await admin.from('omb_welcome_emails')
      .update({ sent_at: new Date().toISOString(), provider_id: delivered.id, locked_until: null })
      .eq('user_id', user.id).is('sent_at', null);
    if (saveError) throw saveError;
    return reply(200, { status: 'Welcome email sent' });
  } catch {
    // Do not log tokens, email addresses, provider bodies or secrets.
    return reply(503, { error: 'Welcome email pending retry' });
  }
});
