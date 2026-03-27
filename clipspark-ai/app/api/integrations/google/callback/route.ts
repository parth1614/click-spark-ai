import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Step 2: Exchange code for tokens, store in DB
export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      `${appUrl}/?section=integrations&error=google_denied`,
    );
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${appUrl}/api/integrations/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("Google token error:", tokenData.error);
      return NextResponse.redirect(
        `${appUrl}/?section=integrations&error=google_token`,
      );
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    // Fetch user email for account name
    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );
    const userData = await userRes.json();
    const email = userData.email || "Google Ads Account";

    const expiresAt = new Date(
      Date.now() + (expires_in || 3600) * 1000,
    ).toISOString();

    // Store in DB — account_id will be set when user selects a customer ID
    // For now, use email as identifier
    await supabase.from("ad_accounts").upsert(
      {
        platform: "google",
        account_id: email,
        account_name: email,
        access_token,
        refresh_token: refresh_token || null,
        token_expires_at: expiresAt,
        is_active: true,
      },
      { onConflict: "platform,account_id" },
    );

    return NextResponse.redirect(
      `${appUrl}/?section=integrations&success=google`,
    );
  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(
      `${appUrl}/?section=integrations&error=google_error`,
    );
  }
}
