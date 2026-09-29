import { test } from 'node:test';
import assert from 'node:assert/strict';
import { step, stepDetail, tangentAt } from '../src/gd.js';
import { CURVES } from '../src/curves.js';
import { SYMBOLS, substituted, formatNumber } from '../src/formula.js';

const near = (a, b, tol = 1e-6) => Math.abs(a - b) < tol;
const curve = (id) => CURVES.find((c) => c.id === id);

test('stepDetail: U자에서 θ=−2.5, η=0.1 이면 기울기 −5, 이동량 −0.5, 다음 위치 −2', () => {
  const d = stepDetail(curve('u').f, -2.5, 0.1);
  assert.ok(near(d.grad, -5), `grad=${d.grad}`);
  assert.ok(near(d.move, -0.5), `move=${d.move}`);
  assert.ok(near(d.next, -2), `next=${d.next}`);
  assert.equal(d.move, 0.1 * d.grad);   // 이동량 = η × J′ (정확히)
  assert.equal(d.next, -2.5 - d.move);  // 다음 위치 = θ − 이동량 (정확히)
});

test('stepDetail의 다음 위치가 step과 같음', () => {
  for (const { id, f, range } of CURVES) {
    for (let i = 0; i <= 10; i++) {
      const theta = range[0] + ((range[1] - range[0]) * i) / 10;
      for (const eta of [0.01, 0.1, 1]) {
        assert.equal(stepDetail(f, theta, eta).next, step(f, theta, eta), `${id} θ=${theta} η=${eta}`);
      }
    }
  }
});

test('tangentAt: x²의 θ=1 접선은 y = 2x − 1, 접점에서 J(θ)와 같음', () => {
  const f = curve('u').f;
  const t = tangentAt(f, 1);
  assert.ok(near(t.slope, 2));
  for (const x of [0, 1, 3]) assert.ok(near(t.y(x), 2 * x - 1), `x=${x}`);
  for (const theta of [-2.5, 0.3, 2]) assert.ok(near(tangentAt(f, theta).y(theta), f(theta), 1e-12));
});

test('설명 카드 7개의 현재 값이 계산 결과와 일치', () => {
  const f = curve('u').f;
  const theta = -2.5, eta = 0.1;
  const s = { theta, J: f(theta), eta, detail: stepDetail(f, theta, eta) };
  const value = (id, state = s) => SYMBOLS.find((sym) => sym.id === id).value(state);
  assert.deepEqual(SYMBOLS.map((sym) => sym.symbol), ['θ', 'J(θ)', 'J′(θ)', 'η', '−', 'η · J′(θ)', 'θ_new']);
  assert.equal(value('theta'), '−2.5');
  assert.equal(value('J'), '6.25');
  assert.equal(value('grad'), '−5');
  assert.equal(value('eta'), '0.1');
  assert.equal(value('move'), '−0.5');
  assert.equal(value('next'), '−2');
  // "−" 카드: 기울기가 음수면 오른쪽, 양수면 왼쪽, 0이면 거의 안 움직임
  assert.match(value('minus'), /오른쪽/);
  assert.match(value('minus', { theta: 2, J: 4, eta, detail: stepDetail(f, 2, eta) }), /왼쪽/);
  assert.match(value('minus', { theta: 0, J: 0, eta, detail: stepDetail(f, 0, eta) }), /움직이지 않/);
  // 모든 카드에 이름과 설명이 있음
  for (const sym of SYMBOLS) assert.ok(sym.name && sym.meaning.length > 10, sym.id);
});

test('숫자 대입식: 음수 괄호, 끝의 0 제거', () => {
  const theta = -2.5, eta = 0.1;
  const detail = stepDetail(curve('u').f, theta, eta);
  assert.equal(substituted({ theta, eta, detail }), 'θ_new = −2.5 − 0.1 × (−5) = −2');
  const d2 = stepDetail(curve('u').f, 2, 0.1);
  assert.equal(substituted({ theta: 2, eta: 0.1, detail: d2 }), 'θ_new = 2 − 0.1 × 4 = 1.6');
  assert.equal(formatNumber(1.23456), '1.2346');
  assert.equal(formatNumber(-0.00001), '0');
  assert.equal(formatNumber(NaN), '정의 안 됨');
});
