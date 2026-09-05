/**
 * Generates the standard tournament seeding order for a given bracket size (power of 2).
 * e.g., for size 8: [1, 8, 5, 4, 3, 6, 7, 2]
 */
export function getSeedingOrder(size) {
  let order = [1];
  while (order.length < size) {
    const nextOrder = [];
    const target = order.length * 2 + 1;
    for (const x of order) {
      nextOrder.push(x);
      nextOrder.push(target - x);
    }
    order = nextOrder;
  }
  return order;
}

/**
 * Initializes a bracket structure from a list of competitors.
 * @param {Array} competitors - Array of competitor objects { id, name, seed, club, division }
 * @returns {Array} rounds - Array of rounds, where each round is an array of matches.
 */
/**
 * Distributes competitors across bracket slots such that competitors from the same
 * academy/club are placed as far apart as possible in opposite halves / quarters
 * of the bracket tree and never face each other in Round 1.
 */
export function buildAcademySeparatedSlots(competitors, bracketSize) {
  const slots = Array(bracketSize).fill(null);
  if (!competitors || competitors.length === 0) return slots;

  // 0. Initial random shuffle of competitors pool
  const pool = [...competitors];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // 1. Group competitors by club/academy
  const clubGroups = {};
  pool.forEach(c => {
    const clubName = (c.club || 'Independent').trim();
    const clubKey = clubName.toLowerCase();
    if (!clubGroups[clubKey]) {
      clubGroups[clubKey] = { name: clubName, members: [] };
    }
    clubGroups[clubKey].members.push(c);
  });

  // Shuffle members within each club group for randomness on regenerate
  Object.values(clubGroups).forEach(group => {
    const members = group.members;
    for (let i = members.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [members[i], members[j]] = [members[j], members[i]];
    }
  });

  // Sort clubs by number of members descending with a random tie-breaker for equal size clubs
  const sortedClubs = Object.values(clubGroups).sort((a, b) => {
    const diff = b.members.length - a.members.length;
    if (diff !== 0) return diff;
    return Math.random() - 0.5;
  });

  // Bit-reversed slot placement order (0, m/2, m/4, 3m/4, etc.)
  const numBits = Math.log2(bracketSize);
  const bitRevSlots = [];
  for (let i = 0; i < bracketSize; i++) {
    let rev = 0;
    for (let b = 0; b < numBits; b++) {
      if ((i >> b) & 1) {
        rev |= (1 << (numBits - 1 - b));
      }
    }
    bitRevSlots.push(rev);
  }

  // Randomize starting quadrant offset for bitRevSlots so regenerate doesn't always start at slot 0
  const randomSlotOffset = Math.floor(Math.random() * bracketSize);
  const randomizedBitRevSlots = bitRevSlots.map(s => (s + randomSlotOffset) % bracketSize);

  // Interleave members from clubs in round-robin fashion
  const orderedComps = [];
  let remaining = true;
  let memberIdx = 0;
  while (remaining) {
    remaining = false;
    sortedClubs.forEach(group => {
      if (memberIdx < group.members.length) {
        orderedComps.push(group.members[memberIdx]);
        remaining = true;
      }
    });
    memberIdx++;
  }

  // Assign competitors to max-distanced slots
  for (let i = 0; i < orderedComps.length; i++) {
    const slotIdx = randomizedBitRevSlots[i];
    slots[slotIdx] = orderedComps[i];
  }

  // 2. Post-processing pass: Fix any Round 1 same-academy matchups
  const numMatches = bracketSize / 2;
  for (let mIdx = 0; mIdx < numMatches; mIdx++) {
    const idx1 = mIdx * 2;
    const idx2 = mIdx * 2 + 1;
    const p1 = slots[idx1];
    const p2 = slots[idx2];

    const isSameClub = p1 && p2 &&
      p1.club && p2.club &&
      p1.club.trim().toLowerCase() === p2.club.trim().toLowerCase() &&
      p1.club.trim().toLowerCase() !== 'independent';

    if (isSameClub) {
      let swapped = false;
      for (let targetMatch = 0; targetMatch < numMatches; targetMatch++) {
        if (targetMatch === mIdx) continue;

        for (let targetPos of [0, 1]) {
          const targetIdx = targetMatch * 2 + targetPos;
          const targetComp = slots[targetIdx];
          const otherTargetComp = slots[targetMatch * 2 + (1 - targetPos)];

          const p1Club = p1.club.trim().toLowerCase();
          const targetClub = targetComp ? targetComp.club?.trim().toLowerCase() : null;
          const otherTargetClub = otherTargetComp ? otherTargetComp.club?.trim().toLowerCase() : null;
          const p2Club = p2.club.trim().toLowerCase();

          const match1Ok = !targetClub || targetClub !== p1Club;
          const match2Ok = !otherTargetClub || !p2Club || p2Club !== otherTargetClub;

          if (match1Ok && match2Ok) {
            slots[idx2] = targetComp;
            slots[targetIdx] = p2;
            swapped = true;
            break;
          }
        }
        if (swapped) break;
      }
    }
  }

  // 3. Random 50% coin-flip swap between p1 and p2 in each match to randomize red/blue sides on regenerate
  for (let mIdx = 0; mIdx < numMatches; mIdx++) {
    if (Math.random() < 0.5) {
      const idx1 = mIdx * 2;
      const idx2 = mIdx * 2 + 1;
      [slots[idx1], slots[idx2]] = [slots[idx2], slots[idx1]];
    }
  }

  return slots;
}

