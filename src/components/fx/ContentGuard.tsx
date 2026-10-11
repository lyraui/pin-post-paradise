import { useEffect } from "react";

/** Discourages copying and casual source viewing on public pages. */
export function ContentGuard() {
  useEffect(() => {
    const block = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, [contenteditable]")) return;
      e.preventDefault();
    };
    const keys = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (
        k === "f12" ||
        (mod && ["u", "s", "c", "p"].includes(k) && !(e.target as HTMLElement)?.closest("input, textarea")) ||
        (mod && e.shiftKey && ["i", "j", "c"].includes(k))
      )
        e.preventDefault();
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("keydown", keys);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("keydown", keys);
    };
  }, []);
  return null;
}
