/**
 * COSMIC POP 3D — High-Performance 3D WebGL Spatial Puzzle-Shooter Engine
 * Optimized for 60 FPS on Low-End Android Devices + Full Offline Persistence:
 * - Multi-Tier Graphics Quality (Low [Default], Medium, High, Ultra)
 * - Pre-built Multi-LOD Sphere Meshes & Back-Face Culling
 * - Zero Per-Frame GC Allocations (Pre-allocated TypedArrays & Cached World Coords)
 * - O(N) BFS Spatial Adjacency Graph Flood-Fill & Structural Island Detachment
 * - 3D Rigid-Body Gravity (-18 m/s²), Radial Outward Impulse & Ring Deflection
 * - Local Device Save/Load Persistence (Android SharedPreferences + localStorage)
 */

(function () {
  "use strict";

  const STORAGE_KEY = "cosmic_pop_3d_save_v2";

  // =========================================================================
  // 1. GRAPHICS QUALITY PRESETS (LOW IS DEFAULT FOR MAXIMUM PERFORMANCE)
  // =========================================================================
  const GRAPHICS_PRESETS = {
    low: {
      id: "low",
      label: "LOW (FAST)",
      dprCap: 1.0,
      latBands: 8,
      lonBands: 12,
      bokehCount: 16,
      particlesPerPop: 2,
      maxFallingSpheres: 28,
      shaderQuality: 0.0
    },
    medium: {
      id: "medium",
      label: "MEDIUM (BALANCED)",
      dprCap: 1.25,
      latBands: 12,
      lonBands: 16,
      bokehCount: 32,
      particlesPerPop: 3,
      maxFallingSpheres: 45,
      shaderQuality: 1.0
    },
    high: {
      id: "high",
      label: "HIGH (CRISP)",
      dprCap: 1.65,
      latBands: 16,
      lonBands: 22,
      bokehCount: 52,
      particlesPerPop: 5,
      maxFallingSpheres: 75,
      shaderQuality: 2.0
    },
    ultra: {
      id: "ultra",
      label: "ULTRA (MAX 3D)",
      dprCap: 2.25,
      latBands: 22,
      lonBands: 30,
      bokehCount: 76,
      particlesPerPop: 7,
      maxFallingSpheres: 110,
      shaderQuality: 3.0
    }
  };

  let currentGfxKey = "low"; // Default to Low graphics for smooth 60 FPS everywhere
  let currentGfx = GRAPHICS_PRESETS.low;

  // =========================================================================
  // 2. SIGNATURE & PROCEDURAL OFFLINE LEVEL DEFINITIONS
  // =========================================================================
  const SIGNATURE_LEVELS = [
    {
      level: 1,
      name: "Cosmic Core",
      shape: "sphere",
      bgInner: "#4A2574",
      bgOuter: "#21103A",
      timeLimit: 70,
      colors: ["#FF4D9D", "#38BDF8", "#A855F7"]
    },
    {
      level: 2,
      name: "Crystal Cube",
      shape: "cube",
      bgInner: "#2E4082",
      bgOuter: "#172048",
      timeLimit: 75,
      colors: ["#60A5FA", "#F472B6", "#34D399"]
    },
    {
      level: 3,
      name: "Violet Pyramid",
      shape: "pyramid",
      bgInner: "#6D4AA8",
      bgOuter: "#3B2268",
      timeLimit: 65,
      colors: ["#5E2BFF", "#B892FF", "#FF85C0"]
    },
    {
      level: 4,
      name: "Emerald Halo",
      shape: "halo",
      bgInner: "#3A7D88",
      bgOuter: "#1A4B56",
      timeLimit: 70,
      colors: ["#9EF01A", "#10B981", "#5EEAD4"]
    },
    {
      level: 5,
      name: "Solar Torus",
      shape: "torus",
      bgInner: "#8C526D",
      bgOuter: "#542B4E",
      timeLimit: 75,
      colors: ["#FF2A54", "#FF7B00", "#FFD000"]
    },
    {
      level: 6,
      name: "Magenta Star",
      shape: "star",
      bgInner: "#7846B5",
      bgOuter: "#482575",
      timeLimit: 80,
      colors: ["#FF1E8E", "#FF70B8", "#D8B4FE", "#7C3AED"]
    },
    {
      level: 7,
      name: "Indigo Helix",
      shape: "helix",
      bgInner: "#4E62B8",
      bgOuter: "#28367A",
      timeLimit: 85,
      colors: ["#2563EB", "#818CF8", "#38BDF8", "#4338CA"]
    },
    {
      level: 8,
      name: "Astral Diamond",
      shape: "diamond",
      bgInner: "#703888",
      bgOuter: "#341548",
      timeLimit: 80,
      colors: ["#F43F5E", "#FB923C", "#C084FC", "#38BDF8"]
    },
    {
      level: 9,
      name: "Nebula Heart",
      shape: "heart",
      bgInner: "#883668",
      bgOuter: "#421432",
      timeLimit: 80,
      colors: ["#FF2E7E", "#FF85B3", "#C084FC", "#FDE047"]
    },
    {
      level: 10,
      name: "Lunar Crescent",
      shape: "crescent",
      bgInner: "#355C7D",
      bgOuter: "#18293A",
      timeLimit: 85,
      colors: ["#38BDF8", "#818CF8", "#F472B6", "#FACC15"]
    },
    {
      level: 11,
      name: "Binary Rings",
      shape: "doublering",
      bgInner: "#5B3E96",
      bgOuter: "#28184A",
      timeLimit: 85,
      colors: ["#2DD4BF", "#A78BFA", "#FB7185", "#FBBF24"]
    },
    {
      level: 12,
      name: "Quantum Core",
      shape: "spherecore",
      bgInner: "#4A307A",
      bgOuter: "#1E1238",
      timeLimit: 90,
      colors: ["#FF4D9D", "#00F5D4", "#FEE440", "#9B5DE5"]
    }
  ];

  const PROCEDURAL_SHAPES = ["cube", "diamond", "heart", "crescent", "doublering", "spherecore", "pyramid", "star", "helix"];
  const PROCEDURAL_PALETTES = [
    { name: "Cyber Sakura", bgInner: "#7A3E78", bgOuter: "#361838", colors: ["#FF4D9D", "#FF9EBB", "#72EFDD", "#B892FF"] },
    { name: "Aurora Borealis", bgInner: "#28666E", bgOuter: "#123138", colors: ["#06D6A0", "#4CC9F0", "#B5179E", "#FFD166"] },
    { name: "Supernova Pulse", bgInner: "#7C3658", bgOuter: "#3A1426", colors: ["#FF2A54", "#FF9F1C", "#2EC4B6", "#E0AAFF"] },
    { name: "Velvet Andromeda", bgInner: "#4F3B8B", bgOuter: "#221742", colors: ["#7209B7", "#4CC9F0", "#F72585", "#FDE047"] }
  ];

  let customAiLevels = {};
  let clearedLevels = {};
  let highestUnlockedLevel = 3;

  function getLevelConfig(levelNum) {
    if (customAiLevels[levelNum]) {
      return customAiLevels[levelNum];
    }
    const found = SIGNATURE_LEVELS.find((l) => l.level === levelNum);
    if (found) return found;

    const idx = Math.abs(levelNum - 8) % PROCEDURAL_SHAPES.length;
    const pal = PROCEDURAL_PALETTES[Math.abs(levelNum - 8) % PROCEDURAL_PALETTES.length];
    const shape = PROCEDURAL_SHAPES[idx];
    const shapeLabel = shape.charAt(0).toUpperCase() + shape.slice(1);
    return {
      level: levelNum,
      name: `${pal.name.split(" ")[0]} ${shapeLabel}`,
      shape: shape,
      bgInner: pal.bgInner,
      bgOuter: pal.bgOuter,
      timeLimit: 80,
      colors: pal.colors
    };
  }

  // =========================================================================
  // 3. PROCEDURAL WEB AUDIO SYNTHESIZER & ANDROID HAPTICS
  // =========================================================================
  class CosmicAudioHaptics {
    constructor() {
      this.ctx = null;
      this.audioEnabled = true;
      this.hapticsEnabled = true;
      this.lastBounceSoundTime = 0;
    }

    initContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    }

    vibrate(msOrPattern) {
      if (!this.hapticsEnabled) return;
      try {
        if (window.AndroidCosmicBridge && window.AndroidCosmicBridge.vibrate) {
          const dur = Array.isArray(msOrPattern) ? msOrPattern[0] : msOrPattern;
          window.AndroidCosmicBridge.vibrate(dur);
          return;
        }
        if (navigator.vibrate) {
          navigator.vibrate(msOrPattern);
        }
      } catch (e) {}
    }

    playLaunchWhoosh() {
      if (!this.audioEnabled) return;
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.10);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    }

    playSwapChime() {
      this.vibrate(12);
      if (!this.audioEnabled) return;
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [523.25, 659.25].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.042);
        gain.gain.setValueAtTime(0.14, now + idx * 0.042);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.042 + 0.13);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.042);
        osc.stop(now + idx * 0.042 + 0.14);
      });
    }

    playChainPop(count) {
      if (count >= 29) {
        this.vibrate([40, 25, 60]);
      } else if (count >= 16) {
        this.vibrate([28, 20, 35]);
      } else if (count >= 10) {
        this.vibrate(24);
      } else {
        this.vibrate(14);
      }

      if (!this.audioEnabled) return;
      this.initContext();
      if (!this.ctx) return;

      const baseScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      const tierOffset = count >= 29 ? 4 : count >= 23 ? 3 : count >= 16 ? 2 : count >= 10 ? 1 : 0;
      const notesCount = Math.min(6, Math.max(2, Math.floor(count / 4) + 1));
      const now = this.ctx.currentTime;

      for (let i = 0; i < notesCount; i++) {
        const freq = baseScale[Math.min(baseScale.length - 1, tierOffset + i)];
        const start = now + i * 0.045;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.20, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.34);
      }
    }

    playAttachThud() {
      this.vibrate(10);
      if (!this.audioEnabled) return;
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(185, now);
      osc.frequency.exponentialRampToValueAtTime(92, now + 0.075);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    }

    playGlassBounce() {
      if (!this.audioEnabled) return;
      const nowMs = performance.now();
      if (nowMs - this.lastBounceSoundTime < 55) return;
      this.lastBounceSoundTime = nowMs;

      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const randFreq = 940 + Math.random() * 480;
      osc.type = "sine";
      osc.frequency.setValueAtTime(randFreq, now);
      osc.frequency.exponentialRampToValueAtTime(randFreq * 1.3, now + 0.05);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.065);
    }
  }

  const sfx = new CosmicAudioHaptics();

  // =========================================================================
  // 4. ZERO-ALLOCATION 3D MATH & MATRIX UTILITIES
  // =========================================================================
  function hexToRgb(hex) {
    const clean = (hex || "#FFFFFF").replace("#", "");
    const num = parseInt(clean, 16);
    if (isNaN(num)) return [1, 1, 1];
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
  }

  function mat4Perspective(out, fovRad, aspect, near, far) {
    const f = 1.0 / Math.tan(fovRad / 2);
    const nf = 1 / (near - far);
    out.fill(0);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[14] = 2 * far * near * nf;
    return out;
  }

  function mat4Multiply(out, a, b) {
    for (let i = 0; i < 4; i++) {
      const ai0 = a[i], ai1 = a[i + 4], ai2 = a[i + 8], ai3 = a[i + 12];
      out[i]      = ai0 * b[0]  + ai1 * b[1]  + ai2 * b[2]  + ai3 * b[3];
      out[i + 4]  = ai0 * b[4]  + ai1 * b[5]  + ai2 * b[6]  + ai3 * b[7];
      out[i + 8]  = ai0 * b[8]  + ai1 * b[9]  + ai2 * b[10] + ai3 * b[11];
      out[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
    }
    return out;
  }

  function mat4Invert(out, m) {
    out[0] = m[5]*m[10]*m[15] - m[5]*m[11]*m[14] - m[9]*m[6]*m[15] + m[9]*m[7]*m[14] + m[13]*m[6]*m[11] - m[13]*m[7]*m[10];
    out[4] = -m[4]*m[10]*m[15] + m[4]*m[11]*m[14] + m[8]*m[6]*m[15] - m[8]*m[7]*m[14] - m[12]*m[6]*m[11] + m[12]*m[7]*m[10];
    out[8] = m[4]*m[9]*m[15] - m[4]*m[11]*m[13] - m[8]*m[5]*m[15] + m[8]*m[7]*m[13] + m[12]*m[5]*m[11] - m[12]*m[7]*m[9];
    out[12] = -m[4]*m[9]*m[14] + m[4]*m[10]*m[13] + m[8]*m[5]*m[14] - m[8]*m[6]*m[13] - m[12]*m[5]*m[10] + m[12]*m[6]*m[9];
    out[1] = -m[1]*m[10]*m[15] + m[1]*m[11]*m[14] + m[9]*m[2]*m[15] - m[9]*m[3]*m[14] - m[13]*m[2]*m[11] + m[13]*m[3]*m[10];
    out[5] = m[0]*m[10]*m[15] - m[0]*m[11]*m[14] - m[8]*m[2]*m[15] + m[8]*m[3]*m[14] + m[12]*m[2]*m[11] - m[12]*m[3]*m[10];
    out[9] = -m[0]*m[9]*m[15] + m[0]*m[11]*m[13] + m[8]*m[1]*m[15] - m[8]*m[3]*m[13] - m[12]*m[1]*m[11] + m[12]*m[3]*m[9];
    out[13] = m[0]*m[9]*m[14] - m[0]*m[10]*m[13] - m[8]*m[1]*m[14] + m[8]*m[2]*m[13] + m[12]*m[1]*m[10] - m[12]*m[2]*m[9];
    out[2] = m[1]*m[6]*m[15] - m[1]*m[7]*m[14] - m[5]*m[2]*m[15] + m[5]*m[3]*m[14] + m[13]*m[2]*m[7] - m[13]*m[3]*m[6];
    out[6] = -m[0]*m[6]*m[15] + m[0]*m[7]*m[14] + m[4]*m[2]*m[15] - m[4]*m[3]*m[14] - m[12]*m[2]*m[7] + m[12]*m[3]*m[6];
    out[10] = m[0]*m[5]*m[15] - m[0]*m[7]*m[13] - m[4]*m[1]*m[15] + m[4]*m[3]*m[13] + m[12]*m[1]*m[7] - m[12]*m[3]*m[5];
    out[14] = -m[0]*m[5]*m[14] + m[0]*m[6]*m[13] + m[4]*m[1]*m[14] - m[4]*m[2]*m[13] - m[12]*m[1]*m[6] + m[12]*m[2]*m[5];
    out[3] = -m[1]*m[6]*m[11] + m[1]*m[7]*m[10] + m[5]*m[2]*m[11] - m[5]*m[3]*m[10] - m[9]*m[2]*m[7] + m[9]*m[3]*m[6];
    out[7] = m[0]*m[6]*m[11] - m[0]*m[7]*m[10] - m[4]*m[2]*m[11] + m[4]*m[3]*m[10] + m[8]*m[2]*m[7] - m[8]*m[3]*m[6];
    out[11] = -m[0]*m[5]*m[11] + m[0]*m[7]*m[9] + m[4]*m[1]*m[11] - m[4]*m[3]*m[9] - m[8]*m[1]*m[7] + m[8]*m[3]*m[5];
    out[15] = m[0]*m[5]*m[10] - m[0]*m[6]*m[9] - m[4]*m[1]*m[10] + m[4]*m[2]*m[9] + m[8]*m[1]*m[6] - m[8]*m[2]*m[5];

    let det = m[0]*out[0] + m[1]*out[4] + m[2]*out[8] + m[3]*out[12];
    if (Math.abs(det) < 1e-8) return out;
    det = 1.0 / det;
    for (let i = 0; i < 16; i++) out[i] *= det;
    return out;
  }

  function unrotatePointEuler(x, y, z, rx, ry) {
    const cx = Math.cos(-rx), sx = Math.sin(-rx);
    const y1 = y * cx - z * sx;
    const z1 = y * sx + z * cx;
    const cy = Math.cos(-ry), sy = Math.sin(-ry);
    const x2 = x * cy + z1 * sy;
    const z2 = -x * sy + z1 * cy;
    return [x2, y1, z2];
  }

  // =========================================================================
  // 5. 3D GEOMETRIC CLUSTER GENERATOR & SPATIAL ADJACENCY GRAPH
  // =========================================================================
  const SPHERE_RADIUS = 0.255;
  const SPHERE_DIAMETER = SPHERE_RADIUS * 2.0;
  const CLUSTER_CENTER_Y = 0.68;
  const RING_Y = -2.35;
  const LAUNCHER_POS = [0.0, -4.15, 1.45];

  function generateClusterNodes(levelCfg) {
    const shape = (levelCfg.shape || "pyramid").toLowerCase();
    const colors = levelCfg.colors && levelCfg.colors.length >= 2
      ? levelCfg.colors
      : ["#5E2BFF", "#B892FF", "#FF85C0"];
    const step = SPHERE_DIAMETER * 0.96;
    const rawPoints = [];

    const range = 5;
    for (let ix = -range; ix <= range; ix++) {
      for (let iy = -range - 1; iy <= range + 1; iy++) {
        for (let iz = -range; iz <= range; iz++) {
          const x = (ix + ((iy & 1) ? 0.5 : 0.0) + ((iz & 1) ? 0.25 : -0.25)) * step;
          const y = iy * (step * 0.866);
          const z = iz * (step * 0.866);

          if (isInsideShape(x, y, z, shape, levelCfg)) {
            rawPoints.push({ lx: x, ly: y, lz: z });
          }
        }
      }
    }

    if (rawPoints.length < 90) {
      for (let ix = -4; ix <= 4; ix++) {
        for (let iy = -4; iy <= 4; iy++) {
          for (let iz = -4; iz <= 4; iz++) {
            const x = ix * step * 0.95;
            const y = iy * step * 0.95;
            const z = iz * step * 0.95;
            if (x * x + y * y + z * z <= 2.25) {
              rawPoints.push({ lx: x, ly: y, lz: z });
            }
          }
        }
      }
    }

    const numSeeds = Math.max(12, Math.floor(rawPoints.length / 13));
    const seeds = [];
    for (let s = 0; s < numSeeds; s++) {
      const pt = rawPoints[Math.floor((s * 97 + 13) % rawPoints.length)];
      seeds.push({
        x: pt.lx,
        y: pt.ly,
        z: pt.lz,
        colorIndex: s % colors.length
      });
    }

    const nodes = rawPoints.map((pt, idx) => {
      let bestSeed = seeds[0];
      let bestDist = 1e9;
      for (let s = 0; s < seeds.length; s++) {
        const dx = pt.lx - seeds[s].x;
        const dy = pt.ly - seeds[s].y;
        const dz = pt.lz - seeds[s].z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < bestDist) {
          bestDist = d2;
          bestSeed = seeds[s];
        }
      }
      const hex = colors[bestSeed.colorIndex];
      return {
        id: idx,
        lx: pt.lx,
        ly: pt.ly,
        lz: pt.lz,
        wx: pt.lx,
        wy: pt.ly + CLUSTER_CENTER_Y,
        wz: pt.lz,
        colorIndex: bestSeed.colorIndex,
        hex: hex,
        rgb: hexToRgb(hex),
        active: true,
        neighbors: [],
        ao: 1.0
      };
    });

    rebuildAdjacencyAndAO(nodes);

    const mainSet = findMainStructuralComponent(nodes);
    if (mainSet.size > 20) {
      for (let i = 0; i < nodes.length; i++) {
        if (!mainSet.has(i)) nodes[i].active = false;
      }
    }
    const activeNodes = nodes.filter((n) => n.active);
    activeNodes.forEach((n, idx) => { n.id = idx; });
    rebuildAdjacencyAndAO(activeNodes);
    return activeNodes;
  }

  function isInsideShape(x, y, z, shape, cfg) {
    const r2 = x * x + y * y + z * z;
    const twist = cfg.twist || 0;
    let tx = x, tz = z;
    if (Math.abs(twist) > 0.01) {
      const ang = y * twist;
      const c = Math.cos(ang), s = Math.sin(ang);
      tx = x * c - z * s;
      tz = x * s + z * c;
    }

    switch (shape) {
      case "pyramid": {
        const ny = y + 1.35;
        if (ny < 0.0 || ny > 2.75) return false;
        const halfWidth = (2.85 - ny) * 0.58;
        return Math.abs(tx) <= halfWidth && Math.abs(tz) <= halfWidth;
      }
      case "halo": {
        const ty = y * 0.85 - z * 0.52;
        const tz2 = y * 0.52 + z * 0.85;
        const qx = Math.sqrt(x * x + tz2 * tz2) - 1.42;
        return (qx * qx + ty * ty) <= 0.384;
      }
      case "torus": {
        const ty = y * 0.78 + x * 0.42;
        const tx2 = x * 0.78 - y * 0.42;
        const qx = Math.sqrt(tx2 * tx2 + z * z) - 1.32;
        return (qx * qx + ty * ty) <= 0.547;
      }
      case "star": {
        if (Math.abs(z) > 0.68) return false;
        const angle = Math.atan2(y, x);
        const r = Math.sqrt(x * x + y * y);
        return r <= 1.35 + 0.58 * Math.cos(5.0 * angle);
      }
      case "helix": {
        if (Math.abs(y) > 2.05) return false;
        const phase = y * 1.65;
        const s1x = 1.05 * Math.cos(phase);
        const s1z = 1.05 * Math.sin(phase);
        const d1 = (x - s1x) * (x - s1x) + (z - s1z) * (z - s1z);
        const d2 = (x + s1x) * (x + s1x) + (z + s1z) * (z + s1z);
        const rung = Math.abs(Math.sin(y * 3.2)) < 0.35 && (x * x + z * z) <= 1.2;
        return d1 <= 0.46 || d2 <= 0.46 || rung;
      }
      case "cube": {
        const b = 1.32;
        return Math.abs(tx) <= b && Math.abs(y) <= b && Math.abs(tz) <= b && (tx*tx + y*y + tz*tz) <= 4.3;
      }
      case "diamond": {
        return (Math.abs(tx) + Math.abs(y * 0.85) + Math.abs(tz)) <= 1.95;
      }
      case "heart": {
        if (Math.abs(z) > 0.78) return false;
        const hx = x * 0.85;
        const hy = (y + 0.25) * 0.85;
        const a = hx * hx + hy * hy - 1.15;
        return (a * a * a - hx * hx * hy * hy * hy) <= 0.0;
      }
      case "crescent": {
        const dMain = r2 <= 2.65;
        const dCut = (x - 0.78) * (x - 0.78) + (y - 0.25) * (y - 0.25) + z * z <= 1.65;
        return dMain && !dCut;
      }
      case "doublering": {
        const q1 = Math.sqrt(x * x + y * y) - 1.35;
        const q2 = Math.sqrt(z * z + y * y) - 1.35;
        return (q1 * q1 + z * z) <= 0.34 || (q2 * q2 + x * x) <= 0.34;
      }
      case "spherecore": {
        return r2 <= 2.55 && r2 >= 0.22;
      }
      default: {
        return r2 <= 2.35;
      }
    }
  }

  function rebuildAdjacencyAndAO(nodes) {
    const threshold = 1.12 * SPHERE_DIAMETER;
    const threshSq = threshold * threshold;
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].neighbors.length = 0;
    }
    for (let i = 0; i < nodes.length; i++) {
      if (!nodes[i].active) continue;
      for (let j = i + 1; j < nodes.length; j++) {
        if (!nodes[j].active) continue;
        const dx = nodes[i].lx - nodes[j].lx;
        const dy = nodes[i].ly - nodes[j].ly;
        const dz = nodes[i].lz - nodes[j].lz;
        if (dx * dx + dy * dy + dz * dz <= threshSq) {
          nodes[i].neighbors.push(j);
          nodes[j].neighbors.push(i);
        }
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].ao = Math.max(0.58, 1.0 - nodes[i].neighbors.length * 0.032);
    }
  }

  function findMainStructuralComponent(nodes) {
    const visited = new Uint8Array(nodes.length);
    let largestComp = new Set();

    for (let i = 0; i < nodes.length; i++) {
      if (!nodes[i].active || visited[i]) continue;
      const comp = new Set();
      const queue = [i];
      visited[i] = 1;
      let head = 0;
      while (head < queue.length) {
        const cur = queue[head++];
        comp.add(cur);
        const nb = nodes[cur].neighbors;
        for (let k = 0; k < nb.length; k++) {
          const nxt = nb[k];
          if (nodes[nxt].active && !visited[nxt]) {
            visited[nxt] = 1;
            queue.push(nxt);
          }
        }
      }
      if (comp.size > largestComp.size) {
        largestComp = comp;
      }
    }
    return largestComp;
  }

  // =========================================================================
  // 6. OPTIMIZED WEBGL 3D RENDERER (MULTI-LOD SPHERES & ADAPTIVE SHADER)
  // =========================================================================
  const canvas = document.getElementById("game-canvas");
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false, // Controlled via dynamic DPR scaling for vastly better mobile performance
    depth: true,
    powerPreference: "high-performance"
  });

  // Optimized Vertex Shader: computes lighting vectors per-vertex on Low/Medium to save GPU fragment cycles!
  const SPHERE_VS = `
    attribute vec3 aPos;
    uniform mat4 uProjView;
    uniform vec3 uSphereCenter;
    uniform float uSphereRadius;
    uniform mat3 uClusterRot;
    uniform float uIsClusterLocal;
    varying vec3 vNormal;
    varying vec3 vWorldPos;

    void main() {
      vec3 worldCenter = uSphereCenter;
      vec3 n = aPos;
      if (uIsClusterLocal > 0.5) {
        n = uClusterRot * aPos;
      }
      vec3 worldPos = worldCenter + n * uSphereRadius;
      vNormal = n;
      vWorldPos = worldPos;
      gl_Position = uProjView * vec4(worldPos, 1.0);
    }
  `;

  const SPHERE_FS = `
    precision mediump float;
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    uniform vec3 uColor;
    uniform float uAO;
    uniform float uFlash;
    uniform float uQuality;
    uniform vec3 uCameraPos;

    void main() {
      vec3 N = normalize(vNormal);
      vec3 L1 = vec3(-0.465, 0.698, 0.545); // Pre-normalized top-front-left key light

      // Wrap subsurface diffuse
      float diff1 = max(0.0, (dot(N, L1) + 0.42) * 0.704);
      float hemi = N.y * 0.5 + 0.5;
      vec3 ambient = mix(vec3(0.20, 0.14, 0.32), vec3(0.46, 0.40, 0.62), hemi) * uAO;

      vec3 finalCol;
      if (uQuality < 0.5) {
        // LOW QUALITY: Ultra-fast algebraic specular & rim without heavy pow() calls
        vec3 H = normalize(L1 + vec3(0.0, 0.0, 1.0));
        float ndoth = max(dot(N, H), 0.0);
        float s2 = ndoth * ndoth;
        float s8 = s2 * s2 * s2 * s2;
        float spec = s8 * s8 * 0.65;
        float rim = (1.0 - max(N.z, 0.0));
        float rim2 = rim * rim * 0.28;
        finalCol = uColor * (ambient + diff1 * 0.90) * uAO + vec3(spec) + mix(uColor, vec3(1.0), 0.6) * rim2;
      } else {
        // MEDIUM / HIGH / ULTRA QUALITY: Full view-dependent specular & Fresnel sheen
        vec3 V = normalize(uCameraPos - vWorldPos);
        vec3 L2 = vec3(0.354, 0.455, -0.817);
        float diff2 = max(0.0, dot(N, L2)) * 0.26;
        vec3 H = normalize(L1 + V);
        float spec = pow(max(dot(N, H), 0.0), 48.0) * 0.78;
        float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.40;
        finalCol = uColor * (ambient + diff1 * 0.88 + diff2) * uAO + vec3(1.0, 0.98, 1.0) * spec + mix(uColor, vec3(1.0), 0.65) * fresnel;
      }

      finalCol = mix(finalCol, vec3(1.0), uFlash);
      gl_FragColor = vec4(finalCol, 1.0);
    }
  `;

  const EFFECT_VS = `
    attribute vec3 aPos;
    uniform mat4 uProjView;
    uniform vec3 uOffset;
    uniform mat3 uRot;
    uniform float uScale;
    void main() {
      vec3 p = uOffset + (uRot * (aPos * uScale));
      gl_Position = uProjView * vec4(p, 1.0);
      gl_PointSize = 4.5;
    }
  `;

  const EFFECT_FS = `
    precision mediump float;
    uniform vec4 uColor;
    void main() {
      gl_FragColor = uColor;
    }
  `;

  function compileShader(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  }

  function createProgram(vsSrc, fsSrc) {
    const p = gl.createProgram();
    gl.attachShader(p, compileShader(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(p, compileShader(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(p);
    return p;
  }

  const sphereProg = createProgram(SPHERE_VS, SPHERE_FS);
  const effectProg = createProgram(EFFECT_VS, EFFECT_FS);

  const sphereLocs = {
    aPos: gl.getAttribLocation(sphereProg, "aPos"),
    uProjView: gl.getUniformLocation(sphereProg, "uProjView"),
    uSphereCenter: gl.getUniformLocation(sphereProg, "uSphereCenter"),
    uSphereRadius: gl.getUniformLocation(sphereProg, "uSphereRadius"),
    uClusterRot: gl.getUniformLocation(sphereProg, "uClusterRot"),
    uIsClusterLocal: gl.getUniformLocation(sphereProg, "uIsClusterLocal"),
    uColor: gl.getUniformLocation(sphereProg, "uColor"),
    uAO: gl.getUniformLocation(sphereProg, "uAO"),
    uFlash: gl.getUniformLocation(sphereProg, "uFlash"),
    uQuality: gl.getUniformLocation(sphereProg, "uQuality"),
    uCameraPos: gl.getUniformLocation(sphereProg, "uCameraPos")
  };

  const effectLocs = {
    aPos: gl.getAttribLocation(effectProg, "aPos"),
    uProjView: gl.getUniformLocation(effectProg, "uProjView"),
    uOffset: gl.getUniformLocation(effectProg, "uOffset"),
    uRot: gl.getUniformLocation(effectProg, "uRot"),
    uScale: gl.getUniformLocation(effectProg, "uScale"),
    uColor: gl.getUniformLocation(effectProg, "uColor")
  };

  function createSphereBuffers(latBands, lonBands) {
    const positions = [];
    const indices = [];
    for (let lat = 0; lat <= latBands; lat++) {
      const theta = (lat * Math.PI) / latBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      for (let lon = 0; lon <= lonBands; lon++) {
        const phi = (lon * 2 * Math.PI) / lonBands;
        const x = Math.cos(phi) * sinTheta;
        const y = cosTheta;
        const z = Math.sin(phi) * sinTheta;
        positions.push(x, y, z);
      }
    }
    for (let lat = 0; lat < latBands; lat++) {
      for (let lon = 0; lon < lonBands; lon++) {
        const first = lat * (lonBands + 1) + lon;
        const second = first + lonBands + 1;
        // Counter-clockwise winding for outward normals
        indices.push(first, first + 1, second);
        indices.push(second, first + 1, second + 1);
      }
    }
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    return { vbo, ibo, count: indices.length };
  }

  // Pre-build LOD meshes for Low, Medium, High, Ultra and tiny particles
  const sphereMeshesByQuality = {
    low: createSphereBuffers(8, 12),
    medium: createSphereBuffers(12, 16),
    high: createSphereBuffers(16, 22),
    ultra: createSphereBuffers(22, 30),
    particle: createSphereBuffers(5, 7)
  };

  function createCollectorRingBuffers(innerR, outerR, segs) {
    const discVerts = [];
    const rimOuterVerts = [];
    const rimInnerVerts = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      discVerts.push(c * outerR, 0, s * outerR);
      discVerts.push(c * innerR, 0, s * innerR);
      rimOuterVerts.push(c * outerR, 0.02, s * outerR);
      rimInnerVerts.push(c * innerR, 0.02, s * innerR);
    }
    const discVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, discVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(discVerts), gl.STATIC_DRAW);

    const outerVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, outerVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rimOuterVerts), gl.STATIC_DRAW);

    const innerVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, innerVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rimInnerVerts), gl.STATIC_DRAW);

    return { discVbo, discCount: (segs + 1) * 2, outerVbo, innerVbo, rimCount: segs + 1 };
  }

  function createUnitCircleBuffer(segs) {
    const verts = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      verts.push(Math.cos(a), Math.sin(a), 0);
    }
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    return { vbo, count: segs + 1 };
  }

  const ringMesh = createCollectorRingBuffers(0.92, 3.15, 48);
  const circleMesh = createUnitCircleBuffer(44);

  // Pre-allocate dynamic laser line buffer once (no per-frame new Float32Array)
  const LASER_DASH_COUNT = 16;
  const laserVertsArray = new Float32Array(LASER_DASH_COUNT * 6);
  const dynamicLineVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, dynamicLineVbo);
  gl.bufferData(gl.ARRAY_BUFFER, laserVertsArray.byteLength, gl.DYNAMIC_DRAW);

  // Upload bokeh buffer once at startup
  const MAX_BOKEH = 80;
  const bokehVerts = new Float32Array(MAX_BOKEH * 3);
  for (let i = 0; i < MAX_BOKEH; i++) {
    bokehVerts[i * 3] = (Math.random() - 0.5) * 9.5;
    bokehVerts[i * 3 + 1] = (Math.random() - 0.5) * 14.0;
    bokehVerts[i * 3 + 2] = -3.5 - Math.random() * 4.5;
  }
  const bokehVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bokehVbo);
  gl.bufferData(gl.ARRAY_BUFFER, bokehVerts, gl.STATIC_DRAW);

  // Pre-allocated reusable matrices
  const CAMERA_POS = [0, 0, 10.6];
  const projMatrix = new Float32Array(16);
  const viewMatrix = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -CAMERA_POS[0], -CAMERA_POS[1], -CAMERA_POS[2], 1
  ]);
  const projViewMatrix = new Float32Array(16);
  const invProjViewMatrix = new Float32Array(16);
  const identity3 = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  const clusterRot3 = new Float32Array(9);
  const tempRot3 = new Float32Array(9);

  // =========================================================================
  // 7. GAME STATE, WORLD COORD CACHE & LOCAL DEVICE PERSISTENCE
  // =========================================================================
  let currentLevelNum = 3;
  let currentLevelCfg = getLevelConfig(3);
  let clusterNodes = [];
  let initialSphereCount = 1;
  let remainingCount = 0;

  let rotY = 0.45;
  let rotX = 0.16;
  let velRotY = 0.0;
  let velRotX = 0.0;
  let autoRotateIdle = true;

  let currentShotColor = "#5E2BFF";
  let nextShotColor = "#FF85C0";
  let shotsFired = 0;
  let bestChain = 0;
  let timeRemaining = 65;
  let isPaused = false;
  let isGameOver = false;

  let projectile = null;
  let fallingSpheres = [];
  let shockwaves = [];
  let burstParticles = [];
  let ringRippleFlash = 0.0;

  let pointerMode = null;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let aimResult = null;

  // Save & Load State Locally (Native SharedPreferences + localStorage)
  function saveLocalState() {
    const payload = {
      currentLevelNum: currentLevelNum,
      highestUnlockedLevel: highestUnlockedLevel,
      clearedLevels: clearedLevels,
      graphicsQuality: currentGfxKey,
      audioEnabled: sfx.audioEnabled,
      hapticsEnabled: sfx.hapticsEnabled,
      autoRotateIdle: autoRotateIdle,
      customAiLevels: customAiLevels
    };
    const json = JSON.stringify(payload);
    try {
      localStorage.setItem(STORAGE_KEY, json);
    } catch (e) {}
    try {
      if (window.AndroidCosmicBridge && window.AndroidCosmicBridge.saveStateJson) {
        window.AndroidCosmicBridge.saveStateJson(json);
      }
    } catch (e) {}
  }

  function loadLocalState() {
    let raw = null;
    try {
      if (window.AndroidCosmicBridge && window.AndroidCosmicBridge.loadStateJson) {
        raw = window.AndroidCosmicBridge.loadStateJson();
      }
    } catch (e) {}
    if (!raw) {
      try {
        raw = localStorage.getItem(STORAGE_KEY);
      } catch (e) {}
    }
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      if (typeof data.currentLevelNum === "number" && data.currentLevelNum >= 1) {
        currentLevelNum = data.currentLevelNum;
      }
      if (typeof data.highestUnlockedLevel === "number" && data.highestUnlockedLevel >= 1) {
        highestUnlockedLevel = data.highestUnlockedLevel;
      }
      if (data.clearedLevels && typeof data.clearedLevels === "object") {
        clearedLevels = data.clearedLevels;
      }
      if (data.customAiLevels && typeof data.customAiLevels === "object") {
        customAiLevels = data.customAiLevels;
      }
      if (typeof data.audioEnabled === "boolean") {
        sfx.audioEnabled = data.audioEnabled;
      }
      if (typeof data.hapticsEnabled === "boolean") {
        sfx.hapticsEnabled = data.hapticsEnabled;
      }
      if (typeof data.autoRotateIdle === "boolean") {
        autoRotateIdle = data.autoRotateIdle;
      }
      if (data.graphicsQuality && GRAPHICS_PRESETS[data.graphicsQuality]) {
        currentGfxKey = data.graphicsQuality;
        currentGfx = GRAPHICS_PRESETS[currentGfxKey];
      }
    } catch (e) {}
  }

  function applyGraphicsQuality(gfxKey, shouldSave) {
    if (!GRAPHICS_PRESETS[gfxKey]) return;
    currentGfxKey = gfxKey;
    currentGfx = GRAPHICS_PRESETS[gfxKey];

    document.body.className = `gfx-${gfxKey}`;
    const badgeEl = document.getElementById("gfx-quality-badge");
    if (badgeEl) badgeEl.textContent = currentGfx.label;

    const btns = document.querySelectorAll(".gfx-btn");
    btns.forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-gfx") === gfxKey);
    });

    lastViewportW = 0;
    lastViewportH = 0;
    resizeViewport();

    if (shouldSave) {
      saveLocalState();
    }
  }

  function syncSettingsTogglesUI() {
    const audioBtn = document.getElementById("toggle-audio");
    if (audioBtn) {
      audioBtn.textContent = sfx.audioEnabled ? "ON" : "OFF";
      audioBtn.classList.toggle("active", sfx.audioEnabled);
    }
    const hapticsBtn = document.getElementById("toggle-haptics");
    if (hapticsBtn) {
      hapticsBtn.textContent = sfx.hapticsEnabled ? "ON" : "OFF";
      hapticsBtn.classList.toggle("active", sfx.hapticsEnabled);
    }
    const rotBtn = document.getElementById("toggle-autorotate");
    if (rotBtn) {
      rotBtn.textContent = autoRotateIdle ? "ON" : "OFF";
      rotBtn.classList.toggle("active", autoRotateIdle);
    }
  }

  // Update cached world coordinates and rotation matrix in one zero-allocation pass
  function updateClusterWorldCoords() {
    const cy = Math.cos(rotY), sy = Math.sin(rotY);
    const cx = Math.cos(rotX), sx = Math.sin(rotX);

    clusterRot3[0] = cy;
    clusterRot3[1] = sy * sx;
    clusterRot3[2] = -sy * cx;
    clusterRot3[3] = 0;
    clusterRot3[4] = cx;
    clusterRot3[5] = sx;
    clusterRot3[6] = sy;
    clusterRot3[7] = -cy * sx;
    clusterRot3[8] = cy * cx;

    for (let i = 0; i < clusterNodes.length; i++) {
      const n = clusterNodes[i];
      if (!n.active) continue;
      const x1 = n.lx * cy + n.lz * sy;
      const z1 = -n.lx * sy + n.lz * cy;
      n.wx = x1;
      n.wy = (n.ly * cx - z1 * sx) + CLUSTER_CENTER_Y;
      n.wz = n.ly * sx + z1 * cx;
    }
  }

  function writeEulerToMat3(out, rx, ry, rz) {
    const cx = Math.cos(rx), sx = Math.sin(rx);
    const cy = Math.cos(ry), sy = Math.sin(ry);
    const cz = Math.cos(rz), sz = Math.sin(rz);
    out[0] = cy * cz;
    out[1] = cx * sz + sx * sy * cz;
    out[2] = sx * sz - cx * sy * cz;
    out[3] = -cy * sz;
    out[4] = cx * cz - sx * sy * sz;
    out[5] = sx * cz + cx * sy * sz;
    out[6] = sy;
    out[7] = -sx * cy;
    out[8] = cx * cy;
    return out;
  }

  function writeNormalToMat3(out, nx, ny, nz) {
    let ux = 0, uy = 1, uz = 0;
    if (Math.abs(ny) > 0.9) { ux = 1; uy = 0; uz = 0; }
    let xx = uy * nz - uz * ny;
    let xy = uz * nx - ux * nz;
    let xz = ux * ny - uy * nx;
    const xLen = Math.hypot(xx, xy, xz) || 1;
    xx /= xLen; xy /= xLen; xz /= xLen;
    out[0] = xx; out[1] = xy; out[2] = xz;
    out[3] = ny * xz - nz * xy;
    out[4] = nz * xx - nx * xz;
    out[5] = nx * xy - ny * xx;
    out[6] = nx; out[7] = ny; out[8] = nz;
    return out;
  }

  function getActiveClusterColors() {
    const set = new Set();
    for (let i = 0; i < clusterNodes.length; i++) {
      if (clusterNodes[i].active) {
        set.add(clusterNodes[i].hex);
      }
    }
    return Array.from(set);
  }

  function pickValidLauncherColor(excludeHex) {
    const activeColors = getActiveClusterColors();
    if (activeColors.length === 0) {
      return currentLevelCfg.colors[0] || "#FFFFFF";
    }
    if (activeColors.length === 1) return activeColors[0];
    const filtered = excludeHex ? activeColors.filter((c) => c !== excludeHex) : activeColors;
    const pool = filtered.length > 0 ? filtered : activeColors;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function ensureLauncherColorsValid() {
    const activeColors = getActiveClusterColors();
    if (activeColors.length === 0) return;
    if (!activeColors.includes(currentShotColor)) {
      currentShotColor = pickValidLauncherColor(null);
    }
    if (!activeColors.includes(nextShotColor)) {
      nextShotColor = pickValidLauncherColor(currentShotColor);
    }
    updateLauncherSwapUI();
  }

  function updateLauncherSwapUI() {
    const curEl = document.getElementById("preview-current");
    const nxtEl = document.getElementById("preview-next");
    if (curEl) curEl.style.backgroundColor = currentShotColor;
    if (nxtEl) nxtEl.style.backgroundColor = nextShotColor;
  }

  function swapLauncherColors() {
    if (isPaused || isGameOver) return;
    const tmp = currentShotColor;
    currentShotColor = nextShotColor;
    nextShotColor = tmp;
    sfx.playSwapChime();
    updateLauncherSwapUI();
  }

  function loadLevel(levelNum, customConfig) {
    currentLevelNum = Math.max(1, levelNum);
    if (currentLevelNum > highestUnlockedLevel) {
      highestUnlockedLevel = currentLevelNum;
    }
    if (customConfig) {
      customAiLevels[currentLevelNum] = customConfig;
    }
    currentLevelCfg = getLevelConfig(currentLevelNum);

    const bgEl = document.getElementById("cosmic-bg");
    if (bgEl) {
      bgEl.style.background = `radial-gradient(circle at 50% 38%, ${currentLevelCfg.bgInner} 0%, ${currentLevelCfg.bgOuter} 70%, #120924 100%)`;
    }

    clusterNodes = generateClusterNodes(currentLevelCfg);
    initialSphereCount = Math.max(1, clusterNodes.length);
    remainingCount = clusterNodes.length;
    updateClusterWorldCoords();

    shotsFired = 0;
    bestChain = 0;
    timeRemaining = currentLevelCfg.timeLimit || 70;
    isPaused = false;
    isGameOver = false;
    projectile = null;
    fallingSpheres.length = 0;
    shockwaves.length = 0;
    burstParticles.length = 0;
    aimResult = null;

    currentShotColor = pickValidLauncherColor(null);
    nextShotColor = pickValidLauncherColor(currentShotColor);
    updateLauncherSwapUI();
    updateHudUI();
    hideAllModals();
    saveLocalState();
  }

  function updateHudUI() {
    const pill = document.getElementById("level-pill");
    if (pill) {
      const prefix = currentLevelCfg.isAiGenerated ? `AI LEVEL ${currentLevelNum}` : `LEVEL ${currentLevelNum}`;
      pill.textContent = `${prefix} • ${currentLevelCfg.name}`;
    }

    let activeNow = 0;
    for (let i = 0; i < clusterNodes.length; i++) {
      if (clusterNodes[i].active) activeNow++;
    }
    remainingCount = activeNow;
    const pct = Math.max(0, Math.min(100, Math.round((activeNow / initialSphereCount) * 100)));

    const fillEl = document.getElementById("progress-fill");
    const pctEl = document.getElementById("progress-pct");
    if (fillEl) {
      fillEl.style.width = `${pct}%`;
      const cols = currentLevelCfg.colors;
      if (cols && cols.length >= 2) {
        fillEl.style.background = `linear-gradient(90deg, ${cols.join(", ")})`;
      }
    }
    if (pctEl) {
      pctEl.textContent = `${pct}%`;
    }

    const shotsEl = document.getElementById("shots-count");
    if (shotsEl) shotsEl.textContent = String(shotsFired);

    updateTimerUI();
  }

  function updateTimerUI() {
    const timeEl = document.getElementById("time-pill");
    if (!timeEl) return;
    const mins = Math.floor(timeRemaining / 60);
    const secs = Math.max(0, Math.floor(timeRemaining % 60));
    timeEl.textContent = `TIME ${mins}:${secs < 10 ? "0" + secs : secs}`;
    if (timeRemaining <= 10 && timeRemaining > 0 && !isGameOver) {
      timeEl.classList.add("urgent");
    } else {
      timeEl.classList.remove("urgent");
    }
  }

  let comboHideTimer = null;
  function showComboPopup(totalCleared) {
    if (totalCleared < 3) return;
    const container = document.getElementById("combo-container");
    const titleEl = document.getElementById("combo-title");
    const subEl = document.getElementById("combo-sub");
    if (!container || !titleEl || !subEl) return;

    let label = "SWEET!";
    if (totalCleared >= 29) label = "COSMIC!";
    else if (totalCleared >= 23) label = "AWESOME!";
    else if (totalCleared >= 16) label = "GREAT!";
    else if (totalCleared >= 10) label = "NICE!";

    titleEl.textContent = label;
    subEl.textContent = `${totalCleared} SPHERES`;
    container.classList.add("show");

    if (comboHideTimer) clearTimeout(comboHideTimer);
    comboHideTimer = setTimeout(() => {
      container.classList.remove("show");
    }, 1250);
  }

  // =========================================================================
  // 8. FAST 3D RAYCASTING & AIMING TRAJECTORY SOLVER
  // =========================================================================
  function computeAimAtScreen(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2.0 - 1.0;
    const ndcY = 1.0 - ((clientY - rect.top) / rect.height) * 2.0;

    const m = invProjViewMatrix;
    const nw = m[3] * ndcX + m[7] * ndcY - m[11] + m[15] || 1.0;
    const roX = (m[0] * ndcX + m[4] * ndcY - m[8] + m[12]) / nw;
    const roY = (m[1] * ndcX + m[5] * ndcY - m[9] + m[13]) / nw;
    const roZ = (m[2] * ndcX + m[6] * ndcY - m[10] + m[14]) / nw;

    const fw = m[3] * ndcX + m[7] * ndcY + m[11] + m[15] || 1.0;
    const pfX = (m[0] * ndcX + m[4] * ndcY + m[8] + m[12]) / fw;
    const pfY = (m[1] * ndcX + m[5] * ndcY + m[9] + m[13]) / fw;
    const pfZ = (m[2] * ndcX + m[6] * ndcY + m[10] + m[14]) / fw;

    let rdX = pfX - roX;
    let rdY = pfY - roY;
    let rdZ = pfZ - roZ;
    const len = Math.hypot(rdX, rdY, rdZ) || 1.0;
    rdX /= len; rdY /= len; rdZ /= len;

    let bestT = 1e9;
    let bestIdx = -1;
    const hitR2 = (SPHERE_RADIUS * 1.12) * (SPHERE_RADIUS * 1.12);

    for (let i = 0; i < clusterNodes.length; i++) {
      const n = clusterNodes[i];
      if (!n.active) continue;
      const ocX = roX - n.wx;
      const ocY = roY - n.wy;
      const ocZ = roZ - n.wz;
      const b = ocX * rdX + ocY * rdY + ocZ * rdZ;
      const c = ocX * ocX + ocY * ocY + ocZ * ocZ - hitR2;
      const disc = b * b - c;
      if (disc >= 0) {
        const t = -b - Math.sqrt(disc);
        if (t > 0.1 && t < bestT) {
          bestT = t;
          bestIdx = i;
        }
      }
    }

    if (bestIdx !== -1) {
      const hitNode = clusterNodes[bestIdx];
      const hx = roX + rdX * bestT;
      const hy = roY + rdY * bestT;
      const hz = roZ + rdZ * bestT;
      let nx = hx - hitNode.wx;
      let ny = hy - hitNode.wy;
      let nz = hz - hitNode.wz;
      const nLen = Math.hypot(nx, ny, nz) || 1;
      return {
        hitNodeIdx: bestIdx,
        tx: hx,
        ty: hy,
        tz: hz,
        nx: nx / nLen,
        ny: ny / nLen,
        nz: nz / nLen
      };
    }

    if (Math.abs(rdZ) > 1e-4) {
      const tPlane = -roZ / rdZ;
      return {
        hitNodeIdx: -1,
        tx: roX + rdX * tPlane,
        ty: Math.max(-1.2, Math.min(3.5, roY + rdY * tPlane)),
        tz: 0.0,
        nx: 0,
        ny: 0,
        nz: 1
      };
    }
    return null;
  }

  function fireProjectile(aim) {
    if (!aim || projectile || isPaused || isGameOver) return;
    const tx = aim.tx - LAUNCHER_POS[0];
    const ty = aim.ty - LAUNCHER_POS[1];
    const tz = aim.tz - LAUNCHER_POS[2];
    const dist = Math.hypot(tx, ty, tz) || 1.0;
    const speed = 19.5;

    projectile = {
      x: LAUNCHER_POS[0],
      y: LAUNCHER_POS[1],
      z: LAUNCHER_POS[2],
      vx: (tx / dist) * speed,
      vy: (ty / dist) * speed,
      vz: (tz / dist) * speed,
      hex: currentShotColor,
      rgb: hexToRgb(currentShotColor)
    };

    shotsFired++;
    currentShotColor = nextShotColor;
    nextShotColor = pickValidLauncherColor(currentShotColor);
    updateLauncherSwapUI();
    updateHudUI();
    sfx.playLaunchWhoosh();

    const hintEl = document.getElementById("gesture-hint");
    if (hintEl) hintEl.style.opacity = "0";
  }

  // =========================================================================
  // 9. FLOOD-FILL COLOR MATCHING & DISCONNECTED ISLAND GRAVITY SOLVER
  // =========================================================================
  function handleProjectileHit(hitIdx, proj) {
    const hitNode = clusterNodes[hitIdx];
    if (!hitNode || !hitNode.active) return;

    velRotY += (proj.vx * 0.014);
    velRotX -= (proj.vy * 0.007);

    const targetHex = proj.hex;
    if (hitNode.hex === targetHex) {
      const matched = [];
      const visited = new Uint8Array(clusterNodes.length);
      const queue = [hitIdx];
      visited[hitIdx] = 1;
      let head = 0;

      while (head < queue.length) {
        const cur = queue[head++];
        matched.push(cur);
        const nb = clusterNodes[cur].neighbors;
        for (let k = 0; k < nb.length; k++) {
          const nxt = nb[k];
          if (clusterNodes[nxt].active && !visited[nxt] && clusterNodes[nxt].hex === targetHex) {
            visited[nxt] = 1;
            queue.push(nxt);
          }
        }
      }

      for (let i = 0; i < matched.length; i++) {
        const node = clusterNodes[matched[i]];
        node.active = false;
        spawnExplosionAt(node.wx, node.wy, node.wz, node.rgb, i === 0);
      }

      const detachedCount = detachFloatingIslands();
      const totalCleared = matched.length + detachedCount;
      if (totalCleared > bestChain) bestChain = totalCleared;

      sfx.playChainPop(totalCleared);
      showComboPopup(totalCleared);
    } else {
      let dx = proj.x - hitNode.wx;
      let dy = proj.y - hitNode.wy;
      let dz = proj.z - hitNode.wz;
      const dLen = Math.hypot(dx, dy, dz) || 1.0;
      const offset = SPHERE_DIAMETER * 0.95;
      dx = (dx / dLen) * offset;
      dy = (dy / dLen) * offset;
      dz = (dz / dLen) * offset;

      const newWorldX = hitNode.wx + dx;
      const newWorldY = hitNode.wy + dy;
      const newWorldZ = hitNode.wz + dz;
      const localPos = unrotatePointEuler(newWorldX, newWorldY - CLUSTER_CENTER_Y, newWorldZ, rotX, rotY);

      const newIdx = clusterNodes.length;
      clusterNodes.push({
        id: newIdx,
        lx: localPos[0],
        ly: localPos[1],
        lz: localPos[2],
        wx: newWorldX,
        wy: newWorldY,
        wz: newWorldZ,
        colorIndex: 0,
        hex: proj.hex,
        rgb: proj.rgb,
        active: true,
        neighbors: [],
        ao: 0.92
      });
      rebuildAdjacencyAndAO(clusterNodes);

      const bridged = [];
      const visited = new Uint8Array(clusterNodes.length);
      const q = [newIdx];
      visited[newIdx] = 1;
      let head = 0;
      while (head < q.length) {
        const cur = q[head++];
        bridged.push(cur);
        const nb = clusterNodes[cur].neighbors;
        for (let k = 0; k < nb.length; k++) {
          const nxt = nb[k];
          if (clusterNodes[nxt].active && !visited[nxt] && clusterNodes[nxt].hex === proj.hex) {
            visited[nxt] = 1;
            q.push(nxt);
          }
        }
      }

      if (bridged.length >= 3) {
        for (let i = 0; i < bridged.length; i++) {
          const node = clusterNodes[bridged[i]];
          node.active = false;
          spawnExplosionAt(node.wx, node.wy, node.wz, node.rgb, i === 0);
        }
        const detachedCount = detachFloatingIslands();
        const totalCleared = bridged.length + detachedCount;
        if (totalCleared > bestChain) bestChain = totalCleared;
        sfx.playChainPop(totalCleared);
        showComboPopup(totalCleared);
      } else {
        sfx.playAttachThud();
      }
    }

    ensureLauncherColorsValid();
    updateHudUI();
    checkWinCondition();
  }

  function detachFloatingIslands() {
    let activeTotal = 0;
    for (let i = 0; i < clusterNodes.length; i++) {
      if (clusterNodes[i].active) activeTotal++;
    }
    if (activeTotal === 0) return 0;

    const thresholdClear = activeTotal / initialSphereCount < 0.055;
    const mainComp = thresholdClear ? new Set() : findMainStructuralComponent(clusterNodes);

    let detached = 0;
    const maxFalling = currentGfx.maxFallingSpheres;

    for (let i = 0; i < clusterNodes.length; i++) {
      const n = clusterNodes[i];
      if (!n.active) continue;
      if (!mainComp.has(i)) {
        n.active = false;
        detached++;
        if (fallingSpheres.length < maxFalling) {
          const radialLen = Math.hypot(n.wx, n.wz) || 1.0;
          fallingSpheres.push({
            x: n.wx,
            y: n.wy,
            z: n.wz,
            vx: (n.wx / radialLen) * (1.2 + Math.random() * 1.5) + (Math.random() - 0.5) * 0.7,
            vy: 0.7 + Math.random() * 1.3,
            vz: (n.wz / radialLen) * (1.2 + Math.random() * 1.5) + (Math.random() - 0.5) * 0.7,
            rgb: n.rgb
          });
        }
      }
    }
    return detached;
  }

  function spawnExplosionAt(wx, wy, wz, rgb, includeShockwave) {
    if (includeShockwave && shockwaves.length < 6) {
      shockwaves.push({
        x: wx,
        y: wy,
        z: wz,
        scale: 0.25,
        alpha: 0.92
      });
    }
    const pCount = currentGfx.particlesPerPop;
    if (burstParticles.length > 48) return;
    for (let p = 0; p < pCount; p++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const spd = 2.0 + Math.random() * 3.8;
      burstParticles.push({
        x: wx,
        y: wy,
        z: wz,
        vx: Math.sin(phi) * Math.cos(theta) * spd,
        vy: Math.cos(phi) * spd,
        vz: Math.sin(phi) * Math.sin(theta) * spd,
        life: 1.0,
        rgb: rgb
      });
    }
  }

  function checkWinCondition() {
    let activeNow = 0;
    for (let i = 0; i < clusterNodes.length; i++) {
      if (clusterNodes[i].active) activeNow++;
    }
    if (activeNow === 0 && !isGameOver) {
      isGameOver = true;
      clearedLevels[currentLevelNum] = Math.max(clearedLevels[currentLevelNum] || 0, bestChain);
      if (currentLevelNum + 1 > highestUnlockedLevel) {
        highestUnlockedLevel = currentLevelNum + 1;
      }
      saveLocalState();
      setTimeout(() => {
        showStageModal(true);
      }, 600);
    }
  }

  // =========================================================================
  // 10. TOUCH / POINTER INPUT (AIM LASER VS 3D ORBIT)
  // =========================================================================
  function isPointNearCluster(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top) / rect.height;
    return nx > 0.18 && nx < 0.82 && ny > 0.20 && ny < 0.78;
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (isPaused || isGameOver) return;
    sfx.initContext();
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;

    const aim = computeAimAtScreen(e.clientX, e.clientY);
    if (aim && aim.hitNodeIdx !== -1) {
      pointerMode = "aim";
      aimResult = aim;
    } else if (isPointNearCluster(e.clientX, e.clientY)) {
      pointerMode = "aim";
      aimResult = aim;
    } else {
      pointerMode = "orbit";
      aimResult = null;
    }
  });

  window.addEventListener("pointermove", (e) => {
    if (!pointerMode || isPaused || isGameOver) return;
    const dx = e.clientX - lastPointerX;
    const dy = e.clientY - lastPointerY;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;

    if (pointerMode === "orbit") {
      rotY += dx * 0.011;
      rotX = Math.max(-0.68, Math.min(0.68, rotX + dy * 0.008));
      velRotY = dx * 0.004;
      velRotX = dy * 0.002;
      updateClusterWorldCoords();
    } else if (pointerMode === "aim") {
      const aim = computeAimAtScreen(e.clientX, e.clientY);
      if ((!aim || aim.hitNodeIdx === -1) && Math.abs(dx) > 6) {
        rotY += dx * 0.009;
        rotX = Math.max(-0.68, Math.min(0.68, rotX + dy * 0.006));
        updateClusterWorldCoords();
      }
      aimResult = aim;
    }
  });

  window.addEventListener("pointerup", () => {
    if (pointerMode === "aim" && aimResult) {
      fireProjectile(aimResult);
    }
    pointerMode = null;
    aimResult = null;
  });

  // =========================================================================
  // 11. HUD, SETTINGS & STAGE MODALS
  // =========================================================================
  function showStageModal(won) {
    const overlay = document.getElementById("modal-overlay");
    const badge = document.getElementById("modal-badge");
    const title = document.getElementById("modal-title");
    const sub = document.getElementById("modal-subtitle");
    const primaryBtn = document.getElementById("btn-modal-primary");

    const mins = Math.floor(timeRemaining / 60);
    const secs = Math.max(0, Math.floor(timeRemaining % 60));
    document.getElementById("stat-time").textContent = `${mins}:${secs < 10 ? "0" + secs : secs}`;
    document.getElementById("stat-shots").textContent = String(shotsFired);
    document.getElementById("stat-max-combo").textContent = String(bestChain);

    if (won) {
      badge.textContent = "STAGE CLEARED";
      title.textContent = "COSMIC CLEAR!";
      sub.textContent = "Progress saved offline. Ready for the next cluster!";
      primaryBtn.textContent = "NEXT LEVEL";
    } else {
      badge.textContent = "OUT OF TIME";
      title.textContent = "TIME'S UP!";
      sub.textContent = "The cosmic cluster held its core. Try another angle!";
      primaryBtn.textContent = "TRY AGAIN";
    }
    overlay.classList.remove("hidden");
  }

  function hideAllModals() {
    document.getElementById("modal-overlay").classList.add("hidden");
    document.getElementById("level-modal").classList.add("hidden");
    document.getElementById("settings-modal").classList.add("hidden");
    const ghModal = document.getElementById("github-modal");
    if (ghModal) ghModal.classList.add("hidden");
  }

  let savedGithubRepo = "rounakkumar-oss/Game-";
  try {
    const storedRepo = localStorage.getItem("cosmic_pop_github_repo_v2");
    if (storedRepo) savedGithubRepo = storedRepo;
  } catch (e) {}

  function getCleanRepoSlug() {
    const input = document.getElementById("github-repo-input");
    let raw = (input ? input.value : savedGithubRepo).trim();
    raw = raw.replace(/^https?:\/\/github\.com\//i, "").replace(/\/+$/, "");
    if (!raw || !raw.includes("/")) {
      raw = "rounakkumar-oss/Game-";
    }
    savedGithubRepo = raw;
    try {
      localStorage.setItem("cosmic_pop_github_repo_v2", raw);
    } catch (e) {}
    return raw;
  }

  function updateGithubUrlPreview() {
    const slug = getCleanRepoSlug();
    const preview = document.getElementById("github-url-preview");
    if (preview) {
      preview.textContent = `https://github.com/${slug}/raw/main/Cosmic-Pop-3D.apk`;
    }
  }

  function openExternalUrlSafe(url) {
    try {
      if (window.AndroidCosmicBridge && window.AndroidCosmicBridge.openExternalUrl) {
        window.AndroidCosmicBridge.openExternalUrl(url);
        return;
      }
    } catch (e) {}
    window.open(url, "_blank");
  }

  const ghRepoInput = document.getElementById("github-repo-input");
  if (ghRepoInput) {
    ghRepoInput.value = savedGithubRepo;
    ghRepoInput.addEventListener("input", updateGithubUrlPreview);
  }
  updateGithubUrlPreview();

  const btnOpenGithubApk = document.getElementById("btn-open-github-apk");
  if (btnOpenGithubApk) {
    btnOpenGithubApk.addEventListener("click", () => {
      sfx.playSwapChime();
      document.getElementById("settings-modal").classList.add("hidden");
      updateGithubUrlPreview();
      document.getElementById("github-modal").classList.remove("hidden");
    });
  }

  const btnCloseGithub = document.getElementById("btn-close-github");
  if (btnCloseGithub) {
    btnCloseGithub.addEventListener("click", () => {
      isPaused = false;
      hideAllModals();
    });
  }

  const btnBackFromGithub = document.getElementById("btn-back-from-github");
  if (btnBackFromGithub) {
    btnBackFromGithub.addEventListener("click", () => {
      sfx.playSwapChime();
      document.getElementById("github-modal").classList.add("hidden");
      document.getElementById("settings-modal").classList.remove("hidden");
    });
  }

  const btnDlReleaseApk = document.getElementById("btn-dl-release-apk");
  if (btnDlReleaseApk) {
    btnDlReleaseApk.addEventListener("click", () => {
      sfx.playSwapChime();
      const slug = getCleanRepoSlug();
      const directApkUrl = `https://github.com/${slug}/raw/main/Cosmic-Pop-3D.apk`;
      openExternalUrlSafe(directApkUrl);
    });
  }

  const btnOpenGhActions = document.getElementById("btn-open-gh-actions");
  if (btnOpenGhActions) {
    btnOpenGhActions.addEventListener("click", () => {
      sfx.playSwapChime();
      const slug = getCleanRepoSlug();
      const actionsUrl = `https://github.com/${slug}/actions`;
      openExternalUrlSafe(actionsUrl);
    });
  }

  const btnCopyApkLink = document.getElementById("btn-copy-apk-link");
  if (btnCopyApkLink) {
    btnCopyApkLink.addEventListener("click", () => {
      sfx.playSwapChime();
      const slug = getCleanRepoSlug();
      const directApkUrl = `https://github.com/${slug}/raw/main/Cosmic-Pop-3D.apk`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(directApkUrl).catch(() => {});
      }
      btnCopyApkLink.textContent = "✓ LINK COPIED!";
      setTimeout(() => {
        btnCopyApkLink.textContent = "📋 COPY APK LINK";
      }, 1500);
    });
  }

  function populateLevelSelectGrid() {
    const grid = document.getElementById("level-grid");
    if (!grid) return;
    grid.innerHTML = "";
    const maxDisplay = Math.max(12, highestUnlockedLevel);
    for (let lvl = 1; lvl <= maxDisplay; lvl++) {
      const cfg = getLevelConfig(lvl);
      const isCleared = Boolean(clearedLevels[lvl]);
      const card = document.createElement("button");
      card.className = "level-card" + (lvl === currentLevelNum ? " active" : "");
      const dotsHtml = cfg.colors
        .map((c) => `<span class="level-dot" style="background:${c}"></span>`)
        .join("");
      const statusBadge = isCleared ? " ✓" : "";
      card.innerHTML = `
        <div class="level-card-num">${cfg.isAiGenerated ? "✦ AI STAGE " + lvl : "LEVEL " + lvl}${statusBadge}</div>
        <div class="level-card-name">${cfg.name}</div>
        <div class="level-card-dots">${dotsHtml}</div>
      `;
      card.addEventListener("click", () => {
        sfx.playSwapChime();
        loadLevel(lvl);
      });
      grid.appendChild(card);
    }
  }

  function openNativeAiStudio() {
    sfx.playSwapChime();
    hideAllModals();
    isPaused = false;
    if (window.AndroidCosmicBridge && window.AndroidCosmicBridge.openAiArchitect) {
      window.AndroidCosmicBridge.openAiArchitect();
    }
  }

  document.getElementById("btn-swap-color").addEventListener("click", swapLauncherColors);

  // Top-left Pause & Settings button
  document.getElementById("btn-pause").addEventListener("click", () => {
    sfx.playSwapChime();
    isPaused = true;
    syncSettingsTogglesUI();
    document.getElementById("settings-modal").classList.remove("hidden");
  });

  // Graphics Quality Buttons inside Settings
  document.querySelectorAll(".gfx-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-gfx");
      sfx.playSwapChime();
      applyGraphicsQuality(key, true);
    });
  });

  // Stage Navigation inside Settings
  document.getElementById("btn-prev-level").addEventListener("click", () => {
    sfx.playSwapChime();
    const prev = currentLevelNum > 1 ? currentLevelNum - 1 : 12;
    loadLevel(prev);
  });
  document.getElementById("btn-next-level").addEventListener("click", () => {
    sfx.playSwapChime();
    loadLevel(currentLevelNum + 1);
  });
  document.getElementById("btn-level-select").addEventListener("click", () => {
    sfx.playSwapChime();
    document.getElementById("settings-modal").classList.add("hidden");
    populateLevelSelectGrid();
    document.getElementById("level-modal").classList.remove("hidden");
  });
  document.getElementById("btn-back-to-settings").addEventListener("click", () => {
    sfx.playSwapChime();
    document.getElementById("level-modal").classList.add("hidden");
    document.getElementById("settings-modal").classList.remove("hidden");
  });
  document.getElementById("btn-close-levels").addEventListener("click", () => {
    isPaused = false;
    hideAllModals();
  });
  document.getElementById("btn-close-settings").addEventListener("click", () => {
    isPaused = false;
    hideAllModals();
  });
  document.getElementById("btn-settings-resume").addEventListener("click", () => {
    isPaused = false;
    hideAllModals();
  });
  document.getElementById("btn-settings-restart").addEventListener("click", () => {
    loadLevel(currentLevelNum);
  });

  document.getElementById("btn-modal-primary").addEventListener("click", () => {
    sfx.playSwapChime();
    if (remainingCount === 0) {
      loadLevel(currentLevelNum + 1);
    } else {
      loadLevel(currentLevelNum);
    }
  });
  document.getElementById("btn-modal-retry").addEventListener("click", () => {
    sfx.playSwapChime();
    loadLevel(currentLevelNum);
  });
  document.getElementById("btn-modal-levels").addEventListener("click", () => {
    sfx.playSwapChime();
    document.getElementById("modal-overlay").classList.add("hidden");
    populateLevelSelectGrid();
    document.getElementById("level-modal").classList.remove("hidden");
  });
  document.getElementById("btn-ai-studio").addEventListener("click", openNativeAiStudio);
  document.getElementById("btn-open-ai-from-levels").addEventListener("click", openNativeAiStudio);

  // Settings Toggles with Automatic Local Save
  document.getElementById("toggle-audio").addEventListener("click", () => {
    sfx.audioEnabled = !sfx.audioEnabled;
    syncSettingsTogglesUI();
    saveLocalState();
  });
  document.getElementById("toggle-haptics").addEventListener("click", () => {
    sfx.hapticsEnabled = !sfx.hapticsEnabled;
    syncSettingsTogglesUI();
    saveLocalState();
  });
  document.getElementById("toggle-autorotate").addEventListener("click", () => {
    autoRotateIdle = !autoRotateIdle;
    syncSettingsTogglesUI();
    saveLocalState();
  });

  // Hooks for optional AI Cosmic Architect Studio
  window.setAiGeneratingStatus = function (isGenerating, statusText) {
    const pill = document.getElementById("ai-live-pill");
    const txt = document.getElementById("ai-live-text");
    if (!pill || !txt) return;
    if (isGenerating) {
      txt.textContent = statusText || "AI Sculpting 3D Cluster…";
      pill.classList.remove("hidden");
    } else {
      pill.classList.add("hidden");
    }
  };

  window.applyAiCosmicBlueprint = function (blueprintJson) {
    try {
      const data = typeof blueprintJson === "string" ? JSON.parse(blueprintJson) : blueprintJson;
      const aiConfig = {
        level: currentLevelNum,
        name: data.levelName || "AI Cosmic Prism",
        shape: (data.shapeType || "pyramid").toLowerCase(),
        bgInner: data.bgInnerHex || "#6D4AA8",
        bgOuter: data.bgOuterHex || "#3B2268",
        timeLimit: data.timeLimitSeconds || 75,
        twist: data.twistFactor || 0.0,
        colors: Array.isArray(data.sphereColors) && data.sphereColors.length >= 3
          ? data.sphereColors
          : ["#FF4D9D", "#38BDF8", "#A855F7"],
        isAiGenerated: true
      };
      loadLevel(currentLevelNum, aiConfig);
    } catch (err) {
      console.error("Failed to apply AI blueprint:", err);
    }
  };

  window.applyAiCosmicBackground = function (dataUrl) {
    const overlay = document.getElementById("ai-bg-overlay");
    if (!overlay) return;
    if (dataUrl) {
      overlay.style.backgroundImage = `url(${dataUrl})`;
      overlay.classList.add("visible");
    } else {
      overlay.classList.remove("visible");
    }
  };

  setInterval(() => {
    if (isPaused || isGameOver) return;
    if (timeRemaining > 0) {
      timeRemaining--;
      updateTimerUI();
      if (timeRemaining <= 0 && remainingCount > 0) {
        isGameOver = true;
        showStageModal(false);
      }
    }
  }, 1000);

  // =========================================================================
  // 12. 60 FPS MAIN PHYSICS & WEBGL RENDER LOOP
  // =========================================================================
  let lastViewportW = 0;
  let lastViewportH = 0;

  function resizeViewport() {
    const dpr = Math.min(window.devicePixelRatio || 1, currentGfx.dprCap);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (w !== lastViewportW || h !== lastViewportH) {
      lastViewportW = w;
      lastViewportH = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      const aspect = w / Math.max(1, h);
      mat4Perspective(projMatrix, (46 * Math.PI) / 180, aspect, 0.5, 40.0);
      mat4Multiply(projViewMatrix, projMatrix, viewMatrix);
      mat4Invert(invProjViewMatrix, projViewMatrix);
    }
  }
  window.addEventListener("resize", resizeViewport);

  let lastFrameTime = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min(0.033, (now - lastFrameTime) / 1000);
    lastFrameTime = now;

    if (!isPaused) {
      updatePhysics(dt);
    }
    renderScene(now * 0.001);
  }

  function updatePhysics(dt) {
    // 1. Rotate central 3D sphere cluster & refresh cached world coords only when moved
    if (pointerMode !== "orbit") {
      let moved = false;
      if (Math.abs(velRotY) > 1e-5 || Math.abs(velRotX) > 1e-5) {
        rotY += velRotY;
        rotX = Math.max(-0.68, Math.min(0.68, rotX + velRotX));
        velRotY *= 0.91;
        velRotX *= 0.91;
        moved = true;
      }
      if (autoRotateIdle && pointerMode !== "aim") {
        rotY += dt * 0.24;
        moved = true;
      }
      if (moved) {
        updateClusterWorldCoords();
      }
    }

    // 2. Fired projectile collision using cached world coords (zero allocations)
    if (projectile) {
      const subSteps = 2;
      const subDt = dt / subSteps;
      const hitDistSq = (SPHERE_DIAMETER * 0.96) * (SPHERE_DIAMETER * 0.96);

      for (let s = 0; s < subSteps; s++) {
        projectile.x += projectile.vx * subDt;
        projectile.y += projectile.vy * subDt;
        projectile.z += projectile.vz * subDt;

        let closestIdx = -1;
        let closestD2 = hitDistSq;

        for (let i = 0; i < clusterNodes.length; i++) {
          const n = clusterNodes[i];
          if (!n.active) continue;
          const dx = projectile.x - n.wx;
          const dy = projectile.y - n.wy;
          const dz = projectile.z - n.wz;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 <= closestD2) {
            closestD2 = d2;
            closestIdx = i;
          }
        }

        if (closestIdx !== -1) {
          const firedProj = projectile;
          projectile = null;
          handleProjectileHit(closestIdx, firedProj);
          break;
        }
      }

      if (projectile && (Math.abs(projectile.y) > 9.0 || Math.abs(projectile.x) > 7.0 || Math.abs(projectile.z) > 12.0)) {
        projectile = null;
      }
    }

    // 3. Detached falling rigid-body spheres with gravity (-18 m/s²) & collector ring bounce
    const GRAVITY = -18.0;
    for (let i = fallingSpheres.length - 1; i >= 0; i--) {
      const fs = fallingSpheres[i];
      const prevY = fs.y;
      fs.vy += GRAVITY * dt;
      fs.x += fs.vx * dt;
      fs.y += fs.vy * dt;
      fs.z += fs.vz * dt;

      if (prevY >= RING_Y + SPHERE_RADIUS * 0.5 && fs.y <= RING_Y + SPHERE_RADIUS && fs.vy < 0) {
        const radial = Math.hypot(fs.x, fs.z);
        if (radial >= 0.72 && radial <= 3.35) {
          fs.y = RING_Y + SPHERE_RADIUS;
          fs.vy = -fs.vy * 0.62;
          const invR = radial > 0.01 ? 1.0 / radial : 0.7;
          fs.vx += fs.x * invR * 2.35;
          fs.vz += fs.z * invR * 2.35;
          ringRippleFlash = 1.0;
          sfx.playGlassBounce();
        }
      }

      if (fs.y < -7.0) {
        fallingSpheres.splice(i, 1);
      }
    }

    // 4. Update shockwaves & burst particles
    if (ringRippleFlash > 0) {
      ringRippleFlash = Math.max(0.0, ringRippleFlash - dt * 3.2);
    }
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      shockwaves[i].scale += dt * 4.8;
      shockwaves[i].alpha -= dt * 2.6;
      if (shockwaves[i].alpha <= 0) shockwaves.splice(i, 1);
    }
    for (let i = burstParticles.length - 1; i >= 0; i--) {
      const p = burstParticles[i];
      p.vy -= 8.5 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.life -= dt * 2.4;
      if (p.life <= 0) burstParticles.splice(i, 1);
    }
  }

  function renderScene(timeSec) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // -----------------------------------------------------------------------
    // PASS 1: Floating Background Bokeh (uses pre-uploaded VBO, zero bufferData)
    // -----------------------------------------------------------------------
    gl.useProgram(effectProg);
    gl.uniformMatrix4fv(effectLocs.uProjView, false, projViewMatrix);
    gl.uniformMatrix3fv(effectLocs.uRot, false, identity3);
    gl.uniform1f(effectLocs.uScale, 1.0);
    gl.uniform3f(effectLocs.uOffset, 0, Math.sin(timeSec * 0.4) * 0.35, 0);
    gl.uniform4f(effectLocs.uColor, 1.0, 1.0, 1.0, 0.36);

    gl.bindBuffer(gl.ARRAY_BUFFER, bokehVbo);
    gl.enableVertexAttribArray(effectLocs.aPos);
    gl.vertexAttribPointer(effectLocs.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, currentGfx.bokehCount);

    // -----------------------------------------------------------------------
    // PASS 2: Glossy 3D Spheres with Back-Face Culling & Active LOD Mesh
    // -----------------------------------------------------------------------
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    const activeSphereMesh = sphereMeshesByQuality[currentGfxKey] || sphereMeshesByQuality.low;

    gl.useProgram(sphereProg);
    gl.uniformMatrix4fv(sphereLocs.uProjView, false, projViewMatrix);
    gl.uniform3f(sphereLocs.uCameraPos, CAMERA_POS[0], CAMERA_POS[1], CAMERA_POS[2]);
    gl.uniformMatrix3fv(sphereLocs.uClusterRot, false, clusterRot3);
    gl.uniform1f(sphereLocs.uQuality, currentGfx.shaderQuality);

    gl.bindBuffer(gl.ARRAY_BUFFER, activeSphereMesh.vbo);
    gl.enableVertexAttribArray(sphereLocs.aPos);
    gl.vertexAttribPointer(sphereLocs.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, activeSphereMesh.ibo);

    // 2a. Render 3D Cluster Spheres using pre-computed world centers
    gl.uniform1f(sphereLocs.uIsClusterLocal, 1.0);
    gl.uniform1f(sphereLocs.uSphereRadius, SPHERE_RADIUS);
    const targetedIdx = aimResult ? aimResult.hitNodeIdx : -1;

    for (let i = 0; i < clusterNodes.length; i++) {
      const n = clusterNodes[i];
      if (!n.active) continue;
      gl.uniform3f(sphereLocs.uSphereCenter, n.wx, n.wy, n.wz);
      gl.uniform3f(sphereLocs.uColor, n.rgb[0], n.rgb[1], n.rgb[2]);
      gl.uniform1f(sphereLocs.uAO, n.ao);
      gl.uniform1f(sphereLocs.uFlash, targetedIdx === i ? 0.28 : 0.0);
      gl.drawElements(gl.TRIANGLES, activeSphereMesh.count, gl.UNSIGNED_SHORT, 0);
    }

    // 2b. Render Detached Falling Spheres, Active Projectile & Launcher Core
    gl.uniform1f(sphereLocs.uIsClusterLocal, 0.0);
    gl.uniform1f(sphereLocs.uAO, 1.0);
    gl.uniform1f(sphereLocs.uFlash, 0.0);

    for (let i = 0; i < fallingSpheres.length; i++) {
      const fs = fallingSpheres[i];
      gl.uniform3f(sphereLocs.uSphereCenter, fs.x, fs.y, fs.z);
      gl.uniform3f(sphereLocs.uColor, fs.rgb[0], fs.rgb[1], fs.rgb[2]);
      gl.drawElements(gl.TRIANGLES, activeSphereMesh.count, gl.UNSIGNED_SHORT, 0);
    }

    if (projectile) {
      gl.uniform1f(sphereLocs.uSphereRadius, SPHERE_RADIUS * 1.04);
      gl.uniform1f(sphereLocs.uFlash, 0.18);
      gl.uniform3f(sphereLocs.uSphereCenter, projectile.x, projectile.y, projectile.z);
      gl.uniform3f(sphereLocs.uColor, projectile.rgb[0], projectile.rgb[1], projectile.rgb[2]);
      gl.drawElements(gl.TRIANGLES, activeSphereMesh.count, gl.UNSIGNED_SHORT, 0);
    }

    // 2c. 3D Launcher Sphere at Bottom-Center
    const launcherRgb = hexToRgb(currentShotColor);
    gl.uniform1f(sphereLocs.uSphereRadius, SPHERE_RADIUS * 1.18);
    gl.uniform1f(sphereLocs.uFlash, 0.12 + 0.05 * Math.sin(timeSec * 4.0));
    gl.uniform3f(sphereLocs.uSphereCenter, LAUNCHER_POS[0], LAUNCHER_POS[1], LAUNCHER_POS[2]);
    gl.uniform3f(sphereLocs.uColor, launcherRgb[0], launcherRgb[1], launcherRgb[2]);
    gl.drawElements(gl.TRIANGLES, activeSphereMesh.count, gl.UNSIGNED_SHORT, 0);

    // 2d. Ultra-low-poly 3D Burst Particles
    if (burstParticles.length > 0) {
      const pMesh = sphereMeshesByQuality.particle;
      gl.bindBuffer(gl.ARRAY_BUFFER, pMesh.vbo);
      gl.vertexAttribPointer(sphereLocs.aPos, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pMesh.ibo);
      gl.uniform1f(sphereLocs.uFlash, 0.45);
      for (let i = 0; i < burstParticles.length; i++) {
        const p = burstParticles[i];
        gl.uniform1f(sphereLocs.uSphereRadius, SPHERE_RADIUS * 0.34 * p.life);
        gl.uniform3f(sphereLocs.uSphereCenter, p.x, p.y, p.z);
        gl.uniform3f(sphereLocs.uColor, p.rgb[0], p.rgb[1], p.rgb[2]);
        gl.drawElements(gl.TRIANGLES, pMesh.count, gl.UNSIGNED_SHORT, 0);
      }
    }

    gl.disable(gl.CULL_FACE);

    // -----------------------------------------------------------------------
    // PASS 3: Translucent Glass Collector Ring, 3 Launcher Orbital Rings,
    //         Dotted Trajectory Laser & Target Reticle
    // -----------------------------------------------------------------------
    gl.useProgram(effectProg);
    gl.uniformMatrix4fv(effectLocs.uProjView, false, projViewMatrix);

    gl.depthMask(false);
    gl.uniformMatrix3fv(effectLocs.uRot, false, identity3);
    gl.uniform1f(effectLocs.uScale, 1.0);
    gl.uniform3f(effectLocs.uOffset, 0, RING_Y, 0);
    gl.uniform4f(effectLocs.uColor, 0.92, 0.95, 1.0, 0.18 + ringRippleFlash * 0.16);

    gl.bindBuffer(gl.ARRAY_BUFFER, ringMesh.discVbo);
    gl.vertexAttribPointer(effectLocs.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, ringMesh.discCount);

    gl.uniform4f(effectLocs.uColor, 1.0, 1.0, 1.0, 0.62 + ringRippleFlash * 0.35);
    gl.bindBuffer(gl.ARRAY_BUFFER, ringMesh.outerVbo);
    gl.vertexAttribPointer(effectLocs.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, ringMesh.rimCount);

    gl.bindBuffer(gl.ARRAY_BUFFER, ringMesh.innerVbo);
    gl.vertexAttribPointer(effectLocs.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, ringMesh.rimCount);

    // 3 Concentric, Tilted, Rotating White Orbital Rings around Launcher
    gl.bindBuffer(gl.ARRAY_BUFFER, circleMesh.vbo);
    gl.vertexAttribPointer(effectLocs.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.uniform3f(effectLocs.uOffset, LAUNCHER_POS[0], LAUNCHER_POS[1], LAUNCHER_POS[2]);

    writeEulerToMat3(tempRot3, 1.05 + timeSec * 0.7, timeSec * 0.9, 0.35);
    gl.uniformMatrix3fv(effectLocs.uRot, false, tempRot3);
    gl.uniform1f(effectLocs.uScale, 0.56);
    gl.uniform4f(effectLocs.uColor, 1.0, 1.0, 1.0, 0.86);
    gl.drawArrays(gl.LINE_STRIP, 0, circleMesh.count);

    writeEulerToMat3(tempRot3, -0.85, timeSec * -1.1, 0.95 + timeSec * 0.5);
    gl.uniformMatrix3fv(effectLocs.uRot, false, tempRot3);
    gl.uniform1f(effectLocs.uScale, 0.68);
    gl.uniform4f(effectLocs.uColor, 1.0, 1.0, 1.0, 0.68);
    gl.drawArrays(gl.LINE_STRIP, 0, circleMesh.count);

    writeEulerToMat3(tempRot3, 0.45 + timeSec * 0.4, 0.75, -timeSec * 0.85);
    gl.uniformMatrix3fv(effectLocs.uRot, false, tempRot3);
    gl.uniform1f(effectLocs.uScale, 0.80);
    gl.uniform4f(effectLocs.uColor, 1.0, 1.0, 1.0, 0.52);
    gl.drawArrays(gl.LINE_STRIP, 0, circleMesh.count);

    // Shockwave Ripples
    for (let i = 0; i < shockwaves.length; i++) {
      const sw = shockwaves[i];
      gl.uniform3f(effectLocs.uOffset, sw.x, sw.y, sw.z);
      gl.uniformMatrix3fv(effectLocs.uRot, false, identity3);
      gl.uniform1f(effectLocs.uScale, sw.scale);
      gl.uniform4f(effectLocs.uColor, 1.0, 1.0, 1.0, sw.alpha);
      gl.drawArrays(gl.LINE_STRIP, 0, circleMesh.count);
    }

    // Dotted White Trajectory Laser & Target Reticle Ring
    if (pointerMode === "aim" && aimResult) {
      writeNormalToMat3(tempRot3, aimResult.nx, aimResult.ny, aimResult.nz);
      gl.uniform3f(
        effectLocs.uOffset,
        aimResult.tx + aimResult.nx * 0.04,
        aimResult.ty + aimResult.ny * 0.04,
        aimResult.tz + aimResult.nz * 0.04
      );
      gl.uniformMatrix3fv(effectLocs.uRot, false, tempRot3);
      gl.uniform1f(effectLocs.uScale, 0.34 + 0.04 * Math.sin(timeSec * 12.0));
      gl.uniform4f(effectLocs.uColor, 1.0, 1.0, 1.0, 0.96);
      gl.drawArrays(gl.LINE_STRIP, 0, circleMesh.count);

      gl.uniform1f(effectLocs.uScale, 0.16);
      gl.uniform4f(effectLocs.uColor, launcherRgb[0], launcherRgb[1], launcherRgb[2], 0.95);
      gl.drawArrays(gl.LINE_STRIP, 0, circleMesh.count);

      const dx = aimResult.tx - LAUNCHER_POS[0];
      const dy = aimResult.ty - LAUNCHER_POS[1];
      const dz = aimResult.tz - LAUNCHER_POS[2];
      for (let d = 0; d < LASER_DASH_COUNT; d++) {
        const t0 = (d + 0.15) / LASER_DASH_COUNT;
        const t1 = (d + 0.62) / LASER_DASH_COUNT;
        const base = d * 6;
        laserVertsArray[base]     = LAUNCHER_POS[0] + dx * t0;
        laserVertsArray[base + 1] = LAUNCHER_POS[1] + dy * t0;
        laserVertsArray[base + 2] = LAUNCHER_POS[2] + dz * t0;
        laserVertsArray[base + 3] = LAUNCHER_POS[0] + dx * t1;
        laserVertsArray[base + 4] = LAUNCHER_POS[1] + dy * t1;
        laserVertsArray[base + 5] = LAUNCHER_POS[2] + dz * t1;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, dynamicLineVbo);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, laserVertsArray);
      gl.vertexAttribPointer(effectLocs.aPos, 3, gl.FLOAT, false, 0, 0);
      gl.uniform3f(effectLocs.uOffset, 0, 0, 0);
      gl.uniformMatrix3fv(effectLocs.uRot, false, identity3);
      gl.uniform1f(effectLocs.uScale, 1.0);
      gl.uniform4f(effectLocs.uColor, 1.0, 1.0, 1.0, 0.92);
      gl.drawArrays(gl.LINES, 0, LASER_DASH_COUNT * 2);
    }

    gl.depthMask(true);
  }

  window.CosmicPop3DController = {
    pause: function () {
      isPaused = true;
    },
    resume: function () {
      isPaused = false;
      lastFrameTime = performance.now();
    }
  };

  // Restore saved offline progress & settings (defaults to Low Graphics and Level 3)
  loadLocalState();
  applyGraphicsQuality(currentGfxKey, false);
  syncSettingsTogglesUI();
  loadLevel(currentLevelNum);
  requestAnimationFrame(animate);
})();
