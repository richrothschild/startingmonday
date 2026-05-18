const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const fs = require("fs");

const envConfig = dotenv.parse(fs.readFileSync(".env.local"));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExactEmail() {
  const targetEmails = [
    'yamini.rangan@hubspot.com',
    'dharmesh.shah@hubspot.com',
    'jay.chaudhry@zscaler.com',
    'remo.canessa@zscaler.com'
  ];

  const { data, error } = await supabase
    .from('contacts')
    .select('name, email, outreach_status')
    .in('email', targetEmails);
  
  const results = targetEmails.map(email => {
    const match = data?.find(d => d.email === email);
    return match ? match : { name: null, email, outreach_status: null, note: "contact not found in this user's workspace" };
  });

  console.log(JSON.stringify(results, null, 2));
}
checkExactEmail();
