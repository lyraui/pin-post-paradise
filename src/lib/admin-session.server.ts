import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { safeEqual } from "./feed";

const COOKIE = "fx_admin";
const MAX_AGE = 60 * 60 * 12;

async function hmac(value: string): Promise<string> {
  const secret = process.env["ADMIN_SESSION_SECRET"];
  if (!secret) throw new Error("Admin is not configured");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=+$/, "");
}

export function passwordMatches(input: string): boolean {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected) return false;
  return safeEqual(input, expected);
}

export async function startAdminSession() {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  const token = `${exp}.${await hmac(exp)}`;
  setCookie(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function endAdminSession() {
  deleteCookie(COOKIE, { path: "/", secure: true, sameSite: "none" });
}

export async function isAdmin(): Promise<boolean> {
  const token = getCookie(COOKIE);
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, await hmac(exp));
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Access denied");
}
