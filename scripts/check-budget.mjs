import { readdir, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
const directory = process.argv[2] ?? "dist";
const files = await readdir(`${directory}/assets`);
let total = 0;
for (const file of files.filter((f) => f.endsWith(".js"))) {
  const bytes = gzipSync(await readFile(`${directory}/assets/${file}`)).length;
  if (bytes > 300_000)
    throw Error(`Chunk ${file}: ${bytes} bytes gzip excede 300 KB`);
  total += bytes;
}
if (total > 1_200_000)
  throw Error(`JavaScript total ${total} excede 1,2 MB gzip`);
console.log(
  `Presupuesto: ${Math.round(total / 1024)} KiB gzip de JavaScript (incluye módulos diferidos)`,
);
