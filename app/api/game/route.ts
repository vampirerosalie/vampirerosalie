import { env } from 'cloudflare:workers';
import { BOARD_MCQ_ANSWERS } from '../../battle3-answers';
import { BOARD_QUESTIONS } from '../../battle3-data';
import { BM_BOARD_ANSWERS } from '../../battle4-answers';
import { BM_BOARD_QUESTIONS } from '../../battle4-data';
import { POWER_CARDS, applyPowerCardEffect, categoryForSquare, createDefaultBoard, type BoardGame, type CardId } from '../../battle3-types';
import { POTION_QUESTIONS } from '../../battle6-data';
import { createPotionGame, type PotionGame } from '../../battle6-types';

const ANSWER_SETS: Record<1 | 2, string[]> = {
  1: ['washes', 'were doing', 'is cooking', 'went', 'made', 'are returned', 'drives', 'was shopping', 'finished', 'were baked'],
  2: ['was walking', 'had never given', 'a few', 'went out', 'had started', 'the', 'were talking', 'had left', 'a lot of', 'had finished'],
};
const QUESTION_COUNT = 10;

const VALID_PHASES = new Set(['lobby', 'get-ready', 'question', 'locked', 'reveal', 'leaderboard', 'finished', 'board']);
const ONLINE_WINDOW_MS = 45_000;
const PLAYER_RETENTION_MS = 12 * 60 * 60 * 1_000;

function isBoardBattle(battle: number) {
  return battle === 3 || battle === 4;
}

function isPotionBattle(battle: number) {
  return battle === 6;
}

function isTeamBattle(battle: number) {
  return isBoardBattle(battle) || isPotionBattle(battle);
}

function questionsForBattle(battle: number) {
  return battle === 4 ? BM_BOARD_QUESTIONS : BOARD_QUESTIONS;
}

type RoomRow = { room_id: string; teacher_token: string; phase: string; battle: number; question_index: number; ends_at: number; updated_at: number };
type PlayerRow = { client_id: string; name: string; score: number; last_seen: number; answered_question: number | null };
type AnswerRow = { client_id: string; name: string; answer: string; correct: number; score_earned: number };
type BoardMemberRow = { client_id: string; team_index: number; last_seen: number };
type BoardAnswerRow = { team_index: number; answer: string; verdict: string | null };
type BoardGameRow = { state_json: string; updated_at: number };
type ServerPotionGame = Omit<PotionGame, 'teams'> & { teams: Array<PotionGame['teams'][number] & { poisonBottle: number | null }> };

function database() {
  if (!env.DB) throw new Error('The game database is unavailable.');
  return env.DB;
}

function cleanRoom(value: unknown) {
  const room = String(value ?? '');
  return /^\d{5}$/.test(room) ? room : '';
}

function cleanName(value: unknown) {
  return String(value ?? '').trim().slice(0, 30);
}

function normalizeAnswer(value: unknown) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function validTransition(fromPhase: string, fromQuestion: number, toPhase: string, toQuestion: number) {
  if (fromPhase === 'lobby') return toPhase === 'question' && toQuestion === 0;
  if (fromPhase === 'question') return toQuestion === fromQuestion && (toPhase === 'locked' || toPhase === 'reveal');
  if (fromPhase === 'locked') return toPhase === 'reveal' && toQuestion === fromQuestion;
  if (fromPhase === 'reveal') return toQuestion === fromQuestion && (toPhase === 'leaderboard' || toPhase === 'finished');
  if (fromPhase === 'leaderboard') return toPhase === 'get-ready' && toQuestion === fromQuestion + 1 && toQuestion < QUESTION_COUNT;
  if (fromPhase === 'get-ready') return toPhase === 'question' && toQuestion === fromQuestion;
  return false;
}

async function readRoom(roomId: string) {
  return database().prepare('SELECT * FROM rooms WHERE room_id = ?').bind(roomId).first<RoomRow>();
}

async function verifyTeacher(roomId: string, token: string) {
  const room = await readRoom(roomId);
  return room && room.teacher_token === token ? room : null;
}

async function readBoard(roomId: string) {
  const row = await database().prepare('SELECT state_json, updated_at FROM board_games WHERE room_id = ?').bind(roomId).first<BoardGameRow>();
  if (!row) return null;
  try {
    const state = JSON.parse(row.state_json) as BoardGame;
    state.version = row.updated_at;
    state.answerRevealed = Boolean(state.answerRevealed);
    state.countdownEndsAt = Number.isFinite(state.countdownEndsAt) ? Number(state.countdownEndsAt) : null;
    return state;
  } catch {
    return null;
  }
}

async function readPotion(roomId: string) {
  const row = await database().prepare('SELECT state_json, updated_at FROM board_games WHERE room_id = ?').bind(roomId).first<BoardGameRow>();
  if (!row) return null;
  try {
    const state = JSON.parse(row.state_json) as ServerPotionGame;
    state.version = row.updated_at;
    state.countdownEndsAt = Number.isFinite(state.countdownEndsAt) ? Number(state.countdownEndsAt) : null;
    return state;
  } catch {
    return null;
  }
}

function addPotionEvent(game: ServerPotionGame, message: string) {
  game.eventLog = [message, ...game.eventLog].slice(0, 18);
}

function startPotionQuestion(game: ServerPotionGame) {
  const nextRound = game.round + 1;
  game.round = nextRound;
  game.currentQuestionId = game.deck[nextRound - 1] ?? null;
  game.phase = nextRound > 20 || !game.currentQuestionId ? 'finished' : 'question';
  game.eligible = [];
  game.picker = null;
  game.countdownEndsAt = null;
  game.lastReveal = null;
  if (game.phase === 'question') addPotionEvent(game, `Question ${nextRound} started.`);
}

function addBoardEvent(board: BoardGame, message: string) {
  board.eventLog = [message, ...board.eventLog].slice(0, 18);
}

function rollDie(previous: number | null) {
  let roll = 1 + Math.floor(Math.random() * 6);
  if (roll === previous) roll = 1 + Math.floor(Math.random() * 6);
  return roll;
}

function drawPowerCard(board: BoardGame, teamIndex: number) {
  const card = POWER_CARDS[Math.floor(Math.random() * POWER_CARDS.length)];
  const team = board.teams[teamIndex];
  team.cards[card.id] += 1;
  board.overlay = { icon:card.icon, title:`${team.name} drew ${card.name}!`, message:card.description, at:Date.now() };
  addBoardEvent(board, `${team.name} drew ${card.name}.`);
}

function awardChallengePoint(board: BoardGame, teamIndex: number, amount = 1) {
  const team = board.teams[teamIndex];
  team.points += amount;
  while (team.points >= 3) {
    team.points -= 3;
    drawPowerCard(board, teamIndex);
  }
}

