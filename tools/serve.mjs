// Uso: node tools/serve.mjs [porta]  →  http://localhost:5173
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startServer } from "./server.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.argv[2]) || 5173;
const { port: p } = await startServer(root, port, "0.0.0.0");
console.log(`Showreel rodando em http://localhost:${p}  (Ctrl+C para sair)`);
