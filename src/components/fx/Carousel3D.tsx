import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Pin } from "lucide-react";
import type { FeedPost } from "@/lib/feed";
import { MediaThumb } from "./Media";

/** Pinned posts in a swipeable 3D cover-flow. The centered card is flat so text stays sharp. */
export function Carousel3D({ posts }: { posts: FeedPost[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      for (const child of Array.from(el.children) as HTMLElement[]) {
        const c = child.offsetLeft + child.offsetWidth / 2;
        const d = Math.max(-1, Math.min(1, (c - mid) / child.offsetWidth));
        const card = child.firstElementChild as HTMLElement | null;
        if (!card) continue;
        card.style.transform =
          Math.abs(d) < 0.02
            ? "none"
            : `perspective(1000px) rotateY(${-d * 28}deg) scale(${1 - Math.abs(d) * 0.12})`;
        card.style.opacity = String(1 - Math.abs(d) * 0.35);
      }
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // Smooth auto-slide; pauses while the user is touching.
    let touching = false;
    const down = () => (touching = true);
    const up = () => setTimeout(() => (touching = false), 3000);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("touchstart", down, { passive: true });
    el.addEventListener("touchend", up);
    const timer = window.setInterval(() => {
      if (touching || el.children.length < 2) return;
      const kids = Array.from(el.children) as HTMLElement[];
      const mid = el.scrollLeft + el.clientWidth / 2;
      let cur = 0;
      kids.forEach((k, n) => {
        if (Math.abs(k.offsetLeft + k.offsetWidth / 2 - mid) < Math.abs(kids[cur]!.offsetLeft + kids[cur]!.offsetWidth / 2 - mid)) cur = n;
      });
      const next = kids[(cur + 1) % kids.length]!;
      el.scrollTo({ left: next.offsetLeft + next.offsetWidth / 2 - el.clientWidth / 2, behavior: "smooth" });
    }, 3500);
    return () => {
      window.clearInterval(timer);
      el.removeEventListener("scroll", update);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("touchstart", down);
      el.removeEventListener("touchend", up);
      window.removeEventListener("resize", update);
    };
  }, [posts.length]);

  return (
    <div
      ref={ref}
      className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[12vw] py-2 sm:px-[calc(50%-10rem)]"
    >
      {posts.map((p) => {
        const cover = p.media.find((m) => m.kind !== "sticker") ?? p.media[0];
        return (
          <div key={p.id} className="w-[76vw] shrink-0 sm:w-80 snap-center">
            <Link
              to="/post/$id"
              params={{ id: p.id }}
              className="glass-strong relative block aspect-[4/3] overflow-hidden rounded-[2rem] transition-[transform,opacity] duration-200 ease-out"
            >
              <div className="absolute inset-0 bg-muted">{cover && <MediaThumb m={cover} />}</div>
              <span className="glass-strong absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary">
                <Pin className="h-3 w-3" /> Pinned
              </span>
              <div className="glass absolute inset-x-3 bottom-3 rounded-full px-4 py-2 backdrop-blur-md">
                <div className="line-clamp-1 text-sm font-semibold text-foreground">
                  {p.title || p.body || "Post"}
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
