import { createAdminClient } from "./app/utils/supabase/admin";

async function test() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("history")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success! Columns:", data && data.length > 0 ? Object.keys(data[0]) : "No data, but query worked");
    console.log("Data:", data);
  }
}

test();
