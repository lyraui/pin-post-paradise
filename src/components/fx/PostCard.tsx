import { Link } from "@tanstack/react-router";
import { Pin } from "lucide-react";
import type { FeedPost } from "@/lib/feed";
import { MediaGrid } from "./Media";
import { LikeButton } from "./LikeButton";

export function PostCard({ post }: { post: FeedPost }) {
  return (
    <Link
      to="/post/$id"
      params={{ id: post.id }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        e.currentTarget.style.setProperty("--ry", `${x * 6}deg`);
        e.currentTarget.style.setProperty("--rx", `${-y * 6}deg`);
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.setProperty("--ry", "0deg");
        e.currentTarget.style.setProperty("--rx", "0deg");
      }}
      className="glass tilt-card block space-y-3 rounded-3xl p-3 active:scale-[0.99]"
    >
      <MediaGrid media={post.media} compact />
      <div className="space-y-1 px-1" style={{ transform: "translateZ(20px)" }}>
        {post.pinned && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            <Pin className="h-3 w-3" /> Pinned
          </span>
        )}
        {post.title && (
          <h2 className="font-display text-lg leading-tight font-semibold">{post.title}</h2>
        )}
        {post.body && <p className="line-clamp-3 text-sm text-muted-foreground">{post.body}</p>}
      </div>
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
        <LikeButton postId={post.id} initial={post.likes} />
      </div>
    </Link>
  );
}
