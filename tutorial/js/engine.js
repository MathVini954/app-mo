/* ==========================================================================
   REEL ENGINE — infraestrutura comum de vídeos em HTML + GSAP
   --------------------------------------------------------------------------
   - Palco de tamanho fixo (ex.: 1080×1920) escalado para a janela.
   - Uma única timeline GSAP; cues de som registrados ao lado das animações.
   - Relógio mestre = AudioContext (sem deriva entre imagem e som).
   - Tela inicial (autoplay), controles, reinício, mudo, tela cheia.
   - ?render=1 expõe window.SHOWREEL para a exportação quadro a quadro
     (tools/render.mjs). ?t=12.5 congela a timeline num instante.
   ========================================================================== */

window.ReelEngine = function (opts) {
  "use strict";

  const W = opts.width;
  const H = opts.height;
  const DURATION = opts.duration;
  const CFG = opts.config || {};
  const PARAMS = new URLSearchParams(location.search);
  const RENDER = PARAMS.has("render");
  if (RENDER) document.documentElement.classList.add("render");

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  // Re-rasteriza transformações 2D a cada frame: texto sempre nítido em zoom.
  gsap.config({ force3D: false, nullTargetWarn: false });

  const stage = $("#stage");
  let stageScale = 1;
  function fitStage() {
    if (RENDER) {
      stageScale = 1;
      stage.style.transform = "none";
      return;
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    stageScale = Math.min(vw / W, vh / H);
    stage.style.transform = `translate(${(vw - W * stageScale) / 2}px, ${(vh - H * stageScale) / 2}px) scale(${stageScale})`;
  }

  /** Retângulo de um elemento em coordenadas do palco (independe da escala da janela). */
  function rectOf(el) {
    const r = el.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    return { x: (r.left - s.left) / stageScale, y: (r.top - s.top) / stageScale, w: r.width / stageScale, h: r.height / stageScale };
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  const cues = [];
  const sfx = (type, t, o) => cues.push(Object.assign({ type, t }, o || {}));
  const derived = [];

  function seek(t) {
    tl.totalTime(Math.max(0, Math.min(DURATION, t)));
    const now = tl.totalTime();
    derived.forEach((fn) => fn(now));
  }

  function audioPlan() {
    const a = CFG.audio || {};
    const lines = (a.narration && a.narration.lines) || [];
    return Object.assign({
      cues,
      duration: DURATION,
      synthMusic: a.synthMusic !== false,
      sfxOn: a.sfx !== false,
      duckDb: a.narration && a.narration.duckMusicDb,
      lastLineAt: lines.length ? lines[lines.length - 1].cue : null
    }, opts.audioPlan ? opts.audioPlan() : {});
  }

  const api = { W, H, DURATION, CFG, RENDER, PARAMS, $, $$, stage, rectOf, mulberry32, tl, sfx, derived, seek };

  async function build() {
    fitStage();
    if (opts.fonts) await Promise.all(opts.fonts.map((f) => document.fonts.load(f, "ABCÇÍÓãõ")));
    await document.fonts.ready;
    await opts.build(api);
    tl.set({}, {}, DURATION);
    cues.sort((a, b) => a.t - b.t);
    seek(0);
  }

  /* ---------------- player em tempo real ---------------- */
  const ui = {
    start: $("#start"),
    replay: $("#replay"),
    controls: $("#controls"),
    time: $("#ctl-time"),
    narr: $("#st-narr"),
    music: $("#st-music")
  };
  const player = { state: "loading", ctx: null, muteNode: null, engine: null, t0: 0, perfStart: 0, pausedAt: 0, media: null, muted: false, elements: [] };

  function audioClock() {
    const p = player;
    if (p.ctx && p.engine) return p.ctx.currentTime - p.t0 - (p.ctx.outputLatency || p.ctx.baseLatency || 0);
    if (p.state === "paused") return p.pausedAt;
    return (performance.now() - p.perfStart) / 1000;
  }

  function stopElements() {
    player.elements.forEach((el) => { try { el.pause(); el.currentTime = 0; } catch (e) { /* noop */ } });
  }

  function scheduleNarrationElements() {
    // fallback (file://): narração tocada por <audio> nos cues da timeline
    const m = player.media;
    if (!m || !m.narration) return;
    m.narration.forEach((n) => {
      if (n.kind !== "element" || n.cue <= 0.01) return;
      tl.call(() => {
        // callbacks também disparam com o playhead voltando: só toca indo para frente
        if (player.state !== "playing" || tl.totalTime() < n.cue - 0.01) return;
        n.el.currentTime = 0;
        n.el.muted = player.muted;
        n.el.play().catch(() => {});
      }, null, n.cue);
    });
  }

  function startPlayback() {
    const p = player;
    ui.replay.classList.remove("is-on");
    stopElements();
    p.state = "starting";
    seek(0);
    if (p.engine) {
      try { p.engine.out.disconnect(); } catch (e) { /* noop */ }
      p.engine = null;
    }
    if (p.ctx) {
      p.ctx.resume();
      const plan = audioPlan();
      const media = Object.assign({}, p.media || {});
      if (p.media && p.media.narration) {
        media.duckSegments = [];
        const lines = (CFG.audio && CFG.audio.narration && CFG.audio.narration.lines) || [];
        p.media.narration.forEach((n) => {
          if (n.kind !== "element") return;
          if (n.cue <= 0.01) ShowreelAudio.speechSegments(lines).forEach((sg) => media.duckSegments.push(sg));
          else media.duckSegments.push({ start: n.cue, end: n.cue + (isFinite(n.el.duration) ? n.el.duration : 2.4) });
        });
      }
      if (p.media && p.media.music && p.media.music.kind === "element") {
        media.music = null;
        plan.synthMusic = false;
      }
      p.engine = new ShowreelAudio.Engine(p.ctx, { masterVolume: (CFG.audio && CFG.audio.masterVolume) || 0.9, inputGainDb: CFG.audio && CFG.audio.inputGainDb, softClipDb: CFG.audio && CFG.audio.softClipDb, destination: p.muteNode });
      p.t0 = p.ctx.currentTime + 0.12;
      p.engine.schedule(p.t0, plan, media);
      setTimeout(() => {
        if (p.media && p.media.narration) {
          p.media.narration.forEach((n) => {
            if (n.kind === "element" && n.cue <= 0.01) { n.el.currentTime = 0; n.el.muted = p.muted; n.el.play().catch(() => {}); }
          });
        }
        if (p.media && p.media.music && p.media.music.kind === "element") {
          const el = p.media.music.el;
          el.currentTime = 0; el.muted = p.muted; el.volume = p.media.music.volume == null ? 0.8 : p.media.music.volume;
          el.play().catch(() => {});
        }
      }, 120);
    } else {
      p.perfStart = performance.now();
    }
    p.state = "playing";
    updateControls();
  }

  function endPlayback() {
    player.state = "ended";
    ui.replay.classList.add("is-on");
    document.body.classList.remove("hide-cursor");
    updateControls();
  }

  function togglePause() {
    const p = player;
    if (p.state === "playing") {
      p.state = "paused";
      if (p.ctx && p.engine) p.ctx.suspend();
      else p.pausedAt = audioClock();
      p.elements.forEach((el) => { if (!el.paused) { el.dataset.wasPlaying = "1"; el.pause(); } });
    } else if (p.state === "paused") {
      if (p.ctx && p.engine) p.ctx.resume();
      else p.perfStart = performance.now() - p.pausedAt * 1000;
      p.state = "playing";
      p.elements.forEach((el) => { if (el.dataset.wasPlaying) { delete el.dataset.wasPlaying; el.play().catch(() => {}); } });
    } else if (p.state === "ended") {
      startPlayback();
      return;
    }
    updateControls();
  }

  function toggleMute() {
    const p = player;
    p.muted = !p.muted;
    if (p.muteNode) p.muteNode.gain.setTargetAtTime(p.muted ? 0 : 1, p.ctx.currentTime, 0.02);
    p.elements.forEach((el) => (el.muted = p.muted));
    updateControls();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen && document.exitFullscreen();
  }

  function updateControls() {
    const b = (act) => $(`[data-act="${act}"]`, ui.controls);
    b("toggle").textContent = player.state === "paused" ? "CONTINUAR" : player.state === "ended" ? "REPETIR" : "PAUSAR";
    b("mute").textContent = player.muted ? "SOM OFF" : "SOM ON";
  }

  function tick() {
    if (player.state !== "playing") return;
    const t = audioClock();
    if (t >= DURATION) {
      seek(DURATION);
      endPlayback();
      return;
    }
    seek(Math.max(0, t));
    ui.time.textContent = `${Math.max(0, t).toFixed(2).padStart(5, "0")} / ${DURATION.toFixed(2)}`;
  }

  async function prepareAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      ui.narr.textContent = "ÁUDIO — Web Audio indisponível neste navegador (vídeo sem som)";
      ui.music.textContent = "";
      return;
    }
    try {
      player.ctx = new AC({ latencyHint: "interactive" });
      player.muteNode = player.ctx.createGain();
      player.muteNode.connect(player.ctx.destination);
    } catch (e) {
      player.ctx = null;
      return;
    }
    const media = await ShowreelAudio.loadMedia(player.ctx, CFG);
    player.media = media;
    if (media.narration) media.narration.forEach((n) => { if (n.kind === "element") player.elements.push(n.el); });
    if (media.music && media.music.kind === "element") player.elements.push(media.music.el);

    const a = CFG.audio || {};
    if (media.narrationMode === "single") ui.narr.textContent = `NARRAÇÃO — ${a.narration.single} carregada`;
    else if (media.narrationMode === "lines") ui.narr.textContent = `NARRAÇÃO — ${media.narration.length} de ${a.narration.lines.length} frases carregadas`;
    else ui.narr.textContent = "NARRAÇÃO — nenhum arquivo encontrado. O vídeo roda com legendas e trilha, sem voz.";
    if (media.music) ui.music.textContent = `TRILHA — ${a.music.src} + efeitos sintetizados`;
    else ui.music.textContent = a.synthMusic === false ? "TRILHA — desativada" : "TRILHA E EFEITOS — sintetizados em tempo real (Web Audio)";
    scheduleNarrationElements();
  }

  function bindUI() {
    let hideTimer = 0;
    const showControls = () => {
      if (player.state === "loading" || player.state === "idle") return;
      ui.controls.classList.add("is-visible");
      document.body.classList.remove("hide-cursor");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        ui.controls.classList.remove("is-visible");
        if (player.state === "playing") document.body.classList.add("hide-cursor");
      }, 2200);
    };
    window.addEventListener("mousemove", showControls);
    window.addEventListener("touchstart", showControls, { passive: true });
    window.addEventListener("resize", fitStage);

    const begin = () => {
      if (player.state !== "idle") return;
      gsap.to(ui.start, {
        opacity: 0, duration: 0.35, ease: "power2.in",
        onComplete: () => {
          ui.start.style.display = "none";
          document.body.classList.add("hide-cursor");
          startPlayback();
        }
      });
      player.state = "starting";
      if (player.ctx) player.ctx.resume();
    };
    ui.start.addEventListener("click", begin);
    ui.start.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); begin(); } });
    ui.replay.addEventListener("click", startPlayback);
    ui.controls.addEventListener("click", (e) => {
      const act = e.target.getAttribute && e.target.getAttribute("data-act");
      if (act === "toggle") togglePause();
      if (act === "restart") startPlayback();
      if (act === "mute") toggleMute();
      if (act === "full") toggleFullscreen();
    });
    window.addEventListener("keydown", (e) => {
      if (player.state === "idle") { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); begin(); } return; }
      if (player.state === "loading" || player.state === "starting") return;
      const k = e.key.toLowerCase();
      if (k === " " || k === "k") { e.preventDefault(); togglePause(); }
      if (k === "r") startPlayback();
      if (k === "m") toggleMute();
      if (k === "f") toggleFullscreen();
    });
  }

  /* ---------------- boot ---------------- */
  const ready = build();

  if (RENDER) {
    window.SHOWREEL = {
      duration: DURATION,
      width: W,
      height: H,
      name: opts.name,
      posterTime: opts.posterTime,
      ready: ready.then(() => true),
      seek: (t) => { seek(t); return tl.totalTime(); },
      renderAudio: () => ShowreelAudio.renderOffline(audioPlan(), CFG, 48000),
      cues: () => cues.slice()
    };
  } else {
    ui.start.classList.add("is-loading");
    bindUI();
    ready.then(prepareAudio).then(() => {
      if (player.state === "loading") player.state = "idle";
      ui.start.classList.remove("is-loading");
      ui.start.focus();
    }).catch((err) => {
      console.error(err);
      player.state = "idle";
      ui.start.classList.remove("is-loading");
    });
    gsap.ticker.add(tick);
  }

  if (PARAMS.has("t") && !RENDER) {
    ready.then(() => {
      ui.start.style.display = "none";
      player.state = "paused";
      player.pausedAt = parseFloat(PARAMS.get("t")) || 0; // Espaço continua deste ponto (sem som: modo de inspeção)
      seek(player.pausedAt);
    });
  }

  return api;
};