export function generateBracket(competitors) {
  if (!competitors || competitors.length === 0) return [];

  const n = competitors.length;
  // Find next power of 2
  let m = 2;
  while (m < n) {
    m *= 2;
  }

  // Generate slots with strict same-academy separation
  const slots = buildAcademySeparatedSlots(competitors, m);

  const rounds = [];
  let roundSize = m / 2;
  let roundIndex = 0;

  // Initialize all rounds with empty matches
  while (roundSize >= 1) {
    const roundMatches = [];
    for (let i = 0; i < roundSize; i++) {
      roundMatches.push({
        id: `match_${roundIndex}_${i}`,
        p1: null,
        p2: null,
        score1: null,
        score2: null,
        winnerId: null,
        winType: null, // 'PTS', 'PTG', 'SUP', 'WDR', 'DSQ'
        status: 'pending', // 'pending', 'walkover', 'completed'
        roundIndex,
        matchIndex: i,
        nextMatchId: roundSize > 1 ? `match_${roundIndex + 1}_${Math.floor(i / 2)}` : null,
        nextMatchPosition: i % 2 === 0 ? 'p1' : 'p2',
      });
    }
    rounds.push(roundMatches);
    roundSize /= 2;
    roundIndex++;
  }

  // Populate Round 0
  const round0 = rounds[0];
  for (let i = 0; i < round0.length; i++) {
    const match = round0[i];
    match.p1 = slots[i * 2];
    match.p2 = slots[i * 2 + 1];

    // Handle byes immediately
    if (match.p1 && !match.p2) {
      match.winnerId = match.p1.id;
      match.status = 'walkover';
    } else if (!match.p1 && match.p2) {
      match.winnerId = match.p2.id;
      match.status = 'walkover';
    } else if (!match.p1 && !match.p2) {
      match.status = 'walkover'; // double empty
    }
  }

  // Re-propagate walkovers and detect higher-round dead-ends
  rebuildBracketState(rounds);

  // Assign sequential match numbers ONLY to active fights
  assignActiveMatchNumbers(rounds);

  return rounds;
}

/**
 * Assigns sequential match numbers across the entire bracket, skipping byes (walkovers).
 */
export function assignActiveMatchNumbers(rounds) {
  let currentMatchNo = 1;
  for (let r = 0; r < rounds.length; r++) {
    for (let mIdx = 0; mIdx < rounds[r].length; mIdx++) {
      const match = rounds[r][mIdx];
      if (match.status !== 'walkover') {
        match.matchNo = currentMatchNo++;
      } else {
        match.matchNo = null;
      }
    }
  }
}

/**
 * Propagates winners of walkovers or completed matches to their next round slots.
 */
export function propagateWalkovers(rounds) {
  for (let r = 0; r < rounds.length - 1; r++) {
    const currentRound = rounds[r];
    const nextRound = rounds[r + 1];

    for (const match of currentRound) {
      if (match.winnerId) {
        const nextMatchIdx = Math.floor(match.matchIndex / 2);
        const nextMatch = nextRound[nextMatchIdx];
        const winnerObj = match.winnerId === match.p1?.id ? match.p1 : match.p2;

        if (match.matchIndex % 2 === 0) {
          nextMatch.p1 = winnerObj;
        } else {
          nextMatch.p2 = winnerObj;
        }
      }
    }
  }
}

/**
 * Updates a match with a winner and score, and propagates the winner.
 * @param {Array} rounds - Current rounds array
 * @param {string} matchId - ID of match to update
 * @param {string} winnerId - ID of winning competitor
 * @param {number} score1 - Score of player 1
 * @param {number} score2 - Score of player 2
 * @param {string} winType - Type of win
 * @returns {Array} New updated rounds array
 */
export function updateMatchScore(rounds, matchId, winnerId, score1, score2, winType, roundScores) {
  const newRounds = JSON.parse(JSON.stringify(rounds));
  
  // Find and update the match
  let targetMatch = null;
  let targetRoundIdx = -1;
  let targetMatchIdx = -1;

  for (let r = 0; r < newRounds.length; r++) {
    const idx = newRounds[r].findIndex(m => m.id === matchId);
    if (idx !== -1) {
      targetMatch = newRounds[r][idx];
      targetRoundIdx = r;
      targetMatchIdx = idx;
      break;
    }
  }

  if (!targetMatch) return rounds;

  targetMatch.winnerId = winnerId;
  targetMatch.score1 = score1;
  targetMatch.score2 = score2;
  targetMatch.winType = winType;
  targetMatch.roundScores = roundScores;
  targetMatch.status = 'completed';

  // Clear subsequent path first (in case of score correction)
  clearSubsequentPath(newRounds, targetRoundIdx, targetMatchIdx);

  // Recalculate propagation from the bottom up
  rebuildBracketState(newRounds);

  // Recalculate active fight numbers
  assignActiveMatchNumbers(newRounds);

  return newRounds;
}

