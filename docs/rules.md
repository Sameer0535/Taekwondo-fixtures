# Tournament Rules, Seeding, and Scoring Engine
## Kyorix TKD Fixtures — Official Regulation & Rule Book

---

## 1. Scope & Standards
This document outlines the competition formats, bracket seeding rules, spatial academy separation algorithms, and scoring protocols enforced within **Kyorix TKD Fixtures**. The engine supports both official **World Taekwondo (WT)** sanctioned championship guidelines and developmental grassroots **Group-4** pool regulations.

---

## 2. Tournament Modes

### 2.1 Mode A: Official World Taekwondo (WT) Mode
Designed for sanctioned state, national, and international sparring (Kyorugi) tournaments.

#### Age & Weight Class Classifications

##### Sub-Junior Division
- **Male**: Under 18kg, Under 21kg, Under 23kg, Under 25kg, Under 27kg, Under 29kg, Under 32kg, Under 35kg, Under 38kg, Under 41kg, Under 44kg, Under 50kg.
- **Female**: Under 16kg, Under 18kg, Under 20kg, Under 22kg, Under 24kg, Under 26kg, Under 29kg, Under 32kg, Under 35kg, Under 38kg, Under 41kg, Under 47kg.

##### Cadet Division (12–14 years)
- **Male**: Under 33kg, Under 37kg, Under 41kg, Under 45kg, Under 49kg, Under 53kg, Under 57kg, Under 61kg, Under 65kg, Over 65kg.
- **Female**: Under 29kg, Under 33kg, Under 37kg, Under 41kg, Under 44kg, Under 47kg, Under 51kg, Under 55kg, Under 59kg, Over 59kg.

##### Junior Division (15–17 years)
- **Male**: Under 45kg, Under 48kg, Under 51kg, Under 55kg, Under 59kg, Under 63kg, Under 68kg, Under 73kg, Under 78kg, Over 78kg.
- **Female**: Under 42kg, Under 44kg, Under 46kg, Under 49kg, Under 52kg, Under 55kg, Under 59kg, Under 63kg, Under 68kg, Over 68kg.

##### Senior Division (17+ years)
- **Male**: Under 54kg (Fin), Under 58kg (Fly), Under 63kg (Bantam), Under 68kg (Feather), Under 74kg (Light), Under 80kg (Welter), Under 87kg (Middle), Over 87kg (Heavy).
- **Female**: Under 46kg (Fin), Under 49kg (Fly), Under 53kg (Bantam), Under 57kg (Feather), Under 62kg (Light), Under 67kg (Welter), Under 73kg (Middle), Over 73kg (Heavy).

---

### 2.2 Mode B: Group-4 Grassroots Pools
Designed for grassroots festivals, club invitationals, and novice sparring tournaments to guarantee maximum participation, safe matching, and quick ring turnaround.

#### Regulations
1. **No Weight Class Category**: Athletes are grouped strictly by age classification.
2. **Capped Bracket Size**: Each pool consists of a **maximum of 4 competitors**.
3. **Structured Single-Elimination**:
   - 2 Semifinal bouts (Match 1 and Match 2).
   - 1 Final bout (Match 3) between the winners.
4. **Age Classifications**:
   - `U-4` (Under 4 years)
   - `U-6` (Under 6 years)
   - `U-8` (Under 8 years)
   - `U-10` (Under 10 years)
   - `U-12` (Under 12 years)
   - `U-15` (Under 15 years)
   - `U-18` (Under 18 years)
   - `A-18` (Above 18 years)

---

## 3. Seeding & Bracket Generation Logic

### 3.1 Bracket Sizing & Normalization
The tournament bracket size ($S$) is normalized to the next power of 2 ($2^k$):
$$S = 2^{\lceil \log_2(N) ceil}$$
For example:
- 3 to 4 competitors $	o S = 4$
- 5 to 8 competitors $	o S = 8$
- 9 to 16 competitors $	o S = 16$
- 17 to 32 competitors $	o S = 32$

