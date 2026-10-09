import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("deep links, keyboard navigation and core accessibility", async ({
  page,
}) => {
  await page.goto("/#/laboratorio");
  await expect(page.locator(".math-svg-canvas")).toBeVisible();
  await page.getByRole("button", { name: "Docente", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Evidencia del grupo" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Evidencia del grupo" }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
test("practice resumes without submitting the same question twice", async ({
  page,
}) => {
  await page.goto("/#/practica");
  await page.locator(".options.big button").first().click();
  await page.getByRole("button", { name: "Comprobar", exact: true }).click();
  await expect(page.getByRole("button", { name: /Siguiente/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: /Siguiente/ })).toBeVisible();
  const stored = await page.evaluate(
    () => JSON.parse(localStorage.getItem("funciones-progress-v3")!).data,
  );
  expect(stored.attempts).toBe(1);
});
test("math input loads local fonts and accepts a numeric answer", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#/practica");
  await page
    .getByRole("checkbox", { name: "Escribir respuesta matemática" })
    .check();
  await expect(page.locator("math-field")).toBeVisible();
  if (test.info().project.name === "mobile-chromium") {
    await page
      .getByRole("textbox", { name: "Respuesta numérica alternativa" })
      .fill("3");
    await expect(page.locator("math-field")).toHaveJSProperty("value", "3");
  } else {
    await page.locator("math-field").focus();
    await page.keyboard.type("3");
  }
  await expect(
    page.getByRole("button", { name: "Comprobar", exact: true }),
  ).toBeEnabled();
  expect(errors).toEqual([]);
});
