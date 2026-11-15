(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  let client = null;
  let member = null;
  let revision = 0;
  let busy = false;
  let resendAfter = 0;
  let pendingEmail = null;
  let showWelcome = false;
  const welcomeChecked = new Set();

  function message(text, error = false) {
    byId('membershipStatus').textContent = text;
    byId('membershipStatus').dataset.error = String(error);
  }

  function lock() {
    member = null;
    byId('finalMemberStatus').textContent = 'NOT A MEMBER';
    byId('memberAction').hidden = false;
    byId('memberTools').hidden = true;
    byId('memberPosts').replaceChildren();
    byId('memberWelcome').textContent = 'OFFICIAL MEMBER';
    byId('memberNumber').textContent = '—';
    document.querySelectorAll('.member-locked').forEach(button => {
      button.textContent = '???';
      button.classList.remove('unlocked');
      button.onclick = window.locked;
    });
  }

  async function restore() {
    const currentRevision = ++revision;
    lock();
    if (!client) return;
    try {
      const { data: { user }, error: userError } = await client.auth.getUser();
      if (currentRevision !== revision) return;
      if (userError || !user) return;
      const { data, error } = await client.rpc('omb_claim_membership', {
        p_display_name: user.user_metadata?.display_name || ''
      });
      if (error) throw error;
      if (currentRevision !== revision) return;
      const record = data?.[0];
      if (!record?.active) {
        message('This membership is currently unavailable. Please contact Sebast.', true);
        return;
      }
      member = record;
      byId('finalMemberStatus').textContent = 'MEMBER #' + record.member_number;
      byId('memberNumber').textContent = record.member_number;
      byId('memberWelcome').textContent = record.display_name
        ? record.display_name.toUpperCase() + ' — OFFICIAL MEMBER' : 'OFFICIAL MEMBER';
      byId('memberAction').hidden = true;
      byId('memberTools').hidden = false;
      window.unlockMemberActivities();
      if (!welcomeChecked.has(user.id)) {
        welcomeChecked.add(user.id);
        // Sending failure must never block membership access.
        client.functions.invoke('welcome-member', { body: {} })
          .then(({ error }) => { if (error) welcomeChecked.delete(user.id); })
          .catch(() => { welcomeChecked.delete(user.id); });
      }
      if (showWelcome || new URLSearchParams(location.search).has('membership')) {
        showWelcome = false;
        history.replaceState(null, '', location.pathname);
        window.go(12);
      }
    } catch {
      if (currentRevision === revision) message('We could not check your membership. Please try again shortly.', true);
    }
  }

  window.openMembership = () => {
    window.go(member ? 13 : 10);
    if (member) loadPosts();
  };

  window.finishMembership = () => {
    if (member) window.go(8);
    else window.openMembership();
  };

  async function apply(event) {
    event.preventDefault();
    if (busy || !byId('membershipForm').reportValidity()) return;
    if (!client || window.OMB_MEMBERSHIP?.registrationEnabled === false) {
      message('Membership registration is not open yet. Please come back soon.', true);
      return;
    }
    if (Date.now() < resendAfter) {
      message('Please wait a minute before requesting another email.');
      return;
    }
    busy = true;
    byId('membershipSubmit').disabled = true;
    message('SENDING YOUR ACCESS CODE…');
    try {
      const email = byId('memberEmail').value.trim();
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: { display_name: byId('memberName').value.trim() }
        }
      });
      if (error) throw error;
      resendAfter = Date.now() + 60000;
      pendingEmail = email;
      byId('membershipVerifyForm').hidden = false;
      byId('memberEmail').readOnly = true;
      message('CHECK YOUR EMAIL. Enter the verification code below to get your member number and access. Check spam too.');
    } catch {
      message('The email could not be sent. Please try again in a minute. If it keeps failing, contact Sebast.', true);
    } finally {
      busy = false;
      byId('membershipSubmit').disabled = false;
    }
  }

  async function verify(event) {
    event.preventDefault();
    if (busy || !client || !pendingEmail || !byId('membershipVerifyForm').reportValidity()) return;
    busy = true;
    showWelcome = true;
    byId('membershipVerify').disabled = true;
    message('CHECKING YOUR CODE…');
    try {
      const { error } = await client.auth.verifyOtp({
        email: pendingEmail,
        token: byId('membershipCode').value.trim(),
        type: 'email'
      });
      if (error) throw error;
      byId('membershipCode').value = '';
      await restore();
    } catch {
      showWelcome = false;
      message('That code is invalid or expired. Check the latest email, or request a new code.', true);
    } finally {
      busy = false;
      byId('membershipVerify').disabled = false;
    }
  }

  async function loadPosts() {
    const holder = byId('memberPosts');
    const currentRevision = revision;
    holder.textContent = 'LOADING THE GOOD STUFF…';
    if (!client || !member) { holder.replaceChildren(); return; }
    try {
      const { data, error } = await client.from('omb_member_posts')
        .select('id,title,body,published_at').order('published_at', { ascending: false }).limit(50);
      if (error) throw error;
      if (currentRevision !== revision || !member) return;
      holder.replaceChildren();
      if (!data.length) { holder.textContent = 'Nothing to report. An excellent reason to take a break. Check back for member updates.'; return; }
      data.forEach(post => {
        const article = document.createElement('article');
        article.className = 'membership-post';
        const title = document.createElement('h3');
        title.textContent = post.title;
        const body = document.createElement('p');
        body.textContent = post.body;
        article.append(title, body);
        holder.append(article);
      });
    } catch {
      if (currentRevision === revision) holder.textContent = 'Member updates could not be loaded. Please try again shortly.';
    }
  }

  async function init() {
    lock();
    byId('membershipForm').addEventListener('submit', apply);
    byId('membershipVerifyForm').addEventListener('submit', verify);
    byId('membershipChangeEmail').addEventListener('click', () => {
      pendingEmail = null;
      byId('membershipVerifyForm').hidden = true;
      byId('memberEmail').readOnly = false;
      byId('membershipCode').value = '';
      message('Enter your email and request a new code.');
    });
    byId('viewMemberInfo').addEventListener('click', window.openMembership);
    byId('retryMemberPosts').addEventListener('click', loadPosts);
    byId('membershipSignOut').addEventListener('click', async () => {
      ++revision;
      lock();
      window.go(8);
      if (client) {
        const { error } = await client.auth.signOut({ scope: 'local' });
        if (error) { window.go(10); message('Could not sign out completely. Please try again.', true); }
      }
    });
    const callback = new URLSearchParams(location.hash?.slice(1) || '');
    if (callback.has('error')) {
      history.replaceState(null, '', location.pathname);
      window.go(10);
      message('This access link has expired or was already used. Request a verification code below.', true);
    }
    const config = window.OMB_MEMBERSHIP;
    if (!config?.supabaseUrl || !config?.publishableKey) {
      message('Membership registration is not open yet. Please come back soon.');
      return;
    }
    if (config.registrationEnabled === false) message('Membership registration is not open yet. Please come back soon.');
    try {
      const sdk = await import('https://esm.sh/@supabase/supabase-js@2.49.8');
      client = sdk.createClient(config.supabaseUrl, config.publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' }
      });
      client.auth.onAuthStateChange(() => { setTimeout(restore, 0); });
      await restore();
    } catch {
      message('Membership is temporarily unavailable. Please try again later.', true);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
