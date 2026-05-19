import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('outreach_logs')
    .select('id,sender_email,recipient_email,recipient_name,persona_focus,message_body')
    .limit(2000);

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  console.log('Total fetched:', data.length);

  const senderCounts = {};
  data.forEach(row => {
    senderCounts[row.sender_email] = (senderCounts[row.sender_email] || 0) + 1;
  });
  console.log('Distinct sender_email counts:', JSON.stringify(senderCounts, null, 2));

  const personaCoachCount = data.filter(row => 
    row.persona_focus && row.persona_focus.toLowerCase().includes('coach')
  ).length;
  console.log('Count where persona_focus contains \"coach\":', personaCoachCount);

  const recipientCoachCount = data.filter(row => 
    row.recipient_name && row.recipient_name.toLowerCase().includes('coach')
  ).length;
  console.log('Count where recipient_name contains \"coach\":', recipientCoachCount);

  const coachSamples = data
    .filter(row => row.persona_focus && row.persona_focus.toLowerCase().includes('coach'))
    .slice(0, 5)
    .map(row => ({
      id: row.id,
      sender_email: row.sender_email,
      recipient_name: row.recipient_name,
      persona_focus: row.persona_focus
    }));
  console.log('Sample rows where persona_focus contains \"coach\":', JSON.stringify(coachSamples, null, 2));
}

run();
