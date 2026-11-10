import { expect, test } from "@playwright/test";

test("today loads with real Moon data and no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Moon|Crescent|Gibbous|Quarter/);
  await expect(page.getByText(/of the disk lit/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("navigate calendar → day → back, with deep-linkable URLs", async ({ page }) => {
  await page.goto("/calendar/2024-04?d=2024-04-08");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/April 2024/);
  await page.locator('[data-date="2024-04-09"]').click();
  await expect(page).toHaveURL(/d=2024-04-09/);
  await page.locator('[data-date="2024-04-08"]').click();
  await page.getByRole("link", { name: "Open full day" }).click();
  await expect(page).toHaveURL(/\/day\/2024-04-08$/);
  await expect(page.getByText("Total solar eclipse").first()).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/calendar\/2024-04/);
});

test("profile persists across reloads and drives personal numbers", async ({ page }) => {
  await page.goto("/me");
  await page.getByLabel("Birth date").fill("1990-03-15");
  await page.goto("/numbers?d=2026-11-10");
  await expect(page.getByText("Personal day", { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("Life Path", { exact: true }).first()).toBeVisible();
});

test("manifest is valid and installable", async ({ request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.ok()).toBe(true);
  const m = await res.json();
  expect(m.display).toBe("standalone");
  expect(m.short_name).toBe("Calwiz");
  expect(m.icons.some((i: { purpose: string; sizes: string }) => i.purpose === "maskable" && i.sizes === "512x512")).toBe(true);
  for (const icon of m.icons) expect((await request.get(icon.src)).ok()).toBe(true);
});

test("works offline after first visit", async ({ page, context }) => {
  await page.goto("/");
  await page.waitForFunction(async () => (await navigator.serviceWorker.ready).active !== null);
  // Visit lazily loaded routes once so their chunks are precached (they are, via the manifest, but assert anyway).
  await page.reload();
  await context.setOffline(true);
  await page.goto("/moon?d=2025-03-14");
  await expect(page.getByRole("heading", { name: /Full Moon/ })).toBeVisible();
  await expect(page.getByText(/Total lunar eclipse/).first()).toBeVisible();
  await page.goto("/sky");
  await expect(page.getByRole("heading", { name: "Positions" })).toBeVisible();
  await context.setOffline(false);
});

test("no horizontal overflow on any screen", async ({ page }) => {
  for (const url of ["/", "/calendar/2024-04?d=2024-04-08", "/calendar/2024-04?view=list", "/day/2024-04-08", "/moon", "/sky", "/sky/natal", "/numbers", "/me", "/about"]) {
    await page.goto(url);
    const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(sw, url).toBeLessThanOrEqual(cw);
  }
});
