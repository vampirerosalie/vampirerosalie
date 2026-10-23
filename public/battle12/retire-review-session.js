// Narrow cleanup of the agent's completed publication test on the owner's
// Chrome. This is NOT a role switch or a general student logout/teacher bypass.
// Confirm identity with the server before removing only this test's local data.
export async function retireReviewSession(search, storage, session, fetchState) {
  const params = new URLSearchParams(search);
  if (!params.has('teacher') || params.has('join') || params.has('student') || params.has('host')) return false;
  const prefix = 'treasure-raid:', room = '55982';
  if (storage.getItem(prefix+'student-room') !== room) return false;
  const token = storage.getItem(prefix+'student:'+room);
  if (!token) return false;
  let state;
  try { state = await fetchState(room,token); } catch { return false; }
  if (state?.pin !== room || state.role !== 'student' || state.phase !== 'ended' || state.me?.name !== 'TEST Live Phone Review') return false;
  for (const key of ['student:'+room,'drafts:'+room,'reader:'+room,'pending:'+room]) storage.removeItem(prefix+key);
  storage.removeItem(prefix+'student-room');
  if (storage.getItem(prefix+'name') === 'TEST Live Phone Review') storage.removeItem(prefix+'name');
  try {
    if (JSON.parse(session.getItem(prefix+'student-route') || 'null')?.room === room) session.removeItem(prefix+'student-route');
  } catch {}
  return true;
}
