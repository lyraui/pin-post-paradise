import { Link } from "@tanstack/react-router";
import { Pin, Play } from "lucide-react";
import type { FeedPost } from "@/lib/feed";
import { MediaThumb } from "./Media";
import { LikeButton } from "./LikeButton";

/** Blog-style row: cover on top, title, excerpt, date and likes. */
export function PostCard({ post, index = 0 }: { post: FeedPost; index?: number }) {
  const cover = post.media.find((m) => m.kind !== "sticker") ?? post.media[0];
  return (
    <Link
      to="/post/$id"
      params={{ id: post.id }}
      style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
      className="glass-strong press rise block overflow-hidden rounded-3xl"
    >
      {cover && (
        <div className="relative aspect-video bg-muted">
          <MediaThumb m={cover} />
          {post.media.length > 1 && (
            <span className="glass-strong absolute bottom-3 right-3 rounded-full px-2 py-0.5 text-[11px] font-semibold">1/{post.media.length}</span>
          )}
          {cover.kind === "video" && (
            <span className="glass-strong absolute top-3 right-3 rounded-full p-1.5">
              <Play className="h-3 w-3 fill-foreground" />
            </span>
          )}
        </div>
      )}
      <div className="space-y-1.5 p-4">
        {post.pinned && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
            <Pin className="h-3 w-3" /> Pinned
          </span>
        )}
        {post.title && (
          <h2 className="font-display line-clamp-2 text-base leading-snug font-bold text-foreground">
            {post.title}
          </h2>
        )}
        {post.body && <p className="line-clamp-3 text-sm text-muted-foreground">{post.body}</p>}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
          <LikeButton postId={post.id} initial={post.likes} />
        </div>
      </div>
    </Link>
  );
}
