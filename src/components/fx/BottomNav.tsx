import { Link, useLocation } from "@tanstack/react-router";
import { Home, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/studio")) return null;
  return (
    <nav className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4">
      <div className="glass-strong pointer-events-auto flex w-full max-w-xs items-center gap-1 rounded-full p-1.5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`press flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[11px] font-semibold transition-colors ${
                active ? "nav-active text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
