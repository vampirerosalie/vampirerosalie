// Navigation preference only. The server still validates every role/token.
export function resolveTreasureRoute(search, get, marker = '') {
  const params = new URLSearchParams(search);
  let savedStudentRoom = '';
  try { savedStudentRoom = JSON.parse(marker).room || ''; } catch {}
  const requestedHost = params.get('host') || get('host-room');
  const explicitStudent = params.has('join') || params.has('student');
  const teacherRequest = params.has('teacher') || params.has('host');
  const ownedTeacher = !explicitStudent && teacherRequest && /^\d{5}$/.test(requestedHost || '') && !!get('host:' + requestedHost);
  let hostIntent = !explicitStudent && teacherRequest && (ownedTeacher || (!marker && !get('student-room')));
  let pin = hostIntent ? requestedHost : params.get('join') || savedStudentRoom || get('student-room') || '';
  if (!/^\d{5}$/.test(pin || '')) pin = '';
  return { pin, hostIntent, student: !hostIntent && (explicitStudent || !!marker || !!pin), token: get((hostIntent ? 'host:' : 'student:') + pin) };
}
