import { NextResponse } from "next/server";

// Step 1: Redirect user to Facebook OAuth consent screen
export async function GET() {
  const appId = process.env.FACEBOOK_APP_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/integrations/facebook/callback`;

  if (!appId) {
    return NextResponse.json(
      {
        error:
          "Facebook App ID not configured. Set FACEBOOK_APP_ID in .env.local",
      },
      { status: 500 },
    );
  }

  const scopes = [
    "ads_management",
    "ads_read",
    "business_management",
    "read_insights",
  ].join(",");

  const authUrl =
    `https://www.facebook.com/v18.0/dialog/oauth` +
    `?client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scopes}` +
    `&response_type=code` +
    `&state=fb_connect`;

  return NextResponse.redirect(authUrl);
}
