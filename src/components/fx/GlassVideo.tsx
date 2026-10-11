import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

const fmt = (s: number) =>
  Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00";

/** Video with liquid-glass controls instead of the browser's default bar. */
export function GlassVideo({ src }: { src: string }) {
  const v = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [t, setT] = useState(0);
  const [d, setD] = useState(0);

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
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setD(e.currentTarget.duration)}
        className="block w-full"
      />
      {!playing && (
        <button
          aria-label="Play"
          onClick={toggle}
          className="glass-strong absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-4"
        >
          <Play className="h-6 w-6 fill-foreground text-foreground" />
        </button>
      )}
      <div className="glass-strong absolute inset-x-2 bottom-2 flex items-center gap-2 rounded-full px-3 py-1.5">
        <button aria-label={playing ? "Pause" : "Play"} onClick={toggle}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <span className="text-[11px] tabular-nums text-foreground">{fmt(t)}</span>
        <input
          type="range"
          min={0}
          max={d || 0}
          step={0.1}
          value={t}
          onChange={(e) => {
            if (v.current) v.current.currentTime = Number(e.target.value);
          }}
          className="h-1 min-w-0 flex-1 accent-primary"
          aria-label="Seek"
        />
        <span className="text-[11px] tabular-nums text-muted-foreground">{fmt(d)}</span>
        <button
          aria-label={muted ? "Unmute" : "Mute"}
          onClick={() => {
            if (!v.current) return;
            v.current.muted = !v.current.muted;
            setMuted(v.current.muted);
          }}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <button aria-label="Fullscreen" onClick={() => v.current?.requestFullscreen?.()}>
          <Maximize className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
