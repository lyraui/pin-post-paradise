import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { listChannelPosts } from "@/lib/channel.functions";
import { MediaSlider } from "@/components/fx/MediaSlider";

const channelQuery = queryOptions({
  queryKey: ["channel"],
  queryFn: () => listChannelPosts(),
  refetchInterval: 8000,
});

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Channel feed — FX COPYRIGHT" },
      { name: "description", content: "Live posts from the FX COPYRIGHT Telegram channel." },
      { property: "og:title", content: "Channel feed — FX COPYRIGHT" },
      { property: "og:description", content: "Live posts from the FX COPYRIGHT Telegram channel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(channelQuery),
  component: Feed,
});

function Feed() {
  const { data: posts } = useSuspenseQuery(channelQuery);
  return (
    <main className="safe-top mx-auto max-w-xl space-y-4 px-4 pb-28">
      <header className="rise flex items-center justify-between pt-2">
        <h1 className="font-display text-2xl font-bold tracking-tight">Channel</h1>
        <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Live
        </span>
      </header>
      {posts.map((p, i) => (
        <article
          key={p.id}
          style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
          className="glass-strong rise space-y-3 rounded-3xl p-3"
        >
          {p.media.length > 0 && (
            <div className="overflow-hidden rounded-2xl bg-muted/40 [&_img]:mx-auto [&_img]:max-h-[70vh] [&_img]:w-full [&_img]:object-contain">
              <MediaSlider media={p.media.map((m) => (m.kind === "sticker" ? { ...m, kind: "image" as const } : m))} />
            </div>
          )}
          {p.text && <p className="px-1 text-sm whitespace-pre-wrap text-foreground">{p.text}</p>}
          <p className="px-1 text-[11px] text-muted-foreground">{new Date(p.posted_at).toLocaleString()}</p>
        </article>
      ))}
      {posts.length === 0 && (
        <div className="glass rounded-3xl p-6 text-center text-sm text-muted-foreground">
          <Send className="mx-auto mb-2 h-5 w-5" />
          No channel posts yet. New posts appear here automatically.
        </div>
      )}
    </main>
  );
}
