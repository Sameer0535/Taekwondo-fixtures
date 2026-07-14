import { useState, useRef, useEffect, useMemo } from 'react';
import MatchModal from './MatchModal';
import { updateMatchScore, buildRepechageBrackets, assignActiveMatchNumbers } from '../utils/bracketBuilder';
import { nocToIso } from '../utils/countries';

// Helper to draw a perfect step path with rounded corners
const getStepPath = (x1, y1, x2, y2) => {
  const xmid = (x1 + x2) / 2;
  const r = 8; // rounded corner radius
  if (Math.abs(y1 - y2) < 5) {
    return `M ${x1} ${y1} H ${x2}`;
  }
  const isGoingDown = y2 > y1;
  const dy = isGoingDown ? r : -r;
  return `M ${x1} ${y1} H ${xmid - r} Q ${xmid} ${y1}, ${xmid} ${y1 + dy} V ${y2 - dy} Q ${xmid} ${y2}, ${xmid + r} ${y2} H ${x2}`;
};

function BracketView({ divisionId, divisionName, rounds, setBrackets, useRepechage }) {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [repechageBrackets, setRepechageBrackets] = useState(null);
  const [selectedRepMatch, setSelectedRepMatch] = useState(null);

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

  // Compute repechage brackets if enabled
  useEffect(() => {
    if (useRepechage && rounds) {
      const rep = buildRepechageBrackets(rounds);
      setBrackets(prev => {
        // Just verify/rebuild to synchronize
        return prev;
      });
      setRepechageBrackets(rep);
    } else {
      setRepechageBrackets(null);
    }
  }, [rounds, useRepechage]);

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
  const handleSaveScore = (winnerId, score1, score2, winType) => {
    if (!selectedMatch) return;
    
    setBrackets(prev => {
      const currentRounds = prev[divisionId];
      const updated = updateMatchScore(currentRounds, selectedMatch.id, winnerId, score1, score2, winType);
      return {
        ...prev,
        [divisionId]: updated
      };
    });
    
    setSelectedMatch(null);
  };

  // Update score in repechage bracket
  const handleSaveRepScore = (winnerId, score1, score2, winType) => {
    if (!selectedRepMatch || !repechageBrackets) return;

    const { side, matchId } = selectedRepMatch;
    const targetBracketKey = side === 'A' ? 'bracketA' : 'bracketB';
    const targetBracket = [...repechageBrackets[targetBracketKey]];
    const matchIdx = targetBracket.findIndex(m => m.id === matchId);

    if (matchIdx === -1) return;

    // Update match
    const match = targetBracket[matchIdx];
    match.winnerId = winnerId;
    match.score1 = score1;
    match.score2 = score2;
    match.winType = winType;
    match.status = 'completed';

    const winnerObj = winnerId === match.p1.id ? match.p1 : match.p2;

    // Propagate if there's a next match in repechage
    if (matchIdx < targetBracket.length - 1) {
      const nextMatch = targetBracket[matchIdx + 1];
      nextMatch.p1 = { ...winnerObj };
    }

    setRepechageBrackets(prev => ({
      ...prev,
      [targetBracketKey]: targetBracket
    }));

    setSelectedRepMatch(null);
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

    if (useRepechage && repechageBrackets) {
      const repAFinal = repechageBrackets.bracketA?.[repechageBrackets.bracketA.length - 1];
      const repBFinal = repechageBrackets.bracketB?.[repechageBrackets.bracketB.length - 1];
      
      if (repAFinal?.winnerId) {
        bronze1 = repAFinal.winnerId === repAFinal.p1?.id ? repAFinal.p1 : repAFinal.p2;
      }
      if (repBFinal?.winnerId) {
        bronze2 = repBFinal.winnerId === repBFinal.p1?.id ? repBFinal.p1 : repBFinal.p2;
      }
    } else {
      const semiRound = rounds[rounds.length - 2];
      if (semiRound) {
        const m1 = semiRound[0];
        const m2 = semiRound[1];
        if (m1?.status === 'completed' && m1.winnerId) {
          bronze1 = m1.winnerId === m1.p1?.id ? m1.p2 : m1.p1;
        }
        if (m2?.status === 'completed' && m2.winnerId) {
          bronze2 = m2.winnerId === m2.p1?.id ? m2.p2 : m2.p1;
        }
      }
    }

    return { first, second, bronze1, bronze2 };
  };

  // Helper to calculate feeding placeholder labels (e.g. W1, W12)
  const getFeedingPlaceholder = (isP1, match) => {
    if (match.roundIndex === 0) return 'TBD';
    const feedingMatchIndex = match.matchIndex * 2 + (isP1 ? 0 : 1);
    const feedingMatch = rounds[match.roundIndex - 1]?.[feedingMatchIndex];
    return feedingMatch ? `W${feedingMatch.matchNo}` : 'TBD';
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
      <div className="no-print bracket-header">
        <h4 style={{ color: 'var(--text-muted)' }}>{divisionName} Bracket</h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => handleZoom(1.15)}>Zoom +</button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleZoom(0.85)}>Zoom -</button>
          <button className="btn btn-secondary btn-sm" onClick={handleResetZoom}>Reset View</button>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>Print / Save PDF</button>
        </div>
      </div>

      {/* Main Bracket Canvas */}
      <div 
        className="bracket-wrapper"
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
                          className={getCompetitorClass(match, match.p1, 'blue')}
                          onMouseEnter={() => match.p1 && setHoveredCompetitorId(match.p1.id)}
                          onMouseLeave={() => setHoveredCompetitorId(null)}
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
                          className={getCompetitorClass(match, match.p2, 'red')}
                          onMouseEnter={() => match.p2 && setHoveredCompetitorId(match.p2.id)}
                          onMouseLeave={() => setHoveredCompetitorId(null)}
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
                <tr>
                  <td style={{ fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>3rd</td>
                  <td style={{ padding: '0.4rem 0.75rem' }}>
                    {podium.bronze1?.name || ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>3rd</td>
                  <td style={{ padding: '0.4rem 0.75rem' }}>
                    {podium.bronze2?.name || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Duplicate copy for print layout - rendered outside zoomed bracket-container so it can escape container bounds and use position: fixed relative to paper boundary */}
        {podium && (
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
                <tr>
                  <td style={{ fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>3rd</td>
                  <td style={{ padding: '0.4rem 0.75rem' }}>
                    {podium.bronze1?.name || ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', borderRight: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: '#f8fafc' }}>3rd</td>
                  <td style={{ padding: '0.4rem 0.75rem' }}>
                    {podium.bronze2?.name || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Repechage Brackets */}
      {useRepechage && repechageBrackets && (
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
            Olympic Double Bronze Repechage
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Repechage A */}
            <div className="card">
              <h4 style={{ color: 'var(--blue-comp)', marginBottom: '1rem' }}>Repechage Bracket A (Finalist A Opponents)</h4>
              {repechageBrackets.bracketA.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No competitors in Repechage A yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {repechageBrackets.bracketA.map((match) => {
                    const hasHoveredComp = hoveredCompetitorId && (
                      match.p1?.id === hoveredCompetitorId || 
                      match.p2?.id === hoveredCompetitorId
                    );
                    
                    return (
                      <div 
                        key={match.id} 
                        className={`match-card ${hasHoveredComp ? 'path-highlighted' : ''}`}
                        onClick={() => setSelectedRepMatch({ side: 'A', matchId: match.id, match })}
                      >
                        <div className="match-info-bar">
                          <span>{match.title}</span>
                          {match.status === 'completed' && <span className="badge badge-blue">{match.winType}</span>}
                        </div>
                        
                        <div 
                          className={getCompetitorClass(match, match.p1, 'blue')}
                          onMouseEnter={() => match.p1 && setHoveredCompetitorId(match.p1.id)}
                          onMouseLeave={() => setHoveredCompetitorId(null)}
                        >
                          <div className="comp-bar blue-bar"></div>
                          <div style={{ flex: 1, paddingLeft: '0.75rem' }}>
                            <div className="comp-name-line">{match.p1.name}</div>
                          </div>
                          {match.status === 'completed' && <span className="match-score blue-score">{match.score1}</span>}
                        </div>

                        <div 
                          className={getCompetitorClass(match, match.p2, 'red')}
                          onMouseEnter={() => match.p2 && setHoveredCompetitorId(match.p2.id)}
                          onMouseLeave={() => setHoveredCompetitorId(null)}
                        >
                          <div className="comp-bar red-bar"></div>
                          <div style={{ flex: 1, paddingLeft: '0.75rem' }}>
                            <div className="comp-name-line">{match.p2 ? match.p2.name : 'TBD'}</div>
                          </div>
                          {match.status === 'completed' && match.p2 && <span className="match-score red-score">{match.score2}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Repechage B */}
            <div className="card">
              <h4 style={{ color: 'var(--red-comp)', marginBottom: '1rem' }}>Repechage Bracket B (Finalist B Opponents)</h4>
              {repechageBrackets.bracketB.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No competitors in Repechage B yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {repechageBrackets.bracketB.map((match) => {
                    const hasHoveredComp = hoveredCompetitorId && (
                      match.p1?.id === hoveredCompetitorId || 
                      match.p2?.id === hoveredCompetitorId
                    );
                    
                    return (
                      <div 
                        key={match.id} 
                        className={`match-card ${hasHoveredComp ? 'path-highlighted' : ''}`}
                        onClick={() => setSelectedRepMatch({ side: 'B', matchId: match.id, match })}
                      >
                        <div className="match-info-bar">
                          <span>{match.title}</span>
                          {match.status === 'completed' && <span className="badge badge-blue">{match.winType}</span>}
                        </div>
                        
                        <div 
                          className={getCompetitorClass(match, match.p1, 'blue')}
                          onMouseEnter={() => match.p1 && setHoveredCompetitorId(match.p1.id)}
                          onMouseLeave={() => setHoveredCompetitorId(null)}
                        >
                          <div className="comp-bar blue-bar"></div>
                          <div style={{ flex: 1, paddingLeft: '0.75rem' }}>
                            <div className="comp-name-line">{match.p1.name}</div>
                          </div>
                          {match.status === 'completed' && <span className="match-score blue-score">{match.score1}</span>}
                        </div>

                        <div 
                          className={getCompetitorClass(match, match.p2, 'red')}
                          onMouseEnter={() => match.p2 && setHoveredCompetitorId(match.p2.id)}
                          onMouseLeave={() => setHoveredCompetitorId(null)}
                        >
                          <div className="comp-bar red-bar"></div>
                          <div style={{ flex: 1, paddingLeft: '0.75rem' }}>
                            <div className="comp-name-line">{match.p2 ? match.p2.name : 'TBD'}</div>
                          </div>
                          {match.status === 'completed' && match.p2 && <span className="match-score red-score">{match.score2}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Bracket Scoring Modal */}
      {selectedMatch && (
        <MatchModal 
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSave={handleSaveScore}
        />
      )}

      {/* Repechage Scoring Modal */}
      {selectedRepMatch && (
        <MatchModal 
          match={selectedRepMatch.match}
          onClose={() => setSelectedRepMatch(null)}
          onSave={handleSaveRepScore}
        />
      )}
    </div>
  );
}

export default BracketView;
