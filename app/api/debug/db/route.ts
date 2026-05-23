import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch ONE user just to see the exact column names
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ message: "No users found in database, cannot infer schema." });
    }

    // Return the exact keys of the user object
    const columns = Object.keys(data[0]);

    return NextResponse.json({ 
      columns,
      firstUser: data[0]
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
