import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { build } from "esbuild";

const outputDir = "dist";
await mkdir(outputDir, { recursive: true });
await build({
  entryPoints: ["src/main.tsx"],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: `${outputDir}/app.js`,
  loader: { ".tsx": "tsx", ".woff": "file", ".woff2": "file", ".ttf": "file" },
});

const html = await readFile("index.html", "utf8");
await copyFile("styles.css", `${outputDir}/styles.css`);
await writeFile(
  `${outputDir}/index.html`,
  html
    .replaceAll("./dist/app.js", "./app.js")
    .replaceAll("./dist/app.css", "./app.css"),
);
