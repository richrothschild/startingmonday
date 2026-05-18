const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const fs = require("fs");

const envConfig = dotenv.parse(fs.readFileSync(".env.local"));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
  const { data, error } = await supabase.from('contacts').select('*').limit(5);
  if (error) {
    console.log(JSON.stringify({ error: error.message }));
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}
inspectTable();
