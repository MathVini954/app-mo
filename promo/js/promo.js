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
  const B = { home: 6, apr: 14, dia: 28, prz: 35, ai: 41, end: 49.5 };

  ReelEngine({
    width: W,
    height: H,
    duration: DURATION,
    name: "controleng-motion",
    posterTime: K(12),
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
          { k: B.dia, lvl: "lite", chord: "Am" },
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
    const STEPS = [["eq", "Efetivo e atividades", "0 de 103 apropriados · 103 faltam"], ["sun", "Clima e expediente", "Não preenchido"], ["box", "Materiais e terceiros", "Nada registrado"], ["img", "Fotos", "Nenhuma foto"], ["sign", "Assinaturas", "Depois de finalizar"]];
    const stepEls = STEPS.map((s) => {
      const e = document.createElement("div");
      e.className = "stp";
      e.innerHTML = `<span class="ic">${ICO[s[0]]}</span><div><b>${s[1]}</b><span>${s[2]}</span></div><i>›</i>`;
      $("#steps").appendChild(e);
      return e;
    });
    const COLS = [[77, "Terraple-nagem - Aterro…"], [100, "Fundação - Rebai-xament…"], [100, "Fundação - Escava-ção M…"]];
    const colEls = COLS.map((c) => {
      const e = document.createElement("div");
      e.className = "col";
      e.style.height = c[0] + "%";
      e.innerHTML = `<span class="pct">0%</span><span class="lb">${c[1]}</span>`;
      $("#cols").appendChild(e);
      return e;
    });
    const EAP = [["INFRAESTRUTURA", "1.1"], ["EMBASAMENTO", "1.2"], ["TORRE A", "1.3"], ["TORRE B", "1.4"]];
    const eapEls = EAP.map((r) => {
      const e = document.createElement("div");
      e.className = "eap-r";
      e.innerHTML = `<span class="fd"></span><div><b>${r[0]}</b><span>${r[1]}</span></div><i>›</i>`;
      $("#eap").appendChild(e);
      return e;
    });
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
    $("#m-a").innerHTML = "Avanço físico de <b>10,3%</b>, com <b>+2,0%</b> no mês. PPC da última medição: <b>100%</b>.";

    /* ---------------- medições (câmera neutra) ---------------- */
    gsap.set(cam, { x: 0, y: 0, scale: 1 });
    const R = (el) => { const r = rectOf(el); return { x: r.x - INSET, y: r.y - INSET, w: r.w, h: r.h }; };
    const pages = { home: $("#pg-home"), apr: $("#pg-apr"), dia: $("#pg-dia"), prz: $("#pg-prazo") };
    const show = (k) => Object.entries(pages).forEach(([n, p]) => (p.style.visibility = n === k ? "visible" : "hidden"));
    show("apr");
    const MA = { rep: R($("#rep")), add: R($("#abadd")), send: R(send), quem: R($(".quem")), quando: R($(".quando")), bar: R($("#aprbar")) };
    show("home");
    const MH = { adv: R($(".adv")), grid: R($(".grid2")), rio: R($("#riobtn")) };
    const MN = {};
    ["ini", "dia", "apr", "prz", "menu"].forEach((k) => (MN[k] = R(navItem(k))));
    const MS = { torre: R(eapEls[2]), concl: R($("#concl")) };
    show("dia");
    const MD = { steps: R($("#steps")), sem: R($(".semana")) };
    show("prz");
    const MP = { chart: R($(".chart")) };
    Object.values(pages).forEach((p) => (p.style.visibility = "visible"));

    /* ---------------- câmera ---------------- */
    const BASE = { x: 237, y: 640, scale: 1.45 };
    const focus = (r, s, cy) => ({ scale: s, x: 540 - (INSET + r.x + r.w / 2) * s, y: (cy || 1250) - (INSET + r.y + r.h / 2) * s });
    const camTo = (shot, t, d, ease) => tl.to(cam, { x: shot.x, y: shot.y, scale: shot.scale, duration: d || 0.7, ease: ease || "power3.inOut" }, t);
    const punch = (x, y, t, k) => {
      const o = `${x + INSET}px ${y + INSET}px`;
      tl.fromTo(phone, { scale: 1, transformOrigin: o }, { scale: k, transformOrigin: o, duration: 0.08, ease: "power2.out", immediateRender: false }, t);
      tl.to(phone, { scale: 1, duration: 0.34, ease: "power3.out" }, t + 0.08);
    };

    /* ---------------- toque ---------------- */
    const tapEl = $("#tap");
    const core = $(".core", tapEl);
    const calloutsEl = $("#callouts");
    const tapAt = (r, t, o) => {
      o = o || {};
      const x = r.x + r.w * (o.fx == null ? 0.5 : o.fx), y = r.y + r.h / 2;
      tl.set(tapEl, { left: x, top: y }, t - 0.32);
      tl.fromTo(tapEl, { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.24, ease: "power2.out", immediateRender: false }, t - 0.32);
      tl.fromTo(core, { scale: 1 }, { scale: 0.78, duration: 0.07, ease: "power2.in", immediateRender: false }, t - 0.035);
      tl.fromTo(core, { scale: 0.78 }, { scale: 1, duration: 0.2, ease: "power2.out", immediateRender: false }, t + 0.035);
      const rg = document.createElement("i");
      rg.className = "tap-ring";
      calloutsEl.appendChild(rg);
      gsap.set(rg, { left: x, top: y, opacity: 0 });
      tl.fromTo(rg, { scale: 0.4, opacity: 0.95 }, { scale: 2, opacity: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, t);
      tl.to(tapEl, { opacity: 0, duration: 0.18, ease: "power1.in" }, t + (o.hold || 0.22));
      if (o.punch) punch(x, y, t, o.punch);
      sfx("click", t, { v: 0.75 });
    };

    /* ---------------- manchetes ---------------- */
    const headsEl = $("#heads");
    const head = (o) => {
      const b = document.createElement("div");
      b.className = "hd";
      b.innerHTML = `<div class="kk ${o.kcls || ""}">${o.kicker}</div><div class="tt">${o.title.split("|").map((l) => `<span class="ln"><span>${l}</span></span>`).join("")}</div>` + (o.sub ? `<div class="sb2">${o.sub}</div>` : "");
      headsEl.appendChild(b);
      const h = { el: b, kk: $(".kk", b), lines: $$(".ln > span", b), sub: $(".sb2", b) };
      gsap.set(h.lines, { yPercent: 115 });
      gsap.set(h.kk, { opacity: 0, scale: 0.6, transformOrigin: "0% 50%" });
      if (h.sub) gsap.set(h.sub, { opacity: 0, y: 14 });
      return h;
    };
    const headIn = (h, t) => {
      tl.set(h.el, { visibility: "visible" }, t);
      tl.fromTo(h.kk, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.38, ease: "back.out(2.4)", immediateRender: false }, t);
      tl.fromTo(h.lines, { yPercent: 115 }, { yPercent: 0, duration: 0.6, ease: "expo.out", stagger: 0.08, immediateRender: false }, t + 0.05);
      if (h.sub) tl.fromTo(h.sub, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, t + 0.3);
    };
    const headOut = (h, t) => {
      tl.to(h.lines, { yPercent: -115, duration: 0.26, ease: "power3.in", stagger: 0.03 }, t);
      tl.to(h.kk, { opacity: 0, scale: 0.7, duration: 0.2, ease: "power2.in" }, t);
      if (h.sub) tl.to(h.sub, { opacity: 0, y: -10, duration: 0.2, ease: "power2.in" }, t);
      tl.set(h.el, { visibility: "hidden" }, t + 0.34);
    };
    const swap = (a, b, t) => { if (a) headOut(a, t - 0.24); headIn(b, t); };

    /* ---------------- navegação entre telas ---------------- */
    let curPg = "home";
    gsap.set([pages.apr, pages.dia, pages.prz], { xPercent: 100 });
    const go = (k, t) => {
      const from = pages[curPg], to = pages[k];
      tl.fromTo(to, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: "power3.inOut", immediateRender: false }, t);
      tl.fromTo(from, { xPercent: 0 }, { xPercent: -30, duration: 0.5, ease: "power3.inOut", immediateRender: false }, t);
      tl.set(from, { xPercent: 100 }, t + 0.52);
      sfx("whoosh", t, { dur: 0.45, f0: 700, f1: 2200, v: 0.18, pan0: 0.4, pan1: -0.3, peak: 0.5 });
      curPg = k;
    };
    const NAVK = { home: "ini", apr: "apr", dia: "dia", prz: "prz" };
    const navTo = (k, t) => {
      const r = MN[NAVK[k]];
      tl.to(navHl, { left: r.x - 10 + INSET - INSET, width: r.w, duration: 0.4, ease: "back.inOut(1.4)" }, t);
    };
    gsap.set(navHl, { left: MN.ini.x - 10, width: MN.ini.w });
    const navTap = (k, t) => { tapAt(MN[NAVK[k]], t, { punch: 1.015 }); navTo(k, t + 0.02); go(k, t + 0.12); };

    /* ====================================================================
       0 — MARCA (0 – 3,3 s)
       ==================================================================== */
    const brand = $("#brand");
    const arch = $(".arch", brand);
    const wm = $(".wordmark", brand);
    // 1º quadro já composto (vira a capa no WhatsApp); a marca "acende" e cresce de leve
    tl.fromTo(brand, { scale: 0.94 }, { scale: 1, duration: K(6) - 0.75, ease: "sine.out", immediateRender: false }, 0);
    tl.fromTo(arch, { y: 18 }, { y: 0, duration: 1.2, ease: "expo.out", immediateRender: false }, 0.1);
    tl.fromTo(".w-e", { color: "#ffffff" }, { color: "#35c2b6", duration: 0.8, ease: "power2.out", immediateRender: false }, 0.9);
    tl.fromTo(".blob", { scale: 0.8 }, { scale: 1.08, duration: DURATION, ease: "sine.inOut", immediateRender: false }, 0);
    tl.to(".b1", { x: 120, y: 260, duration: DURATION, ease: "sine.inOut" }, 0);
    tl.to(".b2", { x: -160, y: -300, duration: DURATION, ease: "sine.inOut" }, 0);
    sfx("whoosh", 0.15, { dur: 1.0, f0: 220, f1: 1300, v: 0.25, pan0: -0.2, pan1: 0.2, peak: 0.7 });
    // a marca sobe e some; o celular sobe até o centro no 1º "drop"
    tl.to(brand, { y: -620, opacity: 0, duration: 0.7, ease: "power3.in" }, K(B.home) - 0.75);
    gsap.set("#topfade", { opacity: 0 });
    tl.to("#topfade", { opacity: 1, duration: 0.5 }, K(B.home) - 0.4);
    tl.to("#topfade", { opacity: 0, duration: 0.4 }, K(B.end) - 0.1);
    gsap.set(cam, { x: BASE.x, y: H + 80, scale: BASE.scale });
    tl.to(cam, { y: BASE.y, duration: 0.95, ease: "expo.out" }, K(B.home) - 0.35);
    tl.fromTo(phone, { rotation: 6 }, { rotation: 0, duration: 1.0, ease: "expo.out", immediateRender: false }, K(B.home) - 0.35);
    sfx("whoosh", K(B.home) - 0.5, { dur: 0.5, f0: 200, f1: 1600, v: 0.3, pan0: 0, pan1: 0, peak: 0.85 });

    /* ====================================================================
       1 — PAINEL DA OBRA
       ==================================================================== */
    const T1 = K(B.home);
    const h1 = head({ kicker: "ControlEng", title: "A obra inteira|<em>no seu celular.</em>", sub: "Avanço, equipe e pendências num só painel." });
    swap(null, h1, T1);
    // rosca: avanço físico 10,3% (anel externo) e PPC 100% (anel interno)
    tl.fromTo(".d-out", { strokeDashoffset: 314.16 }, { strokeDashoffset: 314.16 * (1 - 0.103), duration: 1.0, ease: "power3.out", immediateRender: false }, T1 + 0.5);
    tl.fromTo(".d-in", { strokeDashoffset: 213.6 }, { strokeDashoffset: 0, duration: 1.3, ease: "power3.inOut", immediateRender: false }, T1 + 0.6);
    $$(".bars i").forEach((b, i) => tl.fromTo(b, { "--s": 0 }, { "--s": 1, duration: 0.6, ease: "back.out(1.6)", immediateRender: false }, T1 + K(3) + i * 0.08));
    // números contam (derivados do tempo: determinístico em qualquer busca)
    const num = (el, from, to, t0, d, fmt) => derived.push((t) => {
      const p = Math.max(0, Math.min(1, (t - t0) / d));
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e);
    });
    const br = (v, dec) => v.toFixed(dec).replace(".", ",");
    num($("#n-av"), 0, 10.3, T1 + 0.5, 1.0, (v) => br(v, 1) + "%");
    num($("#n-ppc"), 0, 100, T1 + 0.6, 1.3, (v) => br(v, 1) + "%");
    num($("#n-mes"), 0, 2, T1 + 0.9, 0.9, (v) => "+" + br(v, 1) + "%");
    num($("#n-pend"), 0, 210, T1 + K(3), 1.0, (v) => String(Math.round(v)));
    camTo(focus(MH.adv, 1.9, 1220), T1 + K(1.5), 0.8);
    camTo(focus(MH.grid, 1.75, 1250), T1 + K(4.5), 0.8);
    sfx("note", T1 + 1.5, { n: 79, v: 1.0 });

    /* ====================================================================
       2 — APROPRIAÇÃO DE MÃO DE OBRA
       ==================================================================== */
    const T2 = K(B.apr);
    const h2 = head({ kicker: "Apropriação", title: "Mão de obra|<em>lançada em segundos.</em>", sub: "Equipe, horas e serviço direto da obra." });
    swap(h1, h2, T2);
    camTo(BASE, T2 - 0.55, 0.5, "power3.inOut");
    navTap("apr", T2 - 0.12);
    // dias da semana: barras de progresso
    dayEls.forEach((d, i) => tl.fromTo($("i", d), { "--p": "0%" }, { "--p": DAYS[i][2] + "%", duration: 0.5, ease: "power2.out", immediateRender: false }, T2 + 0.5 + i * 0.05));
    // repetir dia anterior → equipe preenchida
    const worker = $("#worker");
    gsap.set(worker, { opacity: 0, scale: 0.92 });
    gsap.set("#aprbar", { yPercent: 120 });
    const tRep = T2 + K(3.5);
    camTo(focus({ x: 0, y: MA.rep.y - 10, w: 390, h: MA.quem.y + MA.quem.h - MA.rep.y + 20 }, 1.75, 1240), T2 + K(1.5), 0.8);
    tapAt(MA.rep, tRep, { punch: 1.02 });
    tl.fromTo(worker, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)", immediateRender: false }, tRep + 0.12);
    tl.to(".sel .n0", { opacity: 0, duration: 0.15 }, tRep + 0.15);
    tl.to(".sel .n1", { opacity: 1, duration: 0.2 }, tRep + 0.2);
    tl.to(".multi .n0", { opacity: 0, duration: 0.15 }, tRep + 0.15);
    tl.to(".multi .n1", { opacity: 1, duration: 0.2 }, tRep + 0.2);
    tl.to("#aprbar", { yPercent: 0, duration: 0.5, ease: "expo.out" }, tRep + 0.3);
    sfx("note", tRep + 0.15, { n: 76, v: 1.0 });
    // serviço pela EAP
    const tAdd = T2 + K(7);
    camTo(focus({ x: 0, y: MA.bar.y - 260, w: 390, h: MA.bar.h + 260 }, 1.7, 1300), T2 + K(5.5), 0.7);
    tapAt(MA.add, tAdd, { punch: 1.02 });
    gsap.set("#sheet", { yPercent: 105 });
    tl.to("#scrim", { opacity: 0.4, duration: 0.3 }, tAdd + 0.12);
    tl.to("#sheet", { yPercent: 0, duration: 0.55, ease: "expo.out" }, tAdd + 0.12);
    camTo(BASE, tAdd + 0.12, 0.55, "expo.out");
    sfx("whoosh", tAdd + 0.12, { dur: 0.5, f0: 300, f1: 1400, v: 0.26, pan0: 0, pan1: 0, peak: 0.5 });
    tl.fromTo(eapEls, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out", stagger: 0.05, immediateRender: false }, tAdd + 0.35);
    const tTorre = T2 + K(9);
    tapAt(MS.torre, tTorre, { fx: 0.4 });
    tl.to(eapEls[2], { backgroundColor: "#e8eefc", duration: 0.15 }, tTorre);
    tl.to("#concl", { backgroundColor: "#1f45d6", color: "#ffffff", duration: 0.2 }, tTorre + 0.1);
    const tConcl = T2 + K(10.5);
    tapAt(MS.concl, tConcl, { punch: 1.02 });
    tl.to("#sheet", { yPercent: 105, duration: 0.45, ease: "power3.in" }, tConcl + 0.12);
    tl.to("#scrim", { opacity: 0, duration: 0.3 }, tConcl + 0.2);
    tl.to(".ab-l .f0", { opacity: 0, duration: 0.15 }, tConcl + 0.45);
    tl.fromTo(".ab-l .f1", { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)", immediateRender: false }, tConcl + 0.5);
    tl.to(send, { backgroundColor: "#1f45d6", color: "#ffffff", duration: 0.25 }, tConcl + 0.55);
    camTo(focus({ x: 0, y: MA.bar.y - 260, w: 390, h: MA.bar.h + 260 }, 1.7, 1300), tConcl + 0.3, 0.6);
    const tSend = T2 + K(12.5);
    tapAt(MA.send, tSend, { punch: 1.025 });
    tl.to($(".s0", send), { yPercent: -100, opacity: 0, duration: 0.18, ease: "power2.in" }, tSend + 0.05);
    tl.fromTo($(".s1", send), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.25, ease: "back.out(2)", immediateRender: false }, tSend + 0.12);
    gsap.set($(".s1", send), { opacity: 0 });
    tl.to(send, { backgroundColor: "#16a34a", duration: 0.2 }, tSend + 0.08);
    sfx("note", tSend + 0.1, { n: 79, v: 1.1 });
    sfx("note", tSend + 0.24, { n: 84, v: 1.1 });

    /* ====================================================================
       3 — DIÁRIO DE OBRA
       ==================================================================== */
    const T3 = K(B.dia);
    const h3 = head({ kicker: "Diário de obra", title: "O RDO do dia|<em>sem papel.</em>", sub: "Efetivo, clima, materiais, fotos e assinaturas." });
    swap(h2, h3, T3);
    camTo(BASE, T3 - 0.5, 0.5);
    navTap("dia", T3 - 0.12);
    tl.fromTo(wdEls, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: "back.out(2)", stagger: 0.05, immediateRender: false }, T3 + 0.45);
    tl.fromTo($$(".wd i"), { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(3)", stagger: 0.05, immediateRender: false }, T3 + 0.7);
    tl.fromTo(stepEls, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out", stagger: 0.09, immediateRender: false }, T3 + K(2));
    camTo(focus(MD.steps, 1.65, 1280), T3 + K(3.5), 0.9);
    sfx("note", T3 + K(2), { n: 72, v: 0.9 });

    /* ====================================================================
       4 — PRAZO · PLANEJAMENTO
       ==================================================================== */
    const T4 = K(B.prz);
    const h4 = head({ kicker: "Prazo", title: "Planejamento|<em>na palma da mão.</em>", sub: "Acompanhe cada etapa da EAP em tempo real." });
    swap(h3, h4, T4);
    camTo(BASE, T4 - 0.5, 0.5);
    navTap("prz", T4 - 0.12);
    colEls.forEach((c, i) => {
      tl.fromTo(c, { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: "expo.out", immediateRender: false }, T4 + K(1.5) + i * 0.14);
      num($(".pct", c), 0, COLS[i][0], T4 + K(1.5) + i * 0.14, 0.8, (v) => Math.round(v) + "%");
    });
    camTo(focus(MP.chart, 1.8, 1260), T4 + K(1), 0.9);
    sfx("note", T4 + K(1.5) + 0.3, { n: 79, v: 1.0 });

    /* ====================================================================
       5 — RIO AÍ (assistente integrada; diálogo ilustrativo)
       ==================================================================== */
    const T5 = K(B.ai);
    const h5 = head({ kicker: "RIO AÍ", kcls: "ai", title: "Pergunte.|<em>A obra responde.</em>", sub: "A RIO AÍ vem integrada ao sistema." });
    swap(h4, h5, T5);
    camTo(BASE, T5 - 0.5, 0.5);
    navTap("home", T5 - 0.12);
    // botão da RIO AÍ pulsa
    const rio = $("#riobtn");
    for (let i = 0; i < 2; i++) {
      const rg = document.createElement("i");
      rg.className = "tap-ring";
      calloutsEl.appendChild(rg);
      gsap.set(rg, { left: MH.rio.x + MH.rio.w / 2, top: MH.rio.y + MH.rio.h / 2, opacity: 0, borderColor: "#23d160" });
      tl.fromTo(rg, { scale: 1, opacity: 0.8 }, { scale: 2.4, opacity: 0, duration: 0.8, ease: "power2.out", immediateRender: false }, T5 + 0.5 + i * K(1));
    }
    tl.fromTo(rio, { scale: 1 }, { scale: 1.12, duration: 0.2, ease: "power2.out", immediateRender: false }, T5 + 0.5);
    tl.to(rio, { scale: 1, duration: 0.4, ease: "back.out(3)" }, T5 + 0.7);
    const tRio = T5 + K(2);
    tapAt(MH.rio, tRio, { punch: 1.025 });
    const chat = $("#chat");
    gsap.set(chat, { yPercent: 130, opacity: 0 });
    gsap.set(["#m-q", "#m-a"], { opacity: 0, y: 10 });
    gsap.set("#m-t", { opacity: 0 });
    tl.to("#scrim", { opacity: 0.35, duration: 0.3 }, tRio + 0.1);
    tl.to(chat, { yPercent: 0, opacity: 1, duration: 0.55, ease: "expo.out" }, tRio + 0.1);
    sfx("whoosh", tRio + 0.1, { dur: 0.5, f0: 400, f1: 2400, v: 0.22, pan0: 0, pan1: 0, peak: 0.6 });
    camTo(focus({ x: 12, y: 470, w: 366, h: 280 }, 1.6, 1260), tRio + 0.2, 0.7);
    tl.to("#m-q", { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)" }, tRio + 0.55);
    sfx("note", tRio + 0.55, { n: 76, v: 0.9 });
    tl.to("#m-t", { opacity: 1, duration: 0.2 }, tRio + 0.9);
    $$("#m-t i").forEach((d, i) => tl.fromTo(d, { y: 0 }, { keyframes: { y: [0, -5, 0, 0] }, duration: 0.4, ease: "none", immediateRender: false }, tRio + 0.85 + i * 0.1));
    tl.to("#m-t", { opacity: 0, duration: 0.12 }, tRio + 1.3);
    tl.to("#m-a", { opacity: 1, y: 0, duration: 0.35, ease: "back.out(2)" }, tRio + 1.35);
    sfx("note", tRio + 1.35, { n: 84, v: 1.0 });

    /* ====================================================================
       6 — ENCERRAMENTO
       ==================================================================== */
    const T6 = K(B.end);
    headOut(h5, T6 - 0.25);
    tl.to(cam, { y: H + 300, duration: 0.7, ease: "power3.in" }, T6 - 0.1);
    tl.set(brand, { y: -260, opacity: 0 }, T6);
    tl.to(brand, { opacity: 1, y: -200, duration: 0.6, ease: "expo.out" }, T6 + 0.3);
    const end = $("#end");
    const chips = $$(".end-chips span", end);
    gsap.set(chips, { opacity: 0, y: 30, scale: 0.9 });
    gsap.set(".end-line", { opacity: 0, y: 20 });
    tl.to(chips, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(2)", stagger: K(0.5) }, T6 + 0.55);
    chips.forEach((c, i) => sfx("note", T6 + 0.55 + i * K(0.5), { n: [84, 88, 91, 96][i], v: 1.0 }));
    tl.to(".end-line", { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, T6 + 0.55 + 4 * K(0.5));

    void derived;
  }
})();
