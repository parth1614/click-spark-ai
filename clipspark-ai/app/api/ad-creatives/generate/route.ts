import { NextRequest, NextResponse } from "next/server";
import { generateAdCreatives } from "@/skills/ad-creative-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceContent, platform, objective, audience, productService } =
      body;

    if (
      !sourceContent ||
      !platform ||
      !objective ||
      !audience ||
      !productService
    ) {
      return NextResponse.json(
        {
          error:
            "sourceContent, platform, objective, audience, productService are required",
        },
        { status: 400 },
      );
    }

    const creatives = await generateAdCreatives({
      sourceContent,
      platform,
      objective,
      audience,
      productService,
    });

    return NextResponse.json({ creatives });
  } catch (err: unknown) {
    console.error("Ad creative generation error:", err);
    const msg =
      err instanceof Error ? err.message : "Failed to generate ad creatives";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
