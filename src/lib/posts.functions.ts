import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sortFeed, kindFromFile, type FeedPost, type MediaKind } from "./feed";

type Row = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  published: boolean;
  created_at: string;
  post_media: { id: string; kind: string; path: string; position: number }[];
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function hydrate(rows: Row[]): Promise<FeedPost[]> {
  const sb = await admin();
  const paths = rows.flatMap((r) => r.post_media.map((m) => m.path));
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data } = await sb.storage.from("media").createSignedUrls(paths, 60 * 60 * 6);
    data?.forEach((d) => d.path && d.signedUrl && urls.set(d.path, d.signedUrl));
  }
  const ids = rows.map((r) => r.id);
  const counts = new Map<string, number>();
  if (ids.length) {
    const { data } = await sb.from("post_likes").select("post_id").in("post_id", ids);
    data?.forEach((l) => counts.set(l.post_id, (counts.get(l.post_id) ?? 0) + 1));
  }
  return sortFeed(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      pinned: r.pinned,
      published: r.published,
      created_at: r.created_at,
      likes: counts.get(r.id) ?? 0,
      media: [...r.post_media]
        .sort((a, b) => a.position - b.position)
        .map((m) => ({ id: m.id, kind: m.kind as MediaKind, url: urls.get(m.path) ?? "" }))
        .filter((m) => m.url),
    })),
  );
}

const SELECT = "id,title,body,pinned,published,created_at,post_media(id,kind,path,position)";

async function publishedRows(): Promise<Row[]> {
  const sb = await admin();
  const { data, error } = await sb.from("posts").select(SELECT).eq("published", true);
  if (error) throw new Error("Could not load posts");
  return (data ?? []) as Row[];
}

// ---------- Public ----------

export const listPublicPosts = createServerFn({ method: "GET" }).handler(async () => {
  return hydrate(await publishedRows());
});

export const getPublicPost = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: row } = await sb
      .from("posts")
      .select(SELECT)
      .eq("id", data.id)
      .eq("published", true)
      .maybeSingle();
    if (!row) return null;
    return (await hydrate([row as Row]))[0];
  });

export const toggleLike = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ postId: z.string().uuid(), deviceId: z.string().min(8).max(64) }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: post } = await sb
      .from("posts")
      .select("id")
      .eq("id", data.postId)
      .eq("published", true)
      .maybeSingle();
    if (!post) throw new Error("Post not found");
    const { data: existing } = await sb
      .from("post_likes")
      .select("post_id")
      .eq("post_id", data.postId)
      .eq("device_id", data.deviceId)
      .maybeSingle();
    if (existing) {
      await sb.from("post_likes").delete().eq("post_id", data.postId).eq("device_id", data.deviceId);
    } else {
      await sb.from("post_likes").insert({ post_id: data.postId, device_id: data.deviceId });
    }
    const { count } = await sb
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", data.postId);
    return { liked: !existing, likes: count ?? 0 };
  });

export const recommendPosts = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ query: z.string().min(2).max(500) }).parse(d))
  .handler(async ({ data }) => {
    const { recommend } = await import("./recommend.server");
    const rows = await publishedRows();
    return recommend(
      data.query,
      rows.map((r) => ({ id: r.id, title: r.title, body: r.body.slice(0, 600) })),
    );
  });

// ---------- Admin ----------

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { isAdmin } = await import("./admin-session.server");
  return { admin: await isAdmin() };
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const s = await import("./admin-session.server");
    if (!s.passwordMatches(data.password)) return { ok: false as const };
    await s.startAdminSession();
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const s = await import("./admin-session.server");
  s.endAdminSession();
  return { ok: true };
});

export const adminListPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./admin-session.server");
  await requireAdmin();
  const sb = await admin();
  const { data } = await sb.from("posts").select(SELECT);
  return hydrate((data ?? []) as Row[]);
});

export const adminCreatePost = createServerFn({ method: "POST" })
  .inputValidator((d) => {
    if (!(d instanceof FormData)) throw new Error("Invalid form");
    return d;
  })
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const sb = await admin();
    const title = String(data.get("title") ?? "").slice(0, 200);
    const body = String(data.get("body") ?? "").slice(0, 20000);
    const pinned = data.get("pinned") === "true";
    const published = data.get("published") === "true";
    const { data: post, error } = await sb
      .from("posts")
      .insert({ title, body, pinned, published })
      .select("id")
      .single();
    if (error || !post) throw new Error("Could not create post");

    const files = data.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    const stickers = data
      .getAll("stickers")
      .filter((f): f is File => f instanceof File && f.size > 0);
    const all = [...files.map((f) => ({ f })), ...stickers.map((f) => ({ f, hint: "sticker" }))];
    let pos = 0;
    for (const { f, hint } of all as { f: File; hint?: string }[]) {
      const ext = f.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
      const path = `${post.id}/${crypto.randomUUID()}.${ext}`;
      const up = await sb.storage.from("media").upload(path, f, { contentType: f.type });
      if (up.error) continue;
      await sb.from("post_media").insert({
        post_id: post.id,
        kind: kindFromFile(f.name, f.type, hint),
        path,
        position: pos++,
      });
    }
    return { id: post.id };
  });

export const adminUpdatePost = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        pinned: z.boolean().optional(),
        published: z.boolean().optional(),
        title: z.string().max(300).optional(),
        body: z.string().max(20000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const sb = await admin();
    const patch: { pinned?: boolean; published?: boolean; title?: string; body?: string } = {};
    if (data.pinned !== undefined) patch.pinned = data.pinned;
    if (data.published !== undefined) patch.published = data.published;
    if (data.title !== undefined) patch.title = data.title;
    if (data.body !== undefined) patch.body = data.body;
    await sb.from("posts").update(patch).eq("id", data.id);
    return { ok: true };
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-session.server");
    await requireAdmin();
    const sb = await admin();
    const { data: media } = await sb.from("post_media").select("path").eq("post_id", data.id);
    if (media?.length) await sb.storage.from("media").remove(media.map((m) => m.path));
    await sb.from("posts").delete().eq("id", data.id);
    return { ok: true };
  });
