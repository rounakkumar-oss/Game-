/**
 * PHASE 1: MAIN SLIDING GAME HUB & CAPY PAIRS (COZY JAPANESE PASTEL STORYBOOK EDITION)
 * Integrated inside the existing game project (100% Offline, Touch-Swipe & Desktop Ready)
 *
 * Includes:
 * 1. Extensible Horizontal Sliding Game Hub (`window.CosmicGameHub`)
 *    - Smooth horizontal carousel with Android touch swipe left/right & desktop navigation arrows
 *    - Displays every game's original custom SVG logo, custom illustrated thumbnail, and name
 *    - Separate Play buttons for every game & animated card transitions
 *    - Ready for adding more games gradually via `window.CosmicGameHub.registerGame(...)`
 * 2. Complete Capy Pairs Memory-Matching Game:
 *    - Cozy Japanese pastel storybook design
 *    - 14 Unique Custom Capybara SVG Characters
 *    - Level 1: 4×4 grid with 8 pairs (16 cards)
 *    - Level 2: 28 cards (4×7 grid) with all 14 unique Capybara pairs
 *    - Plus Bonus Storybook Onsen Levels
 *    - Smooth 3D card-flipping animations, matching mechanics, moves, timer, score & 3-star ratings
 *    - Web Audio API sound effects (flip, match chord, mismatch, victory fanfare)
 *    - Pause modal, Restart, Local High-Score Leaderboard modal, and Victory screen
 */

