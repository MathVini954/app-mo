/* ==========================================================================
   SHOWREEL — "SUA IDEIA. NOSSO CÓDIGO."
   Uma única timeline GSAP (30 s) dirige todas as cenas. O relógio do áudio
   (AudioContext) é o relógio mestre: a timeline é posicionada a cada frame
   no tempo exato do som — sincronia sem deriva entre imagem, trilha e voz.

   Mapa de tempo (s)               Batida 123 BPM ancorada no drop (20.60 s)
   0.00  A IDEIA (digitação)        7.429  DESIGN → CÓDIGO (impacto)
   3.90  BLOCOS → INTERFACE         11.332 clique · 13.283 smartphone
   9.00  EXPERIÊNCIA / RESPONSIVO   14.746 SITES · 16.698 LANDING · 18.649 SISTEMAS
   13.9  SITES / LANDING / SISTEMAS 20.600 drop · 23.527 NO DIGITAL
   20.5  SUA EMPRESA. NO DIGITAL.   24.990 desaceleração · 27.917 assinatura
   25.0  ASSINATURA → preto final
   ========================================================================== */

(function () {
  "use strict";

  const CFG = window.SHOWREEL_CONFIG || {};
  const W = 1920;
  const H = 1080;
  const DURATION = 30;
  const BEAT = 60 / 123;
  const ANCHOR = 20.6;
  const beat = (k) => ANCHOR + k * BEAT;

  const C = { black: "#080808", white: "#ffffff", light: "#f2f2f2", graphite: "#191919", blue: "#245bff" };

  const PARAMS = new URLSearchParams(location.search);
  const RENDER = PARAMS.has("render");
  if (RENDER) document.documentElement.classList.add("render");

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  // Re-rasteriza transformações 2D a cada frame: tipografia gigante sempre nítida.
  gsap.config({ force3D: false, nullTargetWarn: false });

  /* ------------------------------------------------------------------------
     UTILIDADES
     ------------------------------------------------------------------------ */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

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
    const ox = (vw - W * stageScale) / 2;
    const oy = (vh - H * stageScale) / 2;
    stage.style.transform = `translate(${ox}px, ${oy}px) scale(${stageScale})`;
  }

  function rectOf(el) {
    const r = el.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    return {
      x: (r.left - s.left) / stageScale,
      y: (r.top - s.top) / stageScale,
      w: r.width / stageScale,
      h: r.height / stageScale
    };
  }

  /** Divide o texto em spans por caractere, preservando elementos internos. */
  function splitChars(el, cls) {
    const out = [];
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          Array.from(child.textContent).forEach((ch) => {
            const s = document.createElement("span");
            s.className = cls || "ch";
            if (ch === " ") {
              s.classList.add("sp");
              s.textContent = " ";
            } else {
              s.textContent = ch;
            }
            frag.appendChild(s);
            out.push(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
    return out;
  }

  const mctx = document.createElement("canvas").getContext("2d");
  function measure(font, text) {
    mctx.font = font;
    return mctx.measureText(text);
  }
  /** Métricas verticais de uma fonte para caixas com line-height: 1. */
  function vMetrics(family, weight, fs, capChar) {
    const m = measure(`${weight} ${fs}px ${family}`, capChar || "H");
    const fA = m.fontBoundingBoxAscent;
    const fD = m.fontBoundingBoxDescent;
    const baseline = (fs - (fA + fD)) / 2 + fA; // distância do topo da caixa até a baseline
    return { capH: m.actualBoundingBoxAscent, baseline, fA, fD };
  }

  /** Ajusta o font-size para que o elemento ocupe exatamente `targetW` px. */
  function fitFont(el, targetW, maxFs) {
    el.style.fontSize = "100px";
    const w = el.offsetWidth;
    const fs = Math.min(maxFs || 9999, (100 * targetW) / w);
    el.style.fontSize = fs + "px";
    return fs;
  }

  /** Bisseção sobre a curva de easing: em que instante o valor cruza `target`. */
  function crossTime(t0, dur, from, to, target, easeName) {
    const ease = gsap.parseEase(easeName);
    const want = (target - from) / (to - from);
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (ease(mid) < want) lo = mid; else hi = mid;
    }
    return t0 + dur * lo;
  }

  /* ------------------------------------------------------------------------
     TIMELINE + CUES DE SOM (mesma fonte de verdade)
     ------------------------------------------------------------------------ */
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  const cues = [];
  const sfx = (type, t, o) => cues.push(Object.assign({ type, t }, o || {}));
  const derived = []; // funções recalculadas a cada frame (sincronizadas ao tempo)

  const focus = { x: 960, y: 540 }; // leitura X/Y do HUD
  const inkTo = (color, t) => tl.to(stage, { "--ink": color, duration: 0.3, ease: "power2.out" }, t);
  const bgSet = (color, t) => tl.set("#bg", { backgroundColor: color }, t);

  function wipe(sel, t, dur, from) {
    tl.set(sel, { visibility: "visible" }, t);
    tl.fromTo(sel, { clipPath: from || "inset(50% 50% 50% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: dur, ease: "power2.inOut", immediateRender: false }, t);
  }
  /** Revela da esquerda para a direita (clip-path com valores explícitos). */
  function reveal(targets, t, dur, stagger, ease) {
    tl.fromTo(targets, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: dur, ease: ease || "power3.out", stagger: stagger || 0 }, t);
  }

  /* ------------------------------------------------------------------------
     CONFIGURAÇÃO → DOM
     ------------------------------------------------------------------------ */
  function applyConfig() {
    $$("[data-cfg]").forEach((el) => {
      const v = CFG[el.getAttribute("data-cfg")];
      if (v != null && v !== "") el.textContent = v;
    });
    const projects = CFG.projects || {};
    $$("[data-cfg-url]").forEach((el) => {
      const p = projects[el.getAttribute("data-cfg-url")];
      if (p && p.url) el.textContent = p.url;
    });
    $$(".shot[data-shot]").forEach((el) => {
      const key = el.getAttribute("data-shot");
      const p = projects[key];
      if (p && p.screenshot) {
        el.style.backgroundImage = `url("${p.screenshot}")`;
        (key === "browser" ? $("#browser .br-screen") : el.parentElement).classList.add("has-shot");
      }
    });
  }

  /* ------------------------------------------------------------------------
     GRID EDITORIAL
     ------------------------------------------------------------------------ */
  const grid = { v: [], h: [] };
  function buildGrid() {
    const g = $("#grid");
    for (let i = 0; i <= 12; i++) {
      const d = document.createElement("i");
      d.className = "gl";
      d.style.left = 80 + (i * 1760) / 12 + "px";
      g.appendChild(d);
      grid.v.push(d);
    }
    [128, 952].forEach((y) => {
      const d = document.createElement("i");
      d.className = "gh";
      d.style.top = y + "px";
      g.appendChild(d);
      grid.h.push(d);
    });
  }
  function gridIn(t) {
    tl.to(grid.v, { scaleY: 1, duration: 1.1, ease: "power2.inOut", stagger: { each: 0.035, from: "center" } }, t);
    tl.to(grid.h, { scaleX: 1, duration: 1.2, ease: "power2.inOut", stagger: 0.1 }, t + 0.1);
  }
  function gridOut(t) {
    tl.to(grid.v, { scaleY: 0, duration: 0.6, ease: "power2.inOut", stagger: { each: 0.02, from: "edges" } }, t);
    tl.to(grid.h, { scaleX: 0, duration: 0.6, ease: "power2.inOut" }, t);
  }

  /* ------------------------------------------------------------------------
     HUD
     ------------------------------------------------------------------------ */
  const hud = {};
  function buildHud() {
    const labels = ["01 / THE IDEA", "02 / DESIGN → CODE", "03 / EXPERIENCE", "04 / SERVICES", "05 / PRESENCE", "06 / LET'S TALK"];
    const times = [0, 3.95, 9.2, 13.9, 20.5, 24.99];
    const roll = $(".roll");
    roll.innerHTML = labels.map((l) => `<span>${l}</span>`).join("");
    const spans = $$("span", roll);
    gsap.set(spans, { yPercent: 110 });
    gsap.set(spans[0], { yPercent: 0 });
    for (let i = 1; i < spans.length; i++) {
      tl.to(spans[i - 1], { yPercent: -110, duration: 0.6, ease: "power2.inOut" }, times[i]);
      tl.fromTo(spans[i], { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: "power2.inOut" }, times[i] + 0.1);
    }
    tl.to("#hud", { opacity: 1, duration: 1.4, ease: "power2.out" }, 0.8);

    hud.tc = $("#tc");
    hud.hx = $("#hx");
    hud.hy = $("#hy");
    hud.bar = $("#progress i");
  }

  /* ========================================================================
     CENA 1 — A IDEIA
     ======================================================================== */
  const S1 = {};
  function buildScene1() {
    const line = $("#type-line");
    const caret = $("#caret");
    const rule = $("#type-rule");
    const chars = splitChars($("#type-text"), "tch");
    const ideaStart = chars.length - 6; // "IDEIA."
    chars.slice(ideaStart).forEach((c) => c.classList.add("blue"));

    // Medidas no estado "frase completa".
    chars.forEach((c) => (c.style.display = "inline-block"));
    const fullW = line.offsetWidth;
    const finalX = -fullW / 2;
    gsap.set(line, { x: finalX });
    const ideaRect = rectOf(chars[ideaStart]);
    const lineLeft = 960 + finalX;
    chars.forEach((c) => (c.style.display = ""));
    gsap.set(line, { x: 0 });

    // Nota editorial acima da frase.
    const note = $("#s1-note");
    gsap.set(note, { left: lineLeft, top: 498 - 92 });
    const noteTick = $(".note-tick", note);
    const noteTexts = $$(".note-label, .note-meta", note);
    gsap.set(noteTick, { scaleX: 0 });
    gsap.set(noteTexts, { clipPath: "inset(0% 100% 0% 0%)" });

    // IDEIA. gigante (mesmo peso, mesma fonte): começa sobre a palavra digitada.
    const big = $("#big-idea");
    const bch = splitChars(big, "bch");
    const fsB = fitFont(big, 1650);
    const bw = big.offsetWidth;
    const vm = vMetrics('"Space Grotesk"', 700, fsB, "I");
    const bigX = (W - bw) / 2;
    const bigY = 540 + vm.capH / 2 - vm.baseline;
    gsap.set(big, { left: bigX, top: bigY, x: 0, y: 0, scale: 1 });

    // Caixas de tinta de cada letra (viram blocos geométricos).
    const inkFont = `700 ${fsB}px "Space Grotesk"`;
    const inkBoxes = bch.map((s) => {
      const r = rectOf(s);
      const m = measure(inkFont, s.textContent);
      const base = r.y + vm.baseline;
      const pad = fsB * 0.012;
      return {
        left: r.x - m.actualBoundingBoxLeft - pad,
        top: base - m.actualBoundingBoxAscent - pad,
        width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight + pad * 2,
        height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + pad * 2
      };
    });

    const s0 = 84 / fsB;
    const x0 = ideaRect.x - bigX;
    const y0 = ideaRect.y - bigY;
    const cx = ideaRect.x + (bw * s0) / 2;
    const cy = ideaRect.y + (fsB * s0) / 2;
    const s1 = s0 * 1.06;
    gsap.set(big, { x: x0, y: y0, scale: s0 });

    /* --- timeline --- */
    // cursor piscando sobre o branco absoluto
    tl.set(caret, { opacity: 0 }, 0.28);
    tl.set(caret, { opacity: 1 }, 0.52);
    gsap.set(rule, { scaleX: 0 });
    tl.to(rule, { scaleX: 1, duration: 0.6, ease: "power2.out" }, 0.5);

    // digitação: ritmo humano e deliberado (tec… tec… tec…), determinístico
    const rnd = mulberry32(42);
    let t = 0.6;
    const times = [];
    chars.forEach((c, i) => {
      times.push(t);
      const isSpace = c.classList.contains("sp");
      tl.set(c, { display: "inline-block" }, t);
      sfx("key", t, { v: 0.7 + rnd() * 0.3, space: isSpace });
      let dt = 0.05 + rnd() * 0.026;
      if (isSpace) dt += 0.035;
      if (i === ideaStart - 1) dt += 0.14; // pausa antes de IDEIA
      if (i >= ideaStart) dt += 0.01;
      t += dt;
    });
    const typeEnd = times[times.length - 1];
    tl.to(line, { x: finalX, duration: typeEnd - times[0] + 0.1, ease: "power1.inOut" }, times[0]);

    // câmera: aproximação lenta durante a frase, volta a 1 na expansão
    tl.to("#camera", { scale: 1.04, duration: typeEnd + 0.2, ease: "none" }, 0.2);
    tl.to("#camera", { scale: 1, duration: 0.85, ease: "power2.inOut" }, typeEnd + 0.4);

    // nota "01 / THE IDEA"
    tl.to(noteTick, { scaleX: 1, duration: 0.7, ease: "power3.out" }, 0.9);
    reveal(noteTexts, 1.0, 0.8, 0.12);

    // pausa com a frase completa; o cursor pisca uma vez
    tl.set(caret, { opacity: 0 }, typeEnd + 0.12);
    tl.set(caret, { opacity: 1 }, typeEnd + 0.3);

    // impulso de escala suave → IDEIA ocupa a tela
    const tImp = typeEnd + 0.36;
    tl.set(chars.slice(ideaStart), { visibility: "hidden" }, tImp);
    tl.set(big, { visibility: "visible" }, tImp);
    tl.set(caret, { opacity: 0 }, tImp);
    tl.to(chars.slice(0, ideaStart), { y: 30, opacity: 0, duration: 0.45, ease: "power2.in", stagger: { each: 0.012, from: "end" } }, tImp - 0.08);
    tl.to(rule, { scaleX: 0, transformOrigin: "100% 50%", duration: 0.5, ease: "power2.inOut" }, tImp - 0.05);
    tl.to(note, { opacity: 0, y: -12, duration: 0.45, ease: "power2.inOut" }, tImp - 0.05);
    tl.to(big, { x: cx - bigX - (bw * s1) / 2, y: cy - bigY - (fsB * s1) / 2, scale: s1, duration: 0.22, ease: "power2.out" }, tImp);
    tl.to(big, { x: 0, y: 0, scale: 1, duration: 0.72, ease: "power3.inOut" }, tImp + 0.2);
    sfx("whoosh", tImp, { dur: 0.95, f0: 220, f1: 2800, v: 0.6, pan0: -0.2, pan1: 0.2, peak: 0.75 });
    sfx("impact", tImp + 0.9, { size: 0.6, v: 0.5, f: 75, bright: 1100 });

    S1.tEnd = tImp + 0.92; // IDEIA ocupa a tela
    S1.bch = bch;
    S1.inkBoxes = inkBoxes;
    S1.big = big;
    focus.x = 960;
    focus.y = 540;
  }

  /* ========================================================================
     NAVEGADOR — layout desktop / mobile (coordenadas da página)
     ======================================================================== */
  const LAYOUT = {
    ".ui-logo": { d: { left: 80, top: 30, fontSize: 22 }, m: { left: 24, top: 24, fontSize: 19 } },
    ".ui-links": { d: { left: 868, top: 35 }, m: { left: 250, top: 28 } },
    ".ui-navbtn": { d: { left: 1350, top: 22, width: 170, height: 46 }, m: { left: 290, top: 18, width: 110, height: 40 } },
    ".ui-burger": { d: { left: 1492, top: 36 }, m: { left: 378, top: 25 } },
    ".ui-divider": { d: { left: 80, top: 90, width: 1440 }, m: { left: 24, top: 70, width: 382 } },
    ".ui-kicker": { d: { left: 80, top: 150, fontSize: 14 }, m: { left: 24, top: 102, fontSize: 12 } },
    ".ui-h1": { d: { left: 80, top: 182, width: 708, fontSize: 76 }, m: { left: 24, top: 130, width: 382, fontSize: 46 } },
    ".ui-p": { d: { left: 80, top: 392, width: 560, fontSize: 20 }, m: { left: 24, top: 344, width: 382, fontSize: 16 } },
    ".ui-cta": { d: { left: 80, top: 516, width: 268, height: 62, fontSize: 18 }, m: { left: 24, top: 430, width: 382, height: 56, fontSize: 16 } },
    ".ui-link": { d: { left: 380, top: 538, fontSize: 17 }, m: { left: 24, top: 506, fontSize: 15 } },
    ".ui-art": { d: { left: 812, top: 142, width: 708, height: 474 }, m: { left: 24, top: 546, width: 382, height: 252 } },
    ".ui-card.c1": { d: { left: 80, top: 664, width: 464, height: 250 }, m: { left: 24, top: 822, width: 382, height: 214 } },
    ".ui-card.c2": { d: { left: 568, top: 664, width: 464, height: 250 }, m: { left: 24, top: 1052, width: 382, height: 214 } },
    ".ui-card.c3": { d: { left: 1056, top: 664, width: 464, height: 250 }, m: { left: 24, top: 1282, width: 382, height: 214 } }
  };
  const BR = {
    s2: { x: 960, y: 372, scale: 0.6 },
    s3: { x: 960, y: 540, scale: 1.04 }, // livra as linhas do HUD (topo/rodapé)
    phone: { x: 520, y: 540, scale: 1, width: 430, height: 900 }
  };

  /* ========================================================================
     CENA 2 — DA IDEIA AO DIGITAL (blocos → interface, DESIGN → CÓDIGO)
     ======================================================================== */
  const S2 = {};
  function buildScene2() {
    const browser = $("#browser");
    const blocks = $$("#blocks .block");
    Object.keys(LAYOUT).forEach((sel) => gsap.set($(sel, browser), LAYOUT[sel].d));
    gsap.set(browser, { xPercent: -50, yPercent: -50, x: BR.s2.x, y: BR.s2.y, scale: BR.s2.scale, "--radius": "14px", "--bezel": "0px", "--chrome-h": "56px", "--bezel-c": "#0d0d0d", "--ring-c": "#2e2e2e" });
    const gov = $(".br-gridov");
    for (let i = 0; i < 12; i++) gov.appendChild(document.createElement("i"));

    // destinos dos blocos (estado da cena 2)
    const sc = BR.s2.scale;
    const page = rectOf($(".br-page", browser));
    const pageBottom = page.y + page.h;
    const clip = (r) => ({ x: r.x, y: r.y, w: r.w, h: Math.max(8, Math.min(r.h, pageBottom - r.y)) });
    const targets = [
      { r: rectOf($(".br-screen", browser)), radius: 14 * sc, color: C.white },
      { r: rectOf($(".ui-art", browser)), radius: 4 * sc, color: C.blue },
      { r: clip(rectOf($(".ui-card.c1", browser))), radius: 16 * sc, color: C.light },
      { r: clip(rectOf($(".ui-card.c2", browser))), radius: 16 * sc, color: C.light },
      { r: clip(rectOf($(".ui-card.c3", browser))), radius: 16 * sc, color: C.light },
      { r: rectOf($(".ui-cta", browser)), radius: 31 * sc, color: C.blue }
    ];

    // estados iniciais da interface (conteúdo aparece depois do "esqueleto")
    const rv = $$(".rv", browser);
    const codeTargets = $$(".code-target", browser);
    const artBits = $$(".ui-art > span", browser);
    gsap.set(rv, { opacity: 0, y: 12 });
    gsap.set(codeTargets, { opacity: 0 });
    gsap.set(artBits, { scale: 0, opacity: 0 });
    gsap.set(".br-chrome", { backgroundColor: C.white, borderBottomColor: "rgba(230,230,230,0)" });
    gsap.set(".br-dots, .br-url", { opacity: 0 });
    gsap.set(".br-gridov i", { scaleY: 0 });

    S1.inkBoxes.forEach((b, i) => gsap.set(blocks[i], Object.assign({ scaleY: 0, borderRadius: 0, backgroundColor: C.blue }, b)));

    /* --- timeline --- */
    const tB = S1.tEnd + 0.12;
    const blockDur = 0.3;
    const blockStg = 0.04;
    tl.set(blocks, { visibility: "visible" }, tB);
    tl.to(blocks, { scaleY: 1, duration: blockDur, ease: "power2.out", stagger: blockStg }, tB);
    S1.bch.forEach((c, i) => tl.set(c, { opacity: 0 }, tB + i * blockStg + blockDur));
    tl.set(S1.big, { visibility: "hidden" }, tB + 0.6);
    blocks.forEach((b, i) => sfx("blip", tB + i * blockStg + 0.05, { f: 700 + i * 120, len: 0.03, v: 0.45 }));

    // fundo grafite expande a partir do centro
    const tM = tB + 0.42;
    wipe("#wipe-graphite", tM, 1.0);
    bgSet(C.graphite, tM + 1.02);
    tl.set("#wipe-graphite", { visibility: "hidden" }, tM + 1.03);
    inkTo(C.white, tM + 0.35);
    gridIn(tM + 0.3);

    // morph dos blocos para os componentes da interface
    blocks.forEach((b, i) => {
      const tg = targets[i];
      tl.to(b, {
        left: tg.r.x, top: tg.r.y, width: tg.r.w, height: tg.r.h,
        borderRadius: tg.radius, backgroundColor: tg.color,
        duration: 0.9, ease: "power3.inOut"
      }, tM + i * 0.05);
      sfx("blip", tM + 0.8 + i * 0.05, { f: 900 + i * 170, len: 0.03, v: 0.55 });
    });
    sfx("whoosh", tM, { dur: 1.0, f0: 200, f1: 1900, v: 0.6, pan0: -0.5, pan1: 0.4 });

    // o navegador real assume o lugar dos blocos
    const tR = tM + 1.18;
    tl.set(browser, { visibility: "visible" }, tR);
    tl.set(blocks, { visibility: "hidden" }, tR + 0.02);
    tl.to(".br-chrome", { backgroundColor: C.light, borderBottomColor: "rgba(230,230,230,1)", duration: 0.5, ease: "power2.out" }, tR);
    tl.to(".br-dots, .br-url", { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.08 }, tR + 0.05);
    tl.to(rv, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.035 }, tR + 0.05);
    tl.to(artBits, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.2)", stagger: 0.07 }, tR);
    tl.to(".br-gridov i", { scaleY: 1, duration: 0.8, ease: "power3.out", stagger: 0.025 }, tR + 0.2);
    sfx("click", tR, { v: 0.5 });

    S2.browser = browser;
    S2.codeTargets = codeTargets;
    S2.tR = tR;
    buildDesignCode();
  }

  /* --- DESIGN. → CÓDIGO. → linhas de código → interface --- */
  const SNIPPETS = [
    '<header class="nav">', "const site = build(ideia);", "display: grid;",
    "grid-template: 12 / 1fr;", "<h1>Presença digital</h1>", "await deploy();",
    ".hero { gap: 32px; }", '<button>Contato</button>', "export default Home;",
    'fetch("/api/leads")', "@media (max-width: 768px)", "return <Page />;",
    "color: #245BFF;", '<section id="servicos">', "transition: .3s ease;",
    "const ui = render(layout);", 'font-family: "Grotesk";', "<footer>© 2026</footer>",
    "if (mobile) stack();", "npm run build", "ship();"
  ];
  function codeSpans(el, src) {
    const re = /(<\/?[\w-]+|\/?>|"[^"]*"|\b(?:const|await|export|default|return|if|fetch)\b|[{}();:=.,])/g;
    let last = 0;
    let m;
    const add = (txt, cls) => {
      if (!txt) return;
      const s = document.createElement("span");
      if (cls) s.className = cls;
      s.textContent = txt;
      el.appendChild(s);
    };
    while ((m = re.exec(src))) {
      add(src.slice(last, m.index));
      const tok = m[0];
      add(tok, tok[0] === '"' ? "s" : /^[{}();:=.,]$/.test(tok) ? "p" : "k");
      last = m.index + tok.length;
    }
    add(src.slice(last));
  }

  function buildDesignCode() {
    const band = $("#word-band");
    const ticker = $("#ticker");
    const wD = $(".w-design", ticker);
    const wC = $(".w-code", ticker);
    const dChars = splitChars(wD, "ch");
    const cChars = splitChars(wC, "ch");
    const fs = fitFont(wD, 1380);
    wC.style.fontSize = fs + "px";
    const gap = 300;
    ticker.style.gap = gap + "px";
    const vm = vMetrics('"Archivo Black"', 400, fs, "H");
    const padTop = Math.round(fs * 0.16);
    const capCenter = 826;
    const boxTop = capCenter + vm.capH / 2 - vm.baseline;
    gsap.set(band, { top: boxTop - padTop, height: fs + padTop + Math.round(fs * 0.04) });
    gsap.set(ticker, { top: padTop, left: (W - wD.offsetWidth) / 2 });

    const tickerLeft = (W - wD.offsetWidth) / 2;
    const codeLeft = tickerLeft + wD.offsetWidth + gap;
    const shift = codeLeft - (W - wC.offsetWidth) / 2;

    // ecos (echo trail extremamente sutil)
    const echoes = [0.11, 0.05].map((op) => {
      const e = ticker.cloneNode(true);
      e.removeAttribute("id");
      e.className = "ticker-echo";
      e.style.opacity = op;
      band.insertBefore(e, ticker);
      return e;
    });

    // posições das letras de CÓDIGO depois do deslize (para as linhas de código)
    gsap.set(ticker, { x: -shift });
    const cRects = cChars.map(rectOf);
    gsap.set(ticker, { x: 0 });

    gsap.set(dChars, { yPercent: 112 });

    // meta da cena 2
    const meta = $("#s2-meta");
    gsap.set(meta, { top: boxTop - padTop - 44 });
    const metaBits = $$("span", meta);
    gsap.set(metaBits, { clipPath: "inset(0% 100% 0% 0%)" });

    /* --- timeline --- */
    const tHit = beat(-27); // 7.429 — impacto grave DESIGN → CÓDIGO
    const tD = tHit - 1.78;
    tl.to(dChars, { yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.045 }, tD);
    reveal(metaBits, tD + 0.2, 0.8, 0.15);
    sfx("whoosh", tD - 0.05, { dur: 0.7, f0: 500, f1: 2000, v: 0.4, pan0: 0, pan1: 0 });

    const tS = tHit - 0.62;
    tl.set(echoes, { visibility: "visible" }, tS);
    tl.to(ticker, { x: -shift, duration: 0.8, ease: "power3.inOut" }, tS);
    echoes.forEach((e, i) => tl.to(e, { x: -shift, duration: 0.8, ease: "power3.inOut" }, tS + 0.03 * (i + 1)));
    tl.set(echoes, { visibility: "hidden" }, tS + 0.95);
    tl.fromTo(cChars, { scaleX: 1.04, transformOrigin: "50% 100%" }, { scaleX: 1, duration: 0.6, ease: "power2.out", stagger: 0.02 }, tHit - 0.1);
    sfx("whoosh", tS, { dur: 0.8, f0: 300, f1: 2200, v: 0.65, pan0: 0.6, pan1: -0.4, peak: 0.7 });
    sfx("impact", tHit, { size: 1.0, v: 0.8, f: 95, bright: 1500 });

    // CÓDIGO se desmonta em linhas de programação...
    const frags = $("#code-frags");
    const vmC = vMetrics('"Archivo Black"', 400, fs, "H");
    const lines = [];
    let si = 0;
    cChars.forEach((ch, ci) => {
      const r = cRects[ci];
      const base = r.y + vmC.baseline;
      const capTop = base - vmC.capH;
      const n = ch.textContent === "." ? 1 : 3;
      for (let j = 0; j < n; j++) {
        const el = document.createElement("span");
        el.className = "cf";
        codeSpans(el, SNIPPETS[si % SNIPPETS.length]);
        si++;
        frags.appendChild(el);
        const y = n === 1 ? base - 22 : capTop + vmC.capH * (0.12 + j * 0.34);
        gsap.set(el, { left: r.x + 4, top: y, clipPath: "inset(0% 100% 0% 0%)" });
        lines.push({ el, ci, x: r.x + 4, y });
      }
    });

    const tX = tHit + 0.5;
    tl.to(cChars, { opacity: 0, scaleY: 0.3, transformOrigin: "50% 50%", duration: 0.4, ease: "power2.inOut", stagger: 0.045 }, tX);
    lines.forEach((l) => {
      tl.set(l.el, { visibility: "visible" }, tX + l.ci * 0.045);
      reveal(l.el, tX + l.ci * 0.045 + 0.08, 0.35, 0, "power2.out");
    });
    sfx("glitch", tX, { n: 9, step: 0.04 });

    // ...que voam e se reorganizam como elementos da interface
    const browser = S2.browser;
    const tgtRects = S2.codeTargets.map((el) => {
      const r = rectOf(el);
      const page = rectOf($(".br-page", browser));
      const cy = Math.min(r.y + r.h / 2, page.y + page.h - 14);
      return { x: r.x + r.w / 2, y: cy, w: r.w };
    });
    const tF = tX + 0.62;
    const arrivals = S2.codeTargets.map(() => Infinity);
    lines.forEach((l, i) => {
      const ti = i % tgtRects.length;
      const tg = tgtRects[ti];
      const w = l.el.offsetWidth;
      const s = Math.max(0.28, Math.min(0.75, tg.w / w));
      const start = tF + i * 0.012;
      const dur = 0.65;
      tl.to(l.el, { x: tg.x - (l.x + (w * s) / 2), y: tg.y - (l.y + 10), scale: s, duration: dur, ease: "power2.inOut" }, start);
      tl.to(l.el, { opacity: 0, duration: 0.2, ease: "power1.in" }, start + dur - 0.16);
      arrivals[ti] = Math.min(arrivals[ti], start + dur - 0.12);
    });
    S2.codeTargets.forEach((el, i) => tl.to(el, { opacity: 1, duration: 0.4, ease: "power2.out" }, arrivals[i]));
    for (let k = 0; k < 4; k++) sfx("tick", tF + 0.55 + k * 0.06, { f: 2600 + k * 300, v: 0.5 });
    tl.to(metaBits, { opacity: 0, duration: 0.4, ease: "power2.inOut" }, tF + 0.2);

  }

  /* ========================================================================
     CENA 3 — EXPERIÊNCIA DIGITAL (interação → responsivo)
     ======================================================================== */
  const S3 = {};
  function buildScene3() {
    const browser = S2.browser;
    const pointer = $("#pointer");

    // medidas no estado da cena 3
    gsap.set(browser, BR.s3);
    const proj = rectOf($(".is-proj", browser));
    const cta = rectOf($(".ui-cta", browser));
    gsap.set(browser, BR.s2);

    gsap.set(pointer, { x: 1720, y: 1120, scale: 1 });
    gsap.set(".br-time, .br-icons", { opacity: 0 });
    gsap.set(".ui-burger", { opacity: 0 });

    /* --- push-in de câmera --- */
    const tP = 9.2;
    tl.to(browser, { x: BR.s3.x, y: BR.s3.y, scale: BR.s3.scale, duration: 1.15, ease: "power2.inOut" }, tP);
    tl.to(".br-gridov i", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.5, ease: "power2.inOut", stagger: 0.015 }, tP - 0.15);
    gridOut(tP - 0.1);
    sfx("whoosh", tP, { dur: 1.1, f0: 160, f1: 1100, v: 0.5, pan0: 0, pan1: 0, rev: 0.35, peak: 0.7 });

    /* --- cursor e microinterações --- */
    const pp = { x: proj.x + proj.w * 0.5, y: proj.y + proj.h * 0.6 };
    const pc = { x: cta.x + cta.w * 0.62, y: cta.y + cta.h * 0.55 };
    const tClick = beat(-19); // 11.332
    tl.set(pointer, { visibility: "visible" }, 10.05);
    tl.to(pointer, { x: pp.x, y: pp.y, duration: 0.6, ease: "power2.inOut" }, 10.05);
    tl.to(".is-proj", { "--u": 1, color: C.blue, duration: 0.3, ease: "power2.out" }, 10.55);
    sfx("tick", 10.58, { f: 2400, v: 0.5 });
    tl.to(pointer, { x: pc.x, y: pc.y, duration: 0.45, ease: "power2.inOut" }, 10.78);
    tl.to(".is-proj", { "--u": 0, color: "#2a2a2a", duration: 0.3, ease: "power2.out" }, 10.85);
    tl.to(".ui-cta", { backgroundColor: C.black, duration: 0.3, ease: "power2.out" }, 11.08);
    tl.to(".cta-arr", { x: 6, duration: 0.35, ease: "power2.out" }, 11.08);
    // clique: squash & stretch discreto no botão e no cursor
    tl.to(pointer, { scale: 0.86, duration: 0.07, ease: "power2.in" }, tClick - 0.04);
    tl.to(pointer, { scale: 1, duration: 0.4, ease: "back.out(1.6)" }, tClick + 0.03);
    tl.to(".ui-cta", { scaleX: 0.97, scaleY: 0.95, duration: 0.07, ease: "power2.in" }, tClick - 0.04);
    tl.to(".ui-cta", { scaleX: 1, scaleY: 1, duration: 0.45, ease: "back.out(1.6)" }, tClick + 0.03);
    sfx("click", tClick, { v: 0.8 });
    tl.to(".ui-cta", { backgroundColor: C.blue, duration: 0.4, ease: "power2.out" }, 11.8);
    tl.to(".cta-arr", { x: 0, duration: 0.4, ease: "power2.out" }, 11.8);

    // rolagem simulada + cards deslizando para dentro
    tl.to(".br-scroll", { y: -150, duration: 0.7, ease: "power2.inOut" }, 11.45);
    tl.from(".ui-card", { y: 60, duration: 0.8, ease: "power3.out", stagger: 0.08, immediateRender: false }, 11.5);
    sfx("whoosh", 11.45, { dur: 0.6, f0: 800, f1: 1800, v: 0.25, pan0: 0, pan1: 0, rev: 0.1 });
    tl.to(pointer, { x: pc.x + 200, y: pc.y + 240, opacity: 0, duration: 0.5, ease: "power2.in" }, 11.65);
    tl.set(pointer, { visibility: "hidden" }, 12.2);

    /* --- desktop → tablet → mobile --- */
    const tC = 12.1;
    const dC = beat(-15) - tC; // termina na batida (13.283)
    const ez = "power3.inOut";
    tl.to(browser, {
      width: BR.phone.width, height: BR.phone.height, x: BR.phone.x, y: BR.phone.y, scale: BR.phone.scale,
      "--radius": "54px", "--bezel": "12px", "--chrome-h": "50px", duration: dC, ease: ez
    }, tC);
    tl.to(".br-scroll", { y: 0, duration: dC, ease: ez }, tC);
    Object.keys(LAYOUT).forEach((sel) => tl.to($(sel, browser), Object.assign({ duration: dC, ease: ez }, LAYOUT[sel].m), tC));
    tl.to(".br-chrome", { backgroundColor: C.white, borderBottomColor: "rgba(230,230,230,0)", duration: dC, ease: ez }, tC);
    tl.to(".br-dots, .br-lock, .br-url-text", { opacity: 0, duration: 0.3, ease: "power1.inOut" }, tC);
    tl.to(".br-url", { width: 118, height: 33, backgroundColor: C.black, duration: dC, ease: ez }, tC);
    tl.to(".br-time, .br-icons", { opacity: 1, duration: 0.35, ease: "power2.out" }, tC + dC * 0.6);
    tl.to(".ui-links", { opacity: 0, scale: 0.7, duration: dC * 0.45, ease: "power2.inOut" }, tC);
    tl.to(".ui-navbtn", { opacity: 0, scale: 0.8, duration: dC * 0.45, ease: "power2.inOut" }, tC);
    tl.to(".ui-burger", { opacity: 1, duration: 0.3, ease: "power2.out" }, tC + dC * 0.55);
    if ($(".br-screen.has-shot")) tl.to(".br-shot", { opacity: 0, duration: dC * 0.5 }, tC);
    sfx("whoosh", tC, { dur: dC + 0.05, f0: 2200, f1: 380, v: 0.4, pan0: 0.3, pan1: -0.3, peak: 0.45 });

    // ticks quando a largura cruza os breakpoints
    sfx("tick", crossTime(tC, dC, 1600, 430, 1024, ez), { f: 2900, v: 0.7 });
    sfx("tick", crossTime(tC, dC, 1600, 430, 640, ez), { f: 3300, v: 0.7 });

    /* --- RESPONSIVO. se adapta ao espaço disponível --- */
    const respWrap = $("#resp-wrap");
    const respWord = $("#resp-word");
    respWord.style.fontSize = "100px";
    const w100 = respWord.offsetWidth;
    const dvs = $$("#resp-meta .dv");
    const wNum = $("#w-num");
    gsap.set(respWrap, { opacity: 1 });
    tl.set(respWrap, { visibility: "visible" }, tC + 0.2);
    derived.push(() => {
      if (getComputedStyle(respWrap).visibility === "hidden") return;
      const bx = gsap.getProperty(browser, "x");
      const bw = gsap.getProperty(browser, "width");
      const bs = gsap.getProperty(browser, "scale");
      const bezel = parseFloat(gsap.getProperty(browser, "--bezel")) || 0;
      const right = bx + (bw / 2 + bezel + 2) * bs;
      const avail = 1800 - (right + 90);
      const fsR = Math.max(10, Math.min(160, (100 * avail) / w100));
      respWord.style.fontSize = fsR + "px";
      respWord.style.opacity = Math.max(0, Math.min(1, (avail - 140) / 260));
      respWrap.style.left = right + 90 + "px";
      respWrap.style.top = 540 - (fsR + 46) / 2 + "px";
      const mode = bw > 1024 ? "desktop" : bw > 640 ? "tablet" : "mobile";
      dvs.forEach((d) => {
        const on = d.getAttribute("data-dv") === mode;
        d.style.opacity = on ? 1 : 0.32;
        d.style.color = on ? C.blue : "";
      });
      wNum.textContent = String(Math.round(bw));
    });

    // pointer → leitura X/Y do HUD
    derived.push(() => {
      if (getComputedStyle(pointer).visibility !== "hidden") {
        focus.x = gsap.getProperty(pointer, "x");
        focus.y = gsap.getProperty(pointer, "y");
      }
    });

    S3.respWrap = respWrap;
  }

  /* ========================================================================
     CENA 4 — SITES. / LANDING PAGES. / SISTEMAS.
     As interfaces surgem através das próprias letras (máscara tipográfica SVG)
     ======================================================================== */
  const NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach((k) => el.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(el);
    return el;
  }

  const S4 = { cards: [], zooms: [] };
  const CARD_ORIGIN = { x: 160, y: 90 };
  const SLOTS = [
    { cx: 1408, cy: 902 },
    { cx: 1688, cy: 902 }
  ];

  function buildWord(key, lines, targetW, fill) {
    const vis = $("#words-vis");
    const defs = $("#words-defs");
    const fam = "Archivo Black";

    // tamanho: a linha mais longa ocupa targetW
    const probe = svgEl("text", { x: 0, y: -2000, "font-family": fam, "font-size": 100 }, vis);
    let maxLen = 0;
    lines.forEach((l) => {
      probe.textContent = l;
      maxLen = Math.max(maxLen, probe.getComputedTextLength());
    });
    const fs = (100 * targetW) / maxLen;
    probe.setAttribute("font-size", fs);

    const capH = measure(`${fs}px "${fam}"`, "H").actualBoundingBoxAscent;
    const step = fs * 0.94;
    const totalH = capH + step * (lines.length - 1);
    const firstBase = 540 - totalH / 2 + capH;

    // <g> não é filho válido de <clipPath>: o zoom é aplicado no próprio clipPath
    const clip = svgEl("clipPath", { id: `clip-${key}`, clipPathUnits: "userSpaceOnUse" }, defs);
    const zoomG = clip;
    const visGroup = svgEl("g", {}, vis);
    const chars = [];
    let focal = null;

    lines.forEach((l, li) => {
      probe.textContent = l;
      const len = probe.getComputedTextLength();
      const x0 = (W - len) / 2;
      const base = firstBase + li * step;
      const mask = svgEl("clipPath", { id: `mask-${key}-${li}`, clipPathUnits: "userSpaceOnUse" }, defs);
      svgEl("rect", { x: 0, y: base - capH - fs * 0.14, width: W, height: capH + fs * 0.24 }, mask);
      const lineG = svgEl("g", { "clip-path": `url(#mask-${key}-${li})` }, visGroup);
      Array.from(l).forEach((c, ci) => {
        if (c === " ") return;
        const cx = x0 + probe.getStartPositionOfChar(ci).x;
        const t = svgEl("text", { x: cx, y: base, "font-family": fam, "font-size": fs, fill }, lineG);
        t.textContent = c;
        chars.push(t);
        const ct = svgEl("text", { x: cx - CARD_ORIGIN.x, y: base - CARD_ORIGIN.y, "font-family": fam, "font-size": fs }, zoomG);
        ct.textContent = c;
        if (!focal && c === "I") {
          const m = measure(`${fs}px "${fam}"`, "I");
          focal = { x: cx + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2 - CARD_ORIGIN.x, y: base - capH / 2 - CARD_ORIGIN.y };
        }
      });
    });
    probe.remove();
    gsap.set(chars, { y: capH + fs * 0.3 });
    return { chars, zoomG, visGroup, focal, fs, capH };
  }

  function buildScene4() {
    const browser = S2.browser;
    const cards = ["#card-sites", "#card-landing", "#card-systems"].map((s) => $(s));
    const labels = $$("#thumb-labels span");
    S4.cards = cards;

    /* --- smartphone gira e vira o fundo azul --- */
    const tR = 13.95;
    tl.to(S3.respWrap, { opacity: 0, x: 60, duration: 0.5, ease: "power2.inOut" }, tR - 0.1);
    tl.set(S3.respWrap, { visibility: "hidden" }, tR + 0.45);
    tl.to(".br-blue", { opacity: 1, duration: 0.35, ease: "power2.inOut" }, tR);
    tl.to(browser, { "--bezel-c": C.blue, "--ring-c": C.blue, duration: 0.35, ease: "power2.inOut" }, tR);
    tl.to(browser, {
      rotation: -90, x: 960, y: 540, width: 2300, height: 2300, scale: 1,
      "--radius": "0px", "--bezel": "0px", duration: 0.82, ease: "power2.inOut"
    }, tR + 0.05);
    const tBlue = tR + 0.88;
    bgSet(C.blue, tBlue);
    tl.set(browser, { visibility: "hidden" }, tBlue + 0.01);
    sfx("whoosh", tR, { dur: 0.9, f0: 240, f1: 1600, v: 0.5, pan0: -0.6, pan1: 0.6, peak: 0.65 });
    tl.to(focus, { x: 960, y: 540, duration: 0.8, ease: "power2.inOut" }, tR);

    /* --- palavras --- */
    const words = [
      { key: "sites", lines: ["SITES."], w: 1420, fill: C.white, bg: C.blue, ink: C.white, t: beat(-12) },
      { key: "landing", lines: ["LANDING", "PAGES."], w: 1400, fill: C.black, bg: C.white, ink: C.black, t: beat(-8), wipe: "#wipe-white" },
      { key: "systems", lines: ["SISTEMAS."], w: 1500, fill: C.blue, bg: C.black, ink: C.white, t: beat(-4), wipe: "#wipe-black" }
    ];

    words.forEach((wd, i) => {
      const built = buildWord(wd.key, wd.lines, wd.w, wd.fill);
      const card = cards[i];
      const inner = $(".cd-inner", card);
      card.style.clipPath = `url(#clip-${wd.key})`;
      gsap.set(card, { x: 0, y: 0, scale: 1, transformOrigin: "50% 50%", backgroundColor: "transparent" });
      const view = $(".cd-view", card);
      const zoom = { l: 0, g: built.zoomG, f: built.focal }; // l = ln(escala): zoom com velocidade perceptiva constante
      S4.zooms.push(zoom);
      const T = wd.t;

      if (wd.wipe) {
        wipe(wd.wipe, T - 0.42, 0.88);
        bgSet(wd.bg, T + 0.47);
        tl.set(wd.wipe, { visibility: "hidden" }, T + 0.48);
      }
      inkTo(wd.ink, T - 0.15);

      // letras sobem pela máscara, com assentamento suave
      tl.to(built.chars, { y: 0, duration: 0.65, ease: "back.out(1.1)", stagger: Math.min(0.045, 0.25 / Math.max(1, built.chars.length - 1)) }, T - 0.1);
      sfx("impact", T, { size: 0.7, v: 0.6, f: 115 - i * 12, bright: 1800 });

      // a interface "enche" as letras de baixo para cima, com parallax interno
      tl.set(card, { visibility: "visible" }, T + 0.68);
      tl.fromTo(view, { clipPath: "inset(62% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.42, ease: "power2.inOut", immediateRender: false }, T + 0.68);
      tl.fromTo(inner, { y: 160 }, { y: 0, duration: 1.0, ease: "power2.out" }, T + 0.68);
      tl.set(built.visGroup, { visibility: "hidden" }, T + 1.11);
      sfx("blip", T + 0.72, { f: 1700, len: 0.04, v: 0.4, pan: 0 });

      // zoom através da letra "I": a interface toma a tela
      tl.to(zoom, { l: Math.log(40), duration: 0.63, ease: "sine.inOut" }, T + 1.12);
      tl.set(card, { clipPath: "none" }, T + 1.76);
      sfx("whoosh", T + 1.12, { dur: 0.65, f0: 400, f1: 2400, v: 0.45, pan0: 0, pan1: 0, rev: 0.2, peak: 0.7 });

      if (i < 2) {
        // estaciona como miniatura (índice editorial): sai do centro antes da próxima palavra
        const sl = SLOTS[i];
        tl.to(card, { x: sl.cx - 960, y: sl.cy - 540, scale: 0.16, duration: 0.85, ease: "power3.out" }, T + 1.77);
        const lb = labels[i];
        gsap.set(lb, { left: sl.cx - 128, top: sl.cy - 72 - 26 });
        tl.set(lb, { visibility: "visible" }, T + 2.3);
        tl.fromTo(lb, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, T + 2.3);
        sfx("tick", T + 2.35, { f: 3000, v: 0.4 });
      }
    });

    // zoom: aplicado a cada frame a partir do proxy (escala = e^l)
    derived.push(() => {
      S4.zooms.forEach((z) => {
        if (!z.f) return;
        z.g.setAttribute("transform", `translate(${z.f.x} ${z.f.y}) scale(${Math.exp(z.l)}) translate(${-z.f.x} ${-z.f.y})`);
      });
    });

    sfx("riser", beat(-4) + 0.35, { dur: ANCHOR - (beat(-4) + 0.35), v: 0.7 });
    S4.labels = labels;
  }

  /* ========================================================================
     CENA 5 — SUA EMPRESA. NO DIGITAL.
     ======================================================================== */
  const S5 = {};
  function buildScene5() {
    const cards = S4.cards;
    const t0 = ANCHOR - 0.1;

    // composição tridimensional dos três mockups
    const deck3d = [
      { x: -470, y: -175, z: -260, rotationY: 26, rotationX: 12, rotationZ: -5, scale: 0.42 },
      { x: 10, y: 20, z: -40, rotationY: 26, rotationX: 12, rotationZ: -5, scale: 0.42 },
      { x: 480, y: 210, z: 180, rotationY: 26, rotationX: 12, rotationZ: -5, scale: 0.42 }
    ];
    tl.to(S4.labels.slice(0, 2), { opacity: 0, duration: 0.4, ease: "power2.inOut" }, t0);
    cards.forEach((c, i) => tl.to(c, Object.assign({ duration: 1.3, ease: "power3.inOut" }, deck3d[i]), t0 + i * 0.08));
    tl.to("#deck", { scale: 0.9, duration: 3.0, ease: "power1.out" }, t0);
    // parallax: cada plano deriva numa velocidade
    cards.forEach((c, i) => tl.to(c, { y: "-=" + (30 + i * 30), duration: 1.1, ease: "none" }, t0 + 1.45));
    sfx("impact", ANCHOR, { size: 1.15, v: 0.8, f: 85, bright: 2000, rev: 0.9 });
    sfx("whoosh", t0, { dur: 1.2, f0: 160, f1: 1300, v: 0.45, pan0: 0.5, pan1: -0.5, rev: 0.4, peak: 0.6 });
    tl.to(focus, { x: 1220, y: 410, duration: 1.2, ease: "power2.inOut" }, t0);

    // headline
    const hl1 = $("#hl1");
    const hl2 = $("#hl2");
    const m1 = $("#hl1-mask");
    const m2 = $("#hl2-mask");
    const c1 = splitChars(hl1, "ch");
    const c2 = splitChars(hl2, "ch");
    const fs1 = fitFont(hl1, 1640);
    const fs2 = fitFont(hl2, 1640);
    const v1 = vMetrics('"Archivo Black"', 400, fs1, "H");
    const v2 = vMetrics('"Archivo Black"', 400, fs2, "H");
    const gap = fs1 * 0.17;
    const total = v1.capH + gap + v2.capH;
    const capTop1 = 540 - total / 2;
    const base1 = capTop1 + v1.capH;
    const base2 = base1 + gap + v2.capH;
    const baseA = 540 + v1.capH / 2; // fase A: linha única centralizada
    const pad = Math.round(fs1 * 0.06);

    gsap.set(m1, { top: baseA - v1.baseline - pad, height: fs1 + pad * 2, paddingTop: pad });
    gsap.set(m2, { top: base2 - v2.baseline - pad, height: fs2 + pad * 2, paddingTop: pad });
    gsap.set(c1, { yPercent: 112 });
    gsap.set(hl2, { visibility: "hidden" });

    // barra azul cobre a área da segunda linha
    const bar = $("#s5-bar");
    const w2 = hl2.offsetWidth;
    gsap.set(bar, { left: (W - w2) / 2 - 18, top: pad + v2.baseline - v2.capH - 18, width: w2 + 36, height: v2.capH + 36, scaleX: 0, transformOrigin: "0% 50%" });

    // microtextos editoriais
    const top = $(".s5-top");
    const bottom = $(".s5-bottom");
    const w1 = hl1.offsetWidth;
    gsap.set(top, { left: (W - w1) / 2 + 4, top: capTop1 - 52 });
    gsap.set(bottom, { left: (W + w2) / 2 - 4, top: base2 + 36, xPercent: -100 });
    gsap.set([top, bottom], { clipPath: "inset(0% 100% 0% 0%)" });

    const tH = beat(3) - 0.05; // 22.01
    // os mockups recuam e escurecem por trás da headline
    tl.to("#deck-dim", { opacity: 0.9, duration: 0.7, ease: "power2.inOut" }, tH - 0.3);
    cards.forEach((c, i) => tl.to(c, { z: "-=900", opacity: 0, duration: 1.0, ease: "power2.in" }, tH + 0.1 + (2 - i) * 0.1));
    tl.set(cards, { visibility: "hidden" }, tH + 1.45);
    tl.set("#deck-dim", { opacity: 0 }, tH + 1.5); // fundo já é preto: remoção invisível
    tl.to(c1, { yPercent: 0, duration: 0.8, ease: "back.out(1.2)", stagger: 0.035 }, tH);
    sfx("whoosh", tH - 0.05, { dur: 0.75, f0: 400, f1: 2000, v: 0.4, pan0: -0.3, pan1: 0.3, peak: 0.6 });

    // EMPRESA → NO DIGITAL. (barra azul atravessa a composição)
    const tBar = beat(6); // 23.527
    tl.to(m1, { y: base1 - baseA, duration: 0.75, ease: "back.out(1.2)" }, tBar - 0.5);
    tl.to(bar, { scaleX: 1, duration: 0.42, ease: "power2.inOut" }, tBar - 0.42);
    tl.set(hl2, { visibility: "visible" }, tBar - 0.01);
    tl.set(bar, { transformOrigin: "100% 50%" }, tBar);
    tl.to(bar, { scaleX: 0, duration: 0.48, ease: "power2.inOut" }, tBar);
    tl.fromTo(hl2, { scaleX: 1.03, transformOrigin: "50% 50%" }, { scaleX: 1, duration: 0.7, ease: "power3.out" }, tBar + 0.02);
    sfx("whoosh", tBar - 0.45, { dur: 0.5, f0: 600, f1: 2600, v: 0.4, pan0: -0.7, pan1: 0.7, rev: 0.15 });
    sfx("impact", tBar, { size: 0.75, v: 0.6, f: 105, bright: 1800 });

    tl.set([top, bottom], { visibility: "visible" }, tBar + 0.2);
    reveal([top, bottom], tBar + 0.2, 0.8, 0.15);
    gridIn(tBar + 0.1);
    const blc = $$(".s5-blc span");
    blc.forEach((s, i) => {
      const t = tBar + 0.42 + i * 0.3;
      tl.to(s, { color: C.blue, duration: 0.2, ease: "power1.out" }, t);
      if (i < blc.length - 1) tl.to(s, { color: C.white, duration: 0.3, ease: "power1.out" }, t + 0.3);
      sfx("tick", t, { f: 2600 + i * 400, v: 0.5 });
    });
    tl.to("#s5-group", { scale: 1.03, duration: beat(9) - (tBar + 0.2), ease: "none" }, tBar + 0.2);
    tl.to(focus, { x: 960, y: 540, duration: 0.9, ease: "power2.inOut" }, tH);

    S5.m1 = m1;
    S5.m2 = m2;
    S5.top = top;
    S5.bottom = bottom;
    S5.w = Math.max(w1, w2);
    S5.base1 = base1;
    S5.baseA = baseA;
    S5.v1 = v1;
    S5.v2 = v2;
    S5.pad = pad;
  }

  /* ========================================================================
     CENA 6 — ASSINATURA E CHAMADA FINAL
     ======================================================================== */
  function buildScene6() {
    const t0 = beat(9); // 24.990
    const line = $("#s6-line");

    // a headline se comprime em uma única linha
    const sc = 1.03;
    const c1y = S5.base1 - S5.v1.capH / 2; // centro da linha 1 (após o deslocamento)
    const m2Top = parseFloat(gsap.getProperty(S5.m2, "top"));
    const c2y = m2Top + S5.pad + S5.v2.baseline - S5.v2.capH / 2;
    tl.to([S5.top, S5.bottom], { opacity: 0, duration: 0.3, ease: "power1.inOut" }, t0);
    gridOut(t0);
    tl.to(S5.m1, { y: "+=" + (540 - c1y) / sc, scaleY: 0.03, scaleX: 1.04, duration: 0.42, ease: "power2.in" }, t0);
    tl.to(S5.m2, { y: (540 - c2y) / sc, scaleY: 0.03, scaleX: 1.04, duration: 0.42, ease: "power2.in" }, t0);
    sfx("zip", t0, { dur: 0.45 });

    const tL = t0 + 0.42;
    const lw = S5.w * 1.04 * sc;
    gsap.set(line, { xPercent: -50, yPercent: -50, width: lw, height: 6 });
    tl.set([S5.m1, S5.m2], { opacity: 0 }, tL);
    tl.set(line, { visibility: "visible" }, tL);
    // ...e vira um pequeno elemento gráfico de identidade
    tl.to(line, { width: 150, height: 16, backgroundColor: C.blue, duration: 0.5, ease: "power3.inOut" }, tL);
    sfx("blip", tL + 0.45, { f: 1400, len: 0.05, v: 0.6, pan: 0 });

    // fundo branco expande a partir da marca
    const tW = tL + 0.22;
    const bx = (960 - 75) / W * 100;
    const by = (540 - 8) / H * 100;
    wipe("#wipe-final", tW, 0.8, `inset(${by}% ${bx}% ${by}% ${bx}%)`);
    inkTo(C.black, tW + 0.3);
    bgSet(C.white, tW + 0.82);
    tl.set("#wipe-final", { visibility: "hidden" }, tW + 0.83);
    sfx("whoosh", tW, { dur: 0.8, f0: 260, f1: 1600, v: 0.4, pan0: 0, pan1: 0, rev: 0.3, peak: 0.6 });
    tl.to(focus, { x: 960, y: 540, duration: 0.6 }, tW);

    // VAMOS CRIAR / ALGO INCRÍVEL?
    const q1 = $("#q1");
    const q2 = $("#q2");
    const qc1 = splitChars(q1, "ch");
    const qc2 = splitChars(q2, "ch");
    const fq1 = fitFont(q1, 1480);
    const fq2 = fitFont(q2, 1480);
    const v1 = vMetrics('"Archivo Black"', 400, fq1, "H");
    const v2 = vMetrics('"Archivo Black"', 400, fq2, "H");
    const gap = fq1 * 0.27; // respiro para o acento de INCRÍVEL
    const total = v1.capH + gap + v2.capH;
    const b1 = 540 - total / 2 + v1.capH;
    const b2 = b1 + gap + v2.capH;
    const masks = $$(".q-mask");
    const acc = Math.round(fq2 * 0.22); // espaço para o acento de INCRÍVEL
    gsap.set(masks[0], { top: b1 - v1.baseline - acc, height: fq1 + acc + 8, paddingTop: acc });
    gsap.set(masks[1], { top: b2 - v2.baseline - acc, height: fq2 + acc + 8, paddingTop: acc });
    gsap.set([qc1, qc2], { yPercent: 115 });

    const qTop = 540 - total / 2;
    tl.to(line, { y: qTop - 70, width: 120, height: 12, duration: 0.55, ease: "power3.inOut" }, tL + 0.55);
    const tQ = tL + 0.5;
    tl.to(qc1, { yPercent: 0, duration: 0.75, ease: "back.out(1.12)", stagger: 0.03 }, tQ);
    tl.to(qc2, { yPercent: 0, duration: 0.75, ease: "back.out(1.12)", stagger: 0.03 }, tQ + 0.15);
    sfx("whoosh", tQ - 0.05, { dur: 0.7, f0: 500, f1: 1900, v: 0.35, pan0: 0.2, pan1: -0.2, peak: 0.6 });

    // assinatura
    const sig = $("#sig");
    const brand = $("#sig-brand");
    const bChars = splitChars(brand, "ch");
    const fb = fitFont(brand, 1240, 230);
    const vb = vMetrics('"Archivo Black"', 400, fb, "H");
    const brandMask = $(".sig-mask", sig);
    const bpad = Math.round(fb * 0.2);
    gsap.set(brandMask, { paddingTop: bpad, marginTop: -bpad });
    const brandCapCenter = 478;
    gsap.set(sig, { top: brandCapCenter + vb.capH / 2 - vb.baseline });
    gsap.set(bChars, { yPercent: 115 });
    const sub = $("#sig-sub");
    const btn = $("#sig-btn");
    const ig = $("#sig-ig");
    gsap.set(ig, { top: 905 });
    // marca azul centralizada entre a baseline do nome e o subtítulo
    const sigTop = brandCapCenter + vb.capH / 2 - vb.baseline;
    const barY = (sigTop + vb.baseline + sigTop + sub.offsetTop) / 2;

    const tSig = beat(15); // 27.917 — chegada da assinatura
    const tS = tSig - 0.67; // a câmera recua
    tl.to("#q-group", { scale: 0.33, y: 262 - 540, duration: 0.95, ease: "power2.inOut" }, tS);
    tl.to(line, { y: barY - 540, width: 96, height: 10, duration: 0.95, ease: "power2.inOut" }, tS);
    tl.to(bChars, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.03 }, tS + 0.32);
    sfx("impact", tSig, { size: 1.4, v: 0.85, f: 68, bright: 1200, rev: 1 });
    tl.set([sub, btn, ig], { visibility: "visible" }, tS + 0.45);
    tl.fromTo(sub, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" }, tS + 0.55);
    tl.fromTo(btn, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.3)" }, tS + 0.7);
    tl.fromTo(ig, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, tS + 0.85);
    tl.to(".sig-arr", { x: 4, y: -4, duration: 0.3, ease: "power2.inOut", yoyo: true, repeat: 1 }, tSig + 0.85);
    tl.to("#s6", { scale: 0.975, duration: DURATION - tSig, ease: "power1.inOut" }, tSig);

    // a tela fica preta somente nos últimos frames
    tl.to("#fade", { opacity: 1, duration: 0.45, ease: "power2.in" }, DURATION - 0.45);
    tl.set({}, {}, DURATION);
  }

  /* ------------------------------------------------------------------------
     SINCRONIA POR FRAME (HUD, elementos dependentes)
     ------------------------------------------------------------------------ */
  const pad2 = (n) => String(n).padStart(2, "0");
  const pad4 = (n) => String(Math.max(0, Math.round(n))).padStart(4, "0");
  function sync(t) {
    derived.forEach((fn) => fn(t));
    const frames = Math.floor(t * 30 + 1e-6);
    hud.tc.textContent = `00:00:${pad2(Math.floor(frames / 30))}:${pad2(frames % 30)}`;
    hud.bar.style.transform = `scaleX(${Math.min(1, t / DURATION)})`;
    hud.hx.textContent = pad4(focus.x);
    hud.hy.textContent = pad4(focus.y);
  }

  function seek(t) {
    tl.totalTime(Math.max(0, Math.min(DURATION, t)));
    sync(tl.totalTime());
  }

  /* ------------------------------------------------------------------------
     PLANO DE ÁUDIO
     ------------------------------------------------------------------------ */
  function audioPlan() {
    const a = CFG.audio || {};
    const lines = (a.narration && a.narration.lines) || [];
    return {
      cues,
      duration: DURATION,
      music: { beat: BEAT, anchor: ANCHOR, intro: 4.4, grooveFrom: -27, breakFrom: -14, wordsFrom: -12, outroAt: 9, finalAt: 15 },
      synthMusic: a.synthMusic !== false,
      sfxOn: a.sfx !== false,
      duckDb: a.narration && a.narration.duckMusicDb,
      lastLineAt: lines.length ? lines[lines.length - 1].cue : null
    };
  }

  /* ------------------------------------------------------------------------
     BUILD
     ------------------------------------------------------------------------ */
  async function build() {
    fitStage();
    applyConfig();
    const fonts = [
      '500 84px "Space Grotesk"', '700 84px "Space Grotesk"', '400 100px "Archivo Black"',
      '400 20px "Inter"', '500 20px "Inter"', '600 20px "Inter"', '500 20px "JetBrains Mono"'
    ];
    await Promise.all(fonts.map((f) => document.fonts.load(f, "ABCÇÍÓ")));
    await document.fonts.ready;

    buildGrid();
    buildHud();
    buildScene1();
    buildScene2();
    buildScene3();
    buildScene4();
    buildScene5();
    buildScene6();
    // barras do gráfico do dashboard
    const bw = $(".md-barwrap");
    [42, 58, 50, 71, 64, 80, 68, 88, 76, 92, 84, 100].forEach((h, i) => {
      const b = document.createElement("i");
      b.style.height = h + "%";
      if (i === 11 || i === 9) b.className = "on";
      bw.appendChild(b);
    });

    cues.sort((a, b) => a.t - b.t);
    seek(0);
  }

  /* ========================================================================
     PLAYER (tempo real) — relógio mestre = AudioContext
     ======================================================================== */
  const ui = {
    start: $("#start"),
    replay: $("#replay"),
    controls: $("#controls"),
    time: $("#ctl-time"),
    narr: $("#st-narr"),
    music: $("#st-music")
  };
  const player = {
    state: "loading",
    ctx: null,
    muteNode: null,
    engine: null,
    t0: 0,
    perfStart: 0,
    pausedAt: 0,
    media: null,
    muted: false,
    elements: []
  };

  function audioClock() {
    const p = player;
    if (p.ctx && p.engine) {
      const lat = p.ctx.outputLatency || p.ctx.baseLatency || 0;
      return p.ctx.currentTime - p.t0 - lat;
    }
    if (p.state === "paused") return p.pausedAt;
    return (performance.now() - p.perfStart) / 1000;
  }

  function stopElements() {
    player.elements.forEach((el) => {
      try { el.pause(); el.currentTime = 0; } catch (e) { /* noop */ }
    });
  }

  function scheduleNarrationElements() {
    // fallback (file://): narração tocada por <audio> nos cues da timeline
    const m = player.media;
    if (!m || !m.narration) return;
    m.narration.forEach((n) => {
      if (n.kind !== "element") return;
      if (n.cue <= 0.01) return; // arquivo único: inicia junto com o play
      tl.call(() => {
        if (player.state !== "playing") return;
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
    seek(0);
    if (p.engine) {
      try { p.engine.out.disconnect(); } catch (e) { /* noop */ }
      p.engine = null;
    }
    if (p.ctx) {
      p.ctx.resume();
      const plan = audioPlan();
      const media = Object.assign({}, p.media || {});
      // segmentos de voz para o ducking quando a narração for <audio>
      if (p.media && p.media.narration) {
        media.duckSegments = [];
        p.media.narration.forEach((n) => {
          if (n.kind !== "element") return;
          if (n.cue <= 0.01) {
            ((CFG.audio.narration && CFG.audio.narration.lines) || []).forEach((l) => media.duckSegments.push({ start: l.cue, end: l.cue + 2.2 }));
          } else {
            media.duckSegments.push({ start: n.cue, end: n.cue + (isFinite(n.el.duration) ? n.el.duration : 2.2) });
          }
        });
      }
      if (p.media && p.media.music && p.media.music.kind === "element") {
        media.music = null;
        plan.synthMusic = false;
      }
      p.engine = new ShowreelAudio.Engine(p.ctx, { masterVolume: (CFG.audio && CFG.audio.masterVolume) || 0.9, destination: p.muteNode });
      p.t0 = p.ctx.currentTime + 0.12;
      p.engine.schedule(p.t0, plan, media);
      const lead = 120;
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
      }, lead);
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
    if (media.narration) {
      media.narration.forEach((n) => { if (n.kind === "element") player.elements.push(n.el); });
    }
    if (media.music && media.music.kind === "element") player.elements.push(media.music.el);

    const a = CFG.audio || {};
    if (media.narrationMode === "single") ui.narr.textContent = `NARRAÇÃO — ${a.narration.single} carregada`;
    else if (media.narrationMode === "lines") ui.narr.textContent = `NARRAÇÃO — ${media.narration.length} de ${a.narration.lines.length} frases carregadas`;
    else ui.narr.textContent = `NARRAÇÃO — nenhum arquivo encontrado (adicione ${a.narration ? a.narration.single : "assets/audio/narracao.mp3"}). O vídeo roda sem voz.`;
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
      }, 1800);
    };
    window.addEventListener("mousemove", showControls);
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

  /* ------------------------------------------------------------------------
     BOOT
     ------------------------------------------------------------------------ */
  const ready = build();

  if (RENDER) {
    // API para exportação quadro a quadro (tools/render.mjs)
    window.SHOWREEL = {
      duration: DURATION,
      ready: ready.then(() => true),
      seek: (t) => { seek(t); return tl.totalTime(); },
      renderAudio: () => ShowreelAudio.renderOffline(audioPlan(), CFG, 48000),
      cues: () => cues.slice()
    };
  } else {
    ui.start.classList.add("is-loading");
    bindUI();
    ready.then(prepareAudio).then(() => {
      player.state = "idle";
      ui.start.classList.remove("is-loading");
      ui.start.focus();
    }).catch((err) => {
      console.error(err);
      player.state = "idle";
      ui.start.classList.remove("is-loading");
    });
    gsap.ticker.add(tick);
  }

  // depuração: ?t=7.5 congela no instante informado (sem áudio)
  if (PARAMS.has("t") && !RENDER) {
    ready.then(() => {
      ui.start.style.display = "none";
      player.state = "paused";
      seek(parseFloat(PARAMS.get("t")) || 0);
    });
  }
})();
