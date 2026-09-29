// 공식 읽기 칸: θ_new = θ − η · J′(θ) 의 기호별 뜻과 현재 값
// s = { theta, eta, detail }  (detail = stepDetail(f, theta, eta) 결과: { grad, move, next })

// 기호별 색. 공식 칸과 그래프에서 같은 색을 쓴다
export const COLORS = {
  theta: '#d1242f',  // 공
  grad: '#0969da',   // 접선
  minus: '#8250df',  // 화살표 방향
  eta: '#8250df',    // 화살표 길이를 정함
  move: '#8250df',   // 이동량 화살표
  next: '#6e7781',   // 다음 위치 점
};

// 공식에 나오는 순서대로: θ_new = θ − η · J′(θ)
export const SYMBOLS = [
  { id: 'next', symbol: 'θ_new', meaning: '다음 위치', value: (s) => formatNumber(s.detail.next) },
  { id: 'theta', symbol: 'θ', meaning: '지금 공의 위치', value: (s) => formatNumber(s.theta) },
  { id: 'minus', symbol: '−', meaning: '기울기의 반대 방향으로 간다', value: (s) => direction(s.detail.move) },
  { id: 'eta', symbol: 'η', meaning: '학습률: 한 번에 얼마나 크게 움직일지', value: (s) => formatNumber(s.eta) },
  { id: 'grad', symbol: 'J′(θ)', meaning: '지금 위치의 기울기 (접선의 기울기)', value: (s) => formatNumber(s.detail.grad) },
  { id: 'move', symbol: 'η · J′(θ)', meaning: '이번 스텝의 이동량', value: (s) => formatNumber(s.detail.move) },
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
  if (r === 0) return '움직이지 않음';
  return r < 0 ? '오른쪽(+)으로' : '왼쪽(−)으로';
}

// 숫자를 대입한 식. 예: θ_new = −2.5 − 0.1 × (−5) = −2
export function substituted({ theta, eta, detail }) {
  const paren = (x) => (Number(x.toFixed(4)) < 0 ? `(${formatNumber(x)})` : formatNumber(x));
  return `θ_new = ${formatNumber(theta)} − ${formatNumber(eta)} × ${paren(detail.grad)} = ${formatNumber(detail.next)}`;
}
