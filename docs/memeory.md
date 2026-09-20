# Project Memory, Context & Technical Decisions
## Kyorix TKD Fixtures — Knowledge Base & Critical Engineering Memory

---

## 1. Project Purpose & Ecosystem Role
**Kyorix TKD Fixtures** is the tournament bracket drawing, seeding, court scheduling, and tie-sheet printing subsystem of the Kyorix Sport Technology suite. 

### The Kyorix Martial Arts Ecosystem:
1. **`taekwondo-fixtures`** (This Project): Generates single-elimination tournament brackets, handles academy separation, manages court assignments, tracks Best-of-3 bout results, and prints A4 tie sheets.
2. **`taekwondo-scorer`**: Ringside referee and jury scoring console with Bluetooth/PSS sensor inputs.
3. **`EvtMgr`**: Central Event Manager desktop/server portal that embeds `draws-app` (built from `taekwondo-fixtures`) inside a sandboxed `<iframe>`.
4. **`Kyorix Wbst`**: The corporate Next.js web application for athlete registration and tournament publishing.

---

## 2. Key Architectural Decisions & Rationale

### 2.1 Pure Vanilla CSS Over Tailwind CSS
- **Decision**: All styles are authored in pure modular CSS (`src/index.css`, `src/App.css`) utilizing CSS custom properties (variables) instead of Tailwind CSS utility classes.
- **Rationale**: 
  - Allows pixel-perfect alignment with SVG connector paths down to the single pixel.
  - Eliminates Tailwind compile-step dependencies and purging bugs during embedded iframe mounting in `EvtMgr`.
  - Enables flawless `@media print` styling without dealing with print-utility class overrides.

### 2.2 Calculated Absolute Coordinates Over CSS Flexbox / Grid for Bracket Tree
- **Decision**: Match cards are positioned using calculated absolute coordinate offsets (`match.y = (topChild.y + botChild.y) / 2`).
- **Rationale**: 
  - CSS Flexbox cannot mathematically align parent cards exactly centered between two children when byes, walkovers, or asymmetrical leaves exist.
  - SVG bezier paths (`<path d="...">`) require explicit pixel start (`x1, y1`) and end (`x2, y2`) anchor points. Dynamic mathematical calculation guarantees zero offset drift between cards and curves across all zoom levels.

### 2.3 Bit-Reversed Permutation Spreading for Academy Separation
- **Decision**: Academy members are distributed using bit-reversed slot ordering with randomized phase offsets rather than naive random shuffling.
- **Rationale**:
  - Naive random shuffling frequently produces clusters of same-club fighters in the same quarter of the bracket.
  - Bit-reversal mathematically maximizes the Hamming distance between successive club members, ensuring they land in opposing halves or quarters of the bracket tree.

### 2.4 Offline-First Architecture
- **Decision**: In-memory React state with automated browser `localStorage` serialization.
- **Rationale**: Tournament venue Wi-Fi is notoriously unreliable. The system must operate indefinitely without an internet connection, allowing export/import of complete tournament state via JSON files.

---

## 3. Critical Gotchas & Engineering Traps

### 3.1 PowerShell Command-Line Quoting Glitch on Windows
- **Symptom**: Writing files or executing inline Python scripts via PowerShell strips unescaped double quotes (`"`) and turns backticks into escape sequences, producing syntax errors or converting Unicode emojis into literal `???` or `??`.
- **Solution**: Never pass raw JavaScript or Python code containing double quotes directly on the PowerShell command line. Always write script files to disk using standard UTF-8 file writers or helper scripts before executing.

### 3.2 Active Match Numbering vs Walkover Byes
- **Symptom**: If byes increment bout numbers, ring coordinators call ghost matches (e.g., "Match #2" which is actually a walkover), causing confusion ringside.
- **Solution**: In `bracketBuilder.js`, `assignActiveMatchNumbers` checks `match.status !== 'walkover'`. Only active contested matches increment `matchNo`.

### 3.3 Large Bracket Print Clipping on Standard A4
- **Symptom**: Brackets with 16, 32, or 64 athletes shrink into microscopic unreadable text or get sliced across page breaks when printed naively.
- **Solution**: The `BracketView` print engine automatically detects brackets where `rounds[0].length > 8` and splits them into distinct sub-brackets:
  - Page 1: Pool A (Quarterfinal 1 & 2)
  - Page 2: Pool B (Quarterfinal 3 & 4)
  - Page 3: Finals & Semifinals Championship Sheet
  - Page 4: Official Medal Standings & Completed Matches Sheet

### 3.4 Vite `outDir` vs Vercel Deployment Expectations
- **Symptom**: If `vite.config.js` sets `outDir: '../EvtMgr/draws-app'`, automated Vercel builds fail because Vercel expects output in `dist/`.
- **Solution**: Keep `outDir: 'dist'` in `vite.config.js` so Vercel builds cleanly. When running locally, copy `dist/` to `../EvtMgr/draws-app/` to keep the local embedded Event Manager up to date.

---

## 4. Environment & Repository Links
- **GitHub Repository**: `Sameer0535/Taekwondo-fixtures` (`main` branch)
- **Live Vercel Production URL**: [tkdfixture.vercel.app](https://tkdfixture.vercel.app)
- **Local Workspace Root**: `C:\Users\Sameer\.gemini\antigravity\scratch\taekwondo-fixtures`
- **Embedded EvtMgr Path**: `C:\Users\Sameer\.gemini\antigravity\scratch\EvtMgr\draws-app`
