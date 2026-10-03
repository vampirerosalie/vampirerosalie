'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { StudentBoard, TeacherBoard, type BoardBattle } from './battle3';
import type { BoardAnswerKey, BoardGame, BoardResponse, BoardTeamStatus } from './battle3-types';
import { StudentPotion, TeacherPotion } from './battle6';
import type { PotionAnswerKey, PotionGame, PotionResponse, PotionTeamStatus } from './battle6-types';

type Phase = 'lobby' | 'get-ready' | 'question' | 'locked' | 'reveal' | 'leaderboard' | 'finished' | 'board';
type BattleId = 1 | 2 | 3 | 4 | 6;
type Question = { sentence: string; error: string; answer: string; explanation: string };
type Player = { clientId: string; name: string; score: number; online: boolean; lastSeen: number; answeredQ: number | null };
type Leader = { clientId: string; name: string; score: number };
type ResponseRow = { clientId: string; name: string; answer: string; correct: boolean; scoreEarned: number };
type BoardVerdict = 'accept' | 'reject';
type GameState = {
  phase: Phase;
  battle: BattleId;
  qIndex: number;
  endsAt: number;
  version: number;
  answeredCount: number;
  onlineCount: number;
  leaderboard: Leader[];
  players?: Player[];
  responses?: ResponseRow[];
  myScore?: number;
  mySubmission?: { answer: string };
  myResult?: { answer: string; correct: boolean; scoreEarned: number };
  board?: BoardGame | null;
  boardTeamStatuses?: BoardTeamStatus[];
  boardResponses?: BoardResponse[];
  boardAnswerKey?: BoardAnswerKey;
  myTeam?: number | null;
  potion?: PotionGame | null;
  potionTeamStatuses?: PotionTeamStatus[];
  potionResponses?: PotionResponse[];
  potionAnswerKey?: PotionAnswerKey;
  myPotionTeam?: number | null;
};

function isBoardBattle(battle: BattleId): battle is BoardBattle {
  return battle === 3 || battle === 4;
}

function isPotionBattle(battle: BattleId): battle is 6 {
  return battle === 6;
}

declare global {
  interface Window {
    QRCode?: new (element: HTMLElement, options: { text: string; width: number; height: number; colorDark: string; colorLight: string }) => unknown;
  }
}

const BATTLE_1_QUESTIONS: Question[] = [
  { sentence: 'Aaron are washing his bicycle every Sunday before breakfast.', error: 'are washing', answer: 'washes', explanation: '“Every Sunday” shows a habitual action, so we use the present simple. Aaron is singular, so the verb takes -s: “washes”.' },
  { sentence: 'The children is doing their homework when the lights went out last night.', error: 'is doing', answer: 'were doing', explanation: 'The action was already in progress when another past action happened. “Children” is plural, so we use “were doing”.' },
  { sentence: 'Melissa cooks dinner in the kitchen right now, so call her later.', error: 'cooks', answer: 'is cooking', explanation: '“Right now” shows that the action is happening at this moment, so we use the present continuous: “is cooking”.' },
  { sentence: 'We goes to the beach after breakfast last Saturday.', error: 'goes', answer: 'went', explanation: '“We” may tempt students to change “goes” to “go”, but “last Saturday” shows that the action happened in the past. The correct form is “went”.' },
  { sentence: 'The cake was make by my sister this morning.', error: 'make', answer: 'made', explanation: 'The cake receives the action. After “was” in the passive voice, we need the past participle, V3: “made”.' },
  { sentence: 'These books is returned to the library every Friday by the class monitor.', error: 'is returned', answer: 'are returned', explanation: 'This is the present passive. “These books” is plural, so we use “are + V3”: “are returned”.' },
  { sentence: 'My father usually drive to work, but today he is taking the train.', error: 'drive', answer: 'drives', explanation: '“Usually” shows a regular habit. “My father” is singular, so the present simple verb takes -s: “drives”.' },
  { sentence: 'At 3 p.m. yesterday, Daniel shops for a birthday present at the mall.', error: 'shops', answer: 'was shopping', explanation: '“At 3 p.m. yesterday” refers to an action in progress at a particular time in the past, so we use “was shopping”.' },
  { sentence: 'The students have finish their project, so they can relax now.', error: 'finish', answer: 'finished', explanation: 'After “have”, we need the past participle, V3. Therefore, “have finished” is correct.' },
  { sentence: 'The cookies was bake this morning before the guests arrived.', error: 'was bake', answer: 'were baked', explanation: '“Cookies” is plural, so we need “were”. The cookies receive the action, so the passive structure requires V3: “were baked”.' },
];

const BATTLE_2_QUESTIONS: Question[] = [
  { sentence: 'While Daniel walked home, he saw a wallet lying on the pavement.', error: 'walked', answer: 'was walking', explanation: 'The walking was already in progress when Daniel saw the wallet. Use the past continuous for the longer background action.' },
  { sentence: 'Lena was nervous because she never gave a presentation in front of so many people before.', error: 'never gave', answer: 'had never given', explanation: 'Her lack of experience happened before the past moment when she felt nervous, so the past perfect is needed.' },
  { sentence: 'There were only few students in the library because most of them had gone home.', error: 'few', answer: 'a few', explanation: '“A few” means “some”. “Few” means “almost none”. Here, the sentence means that some students were still there.' },
  { sentence: 'We were having dinner when the lights suddenly were going out.', error: 'were going out', answer: 'went out', explanation: '“Were having” was the ongoing action. The lights going out was a sudden completed event, so use the past simple.' },
  { sentence: 'By the time we reached the cinema, the film started.', error: 'started', answer: 'had started', explanation: 'The film started before we reached the cinema. Use the past perfect for the earlier past action.' },
  { sentence: 'When the firefighters entered the building, ______ (a / an / the) smoke from the kitchen had already filled the hallway.', error: '______ (a / an / the)', answer: 'the', explanation: 'We use “the” because the sentence refers to the specific smoke coming from the kitchen.' },
  { sentence: 'When the teacher entered the classroom, several students talked loudly at the back.', error: 'talked', answer: 'were talking', explanation: 'The students were already talking when the teacher entered. The ongoing action takes the past continuous.' },
  { sentence: 'Mia could not open the classroom door because someone left the key inside earlier.', error: 'left', answer: 'had left', explanation: 'Leaving the key happened before Mia tried to open the door, so use the past perfect.' },
  { sentence: 'When we visited the museum last Saturday, there was much interesting information about the town’s history.', error: 'much', answer: 'a lot of', explanation: '“Information” is uncountable. In an affirmative sentence like this, “a lot of information” sounds more natural than “much information”.' },
  { sentence: 'After Marcus finished all his homework, he realised that he had forgotten to answer the final question.', error: 'finished', answer: 'had finished', explanation: 'Finishing the homework happened before Marcus realised his mistake, so the earlier action takes the past perfect.' },
];

const QUESTION_SETS: Record<1 | 2, Question[]> = { 1: BATTLE_1_QUESTIONS, 2: BATTLE_2_QUESTIONS };

const ROUND_MS = 30_000;
const READY_MS = 4_000;
const EMPTY_STATE: GameState = { phase: 'lobby', battle: 1, qIndex: 0, endsAt: 0, version: 0, answeredCount: 0, onlineCount: 0, leaderboard: [] };

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

