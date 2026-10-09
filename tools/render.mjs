#!/usr/bin/env node
/* ==========================================================================
   EXPORTAÇÃO PARA MP4 — quadro a quadro, determinística
   --------------------------------------------------------------------------
   Abre a página (?render=1) num Chromium headless (Playwright), posiciona a
   timeline GSAP em cada frame exato, captura o PNG e envia ao ffmpeg.
   O áudio (trilha + efeitos sintetizados + narração, se existir) é renderizado
   com OfflineAudioContext pelo mesmo motor usado no navegador: a sincronia do
   vídeo exportado é idêntica à da versão ao vivo — sem gravação de tela.

   Requisitos: Node 18+, `npm install`, `npx playwright install chromium`, ffmpeg.

   Uso:
     node tools/render.mjs                         # showreel 1920×1080, 60 fps
     node tools/render.mjs --page tutorial/index.html   # tutorial 1080×1920
     node tools/render.mjs --fps 30                # 30 fps (arquivo menor)
     node tools/render.mjs --scale 0.5 --fps 30    # prévia rápida (metade da resolução)
     node tools/render.mjs --from 6 --to 9         # só um trecho
     node tools/render.mjs --query "&brand=Seu%20Nome&ig=@perfil"
     node tools/render.mjs --no-audio --out dist/mudo.mp4
     node tools/render.mjs --fps 30 --crf 21 --abr 128k --maxrate 3M   # arquivo leve (WhatsApp)
   ========================================================================== */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { once } from "node:events";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { startServer } from "./server.mjs";

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else { out[key] = next; i++; }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fps = Number(args.fps) || 60;
const scale = Number(args.scale) || 1;
const crf = String(args.crf || 16);
const abr = typeof args.abr === "string" ? args.abr : "320k";
const maxrate = typeof args.maxrate === "string" ? args.maxrate : null;
const from = Number(args.from) || 0;
const withAudio = !args["no-audio"];
const ffmpegBin = args.ffmpeg || process.env.FFMPEG || "ffmpeg";
const query = typeof args.query === "string" ? args.query : "";
const pagePath = typeof args.page === "string" ? args.page.replace(/^\/+/, "") : "index.html";

if (spawnSync(ffmpegBin, ["-version"]).status !== 0) {
  console.error(`ffmpeg não encontrado ("${ffmpegBin}"). Instale o ffmpeg ou informe --ffmpeg /caminho/ffmpeg.`);
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright não encontrado. Rode:  npm install  &&  npx playwright install chromium");
  process.exit(1);
}

const { server, port } = await startServer(root);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.error("[página]", e.message));

const cleanup = async () => {
  await browser.close().catch(() => {});
  server.close();
};

try {
  await page.goto(`http://127.0.0.1:${port}/${pagePath}?render=1${query}`);
  await page.evaluate(() => window.SHOWREEL.ready);
  const info = await page.evaluate(() => ({
    duration: window.SHOWREEL.duration,
    width: window.SHOWREEL.width || 1920,
    height: window.SHOWREEL.height || 1080,
    name: window.SHOWREEL.name || "showreel",
    poster: window.SHOWREEL.posterTime
  }));
  const duration = info.duration;
  if (info.width !== 1920 || info.height !== 1080) await page.setViewportSize({ width: info.width, height: info.height });
  const outW = Math.round((info.width * scale) / 2) * 2;
  const outH = Math.round((info.height * scale) / 2) * 2;
  const out = path.resolve(root, args.out || `dist/${info.name}-${outW}x${outH}-${fps}fps.mp4`);
  const end = args.to != null ? Math.min(duration, Number(args.to)) : duration;
  const frames = Math.round((end - from) * fps);

  let wavPath = null;
  if (withAudio) {
    const r = await page.evaluate(() => window.SHOWREEL.renderAudio());
    wavPath = path.join(os.tmpdir(), `${info.name}-${process.pid}.wav`);
    fs.writeFileSync(wavPath, Buffer.from(r.wavBase64, "base64"));
    console.log(`Áudio  · trilha: ${r.music} · narração: ${r.narration || "nenhum arquivo (vídeo sai sem voz)"}`);
  }

  fs.mkdirSync(path.dirname(out), { recursive: true });
  const ff = ["-y", "-hide_banner", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-i", "-"];
  if (wavPath) ff.push("-ss", String(from), "-t", String(end - from), "-i", wavPath);
  const vf = [];
  if (scale !== 1) vf.push(`scale=${outW}:${outH}:flags=lanczos`);
  vf.push("format=yuv420p");
  ff.push("-vf", vf.join(","), "-c:v", "libx264", "-preset", "slow", "-crf", crf, "-profile:v", "high", "-r", String(fps));
  // teto de bitrate opcional: mantém o arquivo pequeno sem perder a nitidez do texto
  if (maxrate) ff.push("-maxrate", maxrate, "-bufsize", String(parseFloat(maxrate) * 2) + maxrate.replace(/[\d.]/g, ""));
  if (wavPath) ff.push("-c:a", "aac", "-b:a", abr, "-ar", "48000");
  ff.push("-movflags", "+faststart", out);

  const enc = spawn(ffmpegBin, ff, { stdio: ["pipe", "inherit", "inherit"] });
  const done = once(enc, "close");
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => window.SHOWREEL.seek(t), from + i / fps);
    const png = await page.screenshot({ type: "png" });
    if (!enc.stdin.write(png)) await once(enc.stdin, "drain");
    if (i % fps === 0 || i === frames - 1) {
      const el = (Date.now() - t0) / 1000;
      const eta = (el / (i + 1)) * (frames - i - 1);
      process.stdout.write(`\rVídeo  · frame ${i + 1}/${frames}  ·  ${el.toFixed(0)} s  ·  restante ~${eta.toFixed(0)} s   `);
    }
  }
  enc.stdin.end();
  const [code] = await done;
  process.stdout.write("\n");
  if (wavPath) fs.rmSync(wavPath, { force: true });
  if (code !== 0) throw new Error(`ffmpeg terminou com código ${code}`);

  // capa (frame final) para usar como thumbnail no Instagram/portfólio/WhatsApp
  if (!args["no-poster"]) {
    const poster = out.replace(/\.mp4$/i, "") + "-capa.png";
    await page.evaluate((t) => window.SHOWREEL.seek(t), info.poster != null ? info.poster : duration - 1);
    await page.screenshot({ path: poster, type: "png" });
    console.log(`Capa   · ${path.relative(root, poster)}`);
  }
  console.log(`Pronto · ${path.relative(root, out)}`);
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await cleanup();
}
