import { useRef, useState } from "react";
import type { FeedMedia } from "@/lib/feed";
import { MediaItem } from "./Media";

/** Swipeable media: one item per slide with dots. Single items render plainly. */
export function MediaSlider({ media }: { media: FeedMedia[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  if (media.length === 0) return null;
  if (media.length === 1) return <MediaItem m={media[0]!} />;
  return (
    <div className="space-y-2">
      <div
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          setI(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-2xl"
      >
        {media.map((m) => (
          <div key={m.id} className="flex w-full shrink-0 snap-center items-center justify-center">
            <MediaItem m={m} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5">
        {media.map((m, n) => (
          <button
            key={m.id}
            aria-label={`Slide ${n + 1}`}
            onClick={() => ref.current?.scrollTo({ left: n * ref.current.clientWidth, behavior: "smooth" })}
            className={`h-1.5 rounded-full transition-all ${n === i ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
