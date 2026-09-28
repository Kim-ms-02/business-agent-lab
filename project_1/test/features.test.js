import { test } from 'node:test';
import assert from 'node:assert/strict';
import { step, stopReason, findFeatures, classifyStop } from '../src/gd.js';
import { CURVES } from '../src/curves.js';

const curve = (id) => CURVES.find((c) => c.id === id);
const near = (a, b, tol = 1e-3) => Math.abs(a - b) < tol;

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

test('기본 곡선: θ=3 전역, θ=−2 지역 최솟값', () => {
  const { f, range } = curve('basic');
  const { minima } = findFeatures(f, range);
  assert.equal(minima.length, 2);
  const global = minima.find((m) => m.global);
  const local = minima.find((m) => !m.global);
  assert.ok(near(global.theta, 3), `global=${global.theta}`);
  assert.ok(near(local.theta, -2), `local=${local.theta}`);
});

test('기본 곡선: θ=0 근처 평지, 극댓값 θ=1은 제외', () => {
  const { f, range } = curve('basic');
  const { minima, plateaus } = findFeatures(f, range);
  assert.equal(plateaus.length, 1);
  assert.ok(plateaus[0].from < 0 && plateaus[0].to > 0, JSON.stringify(plateaus[0]));
  assert.ok(plateaus[0].to < 1);
  assert.ok(minima.every((m) => !near(m.theta, 1, 0.1)));
});

test('θ²: 전역 최솟값 하나, 평지 없음', () => {
  const { f, range } = curve('bowl');
  const { minima, plateaus } = findFeatures(f, range);
  assert.equal(minima.length, 1);
  assert.ok(minima[0].global && near(minima[0].theta, 0));
  assert.equal(plateaus.length, 0);
});

test('멈춘 위치 판정: 지역 / 전역 / 평지', () => {
  const { f, range } = curve('basic');
  const features = findFeatures(f, range);
  const judge = (theta0) => {
    const { theta } = runUntilStop(f, theta0, 0.01);
    return classifyStop(theta, features, range);
  };
  assert.equal(judge(-2.8), 'local');
  assert.equal(judge(2), 'global');
  assert.equal(judge(0.5), 'plateau'); // 1000번 안에 못 빠져나와 최대 반복으로 멈춤

  const flat = curve('long-plateau');
  const { theta } = runUntilStop(flat.f, flat.theta0, flat.eta0);
  assert.equal(classifyStop(theta, findFeatures(flat.f, flat.range), flat.range), 'plateau');
});

test('예시 곡선 4개 모두 최솟값을 하나 이상 찾음', () => {
  assert.equal(CURVES.length, 4);
  for (const { id, f, range } of CURVES) {
    const { minima } = findFeatures(f, range);
    assert.ok(minima.length >= 1, id);
    assert.equal(minima.filter((m) => m.global).length, 1, id);
  }
});
