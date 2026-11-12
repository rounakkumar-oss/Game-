/**
 * PHASE 3: 3D GAME ASSET STUDIO & BINARY GLB EXPORTER
 * Interactive 360° 3D Model Inspector, Procedural Texture Studio & Clean GLB Exporter
 *
 * Includes all 7 Original 3D Models:
 * 1. Pirate Carnival Cannon (with live Cannon Elevation Slider & Test Fire Animation!)
 * 2. Carnival Tin Can with 2 Skins (Skin 1: Classic Carnival Star, Skin 2: Cyberpunk Neon)
 * 3. Slatted Wooden Crate
 * 4. Banded Oak Barrel
 * 5. Translucent Winter Ice Block
 * 6. Cyberpunk Neon Target Cube
 * 7. Moving Carnival Blocker Sign
 *
 * Studio Controls:
 * - Interactive 360° 3D Orbit Viewer (Touch & Mouse drag)
 * - Zoom In, Zoom Out & Reset Camera
 * - Cartoon Outline ON/OFF
 * - Wireframe ON/OFF
 * - Auto-Rotate ON/OFF
 * - Cannon Elevation Slider (-10° to +45°)
 * - Test Fire Animation (Barrel recoil, muzzle flash, smoke burst & projectile)
 * - Individual GLB Model Download + Download All 7 Models as Separate GLB Files
 */

