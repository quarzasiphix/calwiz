import { NavLink } from "react-router";

/** NavLink sets aria-current="page" on the active link; `.chip` styles it. */
export function SkyTabs() {
  return (
    <nav aria-label="Sky views" className="flex gap-2">
      <NavLink to="/sky" end className="chip">
        Sky now
      </NavLink>
      <NavLink to="/sky/natal" className="chip">
        Birth chart
      </NavLink>
    </nav>
  );
}
