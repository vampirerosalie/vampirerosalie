'use client';

import { useEffect, useMemo, useState } from 'react';
import { POTION_COORDS, POTION_QUESTIONS } from './battle6-data';
import type { PotionAnswerKey, PotionGame, PotionResponse, PotionTeamStatus } from './battle6-types';

type Command = (command: string, details?: Record<string, unknown>) => Promise<void>;

function usePotionCountdown(endsAt: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!endsAt) return;
    const timer = setInterval(() => setNow(Date.now()), 120);
    return () => clearInterval(timer);
  }, [endsAt]);
  if (!endsAt) return { seconds: null, expired: false };
  const remaining = Math.max(0, endsAt - now);
  return { seconds: Math.ceil(remaining / 1000), expired: remaining <= 0 };
}

function questionFor(game: PotionGame) {
  const question = POTION_QUESTIONS.find((item) => item.id === game.currentQuestionId);
  if (!question) return null;
  const order = game.optionOrders?.[question.id];
  if (!order?.length) return question;
  const options = order.map((index) => question.options[index]).filter((option): option is string => typeof option === 'string');
  return options.length === question.options.length ? { ...question, options } : question;
}

function teamStyle(color: string, dark: string) {
  return { '--team': color, '--team-dark': dark } as React.CSSProperties;
}

function tiedRanks(game: PotionGame) {
  const sorted = game.teams.map((team, index) => ({ ...team, index })).sort((a, b) => b.treasure - a.treasure || a.index - b.index);
  let previous = -1;
  let rank = 0;
  return sorted.map((team, index) => {
    if (team.treasure !== previous) rank = index + 1;
    previous = team.treasure;
    return { ...team, rank };
  });
}

