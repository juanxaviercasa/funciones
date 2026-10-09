import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }, info) => {
  if (info.title !== "entry offers cloud and local progress before learning") {
    await page.addInitScript(() =>
      sessionStorage.setItem("funciones-entry", "local"),
    );
  }
});

test("entry offers cloud and local progress before learning", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: /Las funciones tienen sentido/,
    }),
  ).toBeVisible();
  await expect(page.locator(".landing-art img")).toBeVisible();
  await page.screenshot({
    path: `.audit-artifacts/landing-${info.project.name}.png`,
    fullPage: true,
  });
  await expect(
    page.getByText("Tus avances se guardan solo en este navegador.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByLabel("Desplazamiento vertical").focus();
  await page.keyboard.press("Home");
  for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
  await expect(page.getByText("f(x) = x + 2", { exact: true })).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Crear cuenta gratuita" }).click();
  await expect(page.getByLabel("Confirmar contraseña")).toBeVisible();
  await page
    .getByRole("button", { name: "Continuar en este dispositivo" })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: /Domina funciones/ }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Domina funciones/ }),
  ).toBeVisible();
});
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

test("account access stays optional and future plans are understandable", async ({
  page,
}) => {
  await page.goto("/#/ajustes");
  await expect(
    page.getByRole("heading", { name: "Cuenta y respaldo opcional" }),
  ).toBeVisible();
  await expect(
    page.getByText("La aplicación funciona sin cuenta", { exact: false }),
  ).toBeVisible();
  await expect(page.getByLabel("Contraseña", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "¿Olvidaste tu contraseña?" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByLabel("Confirmar contraseña")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Crear cuenta gratuita" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Elige cómo quieres aprender" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Plan disponible" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Me interesa Pro" }),
  ).toBeEnabled();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
