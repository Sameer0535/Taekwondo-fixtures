# System & Technical Architecture
## Kyorix TKD Fixtures — Single-Page Application Architecture

---

## 1. Architectural Philosophy
Kyorix TKD Fixtures is architected as an ultra-fast, zero-backend, client-side deterministic tournament engine. State is held in-memory via React state with persistent backup to browser `localStorage`, eliminating database latency and ensuring tournament operations never fail due to network drops.

```
+-------------------------------------------------------------------------+
|                        Browser Runtime Context                          |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                            App.jsx                                |  |
|  |               Root State Store & Tab Routing Hub                  |  |
|  +---------------------------------+---------------------------------+  |
|                                    |                                    |
|         +--------------------------+--------------------------+         |
|         |                          |                          |         |
|  +------v-------+          +-------v------+            +------v------+  |
|  |CompetitorList|          | BracketView  |            | ResultsView |  |
|  | - Mode Switch|          | - SVG Canvas |            | - Court Flt |  |
|  | - Add Player |          | - Pan & Zoom |            | - Standings |  |
|  | - Bulk Import|          | - DnD Swap   |            | - Live Tree |  |
|  +--------------+          +-------+------+            +-------------+  |
|                                    |                                    |
|                            +-------v------+                             |
|                            |  MatchModal  |                             |
|                            | - Best of 3  |                             |
|                            | - Win Type   |                             |
|                            +--------------+                             |
|                                                                         |
|  +---------------------------------+---------------------------------+  |
|  |                 Utility & Algorithm Layer                         |  |
|  |  [bracketBuilder.js]           [countries.js]                     |  |
|  |  - buildAcademySeparatedSlots   - NOC to ISO mapping              |  |
|  |  - getStepPath bezier math     - Country flag CDN resolution      |  |
|  |  - assignActiveMatchNumbers    - ISO-3166 database                |  |
|  |  - rebuildBracketState                                            |  |
|  +---------------------------------+---------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 2. Technology Stack
- **Framework**: React 19 (`react`, `react-dom` v19.2.7)
- **Build Tooling**: Vite 8 (`vite` v8.1.4, `@vitejs/plugin-react` v6.0.3)
- **Styling Architecture**: Pure Vanilla CSS design system (`src/index.css`, `src/App.css`) with CSS custom properties (tokens), avoiding utility framework bloat.
- **Vector Graphics**: Dynamic inline SVG with mathematical Quadratic Bezier step curves (`M`, `H`, `Q`, `V`).
- **Icons & Assets**: Scalable inline SVGs (Trophy, Medal, Court, Check, Print) and official transparent raster masters (`public/kyorix-logo.png`).
- **Flags**: FlagCDN vector API resolved via IOC/NOC to ISO-3166 translation.

---

## 3. Directory & File Organization
```
taekwondo-fixtures/
├── docs/                      # Architectural & Engineering Specifications
│   ├── prd.md                 # Product Requirements Document
│   ├── architecture.md        # Technical System Architecture (This Document)
│   ├── rules.md               # Tournament Rules & Scoring Engine
│   ├── design.md              # UI/UX Specifications & Geometry Math
│   ├── tasks.md               # Engineering Work Log & Roadmap
│   ├── memory.md              # Context & Critical Architectural Decisions
│   └── README.md              # Documentation Index & Hub
├── public/                    # Static Assets Served at Root
│   ├── favicon.png            # Official 64x64 Kyorix K-Mark Favicon
│   ├── favicon.svg            # Fallback Vector Favicon
│   ├── kyorix-logo.png        # Master Transparent Kyorix Logo (853x176)
│   └── kyorix-logo.jpg        # Master High-Res Logo Asset
├── src/
│   ├── assets/                # Bundled Media
│   │   └── kyorix-logo.png    # Bundled Vite Asset
│   ├── components/            # UI Component Modules
│   │   ├── CompetitorList.jsx # Competitors Table, Mode Selector & Bulk Import
│   │   ├── BracketView.jsx    # Interactive SVG Tree Canvas & Print Engine
│   │   ├── MatchModal.jsx     # Best-of-3 WT Scoring Modal Dialog
│   │   └── ResultsView.jsx    # Court Filter, Statistics & Standings
│   ├── utils/                 # Pure Business Logic & Algorithms
│   │   ├── bracketBuilder.js  # Seeding, Academy Separation & Advancement Engine
│   │   └── countries.js       # NOC Olympic Country Code Mapping
│   ├── App.css                # Component-level styles
│   ├── App.jsx                # Application Root Component & State Store
│   ├── index.css              # Global Design Tokens & Print Rules
│   └── main.jsx               # React DOM Entry Point
├── index.html                 # HTML Shell with Google Fonts Preconnects
├── package.json               # NPM Scripts & Dependencies
└── vite.config.js             # Vite Build Configuration
```

---

## 4. Component Hierarchy & State Store

### 4.1 Root State Container (`App.jsx`)
`App.jsx` acts as the single source of truth for the application:
```javascript
// Core Reactive State
const [competitors, setCompetitors] = useState(SAMPLE_COMPETITORS);
const [tournamentMode, setTournamentMode] = useState('official'); // 'official' | 'group4'
const [totalCourts, setTotalCourts] = useState(4);
const [divisionCourts, setDivisionCourts] = useState({});        // { divisionId: courtNumber }
const [brackets, setBrackets] = useState({});                    // { divisionId: Round[][] }
const [activeTab, setActiveTab] = useState('competitors');       // 'competitors' | 'divisions' | 'brackets' | 'results'
```

### 4.2 Divisions Derived State
Divisions are computed on-the-fly using `useMemo` based on the competitor array:
```javascript
const divisions = useMemo(() => {
  const map = {};
  competitors.forEach(comp => {
    const key = tournamentMode === 'group4'
      ? `${comp.gender}-${comp.ageCategory}`
      : `${comp.gender}-${comp.ageCategory}-${comp.weightClass}`;
    
    if (!map[key]) {
      map[key] = {
        id: key,
        name: formatDivisionName(comp, tournamentMode),
        competitors: [],
        count: 0
      };
    }
    map[key].competitors.push(comp);
    map[key].count++;
  });
  return map;
}, [competitors, tournamentMode]);
```

---

## 5. Core Data Models

### 5.1 Competitor Interface
```typescript
interface Competitor {
  id: string;               // e.g., 'c1', 'comp-178854721'
  name: string;             // Athlete Full Name
  club: string;             // Academy / Dojang Name (e.g., 'Seoul TKD')
  country: string;          // 3-letter Olympic NOC Code (e.g., 'KOR', 'IND')
  seed: number | null;      // Optional Seed (1, 2, 3...)
  gender: 'Male' | 'Female';
  ageCategory: string;      // 'Senior', 'Cadet', or 'U-10', etc.
  weightClass: string;      // 'Under 68kg' (or empty string in Group-4)
  rank?: string;            // e.g., '1st Dan', 'Black Belt'
}
```

### 5.2 Match Interface
```typescript
interface Match {
  id: string;                         // Unique string, e.g., 'm_0_0'
  roundIndex: number;                 // 0-indexed round depth
  matchIndex: number;                 // 0-indexed position within round
  originalMatchIndex: number;         // Original feeder coordinate
  matchNo: number | null;             // Active bout number (#1, #2...)
  courtNo: string | null;             // Assigned ring court
  p1: Competitor | null;              // Blue Corner Athlete
  p2: Competitor | null;              // Red Corner Athlete
  score1: number | null;              // Blue Final Score
  score2: number | null;              // Red Final Score
  status: 'pending' | 'completed' | 'walkover';
  winnerId: string | null;            // Winning Athlete ID
  winType: 'PTF' | 'PTG' | 'RSC' | 'WDR' | 'DSQ' | 'PUN' | null;
  roundScores: Array<{ blue: number | null; red: number | null }> | null;
  y?: number;                         // Calculated canvas Y position (px)
  py?: number;                        // Calculated print Y position (px)
}
```

### 5.3 Bracket Interface
A division's bracket is represented as a 2D array of rounds, ordered from leaves (Round 0) to root (Final Round):
```typescript
type Bracket = Match[][]; // rounds[roundIndex][matchIndex]
```

---

## 6. Bracket Tree Coordinate Geometry Engine

### 6.1 Screen Canvas Dimensions
To achieve mathematical precision and zero overlap between elimination nodes:
```javascript
const CARD_H = 100;                 // Total card height (px)
const GAP = 14;                     // Vertical gap between adjacent cards (px)
const SLOT = CARD_H + GAP;          // 114px per leaf slot
const HEADER = 50;                  // Header clearance offset
const COL_W = 260;                  // Card column width
const COL_GAP = 64;                 // Column horizontal gap
const COL_STEP = COL_W + COL_GAP;   // 324px step per round
const MARGIN = 48;                  // Canvas outer padding
```

### 6.2 Parent Centering Algorithm
1. **Round 0 (Leaves)** are placed sequentially:
   $$	ext{match.y} = 	ext{MARGIN} + 	ext{HEADER} + m 	imes 	ext{SLOT}$$
2. **Successive Rounds ($r \ge 1$)** are dynamically centered between their two child matches:
   $$	ext{match.y} = rac{	ext{topChild.y} + 	ext{botChild.y}}{2}$$

### 6.3 Quadratic Bezier Step Curve Path (`getStepPath`)
Connectors between round $r$ and round $r+1$ are drawn using SVG path syntax with smooth rounded corners:
```javascript
const getStepPath = (x1, y1, x2, y2) => {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  if (dy < 2) return `M ${x1} ${y1} H ${x2}`;

  const xmid = (x1 + x2) / 2;
  const r = Math.min(8, dy / 2, dx / 2);
  const vertDir = y2 > y1 ? 1 : -1;

  const y1_corner = y1 + r * vertDir;
  const y2_corner = y2 - r * vertDir;

  return `M ${x1} ${y1} H ${xmid - r} Q ${xmid} ${y1}, ${xmid} ${y1_corner} V ${y2_corner} Q ${xmid} ${y2}, ${xmid + r} ${y2} H ${x2}`;
};
```

---

## 7. Academy Separation Subsystem
The engine prevents same-academy athletes from facing each other in early rounds using a 3-stage pipeline:
1. **Club Grouping & Random Shuffle**: Group competitors by normalized club name (`club.trim().toLowerCase()`), shuffling athletes within each club for unpredictability on regeneration.
2. **Bit-Reversed Permutation Spreading**: Maps interleaved club members across bracket slots using bit-reversal indices with a randomized starting quadrant offset:
   $$	ext{bitRev}(i, 	ext{bits}) = \sum_{b=0}^{	ext{bits}-1} \left(\left(rac{i}{2^b}ight) \pmod 2ight) 	imes 2^{	ext{bits}-1-b}$$
3. **Round 1 Clash Resolution**: A post-processing pass scans Round 1 matches (`slots[2m]` vs `slots[2m+1]`). If both competitors share an academy, the algorithm finds an alternative match and swaps one athlete to a neutral slot where neither pairing causes a club conflict.

---

## 8. Build & Deployment Architecture
- **Local Dev Server**: `npm run dev` (Vite HMR on `localhost:5173`).
- **Production Bundle**: `npm run build` outputs to `dist/`, producing minified JavaScript and CSS with asset hashing.
- **EvtMgr Embedded Integration**: The production bundle is mirrored to `../EvtMgr/draws-app/`, where it is mounted via an embedded `<iframe>` in Kyorix Event Manager.
- **Continuous Deployment**: Committed changes pushed to `Sameer0535/Taekwondo-fixtures` (`main` branch) automatically deploy live to **[tkdfixture.vercel.app](https://tkdfixture.vercel.app)**.
