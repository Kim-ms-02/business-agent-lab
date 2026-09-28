import { parseFunction } from './parser.js';

// 예시 곡선 목록. 첫 번째가 기본 곡선. 식은 해석기(parser.js)를 거쳐 함수 f가 된다.
// range: 그래프 θ 범위, theta0: 시작 θ, eta0: 곡선을 고를 때 맞춰지는 학습률
export const CURVES = [
  {
    id: 'basic',
    name: '기본 곡선',
    // θ≈2 지역 최솟값 → θ≈3.8 언덕 → θ≈5.5 전역 최솟값 → θ≳8.3 평지
    expr: '2 - 1.5*exp(-(x-2)^2) - 2.5*exp(-(x-5.5)^2)',
    range: [0, 10],
    theta0: 0.5,
    eta0: 0.1,
  },
  {
    id: 'u',
    name: 'U자 (x²)',
    expr: 'x^2',
    range: [-3, 3],
    theta0: -2.5,
    eta0: 0.1,
  },
  {
    id: 'two-valleys',
    name: '두 골짜기 (x⁴ − 3x² + x)',
    // θ≈−1.30 전역 최솟값, θ≈1.13 지역 최솟값
    expr: 'x^4 - 3x^2 + x',
    range: [-2, 2],
    theta0: 1.9,
    eta0: 0.05,
  },
  {
    id: 'wave',
    name: '물결 (0.1x² + sin 3x)',
    expr: '0.1x^2 + sin(3x)',
    range: [-5, 5],
    theta0: 4,
    eta0: 0.05,
  },
].map((c) => ({ ...c, f: parseFunction(c.expr) }));
