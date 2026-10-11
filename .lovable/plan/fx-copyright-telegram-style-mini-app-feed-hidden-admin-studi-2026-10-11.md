# FX COPYRIGHT — Telegram-style mini app feed + hidden admin studio

## What you get
- **Public feed (home page)**: very clean, mobile-first, made to feel like a Telegram mini app. Frosted "liquid glass" cards, no glow effects. Posts look like blog cards with images, videos, stickers and GIFs. Light 3D tilt/depth on cards.
- **Pinned posts**: posts you pin show at the top in a separate "Pinned" row, clearly marked.
- **Likes**: visitors can like a post (one like per device), count shown on each card.
- **Post page**: open a post to see full text and all its media.
- **"Find posts" assistant**: a small box where a visitor types what they want; AI picks the most relevant posts and gives a one-line reason for each.
- **Admin studio**: not linked anywhere on the site. Opens only at a hidden address and asks for your password (FXSHNWAZ). Inside: create post, add text, upload images/videos/GIFs/stickers, pin/unpin, publish/unpublish, delete. Nothing else.
- **Access denied**: wrong password or no session shows a clear "Access denied" screen. Draft posts and their media can't be seen by visitors.
- **Telegram ready**: works inside Telegram (uses Telegram's theme, back button, safe areas) and in any phone browser.

## Security checks (verified after building)
- Visitors opening the admin address without the password see "Access denied".
- The password is stored as a protected secret on the server, never in the website code.
- Unpublished posts and their uploaded files return "access denied" to visitors.
- Small automated tests confirm: wrong password is rejected, visitors only get published posts, pinned posts come first.

## Technical details
- Enable Lovable Cloud: tables `posts` (title, body, pinned, published, created_at), `post_media` (type: image/video/gif/sticker, path, order), `post_likes` (post_id, device_id, unique pair). RLS: anon can SELECT only published posts/media; all writes go through server functions.
- Storage: private bucket `media`; public feed gets signed URLs only for published posts' media from a server function.
- Admin auth: `ADMIN_PASSWORD` secret (= FXSHNWAZ). Server function checks it and sets a signed httpOnly session cookie (HMAC with `ADMIN_SESSION_SECRET`). Every admin server function verifies the cookie; route `/studio` (no links, `noindex`) shows PIN form or Access Denied.
- Likes via server function with a random device id kept in localStorage.
- AI recommend: server function using Lovable AI Gateway (`openai/gpt-6-astra`, Responses API, streamed, structured output) given the published posts list; returns post ids + short reasons; handles 402/429 with friendly messages.
- Telegram: load `telegram-web-app.js` in root head, read `themeParams`, `expand()`, safe-area padding.
- Design: neutral light/dark tokens in styles.css, backdrop-blur glass surfaces, distinctive font pair (no Inter), CSS 3D perspective tilt on cards, no shadows-as-glow.
- Per-route head metadata for `/` and `/post/$id`; `/studio` set to noindex.
