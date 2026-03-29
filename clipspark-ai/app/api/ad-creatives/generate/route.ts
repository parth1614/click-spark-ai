import { NextRequest, NextResponse } from "next/server";
import { generateAdCreatives } from "@/skills/ad-creative-generator";
import { getSupabase } from "@/lib/supabase";

const BUCKET = "ad-creatives";

/** Upload an image to Supabase storage. Handles both base64 data URLs and remote HTTPS URLs. */
async function uploadCreativeImage(
  imageSource: string,
  path: string,
): Promise<{ publicUrl: string; storagePath: string }> {
  const supabase = getSupabase();

  let buffer: Buffer;
  let contentType = "image/png";

  const base64Match = imageSource.match(/^data:(.+?);base64,(.+)$/);

  if (base64Match) {
    // Base64 data URL
    contentType = base64Match[1];
    buffer = Buffer.from(base64Match[2], "base64");
  } else if (imageSource.startsWith("http")) {
    // Remote URL — fetch the image bytes
    const res = await fetch(imageSource);
    if (!res.ok) throw new Error(`Failed to fetch remote image: ${res.status}`);
    contentType = res.headers.get("content-type") || "image/png";
    const arrayBuf = await res.arrayBuffer();
    buffer = Buffer.from(arrayBuf);
  } else {
    throw new Error("Unrecognized image format — not base64 or URL");
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { publicUrl: urlData.publicUrl, storagePath: path };
}

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

    // Upload images to storage and persist to DB
    const supabase = getSupabase();
    const timestamp = Date.now();

    const enrichedCreatives = await Promise.all(
      creatives.map(async (creative) => {
        if (!creative.imageUrl) return creative;

        try {
          const storagePath = `${platform}/${timestamp}_${creative.id}.png`;
          console.log(
            `Uploading creative ${creative.id}, source type: ${creative.imageUrl.startsWith("data:") ? "base64" : "url"}, length: ${creative.imageUrl.length}`,
          );
          const { publicUrl, storagePath: savedPath } =
            await uploadCreativeImage(creative.imageUrl, storagePath);

          // Persist to ad_creatives table
          const { data: dbRow, error: dbError } = await supabase
            .from("ad_creatives")
            .insert({
              platform,
              creative_type: "image",
              storage_url: publicUrl,
              storage_path: savedPath,
              ad_angle: creative.adAngle,
              improvement: creative.improvement,
              dimensions: creative.dimensions,
              iteration: creative.iteration,
              metadata: { objective, productService },
            })
            .select("id")
            .single();

          if (dbError) {
            console.error("DB insert error:", dbError.message);
          }

          return {
            ...creative,
            storageUrl: publicUrl,
            dbId: dbRow?.id ?? null,
          };
        } catch (err) {
          console.error(`Failed to upload creative ${creative.id}:`, err);
          return creative; // return without storage URL on failure
        }
      }),
    );

    return NextResponse.json({ creatives: enrichedCreatives });
  } catch (err: unknown) {
    console.error("Ad creative generation error:", err);
    const msg =
      err instanceof Error ? err.message : "Failed to generate ad creatives";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
