import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Loader2, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { recommendPosts } from "@/lib/posts.functions";
import type { FeedPost } from "@/lib/feed";

export function FindPosts({ posts }: { posts: FeedPost[] }) {
  const run = useServerFn(recommendPosts);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<{ id: string; reason: string }[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const byId = new Map(posts.map((p) => [p.id, p]));

  return (
    <div className="space-y-3">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (q.trim().length < 2 || busy) return;
          setBusy(true);
          setErr(null);
          try {
            const r = await run({ data: { query: q.trim() } });
            setItems(r.items);
            setErr(r.error ?? null);
          } catch {
            setErr("Something went wrong. Please try again.");
          } finally {
            setBusy(false);
          }
        }}
        className="glass flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-4"
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What are you looking for?"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find"}
        </button>
      </form>

      {(items || err) && (
        <div className="glass space-y-2 rounded-3xl p-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-muted-foreground">Suggestions</span>
            <button
              aria-label="Close"
              onClick={() => {
                setItems(null);
                setErr(null);
              }}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          {err && <p className="px-1 text-sm text-destructive">{err}</p>}
          {items?.length === 0 && !err && (
            <p className="px-1 text-sm text-muted-foreground">No matching posts yet.</p>
          )}
          {items?.map((i) => {
            const p = byId.get(i.id);
            if (!p) return null;
            return (
              <Link
                key={i.id}
                to="/post/$id"
                params={{ id: i.id }}
                className="block rounded-2xl bg-secondary px-3 py-2"
              >
                <div className="text-sm font-semibold">{p.title || "Untitled post"}</div>
                <div className="text-xs text-muted-foreground">{i.reason}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
