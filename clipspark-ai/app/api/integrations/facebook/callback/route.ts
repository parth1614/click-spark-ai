import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Step 2: Exchange code for access token, fetch ad accounts, store in DB
export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      `${appUrl}/?section=integrations&error=fb_denied`,
    );
  }

  try {
    const appId = process.env.FACEBOOK_APP_ID!;
    const appSecret = process.env.FACEBOOK_APP_SECRET!;
    const redirectUri = `${appUrl}/api/integrations/facebook/callback`;

    // Exchange code for short-lived token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token` +
        `?client_id=${appId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&client_secret=${appSecret}` +
        `&code=${code}`,
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("FB token error:", tokenData.error);
      return NextResponse.redirect(
        `${appUrl}/?section=integrations&error=fb_token`,
      );
    }

    const shortToken = tokenData.access_token;

    // Exchange for long-lived token (60 days)
    const longRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token` +
        `?grant_type=fb_exchange_token` +
        `&client_id=${appId}` +
        `&client_secret=${appSecret}` +
        `&fb_exchange_token=${shortToken}`,
    );
    const longData = await longRes.json();
    const accessToken = longData.access_token || shortToken;
    const expiresIn = longData.expires_in || 5184000; // default 60 days

    // Fetch user's ad accounts
    const accountsRes = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts` +
        `?fields=id,account_id,name,currency,account_status` +
        `&access_token=${accessToken}`,
    );
    const accountsData = await accountsRes.json();

    if (!accountsData.data || accountsData.data.length === 0) {
      return NextResponse.redirect(
        `${appUrl}/?section=integrations&error=fb_no_accounts`,
      );
    }

    // Store the first active ad account (or all of them)
    const account = accountsData.data[0];
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    await supabase.from("ad_accounts").upsert(
      {
        platform: "facebook",
        account_id: account.account_id,
        account_name: account.name || `FB Account ${account.account_id}`,
        access_token: accessToken,
        token_expires_at: expiresAt,
        is_active: true,
      },
      { onConflict: "platform,account_id" },
    );

    return NextResponse.redirect(
      `${appUrl}/?section=integrations&success=facebook`,
    );
  } catch (err) {
    console.error("FB callback error:", err);
    return NextResponse.redirect(
      `${appUrl}/?section=integrations&error=fb_error`,
    );
  }
}
