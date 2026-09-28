import { test } from 'node:test';
import assert from 'node:assert/strict';
import { J, derivative, step, stopReason, MAX_ITER } from '../src/gd.js';

test('x^2의 수치 미분이 2x와 일치', () => {
  for (const x of [-2.5, -1, 0, 0.3, 4]) {
    assert.ok(Math.abs(derivative(J, x) - 2 * x) < 1e-6, `x=${x}`);
  }
});

test('한 스텝 이동량이 η × J′(θ)', () => {
  const eta = 0.1;
  for (const theta of [-2.5, -1, 0, 0.3, 4]) {
    const moved = theta - step(J, theta, eta);
    assert.ok(Math.abs(moved - eta * derivative(J, theta)) < 1e-12, `θ=${theta}`);
  }
});

// 멈출 때까지 반복하고 { theta, k, reason } 반환
function runUntilStop(theta, eta) {
  let k = 0;
  let reason = null;
  while (reason === null) {
    theta = step(J, theta, eta);
    k++;
    reason = stopReason(J, theta, k);
  }
  return { theta, k, reason };
}

test('η = 0.1이면 0으로 수렴', () => {
  const { theta, k, reason } = runUntilStop(-2.5, 0.1);
  assert.equal(reason, 'converged');
  assert.ok(Math.abs(theta) < 1e-6, `θ=${theta}`);
  assert.ok(k < MAX_ITER, `k=${k}`);
});

test('η = 1.1이면 발산', () => {
  const { k, reason } = runUntilStop(-2.5, 1.1);
  assert.equal(reason, 'diverged');
  assert.ok(k < MAX_ITER, `k=${k}`);
});

test('최대 반복에서 멈춤', () => {
  // η = 1이면 θ가 ±2.5를 오가며 수렴도 발산도 하지 않는다
  const { k, reason } = runUntilStop(-2.5, 1.0);
  assert.equal(reason, 'maxIter');
  assert.equal(k, MAX_ITER);
});
