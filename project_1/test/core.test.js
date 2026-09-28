import { test } from 'node:test';
import assert from 'node:assert/strict';
import { J, derivative, step } from '../src/gd.js';

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
