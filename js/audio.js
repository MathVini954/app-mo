/* ==========================================================================
   AUDIO ENGINE — trilha e sound design sintetizados com Web Audio API
   --------------------------------------------------------------------------
   - Tudo é agendado em tempo absoluto do AudioContext, a partir de uma lista
     de "cues" gerada pela própria timeline (mesma fonte de verdade = sincronia).
   - Funciona tanto em AudioContext (tempo real) quanto em OfflineAudioContext
     (exportação para vídeo), com ruído e reverb determinísticos (seeded).
   - Narração e trilha externas (mp3) são opcionais. Se o arquivo não existir,
     NADA é simulado: o status fica visível na tela inicial.
   ========================================================================== */

window.ShowreelAudio = (function () {
  "use strict";

  /* ---------- utilidades ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  function dbToGain(db) { return Math.pow(10, db / 20); }

  function makeNoise(ctx, seconds, seed) {
    var rnd = mulberry32(seed);
    var len = Math.floor(ctx.sampleRate * seconds);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = rnd() * 2 - 1;
    return buf;
  }

  function makeImpulse(ctx, seconds, decay, seed) {
    var rnd = mulberry32(seed);
    var len = Math.floor(ctx.sampleRate * seconds);
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c);
      for (var i = 0; i < len; i++) {
        var t = i / len;
        // pré-delay curto + decaimento exponencial + leve absorção de agudos
        var env = i < ctx.sampleRate * 0.012 ? 0 : Math.pow(1 - t, decay);
        d[i] = (rnd() * 2 - 1) * env;
      }
    }
    return buf;
  }

  /* ---------- engine ---------- */
  function Engine(ctx, opts) {
    this.ctx = ctx;
    this.opts = opts || {};
    this.rnd = mulberry32(20260);
    this.noise = makeNoise(ctx, 2.5, 7);

    // cadeia master: buses → compressor → limiter → master → saída
    this.out = ctx.createGain();
    this.out.gain.value = this.opts.masterVolume == null ? 0.9 : this.opts.masterVolume;

    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -16;
    this.comp.knee.value = 10;
    this.comp.ratio.value = 3;
    this.comp.attack.value = 0.008;
    this.comp.release.value = 0.22;

    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -2.5;
    this.limiter.knee.value = 0;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.002;
    this.limiter.release.value = 0.09;

    this.comp.connect(this.limiter);
    this.limiter.connect(this.out);
    this.out.connect(this.opts.destination || ctx.destination);

    // reverb
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = makeImpulse(ctx, 2.6, 3.2, 99);
    this.revOut = ctx.createGain();
    this.revOut.gain.value = 0.55;
    this.reverb.connect(this.revOut);
    this.revOut.connect(this.comp);

    // música: drums + synths → filtro (fechamento no final) → duck (narração)
    this.music = ctx.createGain();
    this.musicLP = ctx.createBiquadFilter();
    this.musicLP.type = "lowpass";
    this.musicLP.frequency.value = 18000;
    this.musicLP.Q.value = 0.5;
    this.duck = ctx.createGain();
    this.music.connect(this.musicLP);
    this.musicLP.connect(this.duck);
    this.duck.connect(this.comp);

    this.drums = ctx.createGain();
    this.drums.gain.value = 0.9;
    this.drums.connect(this.music);

    this.synth = ctx.createGain();
    this.synth.gain.value = 0.9;
    this.synth.connect(this.music);

    this.sfx = ctx.createGain();
    this.sfx.gain.value = 0.95;
    this.sfx.connect(this.comp);

    this.voice = ctx.createGain();
    this.voice.gain.value = 1;
    this.voice.connect(this.comp);
    this.voiceSend = ctx.createGain();
    this.voiceSend.gain.value = 0.08;
    this.voice.connect(this.voiceSend);
    this.voiceSend.connect(this.reverb);
  }

  var E = Engine.prototype;

  E.send = function (node, amount) {
    if (!amount) return;
    var g = this.ctx.createGain();
    g.gain.value = amount;
    node.connect(g);
    g.connect(this.reverb);
  };

  E.env = function (param, t, a, peak, d, sustain, r, end) {
    param.setValueAtTime(0.0001, t);
    param.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    if (sustain != null) {
      param.exponentialRampToValueAtTime(Math.max(sustain, 0.0002), t + a + d);
      param.setValueAtTime(Math.max(sustain, 0.0002), end);
      param.exponentialRampToValueAtTime(0.0001, end + r);
    } else {
      param.exponentialRampToValueAtTime(0.0001, t + a + d);
    }
  };

  E.noiseSrc = function (t, dur) {
    var s = this.ctx.createBufferSource();
    s.buffer = this.noise;
    var off = this.rnd() * (this.noise.duration - dur - 0.05);
    s.start(t, Math.max(0, off), dur + 0.02);
    return s;
  };

  E.filter = function (type, freq, q) {
    var f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    if (q != null) f.Q.value = q;
    return f;
  };

  E.pan = function (value) {
    if (!this.ctx.createStereoPanner) return this.ctx.createGain();
    var p = this.ctx.createStereoPanner();
    p.pan.value = value || 0;
    return p;
  };

  /* ---------- DRUMS ---------- */
  E.kick = function (t, vel) {
    vel = vel == null ? 1 : vel;
    var c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(155, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 0.1);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.4);
    this.env(g.gain, t, 0.003, 0.95 * vel, 0.42);
    o.connect(g); g.connect(this.drums);
    o.start(t); o.stop(t + 0.5);
    // transiente
    var n = this.noiseSrc(t, 0.02), hp = this.filter("highpass", 2200), ng = c.createGain();
    this.env(ng.gain, t, 0.001, 0.16 * vel, 0.018);
    n.connect(hp); hp.connect(ng); ng.connect(this.drums);
  };

  E.hat = function (t, vel, open) {
    var c = this.ctx, n = this.noiseSrc(t, open ? 0.3 : 0.06);
    var hp = this.filter("highpass", 7600), bp = this.filter("bandpass", 10500, 0.7), g = c.createGain();
    this.env(g.gain, t, 0.001, (open ? 0.12 : 0.1) * vel, open ? 0.24 : 0.038);
    var p = this.pan(open ? 0.18 : -0.12);
    n.connect(hp); hp.connect(bp); bp.connect(g); g.connect(p); p.connect(this.drums);
  };

  E.clap = function (t, vel) {
    var c = this.ctx;
    for (var i = 0; i < 3; i++) {
      var tt = t + i * 0.011;
      var n = this.noiseSrc(tt, 0.2), bp = this.filter("bandpass", 1250, 0.9), g = c.createGain();
      this.env(g.gain, tt, 0.001, 0.32 * vel, i === 2 ? 0.17 : 0.02);
      n.connect(bp); bp.connect(g); g.connect(this.drums);
      if (i === 2) this.send(g, 0.35);
    }
  };

  E.rim = function (t, vel) {
    var c = this.ctx, o = c.createOscillator(), g = c.createGain(), bp = this.filter("bandpass", 1700, 4);
    o.type = "triangle";
    o.frequency.setValueAtTime(1700, t);
    this.env(g.gain, t, 0.001, 0.16 * vel, 0.035);
    o.connect(bp); bp.connect(g); g.connect(this.drums);
    o.start(t); o.stop(t + 0.06);
  };

  /* ---------- SYNTHS ---------- */
  E.bass = function (t, note, dur, vel) {
    var c = this.ctx, f = midi(note);
    var o1 = c.createOscillator(), o2 = c.createOscillator(), lp = this.filter("lowpass", 800, 5), g = c.createGain();
    o1.type = "sawtooth"; o1.frequency.value = f;
    o2.type = "sine"; o2.frequency.value = f / 2;
    lp.frequency.setValueAtTime(950 * vel, t);
    lp.frequency.exponentialRampToValueAtTime(170, t + dur * 0.9);
    this.env(g.gain, t, 0.006, 0.26 * vel, dur * 0.5, 0.13 * vel, 0.05, t + dur * 0.85);
    var og2 = c.createGain(); og2.gain.value = 0.9;
    o1.connect(lp); o2.connect(og2); og2.connect(g); lp.connect(g); g.connect(this.synth);
    o1.start(t); o2.start(t); o1.stop(t + dur + 0.1); o2.stop(t + dur + 0.1);
  };

  E.pad = function (t, notes, dur, level, cutoff) {
    var c = this.ctx, g = c.createGain(), lp = this.filter("lowpass", cutoff || 1100, 0.6);
    var atk = Math.min(0.6, dur * 0.3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + atk);
    g.gain.setValueAtTime(level, t + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.9);
    lp.connect(g); g.connect(this.synth); this.send(g, 0.5);
    for (var i = 0; i < notes.length; i++) {
      for (var d = -1; d <= 1; d += 2) {
        var o = c.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = midi(notes[i]);
        o.detune.value = d * 7;
        var og = c.createGain(); og.gain.value = 0.5 / notes.length;
        o.connect(og); og.connect(lp);
        o.start(t); o.stop(t + dur + 1);
      }
    }
  };

  E.stab = function (t, notes, level, bright) {
    var c = this.ctx, g = c.createGain(), lp = this.filter("lowpass", bright || 2400, 1);
    lp.frequency.setValueAtTime(bright || 2400, t);
    lp.frequency.exponentialRampToValueAtTime(500, t + 0.35);
    this.env(g.gain, t, 0.004, level, 0.42);
    lp.connect(g); g.connect(this.synth); this.send(g, 0.4);
    for (var i = 0; i < notes.length; i++) {
      var o = c.createOscillator();
      o.type = i % 2 ? "triangle" : "sawtooth";
      o.frequency.value = midi(notes[i]);
      var og = c.createGain(); og.gain.value = 1 / notes.length;
      o.connect(og); og.connect(lp);
      o.start(t); o.stop(t + 0.5);
    }
  };

  E.pluck = function (t, note, level, pan) {
    var c = this.ctx, o = c.createOscillator(), g = c.createGain(), lp = this.filter("lowpass", 3200, 2);
    o.type = "triangle";
    o.frequency.value = midi(note);
    lp.frequency.setValueAtTime(3600, t);
    lp.frequency.exponentialRampToValueAtTime(700, t + 0.18);
    this.env(g.gain, t, 0.002, level, 0.22);
    var p = this.pan(pan || 0);
    o.connect(lp); lp.connect(g); g.connect(p); p.connect(this.synth); this.send(g, 0.45);
    o.start(t); o.stop(t + 0.3);
  };

  /* ---------- SFX ---------- */
  E.key = function (t, o) {
    var c = this.ctx, v = (o && o.v) || 1, space = o && o.space;
    // clique (switch)
    var n = this.noiseSrc(t, 0.012), bp = this.filter("bandpass", 3600 + this.rnd() * 2400, 1.4), g = c.createGain();
    this.env(g.gain, t, 0.0008, 0.42 * v, 0.011);
    var p = this.pan((this.rnd() - 0.5) * 0.5);
    n.connect(bp); bp.connect(g); g.connect(p); p.connect(this.sfx);
    // "thock" (fundo da tecla)
    var tt = t + 0.006, osc = c.createOscillator(), og = c.createGain();
    osc.type = "triangle";
    var f0 = space ? 150 : 230 + this.rnd() * 70;
    osc.frequency.setValueAtTime(f0, tt);
    osc.frequency.exponentialRampToValueAtTime(f0 * 0.55, tt + 0.04);
    this.env(og.gain, tt, 0.001, (space ? 0.34 : 0.26) * v, space ? 0.07 : 0.045);
    osc.connect(og); og.connect(p);
    osc.start(tt); osc.stop(tt + 0.1);
    this.send(g, 0.06);
  };

  E.click = function (t, o) {
    var c = this.ctx, v = (o && o.v) || 1;
    var osc = c.createOscillator(), g = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(2300, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.03);
    this.env(g.gain, t, 0.001, 0.17 * v, 0.045);
    osc.connect(g); g.connect(this.sfx);
    osc.start(t); osc.stop(t + 0.06);
    var n = this.noiseSrc(t, 0.006), hp = this.filter("highpass", 4200), ng = c.createGain();
    this.env(ng.gain, t, 0.0005, 0.14 * v, 0.005);
    n.connect(hp); hp.connect(ng); ng.connect(this.sfx);
    this.send(g, 0.12);
  };

  E.blip = function (t, o) {
    var c = this.ctx, f = (o && o.f) || 1600, len = (o && o.len) || 0.035, v = (o && o.v) || 1;
    var osc = c.createOscillator(), g = c.createGain(), lp = this.filter("lowpass", 3800, 1);
    osc.type = "square";
    osc.frequency.setValueAtTime(f, t);
    this.env(g.gain, t, 0.001, 0.045 * v, len);
    var p = this.pan(o && o.pan != null ? o.pan : (this.rnd() - 0.5) * 0.7);
    osc.connect(lp); lp.connect(g); g.connect(p); p.connect(this.sfx);
    osc.start(t); osc.stop(t + len + 0.02);
  };

  E.glitch = function (t, o) {
    var n = (o && o.n) || 10, step = (o && o.step) || 0.022;
    for (var i = 0; i < n; i++) {
      this.blip(t + i * step, { f: 500 + this.rnd() * 2400, len: 0.016 + this.rnd() * 0.012, v: 0.7 });
    }
  };

  E.tick = function (t, o) {
    var c = this.ctx, osc = c.createOscillator(), g = c.createGain();
    osc.type = "sine";
    osc.frequency.value = (o && o.f) || 3200;
    this.env(g.gain, t, 0.0005, 0.07 * ((o && o.v) || 1), 0.012);
    osc.connect(g); g.connect(this.sfx);
    osc.start(t); osc.stop(t + 0.03);
  };

  E.whoosh = function (t, o) {
    o = o || {};
    var c = this.ctx, dur = o.dur || 0.45;
    var n = this.noiseSrc(t, dur + 0.05), bp = this.filter("bandpass", o.f0 || 400, o.q || 1.1), g = c.createGain();
    bp.frequency.setValueAtTime(o.f0 || 400, t);
    bp.frequency.exponentialRampToValueAtTime(o.f1 || 3200, t + dur * 0.7);
    bp.frequency.exponentialRampToValueAtTime((o.f1 || 3200) * 0.6, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime((o.v || 1) * 0.3, t + dur * (o.peak || 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var p = this.pan(o.pan0 || 0);
    if (p.pan) {
      p.pan.setValueAtTime(o.pan0 || 0, t);
      p.pan.linearRampToValueAtTime(o.pan1 || 0, t + dur);
    }
    n.connect(bp); bp.connect(g); g.connect(p); p.connect(this.sfx);
    this.send(g, o.rev == null ? 0.25 : o.rev);
  };

  E.riser = function (t, o) {
    var c = this.ctx, dur = (o && o.dur) || 0.8, v = (o && o.v) || 1;
    var n = this.noiseSrc(t, dur), hp = this.filter("bandpass", 400, 2.2), g = c.createGain();
    hp.frequency.setValueAtTime(350, t);
    hp.frequency.exponentialRampToValueAtTime(7000, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22 * v, t + dur * 0.97);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.02);
    n.connect(hp); hp.connect(g); g.connect(this.sfx);
    this.send(g, 0.3);
    var osc = c.createOscillator(), og = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + dur);
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.05 * v, t + dur * 0.95);
    og.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.02);
    osc.connect(og); og.connect(this.sfx);
    osc.start(t); osc.stop(t + dur + 0.05);
  };

  E.impact = function (t, o) {
    o = o || {};
    var c = this.ctx, size = o.size || 1, v = o.v || 1;
    // sub boom
    var osc = c.createOscillator(), g = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime((o.f || 95), t);
    osc.frequency.exponentialRampToValueAtTime(34, t + 0.5 * size);
    this.env(g.gain, t, 0.004, 0.9 * v, 0.9 * size);
    osc.connect(g); g.connect(this.sfx);
    osc.start(t); osc.stop(t + size + 0.2);
    // corpo / ar
    var n = this.noiseSrc(t, 0.5), lp = this.filter("lowpass", o.bright || 1600, 0.7), ng = c.createGain();
    lp.frequency.setValueAtTime(o.bright || 1600, t);
    lp.frequency.exponentialRampToValueAtTime(180, t + 0.4);
    this.env(ng.gain, t, 0.002, 0.3 * v, 0.38 * size);
    n.connect(lp); lp.connect(ng); ng.connect(this.sfx);
    this.send(ng, o.rev == null ? 0.7 : o.rev);
    this.send(g, 0.12);
  };

  E.crash = function (t, o) {
    var c = this.ctx, v = (o && o.v) || 1;
    var n = this.noiseSrc(t, 1.6), hp = this.filter("highpass", 5200), g = c.createGain();
    this.env(g.gain, t, 0.002, 0.13 * v, 1.4);
    n.connect(hp); hp.connect(g); g.connect(this.drums);
    this.send(g, 0.45);
  };

  E.zip = function (t, o) {
    var c = this.ctx, dur = (o && o.dur) || 0.28;
    var n = this.noiseSrc(t, dur), bp = this.filter("bandpass", 5000, 3), g = c.createGain();
    bp.frequency.setValueAtTime(5200, t);
    bp.frequency.exponentialRampToValueAtTime(260, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.26, t + dur * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(bp); bp.connect(g); g.connect(this.sfx);
    this.send(g, 0.3);
  };

  E.room = function (t, dur) {
    var c = this.ctx, lp = this.filter("lowpass", 420, 0.5), g = c.createGain();
    var n = c.createBufferSource();
    n.buffer = this.noise;
    n.loop = true;
    n.start(t);
    n.stop(t + dur + 0.05);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.012, t + 0.4);
    g.gain.setValueAtTime(0.012, t + dur - 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(lp); lp.connect(g); g.connect(this.sfx);
  };

  /* ---------- TRILHA (123 BPM, ancorada no "drop") ---------- */
  E.scheduleMusic = function (t0, m) {
    // m.beat = duração da batida; m.anchor = drop (s); demais campos em batidas relativas ao drop
    var beat = m.beat, b = function (k) { return t0 + m.anchor + k * beat; };
    var self = this;
    var Am9 = [45, 52, 55, 59, 60], Fmaj7 = [41, 48, 52, 57], Cmaj7 = [48, 52, 55, 59], G6 = [43, 50, 52, 59];
    var Am9hi = [57, 60, 64, 67, 71];
    var G0 = m.grooveFrom, BRK = m.breakFrom, WRD = m.wordsFrom, OUT = m.outroAt, FIN = m.finalAt;

    // harmonia: um acorde por compasso (4 batidas), trocando junto com as palavras
    var chordAt = function (k) {
      if (k < -20) return { pad: Am9, bass: 33 };
      if (k < -16) return { pad: Fmaj7, bass: 29 };
      if (k < -12) return { pad: G6, bass: 31 };
      if (k < -8) return { pad: Fmaj7, bass: 29 };   // SITES
      if (k < -4) return { pad: Cmaj7, bass: 36 };   // LANDING PAGES
      if (k < 0) return { pad: G6, bass: 31 };       // SISTEMAS
      if (k < 4) return { pad: Am9, bass: 33 };      // drop
      if (k < 8) return { pad: Fmaj7, bass: 29 };
      return { pad: G6, bass: 31 };
    };

    // pads (entrada suave com a interface; ficam mais abertos no pico)
    var introStart = t0 + m.intro;
    this.pad(introStart, Am9, b(-20) - introStart, 0.075, 950);
    [[-20, Fmaj7, 1000], [-16, G6, 1000], [-12, Fmaj7, 1150], [-8, Cmaj7, 1250], [-4, G6, 1350],
     [0, Am9, 1900], [4, Fmaj7, 2000], [8, G6, 1800]].forEach(function (p) {
      var len = p[0] === 8 ? beat : beat * 4;
      self.pad(b(p[0]), p[1], len, p[0] >= 0 ? 0.058 : 0.05, p[2]);
    });
    this.pad(b(OUT), Am9, b(FIN) - b(OUT), 0.05, 1100);
    this.pad(b(FIN), Am9hi, 1.8, 0.065, 1500);

    // hats suaves na introdução
    for (var k = G0 - 6; k < G0; k += 0.5) if (b(k) > introStart + 0.4) this.hat(b(k), 0.28, false);

    for (k = G0; k < OUT; k++) {
      var t = b(k);
      var pre = k === -1;                       // respiro antes do drop
      var brk = k >= BRK && k < WRD;            // breakdown: smartphone gira
      var peak = k >= 0;
      var words = k >= WRD && k < 0;
      var ch = chordAt(k);

      if (!pre && !brk) this.kick(t, peak ? 1 : words ? 0.62 : 0.5);
      if (words && k % 2 !== 0 && !pre) this.clap(t, 0.45);
      if (peak && k % 2 !== 0) this.clap(t, 0.9);
      if (!peak && !words && k % 2 !== 0 && !brk) this.rim(t, 0.6);

      var subdiv = peak ? 4 : 2;
      for (var s = 0; s < subdiv; s++) {
        if (pre && s > 0) continue;
        if (s === 0 && peak) continue;
        var ht = t + (s * beat) / subdiv;
        this.hat(ht, peak ? (s === 2 ? 0.85 : 0.5) : (s === 1 ? (brk ? 0.4 : 0.55) : 0.25), peak && s === 2);
      }

      if (!pre && !brk) {
        this.bass(t + beat * 0.5, ch.bass, beat * 0.42, peak ? 0.95 : words ? 0.72 : 0.62);
        if (peak) this.bass(t, ch.bass, beat * 0.4, 0.65);
      }
    }

    // arpejo discreto no pico
    var arp = [69, 72, 76, 79, 76, 72];
    for (k = 0; k < OUT - 1; k++) {
      for (s = 0; s < 4; s++) {
        var idx = (k * 4 + s) % arp.length;
        var shift = k >= 4 ? -4 : 0;
        self.pluck(b(k) + (s * beat) / 4, arp[idx] + shift, 0.04, s % 2 ? 0.3 : -0.3);
      }
    }

    // stabs nas palavras e no drop
    this.stab(b(-12), [53, 57, 60, 64], 0.09);
    this.stab(b(-8), [48, 52, 55, 59], 0.09);
    this.stab(b(-4), [50, 55, 59, 62], 0.09);
    this.stab(b(0), [57, 60, 64, 67], 0.11, 2800);
    this.crash(b(0), { v: 0.8 });

    // desaceleração: o filtro fecha, o pulso fica espaçado e a trilha respira
    this.musicLP.frequency.setValueAtTime(18000, b(OUT - 0.1));
    this.musicLP.frequency.exponentialRampToValueAtTime(650, b(OUT + 1.6));
    this.musicLP.frequency.setValueAtTime(650, b(FIN - 0.15));
    this.musicLP.frequency.exponentialRampToValueAtTime(2400, b(FIN + 0.1));
    this.kick(b(OUT + 2), 0.35);
    this.pluck(b(OUT + 2), 64, 0.05, -0.2);
    this.pluck(b(OUT + 2.5), 67, 0.045, 0.2);
    this.pluck(b(OUT + 3), 71, 0.045, 0);
    this.kick(b(OUT + 4), 0.25);
  };

  /* ---------- TRILHA CALMA (tutoriais): pads, arpejo suave, percussão leve ---------- */
  E.scheduleCalmMusic = function (t0, m) {
    var self = this;
    var beat = 60 / (m.bpm || 96), bar = beat * 4;
    var start = t0 + (m.start || 0), end = t0 + m.end;
    var groove = t0 + (m.groove != null ? m.groove : m.start || 0);
    var prog = [
      { pad: [48, 55, 59, 62, 64], bass: 36 },   // Cmaj9
      { pad: [45, 52, 55, 59, 60], bass: 33 },   // Am9
      { pad: [41, 48, 52, 55, 57], bass: 29 },   // Fmaj9
      { pad: [43, 50, 55, 57, 59], bass: 31 }    // G6sus
    ];
    var quiet = function (t) {
      return (m.quiet || []).some(function (q) { return t >= t0 + q[0] && t < t0 + q[1]; });
    };
    var i = 0;
    for (var t = start; t < end - 0.05; t += bar * 2, i++) {
      var ch = prog[i % prog.length];
      var len = Math.min(bar * 2, end - t);
      this.pad(t, ch.pad, len, 0.06, 1300);
      // baixo macio no tempo 1 de cada compasso
      for (var b = 0; b < 2; b++) {
        var tb = t + b * bar;
        if (tb >= groove && tb < end - bar * 0.5 && !quiet(tb)) this.bass(tb, ch.bass, beat * 1.6, 0.42);
      }
      // arpejo em colcheias com notas do acorde
      for (var k = 0; k < 16; k++) {
        var tk = t + k * beat * 0.5;
        if (tk < groove || tk >= end - 0.2) continue;
        var note = ch.pad[(k * 2 + (k >> 2)) % ch.pad.length] + 12;
        this.pluck(tk, note, quiet(tk) ? 0.016 : 0.03, k % 2 ? 0.25 : -0.25);
      }
    }
    // percussão leve: kick nos tempos 1 e 3, rim no 2 e 4, chimbal nos contratempos
    var percEnd = end - (m.outro || bar);
    for (var tp = groove; tp < percEnd; tp += beat) {
      if (quiet(tp)) continue;
      var n = Math.round((tp - groove) / beat) % 4;
      if (n === 0 || n === 2) this.kick(tp, 0.32);
      if (n === 1 || n === 3) this.rim(tp, 0.35);
      this.hat(tp + beat / 2, 0.22, false);
    }
    // acorde final, aberto e longo
    this.pad(end - 0.1, [60, 64, 67, 71, 74], 2.2, 0.07, 1700);
    // "chimes" nos momentos-chave
    (m.accents || []).forEach(function (a) {
      var ta = t0 + a;
      [76, 79, 83].forEach(function (nn, j) { self.pluck(ta + j * 0.07, nn, 0.05, j === 1 ? 0 : (j ? 0.35 : -0.35)); });
    });
  };

  /* ---------- agendamento completo ---------- */
  E.schedule = function (t0, plan, media) {
    var ctx = this.ctx, self = this;
    media = media || {};

    if (plan.sfxOn !== false) {
      if (!plan.music || plan.music.style !== "calm") this.room(t0, plan.music && plan.music.intro ? plan.music.intro + 0.4 : 2.1);
      plan.cues.forEach(function (c) {
        var fn = self[c.type];
        if (typeof fn === "function") fn.call(self, t0 + c.t, c);
      });
    }

    var externalMusic = media.music && media.music.buffer;
    if (externalMusic) {
      var ms = ctx.createBufferSource(), mg = ctx.createGain();
      ms.buffer = media.music.buffer;
      mg.gain.value = media.music.volume == null ? 0.8 : media.music.volume;
      ms.connect(mg); mg.connect(this.music);
      ms.start(t0);
    } else if (plan.synthMusic !== false) {
      if (plan.music && plan.music.style === "calm") this.scheduleCalmMusic(t0, plan.music);
      else this.scheduleMusic(t0, plan.music);
    }

    // narração (buffers decodificados = sincronia exata)
    var segments = [];
    if (media.narration) {
      media.narration.forEach(function (n) {
        if (!n.buffer) return;
        var s = ctx.createBufferSource(), g = ctx.createGain();
        s.buffer = n.buffer;
        g.gain.value = n.volume == null ? 1 : n.volume;
        s.connect(g); g.connect(self.voice);
        s.start(t0 + n.cue);
        segments = segments.concat(n.segments || [{ start: n.cue, end: n.cue + n.buffer.duration }]);
      });
      // reverb curto mais presente na última frase
      if (plan.lastLineAt != null) {
        this.voiceSend.gain.setValueAtTime(0.08, t0 + plan.lastLineAt - 0.1);
        this.voiceSend.gain.linearRampToValueAtTime(0.24, t0 + plan.lastLineAt + 0.6);
      }
    }
    // abaixa a trilha enquanto a voz fala (inclusive narração via <audio>)
    if (media.duckSegments) segments = segments.concat(media.duckSegments);
    var duck = dbToGain(plan.duckDb == null ? -5 : plan.duckDb);
    segments.forEach(function (sg) {
      self.duck.gain.setTargetAtTime(duck, t0 + sg.start - 0.06, 0.04);
      self.duck.gain.setTargetAtTime(1, t0 + sg.end + 0.05, 0.12);
    });

    // fade final suave
    var endT = t0 + plan.duration;
    var vol = this.out.gain.value;
    this.out.gain.setValueAtTime(vol, endT - 0.6);
    this.out.gain.exponentialRampToValueAtTime(0.0001, endT);
  };

  /* ---------- carregamento de mídia externa ---------- */
  function fetchBuffer(url) {
    // file:// não suporta fetch: vai direto para o <audio>
    if (window.location.protocol === "file:") return Promise.resolve({ status: "nofetch" });
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) return { status: "missing" };
      return r.arrayBuffer().then(function (ab) { return { status: "ok", data: ab }; });
    }, function () {
      return { status: "nofetch" }; // file:// — tenta via <audio>
    });
  }

  function probeElement(url) {
    return new Promise(function (resolve) {
      var a = new Audio();
      var done = false;
      var finish = function (ok) {
        if (done) return;
        done = true;
        resolve(ok ? a : null);
      };
      a.preload = "auto";
      a.addEventListener("canplaythrough", function () { finish(true); }, { once: true });
      a.addEventListener("loadedmetadata", function () { finish(true); }, { once: true });
      a.addEventListener("error", function () { finish(false); }, { once: true });
      setTimeout(function () { finish(false); }, 4000);
      a.src = url;
    });
  }

  function loadOne(ctx, url) {
    return fetchBuffer(url).then(function (res) {
      if (res.status === "ok") {
        return new Promise(function (resolve) {
          ctx.decodeAudioData(res.data.slice(0), function (buf) {
            resolve({ kind: "buffer", buffer: buf, raw: res.data });
          }, function () { resolve(null); });
        });
      }
      if (res.status === "nofetch") {
        return probeElement(url).then(function (el) { return el ? { kind: "element", el: el } : null; });
      }
      return null;
    });
  }

  function loadMedia(ctx, cfg) {
    var a = cfg.audio || {};
    var n = a.narration || {};
    var media = { narration: null, narrationMode: null, music: null, elements: [] };

    var single = n.single ? loadOne(ctx, n.single) : Promise.resolve(null);
    return single.then(function (s) {
      if (s) {
        media.narrationMode = "single";
        media.narration = [Object.assign({ cue: 0, volume: n.volume, src: n.single }, s)];
        // segmentos aproximados de fala (para ducking) a partir dos cues configurados
        media.narration[0].segments = (n.lines || []).map(function (l) { return { start: l.cue, end: l.cue + 2.2 }; });
        return;
      }
      return Promise.all((n.lines || []).map(function (l) {
        return loadOne(ctx, l.src).then(function (r) { return r ? Object.assign({ cue: l.cue, volume: n.volume, src: l.src }, r) : null; });
      })).then(function (list) {
        list = list.filter(Boolean);
        if (list.length) { media.narrationMode = "lines"; media.narration = list; }
      });
    }).then(function () {
      if (!a.music || !a.music.src) return;
      return loadOne(ctx, a.music.src).then(function (m) {
        if (m) media.music = Object.assign({ volume: a.music.volume, src: a.music.src }, m);
      });
    }).then(function () { return media; });
  }

  /* ---------- WAV ---------- */
  function toWav(buffer) {
    var ch = buffer.numberOfChannels, sr = buffer.sampleRate, len = buffer.length;
    var data = new DataView(new ArrayBuffer(44 + len * ch * 2));
    var w = function (o, s) { for (var i = 0; i < s.length; i++) data.setUint8(o + i, s.charCodeAt(i)); };
    w(0, "RIFF"); data.setUint32(4, 36 + len * ch * 2, true); w(8, "WAVE");
    w(12, "fmt "); data.setUint32(16, 16, true); data.setUint16(20, 1, true); data.setUint16(22, ch, true);
    data.setUint32(24, sr, true); data.setUint32(28, sr * ch * 2, true); data.setUint16(32, ch * 2, true); data.setUint16(34, 16, true);
    w(36, "data"); data.setUint32(40, len * ch * 2, true);
    var chans = []; for (var c = 0; c < ch; c++) chans.push(buffer.getChannelData(c));
    var off = 44;
    for (var i = 0; i < len; i++) {
      for (c = 0; c < ch; c++) {
        var v = Math.max(-1, Math.min(1, chans[c][i]));
        data.setInt16(off, v < 0 ? v * 0x8000 : v * 0x7fff, true);
        off += 2;
      }
    }
    return data.buffer;
  }

  function arrayBufferToBase64(ab) {
    var bytes = new Uint8Array(ab), chunk = 0x8000, parts = [];
    for (var i = 0; i < bytes.length; i += chunk) parts.push(String.fromCharCode.apply(null, bytes.subarray(i, i + chunk)));
    return btoa(parts.join(""));
  }

  /* ---------- render offline (exportação) ---------- */
  function renderOffline(plan, cfg, sampleRate) {
    sampleRate = sampleRate || 48000;
    var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    var ctx = new OAC(2, Math.ceil(plan.duration * sampleRate), sampleRate);
    return loadMedia(ctx, cfg).then(function (media) {
      var eng = new Engine(ctx, { masterVolume: (cfg.audio && cfg.audio.masterVolume) || 0.9 });
      eng.schedule(0, plan, media);
      return ctx.startRendering().then(function (buf) {
        return {
          wavBase64: arrayBufferToBase64(toWav(buf)),
          narration: media.narrationMode,
          music: media.music ? "external" : (plan.synthMusic !== false ? "synth" : "none")
        };
      });
    });
  }

  return {
    Engine: Engine,
    loadMedia: loadMedia,
    renderOffline: renderOffline,
    dbToGain: dbToGain
  };
})();
