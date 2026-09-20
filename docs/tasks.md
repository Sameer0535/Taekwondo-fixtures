# Development Tasks, Work Log & Product Roadmap
## Kyorix TKD Fixtures — Engineering Sprint Tracker

---

## 1. Overview
This document tracks all completed engineering tasks, bug fixes, UI overhauls, active milestones, and the future feature roadmap for **Kyorix TKD Fixtures**.

---

## 2. Completed Milestones & Engineering Log

### Sprint 1: Core Single-Elimination Engine & Normalization
- [x] Implemented dynamic power-of-2 tree generation (`2, 4, 8, 16, 32, 64`).
- [x] Built automatic Bye allocation and automatic walkover propagation (`status: 'walkover'`) into Round 1.
- [x] Implemented standard tournament seeding order generator (`getSeedingOrder`).
- [x] Created interactive Pan and Zoom canvas with Ctrl+Wheel prevention against accidental page intercept.

### Sprint 2: World Taekwondo Scoring Engine
- [x] Built interactive `MatchModal.jsx` supporting Best-of-3 individual round score entry (Blue vs Red).
- [x] Implemented official WT Win Types: `PTF`, `PTG`, `RSC`, `WDR`, `DSQ`, `PUN`.
- [x] Added reactive tree advancement (`updateMatchScore`), automatically moving the winner to the parent feeder slot while strikethrough-formatting the loser.
- [x] Built sequential active match numbering (`assignActiveMatchNumbers`), skipping walkover byes so ring numbers remain consecutive.

### Sprint 3: Olympic Double Bronze & Medal Podium
- [x] Designed `getPodium` utility calculating 🥇 1st Place (Gold), 🥈 2nd Place (Silver), and 🥉 3rd Place (Bronze A & B from both semifinal losers).
- [x] Implemented medal podium card UI with custom gold, silver, and bronze gradient surfaces.
- [x] Added completed match audit log table displaying round-by-round point breakdown and win type badges.

### Sprint 4: Dual Tournament Operating Modes
- [x] Implemented **Tournament Mode Selector**:
  - **Official Mode**: Sub-Junior, Cadet, Junior, Senior with standard WT weight divisions.
  - **Group-4 Mode**: Grassroots developmental pool capping brackets at maximum 4 athletes (2 semifinals + 1 final).
- [x] Group-4 category switcher: Switched age options to `U-4`, `U-6`, `U-8`, `U-10`, `U-12`, `U-15`, `U-18`, and `A-18`, while hiding weight division choices.

### Sprint 5: Multi-Court Dispatch System
- [x] Added global `totalCourts` selector dropdown (1 to 12 courts).
- [x] Added division-level court assignment dropdown (`Court 1` to `Court N` or `Unassigned`).
- [x] Fixed duplicate court number display bug in print headers and match labels.

### Sprint 6: Smooth Sidebar Scrolling & Bulk Import
- [x] Resolved sidebar scroll clipping and layout overflow issues.
- [x] Designed modern **Bulk Import** modal with gender, age category, and weight class dropdown selectors.
- [x] Implemented fast raw-text parsing (`Athlete Name, Academy Name`) with automatic whitespace trimming and division grouping.

### Sprint 7: Same-Academy Spatial Separation & In-Place Shuffling
- [x] Implemented `buildAcademySeparatedSlots` using bit-reversed slot indexing and randomized phase offsets.
- [x] Guaranteed zero Round 1 clashes between fighters from the same club/academy.
- [x] Fixed "Regenerate / Shuffle" button behavior: now shuffles randomness in-place without triggering jarring page switches.

### Sprint 8: SVG Connector Path Geometry Stabilization
- [x] Rewrote `getStepPath` bezier curve calculations to eliminate connector path twisting kinks on closely spaced vertical cards.
- [x] Harmonized slot midpoints (`BLUE_SLOT_MID = 43px`, `RED_SLOT_MID = 81px`, `CARD_MID = 50px`).

### Sprint 9: Results Section Court Filter & Updated Bracket View
- [x] Added Court selection filter pills in the **Results** section (`All Courts`, `Court 1`..`N`, `Unassigned`).
- [x] Built real-time filtered tournament statistics cards (Divisions, Completed, In Progress, Matches, Rate).
- [x] Added View Mode toggle:
  - **🏆 Updated Bracket**: Full-width interactive bracket canvas showing live scores and active winners.
  - **🏅 Standings & Podium**: Medal podium standings and completed match audit logs.

### Sprint 10: Unicode / Windows Encoding Glitch Resolution
- [x] Diagnosed and eliminated corrupt ASCII question mark characters (`???`, `??`, `?`) caused by PowerShell non-UTF-8 writes.
- [x] Replaced all corrupted emoji strings with resolution-independent vector inline SVGs (`TrophyIcon`, `MedalIcon`, `CourtIcon`, `CheckCircleIcon`).
- [x] Enforced strict UTF-8 without BOM file encoding across all project scripts.

### Sprint 11: Corporate Identity & Brand Overhaul
- [x] Replaced generic `[⚡] TKD Fixtures` header with official master **Kyorix** logo asset (`public/kyorix-logo.png`).
- [x] Generated official 64x64 K-mark favicon (`public/favicon.png`).
- [x] Configured hover animations and click-to-home navigation.

### Sprint 12: Dual Build Pipeline & Deployment
- [x] Configured Vite production build to clean `dist/` directory.
- [x] Automated build sync with local Kyorix Event Manager (`../EvtMgr/draws-app/`).
- [x] Deployed live to Vercel production at **[tkdfixture.vercel.app](https://tkdfixture.vercel.app)**.

---

## 3. Active Sprints
- [x] **Project Documentation Suite**: Complete compilation of `prd.md`, `architecture.md`, `rules.md`, `design.md`, `tasks.md`, `memory.md`, and `README.md` into dedicated `docs/` repository.

---

## 4. Product Roadmap & Future Enhancements

### Milestone 1: Live Scoreboard Synchronization (Q4 2026)
- [ ] Connect `BracketView` with `taekwondo-scorer` via WebRTC Peer-to-Peer or WebSocket server.
- [ ] Live visual ring indicators on bracket cards: "Bout Currently on Court 1" with flashing live score counter.
- [ ] Automatic bracket winner progression upon referee's match completion signal.

### Milestone 2: Ringside QR Code Dispatch (Q1 2027)
- [ ] Render unique QR code on printed match tie-sheets.
- [ ] Ring marshals scan the paper sheet with smartphone camera to instantly open the match scoring modal for that bout.

### Milestone 3: Client-Side Vector PDF Engine (Q2 2027)
- [ ] Add direct "Download PDF" button generating vector PDF tie-sheets using `jspdf` and `svg2pdf.js` without relying on browser print dialogs.
- [ ] Include official tournament banner, date, venue, and chief referee signature lines.

### Milestone 4: True Double-Elimination & Repechage Tree
- [ ] Support official Olympic Repechage brackets (defeated athletes by finalists enter a separate repechage bronze bracket).