(function () {
  "use strict";

  // =========================================================================
  // 1. ORIGINAL LOGO & THUMBNAIL FOR THE SLIDING GAME HUB
  // =========================================================================
  const STUDIO_LOGO_SVG = `
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <linearGradient id="stGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06B6D4"/>
          <stop offset="50%" stop-color="#3B82F6"/>
          <stop offset="100%" stop-color="#1D4ED8"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="#0F172A" stroke="#38BDF8" stroke-width="2.5"/>
      <!-- 3D Isometric Cube + Wireframe -->
      <polygon points="32,12 50,22 50,42 32,52 14,42 14,22" fill="url(#stGrad)" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="32" y1="12" x2="32" y2="32" stroke="#BAE6FD" stroke-width="1.5" stroke-dasharray="2 2"/>
      <line x1="14" y1="22" x2="32" y2="32" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="50" y1="22" x2="32" y2="32" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="32" y1="32" x2="32" y2="52" stroke="#FFFFFF" stroke-width="2"/>
    </svg>
  `;

  const STUDIO_THUMB_SVG = `
    <svg viewBox="0 0 320 176" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="stBg" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stop-color="#1E293B"/>
          <stop offset="100%" stop-color="#090D16"/>
        </radialGradient>
      </defs>
      <rect width="320" height="176" fill="url(#stBg)"/>
      <!-- 360 Turntable Grid Ring -->
      <ellipse cx="160" cy="132" rx="108" ry="26" fill="rgba(56, 189, 248, 0.12)" stroke="#38BDF8" stroke-width="2"/>
      <ellipse cx="160" cy="132" rx="72" ry="16" fill="none" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.5" stroke-dasharray="4 4"/>
      <!-- Showcase of 3D Models on Turntable -->
      <!-- Wooden Crate -->
      <rect x="68" y="84" width="40" height="40" rx="4" fill="#C68642" stroke="#FDE047" stroke-width="2"/>
      <line x1="68" y1="84" x2="108" y2="124" stroke="#6E3F14" stroke-width="3"/>
      <!-- Center Pirate Cannon -->
      <g transform="translate(158, 96) rotate(-22)">
        <rect x="-26" y="-11" width="54" height="22" rx="6" fill="#334155" stroke="#38BDF8" stroke-width="2"/>
        <rect x="22" y="-13" width="6" height="26" rx="2" fill="#FACC15"/>
      </g>
      <circle cx="152" cy="116" r="14" fill="#78350F" stroke="#FACC15" stroke-width="2.5"/>
      <!-- Neon Cube & Ice Block -->
      <rect x="214" y="84" width="40" height="40" rx="4" fill="#111827" stroke="#00F5D4" stroke-width="2.5"/>
      <circle cx="234" cy="104" r="10" fill="#FF2E93"/>
      <!-- GLB Badge -->
      <rect x="116" y="18" width="88" height="24" rx="12" fill="#0284C7" stroke="#BAE6FD" stroke-width="1.5"/>
      <text x="160" y="34" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF">7 MODELS • .GLB</text>
    </svg>
  `;

  // =========================================================================
  // 2. STUDIO STATE & 3D MESH RENDERING ENGINE
  // =========================================================================
  const studio = {
    running: false,
    selectedIndex: 0,
    skinIndex: 1, // For Carnival Tin Can (Skin 1 vs Skin 2)
    rotY: 0.65,
    rotX: 0.28,
    zoom: 1.0,
    autoRotate: true,
    wireframe: false,
    cartoonOutline: true,
    cannonElevationDeg: 14,
    recoilOffset: 0,
    muzzleFlash: 0,
    testProjectiles: [],
    testParticles: [],
    cachedMesh: null,
    cachedModelId: "",
    cachedElevation: 14
  };

  let canvas = null;
  let ctx = null;
  let animId = null;
  let lastTime = 0;

  function getCatalog() {
    return (window.Arcade3DModels && window.Arcade3DModels.STUDIO_MODEL_CATALOG) || [];
  }

  function getCurrentModelDef() {
    const cat = getCatalog();
    return cat[studio.selectedIndex] || cat[0];
  }

  function ensureMeshBuilt() {
    const modelDef = getCurrentModelDef();
    if (!modelDef) return null;
    if (
      !studio.cachedMesh ||
      studio.cachedModelId !== modelDef.id ||
      (modelDef.hasElevation && studio.cachedElevation !== studio.cannonElevationDeg)
    ) {
      studio.cachedMesh = modelDef.buildMesh({
        elevationDeg: studio.cannonElevationDeg,
        skinIndex: studio.skinIndex
      });
      studio.cachedModelId = modelDef.id;
      studio.cachedElevation = studio.cannonElevationDeg;
    }
    return studio.cachedMesh;
  }

  function sampleModelColor(modelDef, u, v, normalShade) {
    let baseR = 210, baseG = 160, baseB = 95;
    const id = modelDef.id;

    if (id === "pirate_cannon") {
      if (v > 0.5 && v < 0.76) {
        // Naval Oak Carriage
        baseR = 148; baseG = 78; baseB = 28;
      } else if (v < 0.18 || (v > 0.75 && v < 0.88)) {
        // Antique Brass Rings / Hubs
        baseR = 234; baseG = 179; baseB = 8;
      } else {
        // Forged Gunmetal Barrel
        baseR = 64; baseG = 76; baseB = 94;
      }
    } else if (id === "carnival_tin_can") {
      if (studio.skinIndex === 2) {
        // Skin 2: Cyberpunk Neon Tin Can
        if (v < 0.14 || v > 0.86) {
          baseR = 34; baseG = 211; baseB = 238;
        } else if (Math.sin(u * Math.PI * 12) > 0) {
          baseR = 236; baseG = 72; baseB = 153;
        } else {
          baseR = 24; baseG = 34; baseB = 62;
        }
      } else {
        // Skin 1: Classic Red & Cream Carnival Star Tin Can
        if (v < 0.14 || v > 0.86) {
          baseR = 209; baseG = 213; baseB = 219;
        } else if (v > 0.38 && v < 0.62) {
          baseR = 250; baseG = 204; baseB = 21;
        } else if (Math.sin(u * Math.PI * 10) > 0) {
          baseR = 239; baseG = 68; baseB = 68;
        } else {
          baseR = 254; baseG = 243; baseB = 199;
        }
      }
    } else if (id === "slatted_wooden_crate") {
      const border = u < 0.14 || u > 0.86 || v < 0.14 || v > 0.86 || Math.abs(u - v) < 0.1;
      if (border) {
        baseR = 122; baseG = 68; baseB = 24;
      } else {
        baseR = 198; baseG = 134; baseB = 66;
      }
    } else if (id === "banded_oak_barrel") {
      const isHoop = (v > 0.08 && v < 0.18) || (v > 0.3 && v < 0.38) || (v > 0.62 && v < 0.7) || (v > 0.82 && v < 0.9);
      if (isHoop) {
        baseR = 45; baseG = 55; baseB = 72;
      } else {
        baseR = 162; baseG = 94; baseB = 38;
      }
    } else if (id === "winter_ice_block") {
      baseR = 125; baseG = 211; baseB = 252;
    } else if (id === "cyberpunk_neon_cube") {
      const edge = u < 0.12 || u > 0.88 || v < 0.12 || v > 0.88;
      const inner = Math.abs(u - 0.5) < 0.18 && Math.abs(v - 0.5) < 0.18;
      if (edge) {
        baseR = 0; baseG = 245; baseB = 212;
      } else if (inner) {
        baseR = 255; baseG = 46; baseB = 147;
      } else {
        baseR = 30; baseG = 41; baseB = 59;
      }
    } else if (id === "moving_blocker_sign") {
      const stripe = Math.floor((u + v) * 8) % 2 === 0;
      if (v > 0.34 && v < 0.66 && u > 0.15 && u < 0.85) {
        baseR = 220; baseG = 38; baseB = 38;
      } else if (stripe) {
        baseR = 250; baseG = 204; baseB = 21;
      } else {
        baseR = 30; baseG = 41; baseB = 59;
      }
    }

    const r = Math.min(255, Math.max(0, Math.round(baseR * normalShade)));
    const g = Math.min(255, Math.max(0, Math.round(baseG * normalShade)));
    const b = Math.min(255, Math.max(0, Math.round(baseB * normalShade)));
    return `rgb(${r},${g},${b})`;
  }

  function triggerTestFire() {
    studio.recoilOffset = 0.28;
    studio.muzzleFlash = 0.16;

    if (window.CapyAudioShared) {
      window.CapyAudioShared.vibrate(32);
    }

    // Play cannon blast sound
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const actx = new AudioCtx();
        const now = actx.currentTime;
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(145, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 0.32);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {}

    const pitch = (studio.cannonElevationDeg * Math.PI) / 180;
    const dirY = Math.sin(pitch);
    const dirZ = -Math.cos(pitch);

    studio.testProjectiles.push({
      x: 0,
      y: 0.15 + dirY * 1.1,
      z: dirZ * 1.1,
      vx: 0,
      vy: dirY * 8.5,
      vz: dirZ * 8.5,
      life: 1.2
    });

    for (let i = 0; i < 18; i++) {
      studio.testParticles.push({
        x: (Math.random() - 0.5) * 0.2,
        y: 0.15 + dirY * 1.05,
        z: dirZ * 1.05,
        vx: (Math.random() - 0.5) * 2.2,
        vy: dirY * 2.5 + (Math.random() - 0.3) * 2.0,
        vz: dirZ * 2.5 + (Math.random() - 0.5) * 2.0,
        color: i < 6 ? "#FACC15" : "#E2E8F0",
        size: i < 6 ? 0.12 : 0.18,
        life: 0.55 + Math.random() * 0.3
      });
    }
  }

  function renderStudioFrame(dt) {
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w * 0.5;
    const cy = h * 0.47;
    const scaleBase = Math.min(w, h) * 0.31 * studio.zoom;

    if (studio.autoRotate) {
      studio.rotY += dt * 0.65;
    }
    if (studio.recoilOffset > 0) {
      studio.recoilOffset = Math.max(0, studio.recoilOffset - dt * 1.4);
    }
    if (studio.muzzleFlash > 0) {
      studio.muzzleFlash = Math.max(0, studio.muzzleFlash - dt);
    }

    // Background Studio Gradient
    const bg = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(w, h) * 0.7);
    bg.addColorStop(0, "#1E293B");
    bg.addColorStop(0.6, "#0F172A");
    bg.addColorStop(1, "#060911");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const cosY = Math.cos(studio.rotY);
    const sinY = Math.sin(studio.rotY);
    const cosX = Math.cos(studio.rotX);
    const sinX = Math.sin(studio.rotX);

    function transformVertex(px, py, pz) {
      // Apply recoil along local Z when Pirate Cannon fires
      const zRec = pz + (studio.cachedModelId === "pirate_cannon" ? studio.recoilOffset : 0);
      const x1 = px * cosY + zRec * sinY;
      const z1 = -px * sinY + zRec * cosY;
      const y2 = py * cosX - z1 * sinX;
      const z2 = py * sinX + z1 * cosX;
      const camDist = 3.8;
      const persp = camDist / Math.max(1.2, camDist - z2);
      return {
        sx: cx + x1 * scaleBase * persp,
        sy: cy - y2 * scaleBase * persp,
        z: z2,
        persp
      };
    }

    function transformNormal(nx, ny, nz) {
      const x1 = nx * cosY + nz * sinY;
      const z1 = -nx * sinY + nz * cosY;
      const y2 = ny * cosX - z1 * sinX;
      const z2 = ny * sinX + z1 * cosX;
      return { nx: x1, ny: y2, nz: z2 };
    }

    // 1. Draw 360° Turntable Pedestal Grid (Studio Helper — NOT included in GLB exports)
    ctx.save();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.lineWidth = 1.5;
    for (let g = -1.2; g <= 1.21; g += 0.4) {
      const a = transformVertex(g, -0.62, -1.2);
      const b = transformVertex(g, -0.62, 1.2);
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.sx, b.sy);
      ctx.stroke();

      const c = transformVertex(-1.2, -0.62, g);
      const d = transformVertex(1.2, -0.62, g);
      ctx.beginPath();
      ctx.moveTo(c.sx, c.sy);
      ctx.lineTo(d.sx, d.sy);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Render Selected 3D Mesh Triangles
    const modelDef = getCurrentModelDef();
    const mesh = ensureMeshBuilt();
    if (!modelDef || !mesh) return;

    const projVerts = new Array(mesh.vertexCount);
    for (let i = 0; i < mesh.vertexCount; i++) {
      projVerts[i] = transformVertex(
        mesh.positions[i * 3],
        mesh.positions[i * 3 + 1],
        mesh.positions[i * 3 + 2]
      );
    }

    const tris = [];
    const lightX = 0.45;
    const lightY = 0.75;
    const lightZ = 0.5;

    for (let i = 0; i < mesh.indexCount; i += 3) {
      const i0 = mesh.indices[i];
      const i1 = mesh.indices[i + 1];
      const i2 = mesh.indices[i + 2];

      const v0 = projVerts[i0];
      const v1 = projVerts[i1];
      const v2 = projVerts[i2];

      const n0 = transformNormal(
        mesh.normals[i0 * 3],
        mesh.normals[i0 * 3 + 1],
        mesh.normals[i0 * 3 + 2]
      );

      const dotL = Math.max(0, n0.nx * lightX + n0.ny * lightY + n0.nz * lightZ);
      const shade = 0.48 + dotL * 0.68;

      const uMid = (mesh.uvs[i0 * 2] + mesh.uvs[i1 * 2] + mesh.uvs[i2 * 2]) / 3;
      const vMid = (mesh.uvs[i0 * 2 + 1] + mesh.uvs[i1 * 2 + 1] + mesh.uvs[i2 * 2 + 1]) / 3;

      tris.push({
        v0,
        v1,
        v2,
        zAvg: (v0.z + v1.z + v2.z) / 3,
        color: sampleModelColor(modelDef, uMid, vMid, shade)
      });
    }

    tris.sort((a, b) => a.zAvg - b.zAvg);

    // Optional Pass A: Cartoon Outline (Inverted-Hull Cel Outline)
    if (studio.cartoonOutline) {
      ctx.save();
      ctx.strokeStyle = "#020617";
      ctx.lineWidth = 7.5;
      ctx.lineJoin = "round";
      tris.forEach((t) => {
        ctx.beginPath();
        ctx.moveTo(t.v0.sx, t.v0.sy);
        ctx.lineTo(t.v1.sx, t.v1.sy);
        ctx.lineTo(t.v2.sx, t.v2.sy);
        ctx.closePath();
        ctx.stroke();
      });
      ctx.restore();
    }

    // Pass B: Shaded Procedural Textured Triangles
    ctx.save();
    ctx.globalAlpha = modelDef.alpha || 1.0;
    tris.forEach((t) => {
      ctx.fillStyle = t.color;
      ctx.strokeStyle = studio.wireframe ? "#38BDF8" : t.color;
      ctx.lineWidth = studio.wireframe ? 1.2 : 0.6;
      ctx.beginPath();
      ctx.moveTo(t.v0.sx, t.v0.sy);
      ctx.lineTo(t.v1.sx, t.v1.sy);
      ctx.lineTo(t.v2.sx, t.v2.sy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();

    // 3. Step & Render Test-Fire Projectiles and Smoke Particles
    for (let i = studio.testProjectiles.length - 1; i >= 0; i--) {
      const ball = studio.testProjectiles[i];
      ball.life -= dt;
      if (ball.life <= 0) {
        studio.testProjectiles.splice(i, 1);
        continue;
      }
      ball.vy -= 9.8 * dt;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      ball.z += ball.vz * dt;
      const pv = transformVertex(ball.x, ball.y, ball.z);
      ctx.fillStyle = "#FACC15";
      ctx.beginPath();
      ctx.arc(pv.sx, pv.sy, Math.max(5, 14 * pv.persp), 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = studio.testParticles.length - 1; i >= 0; i--) {
      const pt = studio.testParticles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        studio.testParticles.splice(i, 1);
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.z += pt.vz * dt;
      const pv = transformVertex(pt.x, pt.y, pt.z);
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, pt.life);
      ctx.beginPath();
      ctx.arc(pv.sx, pv.sy, Math.max(3, pt.size * scaleBase * 0.4 * pv.persp), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  let studioToastTimer = null;
  function showStudioToast(msg) {
    const el = document.getElementById("studio-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    if (studioToastTimer) clearTimeout(studioToastTimer);
    studioToastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function updateStudioUI() {
    const modelDef = getCurrentModelDef();
    if (!modelDef) return;

    const titleEl = document.getElementById("studio-model-title");
    if (titleEl) titleEl.textContent = `${modelDef.number}. ${modelDef.name}`;

    const subEl = document.getElementById("studio-model-desc");
    if (subEl) subEl.textContent = modelDef.description;

    const texPreviewWrap = document.getElementById("studio-tex-preview");
    if (texPreviewWrap && window.Arcade3DModels) {
      const key =
        modelDef.hasTwoSkins && studio.skinIndex === 2 ? modelDef.altTexKey : modelDef.texKey;
      const texCanv = window.Arcade3DModels.getProceduralTextureCanvas(key);
      texPreviewWrap.innerHTML = "";
      if (texCanv) {
        const img = document.createElement("img");
        img.src = texCanv.toDataURL("image/png");
        img.alt = modelDef.name + " Procedural Texture";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        texPreviewWrap.appendChild(img);
      }
    }

    // Show Skin Switcher when Carnival Tin Can is selected
    const skinRow = document.getElementById("studio-skin-row");
    if (skinRow) {
      skinRow.classList.toggle("hidden", !modelDef.hasTwoSkins);
    }

    // Show Cannon Elevation & Test Fire controls when Pirate Cannon is selected (or keep available)
    const cannonRow = document.getElementById("studio-cannon-controls");
    if (cannonRow) {
      cannonRow.style.opacity = modelDef.hasElevation ? "1" : "0.65";
    }

    // Update Model Selector Chips
    document.querySelectorAll("[data-studio-model-idx]").forEach((btn) => {
      const idx = parseInt(btn.getAttribute("data-studio-model-idx"), 10);
      btn.classList.toggle("active", idx === studio.selectedIndex);
    });

    // Update Toggle Buttons
    const btnOutline = document.getElementById("btn-studio-outline");
    if (btnOutline) {
      btnOutline.classList.toggle("active", studio.cartoonOutline);
      btnOutline.textContent = `Outline: ${studio.cartoonOutline ? "ON" : "OFF"}`;
    }

    const btnWire = document.getElementById("btn-studio-wireframe");
    if (btnWire) {
      btnWire.classList.toggle("active", studio.wireframe);
      btnWire.textContent = `Wireframe: ${studio.wireframe ? "ON" : "OFF"}`;
    }

    const btnAuto = document.getElementById("btn-studio-autorotate");
    if (btnAuto) {
      btnAuto.classList.toggle("active", studio.autoRotate);
      btnAuto.textContent = `Auto-Rotate: ${studio.autoRotate ? "ON" : "OFF"}`;
    }
  }

  function resizeStudioCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(320, Math.floor(window.innerWidth * dpr));
    canvas.height = Math.max(480, Math.floor(window.innerHeight * dpr));
  }

  function studioLoop(now) {
    if (!studio.running) return;
    animId = requestAnimationFrame(studioLoop);
    const dt = Math.min(0.033, Math.max(0.001, (now - lastTime) * 0.001));
    lastTime = now;
    renderStudioFrame(dt);
  }

  function initStudio() {
    canvas = document.getElementById("studio-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    // Populate the 7 Model Selector Chips
    const chipBar = document.getElementById("studio-model-chips");
    const cat = getCatalog();
    if (chipBar && cat.length) {
      chipBar.innerHTML = cat
        .map(
          (m, idx) => `
          <button class="studio-chip ${idx === 0 ? "active" : ""}" data-studio-model-idx="${idx}">
            #${m.number} ${m.name.split(" (")[0]}
          </button>
        `
        )
        .join("");

      chipBar.querySelectorAll("[data-studio-model-idx]").forEach((btn) => {
        btn.addEventListener("click", () => {
          studio.selectedIndex = parseInt(btn.getAttribute("data-studio-model-idx"), 10);
          studio.cachedMesh = null;
          updateStudioUI();
        });
      });
    }

    // 360° Touch & Mouse Orbit on Canvas
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener("pointerdown", (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    window.addEventListener("pointermove", (e) => {
      if (!dragging || !studio.running) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      studio.rotY += dx * 0.012;
      studio.rotX = Math.max(-1.1, Math.min(1.1, studio.rotX + dy * 0.012));
    });

    window.addEventListener("pointerup", () => {
      dragging = false;
    });

    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        studio.zoom = Math.max(0.55, Math.min(2.1, studio.zoom - e.deltaY * 0.001));
      },
      { passive: false }
    );

    // Camera Zoom & Reset Buttons
    const btnZoomIn = document.getElementById("btn-studio-zoom-in");
    if (btnZoomIn) {
      btnZoomIn.addEventListener("click", () => {
        studio.zoom = Math.min(2.1, studio.zoom + 0.18);
      });
    }

    const btnZoomOut = document.getElementById("btn-studio-zoom-out");
    if (btnZoomOut) {
      btnZoomOut.addEventListener("click", () => {
        studio.zoom = Math.max(0.55, studio.zoom - 0.18);
      });
    }

    const btnResetCam = document.getElementById("btn-studio-reset-cam");
    if (btnResetCam) {
      btnResetCam.addEventListener("click", () => {
        studio.rotY = 0.65;
        studio.rotX = 0.28;
        studio.zoom = 1.0;
      });
    }

    // Toggle Buttons: Outline, Wireframe, Auto-Rotate
    const btnOutline = document.getElementById("btn-studio-outline");
    if (btnOutline) {
      btnOutline.addEventListener("click", () => {
        studio.cartoonOutline = !studio.cartoonOutline;
        updateStudioUI();
      });
    }

    const btnWire = document.getElementById("btn-studio-wireframe");
    if (btnWire) {
      btnWire.addEventListener("click", () => {
        studio.wireframe = !studio.wireframe;
        updateStudioUI();
      });
    }

    const btnAuto = document.getElementById("btn-studio-autorotate");
    if (btnAuto) {
      btnAuto.addEventListener("click", () => {
        studio.autoRotate = !studio.autoRotate;
        updateStudioUI();
      });
    }

    // Tin Can Skin 1 / Skin 2 Toggle
    const btnSkin1 = document.getElementById("btn-studio-skin1");
    const btnSkin2 = document.getElementById("btn-studio-skin2");
    if (btnSkin1 && btnSkin2) {
      btnSkin1.addEventListener("click", () => {
        studio.skinIndex = 1;
        btnSkin1.classList.add("active");
        btnSkin2.classList.remove("active");
        updateStudioUI();
      });
      btnSkin2.addEventListener("click", () => {
        studio.skinIndex = 2;
        btnSkin2.classList.add("active");
        btnSkin1.classList.remove("active");
        updateStudioUI();
      });
    }

    // Cannon Elevation Slider & Test Fire Button
    const elevSlider = document.getElementById("studio-elevation-slider");
    const elevVal = document.getElementById("studio-elevation-val");
    if (elevSlider) {
      elevSlider.addEventListener("input", () => {
        studio.cannonElevationDeg = parseFloat(elevSlider.value) || 0;
        if (elevVal) elevVal.textContent = `${studio.cannonElevationDeg}°`;
        if (studio.selectedIndex !== 0) {
          studio.selectedIndex = 0; // Switch to Pirate Cannon to show elevation live
        }
        studio.cachedMesh = null;
        updateStudioUI();
      });
    }

    const btnTestFire = document.getElementById("btn-studio-test-fire");
    if (btnTestFire) {
      btnTestFire.addEventListener("click", () => {
        studio.selectedIndex = 0;
        studio.cachedMesh = null;
        updateStudioUI();
        triggerTestFire();
      });
    }

    // Individual GLB Download Button
    const btnDlSingle = document.getElementById("btn-studio-dl-single");
    if (btnDlSingle) {
      btnDlSingle.addEventListener("click", () => {
        const modelDef = getCurrentModelDef();
        if (!modelDef || !window.Arcade3DModels) return;
        const res = window.Arcade3DModels.downloadGlbModel(modelDef.id, {
          elevationDeg: studio.cannonElevationDeg,
          skinIndex: studio.skinIndex
        });
        if (res) {
          const kb = (res.byteLength / 1024).toFixed(1);
          showStudioToast(`✓ Exported ${res.fileName} (${kb} KB)`);
        }
      });
    }

    // Download All 7 Models as Separate GLB Files Button
    const btnDlAll = document.getElementById("btn-studio-dl-all");
    if (btnDlAll) {
      btnDlAll.addEventListener("click", () => {
        const catalog = getCatalog();
        if (!catalog.length || !window.Arcade3DModels) return;
        showStudioToast("Exporting all 7 game-ready .GLB models…");
        catalog.forEach((m, i) => {
          setTimeout(() => {
            const res = window.Arcade3DModels.downloadGlbModel(m.id, {
              elevationDeg: studio.cannonElevationDeg,
              skinIndex: 1
            });
            if (i === catalog.length - 1 && res) {
              showStudioToast("✓ All 7 separate .GLB models exported to Downloads!");
            }
          }, i * 240);
        });
      });
    }

    const btnHub = document.getElementById("btn-studio-hub");
    if (btnHub) {
      btnHub.addEventListener("click", () => {
        if (window.CosmicGameHub) window.CosmicGameHub.openHub();
      });
    }
  }

  function registerStudioInHub() {
    if (!window.CosmicGameHub) return;
    window.CosmicGameHub.registerGame({
      id: "asset-studio-3d",
      name: "3D Game Asset Studio",
      subtitle: "7 Original 3D Models • GLB Exporter",
      badge: "3D STUDIO",
      accentColor: "#0284C7",
      buttonGradient: "linear-gradient(135deg, #0284C7, #2563EB)",
      logoHtml: STUDIO_LOGO_SVG,
      thumbnailHtml: STUDIO_THUMB_SVG,
      description: "Inspect all 7 original 3D models in 360°, toggle Cartoon Outline & Wireframe, test-fire the Pirate Cannon, and export clean .GLB files!",
      getStatsText: () => "7 Original Models • Binary .GLB Export"
    });
  }

  window.AssetStudioController = {
    start() {
      if (!canvas) initStudio();
      resizeStudioCanvas();
      studio.cachedMesh = null;
      updateStudioUI();
      studio.running = true;
      lastTime = performance.now();
      if (animId) cancelAnimationFrame(animId);
      animId = requestAnimationFrame(studioLoop);
    },
    stop() {
      studio.running = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initStudio();
      registerStudioInHub();
    });
  } else {
    initStudio();
    registerStudioInHub();
  }
})();