### 3.2 Bye Placement
The total number of Byes ($B$) awarded in Round 0 is:
$$B = S - N$$
- Byes are awarded to the highest-seeded athletes according to standard World Taekwondo tournament distribution order:
  - Seed 1 occupies Slot 0 (Top of Pool A).
  - Seed 2 occupies Slot $S-1$ (Bottom of Pool B).
  - Seed 3 occupies Slot $S/2$ (Top of Pool B).
  - Seed 4 occupies Slot $S/2 - 1$ (Bottom of Pool A).
- Athletes with Byes receive an automatic walkover advancement (`status: 'walkover'`) into Round 1.

### 3.3 Same-Academy Spatial Separation Algorithm
To avoid early intra-club eliminations, the engine applies an automated 3-step spatial distribution:
1. **Academy Grouping**: Athletes are grouped by academy name (`comp.club`).
2. **Bit-Reversed Quadrant Distribution**: Athletes from the same club are distributed using bit-reversed slot ordering with randomized phase offsets, ensuring they land in opposing halves or quarters of the elimination tree.
3. **Round 1 Conflict Resolution**: If two athletes from the same academy are paired in Round 1 (`slots[2m]` and `slots[2m+1]`), the algorithm automatically swaps one athlete with another slot in the bracket where neither pairing creates an intra-club clash.
4. **Independent Athletes**: Competitors marked as `Independent` are exempt from club separation rules.

### 3.4 Pre-Match Seeding Swapping
Before any bout in a division begins (`status === 'completed'`), the marshal can manually drag and drop athlete cards in Round 0 to swap their positions. Once any match is scored, bracket seeding locks automatically to maintain tournament integrity.

---

## 4. Match Bout Numbering
Only contested matches receive active bout numbers. Matches marked as `walkover` (due to Byes) are omitted from the match sequence:
```
Match 1: Quarterfinal (Active)    -> Bout #1
Match 2: Quarterfinal (Walkover)  -> (No bout number, automatic advance)
Match 3: Quarterfinal (Active)    -> Bout #2
Match 4: Quarterfinal (Walkover)  -> (No bout number, automatic advance)
Match 5: Semifinal (Active)       -> Bout #3
```
This ensures ring coordinators call matches sequentially without ghost match gaps.

---

## 5. Scoring & Match Resolution Engine

### 5.1 Best-of-3 System
Matches follow the official World Taekwondo Best-of-3 format:
- Each match consists of up to three individual 2-minute rounds.
- The athlete who wins two rounds wins the contest.
- If an athlete wins Round 1 and Round 2, Round 3 is not contested.

### 5.2 Official Win Type Codes
| Code | Full Name | Criteria |
| :--- | :--- | :--- |
| **PTF** | Final Score Points | Contest ends upon regulation time; athlete with higher round wins is declared winner. |
| **PTG** | Point Gap | A 12-point margin is reached at the end of a round or anytime during the final round. |
| **RSC** | Referee Stops Contest | Referee halts the bout due to safety, knockout, or overwhelming technical superiority. |
| **WDR** | Withdrawal / Forfeit | Athlete or coach concedes the match (towel thrown) or fails to report to the ring within 1 minute. |
| **DSQ** | Disqualification | Failure of weight inspection, equipment violation, or unsportsmanlike behavior. |
| **PUN** | Punitive Declaration | Athlete accumulates five (5) Gam-jeom penalty points within a single round. |

---

## 6. Medal Podium Structure

Kyorix TKD Fixtures strictly implements the Olympic World Taekwondo **Double-Bronze** system:
```
                [Semifinal 1 Loser]  --->  🥉 3rd Place Bronze (Podium A)
[Final Bout] <
                [Semifinal 2 Loser]  --->  🥉 3rd Place Bronze (Podium B)

[Final Winner]    --->  🥇 1st Place Gold Medal
[Final Runner-Up] --->  🥈 2nd Place Silver Medal
```
1. **🥇 1st Place (Gold)**: Winner of the Final Match.
2. **🥈 2nd Place (Silver)**: Defeated finalist.
3. **🥉 3rd Place (Bronze A)**: Defeated athlete in Semifinal Match 1.
4. **🥉 3rd Place (Bronze B)**: Defeated athlete in Semifinal Match 2.
