'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { BOARD_QUESTIONS } from './battle3-data';
import { BM_BOARD_QUESTIONS } from './battle4-data';
import { BOARD_POSITIONS, POWER_CARDS, type BoardAnswerKey, type BoardGame, type BoardResponse, type BoardTeamStatus, type CardId } from './battle3-types';

type Command = (command: string, details?: Record<string, unknown>) => Promise<void>;
export type BoardBattle = 3 | 4;

function currentQuestion(board: BoardGame, battle: BoardBattle) {
  const questions = battle === 4 ? BM_BOARD_QUESTIONS : BOARD_QUESTIONS;
  return questions.find((question) => question.id === board.currentQuestionId) ?? null;
}

function categoryLabel(category: string, battle: BoardBattle) {
  if (battle === 3) return category;
  return ({ VOCABULARY:'KOSA KATA', GRAMMAR:'TATABAHASA', READING:'PEMAHAMAN', WRITING:'BINA AYAT', EDITING:'SUNTINGAN' } as Record<string,string>)[category] ?? category;
}

function teamStyle(color: string, dark: string) {
  return { '--team':color, '--team-dark':dark } as CSSProperties;
}

function useBoardCountdown(endsAt: number | null) {
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    if (!endsAt) return;
    const timer = window.setInterval(() => {
      const nextClock = Date.now();
      setClock(nextClock);
      if (nextClock > endsAt + 1_200) window.clearInterval(timer);
    }, 100);
    return () => window.clearInterval(timer);
  }, [endsAt]);
  const expired = Boolean(endsAt && clock >= endsAt);
  const visible = Boolean(endsAt && clock <= endsAt + 1_200);
  const seconds = visible && endsAt ? Math.min(10, Math.max(0, Math.ceil((endsAt - clock) / 1000))) : null;
  return { seconds, expired };
}

