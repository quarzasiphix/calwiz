import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { ProfileProvider } from "@/features/profile/ProfileProvider";
import { Layout } from "./Layout";
import { RouteBoundary } from "./ErrorBoundary";
import { PageLoading } from "@/ui/States";

// Today is the landing route and is bundled eagerly; the rest load on demand.
import TodayPage from "@/features/today/TodayPage";
const CalendarPage = lazy(() => import("@/features/calendar/CalendarPage"));
const DayPage = lazy(() => import("@/features/day/DayPage"));
const MoonPage = lazy(() => import("@/features/moon/MoonPage"));
const SkyPage = lazy(() => import("@/features/sky/SkyPage"));
const NatalPage = lazy(() => import("@/features/sky/NatalPage"));
const NumbersPage = lazy(() => import("@/features/numbers/NumbersPage"));
const ProfilePage = lazy(() => import("@/features/profile/ProfilePage"));
const AboutPage = lazy(() => import("@/features/about/AboutPage"));
const NotFound = lazy(() => import("./NotFound"));

/** Route table. Each feature owns one folder under src/features/. */
export function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {(
              [
                ["/", <TodayPage />],
                ["/calendar", <CalendarPage />],
                ["/calendar/:month", <CalendarPage />],
                ["/day/:date", <DayPage />],
                ["/moon", <MoonPage />],
                ["/sky", <SkyPage />],
                ["/sky/natal", <NatalPage />],
                ["/numbers", <NumbersPage />],
                ["/me", <ProfilePage />],
                ["/about", <AboutPage />],
                ["*", <NotFound />],
              ] as const
            ).map(([path, el]) => (
              <Route
                key={path}
                path={path}
                element={
                  <RouteBoundary>
                    <Suspense fallback={<PageLoading />}>{el}</Suspense>
                  </RouteBoundary>
                }
              />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
  );
}
