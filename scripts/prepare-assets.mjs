import {
  cpSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
} from "node:fs";
mkdirSync("public/mathlive-fonts", { recursive: true });
cpSync("node_modules/mathlive/fonts", "public/mathlive-fonts", {
  recursive: true,
});
mkdirSync("public/katex-fonts", { recursive: true });
for (const file of readdirSync("node_modules/katex/dist/fonts").filter((f) =>
  f.endsWith(".woff2"),
))
  cpSync(`node_modules/katex/dist/fonts/${file}`, `public/katex-fonts/${file}`);
const css = readFileSync(
  "node_modules/katex/dist/katex.min.css",
  "utf8",
).replace(/src:[^;}]+/g, (source) => {
  const font = source.match(/url\(([^)]+\.woff2)\)/);
  return font
    ? `src:url(${font[1].replace("fonts/", "katex-fonts/")}) format("woff2")`
    : source;
});
writeFileSync("public/katex.css", css);

// Ship available copyright/license notices with libraries and runtime dependencies.
const visited = new Set();
function copyLicenses(name, parent = ".") {
  if (!/^(@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(name)) return;
  const nested = `${parent}/node_modules/${name}`;
  const directory = existsSync(`${nested}/package.json`)
    ? nested
    : `node_modules/${name}`;
  if (visited.has(directory) || !existsSync(`${directory}/package.json`))
    return;
  visited.add(directory);
  const metadata = JSON.parse(
    readFileSync(`${directory}/package.json`, "utf8"),
  );
  const target = `public/licenses/${name.replace("@", "").replaceAll("/", "--")}`;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (
      entry.isFile() &&
      /^(licen[cs]e|copying|notice)(\..*)?$/i.test(entry.name)
    ) {
      mkdirSync(target, { recursive: true });
      cpSync(`${directory}/${entry.name}`, `${target}/${entry.name}`);
    }
  }
  for (const dependency of Object.keys(metadata.dependencies ?? {}))
    copyLicenses(dependency, directory);
}
for (const name of Object.keys(
  JSON.parse(readFileSync("package.json", "utf8")).dependencies,
))
  copyLicenses(name);
for (const name of [
  "workbox-window",
  "workbox-core",
  "workbox-precaching",
  "workbox-routing",
  "workbox-strategies",
])
  copyLicenses(name);
