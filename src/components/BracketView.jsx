import { useState, useRef, useEffect, useMemo } from 'react';
import MatchModal from './MatchModal';
import kyorixLogo from '../assets/kyorix-logo.png';
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
  const { processedRounds, columnHeight, containerWidth } = useMemo(() => {
    if (!rounds || rounds.length === 0) return { processedRounds: [], columnHeight: 400, containerWidth: 400 };
    
    const cloned = JSON.parse(JSON.stringify(rounds));
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
          cloned[r][m].y = (topChild.y + botChild.y) / 2;
        } else if (topActive && !botActive) {
          cloned[r][m].y = topChild.y;
        } else if (!topActive && botActive) {
          cloned[r][m].y = botChild.y;
        } else {
          cloned[r][m].y = (topChild.y + botChild.y) / 2;
        }
      }
    }
    
    const colHeight = Math.max(480, MARGIN + HEADER + (cloned[0].length - 1) * SLOT + CARD_H + MARGIN);
    const contWidth = MARGIN + totalRounds * COL_W + (totalRounds - 1) * COL_GAP + MARGIN;
    
    return { processedRounds: cloned, columnHeight: colHeight, containerWidth: contWidth };
  }, [rounds]);

  // Reset zoom & pan and automatically fit scale to device width
  useEffect(() => {
    setHoveredCompetitorId(null);
    setPosition({ x: 0, y: 0 });
    
    const screenWidth = window.innerWidth;
    const padding = 48;
    const availableWidth = screenWidth - padding;
    
    if (containerWidth > 0 && availableWidth < containerWidth) {
      const fitScale = Math.max(0.4, availableWidth / containerWidth);
      setScale(fitScale);
    } else {
      setScale(0.95);
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

  const handlePrint = () => {
    setPosition({ x: 0, y: 0 });
    setTimeout(() => {
      window.print();
    }, 50);
  };

  // Quick navigation jump for large brackets on screen
  const handleJumpTo = (target) => {
    if (target === 'all') {
      setScale(0.95);
      setPosition({ x: 0, y: 0 });
    } else if (target === 'poolA') {
      setScale(1.0);
      setPosition({ x: 0, y: 0 });
    } else if (target === 'poolB') {
      setScale(1.0);
      setPosition({ x: 0, y: -columnHeight / 2 + 60 });
    } else if (target === 'finals') {
      setScale(1.0);
      setPosition({ x: -(containerWidth - 920), y: -columnHeight / 4 });
    }
  };

  // Compute dynamic print zoom for small brackets
  const printZoom = useMemo(() => {
    if (!containerWidth || !columnHeight) return '1';
    const widthZoom = 1040 / containerWidth;
    const heightZoom = 660 / columnHeight;
    let zoomVal = Math.min(1.0, widthZoom);
    if (heightZoom >= 0.45) {
      zoomVal = Math.min(zoomVal, heightZoom);
    } else {
      zoomVal = Math.max(0.40, zoomVal);
    }
    return String(Math.round(zoomVal * 1000) / 1000);
  }, [containerWidth, columnHeight]);

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
        const clonedRounds = JSON.parse(JSON.stringify(currentRounds));
        const round0 = clonedRounds[0];

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

        const sourcePlayer = sourceSlot.match[sourceSlot.key];
        const targetPlayer = targetSlot.match[targetSlot.key];

        sourceSlot.match[sourceSlot.key] = targetPlayer;
        targetSlot.match[targetSlot.key] = sourcePlayer;

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

  const getRoundHeader = (rIndex, totalRounds) => {
    const remaining = totalRounds - 1 - rIndex;
    if (remaining === 0) return "Final";
    if (remaining === 1) return "Semifinal";
    if (remaining === 2) return "Quarterfinal";
    return `Round of ${Math.pow(2, remaining + 1)}`;
  };

  const getFlagCode = (comp) => {
    if (!comp) return null;
    if (comp.country) {
      return nocToIso(comp.country);
    }
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
    return 'in';
  };

  const finalRound = rounds[rounds.length - 1];
  const finalMatch = finalRound?.[0];

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

  // Connection lines for interactive main bracket
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

        const x1 = MARGIN + r * COL_STEP + COL_W;
        const x2 = MARGIN + (r + 1) * COL_STEP;

        const y1 = match.y + CARD_MID;
        const y2 = nextMatch.y + (isTopBranch ? BLUE_SLOT_MID : RED_SLOT_MID);

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

  // Large Bracket Print Slicing (Pool A, Pool B, Finals & Semifinals)
  const isLargeBracket = processedRounds.length > 0 && processedRounds[0].length > 8;

  const P_CARD_H = 74;
  const P_GAP = 8;
  const P_SLOT = P_CARD_H + P_GAP; // 82px per leaf slot
  const P_COL_W = 240;
  const P_COL_GAP = 40;
  const P_COL_STEP = P_COL_W + P_COL_GAP; // 280px per round column
  const P_MARGIN = 24;
  const P_HEADER = 36;
  const P_CARD_MID = P_CARD_H / 2; // 37
  const P_INFO_BAR_H = 18;
  const P_ROW_H = 28;
  const P_BLUE_MID = P_INFO_BAR_H + P_ROW_H / 2; // 32
  const P_RED_MID = P_INFO_BAR_H + P_ROW_H + P_ROW_H / 2; // 60

  const printPages = useMemo(() => {
    if (!isLargeBracket || !processedRounds || processedRounds.length === 0) return [];
    const totalRounds = processedRounds.length;
    if (totalRounds < 3) return [];

    const layoutSubTree = (roundsSubset, isPoolA) => {
      const laid = roundsSubset.map(round => round.map(m => ({ ...m })));
      const numLeaves = laid[0].length;

      // 1. Position leaf slots (Round 0)
      for (let m = 0; m < numLeaves; m++) {
        laid[0][m].py = P_MARGIN + P_HEADER + m * P_SLOT;
        laid[0][m].px = P_MARGIN;
      }

      // 2. Position parents centered between their children
      for (let r = 1; r < laid.length; r++) {
        for (let m = 0; m < laid[r].length; m++) {
          laid[r][m].px = P_MARGIN + r * P_COL_STEP;
          const topChild = laid[r - 1][m * 2];
          const botChild = laid[r - 1][m * 2 + 1];

          if (topChild && botChild) {
            const topActive = topChild.status !== 'walkover';
            const botActive = botChild.status !== 'walkover';

            if (topActive && botActive) {
              laid[r][m].py = (topChild.py + botChild.py) / 2;
            } else if (topActive && !botActive) {
              laid[r][m].py = topChild.py;
            } else if (!topActive && botActive) {
              laid[r][m].py = botChild.py;
            } else {
              laid[r][m].py = (topChild.py + botChild.py) / 2;
            }
          }
        }
      }

      // 3. Generate high-contrast connection lines
      const lines = [];
      for (let r = 0; r < laid.length - 1; r++) {
        const round = laid[r];
        const nextRound = laid[r + 1];

        for (let mIdx = 0; mIdx < round.length; mIdx++) {
          const match = round[mIdx];
          if (match.status === 'walkover') continue;

          const nextMIdx = Math.floor(mIdx / 2);
          const nextMatch = nextRound[nextMIdx];
          if (!nextMatch || nextMatch.status === 'walkover') continue;

          const isTopBranch = mIdx % 2 === 0;

          const x1 = match.px + P_COL_W;
          const x2 = nextMatch.px;
          const y1 = match.py + P_CARD_MID;
          const y2 = nextMatch.py + (isTopBranch ? P_BLUE_MID : P_RED_MID);

          lines.push({ d: getStepPath(x1, y1, x2, y2) });
        }
      }

      const height = P_MARGIN + P_HEADER + numLeaves * P_SLOT + P_MARGIN;
      const width = P_MARGIN + laid.length * P_COL_W + (laid.length - 1) * P_COL_GAP + P_MARGIN + 120;

      return { rounds: laid, lines, height, width, isPoolA };
    };

    // Slice rounds for Pool A (top half) and Pool B (bottom half) up to Quarterfinals
    const poolARounds = [];
    const poolBRounds = [];
    for (let r = 0; r < totalRounds - 2; r++) {
      const rnd = processedRounds[r];
      const half = rnd.length / 2;
      poolARounds.push(rnd.slice(0, half).map((m, i) => ({ ...m, originalMatchIndex: m.matchIndex, localMatchIndex: i })));
      poolBRounds.push(rnd.slice(half).map((m, i) => ({ ...m, originalMatchIndex: m.matchIndex, localMatchIndex: i })));
    }

    const poolA = layoutSubTree(poolARounds, true);
    const poolB = layoutSubTree(poolBRounds, false);

    // Page 3: Finals & Semifinals (Championship Page)
    const semiRound = processedRounds[totalRounds - 2];
    const finalMatchObj = processedRounds[totalRounds - 1][0];

    const finalsRound0 = [
      { ...semiRound[0], px: 40, py: 110, originalMatchIndex: semiRound[0].matchIndex, localMatchIndex: 0 },
      { ...semiRound[1], px: 40, py: 320, originalMatchIndex: semiRound[1].matchIndex, localMatchIndex: 1 }
    ];
    const finalsRound1 = [
      { ...finalMatchObj, px: 360, py: 215, originalMatchIndex: finalMatchObj.matchIndex, localMatchIndex: 0 }
    ];

    const finalsLines = [
      { d: getStepPath(40 + P_COL_W, 110 + P_CARD_MID, 360, 215 + P_BLUE_MID) },
      { d: getStepPath(40 + P_COL_W, 320 + P_CARD_MID, 360, 215 + P_RED_MID) }
    ];

    const finals = {
      isFinals: true,
      rounds: [finalsRound0, finalsRound1],
      lines: finalsLines,
      width: 1040,
      height: 520
    };

    return [
      { name: "Pool A (Top Half)", ...poolA, totalRoundsCount: totalRounds },
      { name: "Pool B (Bottom Half)", ...poolB, totalRoundsCount: totalRounds },
      { name: "Finals & Semifinals", ...finals, totalRoundsCount: totalRounds }
    ];
  }, [processedRounds, isLargeBracket, rounds]);

  const getPrintPlaceholder = (isP1, match, page) => {
    if (page?.isFinals) {
      const totalRounds = processedRounds.length;
      if (match.roundIndex === totalRounds - 2) {
        if (match.localMatchIndex === 0) {
          return isP1 ? 'Pool A QF 1 Winner' : 'Pool A QF 2 Winner';
        } else {
          return isP1 ? 'Pool B QF 3 Winner' : 'Pool B QF 4 Winner';
        }
      }
      if (match.roundIndex === totalRounds - 1) {
        return isP1 ? 'Semifinal 1 Winner' : 'Semifinal 2 Winner';
      }
    }
    return getFeedingPlaceholder(isP1, match);
  };

  return (
    <div>
      <div className="no-print bracket-header" style={{ justifyContent: hideHeaderTitle ? 'flex-end' : 'space-between' }}>
        {!hideHeaderTitle && (
          <h4 style={{ color: 'var(--text-muted)', margin: 0 }}>{divisionName}{courtNo ? ` - Court ${courtNo}` : ''} Bracket</h4>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isLargeBracket && (
            <div style={{ display: 'flex', gap: '0.25rem', marginRight: '0.25rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => handleJumpTo('all')} title="Full Bracket">All</button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleJumpTo('poolA')} title="View Pool A">Pool A</button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleJumpTo('poolB')} title="View Pool B">Pool B</button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleJumpTo('finals')} title="View Finals">Finals</button>
            </div>
          )}
          {onRegenerate && (
            <button className="btn btn-secondary btn-sm" onClick={onRegenerate} title="Re-shuffle bracket and separate same-academy players">
              Regenerate / Shuffle
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => handleZoom(1.15)}>Zoom +</button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleZoom(0.85)}>Zoom -</button>
          <button className="btn btn-secondary btn-sm" onClick={handleResetZoom}>Reset View</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>Print / Save PDF</button>
        </div>
      </div>

      {/* Print-only header for small brackets (<= 16 players) */}
      {!isLargeBracket && (
        <div className="print-only-header">
          <div className="print-header-category">
            <h2 style={{ margin: 0, fontSize: '1.45rem', color: 'var(--primary)', fontWeight: 'bold' }}>
              {divisionName}{courtNo ? ` - Court ${courtNo}` : ''}
            </h2>
          </div>
          <div className="print-header-brand">
            <img 
              src={kyorixLogo} 
              alt="Kyorix Sport Technology" 
              className="print-company-logo" 
            />
          </div>
        </div>
      )}

      {/* Main Bracket Canvas (Interactive on screen, prints for small brackets) */}
      <div 
        className={`bracket-wrapper ${isLargeBracket ? 'hide-in-print-large' : ''}`}
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
            '--print-zoom': printZoom
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
                if (isWalkover) return null;

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

        {/* Floating Standings block (Interactive view) */}
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

        {/* Duplicate copy for small bracket print layout */}
        {!isLargeBracket && podium && (
          <div className="standings-box standings-print" style={{ 
            width: '260px', 
            border: '1px solid var(--border-color)', 
            borderRadius: '6px', 
            backgroundColor: 'white',
            overflow: 'hidden'
          }}>
            <table className="custom-table" style={{ fontSize: '0.8rem' }}>
              <tbody>
                <tr>
                  <td style={{ width: '45px', fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>1st</td>
                  <td style={{ padding: '0.4rem 0.75rem', fontWeight: podium.first ? 'bold' : 'normal' }}>{podium.first?.name || ''}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>2nd</td>
                  <td style={{ padding: '0.4rem 0.75rem' }}>{podium.second?.name || ''}</td>
                </tr>
                {numSemiMatches >= 1 && (
                  <tr>
                    <td style={{ fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>3rd</td>
                    <td style={{ padding: '0.4rem 0.75rem' }}>{podium.bronze1?.name || ''}</td>
                  </tr>
                )}
                {numSemiMatches >= 2 && (
                  <tr>
                    <td style={{ fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>3rd</td>
                    <td style={{ padding: '0.4rem 0.75rem' }}>{podium.bronze2?.name || ''}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print-only Multi-Page Layout for Large Brackets (Pool A, Pool B, Finals & Semifinals) */}
      {isLargeBracket && printPages.map((page, pIdx) => {
        const PRINT_SAFE_W = 1000;
        const PRINT_SAFE_H = 600;
        const scaleVal = Math.min(1.0, PRINT_SAFE_W / page.width, PRINT_SAFE_H / page.height);

        return (
          <div key={pIdx} className="print-only-page">
            {/* Header: Category Name on left, Company Logo on right */}
            <div className="print-page-header">
              <div className="print-header-category">
                <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                  {divisionName}{courtNo ? ` - Court ${courtNo}` : ''} — {page.name}
                </h2>
              </div>
              <div className="print-header-brand">
                <img 
                  src={kyorixLogo} 
                  alt="Kyorix Sport Technology" 
                  className="print-company-logo" 
                />
              </div>
            </div>

            {/* Subtree Canvas */}
            <div 
              style={{
                position: 'relative',
                width: `${page.width}px`,
                height: `${page.height}px`,
                transform: `scale(${scaleVal})`,
                transformOrigin: 'top left',
                margin: '0 auto'
              }}
            >
              {/* High-Contrast SVG Connection Lines */}
              <svg 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${page.width}px`,
                  height: `${page.height}px`,
                  pointerEvents: 'none',
                  zIndex: 0
                }}
              >
                {page.lines.map((line, lIdx) => (
                  <path 
                    key={lIdx}
                    d={line.d}
                    stroke="#334155"
                    strokeWidth="2.2"
                    vectorEffect="non-scaling-stroke"
                    fill="none"
                  />
                ))}
              </svg>

              {/* Round Columns */}
              {page.rounds.map((round, rIndex) => {
                const isPoolFinalRound = !page.isFinals && rIndex === page.rounds.length - 1;
                const colX = page.isFinals 
                  ? (rIndex === 0 ? 40 : 360) 
                  : (P_MARGIN + rIndex * P_COL_STEP);

                return (
                  <div 
                    key={rIndex}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: `${colX}px`,
                      width: `${P_COL_W}px`,
                      height: `${page.height}px`,
                      zIndex: 1
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: `${page.isFinals ? 40 : P_MARGIN}px`,
                      left: 0,
                      width: '100%',
                      fontWeight: 'bold',
                      fontSize: '0.72rem',
                      color: '#334155',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {page.isFinals 
                        ? (rIndex === 0 ? "Semifinals" : "Championship Final") 
                        : getRoundHeader(round[0].roundIndex, page.totalRoundsCount)}
                    </div>

                    {round.map((match) => {
                      if (rIndex === 0 && !page.isFinals && match.status === 'walkover') return null;

                      const flagCodeP1 = getFlagCode(match.p1);
                      const flagCodeP2 = getFlagCode(match.p2);

                      return (
                        <div 
                          key={match.id}
                          style={{
                            position: 'absolute',
                            top: `${match.py}px`,
                            left: 0,
                            width: `${P_COL_W}px`,
                            height: `${P_CARD_H}px`
                          }}
                        >
                          <div style={{
                            border: '1px solid #cbd5e1',
                            borderRadius: '5px',
                            overflow: 'hidden',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}>
                            {/* Match Header Bar */}
                            <div style={{
                              height: `${P_INFO_BAR_H}px`,
                              padding: '0 8px',
                              fontSize: '0.62rem',
                              backgroundColor: '#f8fafc',
                              borderBottom: '1px solid #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              color: '#334155',
                              fontWeight: '700'
                            }}>
                              <span>
                                {match.matchNo ? `Match ${match.matchNo}` : 'Match'} • {page.isFinals ? (rIndex === 0 ? "Semifinal" : "Final") : getRoundHeader(match.roundIndex, page.totalRoundsCount)}
                              </span>
                              {match.status === 'completed' && match.winType && (
                                <span style={{
                                  fontSize: '0.52rem',
                                  textTransform: 'uppercase',
                                  backgroundColor: '#dbeafe',
                                  color: '#1d4ed8',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  fontWeight: 'bold'
                                }}>
                                  {match.winType}
                                </span>
                              )}
                            </div>

                            {/* Blue Corner Row */}
                            <div style={{
                              height: `${P_ROW_H}px`,
                              padding: '0 8px',
                              display: 'flex',
                              alignItems: 'center',
                              borderBottom: '1px solid #e2e8f0',
                              position: 'relative',
                              backgroundColor: match.winnerId && match.p1?.id === match.winnerId ? '#eff6ff' : 'white'
                            }}>
                              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#2563eb' }}></div>
                              <div style={{ flex: 1, overflow: 'hidden', paddingLeft: '6px', paddingRight: '4px' }}>
                                <div style={{
                                  fontSize: '0.74rem',
                                  fontWeight: match.winnerId && match.p1?.id === match.winnerId ? '700' : '600',
                                  color: '#0f172a',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  lineHeight: '1.2',
                                  textDecoration: match.winnerId && match.p1?.id !== match.winnerId ? 'line-through' : 'none',
                                  opacity: match.winnerId && match.p1?.id !== match.winnerId ? 0.6 : 1
                                }}>
                                  {match.p1 ? match.p1.name : getPrintPlaceholder(true, match, page)}
                                </div>
                                {match.p1?.club && (
                                  <div style={{ fontSize: '0.56rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.1' }}>
                                    {match.p1.club}
                                  </div>
                                )}
                              </div>

                              {match.p1 && flagCodeP1 && (
                                <div style={{ marginLeft: '4px', flexShrink: 0 }}>
                                  <img 
                                    src={`https://flagcdn.com/w40/${flagCodeP1}.png`} 
                                    alt={flagCodeP1.toUpperCase()} 
                                    style={{ width: '17px', height: '11px', display: 'block', borderRadius: '1px', objectFit: 'cover' }}
                                  />
                                </div>
                              )}

                              {match.status === 'completed' && match.score1 !== null && (
                                <span style={{ fontWeight: '800', marginLeft: '6px', fontSize: '0.76rem', color: '#2563eb', fontFamily: 'monospace' }}>
                                  {match.score1}
                                </span>
                              )}
                            </div>

                            {/* Red Corner Row */}
                            <div style={{
                              height: `${P_ROW_H}px`,
                              padding: '0 8px',
                              display: 'flex',
                              alignItems: 'center',
                              position: 'relative',
                              backgroundColor: match.winnerId && match.p2?.id === match.winnerId ? '#fef2f2' : 'white'
                            }}>
                              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#dc2626' }}></div>
                              <div style={{ flex: 1, overflow: 'hidden', paddingLeft: '6px', paddingRight: '4px' }}>
                                <div style={{
                                  fontSize: '0.74rem',
                                  fontWeight: match.winnerId && match.p2?.id === match.winnerId ? '700' : '600',
                                  color: '#0f172a',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  lineHeight: '1.2',
                                  textDecoration: match.winnerId && match.p2?.id !== match.winnerId ? 'line-through' : 'none',
                                  opacity: match.winnerId && match.p2?.id !== match.winnerId ? 0.6 : 1
                                }}>
                                  {match.p2 ? match.p2.name : getPrintPlaceholder(false, match, page)}
                                </div>
                                {match.p2?.club && (
                                  <div style={{ fontSize: '0.56rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.1' }}>
                                    {match.p2.club}
                                  </div>
                                )}
                              </div>

                              {match.p2 && flagCodeP2 && (
                                <div style={{ marginLeft: '4px', flexShrink: 0 }}>
                                  <img 
                                    src={`https://flagcdn.com/w40/${flagCodeP2}.png`} 
                                    alt={flagCodeP2.toUpperCase()} 
                                    style={{ width: '17px', height: '11px', display: 'block', borderRadius: '1px', objectFit: 'cover' }}
                                  />
                                </div>
                              )}

                              {match.status === 'completed' && match.score2 !== null && (
                                <span style={{ fontWeight: '800', marginLeft: '6px', fontSize: '0.76rem', color: '#dc2626', fontFamily: 'monospace' }}>
                                  {match.score2}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quarterfinal Exit Arrow Tags for Pool A & Pool B */}
                          {isPoolFinalRound && (
                            <div style={{
                              position: 'absolute',
                              left: `${P_COL_W + 8}px`,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              backgroundColor: '#0f172a',
                              color: 'white',
                              fontSize: '0.62rem',
                              fontWeight: '700',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              zIndex: 5
                            }}>
                              <span>➔</span>
                              <span>
                                {page.isPoolA 
                                  ? (match.localMatchIndex === 0 ? 'To SF 1 (Blue)' : 'To SF 1 (Red)')
                                  : (match.localMatchIndex === 0 ? 'To SF 2 (Blue)' : 'To SF 2 (Red)')
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Podium Box on Page 3 (Finals & Semifinals) */}
              {page.isFinals && podium && (
                <div style={{
                  position: 'absolute',
                  top: '80px',
                  left: '680px',
                  width: '320px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                  zIndex: 10
                }}>
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>Official Results</span>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Medal Standings</span>
                  </div>
                  <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                    <tbody>
                      {/* 1st Place - Gold */}
                      <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fffbeb' }}>
                        <td style={{ width: '54px', fontWeight: 'bold', textAlign: 'center', padding: '8px 6px', color: '#b45309', borderRight: '1px solid #fde68a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                            <span>🥇</span>
                            <span>1st</span>
                          </div>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{podium.first?.name || 'Pending Final'}</div>
                          {podium.first?.club && <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{podium.first.club}</div>}
                        </td>
                      </tr>
                      {/* 2nd Place - Silver */}
                      <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                        <td style={{ width: '54px', fontWeight: 'bold', textAlign: 'center', padding: '8px 6px', color: '#475569', borderRight: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                            <span>🥈</span>
                            <span>2nd</span>
                          </div>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <div style={{ fontWeight: podium.second ? 'bold' : 'normal', color: '#0f172a' }}>{podium.second?.name || 'Pending Final'}</div>
                          {podium.second?.club && <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{podium.second.club}</div>}
                        </td>
                      </tr>
                      {/* 3rd Place - Bronze 1 */}
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ width: '54px', fontWeight: 'bold', textAlign: 'center', padding: '8px 6px', color: '#9a3412', borderRight: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                            <span>🥉</span>
                            <span>3rd</span>
                          </div>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <div style={{ fontWeight: podium.bronze1 ? '600' : 'normal', color: '#0f172a' }}>{podium.bronze1?.name || 'Pending Semifinal 1'}</div>
                          {podium.bronze1?.club && <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{podium.bronze1.club}</div>}
                        </td>
                      </tr>
                      {/* 3rd Place - Bronze 2 */}
                      <tr>
                        <td style={{ width: '54px', fontWeight: 'bold', textAlign: 'center', padding: '8px 6px', color: '#9a3412', borderRight: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                            <span>🥉</span>
                            <span>3rd</span>
                          </div>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <div style={{ fontWeight: podium.bronze2 ? '600' : 'normal', color: '#0f172a' }}>{podium.bronze2?.name || 'Pending Semifinal 2'}</div>
                          {podium.bronze2?.club && <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{podium.bronze2.club}</div>}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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
