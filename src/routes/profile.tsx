import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User } from "lucide-react";

type TgUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  is_premium?: boolean;
};

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — FX COPYRIGHT" },
      { name: "description", content: "Your FX COPYRIGHT profile from Telegram." },
      { property: "og:title", content: "Profile — FX COPYRIGHT" },
      { property: "og:description", content: "Your FX COPYRIGHT profile from Telegram." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const [user, setUser] = useState<TgUser | null | undefined>(undefined);
  useEffect(() => {
    const u = (window as any).Telegram?.WebApp?.initDataUnsafe?.user as TgUser | undefined;
    setUser(u ?? null);
  }, []);

  const name = user ? [user.first_name, user.last_name].filter(Boolean).join(" ") : "";

  return (
    <main className="safe-top mx-auto max-w-md px-4 pb-32">
      <h1 className="font-display pt-2 text-2xl font-bold tracking-tight">Profile</h1>
      <section className="glass-strong rise mt-6 flex flex-col items-center gap-3 rounded-3xl p-8 text-center">
        <div className="glass-strong h-24 w-24 overflow-hidden rounded-full p-1">
          {user?.photo_url ? (
            <img src={user.photo_url} alt={name} className="h-full w-full rounded-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>
        {user === undefined ? null : user ? (
          <>
            <div className="text-xl font-bold">{name || "Telegram user"}</div>
            {user.username && <div className="text-sm text-primary">@{user.username}</div>}
          </>
        ) : (
          <>
            <div className="text-lg font-bold">Guest</div>
            <p className="text-sm text-muted-foreground">
              Open FX COPYRIGHT inside Telegram to see your photo and name here.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
