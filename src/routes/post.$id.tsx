import { useRouter, createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Pin } from "lucide-react";
import { getPublicPost } from "@/lib/posts.functions";
import { MediaGrid } from "@/components/fx/Media";
import { LikeButton } from "@/components/fx/LikeButton";

const postQuery = (id: string) =>
  queryOptions({ queryKey: ["post", id], queryFn: () => getPublicPost({ data: { id } }) });

export const Route = createFileRoute("/post/$id")({
  loader: async ({ context, params }) => {
    if (!/^[0-9a-f-]{36}$/i.test(params.id)) throw notFound();
    const post = await context.queryClient.ensureQueryData(postQuery(params.id));
    if (!post) throw notFound();
    return { title: post.title, body: post.body };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.title ? `${loaderData.title} — FX COPYRIGHT` : "Post — FX COPYRIGHT";
    const d = loaderData?.body?.slice(0, 150) || "A post on FX COPYRIGHT.";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="safe-top mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-sm text-muted-foreground">This post isn't available.</p>
      <Link to="/" className="mt-4 inline-block text-sm font-semibold text-primary">
        Back to feed
      </Link>
    </main>
  ),
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
  component: PostPage,
});

function PostPage() {
  const { id } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQuery(id));
  if (!post) return null;
  return (
    <main className="safe-top mx-auto pb-32 max-w-xl space-y-4 px-4">
      <Link to="/" className="glass inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm">
        <ArrowLeft className="h-4 w-4" /> Feed
      </Link>
      <article className="glass-strong rise space-y-4 rounded-3xl p-4">
        {post.pinned && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            <Pin className="h-3 w-3" /> Pinned
          </span>
        )}
        {post.title && <h1 className="font-display text-2xl font-bold">{post.title}</h1>}
        <MediaGrid media={post.media} />
        {post.body && <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{post.body}</p>}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {new Date(post.created_at).toLocaleString()}
          </span>
          <LikeButton postId={post.id} initial={post.likes} />
        </div>
      </article>
    </main>
  );
}
