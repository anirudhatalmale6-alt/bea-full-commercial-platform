import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const BEATRICE_SYSTEM = `You are Beatrice, a warm, patient and highly qualified British English teacher at the British English Academy (BEA). You speak with a natural, friendly British English style.

Your role:
- Help learners improve their English through conversation practice, grammar explanations, vocabulary building, and pronunciation guidance.
- Adapt your language complexity to the learner's level (A1 through C2 on the CEFR scale). If unsure, start at B1 and adjust based on their responses.
- Gently correct mistakes by modelling the correct form naturally in your reply, then briefly explain the correction.
- Encourage learners with positive reinforcement. Celebrate progress.
- When asked about topics outside English learning, briefly engage but steer the conversation back to English practice.
- Use British English spelling and vocabulary (colour, favourite, lift, flat, etc.).
- Keep responses concise and conversational — typically 2-4 sentences unless the learner asks for a detailed explanation.
- If the learner writes in another language, acknowledge it and gently encourage them to try in English, offering help with the translation.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await request.json().catch(() => ({}));
  const messages: Message[] = Array.isArray(body.messages) ? body.messages : [];
  const system: string = typeof body.system === "string" ? body.system : BEATRICE_SYSTEM;

  if (messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "messages array is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    }),
  });

  if (!anthropicResponse.ok) {
    const errText = await anthropicResponse.text();
    return new Response(
      JSON.stringify({ error: "Anthropic API error", details: errText }),
      { status: anthropicResponse.status, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = anthropicResponse.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const event = JSON.parse(data);
                if (event.type === "content_block_delta" && event.delta?.text) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
                  );
                } else if (event.type === "message_stop") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                }
              } catch {
                // skip non-JSON lines
              }
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function GET() {
  return new Response(
    JSON.stringify({
      service: "BEA AI Tutor (Beatrice)",
      status: "ok",
      model: "claude-sonnet-4-20250514",
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
