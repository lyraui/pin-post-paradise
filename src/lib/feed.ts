export type MediaKind = "image" | "video" | "gif" | "sticker";

export type FeedMedia = { id: string; kind: MediaKind; url: string };

export type FeedPost = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  published: boolean;
  created_at: string;
  likes: number;
  media: FeedMedia[];
};

/** Pinned posts first, then newest first. */
export function sortFeed<T extends { pinned: boolean; created_at: string }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.created_at.localeCompare(a.created_at);
  });
}

/** Constant-time string compare. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export function kindFromFile(name: string, mime: string, hint?: string): MediaKind {
  if (hint === "sticker") return "sticker";
  if (mime === "image/gif" || name.toLowerCase().endsWith(".gif")) return "gif";
  if (mime.startsWith("video/")) return "video";
  return "image";
}
