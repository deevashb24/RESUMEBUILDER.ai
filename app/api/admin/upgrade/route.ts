import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { secret, email } = await req.json();
    if (secret !== "antigravity-admin-override") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize Supabase with service role or anon key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user by email
    const { data: users, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email);
    
    if (findError || !users || users.length === 0) {
      return NextResponse.json({ error: "User not found. They must sign in first." }, { status: 404 });
    }

    const userId = users[0].id;

    // Grant lifetime Premium
    const { error: updateError } = await supabase
      .from("users")
      .update({
        isPremium: true,
        is_premium: true, // covering both cases
        subscription_status: "active",
        updatedAt: new Date().toISOString()
      })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Upgraded ${email} to Lifetime Premium.` });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
