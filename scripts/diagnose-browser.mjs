import { chromium } from "@playwright/test";
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  page.on("pageerror", (error) => console.log("PAGE ERROR:", error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text());
  });
  page.on("requestfailed", (request) =>
    console.log("REQUEST FAILED:", request.url(), request.failure()?.errorText),
  );
  await page.goto(process.argv[2] ?? "http://127.0.0.1:4175/#/laboratorio");
  await page.locator(".math-svg-canvas, main h1").first().waitFor();
  console.log("Heading:", await page.locator("h1").allTextContents());
  console.log("Graph count:", await page.locator(".math-svg-canvas").count());
} finally {
  await browser.close();
}
