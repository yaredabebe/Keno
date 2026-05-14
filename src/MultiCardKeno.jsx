import { useState, useCallback, useRef, useEffect } from 'react';
import './MultiCardKeno.css';

const NUMS = 20;
const MAX_PICKS = 5;
const DRAWS = 10;
const MULT = { 0:0, 1:0, 2:0, 3:10, 4:25, 5:100 };
const CARD_OPTIONS = [1, 2, 4];

function MultiCardKeno() {
  const [picks, setPicks]         = useState([]);
  const [drawn, setDrawn]         = useState([]);
  const [drawing, setDrawing]     = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [cardResults, setCardResults] = useState([]);
  const [balance, setBalance]     = useState(1000);
  const [bet, setBet]             = useState(5);
  const [numCards, setNumCards]   = useState(1);
  const [progress, setProgress]   = useState(0);
  const [stats, setStats]         = useState({ played:0, wins:0, bigWin:0 });
  const [history, setHistory]     = useState([]);

  const togglePick = useCallback((n) => {
    if (hasResult || drawing) return;
    setPicks(prev =>
      prev.includes(n)
        ? prev.filter(x => x !== n)
        : prev.length < MAX_PICKS
        ? [...prev, n].sort((a, b) => a - b)
        : prev
    );
  }, [hasResult, drawing]);

  const quickPick = () => {
    if (hasResult || drawing) return;
    const pool = [];
    while (pool.length < MAX_PICKS) {
      const r = Math.floor(Math.random() * NUMS) + 1;
      if (!pool.includes(r)) pool.push(r);
    }
    setPicks(pool.sort((a, b) => a - b));
  };

  const clearBoard = () => {
    if (drawing) return;
    setPicks([]);
    setDrawn([]);
    setHasResult(false);
    setRoundResult(null);
    setCardResults([]);
    setProgress(0);
  };

  const newGame = () => {
    if (drawing) return;
    clearBoard();
    setBalance(1000);
    setStats({ played:0, wins:0, bigWin:0 });
    setHistory([]);
  };

  const changeCards = (n) => {
    if (drawing || hasResult) return;
    setNumCards(n);
  };

  const adjustBet = (amt) => {
    if (drawing) return;
    setBet(prev => Math.max(5, Math.min(50, prev + amt)));
  };

  const getCellClass = (n) => {
    const ip = picks.includes(n);
    const id = drawn.includes(n);
    if (ip && id) return 'mcell hit';
    if (ip)       return 'mcell sel';
    if (id)       return 'mcell drwn';
    return 'mcell';
  };

  const getKCardCellClass = (n) => {
    const ip = picks.includes(n);
    const id = drawn.includes(n);
    if (ip && id) return 'kcell khit';
    if (ip)       return 'kcell ksel';
    if (id)       return 'kcell kdrwn';
    return 'kcell';
  };

  const draw = useCallback(async () => {
    if (picks.length !== MAX_PICKS || drawing || hasResult) return;
    const totalBet = bet * numCards;
    if (balance < totalBet) { alert('Insufficient balance for all cards!'); return; }

    setDrawing(true);
    setDrawn([]);
    setHasResult(false);
    setRoundResult(null);
    setCardResults([]);
    setProgress(0);
    setBalance(prev => prev - totalBet);

    const dn = [];
    for (let i = 0; i < DRAWS; i++) {
      await new Promise(r => setTimeout(r, 140));
      let rand;
      do { rand = Math.floor(Math.random() * NUMS) + 1; } while (dn.includes(rand));
      dn.push(rand);
      setDrawn([...dn]);
      setProgress(Math.round(((i + 1) / DRAWS) * 100));
    }

    const matches = picks.filter(p => dn.includes(p)).length;
    const winPerCard = MULT[matches] * bet;
    const totalWin = winPerCard * numCards;

    const results = Array.from({ length: numCards }, (_, i) => ({
      cardIndex: i,
      matches,
      win: winPerCard,
    }));

    if (totalWin > 0) setBalance(prev => prev + totalWin);

    setStats(prev => ({
      played: prev.played + 1,
      wins: prev.wins + (totalWin > 0 ? 1 : 0),
      bigWin: Math.max(prev.bigWin, totalWin),
    }));

    setHistory(prev => [{
      id: Date.now(),
      matches,
      win: totalWin,
      cards: numCards,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }, ...prev].slice(0, 8));

    setCardResults(results);
    setRoundResult({ matches, totalWin, numCards });
    setHasResult(true);
    setDrawing(false);
    setProgress(0);
  }, [picks, balance, bet, numCards, drawing, hasResult]);

  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) + '%' : '—';
  const totalBet = bet * numCards;

  return (
    <div className="mc-wrap">

      {/* Header */}
      <div className="mc-header">
        <div className="mc-eyebrow">◈ MULTI-CARD KENO ◈</div>
        <h1 className="mc-title"><span className="mc-accent">MULTI</span>-CARD KENO</h1>
        <div className="mc-subtitle">One draw · Many cards · Maximum wins</div>
      </div>

      {/* Stats */}
      <div className="mc-stats">
        <div className="mc-stat">
          <div className="mc-stat-lbl">Balance</div>
          <div className="mc-stat-val">${balance.toLocaleString()}</div>
        </div>
        <div className="mc-stat">
          <div className="mc-stat-lbl">Biggest Win</div>
          <div className="mc-stat-val">${stats.bigWin.toLocaleString()}</div>
        </div>
        <div className="mc-stat">
          <div className="mc-stat-lbl">Total Rounds</div>
          <div className="mc-stat-val">{stats.played}</div>
        </div>
        <div className="mc-stat">
          <div className="mc-stat-lbl">Win Rate</div>
          <div className="mc-stat-val">{winRate}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="mc-ctrl-row">
        <div className="mc-bet-panel">
          <div className="mc-bet-lbl">Bet / Card</div>
          <button className="mc-step" onClick={() => adjustBet(-5)} disabled={drawing}>−</button>
          <div className="mc-bet-val">${bet}</div>
          <button className="mc-step" onClick={() => adjustBet(5)} disabled={drawing}>+</button>
          <div className="mc-presets">
            {[5, 10, 25].map(a => (
              <button key={a} className="mc-pre" onClick={() => !drawing && setBet(a)} disabled={drawing}>${a}</button>
            ))}
          </div>
        </div>
        <div className="mc-cards-panel">
          <div className="mc-cards-lbl">Cards</div>
          <div className="mc-card-btns">
            {CARD_OPTIONS.map(n => (
              <button
                key={n}
                className={`mc-cc-btn${numCards === n ? ' active' : ''}`}
                onClick={() => changeCards(n)}
                disabled={drawing || hasResult}
              >{n}</button>
            ))}
          </div>
        </div>
        <button className="mc-qpick-btn" onClick={quickPick} disabled={drawing}>⚡ Quick Pick</button>
      </div>

      {/* Picks Row */}
      <div className="mc-picks-row">
        <div className="mc-picks-lbl">Your picks</div>
        <div className="mc-picks-chips">
          {picks.map(n => (
            <div key={n} className="mc-pick-chip">{n}</div>
          ))}
        </div>
        <div className="mc-pips">
          {Array.from({ length: MAX_PICKS }).map((_, i) => (
            <span key={i} className={`mc-pip${i < picks.length ? ' on' : ''}`} />
          ))}
          <span className="mc-pip-ct">{picks.length} / {MAX_PICKS}</span>
        </div>
      </div>

      {/* Master Number Board */}
      <div className="mc-master-board">
        <div className="mc-mb-top">
          <div className="mc-mb-lbl">Select 5 numbers (shared across all cards)</div>
          <div className="mc-mb-note">
            {picks.length === MAX_PICKS
              ? `Total bet: $${totalBet}`
              : `${MAX_PICKS - picks.length} more needed`}
          </div>
        </div>
        <div className="mc-master-grid">
          {Array.from({ length: NUMS }).map((_, i) => {
            const n = i + 1;
            return (
              <button
                key={n}
                className={getCellClass(n)}
                onClick={() => togglePick(n)}
                disabled={hasResult || drawing}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mc-action-row">
        <button
          className={`mc-draw-btn${drawing ? ' drawing' : ''}`}
          onClick={draw}
          disabled={picks.length !== MAX_PICKS || drawing || hasResult}
        >
          {drawing ? 'Drawing...' : 'Draw Numbers'}
        </button>
        <button className="mc-sec" onClick={clearBoard} disabled={drawing}>Clear</button>
        <button className="mc-sec" onClick={newGame} disabled={drawing}>New Game</button>
      </div>

      {/* Progress */}
      {drawing && (
        <div className="mc-prog">
          <div className="mc-prog-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Cards Grid */}
      <div className={`mc-cards-grid c${numCards}`}>
        {Array.from({ length: numCards }).map((_, ci) => {
          const cr = cardResults[ci];
          return (
            <div key={ci} className={`mc-kcard${cr ? (cr.win > 0 ? ' win-card' : ' lose-card') : ''}`}>
              <div className="mc-kcard-top">
                <div className="mc-kcard-label">Card {ci + 1}</div>
                <div className={`mc-kcard-result${cr ? (cr.win > 0 ? ' pos' : ' zero') : ' zero'}`}>
                  {cr ? (cr.win > 0 ? `+$${cr.win}` : '$0') : '—'}
                </div>
              </div>
              <div className="mc-kcard-grid">
                {Array.from({ length: NUMS }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <div key={n} className={getKCardCellClass(n)}>{n}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawn Chips */}
      {drawn.length > 0 && (
        <div className="mc-drawn-sec">
          <div className="mc-drawn-hdr">Drawn Numbers</div>
          <div className="mc-drawn-chips">
            {drawn.map((n, idx) => (
              <div key={idx} className={`mc-dchip${picks.includes(n) ? ' matched' : ' plain'}`}>{n}</div>
            ))}
          </div>
        </div>
      )}

      {/* Round Result Banner */}
      {roundResult && (
        <div className={`mc-round-banner${roundResult.totalWin > 0 ? ' win' : ' lose'}`}>
          <div>
            <div className="mc-rb-lbl">Round Result — {roundResult.numCards} card{roundResult.numCards > 1 ? 's' : ''}</div>
            <div className="mc-rb-main">{roundResult.matches} match{roundResult.matches !== 1 ? 'es' : ''} on each card</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className={`mc-rb-amt${roundResult.totalWin > 0 ? ' pos' : ' zero'}`}>
              {roundResult.totalWin > 0 ? '+' : ''}${roundResult.totalWin.toLocaleString()}
            </div>
            <div className={`mc-rb-sub${roundResult.totalWin > 0 ? ' pos' : ' zero'}`}>
              {roundResult.totalWin > 0 ? '✦ Winner ✦' : 'Better luck next round'}
            </div>
          </div>
        </div>
      )}

      <div className="mc-divider" />

      {/* Payout Table */}
      <div className="mc-payout">
        <div className="mc-pay-hdr">Payout per Card</div>
        {[3, 4, 5].map(m => (
          <div key={m} className={`mc-pay-row${roundResult && roundResult.matches === m && roundResult.totalWin > 0 ? ' lit' : ''}`}>
            <span className="mc-pay-lbl">{m} matches</span>
            <span className="mc-pay-mult">{MULT[m]}× bet</span>
          </div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mc-hist">
          <div className="mc-hist-hdr">Recent Rounds</div>
          {history.map(g => (
            <div key={g.id} className="mc-hist-row">
              <div className={`mc-hdot${g.win > 0 ? ' win' : ' lose'}`} />
              <div className="mc-htime">{g.time}</div>
              <div className="mc-hcards">{g.matches} match · {g.cards} card{g.cards > 1 ? 's' : ''}</div>
              <div className={`mc-hamt${g.win > 0 ? ' pos' : ' zero'}`}>
                {g.win > 0 ? '+' : ''}${g.win}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MultiCardKeno;