async function gameRequest<T>(payload: Record<string, unknown>, externalSignal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const abortFromOutside = () => controller.abort();
  if (externalSignal?.aborted) controller.abort();
  else externalSignal?.addEventListener('abort', abortFromOutside, { once: true });
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch('/api/game', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: controller.signal,
    });
    const data = await response.json() as { error?: string } & T;
    if (!response.ok) throw new Error(data.error ?? 'The game server could not be reached.');
    return data;
  } catch (error) {
    if (controller.signal.aborted) throw new Error(externalSignal?.aborted ? 'Connection restarted.' : 'Connection timed out.');
    throw error;
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener('abort', abortFromOutside);
  }
}

function QuestionText({ question }: { question: Question }) {
  const start = question.sentence.indexOf(question.error);
  if (start < 0) return <>{question.sentence}</>;
  return <>{question.sentence.slice(0, start)}<u><strong>{question.error}</strong></u>{question.sentence.slice(start + question.error.length)}</>;
}

function LeaderboardList({ leaders, limit = 8, startRank = 1 }: { leaders: Leader[]; limit?: number; startRank?: number }) {
  const top = leaders.slice(0, limit);
  const highest = Math.max(1, ...top.map((player) => player.score));
  return (
    <div className="leader-list">
      {top.length === 0 ? <div className="empty-leaderboard">Scores appear after the first reveal.</div> : top.map((player, index) => {
        const rank = startRank + index;
        return (
        <div className={`leader-row place-${rank}`} key={player.clientId}>
          <span className="rank">{rank}</span><span className="leader-avatar">{player.name.slice(0, 1).toUpperCase()}</span><span className="leader-name">{player.name}</span><span className="score-track"><i style={{ width: `${Math.max(8, Math.round(player.score / highest * 100))}%` }} /></span><strong>{player.score.toLocaleString()} pts</strong>
        </div>
      );})}
    </div>
  );
}

function FinalPodium({ leaders }: { leaders: Leader[] }) {
  const first = leaders[0]; const second = leaders[1]; const third = leaders[2];
  const place = (player: Leader | undefined, rank: number) => <div className={`podium-place podium-${rank}`}><div className="podium-avatar">{player ? player.name.slice(0, 1).toUpperCase() : '?'}</div><strong>{player?.name ?? 'Waiting'}</strong><span>{player ? `${player.score.toLocaleString()} pts` : '—'}</span><div className="podium-block">{rank}</div></div>;
  return <div className="podium">{place(second, 2)}{place(first, 1)}{place(third, 3)}</div>;
}

