// Navigation intent only. Room host/team permissions remain server-validated capabilities.
export const STUDENT_ROUTE_KEY = 'grammartest_student_route';
const PIN = /^\d{5}$/;
const OLD_BATTLES = new Set([1, 2, 3, 4, 6]);

/** @typedef {{battle: 7, room: string}} StudentRoute */
/** @typedef {{mode: 'kitchen', role: 'student' | 'teacher' | 'screen', search: string, room: string, studentRoute: StudentRoute | null}} KitchenRoute */
/** @typedef {KitchenRoute | {mode: 'teacher', battle: number | null} | {mode: 'student', battle: number, room: string} | {mode: 'student-link-error'}} ShellRoute */

/** @param {unknown} value @returns {StudentRoute | null} */
export function readStudentRoute(value) {
  if (!value) return null;
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (parsed && typeof parsed === 'object' && parsed.battle === 7) {
      return { battle: 7, room: typeof parsed.room === 'string' && PIN.test(parsed.room) ? parsed.room : '' };
    }
  } catch { /* A damaged saved student route must not open the teacher menu. */ }
  return { battle: 7, room: '' };
}

/** @param {URLSearchParams} params @param {string} key */
function only(params, key) {
  return params.getAll(key).length === 1 ? params.get(key) : null;
}
/** @param {string} room @returns {KitchenRoute} */
function student(room) {
  const clean = PIN.test(room) ? room : '';
  return { mode: 'kitchen', role: 'student', room: clean, search: clean ? `?battle=7&join=${clean}` : '?battle=7&student=1', studentRoute: { battle: 7, room: clean } };
}
/** @param {'teacher' | 'screen'} role @param {string} room @returns {KitchenRoute} */
function kitchen(role, room = '') {
  return { mode: 'kitchen', role, room, search: role === 'screen' ? `?battle=7&screen=${room}` : room ? `?battle=7&host=${room}` : '?battle=7&teacher=1', studentRoute: null };
}

/**
 * Explicit student links win over cached teacher keys and mixed-role query strings.
 * A marker is tab-scoped and never grants permission to read or mutate a room.
 * @param {string} search
 * @param {StudentRoute | null} savedStudent
 * @param {(pin: string) => boolean} hasHostCredential
 * @returns {ShellRoute}
 */
export function resolveShellRoute(search, savedStudent = null, hasHostCredential = () => false) {
  const params = new URLSearchParams(search);
  if (params.has('join')) return student(only(params, 'join') || '');
  const battle = only(params, 'battle');
  // Preserve explicit student links to the original games; they never render a host menu.
  if (params.has('room')) {
    const room = only(params, 'room') || '';
    if (battle === '7') return student(room);
    if (!PIN.test(room)) return { mode: 'student-link-error' };
    return { mode: 'student', room, battle: OLD_BATTLES.has(Number(battle)) ? Number(battle) : 1 };
  }
  // The PIN form explicitly leaves the last room but keeps this tab in student mode.
  if (params.has('student')) return student('');
  if (savedStudent) return student(savedStudent.room);
  if (battle === '7' || params.has('host') || params.has('screen')) {
    if (params.has('host') && params.has('screen')) return student('');
    if (params.has('host')) {
      const pin = only(params, 'host') || '';
      return PIN.test(pin) && hasHostCredential(pin) ? kitchen('teacher', pin) : student('');
    }
    if (params.has('screen')) {
      const pin = only(params, 'screen') || '';
      return PIN.test(pin) ? kitchen('screen', pin) : student('');
    }
    return kitchen('teacher');
  }
  return { mode: 'teacher', battle: only(params, 'teacher') === '1' && OLD_BATTLES.has(Number(battle)) ? Number(battle) : null };
}

/**
 * The caller also verifies event.origin and event.source. Messages cannot change
 * roles, smuggle extra query fields, or claim teacher access with a PIN alone.
 * @param {unknown} search
 * @param {KitchenRoute} current
 * @param {(pin: string) => boolean} hasHostCredential
 * @returns {KitchenRoute | null}
 */
export function acceptKitchenNavigation(search, current, hasHostCredential = () => false) {
  if (typeof search !== 'string' || !search.startsWith('?') || search.length > 160 || search.includes('#')) return null;
  const params = new URLSearchParams(search);
  const allowed = new Set(['battle', 'host', 'join', 'screen', 'student', 'teacher']);
  if ([...params.keys()].some(key => !allowed.has(key) || params.getAll(key).length !== 1)) return null;
  if (params.has('battle') && params.get('battle') !== '7') return null;
  const roles = ['host', 'join', 'screen', 'student', 'teacher'].filter(key => params.has(key));
  if (roles.length !== 1) return null;
  const role = roles[0];
  const value = params.get(role) || '';
  if (current.role === 'student') {
    if (role === 'join' && PIN.test(value)) return student(value);
    if (role === 'student' && value === '1') return student('');
  } else if (current.role === 'screen') {
    if (role === 'screen' && value === current.room && PIN.test(value)) return kitchen('screen', value);
  } else {
    if (role === 'host' && PIN.test(value) && hasHostCredential(value)) return kitchen('teacher', value);
    if (role === 'teacher' && value === '1') return kitchen('teacher');
  }
  return null;
}
