import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { CalendarDays, Hash, Moon, Orbit, Sunrise, UserRound, WifiOff } from "lucide-react";
import { clsx } from "clsx";
import { useOnline } from "@/features/shared/hooks";
import { UpdatePrompt } from "@/features/pwa/UpdatePrompt";
import { Wordmark } from "@/ui/Wordmark";

const NAV = [
  { to: "/", label: "Today", icon: Sunrise, end: true },
  { to: "/calendar", label: "Calendar", icon: CalendarDays, end: false },
  { to: "/moon", label: "Moon", icon: Moon, end: false },
  { to: "/sky", label: "Sky", icon: Orbit, end: false },
  { to: "/numbers", label: "Numbers", icon: Hash, end: false },
] as const;

export function Layout() {
  const online = useOnline();
  const { pathname } = useLocation();

  // Move focus to the main region on navigation for screen-reader users,
  // and reset scroll like a native app would.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[232px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg">
        Skip to content
      </a>

      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-[100dvh] flex-col border-r border-line/60 px-4 py-6 lg:flex">
        <Link to="/" className="px-3" aria-label="Calwiz home">
          <Wordmark />
        </Link>
        <nav aria-label="Primary" className="mt-10 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  "flex min-h-[44px] items-center gap-3 rounded-full px-3 text-sm transition-colors",
                  isActive ? "bg-raised text-ink" : "text-muted hover:bg-raised/60 hover:text-ink",
                )
              }
            >
              <Icon size={18} strokeWidth={1.6} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <NavLink
            to="/me"
            className={({ isActive }) =>
              clsx("flex min-h-[44px] items-center gap-3 rounded-full px-3 text-sm", isActive ? "bg-raised text-ink" : "text-muted hover:text-ink")
            }
          >
            <UserRound size={18} strokeWidth={1.6} aria-hidden /> You & settings
          </NavLink>
          <NavLink to="/about" className="px-3 py-2 text-xs text-faint hover:text-muted">
            Methods & limitations
          </NavLink>
        </div>
      </aside>

      <div className="flex min-h-[100dvh] min-w-0 flex-col">
        {/* Mobile top bar */}
        <header className="pt-safe sticky top-0 z-30 border-b border-line/50 bg-bg/85 backdrop-blur-md lg:hidden">
          <div className="pl-safe pr-safe flex h-14 items-center justify-between px-4">
            <Link to="/" aria-label="Calwiz home">
              <Wordmark />
            </Link>
            <div className="flex items-center gap-1">
              {!online && (
                <span className="chip border-transparent" title="Offline — calculations still work">
                  <WifiOff size={14} aria-hidden /> Offline
                </span>
              )}
              <NavLink to="/me" className="icon-btn" aria-label="You and settings">
                <UserRound size={20} strokeWidth={1.6} />
              </NavLink>
            </div>
          </div>
        </header>

        {!online && (
          <div className="hidden px-8 pt-4 text-xs text-muted lg:block" role="status">
            <WifiOff size={12} className="mr-1 inline" aria-hidden /> Offline — all calculations run on this device.
          </div>
        )}

        <main id="main" tabIndex={-1} className="pl-safe pr-safe flex-1 overflow-x-clip pb-28 outline-none lg:pb-12">
          <Outlet />
        </main>

        {/* Mobile tab bar */}
        <nav
          aria-label="Primary"
          className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line/60 bg-bg/90 backdrop-blur-md lg:hidden"
        >
          <ul className="pl-safe pr-safe mx-auto grid max-w-lg grid-cols-5">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    clsx(
                      "flex h-16 flex-col items-center justify-center gap-1 text-2xs font-medium transition-colors",
                      isActive ? "text-ink" : "text-faint",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={22} strokeWidth={isActive ? 1.9 : 1.5} aria-hidden />
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <UpdatePrompt />
    </div>
  );
}
