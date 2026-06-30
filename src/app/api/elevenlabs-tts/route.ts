import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb";
  const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
  const outputFormat = process.env.ELEVENLABS_OUTPUT_FORMAT || "mp3_44100_128";

  if (!apiKey) {
    return NextResponse.json({ error: "Missing ELEVENLABS_API_KEY" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const text = String(body.text || "").trim();
  const languageCode = String(body.languageCode || "en").slice(0, 5);

  if (!text || text.length > 600) {
    return NextResponse.json(
      { error: "Text is required and must be under 600 characters." },
      { status: 400 },
    );
  }

  const elevenResponse = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=${encodeURIComponent(outputFormat)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        language_code: languageCode,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.8,
          style: 0.18,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!elevenResponse.ok) {
    const details = await elevenResponse.text();
    return NextResponse.json(
      { error: "ElevenLabs request failed", details },
      { status: elevenResponse.status },
    );
  }

  const result = await elevenResponse.json();

  return NextResponse.json({
    mimeType: "audio/mpeg",
    audioBase64: result.audio_base64,
    alignment: result.normalized_alignment || result.alignment || null,
  });
}
