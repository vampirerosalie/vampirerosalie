import test from 'node:test';
import assert from 'node:assert/strict';
import { STUDENT_ROUTE_KEY, readStudentRoute, resolveShellRoute, acceptKitchenNavigation } from '../../app/battle7-route.js';

const saved = { battle: 7, room: '12345' };
const hostKey = pin => pin === '54321';
const pupil = resolveShellRoute('?battle=7&join=12345');
const teacher = resolveShellRoute('?battle=7&teacher=1');
const screen = resolveShellRoute('?battle=7&screen=54321');

test('student route is a tab-scoped intent marker with no credentials', () => {
  assert.equal(STUDENT_ROUTE_KEY, 'grammartest_student_route');
  assert.deepEqual(readStudentRoute(JSON.stringify(saved)), saved);
  assert.equal(readStudentRoute(null), null);
  for (const damaged of ['broken', '{}', '{"battle":7,"room":"123x45"}', '{"battle":7,"room":12345}']) {
    assert.deepEqual(readStudentRoute(damaged), { battle: 7, room: '' });
  }
});

test('QR joins win over every teacher, projector and cached role', () => {
  for (const extra of ['', '&host=54321', '&screen=54321', '&teacher=1', '&student=1', '&host=54321&screen=54321']) {
    const route = resolveShellRoute(`?battle=7&join=12345${extra}`, saved, hostKey);
    assert.equal(route.role, 'student');
    assert.equal(route.search, '?battle=7&join=12345');
    assert.deepEqual(route.studentRoute, saved);
  }
});

test('malformed and duplicate joins remain student-only without coercing a PIN', () => {
  for (const pin of ['', '1234', '123456', '12x345', '-12345', '%2012345', '12345%20', '12345&join=54321']) {
    const route = resolveShellRoute(`?battle=7&join=${pin}&host=54321`, saved, hostKey);
    assert.equal(route.role, 'student');
    assert.equal(route.search, '?battle=7&student=1');
  }
});

test('end, refresh, root, backward and opposite-role URLs cannot leave student mode', () => {
  for (const search of ['', '?battle=1', '?battle=3&teacher=1', '?battle=7', '?battle=7&teacher=1', '?battle=7&host=54321', '?screen=54321']) {
    const route = resolveShellRoute(search, saved, hostKey);
    assert.equal(route.role, 'student');
    assert.equal(route.search, '?battle=7&join=12345');
  }
  assert.equal(resolveShellRoute('', { battle: 7, room: '' }).search, '?battle=7&student=1');
  assert.equal(resolveShellRoute('?battle=7&student=1', saved).search, '?battle=7&student=1');
});

test('host query alone is never a host capability and roles stay unambiguous', () => {
  assert.equal(resolveShellRoute('?battle=7&host=54321').role, 'student');
  assert.equal(resolveShellRoute('?battle=7&host=54321', null, hostKey).role, 'teacher');
  for (const search of ['?battle=7&host=54x321', '?battle=7&host=54321&screen=54321', '?battle=7&host=54321&host=54321', '?battle=7&screen=1234']) {
    assert.equal(resolveShellRoute(search, null, hostKey).role, 'student');
  }
  assert.equal(resolveShellRoute('?battle=7').search, '?battle=7&teacher=1');
  assert.equal(resolveShellRoute('?battle=7&teacher=1').role, 'teacher');
  assert.equal(resolveShellRoute('?battle=7&screen=54321').role, 'screen');
});

test('original teacher entry and all original student links are preserved', () => {
  assert.deepEqual(resolveShellRoute(''), { mode: 'teacher', battle: null });
  for (const battle of [1, 2, 3, 4, 6]) {
    assert.deepEqual(resolveShellRoute(`?battle=${battle}&room=12345`, saved), { mode: 'student', battle, room: '12345' });
    assert.deepEqual(resolveShellRoute(`?battle=${battle}&teacher=1`), { mode: 'teacher', battle });
  }
  assert.equal(resolveShellRoute('?room=invalid').mode, 'student-link-error');
  assert.equal(resolveShellRoute('?battle=7&room=12345').role, 'student');
});

test('iframe student transitions accept only exact join or student PIN entry', () => {
  assert.equal(acceptKitchenNavigation('?join=54321', pupil).search, '?battle=7&join=54321');
  assert.equal(acceptKitchenNavigation('?battle=7&student=1', pupil).search, '?battle=7&student=1');
  for (const search of ['?host=54321', '?teacher=1', '?screen=54321', '', '?battle=7', '?join=', '?join=12x345', '?join=12345&host=54321', '?student=0']) {
    assert.equal(acceptKitchenNavigation(search, pupil, hostKey), null, search);
  }
});

test('iframe teacher and projector transitions cannot adopt another role', () => {
  assert.equal(acceptKitchenNavigation('?host=54321', teacher, hostKey).role, 'teacher');
  assert.equal(acceptKitchenNavigation('?host=54321', teacher), null);
  assert.equal(acceptKitchenNavigation('?teacher=1', teacher).role, 'teacher');
  for (const search of ['?join=12345', '?student=1', '?screen=54321', '?host=12345']) {
    assert.equal(acceptKitchenNavigation(search, teacher, hostKey), null);
  }
  assert.equal(acceptKitchenNavigation('?screen=54321', screen).role, 'screen');
  for (const search of ['?screen=12345', '?host=54321', '?teacher=1', '?join=12345']) {
    assert.equal(acceptKitchenNavigation(search, screen, hostKey), null);
  }
});

test('iframe rejects malformed, duplicate, foreign and unexpected route data', () => {
  for (const search of [null, {}, 1, 'https://evil.test/?join=12345', '//evil.test/?join=12345', '?join=12345#host=54321', '?battle=3&join=12345', '?join=12345&join=12345', '?join=12345&token=secret', '?join=12345&redirect=/']) {
    assert.equal(acceptKitchenNavigation(search, pupil, hostKey), null);
  }
});
