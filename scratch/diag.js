// Quick diagnostic: simulate the forward layout algorithm for different player counts
function simulate(numPlayers) {
  // Simulate bracket structure
  let m = 2;
  while (m < numPlayers) m *= 2;
  
  const numRounds = Math.log2(m);
  const rounds = [];
  let roundSize = m / 2;
  
  for (let r = 0; r < numRounds; r++) {
    const roundMatches = [];
    for (let i = 0; i < roundSize; i++) {
      let status = 'pending';
      // Simulate byes: for 5 players in 8-bracket, 3 byes
      if (r === 0) {
        const p1Slot = i * 2;
        const p2Slot = i * 2 + 1;
        const hasP1 = p1Slot < numPlayers || true; // simplified
        const hasP2 = p2Slot < numPlayers || true;
        // For simplicity, mark byes based on seeding
        if (numPlayers < m) {
          // Count byes needed
          const byes = m - numPlayers;
          // In a real bracket, byes go to top seeds
          // For simulation, just mark the last `byes` first-round matches
          if (i >= roundSize - byes) {
            status = 'walkover';
          }
        }
      }
      roundMatches.push({ matchIndex: i, status, roundIndex: r });
    }
    rounds.push(roundMatches);
    roundSize /= 2;
  }
  
  // Forward layout
  const CARD_H = 110;
  const GAP = 20;
  const SLOT = CARD_H + GAP;
  const HEADER = 50;
  
  // Position Round 0
  for (let i = 0; i < rounds[0].length; i++) {
    rounds[0][i].y = HEADER + i * SLOT;
  }
  
  // Position subsequent rounds
  for (let r = 1; r < rounds.length; r++) {
    for (let i = 0; i < rounds[r].length; i++) {
      const topChild = rounds[r - 1][i * 2];
      const botChild = rounds[r - 1][i * 2 + 1];
      
      if (!topChild || !botChild) {
        rounds[r][i].y = HEADER;
        continue;
      }
      
      const topActive = topChild.status !== 'walkover';
      const botActive = botChild.status !== 'walkover';
      
      if (topActive && botActive) {
        rounds[r][i].y = (topChild.y + botChild.y) / 2;
      } else if (topActive) {
        rounds[r][i].y = topChild.y;
      } else if (botActive) {
        rounds[r][i].y = botChild.y;
      } else {
        rounds[r][i].y = (topChild.y + botChild.y) / 2;
      }
    }
  }
  
  const colHeight = Math.max(480, HEADER + rounds[0].length * SLOT + 160);
  
  console.log(`\n=== ${numPlayers} players (bracket size ${m}, ${numRounds} rounds) ===`);
  console.log(`Column height: ${colHeight}px`);
  for (let r = 0; r < rounds.length; r++) {
    console.log(`Round ${r}:`);
    for (const match of rounds[r]) {
      console.log(`  Match ${match.matchIndex}: y=${match.y}, status=${match.status}`);
    }
  }
}

simulate(4);
simulate(5);
simulate(8);
simulate(3);
