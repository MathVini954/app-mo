/* ==========================================================================
   CONFIGURAÇÃO DO SHOWREEL
   Edite apenas este arquivo para personalizar marca, contato, áudio e projetos.
   Também é possível sobrescrever via URL:  index.html?brand=Seu%20Nome&ig=@seuperfil
   ========================================================================== */

window.SHOWREEL_CONFIG = {
  /* Assinatura final */
  brand: "SEU NOME",                         // [SEU NOME OU MARCA]
  instagram: "@seu_instagram",               // @[SEU_INSTAGRAM]
  subtitle: "DESENVOLVIMENTO WEB & EXPERIÊNCIAS DIGITAIS",
  ctaLabel: "VAMOS CONVERSAR",
  year: "2026",

  /* ÁUDIO
     - narration.single: um único arquivo com a narração completa, alinhado ao t = 0.
     - narration.lines: alternativa — um arquivo por frase, cada um tocado no seu "cue" (segundos).
       Usado apenas se o arquivo único não existir. Arquivos ausentes são simplesmente ignorados:
       o showreel NUNCA simula narração.
     - music: trilha externa opcional. Se existir, substitui a trilha sintetizada
       (os efeitos sonoros sintetizados continuam).
     - sfx: true = efeitos e trilha sintetizados em tempo real com Web Audio API. */
  audio: {
    narration: {
      single: "assets/audio/narracao.mp3",
      lines: [
        { src: "assets/audio/narracao-01.mp3", cue: 0.35, text: "Tudo começa com uma ideia." },
        { src: "assets/audio/narracao-02.mp3", cue: 2.30, text: "Transformada em experiência." },
        { src: "assets/audio/narracao-03.mp3", cue: 4.45, text: "Feita para cada tela." },
        { src: "assets/audio/narracao-04.mp3", cue: 6.20, text: "Sites, páginas e sistemas." },
        { src: "assets/audio/narracao-05.mp3", cue: 9.65, text: "Sua empresa merece presença." },
        { src: "assets/audio/narracao-06.mp3", cue: 12.75, text: "Vamos criar algo incrível?" }
      ],
      volume: 1.0,
      duckMusicDb: -5                        // abaixa a trilha enquanto a voz fala
    },
    music: { src: "assets/audio/trilha.mp3", volume: 0.8 },
    synthMusic: true,
    sfx: true,
    masterVolume: 0.9
  },

  /* PROJETOS REAIS (opcional)
     Coloque screenshots em assets/projects/ (recomendado 1600×900 px ou maior, mesma proporção 16:9)
     e informe o caminho abaixo. Quando definido, o screenshot substitui o mockup demonstrativo. */
  projects: {
    browser:  { screenshot: null, url: "suaempresa.com.br" },
    sites:    { screenshot: null, url: "institucional.demo", label: "SITES" },
    landing:  { screenshot: null, url: "lancamento.demo",   label: "LANDING PAGES" },
    systems:  { screenshot: null, url: "app.demo/painel",   label: "SISTEMAS" }
  }
};

(function applyUrlOverrides(cfg) {
  try {
    var p = new URLSearchParams(window.location.search);
    if (p.get("brand")) cfg.brand = p.get("brand");
    if (p.get("ig")) cfg.instagram = p.get("ig");
    if (p.get("subtitle")) cfg.subtitle = p.get("subtitle");
    if (p.get("cta")) cfg.ctaLabel = p.get("cta");
  } catch (e) { /* URLSearchParams indisponível: mantém padrões */ }
})(window.SHOWREEL_CONFIG);
