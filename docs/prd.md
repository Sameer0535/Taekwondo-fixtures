# Product Requirements Document (PRD)
## Kyorix TKD Fixtures — Professional Taekwondo Tournament & Bracket Management System

---

## 1. Executive Summary
**Kyorix TKD Fixtures** is a high-performance, client-side web application engineered specifically for organizing, seeding, generating, scoring, and printing official tournament brackets (tie sheets) for Taekwondo competitions. Built to comply with World Taekwondo (WT) tournament regulations while also accommodating grassroots multi-division developmental tournaments, Kyorix TKD Fixtures provides tournament directors, ring marshals, and coaches with a responsive, zero-latency tournament management workstation.

---

## 2. Problem Statement
Traditional martial arts tournaments suffer from significant operational bottlenecks:
1. **Manual Bracket Seeding Errors**: Pairing athletes from the same academy in early elimination rounds creates athlete dissatisfaction and unfair tournament outcomes.
2. **Inflexible Bracket Formats**: Most commercial tournament software forces standard Olympic weight classes, making it impossible to run grassroots "Group-4" developmental pools for young children (U-4 to U-18).
3. **Print Cutoffs & Formatting Breakages**: Standard browser printing of large elimination trees (16, 32, or 64 athletes) clips off-page or prints unreadable tiny text.
4. **Court Scheduling Friction**: Disconnected match numbering leads to confusion across multiple rings (Courts 1 through N).
5. **Connectivity Dependencies**: Cloud-reliant tools fail when venue Wi-Fi becomes overloaded by athletes and spectators.

---

## 3. Goals & Non-Goals

### Goals
- **Deterministic Offline Execution**: 100% operational in modern web browsers without internet connectivity.
- **Intelligent Academy Separation**: Automatically distance same-club fighters into opposing halves/quarters of the elimination tree.
- **Dual Tournament Operating Modes**: Native support for both **Official World Taekwondo (WT)** divisions and **Group-4 Grassroots** 4-athlete pools.
- **Best-of-3 WT Scoring Engine**: Integrated scoring modal with dynamic win types (PTF, PTG, RSC, WDR, DSQ, PUN) and reactive winner advancement.
- **Multi-Court Dispatch**: Configurable total courts with division assignment and court-specific results filtering.
- **Publication-Grade Print Engine**: Intelligent automatic splitting of large brackets into Pool A, Pool B, Semifinals/Finals, and Podium sheets formatted for standard A4 landscape.

### Non-Goals
- Real-time hardware sensor integration (handled by Kyorix ESS / PSS hardware scoring server).
- Online athlete registration payment gateway (handled by Kyorix Event Portal).
- Multi-sport bracket generation (strictly optimized for martial arts single-elimination tie sheets).

---

## 4. User Personas
| Persona | Role | Key Needs |
| :--- | :--- | :--- |
| **Tournament Director** | Overall tournament coordinator | Quick setup of tournament mode, court allocation, export/import of state backup. |
| **Bracket Marshal** | Ringside official running draws | Fast competitor entry/bulk import, drag-and-drop seeding adjustments, tie-sheet printing. |
| **Court Coordinator** | Ring referee/scorekeeper | Filter results and matches by assigned court, score bouts, advance winners. |
| **Coach & Athlete** | Competitor / spectator | View live updated bracket diagrams, verify opponent path and medal standings. |

---

## 5. Functional Requirements

### 5.1 Tournament Mode Management (FR1)
- **FR1.1 Mode Selection**: Support two distinct tournament operating modes toggleable from the dashboard:
  - **Official Mode**: Standard World Taekwondo structure spanning Sub-Junior, Cadet, Junior, and Senior age classes with regulated Olympic weight classes.
  - **Group-4 Mode**: Grassroots developmental format capping pools at a maximum of 4 competitors per bracket (Semifinals + Final).
- **FR1.2 Category Adaptation**:
  - In *Group-4 Mode*, weight class selection is hidden; age divisions switch to `U-4`, `U-6`, `U-8`, `U-10`, `U-12`, `U-15`, `U-18`, and `A-18`.
  - In *Official Mode*, standard weight divisions (e.g., Senior Men -54kg, -58kg, -63kg, -68kg, -74kg, -80kg, -87kg, +87kg) are strictly enforced.

### 5.2 Competitor Management & Bulk Import (FR2)
- **FR2.1 Individual Athlete Entry**: Form fields for Name, Club/Academy, Country (with NOC auto-suggestions), Gender, Age Category, Weight Class, and optional Seed (1-8).
- **FR2.2 Bulk Batch Import**:
  - Modal with dropdown selectors for Gender, Age Division, and Weight Class.
  - Textarea input accepting raw text format: `Athlete Name, Academy Name` (one per line).
  - Automatically sanitizes names, trims whitespace, assigns division attributes, and appends to the competitor database.
- **FR2.3 Country & Flag Integration**: Automatic ISO conversion of Olympic NOC codes (e.g., `KOR`, `IND`, `USA`, `ESP`, `EGY`, `IRI`) with high-resolution vector flag rendering.
- **FR2.4 Division Auto-Grouping**: Athletes are grouped reactively into unique division IDs based on mode, gender, age category, and weight class.

