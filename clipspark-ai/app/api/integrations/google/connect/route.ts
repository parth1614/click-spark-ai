import { NextResponse } from "next/server";

// Step 1: Redirect user to Google OAuth consent screen
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/integrations/google/callback`;

  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "Google Client ID not configured. Set GOOGLE_CLIENT_ID in .env.local",
      },
      { status: 500 },
    );
  }

  const scopes = [
    "https://www.googleapis.com/auth/adwords",
    "https://www.googleapis.com/auth/userinfo.email",
  ].join(" ");

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=google_connect`;

  return NextResponse.redirect(authUrl);
}
