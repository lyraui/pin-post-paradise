import type { FeedMedia } from "@/lib/feed";

/** Video URL that makes browsers render the first frame instead of a black box. */
const frame = (url: string) => (url.includes("#") ? url : `${url}#t=0.1`);

export function MediaItem({ m }: { m: FeedMedia }) {
  if (m.kind === "video") {
    return (
      <video
        src={frame(m.url)}
        controls
        playsInline
        preload="metadata"
        className="w-full rounded-2xl bg-muted"
      />
    );
  }
  if (m.kind === "sticker") {
    return <img src={m.url} alt="" loading="lazy" className="h-28 w-28 object-contain" />;
  }
  return <img src={m.url} alt="" loading="lazy" className="w-full rounded-2xl bg-muted object-cover" />;
}

/** Square preview for feed cards: silent looping video, image or GIF. */
export function MediaThumb({ m }: { m: FeedMedia }) {
  const cls = "h-full w-full object-cover";
  if (m.kind === "video")
    return <video src={frame(m.url)} muted autoPlay loop playsInline preload="metadata" className={cls} />;
  if (m.kind === "sticker") return <img src={m.url} alt="" className="h-full w-full object-contain p-4" />;
  return <img src={m.url} alt="" loading="lazy" className={cls} />;
}

export function MediaGrid({ media }: { media: FeedMedia[] }) {
  if (!media.length) return null;
  const stickers = media.filter((m) => m.kind === "sticker");
  const main = media.filter((m) => m.kind !== "sticker");
  return (
    <div className="space-y-2">
      {main.map((m) => (
        <MediaItem key={m.id} m={m} />
      ))}
      {stickers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stickers.map((m) => (
            <MediaItem key={m.id} m={m} />
          ))}
        </div>
      )}
    </div>
  );
}
