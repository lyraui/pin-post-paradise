import { useRouter, createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listPublicPosts } from "@/lib/posts.functions";
import { PostCard } from "@/components/fx/PostCard";

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
  errorComponent: ({ reset }) => {
    const router = useRouter();
    return (
      <main className="safe-top mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Couldn't load. Check your connection.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Try again
        </button>
      </main>
    );
  },
  component: Index,
});

function Index() {
  const { data: posts } = useSuspenseQuery(feedQuery);
  const pinned = posts.filter((p) => p.pinned);
  const rest = posts.filter((p) => !p.pinned);

  return (
    <main className="safe-top safe-bottom mx-auto max-w-2xl space-y-5 px-4">
      <header className="pt-2">
        <h1 className="font-display text-2xl font-bold tracking-tight">FX COPYRIGHT</h1>
      </header>

      {pinned.length > 0 && (
        <section className="space-y-3">
          <h2 className="px-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Pinned
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {pinned.map((p, i) => (
              <PostCard key={p.id} post={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        {pinned.length > 0 && rest.length > 0 && (
          <h2 className="px-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Latest
          </h2>
        )}
        <div className="grid grid-cols-2 gap-3">
          {rest.map((p, i) => (
            <PostCard key={p.id} post={p} index={i + pinned.length} />
          ))}
        </div>
        {posts.length === 0 && (
          <p className="glass rounded-3xl p-6 text-center text-sm text-muted-foreground">
            No posts yet.
          </p>
        )}
      </section>
    </main>
  );
}