async function snapshot(roomId: string, teacherToken?: string, studentClientId?: string) {
  const db = database();
  const room = await readRoom(roomId);
  if (!room) return null;
  const isTeacher = Boolean(teacherToken && teacherToken === room.teacher_token);
  const isBoardGame = isBoardBattle(room.battle);
  const isPotionGame = isPotionBattle(room.battle);
  const isTeamGame = isBoardGame || isPotionGame;
  const retentionCutoff = Date.now() - PLAYER_RETENTION_MS;
  const [playerResult, answerCount, responseResult, boardResult, potionResult] = await Promise.all([
    db.prepare('SELECT client_id, name, score, last_seen, answered_question FROM players WHERE room_id = ? AND last_seen >= ? ORDER BY score DESC, name ASC').bind(roomId, retentionCutoff).all<PlayerRow>(),
    isTeamGame
      ? Promise.resolve({ count: 0 })
      : db.prepare('SELECT COUNT(*) AS count FROM answers WHERE room_id = ? AND question_index = ?').bind(roomId, room.question_index).first<{ count: number }>(),
    isTeamGame || (!isTeacher && !studentClientId)
      ? Promise.resolve(null)
      : isTeacher
        ? db.prepare('SELECT client_id, name, answer, correct, score_earned FROM answers WHERE room_id = ? AND question_index = ? ORDER BY submitted_at ASC').bind(roomId, room.question_index).all<AnswerRow>()
        : db.prepare('SELECT client_id, name, answer, correct, score_earned FROM answers WHERE room_id = ? AND question_index = ? AND client_id = ?').bind(roomId, room.question_index, studentClientId!).first<AnswerRow>(),
    isBoardGame ? readBoard(roomId) : Promise.resolve(null),
    isPotionGame ? readPotion(roomId) : Promise.resolve(null),
  ]);
  const players = playerResult.results ?? [];
  const onlineCutoff = Date.now() - ONLINE_WINDOW_MS;
  const responses = isTeacher && responseResult && 'results' in responseResult ? responseResult.results ?? [] : [];
  const myResult = !isTeacher && responseResult && !('results' in responseResult) ? responseResult : null;
  const myPlayer = studentClientId ? players.find((player) => player.client_id === studentClientId) : undefined;
  const resultVisible = ['reveal', 'leaderboard', 'finished'].includes(room.phase);
  const hiddenRoundScore = !resultVisible && myResult ? Number(myResult.score_earned) : 0;
  let board: BoardGame | null = null;
  let boardTeamStatuses: Array<{ teamIndex: number; memberCount: number; occupied: boolean; memberName: string | null; submitted: boolean; verdict: string | null }> = [];
  let boardResponses: Array<{ teamIndex: number; answer: string; verdict: 'accept' | 'reject' | null }> | undefined;
  let boardAnswerKey: { answer: string; explanation: string; optionLetter: string | null } | undefined;
  let myTeam: number | null = null;
  if (isBoardGame) {
    board = boardResult ?? createDefaultBoard();
    const [memberResult, answerResult] = await Promise.all([
      db.prepare('SELECT client_id, team_index, last_seen FROM board_members WHERE room_id = ? AND last_seen >= ?').bind(roomId, retentionCutoff).all<BoardMemberRow>(),
      board.currentQuestionId
        ? db.prepare('SELECT team_index, answer, verdict FROM board_answers WHERE room_id = ? AND question_id = ?').bind(roomId, board.currentQuestionId).all<BoardAnswerRow>()
        : Promise.resolve({ results: [] as BoardAnswerRow[] }),
    ]);
    const members = memberResult.results ?? [];
    const boardAnswers = answerResult.results ?? [];
    const allTeamsSubmitted = boardAnswers.filter((answer) => answer.answer.trim()).length === board.teamCount;
    if (studentClientId) {
      const membership = members.find((member) => member.client_id === studentClientId && member.team_index < board!.teamCount);
      myTeam = membership?.team_index ?? null;
    }
    boardTeamStatuses = board.teams.map((_, teamIndex) => {
      const result = boardAnswers.find((answer) => answer.team_index === teamIndex);
      const teamMember = members.find((member) => member.team_index === teamIndex);
      return {
        teamIndex,
        memberCount: members.filter((member) => member.team_index === teamIndex && member.last_seen >= onlineCutoff).length,
        occupied: Boolean(teamMember),
        memberName: teamMember ? players.find((player) => player.client_id === teamMember.client_id)?.name ?? 'Player' : null,
        submitted: Boolean(result?.answer),
        verdict: result?.verdict === 'accept' || result?.verdict === 'reject' ? result.verdict : null,
      };
    });
    if (isTeacher) {
      boardResponses = boardAnswers
        .filter((answer) => answer.answer.trim())
        .map((answer) => ({
          teamIndex: answer.team_index,
          answer: answer.answer,
          verdict: answer.verdict === 'accept' || answer.verdict === 'reject' ? answer.verdict : null,
        }));
      const question = questionsForBattle(room.battle).find((item) => item.id === board?.currentQuestionId);
      if (room.battle === 4 && question && board.answerRevealed) {
        const answer = BM_BOARD_ANSWERS[question.id];
        if (answer) boardAnswerKey = answer;
      } else {
        const correctAnswer = question?.type === 'MCQ' && (allTeamsSubmitted || board.answerRevealed) ? BOARD_MCQ_ANSWERS[question.id] : undefined;
        if (question && correctAnswer) {
          const answerIndex = question.options.findIndex((option) => normalizeAnswer(option) === normalizeAnswer(correctAnswer));
          boardAnswerKey = {
            answer: correctAnswer,
            explanation: 'Use this key to review each team’s multiple-choice response.',
            optionLetter: answerIndex >= 0 ? String.fromCharCode(65 + answerIndex) : null,
          };
        }
      }
    }
  }
  let potion: PotionGame | null = null;
  let potionTeamStatuses: Array<{ teamIndex: number; memberCount: number; occupied: boolean; memberName: string | null; submitted: boolean; verdict: 'accept' | 'reject' | null }> = [];
  let potionResponses: Array<{ teamIndex: number; answer: string; verdict: 'accept' | 'reject' | null }> | undefined;
  let potionAnswerKey: { answer: string; explanation: string; optionLetter: string | null } | undefined;
  let myPotionTeam: number | null = null;
  if (isPotionGame) {
    const serverPotion = potionResult ?? createPotionGame();
    const [memberResult, answerResult] = await Promise.all([
      db.prepare('SELECT client_id, team_index, last_seen FROM board_members WHERE room_id = ? AND last_seen >= ?').bind(roomId, retentionCutoff).all<BoardMemberRow>(),
      serverPotion.currentQuestionId
        ? db.prepare('SELECT team_index, answer, verdict FROM board_answers WHERE room_id = ? AND question_id = ?').bind(roomId, serverPotion.currentQuestionId).all<BoardAnswerRow>()
        : Promise.resolve({ results: [] as BoardAnswerRow[] }),
    ]);
    const members = memberResult.results ?? [];
    const potionAnswers = answerResult.results ?? [];
    if (studentClientId) {
      const membership = members.find((member) => member.client_id === studentClientId && member.team_index < serverPotion.teamCount);
      myPotionTeam = membership?.team_index ?? null;
    }
    potionTeamStatuses = serverPotion.teams.map((_, teamIndex) => {
      const result = potionAnswers.find((answer) => answer.team_index === teamIndex);
      const member = members.find((candidate) => candidate.team_index === teamIndex);
      return {
        teamIndex,
        memberCount: members.filter((candidate) => candidate.team_index === teamIndex && candidate.last_seen >= onlineCutoff).length,
        occupied: Boolean(member),
        memberName: member ? players.find((player) => player.client_id === member.client_id)?.name ?? 'Player' : null,
        submitted: Boolean(result?.answer.trim()),
        verdict: result?.verdict === 'accept' || result?.verdict === 'reject' ? result.verdict : null,
      };
    });
    if (isTeacher) {
      potionResponses = potionAnswers.filter((answer) => answer.answer.trim()).map((answer) => ({
        teamIndex: answer.team_index,
        answer: answer.answer,
        verdict: answer.verdict === 'accept' || answer.verdict === 'reject' ? answer.verdict : null,
      }));
      const question = POTION_QUESTIONS.find((item) => item.id === serverPotion.currentQuestionId);
      if (question) {
        const answerIndex = question.options.findIndex((option) => normalizeAnswer(option) === normalizeAnswer(question.answer));
        potionAnswerKey = {
          answer: question.answer,
          explanation: question.note || (question.type === 'MCQ' ? 'Use the supplied key while reviewing each team’s choice.' : 'Accept any accurate, reasonable answer—not only the exact wording shown.'),
          optionLetter: answerIndex >= 0 ? String.fromCharCode(65 + answerIndex) : null,
        };
      }
    }
    potion = {
      ...serverPotion,
      teams: serverPotion.teams.map(({ poisonBottle: _secret, ...team }) => team),
    };
  }
  return {
    phase: room.phase,
    battle: room.battle === 6 ? 6 : room.battle === 4 ? 4 : room.battle === 3 ? 3 : room.battle === 2 ? 2 : 1,
    qIndex: room.question_index,
    endsAt: room.ends_at,
    version: room.updated_at,
    answeredCount: Number(answerCount?.count ?? 0),
    onlineCount: players.filter((player) => player.last_seen >= onlineCutoff).length,
    players: isTeacher ? players.map((player) => ({ clientId: player.client_id, name: player.name, score: player.score, online: player.last_seen >= onlineCutoff, lastSeen: player.last_seen, answeredQ: player.answered_question })) : undefined,
    leaderboard: isTeacher ? players.map((player) => ({ clientId: player.client_id, name: player.name, score: player.score })) : [],
    responses: isTeacher ? responses.map((response) => ({ clientId: response.client_id, name: response.name, answer: response.answer, correct: Boolean(response.correct), scoreEarned: response.score_earned })) : undefined,
    myScore: isTeacher ? undefined : Math.max(0, Number(myPlayer?.score ?? 0) - hiddenRoundScore),
    mySubmission: !isTeacher && myResult ? { answer: myResult.answer } : undefined,
    myResult: !isTeacher && resultVisible && myResult ? { answer: myResult.answer, correct: Boolean(myResult.correct), scoreEarned: myResult.score_earned } : undefined,
    board,
    boardTeamStatuses,
    boardResponses,
    boardAnswerKey,
    myTeam,
    potion,
    potionTeamStatuses,
    potionResponses,
    potionAnswerKey,
    myPotionTeam,
  };
}

