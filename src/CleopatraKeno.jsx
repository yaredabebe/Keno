import { useState, useCallback, useRef } from 'react';
import './CleopatraKeno.css';

const SYMS = ['𓂀','𓆣','𓁹','𓃭','𓆙','𓅓','𓈖','𓊹','𓋹','𓌀','𓍯','𓎛','𓏏','𓐍','𓀭','𓁢','𓂋','𓃀','𓄿','𓅱'];
const MAX_PICKS = 5;
const NUMS = 20;
const DRAWS = 10;
const MULT = { 0:0, 1:0, 2:0, 3:10, 4:25, 5:100 };

function CleopatraKeno() {
  const [picks, setPicks]         = useState([]);
  const [drawn, setDrawn]         = useState([]);
  const [drawing, setDrawing]     = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [result, setResult]       = useState(null);
  const [scarabNum, setScarabNum] = useState(null);
  const [scarabBonus, setScarabBonus] = useState(false);
  const [balance, setBalance]     = useState(1000);
  const [bet, setBet]             = useState(10);
  const [pharaohStreak, setPharaohStreak] = useState(0);
  const [progress, setProgress]   = useState(0);
  const [stats, setStats]         = useState({ played:0, wins:0, bigWin:0, scarabs:0 });
  const [history, setHistory]     = useState([]);
  const streakTimer = useRef(null);
  const streakRef   = useRef(0);

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

  const oraclePick = () => {
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
    setResult(null);
    setScarabNum(null);
    setScarabBonus(false);
    setProgress(0);
  };

  const newReign = () => {
    if (drawing) return;
    clearBoard();
    setBalance(1000);
    setPharaohStreak(0);
    streakRef.current = 0;
    setStats({ played:0, wins:0, bigWin:0, scarabs:0 });
    setHistory([]);
  };

  const adjustBet = (amt) => {
    if (drawing) return;
    setBet(prev => Math.max(5, Math.min(100, prev + amt)));
  };

  const getCellClass = (n) => {
    const ip = picks.includes(n);
    const id = drawn.includes(n);
    const is = scarabNum === n;
    if (ip && id) return 'cleo-cell hit';
    if (ip)       return 'cleo-cell picked';
    if (id)       return 'cleo-cell drawn-plain';
    if (is && !id) return 'cleo-cell scarab';
    return 'cleo-cell';
  };

  const draw = useCallback(async () => {
    if (picks.length !== MAX_PICKS || drawing || hasResult) return;
    if (balance < bet) { alert('Not enough gold for the offering!'); return; }

    setDrawing(true);
    setDrawn([]);
    setHasResult(false);
    setResult(null);
    setScarabNum(null);
    setScarabBonus(false);
    setProgress(0);
    setBalance(prev => prev - bet);

    const dn = [];
    for (let i = 0; i < DRAWS; i++) {
      await new Promise(r => setTimeout(r, 155));
      let rand;
      do { rand = Math.floor(Math.random() * NUMS) + 1; } while (dn.includes(rand));
      dn.push(rand);
      setDrawn([...dn]);
      setProgress(Math.round(((i + 1) / DRAWS) * 100));
    }

    const sn = Math.floor(Math.random() * NUMS) + 1;
    setScarabNum(sn);
    const isScarab = picks.includes(sn) && !dn.includes(sn);

    let matches = picks.filter(p => dn.includes(p)).length;
    if (isScarab) matches = Math.min(matches + 1, MAX_PICKS);

    let win = MULT[matches] * bet;
    const currentStreak = streakRef.current;
    let streakBonus = 0;
    if (currentStreak > 0 && win > 0) {
      streakBonus = Math.floor(win * currentStreak * 0.15);
      win += streakBonus;
    }

    if (isScarab) {
      setScarabBonus(true);
      setStats(prev => ({ ...prev, scarabs: prev.scarabs + 1 }));
    }

    if (win > 0) {
      setBalance(prev => prev + win);
      const next = currentStreak + 1;
      streakRef.current = next;
      setPharaohStreak(next);
      if (streakTimer.current) clearTimeout(streakTimer.current);
      streakTimer.current = setTimeout(() => {
        streakRef.current = 0;
        setPharaohStreak(0);
      }, 7000);
    } else {
      streakRef.current = 0;
      setPharaohStreak(0);
    }

    setStats(prev => ({
      ...prev,
      played: prev.played + 1,
      wins: prev.wins + (win > 0 ? 1 : 0),
      bigWin: Math.max(prev.bigWin, win),
    }));

    setHistory(prev => [{
      id: Date.now(),
      matches,
      win,
      scarab: isScarab,
      streakBonus,
      sn,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }, ...prev].slice(0, 8));

    setResult({ matches, win, scarab: isScarab, sn, streakBonus });
    setHasResult(true);
    setDrawing(false);
    setProgress(0);
  }, [picks, balance, bet, drawing, hasResult]);

  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) + '%' : '—';

  return (
    <div className="cleo-wrap">

      {/* Header */}
      <div className="cleo-header">
        <div className="cleo-eyebrow">☥ REALM OF THE PHARAOHS ☥</div>
        <h1 className="cleo-title">
          <span className="cleo-gold">CLEOPATRA</span> KENO
        </h1>
        <div className="cleo-subtitle">Choose your hieroglyphs · Invoke the oracle · Claim the treasure</div>
        <div className="cleo-divider-row">
          <div className="cleo-line" />
          <span className="cleo-scarab-icon">𓆣</span>
          <div className="cleo-line" />
        </div>
      </div>

      {/* Stats */}
      <div className="cleo-stats">
        <div className="cleo-stat">
          <div className="cleo-stat-lbl">Royal Treasury</div>
          <div className="cleo-stat-val">${balance.toLocaleString()}</div>
        </div>
        <div className="cleo-stat">
          <div className="cleo-stat-lbl">Greatest Bounty</div>
          <div className="cleo-stat-val">${stats.bigWin.toLocaleString()}</div>
        </div>
        <div className="cleo-stat">
          <div className="cleo-stat-lbl">Scarab Blessings</div>
          <div className="cleo-stat-val">{stats.scarabs}</div>
        </div>
        {pharaohStreak > 0 ? (
          <div className="cleo-stat pharaoh">
            <div className="cleo-stat-lbl">Pharaoh Streak</div>
            <div className="cleo-stat-val">×{pharaohStreak}</div>
          </div>
        ) : (
          <div className="cleo-stat">
            <div className="cleo-stat-lbl">Win Rate</div>
            <div className="cleo-stat-val">{winRate}</div>
          </div>
        )}
      </div>

      {/* Bet Controls */}
      <div className="cleo-bet-row">
        <div className="cleo-bet-panel">
          <div className="cleo-bet-lbl">Offering</div>
          <button className="cleo-step" onClick={() => adjustBet(-5)} disabled={drawing}>−</button>
          <div className="cleo-bet-val">${bet}</div>
          <button className="cleo-step" onClick={() => adjustBet(5)} disabled={drawing}>+</button>
          <div className="cleo-presets">
            {[5, 10, 25, 50].map(a => (
              <button key={a} className="cleo-pre" onClick={() => !drawing && setBet(a)} disabled={drawing}>${a}</button>
            ))}
          </div>
        </div>
        <button className="cleo-oracle-btn" onClick={oraclePick} disabled={drawing}>𓂀 Oracle Choose</button>
      </div>

      {/* Board */}
      <div className="cleo-board">
        <div className="cleo-board-top">
          <div className="cleo-board-lbl">Select Your Hieroglyphs</div>
          <div className="cleo-pips">
            {Array.from({ length: MAX_PICKS }).map((_, i) => (
              <span key={i} className={`cleo-pip${i < picks.length ? ' on' : ''}`} />
            ))}
            <span className="cleo-pip-ct">{picks.length} / {MAX_PICKS}</span>
          </div>
        </div>
        <div className="cleo-grid">
          {Array.from({ length: NUMS }).map((_, i) => {
            const n = i + 1;
            const isHit = picks.includes(n) && drawn.includes(n);
            return (
              <button
                key={n}
                className={getCellClass(n)}
                onClick={() => togglePick(n)}
                disabled={hasResult || drawing}
              >
                <span className="cnum">{n}</span>
                <span className="csym">{SYMS[i]}</span>
                {isHit && <span className="hit-ankh">☥</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      {drawing && (
        <div className="cleo-prog">
          <div className="cleo-prog-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Actions */}
      <div className="cleo-actions">
        <button
          className={`cleo-draw-btn${drawing ? ' drawing' : ''}`}
          onClick={draw}
          disabled={picks.length !== MAX_PICKS || drawing || hasResult}
        >
          {drawing ? 'The oracle speaks...' : 'Consult the Oracle'}
        </button>
        <button className="cleo-sec" onClick={clearBoard} disabled={drawing}>Clear</button>
        <button className="cleo-sec" onClick={newReign} disabled={drawing}>New Reign</button>
      </div>

      {/* Scarab Banner */}
      {result && result.scarab && (
        <div className="cleo-scarab-banner">
          <div>
            <div className="csb-lbl">Sacred Scarab Blessing</div>
            <div className="csb-txt">𓆣 Scarab {result.sn} {SYMS[result.sn - 1]} grants +1 match!</div>
          </div>
          <div className="csb-badge">DIVINE GIFT</div>
        </div>
      )}

      {/* Streak Bonus Banner */}
      {result && result.streakBonus > 0 && (
        <div className="cleo-mult-banner">
          <div>
            <div className="cmb-lbl">Pharaoh Streak Bonus</div>
            <div className="cmb-txt">×{pharaohStreak} streak adds +${result.streakBonus}</div>
          </div>
          <div className="cmb-val">PHARAOH BLESSED</div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`cleo-result${result.win > 0 ? ' win' : ' lose'}`}>
          <div>
            <div className="cleo-res-lbl">Hieroglyphs Matched</div>
            <div className="cleo-res-main">{result.matches} of {MAX_PICKS}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className={`cleo-res-amt${result.win > 0 ? ' pos' : ' zero'}`}>
              {result.win > 0 ? '+' : ''}${result.win.toLocaleString()}
            </div>
            <div className={`cleo-res-sub${result.win > 0 ? ' pos' : ' zero'}`}>
              {result.win > 0 ? '☥ The Pharaoh Smiles ☥' : 'The oracle is silent'}
            </div>
          </div>
        </div>
      )}

      {/* Drawn Chips */}
      {drawn.length > 0 && (
        <div className="cleo-drawn">
          <div className="cleo-drawn-hdr">Revealed Hieroglyphs</div>
          <div className="cleo-chips">
            {drawn.map((n, idx) => (
              <div key={idx} className={`cleo-chip${picks.includes(n) ? ' matched' : ' plain'}`}>{n}</div>
            ))}
            {result && result.scarab && (
              <div className="cleo-chip scarab-chip">𓆣{result.sn}</div>
            )}
          </div>
        </div>
      )}

      <div className="cleo-divider" />

      {/* Payout Table */}
      <div className="cleo-payout">
        <div className="cleo-pay-hdr">Pharaoh's Rewards</div>
        {[3, 4, 5].map(m => (
          <div key={m} className={`cleo-pay-row${result && result.matches === m && result.win > 0 ? ' lit' : ''}`}>
            <span className="cleo-pay-lbl">{m} hieroglyphs matched</span>
            <span className="cleo-pay-mult">{MULT[m]}× offering{m === 5 ? ' + Scarab' : ''}</span>
          </div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="cleo-hist">
          <div className="cleo-hist-hdr">Scroll of Fates</div>
          {history.map(g => (
            <div key={g.id} className="cleo-hist-row">
              <div className={`cleo-hdot${g.win > 0 ? ' win' : ' lose'}`} />
              <div className="cleo-htime">{g.time}</div>
              <div className="cleo-hmatch">
                {g.scarab && <span className="cleo-hscarab">𓆣 </span>}
                {g.matches} glyph{g.matches !== 1 ? 's' : ''}
              </div>
              <div className={`cleo-hamt${g.win > 0 ? ' pos' : ' zero'}`}>
                {g.win > 0 ? '+' : ''}${g.win}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CleopatraKeno;
