import type { FeedMedia } from "@/lib/feed";

export function MediaItem({ m, compact }: { m: FeedMedia; compact?: boolean | undefined }) {
  if (m.kind === "video") {
    return (
      <video
        src={m.url}
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
  return (
    <img
      src={m.url}
      alt=""
      loading="lazy"
      className={`w-full rounded-2xl bg-muted object-cover ${compact ? "max-h-80" : ""}`}
    />
  );
}

export function MediaGrid({ media, compact }: { media: FeedMedia[]; compact?: boolean | undefined }) {
  if (!media.length) return null;
  const stickers = media.filter((m) => m.kind === "sticker");
  const main = media.filter((m) => m.kind !== "sticker");
  const shown = compact ? main.slice(0, 1) : main;
  return (
    <div className="space-y-2">
      {shown.map((m) => (
        <MediaItem key={m.id} m={m} compact={compact} />
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
