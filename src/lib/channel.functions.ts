import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { FeedMedia, MediaKind } from "./feed";

export type ChannelPost = { id: string; text: string; posted_at: string; media: FeedMedia[] };

export const listChannelPosts = createServerFn({ method: "GET" }).handler(async (): Promise<ChannelPost[]> => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data } = await sb
    .from("tg_posts")
    .select("chat_id, message_id, media_group_id, text, kind, file_id, posted_at")
    .order("posted_at", { ascending: false })
    .order("message_id", { ascending: true })
    .limit(200);
  const out: ChannelPost[] = [];
  const groups = new Map<string, ChannelPost>();
  for (const r of data ?? []) {
    const gid = r.media_group_id ? `${r.chat_id}:${r.media_group_id}` : null;
    let post = gid ? groups.get(gid) : undefined;
    if (!post) {
      post = { id: gid ?? `${r.chat_id}:${r.message_id}`, text: "", posted_at: r.posted_at, media: [] };
      out.push(post);
      if (gid) groups.set(gid, post);
    }
    if (r.text && !post.text) post.text = r.text;
    if (r.file_id && r.kind)
      post.media.push({ id: String(r.message_id), kind: r.kind as MediaKind, url: `/api/public/tg-file/${r.file_id}` });
  }
  return out;
});
