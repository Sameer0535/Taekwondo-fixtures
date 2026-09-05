import { useState, useRef, useEffect, useMemo } from 'react';
import MatchModal from './MatchModal';
import { updateMatchScore, assignActiveMatchNumbers, rebuildBracketState } from '../utils/bracketBuilder';
import { nocToIso } from '../utils/countries';

// Helper to draw a perfect step path with rounded corners
const getStepPath = (x1, y1, x2, y2) => {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  if (dy < 2) {
    return `M ${x1} ${y1} H ${x2}`;
  }

  const xmid = (x1 + x2) / 2;
  const r = Math.min(8, dy / 2, dx / 2);
  const isGoingDown = y2 > y1;
  const vertDir = isGoingDown ? 1 : -1;

  const y1_corner = y1 + r * vertDir;
  const y2_corner = y2 - r * vertDir;

  return `M ${x1} ${y1} H ${xmid - r} Q ${xmid} ${y1}, ${xmid} ${y1_corner} V ${y2_corner} Q ${xmid} ${y2}, ${xmid + r} ${y2} H ${x2}`;
};

function BracketView({ divisionId, divisionName, courtNo, rounds, setBrackets, onRegenerate, hideHeaderTitle = false }) {
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Hover Path Tracking State
  const [hoveredCompetitorId, setHoveredCompetitorId] = useState(null);

  // Zoom & Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Layout constants — MUST stay in sync with CSS card dimensions
  // CSS: .match-info-bar height: 24px (box-sizing: border-box)
  // CSS: .match-competitor height: 38px × 2 rows (box-sizing: border-box)
  // Total card height: 24 + 38 + 38 = 100px  ✓
  const CARD_H = 100;
  const GAP = 14;        // visible gap between adjacent cards
  const SLOT = CARD_H + GAP;   // 114px per leaf slot
  const HEADER = 50;     // space for round header above first card
  const COL_W = 260;     // bracket-round column width
  const COL_GAP = 64;    // gap between round columns (4rem)
  const COL_STEP = COL_W + COL_GAP;  // 324px per column step
  const MARGIN = 48;     // outer margin around the bracket area

  // Sub-element Y offsets — pixel-perfect centers of each section
  const INFO_BAR_H = 24;                             // 24px info bar
  const ROW_H = 38;                                  // 38px per competitor row
  const CARD_MID = CARD_H / 2;                       // 50 — center of whole card
  const BLUE_SLOT_MID = INFO_BAR_H + ROW_H / 2;     // 43 — center of blue row
  const RED_SLOT_MID = INFO_BAR_H + ROW_H + ROW_H / 2; // 81 — center of red row

  // Dynamic tree positioning layout logic — Forward (leaves → root) approach
  // This guarantees no card overlaps by spacing leaf cards first, then centering parents.
  const { processedRounds, columnHeight, containerWidth } = useMemo(() => {
    if (!rounds || rounds.length === 0) return { processedRounds: [], columnHeight: 400, containerWidth: 400 };
    
    const cloned = JSON.parse(JSON.stringify(rounds));
    // Fail-safe: dynamically assign match numbers so old loaded storage brackets also have them
    assignActiveMatchNumbers(cloned);
    const totalRounds = cloned.length;
    
    // 1. Position Round 0 (leaf) matches evenly from the top
    for (let m = 0; m < cloned[0].length; m++) {
      cloned[0][m].y = MARGIN + HEADER + m * SLOT;
    }
    
    // 2. Each subsequent round: center between its two children
    for (let r = 1; r < totalRounds; r++) {
      for (let m = 0; m < cloned[r].length; m++) {
        const topChild = cloned[r - 1][m * 2];
        const botChild = cloned[r - 1][m * 2 + 1];
        
        if (!topChild || !botChild) {
          cloned[r][m].y = MARGIN + HEADER;
          continue;
        }
        
        const topActive = topChild.status !== 'walkover';
        const botActive = botChild.status !== 'walkover';
        
        if (topActive && botActive) {
          // Both children are real matches — center parent between them
          cloned[r][m].y = (topChild.y + botChild.y) / 2;
        } else if (topActive && !botActive) {
          // Only top child feeds — align parent with top child
          cloned[r][m].y = topChild.y;
        } else if (!topActive && botActive) {
          // Only bottom child feeds — align parent with bottom child
          cloned[r][m].y = botChild.y;
        } else {
          // Both are walkovers — center anyway
          cloned[r][m].y = (topChild.y + botChild.y) / 2;
        }
      }
    }
    
    // Container dimensions include margins on all sides - tighter padding for printing
    const colHeight = Math.max(480, MARGIN + HEADER + (cloned[0].length - 1) * SLOT + CARD_H + MARGIN);
    const contWidth = MARGIN + totalRounds * COL_W + (totalRounds - 1) * COL_GAP + MARGIN;
    
    return { processedRounds: cloned, columnHeight: colHeight, containerWidth: contWidth };
  }, [rounds]);

  // Reset zoom & pan and automatically fit scale to device width (Auto-fit layout on load)
  useEffect(() => {
    setHoveredCompetitorId(null);
    setPosition({ x: 0, y: 0 });
    
    const screenWidth = window.innerWidth;
    const padding = 48; // container padding margins
    const availableWidth = screenWidth - padding;
    
    if (containerWidth > 0 && availableWidth < containerWidth) {
      // Scale down to fit the available screen width (down to a minimum scale of 0.4)
      const fitScale = Math.max(0.4, availableWidth / containerWidth);
      setScale(fitScale);
    } else {
      setScale(0.95); // comfortable default scale on desktop
    }
  }, [divisionId, containerWidth]);



  // Zoom Handler
  const handleZoom = (factor) => {
    setScale(prev => Math.max(0.4, Math.min(2.5, prev * factor)));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Drag Handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.btn') || e.target.closest('.match-card') || e.target.closest('select')) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Drag Handlers for Mobile & Tablet Support
  const handleTouchStart = (e) => {
    if (e.target.closest('.btn') || e.target.closest('.match-card') || e.target.closest('select')) return;
    const touch = e.touches[0];
    if (!touch) return;
    setIsDragging(true);
    dragStart.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    if (!touch) return;
    setPosition({
      x: touch.clientX - dragStart.current.x,
      y: touch.clientY - dragStart.current.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    // Only zoom when Ctrl key is held down to prevent annoying scroll interception
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
      handleZoom(zoomFactor);
    }
  };

  // Update score in main bracket
  const handleSaveScore = (winnerId, score1, score2, winType, roundScores) => {
    if (!selectedMatch) return;
    
    setBrackets(prev => {
      const currentRounds = prev[divisionId];
      const updated = updateMatchScore(currentRounds, selectedMatch.id, winnerId, score1, score2, winType, roundScores);
      return {
        ...prev,
        [divisionId]: updated
      };
    });
    
    setSelectedMatch(null);
  };

  // Drag and Drop Player Seeding Swap Handlers
  const isBracketStarted = rounds.some(round => round.some(m => m.status === 'completed'));
  const isDragEnabled = !isBracketStarted;

  const handleDragStart = (e, competitorId) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ competitorId }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetCompetitorId) => {
    e.preventDefault();
    if (!isDragEnabled) return;

    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (!dataStr) return;
      const { competitorId: sourceCompetitorId } = JSON.parse(dataStr);

      if (sourceCompetitorId === targetCompetitorId) return;

      setBrackets(prev => {
        const currentRounds = prev[divisionId];
        // Clone bracket state
        const clonedRounds = JSON.parse(JSON.stringify(currentRounds));
        const round0 = clonedRounds[0];

        // Find original Round 0 slots for both competitor IDs
        const findSlot = (compId) => {
          for (const m of round0) {
            if (m.p1 && m.p1.id === compId) {
              return { match: m, key: 'p1' };
            }
            if (m.p2 && m.p2.id === compId) {
              return { match: m, key: 'p2' };
            }
          }
          return null;
        };

        const sourceSlot = findSlot(sourceCompetitorId);
        const targetSlot = findSlot(targetCompetitorId);

        if (!sourceSlot || !targetSlot) return prev;

        // Perform the swap of competitor objects in their original Round 0 matches
        const sourcePlayer = sourceSlot.match[sourceSlot.key];
        const targetPlayer = targetSlot.match[targetSlot.key];

        sourceSlot.match[sourceSlot.key] = targetPlayer;
        targetSlot.match[targetSlot.key] = sourcePlayer;

        // Rebuild walkovers, active fight numbers, and propagate
        rebuildBracketState(clonedRounds);
        assignActiveMatchNumbers(clonedRounds);

        return {
          ...prev,
          [divisionId]: clonedRounds
        };
      });
    } catch (err) {
      console.error("Drag and drop swap failed", err);
    }
  };

  // Get names of rounds (matching the screenshot style)
  const getRoundHeader = (rIndex, totalRounds) => {
    const remaining = totalRounds - 1 - rIndex;
    if (remaining === 0) return "Final";
    if (remaining === 1) return "Semifinal";
    if (remaining === 2) return "Quarterfinal";
    return `Round of ${Math.pow(2, remaining + 1)}`;
  };

  // Helper to map competitors to their flag country code
  const getFlagCode = (comp) => {
    if (!comp) return null;
    if (comp.country) {
      return nocToIso(comp.country);
    }
    
    // Guess based on club name for backwards compatibility
    const clubName = comp.club || '';
    const club = clubName.toLowerCase();
    if (club.includes('seoul') || club.includes('incheon')) return 'kr';
    if (club.includes('madrid')) return 'es';
    if (club.includes('istanbul')) return 'tr';
    if (club.includes('amman')) return 'jo';
    if (club.includes('manchester')) return 'gb';
    if (club.includes('cairo')) return 'eg';
    if (club.includes('karaj')) return 'ir';
    if (club.includes('rostov')) return 'ru';
    if (club.includes('montreal')) return 'ca';
    if (club.includes('roma')) return 'it';
    if (club.includes('qatar') || club.includes('podar pearl')) return 'qa';
    if (club.includes('international') || club.includes('dubai')) return 'ae';
    return 'in'; // default India flag code
  };
  // Determine if tournament is complete
  const finalRound = rounds[rounds.length - 1];
  const finalMatch = finalRound?.[0];
  const isMainComplete = finalMatch?.status === 'completed';
  // Podium ranks calculation
  const getPodium = () => {
    const first = (finalMatch?.status === 'completed' && finalMatch.winnerId) ? (finalMatch.winnerId === finalMatch.p1?.id ? finalMatch.p1 : finalMatch.p2) : null;
    const second = (finalMatch?.status === 'completed' && finalMatch.winnerId) ? (finalMatch.winnerId === finalMatch.p1?.id ? finalMatch.p2 : finalMatch.p1) : null;
    
    let bronze1 = null;
    let bronze2 = null;

    const semiRound = rounds[rounds.length - 2];
    if (semiRound) {
      const m1 = semiRound[0];
      const m2 = semiRound[1];
      
      if (m1 && m1.winnerId) {
        const loser = m1.winnerId === m1.p1?.id ? m1.p2 : m1.p1;
        if (loser && loser.name) {
          bronze1 = loser;
        }
      }
      if (m2 && m2.winnerId) {
        const loser = m2.winnerId === m2.p1?.id ? m2.p2 : m2.p1;
        if (loser && loser.name) {
          bronze2 = loser;
        }
      }
    }

    return { first, second, bronze1, bronze2 };
  };

  // Helper to calculate feeding placeholder labels (e.g. W1, W12)
  const getFeedingPlaceholder = (isP1, match) => {
    if (match.roundIndex === 0) return 'TBD';
    const mIdx = match.originalMatchIndex !== undefined ? match.originalMatchIndex : match.matchIndex;
    const feedingMatchIndex = mIdx * 2 + (isP1 ? 0 : 1);
    const feedingMatch = rounds[match.roundIndex - 1]?.[feedingMatchIndex];
    return feedingMatch ? `W${feedingMatch.matchNo}` : 'TBD';
  };

  const getMatchTooltip = (match) => {
    if (match.status !== 'completed') return 'Click to score match';
    if (!match.roundScores) return `${match.winType} Win (Score: ${match.score1}-${match.score2})`;
    const roundsStr = match.roundScores
      .map((r, i) => {
        if (r.blue === null || r.red === null) return null;
        return `R${i + 1}: ${r.blue}-${r.red}`;
      })
      .filter(Boolean)
      .join(', ');
    return `${match.winType} Win (${roundsStr || `${match.score1}-${match.score2}`})`;
  };

  // Helper to generate dynamic classes for competitors
  const getCompetitorClass = (match, comp, corner) => {
    if (!comp) return `match-competitor ${corner}-corner`;
    let classes = `match-competitor competitor-row ${corner}-corner`;
    
    if (hoveredCompetitorId === comp.id) {
      classes += ' highlighted';
    }
    
    if (match.status === 'completed' || match.status === 'walkover') {
      if (match.winnerId === comp.id) {
        classes += ' winner winner-bold';
      } else if (match.winnerId) {
        classes += ' loser strikethrough-loser';
      }
    }
    return classes;
  };

  const podium = getPodium();
  const semiRound = rounds[rounds.length - 2];
  const numSemiMatches = semiRound ? semiRound.filter(m => m.status !== 'walkover').length : 0;

  const isLargeBracket = rounds[0] && rounds[0].length > 8;

  // ── Compact print-specific layout constants ──
  // Constants tuned for zero bottom cutoff, clean right margin space, and crisp readability
  const P_CARD_H = 60;      // 14px info + 23px blue + 23px red
  const P_GAP = 6;
  const P_SLOT = P_CARD_H + P_GAP;  // 66px
  const P_COL_W = 205;      // Column width leaving a clean margin on the right side
  const P_COL_GAP = 22;
  const P_COL_STEP = P_COL_W + P_COL_GAP; // 227px
  const P_MARGIN = 10;
  const P_HEADER = 20;
  const P_INFO_BAR_H = 14;
  const P_ROW_H = 23;
  const P_CARD_MID = P_CARD_H / 2; // 30
  const P_BLUE_MID = P_INFO_BAR_H + P_ROW_H / 2; // 14 + 11.5 = 25.5
  const P_RED_MID = P_INFO_BAR_H + P_ROW_H + P_ROW_H / 2; // 14 + 23 + 11.5 = 48.5

  const printPages = useMemo(() => {
    if (!isLargeBracket) return [];
    if (!rounds || rounds.length === 0) return [];

    const totalRounds = rounds.length;
    if (totalRounds < 3) return [];

    // Helper: lay out a sub-bracket from scratch with compact coordinates
    const layoutPool = (matchesByRound) => {
      const laid = matchesByRound.map(round => round.map(m => ({ ...m })));
      // Position round 0 leaves sequentially for visible matches (equal spacing, no blank gaps)
      let visibleCount = 0;
      for (let i = 0; i < laid[0].length; i++) {
        if (laid[0][i].status === 'walkover') {
          laid[0][i].py = P_MARGIN + P_HEADER;
        } else {
          laid[0][i].py = P_MARGIN + P_HEADER + visibleCount * P_SLOT;
          visibleCount++;
        }
      }
      // Center parent rounds matching active vs walkover feeder logic
      for (let r = 1; r < laid.length; r++) {
        for (let m = 0; m < laid[r].length; m++) {
          const topChild = laid[r - 1][m * 2];
          const botChild = laid[r - 1][m * 2 + 1];

          const topActive = topChild && topChild.status !== 'walkover';
          const botActive = botChild && botChild.status !== 'walkover';

          if (topActive && botActive) {
            laid[r][m].py = (topChild.py + botChild.py) / 2;
          } else if (topActive) {
            laid[r][m].py = topChild.py;
          } else if (botActive) {
            laid[r][m].py = botChild.py;
          } else {
            laid[r][m].py = P_MARGIN + P_HEADER + m * P_SLOT * Math.pow(2, r);
          }
        }
      }
      // Generate lines
      const lines = [];
      for (let r = 0; r < laid.length - 1; r++) {
        for (const match of laid[r]) {
          if (r === 0 && match.status === 'walkover') continue;
          const isTop = match.matchIndex % 2 === 0;
          const nextIdx = Math.floor(match.matchIndex / 2);
          const next = laid[r + 1][nextIdx];
          if (!next) continue;
          const x1 = P_MARGIN + r * P_COL_STEP + P_COL_W;
          const x2 = P_MARGIN + (r + 1) * P_COL_STEP;
          const y1 = match.py + P_CARD_MID;
          const y2 = next.py + (isTop ? P_BLUE_MID : P_RED_MID);
          lines.push({ d: getStepPath(x1, y1, x2, y2) });
        }
      }
      const leafCount = Math.max(1, visibleCount);
      const height = P_MARGIN + P_HEADER + leafCount * P_SLOT + P_MARGIN;
      const width = P_MARGIN * 2 + laid.length * P_COL_STEP;
      return { rounds: laid, lines, height, width };
    };

    // Slice rounds into Pool A (top half → QF) and Pool B (bottom half → QF)
    const poolARoundData = [];
    const poolBRoundData = [];
    for (let r = 0; r < totalRounds - 2; r++) {
      const rnd = processedRounds[r];
      const half = rnd.length / 2;
      // Re-index matchIndex for Pool A starting from 0, preserving originalMatchIndex
      poolARoundData.push(rnd.slice(0, half).map((m, i) => ({ ...m, originalMatchIndex: m.matchIndex, matchIndex: i })));
      // Re-index matchIndex for Pool B starting from 0, preserving originalMatchIndex
      poolBRoundData.push(rnd.slice(half).map((m, i) => ({ ...m, originalMatchIndex: m.matchIndex, matchIndex: i })));
    }

    const poolA = layoutPool(poolARoundData);
    const poolB = layoutPool(poolBRoundData);

    // Finals: Semifinals + Final with compact layout, preserving originalMatchIndex
    const semiMatches = processedRounds[totalRounds - 2].map((m, i) => ({ ...m, originalMatchIndex: m.matchIndex, matchIndex: i }));
    const finalMatch = { ...processedRounds[totalRounds - 1][0], originalMatchIndex: processedRounds[totalRounds - 1][0].matchIndex, matchIndex: 0 };
    const finalsData = [[...semiMatches], [finalMatch]];
    const finals = layoutPool(finalsData);

    return [
      { name: "Pool A", ...poolA, totalRoundsCount: totalRounds },
      { name: "Pool B", ...poolB, totalRoundsCount: totalRounds },
      { name: "Finals & Semifinals", ...finals, isFinals: true, totalRoundsCount: totalRounds }
    ];
  }, [processedRounds, isLargeBracket, rounds]);



  // Collect and generate curved & straight connection lines
  // SVG coordinates use the SAME absolute coordinate space as the card positions.
  // Cards are at (MARGIN + r * COL_STEP, match.y) — SVG lines connect between columns.
  const lines = useMemo(() => {
    if (processedRounds.length === 0) return [];
    const collected = [];

    for (let r = 0; r < processedRounds.length - 1; r++) {
      const round = processedRounds[r];
      const nextRound = processedRounds[r + 1];

      for (const match of round) {
        if (match.status === 'walkover') continue;

        const nextMatchIdx = Math.floor(match.matchIndex / 2);
        const nextMatch = nextRound[nextMatchIdx];
        if (!nextMatch || nextMatch.status === 'walkover') continue;

        const isTopBranch = match.matchIndex % 2 === 0;

        // X: right edge of source card → left edge of target card
        // Card left edge = MARGIN + r * COL_STEP, right edge = + COL_W
        const x1 = MARGIN + r * COL_STEP + COL_W;
        const x2 = MARGIN + (r + 1) * COL_STEP;

        // Y: center of source card → center of target slot (blue or red)
        // match.y already includes MARGIN + HEADER offsets
        const y1 = match.y + CARD_MID;
        const y2 = nextMatch.y + (isTopBranch ? BLUE_SLOT_MID : RED_SLOT_MID);

        // Check if sibling branch is also active (determines curve vs straight line)
        const partnerIdx = isTopBranch ? match.matchIndex + 1 : match.matchIndex - 1;
        const partner = round[partnerIdx];
        const partnerActive = partner && partner.status !== 'walkover';

        // getStepPath handles both cases:
        //  • paired feeds: step curve (y1 = source center, y2 = target slot center)
        //  • single feed:  small step or straight if aligned (same logic applies)
        const d = getStepPath(x1, y1, x2, y2);

        const highlighted = hoveredCompetitorId && (
          (match.p1?.id === hoveredCompetitorId && match.winnerId === match.p1.id) ||
          (match.p2?.id === hoveredCompetitorId && match.winnerId === match.p2.id)
        );

        collected.push({ d, highlighted });
      }
    }

    return collected;
  }, [processedRounds, hoveredCompetitorId]);

  return (
    <div>
      <div className="no-print bracket-header" style={{ justifyContent: hideHeaderTitle ? 'flex-end' : 'space-between' }}>
        {!hideHeaderTitle && (
          <h4 style={{ color: 'var(--text-muted)', margin: 0 }}>{divisionName}{courtNo ? ` - Court ${courtNo}` : ''} Bracket</h4>
        )}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onRegenerate && (
            <button className="btn btn-secondary btn-sm" onClick={onRegenerate} title="Re-shuffle bracket and separate same-academy players">
              Regenerate / Shuffle
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => handleZoom(1.15)}>Zoom +</button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleZoom(0.85)}>Zoom -</button>
          <button className="btn btn-secondary btn-sm" onClick={handleResetZoom}>Reset View</button>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>Print / Save PDF</button>
        </div>
      </div>

      {/* Print-only header for small brackets */}
      {!isLargeBracket && (
        <div className="print-only-header" style={{ marginBottom: '1rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--primary)' }}>
            {divisionName}{courtNo ? ` - Court ${courtNo}` : ''}
          </h2>
        </div>
      )}

      {/* Main Bracket Canvas */}
      <div 
        className={`bracket-wrapper ${isLargeBracket ? 'large-bracket-screen' : ''}`}
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div 
          className="bracket-container"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease',
            width: `${containerWidth}px`,
            height: `${columnHeight}px`,
            position: 'relative',
            padding: 0,
            '--print-zoom': String(Math.min(1.0, 1040 / containerWidth, 680 / columnHeight))
          }}
        >
          {/* SVG Bracket lines layer — same coordinate space as cards */}
          <svg 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${containerWidth}px`,
              height: `${columnHeight}px`,
              pointerEvents: 'none',
              zIndex: 0
            }}
          >
            {lines.map((line, idx) => (
              <path 
                key={idx}
                d={line.d}
                stroke={line.highlighted ? 'var(--primary)' : '#cbd5e1'}
                strokeWidth={line.highlighted ? '2.5' : '2'}
                fill="none"
                style={{
                  transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
                  filter: line.highlighted ? 'drop-shadow(0 0 3px var(--primary-glow))' : 'none'
                }}
              />
            ))}
          </svg>

          {processedRounds.map((round, rIndex) => (
            <div 
              key={rIndex} 
              className="bracket-round"
              style={{
                position: 'absolute',
                left: `${MARGIN + rIndex * COL_STEP}px`,
                top: 0,
                width: `${COL_W}px`,
                height: `${columnHeight}px`,
                zIndex: 1
              }}
            >
              <div className="round-header" style={{ position: 'absolute', top: `${MARGIN}px`, left: 0, width: '100%' }}>
                {getRoundHeader(rIndex, processedRounds.length)}
              </div>
              
              {round.map((match) => {
                const isWalkover = match.status === 'walkover';
                if (isWalkover) return null; // Do not render walkover bye wrappers/cards in DOM

                const isTopBranch = match.matchIndex % 2 === 0;
                
                const hasHoveredComp = hoveredCompetitorId && (
                  match.p1?.id === hoveredCompetitorId || 
                  match.p2?.id === hoveredCompetitorId
                );

                const flagCodeP1 = getFlagCode(match.p1);
                const flagCodeP2 = getFlagCode(match.p2);

                return (
                  <div 
                    key={match.id}
                    className={`match-wrapper ${isTopBranch ? 'match-top' : 'match-bottom'} ${hasHoveredComp ? 'path-highlighted' : ''}`}
                    style={{ 
                      position: 'absolute',
                      top: `${match.y}px`,
                      left: 0,
                      width: '260px',
                      height: `${CARD_H}px`
                    }}
                  >
                    <div 
                      className={`match-card ${hasHoveredComp ? 'path-highlighted' : ''}`}
                      onClick={() => {
                        setSelectedMatch(match);
                      }}
                      title={getMatchTooltip(match)}
                    >
                      {/* Top label: Match Number + Round Name */}
                      <div className="match-info-bar">
                        <span>Match {match.matchNo} • {getRoundHeader(match.roundIndex, processedRounds.length)}</span>
                        {match.status === 'completed' && (
                          <span className="badge badge-blue" style={{ fontSize: '0.6rem', padding: '0 0.2rem' }}>
                            {match.winType}
                          </span>
                        )}
                      </div>
                      
                      <>
                        {/* Blue Corner Row */}
                        <div 
                          className={`${getCompetitorClass(match, match.p1, 'blue')} ${isDragEnabled && match.p1 !== null ? 'draggable-comp' : ''}`}
                          onMouseEnter={() => match.p1 && setHoveredCompetitorId(match.p1.id)}
                          onMouseLeave={() => setHoveredCompetitorId(null)}
                          draggable={isDragEnabled && match.p1 !== null}
                          onDragStart={isDragEnabled && match.p1 !== null ? (e) => handleDragStart(e, match.p1.id) : undefined}
                          onDragOver={isDragEnabled ? handleDragOver : undefined}
                          onDrop={isDragEnabled && match.p1 !== null ? (e) => handleDrop(e, match.p1.id) : undefined}
                        >
                          <div className="comp-bar blue-bar"></div>
                          
                          <div style={{ flex: 1, paddingLeft: '0.75rem', overflow: 'hidden' }}>
                            <div className="comp-name-line">
                              {match.p1 ? match.p1.name : getFeedingPlaceholder(true, match)}
                            </div>
                            {match.p1 && <div className="comp-club-line">{match.p1.club}</div>}
                          </div>

                          {match.p1 && flagCodeP1 && (
                            <div className="comp-flag-box">
                              <img 
                                src={`https://flagcdn.com/w40/${flagCodeP1}.png`} 
                                alt={flagCodeP1.toUpperCase()} 
                                style={{ width: '18px', height: '12px', display: 'block', borderRadius: '1px', objectFit: 'cover' }}
                              />
                            </div>
                          )}

                          {match.status === 'completed' && match.score1 !== null && (
                            <span className="match-score blue-score">{match.score1}</span>
                          )}
                        </div>

                        {/* Red Corner Row */}
                        <div 
                          className={`${getCompetitorClass(match, match.p2, 'red')} ${isDragEnabled && match.p2 !== null ? 'draggable-comp' : ''}`}
                          onMouseEnter={() => match.p2 && setHoveredCompetitorId(match.p2.id)}
                          onMouseLeave={() => setHoveredCompetitorId(null)}
                          draggable={isDragEnabled && match.p2 !== null}
                          onDragStart={isDragEnabled && match.p2 !== null ? (e) => handleDragStart(e, match.p2.id) : undefined}
                          onDragOver={isDragEnabled ? handleDragOver : undefined}
                          onDrop={isDragEnabled && match.p2 !== null ? (e) => handleDrop(e, match.p2.id) : undefined}
                        >
                          <div className="comp-bar red-bar"></div>
                          
                          <div style={{ flex: 1, paddingLeft: '0.75rem', overflow: 'hidden' }}>
                            <div className="comp-name-line">
                              {match.p2 ? match.p2.name : getFeedingPlaceholder(false, match)}
                            </div>
                            {match.p2 && <div className="comp-club-line">{match.p2.club}</div>}
                          </div>

                          {match.p2 && flagCodeP2 && (
                            <div className="comp-flag-box">
                              <img 
                                src={`https://flagcdn.com/w40/${flagCodeP2}.png`} 
                                alt={flagCodeP2.toUpperCase()} 
                                style={{ width: '18px', height: '12px', display: 'block', borderRadius: '1px', objectFit: 'cover' }}
                              />
                            </div>
                          )}

                          {match.status === 'completed' && match.score2 !== null && (
                            <span className="match-score red-score">{match.score2}</span>
                          )}
                        </div>
                      </>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Floating Standings block (stays fixed in the bottom-right corner of the scroll viewport window, unaffected by pan/zoom) */}
        {podium && (
          <div className="standings-box standings-interactive no-print" style={{ 
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '260px', 
            border: '1px solid var(--border-color)', 
            borderRadius: '6px', 
            backgroundColor: 'white',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            zIndex: 10
          }}>
            <table className="custom-table" style={{ fontSize: '0.8rem' }}>
              <tbody>
                <tr>
                  <td style={{ width: '45px', fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>1st</td>
                  <td style={{ padding: '0.4rem 0.75rem', fontWeight: podium.first ? 'bold' : 'normal' }}>
                    {podium.first?.name || ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>2nd</td>
                  <td style={{ padding: '0.4rem 0.75rem' }}>
                    {podium.second?.name || ''}
                  </td>
                </tr>
                {numSemiMatches >= 1 && (
                  <tr>
                    <td style={{ fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>3rd</td>
                    <td style={{ padding: '0.4rem 0.75rem' }}>
                      {podium.bronze1?.name || ''}
                    </td>
                  </tr>
                )}
                {numSemiMatches >= 2 && (
                  <tr>
                    <td style={{ fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>3rd</td>
                    <td style={{ padding: '0.4rem 0.75rem' }}>
                      {podium.bronze2?.name || ''}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Duplicate copy for print layout - rendered outside zoomed bracket-container so it can escape container bounds and use position: fixed relative to paper boundary */}
        {!isLargeBracket && podium && (
          <div className="standings-box standings-print" style={{ 
            width: '260px', 
            border: '1px solid var(--border-color)', 
            borderRadius: '6px', 
            backgroundColor: 'white',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <table className="custom-table" style={{ fontSize: '0.8rem' }}>
              <tbody>
                <tr>
                  <td style={{ width: '45px', fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>1st</td>
                  <td style={{ padding: '0.4rem 0.75rem', fontWeight: podium.first ? 'bold' : 'normal' }}>
                    {podium.first?.name || ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>2nd</td>
                  <td style={{ padding: '0.4rem 0.75rem' }}>
                    {podium.second?.name || ''}
                  </td>
                </tr>
                {numSemiMatches >= 1 && (
                  <tr>
                    <td style={{ fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>3rd</td>
                    <td style={{ padding: '0.4rem 0.75rem' }}>
                      {podium.bronze1?.name || ''}
                    </td>
                  </tr>
                )}
                {numSemiMatches >= 2 && (
                  <tr>
                    <td style={{ fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>3rd</td>
                    <td style={{ padding: '0.4rem 0.75rem' }}>
                      {podium.bronze2?.name || ''}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print-only split pages layout for large brackets */}
      {isLargeBracket && printPages.map((page, pIdx) => {
        // Safe printable area in landscape A4 paper
        const PRINT_SAFE_W = 980;
        const PRINT_SAFE_H = 590;
        const scaleVal = Math.min(1.0, PRINT_SAFE_W / page.width, PRINT_SAFE_H / page.height);
        return (
          <div key={pIdx} className="print-only-page print-page" style={{ position: 'relative', minHeight: '100%', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '0.4rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                {divisionName}{courtNo ? ` - Court ${courtNo}` : ''} — {page.name}
              </h3>
            </div>
            
            <div 
              style={{ 
                position: 'relative', 
                width: `${page.width}px`, 
                height: `${page.height}px`,
                transform: `scale(${scaleVal})`,
                transformOrigin: 'top left'
              }}
            >
              <svg 
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'
                }}
              >
                {page.lines.map((line, idx) => (
                  <path key={idx} d={line.d} stroke="#94a3b8" strokeWidth="1.75" fill="none" />
                ))}
              </svg>

              {page.rounds.map((round, rIndex) => (
                <div 
                  key={rIndex}
                  style={{
                    position: 'absolute', top: 0,
                    left: `${P_MARGIN + rIndex * P_COL_STEP}px`,
                    width: `${P_COL_W}px`, height: '100%'
                  }}
                >
                  <div style={{ position: 'absolute', top: `${P_MARGIN}px`, left: 0, width: '100%', fontWeight: 'bold', fontSize: '0.66rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {page.isFinals
                      ? (rIndex === 0 ? "Semifinals" : "Final") 
                      : getRoundHeader(rIndex, page.totalRoundsCount)}
                  </div>

                  {round.map((match) => {
                    if (rIndex === 0 && match.status === 'walkover') return null;
                    const flagCodeP1 = getFlagCode(match.p1);
                    const flagCodeP2 = getFlagCode(match.p2);
                    return (
                      <div 
                        key={match.id}
                        style={{ 
                          position: 'absolute', top: `${match.py}px`, left: 0,
                          width: `${P_COL_W}px`, height: `${P_CARD_H}px`
                        }}
                      >
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                          {/* Info bar: Match # • Round */}
                          <div style={{ height: `${P_INFO_BAR_H}px`, padding: '0 8px', fontSize: '0.55rem', backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#334155', fontWeight: 'bold' }}>
                            <span>Match {match.matchNo} • {getRoundHeader(match.roundIndex, processedRounds.length)}</span>
                            {match.status === 'completed' && <span style={{ fontSize: '0.45rem', textTransform: 'uppercase' }}>{match.winType}</span>}
                          </div>

                          {/* Blue corner */}
                          <div style={{ height: `${P_ROW_H}px`, padding: '1px 8px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #e2e8f0', position: 'relative', backgroundColor: match.winnerId && match.p1?.id === match.winnerId ? '#eff6ff' : 'white' }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#2563eb' }}></div>
                            <div style={{ flex: 1, overflow: 'hidden', paddingRight: '6px' }}>
                              <div style={{ fontSize: '0.68rem', fontWeight: match.winnerId && match.p1?.id === match.winnerId ? '700' : '600', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.1' }}>
                                {match.p1 ? match.p1.name : getFeedingPlaceholder(true, match)}
                              </div>
                              {match.p1?.club && (
                                <div style={{ fontSize: '0.52rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.1', marginTop: '1px' }}>
                                  {match.p1.club}
                                </div>
                              )}
                            </div>

                            {match.p1 && flagCodeP1 && (
                              <div style={{ marginLeft: '6px', flexShrink: 0 }}>
                                <img 
                                  src={`https://flagcdn.com/w40/${flagCodeP1}.png`} 
                                  alt={flagCodeP1.toUpperCase()} 
                                  style={{ width: '17px', height: '11px', display: 'block', borderRadius: '1px', objectFit: 'cover' }}
                                />
                              </div>
                            )}

                            {match.status === 'completed' && match.score1 !== null && (
                              <span style={{ fontWeight: 'bold', marginLeft: '6px', fontSize: '0.68rem', color: '#2563eb' }}>{match.score1}</span>
                            )}
                          </div>

                          {/* Red corner */}
                          <div style={{ height: `${P_ROW_H}px`, padding: '1px 8px', display: 'flex', alignItems: 'center', position: 'relative', backgroundColor: match.winnerId && match.p2?.id === match.winnerId ? '#fef2f2' : 'white' }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#dc2626' }}></div>
                            <div style={{ flex: 1, overflow: 'hidden', paddingRight: '6px' }}>
                              <div style={{ fontSize: '0.68rem', fontWeight: match.winnerId && match.p2?.id === match.winnerId ? '700' : '600', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.1' }}>
                                {match.p2 ? match.p2.name : getFeedingPlaceholder(false, match)}
                              </div>
                              {match.p2?.club && (
                                <div style={{ fontSize: '0.52rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.1', marginTop: '1px' }}>
                                  {match.p2.club}
                                </div>
                              )}
                            </div>

                            {match.p2 && flagCodeP2 && (
                              <div style={{ marginLeft: '6px', flexShrink: 0 }}>
                                <img 
                                  src={`https://flagcdn.com/w40/${flagCodeP2}.png`} 
                                  alt={flagCodeP2.toUpperCase()} 
                                  style={{ width: '17px', height: '11px', display: 'block', borderRadius: '1px', objectFit: 'cover' }}
                                />
                              </div>
                            )}

                            {match.status === 'completed' && match.score2 !== null && (
                              <span style={{ fontWeight: 'bold', marginLeft: '6px', fontSize: '0.68rem', color: '#dc2626' }}>{match.score2}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Podium block — placed at bottom-right corner of the printed page */}
            {page.isFinals && podium && (
              <div style={{ position: 'absolute', bottom: '15px', right: '20px', width: '250px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white', overflow: 'hidden', zIndex: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ width: '40px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8fafc', padding: '5px 8px', borderRight: '1px solid #e2e8f0' }}>1st</td>
                      <td style={{ padding: '5px 10px', fontWeight: podium.first ? 'bold' : 'normal' }}>{podium.first?.name || ''}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8fafc', padding: '5px 8px', borderRight: '1px solid #e2e8f0' }}>2nd</td>
                      <td style={{ padding: '5px 10px' }}>{podium.second?.name || ''}</td>
                    </tr>
                    {numSemiMatches >= 1 && (
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8fafc', padding: '5px 8px', borderRight: '1px solid #e2e8f0' }}>3rd</td>
                        <td style={{ padding: '5px 10px' }}>{podium.bronze1?.name || ''}</td>
                      </tr>
                    )}
                    {numSemiMatches >= 2 && (
                      <tr>
                        <td style={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8fafc', padding: '5px 8px', borderRight: '1px solid #e2e8f0' }}>3rd</td>
                        <td style={{ padding: '5px 10px' }}>{podium.bronze2?.name || ''}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* Main Bracket Scoring Modal */}
      {selectedMatch && (
        <MatchModal 
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSave={handleSaveScore}
        />
      )}
    </div>
  );
}

export default BracketView;
