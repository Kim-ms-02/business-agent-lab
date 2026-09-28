import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseFunction, checkDefinedOnRange, ParseError } from '../src/parser.js';
import { findFeatures } from '../src/gd.js';

const close = (a, b) => Math.abs(a - b) < 1e-12;

test('정상 식: 계산 값이 맞음', () => {
  // [식, x, 기대값]
  const cases = [
    ['2+3*4', 0, 14],
    ['(2+3)*4', 0, 20],
    ['2^3^2', 0, 512],               // ^ 는 오른쪽 결합
    ['-x^2', 3, -9],                 // -(x^2)
    ['x^-1', 2, 0.5],
    ['2x', 3, 6],                    // 곱하기 생략
    ['2(x+1)', 3, 8],
    ['(x+1)(x-1)', 3, 8],
    ['2x^2', 3, 18],                 // 2·(x^2)
    ['2sin(x)', Math.PI / 2, 2],
    ['sin(pi/2)', 0, 1],
    ['exp(0) + log(e)', 0, 2],
    ['sqrt(16) + abs(-3)', 0, 7],
    ['tan(0) + cos(0)', 0, 1],
    ['θ^2', 3, 9],                   // θ 도 x 로
    [' 1 / 4 ', 0, 0.25],            // 공백 무시
    ['.5x', 4, 2],
    ['-(-x)', 5, 5],
  ];
  for (const [expr, x, want] of cases) {
    const got = parseFunction(expr)(x);
    assert.ok(close(got, want), `${expr} (x=${x}) → ${got}, 기대 ${want}`);
  }
});

test('예시 곡선 식이 의도한 함수와 일치', () => {
  const pairs = [
    ['2 - 1.5*exp(-(x-2)^2) - 2.5*exp(-(x-5.5)^2)', (t) => 2 - 1.5 * Math.exp(-((t - 2) ** 2)) - 2.5 * Math.exp(-((t - 5.5) ** 2))],
    ['x^2', (t) => t * t],
    ['x^4 - 3x^2 + x', (t) => t ** 4 - 3 * t ** 2 + t],
    ['0.1x^2 + sin(3x)', (t) => 0.1 * t * t + Math.sin(3 * t)],
  ];
  for (const [expr, ref] of pairs) {
    const f = parseFunction(expr);
    for (const x of [-3, -1.3, 0, 0.7, 2, 5.5, 9]) {
      assert.ok(close(f(x), ref(x)), `${expr} (x=${x})`);
    }
  }
});

test('잘못된 식: 한국어로 무엇이 틀렸는지 알려줌', () => {
  // [식, 메시지에 들어 있어야 할 말]
  const cases = [
    ['', '식을 입력하세요'],
    ['   ', '식을 입력하세요'],
    ['sinn(x)', '모르는 이름'],
    ['y + 1', '모르는 이름'],
    ['x $ 2', '사용할 수 없는 문자'],
    ['x = 2', '사용할 수 없는 문자'],
    ['(x+1', '닫는 괄호'],
    ['x+1)', '여는 괄호'],
    ['sin x', '괄호가 필요'],
    ['sqrt', '괄호가 필요'],
    ['x +', '값이 더 필요'],
    ['*x', '앞에 값이 필요'],
    ['2 3', '앞에 연산자가 필요'],
    ['alert(1)', '모르는 이름'],
    ['constructor', '모르는 이름'],  // 객체 프로토타입 이름도 거부
    ['toString(x)', '모르는 이름'],
  ];
  for (const [expr, want] of cases) {
    assert.throws(
      () => parseFunction(expr),
      (err) => err instanceof ParseError && err.message.includes(want),
      `${JSON.stringify(expr)} → "${want}" 오류가 나야 함`,
    );
  }
});

test('범위 대부분에서 값이 정의되지 않으면 오류', () => {
  const isRangeError = (err) => err instanceof ParseError && err.message.includes('정의되지 않습니다');
  assert.throws(() => checkDefinedOnRange(parseFunction('log(x)'), [-5, -1]), isRangeError);
  assert.throws(() => checkDefinedOnRange(parseFunction('sqrt(x)'), [-10, 1]), isRangeError);
  // 절반 이상 정의되면 통과
  assert.doesNotThrow(() => checkDefinedOnRange(parseFunction('sqrt(x)'), [-2, 3]));
  assert.doesNotThrow(() => checkDefinedOnRange(parseFunction('x^2'), [-3, 3]));
});

test('정의되지 않는 구간이 있어도 가짜 최솟값·평지를 만들지 않음', () => {
  // x − log(x): x ≤ 0 에서 정의 안 됨, 최솟값은 x = 1 하나, 평지 없음
  const { minima, plateaus } = findFeatures(parseFunction('x - log(x)'), [-2, 3]);
  assert.equal(minima.length, 1, JSON.stringify(minima));
  assert.ok(Math.abs(minima[0].theta - 1) < 1e-3);
  assert.equal(plateaus.length, 0, JSON.stringify(plateaus));
});

test('해석기 소스에 eval / new Function 이 없음', () => {
  const src = readFileSync(new URL('../src/parser.js', import.meta.url), 'utf8');
  // 주석 줄은 빼고 검사
  const code = src.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  assert.ok(!/\beval\s*\(/.test(code), 'eval 사용');
  assert.ok(!/\bFunction\s*\(/.test(code), 'Function 생성자 사용');
});
