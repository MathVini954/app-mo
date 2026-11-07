/* Configuração do motion ControlEng. Narração opcional em promo/audio/ (nunca simulada). */
window.SHOWREEL_CONFIG = {
  audio: {
    narration: { single: "audio/narracao.mp3", lines: [], volume: 1.0, duckMusicDb: -7 },
    music: { src: "audio/trilha.mp3", volume: 0.7 },
    synthMusic: true,
    sfx: true,
    inputGainDb: 6,
    softClipDb: -2.3,
    masterVolume: 0.9
  }
};
