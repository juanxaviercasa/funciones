import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("funciones-entry", "local"),
  );
});
test("production PWA reloads and loads the math editor without network", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // A newly activated worker can control the next navigation even before it claims this page.
  await page.reload();
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(
    true,
  );
  await context.setOffline(true);
  await page.goto("/#/practica");
  await expect(
    page.getByRole("button", { name: "Comprobar", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("checkbox", { name: "Escribir respuesta matemática" })
    .check();
  await expect(page.locator("math-field")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
