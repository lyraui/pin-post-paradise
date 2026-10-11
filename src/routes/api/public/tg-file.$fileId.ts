import { createFileRoute } from "@tanstack/react-router";

/** Streams a channel media file. Only file ids stored from the channel are served. */
export const Route = createFileRoute("/api/public/tg-file/$fileId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const fileId = params.fileId;
        if (!/^[\w-]{10,200}$/.test(fileId)) return new Response("Bad id", { status: 400 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: row } = await supabaseAdmin.from("tg_posts").select("kind").eq("file_id", fileId).limit(1).maybeSingle();
        if (!row) return new Response("Not found", { status: 404 });

        const { TG_GATEWAY, tgHeaders } = await import("@/lib/telegram.server");
        const h = tgHeaders();
        const info = await fetch(`${TG_GATEWAY}/getFile`, {
          method: "POST",
          headers: { ...h, "Content-Type": "application/json" },
          body: JSON.stringify({ file_id: fileId }),
        });
        if (!info.ok) {
          console.error("getFile", info.status, await info.text());
          return new Response("Unavailable", { status: 502 });
        }
        const j = (await info.json()) as { ok: boolean; result?: { file_path?: string } };
        const path = j.result?.file_path;
        if (!path) return new Response("Unavailable", { status: 502 });
        const file = await fetch(`${TG_GATEWAY}/file/${path}`, { headers: h });
        if (!file.ok || !file.body) return new Response("Unavailable", { status: 502 });
        const type =
          file.headers.get("content-type") && file.headers.get("content-type") !== "application/octet-stream"
            ? file.headers.get("content-type")!
            : path.endsWith(".mp4")
              ? "video/mp4"
              : path.endsWith(".webp")
                ? "image/webp"
                : path.endsWith(".png")
                  ? "image/png"
                  : "image/jpeg";
        return new Response(file.body, {
          headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400" },
        });
      },
    },
  },
});
