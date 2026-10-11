import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, APICallError } from "ai";
import { z } from "zod";

export type Recommendation = { id: string; reason: string };

export async function recommend(
  query: string,
  posts: { id: string; title: string; body: string }[],
): Promise<{ items: Recommendation[]; error?: string }> {
  if (!posts.length) return { items: [] };
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { items: [], error: "Assistant is not configured." };

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

  try {
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      maxRetries: 0,
      instructions:
        "You recommend posts from the FX COPYRIGHT feed. Pick up to 5 posts that best match what the visitor wants. Only use ids from the list. Give each a reason of at most 15 words. Return an empty list if nothing fits.",
      prompt: `Visitor is looking for: ${query}\n\nPosts:\n${JSON.stringify(posts)}`,
      output: Output.object({
        schema: z.object({
          items: z.array(z.object({ id: z.string(), reason: z.string() })),
        }),
      }),
      providerOptions: {
        openai: {
          store: false,
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const out = await result.output;
    const valid = new Set(posts.map((p) => p.id));
    return { items: out.items.filter((i) => valid.has(i.id)).slice(0, 5) };
  } catch (e) {
    const status = APICallError.isInstance(e) ? e.statusCode : undefined;
    if (status === 429) return { items: [], error: "Too many requests. Try again in a moment." };
    if (status === 402) return { items: [], error: "The assistant is out of credits right now." };
    console.error("recommend failed", e);
    return { items: [], error: "The assistant couldn't answer. Please try again." };
  }
}
