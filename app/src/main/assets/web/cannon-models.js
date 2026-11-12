/**
 * SHARED 3D PROCEDURAL GEOMETRY, HIGH-RES PROCEDURAL TEXTURES & BINARY GLB 2.0 EXPORTER
 * Powers both "Cannon Knockdown 3D" and the "3D Game Asset Studio"
 *
 * Includes the 7 Original Game-Ready 3D Models:
 * 1. Pirate Carnival Cannon (with separate Carriage + Elevating/Recoiling Barrel)
 * 2. Carnival Tin Can (with 2 switchable Skins: Classic Carnival & Cyberpunk Neon)
 * 3. Slatted Wooden Crate (framed timber crate with raised cross-slats)
 * 4. Banded Oak Barrel (bulged oak staves + 4 raised riveted iron bands)
 * 5. Translucent Winter Ice Block (beveled glacial block + inner crystal core)
 * 6. Cyberpunk Neon Target Cube (chamfered sci-fi cube + emissive neon circuitry)
 * 7. Moving Carnival Blocker Sign (steel-framed hazard shield + warning chevrons)
 *
 * Also includes a clean, standards-compliant Binary glTF 2.0 (.glb) Exporter
 * that exports game-ready meshes + embedded PNG textures without studio helpers.
 */

(function () {
  "use strict";

  // =========================================================================
  // 1. PROCEDURAL 512x512 HTML5 CANVAS TEXTURE GENERATOR
  // =========================================================================
  const textureCanvasCache = {};

  function getProceduralTextureCanvas(texKey) {
    if (textureCanvasCache[texKey]) return textureCanvasCache[texKey];

    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d");

    if (texKey === "cannon_metal") {
      // Forged gunmetal & antique brass trim
      const g = ctx.createLinearGradient(0, 0, 256, 256);
      g.addColorStop(0, "#2C333E");
      g.addColorStop(0.5, "#1E232B");
      g.addColorStop(1, "#39414F");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);

      // Subtle metallic brushing & rivets
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      for (let i = 0; i < 120; i++) {
        ctx.fillRect((i * 37) % 256, (i * 19) % 256, 18, 2);
      }
      // Golden Pirate / Carnival stripes along top band
      ctx.fillStyle = "#EAB308";
      ctx.fillRect(0, 24, 256, 20);
      ctx.fillRect(0, 198, 256, 22);
      // Warm oak wood section in lower UV quadrant for carriage
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(0, 128, 256, 68);
      ctx.strokeStyle = "#5C2D0C";
      ctx.lineWidth = 3;
      for (let y = 134; y < 194; y += 10) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
      }
    } else if (texKey === "tincan_skin1") {
      // Skin 1: Classic Red & Cream Carnival Tin Can with Star Emblem
      ctx.fillStyle = "#FFFBEB";
      ctx.fillRect(0, 0, 256, 256);

      // Vertical carnival stripes
      ctx.fillStyle = "#EF4444";
      for (let x = 0; x < 256; x += 32) {
        ctx.fillRect(x, 28, 16, 200);
      }

      // Metallic silver top & bottom rims
      const rimGrad = ctx.createLinearGradient(0, 0, 256, 0);
      rimGrad.addColorStop(0, "#9CA3AF");
      rimGrad.addColorStop(0.5, "#F3F4F6");
      rimGrad.addColorStop(1, "#6B7280");
      ctx.fillStyle = rimGrad;
      ctx.fillRect(0, 0, 256, 30);
      ctx.fillRect(0, 226, 256, 30);

      // Center Gold Carnival Banner & Star
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(0, 92, 256, 72);
      ctx.strokeStyle = "#FACC15";
      ctx.lineWidth = 5;
      ctx.strokeRect(2, 94, 252, 68);

      ctx.fillStyle = "#FACC15";
      ctx.font = "900 28px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("★ CARNIVAL ★", 128, 128);
    } else if (texKey === "tincan_skin2") {
      // Skin 2: Cyberpunk Neon Cyan & Hot Magenta Tin Can
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, 256, 256);

      // Glowing neon grid lines
      ctx.strokeStyle = "#06B6D4";
      ctx.lineWidth = 2;
      for (let x = 0; x < 256; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 256);
        ctx.stroke();
      }
      ctx.fillStyle = "#EC4899";
      ctx.fillRect(0, 32, 256, 16);
      ctx.fillRect(0, 208, 256, 16);

      ctx.fillStyle = "#22D3EE";
      ctx.fillRect(0, 102, 256, 52);
      ctx.fillStyle = "#090D16";
      ctx.font = "900 26px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚡ CYBER-CAN ⚡", 128, 128);
    } else if (texKey === "wooden_crate") {
      // Slatted Wooden Crate Texture
      ctx.fillStyle = "#C68642";
      ctx.fillRect(0, 0, 256, 256);

      // Wood planks & grain
      ctx.strokeStyle = "#8D5524";
      ctx.lineWidth = 4;
      for (let y = 0; y < 256; y += 32) {
        ctx.strokeRect(4, y + 2, 248, 28);
      }

      // Outer frame & diagonal brace
      ctx.strokeStyle = "#6E3F14";
      ctx.lineWidth = 22;
      ctx.strokeRect(11, 11, 234, 234);
      ctx.beginPath();
      ctx.moveTo(16, 16);
      ctx.lineTo(240, 240);
      ctx.stroke();

      // Corner iron bolts
      ctx.fillStyle = "#374151";
      [
        [20, 20],
        [236, 20],
        [20, 236],
        [236, 236]
      ].forEach(([bx, by]) => {
        ctx.beginPath();
        ctx.arc(bx, by, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (texKey === "oak_barrel") {
      // Banded Oak Barrel Texture
      ctx.fillStyle = "#9A5B25";
      ctx.fillRect(0, 0, 256, 256);

      // Vertical stave seams
      ctx.strokeStyle = "#5C3310";
      ctx.lineWidth = 3;
      for (let x = 0; x < 256; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 256);
        ctx.stroke();
      }

      // 4 Forged Iron Hoops + Silver Rivets
      const hoopYs = [24, 78, 162, 214];
      hoopYs.forEach((hy) => {
        ctx.fillStyle = "#1F2937";
        ctx.fillRect(0, hy, 256, 20);
        ctx.fillStyle = "#9CA3AF";
        for (let rx = 14; rx < 256; rx += 32) {
          ctx.beginPath();
          ctx.arc(rx, hy + 10, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else if (texKey === "winter_ice") {
      // Translucent Winter Ice Block Texture
      const g = ctx.createLinearGradient(0, 0, 256, 256);
      g.addColorStop(0, "#E0F2FE");
      g.addColorStop(0.5, "#7DD3FC");
      g.addColorStop(1, "#38BDF8");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);

      // Crystalline frost veins & highlights
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 236, 236);
      ctx.beginPath();
      ctx.moveTo(24, 60);
      ctx.lineTo(110, 128);
      ctx.lineTo(220, 85);
      ctx.moveTo(110, 128);
      ctx.lineTo(155, 225);
      ctx.stroke();
    } else if (texKey === "cyber_cube") {
      // Cyberpunk Neon Target Cube Texture
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, 256, 256);

      // Glowing outer neon border
      ctx.strokeStyle = "#00F5D4";
      ctx.lineWidth = 12;
      ctx.strokeRect(14, 14, 228, 228);

      // Inner magenta circuit traces
      ctx.strokeStyle = "#FF2E93";
      ctx.lineWidth = 6;
      ctx.strokeRect(48, 48, 160, 160);

      // Bullseye core
      ctx.fillStyle = "#00F5D4";
      ctx.beginPath();
      ctx.arc(128, 128, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#111827";
      ctx.beginPath();
      ctx.arc(128, 128, 16, 0, Math.PI * 2);
      ctx.fill();
    } else if (texKey === "blocker_sign") {
      // Moving Carnival Blocker Sign Texture (Yellow & Black/Red Hazard Chevrons)
      ctx.fillStyle = "#FACC15";
      ctx.fillRect(0, 0, 256, 256);

      ctx.fillStyle = "#1E293B";
      for (let i = -256; i < 512; i += 44) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 22, 0);
        ctx.lineTo(i - 100, 256);
        ctx.lineTo(i - 122, 256);
        ctx.closePath();
        ctx.fill();
      }

      // Red Warning Plate in Center
      ctx.fillStyle = "#DC2626";
      ctx.fillRect(24, 84, 208, 88);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 5;
      ctx.strokeRect(26, 86, 204, 84);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 28px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚠ BLOCKER ⚠", 128, 128);
    }

    textureCanvasCache[texKey] = c;
    return c;
  }

  // =========================================================================
  // 2. GEOMETRY BUILDER PRIMITIVES (POSITIONS, NORMALS, UVS, INDICES)
  // =========================================================================
  function createMeshBuilder() {
    return {
      positions: [],
      normals: [],
      uvs: [],
      indices: [],
      vertexCount: 0
    };
  }

  function pushVertex(b, px, py, pz, nx, ny, nz, u, v) {
    b.positions.push(px, py, pz);
    b.normals.push(nx, ny, nz);
    b.uvs.push(u, v);
    return b.vertexCount++;
  }

  function addBoxPart(b, cx, cy, cz, sx, sy, sz, uvRect) {
    const hx = sx * 0.5;
    const hy = sy * 0.5;
    const hz = sz * 0.5;
    const u0 = uvRect ? uvRect[0] : 0;
    const v0 = uvRect ? uvRect[1] : 0;
    const u1 = uvRect ? uvRect[2] : 1;
    const v1 = uvRect ? uvRect[3] : 1;

    const faces = [
      // +Z front
      { n: [0, 0, 1], v: [[-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz]] },
      // -Z back
      { n: [0, 0, -1], v: [[hx, -hy, -hz], [-hx, -hy, -hz], [-hx, hy, -hz], [hx, hy, -hz]] },
      // +X right
      { n: [1, 0, 0], v: [[hx, -hy, hz], [hx, -hy, -hz], [hx, hy, -hz], [hx, hy, hz]] },
      // -X left
      { n: [-1, 0, 0], v: [[-hx, -hy, -hz], [-hx, -hy, hz], [-hx, hy, hz], [-hx, hy, -hz]] },
      // +Y top
      { n: [0, 1, 0], v: [[-hx, hy, hz], [hx, hy, hz], [hx, hy, -hz], [-hx, hy, -hz]] },
      // -Y bottom
      { n: [0, -1, 0], v: [[-hx, -hy, -hz], [hx, -hy, -hz], [hx, -hy, hz], [-hx, -hy, hz]] }
    ];

    faces.forEach((f) => {
      const i0 = pushVertex(b, cx + f.v[0][0], cy + f.v[0][1], cz + f.v[0][2], f.n[0], f.n[1], f.n[2], u0, v1);
      const i1 = pushVertex(b, cx + f.v[1][0], cy + f.v[1][1], cz + f.v[1][2], f.n[0], f.n[1], f.n[2], u1, v1);
      const i2 = pushVertex(b, cx + f.v[2][0], cy + f.v[2][1], cz + f.v[2][2], f.n[0], f.n[1], f.n[2], u1, v0);
      const i3 = pushVertex(b, cx + f.v[3][0], cy + f.v[3][1], cz + f.v[3][2], f.n[0], f.n[1], f.n[2], u0, v0);
      b.indices.push(i0, i1, i2, i0, i2, i3);
    });
  }

  /**
   * Adds a generalized cylinder / cone / barrel lathe along Y or Z axis
   */
  function addCylinderPart(b, cx, cy, cz, rBottom, rTop, height, radialSegs, axis, uvRect, bulgeFactor) {
    const segs = radialSegs || 18;
    const h2 = height * 0.5;
    const u0 = uvRect ? uvRect[0] : 0;
    const v0 = uvRect ? uvRect[1] : 0;
    const u1 = uvRect ? uvRect[2] : 1;
    const v1 = uvRect ? uvRect[3] : 1;
    const bulge = bulgeFactor || 0;
    const rings = bulge !== 0 ? 6 : 1;

    const ringIndices = [];
    for (let r = 0; r <= rings; r++) {
      const t = r / rings;
      const yLocal = -h2 + t * height;
      const baseR = rBottom + (rTop - rBottom) * t;
      const rad = baseR * (1 + bulge * Math.sin(t * Math.PI));
      const row = [];

      for (let s = 0; s <= segs; s++) {
        const uFrac = s / segs;
        const theta = uFrac * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        let px, py, pz, nx, ny, nz;
        if (axis === "z") {
          px = cx + cosT * rad;
          py = cy + sinT * rad;
          pz = cz + yLocal;
          nx = cosT;
          ny = sinT;
          nz = 0;
        } else if (axis === "x") {
          px = cx + yLocal;
          py = cy + sinT * rad;
          pz = cz + cosT * rad;
          nx = 0;
          ny = sinT;
          nz = cosT;
        } else {
          px = cx + cosT * rad;
          py = cy + yLocal;
          pz = cz + sinT * rad;
          nx = cosT;
          ny = 0;
          nz = sinT;
        }

        const u = u0 + uFrac * (u1 - u0);
        const v = v1 - t * (v1 - v0);
        row.push(pushVertex(b, px, py, pz, nx, ny, nz, u, v));
      }
      ringIndices.push(row);
    }

    for (let r = 0; r < rings; r++) {
      for (let s = 0; s < segs; s++) {
        const a = ringIndices[r][s];
        const bIdx = ringIndices[r][s + 1];
        const c = ringIndices[r + 1][s + 1];
        const d = ringIndices[r + 1][s];
        b.indices.push(a, bIdx, c, a, c, d);
      }
    }

    // Top and bottom caps
    const addCap = (isTop) => {
      const yLocal = isTop ? h2 : -h2;
      const rad = isTop ? rTop : rBottom;
      if (rad <= 0.001) return;
      const sign = isTop ? 1 : -1;
      let nx = 0, ny = 0, nz = 0;
      let capCx = cx, capCy = cy, capCz = cz;
      if (axis === "z") {
        capCz += yLocal;
        nz = sign;
      } else if (axis === "x") {
        capCx += yLocal;
        nx = sign;
      } else {
        capCy += yLocal;
        ny = sign;
      }
      const centerIdx = pushVertex(b, capCx, capCy, capCz, nx, ny, nz, 0.5, isTop ? 0.08 : 0.92);
      const rim = [];
      for (let s = 0; s <= segs; s++) {
        const theta = (s / segs) * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        let px = capCx, py = capCy, pz = capCz;
        if (axis === "z") {
          px += cosT * rad;
          py += sinT * rad;
        } else if (axis === "x") {
          py += sinT * rad;
          pz += cosT * rad;
        } else {
          px += cosT * rad;
          pz += sinT * rad;
        }
        rim.push(pushVertex(b, px, py, pz, nx, ny, nz, 0.5 + cosT * 0.1, isTop ? 0.08 : 0.92));
      }
      for (let s = 0; s < segs; s++) {
        if (isTop) {
          b.indices.push(centerIdx, rim[s + 1], rim[s]);
        } else {
          b.indices.push(centerIdx, rim[s], rim[s + 1]);
        }
      }
    };

    addCap(false);
    addCap(true);
  }

  function finalizeMesh(b) {
    return {
      positions: new Float32Array(b.positions),
      normals: new Float32Array(b.normals),
      uvs: new Float32Array(b.uvs),
      indices: new Uint16Array(b.indices),
      vertexCount: b.vertexCount,
      indexCount: b.indices.length
    };
  }

  // =========================================================================
  // 3. BUILD THE 7 ORIGINAL GAME-READY 3D MODELS
  // =========================================================================
  function buildCannonCarriageMesh() {
    const b = createMeshBuilder();
    // Wooden side cheeks (UV mapped to oak wood band 0.5..0.75)
    addBoxPart(b, -0.52, -0.18, 0.0, 0.18, 0.48, 1.45, [0, 0.52, 1, 0.75]);
    addBoxPart(b, 0.52, -0.18, 0.0, 0.18, 0.48, 1.45, [0, 0.52, 1, 0.75]);
    // Cross-beams
    addBoxPart(b, 0.0, -0.32, 0.38, 1.04, 0.18, 0.34, [0, 0.52, 1, 0.75]);
    addBoxPart(b, 0.0, -0.32, -0.38, 1.04, 0.18, 0.34, [0, 0.52, 1, 0.75]);
    // Iron axles
    addCylinderPart(b, 0.0, -0.38, 0.44, 0.08, 0.08, 1.48, 12, "x", [0, 0.15, 1, 0.45], 0);
    addCylinderPart(b, 0.0, -0.38, -0.44, 0.08, 0.08, 1.48, 12, "x", [0, 0.15, 1, 0.45], 0);
    // 4 Naval Carriage Wheels with brass hubs
    [
      [-0.68, -0.38, 0.44],
      [0.68, -0.38, 0.44],
      [-0.68, -0.38, -0.44],
      [0.68, -0.38, -0.44]
    ].forEach(([wx, wy, wz]) => {
      addCylinderPart(b, wx, wy, wz, 0.32, 0.32, 0.14, 16, "x", [0, 0.76, 1, 0.88], 0);
      addCylinderPart(b, wx + (wx < 0 ? -0.06 : 0.06), wy, wz, 0.11, 0.11, 0.08, 12, "x", [0, 0.08, 1, 0.16], 0);
    });
    return finalizeMesh(b);
  }

  function buildCannonBarrelMesh() {
    const b = createMeshBuilder();
    // Main tapered iron barrel pointing along -Z (forward)
    addCylinderPart(b, 0, 0.12, -0.15, 0.36, 0.27, 1.75, 20, "z", [0, 0.15, 1, 0.48], 0.06);
    // Flared Muzzle Ring with golden band
    addCylinderPart(b, 0, 0.12, -1.02, 0.33, 0.35, 0.22, 20, "z", [0, 0.08, 1, 0.18], 0);
    // Mid reinforcement brass rings
    addCylinderPart(b, 0, 0.12, -0.45, 0.35, 0.35, 0.10, 20, "z", [0, 0.08, 1, 0.18], 0);
    addCylinderPart(b, 0, 0.12, 0.25, 0.39, 0.39, 0.11, 20, "z", [0, 0.08, 1, 0.18], 0);
    // Breech cascabel knob at rear (+Z)
    addCylinderPart(b, 0, 0.12, 0.84, 0.16, 0.06, 0.26, 14, "z", [0, 0.08, 1, 0.18], 0.35);
    // Trunnion pivot pins
    addCylinderPart(b, 0, 0.08, 0.05, 0.10, 0.10, 1.18, 12, "x", [0, 0.15, 1, 0.45], 0);
    return finalizeMesh(b);
  }

  function buildFullPirateCannonMesh(elevationDeg) {
    const pitchRad = ((elevationDeg || 12) * Math.PI) / 180;
    const carriage = buildCannonCarriageMesh();
    const barrel = buildCannonBarrelMesh();
    const b = createMeshBuilder();

    // Copy carriage vertices
    for (let i = 0; i < carriage.vertexCount; i++) {
      pushVertex(
        b,
        carriage.positions[i * 3],
        carriage.positions[i * 3 + 1],
        carriage.positions[i * 3 + 2],
        carriage.normals[i * 3],
        carriage.normals[i * 3 + 1],
        carriage.normals[i * 3 + 2],
        carriage.uvs[i * 2],
        carriage.uvs[i * 2 + 1]
      );
    }
    for (let i = 0; i < carriage.indexCount; i++) {
      b.indices.push(carriage.indices[i]);
    }

    // Rotate barrel around pivot (0, 0.12, 0.05) by pitchRad
    const baseOffset = b.vertexCount;
    const cosP = Math.cos(pitchRad);
    const sinP = Math.sin(pitchRad);
    const py0 = 0.12;
    const pz0 = 0.05;

    for (let i = 0; i < barrel.vertexCount; i++) {
      const px = barrel.positions[i * 3];
      const dy = barrel.positions[i * 3 + 1] - py0;
      const dz = barrel.positions[i * 3 + 2] - pz0;
      const ry = py0 + dy * cosP - dz * sinP;
      const rz = pz0 + dy * sinP + dz * cosP;

      const nx = barrel.normals[i * 3];
      const ny = barrel.normals[i * 3 + 1];
      const nz = barrel.normals[i * 3 + 2];
      const rny = ny * cosP - nz * sinP;
      const rnz = ny * sinP + nz * cosP;

      pushVertex(b, px, ry, rz, nx, rny, rnz, barrel.uvs[i * 2], barrel.uvs[i * 2 + 1]);
    }
    for (let i = 0; i < barrel.indexCount; i++) {
      b.indices.push(baseOffset + barrel.indices[i]);
    }

    return finalizeMesh(b);
  }

  function buildCarnivalTinCanMesh() {
    const b = createMeshBuilder();
    // Main cylinder body
    addCylinderPart(b, 0, 0, 0, 0.42, 0.42, 1.08, 22, "y", [0, 0.12, 1, 0.88], 0);
    // Raised top & bottom rolled metal rims
    addCylinderPart(b, 0, 0.51, 0, 0.445, 0.445, 0.08, 22, "y", [0, 0.0, 1, 0.11], 0);
    addCylinderPart(b, 0, -0.51, 0, 0.445, 0.445, 0.08, 22, "y", [0, 0.89, 1, 1.0], 0);
    return finalizeMesh(b);
  }

  function buildSlattedWoodenCrateMesh() {
    const b = createMeshBuilder();
    // Core recessed timber box
    addBoxPart(b, 0, 0, 0, 0.96, 0.96, 0.96, [0.06, 0.06, 0.94, 0.94]);
    // Raised outer corner posts & top/bottom beams for 3D depth
    const p = 0.46;
    const t = 0.11;
    [
      [-p, 0, -p],
      [p, 0, -p],
      [-p, 0, p],
      [p, 0, p]
    ].forEach(([x, y, z]) => {
      addBoxPart(b, x, y, z, t, 1.04, t, [0, 0, 0.15, 1]);
    });
    [
      [0, p, -p],
      [0, p, p],
      [0, -p, -p],
      [0, -p, p]
    ].forEach(([x, y, z]) => {
      addBoxPart(b, x, y, z, 1.04, t, t, [0, 0, 1, 0.15]);
    });
    [
      [-p, p, 0],
      [p, p, 0],
      [-p, -p, 0],
      [p, -p, 0]
    ].forEach(([x, y, z]) => {
      addBoxPart(b, x, y, z, t, t, 1.04, [0, 0, 1, 0.15]);
    });
    return finalizeMesh(b);
  }

  function buildBandedOakBarrelMesh() {
    const b = createMeshBuilder();
    // Bulged oak stave hull
    addCylinderPart(b, 0, 0, 0, 0.44, 0.44, 1.24, 22, "y", [0, 0, 1, 1], 0.18);
    // 2 Raised Iron Hoops
    addCylinderPart(b, 0, 0.34, 0, 0.50, 0.48, 0.09, 22, "y", [0, 0.09, 1, 0.16], 0);
    addCylinderPart(b, 0, -0.34, 0, 0.48, 0.50, 0.09, 22, "y", [0, 0.09, 1, 0.16], 0);
    return finalizeMesh(b);
  }

  function buildWinterIceBlockMesh() {
    const b = createMeshBuilder();
    // Outer beveled crystal cube
    addBoxPart(b, 0, 0, 0, 1.0, 1.0, 1.0, [0, 0, 1, 1]);
    // Inner refracting ice crystal prism
    addBoxPart(b, 0, 0, 0, 0.68, 0.68, 0.68, [0.15, 0.15, 0.85, 0.85]);
    return finalizeMesh(b);
  }

  function buildCyberpunkNeonCubeMesh() {
    const b = createMeshBuilder();
    // Core dark tech cube
    addBoxPart(b, 0, 0, 0, 0.96, 0.96, 0.96, [0, 0, 1, 1]);
    // Raised armor face plates
    addBoxPart(b, 0, 0, 0, 1.02, 0.72, 0.72, [0.15, 0.15, 0.85, 0.85]);
    addBoxPart(b, 0, 0, 0, 0.72, 1.02, 0.72, [0.15, 0.15, 0.85, 0.85]);
    addBoxPart(b, 0, 0, 0, 0.72, 0.72, 1.02, [0.15, 0.15, 0.85, 0.85]);
    return finalizeMesh(b);
  }

  function buildMovingBlockerSignMesh() {
    const b = createMeshBuilder();
    // Main hazard sign board
    addBoxPart(b, 0, 0.12, 0, 1.56, 0.96, 0.18, [0, 0, 1, 1]);
    // Top & bottom reinforced steel bumper bars
    addBoxPart(b, 0, 0.62, 0, 1.64, 0.12, 0.24, [0, 0, 1, 0.18]);
    addBoxPart(b, 0, -0.38, 0, 1.64, 0.12, 0.24, [0, 0, 1, 0.18]);
    // Bottom motorized slider pedestal
    addCylinderPart(b, -0.45, -0.58, 0, 0.10, 0.10, 0.36, 12, "y", [0, 0, 1, 0.2], 0);
    addCylinderPart(b, 0.45, -0.58, 0, 0.10, 0.10, 0.36, 12, "y", [0, 0, 1, 0.2], 0);
    return finalizeMesh(b);
  }

  // Catalog of all 7 Original Models for Asset Studio & Game
  const STUDIO_MODEL_CATALOG = [
    {
      id: "pirate_cannon",
      number: 1,
      name: "Pirate Carnival Cannon",
      fileName: "Pirate_Carnival_Cannon.glb",
      category: "Launcher / Artillery",
      description: "Naval oak carriage with spoked wheels and elevating cast-iron & brass barrel.",
      texKey: "cannon_metal",
      hasElevation: true,
      hasTwoSkins: false,
      alpha: 1.0,
      metallic: 0.65,
      roughness: 0.35,
      buildMesh: (opts) => buildFullPirateCannonMesh(opts && opts.elevationDeg)
    },
    {
      id: "carnival_tin_can",
      number: 2,
      name: "Carnival Tin Can (2 Skins)",
      fileName: "Carnival_Tin_Can.glb",
      category: "Dynamic Target",
      description: "Ribbed carnival target tin can with switchable Classic Red Star & Cyberpunk Neon skins.",
      texKey: "tincan_skin1",
      altTexKey: "tincan_skin2",
      hasElevation: false,
      hasTwoSkins: true,
      alpha: 1.0,
      metallic: 0.55,
      roughness: 0.28,
      buildMesh: () => buildCarnivalTinCanMesh()
    },
    {
      id: "slatted_wooden_crate",
      number: 3,
      name: "Slatted Wooden Crate",
      fileName: "Slatted_Wooden_Crate.glb",
      category: "Destructible Prop",
      description: "Framed carnival pine crate with recessed slats, corner posts, and iron bolts.",
      texKey: "wooden_crate",
      hasElevation: false,
      hasTwoSkins: false,
      alpha: 1.0,
      metallic: 0.1,
      roughness: 0.78,
      buildMesh: () => buildSlattedWoodenCrateMesh()
    },
    {
      id: "banded_oak_barrel",
      number: 4,
      name: "Banded Oak Barrel",
      fileName: "Banded_Oak_Barrel.glb",
      category: "Heavy Physics Prop",
      description: "Curved oak stave barrel reinforced with four riveted forged-iron hoops.",
      texKey: "oak_barrel",
      hasElevation: false,
      hasTwoSkins: false,
      alpha: 1.0,
      metallic: 0.25,
      roughness: 0.65,
      buildMesh: () => buildBandedOakBarrelMesh()
    },
    {
      id: "winter_ice_block",
      number: 5,
      name: "Translucent Winter Ice Block",
      fileName: "Translucent_Winter_Ice_Block.glb",
      category: "Low-Friction Cryo Prop",
      description: "Glacial translucent ice block with internal crystalline prism and frost veins.",
      texKey: "winter_ice",
      hasElevation: false,
      hasTwoSkins: false,
      alpha: 0.78,
      metallic: 0.15,
      roughness: 0.12,
      buildMesh: () => buildWinterIceBlockMesh()
    },
    {
      id: "cyberpunk_neon_cube",
      number: 6,
      name: "Cyberpunk Neon Target Cube",
      fileName: "Cyberpunk_Neon_Target_Cube.glb",
      category: "Sci-Fi Emissive Target",
      description: "Chamfered dark-metal target cube with glowing cyan & magenta circuit channels.",
      texKey: "cyber_cube",
      hasElevation: false,
      hasTwoSkins: false,
      alpha: 1.0,
      metallic: 0.6,
      roughness: 0.22,
      buildMesh: () => buildCyberpunkNeonCubeMesh()
    },
    {
      id: "moving_blocker_sign",
      number: 7,
      name: "Moving Carnival Blocker Sign",
      fileName: "Moving_Carnival_Blocker_Sign.glb",
      category: "Kinetic Hazard Shield",
      description: "Motorized carnival hazard shield with chevron stripes that deflects cannonballs.",
      texKey: "blocker_sign",
      hasElevation: false,
      hasTwoSkins: false,
      alpha: 1.0,
      metallic: 0.5,
      roughness: 0.4,
      buildMesh: () => buildMovingBlockerSignMesh()
    }
  ];

  // =========================================================================
  // 4. REAL BINARY glTF 2.0 (.GLB) EXPORTER (GAME-READY, NO STUDIO HELPERS)
  // =========================================================================
  function dataUrlToUint8Array(dataUrl) {
    const base64 = dataUrl.split(",")[1] || "";
    const binStr = atob(base64);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    return bytes;
  }

  function padTo4Bytes(byteLen) {
    return (4 - (byteLen % 4)) % 4;
  }

  function uint8ToBase64(uint8) {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < uint8.length; i += chunkSize) {
      const sub = uint8.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, sub);
    }
    return btoa(binary);
  }

  /**
   * Builds a standards-compliant binary glTF 2.0 (.glb) Uint8Array for any of the 7 models.
   * Excludes studio grids, cameras, or wireframes.
   */
  function buildGlbBinary(modelDef, options) {
    const opts = options || {};
    const mesh = modelDef.buildMesh(opts);
    const activeTexKey =
      modelDef.hasTwoSkins && opts.skinIndex === 2 && modelDef.altTexKey
        ? modelDef.altTexKey
        : modelDef.texKey;
    const texCanvas = getProceduralTextureCanvas(activeTexKey);
    const pngBytes = dataUrlToUint8Array(texCanvas.toDataURL("image/png"));

    // Compute min/max bounding box of POSITION for glTF accessor compliance
    const minPos = [Infinity, Infinity, Infinity];
    const maxPos = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < mesh.vertexCount; i++) {
      const x = mesh.positions[i * 3];
      const y = mesh.positions[i * 3 + 1];
      const z = mesh.positions[i * 3 + 2];
      if (x < minPos[0]) minPos[0] = x;
      if (y < minPos[1]) minPos[1] = y;
      if (z < minPos[2]) minPos[2] = z;
      if (x > maxPos[0]) maxPos[0] = x;
      if (y > maxPos[1]) maxPos[1] = y;
      if (z > maxPos[2]) maxPos[2] = z;
    }

    const posBytes = new Uint8Array(mesh.positions.buffer, mesh.positions.byteOffset, mesh.positions.byteLength);
    const normBytes = new Uint8Array(mesh.normals.buffer, mesh.normals.byteOffset, mesh.normals.byteLength);
    const uvBytes = new Uint8Array(mesh.uvs.buffer, mesh.uvs.byteOffset, mesh.uvs.byteLength);
    const idxBytes = new Uint8Array(mesh.indices.buffer, mesh.indices.byteOffset, mesh.indices.byteLength);

    const posOffset = 0;
    const posLen = posBytes.byteLength;

    const normOffset = posOffset + posLen;
    const normLen = normBytes.byteLength;

    const uvOffset = normOffset + normLen;
    const uvLen = uvBytes.byteLength;

    const idxOffset = uvOffset + uvLen;
    const idxLen = idxBytes.byteLength;
    const idxPad = padTo4Bytes(idxLen);

    const imgOffset = idxOffset + idxLen + idxPad;
    const imgLen = pngBytes.byteLength;
    const imgPad = padTo4Bytes(imgLen);

    const totalBinLength = imgOffset + imgLen + imgPad;
    const binChunkData = new Uint8Array(totalBinLength);
    binChunkData.set(posBytes, posOffset);
    binChunkData.set(normBytes, normOffset);
    binChunkData.set(uvBytes, uvOffset);
    binChunkData.set(idxBytes, idxOffset);
    binChunkData.set(pngBytes, imgOffset);

    const isBlend = modelDef.alpha < 1.0;

    const gltfJson = {
      asset: {
        version: "2.0",
        generator: "Cosmic Pop 3D • Game Asset Studio GLB Exporter"
      },
      scene: 0,
      scenes: [{ name: modelDef.name, nodes: [0] }],
      nodes: [{ name: modelDef.id, mesh: 0 }],
      meshes: [
        {
          name: modelDef.id + "_mesh",
          primitives: [
            {
              attributes: {
                POSITION: 0,
                NORMAL: 1,
                TEXCOORD_0: 2
              },
              indices: 3,
              material: 0
            }
          ]
        }
      ],
      materials: [
        {
          name: modelDef.id + "_material",
          alphaMode: isBlend ? "BLEND" : "OPAQUE",
          pbrMetallicRoughness: {
            baseColorFactor: [1, 1, 1, modelDef.alpha],
            baseColorTexture: { index: 0 },
            metallicFactor: modelDef.metallic,
            roughnessFactor: modelDef.roughness
          }
        }
      ],
      textures: [{ source: 0, sampler: 0 }],
      samplers: [
        {
          magFilter: 9729,
          minFilter: 9987,
          wrapS: 10497,
          wrapT: 10497
        }
      ],
      images: [
        {
          name: activeTexKey,
          bufferView: 4,
          mimeType: "image/png"
        }
      ],
      accessors: [
        {
          bufferView: 0,
          componentType: 5126, // FLOAT
          count: mesh.vertexCount,
          type: "VEC3",
          min: minPos,
          max: maxPos
        },
        {
          bufferView: 1,
          componentType: 5126, // FLOAT
          count: mesh.vertexCount,
          type: "VEC3"
        },
        {
          bufferView: 2,
          componentType: 5126, // FLOAT
          count: mesh.vertexCount,
          type: "VEC2"
        },
        {
          bufferView: 3,
          componentType: 5123, // UNSIGNED_SHORT
          count: mesh.indexCount,
          type: "SCALAR"
        }
      ],
      bufferViews: [
        { buffer: 0, byteOffset: posOffset, byteLength: posLen, target: 34962 },
        { buffer: 0, byteOffset: normOffset, byteLength: normLen, target: 34962 },
        { buffer: 0, byteOffset: uvOffset, byteLength: uvLen, target: 34962 },
        { buffer: 0, byteOffset: idxOffset, byteLength: idxLen, target: 34963 },
        { buffer: 0, byteOffset: imgOffset, byteLength: imgLen }
      ],
      buffers: [{ byteLength: totalBinLength }]
    };

    const jsonStr = JSON.stringify(gltfJson);
    const encoder = new TextEncoder();
    const jsonBytesRaw = encoder.encode(jsonStr);
    const jsonPad = padTo4Bytes(jsonBytesRaw.byteLength);
    const jsonChunkLength = jsonBytesRaw.byteLength + jsonPad;
    const jsonChunkData = new Uint8Array(jsonChunkLength);
    jsonChunkData.set(jsonBytesRaw, 0);
    for (let i = jsonBytesRaw.byteLength; i < jsonChunkLength; i++) {
      jsonChunkData[i] = 0x20; // ASCII space padding per glTF 2.0 spec
    }

    const totalFileLength = 12 + 8 + jsonChunkLength + 8 + totalBinLength;
    const glbBuffer = new ArrayBuffer(totalFileLength);
    const dv = new DataView(glbBuffer);
    const outBytes = new Uint8Array(glbBuffer);

    // 12-byte GLB Header
    dv.setUint32(0, 0x46546c67, true); // 'glTF' magic
    dv.setUint32(4, 2, true); // version 2
    dv.setUint32(8, totalFileLength, true);

    // Chunk 0: JSON
    dv.setUint32(12, jsonChunkLength, true);
    dv.setUint32(16, 0x4e4f534a, true); // 'JSON'
    outBytes.set(jsonChunkData, 20);

    // Chunk 1: BIN
    const binHeaderPos = 20 + jsonChunkLength;
    dv.setUint32(binHeaderPos, totalBinLength, true);
    dv.setUint32(binHeaderPos + 4, 0x004e4942, true); // 'BIN\0'
    outBytes.set(binChunkData, binHeaderPos + 8);

    return outBytes;
  }

  function downloadGlbModel(modelId, options) {
    const modelDef = STUDIO_MODEL_CATALOG.find((m) => m.id === modelId);
    if (!modelDef) return null;

    const opts = options || {};
    const glbBytes = buildGlbBinary(modelDef, opts);
    let fileName = modelDef.fileName;
    if (modelDef.hasTwoSkins && opts.skinIndex === 2) {
      fileName = "Carnival_Tin_Can_CyberNeon_Skin2.glb";
    }

    // 1. Save via native Android bridge if running inside Android APK
    let savedAndroidPath = "";
    try {
      if (window.AndroidCosmicBridge && window.AndroidCosmicBridge.saveGlbBase64) {
        const b64 = uint8ToBase64(glbBytes);
        savedAndroidPath = window.AndroidCosmicBridge.saveGlbBase64(fileName, b64) || "";
      }
    } catch (e) {}

    // 2. Also trigger standard browser Blob download for desktop / web preview
    try {
      const blob = new Blob([glbBytes], { type: "model/gltf-binary" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {}

    return {
      fileName,
      byteLength: glbBytes.byteLength,
      savedAndroidPath
    };
  }

  window.Arcade3DModels = {
    STUDIO_MODEL_CATALOG,
    getProceduralTextureCanvas,
    buildCannonCarriageMesh,
    buildCannonBarrelMesh,
    buildFullPirateCannonMesh,
    buildCarnivalTinCanMesh,
    buildSlattedWoodenCrateMesh,
    buildBandedOakBarrelMesh,
    buildWinterIceBlockMesh,
    buildCyberpunkNeonCubeMesh,
    buildMovingBlockerSignMesh,
    buildGlbBinary,
    downloadGlbModel
  };
})();
