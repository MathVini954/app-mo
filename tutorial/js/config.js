/* ==========================================================================
   CONFIGURAÇÃO DO TUTORIAL — NOVA REQUISIÇÃO
   Narração opcional: coloque os arquivos em tutorial/audio/ (veja o README).
   Sem arquivo, o vídeo roda com legendas e trilha — a voz nunca é simulada.
   ========================================================================== */

window.SHOWREEL_CONFIG = {
  audio: {
    narration: {
      single: "audio/narracao.mp3",
      lines: [],                     // preenchido por tutorial.js a partir do roteiro (cues exatos)
      volume: 1.0,
      duckMusicDb: -7
    },
    music: { src: "audio/trilha.mp3", volume: 0.7 },
    synthMusic: true,
    sfx: true,
    inputGainDb: 7,                  // ganho antes do compressor/limitador (≈ −16 LUFS, padrão de vídeo social)
    masterVolume: 0.9
  }
};
