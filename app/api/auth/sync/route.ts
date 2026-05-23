import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
    }

    // Use Service Role key to bypass RLS, or Anon Key if Service Role isn't available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if the user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is fine. Other errors are bad.
      console.error("Supabase check error:", checkError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // If user doesn't exist, insert them
    if (!existingUser) {
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: userId,
          email: email,
          isPremium: false,
          unlockedGenerations: [],
          provider: "clerk",
          updatedAt: new Date().toISOString()
        }
      ]);

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        return NextResponse.json({ error: "Failed to create user in Supabase" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "User synced to Supabase" });
    }

    // User already exists
    return NextResponse.json({ success: true, message: "User already exists" });

  } catch (error: any) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
