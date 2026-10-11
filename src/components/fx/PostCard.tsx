import { Link } from "@tanstack/react-router";
import { Pin, Play } from "lucide-react";
import type { FeedPost } from "@/lib/feed";
import { MediaThumb } from "./Media";
import { LikeButton } from "./LikeButton";

export function PostCard({ post, index = 0 }: { post: FeedPost; index?: number }) {
  const cover = post.media.find((m) => m.kind !== "sticker") ?? post.media[0];
  return (
    <Link
      to="/post/$id"
      params={{ id: post.id }}
      style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
      className="glass-strong press rise flex flex-col overflow-hidden rounded-3xl"
    >
      <div className="relative aspect-square bg-muted">
        {cover ? (
          <MediaThumb m={cover} />
        ) : (
          <div className="flex h-full items-center p-4">
            <p className="line-clamp-6 text-sm text-foreground">{post.body || post.title}</p>
          </div>
        )}
        {post.pinned && (
          <span className="glass-strong absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold text-primary">
            <Pin className="h-3 w-3" /> Pinned
          </span>
        )}
        {cover?.kind === "video" && (
          <span className="glass-strong absolute top-2 right-2 rounded-full p-1.5">
            <Play className="h-3 w-3 fill-foreground" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2.5">
        {post.title && (
          <h2 className="line-clamp-2 text-sm leading-snug font-bold text-foreground">{post.title}</h2>
        )}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
          <LikeButton postId={post.id} initial={post.likes} />
        </div>
      </div>
    </Link>
  );
}
