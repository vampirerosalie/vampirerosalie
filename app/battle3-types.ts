export type BoardPhase = 'await_roll' | 'show_roll' | 'answering' | 'round_result' | 'frozen' | 'finished';
export type CardId = 'shield' | 'reroll' | 'boost' | 'double' | 'freeze' | 'back2';
export type BoardTeam = {
  name: string;
  color: string;
  dark: string;
  emoji: string;
  pos: number;
  points: number;
  cards: Record<CardId, number>;
  frozen: number;
  shieldArmed: boolean;
  boostArmed: boolean;
  doubleArmed: boolean;
};
export type BoardGame = {
  teamCount: number;
  teams: BoardTeam[];
  turn: number;
  phase: BoardPhase;
  previousPos: number;
  landedPos: number;
  roll: number | null;
  moveTotal: number | null;
  currentQuestionId: string | null;
  currentCategory: string | null;
  answerRevealed: boolean;
  countdownEndsAt: number | null;
  used: Record<string, string[]>;
  lastDice: number | null;
  round: number;
  winner: number | null;
  eventLog: string[];
  overlay: { icon: string; title: string; message: string; at: number } | null;
  version: number;
};
export type BoardTeamStatus = {
  teamIndex: number;
  memberCount: number;
  occupied: boolean;
  memberName: string | null;
  submitted: boolean;
  verdict: 'accept' | 'reject' | null;
};
export type BoardResponse = { teamIndex: number; answer: string; verdict: 'accept' | 'reject' | null };
export type BoardAnswerKey = { answer: string; explanation: string; optionLetter: string | null };

export const BOARD_POSITIONS: Record<number, [number, number]> = {
  1:[22.5,87.6],2:[31,87.6],3:[39.5,87.6],4:[49.5,87.6],5:[60.5,87.6],6:[27,70.1],7:[36,70.1],8:[44.8,70.1],9:[54.4,70.1],10:[64,70.1],11:[64.8,56],12:[56,56],13:[47,56],14:[38,56],15:[29,56],16:[31,41.2],17:[40.5,41.2],18:[49.2,41.2],19:[58.5,41.2],20:[67.3,41.2],21:[69.7,27.7],22:[60,27.7],23:[50.3,27.7],24:[40.8,27.7],25:[31.5,27.7],26:[44,13.8],27:[54,13.8],28:[63,13.8],29:[72.6,13.8],30:[84,13.6],
};

export const TEAM_DEFS = [
  { name:'Purple', color:'#8b5cf6', dark:'#3b1b78', emoji:'🦁' },
  { name:'Pink', color:'#f0449b', dark:'#7d1749', emoji:'🦊' },
  { name:'Blue', color:'#2f8fff', dark:'#174776', emoji:'🦉' },
  { name:'Green', color:'#29bd74', dark:'#125838', emoji:'🐺' },
  { name:'Orange', color:'#ff8c2a', dark:'#7a3d0e', emoji:'🐯' },
  { name:'Teal', color:'#18b9b0', dark:'#0b5b58', emoji:'🐬' },
] as const;

export const POWER_CARDS = [
  { id:'shield' as const, name:'Shield', icon:'🛡️', description:'Blocks your next movement penalty.' },
  { id:'reroll' as const, name:'Reroll', icon:'🎲', description:'Reroll your own dice once.' },
  { id:'boost' as const, name:'Boost +2', icon:'➕', description:'Add 2 spaces to your next roll.' },
  { id:'double' as const, name:'Double Points', icon:'⭐', description:'Your next challenge point is doubled.' },
  { id:'freeze' as const, name:'Freeze', icon:'🧊', description:'Choose a team to skip its next movement turn.' },
  { id:'back2' as const, name:'Back 2', icon:'↩️', description:'Move an opposing team back 2 spaces.' },
];

export const BOARD_CATEGORIES = ['READING','GRAMMAR','WRITING','VOCABULARY','EDITING'];

export function createDefaultBoard(teamCount = 6): BoardGame {
  const count = Math.max(2, Math.min(6, teamCount));
  return {
    teamCount: count,
    teams: TEAM_DEFS.slice(0, count).map((team) => ({ ...team, pos:0, points:0, cards:{shield:0,reroll:0,boost:0,double:0,freeze:0,back2:0}, frozen:0, shieldArmed:false, boostArmed:false, doubleArmed:false })),
    turn:0, phase:'await_roll', previousPos:0, landedPos:0, roll:null, moveTotal:null, currentQuestionId:null, currentCategory:null, answerRevealed:false, countdownEndsAt:null,
    used:{READING:[],GRAMMAR:[],WRITING:[],VOCABULARY:[],EDITING:[]}, lastDice:null, round:1, winner:null,
    eventLog:['Game ready. Waiting for the first team to roll.'], overlay:null, version:1,
  };
}

export function categoryForSquare(square: number) {
  if (square === 30) return BOARD_CATEGORIES[Math.floor(Math.random() * BOARD_CATEGORIES.length)];
  return BOARD_CATEGORIES[(Math.max(1, square) - 1) % BOARD_CATEGORIES.length];
}

export function applyPowerCardEffect(board: BoardGame, teamIndex: number, cardId: CardId, targetIndex: number | null, rerollValue: number | null = null) {
  const team = board.teams[teamIndex];
  if (cardId === 'shield') {
    team.shieldArmed = true;
    return 'The next movement penalty will be blocked.';
  }
  if (cardId === 'double') {
    team.doubleArmed = true;
    return 'The next challenge point will be doubled.';
  }
  if (cardId === 'boost') {
    team.boostArmed = true;
    return 'The next roll gains 2 extra spaces.';
  }
  if (cardId === 'freeze' && targetIndex !== null) {
    board.teams[targetIndex].frozen += 1;
    return `${board.teams[targetIndex].name} will skip its next turn.`;
  }
  if (cardId === 'back2' && targetIndex !== null) {
    board.teams[targetIndex].pos = Math.max(0, board.teams[targetIndex].pos - 2);
    return `${board.teams[targetIndex].name} moved back 2 spaces.`;
  }
  if (cardId === 'reroll' && rerollValue !== null) {
    board.lastDice = rerollValue;
    const move = rerollValue + (team.boostArmed ? 2 : 0);
    team.boostArmed = false;
    board.roll = rerollValue;
    board.moveTotal = move;
    board.landedPos = Math.min(30, board.previousPos + move);
    team.pos = board.landedPos;
    return `New roll: ${rerollValue}. Move ${move} spaces.`;
  }
  throw new Error('That power card cannot be applied.');
}
