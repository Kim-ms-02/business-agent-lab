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
    name: '지금 위치',
    meaning: '공이 지금 있는 가로 위치예요. 경사하강법은 이 값을 조금씩 바꿔 가며 가장 낮은 곳을 찾아요.',
    value: (s) => formatNumber(s.theta),
  },
  {
    id: 'J',
    symbol: 'J(θ)',
    name: '비용',
    meaning: '지금 위치에서의 비용(오차)이에요. 그래프에서 공의 높이이고, 낮을수록 좋은 답이에요.',
    value: (s) => formatNumber(s.J),
  },
  {
    id: 'grad',
    symbol: 'J′(θ)',
    name: '기울기',
    meaning: '지금 위치의 기울기예요. 양수면 오른쪽이 오르막, 음수면 오른쪽이 내리막이에요. 파란 점선(접선)이 이 기울기예요.',
    value: (s) => formatNumber(s.detail.grad),
  },
  {
    id: 'eta',
    symbol: 'η',
    name: '학습률',
    meaning: '한 번에 얼마나 크게 움직일지 정하는 배율이에요. 너무 작으면 느리고, 너무 크면 골짜기를 지나쳐 버려요.',
    value: (s) => formatNumber(s.eta),
  },
  {
    id: 'minus',
    symbol: '−',
    name: '반대 방향',
    meaning: '기울기의 반대쪽으로 가라는 뜻이에요. 오르막의 반대, 곧 내리막 쪽으로 움직여요.',
    value: (s) => direction(s.detail.move),
  },
  {
    id: 'move',
    symbol: 'η · J′(θ)',
    name: '이동량',
    meaning: '기울기에 학습률을 곱한 값으로, 이번 한 걸음의 크기예요. 가로축 위 주황 화살표의 길이예요.',
    value: (s) => formatNumber(s.detail.move),
  },
  {
    id: 'next',
    symbol: 'θ_new',
    name: '다음 위치',
    meaning: '한 걸음 움직인 뒤의 새 위치예요. "한 스텝"을 누르면 공이 여기로 가요.',
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

// 이동 방향: θ_new − θ = −이동량
function direction(move) {
  if (!Number.isFinite(move)) return '정의 안 됨';
  const r = Number(move.toFixed(4));
  if (r === 0) return '지금은 거의 움직이지 않아요';
  return r < 0 ? '지금은 오른쪽(θ가 커지는 쪽)으로 이동' : '지금은 왼쪽(θ가 작아지는 쪽)으로 이동';
}

// 숫자를 대입한 식. 예: θ_new = −2.5 − 0.1 × (−5) = −2
export function substituted({ theta, eta, detail }) {
  const paren = (x) => (Number(x.toFixed(4)) < 0 ? `(${formatNumber(x)})` : formatNumber(x));
  return `θ_new = ${formatNumber(theta)} − ${formatNumber(eta)} × ${paren(detail.grad)} = ${formatNumber(detail.next)}`;
}
