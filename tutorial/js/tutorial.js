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
  // ROTEIRO na grade da trilha (108 BPM): cada marco cai numa batida, então toques,
  // legendas e transições "andam" junto com a música. Ajuste o ritmo aqui (em batidas).
  const BPM = 108;
  const BEAT = 60 / BPM;
  const K = (b) => b * BEAT;
  const T = {
    s1: K(6),       // passo 1 · quem retira (o celular pousa no 1º "drop")
    s2: K(13),      // passo 2 · insumos
    th: K(21),      // toque em Hidráulica (2º drop: o filtro novo)
    te: K(27),      // Elétrica
    ta: K(30),      // Alvenaria
    ts: K(32),      // "Toque no insumo e digite a quantidade"
    p0: K(34),      // 1º insumo (completo)
    p1: K(40.5),    // 2º insumo (rápido)
    p2: K(44.5),    // 3º insumo (rápido)
    tc: K(48.5),    // Concluir
    s3: K(55),      // passo 3 · "Não é mais obrigatório" (parada na trilha)
    tl: K(63),      // "Seu líder pode apropriar por você" (3º drop)
    tout: K(73),    // cartão sai
    e0: K(73),      // caminho opcional pela EAP
    s4: K(83),      // passo 4 · enviar
    send: K(91),    // toque em Enviar (4º drop)
    s5: K(95),      // resumo
    foot: K(98.5)   // "Dúvidas? Fale com o seu líder."
  };
  const DURATION = Math.round(K(105.5) * 100) / 100;

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
    { cue: T.ts + 0.5, text: "Toque no insumo, digite a quantidade e toque em Adicionar." },
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
    posterTime: T.th + 1.25,
    config: CFG,
    fonts: ['400 20px "Inter"', '500 20px "Inter"', '600 20px "Inter"', '700 20px "Inter"', '800 60px "Inter"'],
    audioPlan: () => ({
      fadeOut: 0.35,
      music: {
        style: "upbeat", bpm: BPM, grid: 0, end: DURATION, hp: 95, accents: MARKS.accents,
        sections: [
          { k: 0, lvl: "intro" },
          { k: 6, lvl: "lite", hit: "drop", chord: "C" },
          { k: 21, lvl: "full", hit: "drop", chord: "C" },
          { k: 55, lvl: "brk", hit: "stop", chord: "Am" },
          { k: 63, lvl: "full", hit: "drop", chord: "C" },
          { k: 73, lvl: "lite", chord: "F" },
          { k: 91, lvl: "full", hit: "drop", chord: "C" },
          { k: 95, lvl: "lite", chord: "C" },
          { k: 98.5, lvl: "fin", hit: "fin" }
        ]
      }
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
        `<div class="qp-hint">Em estoque: ${it.qty}</div><div class="qp-add"><span class="a0">Adicionar</span><span class="a1">✓ Adicionado</span></div></div>`;
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
    // linguagem de câmera mais ágil: reenquadrar 0,8 s power3; "seguir" a interface com expo.out
    let camNow = { x: OVER.x, y: OVER.y, scale: OVER.scale };
    const camTo = (shot, t, d, ease) => {
      tl.to(cam, { x: shot.x, y: shot.y, scale: shot.scale, duration: d || 0.8, ease: ease || "power3.inOut" }, t);
      camNow = shot;
    };
    const FOLLOW = "expo.out";
    // câmera viva: aproximação lenta durante as pausas (só aproxima, nunca afasta)
    const drift = (t, d, f, k) => {
      const s0 = camNow.scale;
      const P = { x: camNow.x + (INSET + f.x) * s0, y: camNow.y + (INSET + f.y) * s0 };
      const target = { scale: s0 * k, x: P.x - (P.x - camNow.x) * k, y: P.y - (P.y - camNow.y) * k };
      tl.to(cam, { x: target.x, y: target.y, scale: target.scale, duration: d, ease: "sine.inOut" }, t);
      camNow = target;
    };
    // foco numa região da tela, preservando a largura útil do app
    const focusOn = (rect, pad, maxS, box) => shotFor({ x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 }, box || ZBOX, maxS || 2.6);
    const phone = $("#phone");
    const org = (x, y) => `${x + INSET}px ${y + INSET}px`;
    // "soco" sutil no celular a partir do dedo, nos toques que confirmam algo
    const punch = (x, y, t, k) => {
      tl.fromTo(phone, { scale: 1, transformOrigin: org(x, y) }, { scale: k, transformOrigin: org(x, y), duration: 0.08, ease: "power2.out", immediateRender: false }, t);
      tl.to(phone, { scale: 1, duration: 0.34, ease: "power3.out" }, t + 0.08);
    };
    // virada de capítulo: câmera mergulha no próximo passo enquanto o celular "respira"
    const stinger = (shot, t, at, dir) => {
      camTo(shot, t, 0.8, "power4.inOut");
      tl.set(phone, { transformOrigin: org(at.x, at.y) }, t);
      tl.to(phone, { scale: 0.94, rotation: 0.6 * dir, duration: 0.36, ease: "sine.in" }, t);
      tl.to(phone, { scale: 1, rotation: 0, duration: 0.44, ease: "sine.out" }, t + 0.36);
      sfx("whoosh", t, { dur: 0.55, f0: 250, f1: 1600, v: 0.22, pan0: -0.3 * dir, pan1: 0.3 * dir, peak: 0.55 });
    };

    /* ---------------- helpers: foco, toque, balão, legendas ---------------- */
    const spot = $("#spot");
    let spotOn = false;
    const spotTo = (r, t, o) => {
      o = o || {};
      const p = o.pad == null ? 6 : o.pad;
      const geo = { left: r.x - p, top: r.y - p, width: r.w + p * 2, height: r.h + p * 2, borderRadius: o.radius || 14 };
      if (spotOn) {
        // de um alvo visível para outro: desliza
        tl.to(spot, Object.assign({ opacity: 1, duration: o.d || 0.5, ease: "power3.inOut" }, geo), t);
      } else {
        // estava apagado: nasce já no alvo (não "voa" por cima de outra coisa)
        tl.set(spot, geo, t);
        tl.to(spot, { opacity: 1, duration: 0.25, ease: "power2.out" }, t);
      }
      spotOn = true;
    };
    const spotOff = (t, d) => {
      tl.to(spot, { opacity: 0, duration: d || 0.4, ease: "power2.inOut" }, t);
      spotOn = false;
    };

    const tapEl = $("#tap");
    const core = $(".core", tapEl);
    const calloutsEl = $("#callouts");
    let lastTap = null;
    const tapAt = (x, y, t, o) => {
      o = o || {};
      // sobre botões e rótulos o núcleo fica mais claro (o texto continua legível)
      const coreBg = o.light ? "rgba(17, 18, 20, 0.1)" : "rgba(17, 18, 20, 0.28)";
      if (o.move && lastTap) {
        const md = o.moveD || 0.35;
        tl.to(tapEl, { left: x, top: y, duration: md, ease: "power2.inOut" }, t - md - 0.01);
        tl.to(core, { backgroundColor: coreBg, duration: 0.15 }, t - 0.2);
      } else {
        const lead = o.label ? 0.8 : 0.3; // com balão "Toque aqui", o dedo aparece antes
        tl.set(tapEl, { left: x, top: y }, t - lead);
        tl.set(core, { backgroundColor: coreBg }, t - lead);
        tl.fromTo(tapEl, { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out", immediateRender: false }, t - lead);
      }
      // aperto do dedo cabe no intervalo até o próximo toque (digitação rápida não sobrepõe tweens)
      const gap = o.gap || 1;
      const pr = gap < 0.3 ? 0.04 : 0.08;
      const rl = Math.min(0.22, gap - pr - 0.01);
      tl.fromTo(core, { scale: 1 }, { scale: 0.8, duration: pr, ease: "power2.in", immediateRender: false }, t - pr / 2);
      tl.fromTo(core, { scale: 0.8 }, { scale: 1, duration: rl, ease: "power2.out", immediateRender: false }, t + pr / 2);
      // a onda do toque fica no ponto tocado (elemento próprio: não anda com o dedo nem disputa tweens)
      const rg = document.createElement("i");
      rg.className = "tap-ring";
      calloutsEl.appendChild(rg);
      gsap.set(rg, { left: x, top: y, opacity: 0 });
      tl.fromTo(rg, { scale: 0.4, opacity: 0.95 }, { scale: 1.9, opacity: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, t);
      let lb = null;
      if (o.label) {
        lb = document.createElement("div");
        lb.className = "tap-label";
        lb.textContent = o.label;
        $("#callouts").appendChild(lb);
        const flip = x + 14 + lb.offsetWidth > 352; // perto da borda direita: balão à esquerda do dedo
        if (flip) lb.classList.add("flip");
        gsap.set(lb, { left: flip ? x - 14 - lb.offsetWidth : x + 14, top: o.below ? y + 26 : y - 54, transformOrigin: o.below ? "0% 0%" : flip ? "100% 100%" : "0% 100%" });
        if (o.below) lb.classList.add("below");
        tl.fromTo(lb, { opacity: 0, y: 6, scale: 0.6 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(2.4)", immediateRender: false }, t - 0.75);
        if (o.cut == null) tl.to(lb, { opacity: 0, duration: 0.25, ease: "power2.in" }, t + 0.25);
      }
      if (o.cut != null) {
        // a tela vai mudar (folha subindo/descendo): dedo e balão saem antes, não apontam para o lugar errado
        tl.to(lb ? [tapEl, lb] : tapEl, { opacity: 0, duration: 0.12, ease: "power1.in" }, o.cut - 0.12);
      } else if (!o.stay) tl.to(tapEl, { opacity: 0, duration: 0.3, ease: "power2.in" }, t + (o.hold || 0.3));
      lastTap = o.stay ? { x, y } : null;
      if (o.punch) punch(x, y, t, o.punch);
      sfx("click", t, { v: o.v || 0.7 });
    };

    const callout = (html, x, y, t, dur, cls, origin) => {
      const c = document.createElement("div");
      c.className = "callout" + (cls ? " " + cls : "");
      c.innerHTML = html;
      calloutsEl.appendChild(c);
      gsap.set(c, { left: x, top: y, transformOrigin: origin || "50% 100%" });
      tl.fromTo(c, { opacity: 0, y: 8, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.8)", immediateRender: false }, t);
      tl.to(c, { opacity: 0, y: -6, duration: 0.2, ease: "power2.in" }, t + dur);
      return c;
    };

    // legendas: palavras sobem em cascata (ritmo de fala); troca rápida sem painel vazio
    const capsEl = $("#caps");
    const splitWords = (root) => {
      const walk = (n) => Array.from(n.childNodes).forEach((ch) => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach((pt) => {
            if (!pt) return;
            if (/^\s+$/.test(pt)) frag.appendChild(document.createTextNode(pt));
            else { const w = document.createElement("span"); w.className = "w"; w.textContent = pt; frag.appendChild(w); }
          });
          ch.replaceWith(frag);
        } else if (ch.nodeType === 1 && !ch.classList.contains("uline")) walk(ch);
      });
      walk(root);
    };
    const caption = (o) => {
      const b = document.createElement("div");
      b.className = "cap-block";
      const lines = o.title.split("|").map((l) => `<span class="line-mask"><span>${l}</span></span>`).join("");
      b.innerHTML = (o.kicker ? `<div class="cap-kicker ${o.kcls || ""}">${o.kicker}${o.kcls === "new" ? '<i class="shine"></i>' : ""}</div>` : "") + `<div class="cap-title">${lines}</div>` + (o.sub ? `<div class="cap-sub">${o.sub}</div>` : "");
      capsEl.appendChild(b);
      $$(".line-mask > span", b).forEach(splitWords);
      const c = { el: b, words: $$(".cap-title .w", b), kick: $(".cap-kicker", b), sub: $(".cap-sub", b), ktext: o.kicker || "", kcls: o.kcls || "" };
      c.em = c.words.filter((w) => w.closest("em"));
      // estado escondido desde já: nada pisca entre o "visible" e o início das entradas
      gsap.set(b, { visibility: "hidden" });
      gsap.set(c.words, { yPercent: 125 });
      if (c.kick) gsap.set(c.kick, { opacity: 0, scale: 0.6, transformOrigin: "0% 50%" });
      if (c.kick && $(".shine", c.kick)) gsap.set($(".shine", c.kick), { xPercent: -120 });
      if (c.sub) gsap.set(c.sub, { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" });
      c.uline = $$(".uline", b);
      return c;
    };
    // line2At: a 2ª linha (e o subtítulo) só entram nesse instante (legenda progressiva)
    const capIn = (c, t, keepKick, line2At) => {
      tl.set(c.el, { visibility: "visible" }, t);
      if (c.kick) {
        if (keepKick) tl.set(c.kick, { opacity: 1, scale: 1 }, t);
        else tl.fromTo(c.kick, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.38, ease: "back.out(2.4)", immediateRender: false }, t);
        const sh = $(".shine", c.kick);
        if (sh) tl.fromTo(sh, { xPercent: -120 }, { xPercent: 420, duration: 0.7, ease: "power2.inOut", immediateRender: false }, t + 0.45);
      }
      const masks = $$(".line-mask", c.el);
      let k1 = 0, k2 = 0, lastT = t;
      c.words.forEach((w) => {
        const second = line2At != null && masks.indexOf(w.closest(".line-mask")) >= 1;
        const tw = second ? line2At + 0.06 + k2++ * 0.045 : t + 0.06 + k1++ * 0.045;
        lastT = Math.max(lastT, tw);
        const isEm = c.em.includes(w);
        tl.fromTo(w, { yPercent: 125 }, { yPercent: 0, duration: isEm ? 0.55 : 0.5, ease: isEm ? "back.out(1.4)" : "expo.out", immediateRender: false }, tw);
      });
      if (c.sub) tl.fromTo(c.sub, { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" }, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power2.out", immediateRender: false }, lastT + 0.12);
    };
    const capOut = (c, t, keepKick) => {
      tl.to(c.words, { yPercent: -125, duration: 0.24, ease: "power3.in", stagger: 0.012 }, t);
      if (c.uline.length) tl.fromTo(c.uline, { scaleX: 1 }, { scaleX: 0, transformOrigin: "100% 50%", duration: 0.16, ease: "power2.in", immediateRender: false }, t);
      if (c.kick && !keepKick) tl.to(c.kick, { opacity: 0, scale: 0.7, duration: 0.2, ease: "power2.in" }, t);
      if (c.kick && keepKick) tl.set(c.kick, { opacity: 0 }, t + 0.22);
      if (c.sub) tl.to(c.sub, { opacity: 0, y: -8, duration: 0.2, ease: "power2.in" }, t);
      tl.set(c.el, { visibility: "hidden" }, t + 0.34);
    };
    // a nova legenda "pousa" em t (na batida); a anterior sai 0,22 s antes
    const capSwap = (a, b, t, line2At) => {
      const keep = !!(a.kick && b.kick && a.ktext === b.ktext && a.kcls === b.kcls);
      capOut(a, t - 0.22, keep);
      capIn(b, t, keep, line2At);
    };

    // indicador de passos: pulo + anel ao começar; "bump" ao concluir
    const stp = $$(".stp");
    const stpLines = $$(".stp-line i");
    stp.forEach((el) => {
      const r = document.createElement("i");
      r.className = "stp-ring";
      $("b", el).appendChild(r);
    });
    const stepOn = (i, t) => {
      const b = $("b", stp[i]);
      tl.fromTo(b, { scale: 0.7 }, { scale: 1, duration: 0.5, ease: "back.out(3)", immediateRender: false }, t);
      tl.fromTo($(".stp-ring", stp[i]), { scale: 1, opacity: 0.6, borderColor: "#3364e0" }, { scale: 1.9, opacity: 0, borderColor: "#3364e0", duration: 0.6, ease: "power2.out", immediateRender: false }, t + 0.05);
      tl.to(b, { backgroundColor: "#3364e0", color: "#ffffff", duration: 0.25 }, t);
      tl.to(stp[i], { color: "#0b0b0c", duration: 0.25 }, t);
    };
    const stepDone = (i, t) => {
      const b = $("b", stp[i]);
      tl.fromTo(b, { scale: 1 }, { scale: 1.18, duration: 0.12, ease: "power2.out", immediateRender: false }, t);
      tl.to(b, { scale: 1, duration: 0.3, ease: "back.out(2.5)" }, t + 0.12);
      tl.fromTo($(".stp-ring", stp[i]), { scale: 1, opacity: 0.6, borderColor: "#30d158" }, { scale: 1.9, opacity: 0, borderColor: "#30d158", duration: 0.6, ease: "power2.out", immediateRender: false }, t + 0.05);
      tl.to(b, { backgroundColor: "#30d158", color: "#ffffff", duration: 0.25 }, t);
      tl.to(stp[i], { color: "#4a4f57", duration: 0.25 }, t);
      if (stpLines[i]) tl.to(stpLines[i], { scaleX: 1, duration: 0.45, ease: "expo.inOut" }, t + 0.08);
    };
    const stepOpt = (i, t) => {
      tl.to($("b", stp[i]), { backgroundColor: "#e4e6eb", color: "#5b616b", duration: 0.25 }, t);
      tl.to(stp[i], { color: "#4a4f57", duration: 0.25 }, t);
      if (stpLines[i]) tl.to(stpLines[i], { scaleX: 1, duration: 0.45, ease: "expo.inOut" }, t + 0.08);
    };

    // filtro: posiciona as linhas de um estado (lista de ids) com FLIP — rápido e com leve "quique"
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
          tl.to(r, { y, duration: 0.5, ease: "power3.inOut" }, t + 0.05);
        } else if (was && !will) {
          tl.to(r, { opacity: 0, x: -24, duration: 0.2, ease: "power2.in" }, t + Math.min(shown.get(id), 9) * 0.01);
          tl.set(r, { x: 0 }, t + 0.32);
        } else if (!was && will) {
          tl.set(r, { y: y + 30, x: 0 }, t + 0.2);
          tl.to(r, { y, opacity: 1, duration: 0.45, ease: "back.out(1.4)" }, t + 0.22 + Math.min(next.get(id), 9) * 0.04);
        }
      });
      shown = next;
    };
    // pílula azul única que desliza de um chip para o outro (fundos cinza numa camada atrás)
    const chipHl = document.createElement("i");
    chipHl.className = "chip-hl";
    Object.keys(chip).forEach((k) => {
      const g = document.createElement("i");
      g.className = "chip-bg";
      Object.assign(g.style, { left: chip[k].offsetLeft + "px", top: chip[k].offsetTop + "px", width: chip[k].offsetWidth + "px", height: chip[k].offsetHeight + "px" });
      chipsEl.insertBefore(g, chipsEl.firstChild);
    });
    chipsEl.insertBefore(chipHl, chip.all);
    Object.assign(chipHl.style, { left: chip.all.offsetLeft + "px", top: chip.all.offsetTop + "px", width: chip.all.offsetWidth + "px", height: chip.all.offsetHeight + "px" });
    const chipSelect = (from, to, t, note) => {
      tl.to(chipHl, { left: chip[to].offsetLeft, width: chip[to].offsetWidth, duration: 0.36, ease: "back.inOut(1.3)" }, t - 0.02);
      tl.to(chipHl, { keyframes: { scaleY: [1, 0.86, 1] }, duration: 0.36, ease: "none" }, t - 0.02);
      tl.to(chip[from], { color: "#333333", duration: 0.15 }, t + 0.04);
      tl.to(chip[to], { color: "#ffffff", duration: 0.15 }, t + 0.2);
      if (cnt[from] && cnt[to]) {
        // contador do cabeçalho troca com um "flash" azul
        tl.fromTo(cnt[from], { yPercent: 0, opacity: 1 }, { yPercent: -100, opacity: 0, duration: 0.22, ease: "power2.inOut", immediateRender: false }, t + 0.05);
        tl.fromTo(cnt[to], { yPercent: 100, opacity: 0, color: "#3364e0" }, { yPercent: 0, opacity: 1, color: "#3364e0", duration: 0.22, ease: "power2.inOut", immediateRender: false }, t + 0.05);
        tl.to(cnt[to], { color: "#6b6b6b", duration: 0.5 }, t + 1.0);
      }
      if (note) sfx("note", t + 0.05, { n: note, v: 1.1 });
    };
    // toque no ícone do chip (o dedo não cobre o nome do filtro)
    const chipTap = (k, scroll) => ({ x: M.chip[k].x - (scroll || 0) + 12, y: M.chip[k].y + M.chip[k].h / 2 });

    /* ---------------- estados iniciais ---------------- */
    gsap.set(cam, { x: OVER.x, y: OVER.y + 470, scale: OVER.scale });
    gsap.set("#cap", { opacity: 0, y: -40 });
    gsap.set(stpLines, { scaleX: 0 });
    gsap.set($$(".stp-ring"), { opacity: 0 });
    gsap.set(spot, { left: M.who.x, top: M.who.y, width: M.who.w, height: M.who.h, opacity: 0 });
    gsap.set(tapEl, { opacity: 0 });
    gsap.set(["#cnt1", "#cnt-a", "#cnt-b"], { yPercent: 100 });
    gsap.set("#cart-n", { scale: 0 });
    gsap.set(Object.values(cnt).slice(1), { yPercent: 100, opacity: 0 });
    gsap.set([head1, head2], { opacity: 0, x: 24 });
    gsap.set("#eap-l2, #eap-l3", { xPercent: 100 });
    gsap.set($$(".ck", screen), { opacity: 0 });
    gsap.set(rowTags, { opacity: 0, transformOrigin: "0% 50%" });
    gsap.set($$(".radio .on svg path", rowsEl), { strokeDashoffset: 11 });
    gsap.set($$(".qp-add .a1"), { opacity: 0 });
    gsap.set("#send .sheen", { xPercent: -150 });
    layoutRows(FIRST_PAGE_ALL, 0, true);

    /* ====================================================================
       0 — ABERTURA (movimento desde o 1º quadro; o celular pousa no 1º "drop")
       ==================================================================== */
    gsap.set("#dots", { opacity: 0.55 });
    tl.to(cam, { y: OVER.y + 380, duration: 1.6, ease: "power3.out" }, 0);
    tl.to("#intro", { y: -14, duration: 1.6, ease: "power3.out" }, 0);
    sfx("whoosh", 0.15, { dur: 1.2, f0: 220, f1: 1100, v: 0.22, pan0: -0.2, pan1: 0.2, peak: 0.6 });
    const tIn = T.s1 - K(1.5);
    tl.to("#intro", { y: -480, opacity: 0, duration: 0.6, ease: "power3.in" }, tIn);
    tl.to(cam, { x: OVER.x, y: OVER.y, scale: OVER.scale, duration: K(1.5), ease: "power3.inOut" }, tIn);
    camNow = { x: OVER.x, y: OVER.y, scale: OVER.scale };
    tl.to("#dots", { opacity: 0.4, duration: 0.8 }, tIn);
    tl.to("#cap", { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, T.s1 - 0.8);
    tl.to("#steps", { opacity: 1, duration: 0.4 }, T.s1 - 0.45);
    sfx("whoosh", tIn, { dur: K(1.5), f0: 220, f1: 1400, v: 0.35, pan0: 0, pan1: 0, peak: 0.85 });

    /* ====================================================================
       1 — QUEM RETIRA
       ==================================================================== */
    const S1 = T.s1;
    const c1 = caption({ kicker: "Passo 1", title: "Confira <em>quem retira</em>", sub: "Já vem preenchido. Só troque se precisar." });
    capIn(c1, S1);
    stepOn(0, S1);
    camTo(focusOn(M.sec1, 10, 2.6), S1 + 0.05, 0.85, "expo.inOut");
    spotTo(M.who, S1 + 0.65, { pad: 5, radius: 12 });
    drift(S1 + 0.95, T.s2 - S1 - 1.0, { x: M.who.x + M.who.w / 2, y: M.who.y + M.who.h / 2 }, 1.025);
    // sem toque: conferir não exige ação
    tl.to("#b1 .ck", { opacity: 1, duration: 0.25 }, S1 + K(4));
    tl.to("#b1", { scale: 1.3, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1 }, S1 + K(4));
    sfx("note", S1 + K(4), { n: 79, v: 1.1 });
    stepDone(0, S1 + K(4) + 0.15);
    spotOff(S1 + K(6));

    /* ====================================================================
       2 — INSUMOS + NOVO FILTRO POR TIPO DE SERVIÇO
       ==================================================================== */
    const S2 = T.s2;
    const c2 = caption({ kicker: "Passo 2", title: "Escolha os <em>insumos</em>", sub: "Toque em <b>Escolher insumos</b>." });
    capSwap(c1, c2, S2);
    stepOn(1, S2);
    stinger(focusOn(M.sec2, 10, 2.6), S2, { x: M.tileIns.x + 40, y: M.tileIns.y + M.tileIns.h / 2 }, -1);
    spotTo(M.tileIns, S2 + 0.65, { pad: 4, radius: 14 });
    const tTile = S2 + K(3.5);
    tapAt(M.tileIns.x + 40, M.tileIns.y + M.tileIns.h / 2, tTile, { label: "Toque aqui", cut: tTile + 0.15, punch: 1.018 });
    spotOff(tTile + 0.1, 0.25);
    // a folha de insumos sobe; a câmera acompanha
    tl.to(insSheet, { yPercent: 0, duration: 0.6, ease: "expo.out" }, tTile + 0.15);
    sfx("whoosh", tTile + 0.15, { dur: 0.6, f0: 300, f1: 1400, v: 0.3, pan0: 0, pan1: 0, peak: 0.5 });
    const sheetTop = { x: 0, y: 34, w: 360, h: 470 };
    camTo(focusOn(sheetTop, 0, 2.6), tTile + 0.2, 0.6, FOLLOW);

    // NOVO: filtro por tipo de serviço — chips em foco antes do toque (que cai no 2º drop)
    const c3 = caption({ kicker: "Novo", kcls: "new", title: "Filtre por|<em>tipo de serviço</em>", sub: "<span class=\"s0\"><b>Hidráulica?</b> Só material de hidráulica.</span><span class=\"s1\"><b>Elétrica, Alvenaria…</b> e assim por diante.</span>" });
    capSwap(c2, c3, T.th - K(2.25));
    const TH = T.th;
    spotTo(M.chips, TH - 1.1, { pad: 2, radius: 16 });
    const hTap = chipTap("hid");
    tapAt(hTap.x, hTap.y, TH, { hold: 0.35, label: "Toque aqui", light: true, punch: 1.015 });
    chipSelect("all", "hid", TH + 0.02);
    spotOff(TH + 0.3, 0.35);
    const hidIds = byCat("hid");
    layoutRows(hidIds, TH + 0.12, false, hidIds.length);
    // cada linha ganha a etiqueta do tipo (em cascata) e a lista rola até tubos, registros, tês…
    const visTags = hidIds.slice(0, 7).map((id) => $(".tag", rows[id]));
    tl.set(rowTags.filter((x) => !visTags.includes(x)), { opacity: 1 }, TH + 0.55);
    tl.fromTo(visTags, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2.5)", stagger: 0.05, immediateRender: false }, TH + 0.55);
    const hidScroll = Math.max(0, hidIds.length - 7) * ROW_H;
    tl.to("#ins-rows", { y: -hidScroll, duration: 0.8, ease: "power3.inOut" }, TH + K(2.5));

    // e assim por diante: Elétrica, Alvenaria… (a fileira rola até o último tipo)
    const TE = T.te;
    const s0 = $(".s0", c3.el);
    const s1 = $(".s1", c3.el);
    gsap.set(s1, { opacity: 0 });
    tl.to(s0, { yPercent: -110, opacity: 0, duration: 0.25, ease: "power3.in" }, TE - 0.45);
    tl.fromTo(s1, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: "back.out(1.4)", immediateRender: false }, TE - 0.3);
    const eTap = chipTap("ele");
    tapAt(eTap.x, eTap.y, TE, { hold: 0.3, light: true, punch: 1.015 });
    chipSelect("hid", "ele", TE + 0.02, 79);
    tl.to("#ins-rows", { y: 0, duration: 0.45, ease: "power3.inOut" }, TE + 0.08);
    layoutRows(byCat("ele"), TE + 0.12);
    const chipScroll = Math.max(0, M.chip.aca.x + M.chip.aca.w - (M.chips.x + M.chips.w - 10));
    tl.to(chipsEl.children, { x: -chipScroll, duration: 0.6, ease: "power3.inOut" }, TE + K(1));
    const TA = T.ta;
    const aTap = chipTap("alv", chipScroll);
    tapAt(aTap.x, aTap.y, TA, { hold: 0.3, light: true, punch: 1.015 });
    chipSelect("ele", "alv", TA + 0.02, 84);
    layoutRows(byCat("alv"), TA + 0.12);

    /* ---- cada insumo: toque → tela de quantidade (mesmo modal) → Adicionar → volta à lista ---- */
    // legenda progressiva: "Toque no insumo" já; "e digite a quantidade" chega junto com a tela nova
    const c5 = caption({ kicker: "Passo 2", title: "Toque no <em>insumo</em>|e digite a <em>quantidade</em>", sub: "Depois, toque em <b>Adicionar</b>." });
    capSwap(c3, c5, T.ts, T.p0 + 0.2);
    const alvIds = byCat("alv");
    const rowY = (id) => M.list.y + alvIds.indexOf(id) * ROW_H + ROW_H / 2;
    const p1 = $("#ins-p1");
    const PUSH = 0.42;
    // tela da quantidade entra pela direita (com os blocos em leve cascata); a lista recua
    const pushIn = (i, t) => {
      tl.to(p1, { xPercent: -30, duration: PUSH, ease: "power3.inOut" }, t);
      tl.to(qps[i], { xPercent: 0, duration: PUSH, ease: "power3.inOut" }, t);
      const parts = [".sh-head", ".qp-lbl", ".qp-field", ".qp-hint", ".qp-add"].map((q) => $(q, qps[i]));
      tl.fromTo(parts, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.42, ease: "power3.out", stagger: 0.04, immediateRender: false }, t + 0.1);
      sfx("whoosh", t, { dur: 0.4, f0: 900, f1: 2200, v: 0.16, pan0: 0.4, pan1: -0.2, peak: 0.5 });
    };
    const popOut = (i, t) => {
      tl.to(qps[i], { xPercent: 100, duration: PUSH, ease: "power3.inOut" }, t);
      tl.to(p1, { xPercent: 0, duration: PUSH, ease: "power3.inOut" }, t);
      tl.to(kpad, { yPercent: 110, duration: 0.3, ease: "power2.in" }, t);
      sfx("whoosh", t, { dur: 0.4, f0: 2000, f1: 700, v: 0.14, pan0: -0.3, pan1: 0.3, peak: 0.4 });
    };
    // digitação: tecla acende, dígito "salta" em azul e assenta em preto, cursor anda
    const typeQty = (i, t0, gap, moveD, lastGap) => {
      const q = qps[i];
      const ds = $$(".qp-val .d", q);
      const caret = $(".qp-caret", q);
      const keys = PICK_QTY[i].split(" ")[0].split("");
      keys.forEach((k, j) => {
        const t = t0 + j * gap;
        const kr = M.key[k];
        tapAt(kr.x + kr.w / 2, kr.y + kr.h / 2, t, { move: j > 0, stay: true, moveD, light: true, v: 0.5, gap: j < keys.length - 1 ? gap : lastGap });
        tl.to(keyEl[k], { backgroundColor: "#b9bcc4", duration: 0.04 }, t - 0.02);
        tl.to(keyEl[k], { backgroundColor: "#ffffff", duration: 0.16 }, t + 0.07);
        tl.fromTo(ds[j], { opacity: 0, y: 10, scale: 1.35, color: "#3364e0" }, { opacity: 1, y: 0, scale: 1, color: "#111111", duration: 0.24, ease: "back.out(2.5)", immediateRender: false }, t);
        tl.set(caret, { x: caretX[i][j + 1] }, t);
      });
      return t0 + (keys.length - 1) * gap;
    };
    // campo em foco: borda azul com brilho + cursor piscando (piscar desenhado na timeline)
    const focusField = (i, t, until) => {
      const q = qps[i];
      const rg = $(".qp-field .ring", q);
      tl.to(rg, { opacity: 1, duration: 0.12 }, t);
      tl.fromTo(rg, { boxShadow: "0 0 0 0px rgba(51, 100, 224, 0.3)" }, { boxShadow: "0 0 0 6px rgba(51, 100, 224, 0)", duration: 0.5, ease: "power2.out", immediateRender: false }, t);
      tl.to($(".qp-lbl", q), { color: "#3364e0", duration: 0.15 }, t);
      tl.to($(".ph", q), { opacity: 0, duration: 0.1 }, t);
      const caret = $(".qp-caret", q);
      for (let tb = t; tb < until; tb += 0.5) tl.set(caret, { opacity: tb + 0.25 < until && Math.round((tb - t) / 0.5) % 2 === 1 ? 0 : 1 }, tb);
      tl.set(caret, { opacity: 0 }, until);
    };
    // enquadramento da quantidade: nome do item + campo + teclado (e a lista inteira, com Concluir)
    const QTY_SHOT = shotFor({ x: 0, y: 40, w: 360, h: 722 }, { x: 40, y: 492, w: 1000, h: 1424 }, 2.6);
    const pickItem = (i, T0, full) => {
      const id = PICK[i];
      tapAt(150, rowY(id), T0, full ? { label: "Toque aqui", light: true, hold: 0.12, cut: T0 + K(0.25) } : { hold: 0.12, cut: T0 + K(0.25) });
      tl.to(rows[id], { backgroundColor: "#f5f8ff", duration: 0.15 }, T0 + 0.02);
      pushIn(i, T0 + K(0.25));
      const add = M.qp[i].add;
      let tAdd;
      if (full) {
        // 1º item, no ritmo de quem aprende: a tela abre com o campo em foco e o teclado sobe
        // (a câmera desce junto); dígitos em colcheias
        tl.to(kpad, { yPercent: 0, duration: 0.35, ease: "expo.out" }, T0 + K(1));
        camTo(QTY_SHOT, T0 + K(1), 0.55, FOLLOW);
        typeQty(i, T0 + K(2), K(0.5), 0.14, K(1));
        tAdd = T0 + K(4);
        focusField(i, T0 + K(1), tAdd);
      } else {
        // próximos itens: mesmo comportamento, mais rápido — dígitos em semicolcheias
        tl.to(kpad, { yPercent: 0, duration: 0.3, ease: "expo.out" }, T0 + K(0.5));
        typeQty(i, T0 + K(1.25), K(0.25), 0.07, K(0.5));
        tAdd = T0 + K(2.25);
        focusField(i, T0 + K(0.5), tAdd);
      }
      tapAt(add.x + add.w * 0.72, add.y + add.h / 2, tAdd, { move: true, moveD: full ? 0.25 : 0.2, light: true, cut: tAdd + 0.2, punch: 1.018 });
      // Adicionar → ✓ Adicionado (verde) antes de voltar para a lista
      const ab = $(".qp-add", qps[i]);
      tl.to(ab, { scale: 0.96, duration: 0.06, ease: "power2.in" }, tAdd - 0.03);
      tl.to(ab, { scale: 1, duration: 0.25, ease: "back.out(2)" }, tAdd + 0.04);
      tl.to($(".a0", ab), { yPercent: -100, opacity: 0, duration: 0.18, ease: "power2.in" }, tAdd + 0.05);
      tl.fromTo($(".a1", ab), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.22, ease: "back.out(2)", immediateRender: false }, tAdd + 0.1);
      tl.to(ab, { backgroundColor: "#30d158", duration: 0.15 }, tAdd + 0.08);
      popOut(i, tAdd + (full ? K(0.75) : K(0.5)));
      // de volta à lista: item marcado (check desenhado) com a quantidade
      const tBack = tAdd + (full ? K(1.25) : K(1));
      tl.fromTo($(".radio .on", rows[id]), { scale: 0 }, { scale: 1, duration: 0.36, ease: "back.out(2.6)", immediateRender: false }, tBack);
      tl.fromTo($(".radio .on svg path", rows[id]), { strokeDashoffset: 11 }, { strokeDashoffset: 0, duration: 0.22, ease: "power2.out", immediateRender: false }, tBack + 0.08);
      tl.fromTo(rows[id], { backgroundColor: "#dfe8ff" }, { backgroundColor: "#f5f8ff", duration: 0.5, immediateRender: false }, tBack);
      tl.fromTo(qpills[i], { opacity: 0, x: 24, scale: 0.8 }, { opacity: 1, x: 0, scale: 1, duration: 0.36, ease: "back.out(2)", immediateRender: false }, tBack + 0.05);
      sfx("note", tBack, { n: [79, 81, 84][i], v: 1.1 });
      return tBack + 0.35;
    };
    const end0 = pickItem(0, T.p0, true);
    // "Concluir" acende assim que há um item
    tl.to("#ins-ok", { backgroundColor: "#3364e0", color: "#ffffff", duration: 0.14 }, end0 - 0.2);
    tl.fromTo("#ins-ok", { scale: 1 }, { scale: 1.12, duration: 0.14, ease: "power2.out", immediateRender: false }, end0 - 0.2);
    tl.to("#ins-ok", { scale: 1, duration: 0.35, ease: "back.out(3)" }, end0 - 0.06);
    const c7 = caption({ kicker: "Passo 2", title: "Repita para|<em>os outros itens</em>", sub: "No fim, toque em <b>Concluir</b>." });
    capSwap(c5, c7, T.p1 + K(1));
    pickItem(1, T.p1, false);
    pickItem(2, T.p2, false);
    // Concluir (já no quadro)
    const TC = T.tc;
    tapAt(M.insOk.x + M.insOk.w / 2, M.insOk.y + M.insOk.h / 2, TC, { light: true, cut: TC + 0.15, punch: 1.02 });
    tl.to(insSheet, { yPercent: 102, duration: 0.55, ease: "power3.inOut" }, TC + 0.15);
    sfx("whoosh", TC + 0.15, { dur: 0.6, f0: 1200, f1: 300, v: 0.28, pan0: 0, pan1: 0, peak: 0.4 });

    // passo 2 preenchido + barra inferior "Completo" no mesmo quadro
    const c6b = caption({ kicker: "Passo 2", kcls: "ok", title: "Insumos|<em>no carrinho</em>", sub: "Com as quantidades." });
    capSwap(c7, c6b, TC + K(1));
    const FORM_TOP = M.sec2.y - 6;
    const FORM_SHOT = focusOn({ x: 0, y: FORM_TOP, w: 360, h: M.bbar.y + M.bbar.h - FORM_TOP }, 0, 2.6);
    camTo(FORM_SHOT, TC + 0.2, 0.8, FOLLOW);
    tl.set(picked, { display: "block", height: 0, marginTop: 0 }, TC + 0.45);
    tl.to(picked, { height: pickedH, marginTop: 10, duration: 0.55, ease: "power3.out" }, TC + 0.45);
    const pkRows = $$(".pk-row", picked);
    tl.fromTo(pkRows, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out", stagger: 0.09, immediateRender: false }, TC + 0.6);
    tl.fromTo($$(".pk-dot", picked), { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(3)", stagger: 0.09, immediateRender: false }, TC + 0.65);
    tl.to("#b2 .ck", { opacity: 1, duration: 0.25 }, TC + 1.05);
    tl.to("#b2", { backgroundColor: "#30d158", color: "#ffffff", duration: 0.25 }, TC + 1.05);
    sfx("note", TC + 1.05, { n: 76, v: 1.1 });
    stepDone(1, TC + 1.15);
    // contador 0 → 1 → 2 → 3, carrinho balança, "Completo", Enviar acende com brilho
    const TB = TC + 1.0;
    const odo = ["#cnt0", "#cnt-a", "#cnt-b", "#cnt1"];
    for (let j = 0; j < 3; j++) {
      const tj = TB + 0.4 + j * 0.17;
      tl.fromTo(odo[j], { yPercent: 0 }, { yPercent: -100, duration: 0.14, ease: "power2.inOut", immediateRender: false }, tj);
      tl.fromTo(odo[j + 1], { yPercent: 100 }, { yPercent: 0, duration: 0.14, ease: "power2.inOut", immediateRender: false }, tj);
      sfx("tick", tj, { f: 2200 + j * 300, v: 1.2 });
    }
    tl.to("#hint0", { opacity: 0, duration: 0.2 }, TB + 0.4);
    tl.to("#hint1", { opacity: 1, duration: 0.25 }, TB + 0.55);
    tl.to("#st0", { opacity: 0, duration: 0.2 }, TB + 0.55);
    tl.fromTo("#st1", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2.5)", immediateRender: false }, TB + 0.7);
    tl.fromTo("#cart-n", { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(3)", immediateRender: false }, TB + 0.64);
    tl.to(".bb-cart svg", { keyframes: { rotation: [0, -12, 8, -4, 0] }, transformOrigin: "50% 100%", duration: 0.45, ease: "none" }, TB + 0.64);
    sfx("note", TB + 0.64, { n: 84, v: 1.0 });
    tl.to("#lote", { backgroundColor: "#eaeffc", color: "#3364e0", duration: 0.3 }, TB + 0.7);
    tl.to("#send", { backgroundColor: "#3364e0", duration: 0.3 }, TB + 0.7);
    tl.fromTo("#send .sheen", { xPercent: -150 }, { xPercent: 350, duration: 0.6, ease: "power2.inOut", immediateRender: false }, TB + 0.95);
    callout("Já dá para <b>enviar</b>", M.send.x + M.send.w - 120, M.send.y - 40, TB + 0.5, 1.7, "blue", "100% 100%");

    /* ====================================================================
       3 — SERVIÇO: NÃO É MAIS OBRIGATÓRIO. SEU LÍDER PODE APROPRIAR POR VOCÊ
       ==================================================================== */
    const t3 = T.s3;
    // rola o formulário para mostrar o passo 3 e mergulha nele (na "parada" da trilha)
    const scrollY = Math.max(0, sec3Filled.y + sec3Filled.h + 20 - (M.bbar.y - 8));
    tl.to("#form", { y: -scrollY, duration: 0.75, ease: "power3.inOut" }, t3 - 0.2);
    const sec3 = { x: sec3Filled.x, y: sec3Filled.y - scrollY, w: sec3Filled.w, h: sec3Filled.h };
    const shift3 = sec3Filled.y - M.sec3.y;
    const opc = { x: M.opc.x, y: M.opc.y + shift3 - scrollY, w: M.opc.w, h: M.opc.h };
    const tileSvc = { x: tileSvcFilled.x, y: tileSvcFilled.y - scrollY, w: tileSvcFilled.w, h: tileSvcFilled.h };
    const SBOX = { x: 40, y: 520, w: 1000, h: 560 }; // passo 3 no alto; o cartão do líder fica embaixo
    stinger(focusOn(sec3, 10, 2.7, SBOX), t3 - 0.1, { x: opc.x + opc.w / 2, y: opc.y + opc.h / 2 }, 1);

    // a mensagem principal pousa na batida: ênfase em "Não é mais" (chacoalha e sublinha)
    const c8 = caption({ kicker: "Passo 3 · Serviço", kcls: "ok", title: "<em class=\"ul\">Não é mais<i class=\"uline\"></i></em>|obrigatório", sub: "Dá para enviar sem escolher o serviço." });
    capSwap(c6b, c8, t3);
    stepOn(2, t3);
    tl.to(c8.words[0], { keyframes: { x: [0, -7, 6, -4, 2, 0] }, duration: 0.42, ease: "power1.inOut" }, t3 + 0.95);
    tl.fromTo($(".uline", c8.el), { scaleX: 0 }, { scaleX: 1, duration: 0.42, ease: "power3.out", immediateRender: false }, t3 + 1.05);
    sfx("whoosh", t3 + 1.05, { dur: 0.45, f0: 900, f1: 3600, v: 0.2, pan0: -0.3, pan1: 0.3, peak: 0.9 });
    spotTo(opc, t3 + 0.8, { pad: 4, radius: 12 });
    const tOpc = t3 + K(2.5);
    tl.fromTo("#opc", { scale: 1 }, { scale: 1.22, backgroundColor: "#e3f8e9", color: "#138a3a", duration: 0.16, ease: "power2.out", immediateRender: false }, tOpc);
    tl.to("#opc", { scale: 1, duration: 0.45, ease: "back.out(3)" }, tOpc + 0.16);
    punch(opc.x + opc.w / 2, opc.y + opc.h / 2, tOpc, 1.02);
    drift(t3 + 1.6, T.tl - t3 - 1.7, { x: opc.x + opc.w / 2, y: opc.y + opc.h / 2 }, 1.03);

    // cartão: antes/agora + você envia → seu líder pode apropriar depois (o app recua, o cartão vem à frente)
    const leader = $("#leader");
    gsap.set(leader, { left: 70, top: 560, width: 940 });
    const ldBa = $(".ld-ba", leader);
    const ldOld = $(".ld-old", leader);
    const ldNew = $(".ld-new", leader);
    const ldArrow = $(".ld-arrow", leader);
    const ldNodes = $$(".ld-node", leader);
    const ldStrike = $(".ld-strike", leader);
    const ldLead = $(".ld-av.lead", leader);
    gsap.set(ldArrow, { scaleX: 0 });
    gsap.set([ldBa, ...ldNodes], { opacity: 0, y: 16 });
    gsap.set(ldNew, { opacity: 0, scale: 0.6 });
    gsap.set(ldStrike, { scaleX: 0 });
    const c9 = caption({ kicker: "Novo", kcls: "new", title: "Seu líder pode|<em>apropriar por você</em>", sub: "Ele pode indicar o serviço depois." });
    const tL = T.tl;
    capSwap(c8, c9, tL);
    tl.set(leader, { visibility: "visible" }, tL);
    tl.fromTo(leader, { opacity: 0, y: 110, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: "expo.out", immediateRender: false }, tL + 0.05);
    const oOpc = org(opc.x + opc.w / 2, opc.y + opc.h / 2);
    tl.fromTo(phone, { scale: 1, y: 0, transformOrigin: oOpc }, { scale: 0.965, y: 24, transformOrigin: oOpc, duration: 0.65, ease: "power3.out", immediateRender: false }, tL + 0.05);
    tl.to(ldBa, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, tL + 0.25);
    tl.to(ldStrike, { scaleX: 1, duration: 0.28, ease: "power3.inOut" }, tL + 0.5);
    tl.to(ldOld, { color: "#7d838c", duration: 0.2 }, tL + 0.62);
    tl.fromTo(ldNew, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.42, ease: "back.out(2.6)", immediateRender: false }, tL + 0.72);
    sfx("note", tL + 0.74, { n: 79, v: 1.0 });
    tl.fromTo(ldNodes[0], { opacity: 0, y: 16, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(2)", immediateRender: false }, tL + 1.0);
    tl.to(ldArrow, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, tL + 1.2);
    sfx("whoosh", tL + 1.2, { dur: 0.6, f0: 400, f1: 1600, v: 0.25, pan0: -0.5, pan1: 0.5, peak: 0.6 });
    tl.fromTo(ldNodes[1], { opacity: 0, y: 16, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(2)", immediateRender: false }, tL + 1.65);
    tl.fromTo(ldLead, { scale: 1 }, { scale: 1.15, duration: 0.14, ease: "power2.out", immediateRender: false }, tL + 1.75);
    tl.to(ldLead, { scale: 1, duration: 0.35, ease: "back.out(3)" }, tL + 1.89);
    sfx("note", tL + 1.76, { n: 84, v: 1.0 });
    const tOut = T.tout; // o cartão completo fica ~3 s legível
    tl.to(leader, { opacity: 0, y: -90, scale: 0.97, duration: 0.3, ease: "power3.in" }, tOut);
    tl.set(leader, { visibility: "hidden" }, tOut + 0.32);
    tl.to(phone, { scale: 1, y: 0, duration: 0.5, ease: "power3.inOut" }, tOut);
    spotOff(tOut + 0.2);
    stepOpt(2, tOut + 0.2);
    tl.to("#opc", { backgroundColor: "#efeff0", color: "#828282", duration: 0.35 }, tOut + 0.2);

    // caminho opcional: escolher na árvore da EAP
    const E0 = T.e0;
    const c10 = caption({ kicker: "Opcional", kcls: "ok", title: "Sabe o serviço?|<em>Escolha na EAP</em>", sub: "Toque nas pastas até achar o serviço." });
    capSwap(c9, c10, E0 + K(1));
    camTo(focusOn(tileSvc, 10, 2.6), E0 + 0.05, 0.7);
    const tSvc = E0 + K(2);
    tapAt(tileSvc.x + 40, tileSvc.y + tileSvc.h / 2, tSvc, { cut: tSvc + 0.15, punch: 1.018 });
    tl.to("#scrim", { opacity: 0.45, duration: 0.4 }, tSvc + 0.15);
    tl.to(eapSheet, { yPercent: 0, duration: 0.55, ease: "expo.out" }, tSvc + 0.15);
    sfx("whoosh", tSvc + 0.15, { dur: 0.55, f0: 300, f1: 1400, v: 0.28, pan0: 0, pan1: 0, peak: 0.5 });
    // câmera acompanha a folha da EAP (mesma curva, sem "vai e volta")
    camTo(focusOn({ x: 0, y: 56, w: 360, h: 470 }, 0, 2.6), tSvc + 0.15, 0.55, FOLLOW);
    // cabeçalhos trocam em sequência (sem sobreposição de textos)
    const headSwap = (a, b, t) => {
      tl.to(a, { opacity: 0, x: -24, duration: 0.18, ease: "power2.in" }, t);
      tl.to(b, { opacity: 1, x: 0, duration: 0.28, ease: "power2.out" }, t + 0.2);
    };
    const tF1 = E0 + K(3.75), tF2 = E0 + K(5.25), tF3 = E0 + K(6.75), tOk = E0 + K(7.75);
    // nível 1 → TORRE
    tapAt(M.eapRow1.x + 40, M.eapRow1.y + M.eapRow1.h / 2, tF1, { cut: tF1 + 0.15 });
    tl.to(eap1[3], { backgroundColor: "#eaeffc", duration: 0.15 }, tF1);
    sfx("note", tF1, { n: 72, v: 0.9 });
    tl.to("#eap-l1", { xPercent: -100, duration: 0.45, ease: "power3.inOut" }, tF1 + 0.15);
    tl.to("#eap-l2", { xPercent: 0, duration: 0.45, ease: "power3.inOut" }, tF1 + 0.15);
    headSwap(head0, head1, tF1 + 0.15);
    // nível 2 → VEDAÇÕES
    tapAt(M.eapRow2.x + 40, M.eapRow2.y + M.eapRow2.h / 2, tF2, { cut: tF2 + 0.15 });
    tl.to(eap2[3], { backgroundColor: "#eaeffc", duration: 0.15 }, tF2);
    sfx("note", tF2, { n: 76, v: 0.9 });
    tl.to("#eap-l2", { xPercent: -100, duration: 0.45, ease: "power3.inOut" }, tF2 + 0.15);
    tl.to("#eap-l3", { xPercent: 0, duration: 0.45, ease: "power3.inOut" }, tF2 + 0.15);
    headSwap(head1, head2, tF2 + 0.15);
    // atividade → BLOCO CERÂMICO - TORRE; o dedo desliza até Concluir
    tapAt(M.eapRow3.x + 40, M.eapRow3.y + M.eapRow3.h / 2, tF3, { stay: true });
    tl.to(eap3[0], { backgroundColor: "#eaeffc", duration: 0.2 }, tF3);
    sfx("note", tF3, { n: 79, v: 0.9 });
    tl.to($(".concluir", head2), { backgroundColor: "#3364e0", color: "#ffffff", duration: 0.25 }, tF3 + 0.12);
    tapAt(M.eapOk.x + M.eapOk.w / 2, M.eapOk.y + M.eapOk.h / 2, tOk, { move: true, moveD: 0.3, light: true, cut: tOk + 0.15, punch: 1.02 });
    tl.to(eapSheet, { yPercent: 102, duration: 0.55, ease: "power3.inOut" }, tOk + 0.15);
    sfx("whoosh", tOk + 0.15, { dur: 0.55, f0: 1200, f1: 300, v: 0.28, pan0: 0, pan1: 0, peak: 0.4 });
    tl.to("#scrim", { opacity: 0, duration: 0.4 }, tOk + 0.2);
    const svcTxt = $("#svc-t").parentNode;
    const svcNew = document.createElement("div");
    svcNew.innerHTML = "<b>BLOCO CERÂMICO - TORRE</b><span>4004001 · Vedações</span>";
    svcTxt.after(svcNew);
    Object.assign(svcNew.style, { position: "absolute", left: svcTxt.offsetLeft + "px", top: svcTxt.offsetTop + "px" });
    gsap.set(svcNew, { opacity: 0 });
    tl.to(svcTxt, { opacity: 0, duration: 0.2 }, tOk + 0.5);
    tl.fromTo(svcNew, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, ease: "back.out(2)", immediateRender: false }, tOk + 0.6);
    tl.to("#b3 .ck", { opacity: 1, duration: 0.25 }, tOk + 0.6);
    tl.to("#b3", { backgroundColor: "#30d158", color: "#ffffff", duration: 0.25 }, tOk + 0.6);
    sfx("note", tOk + 0.6, { n: 84, v: 1.0 });
    stepDone(2, tOk + 0.6);
    camTo(focusOn(tileSvc, 30, 2.4), tOk + 0.15, 0.8, FOLLOW);

    /* ====================================================================
       4 — ENVIAR
       ==================================================================== */
    const t4 = T.s4;
    const c11 = caption({ kicker: "Enviar", title: "Envie agora|<em>ou junte no lote</em>" });
    capSwap(c10, c11, t4);
    stepOn(3, t4);
    const SEND_SHOT = focusOn({ x: 150, y: M.bbar.y - 120, w: 210, h: M.bbar.h + 120 }, 0, 2.7);
    stinger(SEND_SHOT, t4 - 0.05, { x: M.send.x + M.send.w / 2, y: M.send.y + M.send.h / 2 }, -1);
    spotTo({ x: M.lote.x, y: M.lote.y, w: M.send.x + M.send.w - M.lote.x, h: M.lote.h }, t4 + 0.8, { pad: 5, radius: 12 });
    callout("<b>Ao lote:</b> junta com outras<br><b>Enviar:</b> manda agora", M.send.x + M.send.w - 200, M.lote.y - 56, t4 + 0.6, 2.85, "", "100% 100%");
    spotOff(t4 + 3.5, 0.25);
    const tSend = T.send;
    drift(t4 + 0.9, tSend - t4 - 1.1, { x: M.send.x + M.send.w / 2, y: M.send.y + M.send.h / 2 }, 1.02);
    tapAt(M.send.x + M.send.w * 0.8, M.send.y + M.send.h / 2, tSend, { label: "Toque aqui", light: true, punch: 1.025 });
    tl.to("#send", { scale: 0.94, duration: 0.07, ease: "power2.in" }, tSend - 0.03);
    tl.to("#send", { scale: 1, duration: 0.3, ease: "back.out(2)" }, tSend + 0.05);
    camTo(OVER, tSend + 0.15, 0.85, FOLLOW);
    // o aviso de sucesso "cai" por cima do título do formulário (que some junto)
    tl.to(".f-title, .f-sub", { opacity: 0, duration: 0.25 }, tSend + 0.3);
    tl.fromTo("#toast", { opacity: 0, y: -40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.6)", immediateRender: false }, tSend + 0.3);
    tl.fromTo("#toast .ok", { scale: 0 }, { scale: 1, duration: 0.35, ease: "back.out(3)", immediateRender: false }, tSend + 0.45);
    tl.fromTo("#toast .ok svg path", { strokeDashoffset: 14 }, { strokeDashoffset: 0, duration: 0.25, ease: "power2.out", immediateRender: false }, tSend + 0.58);
    stepDone(3, tSend + 0.45);
    const c12 = caption({ kicker: "Pronto", kcls: "ok", title: "Requisição|<em>enviada</em>" });
    capSwap(c11, c12, tSend + K(1));
    sfx("note", tSend + K(1), { n: 79, v: 1.2 });
    sfx("note", tSend + K(1.25), { n: 84, v: 1.2 });

    /* ====================================================================
       5 — RESUMO (termina aqui, sem tela preta)
       ==================================================================== */
    const t5 = T.s5;
    const c13 = caption({ kicker: "Resumo", title: "Simples assim." });
    capSwap(c12, c13, t5);
    tl.to(cam, { y: "+=1500", duration: 0.7, ease: "power3.in" }, t5 + 0.05);
    const recap = $("#recap");
    const rcRows = $$(".rc-row", recap);
    gsap.set(rcRows, { opacity: 0, x: 60 });
    gsap.set($$(".rc-row > b", recap), { scale: 0 });
    tl.set(recap, { visibility: "visible", opacity: 1 }, t5 + 0.4);
    tl.fromTo(rcRows, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.5, ease: "back.out(1.2)", stagger: K(0.5), immediateRender: false }, t5 + 0.45);
    tl.fromTo($$(".rc-row > b", recap), { scale: 0 }, { scale: 1, duration: 0.35, ease: "back.out(2.5)", stagger: K(0.5), immediateRender: false }, t5 + 0.55);
    rcRows.forEach((r, i) => sfx("note", t5 + 0.55 + i * K(0.5), { n: [84, 88, 91, 96][i], v: 1.2 }));
    // marca-texto nas duas ênfases (filtro por tipo e líder pode apropriar)
    tl.to($$(".rc-row span em", recap), { backgroundSize: "100% 38%", duration: 0.4, ease: "power2.out", stagger: 0.3 }, t5 + 0.55 + 4 * K(0.5));
    const tFoot = T.foot;
    gsap.set(".rc-foot", { opacity: 0, y: 20 });
    tl.fromTo(".rc-foot", { opacity: 0, y: 20, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.6)", immediateRender: false }, tFoot);
    // o último quadro serve de lembrete
    tl.to(recap, { y: -10, duration: DURATION - (t5 + 2), ease: "sine.inOut" }, t5 + 2);

    // marcas para a trilha: brilhos nos dois momentos-chave e no envio
    MARKS.accents = [TH, tOpc, tSend + K(1.5)];
    MARKS.finalAt = tFoot;

    // depuração/leitura: nenhum valor derivado por frame neste vídeo
    void derived;
  }
})();
