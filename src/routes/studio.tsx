import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Lock, ShieldX, Pin, Trash2, Eye, EyeOff, Loader2, LogOut, ArrowLeft, Pencil } from "lucide-react";
import {
  adminStatus,
  adminLogin,
  adminLogout,
  adminListPosts,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
} from "@/lib/posts.functions";
import type { FeedPost } from "@/lib/feed";

export const Route = createFileRoute("/studio")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Studio — FX COPYRIGHT" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Private area." },
      { property: "og:title", content: "FX COPYRIGHT" },
      { property: "og:description", content: "Private area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Studio,
});

function Studio() {
  const status = useServerFn(adminStatus);
  const [state, setState] = useState<"loading" | "locked" | "open">("loading");
  useEffect(() => {
    status()
      .then((r) => setState(r.admin ? "open" : "locked"))
      .catch(() => setState("locked"));
  }, [status]);

  if (state === "loading")
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  if (state === "locked") return <PinGate onOpen={() => setState("open")} />;
  return <Panel onLocked={() => setState("locked")} />;
}

function PinGate({ onOpen }: { onOpen: () => void }) {
  const login = useServerFn(adminLogin);
  const [pw, setPw] = useState("");
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <main className="safe-top flex min-h-dvh items-center justify-center px-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const r = await login({ data: { password: pw } }).catch(() => ({ ok: false }));
          setBusy(false);
          if (r.ok) onOpen();
          else {
            setDenied(true);
            setPw("");
          }
        }}
        className="glass w-full max-w-xs space-y-4 rounded-3xl p-6 text-center"
      >
        {denied ? (
          <ShieldX className="mx-auto h-8 w-8 text-destructive" />
        ) : (
          <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
        )}
        <div>
          <h1 className="font-display text-lg font-semibold">
            {denied ? "Access denied" : "Restricted"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {denied ? "Wrong password. This area is private." : "Enter the password to continue."}
          </p>
        </div>
        <input
          type="password"
          value={pw}
          autoFocus
          onChange={(e) => setPw(e.target.value)}
          className="w-full rounded-full border border-input bg-secondary px-4 py-2.5 text-center text-sm tracking-widest outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          disabled={busy || !pw}
          className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Checking…" : "Unlock"}
        </button>
        <Link to="/" className="block text-xs text-muted-foreground">
          Back to feed
        </Link>
      </form>
    </main>
  );
}

function Panel({ onLocked }: { onLocked: () => void }) {
  const list = useServerFn(adminListPosts);
  const create = useServerFn(adminCreatePost);
  const update = useServerFn(adminUpdatePost);
  const remove = useServerFn(adminDeletePost);
  const logout = useServerFn(adminLogout);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const refresh = () =>
    list()
      .then(setPosts)
      .catch(() => onLocked());
  useEffect(() => {
    refresh();
  }, []);

  const guard = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      await refresh();
    } catch {
      onLocked();
    }
  };

  return (
    <main className="safe-top safe-bottom mx-auto max-w-xl space-y-5 px-4">
      <header className="flex items-center justify-between pt-2">
        <h1 className="font-display text-xl font-bold">Studio</h1>
        <div className="flex gap-2">
          <Link to="/" className="glass inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <button
            aria-label="Sign out"
            onClick={async () => {
              await logout();
              onLocked();
            }}
            className="glass rounded-full p-2"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const fd = new FormData(form);
          fd.set("pinned", String((form.elements.namedItem("pin") as HTMLInputElement).checked));
          fd.set(
            "published",
            String((form.elements.namedItem("pub") as HTMLInputElement).checked),
          );
          setBusy(true);
          setMsg(null);
          try {
            await create({ data: fd });
            form.reset();
            setMsg("Posted.");
            await refresh();
          } catch {
            setMsg("Could not post. Your session may have expired.");
          } finally {
            setBusy(false);
          }
        }}
        className="glass space-y-3 rounded-3xl p-4"
      >
        <input
          name="title"
          placeholder="Title"
          className="w-full rounded-2xl border border-input bg-secondary px-4 py-2.5 text-sm outline-none"
        />
        <textarea
          name="body"
          rows={4}
          placeholder="Write something…"
          className="w-full rounded-2xl border border-input bg-secondary px-4 py-2.5 text-sm outline-none"
        />
        <label className="block space-y-1 text-xs text-muted-foreground">
          Images, videos, GIFs
          <input
            name="files"
            type="file"
            multiple
            accept="image/*,video/*"
            className="block w-full text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-accent-foreground"
          />
        </label>
        <label className="block space-y-1 text-xs text-muted-foreground">
          Stickers
          <input
            name="stickers"
            type="file"
            multiple
            accept="image/png,image/webp,image/gif"
            className="block w-full text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-accent-foreground"
          />
        </label>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input name="pin" type="checkbox" /> Pin to top
          </label>
          <label className="flex items-center gap-2">
            <input name="pub" type="checkbox" defaultChecked /> Publish now
          </label>
        </div>
        <button
          disabled={busy}
          className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Post"}
        </button>
        {msg && <p className="text-center text-xs text-muted-foreground">{msg}</p>}
      </form>

      <section className="space-y-2">
        {posts.map((p) => (
          <div key={p.id} className="glass rounded-2xl p-3">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{p.title || "Untitled"}</div>
              <div className="text-xs text-muted-foreground">
                {p.published ? "Published" : "Draft"} · {p.media.length} media · {p.likes} likes
              </div>
            </div>
            <button
              aria-label="Edit"
              onClick={() => setEditing(editing === p.id ? null : p.id)}
              className={`rounded-full p-2 ${editing === p.id ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              aria-label={p.pinned ? "Unpin" : "Pin"}
              onClick={() => guard(() => update({ data: { id: p.id, pinned: !p.pinned } }))}
              className={`rounded-full p-2 ${p.pinned ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              <Pin className="h-4 w-4" />
            </button>
            <button
              aria-label={p.published ? "Unpublish" : "Publish"}
              onClick={() => guard(() => update({ data: { id: p.id, published: !p.published } }))}
              className="rounded-full bg-secondary p-2"
            >
              {p.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button
              aria-label="Delete"
              onClick={() => {
                if (confirm("Delete this post?")) guard(() => remove({ data: { id: p.id } }));
              }}
              className="rounded-full bg-secondary p-2 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          {editing === p.id && (
            <form
              className="mt-3 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const title = String(f.get("title") ?? "");
                const body = String(f.get("body") ?? "");
                setEditing(null);
                guard(() => update({ data: { id: p.id, title, body } }));
              }}
            >
              <input
                name="title"
                defaultValue={p.title}
                placeholder="Title"
                className="w-full rounded-2xl border border-input bg-secondary px-4 py-2 text-sm outline-none"
              />
              <textarea
                name="body"
                rows={4}
                defaultValue={p.body}
                placeholder="Write something…"
                className="w-full rounded-2xl border border-input bg-secondary px-4 py-2 text-sm outline-none"
              />
              <button className="w-full rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground">
                Save changes
              </button>
            </form>
          )}
          </div>
        ))}
      </section>
    </main>
  );
}
