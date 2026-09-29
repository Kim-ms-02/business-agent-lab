// 재생 관련 순수 함수: 공이 튀는 포물선, 날아가는 시간, 최대 반복 입력 검사

// 화면 좌표 p0 → p1 을 잇는 포물선 위의 점. t: 0~1, h: 가운데에서 직선보다 위로 솟는 높이(px)
// 화면 y는 아래로 갈수록 커지므로 위로 솟으면 y가 작아진다
export function arcPoint(p0, p1, t, h) {
  return {
    x: p0.x + (p1.x - p0.x) * t,
    y: p0.y + (p1.y - p0.y) * t - 4 * h * t * (1 - t),
  };
}

// 튀는 높이: 두 점 사이 거리의 35%, 최소 12px, 최대 90px
export function arcHeight(p0, p1) {
  const d = Math.hypot(p1.x - p0.x, p1.y - p0.y);
  return Math.min(Math.max(d * 0.35, 12), 90);
}

// 한 스텝에서 공이 날아가는 시간(ms): 스텝 간격의 80%, 최대 650ms.
// 50ms보다 짧으면 0 (날지 않고 바로 옮김)
export function flightMs(sps) {
  const ms = Math.min((1000 / sps) * 0.8, 650);
  return ms < 50 ? 0 : ms;
}

// 최대 반복 입력 검사: 1~100000 사이 정수. 잘못되면 한국어 메시지로 Error
export const MAX_ITER_LIMIT = 100000;
export function parseMaxIter(text) {
  const s = String(text).trim();
  if (s === '') throw new Error('최대 반복 횟수를 입력하세요.');
  if (!/^\d+$/.test(s)) throw new Error('최대 반복은 1 이상의 정수로 입력하세요.');
  const n = Number(s);
  if (n < 1 || n > MAX_ITER_LIMIT) throw new Error(`최대 반복은 1부터 ${MAX_ITER_LIMIT}까지 입력할 수 있어요.`);
  return n;
}
