import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import type { ReactElement } from "react";
import { ProfileProvider } from "@/features/profile/ProfileProvider";
import { defaultProfile, type Profile } from "@/features/profile/schema";

export function renderAt(path: string, routePath: string, el: ReactElement, profile: Partial<Profile> = {}) {
  const initial: Profile = { ...defaultProfile(), timeZone: "Europe/Warsaw", timeZoneFollowsDevice: false, ...profile };
  return render(
    <ProfileProvider initial={initial}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={routePath} element={el} />
        </Routes>
      </MemoryRouter>
    </ProfileProvider>,
  );
}
