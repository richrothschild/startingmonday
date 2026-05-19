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
  const sender = 'richard@startingmonday.app';
  
  console.log('Fetching first 5 rows for sender:', sender);
  const { data, error } = await supabase
    .from('outreach_logs')
    .select('*')
    .eq('sender', sender)
    .limit(5);

  if (error) {
    console.error('Error fetching data:', error);
  } else {
    console.log('Sample data:', JSON.stringify(data, null, 2));
    console.log('Count of items in sample:', data?.length);
  }

  const { count, error: countError } = await supabase
    .from('outreach_logs')
    .select('*', { count: 'exact', head: true });
    
  console.log('Total rows in table (any sender):', count);
  if (countError) console.error('Count error:', countError);
}

run();
