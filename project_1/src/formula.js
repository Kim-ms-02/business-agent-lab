// 공식 읽기 칸: θ_new = θ − η · J′(θ) 의 기호별 뜻과 현재 값
// s = { theta, J, eta, detail }  (J = J(θ), detail = stepDetail(f, theta, eta) 결과: { grad, move, next })

// 기호별 색. 공식 칸과 그래프에서 같은 색을 쓴다
export const COLORS = {
  theta: '#d1242f',  // 빨강: 공, 가로축으로 내린 선
  J: '#0a7c7c',      // 청록: 세로축으로 이은 선
  grad: '#0969da',   // 파랑: 접선
  eta: '#8250df',    // 보라: 학습률 (화살표 길이를 정함)
  minus: '#57606a',  // 진회색: 이동 방향 (화살표 머리)
  move: '#d9730d',   // 주황: 이동량 화살표
  next: '#6e7781',   // 회색: 다음 위치 점
};

// 다크 모드용: 같은 계열의 밝은 색
export const COLORS_DARK = {
  theta: '#ff7b72',
  J: '#39c5bb',
  grad: '#58a6ff',
  eta: '#d2a8ff',
  minus: '#c9d1d9',
  move: '#ffa657',
  next: '#8b949e',
};

// 설명 카드 순서
export const SYMBOLS = [
  {
    id: 'theta',
    symbol: 'θ',
    name: '현재 위치(Parameter)',
    meaning: '공의 가로축 값으로, 모델이 학습하는 파라미터를 뜻해요. 값을 조금씩 옮기며 손실이 가장 작은 지점을 찾아요.',
    value: (s) => formatNumber(s.theta),
  },
  {
    id: 'J',
    symbol: 'J(θ)',
    name: '비용(Loss)',
    meaning: '현재 θ에서 모델이 내는 오차의 크기로, 그래프에서 공의 높이에 해당하며, 값이 작을수록 모델이 답에 가까워요.',
    value: (s) => formatNumber(s.J),
  },
  {
    id: 'grad',
    symbol: 'J′(θ)',
    name: '기울기(Derivative)',
    meaning: '현재 θ에서 비용 곡선의 기울기로, 파란 점선(접선)이 이를 나타내요. θ를 기울기의 반대 방향으로 옮겨요.',
    value: (s) => formatNumber(s.detail.grad),
  },
  {
    id: 'eta',
    symbol: 'η',
    name: '학습률(Learning Rate)',
    meaning: '기울기에 곱해 이동할 거리를 정하는 값으로, 작으면 수렴이 느리고, 크면 최저점을 지나쳐 발산할 수 있어요.',
    value: (s) => formatNumber(s.eta),
  },
  {
    id: 'move',
    symbol: 'η · J′(θ)',
    name: '이동량(Movement)',
    meaning: '학습률과 기울기를 곱한 값으로, θ는 이동량만큼 빼서 갱신되고, 가로축의 화살표가 이번 한 걸음을 나타내요.',
    value: (s) => formatNumber(s.detail.move),
  },
  {
    id: 'next',
    symbol: 'θ_new',
    name: '다음 위치',
    meaning: '현재위치에서 이동량을 뺀 뒤의 새 위치예요. "한 스텝"을 누르면 공이 여기로 이동하고, 이 값이 다음 θ가 돼요.',
    value: (s) => formatNumber(s.detail.next),
  },
];

// 소수 4자리에서 반올림하고 끝의 0을 뺀다. 음수는 '−'(유니코드 마이너스)로 표시
export function formatNumber(x) {
  if (!Number.isFinite(x)) return '정의 안 됨';
  const r = Number(x.toFixed(4));
  if (r === 0) return '0';
  return r < 0 ? `−${String(-r)}` : String(r);
}

// 숫자를 대입한 식. 예: θ_new = −2.5 − 0.1 × (−5) = −2
export function substituted({ theta, eta, detail }) {
  const paren = (x) => (Number(x.toFixed(4)) < 0 ? `(${formatNumber(x)})` : formatNumber(x));
  return `θ_new = ${formatNumber(theta)} − ${formatNumber(eta)} × ${paren(detail.grad)} = ${formatNumber(detail.next)}`;
}
