export const TG_GATEWAY = "https://connector-gateway.lovable.dev/telegram";

export function tgHeaders(): Record<string, string> {
  const lovable = process.env["LOVABLE_API_KEY"];
  const tg = process.env["TELEGRAM_API_KEY"];
  if (!lovable || !tg) throw new Error("Telegram is not configured");
  return { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": tg };
}

/** Secret Telegram sends back in X-Telegram-Bot-Api-Secret-Token. */
export async function webhookSecret(): Promise<string> {
  const key = process.env["TELEGRAM_API_KEY"] ?? "";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`telegram-webhook:${key}`));
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