function TeacherGame({ qrReady }: { qrReady: boolean }) {
  const [roomCode, setRoomCode] = useState('');
  const [teacherToken, setTeacherToken] = useState('');
  const [roomReady, setRoomReady] = useState(false);
  const [connectionLabel, setConnectionLabel] = useState('Opening room…');
  const [state, setState] = useState<GameState>(EMPTY_STATE);
  const [now, setNow] = useState(0);
  const [joinUrl, setJoinUrl] = useState('');
  const [pollCycle, setPollCycle] = useState(0);
  const [transitionBusy, setTransitionBusy] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [judgeOverrides, setJudgeOverrides] = useState<Record<number, BoardVerdict>>({});
  const qrRef = useRef<HTMLDivElement>(null);
  const pollAbortRef = useRef<AbortController | null>(null);
  const lastSuccessRef = useRef(0);
  const stateRef = useRef<GameState>(EMPTY_STATE);
  const transitionRef = useRef(false);
  const requestSequenceRef = useRef(0);
  const appliedSequenceRef = useRef(0);
  const judgeOverridesRef = useRef<Record<number, BoardVerdict>>({});

  const players = state.players ?? [];
  const responses = state.responses ?? [];
  const questions = isBoardBattle(state.battle) || isPotionBattle(state.battle) ? BATTLE_1_QUESTIONS : QUESTION_SETS[state.battle];
  const question = questions[state.qIndex] ?? questions[0];
  const everyoneAnswered = state.onlineCount > 0 && state.answeredCount >= state.onlineCount;
  const secondsLeft = state.phase === 'question' || state.phase === 'get-ready' ? Math.max(0, Math.ceil((state.endsAt - (now || state.endsAt)) / 1000)) : 0;
  const correctCount = responses.filter((response) => response.correct).length;
  const roundAccuracy = responses.length ? Math.round(correctCount / responses.length * 100) : 0;
  const occupiedBoardTeams = state.boardTeamStatuses?.filter((team) => team.occupied).length ?? 0;
  const boardTeamsReady = !isBoardBattle(state.battle) || Boolean(state.board && occupiedBoardTeams === state.board.teamCount);
  const displayedBoardStatuses = (state.boardTeamStatuses ?? []).map((status) => ({ ...status, verdict: judgeOverrides[status.teamIndex] ?? status.verdict }));
  const displayedBoardResponses = (state.boardResponses ?? []).map((response) => ({ ...response, verdict: judgeOverrides[response.teamIndex] ?? response.verdict }));
  const occupiedPotionTeams = state.potionTeamStatuses?.filter((team) => team.occupied).length ?? 0;
  const potionTeamsReady = !isPotionBattle(state.battle) || Boolean(state.potion && occupiedPotionTeams === state.potion.teamCount);
  const teamGameReady = boardTeamsReady && potionTeamsReady;
  const displayedPotionStatuses = (state.potionTeamStatuses ?? []).map((status) => ({ ...status, verdict: judgeOverrides[status.teamIndex] ?? status.verdict }));
  const displayedPotionResponses = (state.potionResponses ?? []).map((response) => ({ ...response, verdict: judgeOverrides[response.teamIndex] ?? response.verdict }));

  const applyTeacherState = useCallback((next: GameState, sequence: number) => {
    if (sequence < appliedSequenceRef.current) return;
    appliedSequenceRef.current = sequence;
    const previousQuestion = stateRef.current.board?.currentQuestionId ?? stateRef.current.potion?.currentQuestionId ?? null;
    const nextQuestion = next.board?.currentQuestionId ?? next.potion?.currentQuestionId ?? null;
    const remainingOverrides = { ...judgeOverridesRef.current };
    if (previousQuestion !== nextQuestion) {
      for (const key of Object.keys(remainingOverrides)) delete remainingOverrides[Number(key)];
    } else {
      for (const [key, verdict] of Object.entries(remainingOverrides)) {
        if (next.boardTeamStatuses?.[Number(key)]?.verdict === verdict || next.potionTeamStatuses?.[Number(key)]?.verdict === verdict) delete remainingOverrides[Number(key)];
      }
    }
    judgeOverridesRef.current = remainingOverrides;
    setJudgeOverrides(remainingOverrides);
    stateRef.current = next;
    setState(next);
  }, []);

  const establishRoom = useCallback(async function connectRoom(code: string, token: string) {
    try {
      const result = await gameRequest<{ state: GameState }>({ action: 'create', room: code, teacherToken: token });
      const sequence = ++requestSequenceRef.current;
      applyTeacherState(result.state, sequence);
      lastSuccessRef.current = Date.now();
      setRoomReady(true);
      setConnectionLabel('Room online');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Room could not open.';
      if (message.includes('already in use')) {
        const replacement = String(Math.floor(10000 + Math.random() * 90000));
        const replacementToken = makeId();
        sessionStorage.setItem('grammartest_teacher_room', replacement);
        sessionStorage.setItem('grammartest_teacher_token', replacementToken);
        setRoomCode(replacement);
        setTeacherToken(replacementToken);
        setJoinUrl(`${window.location.origin}${window.location.pathname}?room=${replacement}&battle=1`);
        void connectRoom(replacement, replacementToken);
      } else {
        setConnectionLabel('Reconnecting room…');
        setTimeout(() => void connectRoom(code, token), 2500);
      }
    }
  }, [applyTeacherState]);

  useEffect(() => {
    const storedRoom = sessionStorage.getItem('grammartest_teacher_room');
    const storedToken = sessionStorage.getItem('grammartest_teacher_token');
    const code = storedRoom && /^\d{5}$/.test(storedRoom) ? storedRoom : String(Math.floor(10000 + Math.random() * 90000));
    const token = storedToken && storedToken.length >= 20 ? storedToken : makeId();
    sessionStorage.setItem('grammartest_teacher_room', code);
    sessionStorage.setItem('grammartest_teacher_token', token);
    setRoomCode(code);
    setTeacherToken(token);
    setJoinUrl(`${window.location.origin}${window.location.pathname}?room=${code}&battle=1`);
    void establishRoom(code, token);
  }, [establishRoom]);

  useEffect(() => {
    if (!roomCode) return;
    setJoinUrl(`${window.location.origin}${window.location.pathname}?room=${roomCode}&battle=${state.battle}`);
  }, [roomCode, state.battle]);

  useEffect(() => {
    if (!roomReady || !roomCode || !teacherToken) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let failures = 0;
    const controller = new AbortController();
    pollAbortRef.current = controller;
    const poll = async () => {
      try {
        const sequence = ++requestSequenceRef.current;
        const result = await gameRequest<{ state: GameState }>({ action: 'poll', room: roomCode, teacherToken }, controller.signal);
        if (stopped) return;
        failures = 0;
        lastSuccessRef.current = Date.now();
        applyTeacherState(result.state, sequence);
        setConnectionLabel('Room online');
      } catch {
        if (stopped) return;
        failures += 1;
        setConnectionLabel('Reconnecting room…');
      }
      if (stopped) return;
      const activeRound = stateRef.current.phase === 'lobby' || stateRef.current.board?.phase === 'answering' || stateRef.current.potion?.phase === 'question';
      timer = setTimeout(poll, Math.min(5000, (activeRound ? 500 : 900) + failures * 850));
    };
    void poll();
    return () => {
      stopped = true;
      controller.abort();
      if (pollAbortRef.current === controller) pollAbortRef.current = null;
      if (timer) clearTimeout(timer);
    };
  }, [roomReady, roomCode, teacherToken, pollCycle, applyTeacherState]);

  const restartRoomConnection = useCallback(() => {
    pollAbortRef.current?.abort();
    setConnectionLabel('Reconnecting room…');
    setPollCycle((value) => value + 1);
  }, []);

  useEffect(() => {
    const wake = () => { if (!document.hidden) restartRoomConnection(); };
    const offline = () => { pollAbortRef.current?.abort(); setConnectionLabel('Waiting for internet…'); };
    const watchdog = setInterval(() => {
      if (!document.hidden && roomReady && Date.now() - lastSuccessRef.current > 7_000) restartRoomConnection();
    }, 2_500);
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('pageshow', wake);
    window.addEventListener('focus', wake);
    window.addEventListener('online', restartRoomConnection);
    window.addEventListener('offline', offline);
    return () => {
      clearInterval(watchdog);
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('pageshow', wake);
      window.removeEventListener('focus', wake);
      window.removeEventListener('online', restartRoomConnection);
      window.removeEventListener('offline', offline);
    };
  }, [roomReady, restartRoomConnection]);

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  useEffect(() => {
    if (!qrReady || !joinUrl || !qrRef.current || !window.QRCode) return;
    qrRef.current.innerHTML = '';
    new window.QRCode(qrRef.current, { text: joinUrl, width: 190, height: 190, colorDark: '#172033', colorLight: '#ffffff' });
  }, [qrReady, joinUrl]);

  const changeGame = useCallback(async (phase: Phase, qIndex: number, endsAt: number) => {
    if (!roomCode || !teacherToken || transitionRef.current) return false;
    const expected = stateRef.current;
    transitionRef.current = true;
    setTransitionBusy(true);
    const sequence = ++requestSequenceRef.current;
    try {
      const result = await gameRequest<{ state: GameState; conflict?: boolean }>({ action: 'setGame', room: roomCode, teacherToken, phase, qIndex, endsAt, expectedVersion: expected.version, expectedPhase: expected.phase, expectedQuestion: expected.qIndex });
      applyTeacherState(result.state, sequence);
      setConnectionLabel('Room online');
      return !result.conflict;
    } catch {
      setConnectionLabel('Saving command…');
      return false;
    } finally {
      transitionRef.current = false;
      setTransitionBusy(false);
    }
  }, [roomCode, teacherToken, applyTeacherState]);

  const selectBattle = useCallback(async (battle: BattleId) => {
    if (!roomCode || !teacherToken || transitionRef.current || stateRef.current.phase !== 'lobby' || stateRef.current.battle === battle) return;
    const expected = stateRef.current;
    transitionRef.current = true;
    setTransitionBusy(true);
    const sequence = ++requestSequenceRef.current;
    try {
      const result = await gameRequest<{ state: GameState; conflict?: boolean }>({ action: 'setBattle', room: roomCode, teacherToken, battle, expectedVersion: expected.version });
      applyTeacherState(result.state, sequence);
      setConnectionLabel(result.conflict ? 'Battle selection refreshed' : `Battle ${battle} selected`);
    } catch {
      setConnectionLabel('Saving battle selection…');
    } finally {
      transitionRef.current = false;
      setTransitionBusy(false);
    }
  }, [roomCode, teacherToken, applyTeacherState]);

  const startBoard = useCallback(async () => {
    if (!roomCode || !teacherToken || transitionRef.current) return;
    const expected = stateRef.current;
    transitionRef.current = true;
    setTransitionBusy(true);
    const sequence = ++requestSequenceRef.current;
    try {
      const result = await gameRequest<{ state: GameState }>({ action:'startBoard', room:roomCode, teacherToken, expectedVersion:expected.version });
      applyTeacherState(result.state, sequence);
      setConnectionLabel('Board game online');
    } catch (error) { setConnectionLabel(error instanceof Error ? error.message : 'Starting board game…'); }
    finally { transitionRef.current = false; setTransitionBusy(false); }
  }, [roomCode, teacherToken, applyTeacherState]);

  const boardCommand = useCallback(async (command: string, details: Record<string, unknown> = {}) => {
    if (!roomCode || !teacherToken || !stateRef.current.board) return;
    if (command === 'judge') {
      const teamIndex = Number(details.teamIndex);
      const verdict = details.verdict === 'accept' ? 'accept' : details.verdict === 'reject' ? 'reject' : null;
      if (!Number.isInteger(teamIndex) || !verdict) return;
      judgeOverridesRef.current = { ...judgeOverridesRef.current, [teamIndex]: verdict };
      setJudgeOverrides(judgeOverridesRef.current);
      try {
        const result = await gameRequest<{ state?: GameState }>({ action:'boardCommand', room:roomCode, teacherToken, command, expectedBoardVersion:stateRef.current.board.version, ...details });
        if (result.state) applyTeacherState(result.state, ++requestSequenceRef.current);
        setConnectionLabel('Board game online');
      } catch (error) {
        const remaining = { ...judgeOverridesRef.current };
        delete remaining[teamIndex];
        judgeOverridesRef.current = remaining;
        setJudgeOverrides(remaining);
        setConnectionLabel(error instanceof Error ? error.message : 'Retrying mark…');
        setPollCycle((value) => value + 1);
      }
      return;
    }
    if (transitionRef.current) return;
    transitionRef.current = true;
    setTransitionBusy(true);
    const sequence = ++requestSequenceRef.current;
    try {
      const result = await gameRequest<{ state: GameState }>({ action:'boardCommand', room:roomCode, teacherToken, command, expectedBoardVersion:stateRef.current.board.version, ...details });
      applyTeacherState(result.state, sequence);
      setConnectionLabel('Board game online');
    } catch (error) { setConnectionLabel(error instanceof Error ? error.message : 'Saving board move…'); }
    finally { transitionRef.current = false; setTransitionBusy(false); }
  }, [roomCode, teacherToken, applyTeacherState]);

  const potionCommand = useCallback(async (command: string, details: Record<string, unknown> = {}) => {
    if (!roomCode || !teacherToken || !stateRef.current.potion) return;
    if (command === 'judge') {
      const teamIndex = Number(details.teamIndex);
      const verdict = details.verdict === 'accept' ? 'accept' : details.verdict === 'reject' ? 'reject' : null;
      if (!Number.isInteger(teamIndex) || !verdict) return;
      judgeOverridesRef.current = { ...judgeOverridesRef.current, [teamIndex]: verdict };
      setJudgeOverrides(judgeOverridesRef.current);
      try {
        const result = await gameRequest<{ state?: GameState }>({ action:'potionCommand', room:roomCode, teacherToken, command, expectedPotionVersion:stateRef.current.potion.version, ...details });
        if (result.state) applyTeacherState(result.state, ++requestSequenceRef.current);
        setConnectionLabel('Witch’s Potion online');
      } catch (error) {
        const remaining = { ...judgeOverridesRef.current };
        delete remaining[teamIndex];
        judgeOverridesRef.current = remaining;
        setJudgeOverrides(remaining);
        setConnectionLabel(error instanceof Error ? error.message : 'Retrying mark…');
        setPollCycle((value) => value + 1);
      }
      return;
    }
    if (transitionRef.current) return;
    transitionRef.current = true;
    setTransitionBusy(true);
    const sequence = ++requestSequenceRef.current;
    try {
      const result = await gameRequest<{ state: GameState }>({ action:'potionCommand', room:roomCode, teacherToken, command, expectedPotionVersion:stateRef.current.potion.version, ...details });
      applyTeacherState(result.state, sequence);
      setConnectionLabel('Witch’s Potion online');
    } catch (error) { setConnectionLabel(error instanceof Error ? error.message : 'Saving potion move…'); }
    finally { transitionRef.current = false; setTransitionBusy(false); }
  }, [roomCode, teacherToken, applyTeacherState]);

  useEffect(() => {
    const timer = setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (state.phase === 'question' && time >= state.endsAt) void changeGame('locked', state.qIndex, state.endsAt);
      if (state.phase === 'get-ready' && time >= state.endsAt) void changeGame('question', state.qIndex, Date.now() + ROUND_MS);
    }, 250);
    return () => clearInterval(timer);
  }, [state.phase, state.qIndex, state.endsAt, changeGame]);

  const beginQuestion = (index: number) => void changeGame('question', index, Date.now() + ROUND_MS);
  const reveal = () => { if (everyoneAnswered || state.phase === 'locked') void changeGame('reveal', state.qIndex, state.endsAt); };
  const showLeaderboard = () => void changeGame(state.qIndex === questions.length - 1 ? 'finished' : 'leaderboard', state.qIndex, 0);
  const advance = () => void changeGame('get-ready', state.qIndex + 1, Date.now() + READY_MS);
  const resetGame = async () => {
    if (transitionRef.current) return;
    transitionRef.current = true;
    setTransitionBusy(true);
    const sequence = ++requestSequenceRef.current;
    try {
      const result = await gameRequest<{ state: GameState }>({ action: 'reset', room: roomCode, teacherToken });
      applyTeacherState(result.state, sequence);
    } catch { setConnectionLabel('Reset will retry…'); }
    finally { transitionRef.current = false; setTransitionBusy(false); }
  };
  const copyJoinLink = async () => {
    try { await navigator.clipboard.writeText(joinUrl); setConnectionLabel('Join link copied'); }
    catch { window.prompt('Copy this join link:', joinUrl); }
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setConnectionLabel('Full screen was blocked — click again');
    }
  };

  return (
    <main className="game-shell host-shell">
      <div className="confetti-field" aria-hidden="true"><i>★</i><i>◆</i><i>●</i><i>⚡</i><i>✦</i><i>▲</i></div>
      <header className="host-topbar">
        <div className="game-logo"><span>★</span><strong>GRAMMAR</strong><em>BATTLE!</em></div>
        <div className="host-meta"><div className="pin-pill"><small>GAME PIN</small><strong>{roomCode || '•••••'}</strong></div><div className="online-pill"><span />{state.onlineCount} students online</div><div className={`connection-pill ${connectionLabel === 'Room online' ? 'connected' : ''}`}>{connectionLabel}</div></div>
        {connectionLabel !== 'Room online' && <button type="button" className="manual-reconnect teacher-reconnect" onClick={restartRoomConnection}>Reconnect now</button>}
        <button type="button" className="fullscreen-button" aria-pressed={isFullscreen} onClick={() => void toggleFullscreen()}><span aria-hidden="true">{isFullscreen ? '↙' : '⛶'}</span>{isFullscreen ? 'EXIT FULL SCREEN' : 'FULL SCREEN'}</button>
      </header>
      {state.phase === 'lobby' ? <><section className="battle-selector" aria-label="Choose grammar battle">
        <div><span>CHOOSE QUESTION SET</span><strong>Battle {state.battle} is ready</strong></div>
        <div className="battle-tabs" role="tablist"><button type="button" role="tab" aria-selected={state.battle === 1} className={state.battle === 1 ? 'active' : ''} disabled={transitionBusy} onClick={() => void selectBattle(1)}><b>1</b><span>BATTLE 1<small>Original questions</small></span></button><button type="button" role="tab" aria-selected={state.battle === 2} className={state.battle === 2 ? 'active' : ''} disabled={transitionBusy} onClick={() => void selectBattle(2)}><b>2</b><span>BATTLE 2<small>Grammar challenge</small></span></button><button type="button" role="tab" aria-selected={state.battle === 3} className={state.battle === 3 ? 'active' : ''} disabled={transitionBusy} onClick={() => void selectBattle(3)}><b>3</b><span>BATTLE 3<small>English board game</small></span></button><button type="button" role="tab" aria-selected={state.battle === 4} className={state.battle === 4 ? 'active' : ''} disabled={transitionBusy} onClick={() => void selectBattle(4)}><b>4</b><span>BATTLE 4<small>BM board game</small></span></button><button type="button" onClick={() => { window.location.href = '/grammar-room/battle5.html'; }}><b>5</b><span>BATTLE 5<small>The Grammar Room</small></span></button><button type="button" role="tab" aria-selected={state.battle === 6} className={state.battle === 6 ? 'active' : ''} disabled={transitionBusy} onClick={() => void selectBattle(6)}><b>6</b><span>BATTLE 6<small>Witch’s Potion</small></span></button></div>
      </section><section className="host-lobby-layout">
        <article className="scan-panel"><p className="panel-kicker">SCAN TO JOIN</p><p>Students join at</p><div className="qr-box" ref={qrRef}>{!qrReady && 'Loading QR…'}</div><span className="or-rule">OR</span><div className="lobby-pin">{roomCode || '•••••'}</div><button type="button" className="copy-link" onClick={copyJoinLink}>Copy join link</button></article>
        <article className="roster-panel"><div className="panel-heading"><div><p className="panel-kicker">BATTLE {state.battle} · LIVE JOINING</p><h2>{players.length} players ready</h2></div><span className="roster-live"><i /> LIVE</span></div>{isBoardBattle(state.battle) && state.board && <><div className="b3-lobby-config"><div><strong>Choose team players</strong><small>One player per colour. Changing this resets team choices.</small></div><select aria-label={`Number of Battle ${state.battle} team players`} value={state.board.teamCount} disabled={transitionBusy} onChange={(event) => void boardCommand('configureTeams',{teamCount:Number(event.target.value)})}>{[2,3,4,5,6].map((count) => <option key={count} value={count}>{count} players / teams</option>)}</select></div><div className="b3-lobby-teams">{state.board.teams.map((team,index) => { const status = state.boardTeamStatuses?.[index]; return <div key={team.name} className={status?.occupied ? 'taken' : ''} style={{borderColor:team.color}}><span style={{background:team.color}}>{team.emoji}</span><b>{team.name}</b><small>{status?.occupied ? `${status.memberName ?? 'Player'} · ${status.memberCount ? 'online' : 'saved'}` : 'Available'}</small></div>; })}</div></>}{isPotionBattle(state.battle) && state.potion && <><div className="b3-lobby-config p6-lobby-config"><div><strong>Choose potion teams</strong><small>One player per colour. Supports up to seven teams.</small></div><select aria-label="Number of Battle 6 team players" value={state.potion.teamCount} disabled={transitionBusy} onChange={(event) => void potionCommand('configureTeams',{teamCount:Number(event.target.value)})}>{[2,3,4,5,6,7].map((count) => <option key={count} value={count}>{count} players / teams</option>)}</select></div><div className="b3-lobby-teams p6-lobby-teams">{state.potion.teams.map((team,index) => { const status = state.potionTeamStatuses?.[index]; return <div key={team.name} className={status?.occupied ? 'taken' : ''} style={{borderColor:team.color}}><span style={{background:team.color}}>{team.emoji}</span><b>{team.name}</b><small>{status?.occupied ? `${status.memberName ?? 'Player'} · ${status.memberCount ? 'online' : 'saved'}` : 'Available'}</small></div>; })}</div></>}<div className="roster-list">{players.length === 0 ? <div className="waiting-roster"><span>✦</span><strong>Waiting for players…</strong><p>Names will appear here as students join.</p></div> : players.map((player, index) => <div className="roster-row" key={player.clientId}><span className={`avatar hue-${index % 5}`}>{player.name.slice(0, 1).toUpperCase()}</span><strong>{player.name}</strong><em>{player.online ? 'Just now' : 'Reconnecting'}</em><i className={player.online ? 'online-dot' : 'offline-dot'} /></div>)}</div><div className="lobby-footer"><span>{isBoardBattle(state.battle) ? `🎨 ${occupiedBoardTeams}/${state.board?.teamCount ?? 0} team places chosen` : isPotionBattle(state.battle) ? `🧪 ${occupiedPotionTeams}/${state.potion?.teamCount ?? 0} potion teams chosen` : `🎉 ${state.onlineCount} online`}</span><button type="button" className="game-button start-button" disabled={!roomReady || transitionBusy || !teamGameReady} onClick={() => isBoardBattle(state.battle) || isPotionBattle(state.battle) ? void startBoard() : beginQuestion(0)}>{transitionBusy ? 'STARTING…' : (isBoardBattle(state.battle) || isPotionBattle(state.battle)) && !teamGameReady ? 'WAITING FOR TEAMS…' : `START BATTLE ${state.battle}`} <b>➜</b></button></div></article>
      </section></> : state.phase === 'board' && state.board && isBoardBattle(state.battle) ? <TeacherBoard key={state.board.currentQuestionId ?? `round-${state.board.round}`} battle={state.battle} board={state.board} statuses={displayedBoardStatuses} responses={displayedBoardResponses} answerKey={state.boardAnswerKey} busy={transitionBusy} onCommand={boardCommand} onExit={() => void resetGame()} /> : state.phase === 'board' && state.potion && isPotionBattle(state.battle) ? <TeacherPotion game={state.potion} statuses={displayedPotionStatuses} responses={displayedPotionResponses} answerKey={state.potionAnswerKey} busy={transitionBusy} onCommand={potionCommand} onExit={() => void resetGame()} /> : <section className={`stage-card phase-${state.phase}`}>
        {state.phase === 'get-ready' && <div className="get-ready-stage"><span className="ready-label">GET READY!</span><h2>Next Question</h2><p>is coming up!</p><div className="ready-icons"><span>⚡</span><div className="ready-count">{secondsLeft}</div><span>🏆</span></div><strong>Stay focused. Let’s go! 🚀</strong></div>}
        {(state.phase === 'question' || state.phase === 'locked') && <div className="question-stage"><div className="stage-tabs"><span className="active">✎ QUESTION</span></div><div className="question-board"><div className="question-copy"><p>✎ GRAMMAR CORRECTION</p><h2><QuestionText question={question} /></h2></div><div className={`giant-timer ${secondsLeft <= 5 ? 'urgent' : ''}`}><strong>{state.phase === 'locked' ? 0 : secondsLeft}</strong><span>SEC</span></div></div><div className="question-footer"><span>Students fix the bold, underlined part.</span><div className="submission-meter"><i style={{ width: `${state.onlineCount ? Math.min(100, state.answeredCount / state.onlineCount * 100) : 0}%` }} /><strong>{state.answeredCount}/{state.onlineCount} answered</strong></div></div><div className="host-actions"><button type="button" className="game-button reveal-button" onClick={reveal} disabled={transitionBusy || (!everyoneAnswered && state.phase !== 'locked')}>{transitionBusy ? 'SAVING…' : everyoneAnswered ? 'REVEAL — EVERYONE ANSWERED' : state.phase === 'locked' ? 'REVEAL ANSWER' : 'WAITING FOR ANSWERS…'}</button></div></div>}
        {state.phase === 'reveal' && <div className="reveal-stage"><div className="stage-tabs"><span>✎ QUESTION</span><span className="active">✦ REVEAL ANSWER</span></div><div className="reveal-layout"><div className="reveal-question"><p>✎ GRAMMAR CORRECTION</p><h2><QuestionText question={question} /></h2></div><div className="answer-card"><p>★ CORRECT ANSWER ★</p><h3>{question.answer}</h3><div className="answer-check">✓</div><span>EXPLANATION</span><p>{question.explanation}</p></div></div><div className="reveal-footer"><span>Great job, everyone! 🎉</span><strong>{correctCount}/{responses.length || 0} correct · {roundAccuracy}% accuracy</strong></div><div className="host-actions"><button type="button" className="game-button leaderboard-button" onClick={showLeaderboard} disabled={transitionBusy}>{transitionBusy ? 'SAVING…' : state.qIndex === questions.length - 1 ? 'SHOW FINAL PODIUM' : 'SHOW LEADERBOARD'} ➜</button></div></div>}
        {state.phase === 'leaderboard' && <div className="leaderboard-stage"><div className="leader-title"><span>🏆</span><div><p>LIVE LEADERBOARD</p><h2>Top players</h2></div><div className="round-stat"><small>QUESTION</small><strong>{state.qIndex + 1}/10</strong></div><div className="round-stat"><small>ACCURACY</small><strong>{roundAccuracy}%</strong></div></div><LeaderboardList leaders={state.leaderboard} /><div className="host-actions"><button type="button" className="game-button next-button" onClick={advance} disabled={transitionBusy}>{transitionBusy ? 'LOADING…' : 'NEXT QUESTION'} ➜</button></div></div>}
        {state.phase === 'finished' && <div className="final-stage"><p className="final-kicker">⚡ GAME OVER ⚡</p><h2>CONGRATULATIONS!</h2><p>Here are today’s top winners!</p><FinalPodium leaders={state.leaderboard} /><div className="final-rest"><LeaderboardList leaders={state.leaderboard.slice(3)} limit={5} startRank={4} /></div><div className="host-actions"><button type="button" className="game-button play-again" onClick={() => void resetGame()} disabled={transitionBusy}>{transitionBusy ? 'RESETTING…' : 'PLAY AGAIN'} ↻</button></div></div>}
      </section>}
    </main>
  );
}

