// A room's playable mask is chosen once at Start Game. Geometry and IDs never move.
export function lockBoard(room) {
  if (room.boardRules !== 1 || room.board) return;
  const teams = room.players.length;
  const claimable = Math.min(112, teams * 10);
  const regular = room.tiles.filter(t => t.kind === 'regular').sort((a, b) => {
    const distance = t => t.q * t.q + t.q * t.r + t.r * t.r;
    return distance(a) - distance(b) || a.q - b.q || a.r - b.r;
  });
  const active = new Set(regular.slice(0, claimable - 1).map(t => t.id));
  for (const tile of room.tiles) tile.blocked = tile.kind === 'regular' && !active.has(tile.id);
  room.board = { teamsAtStart: teams, claimable, mysteries: 8, blocked: 112 - claimable };
}