### 5.3 Automated Bracket Generation Engine (FR3)
- **FR3.1 Power-of-2 Normalization**: Brackets scale dynamically to powers of 2 (2, 4, 8, 16, 32, 64) with automatic calculated Bye allocation.
- **FR3.2 Same-Academy Separation**:
  - Group athletes by club/academy name.
  - Distribute members of dominant clubs across opposite bracket halves/quarters using bit-reversed slot ordering.
  - Guarantee zero same-academy matchups in Round 1.
- **FR3.3 In-Place Bracket Shuffling & Regeneration**:
  - "Regenerate / Shuffle" action randomizes bracket placement while strictly preserving same-academy separation rules.
  - Shuffling executes in-place without jarring page reloads or loss of active UI view.
- **FR3.4 Bye & Walkover Propagation**: Athletes receiving Round 0 byes advance automatically into Round 1 as designated walkovers (`status: 'walkover'`).
- **FR3.5 Sequential Active Match Numbering**: Only active contested bouts increment match numbers (`#1`, `#2`, `#3`, etc.); walkover byes consume no bout numbers.

### 5.4 Interactive Bracket Canvas (FR4)
- **FR4.1 Zoom & Pan Navigation**: Infinite canvas supporting mouse wheel zooming (with Ctrl safety lock), smooth drag panning, and one-click "Reset View".
- **FR4.2 Interactive Drag & Drop Seeding**: Before matches commence, tournament marshals can manually drag and swap athlete slots in Round 0 to adjust seeding.
- **FR4.3 Competitor Path Highlighting**: Hovering over any competitor dynamically illuminates their entire advancement path and historical match connectors in bright accent colors.
- **FR4.4 Feeder Node Placeholders**: Empty child nodes display dynamic feeder labels indicating the feeding match (e.g., `W1`, `W2`, `W3`).

### 5.5 Match Scoring Engine (FR5)
- **FR5.1 Match Scoring Modal**: Clicking any active match opens an interactive scoring interface.
- **FR5.2 Best-of-3 Round Scoring**: Input fields for Blue and Red round scores across Round 1, Round 2, and optional Round 3.
- **FR5.3 Official WT Win Types**:
  - `PTF` (Final Points)
  - `PTG` (Point Gap — 12 point lead threshold)
  - `RSC` (Referee Stops Contest)
  - `WDR` (Withdrawal / Injury Forfeit)
  - `DSQ` (Disqualification / Weigh-in / Conduct)
  - `PUN` (Punitive Disqualification)
- **FR5.4 Reactive Tree Advancement**: Submitting scores immediately advances the winner to the parent match slot and marks the loser with strikethrough styling.

### 5.6 Court Dispatch & Multi-Ring Management (FR6)
- **FR6.1 Total Courts Configuration**: Dropdown selector supporting 1 to 12 concurrent tournament courts.
- **FR6.2 Division Court Assignment**: Each division tie sheet can be assigned to a specific court (e.g., `Court 1`, `Court 2`) or left `Unassigned`.
- **FR6.3 Double Assignment Protection**: Real-time division count badges indicate ring workload distribution.

### 5.7 Results & Medal Standings (FR7)
- **FR7.1 Court Filter Navigation**: Dedicated filter pills for `All Courts`, `Court 1` through `Court N`, and `Unassigned`.
- **FR7.2 Dynamic Status Dashboard**: Real-time counters for Total Divisions, Completed Divisions, In Progress Divisions, Total Matches, and Completion Rate %.
- **FR7.3 Dual Results View Modes**:
  - **🏆 Updated Bracket**: Full-width interactive elimination diagram showing live scores and active winners.
  - **🏅 Standings & Podium**: Official medal podium presentation (🥇 1st Gold, 🥈 2nd Silver, 🥉 3rd Bronze A & B) with competitor flag, club, and completed match audit logs.

### 5.8 Print & Export Operations (FR8)
- **FR8.1 Clean Print Engine**: Hides navigation bars, toolbars, and controls during `@media print`.
- **FR8.2 Smart Pagination for Large Brackets**: Brackets exceeding 8 competitors automatically paginate into:
  - Page 1: Pool A (Quarterfinal 1 & 2)
  - Page 2: Pool B (Quarterfinal 3 & 4)
  - Page 3: Semifinals & Finals Championship Sheet
  - Page 4: Official Standings & Match Log Sheet
- **FR8.3 Data Backup**: Complete state export to `.json` and offline state import restoration.

---

## 6. Non-Functional Requirements (NFRs)
- **NFR1 Performance**: Initial bracket generation in < 50ms for 64 competitors; smooth 60fps canvas panning and zooming.
- **NFR2 Zero External Dependencies**: Runs completely offline without external databases or mandatory internet connections.
- **NFR3 Responsive Geometry**: Adapts seamlessly to 4K monitors, laptops, and mobile tablet viewports (min-width 320px).
- **NFR4 Print Fidelity**: Formatted strictly for standard A4 landscape print bounds without horizontal or vertical clipping.
