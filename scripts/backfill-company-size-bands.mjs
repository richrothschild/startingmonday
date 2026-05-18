import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(url, key);

const missingMappings = [
  { company: 'Company A', size_band: '1001-10000' },
  { company: 'Company B', size_band: '1001-10000' },
  // Add all 17 missing mappings here
];

async function backfillCompanySizeBands() {
  for (const { company, size_band } of missingMappings) {
    const { data, error } = await supabase
      .from('companies')
      .update({ company_size: size_band })
      .eq('name', company);

    if (error) {
      console.error(`Failed to update ${company}:`, error.message);
    } else {
      console.log(`Updated ${company} with size band ${size_band}`);
    }
  }
}

backfillCompanySizeBands().then(() => {
  console.log('Backfill complete.');
  process.exit(0);
});