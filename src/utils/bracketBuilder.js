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
export function generateBracket(competitors) {
  if (!competitors || competitors.length === 0) return [];

  const n = competitors.length;
  // Find next power of 2
  let m = 2;
  while (m < n) {
    m *= 2;
  }

  // Get standard seeding order slots
  const seedingOrder = getSeedingOrder(m);

  // Map competitors to their seeding slots
  const slots = Array(m).fill(null);

  // Fisher-Yates shuffle the entire pool of competitors so clicking Regenerate always creates fresh matches
  const shuffledComps = [...competitors];
  for (let i = shuffledComps.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledComps[i], shuffledComps[j]] = [shuffledComps[j], shuffledComps[i]];
  }

  // Distribute the shuffled competitors into the seeding slots
  // This spaces out the initial matches and distributes byes nicely
  for (let i = 0; i < n; i++) {
    // Standard seeding order determines where each entrant goes
    const slotIdx = seedingOrder.indexOf(i + 1);
    if (slotIdx !== -1) {
      slots[slotIdx] = shuffledComps[i];
    } else {
      slots[i] = shuffledComps[i];
    }
  }

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
export function updateMatchScore(rounds, matchId, winnerId, score1, score2, winType) {
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

/**
 * Extracts the competitors who lost to a specific finalist.
 * Used for building the Double Bronze Repechage brackets.
 */
export function getLosersTo(finalistId, rounds) {
  if (!finalistId || !rounds) return [];
  const losers = [];

  // Traverse rounds from 0 upwards to find matches involving the finalist
  for (let r = 0; r < rounds.length; r++) {
    for (const match of rounds[r]) {
      if (match.status === 'completed' && (match.p1?.id === finalistId || match.p2?.id === finalistId)) {
        const isWinner = match.winnerId === finalistId;
        if (isWinner) {
          const loser = match.p1.id === finalistId ? match.p2 : match.p1;
          if (loser) {
            losers.push({
              competitor: loser,
              lostInRound: r,
            });
          }
        }
      }
    }
  }
  return losers;
}

/**
 * Builds the Double Bronze Repechage bracket for a division.
 */
export function buildRepechageBrackets(rounds) {
  const finalRound = rounds[rounds.length - 1];
  if (!finalRound || finalRound.length === 0) return null;

  const finalMatch = finalRound[0];
  if (finalMatch.status !== 'completed') {
    return null;
  }

  const finalistA = finalMatch.p1;
  const finalistB = finalMatch.p2;

  if (!finalistA || !finalistB) return null;

  const losersToA = getLosersTo(finalistA.id, rounds);
  const losersToB = getLosersTo(finalistB.id, rounds);

  return {
    bracketA: generateRepechageTree(losersToA, finalistA, 'A'),
    bracketB: generateRepechageTree(losersToB, finalistB, 'B'),
  };
}

function generateRepechageTree(losers, finalist, side) {
  if (losers.length === 0) return [];
  if (losers.length === 1) {
    return [{
      id: `rep_${side}_final`,
      p1: losers[0].competitor,
      p2: null,
      score1: null,
      score2: null,
      winnerId: losers[0].competitor.id,
      status: 'walkover',
      title: 'Bronze Medal Match',
    }];
  }

  const sortedLosers = [...losers].sort((a, b) => a.lostInRound - b.lostInRound);

  const matches = [];
  let currentP1 = sortedLosers[0].competitor;

  for (let i = 1; i < sortedLosers.length; i++) {
    const nextLoser = sortedLosers[i].competitor;
    const isLast = i === sortedLosers.length - 1;

    matches.push({
      id: `rep_${side}_${i - 1}`,
      p1: currentP1,
      p2: nextLoser,
      score1: null,
      score2: null,
      winnerId: null,
      status: 'pending',
      title: isLast ? 'Bronze Medal Match' : `Repechage Round ${i}`,
    });

    currentP1 = { id: `rep_winner_${side}_${i - 1}`, name: `Winner of ${isLast ? 'Bronze Match' : 'Repechage Round ' + i}` };
  }

  return matches;
}
