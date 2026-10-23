'use client';

export const BATTLE_CHOICES = [
  [1, 'Original questions'], [2, 'Grammar challenge'], [3, 'English board game'],
  [4, 'BM board game'], [5, 'The Grammar Room'], [6, 'Witch’s Potion'],
  [7, 'Crazy Kitchen'], [8, 'Demolition Dash'], [9, 'English Black Market'],
  [10, 'Lantern Keeper’s Secret'], [11, 'The Missing Museum Jewel'], [12, 'Treasure Raid'],
] as const;

export function BattleTabs({ selected, busy = false, onSelect }: {
  selected: number; busy?: boolean; onSelect: (battle: number) => void;
}) {
  return <div className="battle-tabs" role="tablist">{BATTLE_CHOICES.map(([battle, description]) =>
    <button type="button" key={battle} role="tab" aria-selected={battle === selected}
      className={battle === selected ? 'active' : ''} disabled={busy}
      onClick={() => onSelect(battle)}><b>{battle}</b><span>BATTLE {battle}<small>{description}</small></span></button>
  )}</div>;
}
