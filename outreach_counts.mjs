import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const sender = 'richard@startingmonday.app';
  
  // 1) total rows
  const { count: total, error: e1 } = await supabase
    .from('outreach_logs')
    .select('*', { count: 'exact', head: true })
    .eq('sender', sender);

  // 2) rows where persona_focus ilike '%coach%'
  const { count: personaFocusCoach, error: e2 } = await supabase
    .from('outreach_logs')
    .select('*', { count: 'exact', head: true })
    .eq('sender', sender)
    .ilike('persona_focus', '%coach%');

  // 3) rows where recipient_name ilike '%coach%'
  const { count: recipientNameCoach, error: e3 } = await supabase
    .from('outreach_logs')
    .select('*', { count: 'exact', head: true })
    .eq('sender', sender)
    .ilike('recipient_name', '%coach%');

  // 4) rows where message_body contains 'startingmonday.app/for-coaches'
  const { count: messageBodyUrl, error: e4 } = await supabase
    .from('outreach_logs')
    .select('*', { count: 'exact', head: true })
    .eq('sender', sender)
    .like('message_body', '%startingmonday.app/for-coaches%');

  // 5) rows where persona_focus ilike '%coach%' and message_body is null/empty
  // Note: .or is usually for multiple columns, but we can use .is('message_body', null) or filter client side if the API is tricky.
  // Actually, Supabase supports multiple filters.
  const { count: personaCoachNullBody, error: e5 } = await supabase
    .from('outreach_logs')
    .select('*', { count: 'exact', head: true })
    .eq('sender', sender)
    .ilike('persona_focus', '%coach%')
    .or('message_body.is.null,message_body.eq.""');

  if (e1 || e2 || e3 || e4 || e5) {
    console.error('Errors:', { e1, e2, e3, e4, e5 });
  }

  console.log('Outreach Log Counts for ' + sender + ':');
  console.log('1) Total rows:', total);
  console.log('2) persona_focus ilike \"%coach%\":', personaFocusCoach);
  console.log('3) recipient_name ilike \"%coach%\":', recipientNameCoach);
  console.log('4) message_body contains \"startingmonday.app/for-coaches\":', messageBodyUrl);
  console.log('5) persona_focus ilike \"%coach%\" and message_body null/empty:', personaCoachNullBody);
}

run();
