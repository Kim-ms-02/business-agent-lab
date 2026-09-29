import { test } from 'node:test';
import assert from 'node:assert/strict';
import { step, stepDetail, tangentAt } from '../src/gd.js';
import { CURVES } from '../src/curves.js';

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
