import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  arcPoint, arcHeight, flightMs, parseMaxIter,
} from '../src/playback.js';
import { runUntilStop } from '../src/gd.js';
import { CURVES } from '../src/curves.js';

const near = (a, b, tol = 1e-9) => Math.abs(a - b) < tol;
const u = CURVES.find((c) => c.id === 'u').f;

test('arcPoint: 양 끝은 두 점, 가운데는 직선보다 h만큼 위, 좌우 대칭', () => {
  const p0 = { x: 10, y: 100 }, p1 = { x: 110, y: 60 }, h = 30;
  assert.deepEqual(arcPoint(p0, p1, 0, h), p0);
  assert.deepEqual(arcPoint(p0, p1, 1, h), p1);
  const mid = arcPoint(p0, p1, 0.5, h);
  assert.ok(near(mid.x, 60) && near(mid.y, 80 - h), JSON.stringify(mid));
  // 직선에서 위로 솟은 높이가 t와 1−t에서 같음
  const lift = (t) => (p0.y + (p1.y - p0.y) * t) - arcPoint(p0, p1, t, h).y;
  for (const t of [0.1, 0.3]) assert.ok(near(lift(t), lift(1 - t)));
});

test('arcHeight: 거리의 35%, 최소 12px, 최대 90px', () => {
  assert.equal(arcHeight({ x: 0, y: 0 }, { x: 100, y: 0 }), 35);
  assert.equal(arcHeight({ x: 0, y: 0 }, { x: 5, y: 0 }), 12);
  assert.equal(arcHeight({ x: 0, y: 0 }, { x: 1000, y: 0 }), 90);
});

test('날아가는 시간: 느리면 최대 650ms, 빠르면 0(바로 옮김)', () => {
  assert.equal(flightMs(0.25), 650);
  assert.ok(near(flightMs(3), 800 / 3));
  assert.equal(flightMs(100), 0);
});

test('최대 반복 입력 검사', () => {
  assert.equal(parseMaxIter('1000'), 1000);
  assert.equal(parseMaxIter(' 1 '), 1);
  assert.equal(parseMaxIter('100000'), 100000);
  for (const bad of ['', '0', '-3', '2.5', 'abc', '100001', '1e3']) {
    assert.throws(() => parseMaxIter(bad), /최대 반복/, JSON.stringify(bad));
  }
});

test('runUntilStop: 한 번에 계산한 결과가 한 스텝씩과 같고, 최대 반복을 늘리면 이어서 진행', () => {
  const r = runUntilStop(u, -2.5, 0.1);
  assert.equal(r.reason, 'converged');
  assert.equal(r.k, 70);
  assert.equal(r.path.length, 71); // 시작점 포함

  // η = 1 이면 ±2.5를 오감 → 최대 반복 10에서 멈춤
  const a = runUntilStop(u, -2.5, 1, 0, 10);
  assert.equal(a.reason, 'maxIter');
  assert.equal(a.k, 10);
  // 최대 반복을 20으로 늘려 이어서 → 20에서 멈춤
  const b = runUntilStop(u, a.theta, 1, a.k, 20);
  assert.equal(b.reason, 'maxIter');
  assert.equal(b.k, 20);
});
