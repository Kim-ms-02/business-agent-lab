// 예시 곡선 목록. 첫 번째가 기본 곡선.
// range: 그래프 θ 범위, theta0: 시작 θ, eta0: 곡선을 고를 때 맞춰지는 학습률

// 가우스 골짜기 모양: 중심 c에서 1, 멀어질수록 0
const bump = (t, c) => Math.exp(-((t - c) ** 2));

export const CURVES = [
  {
    id: 'basic',
    name: '기본 곡선',
    // θ≈2 지역 최솟값 → θ≈3.8 언덕 → θ≈5.5 전역 최솟값 → θ≳8.3 평지
    f: (t) => 2 - 1.5 * bump(t, 2) - 2.5 * bump(t, 5.5),
    range: [0, 10],
    theta0: 0.5,
    eta0: 0.1,
  },
  {
    id: 'u',
    name: 'U자 (x²)',
    f: (t) => t * t,
    range: [-3, 3],
    theta0: -2.5,
    eta0: 0.1,
  },
  {
    id: 'two-valleys',
    name: '두 골짜기 (x⁴ − 3x² + x)',
    // θ≈−1.30 전역 최솟값, θ≈1.13 지역 최솟값
    f: (t) => t ** 4 - 3 * t ** 2 + t,
    range: [-2, 2],
    theta0: 1.9,
    eta0: 0.05,
  },
  {
    id: 'wave',
    name: '물결 (0.1x² + sin 3x)',
    f: (t) => 0.1 * t * t + Math.sin(3 * t),
    range: [-5, 5],
    theta0: 4,
    eta0: 0.05,
  },
];
