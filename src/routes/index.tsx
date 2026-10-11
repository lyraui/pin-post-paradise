import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listPublicPosts } from "@/lib/posts.functions";
import { PostCard } from "@/components/fx/PostCard";
import { FindPosts } from "@/components/fx/FindPosts";

export const feedQuery = queryOptions({
  queryKey: ["feed"],
  queryFn: () => listPublicPosts(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FX COPYRIGHT" },
      { name: "description", content: "FX COPYRIGHT — the latest posts, videos, GIFs and stickers." },
      { property: "og:title", content: "FX COPYRIGHT" },
      { property: "og:description", content: "The latest posts, videos, GIFs and stickers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(feedQuery),
  component: Index,
});

function Index() {
  const { data: posts } = useSuspenseQuery(feedQuery);
  const pinned = posts.filter((p) => p.pinned);
  const rest = posts.filter((p) => !p.pinned);

  return (
    <main className="safe-top safe-bottom mx-auto max-w-xl space-y-5 px-4">
      <header className="pt-2">
        <h1 className="font-display text-2xl font-bold tracking-tight">FX COPYRIGHT</h1>
      </header>

      <FindPosts posts={posts} />

      {pinned.length > 0 && (
        <section className="space-y-3">
          <h2 className="px-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Pinned
          </h2>
          {pinned.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </section>
      )}

      <section className="space-y-3">
        {pinned.length > 0 && rest.length > 0 && (
          <h2 className="px-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Latest
          </h2>
        )}
        {rest.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
        {posts.length === 0 && (
          <p className="glass rounded-3xl p-6 text-center text-sm text-muted-foreground">
            No posts yet.
          </p>
        )}
      </section>
    </main>
  );
}
