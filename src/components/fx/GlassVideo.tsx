import { useRef } from "react";

/** Minimal video: tap to play/pause. Falls back to muted play if the browser blocks sound. */
export function GlassVideo({ src }: { src: string }) {
  const v = useRef<HTMLVideoElement>(null);

  const toggle = async () => {
    const el = v.current;
    if (!el) return;
    if (!el.paused && !el.ended) {
      el.pause();
      return;
    }
    el.muted = false;
    el.volume = 1;
    try {
      await el.play();
    } catch {
      el.muted = true;
      el.play().catch(() => {});
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-muted">
      <video
        ref={v}
        src={src}
        playsInline
        preload="metadata"
        // @ts-expect-error webkit attr
        webkit-playsinline="true"
        onClick={toggle}
        className="block w-full cursor-pointer"
      />
    </div>
  );
}
