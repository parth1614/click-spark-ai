import { NextRequest, NextResponse } from "next/server";
import { generateAdCreatives } from "@/skills/ad-creative-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sourceContent,
      platform,
      objective,
      targetAudience,
      productService,
      cta,
    } = body;
    if (
      !sourceContent ||
      !platform ||
      !objective ||
      !targetAudience ||
      !productService
    ) {
      return NextResponse.json(
        {
          error:
            "sourceContent, platform, objective, targetAudience, productService are required",
        },
        { status: 400 },
      );
    }
    const creatives = await generateAdCreatives({
      sourceContent,
      platform,
      objective,
      targetAudience,
      productService,
      cta,
    });
    return NextResponse.json({ creatives });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to generate ad creatives";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
