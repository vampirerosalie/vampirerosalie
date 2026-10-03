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
  return POTION_QUESTIONS.find((question) => question.id === game.currentQuestionId) ?? null;
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
  const [teamCount, setTeamCount] = useState(game.teamCount);
  const [reviewOpen, setReviewOpen] = useState(false);
  const { seconds: countdown } = usePotionCountdown(game.countdownEndsAt);
  const submitted = statuses.filter((status) => status.submitted).length;
  const judged = statuses.filter((status) => status.verdict).length;
  const planted = game.teams.filter((team) => !team.needsPoison).length;
  const ranking = useMemo(() => tiedRanks(game), [game]);
  const reveal = game.lastReveal;
  const picker = game.picker === null ? null : game.teams[game.picker];
  const unopened = 40 - game.opened.length;

  return <section className="p6-teacher">
    <header className="p6-topbar">
      <div className="p6-brand"><span>🧪</span><div><strong>WITCH’S POTION</strong><small>BATTLE 6 · ROUND {Math.max(1, game.round)}/20</small></div></div>
      <div className="p6-team-strip">{game.teams.map((team, index) => <div key={team.name} style={teamStyle(team.color, team.dark)}><b>{team.emoji} {team.name}</b><span>💎 {team.treasure} · ☠ {team.poison}/3</span><small>{statuses[index]?.submitted ? 'Submitted' : game.phase === 'question' ? 'Waiting' : team.needsPoison ? 'Needs poison' : 'Poison ready'}</small></div>)}</div>
      <button type="button" className="p6-exit" onClick={onExit}>EXIT GAME</button>
    </header>
    <div className="p6-main">
      <div className="p6-shelf-panel">
        <img src="/witch-potion-shelf.png" alt="Illustrated magical shelf with forty numbered potion bottles" />
        {game.opened.map((number) => { const [x, y] = POTION_COORDS[number]; return <span key={number} className="p6-x" style={{ left: `${x}%`, top: `${y}%` }}>✕</span>; })}
        <div className="p6-shelf-hud"><b>ROUND {Math.max(1, game.round)}/20</b><span>{unopened} POTIONS LEFT</span><span>{planted}/{game.teamCount} POISONS READY</span></div>
        {question && game.phase === 'question' && <div className="p6-question-card"><span>{question.category} · {question.type}</span><h2>{question.prompt}</h2>{question.options.length > 0 && <div>{question.options.map((option, index) => <p key={option}><b>{String.fromCharCode(65 + index)}</b>{option}</p>)}</div>}</div>}
        {countdown !== null && <div className={`p6-countdown ${countdown <= 3 ? 'urgent' : ''}`}><span>TIME LEFT</span><strong>{countdown || 'TIME!'}</strong><small>{countdown ? 'Phones remain active until zero' : 'Answers are locked'}</small></div>}
        {game.phase === 'reveal' && reveal && <div className={`p6-reveal p6-${reveal.type.toLowerCase()}`}><span>{reveal.type === 'POISON' ? '☠️' : reveal.type === 'TREASURE' ? '💎' : '✨'}</span><strong>POTION {reveal.number} — {reveal.type}</strong><p>{reveal.message}</p>{reveal.fullyPoisoned && <em>FULLY POISONED! −1 Treasure · Poison resets to 1/3</em>}</div>}
        {game.phase === 'restock' && <div className="p6-reveal p6-restock"><span>🧙‍♀️✨</span><strong>THE WITCH RESTOCKS THE SHELF!</strong><p>All 40 potions return. Every team must secretly plant a new poison.</p></div>}
        {game.phase === 'finished' && <div className="p6-finished"><span>🏆</span><h2>FINAL TREASURE LEADERBOARD</h2><div>{ranking.map((team) => <p key={team.name} style={teamStyle(team.color, team.dark)}><b>#{team.rank}</b><strong>{team.emoji} {team.name}</strong><span>💎 {team.treasure}</span>{ranking.filter((other) => other.rank === team.rank).length > 1 && <em>TIED</em>}</p>)}</div><button type="button" disabled={busy} onClick={() => void onCommand('newGame',{ teamCount:game.teamCount })}>PLAY AGAIN</button></div>}
      </div>
      <aside className="p6-control">
        <div className="p6-control-head"><div><span>TEACHER CONTROL</span><h2>{game.phase.replaceAll('_', ' ')}</h2></div><b>{game.opened.length}/40 OPENED</b></div>
        {game.phase === 'poison_setup' && <section><h3>SECRET POISON SETUP</h3><p>{planted}/{game.teamCount} teams have planted a poison. Locations stay hidden.</p><div className="p6-progress"><i style={{ width:`${planted / game.teamCount * 100}%` }} /></div><button type="button" disabled={busy || planted !== game.teamCount} onClick={() => void onCommand('startQuestion')}>{planted === game.teamCount ? game.round ? 'CONTINUE TO NEXT QUESTION' : 'START QUESTION 1' : 'WAITING FOR POISONS…'}</button></section>}
        {game.phase === 'question' && <section><h3>ALL TEAMS ANSWER</h3><p><b>{submitted}/{game.teamCount}</b> submitted · <b>{judged}/{game.teamCount}</b> judged</p><button type="button" className="p6-gold" disabled={busy || countdown !== null} onClick={() => void onCommand('startCountdown')}>⏱ {countdown !== null ? 'COUNTING DOWN…' : 'START 10-SEC COUNTDOWN'}</button><button type="button" disabled={busy || responses.length === 0} onClick={() => setReviewOpen(true)}>REVIEW ANSWERS ({responses.length})</button><button type="button" disabled={busy} onClick={() => void onCommand('markMissing')}>MARK MISSING AS REJECTED</button><button type="button" className="p6-green" disabled={busy || judged !== game.teamCount} onClick={() => void onCommand('startPotionPhase')}>OPEN POTION PHASE</button></section>}
        {game.phase === 'potion_pick' && <section><h3>CHOOSE A POTION</h3><p>{picker ? <><b>{picker.emoji} Team {picker.name}</b> chooses one unopened potion on their phone.</> : 'Preparing the next eligible team…'}</p><p>{game.eligible.length} accepted team{game.eligible.length === 1 ? '' : 's'} remaining.</p></section>}
        {game.phase === 'reveal' && <section><h3>POTION REVEALED</h3><p>{reveal?.message}</p><button type="button" className="p6-green" disabled={busy} onClick={() => void onCommand('continueReveal')}>{game.eligible.length ? 'NEXT TEAM CHOOSES' : game.round >= 20 ? 'SHOW FINAL RESULTS' : 'CONTINUE GAME'}</button></section>}
        {game.phase === 'restock' && <section><h3>MAGICAL RESTOCK</h3><p>The shelf reached ten unopened potions. Treasure and Poison scores remain.</p><button type="button" className="p6-gold" disabled={busy} onClick={() => void onCommand('restock')}>RESTOCK ALL 40 POTIONS</button></section>}
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
  const { seconds: countdown, expired } = usePotionCountdown(game.countdownEndsAt);
  const [selectedOption, setSelectedOption] = useState('');
  const status = myTeam === null ? null : statuses[myTeam];
  const submitted = Boolean(status?.submitted);

  useEffect(() => { setSelectedOption(''); }, [game.currentQuestionId]);

  if (myTeam === null || !game.teams[myTeam]) return <main className="p6-phone-shell p6-team-pick"><section><div className="p6-phone-logo">🧪</div><p>BATTLE 6</p><h1>Choose your team</h1><span>Each colour has one place. Taken teams cannot be selected.</span><div>{game.teams.map((team, index) => { const taken = Boolean(statuses[index]?.occupied); return <button key={team.name} type="button" disabled={busy || taken} className={taken ? 'taken' : ''} style={teamStyle(team.color, team.dark)} onClick={() => void onChooseTeam(index)}><b>{team.emoji}</b><strong>{team.name}</strong><small>{taken ? `TAKEN · ${statuses[index]?.memberName ?? 'Player'}` : 'AVAILABLE'}</small></button>; })}</div><footer><i className={connected ? 'online' : ''} />{connected ? 'Connected — your place is saved' : 'Reconnecting automatically…'}</footer></section></main>;

  const team = game.teams[myTeam];
  const needsPoison = team.needsPoison && game.phase === 'poison_setup';
  const canPick = game.phase === 'potion_pick' && game.picker === myTeam;
  const selectedAnswer = question?.type === 'MCQ' ? selectedOption : answer;
  const revealMine = game.phase === 'reveal' && game.lastReveal?.chooser === myTeam;

  return <main className="p6-phone-shell" style={teamStyle(team.color, team.dark)}><section className="p6-phone">
    {countdown !== null && <div className={`p6-phone-countdown ${countdown <= 3 ? 'urgent' : ''}`}><span>TIME LEFT</span><strong>{countdown || '0'}</strong><small>{countdown ? 'Keep answering' : 'Answer locked'}</small></div>}
    <header><div><span>{team.emoji}</span><p>TEAM {team.name.toUpperCase()}</p><small>Witch’s Potion · Round {Math.max(1, game.round)}/20</small></div><div className={`p6-signal ${connected ? 'online' : ''}`}><i />{connected ? 'Connected' : 'Reconnecting'}</div></header>
    <div className="p6-phone-score"><div><span>💎 TREASURE</span><strong>{team.treasure}</strong></div><div><span>☠️ POISON</span><strong>{team.poison} / 3</strong></div></div>
    {needsPoison ? <div className="p6-phone-action"><span>SECRET SETUP</span><h2>Plant your poison</h2><p>Choose one unopened potion. Your choice is private.</p><PotionGrid opened={game.opened} busy={busy} onPick={(number) => onCommand('plantPoison',{ number })} /></div>
    : game.phase === 'poison_setup' ? <div className="p6-phone-wait"><span>✓</span><h2>Poison planted!</h2><p>Your secret location is saved. Waiting for the other teams.</p></div>
    : game.phase === 'question' && question ? <div className={`p6-phone-question ${expired ? 'locked' : ''}`}><span>{question.category} · {question.type}</span><h2>{question.prompt}</h2>{submitted ? <div className="p6-phone-wait"><span>✓</span><h2>Submitted!</h2><p>Waiting for the teacher to review your answer.</p></div> : <>{question.options.length > 0 ? <div className="p6-phone-options">{question.options.map((option, index) => <button key={option} type="button" disabled={expired} className={selectedOption === option ? 'selected' : ''} onClick={() => setSelectedOption(option)}><b>{String.fromCharCode(65 + index)}</b>{option}</button>)}</div> : <textarea value={answer} disabled={expired} maxLength={900} onChange={(event) => onAnswerChange(event.target.value)} placeholder="Type your team answer…" autoCorrect="off" autoCapitalize="sentences" />}<button type="button" className="p6-submit" disabled={busy || expired || !selectedAnswer.trim()} onClick={() => void onSubmit(question.id, selectedAnswer)}>{expired ? 'TIME’S UP — ANSWER LOCKED' : 'SUBMIT TEAM ANSWER'}</button></>}</div>
    : canPick ? <div className="p6-phone-action"><span>ANSWER ACCEPTED</span><h2>Choose a potion!</h2><p>You have exactly one choice. Opened potions are disabled.</p><PotionGrid opened={game.opened} busy={busy} onPick={(number) => onCommand('choosePotion',{ number })} /></div>
    : game.phase === 'potion_pick' ? <div className={`p6-phone-wait ${status?.verdict === 'reject' ? 'rejected' : ''}`}><span>{status?.verdict === 'reject' ? '✕' : '⌛'}</span><h2>{status?.verdict === 'reject' ? 'Not accepted this round' : 'Waiting for another team'}</h2><p>Watch the illustrated potion shelf on the main screen.</p></div>
    : game.phase === 'reveal' ? <div className={`p6-phone-result ${revealMine ? game.lastReveal?.type.toLowerCase() : ''}`}><span>{revealMine ? game.lastReveal?.type === 'POISON' ? '☠️' : game.lastReveal?.type === 'TREASURE' ? '💎' : '✨' : '👀'}</span><h2>{revealMine ? game.lastReveal?.type : 'Potion revealed!'}</h2><p>{revealMine ? game.lastReveal?.message : 'Look at the main screen for the result.'}</p></div>
    : game.phase === 'restock' ? <div className="p6-phone-result restock"><span>🧙‍♀️</span><h2>The witch is restocking!</h2><p>Keep your phone ready to plant a new secret poison.</p></div>
    : game.phase === 'finished' ? <div className="p6-phone-result treasure"><span>🏆</span><h2>Game complete!</h2><p>Your team collected {team.treasure} Treasure. Look at the main screen for the tied leaderboard.</p></div>
    : <div className="p6-phone-wait"><span>👀</span><h2>Watch the main screen</h2><p>The next phase will appear automatically.</p></div>}
    <footer><span>Opened potions: {game.opened.length}/40</span><strong>{connected ? 'Your place is saved' : 'Reconnecting…'}</strong></footer>
  </section></main>;
}

function PotionGrid({ opened, busy, onPick }: { opened: number[]; busy: boolean; onPick: (number: number) => Promise<void> }) {
  return <div className="p6-potion-grid">{Array.from({ length:40 }, (_, index) => index + 1).map((number) => { const used = opened.includes(number); return <button key={number} type="button" disabled={busy || used} className={used ? 'used' : ''} onClick={() => void onPick(number)}>{used ? '✕' : number}</button>; })}</div>;
}
