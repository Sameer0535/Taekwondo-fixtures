# UI/UX Design System & Layout Geometry
## Kyorix TKD Fixtures — Visual Design & Mathematical Canvas Specifications

---

## 1. Design System Philosophy
The design of **Kyorix TKD Fixtures** reflects the precision, speed, and discipline of Taekwondo. Built as an enterprise-grade dark/light-compatible dashboard, the interface prioritizes high contrast, crisp typography, intuitive visual feedback, and publication-ready print fidelity.

---

## 2. Color System & Design Tokens

### 2.1 Brand & Neutral Palette
```css
:root {
  --primary: #2563eb;               /* Kyorix Electric Blue */
  --primary-hover: #1d4ed8;
  --primary-light: #eff6ff;
  --primary-glow: rgba(37, 99, 235, 0.4);

  --bg-primary: #f8fafc;            /* Canvas Background */
  --bg-secondary: #ffffff;          /* Card & Header Surface */
  --bg-tertiary: #f1f5f9;           /* Wells, Controls & Hover */

  --text-main: #0f172a;             /* High-contrast Slate 900 */
  --text-muted: #64748b;            /* Secondary Slate 500 */
  --border-color: #e2e8f0;          /* Subtle Slate 200 border */
  --border-focus: #3b82f6;
}
```

### 2.2 Taekwondo Corner Tokens (Chung & Hong)
```css
:root {
  /* Blue Corner (Chung) */
  --blue-comp: #2563eb;
  --blue-comp-light: #eff6ff;
  --blue-comp-border: #bfdbfe;

  /* Red Corner (Hong) */
  --red-comp: #dc2626;
  --red-comp-light: #fef2f2;
  --red-comp-border: #fecaca;
}
```

### 2.3 Olympic Medal Tokens
```css
:root {
  --gold: #eab308;
  --gold-bg: rgba(234, 179, 8, 0.12);
  --silver: #94a3b8;
  --silver-bg: rgba(148, 163, 184, 0.12);
  --bronze: #d97706;
  --bronze-bg: rgba(217, 119, 6, 0.10);
}
```

---

## 3. Typography & Hierarchy

### 3.1 Font Families
- **Primary Interface**: `'Outfit', sans-serif` — Modern, geometric, clean legibility for athlete names, numbers, and tournament titles.
- **Body & Controls**: `'Plus Jakarta Sans', sans-serif` — Highly readable font for table entries, buttons, and form inputs.
- **Scores**: `'SF Mono', 'Courier New', monospace` — Fixed-width digits preventing layout jitter during live scoring.

### 3.2 Hierarchy Scale
- **H1 (Page Titles)**: `1.5rem` (`24px`), Weight: `800`, Letter Spacing: `-0.02em`
- **H2 (Division Headers)**: `1.25rem` (`20px`), Weight: `700`
- **H3 (Section Headers)**: `1.05rem` (`17px`), Weight: `600`, Uppercase Letter Spacing: `0.05em`
- **Body / Standard**: `0.9rem` (`14.4px`), Weight: `400` / `500`
- **Badges & Meta**: `0.72rem` (`11.5px`), Weight: `700`, Uppercase

---

## 4. Interactive Bracket Canvas Geometry

### 4.1 Match Card Component Dimensions
The tournament bracket nodes are laid out on an absolute coordinate canvas. Card dimensions and spacing are fixed constants synchronized with CSS box-sizing:
```
+------------------------------------------------------+  ^
| MATCH #1 - QUARTERFINAL                   [STATUS]   |  | INFO_BAR_H = 24px
+------------------------------------------------------+  v
| [BLUE BAR]  Lee Dae-hoon          [FLAG]        14   |  | ROW_H = 38px
+------------------------------------------------------+  | (CARD_H = 100px)
| [RED BAR]   Alexei Denisenko      [FLAG]        12   |  | ROW_H = 38px
+------------------------------------------------------+  v
<------------------- COL_W = 260px -------------------->
```

### 4.2 Mathematical Canvas Spacing Constants
```javascript
const CARD_H = 100;                 // Total height of match card
const GAP = 14;                     // Vertical gap between adjacent cards
const SLOT = CARD_H + GAP;          // 114px vertical pitch per leaf slot
const HEADER = 50;                  // Clearance for round header label
const COL_W = 260;                  // Column width
const COL_GAP = 64;                 // Horizontal distance between rounds (4rem)
const COL_STEP = COL_W + COL_GAP;   // 324px horizontal round step
const MARGIN = 48;                  // Outer canvas margin
```

### 4.3 Slot Midpoints for Path Connections
Connector curves anchor to the exact vertical midpoints of the Blue and Red competitor rows:
- `INFO_BAR_H` = `24px`
- `BLUE_SLOT_MID` = $24 + rac{38}{2} = 43	ext{px}$
- `RED_SLOT_MID` = $24 + 38 + rac{38}{2} = 81	ext{px}$
- `CARD_MID` = $rac{100}{2} = 50	ext{px}$

### 4.4 Step Bezier Curve Algorithm (`getStepPath`)
To eliminate visual kinks or overlapping lines, connector paths follow a continuous horizontal-vertical-horizontal quadratic bezier step curve:
```
(x1, y1)  --------------------+
                              |  (Quadratic corner curve, r = 8px)
                              |
                              +--------------------->  (x2, y2)
```
- **Start**: Horizontal ray from the parent match right edge (`x1`, `y1`).
- **Midpoint**: $x_{	ext{mid}} = rac{x1 + x2}{2}$.
- **Turn 1**: Smooth quadratic curve approaching vertical trunk.
- **Turn 2**: Smooth quadratic curve turning into target slot (`x2`, `y2`).

---

## 5. Path Illumination & Visual Feedback
- **Hover Path Tracking**: Moving the cursor over an athlete activates `hoveredCompetitorId`. All historical and forward matches involving that athlete receive the CSS class `.path-highlighted`.
- **Glow Effect**:
```css
.match-card.path-highlighted {
  border-color: var(--primary) !important;
  box-shadow: 0 4px 14px var(--primary-glow) !important;
}
```
- **Feeder Labels**: Empty match slots display dynamic feeder badges:
  - `W1` $	o$ Winner of Match #1
  - `W2` $	o$ Winner of Match #2

---

## 6. Publication-Grade Print Layout Engine

### 6.1 A4 Landscape Optimization
When the user triggers browser print (`Ctrl+P` or clicking Print):
- Navigation bar, buttons, controls, and division sidebars are completely hidden (`.no-print { display: none !important; }`).
- Zoom scale is locked to standard crisp vector print bounds:
```css
@media print {
  @page {
    size: A4 landscape;
    margin: 10mm;
  }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .bracket-container {
    zoom: var(--print-zoom, 0.7) !important;
  }
}
```

### 6.2 Intelligent Multi-Page Pagination (> 8 Competitors)
Brackets with 16, 32, or 64 athletes automatically partition into distinct sequential pages:
- **Page 1**: Pool A (Top Half Quarterfinals).
- **Page 2**: Pool B (Bottom Half Quarterfinals).
- **Page 3**: Championship Finals Sheet (Semifinals and Gold Medal Match).
- **Page 4**: Official Podium Standings & Completed Match Audit Sheet.
