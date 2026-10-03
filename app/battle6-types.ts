export type PotionPhase = 'poison_setup' | 'question' | 'potion_pick' | 'reveal' | 'restock' | 'finished';

export type PotionTeam = {
  name: string;
  color: string;
  dark: string;
  emoji: string;
  treasure: number;
  poison: number;
  needsPoison: boolean;
};

export type PotionReveal = {
  number: number;
  type: 'SAFE' | 'TREASURE' | 'POISON';
  chooser: number;
  owners: number[];
  message: string;
  fullyPoisoned: boolean;
};

export type PotionGame = {
  version: number;
  teamCount: number;
  teams: PotionTeam[];
  phase: PotionPhase;
  round: number;
  deck: string[];
  currentQuestionId: string | null;
  opened: number[];
  eligible: number[];
  picks: Array<number | null>;
  picker: number | null;
  countdownEndsAt: number | null;
  pickEndsAt: number | null;
  lastReveal: PotionReveal | null;
  roundReveals: PotionReveal[];
  treasuresRemaining: number;
  eventLog: string[];
  restockCount: number;
};

export type PotionTeamStatus = {
  teamIndex: number;
  memberCount: number;
  occupied: boolean;
  memberName: string | null;
  submitted: boolean;
  verdict: 'accept' | 'reject' | null;
};

export type PotionResponse = {
  teamIndex: number;
  answer: string;
  verdict: 'accept' | 'reject' | null;
};

export type PotionAnswerKey = {
  answer: string;
  explanation: string;
  optionLetter: string | null;
};

export const POTION_TEAM_DEFS = [
  { name: 'Purple', color: '#9b5cff', dark: '#39206f', emoji: '🔮' },
  { name: 'Pink', color: '#ff5aa5', dark: '#70234c', emoji: '🌸' },
  { name: 'Blue', color: '#4b9dff', dark: '#173f76', emoji: '💧' },
  { name: 'Green', color: '#49ce77', dark: '#185b35', emoji: '🌿' },
  { name: 'Orange', color: '#ff963d', dark: '#733d16', emoji: '🔥' },
  { name: 'Teal', color: '#26c7c4', dark: '#15595d', emoji: '🧿' },
  { name: 'Gold', color: '#ffd34f', dark: '#745b12', emoji: '⭐' },
] as const;

export function createPotionGame(teamCount = 7): PotionGame & { teams: Array<PotionTeam & { poisonBottle: number | null }> } {
  const count = Math.max(2, Math.min(7, teamCount));
  const deck = [...Array(60).keys()]
    .sort(() => Math.random() - 0.5)
    .slice(0, 20)
    .map((index) => {
      if (index < 12) return `M${String(index + 1).padStart(2, '0')}`;
      if (index < 22) return `V${String(index - 11).padStart(2, '0')}`;
      if (index < 42) return `K${String(index - 21).padStart(2, '0')}`;
      if (index < 48) return `P${String(index - 41).padStart(2, '0')}`;
      if (index < 54) return `A${String(index - 47).padStart(2, '0')}`;
      return `R${String(index - 53).padStart(2, '0')}`;
    });
  return {
    version: 0,
    teamCount: count,
    teams: POTION_TEAM_DEFS.slice(0, count).map((team) => ({ ...team, treasure: 0, poison: 0, needsPoison: true, poisonBottle: null })),
    phase: 'poison_setup',
    round: 0,
    deck,
    currentQuestionId: null,
    opened: [],
    eligible: [],
    picks: Array.from({ length: count }, () => null),
    picker: null,
    countdownEndsAt: null,
    pickEndsAt: null,
    lastReveal: null,
    roundReveals: [],
    treasuresRemaining: 0,
    eventLog: ['The potion shelf is ready. Teams must secretly plant their poison.'],
    restockCount: 0,
  };
}
