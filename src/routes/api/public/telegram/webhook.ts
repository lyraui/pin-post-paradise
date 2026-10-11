import { createFileRoute } from "@tanstack/react-router";
import { safeEqual } from "@/lib/feed";

type Msg = {
  message_id: number;
  chat: { id: number; type: string };
  date: number;
  media_group_id?: string;
  text?: string;
  caption?: string;
  photo?: { file_id: string }[];
  video?: { file_id: string };
  animation?: { file_id: string };
  sticker?: { file_id: string; is_animated?: boolean; is_video?: boolean };
  document?: { file_id: string; mime_type?: string };
};

function mediaOf(m: Msg): { kind: string | null; file_id: string | null } {
  if (m.photo?.length) return { kind: "image", file_id: m.photo[m.photo.length - 1]!.file_id };
  if (m.animation) return { kind: "gif", file_id: m.animation.file_id };
  if (m.video) return { kind: "video", file_id: m.video.file_id };
  if (m.sticker && !m.sticker.is_animated) return { kind: m.sticker.is_video ? "video" : "sticker", file_id: m.sticker.file_id };
  if (m.document?.mime_type?.startsWith("image/")) return { kind: "image", file_id: m.document.file_id };
  if (m.document?.mime_type?.startsWith("video/")) return { kind: "video", file_id: m.document.file_id };
  return { kind: null, file_id: null };
}

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { webhookSecret } = await import("@/lib/telegram.server");
        const got = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
        if (!safeEqual(got, await webhookSecret())) return new Response("Unauthorized", { status: 401 });

        const update = (await request.json()) as { channel_post?: Msg; edited_channel_post?: Msg };
        const m = update.channel_post ?? update.edited_channel_post;
        if (!m?.chat?.id) return Response.json({ ok: true, ignored: true });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const media = mediaOf(m);
        const { error } = await supabaseAdmin.from("tg_posts").upsert(
          {
            chat_id: m.chat.id,
            message_id: m.message_id,
            media_group_id: m.media_group_id ?? null,
            text: m.text ?? m.caption ?? "",
            kind: media.kind,
            file_id: media.file_id,
            posted_at: new Date(m.date * 1000).toISOString(),
          },
          { onConflict: "chat_id,message_id" },
        );
        if (error) {
          console.error("tg_posts upsert", error.message);
          return Response.json({ ok: false }, { status: 500 });
        }
        return Response.json({ ok: true });
      },
    },
  },
});