/**
 * Clears subsequent matches if a result was updated/changed.
 */
function clearSubsequentPath(rounds, roundIdx, matchIdx) {
  let currentRoundIdx = roundIdx;
  let currentMatchIdx = matchIdx;

  while (currentRoundIdx < rounds.length - 1) {
    const currentMatch = rounds[currentRoundIdx][currentMatchIdx];
    const nextMatchIdx = Math.floor(currentMatchIdx / 2);
    const nextMatch = rounds[currentRoundIdx + 1][nextMatchIdx];

    if (currentMatchIdx % 2 === 0) {
      nextMatch.p1 = null;
    } else {
      nextMatch.p2 = null;
    }
    
    nextMatch.winnerId = null;
    nextMatch.score1 = null;
    nextMatch.score2 = null;
    nextMatch.winType = null;
    nextMatch.status = 'pending';

    currentRoundIdx++;
    currentMatchIdx = nextMatchIdx;
  }
}

/**
 * Re-propagates all winners and walkovers in the bracket.
 */
export function rebuildBracketState(rounds) {
  if (!rounds || rounds.length === 0) return;

  // Extract the original slots list from Round 0 matches
  const round0 = rounds[0];
  const slots = [];
  for (let i = 0; i < round0.length; i++) {
    slots.push(round0[i].p1);
    slots.push(round0[i].p2);
  }

  // Helper function to check if a feeding branch has any competitors in its sub-tree
  const hasCompetitorsInSubtree = (roundIdx, matchIdx) => {
    const rangeSize = Math.pow(2, roundIdx + 1);
    const startIdx = matchIdx * rangeSize;
    for (let i = startIdx; i < startIdx + rangeSize; i++) {
      if (slots[i] !== null && slots[i] !== undefined) {
        return true;
      }
    }
    return false;
  };

  // First, clear all non-round 0 player slots that depend on matches
  for (let r = 1; r < rounds.length; r++) {
    for (const match of rounds[r]) {
      match.p1 = null;
      match.p2 = null;
      if (match.status !== 'completed') {
        match.winnerId = null;
        match.status = 'pending';
      }
    }
  }

  // Re-propagate from round 0 upwards
  for (let r = 0; r < rounds.length; r++) {
    const currentRound = rounds[r];
    const nextRound = rounds[r + 1];

    for (const match of currentRound) {
      // If Round 0 has walkovers (byes) set them
      if (r === 0) {
        if (match.p1 && !match.p2) {
          match.winnerId = match.p1.id;
          match.status = 'walkover';
        } else if (!match.p1 && match.p2) {
          match.winnerId = match.p2.id;
          match.status = 'walkover';
        } else if (!match.p1 && !match.p2) {
          match.status = 'walkover';
        }
      }

      // Propagate to next round if winner exists
      if (match.winnerId && nextRound) {
        const nextMatchIdx = Math.floor(match.matchIndex / 2);
        const nextMatch = nextRound[nextMatchIdx];
        const winnerObj = match.winnerId === match.p1?.id ? match.p1 : match.p2;

        if (match.matchIndex % 2 === 0) {
          nextMatch.p1 = winnerObj;
        } else {
          nextMatch.p2 = winnerObj;
        }
      }
    }
  }

  // Second pass: detect walkovers in higher rounds where one side is a dead end (no players possible)
  for (let r = 0; r < rounds.length - 1; r++) {
    const currentRound = rounds[r];
    const nextRound = rounds[r + 1];

    for (let i = 0; i < nextRound.length; i++) {
      const nextMatch = nextRound[i];
      
      const feed1HasPlayers = hasCompetitorsInSubtree(r, i * 2);
      const feed2HasPlayers = hasCompetitorsInSubtree(r, i * 2 + 1);

      if (nextMatch.status === 'pending') {
        if (nextMatch.p1 && !feed2HasPlayers) {
          nextMatch.winnerId = nextMatch.p1.id;
          nextMatch.status = 'walkover';
        } else if (nextMatch.p2 && !feed1HasPlayers) {
          nextMatch.winnerId = nextMatch.p2.id;
          nextMatch.status = 'walkover';
        } else if (!feed1HasPlayers && !feed2HasPlayers) {
          nextMatch.status = 'walkover';
        }
      }
    }
  }

  // Final propagation pass for newly found higher-round walkovers
  for (let r = 0; r < rounds.length - 1; r++) {
    const currentRound = rounds[r];
    const nextRound = rounds[r + 1];

    for (const match of currentRound) {
      if (match.winnerId && nextRound) {
        const nextMatchIdx = Math.floor(match.matchIndex / 2);
        const nextMatch = nextRound[nextMatchIdx];
        const winnerObj = match.winnerId === match.p1?.id ? match.p1 : match.p2;

        if (match.matchIndex % 2 === 0) {
          nextMatch.p1 = winnerObj;
        } else {
          nextMatch.p2 = winnerObj;
        }
      }
    }
  }
}