export function TeacherBoard({ battle, board, statuses, responses, answerKey, busy, onCommand, onExit }: { battle: BoardBattle; board: BoardGame; statuses: BoardTeamStatus[]; responses: BoardResponse[]; answerKey?: BoardAnswerKey; busy: boolean; onCommand: Command; onExit: () => void }) {
  const question = currentQuestion(board, battle);
  const activeTeam = board.teams[board.turn];
  const [teamCount, setTeamCount] = useState(board.teamCount);
  const [reviewOpen, setReviewOpen] = useState(false);
  const submittedCount = statuses.filter((status) => status.submitted).length;
  const allTeamsSubmitted = submittedCount === board.teamCount;
  const { seconds: countdown } = useBoardCountdown(board.countdownEndsAt);
  const overlayVisible = Boolean(board.overlay);
  const tokens = board.teams.map((team, index) => {
    const [x,y] = team.pos === 0 ? [10.5 + (index % 3) * 3.2, 86 + Math.floor(index / 3) * 4.2] : BOARD_POSITIONS[team.pos];
    return <div key={team.name} className={`b3-token ${index === board.turn ? 'current' : ''}`} style={{ left:`${x}%`, top:`${y}%`, background:team.color }} aria-label={`${team.name} team at ${team.pos || 'start'}`}>{team.emoji}</div>;
  });

  return <section className="b3-teacher">
    <header className="b3-topbar">
      <div className="b3-brand"><span>🎲</span><strong>{battle === 4 ? 'BM BOARD GAME' : 'ENGLISH BOARD GAME'}</strong><small>BATTLE {battle}</small></div>
      <div className="b3-team-strip">{board.teams.map((team,index) => <div key={team.name} className={`b3-team-mini ${index === board.turn ? 'current' : ''}`} style={teamStyle(team.color,team.dark)}><b>{team.emoji} {team.name}</b><span>Space {team.pos || 'START'} · ⭐ {team.points}/3 · 🎴 {Object.values(team.cards).reduce((sum,value) => sum + value,0)}</span></div>)}</div>
      <button className="b3-exit" type="button" onClick={onExit}>END GAME</button>
    </header>
    <div className="b3-teacher-main">
      <div className="b3-board-panel">
        <Image src={battle === 4 ? '/battle4-board.png' : '/battle3-board.png'} width={1672} height={941} priority alt={`${battle === 4 ? 'BM' : 'English'} board game with 30 spaces and five challenge categories`} />
        {tokens}
        <div className="b3-board-status">{board.phase === 'finished' ? `🏆 ${board.teams[board.winner ?? 0].name} WINS!` : `Round ${board.round} · ${activeTeam.emoji} ${activeTeam.name} · ${board.phase.replaceAll('_',' ').toUpperCase()}`}</div>
        {board.phase === 'show_roll' && <div className="b3-board-overlay"><div><span>🎲</span><p>{activeTeam.emoji} TEAM {activeTeam.name.toUpperCase()}</p><strong>{board.roll}</strong><small>Move {board.moveTotal} spaces</small><button type="button" disabled={busy} onClick={() => void onCommand('startChallenge')}>START CHALLENGE</button></div></div>}
        {overlayVisible && board.phase !== 'show_roll' && <div className="b3-power-overlay"><span>{board.overlay!.icon}</span><strong>{board.overlay!.title}</strong><p>{board.overlay!.message}</p></div>}
        {countdown !== null && <div className={`b3-countdown-overlay ${countdown <= 3 ? 'urgent' : ''}`}><span>TIME LEFT</span><strong>{countdown || 'TIME!'}</strong><small>{countdown ? 'Answer now!' : 'Countdown finished'}</small></div>}
      </div>
      <aside className="b3-control">
        <div className="b3-section b3-turn-section" style={teamStyle(activeTeam.color,activeTeam.dark)}><div className="b3-section-title">CURRENT TURN</div><div className="b3-turn-card"><div><strong>{activeTeam.emoji} Team {activeTeam.name}</strong><span>Space {activeTeam.pos || 'START'} · Challenge points {activeTeam.points}/3</span></div><b>{activeTeam.frozen ? '🧊' : '🎲'}</b></div>
          {board.phase === 'await_roll' && <p>Roll is active on Team {activeTeam.name}’s phone.</p>}
          {board.phase === 'frozen' && <button type="button" disabled={busy} onClick={() => void onCommand('skipFrozen')}>SKIP FROZEN TURN</button>}
          {board.phase === 'answering' && <div className="b3-control-actions"><span><b>{statuses.filter((status) => status.submitted).length}/{board.teamCount}</b> teams submitted</span><button type="button" className="b3-countdown-button" disabled={busy || countdown !== null} onClick={() => void onCommand('startCountdown')}>⏱ {countdown !== null ? 'COUNTING DOWN…' : 'START 10-SEC COUNTDOWN'}</button><button type="button" disabled={busy} onClick={() => void onCommand('markMissing')}>MARK MISSING ✕</button><button type="button" disabled={busy} onClick={() => void onCommand('resolve')}>RESOLVE ROUND</button></div>}
          {board.phase === 'round_result' && <button type="button" disabled={busy} onClick={() => void onCommand('nextTurn')}>NEXT TURN ➜</button>}
        </div>
        <div className="b3-section b3-question-section"><div className="b3-section-title">MAIN-SCREEN CHALLENGE</div>{question ? <><span className="b3-category">{categoryLabel(question.category,battle)} · {question.type}</span><h2>{question.prompt}</h2>{question.options.length > 0 && <div className="b3-projector-options">{question.options.map((option,index) => <div key={option}><b>{String.fromCharCode(65 + index)}</b><span>{option}</span></div>)}</div>}{battle === 3 && question.type === 'MCQ' && board.phase === 'answering' && <div className={`b3-instant-answer ${answerKey ? 'revealed' : ''}`}>{answerKey ? <><span>✓ CORRECT ANSWER</span><strong>{answerKey.optionLetter ? `${answerKey.optionLetter}. ` : ''}{answerKey.answer}</strong></> : <button type="button" disabled={busy} onClick={() => void onCommand('showAnswer')}>👁 SHOW ANSWER NOW</button>}</div>}{battle === 4 && board.phase === 'answering' && <div className={`b3-instant-answer b4-reveal-control ${answerKey ? 'revealed' : ''}`}>{answerKey ? <><span>✓ JAWAPAN & PENERANGAN</span><strong>{answerKey.optionLetter ? `${answerKey.optionLetter}. ` : ''}{answerKey.answer}</strong><p className="b3-key-explanation">{answerKey.explanation}</p><button type="button" onClick={() => setReviewOpen(true)}>REVIEW & ACCEPT / REJECT</button></> : <button type="button" disabled={busy || !allTeamsSubmitted} onClick={async () => { await onCommand('showAnswer'); setReviewOpen(true); }}>{allTeamsSubmitted ? '👁 REVEAL ANSWER & EXPLANATION' : `WAITING FOR ALL TEAMS (${submittedCount}/${board.teamCount})`}</button>}</div>}</> : <div className="b3-empty">Waiting for {activeTeam.name} to roll.</div>}</div>
        <div className="b3-section b3-response-section">
          <div className="b3-response-heading"><div className="b3-section-title">TEAM RESPONSE STATUS</div><button type="button" disabled={!question || responses.length === 0 || (battle === 4 && !answerKey)} onClick={() => setReviewOpen(true)}>REVIEW ANSWERS <span>{responses.length}</span></button></div>
          <p className="b3-private-note">🔒 Answers stay hidden until you open Review Answers.</p>
          <div className="b3-status-list">{board.teams.map((team,index) => {
            const status = statuses[index];
            const label = status?.verdict === 'accept' ? 'ACCEPTED' : status?.verdict === 'reject' ? 'REJECTED' : status?.submitted ? 'SUBMITTED' : 'WAITING';
            return <div key={team.name} className="b3-status-row" style={teamStyle(team.color,team.dark)}><div><b>{team.emoji} {team.name}</b><small>{status?.memberName ?? 'No player'}{status?.memberCount ? ' · online' : ''}</small></div><span className={`status-${label.toLowerCase()}`}>{label}</span></div>;
          })}</div>
        </div>
        <div className="b3-section b3-new-game"><div><div className="b3-section-title">NEW BOARD</div><p>Reset positions, points, cards and questions.</p></div><select aria-label="Number of teams" value={teamCount} onChange={(event) => setTeamCount(Number(event.target.value))}>{[2,3,4,5,6].map((count) => <option key={count} value={count}>{count} teams</option>)}</select><button type="button" disabled={busy} onClick={() => void onCommand('newGame',{teamCount})}>RESET</button></div>
      </aside>
    </div>
    {reviewOpen && <div className="b3-review-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReviewOpen(false); }}><section className="b3-review-panel" role="dialog" aria-modal="true" aria-labelledby="b3-review-title">
      <header><div><span>TEACHER ONLY</span><h2 id="b3-review-title">Review team answers</h2><p>{submittedCount}/{board.teamCount} teams submitted</p></div><button type="button" aria-label="Close answer review" onClick={() => setReviewOpen(false)}>✕</button></header>
      {(battle === 4 || question?.type === 'MCQ') && <div className={`b3-key-reveal ${answerKey ? 'unlocked' : ''}`}>{answerKey ? <><span>{battle === 4 ? 'JAWAPAN & PENERANGAN' : 'CORRECT ANSWER'}</span><strong>{answerKey.optionLetter ? `${answerKey.optionLetter}. ` : ''}{answerKey.answer}</strong><p className="b3-key-explanation">{answerKey.explanation}</p></> : <><span>ANSWER NOT SHOWN YET</span><strong>{battle === 4 ? 'The answer unlocks after every team submits and you press Reveal.' : 'Use “Show Answer Now” whenever you are ready.'}</strong></>}</div>}
      <div className="b3-review-list">{board.teams.map((team,index) => {
        const response = responses.find((item) => item.teamIndex === index);
        const status = statuses[index];
        const keyMatch = Boolean(answerKey && response && response.answer.trim().toLocaleLowerCase() === answerKey.answer.trim().toLocaleLowerCase());
        return <article key={team.name} style={teamStyle(team.color,team.dark)}><div className="b3-review-team"><b>{team.emoji} {team.name}</b><small>{status?.memberName ?? 'No player assigned'}</small></div><div className="b3-review-answer">{response?.answer || <em>Waiting for an answer…</em>}{answerKey && response && <span className={keyMatch ? 'match' : 'different'}>{keyMatch ? '✓ Matches key' : 'Check against key'}</span>}</div><div className="b3-review-judge"><button type="button" disabled={busy || !response || (battle === 4 && !answerKey)} className={response?.verdict === 'accept' ? 'selected accept' : ''} onClick={() => void onCommand('judge',{teamIndex:index,verdict:'accept'})}>✓ ACCEPT</button><button type="button" disabled={busy || !response || (battle === 4 && !answerKey)} className={response?.verdict === 'reject' ? 'selected reject' : ''} onClick={() => void onCommand('judge',{teamIndex:index,verdict:'reject'})}>✕ REJECT</button></div></article>;
      })}</div>
      <footer><span>{battle === 4 && !allTeamsSubmitted ? 'Reveal unlocks after every team submits.' : battle === 4 && !answerKey ? 'Return to the challenge panel and reveal the answer and bilingual explanation.' : question?.type === 'MCQ' && !answerKey ? 'You can reveal the MCQ key immediately from the challenge panel.' : allTeamsSubmitted ? 'Every team has submitted. Review and mark their answers.' : 'Review submitted answers, then accept or reject each team.'}</span><button type="button" onClick={() => setReviewOpen(false)}>DONE</button></footer>
    </section></div>}
  </section>;
}

