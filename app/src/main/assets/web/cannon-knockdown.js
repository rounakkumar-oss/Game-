/**
 * PHASE 2: GAME TWO – CANNON KNOCKDOWN 3D
 * Complete 3D Physics-Based Cannon Shooting Game (9 Handcrafted Levels across 3 Worlds)
 *
 * Features:
 * - Touch / Mouse drag aiming with predictive dotted 3D trajectory arc
 * - Large red FIRE button (#btn-cannon-fire) + Explosive Power-up Cannonball toggle
 * - Cannon recoil, muzzle flash, volumetric smoke particles, and camera shake
 * - 3D Rigid-Body Physics (gravity, momentum transfer, angular spin, stacking, chain reactions,
 *   slippery ice friction, and moving blocker shield deflection)
 * - 9 Handcrafted Levels across 3 Worlds:
 *   * World 1 (Levels 1–3): Wild West Desert Carnival (Sunset desert, cacti, mesas, wooden booths, crates, barrels, cans)
 *   * World 2 (Levels 4–6): Cyberpunk Neon City (Neon skyscrapers, glowing grid, futuristic platforms, neon cubes, neon cans, moving blockers)
 *   * World 3 (Levels 7–9): Ice Castle Winter Kingdom (Snow mountains, pine trees, fantasy ice castle, slippery ice blocks, winter cans)
 * - Combos: DOUBLE, TRIPLE, ULTRA, MEGA, and PERFECT!
 * - Unique Web Audio API sound effects for every material (tin can, wooden crate, oak barrel, ice block, neon cube, blocker shield)
 * - Level Selection, Pause, Restart, Victory screens & Offline LocalStorage persistence
 */

