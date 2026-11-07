/* ==========================================================================
   CONTROLENG — MOTION 30 s (1080×1920)
   Uma timeline GSAP na grade da trilha (108 BPM): cada corte, toque e
   manchete cai na batida. Telas recriadas a partir dos prints do app.
   ========================================================================== */
(function () {
  "use strict";

  const CFG = window.SHOWREEL_CONFIG;
  const W = 1080, H = 1920;
  const BPM = 108, BEAT = 60 / BPM, K = (b) => b * BEAT;
  const DURATION = K(54); // 30,0 s
  const B = { home: 5, apr: 11, dia: 26, prz: 37, ai: 42, end: 49.5 };

  ReelEngine({
    width: W,
    height: H,
    duration: DURATION,
    name: "controleng-motion",
    posterTime: K(B.apr + 8),
    config: CFG,
    fonts: ['400 20px "Inter"', '500 20px "Inter"', '600 20px "Inter"', '700 20px "Inter"', '800 60px "Inter"'],
    audioPlan: () => ({
      fadeOut: 0.35,
      music: {
        style: "upbeat", bpm: BPM, grid: 0, end: DURATION, hp: 95, accents: [K(B.home), K(B.apr + 4), K(B.ai + 4)],
        sections: [
          { k: 0, lvl: "intro" },
          { k: B.home, lvl: "lite", hit: "drop", chord: "C" },
          { k: B.apr, lvl: "full", hit: "drop", chord: "C" },
          { k: B.dia, lvl: "full", hit: "drop", chord: "Am" },
          { k: B.prz, lvl: "full", hit: "drop", chord: "F" },
          { k: B.ai, lvl: "brk", hit: "stop", chord: "Am" },
          { k: B.ai + 3, lvl: "lite", chord: "F" },
          { k: B.end, lvl: "fin", hit: "fin" }
        ]
      }
    }),
    build
  });

  function build(api) {
    const { tl, sfx, $, $$, rectOf, derived } = api;
    const cam = $("#cam");
    const phone = $("#phone");
    const INSET = 14;

    /* ---------------- conteúdo dinâmico das telas ---------------- */
    const daysEl = $("#days");
    const DAYS = [["DOM", "1", 0], ["SEG", "2", 100], ["TER", "3", 75], ["QUA", "4", 75], ["QUI", "5", 40], ["SEX", "6", 10], ["SÁB", "7", 0]];
    const dayEls = DAYS.map((d, i) => {
      const e = document.createElement("div");
      e.className = "day" + (i === 6 ? " on" : i === 1 ? " done" : "");
      e.innerHTML = `<small>${d[0]}</small><b>${d[1]}</b><i></i>`;
      daysEl.appendChild(e);
      return e;
    });
    const wd = $("#wdays");
    const WD = [["DOM", "01", ""], ["SEG", "02", "r"], ["TER", "03", "r"], ["QUA", "04", "r"], ["QUI", "05", "o"], ["SEX", "06", "r"], ["SAB", "07", ""]];
    const wdEls = WD.map((d, i) => {
      const e = document.createElement("div");
      e.className = "wd" + (i === 6 ? " on" : "");
      e.innerHTML = `<small>${d[0]}</small><b>${d[1]}</b><i class="${d[2]}"></i>`;
      wd.appendChild(e);
      return e;
    });
    const ICO = {
      eq: '<svg viewBox="0 0 24 24"><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-6 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm12 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM12 13c-2.7 0-6 1.3-6 3.5V18h12v-1.5c0-2.2-3.3-3.5-6-3.5zm-6.5.6C3.5 13.8 1 14.7 1 16.4V18h3v-1.5c0-1.1.6-2.1 1.5-2.9zm13 0c.9.8 1.5 1.8 1.5 2.9V18h3v-1.6c0-1.7-2.5-2.6-4.5-2.8z"/></svg>',
      sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M11 1h2v3h-2zm0 19h2v3h-2zM1 11h3v2H1zm19 0h3v2h-3zM4.2 5.6l1.4-1.4 2.1 2.1-1.4 1.4zm12.1 12.1 1.4-1.4 2.1 2.1-1.4 1.4zM4.2 18.4l2.1-2.1 1.4 1.4-2.1 2.1zM16.3 6.3l2.1-2.1 1.4 1.4-2.1 2.1z"/></svg>',
      box: '<svg viewBox="0 0 24 24"><path d="M3 3h18v5H3zm1 6h16v12H4zm5 3v2h6v-2z"/></svg>',
      img: '<svg viewBox="0 0 24 24"><path d="M21 17V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zM9 13l2.5 3 3.5-4.5 4.5 6H7zM3 7v14h14v-2H5V7z"/></svg>',
      sign: '<svg viewBox="0 0 24 24"><path d="M3 17.2V21h3.8l11-11-3.8-3.8zM20.7 7a1 1 0 0 0 0-1.4l-2.3-2.3a1 1 0 0 0-1.4 0l-1.8 1.8 3.7 3.7z"/></svg>'
    };
    const STEPS = [["eq", "Efetivo e atividades", "0 de 86 apropriados · 86 faltam"], ["sun", "Clima e expediente", "<em class=\"v0\">Não preenchido</em><em class=\"v1\">Ensolarado · 07:00 – 17:00</em>"], ["box", "Materiais e terceiros", "Nada registrado"], ["img", "Fotos", "Nenhuma foto"], ["sign", "Assinaturas", "Depois de finalizar"]];
    const stepEls = STEPS.map((s) => {
      const e = document.createElement("div");
      e.className = "stp";
      e.innerHTML = `<span class="ic">${ICO[s[0]]}</span><div><b>${s[1]}</b><span>${s[2]}</span></div><span class="ok2">✓</span><i>›</i>`;
      $("#steps").appendChild(e);
      return e;
    });
    const COLS = [[64, "Terraple-nagem - Aterro"], [100, "Fundação - Estacas"], [88, "Fundação - Blocos"]];
    const colEls = COLS.map((c) => {
      const e = document.createElement("div");
      e.className = "col";
      e.style.height = c[0] + "%";
      e.innerHTML = `<span class="pct">0%</span><span class="lb">${c[1]}</span>`;
      $("#cols").appendChild(e);
      return e;
    });
    // EAP em quatro níveis: RESIDENCIAL › TORRE A › ESTRUTURA › FÔRMA
    const LV = [
      { t: "RESIDENCIAL", s: "Toque para adicionar. Pode escolher vários.", rows: [["INFRAESTRUTURA", "1.1"], ["EMBASAMENTO", "1.2"], ["TORRE A", "1.3"], ["TORRE B", "1.4"]] },
      { t: "TORRE A", s: "RESIDENCIAL › TORRE A", rows: [["ESTRUTURA", "1.3.1"], ["ALVENARIA", "1.3.2"], ["INSTALAÇÕES", "1.3.3"], ["ACABAMENTO", "1.3.4"]] },
      { t: "ESTRUTURA", s: "TORRE A › ESTRUTURA", rows: [["FÔRMA", "1.3.1.1"], ["ARMAÇÃO", "1.3.1.2"], ["CONCRETAGEM", "1.3.1.3"]] },
      { t: "FÔRMA", s: "ESTRUTURA › FÔRMA", leaf: true, rows: [["APLICAÇÃO DE FÔRMA", "1.3.1.1.1"], ["DESFORMA", "1.3.1.1.2"], ["ESCORAMENTO", "1.3.1.1.3"]] }
    ];
    const shhs = $("#shhs"), eapBox = $("#eap");
    const heads = [], lists = [];
    LV.forEach((L, li) => {
      const h = document.createElement("div");
      h.className = "sh-h";
      h.innerHTML = (li ? '<i class="back">‹</i>' : "") + `<div><b>${L.t}</b><span>${L.s}</span></div><span class="concl">Concluir</span>`;
      shhs.appendChild(h);
      heads.push(h);
      const l = document.createElement("div");
      l.className = "eap-l";
      l.innerHTML = L.rows.map((r) => `<div class="eap-r">${L.leaf ? '<span class="ck"><svg viewBox="0 0 16 16"><path d="M3.5 8.4 6.6 11.3 12.6 4.8"/></svg></span>' : '<span class="fd"></span>'}<div><b>${r[0]}</b><span>${r[1]}</span></div>${L.leaf ? "" : "<i>›</i>"}</div>`).join("");
      eapBox.appendChild(l);
      lists.push(l);
    });
    const rowOf = (li, ri) => $$(".eap-r", lists[li])[ri];
    // Enviar → ✓ Enviado (camadas empilhadas)
    const send = $("#absend");
    send.innerHTML = '<span class="s0">Enviar</span><span class="s1">✓ Enviado</span>';
    Object.assign(send.style, { position: "relative", overflow: "hidden" });
    $$("span", send).forEach((s) => Object.assign(s.style, { position: "absolute", inset: "0", display: "grid", placeItems: "center" }));
    // destaque da barra de navegação
    const nav = $("#bnav");
    const navHl = document.createElement("i");
    navHl.className = "nav-hl";
    nav.insertBefore(navHl, nav.firstChild);
    const navItem = (k) => $(`[data-k="${k}"]`, nav);
    // resposta da RIO AÍ (camadas: digitando → resposta)
    $("#m-a").innerHTML = "Avanço físico de <b>18,6%</b>, com <b>+3,1%</b> no mês. PPC da última medição: <b>92,4%</b>.";

    /* ---------------- medições (câmera neutra) ---------------- */
    gsap.set(cam, { x: 0, y: 0, scale: 1 });
    const R = (el) => { const r = rectOf(el); return { x: r.x - INSET, y: r.y - INSET, w: r.w, h: r.h }; };
    const pages = { home: $("#pg-home"), apr: $("#pg-apr"), dia: $("#pg-dia"), clima: $("#pg-clima"), prz: $("#pg-prazo") };
    const show = (k) => Object.entries(pages).forEach(([n, p]) => (p.style.visibility = n === k ? "visible" : "hidden"));
    show("apr");
    const MA = { rep: R($("#rep")), add: R($("#abadd")), send: R(send), quem: R($(".quem")), bar: R($("#aprbar")) };
    show("home");
    const MH = { adv: R($(".adv")), grid: R($(".grid2")), rio: R($("#riobtn")) };
    const MN = {};
    ["ini", "dia", "apr", "prz", "menu"].forEach((k) => (MN[k] = R(navItem(k))));
    const MS = { torre: R(rowOf(0, 2)), estr: R(rowOf(1, 0)), forma: R(rowOf(2, 0)), aplic: R(rowOf(3, 0)), concl: R($(".concl", heads[3])) };
    show("dia");
    const MD = { steps: R($("#steps")), clima: R(stepEls[1]) };
    show("clima");
    const MC = { sol: R($('[data-w="sol"]')), ini: R($("#hf-ini")), fim: R($("#hf-fim")), save: R($("#save")), form: R($("#pg-clima .fm")) };
    show("prz");
    const MP = { chart: R($(".chart")) };
    Object.values(pages).forEach((p) => (p.style.visibility = "visible"));

    /* ---------------- câmera, impacto e luz ---------------- */
    const rig = $("#rig");
    gsap.set(rig, { transformPerspective: 2400, transformOrigin: "540px 1250px" });
    const BASE = { x: 237, y: 640, scale: 1.45 };
    const focus = (r, s, cy) => ({ scale: s, x: 540 - (INSET + r.x + r.w / 2) * s, y: (cy || 1250) - (INSET + r.y + r.h / 2) * s });
    const camTo = (shot, t, d, ease) => tl.to(cam, { x: shot.x, y: shot.y, scale: shot.scale, duration: d || 0.6, ease: ease || "power4.inOut" }, t);
    const punch = (x, y, t, k) => {
      const o = `${x + INSET}px ${y + INSET}px`;
      tl.fromTo(phone, { scale: 1, transformOrigin: o }, { scale: k, transformOrigin: o, duration: 0.07, ease: "power2.out", immediateRender: false }, t);
      tl.to(phone, { scale: 1, duration: 0.4, ease: "elastic.out(1.1, 0.5)" }, t + 0.07);
    };
    // impacto na batida: clarão, tremida e onda de luz
    const impact = (t, k) => {
      k = k || 1;
      tl.fromTo("#flash", { opacity: 0 }, { opacity: 0.38 * k, duration: 0.04, ease: "none", immediateRender: false }, t);
      tl.to("#flash", { opacity: 0, duration: 0.38, ease: "power2.out" }, t + 0.04);
      tl.fromTo(rig, { x: 0, y: 0 }, { keyframes: { x: [0, -16 * k, 13 * k, -8 * k, 4 * k, 0], y: [0, 10 * k, -9 * k, 5 * k, -2 * k, 0] }, duration: 0.36, ease: "none", immediateRender: false }, t);
      tl.fromTo("#burst", { scale: 0, opacity: 0.9 }, { scale: 230 * k, opacity: 0, duration: 0.7, ease: "expo.out", immediateRender: false }, t);
    };
    // virada de capítulo: o celular gira em 3D enquanto a câmera mergulha
    const swing = (t, dir) => {
      tl.fromTo(rig, { rotationY: 0, rotationX: 0 }, { keyframes: { rotationY: [0, 16 * dir, 0], rotationX: [0, -6, 0] }, duration: 0.75, ease: "power3.inOut", immediateRender: false }, t - 0.4);
    };
    // faíscas de confirmação (ângulos fixos: determinístico)
    const COLORS = ["#35c2b6", "#6f8dff", "#ffd166", "#ffffff", "#16a34a"];
    const calloutsEl = $("#callouts");
    const sparks = (x, y, t, n) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + (i % 2) * 0.3;
        const dist = 60 + ((i * 37) % 50);
        const d = document.createElement("i");
        d.className = "spark";
        d.style.background = COLORS[i % COLORS.length];
        calloutsEl.appendChild(d);
        gsap.set(d, { left: x, top: y, opacity: 0, scale: 0.4 });
        tl.fromTo(d, { x: 0, y: 0, opacity: 1, scale: 1 }, { x: Math.cos(a) * dist, y: Math.sin(a) * dist, opacity: 0, scale: 0.3, duration: 0.6, ease: "expo.out", immediateRender: false }, t);
      }
      const sh = document.createElement("i");
      sh.className = "shock";
      calloutsEl.appendChild(sh);
      gsap.set(sh, { left: x, top: y, opacity: 0, borderColor: "#16a34a" });
      tl.fromTo(sh, { scale: 0.3, opacity: 1 }, { scale: 3.2, opacity: 0, duration: 0.55, ease: "expo.out", immediateRender: false }, t);
    };

    /* ---------------- toque ---------------- */
    const tapEl = $("#tap");
    const core = $(".core", tapEl);
    const tapAt = (r, t, o) => {
      o = o || {};
      const x = r.x + r.w * (o.fx == null ? 0.5 : o.fx), y = r.y + r.h / 2;
      tl.set(tapEl, { left: x, top: y }, t - 0.28);
      tl.fromTo(tapEl, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out", immediateRender: false }, t - 0.28);
      tl.fromTo(core, { scale: 1 }, { scale: 0.72, duration: 0.06, ease: "power2.in", immediateRender: false }, t - 0.03);
      tl.fromTo(core, { scale: 0.72 }, { scale: 1, duration: 0.2, ease: "power2.out", immediateRender: false }, t + 0.03);
      const rg = document.createElement("i");
      rg.className = "tap-ring";
      calloutsEl.appendChild(rg);
      gsap.set(rg, { left: x, top: y, opacity: 0 });
      tl.fromTo(rg, { scale: 0.4, opacity: 1 }, { scale: 2.4, opacity: 0, duration: 0.45, ease: "expo.out", immediateRender: false }, t);
      tl.to(tapEl, { opacity: 0, duration: 0.14, ease: "power1.in" }, t + (o.hold || 0.18));
      if (o.punch) punch(x, y, t, o.punch);
      sfx("click", t, { v: 0.8 });
    };

    /* ---------------- manchetes que "batem" na tela ---------------- */
    const headsEl = $("#heads");
    const head = (o) => {
      const b = document.createElement("div");
      b.className = "hd";
      b.innerHTML = `<div class="kk ${o.kcls || ""}">${o.kicker}</div><div class="tt">${o.title.split("|").map((l) => `<span class="ln"><span>${l}</span></span>`).join("")}</div>` + (o.sub ? `<div class="sb2">${o.sub}</div>` : "") + '<i class="sweep"></i>';
      headsEl.appendChild(b);
      const h = { el: b, kk: $(".kk", b), lines: $$(".ln > span", b), sub: $(".sb2", b), sweep: $(".sweep", b) };
      gsap.set(h.lines, { yPercent: 120, scale: 1.35, rotation: 3, transformOrigin: "0% 100%" });
      gsap.set(h.kk, { opacity: 0, scale: 0.4, transformOrigin: "0% 50%" });
      gsap.set(h.sweep, { xPercent: -120, opacity: 0 });
      if (h.sub) gsap.set(h.sub, { opacity: 0, x: -30 });
      return h;
    };
    const headIn = (h, t) => {
      tl.set(h.el, { visibility: "visible" }, t);
      tl.fromTo(h.kk, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(3)", immediateRender: false }, t);
      tl.fromTo(h.lines, { yPercent: 120, scale: 1.35, rotation: 3 }, { yPercent: 0, scale: 1, rotation: 0, duration: 0.55, ease: "expo.out", stagger: 0.07, immediateRender: false }, t + 0.02);
      tl.fromTo(h.sweep, { xPercent: -120, opacity: 1 }, { xPercent: 320, opacity: 1, duration: 0.7, ease: "power2.inOut", immediateRender: false }, t + 0.35);
      if (h.sub) tl.fromTo(h.sub, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.45, ease: "expo.out", immediateRender: false }, t + 0.25);
    };
    const headOut = (h, t) => {
      tl.to(h.lines, { yPercent: -120, scale: 0.9, duration: 0.24, ease: "power4.in", stagger: 0.03 }, t);
      tl.to(h.kk, { opacity: 0, scale: 0.6, duration: 0.18, ease: "power2.in" }, t);
      if (h.sub) tl.to(h.sub, { opacity: 0, x: 30, duration: 0.18, ease: "power2.in" }, t);
      tl.set(h.el, { visibility: "hidden" }, t + 0.32);
    };
    const swap = (a, b, t) => { if (a) headOut(a, t - 0.22); headIn(b, t); };

    /* ---------------- navegação entre telas ---------------- */
    let curPg = "home";
    gsap.set([pages.apr, pages.dia, pages.clima, pages.prz], { xPercent: 100 });
    const go = (k, t, back) => {
      const from = pages[curPg], to = pages[k];
      tl.fromTo(to, { xPercent: back ? -30 : 100 }, { xPercent: 0, duration: 0.45, ease: "power4.inOut", immediateRender: false }, t);
      tl.fromTo(from, { xPercent: 0 }, { xPercent: back ? 100 : -30, duration: 0.45, ease: "power4.inOut", immediateRender: false }, t);
      tl.set(from, { xPercent: 100 }, t + 0.47);
      sfx("whoosh", t, { dur: 0.4, f0: 700, f1: 2400, v: 0.2, pan0: 0.4, pan1: -0.3, peak: 0.5 });
      curPg = k;
    };
    const NAVK = { home: "ini", apr: "apr", dia: "dia", prz: "prz" };
    const navHlTo = (k, t) => { const r = MN[NAVK[k]]; tl.to(navHl, { left: r.x - 10, width: r.w, duration: 0.4, ease: "back.inOut(1.6)" }, t); };
    gsap.set(navHl, { left: MN.ini.x - 10, width: MN.ini.w });
    const navTap = (k, t) => { tapAt(MN[NAVK[k]], t, { punch: 1.02 }); navHlTo(k, t + 0.02); go(k, t + 0.1); };
    const num = (el, from, to, t0, d, fmt) => derived.push((t) => {
      const p = Math.max(0, Math.min(1, (t - t0) / d));
      el.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    });
    const br = (v, dec) => v.toFixed(dec).replace(".", ",");

    /* ====================================================================
       0 — MARCA
       ==================================================================== */
    const brand = $("#brand");
    const arch = $(".arch", brand);
    tl.fromTo(brand, { scale: 0.9 }, { scale: 1.04, duration: K(B.home), ease: "sine.out", immediateRender: false }, 0);
    tl.fromTo(arch, { y: 22 }, { y: 0, duration: 1.0, ease: "expo.out", immediateRender: false }, 0.05);
    tl.fromTo(".w-e", { color: "#ffffff" }, { color: "#35c2b6", duration: 0.6, ease: "power2.out", immediateRender: false }, 0.7);
    tl.fromTo(".blob", { scale: 0.8 }, { scale: 1.1, duration: DURATION, ease: "sine.inOut", immediateRender: false }, 0);
    tl.to(".b1", { x: 120, y: 260, duration: DURATION, ease: "sine.inOut" }, 0);
    tl.to(".b2", { x: -160, y: -300, duration: DURATION, ease: "sine.inOut" }, 0);
    sfx("whoosh", 0.1, { dur: 1.0, f0: 220, f1: 1300, v: 0.25, pan0: -0.2, pan1: 0.2, peak: 0.7 });
    impact(K(2), 0.5);
    // a marca explode para cima; o celular entra girando no 1º "drop"
    tl.to(brand, { y: -700, scale: 1.4, opacity: 0, duration: 0.5, ease: "power4.in" }, K(B.home) - 0.5);
    gsap.set("#topfade", { opacity: 0 });
    tl.to("#topfade", { opacity: 1, duration: 0.4 }, K(B.home) - 0.3);
    tl.to("#topfade", { opacity: 0, duration: 0.3 }, K(B.end) - 0.1);
    gsap.set(cam, { x: BASE.x, y: H + 120, scale: BASE.scale });
    tl.to(cam, { y: BASE.y, duration: 0.8, ease: "expo.out" }, K(B.home) - 0.3);
    tl.fromTo(phone, { rotation: 12 }, { rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.6)", immediateRender: false }, K(B.home) - 0.3);
    sfx("whoosh", K(B.home) - 0.45, { dur: 0.45, f0: 200, f1: 1800, v: 0.32, pan0: 0, pan1: 0, peak: 0.9 });

    /* ====================================================================
       1 — PAINEL DA OBRA
       ==================================================================== */
    const T1 = K(B.home);
    impact(T1, 1);
    const h1 = head({ kicker: "ControlEng", title: "A obra inteira|<em>no seu celular.</em>", sub: "Avanço, equipe e pendências num só painel." });
    swap(null, h1, T1);
    tl.fromTo(".d-out", { strokeDashoffset: 314.16 }, { strokeDashoffset: 314.16 * (1 - 0.186), duration: 0.9, ease: "expo.out", immediateRender: false }, T1 + 0.35);
    tl.fromTo(".d-in", { strokeDashoffset: 213.6 }, { strokeDashoffset: 213.6 * (1 - 0.924), duration: 1.1, ease: "expo.inOut", immediateRender: false }, T1 + 0.45);
    $$(".bars i").forEach((b, i) => tl.fromTo(b, { "--s": 0 }, { "--s": 1, duration: 0.5, ease: "back.out(2.2)", immediateRender: false }, T1 + K(2.5) + i * 0.06));
    num($("#n-av"), 0, 18.6, T1 + 0.35, 0.9, (v) => br(v, 1) + "%");
    num($("#n-ppc"), 0, 92.4, T1 + 0.45, 1.1, (v) => br(v, 1) + "%");
    num($("#n-mes"), 0, 3.1, T1 + 0.7, 0.8, (v) => "+" + br(v, 1) + "%");
    num($("#n-pend"), 0, 148, T1 + K(2.5), 0.9, (v) => String(Math.round(v)));
    camTo(focus(MH.adv, 2.0, 1220), T1 + K(1), 0.6);
    camTo(focus(MH.grid, 1.85, 1250), T1 + K(3.5), 0.6);
    sfx("note", T1 + 1.2, { n: 79, v: 1.0 });

    /* ====================================================================
       2 — APROPRIAÇÃO: equipe → TORRE A › ESTRUTURA › FÔRMA › APLICAÇÃO DE FÔRMA
       ==================================================================== */
    const T2 = K(B.apr);
    const h2 = head({ kicker: "Apropriação", title: "Mão de obra|<em>lançada em segundos.</em>", sub: "Equipe, horas e serviço direto da obra." });
    swap(h1, h2, T2);
    impact(T2, 1);
    swing(T2, -1);
    camTo(BASE, T2 - 0.45, 0.45);
    navTap("apr", T2 - 0.1);
    dayEls.forEach((d, i) => tl.fromTo($("i", d), { "--p": "0%" }, { "--p": DAYS[i][2] + "%", duration: 0.45, ease: "expo.out", immediateRender: false }, T2 + 0.4 + i * 0.04));
    const worker = $("#worker");
    gsap.set(worker, { opacity: 0, scale: 0.85 });
    gsap.set("#aprbar", { yPercent: 120 });
    const tRep = T2 + K(2.5);
    camTo(focus({ x: 0, y: MA.rep.y - 10, w: 390, h: MA.quem.y + MA.quem.h - MA.rep.y + 20 }, 1.8, 1240), T2 + K(1), 0.55);
    tapAt(MA.rep, tRep, { punch: 1.025 });
    tl.fromTo(worker, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.45, ease: "elastic.out(1, 0.6)", immediateRender: false }, tRep + 0.1);
    tl.to(".sel .n0", { opacity: 0, duration: 0.12 }, tRep + 0.12);
    tl.to(".sel .n1", { opacity: 1, duration: 0.15 }, tRep + 0.15);
    tl.to(".multi .n0", { opacity: 0, duration: 0.12 }, tRep + 0.12);
    tl.to(".multi .n1", { opacity: 1, duration: 0.15 }, tRep + 0.15);
    tl.to("#aprbar", { yPercent: 0, duration: 0.45, ease: "expo.out" }, tRep + 0.25);
    sfx("note", tRep + 0.12, { n: 76, v: 1.0 });
    // serviço: desce a árvore da EAP
    const tAdd = T2 + K(4.5);
    camTo(focus({ x: 0, y: MA.bar.y - 240, w: 390, h: MA.bar.h + 240 }, 1.75, 1300), T2 + K(3.5), 0.45);
    tapAt(MA.add, tAdd, { punch: 1.025 });
    gsap.set("#sheet", { yPercent: 105 });
    lists.forEach((l, i) => gsap.set(l, { xPercent: i ? 100 : 0 }));
    heads.forEach((h, i) => gsap.set(h, { opacity: i ? 0 : 1, x: i ? 30 : 0 }));
    tl.to("#scrim", { opacity: 0.45, duration: 0.25 }, tAdd + 0.1);
    tl.to("#sheet", { yPercent: 0, duration: 0.5, ease: "expo.out" }, tAdd + 0.1);
    camTo(focus({ x: 0, y: 90, w: 390, h: 600 }, 1.75, 1250), tAdd + 0.1, 0.5, "expo.out");
    sfx("whoosh", tAdd + 0.1, { dur: 0.45, f0: 300, f1: 1600, v: 0.28, pan0: 0, pan1: 0, peak: 0.5 });
    tl.fromTo($$(".eap-r", lists[0]), { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.3, ease: "expo.out", stagger: 0.04, immediateRender: false }, tAdd + 0.3);
    const drill = (li, r, t, note) => {
      tapAt(r, t, { fx: 0.35 });
      tl.to(rowOf(li, [2, 0, 0][li]), { backgroundColor: "#e8eefc", duration: 0.1 }, t);
      tl.to(lists[li], { xPercent: -100, duration: 0.38, ease: "power4.inOut" }, t + 0.12);
      tl.fromTo(lists[li + 1], { xPercent: 100 }, { xPercent: 0, duration: 0.38, ease: "power4.inOut", immediateRender: false }, t + 0.12);
      tl.fromTo($$(".eap-r", lists[li + 1]), { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.32, ease: "expo.out", stagger: 0.035, immediateRender: false }, t + 0.24);
      tl.to(heads[li], { opacity: 0, x: -30, duration: 0.14, ease: "power2.in" }, t + 0.12);
      tl.to(heads[li + 1], { opacity: 1, x: 0, duration: 0.25, ease: "power3.out" }, t + 0.26);
      sfx("note", t, { n: note, v: 0.9 });
    };
    const tL1 = T2 + K(6), tL2 = T2 + K(7.25), tL3 = T2 + K(8.5), tLeaf = T2 + K(9.75), tOk = T2 + K(11);
    drill(0, MS.torre, tL1, 72);
    drill(1, MS.estr, tL2, 76);
    drill(2, MS.forma, tL3, 79);
    // folha: APLICAÇÃO DE FÔRMA marcada
    tapAt(MS.aplic, tLeaf, { fx: 0.35, punch: 1.02 });
    const ck = $(".ck", rowOf(3, 0));
    tl.to(rowOf(3, 0), { backgroundColor: "#e8eefc", duration: 0.12 }, tLeaf);
    tl.to(ck, { backgroundColor: "#1f45d6", borderColor: "#1f45d6", duration: 0.12 }, tLeaf + 0.02);
    tl.fromTo(ck, { scale: 1 }, { keyframes: { scale: [1, 1.4, 1] }, duration: 0.35, ease: "power2.out", immediateRender: false }, tLeaf + 0.02);
    tl.to($("svg", ck), { opacity: 1, duration: 0.1 }, tLeaf + 0.05);
    sparks(MS.aplic.x + 32, MS.aplic.y + MS.aplic.h / 2, tLeaf + 0.04, 12);
    sfx("note", tLeaf, { n: 84, v: 1.1 });
    tl.to($(".concl", heads[3]), { backgroundColor: "#1f45d6", color: "#ffffff", duration: 0.15 }, tLeaf + 0.15);
    tapAt(MS.concl, tOk, { punch: 1.025 });
    tl.to("#sheet", { yPercent: 105, duration: 0.4, ease: "power4.in" }, tOk + 0.1);
    tl.to("#scrim", { opacity: 0, duration: 0.25 }, tOk + 0.2);
    tl.to(".ab-l .f0", { opacity: 0, duration: 0.1 }, tOk + 0.4);
    tl.fromTo(".ab-l .f1", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2.5)", immediateRender: false }, tOk + 0.45);
    tl.to(send, { backgroundColor: "#1f45d6", color: "#ffffff", duration: 0.2 }, tOk + 0.5);
    camTo(focus({ x: 0, y: MA.bar.y - 240, w: 390, h: MA.bar.h + 240 }, 1.75, 1300), tOk + 0.2, 0.5);
    const tSend = T2 + K(14);
    tapAt(MA.send, tSend, { punch: 1.03 });
    tl.to($(".s0", send), { yPercent: -100, opacity: 0, duration: 0.15, ease: "power2.in" }, tSend + 0.04);
    gsap.set($(".s1", send), { opacity: 0 });
    tl.fromTo($(".s1", send), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.25, ease: "back.out(2.5)", immediateRender: false }, tSend + 0.1);
    tl.to(send, { backgroundColor: "#16a34a", duration: 0.15 }, tSend + 0.06);
    sparks(MA.send.x + MA.send.w / 2, MA.send.y + MA.send.h / 2, tSend + 0.06, 16);
    impact(tSend + 0.05, 0.6);
    sfx("note", tSend + 0.08, { n: 79, v: 1.1 });
    sfx("note", tSend + 0.22, { n: 84, v: 1.1 });

    /* ====================================================================
       3 — DIÁRIO DE OBRA: clima e expediente
       ==================================================================== */
    const T3 = K(B.dia);
    const h3 = head({ kicker: "Diário de obra", title: "O RDO do dia|<em>em poucos toques.</em>", sub: "Clima, início e fim do expediente." });
    swap(h2, h3, T3);
    impact(T3, 0.8);
    swing(T3, 1);
    camTo(BASE, T3 - 0.45, 0.45);
    navTap("dia", T3 - 0.1);
    tl.fromTo(wdEls, { opacity: 0, y: 16, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(2.5)", stagger: 0.04, immediateRender: false }, T3 + 0.35);
    tl.fromTo($$(".wd i"), { scale: 0 }, { scale: 1, duration: 0.25, ease: "back.out(3)", stagger: 0.04, immediateRender: false }, T3 + 0.55);
    tl.fromTo(stepEls, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.32, ease: "expo.out", stagger: 0.06, immediateRender: false }, T3 + 0.6);
    const tClima = T3 + K(2);
    tapAt(MD.clima, tClima, { fx: 0.4, punch: 1.02 });
    tl.to(stepEls[1], { backgroundColor: "#eef2fd", duration: 0.1 }, tClima);
    go("clima", tClima + 0.12);
    camTo(focus({ x: 0, y: 60, w: 390, h: MC.save.y + MC.save.h - 50 }, 1.6, 1260), tClima + 0.1, 0.5, "expo.out");
    const tSol = T3 + K(3.5), tIni = T3 + K(4.5), tFim = T3 + K(5.5), tSave = T3 + K(6.75);
    const sol = $('[data-w="sol"]');
    tapAt(MC.sol, tSol, { punch: 1.02 });
    tl.to(sol, { backgroundColor: "#fff4d6", boxShadow: "inset 0 0 0 2px #f59e0b", color: "#8a5a00", duration: 0.15 }, tSol);
    tl.to($("svg", sol), { fill: "#f59e0b", rotation: 90, duration: 0.6, ease: "back.out(2)" }, tSol);
    tl.fromTo(sol, { scale: 1 }, { keyframes: { scale: [1, 1.12, 1] }, duration: 0.35, ease: "power2.out", immediateRender: false }, tSol);
    sfx("note", tSol, { n: 76, v: 1.0 });
    const hour = (id, r, t, note) => {
      tapAt(r, t, { punch: 1.015 });
      const f = $(id);
      tl.to(f, { boxShadow: "inset 0 0 0 2px #1f45d6", backgroundColor: "#eef2fd", duration: 0.12 }, t);
      tl.to($(".v0", f), { opacity: 0, y: -10, duration: 0.12 }, t + 0.05);
      tl.fromTo($(".v1", f), { opacity: 0, y: 14, scale: 1.3 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(2.5)", immediateRender: false }, t + 0.08);
      sfx("note", t + 0.08, { n: note, v: 1.0 });
    };
    hour("#hf-ini", MC.ini, tIni, 79);
    hour("#hf-fim", MC.fim, tFim, 81);
    const save = $("#save");
    tapAt(MC.save, tSave, { punch: 1.03 });
    tl.to($(".s0", save), { yPercent: -100, opacity: 0, duration: 0.15, ease: "power2.in" }, tSave + 0.04);
    tl.fromTo($(".s1", save), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.25, ease: "back.out(2.5)", immediateRender: false }, tSave + 0.1);
    tl.to(save, { backgroundColor: "#16a34a", duration: 0.15 }, tSave + 0.06);
    sparks(MC.save.x + MC.save.w / 2, MC.save.y + MC.save.h / 2, tSave + 0.06, 16);
    sfx("note", tSave + 0.08, { n: 84, v: 1.1 });
    // volta ao diário: etapa preenchida
    const tBack = tSave + 0.6;
    go("dia", tBack, true);
    camTo(focus(MD.steps, 1.7, 1260), tBack, 0.5);
    const cs = stepEls[1];
    tl.to($(".v0", cs), { opacity: 0, duration: 0.1 }, tBack + 0.35);
    tl.fromTo($(".v1", cs), { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.3, ease: "expo.out", immediateRender: false }, tBack + 0.4);
    tl.fromTo($(".ok2", cs), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(3)", immediateRender: false }, tBack + 0.45);
    gsap.set($(".v1", cs), { opacity: 0 });

    /* ====================================================================
       4 — PRAZO · PLANEJAMENTO
       ==================================================================== */
    const T4 = K(B.prz);
    const h4 = head({ kicker: "Prazo", title: "Planejamento|<em>na palma da mão.</em>", sub: "Cada etapa da EAP em tempo real." });
    swap(h3, h4, T4);
    impact(T4, 1);
    swing(T4, -1);
    camTo(BASE, T4 - 0.45, 0.45);
    navTap("prz", T4 - 0.1);
    colEls.forEach((c, i) => {
      tl.fromTo(c, { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: "elastic.out(1, 0.7)", immediateRender: false }, T4 + K(1) + i * 0.1);
      num($(".pct", c), 0, COLS[i][0], T4 + K(1) + i * 0.1, 0.7, (v) => Math.round(v) + "%");
    });
    camTo(focus(MP.chart, 1.85, 1260), T4 + K(0.75), 0.6);
    sfx("note", T4 + K(1) + 0.2, { n: 79, v: 1.0 });

    /* ====================================================================
       5 — RIO AÍ (assistente integrada; diálogo ilustrativo)
       ==================================================================== */
    const T5 = K(B.ai);
    const h5 = head({ kicker: "RIO AÍ", kcls: "ai", title: "Pergunte.|<em>A obra responde.</em>", sub: "A RIO AÍ vem integrada ao sistema." });
    swap(h4, h5, T5);
    impact(T5, 0.7);
    camTo(BASE, T5 - 0.45, 0.45);
    navTap("home", T5 - 0.1);
    const rio = $("#riobtn");
    for (let i = 0; i < 2; i++) {
      const rg = document.createElement("i");
      rg.className = "tap-ring";
      calloutsEl.appendChild(rg);
      gsap.set(rg, { left: MH.rio.x + MH.rio.w / 2, top: MH.rio.y + MH.rio.h / 2, opacity: 0, borderColor: "#23d160" });
      tl.fromTo(rg, { scale: 1, opacity: 0.9 }, { scale: 2.8, opacity: 0, duration: 0.7, ease: "expo.out", immediateRender: false }, T5 + 0.35 + i * K(1));
    }
    tl.fromTo(rio, { scale: 1 }, { keyframes: { scale: [1, 1.2, 1] }, duration: 0.45, ease: "power2.out", immediateRender: false }, T5 + 0.35);
    const tRio = T5 + K(1.75);
    tapAt(MH.rio, tRio, { punch: 1.03 });
    const chat = $("#chat");
    gsap.set(chat, { yPercent: 130, opacity: 0, scale: 0.9 });
    gsap.set(["#m-q", "#m-a"], { opacity: 0, y: 10 });
    gsap.set("#m-t", { opacity: 0 });
    tl.to("#scrim", { opacity: 0.4, duration: 0.25 }, tRio + 0.08);
    tl.to(chat, { yPercent: 0, opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" }, tRio + 0.08);
    sfx("whoosh", tRio + 0.08, { dur: 0.45, f0: 400, f1: 2600, v: 0.24, pan0: 0, pan1: 0, peak: 0.6 });
    camTo(focus({ x: 12, y: 470, w: 366, h: 280 }, 1.65, 1260), tRio + 0.15, 0.55);
    tl.to("#m-q", { opacity: 1, y: 0, duration: 0.28, ease: "back.out(2.5)" }, tRio + 0.45);
    sfx("note", tRio + 0.45, { n: 76, v: 0.9 });
    tl.to("#m-t", { opacity: 1, duration: 0.15 }, tRio + 0.75);
    $$("#m-t i").forEach((d, i) => tl.fromTo(d, { y: 0 }, { keyframes: { y: [0, -5, 0, 0] }, duration: 0.4, ease: "none", immediateRender: false }, tRio + 0.75 + i * 0.1));
    tl.to("#m-t", { opacity: 0, duration: 0.1 }, tRio + 1.2);
    tl.fromTo("#m-a", { opacity: 0, y: 10, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(2)", immediateRender: false }, tRio + 1.25);
    sfx("note", tRio + 1.25, { n: 84, v: 1.0 });

    /* ====================================================================
       6 — ENCERRAMENTO
       ==================================================================== */
    const T6 = K(B.end);
    headOut(h5, T6 - 0.25);
    tl.to(cam, { y: H + 300, duration: 0.55, ease: "power4.in" }, T6 - 0.15);
    impact(T6 + 0.3, 1.1);
    tl.set(brand, { y: -200, scale: 1.6, opacity: 0 }, T6);
    tl.to(brand, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" }, T6 + 0.3);
    const end = $("#end");
    const chips = $$(".end-chips span", end);
    gsap.set(chips, { opacity: 0, y: 40, scale: 0.6 });
    gsap.set(".end-line", { opacity: 0, y: 20 });
    tl.to(chips, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(3)", stagger: K(0.5) }, T6 + 0.55);
    chips.forEach((c, i) => sfx("note", T6 + 0.55 + i * K(0.5), { n: [84, 88, 91, 96][i], v: 1.0 }));
    tl.to(".end-line", { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, T6 + 0.55 + 4 * K(0.5));

    void derived;
  }
})();