export function StudentBoard({ battle, board, statuses, myTeam, connected, busy, answer, onAnswerChange, onChooseTeam, onCommand, onSubmit }: { battle: BoardBattle; board: BoardGame; statuses: BoardTeamStatus[]; myTeam: number | null; connected: boolean; busy: boolean; answer: string; onAnswerChange: (value: string) => void; onChooseTeam: (teamIndex: number) => Promise<void>; onCommand: Command; onSubmit: (questionId: string, answer: string) => Promise<void> }) {
  const question = currentQuestion(board, battle);
  const [selectedOption, setSelectedOption] = useState('');
  const [targetCard, setTargetCard] = useState<CardId | null>(null);
  const { seconds: countdown, expired: countdownExpired } = useBoardCountdown(board.countdownEndsAt);

  if (myTeam === null || !board.teams[myTeam]) return <main className="b3-student-shell team-pick-shell"><section className="b3-team-pick"><div className="b3-dice-logo">🎲</div><p>BATTLE {battle}</p><h1>Choose your team</h1><span>Each colour has one player. Taken teams cannot be chosen again.</span><div>{board.teams.map((team,index) => { const taken = Boolean(statuses[index]?.occupied); return <button key={team.name} type="button" disabled={busy || taken} className={taken ? 'taken' : ''} style={teamStyle(team.color,team.dark)} onClick={() => void onChooseTeam(index)}><b>{team.emoji}</b><strong>{team.name}</strong><small>{taken ? `TAKEN · ${statuses[index]?.memberName ?? 'Player'}` : 'AVAILABLE'}</small></button>; })}</div><footer><i className={connected ? 'online' : ''} />{connected ? 'Connected — your place is saved' : 'Reconnecting automatically…'}</footer></section></main>;

  const team = board.teams[myTeam];
  const activeTeam = board.teams[board.turn];
  const teamStatus = statuses[myTeam];
  const submitted = Boolean(teamStatus?.submitted);
  const selectedAnswer = question?.options.length ? selectedOption : answer;
  const canUse = (cardId: CardId) => {
    if (!team.cards[cardId]) return false;
    if (cardId === 'shield') return !team.shieldArmed;
    if (cardId === 'double') return !team.doubleArmed;
    if (cardId === 'boost' || cardId === 'freeze' || cardId === 'back2') return board.turn === myTeam && board.phase === 'await_roll';
    return cardId === 'reroll' && board.turn === myTeam && board.phase === 'show_roll';
  };
  const activateCard = async (cardId: CardId) => {
    if (cardId === 'freeze' || cardId === 'back2') { setTargetCard(cardId); return; }
    await onCommand('useCard',{cardId});
  };

  return <main className="b3-student-shell" style={teamStyle(team.color,team.dark)}><section className="b3-phone">
    {countdown !== null && <div className={`b3-phone-countdown ${countdown <= 3 ? 'urgent' : ''}`}><span>GET READY</span><strong>{countdown || 'TIME!'}</strong><small>{countdown ? 'Send your answer!' : 'Countdown finished'}</small></div>}
    <header><div><span>{team.emoji}</span><p>TEAM {team.name.toUpperCase()}</p><small>Battle {battle} · Space {team.pos || 'START'}</small></div><div className={`b3-phone-signal ${connected ? 'online' : ''}`}><i />{connected ? 'Connected' : 'Reconnecting'}</div></header>
    <div className="b3-phone-body">
      <div className="b3-score-card"><div><span>CHALLENGE POINTS</span><strong>{team.points} / 3</strong></div><div className="b3-point-dots">{[0,1,2].map((point) => <i key={point} className={point < team.points ? 'on' : ''} />)}</div><small>At 3 points, your team draws a Power Card.</small></div>
      <div className="b3-turn-phone">{board.phase === 'await_roll' && board.turn === myTeam ? <><strong>🎲 Your team’s turn!</strong><button type="button" disabled={busy} onClick={() => void onCommand('roll')}>ROLL DICE</button></> : board.phase === 'frozen' && board.turn === myTeam ? <strong>🧊 Your team is frozen. Watch the board.</strong> : <><strong>{activeTeam.emoji} {activeTeam.name} team is playing</strong><span>{board.phase === 'answering' ? 'Everyone answers now!' : 'Watch the main screen'}</span></>}</div>
      {question && board.phase === 'answering' ? <div className={`b3-phone-question ${countdownExpired ? 'time-locked' : ''}`}><span>{categoryLabel(question.category,battle)} · {question.type}</span><h2>{question.prompt}</h2>{submitted ? <div className="b3-submitted">✓ Team answer submitted<br/><small>Waiting for the teacher.</small></div> : <>{question.options.length ? <div className="b3-phone-options">{question.options.map((option,index) => <button type="button" key={option} disabled={countdownExpired} className={selectedOption === option ? 'selected' : ''} onClick={() => setSelectedOption(option)}><b>{String.fromCharCode(65 + index)}</b>{option}</button>)}</div> : <textarea maxLength={900} value={answer} disabled={countdownExpired} onChange={(event) => onAnswerChange(event.target.value)} placeholder="Type your team answer…" autoCorrect="off" autoCapitalize="sentences"/>}<button className="b3-submit" type="button" disabled={busy || countdownExpired || !selectedAnswer.trim()} onClick={() => void onSubmit(question.id,selectedAnswer)}>{countdownExpired ? 'TIME’S UP — ANSWER LOCKED' : 'SUBMIT TEAM ANSWER ➜'}</button></>}</div> : board.phase === 'round_result' || board.phase === 'finished' ? <div className={`b3-team-result ${teamStatus?.verdict === 'accept' ? 'accepted' : 'rejected'}`}><span>{teamStatus?.verdict === 'accept' ? '✓' : '✕'}</span><strong>{teamStatus?.verdict === 'accept' ? 'ACCEPTED!' : 'NOT ACCEPTED'}</strong><p>Look at the main screen for the board movement.</p></div> : <div className="b3-phone-waiting">The board and next challenge stay on the main screen.</div>}
      <div className="b3-pocket"><div><span>POWER CARD POCKET</span><small>Tap a glowing card when it can be used.</small></div><section>{POWER_CARDS.map((card) => <button key={card.id} type="button" disabled={busy || !canUse(card.id)} className={canUse(card.id) ? 'usable' : ''} onClick={() => void activateCard(card.id)}><b>{card.icon}</b><span>{card.name}</span><small>×{team.cards[card.id]}</small></button>)}</section></div>
      {targetCard && <div className="b3-target"><strong>Choose another team</strong><div>{board.teams.map((target,index) => index === myTeam ? null : <button key={target.name} type="button" style={teamStyle(target.color,target.dark)} onClick={() => { void onCommand('useCard',{cardId:targetCard,targetIndex:index}); setTargetCard(null); }}>{target.emoji} {target.name}</button>)}</div><button type="button" onClick={() => setTargetCard(null)}>Cancel</button></div>}
    </div>
  </section></main>;
}