function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const action = String(body.action ?? '');
    const roomId = cleanRoom(body.room);
    if (!roomId) return apiError('A valid five-digit room code is required.');
    const db = database();
    const now = Date.now();

    if (action === 'create') {
      const teacherToken = String(body.teacherToken ?? '');
      if (teacherToken.length < 20) return apiError('Teacher token is missing.');
      await db.prepare("INSERT OR IGNORE INTO rooms (room_id, teacher_token, phase, question_index, ends_at, updated_at) VALUES (?, ?, 'lobby', 0, 0, ?)").bind(roomId, teacherToken, now).run();
      const room = await readRoom(roomId);
      if (!room || room.teacher_token !== teacherToken) return apiError('That room code is already in use. Refresh to create another.', 409);
      const staleCutoff = now - PLAYER_RETENTION_MS;
      await db.batch([
        db.prepare('DELETE FROM board_members WHERE room_id = ? AND last_seen < ?').bind(roomId, staleCutoff),
        db.prepare('DELETE FROM players WHERE room_id = ? AND last_seen < ?').bind(roomId, staleCutoff),
      ]);
      return Response.json({ ok: true, state: await snapshot(roomId, teacherToken) });
    }

    if (action === 'poll') {
      const clientId = String(body.clientId ?? '');
      const name = cleanName(body.name);
      const teacherToken = String(body.teacherToken ?? '');
      if (clientId && name) {
        await db.prepare(`INSERT INTO players (room_id, client_id, name, score, last_seen, answered_question)
          VALUES (?, ?, ?, 0, ?, NULL)
          ON CONFLICT(room_id, client_id) DO UPDATE SET name = excluded.name, last_seen = excluded.last_seen`)
          .bind(roomId, clientId, name, now).run();
        await db.prepare('UPDATE board_members SET last_seen = ? WHERE room_id = ? AND client_id = ?').bind(now, roomId, clientId).run();
      } else if (!(await verifyTeacher(roomId, teacherToken))) {
        return apiError('Room not found.', 404);
      }
      const state = await snapshot(roomId, teacherToken || undefined, clientId || undefined);
      return state ? Response.json({ ok: true, state }) : apiError('Room not found.', 404);
    }

    if (action === 'setGame') {
      const teacherToken = String(body.teacherToken ?? '');
      const room = await verifyTeacher(roomId, teacherToken);
      if (!room) return apiError('Teacher control was not recognized.', 403);
      if (isTeamBattle(room.battle)) return apiError('This battle uses its team-game controls.');
      const phase = String(body.phase ?? '');
      const qIndex = Number(body.qIndex);
      const endsAt = Number(body.endsAt ?? 0);
      const expectedVersion = Number(body.expectedVersion);
      const expectedPhase = String(body.expectedPhase ?? '');
      const expectedQuestion = Number(body.expectedQuestion);
      if (!VALID_PHASES.has(phase) || !Number.isInteger(qIndex) || qIndex < 0 || qIndex >= QUESTION_COUNT) return apiError('Invalid game state.');
      if (!Number.isInteger(expectedVersion) || expectedPhase !== room.phase || expectedQuestion !== room.question_index || !validTransition(room.phase, room.question_index, phase, qIndex)) {
        return Response.json({ ok: true, conflict: true, state: await snapshot(roomId, teacherToken) });
      }
      if (expectedVersion !== room.updated_at) return Response.json({ ok: true, conflict: true, state: await snapshot(roomId, teacherToken) });
      if ((phase === 'question' || phase === 'get-ready') && endsAt <= now) return apiError('The countdown timestamp is invalid.');
      const nextVersion = Math.max(now, room.updated_at + 1);
      const updated = await db.prepare('UPDATE rooms SET phase = ?, question_index = ?, ends_at = ?, updated_at = ? WHERE room_id = ? AND teacher_token = ? AND phase = ? AND question_index = ? AND updated_at = ?')
        .bind(phase, qIndex, endsAt, nextVersion, roomId, teacherToken, expectedPhase, expectedQuestion, expectedVersion).run();
      if (updated.meta.changes === 0) return Response.json({ ok: true, conflict: true, state: await snapshot(roomId, teacherToken) });
      if (phase === 'question') {
        await db.batch([
          db.prepare('DELETE FROM answers WHERE room_id = ? AND question_index = ?').bind(roomId, qIndex),
          db.prepare('UPDATE players SET answered_question = NULL WHERE room_id = ?').bind(roomId),
        ]);
      }
      return Response.json({ ok: true, state: await snapshot(roomId, teacherToken) });
    }

    if (action === 'setBattle') {
      const teacherToken = String(body.teacherToken ?? '');
      const room = await verifyTeacher(roomId, teacherToken);
      if (!room) return apiError('Teacher control was not recognized.', 403);
      const battle = Number(body.battle);
      const expectedVersion = Number(body.expectedVersion);
      if ((battle !== 1 && battle !== 2 && battle !== 3 && battle !== 4 && battle !== 6) || room.phase !== 'lobby') return apiError('Battle can only be selected in the lobby.');
      if (!Number.isInteger(expectedVersion) || expectedVersion !== room.updated_at) {
        return Response.json({ ok: true, conflict: true, state: await snapshot(roomId, teacherToken) });
      }
      const nextVersion = Math.max(now, room.updated_at + 1);
      const updated = await db.prepare("UPDATE rooms SET battle = ?, question_index = 0, ends_at = 0, updated_at = ? WHERE room_id = ? AND teacher_token = ? AND phase = 'lobby' AND updated_at = ?")
        .bind(battle, nextVersion, roomId, teacherToken, expectedVersion).run();
      if (updated.meta.changes === 0) return Response.json({ ok: true, conflict: true, state: await snapshot(roomId, teacherToken) });
      await db.batch([
        db.prepare('DELETE FROM answers WHERE room_id = ?').bind(roomId),
        db.prepare('UPDATE players SET score = 0, answered_question = NULL WHERE room_id = ?').bind(roomId),
        db.prepare('DELETE FROM board_answers WHERE room_id = ?').bind(roomId),
        db.prepare('DELETE FROM board_members WHERE room_id = ?').bind(roomId),
      ]);
      if (isTeamBattle(battle)) {
        const board = battle === 6 ? createPotionGame() : createDefaultBoard();
        await db.prepare('INSERT INTO board_games (room_id, state_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(room_id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at')
          .bind(roomId, JSON.stringify(board), nextVersion).run();
      }
      return Response.json({ ok: true, state: await snapshot(roomId, teacherToken) });
    }

    if (action === 'startBoard') {
      const teacherToken = String(body.teacherToken ?? '');
      const room = await verifyTeacher(roomId, teacherToken);
      if (!room || !isTeamBattle(room.battle)) return apiError('Teacher control was not recognized.', 403);
      if (room.phase !== 'lobby') return Response.json({ ok:true, conflict:true, state:await snapshot(roomId, teacherToken) });
      const expectedVersion = Number(body.expectedVersion);
      if (expectedVersion !== room.updated_at) return Response.json({ ok:true, conflict:true, state:await snapshot(roomId, teacherToken) });
      const selectedBoard = room.battle === 6 ? await readPotion(roomId) : await readBoard(roomId);
      const teamPlaces = await db.prepare('SELECT COUNT(*) AS total, COUNT(DISTINCT team_index) AS distinct_teams FROM board_members WHERE room_id = ? AND team_index >= 0 AND team_index < ?')
        .bind(roomId, selectedBoard?.teamCount ?? 0).first<{ total: number; distinct_teams: number }>();
      if (!selectedBoard || Number(teamPlaces?.total ?? 0) !== selectedBoard.teamCount || Number(teamPlaces?.distinct_teams ?? 0) !== selectedBoard.teamCount) {
        return apiError(`Every team place must be chosen before Battle ${room.battle} can start.`, 409);
      }
      const nextVersion = Math.max(now, room.updated_at + 1);
      const updated = await db.prepare("UPDATE rooms SET phase = 'board', updated_at = ? WHERE room_id = ? AND teacher_token = ? AND phase = 'lobby' AND updated_at = ?")
        .bind(nextVersion, roomId, teacherToken, expectedVersion).run();
      if (updated.meta.changes === 0) return Response.json({ ok:true, conflict:true, state:await snapshot(roomId, teacherToken) });
      return Response.json({ ok:true, state:await snapshot(roomId, teacherToken) });
    }

    if (action === 'chooseTeam') {
      const clientId = String(body.clientId ?? '');
      const name = cleanName(body.name);
      const teamIndex = Number(body.teamIndex);
      const room = await readRoom(roomId);
      const board = room?.battle === 6 ? await readPotion(roomId) : await readBoard(roomId);
      if (!room || !isTeamBattle(room.battle) || !board) return apiError('The team game is not ready.', 409);
      if (room.phase !== 'lobby') return apiError('Teams are locked after the game starts.', 409);
      if (!clientId || !name || !Number.isInteger(teamIndex) || teamIndex < 0 || teamIndex >= board.teamCount) return apiError('Choose a valid team.');
      await db.prepare(`INSERT INTO players (room_id, client_id, name, score, last_seen, answered_question) VALUES (?, ?, ?, 0, ?, NULL)
        ON CONFLICT(room_id, client_id) DO UPDATE SET name = excluded.name, last_seen = excluded.last_seen`).bind(roomId, clientId, name, now).run();
      const existingMembership = await db.prepare('SELECT client_id, team_index, last_seen FROM board_members WHERE room_id = ? AND client_id = ?').bind(roomId, clientId).first<BoardMemberRow>();
      const assignment = existingMembership
        ? await db.prepare(`UPDATE board_members SET team_index = ?, last_seen = ?
            WHERE room_id = ? AND client_id = ?
            AND NOT EXISTS (SELECT 1 FROM board_members WHERE room_id = ? AND team_index = ? AND client_id <> ?)`)
            .bind(teamIndex, now, roomId, clientId, roomId, teamIndex, clientId).run()
        : await db.prepare(`INSERT INTO board_members (room_id, client_id, team_index, last_seen)
            SELECT ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM board_members WHERE room_id = ? AND team_index = ?)`)
            .bind(roomId, clientId, teamIndex, now, roomId, teamIndex).run();
      const membership = await db.prepare('SELECT client_id, team_index, last_seen FROM board_members WHERE room_id = ? AND client_id = ?').bind(roomId, clientId).first<BoardMemberRow>();
      if (assignment.meta.changes === 0 || membership?.team_index !== teamIndex) return apiError('That team has already been chosen. Choose an available team.', 409);
      return Response.json({ ok:true, state:await snapshot(roomId, undefined, clientId) });
    }

    if (action === 'potionAnswer') {
      const clientId = String(body.clientId ?? '');
      const questionId = String(body.questionId ?? '');
      const answer = String(body.answer ?? '').trim().slice(0, 900);
      const submittedAtValue = Number(body.submittedAt ?? now);
      const submittedAt = Number.isFinite(submittedAtValue) ? submittedAtValue : now;
      const room = await readRoom(roomId);
      const game = await readPotion(roomId);
      const member = clientId ? await db.prepare('SELECT client_id, team_index, last_seen FROM board_members WHERE room_id = ? AND client_id = ?').bind(roomId, clientId).first<BoardMemberRow>() : null;
      if (!room || !isPotionBattle(room.battle) || !game || !member) return apiError('Join a team before answering.', 403);
      if (game.phase !== 'question' || game.currentQuestionId !== questionId) return apiError('That question has already moved on.', 409);
      if (game.countdownEndsAt && submittedAt >= game.countdownEndsAt) return apiError('Time is up. The answer is locked.', 409);
      if (!answer) return apiError('Type or choose an answer first.');
      await db.prepare(`INSERT OR IGNORE INTO board_answers (room_id, question_id, team_index, answer, submitted_at, verdict)
        VALUES (?, ?, ?, ?, ?, NULL)`).bind(roomId, questionId, member.team_index, answer, submittedAt).run();
      return Response.json({ ok:true, accepted:true, state:await snapshot(roomId, undefined, clientId) });
    }

    if (action === 'potionCommand') {
      const room = await readRoom(roomId);
      const game = await readPotion(roomId);
      if (!room || !isPotionBattle(room.battle) || !game) return apiError('Witch’s Potion is not ready.', 409);
      const teacherToken = String(body.teacherToken ?? '');
      const clientId = String(body.clientId ?? '');
      const isTeacher = Boolean(teacherToken && teacherToken === room.teacher_token);
      const member = !isTeacher && clientId ? await db.prepare('SELECT client_id, team_index, last_seen FROM board_members WHERE room_id = ? AND client_id = ?').bind(roomId, clientId).first<BoardMemberRow>() : null;
      const command = String(body.command ?? '');
      const expectedVersion = Number(body.expectedPotionVersion);
      if (expectedVersion !== game.version) return Response.json({ ok:true, conflict:true, state:await snapshot(roomId, isTeacher ? teacherToken : undefined, clientId || undefined) });
      const originalVersion = game.version;
      const teacherCommands = new Set(['configureTeams','startQuestion','startCountdown','judge','markMissing','startPotionPhase','continueReveal','restock','newGame']);
      if (teacherCommands.has(command) && !isTeacher) return apiError('Only the teacher can use that control.', 403);
      if (!teacherCommands.has(command) && !member) return apiError('Join a team before using that control.', 403);

      if (command === 'configureTeams') {
        if (room.phase !== 'lobby') return apiError('Choose the team count before the game starts.');
        const teamCount = Math.max(2, Math.min(7, Number(body.teamCount) || 7));
        const fresh = createPotionGame(teamCount);
        const nextVersion = Math.max(now, originalVersion + 1);
        fresh.version = nextVersion;
        const saved = await db.prepare('UPDATE board_games SET state_json = ?, updated_at = ? WHERE room_id = ? AND updated_at = ?')
          .bind(JSON.stringify(fresh), nextVersion, roomId, originalVersion).run();
        if (saved.meta.changes === 0) return Response.json({ ok:true, conflict:true, state:await snapshot(roomId, teacherToken) });
        await db.batch([
          db.prepare('DELETE FROM board_members WHERE room_id = ?').bind(roomId),
          db.prepare('DELETE FROM board_answers WHERE room_id = ?').bind(roomId),
        ]);
        return Response.json({ ok:true, state:await snapshot(roomId, teacherToken) });
      }

      if (command === 'judge') {
        const teamIndex = Number(body.teamIndex);
        const verdict = String(body.verdict ?? '');
        if (game.phase !== 'question' || !game.currentQuestionId || !Number.isInteger(teamIndex) || teamIndex < 0 || teamIndex >= game.teamCount || !['accept','reject'].includes(verdict)) return apiError('That result cannot be recorded now.');
        const submitted = await db.prepare('SELECT answer FROM board_answers WHERE room_id = ? AND question_id = ? AND team_index = ? AND TRIM(answer) <> ?')
          .bind(roomId, game.currentQuestionId, teamIndex, '').first<{ answer: string }>();
        if (!submitted) return apiError('Wait for that team to submit before judging.', 409);
        await db.prepare('UPDATE board_answers SET verdict = ? WHERE room_id = ? AND question_id = ? AND team_index = ?')
          .bind(verdict, roomId, game.currentQuestionId, teamIndex).run();
        return Response.json({ ok:true, verdict:{ teamIndex, value:verdict } });
      }

      if (command === 'markMissing') {
        if (game.phase !== 'question' || !game.currentQuestionId) return apiError('There is no active question.');
        const statements = game.teams.map((_, teamIndex) => db.prepare(`INSERT OR IGNORE INTO board_answers (room_id, question_id, team_index, answer, submitted_at, verdict) VALUES (?, ?, ?, '', ?, 'reject')`).bind(roomId, game.currentQuestionId, teamIndex, now));
        await db.batch(statements);
        return Response.json({ ok:true, state:await snapshot(roomId, teacherToken) });
      }

      let clearAnswers = false;
      if (command === 'plantPoison' && member) {
        const number = Number(body.number);
        if (game.phase !== 'poison_setup' || !Number.isInteger(number) || number < 1 || number > 40 || game.opened.includes(number)) return apiError('Choose an available potion number.', 409);
        const team = game.teams[member.team_index];
        if (!team || !team.needsPoison) return apiError('Your team’s poison is already planted.', 409);
        team.poisonBottle = number;
        team.needsPoison = false;
        addPotionEvent(game, `${team.name} team planted a secret poison.`);
      } else if (command === 'startQuestion') {
        if (game.phase !== 'poison_setup' || game.teams.some((team) => team.needsPoison)) return apiError('Every team must secretly plant a poison first.', 409);
        startPotionQuestion(game);
        clearAnswers = true;
      } else if (command === 'startCountdown') {
        if (game.phase !== 'question' || !game.currentQuestionId) return apiError('Start the countdown during an active question.');
        game.countdownEndsAt = now + 10_000;
        addPotionEvent(game, 'Teacher started the 10-second countdown.');
      } else if (command === 'startPotionPhase') {
        if (game.phase !== 'question' || !game.currentQuestionId) return apiError('There is no active question.');
        const result = await db.prepare('SELECT team_index, verdict FROM board_answers WHERE room_id = ? AND question_id = ?').bind(roomId, game.currentQuestionId).all<BoardAnswerRow>();
        const answers = result.results ?? [];
        if (game.teams.some((_, teamIndex) => !answers.some((answer) => answer.team_index === teamIndex && (answer.verdict === 'accept' || answer.verdict === 'reject')))) return apiError('Accept or reject every team before opening the potion phase.', 409);
        game.eligible = game.teams.map((_, teamIndex) => teamIndex).filter((teamIndex) => answers.find((answer) => answer.team_index === teamIndex)?.verdict === 'accept');
        game.countdownEndsAt = null;
        if (game.eligible.length) {
          game.picker = game.eligible[0];
          game.phase = 'potion_pick';
          addPotionEvent(game, `${game.eligible.length} team${game.eligible.length === 1 ? '' : 's'} earned a potion choice.`);
        } else if (game.round >= 20) {
          game.phase = 'finished';
          game.currentQuestionId = null;
          addPotionEvent(game, 'Round 20 finished. Final Treasure scores are ready.');
        } else {
          startPotionQuestion(game);
          clearAnswers = true;
        }
      } else if (command === 'choosePotion' && member) {
        const number = Number(body.number);
        if (game.phase !== 'potion_pick' || game.picker !== member.team_index || !game.eligible.includes(member.team_index)) return apiError('Wait until it is your team’s potion choice.', 409);
        if (!Number.isInteger(number) || number < 1 || number > 40 || game.opened.includes(number)) return apiError('That potion has already been opened.', 409);
        const chooserIndex = member.team_index;
        const chooser = game.teams[chooserIndex];
        const owners = game.teams.map((team, teamIndex) => team.poisonBottle === number && !team.needsPoison ? teamIndex : -1).filter((teamIndex) => teamIndex >= 0);
        const hostileOwners = owners.filter((teamIndex) => teamIndex !== chooserIndex);
        let type: 'SAFE' | 'TREASURE' | 'POISON' = 'SAFE';
        let fullyPoisoned = false;
        let message = `${chooser.name} found a safe potion.`;
        if (hostileOwners.length) {
          type = 'POISON';
          chooser.poison += 1;
          if (chooser.poison >= 3) {
            chooser.treasure = Math.max(0, chooser.treasure - 1);
            chooser.poison = 1;
            fullyPoisoned = true;
          }
          const ownerNames = hostileOwners.map((teamIndex) => game.teams[teamIndex].name).join(' & ');
          message = `${ownerNames} poisoned Team ${chooser.name}! ${chooser.name} gains 1 Poison.`;
        } else if (Math.random() < 0.35) {
          type = 'TREASURE';
          chooser.treasure += 1;
          message = `${chooser.name} found a Treasure! +1 Treasure.`;
        }
        owners.forEach((teamIndex) => {
          game.teams[teamIndex].poisonBottle = null;
          game.teams[teamIndex].needsPoison = true;
        });
        game.opened = [...game.opened, number];
        game.eligible = game.eligible.filter((teamIndex) => teamIndex !== chooserIndex);
        game.picker = null;
        game.phase = 'reveal';
        game.lastReveal = { number, type, chooser:chooserIndex, owners:hostileOwners, message, fullyPoisoned };
        addPotionEvent(game, `${chooser.name} opened Potion ${number}: ${type}.`);
      } else if (command === 'continueReveal') {
        if (game.phase !== 'reveal') return apiError('Reveal a potion first.');
        game.lastReveal = null;
        if (game.eligible.length) {
          game.picker = game.eligible[0];
          game.phase = 'potion_pick';
        } else if (game.round >= 20) {
          game.phase = 'finished';
          game.currentQuestionId = null;
          addPotionEvent(game, 'Round 20 finished. Final Treasure scores are ready.');
        } else if (game.opened.length >= 30) {
          game.phase = 'restock';
          game.currentQuestionId = null;
          addPotionEvent(game, 'The witch is restocking the shelf.');
        } else if (game.teams.some((team) => team.needsPoison)) {
          game.phase = 'poison_setup';
          game.currentQuestionId = null;
          addPotionEvent(game, 'Used poison must be secretly replanted.');
        } else {
          startPotionQuestion(game);
          clearAnswers = true;
        }
      } else if (command === 'restock') {
        if (game.phase !== 'restock') return apiError('The shelf is not ready to restock.');
        game.opened = [];
        game.teams.forEach((team) => { team.poisonBottle = null; team.needsPoison = true; });
        game.phase = 'poison_setup';
        game.restockCount += 1;
        addPotionEvent(game, 'All 40 potions returned. Every team must plant new poison.');
      } else if (command === 'newGame') {
        if (!isTeacher) return apiError('Only the teacher can start a new game.', 403);
        Object.assign(game, createPotionGame(Math.max(2, Math.min(7, Number(body.teamCount) || game.teamCount))));
        clearAnswers = true;
      } else {
        return apiError('Unknown Witch’s Potion command.');
      }

      const nextVersion = Math.max(now, originalVersion + 1);
      game.version = nextVersion;
      const saved = await db.prepare('UPDATE board_games SET state_json = ?, updated_at = ? WHERE room_id = ? AND updated_at = ?')
        .bind(JSON.stringify(game), nextVersion, roomId, originalVersion).run();
      if (saved.meta.changes === 0) return Response.json({ ok:true, conflict:true, state:await snapshot(roomId, isTeacher ? teacherToken : undefined, clientId || undefined) });
      if (clearAnswers) await db.prepare('DELETE FROM board_answers WHERE room_id = ?').bind(roomId).run();
      return Response.json({ ok:true, state:await snapshot(roomId, isTeacher ? teacherToken : undefined, clientId || undefined) });
    }

    if (action === 'boardAnswer') {
      const clientId = String(body.clientId ?? '');
      const questionId = String(body.questionId ?? '');
      const answer = String(body.answer ?? '').trim().slice(0, 900);
      const submittedAtValue = Number(body.submittedAt ?? now);
      const submittedAt = Number.isFinite(submittedAtValue) ? submittedAtValue : now;
      const room = await readRoom(roomId);
      const board = await readBoard(roomId);
      const member = clientId ? await db.prepare('SELECT client_id, team_index, last_seen FROM board_members WHERE room_id = ? AND client_id = ?').bind(roomId, clientId).first<BoardMemberRow>() : null;
      if (!room || !isBoardBattle(room.battle) || !board || !member) return apiError('Join a team before answering.', 403);
      if (board.phase !== 'answering' || board.currentQuestionId !== questionId) return apiError('That challenge has already moved on.', 409);
      if (board.countdownEndsAt && submittedAt >= board.countdownEndsAt) return apiError('Time is up. The answer is locked.', 409);
      if (!answer) return apiError('Type or choose an answer first.');
      await db.prepare(`INSERT OR IGNORE INTO board_answers (room_id, question_id, team_index, answer, submitted_at, verdict)
        VALUES (?, ?, ?, ?, ?, NULL)`).bind(roomId, questionId, member.team_index, answer, submittedAt).run();
      return Response.json({ ok:true, accepted:true, state:await snapshot(roomId, undefined, clientId) });
    }

    if (action === 'boardCommand') {
      const room = await readRoom(roomId);
      const board = await readBoard(roomId);
      if (!room || !isBoardBattle(room.battle) || !board) return apiError('The board game is not ready.', 409);
      const teacherToken = String(body.teacherToken ?? '');
      const clientId = String(body.clientId ?? '');
      const isTeacher = Boolean(teacherToken && teacherToken === room.teacher_token);
      const member = !isTeacher && clientId ? await db.prepare('SELECT client_id, team_index, last_seen FROM board_members WHERE room_id = ? AND client_id = ?').bind(roomId, clientId).first<BoardMemberRow>() : null;
      const command = String(body.command ?? '');
      const expectedBoardVersion = Number(body.expectedBoardVersion);
      if (expectedBoardVersion !== board.version) return Response.json({ ok:true, conflict:true, state:await snapshot(roomId, isTeacher ? teacherToken : undefined, clientId || undefined) });
      const originalBoardVersion = board.version;
      const teacherCommands = new Set(['configureTeams','startChallenge','showAnswer','startCountdown','judge','markMissing','resolve','nextTurn','skipFrozen','newGame']);
      if (teacherCommands.has(command) && !isTeacher) return apiError('Only the teacher can use that control.', 403);
      if (!teacherCommands.has(command) && !member) return apiError('Join a team before using that control.', 403);

      if (command === 'configureTeams') {
        if (room.phase !== 'lobby') return apiError('Choose the team count before the game starts.');
        const teamCount = Math.max(2, Math.min(6, Number(body.teamCount) || 6));
        Object.assign(board, createDefaultBoard(teamCount));
        const nextBoardVersion = Math.max(now, originalBoardVersion + 1);
        board.version = nextBoardVersion;
        const saved = await db.prepare('UPDATE board_games SET state_json = ?, updated_at = ? WHERE room_id = ? AND updated_at = ?')
          .bind(JSON.stringify(board), nextBoardVersion, roomId, originalBoardVersion).run();
        if (saved.meta.changes === 0) return Response.json({ ok:true, conflict:true, state:await snapshot(roomId, teacherToken) });
        await db.batch([
          db.prepare('DELETE FROM board_members WHERE room_id = ?').bind(roomId),
          db.prepare('DELETE FROM board_answers WHERE room_id = ?').bind(roomId),
        ]);
        return Response.json({ ok:true, state:await snapshot(roomId, teacherToken) });
      }

      if (command === 'judge') {
        const teamIndex = Number(body.teamIndex);
        const verdict = String(body.verdict ?? '');
        if (board.phase !== 'answering' || !board.currentQuestionId || !Number.isInteger(teamIndex) || teamIndex < 0 || teamIndex >= board.teamCount || !['accept','reject'].includes(verdict)) return apiError('That result cannot be recorded now.');
        if (room.battle === 4 && !board.answerRevealed) return apiError('Reveal the answer and explanation before accepting or rejecting responses.', 409);
        await db.prepare(`INSERT INTO board_answers (room_id, question_id, team_index, answer, submitted_at, verdict) VALUES (?, ?, ?, '', ?, ?)
          ON CONFLICT(room_id, question_id, team_index) DO UPDATE SET verdict = excluded.verdict`)
          .bind(roomId, board.currentQuestionId, teamIndex, now, verdict).run();
        return Response.json({ ok:true, verdict:{ teamIndex, value:verdict } });
      }

      if (command === 'markMissing') {
        if (board.phase !== 'answering' || !board.currentQuestionId) return apiError('There is no active challenge.');
        const statements = board.teams.map((_, teamIndex) => db.prepare(`INSERT OR IGNORE INTO board_answers (room_id, question_id, team_index, answer, submitted_at, verdict) VALUES (?, ?, ?, '', ?, 'reject')`).bind(roomId, board.currentQuestionId, teamIndex, now));
        await db.batch(statements);
        return Response.json({ ok:true, state:await snapshot(roomId, teacherToken) });
      }

      let clearAnswers = false;
      if (command === 'showAnswer') {
        const question = questionsForBattle(room.battle).find((item) => item.id === board.currentQuestionId);
        if (board.phase !== 'answering' || !question) return apiError('The answer button is available during an active challenge.');
        if (room.battle === 3 && question.type !== 'MCQ') return apiError('The answer button is available for an active MCQ.');
        if (room.battle === 4) {
          const submitted = await db.prepare("SELECT COUNT(*) AS count FROM board_answers WHERE room_id = ? AND question_id = ? AND TRIM(answer) <> ''")
            .bind(roomId, board.currentQuestionId).first<{ count: number }>();
          if (Number(submitted?.count ?? 0) < board.teamCount) return apiError('Wait until every team has submitted before revealing the answer.', 409);
        }
        board.answerRevealed = true;
        addBoardEvent(board, `Teacher revealed the answer for ${question.id}.`);
      } else if (command === 'startCountdown') {
        if (board.phase !== 'answering' || !board.currentQuestionId) return apiError('Start the countdown during an active challenge.');
        board.countdownEndsAt = now + 10_000;
        addBoardEvent(board, 'Teacher started the 10-second countdown.');
      } else if (command === 'roll' && member) {
        if (board.phase !== 'await_roll' || member.team_index !== board.turn) return apiError('It is not your team’s turn to roll.');
        const team = board.teams[member.team_index];
        if (team.frozen > 0) return apiError('Your team is frozen this turn.');
        board.previousPos = team.pos;
        const roll = rollDie(board.lastDice);
        board.lastDice = roll;
        const move = roll + (team.boostArmed ? 2 : 0);
        if (team.boostArmed) { team.boostArmed = false; addBoardEvent(board, `${team.name} used Boost +2.`); }
        board.roll = roll;
        board.moveTotal = move;
        board.landedPos = Math.min(30, team.pos + move);
        team.pos = board.landedPos;
        board.phase = 'show_roll';
        board.overlay = { icon:'🎲', title:`${team.name} rolled ${roll}!`, message:`Move ${move} space${move === 1 ? '' : 's'}.`, at:now };
        addBoardEvent(board, `${team.name} rolled ${roll}${move !== roll ? ` and moved ${move} with Boost +2` : ''}.`);
      } else if (command === 'startChallenge') {
        if (board.phase !== 'show_roll') return apiError('Roll the dice before starting a challenge.');
        const category = categoryForSquare(board.landedPos);
        const pool = questionsForBattle(room.battle).filter((question) => question.category === category);
        let unused = pool.filter((question) => !(board.used[category] ?? []).includes(question.id));
        if (!unused.length) { board.used[category] = []; unused = pool; }
        const question = unused[Math.floor(Math.random() * unused.length)];
        board.used[category] = [...(board.used[category] ?? []), question.id];
        board.currentQuestionId = question.id;
        board.currentCategory = category;
        board.answerRevealed = false;
        board.countdownEndsAt = null;
        board.phase = 'answering';
        board.overlay = null;
        clearAnswers = true;
        addBoardEvent(board, `Challenge ${question.id} started: ${category}.`);
      } else if (command === 'resolve') {
        if (board.phase !== 'answering' || !board.currentQuestionId) return apiError('There is no active challenge.');
        await db.batch(board.teams.map((_, teamIndex) => db.prepare(`INSERT OR IGNORE INTO board_answers (room_id, question_id, team_index, answer, submitted_at, verdict) VALUES (?, ?, ?, '', ?, 'reject')`).bind(roomId, board.currentQuestionId!, teamIndex, now)));
        const answerResult = await db.prepare('SELECT team_index, answer, verdict FROM board_answers WHERE room_id = ? AND question_id = ?').bind(roomId, board.currentQuestionId).all<BoardAnswerRow>();
        const results = answerResult.results ?? [];
        const verdictFor = (teamIndex: number) => results.find((result) => result.team_index === teamIndex)?.verdict === 'accept';
        const active = board.turn;
        board.countdownEndsAt = null;
        board.teams.forEach((team, teamIndex) => {
          if (teamIndex === active || !verdictFor(teamIndex)) return;
          const points = team.doubleArmed ? 2 : 1;
          if (team.doubleArmed) team.doubleArmed = false;
          awardChallengePoint(board, teamIndex, points);
          addBoardEvent(board, `${team.name} earned ${points} challenge point${points === 1 ? '' : 's'}.`);
        });
        const activeTeam = board.teams[active];
        if (verdictFor(active)) {
          if (board.landedPos === 3) activeTeam.pos = 8;
          else if (board.landedPos === 9) activeTeam.pos = 11;
          else if (board.landedPos === 16) activeTeam.pos = 25;
          addBoardEvent(board, `${activeTeam.name} kept the move.`);
          if (activeTeam.pos === 30) { board.phase = 'finished'; board.winner = active; }
          else board.phase = 'round_result';
        } else if (activeTeam.shieldArmed) {
          activeTeam.shieldArmed = false;
          board.phase = 'round_result';
          addBoardEvent(board, `${activeTeam.name} used a Shield and kept the landing square.`);
        } else {
          activeTeam.pos = board.landedPos === 18 ? 7 : board.previousPos;
          board.phase = 'round_result';
          addBoardEvent(board, `${activeTeam.name} lost the move.`);
        }
      } else if (command === 'nextTurn' || command === 'skipFrozen') {
        if (command === 'nextTurn' && board.phase !== 'round_result') return apiError('Resolve the round first.');
        if (command === 'skipFrozen' && board.phase !== 'frozen') return apiError('No team is waiting to skip.');
        if (command === 'skipFrozen') board.teams[board.turn].frozen = Math.max(0, board.teams[board.turn].frozen - 1);
        board.turn = (board.turn + 1) % board.teamCount;
        if (board.turn === 0) board.round += 1;
        board.previousPos = board.teams[board.turn].pos;
        board.landedPos = board.previousPos;
        board.roll = null;
        board.moveTotal = null;
        board.currentQuestionId = null;
        board.currentCategory = null;
        board.answerRevealed = false;
        board.countdownEndsAt = null;
        board.overlay = null;
        board.phase = board.teams[board.turn].frozen > 0 ? 'frozen' : 'await_roll';
        clearAnswers = true;
      } else if (command === 'newGame') {
        const teamCount = Math.max(2, Math.min(6, Number(body.teamCount) || 6));
        Object.assign(board, createDefaultBoard(teamCount));
        clearAnswers = true;
      } else if (command === 'useCard' && member) {
        const teamIndex = member.team_index;
        const team = board.teams[teamIndex];
        const cardId = String(body.cardId ?? '') as CardId;
        const targetIndex = Number(body.targetIndex);
        const card = POWER_CARDS.find((item) => item.id === cardId);
        if (!card || !team.cards[cardId]) return apiError('That power card is not available.');
        const activeTurnCard = ['boost','reroll','freeze','back2'].includes(cardId);
        if (activeTurnCard && teamIndex !== board.turn) return apiError('That card can only be used on your team’s turn.');
        if (['boost','freeze','back2'].includes(cardId) && board.phase !== 'await_roll') return apiError('Use that card before rolling.');
        if (cardId === 'reroll' && board.phase !== 'show_roll') return apiError('Reroll can only be used after rolling.');
        if (['freeze','back2'].includes(cardId) && (!Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= board.teamCount || targetIndex === teamIndex)) return apiError('Choose another team as the target.');
        team.cards[cardId] -= 1;
        const rerollValue = cardId === 'reroll' ? rollDie(board.lastDice) : null;
        const message = applyPowerCardEffect(board, teamIndex, cardId, ['freeze','back2'].includes(cardId) ? targetIndex : null, rerollValue);
        board.overlay = { icon:card.icon, title:`${team.name} used ${card.name}!`, message, at:now };
        addBoardEvent(board, `${team.name} used ${card.name}.`);
      } else {
        return apiError('Unknown board-game command.');
      }

      const nextBoardVersion = Math.max(now, originalBoardVersion + 1);
      board.version = nextBoardVersion;
      const saved = await db.prepare('UPDATE board_games SET state_json = ?, updated_at = ? WHERE room_id = ? AND updated_at = ?')
        .bind(JSON.stringify(board), nextBoardVersion, roomId, originalBoardVersion).run();
      if (saved.meta.changes === 0) return Response.json({ ok:true, conflict:true, state:await snapshot(roomId, isTeacher ? teacherToken : undefined, clientId || undefined) });
      if (clearAnswers) await db.prepare('DELETE FROM board_answers WHERE room_id = ?').bind(roomId).run();
      return Response.json({ ok:true, state:await snapshot(roomId, isTeacher ? teacherToken : undefined, clientId || undefined) });
    }

    if (action === 'reset') {
      const teacherToken = String(body.teacherToken ?? '');
      const room = await verifyTeacher(roomId, teacherToken);
      if (!room) return apiError('Teacher control was not recognized.', 403);
      const resetStatements = [
        db.prepare('DELETE FROM answers WHERE room_id = ?').bind(roomId),
        db.prepare('DELETE FROM board_answers WHERE room_id = ?').bind(roomId),
        db.prepare('UPDATE players SET score = 0, answered_question = NULL WHERE room_id = ?').bind(roomId),
        db.prepare("UPDATE rooms SET phase = 'lobby', question_index = 0, ends_at = 0, updated_at = ? WHERE room_id = ?").bind(Math.max(now, room.updated_at + 1), roomId),
      ];
      if (isBoardBattle(room.battle)) {
        const existingBoard = await readBoard(roomId);
        const freshBoard = createDefaultBoard(existingBoard?.teamCount ?? 6);
        const boardVersion = Math.max(now, (existingBoard?.version ?? 0) + 1);
        freshBoard.version = boardVersion;
        resetStatements.push(db.prepare('UPDATE board_games SET state_json = ?, updated_at = ? WHERE room_id = ?').bind(JSON.stringify(freshBoard), boardVersion, roomId));
      } else if (isPotionBattle(room.battle)) {
        const existingGame = await readPotion(roomId);
        const freshGame = createPotionGame(existingGame?.teamCount ?? 7);
        const gameVersion = Math.max(now, (existingGame?.version ?? 0) + 1);
        freshGame.version = gameVersion;
        resetStatements.push(db.prepare('UPDATE board_games SET state_json = ?, updated_at = ? WHERE room_id = ?').bind(JSON.stringify(freshGame), gameVersion, roomId));
      }
      await db.batch(resetStatements);
      return Response.json({ ok: true, state: await snapshot(roomId, teacherToken) });
    }

    if (action === 'answer') {
      const clientId = String(body.clientId ?? '');
      const name = cleanName(body.name);
      const messageId = String(body.msgId ?? '');
      const qIndex = Number(body.qIndex);
      const submittedAt = Number(body.submittedAt ?? now);
      const answer = String(body.answer ?? '').trim().slice(0, 180);
      if (!clientId || !name || !messageId || !answer) return apiError('Answer details are incomplete.');
      const room = await readRoom(roomId);
      if (!room) return apiError('Room not found.', 404);
      if (qIndex !== room.question_index || !['question', 'locked'].includes(room.phase)) return apiError('That round has already moved on.', 409);
      if (submittedAt > room.ends_at + 2_000 || (room.phase === 'locked' && now > room.ends_at + 8_000)) return apiError('Time was up before the answer arrived.', 409);
      await db.prepare(`INSERT INTO players (room_id, client_id, name, score, last_seen, answered_question)
        VALUES (?, ?, ?, 0, ?, NULL)
        ON CONFLICT(room_id, client_id) DO UPDATE SET name = excluded.name, last_seen = excluded.last_seen`)
        .bind(roomId, clientId, name, now).run();
      const battle = room.battle === 2 ? 2 : 1;
      const correct = normalizeAnswer(answer) === normalizeAnswer(ANSWER_SETS[battle][qIndex]);
      const remaining = Math.max(0, room.ends_at - submittedAt);
      const scoreEarned = correct ? 500 + Math.round(500 * Math.min(1, remaining / 30_000)) : 0;
      const inserted = await db.prepare(`INSERT OR IGNORE INTO answers (room_id, question_index, client_id, message_id, name, answer, submitted_at, correct, score_earned)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(roomId, qIndex, clientId, messageId, name, answer, submittedAt, correct ? 1 : 0, scoreEarned).run();
      if (inserted.meta.changes > 0) {
        await db.prepare('UPDATE players SET score = score + ?, answered_question = ?, last_seen = ? WHERE room_id = ? AND client_id = ?').bind(scoreEarned, qIndex, now, roomId, clientId).run();
      }
      return Response.json({ ok: true, accepted: true, state: await snapshot(roomId, undefined, clientId) });
    }

    return apiError('Unknown game action.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected game error.';
    return apiError(message, 500);
  }
}