(function () {
  "use strict";

  const CAPY_SAVE_KEY = "cosmic_capy_pairs_save_v2";

  // =========================================================================
  // 1. 14 UNIQUE CAPYBARA CHARACTERS (CUSTOM STORYBOOK SVG ILLUSTRATIONS)
  // =========================================================================
  const CAPY_CHARACTERS = [
    {
      id: "yuzu",
      name: "Yuzu Onsen",
      bg: "#FFF5D6",
      accent: "#F59E0B",
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="54" r="38" fill="#FFE89E"/>
        <ellipse cx="50" cy="82" rx="34" ry="12" fill="#67E8F9" opacity="0.65"/>
        <ellipse cx="27" cy="36" rx="7" ry="9" transform="rotate(-22 27 36)" fill="#8B5A2B"/>
        <ellipse cx="73" cy="36" rx="7" ry="9" transform="rotate(22 73 36)" fill="#8B5A2B"/>
        <rect x="24" y="34" width="52" height="44" rx="24" fill="#B87A44"/>
        <ellipse cx="50" cy="54" rx="18" ry="13" fill="#9A6232"/>
        <path d="M31 47 Q35 43 39 47" stroke="#3E220D" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M61 47 Q65 43 69 47" stroke="#3E220D" stroke-width="3" fill="none" stroke-linecap="round"/>
        <ellipse cx="45" cy="51" rx="2.2" ry="1.6" fill="#3E220D"/>
        <ellipse cx="55" cy="51" rx="2.2" ry="1.6" fill="#3E220D"/>
        <path d="M50 53 L50 58 M45 60 Q50 63 55 60" stroke="#3E220D" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="29" cy="54" rx="4.5" ry="2.6" fill="#FF7EB6" opacity="0.7"/>
        <ellipse cx="71" cy="54" rx="4.5" ry="2.6" fill="#FF7EB6" opacity="0.7"/>
        <circle cx="50" cy="25" r="10" fill="#FF9F1C"/>
        <path d="M50 15 Q56 10 60 15 Q55 19 50 15" fill="#10B981"/>
      </svg>`
    },
    {
      id: "boba",
      name: "Boba Capy",
      bg: "#FDE2E4",
      accent: "#EC4899",
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="52" r="38" fill="#FBCFE8"/>
        <ellipse cx="27" cy="36" rx="7" ry="9" transform="rotate(-22 27 36)" fill="#8B5A2B"/>
        <ellipse cx="73" cy="36" rx="7" ry="9" transform="rotate(22 73 36)" fill="#8B5A2B"/>
        <rect x="24" y="34" width="52" height="44" rx="24" fill="#C48752"/>
        <ellipse cx="50" cy="54" rx="17" ry="12" fill="#A36A38"/>
        <circle cx="35" cy="46" r="3.2" fill="#2D180A"/>
        <circle cx="65" cy="46" r="3.2" fill="#2D180A"/>
        <circle cx="34" cy="45" r="1" fill="#FFF"/>
        <circle cx="64" cy="45" r="1" fill="#FFF"/>
        <path d="M46 58 Q50 62 54 58" stroke="#2D180A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <rect x="56" y="54" width="20" height="26" rx="4" fill="#FCE7F3" stroke="#9D174D" stroke-width="2"/>
        <rect x="64" y="43" width="4" height="14" fill="#EC4899"/>
        <circle cx="61" cy="75" r="2.3" fill="#3E220D"/>
        <circle cx="66" cy="76" r="2.3" fill="#3E220D"/>
        <circle cx="71" cy="75" r="2.3" fill="#3E220D"/>
      </svg>`
    },
    {
      id: "berry",
      name: "Berry Beret",
      bg: "#FFE4E6",
      accent: "#F43F5E",
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="52" r="38" fill="#FECDD3"/>
        <ellipse cx="27" cy="38" rx="7" ry="9" transform="rotate(-22 27 38)" fill="#8B5A2B"/>
        <ellipse cx="73" cy="38" rx="7" ry="9" transform="rotate(22 73 38)" fill="#8B5A2B"/>
        <rect x="24" y="36" width="52" height="42" rx="23" fill="#B87A44"/>
        <ellipse cx="50" cy="56" rx="17" ry="12" fill="#9A6232"/>
        <circle cx="35" cy="48" r="3.2" fill="#2D180A"/>
        <circle cx="65" cy="48" r="3.2" fill="#2D180A"/>
        <path d="M25 36 Q50 12 75 36 Z" fill="#F43F5E"/>
        <circle cx="42" cy="28" r="1.5" fill="#FEF08A"/>
        <circle cx="50" cy="24" r="1.5" fill="#FEF08A"/>
        <circle cx="58" cy="28" r="1.5" fill="#FEF08A"/>
        <path d="M44 19 L50 13 L56 19" stroke="#10B981" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: "sleepy",
      name: "Sleepy Cloud",
      bg: "#E0E7FF",
      accent: "#6366F1",
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="52" r="38" fill="#C7D2FE"/>
        <path d="M32 34 Q52 10 74 28 L66 36 Z" fill="#6366F1"/>
        <circle cx="75" cy="28" r="5" fill="#FFFFFF"/>
        <rect x="24" y="35" width="52" height="42" rx="23" fill="#B87A44"/>
        <ellipse cx="50" cy="55" rx="17" ry="12" fill="#9A6232"/>
        <path d="M31 48 Q35 52 39 48" stroke="#2D180A" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M61 48 Q65 52 69 48" stroke="#2D180A" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="65" cy="55" r="8" fill="#93C5FD" opacity="0.85" stroke="#FFFFFF" stroke-width="1.5"/>
        <text x="68" y="24" font-size="11" font-weight="900" fill="#4338CA">Zzz</text>
      </svg>`
    },
    {
      id: "melon",
      name: "Melon Munch",
      bg: "#DCFCE7",
      accent: "#10B981",
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="52" r="38" fill="#BBF7D0"/>
        <ellipse cx="27" cy="36" rx="7" ry="9" transform="rotate(-22 27 36)" fill="#8B5A2B"/>
        <ellipse cx="73" cy="36" rx="7" ry="9" transform="rotate(22 73 36)" fill="#8B5A2B"/>
        <rect x="24" y="34" width="52" height="42" rx="23" fill="#C48752"/>
        <ellipse cx="50" cy="53" rx="17" ry="11" fill="#A36A38"/>
        <circle cx="35" cy="45" r="3" fill="#2D180A"/>
        <circle cx="65" cy="45" r="3" fill="#2D180A"/>
        <path d="M26 60 A24 22 0 0 0 74 60 Z" fill="#F43F5E" stroke="#10B981" stroke-width="4"/>
        <circle cx="43" cy="66" r="1.6" fill="#1F2937"/>
        <circle cx="50" cy="69" r="1.6" fill="#1F2937"/>
        <circle cx="57" cy="66" r="1.6" fill="#1F2937"/>
      </svg>`
    },
    {
      id: "frog",
      name: "Froggy Leaf",
      bg: "#D1FAE5",
      accent: "#059669",
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="52" r="38" fill="#A7F3D0"/>
        <rect x="24" y="36" width="52" height="42" rx="23" fill="#B87A44"/>
        <ellipse cx="50" cy="56" rx="17" ry="12" fill="#9A6232"/>
        <ellipse cx="50" cy="32" rx="22" ry="10" fill="#10B981"/>
        <circle cx="38" cy="24" r="6" fill="#10B981"/>
        <circle cx="62" cy="24" r="6" fill="#10B981"/>
        <circle cx="38" cy="24" r="2.5" fill="#111827"/>
        <circle cx="62" cy="24" r="2.5" fill="#111827"/>
        <circle cx="35" cy="48" r="3" fill="#2D180A"/>
        <circle cx="65" cy="48" r="3" fill="#2D180A"/>
        <path d="M45 58 Q50 62 55 58" stroke="#2D180A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: "sakura",
      name: "Sakura Capy",
      bg: "#FCE7F3",
      accent: "#DB2777",
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="52" r="38" fill="#FBCFE8"/>
        <ellipse cx="27" cy="36" rx="7" ry="9" transform="rotate(-22 27 36)" fill="#8B5A2B"/>
        <ellipse cx="73" cy="36" rx="7" ry="9" transform="rotate(22 73 36)" fill="#8B5A2B"/>
        <rect x="24" y="34" width="52" height="42" rx="23" fill="#C48752"/>
        <ellipse cx="50" cy="54" rx="17" ry="12" fill="#A36A38"/>
        <rect x="28" y="68" width="44" height="10" rx="5" fill="#EC4899"/>
        <rect x="54" y="72" width="10" height="14" rx="4" fill="#DB2777"/>
        <circle cx="62" cy="30" r="8" fill="#F472B6"/>
        <circle cx="62" cy="30" r="3" fill="#FEF08A"/>
        <circle cx="35" cy="47" r="3" fill="#2D180A"/>
        <circle cx="65" cy="47" r="3" fill="#2D180A"/>
      </svg>`
    },
    {
      id: "astro",
      name: "Astro Capy",
      bg: "#EDE9FE",
      accent: "#7C3AED",
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="52" r="38" fill="#DDD6FE"/>
        <ellipse cx="27" cy="36" rx="7" ry="9" transform="rotate(-22 27 36)" fill="#8B5A2B"/>
        <ellipse cx="73" cy="36" rx="7" ry="9" transform="rotate(22 73 36)" fill="#8B5A2B"/>
        <rect x="24" y="34" width="52" height="42" rx="23" fill="#B87A44"/>
        <ellipse cx="50" cy="54" rx="17" ry="12" fill="#9A6232"/>
        <circle cx="35" cy="47" r="3" fill="#2D180A"/>
        <circle cx="65" cy="47" r="3" fill="#2D180A"/>
        <circle cx="50" cy="52" r="32" fill="rgba(196, 181, 253, 0.22)" stroke="#7C3AED" stroke-width="3.5"/>
        <path d="M28 34 Q38 24 52 26" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: "chef",
      name: "Baker Capy",
      bg: "#FEF3C7",
      accent: "#D97706",
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="52" r="38" fill="#FDE68A"/>
        <rect x="24" y="36" width="52" height="42" rx="23" fill="#C48752"/>
        <ellipse cx="50" cy="56" rx="17" ry="12" fill="#A36A38"/>
        <circle cx="42" cy="22" r="9" fill="#FFFFFF"/>
        <circle cx="58" cy="22" r="9" fill="#FFFFFF"/>
        <circle cx="50" cy="19" r="10" fill="#FFFFFF"/>
        <rect x="36" y="26" width="28" height="9" rx="3" fill="#F3F4F6"/>
        <circle cx="35" cy="48" r="3" fill="#2D180A"/>
        <circle cx="65" cy="48" r="3" fill="#2D180A"/>
      </svg>`
    },
    {
      id: "ducky",
      name: "Ducky Float",
      bg: "#E0F2FE",
      accent: "#0284C7",
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="52" r="38" fill="#BAE6FD"/>
        <ellipse cx="27" cy="34" rx="7" ry="9" transform="rotate(-22 27 34)" fill="#8B5A2B"/>
        <ellipse cx="73" cy="34" rx="7" ry="9" transform="rotate(22 73 34)" fill="#8B5A2B"/>
        <rect x="24" y="32" width="52" height="42" rx="23" fill="#B87A44"/>
        <ellipse cx="50" cy="52" rx="17" ry="12" fill="#9A6232"/>
        <circle cx="35" cy="45" r="3" fill="#2D180A"/>
        <circle cx="65" cy="45" r="3" fill="#2D180A"/>
        <ellipse cx="50" cy="72" rx="30" ry="11" fill="#FACC15" stroke="#EAB308" stroke-width="2"/>
        <circle cx="74" cy="64" r="8" fill="#FACC15"/>
        <polygon points="81,63 87,65 81,67" fill="#F97316"/>
      </svg>`
    },
    {
      id: "king",
      name: "Royal Capy",
      bg: "#FEF9C3",
      accent: "#CA8A04",
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="52" r="38" fill="#FEF08A"/>
        <ellipse cx="27" cy="36" rx="7" ry="9" transform="rotate(-22 27 36)" fill="#8B5A2B"/>
        <ellipse cx="73" cy="36" rx="7" ry="9" transform="rotate(22 73 36)" fill="#8B5A2B"/>
        <rect x="24" y="34" width="52" height="42" rx="23" fill="#B87A44"/>
        <ellipse cx="50" cy="55" rx="17" ry="12" fill="#9A6232"/>
        <polygon points="34,34 38,18 46,27 50,15 54,27 62,18 66,34" fill="#FACC15" stroke="#CA8A04" stroke-width="2"/>
        <circle cx="50" cy="28" r="2.2" fill="#EF4444"/>
        <circle cx="35" cy="47" r="3" fill="#2D180A"/>
        <circle cx="65" cy="47" r="3" fill="#2D180A"/>
      </svg>`
    },
    {
      id: "matcha",
      name: "Matcha Mochi",
      bg: "#ECFCCB",
      accent: "#65A30D",
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="52" r="38" fill="#D9F99D"/>
        <ellipse cx="27" cy="36" rx="7" ry="9" transform="rotate(-22 27 36)" fill="#8B5A2B"/>
        <ellipse cx="73" cy="36" rx="7" ry="9" transform="rotate(22 73 36)" fill="#8B5A2B"/>
        <rect x="24" y="34" width="52" height="42" rx="23" fill="#C48752"/>
        <ellipse cx="50" cy="54" rx="17" ry="12" fill="#A36A38"/>
        <line x1="34" y1="24" x2="66" y2="24" stroke="#78350F" stroke-width="3"/>
        <circle cx="41" cy="24" r="6" fill="#F9A8D4"/>
        <circle cx="50" cy="24" r="6" fill="#FFFFFF"/>
        <circle cx="59" cy="24" r="6" fill="#86EFAC"/>
        <circle cx="35" cy="47" r="3" fill="#2D180A"/>
        <circle cx="65" cy="47" r="3" fill="#2D180A"/>
      </svg>`
    },
    {
      id: "kitsune",
      name: "Kitsune Capy",
      bg: "#FFEDD5",
      accent: "#EA580C",
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="52" r="38" fill="#FED7AA"/>
        <ellipse cx="27" cy="36" rx="7" ry="9" transform="rotate(-22 27 36)" fill="#8B5A2B"/>
        <ellipse cx="73" cy="36" rx="7" ry="9" transform="rotate(22 73 36)" fill="#8B5A2B"/>
        <rect x="24" y="34" width="52" height="42" rx="23" fill="#B87A44"/>
        <ellipse cx="50" cy="55" rx="17" ry="12" fill="#9A6232"/>
        <!-- Festive Japanese Kitsune Mask on side of head -->
        <g transform="translate(52, 16) rotate(14)">
          <ellipse cx="14" cy="14" rx="12" ry="11" fill="#FFFFFF" stroke="#EA580C" stroke-width="2"/>
          <polygon points="4,8 8,0 12,7" fill="#EA580C"/>
          <polygon points="16,7 20,0 24,8" fill="#EA580C"/>
          <path d="M8 14 Q11 11 13 14" stroke="#EA580C" stroke-width="2" fill="none"/>
          <path d="M16 14 Q19 11 21 14" stroke="#EA580C" stroke-width="2" fill="none"/>
        </g>
        <circle cx="35" cy="47" r="3" fill="#2D180A"/>
        <circle cx="65" cy="47" r="3" fill="#2D180A"/>
        <path d="M45 59 Q50 63 55 59" stroke="#2D180A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: "bamboo",
      name: "Kimono Capy",
      bg: "#F3E8FF",
      accent: "#9333EA",
      svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="52" r="38" fill="#E9D5FF"/>
        <ellipse cx="27" cy="34" rx="7" ry="9" transform="rotate(-22 27 34)" fill="#8B5A2B"/>
        <ellipse cx="73" cy="34" rx="7" ry="9" transform="rotate(22 73 34)" fill="#8B5A2B"/>
        <rect x="24" y="32" width="52" height="42" rx="23" fill="#C48752"/>
        <ellipse cx="50" cy="51" rx="17" ry="11" fill="#A36A38"/>
        <!-- Pastel Kimono Robe & Obi -->
        <path d="M24 62 Q50 56 76 62 L78 82 L22 82 Z" fill="#C084FC" stroke="#7E22CE" stroke-width="2"/>
        <line x1="40" y1="60" x2="54" y2="82" stroke="#FEF08A" stroke-width="3"/>
        <line x1="60" y1="60" x2="46" y2="82" stroke="#FEF08A" stroke-width="3"/>
        <!-- Folding Fan -->
        <path d="M36 26 A16 16 0 0 1 64 26 L50 35 Z" fill="#F472B6" stroke="#FEF08A" stroke-width="1.8"/>
        <circle cx="35" cy="45" r="3" fill="#2D180A"/>
        <circle cx="65" cy="45" r="3" fill="#2D180A"/>
      </svg>`
    }
  ];

  // =========================================================================
  // 2. ORIGINAL LOGOS & ILLUSTRATED THUMBNAILS FOR ALL ARCADE HUB ENTRIES
  // =========================================================================
  const COSMIC_POP_LOGO_SVG = `
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <radialGradient id="cpCore" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FF70B8"/>
          <stop offset="55%" stop-color="#7C3AED"/>
          <stop offset="100%" stop-color="#1E1038"/>
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="#1E1038" stroke="#A78BFA" stroke-width="2"/>
      <ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(-28 32 32)" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.85"/>
      <ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(32 32 32)" fill="none" stroke="#38BDF8" stroke-width="2" opacity="0.85"/>
      <circle cx="32" cy="32" r="14" fill="url(#cpCore)"/>
      <circle cx="27" cy="27" r="4" fill="#FFFFFF" opacity="0.75"/>
    </svg>
  `;

  const COSMIC_POP_THUMB_SVG = `
    <svg viewBox="0 0 320 176" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="cpBg" cx="50%" cy="42%" r="70%">
          <stop offset="0%" stop-color="#6D4AA8"/>
          <stop offset="65%" stop-color="#3B2268"/>
          <stop offset="100%" stop-color="#180B30"/>
        </radialGradient>
      </defs>
      <rect width="320" height="176" fill="url(#cpBg)"/>
      <circle cx="45" cy="34" r="2" fill="#FFF" opacity="0.7"/>
      <circle cx="275" cy="42" r="2.5" fill="#FFE66D" opacity="0.8"/>
      <circle cx="70" cy="128" r="1.8" fill="#38BDF8" opacity="0.7"/>
      <circle cx="250" cy="120" r="2" fill="#FF70B8" opacity="0.8"/>
      <ellipse cx="160" cy="136" rx="76" ry="15" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.65)" stroke-width="2"/>
      <circle cx="160" cy="46" r="15" fill="#FF85C0"/>
      <circle cx="144" cy="66" r="15" fill="#5E2BFF"/>
      <circle cx="176" cy="66" r="15" fill="#B892FF"/>
      <circle cx="128" cy="88" r="15" fill="#B892FF"/>
      <circle cx="160" cy="88" r="16" fill="#FF4D9D"/>
      <circle cx="192" cy="88" r="15" fill="#5E2BFF"/>
      <circle cx="155" cy="41" r="4" fill="#FFF" opacity="0.7"/>
      <circle cx="139" cy="61" r="4" fill="#FFF" opacity="0.7"/>
      <circle cx="171" cy="61" r="4" fill="#FFF" opacity="0.7"/>
      <circle cx="155" cy="82" r="4.5" fill="#FFF" opacity="0.8"/>
      <line x1="160" y1="158" x2="160" y2="104" stroke="#FFFFFF" stroke-width="2.5" stroke-dasharray="4 4"/>
      <circle cx="160" cy="158" r="9" fill="#FF4D9D" stroke="#FFF" stroke-width="2"/>
    </svg>
  `;

  const CAPY_PAIRS_LOGO_SVG = `
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <circle cx="32" cy="32" r="30" fill="#FFFBEB" stroke="#F59E0B" stroke-width="2.5"/>
      <ellipse cx="18" cy="22" rx="4.5" ry="6" transform="rotate(-20 18 22)" fill="#8B5A2B"/>
      <ellipse cx="46" cy="22" rx="4.5" ry="6" transform="rotate(20 46 22)" fill="#8B5A2B"/>
      <rect x="15" y="21" width="34" height="29" rx="15" fill="#B87A44"/>
      <ellipse cx="32" cy="35" rx="11" ry="8" fill="#9A6232"/>
      <circle cx="23" cy="29" r="2.2" fill="#2D180A"/>
      <circle cx="41" cy="29" r="2.2" fill="#2D180A"/>
      <circle cx="32" cy="15" r="6.5" fill="#FF9F1C"/>
      <path d="M32 9 Q36 5 39 9" stroke="#10B981" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </svg>
  `;

  const CAPY_PAIRS_THUMB_SVG = `
    <svg viewBox="0 0 320 176" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="cpMeadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFDF5"/>
          <stop offset="50%" stop-color="#FDE68A"/>
          <stop offset="100%" stop-color="#FBCFE8"/>
        </linearGradient>
      </defs>
      <rect width="320" height="176" fill="url(#cpMeadow)"/>
      <ellipse cx="85" cy="170" rx="120" ry="42" fill="#A7F3D0" opacity="0.7"/>
      <ellipse cx="245" cy="175" rx="130" ry="48" fill="#86EFAC" opacity="0.65"/>
      <g transform="translate(64, 22) rotate(-6)">
        <rect x="0" y="0" width="84" height="108" rx="16" fill="#FFFFFF" stroke="#F59E0B" stroke-width="3"/>
        <rect x="8" y="8" width="68" height="68" rx="12" fill="#FFF3C4"/>
        <rect x="22" y="30" width="40" height="32" rx="16" fill="#B87A44"/>
        <ellipse cx="42" cy="46" rx="12" ry="8" fill="#9A6232"/>
        <circle cx="42" cy="22" r="7" fill="#FF9F1C"/>
        <text x="42" y="95" text-anchor="middle" font-size="10" font-weight="900" fill="#B45309">YUZU ONSEN</text>
      </g>
      <g transform="translate(170, 18) rotate(6)">
        <rect x="0" y="0" width="84" height="108" rx="16" fill="#FFFFFF" stroke="#EC4899" stroke-width="3"/>
        <rect x="8" y="8" width="68" height="68" rx="12" fill="#FCE7F3"/>
        <rect x="22" y="30" width="40" height="32" rx="16" fill="#C48752"/>
        <ellipse cx="42" cy="46" rx="12" ry="8" fill="#A36A38"/>
        <circle cx="42" cy="22" r="7" fill="#F43F5E"/>
        <text x="42" y="95" text-anchor="middle" font-size="10" font-weight="900" fill="#9D174D">SAKURA CAPY</text>
      </g>
      <circle cx="160" cy="76" r="18" fill="#FF4D9D" stroke="#FFFFFF" stroke-width="3"/>
      <text x="160" y="82" text-anchor="middle" font-size="15" font-weight="900" fill="#FFFFFF">14x</text>
    </svg>
  `;

  // =========================================================================
  // 3. CAPY PAIRS WEB AUDIO & HAPTICS ENGINE
  // =========================================================================
  class CapyAudio {
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

    playFlip() {
      this.vibrate(10);
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.065);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    }

    playMatch(combo) {
      this.vibrate(22);
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const shift = Math.min(5, combo - 1) * 42;
      const now = this.ctx.currentTime;
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f + shift, now + i * 0.045);
        gain.gain.setValueAtTime(0.15, now + i * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.045);
        osc.stop(now + i * 0.045 + 0.24);
      });
    }

    playMismatch() {
      this.vibrate(14);
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(245, now);
      osc.frequency.linearRampToValueAtTime(175, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    }

    playVictory() {
      this.vibrate(40);
      this.init();
      if (!this.ctx) return;
      const melody = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      const now = this.ctx.currentTime;
      melody.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.075);
        gain.gain.setValueAtTime(0.18, now + idx * 0.075);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.075 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.075);
        osc.stop(now + idx * 0.075 + 0.36);
      });
    }
  }

  const capySfx = new CapyAudio();
  window.CapyAudioShared = capySfx;

  // =========================================================================
  // 4. CAPY PAIRS LEVEL SPECIFICATIONS
  //    Level 1: 4×4 grid with 8 pairs (16 cards)
  //    Level 2: 28 cards (4×7 grid) with all 14 unique Capybara pairs!
  //    Level 3+: Master Storybook Onsen Challenges
  // =========================================================================
  const CAPY_STAGES = [
    {
      stage: 1,
      title: "Level 1 • Cozy 4×4 (8 Pairs)",
      cols: 4,
      rows: 4,
      pairs: 8,
      timeSec: 75,
      threeStarMoves: 14,
      twoStarMoves: 20
    },
    {
      stage: 2,
      title: "Level 2 • Grand 28 Cards (14 Pairs)",
      cols: 4,
      rows: 7,
      pairs: 14,
      timeSec: 135,
      threeStarMoves: 26,
      twoStarMoves: 36
    },
    {
      stage: 3,
      title: "Level 3 • Sakura Speed 4×4",
      cols: 4,
      rows: 4,
      pairs: 8,
      timeSec: 55,
      threeStarMoves: 13,
      twoStarMoves: 18
    },
    {
      stage: 4,
      title: "Level 4 • Master 28 Cards (14 Pairs)",
      cols: 4,
      rows: 7,
      pairs: 14,
      timeSec: 110,
      threeStarMoves: 24,
      twoStarMoves: 32
    }
  ];

  function getCapyStageConfig(stageNum) {
    const preset = CAPY_STAGES.find((s) => s.stage === stageNum);
    if (preset) return preset;
    const isGrand = stageNum % 2 === 0;
    return {
      stage: stageNum,
      title: isGrand ? `Level ${stageNum} • 28 Cards (14 Pairs)` : `Level ${stageNum} • 4×4 (8 Pairs)`,
      cols: 4,
      rows: isGrand ? 7 : 4,
      pairs: isGrand ? 14 : 8,
      timeSec: isGrand ? 115 : 60,
      threeStarMoves: isGrand ? 25 : 14,
      twoStarMoves: isGrand ? 34 : 19
    };
  }

  let capyState = {
    active: false,
    paused: false,
    stage: 1,
    highestStage: 1,
    coins: 80,
    score: 0,
    combo: 0,
    bestCombo: 0,
    moves: 0,
    timeLeft: 75,
    totalPairs: 8,
    matchedPairs: 0,
    cards: [],
    flippedIndices: [],
    lockBoard: false,
    timerId: null,
    stageStars: {},
    leaderboard: [] // [{ stage, score, moves, stars, date }]
  };

  function loadCapySave() {
    try {
      const raw = localStorage.getItem(CAPY_SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.stage === "number") capyState.stage = Math.max(1, data.stage);
      if (typeof data.highestStage === "number") capyState.highestStage = Math.max(1, data.highestStage);
      if (typeof data.coins === "number") capyState.coins = Math.max(0, data.coins);
      if (typeof data.bestCombo === "number") capyState.bestCombo = data.bestCombo;
      if (data.stageStars && typeof data.stageStars === "object") capyState.stageStars = data.stageStars;
      if (Array.isArray(data.leaderboard)) capyState.leaderboard = data.leaderboard;
    } catch (e) {}
  }

  function saveCapyState() {
    try {
      const payload = {
        stage: capyState.stage,
        highestStage: capyState.highestStage,
        coins: capyState.coins,
        bestCombo: capyState.bestCombo,
        stageStars: capyState.stageStars,
        leaderboard: capyState.leaderboard.slice(0, 15)
      };
      localStorage.setItem(CAPY_SAVE_KEY, JSON.stringify(payload));
    } catch (e) {}
  }

  function computeStarRating(cfg, moves, timeLeft) {
    if (timeLeft <= 0) return 0;
    if (moves <= cfg.threeStarMoves) return 3;
    if (moves <= cfg.twoStarMoves) return 2;
    return 1;
  }

  function formatStarsText(stars) {
    const s = Math.max(0, Math.min(3, stars));
    return "★".repeat(s) + "☆".repeat(3 - s);
  }

  function startCapyStage(stageNum) {
    loadCapySave();
    if (typeof stageNum === "number" && stageNum >= 1) {
      capyState.stage = stageNum;
    }
    const cfg = getCapyStageConfig(capyState.stage);
    const numPairs = cfg.pairs;

    capyState.paused = false;
    capyState.totalPairs = numPairs;
    capyState.matchedPairs = 0;
    capyState.score = 0;
    capyState.combo = 0;
    capyState.moves = 0;
    capyState.timeLeft = cfg.timeSec;
    capyState.flippedIndices = [];
    capyState.lockBoard = true;

    // Select `numPairs` unique Capybara characters (up to all 14 unique Capybaras!)
    const selectedChars = CAPY_CHARACTERS.slice(0, numPairs);
    const pool = [];
    selectedChars.forEach((charObj, i) => {
      const pairKey = charObj.id + "_" + i;
      pool.push({ ...charObj, pairKey });
      pool.push({ ...charObj, pairKey });
    });

    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }

    capyState.cards = pool.map((c, idx) => ({
      index: idx,
      charId: c.id,
      pairKey: c.pairKey,
      name: c.name,
      bg: c.bg,
      accent: c.accent,
      svg: c.svg,
      isFlipped: true, // Brief storybook peek at start
      isMatched: false
    }));

    renderCapyBoard(cfg);
    updateCapyLevelTabs();
    updateCapyHud(cfg);
    hideCapyResultModal();
    hideCapyPauseModal();
    hideCapyLeaderboardModal();

    setTimeout(() => {
      if (!capyState.active) return;
      capyState.cards.forEach((c) => {
        if (!c.isMatched) c.isFlipped = false;
      });
      capyState.lockBoard = false;
      syncCapyCardDom();
    }, 1200);

    if (capyState.timerId) clearInterval(capyState.timerId);
    capyState.timerId = setInterval(() => {
      if (!capyState.active || capyState.paused || capyState.lockBoard) return;
      if (capyState.timeLeft > 0) {
        capyState.timeLeft--;
        updateCapyTimerUI();
        if (capyState.timeLeft <= 0 && capyState.matchedPairs < capyState.totalPairs) {
          capyState.lockBoard = true;
          showCapyResultModal(false);
        }
      }
    }, 1000);
  }

  function updateCapyLevelTabs() {
    const tab1 = document.getElementById("btn-capy-lvl-1");
    const tab2 = document.getElementById("btn-capy-lvl-2");
    if (tab1) tab1.classList.toggle("active", capyState.stage === 1);
    if (tab2) tab2.classList.toggle("active", capyState.stage === 2);
  }

  function renderCapyBoard(cfg) {
    const gridEl = document.getElementById("capy-grid");
    if (!gridEl) return;
    gridEl.style.gridTemplateColumns = `repeat(${cfg.cols}, 1fr)`;
    gridEl.classList.toggle("dense-28", cfg.pairs >= 14);
    gridEl.innerHTML = "";

    capyState.cards.forEach((card, idx) => {
      const btn = document.createElement("button");
      btn.className = "capy-card flipped";
      btn.setAttribute("data-idx", String(idx));
      btn.setAttribute("aria-label", card.name);
      btn.innerHTML = `
        <div class="capy-card-inner">
          <div class="capy-card-back">
            <span class="capy-paw">🍊</span>
            <span class="capy-back-lbl">CAPY</span>
          </div>
          <div class="capy-card-front" style="background:${card.bg}; border-color:${card.accent}">
            <div class="capy-art">${card.svg}</div>
            <span class="capy-name">${card.name}</span>
          </div>
        </div>
      `;
      btn.addEventListener("click", () => onCapyCardTap(idx));
      gridEl.appendChild(btn);
    });
  }

  function syncCapyCardDom() {
    const gridEl = document.getElementById("capy-grid");
    if (!gridEl) return;
    const nodes = gridEl.children;
    for (let i = 0; i < nodes.length; i++) {
      const card = capyState.cards[i];
      if (!card) continue;
      const el = nodes[i];
      el.classList.toggle("flipped", card.isFlipped || card.isMatched);
      el.classList.toggle("matched", card.isMatched);
    }
  }

  function onCapyCardTap(idx) {
    if (!capyState.active || capyState.paused || capyState.lockBoard) return;
    const card = capyState.cards[idx];
    if (!card || card.isFlipped || card.isMatched) return;

    card.isFlipped = true;
    capyState.flippedIndices.push(idx);
    capySfx.playFlip();
    syncCapyCardDom();

    if (capyState.flippedIndices.length === 2) {
      capyState.moves++;
      capyState.lockBoard = true;
      const [i1, i2] = capyState.flippedIndices;
      const c1 = capyState.cards[i1];
      const c2 = capyState.cards[i2];
      const cfg = getCapyStageConfig(capyState.stage);

      if (c1.pairKey === c2.pairKey) {
        c1.isMatched = true;
        c2.isMatched = true;
        capyState.matchedPairs++;
        capyState.combo++;
        if (capyState.combo > capyState.bestCombo) {
          capyState.bestCombo = capyState.combo;
        }
        const matchPts = 120 * capyState.combo;
        capyState.score += matchPts;
        capyState.coins += 5 * capyState.combo;
        capyState.flippedIndices = [];
        capyState.lockBoard = false;

        capySfx.playMatch(capyState.combo);
        showCapyComboBanner(capyState.combo, matchPts);
        syncCapyCardDom();
        updateCapyHud(cfg);
        saveCapyState();

        if (capyState.matchedPairs >= capyState.totalPairs) {
          capyState.lockBoard = true;
          const timeBonus = capyState.timeLeft * 15;
          capyState.score += timeBonus;
          const earnedStars = computeStarRating(cfg, capyState.moves, capyState.timeLeft);
          const prevStars = capyState.stageStars[capyState.stage] || 0;
          capyState.stageStars[capyState.stage] = Math.max(prevStars, earnedStars);

          if (capyState.stage + 1 > capyState.highestStage) {
            capyState.highestStage = capyState.stage + 1;
          }

          // Record high score in local leaderboard
          capyState.leaderboard.push({
            stage: capyState.stage,
            levelTitle: cfg.stage === 1 ? "Level 1 (4×4)" : cfg.stage === 2 ? "Level 2 (28 Cards)" : `Level ${cfg.stage}`,
            score: capyState.score,
            moves: capyState.moves,
            stars: earnedStars,
            timeLeft: capyState.timeLeft
          });
          capyState.leaderboard.sort((a, b) => b.score - a.score);
          capyState.leaderboard = capyState.leaderboard.slice(0, 12);

          saveCapyState();
          capySfx.playVictory();
          setTimeout(() => showCapyResultModal(true, earnedStars), 480);
        }
      } else {
        capyState.combo = 0;
        capySfx.playMismatch();
        updateCapyHud(cfg);
        setTimeout(() => {
          c1.isFlipped = false;
          c2.isFlipped = false;
          capyState.flippedIndices = [];
          capyState.lockBoard = false;
          syncCapyCardDom();
        }, 620);
      }
    }
  }

  let capyBannerTimer = null;
  function showCapyComboBanner(combo, pts) {
    const el = document.getElementById("capy-combo-toast");
    if (!el) return;
    const titles = ["STORYBOOK MATCH!", "PASTEL DOUBLE x2!", "YUZU FEVER x3!", "SAKURA COMBO x4!", "CAPY MASTER!"];
    const label = titles[Math.min(titles.length - 1, Math.max(0, combo - 1))];
    el.textContent = `${label} +${pts || 120 * combo}`;
    el.classList.add("show");
    if (capyBannerTimer) clearTimeout(capyBannerTimer);
    capyBannerTimer = setTimeout(() => el.classList.remove("show"), 1050);
  }

  function updateCapyHud(cfg) {
    const stagePill = document.getElementById("capy-stage-pill");
    if (stagePill) stagePill.textContent = cfg.title;

    const pct = Math.round((capyState.matchedPairs / Math.max(1, capyState.totalPairs)) * 100);
    const fill = document.getElementById("capy-progress-fill");
    const pctText = document.getElementById("capy-progress-pct");
    if (fill) fill.style.width = `${pct}%`;
    if (pctText) pctText.textContent = `${capyState.matchedPairs}/${capyState.totalPairs} PAIRS`;

    const movesEl = document.getElementById("capy-moves-pill");
    if (movesEl) movesEl.textContent = `MOVES ${capyState.moves}`;

    const scoreEl = document.getElementById("capy-score-pill");
    if (scoreEl) scoreEl.textContent = `SCORE ${capyState.score}`;

    const starsNow = computeStarRating(cfg, capyState.moves, Math.max(1, capyState.timeLeft));
    const starsEl = document.getElementById("capy-stars-pill");
    if (starsEl) starsEl.textContent = formatStarsText(starsNow);

    const comboEl = document.getElementById("capy-combo-val");
    if (comboEl) comboEl.textContent = `${Math.max(1, capyState.combo)}x`;

    updateCapyTimerUI();
  }

  function updateCapyTimerUI() {
    const tEl = document.getElementById("capy-time-pill");
    if (!tEl) return;
    const mins = Math.floor(capyState.timeLeft / 60);
    const secs = Math.max(0, capyState.timeLeft % 60);
    tEl.textContent = `TIME ${mins}:${secs < 10 ? "0" + secs : secs}`;
  }

  // Power-ups: 1) Yuzu Hint Peek, 2) Shuffle, 3) +15s Time
  function useCapyHint() {
    if (!capyState.active || capyState.paused || capyState.lockBoard) return;
    const unmatched = capyState.cards.filter((c) => !c.isMatched && !c.isFlipped);
    if (unmatched.length < 2) return;
    const targetKey = unmatched[0].pairKey;
    const pair = unmatched.filter((c) => c.pairKey === targetKey);
    capyState.lockBoard = true;
    pair.forEach((c) => { c.isFlipped = true; });
    capySfx.playFlip();
    syncCapyCardDom();
    setTimeout(() => {
      pair.forEach((c) => { if (!c.isMatched) c.isFlipped = false; });
      capyState.lockBoard = false;
      syncCapyCardDom();
    }, 950);
  }

  function useCapyShuffle() {
    if (!capyState.active || capyState.paused || capyState.lockBoard) return;
    capyState.flippedIndices.forEach((idx) => {
      if (!capyState.cards[idx].isMatched) capyState.cards[idx].isFlipped = false;
    });
    capyState.flippedIndices = [];

    const unmatchedIndices = [];
    const unmatchedData = [];
    capyState.cards.forEach((c, i) => {
      if (!c.isMatched) {
        unmatchedIndices.push(i);
        unmatchedData.push({
          charId: c.charId,
          pairKey: c.pairKey,
          name: c.name,
          bg: c.bg,
          accent: c.accent,
          svg: c.svg
        });
      }
    });

    for (let i = unmatchedData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = unmatchedData[i];
      unmatchedData[i] = unmatchedData[j];
      unmatchedData[j] = tmp;
    }

    unmatchedIndices.forEach((cardIdx, k) => {
      Object.assign(capyState.cards[cardIdx], unmatchedData[k]);
    });

    capySfx.playFlip();
    renderCapyBoard(getCapyStageConfig(capyState.stage));
    syncCapyCardDom();
  }

  function useCapyFreezeTime() {
    if (!capyState.active || capyState.paused) return;
    capyState.timeLeft += 15;
    capySfx.playMatch(2);
    updateCapyTimerUI();
    showCapyComboBanner(2, 150);
  }

  function showCapyResultModal(won, starsEarned) {
    const modal = document.getElementById("capy-result-modal");
    if (!modal) return;
    const stars = won ? (starsEarned || 3) : 0;
    document.getElementById("capy-res-badge").textContent = won
      ? `ONSEN CLEARED • ${formatStarsText(stars)}`
      : "TIME'S UP • ☆☆☆";
    document.getElementById("capy-res-title").textContent = won ? "CAPY VICTORY!" : "SLEEPY CAPY!";
    document.getElementById("capy-res-sub").textContent = won
      ? `All ${capyState.totalPairs} Capybara pairs reunited in pastel harmony!`
      : "Take a warm yuzu bath and try this stage again!";
    document.getElementById("capy-res-moves").textContent = String(capyState.moves);
    document.getElementById("capy-res-combo").textContent = String(capyState.score);
    document.getElementById("capy-res-coins").textContent = formatStarsText(stars);
    document.getElementById("btn-capy-next").textContent = won ? "NEXT LEVEL ▶" : "TRY AGAIN ↻";
    modal.classList.remove("hidden");
  }

  function hideCapyResultModal() {
    const modal = document.getElementById("capy-result-modal");
    if (modal) modal.classList.add("hidden");
  }

  function showCapyPauseModal() {
    capyState.paused = true;
    const modal = document.getElementById("capy-pause-modal");
    if (modal) modal.classList.remove("hidden");
  }

  function hideCapyPauseModal() {
    capyState.paused = false;
    const modal = document.getElementById("capy-pause-modal");
    if (modal) modal.classList.add("hidden");
  }

  function showCapyLeaderboardModal() {
    loadCapySave();
    capyState.paused = true;
    const listEl = document.getElementById("capy-leaderboard-list");
    if (listEl) {
      if (!capyState.leaderboard.length) {
        listEl.innerHTML = `<div class="capy-lb-empty">Complete Level 1 (4×4) or Level 2 (28 Cards) to record your first high score!</div>`;
      } else {
        listEl.innerHTML = capyState.leaderboard
          .map(
            (row, idx) => `
            <div class="capy-lb-row">
              <span class="capy-lb-rank">#${idx + 1}</span>
              <div class="capy-lb-info">
                <div class="capy-lb-lvl">${row.levelTitle || "Level " + row.stage}</div>
                <div class="capy-lb-meta">${row.moves} Moves • ${row.timeLeft || 0}s left</div>
              </div>
              <div class="capy-lb-right">
                <div class="capy-lb-score">${row.score} PTS</div>
                <div class="capy-lb-stars">${formatStarsText(row.stars || 3)}</div>
              </div>
            </div>
          `
          )
          .join("");
      }
    }
    const modal = document.getElementById("capy-leaderboard-modal");
    if (modal) modal.classList.remove("hidden");
  }

  function hideCapyLeaderboardModal() {
    capyState.paused = false;
    const modal = document.getElementById("capy-leaderboard-modal");
    if (modal) modal.classList.add("hidden");
  }

  // =========================================================================
  // 5. EXTENSIBLE HORIZONTAL SLIDING GAME-SELECTION CAROUSEL (`CosmicGameHub`)
  // =========================================================================
  const registeredGames = [];
  let activeGameId = "cosmic-pop-3d";
  let carouselIndex = 0;

  function pauseAllSubGames() {
    if (window.CosmicPop3DController && window.CosmicPop3DController.pause) {
      window.CosmicPop3DController.pause();
    }
    capyState.active = false;
    if (capyState.timerId) clearInterval(capyState.timerId);
    if (window.CannonKnockdownController && window.CannonKnockdownController.stop) {
      window.CannonKnockdownController.stop();
    }
    if (window.AssetStudioController && window.AssetStudioController.stop) {
      window.AssetStudioController.stop();
    }
  }

  const CosmicGameHub = {
    registerGame(gameDef) {
      if (!gameDef || !gameDef.id) return;
      const existingIdx = registeredGames.findIndex((g) => g.id === gameDef.id);
      if (existingIdx >= 0) {
        registeredGames[existingIdx] = gameDef;
      } else {
        registeredGames.push(gameDef);
      }
      renderGameCarouselCards();
    },

    getGames() {
      return registeredGames.slice();
    },

    getActiveGameId() {
      return activeGameId;
    },

    openHub() {
      capySfx.playFlip();
      if (window.CosmicPop3DController && window.CosmicPop3DController.pause) {
        window.CosmicPop3DController.pause();
      }
      if (activeGameId === "capy-pairs") {
        capyState.paused = true;
      }
      if (window.CannonKnockdownController && window.CannonKnockdownController.pause) {
        window.CannonKnockdownController.pause();
      }
      const idx = registeredGames.findIndex((g) => g.id === activeGameId);
      if (idx >= 0) carouselIndex = idx;
      renderGameCarouselCards();
      updateCarouselTransform();
      const hubEl = document.getElementById("game-hub-overlay");
      if (hubEl) hubEl.classList.remove("hidden");
    },

    closeHub() {
      const hubEl = document.getElementById("game-hub-overlay");
      if (hubEl) hubEl.classList.add("hidden");
      if (activeGameId === "cosmic-pop-3d") {
        if (window.CosmicPop3DController && window.CosmicPop3DController.resume) {
          window.CosmicPop3DController.resume();
        }
      } else if (activeGameId === "capy-pairs") {
        capyState.paused = false;
      } else if (activeGameId === "cannon-knockdown-3d") {
        if (window.CannonKnockdownController && window.CannonKnockdownController.resume) {
          window.CannonKnockdownController.resume();
        }
      }
    },

    launchGame(gameId) {
      const target = registeredGames.find((g) => g.id === gameId);
      if (!target) return;
      capySfx.playMatch(2);
      pauseAllSubGames();
      activeGameId = gameId;

      const hubEl = document.getElementById("game-hub-overlay");
      if (hubEl) hubEl.classList.add("hidden");

      const capyView = document.getElementById("capy-pairs-view");
      const cannonView = document.getElementById("cannon-knockdown-view");
      const studioView = document.getElementById("asset-studio-view");

      if (capyView) capyView.classList.toggle("hidden", gameId !== "capy-pairs");
      if (cannonView) cannonView.classList.toggle("hidden", gameId !== "cannon-knockdown-3d");
      if (studioView) studioView.classList.toggle("hidden", gameId !== "asset-studio-3d");

      if (gameId === "capy-pairs") {
        capyState.active = true;
        startCapyStage(capyState.stage);
      } else if (gameId === "cannon-knockdown-3d") {
        if (window.CannonKnockdownController && window.CannonKnockdownController.start) {
          window.CannonKnockdownController.start();
        }
      } else if (gameId === "asset-studio-3d") {
        if (window.AssetStudioController && window.AssetStudioController.start) {
          window.AssetStudioController.start();
        }
      } else {
        if (window.CosmicPop3DController && window.CosmicPop3DController.resume) {
          window.CosmicPop3DController.resume();
        }
      }

      if (typeof target.onLaunch === "function") {
        target.onLaunch();
      }
    }
  };

  window.CosmicGameHub = CosmicGameHub;

  function renderGameCarouselCards() {
    const track = document.getElementById("hub-carousel-track");
    const dotsWrap = document.getElementById("hub-carousel-dots");
    if (!track || !dotsWrap) return;

    loadCapySave();
    track.innerHTML = "";
    dotsWrap.innerHTML = "";

    registeredGames.forEach((game, idx) => {
      const card = document.createElement("div");
      card.className = "hub-game-card" + (idx === carouselIndex ? " active-slide" : "");
      const statusText = typeof game.getStatsText === "function" ? game.getStatsText() : game.subtitle;

      card.innerHTML = `
        <div class="hub-card-thumb">
          ${game.thumbnailHtml}
          <span class="hub-card-badge" style="background:${game.accentColor}">${game.badge || "PLAYABLE"}</span>
        </div>
        <div class="hub-card-body">
          <div class="hub-card-header">
            <div class="hub-card-logo">${game.logoHtml}</div>
            <div class="hub-card-titles">
              <h3 class="hub-card-name">${game.name}</h3>
              <p class="hub-card-sub">${statusText}</p>
            </div>
          </div>
          <p class="hub-card-desc">${game.description}</p>
          <button class="hub-play-btn" data-game-id="${game.id}" style="background:${game.buttonGradient}">
            ▶ PLAY ${game.name.toUpperCase()}
          </button>
        </div>
      `;

      card.addEventListener("click", (e) => {
        if (e.target.closest(".hub-play-btn")) return;
        if (carouselIndex !== idx) {
          carouselIndex = idx;
          updateCarouselTransform();
        }
      });

      const playBtn = card.querySelector(".hub-play-btn");
      playBtn.addEventListener("click", () => {
        CosmicGameHub.launchGame(game.id);
      });

      track.appendChild(card);

      const dot = document.createElement("button");
      dot.className = "hub-dot" + (idx === carouselIndex ? " active" : "");
      dot.setAttribute("aria-label", `Slide ${idx + 1}: ${game.name}`);
      dot.addEventListener("click", () => {
        capySfx.playFlip();
        carouselIndex = idx;
        updateCarouselTransform();
      });
      dotsWrap.appendChild(dot);
    });
  }

  function updateCarouselTransform() {
    const track = document.getElementById("hub-carousel-track");
    if (!track) return;
    const cards = track.querySelectorAll(".hub-game-card");
    const dots = document.querySelectorAll(".hub-dot");

    cards.forEach((c, idx) => {
      c.classList.toggle("active-slide", idx === carouselIndex);
    });
    dots.forEach((d, idx) => {
      d.classList.toggle("active", idx === carouselIndex);
    });

    const countEl = document.getElementById("hub-slide-counter");
    if (countEl && registeredGames.length > 0) {
      countEl.textContent = `${carouselIndex + 1} / ${registeredGames.length}`;
    }

    const offsetPct = -carouselIndex * 100;
    track.style.transform = `translate3d(${offsetPct}%, 0, 0)`;
  }

  function initHubCarouselSwipe() {
    const viewport = document.getElementById("hub-carousel-viewport");
    if (!viewport) return;

    let startX = 0;
    let startY = 0;
    let isDragging = false;

    viewport.addEventListener("pointerdown", (e) => {
      startX = e.clientX;
      startY = e.clientY;
      isDragging = true;
    });

    viewport.addEventListener("pointerup", (e) => {
      if (!isDragging) return;
      isDragging = false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 32 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0 && carouselIndex < registeredGames.length - 1) {
          carouselIndex++;
          capySfx.playFlip();
          updateCarouselTransform();
        } else if (dx > 0 && carouselIndex > 0) {
          carouselIndex--;
          capySfx.playFlip();
          updateCarouselTransform();
        }
      }
    });

    const prevBtn = document.getElementById("hub-prev-btn");
    const nextBtn = document.getElementById("hub-next-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (carouselIndex > 0) {
          carouselIndex--;
          capySfx.playFlip();
          updateCarouselTransform();
        } else if (registeredGames.length > 1) {
          carouselIndex = registeredGames.length - 1;
          capySfx.playFlip();
          updateCarouselTransform();
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (carouselIndex < registeredGames.length - 1) {
          carouselIndex++;
          capySfx.playFlip();
          updateCarouselTransform();
        } else if (registeredGames.length > 1) {
          carouselIndex = 0;
          capySfx.playFlip();
          updateCarouselTransform();
        }
      });
    }
  }

  function registerCoreGames() {
    CosmicGameHub.registerGame({
      id: "cosmic-pop-3d",
      name: "Cosmic Pop 3D",
      subtitle: "3D Spatial Sphere-Cluster Shooter",
      badge: "3D ORIGINAL",
      accentColor: "#7C3AED",
      buttonGradient: "linear-gradient(135deg, #FF4D9D, #7C3AED)",
      logoHtml: COSMIC_POP_LOGO_SVG,
      thumbnailHtml: COSMIC_POP_THUMB_SVG,
      description: "Aim the dotted trajectory laser, pop contiguous 3D sphere clusters, and trigger gravity avalanches!",
      getStatsText: () => "3D Puzzle Shooter • Offline Ready"
    });

    CosmicGameHub.registerGame({
      id: "capy-pairs",
      name: "Capy Pairs",
      subtitle: "Cozy Japanese Pastel Memory Game",
      badge: "14 CAPYBARAS",
      accentColor: "#F59E0B",
      buttonGradient: "linear-gradient(135deg, #F59E0B, #EA580C)",
      logoHtml: CAPY_PAIRS_LOGO_SVG,
      thumbnailHtml: CAPY_PAIRS_THUMB_SVG,
      description: "Cozy Japanese storybook matching with 14 unique Capybara illustrations! Play Level 1 (4×4) & Level 2 (28 Cards).",
      getStatsText: () => {
        loadCapySave();
        const bestScore = capyState.leaderboard.length ? capyState.leaderboard[0].score : 0;
        return `Level ${capyState.stage} • Best ${bestScore} PTS • 🍊 ${capyState.coins}`;
      }
    });
  }

  function bindAllEvents() {
    registerCoreGames();
    initHubCarouselSwipe();

    document.querySelectorAll(".js-open-game-hub").forEach((btn) => {
      btn.addEventListener("click", () => {
        const settingsModal = document.getElementById("settings-modal");
        if (settingsModal) settingsModal.classList.add("hidden");
        CosmicGameHub.openHub();
      });
    });

    const closeHubBtn = document.getElementById("btn-close-hub");
    if (closeHubBtn) {
      closeHubBtn.addEventListener("click", () => CosmicGameHub.closeHub());
    }

    // Capy Pairs Level 1 (4x4, 8 pairs) & Level 2 (28 cards, 14 pairs) Direct Selector Tabs
    const btnLvl1 = document.getElementById("btn-capy-lvl-1");
    if (btnLvl1) {
      btnLvl1.addEventListener("click", () => {
        capySfx.playFlip();
        startCapyStage(1);
      });
    }
    const btnLvl2 = document.getElementById("btn-capy-lvl-2");
    if (btnLvl2) {
      btnLvl2.addEventListener("click", () => {
        capySfx.playFlip();
        startCapyStage(2);
      });
    }

    // Capy Pairs Top & Bottom Controls
    const btnHint = document.getElementById("btn-capy-hint");
    if (btnHint) btnHint.addEventListener("click", useCapyHint);

    const btnShuffle = document.getElementById("btn-capy-shuffle");
    if (btnShuffle) btnShuffle.addEventListener("click", useCapyShuffle);

    const btnFreeze = document.getElementById("btn-capy-freeze");
    if (btnFreeze) btnFreeze.addEventListener("click", useCapyFreezeTime);

    const btnRestart = document.getElementById("btn-capy-restart");
    if (btnRestart) {
      btnRestart.addEventListener("click", () => {
        capySfx.playFlip();
        startCapyStage(capyState.stage);
      });
    }

    const btnPause = document.getElementById("btn-capy-pause");
    if (btnPause) {
      btnPause.addEventListener("click", () => {
        capySfx.playFlip();
        showCapyPauseModal();
      });
    }

    const btnResume = document.getElementById("btn-capy-resume");
    if (btnResume) {
      btnResume.addEventListener("click", () => {
        capySfx.playFlip();
        hideCapyPauseModal();
      });
    }

    const btnPauseRestart = document.getElementById("btn-capy-pause-restart");
    if (btnPauseRestart) {
      btnPauseRestart.addEventListener("click", () => {
        capySfx.playFlip();
        hideCapyPauseModal();
        startCapyStage(capyState.stage);
      });
    }

    const btnLeaderboard = document.getElementById("btn-capy-leaderboard");
    if (btnLeaderboard) {
      btnLeaderboard.addEventListener("click", () => {
        capySfx.playFlip();
        showCapyLeaderboardModal();
      });
    }

    const btnCloseLb = document.getElementById("btn-close-capy-lb");
    if (btnCloseLb) {
      btnCloseLb.addEventListener("click", () => {
        capySfx.playFlip();
        hideCapyLeaderboardModal();
      });
    }

    const btnBackHub = document.getElementById("btn-capy-hub");
    if (btnBackHub) {
      btnBackHub.addEventListener("click", () => CosmicGameHub.openHub());
    }

    const btnNextStage = document.getElementById("btn-capy-next");
    if (btnNextStage) {
      btnNextStage.addEventListener("click", () => {
        const won = capyState.matchedPairs >= capyState.totalPairs;
        if (won) {
          capyState.stage = capyState.stage === 1 ? 2 : capyState.stage + 1;
          saveCapyState();
        }
        startCapyStage(capyState.stage);
      });
    }

    const btnModalHub = document.getElementById("btn-capy-modal-hub");
    if (btnModalHub) {
      btnModalHub.addEventListener("click", () => {
        hideCapyResultModal();
        CosmicGameHub.openHub();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindAllEvents);
  } else {
    bindAllEvents();
  }
})();
