import { useEffect } from "react";
import { useRouter, useLocation } from "@tanstack/react-router";

/** Integrates with Telegram Mini App when opened inside Telegram. */
export function TelegramBridge() {
  const router = useRouter();
  const location = useLocation();

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.initData && tg?.platform === "unknown") return;
    tg?.ready?.();
    tg?.expand?.();
    if (tg?.colorScheme === "dark") document.documentElement.classList.add("dark");
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches && !tg)
      document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const bb = tg?.BackButton;
    if (!bb) return;
    const back = () => router.history.back();
    if (location.pathname !== "/") {
      bb.show();
      bb.onClick(back);
    } else bb.hide();
    return () => bb.offClick?.(back);
  }, [location.pathname, router]);

  return null;
}
