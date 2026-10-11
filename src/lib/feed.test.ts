import { describe, it, expect } from "vitest";
import { sortFeed, safeEqual, kindFromFile } from "./feed";

describe("feed rules", () => {
  it("puts pinned posts first, then newest", () => {
    const out = sortFeed([
      { id: "a", pinned: false, created_at: "2026-01-03" },
      { id: "b", pinned: true, created_at: "2026-01-01" },
      { id: "c", pinned: false, created_at: "2026-01-05" },
    ]);
    expect(out.map((p) => p.id)).toEqual(["b", "c", "a"]);
  });
  it("rejects a wrong admin password", () => {
    expect(safeEqual("wrong", "S3cretPin")).toBe(false);
    expect(safeEqual("s3cretpin", "S3cretPin")).toBe(false);
    expect(safeEqual("S3cretPin", "S3cretPin")).toBe(true);
  });
  it("detects media kinds", () => {
    expect(kindFromFile("a.gif", "image/gif")).toBe("gif");
    expect(kindFromFile("a.mp4", "video/mp4")).toBe("video");
    expect(kindFromFile("a.png", "image/png", "sticker")).toBe("sticker");
  });
});
