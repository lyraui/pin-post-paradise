import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toggleLike } from "@/lib/posts.functions";

function deviceId() {
  let id = localStorage.getItem("fx_device");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("fx_device", id);
  }
  return id;
}

export function LikeButton({ postId, initial }: { postId: string; initial: number }) {
  const like = useServerFn(toggleLike);
  const [count, setCount] = useState(initial);
  const [liked, setLiked] = useState(false);
  useEffect(() => {
    setLiked(localStorage.getItem(`fx_like_${postId}`) === "1");
  }, [postId]);

  return (
    <button
      type="button"
      aria-label={liked ? "Unlike" : "Like"}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLiked(!liked);
        setCount((c) => c + (liked ? -1 : 1));
        try {
          const r = await like({ data: { postId, deviceId: deviceId() } });
          setLiked(r.liked);
          setCount(r.likes);
          localStorage.setItem(`fx_like_${postId}`, r.liked ? "1" : "0");
          (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
        } catch {
          setLiked(liked);
          setCount(initial);
        }
      }}
      className="glass inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition active:scale-95"
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-destructive text-destructive" : ""}`} />
      {count}
    </button>
  );
}
