import { NextRequest, NextResponse } from "next/server";
import { generateLandingPageContent } from "@/skills/landing-page-generator";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productService,
      description,
      adCreativeUrl,
      tone,
      leadFormFields,
      themeColor,
    } = body;

    if (!productService || !description) {
      return NextResponse.json(
        { error: "productService and description are required" },
        { status: 400 },
      );
    }

    // Generate AI content
    const content = await generateLandingPageContent({
      productService,
      description,
      adCreativeUrl,
      tone,
    });

    // Save to DB
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("landing_pages")
      .insert({
        headline: content.headline,
        subheadline: content.subheadline,
        hero_image_url: adCreativeUrl || null,
        body_sections: content.bodySections,
        lead_form_fields: leadFormFields || [],
        cta_text: content.ctaText,
        theme_color: themeColor || "#1a73e8",
        product_service: productService,
        metadata: { description, tone },
      })
      .select("id")
      .single();

    if (error) {
      console.error("DB insert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      ...content,
      heroImageUrl: adCreativeUrl || null,
      leadFormFields: leadFormFields || [],
    });
  } catch (err: unknown) {
    console.error("Landing page creation error:", err);
    const msg =
      err instanceof Error ? err.message : "Failed to create landing page";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
