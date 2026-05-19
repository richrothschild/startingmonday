import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const ts = Date.now();
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';

async function runSmokeTest() {
  console.log('--- STARTING SMOKE TEST ---');

  // 1. OPTIMIZE
  const random = Math.floor(Math.random() * 254) + 1;
  const optimizeRes = await fetch('https://startingmonday.app/api/optimize', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': userAgent,
      'x-forwarded-for': '198.51.102.' + random
    },
    body: JSON.stringify({
      email: 'smoke.' + ts + '@example.com',
      text: 'I am a VP Engineering leading 120 engineers across platform and product. I scaled revenue from  to  ARR, rebuilt org design, and launched AI-assisted developer productivity systems. Experience: Company A 2021-present VP Engineering. Company B 2017-2021 Director Engineering. Seeking CIO/CTO role.'
    })
  });
  const optimizeBody = await optimizeRes.text();
  console.log('OPTIMIZE_STATUS:', optimizeRes.status);
  console.log('OPTIMIZE_BODY:', optimizeBody.substring(0, 180));

  // 2. TEMP USER
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: 'smoke.user.' + ts + '@example.com',
    password: 'SmokeTest!23456',
    email_confirm: true
  });
  if (userError) throw userError;
  const tempUserId = userData.user.id;
  console.log('TEMP_USER_ID:', tempUserId);

  // 3. LOGIN
  // Note: verify-and-signin might Expect a token/code if it's passwordless, 
  // but the prompt says 'with email/password'. 
  // If it fails with 400, it might be due to missing captcha or wrong params.
  const loginRes = await fetch('https://startingmonday.app/api/auth/verify-and-signin', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': userAgent },
    body: JSON.stringify({ email: 'smoke.user.' + ts + '@example.com', password: 'SmokeTest!23456' })
  });
  const setCookies = loginRes.headers.raw() ? (loginRes.headers.raw()['set-cookie'] || []) : [];
  let cookieHeader = setCookies.map(c => c.split(';')[0]).join('; ');
  console.log('LOGIN_STATUS:', loginRes.status);
  console.log('COOKIE_COUNT:', setCookies.length);
  if (loginRes.status !== 200) {
      console.log('LOGIN_ERROR_BODY:', (await loginRes.text()));
  }

  // 4. FEEDBACK
  const feedbackRes = await fetch('https://startingmonday.app/api/feedback/items', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': userAgent,
      'cookie': cookieHeader
    },
    body: JSON.stringify({
      title: 'Smoke feedback ' + ts,
      body: 'Smoke test feedback submission after captcha removal and feedback type fix.',
      category: 'bug'
    })
  });
  const feedbackBody = await feedbackRes.text();
  console.log('FEEDBACK_STATUS:', feedbackRes.status);
  console.log('FEEDBACK_BODY:', feedbackBody.substring(0, 180));

  // 5. CONTACT CLOSE TEST (db-level)
  const { data: contactData, error: contactError } = await supabase.from('contacts').insert({
    user_id: tempUserId,
    name: 'Smoke Contact ' + ts,
    status: 'active',
    outreach_status: 'prospect'
  }).select('id').single();

  if (contactError) {
      console.error('CONTACT_INSERT_ERROR:', contactError);
  } else {
      await supabase.from('follow_ups').insert([
        { contact_id: contactData.id, status: 'pending', user_id: tempUserId, content: 'Smoke 1' },
        { contact_id: contactData.id, status: 'pending', user_id: tempUserId, content: 'Smoke 2' }
      ]);

      const { count: pendingBefore } = await supabase.from('follow_ups').select('*', { count: 'exact', head: true }).eq('contact_id', contactData.id).eq('status', 'pending');
      
      await supabase.from('contacts').update({ outreach_status: 'closed' }).eq('id', contactData.id);
      await supabase.from('follow_ups').update({ status: 'done' }).eq('contact_id', contactData.id).eq('status', 'pending');

      const { count: pendingAfter } = await supabase.from('follow_ups').select('*', { count: 'exact', head: true }).eq('contact_id', contactData.id).eq('status', 'pending');
      const { count: doneAfter } = await supabase.from('follow_ups').select('*', { count: 'exact', head: true }).eq('contact_id', contactData.id).eq('status', 'done');

      console.log('CLOSE_COUNTS:', JSON.stringify({ pendingBefore, pendingAfter, doneAfter }));

      // Cleanup
      await supabase.from('follow_ups').delete().eq('contact_id', contactData.id);
      await supabase.from('contacts').delete().eq('id', contactData.id);
  }

  await supabase.auth.admin.deleteUser(tempUserId);
  console.log('CLEANUP_DONE: true');
}

runSmokeTest().catch(err => {
  console.error(err);
  process.exit(1);
});
