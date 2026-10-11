<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Admin studio auth is a server-checked password (secret ADMIN_PASSWORD) plus an HMAC-signed httpOnly cookie; every admin server function calls requireAdmin — the /studio UI gate is only UX.
- Media lives in a private bucket and is served only via short-lived signed URLs for published posts, so drafts never leak.
