import { expect, test } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("funciones-entry", "local"),
  );
});

async function startFresh(page: import("@playwright/test").Page) {
  // Each Playwright test starts with a fresh context; don't race a reload with lazy imports.
  await page.goto("/", { waitUntil: "load" });
  await expect(page.locator(".hero")).toBeVisible();
}

test("starts with honest empty metrics and no horizontal overflow", async ({
  page,
}) => {
  await startFresh(page);
  await expect(page.getByText("0 intentos registrados")).toBeVisible();
  await expect(page.getByText("Sin datos")).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  await expect(page.getByRole("progressbar").first()).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
});

test("requires both lesson checks and awards XP only once", async ({
  page,
}) => {
  await startFresh(page);
  await page.getByRole("button", { name: /Empezar:/ }).click();
  const complete = page.getByRole("button", {
    name: /Responde las 2 comprobaciones/,
  });
  await expect(complete).toBeDisabled();
  const checks = page.locator(".lesson-content .quiz");
  await checks.nth(0).locator(".options button").nth(1).click();
  await checks.nth(1).locator(".options button").nth(0).click();
  const award = page.getByRole("button", {
    name: /Completar lección · \+80 XP/,
  });
  await expect(award).toBeEnabled();
  await award.click();
  await expect(page.locator(".topbar")).toContainText("80");
  await page.reload();
  await page.locator("nav button").nth(1).click();
  await page.getByRole("button", { name: "◉ ¿Qué es una función?" }).click();
  const completed = page.getByRole("button", { name: "Lección completada" });
  await expect(completed).toHaveAttribute("disabled", "");
  await expect(page.locator(".topbar")).toContainText("80");
});

test("records a submitted practice answer once", async ({ page }) => {
  await startFresh(page);
  await page.locator("nav button").nth(3).click();
  await page.locator(".options.big button").first().click();
  await page.getByRole("button", { name: "Comprobar" }).dblclick();
  await expect(page.getByRole("button", { name: /Siguiente/ })).toBeVisible();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("funciones-progress-v3")!),
  );
  expect(stored.data.attempts).toBe(1);
  expect(stored.data.studySessions).toHaveLength(1);
  expect(stored.data.studySessions[0].attempts).toBe(1);
});

test("keeps settings available on mobile and rejects invalid imports without changing progress", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-chromium",
    "Este flujo valida específicamente el breakpoint móvil.",
  );
  await startFresh(page);
  await expect(page.locator(".sidebar-bottom")).toBeVisible();
  await page.locator(".sidebar-bottom").click();
  const before = await page.evaluate(() =>
    localStorage.getItem("funciones-progress-v3"),
  );
  await page.locator('input[type="file"]').setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"progress":{}}'),
  });
  await expect(page.getByRole("alert")).toContainText(
    "no corresponde a Funciones Lab",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("funciones-progress-v3")),
  ).toBe(before);
});
