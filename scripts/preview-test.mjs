import { preview } from "vite";
// Keep the test server in one Node process, without nested npm/cmd process trees.
const port = Number(process.argv[2]);
const outDir = process.argv[3];
if (![4174, 4175].includes(port) || !["dist", "dist-offline"].includes(outDir))
  throw Error("Configuración de servidor de pruebas inválida");
const server = await preview({
  configFile: false,
  base: "./",
  build: { outDir },
  preview: { host: "127.0.0.1", port, strictPort: true },
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.httpServer.close(() => process.exit(0)));