(function () {
  "use strict";

  const CANNON_SAVE_KEY = "cosmic_cannon_knockdown_save_v1";

  // =========================================================================
  // 1. ORIGINAL LOGO & THUMBNAIL FOR GAME HUB CAROUSEL
  // =========================================================================
  const CANNON_LOGO_SVG = `
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <radialGradient id="ckBg" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#F97316"/>
          <stop offset="60%" stop-color="#B91C1C"/>
          <stop offset="100%" stop-color="#31102F"/>
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#ckBg)" stroke="#FACC15" stroke-width="2.5"/>
      <!-- Cannon Barrel -->
      <g transform="translate(30, 34) rotate(-28)">
        <rect x="-16" y="-8" width="30" height="16" rx="5" fill="#1E293B" stroke="#FACC15" stroke-width="2"/>
        <rect x="11" y="-10" width="5" height="20" rx="2" fill="#FACC15"/>
        <circle cx="-18" cy="0" r="4" fill="#FACC15"/>
      </g>
      <!-- Wooden Carriage Wheel -->
      <circle cx="24" cy="43" r="9" fill="#9A3412" stroke="#FDE047" stroke-width="2.5"/>
      <circle cx="24" cy="43" r="3" fill="#FDE047"/>
      <!-- Muzzle Spark -->
      <circle cx="49" cy="18" r="6" fill="#FEF08A"/>
      <circle cx="49" cy="18" r="3.5" fill="#EF4444"/>
    </svg>
  `;

  const CANNON_THUMB_SVG = `
    <svg viewBox="0 0 320 176" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="ckSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#7C2D12"/>
          <stop offset="55%" stop-color="#EA580C"/>
          <stop offset="100%" stop-color="#FACC15"/>
        </linearGradient>
      </defs>
      <rect width="320" height="176" fill="url(#ckSky)"/>
      <!-- Desert Mesas & Cyberpunk / Ice Silhouettes -->
      <polygon points="0,140 35,98 85,98 115,140" fill="#9A3412" opacity="0.85"/>
      <polygon points="210,140 245,84 295,84 320,140" fill="#7C2D12" opacity="0.85"/>
      <rect x="0" y="136" width="320" height="40" fill="#451A03"/>
      <!-- Carnival Booth Platform & Stacked Cans/Crates -->
      <rect x="155" y="108" width="110" height="12" rx="4" fill="#B45309" stroke="#FDE047" stroke-width="1.5"/>
      <!-- Crates & Cans Stack -->
      <rect x="170" y="80" width="26" height="28" rx="3" fill="#D97706" stroke="#78350F" stroke-width="2"/>
      <rect x="200" y="80" width="26" height="28" rx="3" fill="#38BDF8" stroke="#E0F2FE" stroke-width="2"/>
      <rect x="230" y="80" width="22" height="28" rx="4" fill="#EF4444" stroke="#FFF" stroke-width="2"/>
      <rect x="184" y="52" width="22" height="28" rx="4" fill="#EF4444" stroke="#FFF" stroke-width="2"/>
      <rect x="212" y="52" width="24" height="28" rx="3" fill="#111827" stroke="#00F5D4" stroke-width="2"/>
      <!-- Dotted 3D Trajectory Arc -->
      <path d="M 68 122 Q 130 35 195 66" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="5 5"/>
      <!-- Flying Cannonball & Explosion -->
      <circle cx="195" cy="66" r="14" fill="#FACC15" opacity="0.85"/>
      <circle cx="188" cy="64" r="8" fill="#1F2937" stroke="#FFF" stroke-width="1.5"/>
      <!-- Pirate Cannon in Foreground -->
      <g transform="translate(56, 128) rotate(-24)">
        <rect x="-22" y="-10" width="44" height="20" rx="6" fill="#1E293B" stroke="#FACC15" stroke-width="2"/>
      </g>
      <circle cx="52" cy="138" r="12" fill="#78350F" stroke="#FACC15" stroke-width="2.5"/>
    </svg>
  `;

  // =========================================================================
  // 2. MATERIAL-SPECIFIC WEB AUDIO SOUND SYNTHESIZER
  // =========================================================================
  class CannonSoundEngine {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    }

    vibrate(ms) {
      try {
        if (window.AndroidCosmicBridge && window.AndroidCosmicBridge.vibrate) {
          window.AndroidCosmicBridge.vibrate(ms);
          return;
        }
        if (navigator.vibrate) navigator.vibrate(ms);
      } catch (e) {}
    }

    playCannonFire(isExplosive) {
      this.vibrate(isExplosive ? 45 : 28);
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Deep punchy cannon thump
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(isExplosive ? 165 : 135, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.32);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }

    playExplosion() {
      this.vibrate(65);
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [95, 62, 140];
      freqs.forEach((f) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(18, now + 0.45);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.48);
      });
    }

    playMaterialHit(materialType) {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (materialType === "tincan") {
        // Metallic tin can ring
        this.vibrate(12);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(880 + Math.random() * 220, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.11);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      } else if (materialType === "crate") {
        // Wooden crate crack
        this.vibrate(16);
        osc.type = "square";
        osc.frequency.setValueAtTime(210, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.09);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      } else if (materialType === "barrel") {
        // Heavy oak barrel thud
        this.vibrate(22);
        osc.type = "sine";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(48, now + 0.16);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      } else if (materialType === "ice") {
        // Crystalline winter ice chime
        this.vibrate(12);
        osc.type = "sine";
        osc.frequency.setValueAtTime(1320 + Math.random() * 350, now);
        osc.frequency.exponentialRampToValueAtTime(1960, now + 0.14);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      } else if (materialType === "cyber") {
        // Sci-fi neon cube synth zap
        this.vibrate(18);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.14);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      } else {
        // Heavy metal blocker clang
        this.vibrate(26);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(310, now + 0.18);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }

    playComboFanfare(comboCount) {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const base = [523.25, 659.25, 783.99, 1046.5];
      const shift = Math.min(5, comboCount - 2) * 55;
      base.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f + shift, now + i * 0.05);
        gain.gain.setValueAtTime(0.16, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.24);
      });
    }
  }

  const sfx = new CannonSoundEngine();

  // =========================================================================
  // 3. 9 HANDCRAFTED LEVELS ACROSS 3 WORLDS
  // =========================================================================
  const CANNON_LEVELS = [
    // WORLD 1: WILD WEST DESERT CARNIVAL (Levels 1–3)
    {
      level: 1,
      worldId: 1,
      worldName: "Wild West Desert Carnival",
      title: "Sunset Can Pyramid",
      ammo: 5,
      explosiveAmmo: 1,
      platformWidth: 6.4,
      platformZ: -11.5,
      platformY: -1.1,
      friction: 0.45,
      blockers: [],
      targets: [
        // Base row of Slatted Wooden Crates
        { type: "slatted_wooden_crate", mat: "crate", x: -1.3, y: -0.55, z: -11.5, mass: 1.6 },
        { type: "slatted_wooden_crate", mat: "crate", x: 0.0, y: -0.55, z: -11.5, mass: 1.6 },
        { type: "slatted_wooden_crate", mat: "crate", x: 1.3, y: -0.55, z: -11.5, mass: 1.6 },
        // Mid row of Carnival Tin Cans (Skin 1)
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: -1.5, y: 0.52, z: -11.5, mass: 0.8 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: -0.5, y: 0.52, z: -11.5, mass: 0.8 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 0.5, y: 0.52, z: -11.5, mass: 0.8 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 1.5, y: 0.52, z: -11.5, mass: 0.8 },
        // Top pyramid cans
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: -0.9, y: 1.6, z: -11.5, mass: 0.75 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 0.0, y: 1.6, z: -11.5, mass: 0.75 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 0.9, y: 1.6, z: -11.5, mass: 0.75 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 0.0, y: 2.68, z: -11.5, mass: 0.7 }
      ]
    },
    {
      level: 2,
      worldId: 1,
      worldName: "Wild West Desert Carnival",
      title: "Mesa Barrel Saloon",
      ammo: 5,
      explosiveAmmo: 1,
      platformWidth: 6.8,
      platformZ: -12.0,
      platformY: -1.1,
      friction: 0.45,
      blockers: [],
      targets: [
        // Heavy Banded Oak Barrels on bottom
        { type: "banded_oak_barrel", mat: "barrel", x: -1.8, y: -0.45, z: -12.0, mass: 2.2 },
        { type: "banded_oak_barrel", mat: "barrel", x: 0.0, y: -0.45, z: -12.0, mass: 2.2 },
        { type: "banded_oak_barrel", mat: "barrel", x: 1.8, y: -0.45, z: -12.0, mass: 2.2 },
        // Slatted Wooden Crates bridge
        { type: "slatted_wooden_crate", mat: "crate", x: -0.9, y: 0.72, z: -12.0, mass: 1.4 },
        { type: "slatted_wooden_crate", mat: "crate", x: 0.9, y: 0.72, z: -12.0, mass: 1.4 },
        // Tin Cans crown
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: -1.9, y: 0.75, z: -12.0, mass: 0.8 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 1.9, y: 0.75, z: -12.0, mass: 0.8 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: -1.1, y: 1.8, z: -12.0, mass: 0.75 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 0.0, y: 1.8, z: -12.0, mass: 0.75 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 1.1, y: 1.8, z: -12.0, mass: 0.75 },
        { type: "banded_oak_barrel", mat: "barrel", x: 0.0, y: 2.95, z: -12.0, mass: 1.8 }
      ]
    },
    {
      level: 3,
      worldId: 1,
      worldName: "Wild West Desert Carnival",
      title: "Outlaw Shield Showdown",
      ammo: 6,
      explosiveAmmo: 2,
      platformWidth: 7.0,
      platformZ: -12.4,
      platformY: -1.1,
      friction: 0.44,
      blockers: [
        { x: 0, y: 0.4, z: -8.6, ampX: 2.3, speed: 1.65, phase: 0 }
      ],
      targets: [
        { type: "banded_oak_barrel", mat: "barrel", x: -2.0, y: -0.45, z: -12.4, mass: 2.1 },
        { type: "slatted_wooden_crate", mat: "crate", x: -0.7, y: -0.55, z: -12.4, mass: 1.5 },
        { type: "slatted_wooden_crate", mat: "crate", x: 0.7, y: -0.55, z: -12.4, mass: 1.5 },
        { type: "banded_oak_barrel", mat: "barrel", x: 2.0, y: -0.45, z: -12.4, mass: 2.1 },
        { type: "slatted_wooden_crate", mat: "crate", x: -1.4, y: 0.65, z: -12.4, mass: 1.4 },
        { type: "banded_oak_barrel", mat: "barrel", x: 0.0, y: 0.68, z: -12.4, mass: 1.9 },
        { type: "slatted_wooden_crate", mat: "crate", x: 1.4, y: 0.65, z: -12.4, mass: 1.4 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: -1.5, y: 1.78, z: -12.4, mass: 0.75 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: -0.5, y: 1.78, z: -12.4, mass: 0.75 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 0.5, y: 1.78, z: -12.4, mass: 0.75 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 1.5, y: 1.78, z: -12.4, mass: 0.75 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 0.0, y: 2.85, z: -12.4, mass: 0.7 }
      ]
    },

    // WORLD 2: CYBERPUNK NEON CITY (Levels 4–6)
    {
      level: 4,
      worldId: 2,
      worldName: "Cyberpunk Neon City",
      title: "Synthwave Neon Monolith",
      ammo: 5,
      explosiveAmmo: 1,
      platformWidth: 6.6,
      platformZ: -12.0,
      platformY: -1.1,
      friction: 0.35,
      blockers: [],
      targets: [
        { type: "cyberpunk_neon_cube", mat: "cyber", x: -1.5, y: -0.55, z: -12.0, mass: 1.5 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: 0.0, y: -0.55, z: -12.0, mass: 1.5 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: 1.5, y: -0.55, z: -12.0, mass: 1.5 },
        { type: "carnival_tin_can", skin: 2, mat: "tincan", x: -1.6, y: 0.55, z: -12.0, mass: 0.8 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: -0.55, y: 0.52, z: -12.0, mass: 1.4 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: 0.55, y: 0.52, z: -12.0, mass: 1.4 },
        { type: "carnival_tin_can", skin: 2, mat: "tincan", x: 1.6, y: 0.55, z: -12.0, mass: 0.8 },
        { type: "carnival_tin_can", skin: 2, mat: "tincan", x: -1.0, y: 1.62, z: -12.0, mass: 0.75 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: 0.0, y: 1.60, z: -12.0, mass: 1.3 },
        { type: "carnival_tin_can", skin: 2, mat: "tincan", x: 1.0, y: 1.62, z: -12.0, mass: 0.75 },
        { type: "carnival_tin_can", skin: 2, mat: "tincan", x: 0.0, y: 2.7, z: -12.0, mass: 0.7 }
      ]
    },
    {
      level: 5,
      worldId: 2,
      worldName: "Cyberpunk Neon City",
      title: "Laser Grid Sentinel",
      ammo: 6,
      explosiveAmmo: 2,
      platformWidth: 6.8,
      platformZ: -12.5,
      platformY: -1.1,
      friction: 0.34,
      blockers: [
        { x: 0, y: 0.55, z: -8.8, ampX: 2.5, speed: 2.05, phase: 0.5 }
      ],
      targets: [
        { type: "cyberpunk_neon_cube", mat: "cyber", x: -1.9, y: -0.55, z: -12.5, mass: 1.5 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: -0.65, y: -0.55, z: -12.5, mass: 1.5 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: 0.65, y: -0.55, z: -12.5, mass: 1.5 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: 1.9, y: -0.55, z: -12.5, mass: 1.5 },
        { type: "carnival_tin_can", skin: 2, mat: "tincan", x: -1.4, y: 0.55, z: -12.5, mass: 0.8 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: 0.0, y: 0.52, z: -12.5, mass: 1.4 },
        { type: "carnival_tin_can", skin: 2, mat: "tincan", x: 1.4, y: 0.55, z: -12.5, mass: 0.8 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: -0.7, y: 1.6, z: -12.5, mass: 1.3 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: 0.7, y: 1.6, z: -12.5, mass: 1.3 },
        { type: "carnival_tin_can", skin: 2, mat: "tincan", x: -0.7, y: 2.68, z: -12.5, mass: 0.75 },
        { type: "carnival_tin_can", skin: 2, mat: "tincan", x: 0.7, y: 2.68, z: -12.5, mass: 0.75 }
      ]
    },
    {
      level: 6,
      worldId: 2,
      worldName: "Cyberpunk Neon City",
      title: "Twin Cyber Blocker Core",
      ammo: 6,
      explosiveAmmo: 2,
      platformWidth: 7.2,
      platformZ: -12.8,
      platformY: -1.1,
      friction: 0.32,
      blockers: [
        { x: -1.2, y: 0.2, z: -8.5, ampX: 1.8, speed: 2.1, phase: 0 },
        { x: 1.2, y: 1.45, z: -9.4, ampX: 1.8, speed: 2.1, phase: 3.14 }
      ],
      targets: [
        { type: "cyberpunk_neon_cube", mat: "cyber", x: -2.1, y: -0.55, z: -12.8, mass: 1.5 },
        { type: "banded_oak_barrel", mat: "barrel", x: -0.7, y: -0.45, z: -12.8, mass: 1.9 },
        { type: "banded_oak_barrel", mat: "barrel", x: 0.7, y: -0.45, z: -12.8, mass: 1.9 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: 2.1, y: -0.55, z: -12.8, mass: 1.5 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: -1.4, y: 0.65, z: -12.8, mass: 1.4 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: 0.0, y: 0.65, z: -12.8, mass: 1.4 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: 1.4, y: 0.65, z: -12.8, mass: 1.4 },
        { type: "carnival_tin_can", skin: 2, mat: "tincan", x: -1.5, y: 1.75, z: -12.8, mass: 0.75 },
        { type: "carnival_tin_can", skin: 2, mat: "tincan", x: -0.5, y: 1.75, z: -12.8, mass: 0.75 },
        { type: "carnival_tin_can", skin: 2, mat: "tincan", x: 0.5, y: 1.75, z: -12.8, mass: 0.75 },
        { type: "carnival_tin_can", skin: 2, mat: "tincan", x: 1.5, y: 1.75, z: -12.8, mass: 0.75 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: 0.0, y: 2.82, z: -12.8, mass: 1.2 }
      ]
    },

    // WORLD 3: ICE CASTLE WINTER KINGDOM (Levels 7–9)
    {
      level: 7,
      worldId: 3,
      worldName: "Ice Castle Winter Kingdom",
      title: "Slippery Glacier Bastion",
      ammo: 5,
      explosiveAmmo: 1,
      platformWidth: 6.8,
      platformZ: -12.0,
      platformY: -1.1,
      friction: 0.07, // Ultra slippery ice!
      blockers: [],
      targets: [
        { type: "winter_ice_block", mat: "ice", x: -1.6, y: -0.55, z: -12.0, mass: 1.3 },
        { type: "winter_ice_block", mat: "ice", x: 0.0, y: -0.55, z: -12.0, mass: 1.3 },
        { type: "winter_ice_block", mat: "ice", x: 1.6, y: -0.55, z: -12.0, mass: 1.3 },
        { type: "winter_ice_block", mat: "ice", x: -0.8, y: 0.52, z: -12.0, mass: 1.2 },
        { type: "winter_ice_block", mat: "ice", x: 0.8, y: 0.52, z: -12.0, mass: 1.2 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: -1.8, y: 0.55, z: -12.0, mass: 0.75 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 1.8, y: 0.55, z: -12.0, mass: 0.75 },
        { type: "winter_ice_block", mat: "ice", x: 0.0, y: 1.58, z: -12.0, mass: 1.1 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: -0.95, y: 1.6, z: -12.0, mass: 0.7 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 0.95, y: 1.6, z: -12.0, mass: 0.7 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 0.0, y: 2.66, z: -12.0, mass: 0.65 }
      ]
    },
    {
      level: 8,
      worldId: 3,
      worldName: "Ice Castle Winter Kingdom",
      title: "Frost Spire Fortress",
      ammo: 6,
      explosiveAmmo: 2,
      platformWidth: 7.0,
      platformZ: -12.4,
      platformY: -1.1,
      friction: 0.07,
      blockers: [
        { x: 0, y: 0.45, z: -8.7, ampX: 2.4, speed: 1.9, phase: 1.2 }
      ],
      targets: [
        { type: "winter_ice_block", mat: "ice", x: -2.0, y: -0.55, z: -12.4, mass: 1.3 },
        { type: "banded_oak_barrel", mat: "barrel", x: -0.7, y: -0.45, z: -12.4, mass: 1.8 },
        { type: "banded_oak_barrel", mat: "barrel", x: 0.7, y: -0.45, z: -12.4, mass: 1.8 },
        { type: "winter_ice_block", mat: "ice", x: 2.0, y: -0.55, z: -12.4, mass: 1.3 },
        { type: "winter_ice_block", mat: "ice", x: -1.4, y: 0.65, z: -12.4, mass: 1.2 },
        { type: "winter_ice_block", mat: "ice", x: 0.0, y: 0.65, z: -12.4, mass: 1.2 },
        { type: "winter_ice_block", mat: "ice", x: 1.4, y: 0.65, z: -12.4, mass: 1.2 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: -1.4, y: 1.74, z: -12.4, mass: 0.7 },
        { type: "winter_ice_block", mat: "ice", x: 0.0, y: 1.72, z: -12.4, mass: 1.1 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 1.4, y: 1.74, z: -12.4, mass: 0.7 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: -0.55, y: 2.8, z: -12.4, mass: 0.65 },
        { type: "carnival_tin_can", skin: 1, mat: "tincan", x: 0.55, y: 2.8, z: -12.4, mass: 0.65 }
      ]
    },
    {
      level: 9,
      worldId: 3,
      worldName: "Ice Castle Winter Kingdom",
      title: "Grand Ice King Citadel",
      ammo: 7,
      explosiveAmmo: 2,
      platformWidth: 7.4,
      platformZ: -12.8,
      platformY: -1.1,
      friction: 0.06,
      blockers: [
        { x: -1.3, y: 0.25, z: -8.4, ampX: 2.1, speed: 2.25, phase: 0 },
        { x: 1.3, y: 1.55, z: -9.3, ampX: 2.1, speed: 2.25, phase: 3.14 }
      ],
      targets: [
        { type: "winter_ice_block", mat: "ice", x: -2.2, y: -0.55, z: -12.8, mass: 1.3 },
        { type: "winter_ice_block", mat: "ice", x: -1.1, y: -0.55, z: -12.8, mass: 1.3 },
        { type: "banded_oak_barrel", mat: "barrel", x: 0.0, y: -0.45, z: -12.8, mass: 1.9 },
        { type: "winter_ice_block", mat: "ice", x: 1.1, y: -0.55, z: -12.8, mass: 1.3 },
        { type: "winter_ice_block", mat: "ice", x: 2.2, y: -0.55, z: -12.8, mass: 1.3 },
        { type: "slatted_wooden_crate", mat: "crate", x: -1.65, y: 0.62, z: -12.8, mass: 1.2 },
        { type: "winter_ice_block", mat: "ice", x: -0.55, y: 0.62, z: -12.8, mass: 1.2 },
        { type: "winter_ice_block", mat: "ice", x: 0.55, y: 0.62, z: -12.8, mass: 1.2 },
        { type: "slatted_wooden_crate", mat: "crate", x: 1.65, y: 0.62, z: -12.8, mass: 1.2 },
        { type: "carnival_tin_can", skin: 2, mat: "tincan", x: -1.65, y: 1.72, z: -12.8, mass: 0.7 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: -0.55, y: 1.70, z: -12.8, mass: 1.1 },
        { type: "cyberpunk_neon_cube", mat: "cyber", x: 0.55, y: 1.70, z: -12.8, mass: 1.1 },
        { type: "carnival_tin_can", skin: 2, mat: "tincan", x: 1.65, y: 1.72, z: -12.8, mass: 0.7 },
        { type: "winter_ice_block", mat: "ice", x: 0.0, y: 2.78, z: -12.8, mass: 1.0 }
      ]
    }
  ];

  // =========================================================================
  // 4. STATE, SAVE PERSISTENCE & 3D ENGINE
  // =========================================================================
  const state = {
    running: false,
    paused: false,
    level: 1,
    highestUnlocked: 1,
    coins: 120,
    score: 0,
    levelStars: {},
    ammoLeft: 5,
    explosiveLeft: 1,
    explosiveArmed: false,
    aimYawDeg: 0, // -28° to +28°
    aimPitchDeg: 16, // 2° to 38°
    recoilOffset: 0,
    cameraShake: 0,
    muzzleFlashTimer: 0,
    targets: [],
    blockers: [],
    cannonballs: [],
    particles: [],
    totalTargets: 0,
    knockedCount: 0,
    shotKnockCount: 0,
    settleTimer: 0,
    levelEnded: false
  };

  function loadSave() {
    try {
      const raw = localStorage.getItem(CANNON_SAVE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (typeof d.level === "number") state.level = Math.max(1, Math.min(9, d.level));
      if (typeof d.highestUnlocked === "number") state.highestUnlocked = Math.max(1, Math.min(9, d.highestUnlocked));
      if (typeof d.coins === "number") state.coins = Math.max(0, d.coins);
      if (d.levelStars && typeof d.levelStars === "object") state.levelStars = d.levelStars;
    } catch (e) {}
  }

  function saveProgress() {
    try {
      localStorage.setItem(
        CANNON_SAVE_KEY,
        JSON.stringify({
          level: state.level,
          highestUnlocked: state.highestUnlocked,
          coins: state.coins,
          levelStars: state.levelStars
        })
      );
    } catch (e) {}
  }

  // =========================================================================
  // 5. 3D PROJECTION & TEXTURED SHADED CANVAS RENDERER (ZERO-LEAK, 60 FPS)
  // =========================================================================
  let canvas = null;
  let ctx = null;
  let animId = null;
  let lastTime = 0;

  function projectPoint3D(x, y, z, camX, camY, camZ, fovScale, cx, cy) {
    const rx = x - camX;
    const ry = y - camY;
    const rz = z - camZ;
    if (rz >= -0.6) return null;
    const invZ = fovScale / -rz;
    return {
      sx: cx + rx * invZ,
      sy: cy - ry * invZ,
      scale: invZ,
      depth: -rz
    };
  }

  function getLaunchVelocity(yawDeg, pitchDeg) {
    const speed = 21.5;
    const yaw = (yawDeg * Math.PI) / 180;
    const pitch = (pitchDeg * Math.PI) / 180;
    const cosP = Math.cos(pitch);
    return {
      vx: Math.sin(yaw) * cosP * speed,
      vy: Math.sin(pitch) * speed,
      vz: -Math.cos(yaw) * cosP * speed
    };
  }

  function loadLevel(lvlNum) {
    loadSave();
    const idx = Math.max(0, Math.min(CANNON_LEVELS.length - 1, (lvlNum || state.level) - 1));
    const cfg = CANNON_LEVELS[idx];
    state.level = cfg.level;
    state.paused = false;
    state.levelEnded = false;
    state.ammoLeft = cfg.ammo;
    state.explosiveLeft = cfg.explosiveAmmo || 1;
    state.explosiveArmed = false;
    state.aimYawDeg = 0;
    state.aimPitchDeg = 16;
    state.recoilOffset = 0;
    state.cameraShake = 0;
    state.muzzleFlashTimer = 0;
    state.cannonballs = [];
    state.particles = [];
    state.score = 0;
    state.knockedCount = 0;
    state.shotKnockCount = 0;
    state.settleTimer = 0;

    state.targets = cfg.targets.map((t, i) => ({
      id: i,
      type: t.type,
      skin: t.skin || 1,
      mat: t.mat || "crate",
      x: t.x,
      y: t.y,
      z: t.z,
      vx: 0,
      vy: 0,
      vz: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      angVx: 0,
      angVy: 0,
      angVz: 0,
      radius: 0.56,
      halfH: 0.54,
      mass: t.mass || 1.2,
      knocked: false
    }));

    state.totalTargets = state.targets.length;

    state.blockers = (cfg.blockers || []).map((b) => ({
      baseX: b.x,
      x: b.x,
      y: b.y,
      z: b.z,
      ampX: b.ampX || 2.0,
      speed: b.speed || 1.8,
      phase: b.phase || 0,
      halfW: 0.85,
      halfH: 0.52
    }));

    hideAllCannonModals();
    updateCannonHud();
  }

  function fireCannonball() {
    if (!state.running || state.paused || state.levelEnded) return;
    if (state.ammoLeft <= 0) return;

    const isExplosive = state.explosiveArmed && state.explosiveLeft > 0;
    state.ammoLeft--;
    if (isExplosive) {
      state.explosiveLeft--;
      state.explosiveArmed = false;
    }

    state.shotKnockCount = 0;
    state.recoilOffset = 0.45;
    state.cameraShake = isExplosive ? 0.35 : 0.2;
    state.muzzleFlashTimer = 0.14;

    const vel = getLaunchVelocity(state.aimYawDeg, state.aimPitchDeg);
    const muzzleX = Math.sin((state.aimYawDeg * Math.PI) / 180) * 1.1;
    const muzzleY = -1.25 + Math.sin((state.aimPitchDeg * Math.PI) / 180) * 0.9;
    const muzzleZ = -1.45;

    state.cannonballs.push({
      x: muzzleX,
      y: muzzleY,
      z: muzzleZ,
      vx: vel.vx,
      vy: vel.vy,
      vz: vel.vz,
      radius: 0.36,
      mass: isExplosive ? 3.2 : 2.5,
      isExplosive,
      active: true,
      age: 0
    });

    // Spawn volumetric muzzle smoke & spark particles
    for (let i = 0; i < 16; i++) {
      state.particles.push({
        x: muzzleX,
        y: muzzleY,
        z: muzzleZ,
        vx: (Math.random() - 0.5) * 3.8 + vel.vx * 0.12,
        vy: (Math.random() - 0.3) * 3.4 + vel.vy * 0.12,
        vz: (Math.random() - 0.5) * 3.0 - 2.0,
        size: i < 6 ? 0.24 : 0.38,
        color: i < 6 ? "#FACC15" : "rgba(226, 232, 240, 0.78)",
        life: 0.45 + Math.random() * 0.35,
        maxLife: 0.8
      });
    }

    sfx.playCannonFire(isExplosive);
    updateCannonHud();
  }

  function triggerExplosionAt(ex, ey, ez) {
    sfx.playExplosion();
    state.cameraShake = 0.55;

    // Fiery shockwave particles
    const colors = ["#EF4444", "#F97316", "#FACC15", "#FFFFFF"];
    for (let i = 0; i < 28; i++) {
      const ang = Math.random() * Math.PI * 2;
      const elev = (Math.random() - 0.3) * Math.PI;
      const spd = 4 + Math.random() * 9;
      state.particles.push({
        x: ex,
        y: ey,
        z: ez,
        vx: Math.cos(ang) * Math.cos(elev) * spd,
        vy: Math.sin(elev) * spd + 2.5,
        vz: Math.sin(ang) * Math.cos(elev) * spd,
        size: 0.32 + Math.random() * 0.28,
        color: colors[i % colors.length],
        life: 0.55 + Math.random() * 0.35,
        maxLife: 0.9
      });
    }

    // Apply radial blast impulse to all nearby targets
    const blastRadius = 3.6;
    state.targets.forEach((t) => {
      const dx = t.x - ex;
      const dy = t.y - ey;
      const dz = t.z - ez;
      const dist = Math.hypot(dx, dy, dz);
      if (dist < blastRadius) {
        const strength = (1 - dist / blastRadius) * 15.5;
        const invD = 1 / Math.max(0.25, dist);
        t.vx += dx * invD * strength;
        t.vy += (dy * invD + 0.55) * strength;
        t.vz += (dz * invD - 0.4) * strength;
        t.angVx += (Math.random() - 0.5) * 14;
        t.angVy += (Math.random() - 0.5) * 14;
      }
    });
  }

  let comboToastTimer = null;
  function showCannonComboPopup(knockedThisShot, isPerfect) {
    const el = document.getElementById("cannon-combo-popup");
    if (!el) return;
    let label = "";
    let color = "#FACC15";
    if (isPerfect) {
      label = "PERFECT CLEAR! +500";
      color = "#38BDF8";
    } else if (knockedThisShot >= 6) {
      label = "MEGA KNOCKDOWN! x" + knockedThisShot;
      color = "#FF2E93";
    } else if (knockedThisShot === 5) {
      label = "ULTRA SMASH! x5";
      color = "#A855F7";
    } else if (knockedThisShot === 4) {
      label = "QUAD CRUSH! x4";
      color = "#F97316";
    } else if (knockedThisShot === 3) {
      label = "TRIPLE HIT! x3";
      color = "#FACC15";
    } else if (knockedThisShot === 2) {
      label = "DOUBLE HIT! x2";
      color = "#4ADE80";
    } else {
      return;
    }

    el.textContent = label;
    el.style.borderColor = color;
    el.style.color = color;
    el.classList.add("show");
    sfx.playComboFanfare(knockedThisShot);

    if (comboToastTimer) clearTimeout(comboToastTimer);
    comboToastTimer = setTimeout(() => el.classList.remove("show"), 1150);
  }

  // =========================================================================
  // 6. 3D RIGID-BODY PHYSICS STEP (CANNON-ES STYLE IMPULSE SOLVER)
  // =========================================================================
  function stepPhysics(dt) {
    const cfg = CANNON_LEVELS[state.level - 1];
    const gravity = -16.0;
    const nowSec = performance.now() * 0.001;

    // 1. Oscillate Moving Blocker Shields
    state.blockers.forEach((b) => {
      b.x = b.baseX + Math.sin(nowSec * b.speed + b.phase) * b.ampX;
    });

    // 2. Step Cannonballs & Check Collisions with Blockers and Targets
    state.cannonballs.forEach((ball) => {
      if (!ball.active) return;
      ball.age += dt;
      ball.vy += gravity * dt;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      ball.z += ball.vz * dt;

      if (ball.y < -9 || ball.z < -26 || ball.age > 5.0) {
        ball.active = false;
        return;
      }

      // Check collision against Moving Blocker Shields
      for (let i = 0; i < state.blockers.length; i++) {
        const blk = state.blockers[i];
        if (
          Math.abs(ball.x - blk.x) < blk.halfW + ball.radius &&
          Math.abs(ball.y - blk.y) < blk.halfH + ball.radius &&
          Math.abs(ball.z - blk.z) < 0.35 + ball.radius
        ) {
          sfx.playMaterialHit("blocker");
          if (ball.isExplosive) {
            triggerExplosionAt(ball.x, ball.y, ball.z);
            ball.active = false;
            return;
          }
          ball.vz = Math.abs(ball.vz) * 0.65;
          ball.vy += 2.2;
          state.cameraShake = 0.18;
        }
      }

      // Check collision against 3D Targets
      for (let i = 0; i < state.targets.length; i++) {
        const t = state.targets[i];
        const dx = t.x - ball.x;
        const dy = t.y - ball.y;
        const dz = t.z - ball.z;
        const dist = Math.hypot(dx, dy, dz);
        const minDist = t.radius + ball.radius;

        if (dist < minDist && dist > 0.0001) {
          sfx.playMaterialHit(t.mat);

          if (ball.isExplosive) {
            triggerExplosionAt(ball.x, ball.y, ball.z);
            ball.active = false;
            return;
          }

          const nx = dx / dist;
          const ny = dy / dist;
          const nz = dz / dist;
          const overlap = minDist - dist;
          t.x += nx * overlap * 0.7;
          t.y += ny * overlap * 0.7;
          t.z += nz * overlap * 0.7;

          const transfer = (ball.mass / (ball.mass + t.mass)) * 1.32;
          t.vx += ball.vx * transfer + nx * 4.2;
          t.vy += Math.max(2.0, ball.vy * transfer + 3.2);
          t.vz += ball.vz * transfer + nz * 4.5;

          t.angVx += (Math.random() - 0.5) * 11;
          t.angVy += (Math.random() - 0.5) * 11;
          t.angVz += (Math.random() - 0.5) * 11;

          ball.vx *= 0.52;
          ball.vz *= 0.52;
        }
      }
    });

    // 3. Step Targets (Platform Support, Slippery Friction, Target-Target Collisions, Knockdown Check)
    const platHalfW = cfg.platformWidth * 0.5;
    const platY = cfg.platformY;
    const platZ = cfg.platformZ;

    for (let i = 0; i < state.targets.length; i++) {
      const t = state.targets[i];
      const onPlatformX = Math.abs(t.x) <= platHalfW + 0.18;
      const onPlatformZ = Math.abs(t.z - platZ) <= 1.15;

      // Check if supported by platform or by another target underneath
      let supportY = -999;
      if (onPlatformX && onPlatformZ) {
        supportY = platY + t.halfH;
      }

      for (let j = 0; j < state.targets.length; j++) {
        if (i === j) continue;
        const other = state.targets[j];
        if (other.knocked) continue;
        const horizDist = Math.hypot(t.x - other.x, t.z - other.z);
        if (horizDist < 0.88 && t.y >= other.y + 0.35) {
          const topOfOther = other.y + other.halfH + t.halfH;
          if (topOfOther > supportY) supportY = topOfOther;
        }
      }

      if (t.y <= supportY + 0.04 && t.vy <= 0 && Math.hypot(t.vx, t.vz) < 4.2 && supportY > -50) {
        t.y = supportY;
        t.vy = 0;
        const damp = Math.max(0.75, 1 - cfg.friction * dt * 8);
        t.vx *= damp;
        t.vz *= damp;
        t.angVx *= 0.85;
        t.angVy *= 0.85;
        t.angVz *= 0.85;
      } else {
        t.vy += gravity * dt;
      }

      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.z += t.vz * dt;
      t.rotX += t.angVx * dt;
      t.rotY += t.angVy * dt;
      t.rotZ += t.angVz * dt;

      // Target-to-Target impulse chain reactions
      for (let j = i + 1; j < state.targets.length; j++) {
        const b = state.targets[j];
        const dx = b.x - t.x;
        const dy = b.y - t.y;
        const dz = b.z - t.z;
        const dist = Math.hypot(dx, dy, dz);
        const minDist = 0.96;
        if (dist < minDist && dist > 0.001) {
          const speedA = Math.hypot(t.vx, t.vy, t.vz);
          const speedB = Math.hypot(b.vx, b.vy, b.vz);
          if (speedA > 0.9 || speedB > 0.9) {
            const nx = dx / dist;
            const ny = dy / dist;
            const nz = dz / dist;
            const push = (minDist - dist) * 0.5;
            t.x -= nx * push;
            b.x += nx * push;
            const relVx = t.vx - b.vx;
            const relVz = t.vz - b.vz;
            t.vx -= relVx * 0.42;
            t.vz -= relVz * 0.42;
            b.vx += relVx * 0.52 + nx * 1.4;
            b.vz += relVz * 0.52 + nz * 1.4;
            b.vy += Math.abs(ny) * 1.2;
          }
        }
      }

      // Check if knocked off the platform or toppled far
      if (!t.knocked) {
        const fellBelow = t.y < platY - 0.35;
        const pushedOffZ = Math.abs(t.z - platZ) > 1.35;
        const pushedOffX = Math.abs(t.x) > platHalfW + 0.35;
        if (fellBelow || pushedOffZ || pushedOffX) {
          t.knocked = true;
          state.knockedCount++;
          state.shotKnockCount++;
          const pts = 150 * Math.max(1, state.shotKnockCount);
          state.score += pts;
          state.coins += 6;

          if (state.shotKnockCount >= 2) {
            showCannonComboPopup(state.shotKnockCount, false);
          }
          updateCannonHud();
        }
      }
    }

    // 4. Step Particles & Recoil / Shake Timers
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        state.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
    }

    if (state.recoilOffset > 0) state.recoilOffset = Math.max(0, state.recoilOffset - dt * 1.8);
    if (state.cameraShake > 0) state.cameraShake = Math.max(0, state.cameraShake - dt * 1.5);
    if (state.muzzleFlashTimer > 0) state.muzzleFlashTimer = Math.max(0, state.muzzleFlashTimer - dt);

    // 5. Check Victory or Out-of-Ammo End Condition
    if (!state.levelEnded) {
      if (state.knockedCount >= state.totalTargets) {
        state.levelEnded = true;
        const spareBonus = state.ammoLeft * 250;
        state.score += spareBonus;
        state.coins += 25 + state.ammoLeft * 10;
        if (state.ammoLeft >= 2) {
          showCannonComboPopup(state.shotKnockCount, true);
        }
        const stars = state.ammoLeft >= 2 ? 3 : state.ammoLeft >= 1 ? 2 : 1;
        state.levelStars[state.level] = Math.max(state.levelStars[state.level] || 0, stars);
        if (state.level < 9 && state.level + 1 > state.highestUnlocked) {
          state.highestUnlocked = state.level + 1;
        }
        saveProgress();
        setTimeout(() => showCannonResultModal(true, stars), 650);
      } else if (state.ammoLeft <= 0) {
        const anyActiveBall = state.cannonballs.some((b) => b.active && b.y > -4);
        if (!anyActiveBall) {
          state.settleTimer += dt;
          if (state.settleTimer > 1.8) {
            state.levelEnded = true;
            showCannonResultModal(false, 0);
          }
        }
      }
    }
  }

  // =========================================================================
  // 7. 3D WORLD ENVIRONMENT & TARGET RENDERER
  // =========================================================================
  function renderScene() {
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w * 0.5;
    const cy = h * 0.46;
    const fovScale = Math.min(w, h) * 0.92;

    const shakeX = state.cameraShake > 0 ? (Math.random() - 0.5) * state.cameraShake * 28 : 0;
    const shakeY = state.cameraShake > 0 ? (Math.random() - 0.5) * state.cameraShake * 28 : 0;
    const camX = shakeX * 0.02;
    const camY = 0.55 + shakeY * 0.02;
    const camZ = 2.2;

    const cfg = CANNON_LEVELS[state.level - 1];
    ctx.save();

    // 1. Draw World-Specific 3D Environment Backdrop
    drawWorldBackdrop(ctx, w, h, cy, cfg.worldId);

    // 2. Draw Target Platform in 3D Space
    drawPlatform3D(ctx, cfg, camX, camY, camZ, fovScale, cx, cy);

    // 3. Draw Predictive Dotted 3D Trajectory Arc & Target Reticle
    if (!state.levelEnded && state.ammoLeft > 0) {
      drawTrajectoryArc3D(ctx, cfg, camX, camY, camZ, fovScale, cx, cy);
    }

    // 4. Sort and Draw 3D Targets, Moving Blockers & Flying Cannonballs by Depth (Painter's Algorithm)
    const renderables = [];

    state.targets.forEach((t) => {
      if (t.y < -7) return;
      const p = projectPoint3D(t.x, t.y, t.z, camX, camY, camZ, fovScale, cx, cy);
      if (p) renderables.push({ kind: "target", obj: t, p });
    });

    state.blockers.forEach((b) => {
      const p = projectPoint3D(b.x, b.y, b.z, camX, camY, camZ, fovScale, cx, cy);
      if (p) renderables.push({ kind: "blocker", obj: b, p });
    });

    state.cannonballs.forEach((ball) => {
      if (!ball.active) return;
      const p = projectPoint3D(ball.x, ball.y, ball.z, camX, camY, camZ, fovScale, cx, cy);
      if (p) renderables.push({ kind: "ball", obj: ball, p });
    });

    renderables.sort((a, b) => b.p.depth - a.p.depth);

    renderables.forEach((item) => {
      if (item.kind === "target") {
        drawTarget3D(ctx, item.obj, item.p);
      } else if (item.kind === "blocker") {
        drawBlockerSign3D(ctx, item.obj, item.p);
      } else if (item.kind === "ball") {
        drawCannonball3D(ctx, item.obj, item.p);
      }
    });

    // 5. Draw 3D Smoke & Explosion Particles
    state.particles.forEach((pt) => {
      const p = projectPoint3D(pt.x, pt.y, pt.z, camX, camY, camZ, fovScale, cx, cy);
      if (!p) return;
      const r = Math.max(2, pt.size * p.scale);
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 6. Draw Foreground Pirate Carnival Cannon with Live Yaw/Pitch & Recoil
    drawPirateCannonForeground(ctx, w, h);

    ctx.restore();
  }

  function drawWorldBackdrop(ctx, w, h, horizonY, worldId) {
    if (worldId === 1) {
      // WORLD 1: WILD WEST DESERT CARNIVAL
      const sky = ctx.createLinearGradient(0, 0, 0, horizonY + 80);
      sky.addColorStop(0, "#431407");
      sky.addColorStop(0.45, "#C2410C");
      sky.addColorStop(0.85, "#F97316");
      sky.addColorStop(1, "#FDE047");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Glowing Sunset Sun
      ctx.fillStyle = "rgba(254, 240, 138, 0.35)";
      ctx.beginPath();
      ctx.arc(w * 0.5, horizonY - 28, 68, 0, Math.PI * 2);
      ctx.fill();

      // Red Rock Mesas
      ctx.fillStyle = "#7C2D12";
      ctx.beginPath();
      ctx.moveTo(0, horizonY + 40);
      ctx.lineTo(w * 0.08, horizonY - 25);
      ctx.lineTo(w * 0.26, horizonY - 25);
      ctx.lineTo(w * 0.34, horizonY + 40);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w * 0.68, horizonY + 40);
      ctx.lineTo(w * 0.75, horizonY - 35);
      ctx.lineTo(w * 0.93, horizonY - 35);
      ctx.lineTo(w, horizonY + 40);
      ctx.fill();

      // Desert Floor
      const ground = ctx.createLinearGradient(0, horizonY + 35, 0, h);
      ground.addColorStop(0, "#9A3412");
      ground.addColorStop(1, "#451A03");
      ctx.fillStyle = ground;
      ctx.fillRect(0, horizonY + 35, w, h - horizonY);

      // Saguaro Cacti silhouettes
      ctx.fillStyle = "#431407";
      [w * 0.12, w * 0.88].forEach((cx) => {
        ctx.fillRect(cx - 4, horizonY + 5, 8, 42);
        ctx.fillRect(cx - 14, horizonY + 16, 10, 5);
        ctx.fillRect(cx - 14, horizonY + 8, 5, 12);
        ctx.fillRect(cx + 4, horizonY + 20, 10, 5);
        ctx.fillRect(cx + 9, horizonY + 10, 5, 14);
      });
    } else if (worldId === 2) {
      // WORLD 2: CYBERPUNK NEON CITY
      const sky = ctx.createLinearGradient(0, 0, 0, horizonY + 60);
      sky.addColorStop(0, "#090418");
      sky.addColorStop(0.55, "#1E1B4B");
      sky.addColorStop(1, "#701A75");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Neon Skyscrapers
      const bldgs = [
        [0.05, 0.14, 95, "#06B6D4"],
        [0.2, 0.12, 70, "#EC4899"],
        [0.72, 0.13, 105, "#22D3EE"],
        [0.86, 0.12, 80, "#F43F5E"]
      ];
      bldgs.forEach(([bx, bw, bh, neon]) => {
        const x = w * bx;
        const width = w * bw;
        const y = horizonY + 35 - bh;
        ctx.fillStyle = "#0F172A";
        ctx.fillRect(x, y, width, bh);
        ctx.strokeStyle = neon;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, width, bh);
      });

      // Synthwave Perspective Floor Grid
      ctx.fillStyle = "#090616";
      ctx.fillRect(0, horizonY + 35, w, h - horizonY);
      ctx.strokeStyle = "rgba(236, 72, 153, 0.42)";
      ctx.lineWidth = 1.5;
      for (let i = -6; i <= 6; i++) {
        ctx.beginPath();
        ctx.moveTo(w * 0.5 + i * 24, horizonY + 35);
        ctx.lineTo(w * 0.5 + i * 135, h);
        ctx.stroke();
      }
      for (let y = horizonY + 45; y < h; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    } else {
      // WORLD 3: ICE CASTLE WINTER KINGDOM
      const sky = ctx.createLinearGradient(0, 0, 0, horizonY + 60);
      sky.addColorStop(0, "#0C4A6E");
      sky.addColorStop(0.55, "#0284C7");
      sky.addColorStop(1, "#BAE6FD");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Snow Mountains & Fantasy Ice Castle Spires
      ctx.fillStyle = "#E0F2FE";
      ctx.beginPath();
      ctx.moveTo(0, horizonY + 40);
      ctx.lineTo(w * 0.18, horizonY - 48);
      ctx.lineTo(w * 0.38, horizonY + 40);
      ctx.lineTo(w * 0.65, horizonY + 40);
      ctx.lineTo(w * 0.84, horizonY - 56);
      ctx.lineTo(w, horizonY + 40);
      ctx.fill();

      // Ice Castle Crystal Spires in distance
      ctx.fillStyle = "#7DD3FC";
      [w * 0.44, w * 0.5, w * 0.56].forEach((sx, idx) => {
        const sh = idx === 1 ? 74 : 52;
        ctx.fillRect(sx - 8, horizonY + 35 - sh, 16, sh);
        ctx.beginPath();
        ctx.moveTo(sx - 11, horizonY + 35 - sh);
        ctx.lineTo(sx, horizonY + 35 - sh - 24);
        ctx.lineTo(sx + 11, horizonY + 35 - sh);
        ctx.fill();
      });

      // Frozen Glacier Ground
      const ground = ctx.createLinearGradient(0, horizonY + 35, 0, h);
      ground.addColorStop(0, "#BAE6FD");
      ground.addColorStop(1, "#0369A1");
      ctx.fillStyle = ground;
      ctx.fillRect(0, horizonY + 35, w, h - horizonY);
    }
  }

  function drawPlatform3D(ctx, cfg, camX, camY, camZ, fovScale, cx, cy) {
    const hw = cfg.platformWidth * 0.5;
    const py = cfg.platformY;
    const pz = cfg.platformZ;
    const pLeft = projectPoint3D(-hw, py, pz, camX, camY, camZ, fovScale, cx, cy);
    const pRight = projectPoint3D(hw, py, pz, camX, camY, camZ, fovScale, cx, cy);
    if (!pLeft || !pRight) return;

    const platW = pRight.sx - pLeft.sx;
    const platH = Math.max(14, 0.42 * pLeft.scale);

    ctx.save();
    if (cfg.worldId === 1) {
      ctx.fillStyle = "#92400E";
      ctx.strokeStyle = "#FACC15";
    } else if (cfg.worldId === 2) {
      ctx.fillStyle = "#0F172A";
      ctx.strokeStyle = "#00F5D4";
    } else {
      ctx.fillStyle = "#7DD3FC";
      ctx.strokeStyle = "#FFFFFF";
    }
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(pLeft.sx, pLeft.sy, platW, platH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawTrajectoryArc3D(ctx, cfg, camX, camY, camZ, fovScale, cx, cy) {
    const vel = getLaunchVelocity(state.aimYawDeg, state.aimPitchDeg);
    const startX = Math.sin((state.aimYawDeg * Math.PI) / 180) * 1.1;
    const startY = -1.25 + Math.sin((state.aimPitchDeg * Math.PI) / 180) * 0.9;
    const startZ = -1.45;
    const g = -16.0;

    ctx.save();
    for (let step = 1; step <= 18; step++) {
      const t = step * 0.042;
      const px = startX + vel.vx * t;
      const py = startY + vel.vy * t + 0.5 * g * t * t;
      const pz = startZ + vel.vz * t;
      const proj = projectPoint3D(px, py, pz, camX, camY, camZ, fovScale, cx, cy);
      if (!proj) continue;

      const dotR = Math.max(2.2, (1 - step / 22) * 5.2);
      ctx.fillStyle = state.explosiveArmed ? "#EF4444" : "#FFFFFF";
      ctx.globalAlpha = 0.92 - step * 0.035;
      ctx.beginPath();
      ctx.arc(proj.sx, proj.sy, dotR, 0, Math.PI * 2);
      ctx.fill();

      // Target Reticle near target plane Z
      if (Math.abs(pz - cfg.platformZ) < 0.45) {
        ctx.strokeStyle = state.explosiveArmed ? "#FACC15" : "#38BDF8";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(proj.sx, proj.sy, 16, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
    }
    ctx.restore();
  }

  function drawTarget3D(ctx, t, p) {
    const sizePx = Math.max(18, 0.98 * p.scale);
    const texKey =
      t.type === "carnival_tin_can"
        ? t.skin === 2
          ? "tincan_skin2"
          : "tincan_skin1"
        : t.type === "slatted_wooden_crate"
        ? "wooden_crate"
        : t.type === "banded_oak_barrel"
        ? "oak_barrel"
        : t.type === "winter_ice_block"
        ? "winter_ice"
        : "cyber_cube";

    const texCanvas =
      window.Arcade3DModels && window.Arcade3DModels.getProceduralTextureCanvas
        ? window.Arcade3DModels.getProceduralTextureCanvas(texKey)
        : null;

    ctx.save();
    ctx.translate(p.sx, p.sy);
    ctx.rotate(t.rotZ * 0.45);

    if (t.type === "winter_ice_block") {
      ctx.globalAlpha = 0.84;
    }

    const w = t.type === "carnival_tin_can" ? sizePx * 0.82 : sizePx;
    const h = t.type === "banded_oak_barrel" ? sizePx * 1.14 : sizePx;

    if (texCanvas) {
      ctx.drawImage(texCanvas, -w * 0.5, -h * 0.5, w, h);
    } else {
      ctx.fillStyle = "#F59E0B";
      ctx.fillRect(-w * 0.5, -h * 0.5, w, h);
    }

    // Crisp 3D rim & cartoon specular highlight
    ctx.strokeStyle = t.type === "cyberpunk_neon_cube" ? "#00F5D4" : "rgba(255,255,255,0.65)";
    ctx.lineWidth = 2;
    ctx.strokeRect(-w * 0.5, -h * 0.5, w, h);
    ctx.restore();
  }

  function drawBlockerSign3D(ctx, b, p) {
    const w = Math.max(36, b.halfW * 2 * p.scale);
    const h = Math.max(24, b.halfH * 2 * p.scale);
    const texCanvas =
      window.Arcade3DModels && window.Arcade3DModels.getProceduralTextureCanvas
        ? window.Arcade3DModels.getProceduralTextureCanvas("blocker_sign")
        : null;

    ctx.save();
    ctx.translate(p.sx, p.sy);
    if (texCanvas) {
      ctx.drawImage(texCanvas, -w * 0.5, -h * 0.5, w, h);
    } else {
      ctx.fillStyle = "#FACC15";
      ctx.fillRect(-w * 0.5, -h * 0.5, w, h);
    }
    ctx.strokeStyle = "#FACC15";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-w * 0.5, -h * 0.5, w, h);
    ctx.restore();
  }

  function drawCannonball3D(ctx, ball, p) {
    const r = Math.max(6, ball.radius * p.scale);
    ctx.save();
    const grad = ctx.createRadialGradient(p.sx - r * 0.3, p.sy - r * 0.3, r * 0.1, p.sx, p.sy, r);
    if (ball.isExplosive) {
      grad.addColorStop(0, "#FEF08A");
      grad.addColorStop(0.5, "#EF4444");
      grad.addColorStop(1, "#7F1D1D");
    } else {
      grad.addColorStop(0, "#9CA3AF");
      grad.addColorStop(0.45, "#374151");
      grad.addColorStop(1, "#111827");
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ball.isExplosive ? "#FACC15" : "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawPirateCannonForeground(ctx, w, h) {
    const baseCx = w * 0.5;
    const baseCy = h - 108 + state.recoilOffset * 26;
    const yawPx = state.aimYawDeg * 1.45;
    const pitchScale = 1 - (state.aimPitchDeg - 10) * 0.008;

    ctx.save();
    ctx.translate(baseCx, baseCy);

    // Muzzle Flash Glow
    if (state.muzzleFlashTimer > 0) {
      ctx.fillStyle = "rgba(250, 204, 21, 0.85)";
      ctx.beginPath();
      ctx.arc(yawPx * 1.3, -68, 36, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wooden Naval Carriage & Wheels
    ctx.fillStyle = "#78350F";
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-42, -12, 84, 34, 8);
    ctx.fill();
    ctx.stroke();

    // Left & Right Spoked Wheels
    [-46, 46].forEach((wx) => {
      ctx.fillStyle = "#451A03";
      ctx.beginPath();
      ctx.arc(wx, 10, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FACC15";
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    // Elevating & Rotating Pirate Cannon Barrel
    ctx.save();
    ctx.rotate((state.aimYawDeg * Math.PI) / 180 * 0.65);
    const barrelGrad = ctx.createLinearGradient(-24, 0, 24, 0);
    barrelGrad.addColorStop(0, "#1E293B");
    barrelGrad.addColorStop(0.5, "#475569");
    barrelGrad.addColorStop(1, "#0F172A");
    ctx.fillStyle = barrelGrad;
    ctx.strokeStyle = "#FACC15";
    ctx.lineWidth = 2.5;

    const bLen = 68 * pitchScale;
    ctx.beginPath();
    ctx.roundRect(-20, -bLen, 40, bLen + 10, 10);
    ctx.fill();
    ctx.stroke();

    // Brass Muzzle Ring
    ctx.fillStyle = "#EAB308";
    ctx.fillRect(-23, -bLen, 46, 8);
    ctx.fillRect(-21, -bLen * 0.45, 42, 6);
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // 8. HUD, LEVEL SELECT, PAUSE & VICTORY MODALS
  // =========================================================================
  function updateCannonHud() {
    const cfg = CANNON_LEVELS[state.level - 1];
    const worldEl = document.getElementById("cannon-world-pill");
    if (worldEl) worldEl.textContent = `WORLD ${cfg.worldId} • ${cfg.worldName.toUpperCase()}`;

    const lvlEl = document.getElementById("cannon-level-pill");
    if (lvlEl) lvlEl.textContent = `LEVEL ${cfg.level}/9 • ${cfg.title}`;

    const progFill = document.getElementById("cannon-progress-fill");
    const progTxt = document.getElementById("cannon-progress-txt");
    const pct = Math.round((state.knockedCount / Math.max(1, state.totalTargets)) * 100);
    if (progFill) progFill.style.width = `${pct}%`;
    if (progTxt) progTxt.textContent = `${state.knockedCount}/${state.totalTargets}`;

    const ammoEl = document.getElementById("cannon-ammo-val");
    if (ammoEl) ammoEl.textContent = `💣 ${state.ammoLeft}`;

    const coinsEl = document.getElementById("cannon-coins-val");
    if (coinsEl) coinsEl.textContent = `🪙 ${state.coins}`;

    const scoreEl = document.getElementById("cannon-score-val");
    if (scoreEl) scoreEl.textContent = `${state.score} PTS`;

    const expBtn = document.getElementById("btn-cannon-explosive");
    if (expBtn) {
      expBtn.classList.toggle("armed", state.explosiveArmed);
      expBtn.innerHTML = `<span class="p-ico">💥</span><span class="p-txt">Bomb (${state.explosiveLeft})</span>`;
    }
  }

  function showCannonResultModal(won, stars) {
    const modal = document.getElementById("cannon-result-modal");
    if (!modal) return;
    const starStr = "★".repeat(stars) + "☆".repeat(3 - stars);
    document.getElementById("cannon-res-badge").textContent = won
      ? `STAGE CLEARED • ${starStr}`
      : "OUT OF CANNONBALLS";
    document.getElementById("cannon-res-title").textContent = won ? "BOOM! KNOCKDOWN!" : "ALMOST HAD IT!";
    document.getElementById("cannon-res-sub").textContent = won
      ? `All ${state.totalTargets} targets demolished in ${CANNON_LEVELS[state.level - 1].worldName}!`
      : "Aim for the bottom crates & barrels to trigger a chain reaction!";
    document.getElementById("cannon-res-score").textContent = String(state.score);
    document.getElementById("cannon-res-stars").textContent = starStr;
    document.getElementById("cannon-res-coins").textContent = `🪙 ${state.coins}`;
    document.getElementById("btn-cannon-next").textContent = won
      ? state.level < 9
        ? "NEXT LEVEL ▶"
        : "PLAY LEVEL 1 ↻"
      : "RETRY LEVEL ↻";
    modal.classList.remove("hidden");
  }

  function showCannonLevelsModal() {
    loadSave();
    state.paused = true;
    const grid = document.getElementById("cannon-levels-grid");
    if (grid) {
      grid.innerHTML = CANNON_LEVELS.map((l) => {
        const stars = state.levelStars[l.level] || 0;
        const starStr = "★".repeat(stars) + "☆".repeat(3 - stars);
        const isCurrent = l.level === state.level;
        return `
          <button class="level-card ${isCurrent ? "active" : ""}" data-cannon-lvl="${l.level}">
            <div class="level-card-num">WORLD ${l.worldId} • LEVEL ${l.level}</div>
            <div class="level-card-name">${l.title}</div>
            <div style="font-size:11px;color:#FACC15;font-weight:900;">${starStr}</div>
          </button>
        `;
      }).join("");

      grid.querySelectorAll("[data-cannon-lvl]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const lv = parseInt(btn.getAttribute("data-cannon-lvl"), 10);
          loadLevel(lv);
        });
      });
    }
    const modal = document.getElementById("cannon-levels-modal");
    if (modal) modal.classList.remove("hidden");
  }

  function hideAllCannonModals() {
    ["cannon-result-modal", "cannon-levels-modal", "cannon-pause-modal"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add("hidden");
    });
  }

  function resizeCannonCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(320, Math.floor(window.innerWidth * dpr));
    canvas.height = Math.max(480, Math.floor(window.innerHeight * dpr));
  }

  function loop(now) {
    if (!state.running) return;
    animId = requestAnimationFrame(loop);
    const dt = Math.min(0.033, Math.max(0.001, (now - lastTime) * 0.001));
    lastTime = now;
    if (!state.paused) {
      stepPhysics(dt);
    }
    renderScene();
  }

  function initCannonControls() {
    canvas = document.getElementById("cannon-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    window.addEventListener("resize", () => {
      if (state.running) resizeCannonCanvas();
    });

    // Touch & Mouse Drag Aiming on the 3D Viewport
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener("pointerdown", (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    window.addEventListener("pointermove", (e) => {
      if (!dragging || !state.running || state.paused) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      state.aimYawDeg = Math.max(-28, Math.min(28, state.aimYawDeg + dx * 0.16));
      state.aimPitchDeg = Math.max(4, Math.min(38, state.aimPitchDeg - dy * 0.16));
    });

    window.addEventListener("pointerup", () => {
      dragging = false;
    });

    // Large Red FIRE Button
    const fireBtn = document.getElementById("btn-cannon-fire");
    if (fireBtn) {
      fireBtn.addEventListener("click", () => fireCannonball());
    }

    // Explosive Power-up Cannonball Button
    const expBtn = document.getElementById("btn-cannon-explosive");
    if (expBtn) {
      expBtn.addEventListener("click", () => {
        if (state.explosiveLeft <= 0) {
          if (state.coins >= 20) {
            state.coins -= 20;
            state.explosiveLeft++;
            state.explosiveArmed = true;
            saveProgress();
          }
        } else {
          state.explosiveArmed = !state.explosiveArmed;
        }
        sfx.playMaterialHit("tincan");
        updateCannonHud();
      });
    }

    const btnLevels = document.getElementById("btn-cannon-levels");
    if (btnLevels) btnLevels.addEventListener("click", showCannonLevelsModal);

    const btnCloseLevels = document.getElementById("btn-close-cannon-levels");
    if (btnCloseLevels) {
      btnCloseLevels.addEventListener("click", () => {
        state.paused = false;
        hideAllCannonModals();
      });
    }

    const btnRestart = document.getElementById("btn-cannon-restart");
    if (btnRestart) {
      btnRestart.addEventListener("click", () => loadLevel(state.level));
    }

    const btnPause = document.getElementById("btn-cannon-pause");
    if (btnPause) {
      btnPause.addEventListener("click", () => {
        state.paused = true;
        const m = document.getElementById("cannon-pause-modal");
        if (m) m.classList.remove("hidden");
      });
    }

    const btnResume = document.getElementById("btn-cannon-resume");
    if (btnResume) {
      btnResume.addEventListener("click", () => {
        state.paused = false;
        hideAllCannonModals();
      });
    }

    const btnPauseRestart = document.getElementById("btn-cannon-pause-restart");
    if (btnPauseRestart) {
      btnPauseRestart.addEventListener("click", () => loadLevel(state.level));
    }

    const btnNext = document.getElementById("btn-cannon-next");
    if (btnNext) {
      btnNext.addEventListener("click", () => {
        const won = state.knockedCount >= state.totalTargets;
        if (won) {
          state.level = state.level < 9 ? state.level + 1 : 1;
          saveProgress();
        }
        loadLevel(state.level);
      });
    }

    const btnHub = document.getElementById("btn-cannon-hub");
    if (btnHub) {
      btnHub.addEventListener("click", () => {
        if (window.CosmicGameHub) window.CosmicGameHub.openHub();
      });
    }

    const btnResHub = document.getElementById("btn-cannon-res-hub");
    if (btnResHub) {
      btnResHub.addEventListener("click", () => {
        hideAllCannonModals();
        if (window.CosmicGameHub) window.CosmicGameHub.openHub();
      });
    }
  }

  // Register Cannon Knockdown 3D in the Main Sliding Game Hub
  function registerInGameHub() {
    if (!window.CosmicGameHub) return;
    window.CosmicGameHub.registerGame({
      id: "cannon-knockdown-3d",
      name: "Cannon Knockdown 3D",
      subtitle: "3 Worlds • 9 Physics Levels",
      badge: "3D PHYSICS",
      accentColor: "#EF4444",
      buttonGradient: "linear-gradient(135deg, #EF4444, #D97706)",
      logoHtml: CANNON_LOGO_SVG,
      thumbnailHtml: CANNON_THUMB_SVG,
      description: "Aim the Pirate Carnival Cannon, fire explosive cannonballs, and demolish cans, crates, barrels & ice across 3 worlds!",
      getStatsText: () => {
        loadSave();
        return `Level ${state.level}/9 • 3 Worlds • 🪙 ${state.coins}`;
      }
    });
  }

  window.CannonKnockdownController = {
    start() {
      if (!canvas) initCannonControls();
      resizeCannonCanvas();
      loadSave();
      loadLevel(state.level);
      state.running = true;
      lastTime = performance.now();
      if (animId) cancelAnimationFrame(animId);
      animId = requestAnimationFrame(loop);
    },
    pause() {
      state.paused = true;
    },
    resume() {
      state.paused = false;
    },
    stop() {
      state.running = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initCannonControls();
      registerInGameHub();
    });
  } else {
    initCannonControls();
    registerInGameHub();
  }
})();
