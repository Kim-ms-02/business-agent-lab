import { test } from 'node:test';
import assert from 'node:assert/strict';
import { step, stopReason, findFeatures, judgeState } from '../src/gd.js';
import { CURVES } from '../src/curves.js';

const curve = (id) => CURVES.find((c) => c.id === id);
const near = (a, b, tol = 0.01) => Math.abs(a - b) < tol;

// 멈출 때까지 반복하고 { theta, reason } 반환
function runUntilStop(f, theta, eta) {
  let k = 0;
  let reason = null;
  while (reason === null) {
    theta = step(f, theta, eta);
    k++;
    reason = stopReason(f, theta, k);
  }
  return { theta, reason };
}

test('두 골짜기: 시작점 1.9면 약 1.13에서 지역 최솟값 판정', () => {
  const { f, range, eta0 } = curve('two-valleys');
  const { theta, reason } = runUntilStop(f, 1.9, eta0);
  assert.ok(near(theta, 1.13), `θ=${theta}`);
  assert.equal(judgeState(reason, theta, findFeatures(f, range), range), 'local');
});

test('곡선 분석이 최솟값과 전역 최솟값을 맞게 찾음', () => {
  // 두 골짜기: J′ = 4x³ − 6x + 1 = 0 의 해 중 최솟값은 ≈ −1.301(전역), ≈ 1.131(지역)
  const two = curve('two-valleys');
  const { minima } = findFeatures(two.f, two.range);
  assert.equal(minima.length, 2);
  assert.ok(near(minima.find((m) => m.global).theta, -1.301), JSON.stringify(minima));
  assert.ok(near(minima.find((m) => !m.global).theta, 1.131), JSON.stringify(minima));

  // U자: 전역 최솟값 하나(0)
  const u = curve('u');
  const uf = findFeatures(u.f, u.range);
  assert.equal(uf.minima.length, 1);
  assert.ok(uf.minima[0].global && near(uf.minima[0].theta, 0));

  // 기본 곡선: 지역(≈2) → 전역(≈5.5) 순서, 오른쪽 끝에 평지
  const basic = curve('basic');
  const bf = findFeatures(basic.f, basic.range);
  assert.deepEqual(bf.minima.map((m) => m.global), [false, true]);
  assert.ok(near(bf.minima[0].theta, 2, 0.05) && near(bf.minima[1].theta, 5.5, 0.05), JSON.stringify(bf.minima));
  assert.equal(bf.plateaus.length, 1);
  assert.ok(bf.plateaus[0].from > bf.minima[1].theta && bf.plateaus[0].to === 10, JSON.stringify(bf.plateaus));

  // 모든 예시 곡선: 전역 최솟값이 정확히 하나이고 J가 가장 작은 최솟값
  for (const { id, f, range } of CURVES) {
    const { minima } = findFeatures(f, range);
    const globals = minima.filter((m) => m.global);
    assert.equal(globals.length, 1, id);
    assert.ok(minima.every((m) => m.J >= globals[0].J), id);
  }
});