export function TeacherPotion({ game, statuses, responses, answerKey, busy, onCommand, onExit }: { game: PotionGame; statuses: PotionTeamStatus[]; responses: PotionResponse[]; answerKey?: PotionAnswerKey; busy: boolean; onCommand: Command; onExit: () => void }) {
  const question = questionFor(game);
  const [reviewOpen, setReviewOpen] = useState(false);
  const { seconds: answerCountdown } = usePotionCountdown(game.countdownEndsAt);
  const { seconds: pickCountdown } = usePotionCountdown(game.pickEndsAt);
  const submitted = statuses.filter((status) => status.submitted).length;
  const judged = statuses.filter((status) => status.verdict).length;
  const planted = game.teams.filter((team) => !team.needsPoison).length;
  const ranking = useMemo(() => tiedRanks(game), [game]);
  const reveals = game.roundReveals ?? [];
  const claimed = (game.picks ?? []).filter((number): number is number => number !== null);
  const pickedCount = game.eligible.filter((teamIndex) => game.picks?.[teamIndex] !== null).length;
  const unopened = 40 - game.opened.length;

  return <section className="p6-teacher">
    <header className="p6-topbar">
      <div className="p6-brand"><span>🧪</span><div><strong>WITCH’S POTION</strong><small>BATTLE 6 · ROUND {Math.max(1, game.round)}/20</small></div></div>
      <div className="p6-team-strip">{game.teams.map((team, index) => { const reveal = reveals.find((item) => item.chooser === index); const pick = game.picks?.[index]; const phaseStatus = game.phase === 'potion_pick' ? game.eligible.includes(index) ? pick ? `Potion ${pick} locked` : 'Choosing…' : 'Not eligible' : game.phase === 'reveal' && reveal ? `${reveal.type} · Potion ${reveal.number}` : statuses[index]?.submitted ? 'Submitted' : game.phase === 'question' ? 'Waiting' : team.needsPoison ? 'Needs poison' : 'Poison ready'; return <div key={team.name} style={teamStyle(team.color, team.dark)}><b>{team.emoji} {team.name}</b><span>💎 {team.treasure} · ☠ {team.poison}/3</span><small>{phaseStatus}</small></div>; })}</div>
      <button type="button" className="p6-exit" onClick={onExit}>EXIT GAME</button>
    </header>
    <div className="p6-main">
      <div className="p6-shelf-panel">
        <img src="/witch-potion-shelf.png" alt="Illustrated magical shelf with forty numbered potion bottles" />
        {game.opened.map((number) => { const [x, y] = POTION_COORDS[number]; return <span key={number} className="p6-x" style={{ left: `${x}%`, top: `${y}%` }}>✕</span>; })}
        {game.phase === 'potion_pick' && claimed.map((number) => { const [x, y] = POTION_COORDS[number]; return <span key={`claim-${number}`} className="p6-claim" style={{ left: `${x}%`, top: `${y}%` }}>🔒</span>; })}
        <div className="p6-shelf-hud"><b>ROUND {Math.max(1, game.round)}/20</b><span>{unopened} POTIONS LEFT</span><span>💎 {game.treasuresRemaining}/12 HIDDEN</span><span>{planted}/{game.teamCount} POISONS READY</span></div>
        {question && game.phase === 'question' && <div className="p6-question-card"><span>{question.category} · {question.type}</span><h2>{question.prompt}</h2>{question.options.length > 0 && <div>{question.options.map((option, index) => <p key={option}><b>{String.fromCharCode(65 + index)}</b>{option}</p>)}</div>}</div>}
        {answerCountdown !== null && <div className={`p6-countdown ${answerCountdown <= 3 ? 'urgent' : ''}`}><span>TIME LEFT</span><strong>{answerCountdown || 'TIME!'}</strong><small>{answerCountdown ? 'Phones remain active until zero' : 'Answers are locked'}</small></div>}
        {game.phase === 'potion_pick' && pickCountdown !== null && <div className={`p6-pick-countdown ${pickCountdown <= 3 ? 'urgent' : ''}`}><span>ALL TEAMS CHOOSE</span><strong>{pickCountdown || '0'}</strong><small>{pickedCount}/{game.eligible.length} locked in</small></div>}
        {game.phase === 'reveal' && reveals.length > 0 && <div className="p6-reveal p6-group-reveal"><span>✨ POTIONS REVEALED ✨</span><div>{reveals.map((reveal) => { const team = game.teams[reveal.chooser]; return <article key={reveal.chooser} className={`p6-${reveal.type.toLowerCase()}`} style={teamStyle(team.color, team.dark)}><b>{team.emoji} {team.name}</b><strong>{reveal.type === 'POISON' ? '☠️' : reveal.type === 'TREASURE' ? '💎' : '✨'} Potion {reveal.number}</strong><p>{reveal.type}</p>{reveal.fullyPoisoned && <em>−1 Treasure · Poison resets to 1/3</em>}</article>; })}</div></div>}
        {game.phase === 'restock' && <div className="p6-reveal p6-restock"><span>🧙‍♀️✨</span><strong>THE WITCH RESTOCKS THE SHELF!</strong><p>All 40 potions return. Every team must secretly plant a new poison.</p></div>}
        {game.phase === 'finished' && <div className="p6-finished"><span>🏆</span><h2>FINAL TREASURE LEADERBOARD</h2><div>{ranking.map((team) => <p key={team.name} style={teamStyle(team.color, team.dark)}><b>#{team.rank}</b><strong>{team.emoji} {team.name}</strong><span>💎 {team.treasure}</span>{ranking.filter((other) => other.rank === team.rank).length > 1 && <em>TIED</em>}</p>)}</div><button type="button" disabled={busy} onClick={() => void onCommand('newGame',{ teamCount:game.teamCount })}>PLAY AGAIN</button></div>}
      </div>
      <aside className="p6-control">
        <div className="p6-control-head"><div><span>TEACHER CONTROL</span><h2>{game.phase.replaceAll('_', ' ')}</h2></div><b>{game.opened.length}/40 OPENED</b></div>
        {game.phase === 'poison_setup' && <section><h3>SECRET POISON SETUP</h3><p>{planted}/{game.teamCount} teams have planted a poison. Locations stay hidden.</p><div className="p6-progress"><i style={{ width:`${planted / game.teamCount * 100}%` }} /></div><button type="button" disabled={busy || planted !== game.teamCount} onClick={() => void onCommand('startQuestion')}>{planted === game.teamCount ? game.round ? 'CONTINUE TO NEXT QUESTION' : 'START QUESTION 1' : 'WAITING FOR POISONS…'}</button></section>}
        {game.phase === 'question' && <section><h3>ALL TEAMS ANSWER</h3><p><b>{submitted}/{game.teamCount}</b> submitted · <b>{judged}/{game.teamCount}</b> judged</p><button type="button" className="p6-gold" disabled={busy || answerCountdown !== null} onClick={() => void onCommand('startCountdown')}>⏱ {answerCountdown !== null ? 'COUNTING DOWN…' : 'START 10-SEC COUNTDOWN'}</button><button type="button" disabled={busy || responses.length === 0} onClick={() => setReviewOpen(true)}>REVIEW ANSWERS ({responses.length})</button><button type="button" disabled={busy} onClick={() => void onCommand('markMissing')}>MARK MISSING AS REJECTED</button><button type="button" className="p6-green" disabled={busy || judged !== game.teamCount} onClick={() => void onCommand('startPotionPhase')}>OPEN POTION PHASE</button></section>}
        {game.phase === 'potion_pick' && <section><h3>SIMULTANEOUS POTION PICK</h3><p>All accepted teams choose together. The first confirmed tap locks each number.</p><p><b>{pickedCount}/{game.eligible.length}</b> teams locked in · {pickCountdown ?? 0} seconds remaining.</p><div className="p6-progress"><i style={{ width:`${game.eligible.length ? pickedCount / game.eligible.length * 100 : 0}%` }} /></div></section>}
        {game.phase === 'reveal' && <section><h3>ALL RESULTS REVEALED</h3><p>{reveals.length} team result{reveals.length === 1 ? '' : 's'} shown together. Each phone displays only its own result.</p><button type="button" className="p6-green" disabled={busy} onClick={() => void onCommand('continueReveal')}>{game.round >= 20 ? 'SHOW FINAL RESULTS' : 'CONTINUE GAME'}</button></section>}
        {game.phase === 'restock' && <section><h3>MAGICAL RESTOCK</h3><p>{game.treasuresRemaining === 0 ? 'All 12 Treasures were discovered.' : 'Ten or fewer unopened potions remain.'} Treasure and Poison scores remain.</p><button type="button" className="p6-gold" disabled={busy} onClick={() => void onCommand('restock')}>RESTOCK ALL 40 POTIONS</button></section>}
        {question && <section className="p6-question-summary"><span>CURRENT QUESTION</span><strong>{question.id} · {question.category}</strong><p>{question.prompt}</p></section>}
        <section className="p6-status-list"><h3>TEAM STATUS</h3>{game.teams.map((team, index) => <div key={team.name} style={teamStyle(team.color, team.dark)}><b>{team.emoji} {team.name}</b><span>{statuses[index]?.verdict === 'accept' ? '✓ Accepted' : statuses[index]?.verdict === 'reject' ? '✕ Rejected' : statuses[index]?.submitted ? 'Submitted' : 'Waiting'}</span></div>)}</section>
        <section className="p6-events"><h3>RECENT EVENTS</h3>{game.eventLog.slice(0, 6).map((event, index) => <p key={`${event}-${index}`}>{event}</p>)}</section>
      </aside>
    </div>
    {reviewOpen && <div className="p6-review" role="dialog" aria-modal="true" aria-labelledby="p6-review-title"><div>
      <header><div><span>TEACHER ONLY</span><h2 id="p6-review-title">Review team answers</h2><p>{submitted}/{game.teamCount} teams submitted</p></div><button type="button" aria-label="Close answer review" onClick={() => setReviewOpen(false)}>✕</button></header>
      <div className="p6-key"><span>ANSWER KEY / SUGGESTED ANSWER</span><strong>{answerKey?.optionLetter ? `${answerKey.optionLetter}. ` : ''}{answerKey?.answer ?? 'No active question'}</strong>{answerKey?.explanation && <p>{answerKey.explanation}</p>}</div>
      <div className="p6-review-list">{game.teams.map((team, index) => { const response = responses.find((item) => item.teamIndex === index); const status = statuses[index]; return <article key={team.name} style={teamStyle(team.color, team.dark)}><div><b>{team.emoji} {team.name}</b><small>{status?.memberName ?? 'No player assigned'}</small></div><p>{response?.answer || <em>Waiting for an answer…</em>}</p><div><button type="button" disabled={busy || !response} className={status?.verdict === 'accept' ? 'selected accept' : ''} onClick={() => void onCommand('judge',{ teamIndex:index, verdict:'accept' })}>✓ ACCEPT</button><button type="button" disabled={busy || !response} className={status?.verdict === 'reject' ? 'selected reject' : ''} onClick={() => void onCommand('judge',{ teamIndex:index, verdict:'reject' })}>✕ REJECT</button></div></article>; })}</div>
      <footer><span>Only this review panel contains student answers and the key.</span><button type="button" onClick={() => setReviewOpen(false)}>DONE</button></footer>
    </div></div>}
  </section>;
}

export function StudentPotion({ game, statuses, myTeam, connected, busy, answer, onAnswerChange, onChooseTeam, onCommand, onSubmit }: { game: PotionGame; statuses: PotionTeamStatus[]; myTeam: number | null; connected: boolean; busy: boolean; answer: string; onAnswerChange: (value: string) => void; onChooseTeam: (teamIndex: number) => Promise<void>; onCommand: Command; onSubmit: (questionId: string, answer: string) => Promise<void> }) {
  const question = questionFor(game);
  const { seconds: answerCountdown, expired } = usePotionCountdown(game.countdownEndsAt);
  const { seconds: pickCountdown, expired: pickExpired } = usePotionCountdown(game.pickEndsAt);
  const [selectedOption, setSelectedOption] = useState('');
  const status = myTeam === null ? null : statuses[myTeam];
  const submitted = Boolean(status?.submitted);

  if (myTeam === null || !game.teams[myTeam]) return <main className="p6-phone-shell p6-team-pick"><section><div className="p6-phone-logo">🧪</div><p>BATTLE 6</p><h1>Choose your team</h1><span>Each colour has one place. Taken teams cannot be selected.</span><div>{game.teams.map((team, index) => { const taken = Boolean(statuses[index]?.occupied); return <button key={team.name} type="button" disabled={busy || taken} className={taken ? 'taken' : ''} style={teamStyle(team.color, team.dark)} onClick={() => void onChooseTeam(index)}><b>{team.emoji}</b><strong>{team.name}</strong><small>{taken ? `TAKEN · ${statuses[index]?.memberName ?? 'Player'}` : 'AVAILABLE'}</small></button>; })}</div><footer><i className={connected ? 'online' : ''} />{connected ? 'Connected — your place is saved' : 'Reconnecting automatically…'}</footer></section></main>;

  const team = game.teams[myTeam];
  const needsPoison = team.needsPoison && game.phase === 'poison_setup';
  const myPick = game.picks?.[myTeam] ?? null;
  const canPick = game.phase === 'potion_pick' && game.eligible.includes(myTeam) && myPick === null && !pickExpired;
  const selectedAnswer = question?.type === 'MCQ' ? selectedOption : answer;
  const myReveal = game.phase === 'reveal' ? game.roundReveals?.find((reveal) => reveal.chooser === myTeam) : undefined;
  const claimed = (game.picks ?? []).filter((number): number is number => number !== null);

  return <main className="p6-phone-shell" style={teamStyle(team.color, team.dark)}><section className="p6-phone">
    {game.phase === 'question' && answerCountdown !== null && <div className={`p6-phone-countdown ${answerCountdown <= 3 ? 'urgent' : ''}`}><span>TIME LEFT</span><strong>{answerCountdown || '0'}</strong><small>{answerCountdown ? 'Keep answering' : 'Answer locked'}</small></div>}
    {game.phase === 'potion_pick' && pickCountdown !== null && <div className={`p6-phone-countdown ${pickCountdown <= 3 ? 'urgent' : ''}`}><span>CHOOSE NOW</span><strong>{pickCountdown || '0'}</strong><small>{myPick ? `Potion ${myPick} locked` : pickCountdown ? 'Grid stays active' : 'Auto-picking'}</small></div>}
    <header><div><span>{team.emoji}</span><p>TEAM {team.name.toUpperCase()}</p><small>Witch’s Potion · Round {Math.max(1, game.round)}/20</small></div><div className={`p6-signal ${connected ? 'online' : ''}`}><i />{connected ? 'Connected' : 'Reconnecting'}</div></header>
    <div className="p6-phone-score"><div><span>💎 TREASURE</span><strong>{team.treasure}</strong></div><div><span>☠️ POISON</span><strong>{team.poison} / 3</strong></div></div>
    {needsPoison ? <div className="p6-phone-action"><span>SECRET SETUP</span><h2>Plant your poison</h2><p>Choose one unopened potion. Your choice is private.</p><PotionGrid unavailable={game.opened} busy={busy} onPick={(number) => onCommand('plantPoison',{ number })} /></div>
    : game.phase === 'poison_setup' ? <div className="p6-phone-wait"><span>✓</span><h2>Poison planted!</h2><p>Your secret location is saved. Waiting for the other teams.</p></div>
    : game.phase === 'question' && question ? <div className={`p6-phone-question ${expired ? 'locked' : ''}`}><span>{question.category} · {question.type}</span><h2>{question.prompt}</h2>{submitted ? <div className="p6-phone-wait"><span>✓</span><h2>Submitted!</h2><p>Waiting for the teacher to review your answer.</p></div> : <>{question.options.length > 0 ? <div className="p6-phone-options">{question.options.map((option, index) => <button key={option} type="button" disabled={expired} className={selectedOption === option ? 'selected' : ''} onClick={() => setSelectedOption(option)}><b>{String.fromCharCode(65 + index)}</b>{option}</button>)}</div> : <textarea value={answer} disabled={expired} maxLength={900} onChange={(event) => onAnswerChange(event.target.value)} placeholder="Type your team answer…" autoCorrect="off" autoCapitalize="sentences" />}<button type="button" className="p6-submit" disabled={busy || expired || !selectedAnswer.trim()} onClick={() => void onSubmit(question.id, selectedAnswer)}>{expired ? 'TIME’S UP — ANSWER LOCKED' : 'SUBMIT TEAM ANSWER'}</button></>}</div>
    : canPick ? <div className="p6-phone-action"><span>ANSWER ACCEPTED · EVERYONE CHOOSES NOW</span><h2>Choose a potion!</h2><p>Tap quickly. A number locks when the server confirms it.</p><PotionGrid unavailable={[...game.opened, ...claimed]} busy={busy} onPick={(number) => onCommand('choosePotion',{ number })} /></div>
    : game.phase === 'potion_pick' ? <div className={`p6-phone-wait ${status?.verdict === 'reject' ? 'rejected' : myPick ? 'picked' : ''}`}><span>{status?.verdict === 'reject' ? '✕' : myPick ? '🔒' : '⌛'}</span><h2>{status?.verdict === 'reject' ? 'Not accepted this round' : myPick ? `Potion ${myPick} locked!` : 'Waiting for your result'}</h2><p>{status?.verdict === 'reject' ? 'Watch the main screen while accepted teams choose.' : myPick ? 'Your choice is saved. Results appear after everyone finishes.' : 'Time expired. The game is assigning an available potion.'}</p></div>
    : game.phase === 'reveal' ? <div className={`p6-phone-result ${myReveal ? myReveal.type.toLowerCase() : ''}`}><span>{myReveal ? myReveal.type === 'POISON' ? '☠️' : myReveal.type === 'TREASURE' ? '💎' : '✨' : '👀'}</span><h2>{myReveal ? myReveal.type : 'Results revealed!'}</h2><p>{myReveal ? `Potion ${myReveal.number}. ${myReveal.message}` : 'Look at the main screen for all team results.'}</p>{myReveal?.fullyPoisoned && <strong>−1 Treasure · Poison resets to 1/3</strong>}</div>
    : game.phase === 'restock' ? <div className="p6-phone-result restock"><span>🧙‍♀️</span><h2>The witch is restocking!</h2><p>Keep your phone ready to plant a new secret poison.</p></div>
    : game.phase === 'finished' ? <div className="p6-phone-result treasure"><span>🏆</span><h2>Game complete!</h2><p>Your team collected {team.treasure} Treasure. Look at the main screen for the tied leaderboard.</p></div>
    : <div className="p6-phone-wait"><span>👀</span><h2>Watch the main screen</h2><p>The next phase will appear automatically.</p></div>}
    <footer><span>Opened potions: {game.opened.length}/40</span><strong>{connected ? 'Your place is saved' : 'Reconnecting…'}</strong></footer>
  </section></main>;
}

function PotionGrid({ unavailable, busy, onPick }: { unavailable: number[]; busy: boolean; onPick: (number: number) => Promise<void> }) {
  return <div className="p6-potion-grid">{Array.from({ length:40 }, (_, index) => index + 1).map((number) => { const used = unavailable.includes(number); return <button key={number} type="button" disabled={busy || used} className={used ? 'used' : ''} onClick={() => void onPick(number)}>{used ? '🔒' : number}</button>; })}</div>;
}
