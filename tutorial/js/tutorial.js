/* ==========================================================================
   TUTORIAL — NOVA REQUISIÇÃO (1080×1920, ~1 min)
   Uma timeline GSAP. Câmera sobre uma réplica do app; toques, foco e
   legendas grandes (funciona sem som). Destaques pedidos:
   - Insumos: NOVO filtro por tipo de serviço (Hidráulica → só hidráulica…)
   - Serviço/apropriação: opcional — seu líder pode apropriar por você.
   ========================================================================== */

(function () {
  "use strict";

  const CFG = window.SHOWREEL_CONFIG;
  const W = 1080;
  const H = 1920;
  // ROTEIRO: cada bloco começa onde o anterior termina (ajuste aqui o ritmo)
  const T = {};
  T.s1 = 3.7;                 // passo 1 · quem retira
  T.s2 = T.s1 + 4.1;          // passo 2 · insumos
  T.th = T.s2 + 4.2;          // toque em Hidráulica
  T.te = T.th + 3.1;          // Elétrica
  T.ta = T.te + 1.5;          // Alvenaria
  T.ts = T.ta + 1.2;          // "toque no insumo"
  T.p0 = T.ts + 1.1;          // 1º insumo (completo)
  T.p1 = T.p0 + 3.75;         // 2º insumo (rápido)
  T.p2 = T.p1 + 2.25;         // 3º insumo (rápido)
  T.tc = T.p2 + 2.6;          // Concluir
  T.s3 = T.tc + 4.3;          // passo 3 · "Não é mais obrigatório"
  T.tl = T.s3 + 4.8;          // "Seu líder pode apropriar por você"
  T.tout = T.tl + 5.6;        // cartão sai
  T.e0 = T.tout + 0.1;        // caminho opcional pela EAP
  T.s4 = T.e0 + 6.6;          // passo 4 · enviar
  T.send = T.s4 + 4.3;        // toque em Enviar
  T.s5 = T.send + 2.65;       // resumo
  T.foot = T.s5 + 2.3;        // "Dúvidas? Fale com o seu líder."
  const DURATION = Math.round((T.s5 + 6.45) * 10) / 10;

  /* ------------------------------------------------------------------------
     DADOS DA DEMONSTRAÇÃO (itens reais das capturas + exemplos plausíveis)
     ------------------------------------------------------------------------ */
  const ICON = {
    all: '<svg viewBox="0 0 24 24"><path d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z"/></svg>',
    hid: '<svg viewBox="0 0 24 24"><path d="M12 2.5S5 10.2 5 14.5a7 7 0 0 0 14 0C19 10.2 12 2.5 12 2.5z"/></svg>',
    ele: '<svg viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
    alv: '<svg viewBox="0 0 24 24"><path d="M2 5h9v4H2zm11 0h9v4h-9zM2 11h4v4H2zm6 0h9v4H8zm11 0h3v4h-3zM2 17h9v4H2zm11 0h9v4h-9z"/></svg>',
    est: '<svg viewBox="0 0 24 24"><path d="M3 4h18v3h-7.5v10H21v3H3v-3h7.5V7H3z"/></svg>',
    aca: '<svg viewBox="0 0 24 24"><path d="M18 3H6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm1 3h2v6h-9v3h1v7h-4v-7h1v-5h9z"/></svg>'
  };
  const CATS = [
    { key: "all", label: "Todos", count: "129 no estoque" },
    { key: "hid", label: "Hidráulica", count: "12 de 129 · Hidráulica" },
    { key: "ele", label: "Elétrica", count: "9 de 129 · Elétrica" },
    { key: "alv", label: "Alvenaria", count: "8 de 129 · Alvenaria" },
    { key: "est", label: "Estrutura" },
    { key: "aca", label: "Acabamento" }
  ];
  // nome, estoque, categoria
  const ITEMS = [
    ["ADAPTADOR CURTO SOLDÁVEL DE PVC MARROM 25MM", "6 un", "hid"],
    ["ADAPTADOR SOLDÁVEL DE PVC MARROM COM FLANGE", "2 un", "hid"],
    ["ADESIVO ESTRUTURAL BICOMPONENTE À BASE DE EPÓXI", "27 kg", "est"],
    ["ADESIVO PARA TUBO CPVC 850G", "1 un", "hid"],
    ["ADESIVO PARA TUBO PVC 850G", "2 un", "hid"],
    ["ALICATE TORQUÊS ARMADOR 12\" 30CM", "5 un", "est"],
    ["ANEL DE BORRACHA PARA TUBO PVC ESGOTO SÉRIE NORMAL 100MM", "99 un", "hid"],
    ["ANEL DE BORRACHA PARA TUBO PVC ESGOTO SÉRIE NORMAL 50MM", "50 un", "hid"],
    ["ARGAMASSA COLANTE ACI (NBR:14081)", "250 kg", "aca"],
    ["ARGAMASSA PRÉ-FABRICADA PARA ASSENTAMENTO", "1200 kg", "alv"],
    ["ARGAMASSA PRÉ-FABRICADA PARA CHAPISCO COLANTE", "980 kg", "alv"],
    ["ARGAMASSA PRÉ-FABRICADA PARA GRAUTEAMENTO", "500 kg", "alv"],
    ["BARROTE MISTO 5,5CM X 5,5CM", "3322 m", "est"],
    ["BARROTE PINUS PARA FÔRMA 5,5 X 5,5CM", "1480 m", "est"],
    ["BLOCO CERÂMICO DE VEDAÇÃO 9X19X29CM", "4200 un", "alv"],
    ["BLOCO DE CONCRETO 14X19X39CM", "1600 un", "alv"],
    ["CABO FLEXÍVEL 2,5MM² AZUL 750V", "1200 m", "ele"],
    ["CABO FLEXÍVEL 4,0MM² PRETO 750V", "600 m", "ele"],
    ["CAIXA DE LUZ 4X2 PVC AMARELA", "230 un", "ele"],
    ["CAIXA SIFONADA PVC 150X150X50MM", "18 un", "hid"],
    ["CAL HIDRATADA CH-I SACO 20KG", "90 sc", "alv"],
    ["CIMENTO CP II-E-32 SACO 50KG", "180 sc", "alv"],
    ["DISJUNTOR MONOPOLAR DIN 20A", "48 un", "ele"],
    ["ELETRODUTO CORRUGADO FLEXÍVEL 3/4\"", "950 m", "ele"],
    ["FITA ISOLANTE ANTICHAMA 20M", "36 un", "ele"],
    ["INTERRUPTOR SIMPLES 4X2 COM PLACA", "75 un", "ele"],
    ["JOELHO 90° PVC SOLDÁVEL 25MM", "140 un", "hid"],
    ["LUVA DE CORRER PVC ESGOTO 100MM", "30 un", "hid"],
    ["QUADRO DE DISTRIBUIÇÃO 12 DISJUNTORES", "8 un", "ele"],
    ["REGISTRO DE GAVETA BRUTO 3/4\"", "12 un", "hid"],
    ["TÊ PVC SOLDÁVEL 25MM", "64 un", "hid"],
    ["TELA PARA ALVENARIA 7,5X50CM", "900 un", "alv"],
    ["TOMADA 2P+T 10A COM PLACA", "110 un", "ele"],
    ["TUBO PVC SOLDÁVEL 25MM BARRA 6M", "120 un", "hid"],
    ["VERGALHÃO CA-50 10MM BARRA 12M", "210 un", "est"]
  ].map((r, i) => ({ id: i, name: r[0], qty: r[1], cat: r[2] }));
  // primeira página de "Todos" = exatamente a ordem da captura real
  const FIRST_PAGE_ALL = [
    "ADAPTADOR CURTO", "ADAPTADOR SOLDÁVEL", "ADESIVO ESTRUTURAL", "ADESIVO PARA TUBO CPVC", "ADESIVO PARA TUBO PVC",
    "ALICATE", "ANEL DE BORRACHA PARA TUBO PVC ESGOTO SÉRIE NORMAL 100", "ANEL DE BORRACHA PARA TUBO PVC ESGOTO SÉRIE NORMAL 50",
    "ARGAMASSA COLANTE", "ARGAMASSA PRÉ-FABRICADA PARA CHAPISCO", "ARGAMASSA PRÉ-FABRICADA PARA GRAUTEAMENTO", "BARROTE MISTO", "BARROTE PINUS"
  ].map((p) => ITEMS.find((it) => it.name.startsWith(p)).id);
  const byCat = (c) => ITEMS.filter((it) => it.cat === c).map((it) => it.id);
  const idOf = (prefix) => ITEMS.find((it) => it.name.startsWith(prefix)).id;
  // coerente com o serviço escolhido depois (VEDAÇÕES › BLOCO CERÂMICO - TORRE)
  const PICK = [idOf("ARGAMASSA PRÉ-FABRICADA PARA ASSENTAMENTO"), idOf("BLOCO CERÂMICO"), idOf("TELA PARA ALVENARIA")];
  const PICK_QTY = ["100 kg", "400 un", "120 un"];

  const EAP1 = [
    ["CUSTOS INDIRETOS", "1"], ["CUSTOS DIRETOS - INFRAESTRUTURA", "2"], ["CUSTOS DIRETOS - SEMI ENTERRADO", "3"],
    ["CUSTOS DIRETOS - TORRE", "4"], ["CUSTOS DIRETOS - IEP", "5"], ["CUSTOS DIRETOS - GUARITA PEDESTRE", "6"],
    ["CUSTOS DIRETOS - GUARITA LIXO E GÁS", "7"], ["CUSTOS DIRETOS - ACADEMIA", "8"], ["CUSTOS DIRETOS - ÁREAS EXTERNAS", "9"]
  ];
  // nível intermediário ilustrativo (o real vem da EAP de cada obra)
  const EAP2 = [
    ["SUPRAESTRUTURA - TORRE", "4001"], ["INSTALAÇÕES HIDROSSANITÁRIAS - TORRE", "4002"], ["INSTALAÇÕES ELÉTRICAS - TORRE", "4003"],
    ["VEDAÇÕES", "4004"], ["REVESTIMENTOS - TORRE", "4005"], ["ESQUADRIAS - TORRE", "4006"]
  ];
  const EAP3 = [
    ["BLOCO CERÂMICO - TORRE", "4004001"], ["BLOCO DE GESSO - TORRE", "4004002"], ["BLOCO DE CONCRETO - TORRE", "4004003"],
    ["PAREDES EM DRYWALL - TORRE", "4004004"], ["FECHAMENTOS DE SHAFT - TORRE", "4004005"], ["OUTROS FECHAMENTOS - TORRE", "4004006"]
  ];

  /* ------------------------------------------------------------------------
     NARRAÇÃO OPCIONAL (arquivos em tutorial/audio/narracao-01.mp3 …)
     ------------------------------------------------------------------------ */
  const NARR = [
    { cue: T.s1 + 0.2, text: "Primeiro, confira quem vai retirar o material." },
    { cue: T.s2 + 0.4, text: "Depois, escolha os insumos." },
    { cue: T.th - 1.8, text: "Novidade: filtro por tipo de serviço." },
    { cue: T.th + 1.0, text: "Hidráulica? Só aparece hidráulica." },
    { cue: T.te, text: "E assim por diante." },
    { cue: T.ts + 0.5, text: "Toque no insumo e digite a quantidade." },
    { cue: T.p1, text: "Repita para os outros e toque em Concluir." },
    { cue: T.tc + 0.8, text: "Pronto: insumos no carrinho." },
    { cue: T.s3 + 0.5, text: "E o serviço? Não é mais obrigatório." },
    { cue: T.tl + 0.2, text: "Seu líder pode apropriar por você. Ele pode indicar o serviço depois." },
    { cue: T.e0 + 0.4, text: "Se souber o serviço, é só escolher na árvore da EAP." },
    { cue: T.s4 + 0.3, text: "Por fim, envie agora ou junte no lote." },
    { cue: T.send + 0.4, text: "Pronto, requisição enviada." },
    { cue: T.foot, text: "Dúvidas? Fale com o seu líder." }
  ];
  CFG.audio.narration.lines = NARR.map((n, i) => ({ src: `audio/narracao-${String(i + 1).padStart(2, "0")}.mp3`, cue: n.cue, text: n.text }));

  // marcas preenchidas pela timeline (build) e lidas pela trilha
  const MARKS = { accents: [], quiet: [], finalAt: null };

  ReelEngine({
    width: W,
    height: H,
    duration: DURATION,
    name: "tutorial-requisicao",
    posterTime: 12.9,
    config: CFG,
    fonts: ['400 20px "Inter"', '500 20px "Inter"', '600 20px "Inter"', '700 20px "Inter"', '800 60px "Inter"'],
    audioPlan: () => ({
      fadeOut: 0.35,
      music: { style: "calm", bpm: 96, start: 0.2, groove: 3.75, end: DURATION - 0.7, outro: 2.5, quiet: MARKS.quiet, accents: MARKS.accents, finalAt: MARKS.finalAt }
    }),
    build
  });

  /* ======================================================================== */
  function build(api) {
    const { tl, sfx, $, $$, rectOf, derived } = api;
    const cam = $("#cam");
    const screen = $("#screen");
    const INSET = 14;

    /* ---------------- construção da UI dinâmica ---------------- */
    // pontos do fundo
    const dots = $("#dots");
    for (let y = 60; y < H; y += 72) for (let x = 36; x < W; x += 72) {
      const d = document.createElement("i");
      d.style.left = x + "px";
      d.style.top = y + "px";
      dots.appendChild(d);
    }

    // chips do filtro
    const chipsEl = $("#chips");
    const chip = {};
    CATS.forEach((c) => {
      const el = document.createElement("span");
      el.className = "chip" + (c.key === "all" ? " on" : "");
      el.innerHTML = (c.key === "all" ? "" : ICON[c.key]) + c.label;
      chipsEl.appendChild(el);
      chip[c.key] = el;
    });

    // contadores do cabeçalho de insumos
    const cntWrap = $("#sh-insumos .sh-cnt");
    cntWrap.innerHTML = "";
    const cnt = {};
    CATS.filter((c) => c.count).forEach((c) => {
      const s = document.createElement("span");
      s.textContent = c.count;
      cntWrap.appendChild(s);
      cnt[c.key] = s;
    });

    // linhas de insumos (todas existem; cada filtro decide quais aparecem e onde)
    const rowsEl = $("#ins-rows");
    const ROW_H = 50;
    const rows = ITEMS.map((it) => {
      const r = document.createElement("div");
      r.className = "row";
      const cat = CATS.find((c) => c.key === it.cat);
      r.innerHTML = `<span class="radio"><span class="on"><svg viewBox="0 0 12 12"><path d="M2.5 6.2 5 8.6l4.6-5"/></svg></span></span><span class="row-t"><b>${it.name}</b><span>${it.qty}<i class="tag">${ICON[it.cat]}${cat.label}</i></span></span>`;
      rowsEl.appendChild(r);
      return r;
    });
    // etiqueta do tipo em cada linha (aparece quando um filtro é usado)
    const rowTags = $$(".tag", rowsEl);

    // itens escolhidos (passo 2 preenchido)
    const picked = $("#picked");
    PICK.forEach((id, i) => {
      const r = document.createElement("div");
      r.className = "pk-row";
      r.innerHTML = `<span class="pk-dot"></span><span class="pk-name">${ITEMS[id].name}</span><span class="pk-qty"><i>−</i><span class="q">${PICK_QTY[i]}</span><i>+</i></span>`;
      picked.appendChild(r);
    });

    // telas de quantidade (uma por insumo escolhido, no mesmo modal) + teclado numérico
    const qpWrap = $("#qpages");
    const qps = PICK.map((id, i) => {
      const it = ITEMS[id];
      const cat = CATS.find((c) => c.key === it.cat);
      const [num, unit] = PICK_QTY[i].split(" ");
      const p = document.createElement("div");
      p.className = "qp";
      p.innerHTML = `<div class="sh-head"><svg class="back" viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg><div class="sh-tt"><b>${it.name}</b><span><i class="tag">${ICON[it.cat]}${cat.label}</i></span></div></div>` +
        `<div class="qp-body"><div class="qp-lbl">Quantidade</div><div class="qp-field"><i class="ring"></i><span class="qp-val"><span class="ph">0</span>${num.split("").map((d) => `<b class="d">${d}</b>`).join("")}<i class="qp-caret"></i></span><em>${unit}</em></div>` +
        `<div class="qp-hint">Em estoque: ${it.qty}</div><div class="qp-add">Adicionar</div></div>`;
      qpWrap.appendChild(p);
      return p;
    });
    const kpad = $("#kpad");
    const keyEl = {};
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "⌫"].forEach((k) => {
      const e = document.createElement("div");
      e.className = "k" + (k === "," || k === "⌫" ? " fn" : "");
      e.textContent = k;
      kpad.appendChild(e);
      keyEl[k] = e;
    });
    const qpills = PICK.map((id, i) => {
      const q = document.createElement("span");
      q.className = "qpill";
      q.textContent = PICK_QTY[i];
      rows[id].appendChild(q);
      rows[id].style.paddingRight = "84px";
      return q;
    });

    // árvore da EAP: três níveis + cabeçalhos
    const eapSheet = $("#sh-eap");
    const head0 = $("#eap-head0");
    const mkHead = (title, crumb) => {
      const h = document.createElement("div");
      h.className = "sh-head";
      h.innerHTML = `<svg class="back" viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg><div class="sh-tt"><b>${title}</b><span class="bc">${crumb}</span></div><div class="concluir">Concluir</div>`;
      eapSheet.appendChild(h);
      return h;
    };
    [head0].forEach((h) => (h.style.position = "absolute"));
    const head1 = mkHead("CUSTOS DIRETOS - TORRE", "EAP › CUSTOS DIRETOS - TORRE");
    const head2 = mkHead("VEDAÇÕES", "CUSTOS DIRETOS - TORRE › VEDAÇÕES");
    head1.classList.add("sm"); // título longo: cabe inteiro, sem reticências
    [head0, head1, head2].forEach((h) => Object.assign(h.style, { position: "absolute", left: "0", right: "0", top: "12px" }));
    const FOLDER = '<svg class="fold" viewBox="0 0 24 24"><path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8z"/></svg>';
    const CHEV = '<svg class="chev" viewBox="0 0 24 24"><path d="M8.6 16.6 13.2 12 8.6 7.4 10 6l6 6-6 6z"/></svg>';
    const CHECKC = '<svg class="ckc" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.2" fill="none" stroke="#3364e0" stroke-width="2"/><path d="M7.8 12.3 10.8 15.2 16.4 9.2" fill="none" stroke="#3364e0" stroke-width="2.2"/></svg>';
    const fillEap = (el, data, leaf) => data.map((d) => {
      const r = document.createElement("div");
      r.className = "eap-row";
      r.innerHTML = (leaf ? CHECKC : FOLDER) + `<span class="t"><b>${d[0]}</b><span>${d[1]}</span></span>` + (leaf ? "" : CHEV);
      el.appendChild(r);
      return r;
    });
    const eap1 = fillEap($("#eap-rows1"), EAP1);
    const eap2 = fillEap($("#eap-rows2"), EAP2);
    const eap3 = fillEap($("#eap-rows3"), EAP3, true);

    /* ---------------- medições (coordenadas da tela do app) ---------------- */
    // Com a câmera neutra, o canto da tela fica em (INSET, INSET) do palco.
    gsap.set(cam, { x: 0, y: 0, scale: 1 });
    const R = (el) => {
      const r = rectOf(el);
      return { x: r.x - INSET, y: r.y - INSET, w: r.w, h: r.h };
    };
    const insSheet = $("#sh-insumos");
    gsap.set([insSheet, eapSheet], { yPercent: 0 });
    gsap.set("#eap-l2, #eap-l3", { xPercent: 0 });
    const M = {
      who: R($("#who")),
      sec1: R($("#sec1")),
      sec2: R($("#sec2")),
      tileIns: R($("#tile-ins")),
      sec3: R($("#sec3")),
      opc: R($("#opc")),
      tileSvc: R($("#tile-svc")),
      bbar: R($("#bbar")),
      lote: R($("#lote")),
      send: R($("#send")),
      chips: R(chipsEl),
      chip: {},
      insOk: R($("#ins-ok")),
      list: R($("#ins-list")),
      eapRow1: R(eap1[3]),
      eapRow2: R(eap2[3]),
      eapRow3: R(eap3[0]),
      eapOk: null
    };
    CATS.forEach((c) => (M.chip[c.key] = R(chip[c.key])));
    M.qp = qps.map((p) => ({ field: R($(".qp-field", p)), add: R($(".qp-add", p)) }));
    M.key = {};
    Object.keys(keyEl).forEach((k) => (M.key[k] = R(keyEl[k])));
    // posição do cursor depois de n dígitos (os dígitos ocupam espaço mesmo invisíveis)
    const caretX = qps.map((p) => [0].concat($$(".qp-val .d", p).map((d) => d.offsetLeft + d.offsetWidth + 1)));
    gsap.set(qps, { xPercent: 100 });
    gsap.set(kpad, { yPercent: 110 });
    gsap.set(head2, { opacity: 1 });
    M.eapOk = R($(".concluir", head2));
    gsap.set([insSheet, eapSheet], { yPercent: 102, visibility: "visible" });

    // altura e posição do passo 2 preenchido (para rolar o formulário depois)
    picked.style.display = "block";
    const pickedH = picked.offsetHeight;
    const sec3Filled = R($("#sec3"));
    const tileSvcFilled = R($("#tile-svc"));
    const pickedRect = R(picked);
    picked.style.display = "";

    /* ---------------- câmera ---------------- */
    const PHONE = { w: 388, h: 808 };
    const CAP_BOTTOM = 488; // painel de legendas cobre o topo
    const shotFor = (rect, box, maxS, free) => {
      const s = Math.min(box.w / rect.w, box.h / rect.h, maxS || 3);
      const cx = INSET + rect.x + rect.w / 2;
      const cy = INSET + rect.y + rect.h / 2;
      let x = box.x + box.w / 2 - cx * s;
      let y = box.y + box.h / 2 - cy * s;
      if (!free) {
        // o celular sempre preenche a janela: nunca sobra fundo vazio embaixo/dos lados
        const pw = PHONE.w * s;
        const ph = PHONE.h * s;
        if (ph >= H - CAP_BOTTOM + 40) y = Math.min(CAP_BOTTOM - 20, Math.max(H + 30 - ph, y));
        x = pw >= W ? Math.min(0, Math.max(W - pw, x)) : Math.min(W - pw, Math.max(0, x));
      }
      return { x, y, scale: s };
    };
    const ZBOX = { x: 40, y: 540, w: 1000, h: 1300 };
    const OVER = shotFor({ x: -INSET, y: -INSET, w: PHONE.w, h: PHONE.h }, { x: 140, y: 500, w: 800, h: 1385 }, 3, true);
    const camTo = (shot, t, d, ease) => tl.to(cam, { x: shot.x, y: shot.y, scale: shot.scale, duration: d || 1.1, ease: ease || "power2.inOut" }, t);
    // foco numa região da tela, preservando a largura útil do app
    const focusOn = (rect, pad, maxS, box) => shotFor({ x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 }, box || ZBOX, maxS || 2.6);

    /* ---------------- helpers: foco, toque, balão, legendas ---------------- */
    const spot = $("#spot");
    let spotOn = false;
    const spotTo = (r, t, o) => {
      o = o || {};
      const p = o.pad == null ? 6 : o.pad;
      const geo = { left: r.x - p, top: r.y - p, width: r.w + p * 2, height: r.h + p * 2, borderRadius: o.radius || 14 };
      if (spotOn) {
        // de um alvo visível para outro: desliza
        tl.to(spot, Object.assign({ opacity: 1, duration: o.d || 0.7, ease: "power2.inOut" }, geo), t);
      } else {
        // estava apagado: nasce já no alvo (não "voa" por cima de outra coisa)
        tl.set(spot, geo, t);
        tl.to(spot, { opacity: 1, duration: 0.35, ease: "power2.out" }, t);
      }
      spotOn = true;
    };
    const spotOff = (t, d) => {
      tl.to(spot, { opacity: 0, duration: d || 0.5, ease: "power2.inOut" }, t);
      spotOn = false;
    };

    const tapEl = $("#tap");
    const ring = $(".ring", tapEl);
    const core = $(".core", tapEl);
    let lastTap = null;
    const tapAt = (x, y, t, o) => {
      o = o || {};
      // sobre botões e rótulos o núcleo fica mais claro (o texto continua legível)
      const coreBg = o.light ? "rgba(17, 18, 20, 0.1)" : "rgba(17, 18, 20, 0.28)";
      if (o.move && lastTap) {
        tl.to(tapEl, { left: x, top: y, duration: o.moveD || 0.45, ease: "power2.inOut" }, t - (o.moveD || 0.45) - 0.05);
        tl.to(core, { backgroundColor: coreBg, duration: 0.2 }, t - 0.25);
      } else {
        const lead = o.label ? 0.8 : 0.35; // com balão "Toque aqui", o dedo aparece antes
        tl.set(tapEl, { left: x, top: y }, t - lead);
        tl.set(core, { backgroundColor: coreBg }, t - lead);
        tl.fromTo(tapEl, { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, t - lead);
      }
      let lb = null;
      tl.to(core, { scale: 0.8, duration: 0.09, ease: "power2.in" }, t - 0.04);
      tl.to(core, { scale: 1, duration: 0.25, ease: "power2.out" }, t + 0.06);
      tl.fromTo(ring, { scale: 0.4, opacity: 0.95 }, { scale: 1.9, opacity: 0, duration: 0.6, ease: "power2.out", immediateRender: false }, t);
      if (o.label) {
        lb = document.createElement("div");
        lb.className = "tap-label";
        lb.textContent = o.label;
        $("#callouts").appendChild(lb);
        const flip = x + 14 + lb.offsetWidth > 352; // perto da borda direita: balão à esquerda do dedo
        if (flip) lb.classList.add("flip");
        gsap.set(lb, { left: flip ? x - 14 - lb.offsetWidth : x + 14, top: o.below ? y + 26 : y - 54 });
        if (o.below) lb.classList.add("below");
        tl.fromTo(lb, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", immediateRender: false }, t - 0.75);
        if (o.cut == null) tl.to(lb, { opacity: 0, duration: 0.3, ease: "power2.in" }, t + 0.25);
      }
      if (o.cut != null) {
        // a tela vai mudar (folha subindo/descendo): dedo e balão saem antes, não apontam para o lugar errado
        tl.to(lb ? [tapEl, lb] : tapEl, { opacity: 0, duration: 0.12, ease: "power1.in" }, o.cut - 0.12);
      } else if (!o.stay) tl.to(tapEl, { opacity: 0, duration: 0.35, ease: "power2.in" }, t + (o.hold || 0.35));
      lastTap = o.stay ? { x, y } : null;
      sfx("click", t, { v: o.v || 0.55 });
    };

    const calloutsEl = $("#callouts");
    const callout = (html, x, y, t, dur, cls) => {
      const c = document.createElement("div");
      c.className = "callout" + (cls ? " " + cls : "");
      c.innerHTML = html;
      calloutsEl.appendChild(c);
      gsap.set(c, { left: x, top: y });
      tl.fromTo(c, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", immediateRender: false }, t);
      tl.to(c, { opacity: 0, y: -6, duration: 0.35, ease: "power2.in" }, t + dur);
      return c;
    };

    const capsEl = $("#caps");
    const caption = (o) => {
      const b = document.createElement("div");
      b.className = "cap-block";
      const lines = o.title.split("|").map((l) => `<span class="line-mask"><span>${l}</span></span>`).join("");
      b.innerHTML = (o.kicker ? `<div class="cap-kicker ${o.kcls || ""}">${o.kicker}</div>` : "") + `<div class="cap-title">${lines}</div>` + (o.sub ? `<div class="cap-sub">${o.sub}</div>` : "");
      capsEl.appendChild(b);
      const c = { el: b, lines: $$(".line-mask > span", b), kick: $(".cap-kicker", b), sub: $(".cap-sub", b) };
      // estado escondido desde já: nada pisca entre o "visible" e o início das entradas
      gsap.set(b, { visibility: "hidden" });
      gsap.set(c.lines, { yPercent: 108 });
      if (c.kick) gsap.set(c.kick, { opacity: 0, y: 14 });
      if (c.sub) gsap.set(c.sub, { opacity: 0, y: 12 });
      return c;
    };
    const capIn = (c, t) => {
      tl.set(c.el, { visibility: "visible" }, t);
      if (c.kick) tl.fromTo(c.kick, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", immediateRender: false }, t);
      tl.fromTo(c.lines, { yPercent: 108 }, { yPercent: 0, duration: 0.75, ease: "power3.out", stagger: 0.09, immediateRender: false }, t + 0.08);
      if (c.sub) tl.fromTo(c.sub, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", immediateRender: false }, t + 0.3);
    };
    const capOut = (c, t) => {
      tl.to(c.lines, { yPercent: -108, duration: 0.5, ease: "power2.in", stagger: 0.05 }, t);
      if (c.kick) tl.to(c.kick, { opacity: 0, y: -10, duration: 0.4, ease: "power2.in" }, t);
      if (c.sub) tl.to(c.sub, { opacity: 0, y: -8, duration: 0.4, ease: "power2.in" }, t);
      tl.set(c.el, { visibility: "hidden" }, t + 0.6);
    };
    const capSwap = (a, b, t) => { capOut(a, t); capIn(b, t + 0.5); };

    // indicador de passos
    const stp = $$(".stp");
    const stpLines = $$(".stp-line i");
    const stepOn = (i, t) => {
      tl.to($("b", stp[i]), { backgroundColor: "#3364e0", color: "#ffffff", duration: 0.4 }, t);
      tl.to(stp[i], { color: "#0b0b0c", duration: 0.4 }, t);
    };
    const stepDone = (i, t) => {
      tl.to($("b", stp[i]), { backgroundColor: "#30d158", color: "#ffffff", duration: 0.4 }, t);
      tl.to(stp[i], { color: "#4a4f57", duration: 0.4 }, t);
      if (stpLines[i]) tl.to(stpLines[i], { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, t + 0.1);
    };
    const stepOpt = (i, t) => {
      tl.to($("b", stp[i]), { backgroundColor: "#e4e6eb", color: "#5b616b", duration: 0.4 }, t);
      tl.to(stp[i], { color: "#4a4f57", duration: 0.4 }, t);
      if (stpLines[i]) tl.to(stpLines[i], { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, t + 0.1);
    };

    // filtro: posiciona as linhas de um estado (lista de ids) com FLIP
    const MAX_ROWS = Math.ceil(M.list.h / ROW_H) + 1;
    let shown = new Map(); // id -> índice visível
    const layoutRows = (ids, t, first, max) => {
      const next = new Map();
      ids.slice(0, max || MAX_ROWS).forEach((id, i) => next.set(id, i));
      rows.forEach((r, id) => {
        const was = shown.has(id);
        const will = next.has(id);
        const y = will ? next.get(id) * ROW_H : 0;
        if (first) {
          gsap.set(r, { y, opacity: will ? 1 : 0 });
          return;
        }
        if (was && will) {
          tl.to(r, { y, duration: 0.7, ease: "power3.inOut" }, t + 0.05);
        } else if (was && !will) {
          tl.to(r, { opacity: 0, x: -18, duration: 0.35, ease: "power2.in" }, t);
          tl.set(r, { x: 0 }, t + 0.36);
        } else if (!was && will) {
          tl.set(r, { y: y + 26, x: 0 }, t + 0.3);
          tl.to(r, { y, opacity: 1, duration: 0.55, ease: "power3.out" }, t + 0.32 + Math.min(next.get(id), 9) * 0.035);
        }
      });
      shown = next;
    };
    const chipSelect = (from, to, t) => {
      tl.to(chip[from], { backgroundColor: "#f2f3f5", color: "#333333", duration: 0.3 }, t);
      tl.to(chip[to], { backgroundColor: "#3364e0", color: "#ffffff", duration: 0.3 }, t);
      if (cnt[from] && cnt[to]) {
        tl.to(cnt[from], { yPercent: -100, opacity: 0, duration: 0.4, ease: "power2.inOut" }, t + 0.05);
        tl.fromTo(cnt[to], { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: "power2.inOut", immediateRender: false }, t + 0.1);
      }
      sfx("tick", t + 0.05, { f: 2600, v: 1.4 });
    };
    // toque no ícone do chip (o dedo não cobre o nome do filtro)
    const chipTap = (k, scroll) => ({ x: M.chip[k].x - (scroll || 0) + 12, y: M.chip[k].y + M.chip[k].h / 2 });

    /* ---------------- estados iniciais ---------------- */
    gsap.set(cam, { x: OVER.x, y: OVER.y + 1500, scale: OVER.scale });
    gsap.set("#cap", { opacity: 0, y: -40 });
    tl.to("#cap", { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, T.s1 - 0.8);
    gsap.set(stpLines, { scaleX: 0 });
    gsap.set(spot, { left: M.who.x, top: M.who.y, width: M.who.w, height: M.who.h, opacity: 0 });
    gsap.set(tapEl, { opacity: 0 });
    gsap.set("#cnt1", { yPercent: 100 });
    gsap.set("#cart-n", { scale: 0 });
    gsap.set(Object.values(cnt).slice(1), { yPercent: 100, opacity: 0 });
    gsap.set([head1, head2], { opacity: 0, x: 24 });
    gsap.set("#eap-l2, #eap-l3", { xPercent: 100 });
    gsap.set($$(".ck", screen), { opacity: 0 });
    gsap.set(rowTags, { opacity: 0 });
    layoutRows(FIRST_PAGE_ALL, 0, true);

    /* ====================================================================
       0 — ABERTURA
       ==================================================================== */
    gsap.set("#dots", { opacity: 0.55 });
    gsap.set(cam, { y: OVER.y + 470 });
    tl.to(cam, { y: OVER.y + 380, duration: T.s1 - 1.3, ease: "sine.inOut" }, 0);
    tl.to("#intro", { y: -14, duration: T.s1 - 1.3, ease: "sine.inOut" }, 0);
    sfx("whoosh", 0.15, { dur: 1.2, f0: 220, f1: 1100, v: 0.22, pan0: -0.2, pan1: 0.2, peak: 0.6 });
    // o título sobe e o celular entra por inteiro
    tl.to("#intro", { y: -520, opacity: 0, duration: 1.0, ease: "power2.inOut" }, T.s1 - 1.25);
    camTo(OVER, T.s1 - 1.2, 1.25, "power3.out");
    tl.to("#dots", { opacity: 0.4, duration: 1.0 }, T.s1 - 1.1);
    tl.to("#steps", { opacity: 1, duration: 0.6 }, T.s1 - 0.5);
    sfx("whoosh", T.s1 - 1.2, { dur: 1.1, f0: 180, f1: 900, v: 0.35, pan0: 0, pan1: 0, peak: 0.55 });

    /* ====================================================================
       1 — QUEM RETIRA
       ==================================================================== */
    const S1 = T.s1;
    const c1 = caption({ kicker: "Passo 1", title: "Confira <em>quem retira</em>", sub: "Já vem preenchido. Só troque se precisar." });
    capIn(c1, S1);
    stepOn(0, S1);
    camTo(focusOn(M.sec1, 10, 2.6), S1 + 0.3, 1.1);
    spotTo(M.who, S1 + 1.0, { pad: 5, radius: 12 });
    // sem toque: conferir não exige ação
    tl.to("#b1 .ck", { opacity: 1, duration: 0.3 }, S1 + 2.7);
    tl.to("#b1", { scale: 1.25, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }, S1 + 2.7);
    sfx("blip", S1 + 2.72, { f: 1500, len: 0.05, v: 2.0, pan: 0 });
    stepDone(0, S1 + 2.9);
    spotOff(S1 + 3.6);

    /* ====================================================================
       2 — INSUMOS + NOVO FILTRO POR TIPO DE SERVIÇO
       ==================================================================== */
    const S2 = T.s2;
    const c2 = caption({ kicker: "Passo 2", title: "Escolha os <em>insumos</em>", sub: "Toque em <b>Escolher insumos</b>." });
    capSwap(c1, c2, S2);
    stepOn(1, S2 + 0.3);
    camTo(focusOn(M.sec2, 10, 2.6), S2 + 0.3, 1.1);
    spotTo(M.tileIns, S2 + 0.8, { pad: 4, radius: 14 });
    tapAt(M.tileIns.x + 40, M.tileIns.y + M.tileIns.h / 2, S2 + 1.75, { label: "Toque aqui", cut: S2 + 1.95 });
    spotOff(S2 + 1.9, 0.3);
    // a folha de insumos sobe; a câmera enquadra a parte de cima da tela
    tl.to(insSheet, { yPercent: 0, duration: 0.8, ease: "power3.out" }, S2 + 1.95);
    sfx("whoosh", S2 + 1.95, { dur: 0.7, f0: 300, f1: 1400, v: 0.3, pan0: 0, pan1: 0, peak: 0.5 });
    const sheetTop = { x: 0, y: 34, w: 360, h: 470 };
    camTo(focusOn(sheetTop, 0, 2.6), S2 + 2.05, 1.1);

    // NOVO: filtro por tipo de serviço — a fileira de chips fica em foco ~1 s antes do toque
    const c3 = caption({ kicker: "Novo", kcls: "new", title: "Filtre por|<em>tipo de serviço</em>", sub: "<span class=\"s0\"><b>Hidráulica?</b> Só material de hidráulica.</span><span class=\"s1\"><b>Elétrica, Alvenaria…</b> e assim por diante.</span>" });
    capSwap(c2, c3, S2 + 2.5);
    spotTo(M.chips, T.th - 1.1, { pad: 2, radius: 16 });
    const TH = T.th;
    const hTap = chipTap("hid");
    tapAt(hTap.x, hTap.y, TH, { hold: 0.4, label: "Toque aqui", light: true });
    chipSelect("all", "hid", TH + 0.05);
    spotOff(TH + 0.3, 0.4);
    const hidIds = byCat("hid");
    layoutRows(hidIds, TH + 0.15, false, hidIds.length);
    // cada linha ganha a etiqueta do tipo e a lista rola até tubos, registros, tês…
    tl.to(rowTags, { opacity: 1, duration: 0.4, ease: "power2.out" }, TH + 0.6);
    // linhas inteiras: a câmera mostra ~7 linhas; rola até TUBO ficar no quadro
    const hidScroll = Math.max(0, hidIds.length - 7) * ROW_H;
    tl.to("#ins-rows", { y: -hidScroll, duration: 0.9, ease: "power2.inOut" }, TH + 1.2);

    // e assim por diante: Elétrica, Alvenaria… (a fileira rola até o último tipo)
    const TE = T.te;
    const s0 = $(".s0", c3.el);
    const s1 = $(".s1", c3.el);
    gsap.set(s1, { opacity: 0 });
    tl.to(s0, { opacity: 0, y: -8, duration: 0.3, ease: "power2.in" }, TE - 0.6);
    tl.fromTo(s1, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", immediateRender: false }, TE - 0.3);
    const eTap = chipTap("ele");
    tapAt(eTap.x, eTap.y, TE, { hold: 0.35, light: true });
    chipSelect("hid", "ele", TE + 0.05);
    tl.to("#ins-rows", { y: 0, duration: 0.5, ease: "power2.inOut" }, TE + 0.1);
    layoutRows(byCat("ele"), TE + 0.15);
    const chipScroll = Math.max(0, M.chip.aca.x + M.chip.aca.w - (M.chips.x + M.chips.w - 10));
    tl.to(chipsEl.children, { x: -chipScroll, duration: 0.7, ease: "power2.inOut" }, TE + 0.7);
    const TA = T.ta;
    const aTap = chipTap("alv", chipScroll);
    tapAt(aTap.x, aTap.y, TA, { hold: 0.35, light: true });
    chipSelect("ele", "alv", TA + 0.05);
    layoutRows(byCat("alv"), TA + 0.15);

    /* ---- escolher cada insumo: toque → tela de quantidade (mesmo modal) → Adicionar → volta à lista ---- */
    const c5 = caption({ kicker: "Passo 2", title: "Toque no|<em>insumo</em>", sub: "Abre a tela da quantidade." });
    capSwap(c3, c5, T.ts);
    const alvIds = byCat("alv");
    const LIST_SCROLL = 150;
    const rowY = (id, sc) => M.list.y + alvIds.indexOf(id) * ROW_H + ROW_H / 2 - (sc || 0);
    const p1 = $("#ins-p1");
    const PUSH = 0.45;
    // tela da quantidade entra pela direita; a lista recua (navegação dentro do modal)
    const pushIn = (i, t) => {
      tl.to(p1, { xPercent: -30, duration: PUSH, ease: "power3.inOut" }, t);
      tl.to(qps[i], { xPercent: 0, duration: PUSH, ease: "power3.inOut" }, t);
      sfx("whoosh", t, { dur: 0.4, f0: 900, f1: 2200, v: 0.16, pan0: 0.4, pan1: -0.2, peak: 0.5 });
    };
    const popOut = (i, t) => {
      tl.to(qps[i], { xPercent: 100, duration: PUSH, ease: "power3.inOut" }, t);
      tl.to(p1, { xPercent: 0, duration: PUSH, ease: "power3.inOut" }, t);
      tl.to(kpad, { yPercent: 110, duration: 0.35, ease: "power2.in" }, t);
      sfx("whoosh", t, { dur: 0.4, f0: 2000, f1: 700, v: 0.14, pan0: -0.3, pan1: 0.3, peak: 0.4 });
    };
    // digitação: tecla acende, dígito aparece, cursor anda
    const typeQty = (i, t0, gap, moveD) => {
      const q = qps[i];
      const ds = $$(".qp-val .d", q);
      const caret = $(".qp-caret", q);
      const keys = PICK_QTY[i].split(" ")[0].split("");
      keys.forEach((k, j) => {
        const t = t0 + j * gap;
        const kr = M.key[k];
        tapAt(kr.x + kr.w / 2, kr.y + kr.h / 2, t, { move: j > 0, stay: true, moveD, light: true, v: 0.4 });
        tl.to(keyEl[k], { backgroundColor: "#b9bcc4", duration: 0.05 }, t - 0.02);
        tl.to(keyEl[k], { backgroundColor: "#ffffff", duration: 0.18 }, t + 0.08);
        tl.fromTo(ds[j], { opacity: 0, y: 6, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "back.out(2)", immediateRender: false }, t);
        tl.set(caret, { x: caretX[i][j + 1] }, t);
      });
      return t0 + (keys.length - 1) * gap;
    };
    // campo em foco: borda azul + cursor piscando (piscar desenhado na timeline)
    const focusField = (i, t, until) => {
      const q = qps[i];
      tl.to($(".qp-field .ring", q), { opacity: 1, duration: 0.15 }, t);
      tl.to($(".ph", q), { opacity: 0, duration: 0.12 }, t);
      const caret = $(".qp-caret", q);
      for (let tb = t; tb < until; tb += 0.5) tl.set(caret, { opacity: tb + 0.25 < until && Math.round((tb - t) / 0.5) % 2 === 1 ? 0 : 1 }, tb);
      tl.set(caret, { opacity: 0 }, until);
    };
    // enquadramentos: lista (topo do modal) e quantidade + teclado
    const LIST_SHOT = focusOn(sheetTop, 0, 2.6);
    const QTY_SHOT = focusOn({ x: 0, y: 40, w: 360, h: 740 }, 0, 2.6); // nome do item + campo + teclado
    const pickItem = (i, T0, full) => {
      const id = PICK[i];
      const sc = i === 2 ? LIST_SCROLL : 0;
      tapAt(150, rowY(id, sc), T0, { hold: 0.15, cut: T0 + 0.15 });
      tl.to(rows[id], { backgroundColor: "#f5f8ff", duration: 0.2 }, T0 + 0.02);
      pushIn(i, T0 + 0.15);
      const add = M.qp[i].add;
      let tAdd;
      if (full) {
        // 1º item completo: toca no campo, teclado sobe, digita
        const f = M.qp[i].field;
        tapAt(f.x + 60, f.y + f.h / 2, T0 + 0.95, { light: true, cut: T0 + 1.2 });
        tl.to(kpad, { yPercent: 0, duration: 0.35, ease: "power3.out" }, T0 + 1.0);
        // a câmera desce junto com o teclado: campo + teclas no quadro
        camTo(QTY_SHOT, T0 + 0.95, 0.7, "power2.inOut");
        const tLast = typeQty(i, T0 + 1.55, 0.24, 0.14);
        tAdd = tLast + 0.6;
        focusField(i, T0 + 1.0, tAdd);
      } else {
        // próximos itens: campo já em foco e teclado aberto — mais rápido
        tl.to(kpad, { yPercent: 0, duration: 0.3, ease: "power3.out" }, T0 + 0.3);
        const tLast = typeQty(i, T0 + 0.75, 0.16, 0.1);
        tAdd = tLast + 0.45;
        focusField(i, T0 + 0.3, tAdd);
      }
      tapAt(add.x + add.w * 0.72, add.y + add.h / 2, tAdd, { move: true, moveD: 0.3, light: true, cut: tAdd + 0.15 });
      tl.to($(".qp-add", qps[i]), { scale: 0.96, duration: 0.07, ease: "power2.in" }, tAdd - 0.03);
      tl.to($(".qp-add", qps[i]), { scale: 1, duration: 0.25, ease: "back.out(2)" }, tAdd + 0.05);
      popOut(i, tAdd + 0.15);
      // de volta à lista: item marcado com a quantidade
      const tBack = tAdd + 0.5;
      tl.to($(".radio .on", rows[id]), { scale: 1, duration: 0.3, ease: "back.out(1.8)" }, tBack);
      tl.fromTo(qpills[i], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)", immediateRender: false }, tBack + 0.05);
      sfx("blip", tBack + 0.05, { f: 1300 + i * 220, len: 0.05, v: 1.6 });
      return tBack + 0.35;
    };
    const end0 = pickItem(0, T.p0, true);
    // a quantidade entra junto com a tela nova
    const c6 = caption({ kicker: "Passo 2", title: "Digite a|<em>quantidade</em>", sub: "E toque em <b>Adicionar</b>." });
    capSwap(c5, c6, T.p0 + 0.25);
    tl.to("#ins-ok", { backgroundColor: "#3364e0", color: "#ffffff", duration: 0.3 }, end0 - 0.2);
    const c7 = caption({ kicker: "Passo 2", title: "Repita para|<em>os outros itens</em>", sub: "No fim, toque em <b>Concluir</b>." });
    capSwap(c6, c7, end0 - 0.45);
    pickItem(1, T.p1, false);
    tl.to("#ins-rows", { y: -LIST_SCROLL, duration: 0.4, ease: "power2.inOut" }, T.p2 - 0.5);
    pickItem(2, T.p2, false);
    // Concluir (a câmera volta ao topo do modal)
    const TC = T.tc;
    camTo(LIST_SHOT, TC - 0.95, 0.6, "power2.inOut");
    tapAt(M.insOk.x + M.insOk.w / 2, M.insOk.y + M.insOk.h / 2, TC, { light: true, cut: TC + 0.2 });
    tl.to(insSheet, { yPercent: 102, duration: 0.75, ease: "power3.inOut" }, TC + 0.2);
    sfx("whoosh", TC + 0.2, { dur: 0.7, f0: 1200, f1: 300, v: 0.28, pan0: 0, pan1: 0, peak: 0.4 });

    // passo 2 preenchido + barra inferior "Completo"
    const c6b = caption({ kicker: "Passo 2", kcls: "ok", title: "Insumos|<em>no carrinho</em>", sub: "Cada um com a sua quantidade." });
    capSwap(c7, c6b, TC + 0.3);
    tl.set(picked, { display: "block", height: 0, marginTop: 0 }, TC + 0.7);
    tl.to(picked, { height: pickedH, marginTop: 10, duration: 0.7, ease: "power3.inOut" }, TC + 0.7);
    camTo(focusOn({ x: M.sec2.x, y: M.sec2.y, w: M.sec2.w, h: M.sec2.h + pickedH }, 8, 2.6), TC + 0.5, 1.1);
    tl.to("#b2 .ck", { opacity: 1, duration: 0.3 }, TC + 1.4);
    tl.to("#b2", { backgroundColor: "#30d158", color: "#ffffff", duration: 0.3 }, TC + 1.4);
    stepDone(1, TC + 1.5);
    // a barra inferior já fica completa: o passo 3 não trava o envio
    const TB = TC + 2.3;
    camTo(focusOn({ x: 0, y: M.bbar.y - 150, w: 360, h: M.bbar.h + 150 }, 0, 2.4), TB, 1.0);
    tl.to("#cnt0", { yPercent: -100, duration: 0.45, ease: "power2.inOut" }, TB + 0.4);
    tl.to("#cnt1", { yPercent: 0, duration: 0.45, ease: "power2.inOut" }, TB + 0.45);
    tl.to("#hint0", { opacity: 0, duration: 0.3 }, TB + 0.4);
    tl.to("#hint1", { opacity: 1, duration: 0.3 }, TB + 0.55);
    tl.to("#st0", { opacity: 0, duration: 0.3 }, TB + 0.4);
    tl.to("#st1", { opacity: 1, duration: 0.3 }, TB + 0.55);
    tl.to("#cart-n", { scale: 1, duration: 0.45, ease: "back.out(2)" }, TB + 0.5);
    tl.to("#lote", { backgroundColor: "#eaeffc", color: "#3364e0", duration: 0.4 }, TB + 0.6);
    tl.to("#send", { backgroundColor: "#3364e0", duration: 0.4 }, TB + 0.6);
    sfx("blip", TB + 0.5, { f: 1800, len: 0.05, v: 2.0, pan: 0 });
    // balão logo acima de Enviar (fora do cartão do serviço)
    callout("Já dá para <b>enviar</b>", M.send.x + M.send.w - 120, M.send.y - 40, TB + 0.55, 1.6, "blue");

    /* ====================================================================
       3 — SERVIÇO: NÃO É MAIS OBRIGATÓRIO. SEU LÍDER PODE APROPRIAR POR VOCÊ
       ==================================================================== */
    const t3 = T.s3;
    // rola o formulário para mostrar o passo 3
    const scrollY = Math.max(0, sec3Filled.y + sec3Filled.h + 20 - (M.bbar.y - 8));
    tl.to("#form", { y: -scrollY, duration: 0.9, ease: "power2.inOut" }, t3 - 0.2);
    const sec3 = { x: sec3Filled.x, y: sec3Filled.y - scrollY, w: sec3Filled.w, h: sec3Filled.h };
    const shift3 = sec3Filled.y - M.sec3.y;
    const opc = { x: M.opc.x, y: M.opc.y + shift3 - scrollY, w: M.opc.w, h: M.opc.h };
    const tileSvc = { x: tileSvcFilled.x, y: tileSvcFilled.y - scrollY, w: tileSvcFilled.w, h: tileSvcFilled.h };
    const SBOX = { x: 40, y: 520, w: 1000, h: 560 }; // passo 3 no alto; o cartão do líder fica embaixo
    camTo(focusOn(sec3, 10, 2.7, SBOX), t3 - 0.1, 1.2);

    // a mensagem principal entra direto e fica ~4 s: ênfase em "Não é mais"
    const c8 = caption({ kicker: "Passo 3 · Serviço", kcls: "ok", title: "<em class=\"ul\">Não é mais<i class=\"uline\"></i></em>|obrigatório", sub: "Dá para enviar sem escolher o serviço." });
    capSwap(c6b, c8, t3);
    stepOn(2, t3 + 0.2);
    tl.fromTo($(".uline", c8.el), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.inOut", immediateRender: false }, t3 + 1.1);
    spotTo(opc, t3 + 0.8, { pad: 4, radius: 12 });
    const tOpc = t3 + 1.3;
    tl.to("#opc", { backgroundColor: "#e3f8e9", color: "#138a3a", scale: 1.18, duration: 0.45, ease: "power2.out" }, tOpc);
    tl.to("#opc", { scale: 1, duration: 0.5, ease: "power2.inOut" }, tOpc + 0.5);
    sfx("blip", tOpc + 0.05, { f: 1600, len: 0.05, v: 2.0, pan: 0 });

    // cartão: antes/agora + você envia → seu líder pode apropriar depois
    const leader = $("#leader");
    gsap.set(leader, { left: 70, top: 560, width: 940 });
    const ldBa = $(".ld-ba", leader);
    const ldNew = $(".ld-new", leader);
    const ldArrow = $(".ld-arrow", leader);
    const ldNodes = $$(".ld-node", leader);
    const ldStrike = $(".ld-strike", leader);
    gsap.set(ldArrow, { scaleX: 0 });
    gsap.set([ldBa, ...ldNodes], { opacity: 0, y: 16 });
    gsap.set(ldNew, { opacity: 0, scale: 0.9 });
    gsap.set(ldStrike, { scaleX: 0 });
    const c9 = caption({ kicker: "Novo", kcls: "new", title: "Seu líder pode|<em>apropriar por você</em>", sub: "Ele pode indicar o serviço depois." });
    const tL = T.tl;
    capSwap(c8, c9, tL);
    tl.set(leader, { visibility: "visible" }, tL + 0.1);
    tl.fromTo(leader, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out", immediateRender: false }, tL + 0.1);
    tl.to(ldBa, { opacity: 1, y: 0, duration: 0.5 }, tL + 0.3);
    tl.to(ldStrike, { scaleX: 1, duration: 0.4, ease: "power2.inOut" }, tL + 0.6);
    tl.to(ldNew, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, tL + 0.85);
    tl.to(ldNodes[0], { opacity: 1, y: 0, duration: 0.5 }, tL + 1.2);
    tl.to(ldArrow, { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, tL + 1.45);
    tl.to(ldNodes[1], { opacity: 1, y: 0, duration: 0.5 }, tL + 1.95);
    sfx("whoosh", tL + 1.45, { dur: 0.8, f0: 400, f1: 1600, v: 0.25, pan0: -0.5, pan1: 0.5, peak: 0.6 });
    sfx("blip", tL + 0.87, { f: 1500, len: 0.05, v: 2.0, pan: 0 });
    const tOut = T.tout; // o cartão completo fica ~3 s legível
    tl.to(leader, { opacity: 0, y: -40, scale: 0.97, duration: 0.25, ease: "power2.in" }, tOut);
    tl.set(leader, { visibility: "hidden" }, tOut + 0.3);
    spotOff(tOut + 0.2);
    stepOpt(2, tOut + 0.2);
    tl.to("#opc", { backgroundColor: "#efeff0", color: "#828282", duration: 0.4 }, tOut + 0.2);

    // caminho opcional: escolher na árvore da EAP
    const E0 = T.e0;
    const c10 = caption({ kicker: "Opcional", kcls: "ok", title: "Sabe o serviço?|<em>Escolha na EAP</em>", sub: "Toque nas pastas até achar o serviço." });
    capSwap(c9, c10, E0);
    camTo(focusOn(tileSvc, 10, 2.6), E0 + 0.1, 1.0);
    tapAt(tileSvc.x + 40, tileSvc.y + tileSvc.h / 2, E0 + 1.25, { cut: E0 + 1.4 });
    tl.to("#scrim", { opacity: 0.45, duration: 0.5 }, E0 + 1.4);
    tl.to(eapSheet, { yPercent: 0, duration: 0.8, ease: "power3.out" }, E0 + 1.4);
    sfx("whoosh", E0 + 1.4, { dur: 0.7, f0: 300, f1: 1400, v: 0.28, pan0: 0, pan1: 0, peak: 0.5 });
    // câmera acompanha a folha da EAP (mesma curva, sem "vai e volta")
    camTo(focusOn({ x: 0, y: 56, w: 360, h: 470 }, 0, 2.6), E0 + 1.4, 0.8, "power3.out");
    // cabeçalhos trocam em sequência (sem sobreposição de textos)
    const headSwap = (a, b, t) => {
      tl.to(a, { opacity: 0, x: -24, duration: 0.25, ease: "power2.in" }, t);
      tl.to(b, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }, t + 0.27);
    };
    // nível 1 → TORRE
    tapAt(M.eapRow1.x + 40, M.eapRow1.y + M.eapRow1.h / 2, E0 + 2.7, { hold: 0.25 });
    tl.to(eap1[3], { backgroundColor: "#eaeffc", duration: 0.2 }, E0 + 2.7);
    tl.to("#eap-l1", { xPercent: -100, duration: 0.6, ease: "power3.inOut" }, E0 + 2.9);
    tl.to("#eap-l2", { xPercent: 0, duration: 0.6, ease: "power3.inOut" }, E0 + 2.9);
    headSwap(head0, head1, E0 + 2.9);
    // nível 2 → VEDAÇÕES
    tapAt(M.eapRow2.x + 40, M.eapRow2.y + M.eapRow2.h / 2, E0 + 3.85, { hold: 0.25 });
    tl.to(eap2[3], { backgroundColor: "#eaeffc", duration: 0.2 }, E0 + 3.85);
    tl.to("#eap-l2", { xPercent: -100, duration: 0.6, ease: "power3.inOut" }, E0 + 4.05);
    tl.to("#eap-l3", { xPercent: 0, duration: 0.6, ease: "power3.inOut" }, E0 + 4.05);
    headSwap(head1, head2, E0 + 4.05);
    // atividade → BLOCO CERÂMICO - TORRE; o dedo desliza até Concluir
    tapAt(M.eapRow3.x + 40, M.eapRow3.y + M.eapRow3.h / 2, E0 + 4.95, { stay: true });
    tl.to(eap3[0], { backgroundColor: "#eaeffc", duration: 0.25 }, E0 + 4.95);
    tl.to($(".concluir", head2), { backgroundColor: "#3364e0", color: "#ffffff", duration: 0.3 }, E0 + 5.1);
    tapAt(M.eapOk.x + M.eapOk.w / 2, M.eapOk.y + M.eapOk.h / 2, E0 + 5.6, { move: true, moveD: 0.4, light: true, cut: E0 + 5.8 });
    tl.to(eapSheet, { yPercent: 102, duration: 0.7, ease: "power3.inOut" }, E0 + 5.8);
    sfx("whoosh", E0 + 5.8, { dur: 0.7, f0: 1200, f1: 300, v: 0.28, pan0: 0, pan1: 0, peak: 0.4 });
    tl.to("#scrim", { opacity: 0, duration: 0.5 }, E0 + 5.9);
    const svcTxt = $("#svc-t").parentNode;
    const svcNew = document.createElement("div");
    svcNew.innerHTML = "<b>BLOCO CERÂMICO - TORRE</b><span>4004001 · Vedações</span>";
    svcTxt.after(svcNew);
    Object.assign(svcNew.style, { position: "absolute", left: svcTxt.offsetLeft + "px", top: svcTxt.offsetTop + "px" });
    gsap.set(svcNew, { opacity: 0 });
    tl.to(svcTxt, { opacity: 0, duration: 0.25 }, E0 + 6.1);
    tl.fromTo(svcNew, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, immediateRender: false }, E0 + 6.2);
    tl.to("#b3 .ck", { opacity: 1, duration: 0.3 }, E0 + 6.2);
    tl.to("#b3", { backgroundColor: "#30d158", color: "#ffffff", duration: 0.3 }, E0 + 6.2);
    stepDone(2, E0 + 6.2);
    camTo(focusOn(tileSvc, 30, 2.4), E0 + 5.8, 0.9);

    /* ====================================================================
       4 — ENVIAR
       ==================================================================== */
    const t4 = T.s4;
    const c11 = caption({ kicker: "Enviar", title: "Envie agora|<em>ou junte no lote</em>" });
    capSwap(c10, c11, t4);
    stepOn(3, t4 + 0.2);
    camTo(focusOn({ x: 150, y: M.bbar.y - 120, w: 210, h: M.bbar.h + 120 }, 0, 2.7), t4 + 0.1, 1.1);
    spotTo({ x: M.lote.x, y: M.lote.y, w: M.send.x + M.send.w - M.lote.x, h: M.lote.h }, t4 + 0.9, { pad: 5, radius: 12 });
    callout("<b>Ao lote:</b> junta com outras requisições<br><b>Enviar:</b> manda agora", M.send.x + M.send.w - 230, M.lote.y - 56, t4 + 0.9, 2.4);
    spotOff(t4 + 3.4, 0.3);
    const tSend = T.send;
    tapAt(M.send.x + M.send.w * 0.8, M.send.y + M.send.h / 2, tSend, { label: "Toque aqui", light: true });
    tl.to("#send", { scale: 0.94, duration: 0.08, ease: "power2.in" }, tSend - 0.03);
    tl.to("#send", { scale: 1, duration: 0.35, ease: "back.out(2)" }, tSend + 0.07);
    camTo(OVER, tSend + 0.25, 1.2);
    // o aviso de sucesso entra por cima do título do formulário (que some junto)
    tl.to(".f-title, .f-sub", { opacity: 0, duration: 0.3 }, tSend + 0.4);
    tl.fromTo("#toast", { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", immediateRender: false }, tSend + 0.45);
    stepDone(3, tSend + 0.55);
    const c12 = caption({ kicker: "Pronto", kcls: "ok", title: "Requisição|<em>enviada</em>" });
    capSwap(c11, c12, tSend + 0.35);
    sfx("blip", tSend + 0.5, { f: 1200, len: 0.06, v: 2.2, pan: 0 });
    sfx("blip", tSend + 0.63, { f: 1800, len: 0.08, v: 2.2, pan: 0 });

    /* ====================================================================
       5 — RESUMO (termina aqui, sem tela preta)
       ==================================================================== */
    const t5 = T.s5;
    const c13 = caption({ kicker: "Resumo", title: "Simples assim." });
    capSwap(c12, c13, t5);
    tl.to(cam, { y: "+=1500", duration: 1.1, ease: "power2.in" }, t5 + 0.1);
    const recap = $("#recap");
    const rcRows = $$(".rc-row", recap);
    gsap.set(rcRows, { opacity: 0, y: 40 });
    tl.set(recap, { visibility: "visible", opacity: 1 }, t5 + 0.6);
    tl.to(rcRows, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.32 }, t5 + 0.7);
    rcRows.forEach((r, i) => sfx("tick", t5 + 0.75 + i * 0.32, { f: 2200 + i * 250, v: 1.4 }));
    const tFoot = T.foot;
    gsap.set(".rc-foot", { opacity: 0, y: 20 });
    tl.to(".rc-foot", { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, tFoot);
    // o último quadro serve de lembrete
    tl.to(recap, { y: -10, duration: DURATION - (t5 + 2), ease: "sine.inOut" }, t5 + 2);

    // marcas para a trilha (acentos e acorde final nos momentos-chave)
    MARKS.accents = [TH + 0.05, tOpc + 0.05, tSend + 0.5];
    MARKS.quiet = [[t3 + 0.2, tOut]];
    MARKS.finalAt = tFoot;

    // depuração/leitura: nenhum valor derivado por frame neste vídeo
    void derived;
  }
})();
