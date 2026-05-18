
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const emails = [
  "yamini.rangan@hubspot.com",
  "dharmesh.shah@hubspot.com",
  "jay.chaudhry@zscaler.com",
  "remo.canessa@zscaler.com"
];

async function queryContacts() {
  const { data, error } = await supabase
    .from("contacts")
    .select("full_name, email, outreach_status, status")
    .in("email", emails);

  if (error) {
    console.error("Error querying contacts:", error);
    return;
  }

  const results = emails.map(email => {
    const contact = (data || []).find((c: any) => c.email.toLowerCase() === email.toLowerCase());
    if (contact) {
      return {
        name: contact.full_name,
        email: contact.email,
        outreach_status: contact.outreach_status,
        status: contact.status
      };
    } else {
      return { email, status: "not found" };
    }
  });

  console.log(JSON.stringify(results, null, 2));
}

queryContacts();
