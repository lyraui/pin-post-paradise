import { useRef } from "react";

/** Minimal video: tap anywhere on it to play/pause. No control buttons. */
export function GlassVideo({ src }: { src: string }) {
  const v = useRef<HTMLVideoElement>(null);

  const toggle = () => {
    const el = v.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-muted">
      <video
        ref={v}
        src={src.includes("#") ? src : `${src}#t=0.1`}
        playsInline
        preload="metadata"
        onClick={toggle}
        className="block w-full cursor-pointer"
      />
    </div>
  );
}
