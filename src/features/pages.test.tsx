import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderAt } from "@/test/render";
import CalendarPage from "@/features/calendar/CalendarPage";
import DayPage from "@/features/day/DayPage";
import NatalPage from "@/features/sky/NatalPage";
import NumbersPage from "@/features/numbers/NumbersPage";

beforeAll(() => {
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
});

describe("calendar", () => {
  it("renders the requested month from the URL with real phase events", () => {
    renderAt("/calendar/2024-01?d=2024-01-25", "/calendar/:month", <CalendarPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/January 2024/);
    const cell = screen.getByRole("button", { name: /25 January 2024.*Full Moon/ });
    expect(cell).toHaveAttribute("tabindex", "0");
    expect(screen.getAllByRole("gridcell").length % 7).toBe(0);
  });

  it("moves selection with arrow keys", async () => {
    const user = userEvent.setup();
    renderAt("/calendar/2024-01?d=2024-01-25", "/calendar/:month", <CalendarPage />);
    screen.getByRole("button", { name: /25 January 2024/ }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: /26 January 2024/ })).toHaveAttribute("tabindex", "0");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: /^Friday,? 2 February 2024/ })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/February 2024/);
  });

  it("shows personal numbers only with a birth date", () => {
    renderAt("/calendar/2026-11?d=2026-11-10", "/calendar/:month", <CalendarPage />, { birth: { date: "1990-03-15" } });
    expect(screen.getByRole("button", { name: /10 November 2026.*personal day 4/ })).toBeInTheDocument();
  });
});

describe("day page", () => {
  it("deep-links any date and shows computed data with sources labelled", () => {
    renderAt("/day/2024-04-08", "/day/:date", <DayPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/8 April 2024/);
    expect(screen.getAllByText(/Total solar eclipse/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Computed").length).toBeGreaterThan(0);
    expect(screen.getByText("Tradition")).toBeInTheDocument();
  });

  it("never fakes an AI answer when no service is configured", () => {
    renderAt("/day/2024-04-08", "/day/:date", <DayPage />);
    expect(screen.queryByRole("button", { name: /^Ask$/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Copy as prompt/ })).toBeInTheDocument();
  });
});

describe("birth chart", () => {
  it("refuses to show a rising sign without birth time and place", () => {
    renderAt("/sky/natal", "/sky/natal", <NatalPage />, { birth: { date: "1990-03-15" } });
    expect(screen.getByText(/Needs time & place/)).toBeInTheDocument();
    expect(screen.queryByText("Midheaven")).toBeNull();
  });

  it("shows Ascendant and houses with full birth data", () => {
    renderAt("/sky/natal", "/sky/natal", <NatalPage />, {
      birth: { date: "1990-03-15", time: "09:30", place: { name: "Warsaw, Poland", latitude: 52.23, longitude: 21.01, timeZone: "Europe/Warsaw" } },
    });
    expect(screen.getByText("Rising")).toBeInTheDocument();
    expect(screen.getByText("Midheaven")).toBeInTheDocument();
    const table = screen.getByRole("table", { name: /Natal positions/ });
    expect(within(table).getAllByRole("row").length).toBe(12); // header + 10 bodies + MC
  });
});

describe("numbers", () => {
  it("shows the working for 1999-09-29 (old app said 12)", async () => {
    renderAt("/numbers?d=1999-09-29", "/numbers", <NumbersPage />);
    const user = userEvent.setup();
    await user.click(screen.getAllByRole("button", { name: "Working" })[0]!);
    expect(screen.getByText("9 + 11 + 1 = 21 → 3")).toBeInTheDocument();
  });
});