function StudentGame({ roomCode, requestedBattle }: { roomCode: string; requestedBattle: BattleId }) {
  const storageKey = `grammartest_student_${roomCode}`;
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [clientId, setClientId] = useState('');
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('Preparing connection…');
  const [state, setState] = useState<GameState>(() => ({ ...EMPTY_STATE, battle: requestedBattle }));
  const [answer, setAnswer] = useState('');
  const [submittedQ, setSubmittedQ] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [now, setNow] = useState(0);
  const [pollCycle, setPollCycle] = useState(0);
  const nameRef = useRef('');
  const answerRef = useRef('');
  const stateRef = useRef(state);
  const submittedRef = useRef<number | null>(null);
  const pendingRef = useRef<Array<Record<string, unknown>>>([]);
  const pollAbortRef = useRef<AbortController | null>(null);
  const lastSuccessRef = useRef(0);
  const boardQuestionRef = useRef<string | null>(null);

  const secondsLeft = state.phase === 'question' || state.phase === 'get-ready' ? Math.max(0, Math.ceil((state.endsAt - (now || state.endsAt)) / 1000)) : 0;
  const myScore = state.myScore ?? 0;
  const showingResult = state.phase === 'reveal' || state.phase === 'leaderboard' || state.phase === 'finished';
  const resultCorrect = Boolean(state.myResult?.correct);

  const persist = useCallback((overrides: Record<string, unknown> = {}) => {
    if (!clientId) return;
    localStorage.setItem(storageKey, JSON.stringify({ clientId, name: nameRef.current, joined: true, draft: answerRef.current, draftQ: stateRef.current.qIndex, submittedQ: submittedRef.current, pending: pendingRef.current, ...overrides }));
  }, [clientId, storageKey]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
      const id = typeof saved.clientId === 'string' ? saved.clientId : makeId();
      const savedName = typeof saved.name === 'string' ? saved.name : '';
      lastSuccessRef.current = Date.now();
      // This effect intentionally hydrates the student identity and pending work.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClientId(id); setName(savedName); nameRef.current = savedName; setJoined(Boolean(saved.joined && savedName));
      pendingRef.current = Array.isArray(saved.pending) ? saved.pending : []; setPendingCount(pendingRef.current.length);
      submittedRef.current = Number.isInteger(saved.submittedQ) ? saved.submittedQ : null; setSubmittedQ(submittedRef.current);
      if (typeof saved.draft === 'string') { setAnswer(saved.draft); answerRef.current = saved.draft; }
    } catch { setClientId(makeId()); }
  }, [storageKey]);

  useEffect(() => { nameRef.current = name; }, [name]);
  useEffect(() => { answerRef.current = answer; }, [answer]);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { submittedRef.current = submittedQ; }, [submittedQ]);
  useEffect(() => { if (joined && clientId) persist(); }, [answer, joined, clientId, persist]);

  const applyState = useCallback((next: GameState) => {
    const previous = stateRef.current;
    stateRef.current = next;
    setState(next);
    const nextBoardQuestion = next.board?.currentQuestionId ?? next.potion?.currentQuestionId ?? null;
    const activeTeamQuestion = isBoardBattle(next.battle) ? next.board?.phase === 'answering' : isPotionBattle(next.battle) ? next.potion?.phase === 'question' : false;
    if ((isBoardBattle(next.battle) || isPotionBattle(next.battle)) && activeTeamQuestion && nextBoardQuestion !== boardQuestionRef.current) {
      boardQuestionRef.current = nextBoardQuestion;
      setAnswer(''); answerRef.current = '';
      persist({ draft:'', draftQ:nextBoardQuestion });
    } else if (next.phase === 'question' && next.mySubmission) {
      setAnswer(next.mySubmission.answer); answerRef.current = next.mySubmission.answer;
      setSubmittedQ(next.qIndex); submittedRef.current = next.qIndex;
      persist({ draft: next.mySubmission.answer, draftQ: next.qIndex, submittedQ: next.qIndex });
    } else if (next.qIndex !== previous.qIndex || (previous.phase !== 'question' && next.phase === 'question')) {
      setAnswer(''); answerRef.current = ''; setSubmittedQ(null); submittedRef.current = null;
      persist({ draft: '', draftQ: next.qIndex, submittedQ: null });
    }
    if (!isBoardBattle(next.battle) && !isPotionBattle(next.battle)) boardQuestionRef.current = null;
  }, [persist]);

  const sendPending = useCallback(async (signal?: AbortSignal) => {
    if (pendingRef.current.length === 0) return;
    const remaining: Array<Record<string, unknown>> = [];
    for (const payload of pendingRef.current) {
      const queuedAction = String(payload.action ?? 'answer');
      const details = { ...payload };
      delete details.action;
      try { await gameRequest({ action: queuedAction, room: roomCode, ...details }, signal); }
      catch (error) {
        const message = error instanceof Error ? error.message : 'Answer is still saved.';
        if (/server|fetch|network|connection|timed out|interrupted/i.test(message)) remaining.push(payload);
        else setStatus(message);
      }
    }
    pendingRef.current = remaining;
    setPendingCount(remaining.length);
    persist({ pending: remaining });
  }, [persist, roomCode]);

  useEffect(() => {
    if (!joined || !clientId || !nameRef.current) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let failures = 0;
    const controller = new AbortController();
    pollAbortRef.current = controller;
    const poll = async () => {
      try {
        await sendPending(controller.signal);
        const result = await gameRequest<{ state: GameState }>({ action: 'poll', room: roomCode, clientId, name: nameRef.current }, controller.signal);
        if (stopped) return;
        failures = 0;
        lastSuccessRef.current = Date.now();
        setConnected(true);
        setStatus(pendingRef.current.length ? 'Connected — sending saved answer…' : 'Connected — your place is saved');
        applyState(result.state);
      } catch (error) {
        if (stopped) return;
        failures += 1;
        setConnected(false);
        setStatus(error instanceof Error && error.message.includes('Room not found') ? 'Waiting for the teacher to open this room…' : 'Signal interrupted — reconnecting automatically…');
      }
      if (stopped) return;
      const activeRound = stateRef.current.phase === 'question' || stateRef.current.board?.phase === 'answering' || stateRef.current.potion?.phase === 'question';
      timer = setTimeout(poll, Math.min(6000, (activeRound ? 750 : 1200) + failures * 850));
    };
    void poll();
    return () => {
      stopped = true;
      controller.abort();
      if (pollAbortRef.current === controller) pollAbortRef.current = null;
      if (timer) clearTimeout(timer);
    };
  }, [joined, clientId, roomCode, pollCycle, applyState, sendPending]);

  const restartStudentConnection = useCallback(() => {
    pollAbortRef.current?.abort();
    setConnected(false);
    setStatus('Reconnecting now…');
    setPollCycle((value) => value + 1);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    const wake = () => { if (!document.hidden) restartStudentConnection(); };
    const offline = () => { pollAbortRef.current?.abort(); setConnected(false); setStatus('Offline — your name, draft, and answer are saved'); };
    const watchdog = setInterval(() => {
      if (!document.hidden && joined && Date.now() - lastSuccessRef.current > 7_000) restartStudentConnection();
    }, 2_500);
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('pageshow', wake);
    window.addEventListener('focus', wake);
    window.addEventListener('online', restartStudentConnection);
    window.addEventListener('offline', offline);
    return () => {
      clearInterval(timer);
      clearInterval(watchdog);
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('pageshow', wake);
      window.removeEventListener('focus', wake);
      window.removeEventListener('online', restartStudentConnection);
      window.removeEventListener('offline', offline);
    };
  }, [joined, restartStudentConnection]);

  const join = (event: React.FormEvent) => {
    event.preventDefault();
    const clean = name.trim().slice(0, 30);
    if (!clean) return;
    const id = clientId || makeId();
    nameRef.current = clean; setName(clean); setClientId(id); setJoined(true);
    localStorage.setItem(storageKey, JSON.stringify({ clientId: id, name: clean, joined: true, draft: '', draftQ: 0, submittedQ: null, pending: pendingRef.current }));
  };

  const submitAnswer = async (event: React.FormEvent) => {
    event.preventDefault();
    const clean = answer.trim();
    if (!clean || submittedQ === state.qIndex || state.phase !== 'question') return;
    const payload = { msgId: makeId(), clientId, name: nameRef.current, qIndex: state.qIndex, answer: clean, submittedAt: Date.now() };
    pendingRef.current.push(payload); setPendingCount(pendingRef.current.length); setSubmittedQ(state.qIndex); submittedRef.current = state.qIndex;
    persist({ submittedQ: state.qIndex, pending: pendingRef.current, draft: clean, draftQ: state.qIndex });
    setStatus('Sending answer…');
    await sendPending();
    if (pendingRef.current.length === 0) setStatus('Answer received — safely locked in');
  };

  const chooseBoardTeam = async (teamIndex: number) => {
    if (!clientId) return;
    setStatus('Joining team…');
    try {
      const result = await gameRequest<{ state: GameState }>({ action:'chooseTeam', room:roomCode, clientId, name:nameRef.current, teamIndex });
      applyState(result.state);
      setStatus('Connected — your team is saved');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Could not choose the team yet — tap it again.'); }
  };

  const studentBoardCommand = async (command: string, details: Record<string, unknown> = {}) => {
    if (!clientId || !stateRef.current.board) return;
    setStatus('Sending move…');
    try {
      const result = await gameRequest<{ state: GameState }>({ action:'boardCommand', room:roomCode, clientId, command, expectedBoardVersion:stateRef.current.board.version, ...details });
      applyState(result.state);
      setStatus('Connected — move saved');
    } catch { setStatus('Move not sent — reconnecting automatically…'); }
  };

  const submitBoardAnswer = async (questionId: string, value: string) => {
    const clean = value.trim();
    if (!clean || !clientId) return;
    const current = stateRef.current;
    const myTeam = current.myTeam;
    if (myTeam !== null && myTeam !== undefined) {
      const optimistic = {
        ...current,
        boardTeamStatuses: (current.boardTeamStatuses ?? []).map((team) => team.teamIndex === myTeam ? { ...team, submitted:true } : team),
      };
      stateRef.current = optimistic;
      setState(optimistic);
    }
    const payload = { action:'boardAnswer', clientId, name:nameRef.current, questionId, answer:clean, submittedAt:Date.now() };
    pendingRef.current.push(payload);
    setPendingCount(pendingRef.current.length);
    persist({ pending:pendingRef.current, draft:clean });
    setStatus('Sending team answer…');
    await sendPending();
    if (pendingRef.current.length === 0) setStatus('Team answer received — safely locked in');
  };

  const studentPotionCommand = async (command: string, details: Record<string, unknown> = {}) => {
    if (!clientId || !stateRef.current.potion) return;
    setStatus(command === 'plantPoison' ? 'Planting secret poison…' : 'Opening potion…');
    try {
      const result = await gameRequest<{ state: GameState }>({ action:'potionCommand', room:roomCode, clientId, command, expectedPotionVersion:stateRef.current.potion.version, ...details });
      applyState(result.state);
      setStatus(command === 'plantPoison' ? 'Secret poison saved' : 'Potion choice saved');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Move not sent — reconnecting automatically…');
      setPollCycle((value) => value + 1);
    }
  };

  const submitPotionAnswer = async (questionId: string, value: string) => {
    const clean = value.trim();
    if (!clean || !clientId) return;
    const current = stateRef.current;
    const teamIndex = current.myPotionTeam;
    if (teamIndex !== null && teamIndex !== undefined) {
      const optimistic = {
        ...current,
        potionTeamStatuses: (current.potionTeamStatuses ?? []).map((team) => team.teamIndex === teamIndex ? { ...team, submitted:true } : team),
      };
      stateRef.current = optimistic;
      setState(optimistic);
    }
    const payload = { action:'potionAnswer', clientId, name:nameRef.current, questionId, answer:clean, submittedAt:Date.now() };
    pendingRef.current.push(payload);
    setPendingCount(pendingRef.current.length);
    persist({ pending:pendingRef.current, draft:clean });
    setStatus('Sending team answer…');
    await sendPending();
    if (pendingRef.current.length === 0) setStatus('Team answer received — safely locked in');
  };

  if (!joined) return (
    <main className="student-shell login-shell"><div className="phone-confetti" aria-hidden="true"><i>★</i><i>⚡</i><i>◆</i><i>✦</i><i>●</i></div><section className="join-card"><div className="join-crown">👑</div><p className="lets">LET’S</p><h1>QUIZ!</h1><p className="play-ribbon">BATTLE {requestedBattle} · PLAY · LEARN · WIN</p><form onSubmit={join}><label htmlFor="player-name">Enter your name</label><input id="player-name" autoComplete="name" maxLength={30} value={name} onChange={(event) => setName(event.target.value)} placeholder="Type your name" autoFocus /><button className="game-button join-button" type="submit">JOIN BATTLE {requestedBattle} <span>➜</span></button></form><div className="join-room">ROOM {roomCode}</div><div className="how-it-works"><div><span>▦</span><strong>Scan QR</strong><small>from teacher</small></div><div><span>⚡</span><strong>Answer</strong><small>on your phone</small></div><div><span>🏆</span><strong>Earn points</strong><small>& climb the board</small></div></div><p className="reliability-note">Your place is saved—even if your screen sleeps.</p></section></main>
  );

  if (isBoardBattle(state.battle)) {
    if (!state.board) return <main className="b3-student-shell"><div className="loading-screen">Preparing Battle {state.battle} teams…</div></main>;
    return <StudentBoard key={state.board.currentQuestionId ?? `round-${state.board.round}`} battle={state.battle} board={state.board} statuses={state.boardTeamStatuses ?? []} myTeam={state.myTeam ?? null} connected={connected} busy={status.startsWith('Sending') || status.startsWith('Joining')} answer={answer} onAnswerChange={setAnswer} onChooseTeam={chooseBoardTeam} onCommand={studentBoardCommand} onSubmit={submitBoardAnswer} />;
  }

  if (isPotionBattle(state.battle)) {
    if (!state.potion) return <main className="p6-phone-shell"><div className="loading-screen">Preparing Battle 6 teams…</div></main>;
    return <StudentPotion key={state.potion.currentQuestionId ?? `round-${state.potion.round}-${state.potion.phase}`} game={state.potion} statuses={state.potionTeamStatuses ?? []} myTeam={state.myPotionTeam ?? null} connected={connected} busy={status.startsWith('Sending') || status.startsWith('Joining') || status.startsWith('Planting') || status.startsWith('Opening')} answer={answer} onAnswerChange={setAnswer} onChooseTeam={chooseBoardTeam} onCommand={studentPotionCommand} onSubmit={submitPotionAnswer} />;
  }

  return (
    <main className={`student-shell ${showingResult ? (resultCorrect ? 'result-correct' : 'result-wrong') : ''}`}><section className={`student-card student-${state.phase} ${showingResult ? (resultCorrect ? 'student-result-correct' : 'student-result-wrong') : ''}`}>
      <header className="student-header"><div className="student-score"><span>★</span><strong>{myScore.toLocaleString()}</strong></div><div><p>GRAMMAR BATTLE {state.battle}</p><strong>{name}</strong></div><div className={`student-status ${connected ? 'connected' : ''}`}><span />{connected ? 'Connected' : 'Reconnecting'}</div></header>
      {state.phase === 'lobby' && <div className="waiting-screen"><div className="waiting-icon">✓</div><h1>You’re in!</h1><p>Look at the main screen. The game will start soon.</p><div className="waiting-room">ROOM {roomCode}</div></div>}
      {state.phase === 'get-ready' && <div className="student-ready"><span>GET READY!</span><h1>Question {state.qIndex + 1}</h1><div>{secondsLeft}</div><p>Eyes on the main screen 👀</p></div>}
      {(state.phase === 'question' || state.phase === 'locked') && <div className="student-question answer-only"><div className="student-round"><span>Question {state.qIndex + 1} of {QUESTION_SETS[state.battle].length}</span><div className={`student-timer ${secondsLeft <= 5 ? 'urgent' : ''}`}><strong>{state.phase === 'locked' ? '0' : secondsLeft}</strong><small>SEC</small></div></div><div className="mobile-progress"><i style={{ width: `${(state.qIndex + 1) * 10}%` }} /><span>{state.qIndex + 1}/10</span></div>{submittedQ === state.qIndex ? <div className="answer-locked"><span>✓</span><h2>Answer locked!</h2><p>Look at the main screen and wait for the reveal.</p></div> : <form onSubmit={(event) => void submitAnswer(event)} className="answer-form"><label htmlFor="correction">Look at the main screen and type your answer.</label><textarea id="correction" value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={state.phase === 'locked'} autoCapitalize="none" autoCorrect="off" placeholder="Type your correction…" autoFocus /><div className="board-reminder">👀 <span>Question stays on the main screen</span></div><button type="submit" className="game-button submit-button" disabled={!answer.trim() || state.phase === 'locked'}>{state.phase === 'locked' ? 'TIME IS UP' : 'SUBMIT ANSWER'} <span>➤</span></button></form>}</div>}
      {showingResult && <div className="student-result"><div className="result-sparkles">✦ ★ ✦</div><p className="result-kicker">{state.phase === 'finished' ? 'GAME COMPLETE' : resultCorrect ? 'AWESOME!' : 'OOPS!'}</p><h1>{resultCorrect ? 'CORRECT!' : state.myResult ? 'TRY AGAIN!' : 'TIME’S UP!'}</h1><div className="result-symbol">{resultCorrect ? '🏆' : '☹'}</div><div className="round-points">★ {resultCorrect ? `+${state.myResult?.scoreEarned ?? 0}` : '0'} <span>POINTS</span></div><div className="total-score"><span>{state.phase === 'finished' ? 'Final score' : 'Total score'}</span><strong>{myScore.toLocaleString()}</strong></div><p className="watch-board">Look at the main screen for the answer, explanation and leaderboard.</p></div>}
      <footer className="student-footer"><span>{status}</span>{pendingCount > 0 && <strong>{pendingCount} saved answer{pendingCount === 1 ? '' : 's'} waiting to send</strong>}{!connected && <button type="button" className="manual-reconnect" onClick={restartStudentConnection}>Reconnect now</button>}</footer>
    </section></main>
  );
}

export default function Home() {
  const [mode, setMode] = useState<'teacher' | 'student' | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [requestedBattle, setRequestedBattle] = useState<BattleId>(1);
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    const battle: BattleId = params.get('battle') === '6' ? 6 : params.get('battle') === '4' ? 4 : params.get('battle') === '3' ? 3 : params.get('battle') === '2' ? 2 : 1;
    // This effect intentionally selects teacher/student mode from the join URL.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (room && /^\d{5}$/.test(room)) { setRoomCode(room); setRequestedBattle(battle); setMode('student'); } else setMode('teacher');
    if (window.QRCode) setQrReady(true);
    else {
      const existing = document.getElementById('grammartest-qrcode') as HTMLScriptElement | null;
      const script = existing ?? document.createElement('script');
      const ready = () => setQrReady(true);
      if (!existing) { script.id = 'grammartest-qrcode'; script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'; script.async = true; document.head.appendChild(script); }
      script.addEventListener('load', ready, { once: true });
    }
  }, []);

  return mode === null ? <main className="loading-screen">Opening grammartest…</main> : mode === 'student' ? <StudentGame roomCode={roomCode} requestedBattle={requestedBattle} /> : <TeacherGame qrReady={qrReady} />;
}
