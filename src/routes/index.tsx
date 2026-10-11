import { useRouter, createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listPublicPosts } from "@/lib/posts.functions";
import { PostCard } from "@/components/fx/PostCard";
import { Carousel3D } from "@/components/fx/Carousel3D";

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

const FILTERS = [
  { id: "all", label: "All" },
  { id: "video", label: "Videos" },
  { id: "image", label: "Photos" },
  { id: "gif", label: "GIFs" },
  { id: "sticker", label: "Stickers" },
] as const;

function Index() {
  const { data: posts } = useSuspenseQuery(feedQuery);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const pinned = posts.filter((p) => p.pinned);
  const latest = posts.filter((p) => !p.pinned);
  const rest =
    filter === "all" ? latest : posts.filter((p) => p.media.some((m) => m.kind === filter));
  const totalLikes = posts.reduce((n, p) => n + p.likes, 0);
  const totalMedia = posts.reduce((n, p) => n + p.media.length, 0);

  return (
    <main className="safe-top mx-auto max-w-2xl space-y-6 px-4 pb-28">
      <header className="rise space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold tracking-tight">FX COPYRIGHT</h1>
        </div>
        <div className="glass-strong hero-3d rounded-[2rem] p-5">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Fresh drops</p>
          <p className="font-display mt-1 text-xl leading-tight font-bold">
            Videos, photos, GIFs &amp; stickers — all in one place.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { n: posts.length, l: "Posts" },
              { n: totalMedia, l: "Media" },
              { n: totalLikes, l: "Likes" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl px-3 py-2 text-center">
                <div className="font-display text-lg font-bold">{s.n}</div>
                <div className="text-[11px] text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {pinned.length > 0 && (
        <section className="space-y-2">
          <h2 className="px-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Pinned
          </h2>
          <Carousel3D posts={pinned} />
        </section>
      )}

      <section className="space-y-3">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`press shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${
                filter === f.id ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {rest.map((p, i) => (
            <PostCard key={p.id} post={p} index={i} />
          ))}
        </div>
        {rest.length === 0 && (
          <p className="glass rounded-3xl p-6 text-center text-sm text-muted-foreground">
            {posts.length === 0 ? "No posts yet." : "Nothing here yet."}
          </p>
        )}
      </section>
    </main>
  );
}
