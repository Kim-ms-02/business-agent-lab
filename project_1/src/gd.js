// 경사하강법 계산 로직 (DOM 의존 없음)

export const J = (theta) => theta * theta;

// 중심차분 수치 미분: f'(x) ≈ (f(x+h) − f(x−h)) / 2h
export function derivative(f, x, h = 1e-5) {
  return (f(x + h) - f(x - h)) / (2 * h);
}

// 한 스텝: θ ← θ − η·J′(θ)
export function step(f, theta, eta) {
  return theta - eta * derivative(f, theta);
}

// 멈춤 판정 기준
export const TOL = 1e-6;            // |J′(θ)| < TOL 이면 수렴
export const DIVERGE_LIMIT = 1e6;   // |θ| > DIVERGE_LIMIT 이면 발산
export const MAX_ITER = 1000;

// 멈출 이유: 'diverged' | 'converged' | 'maxIter' | null(계속 진행)
// 판정 순서: 발산 → 수렴 → 최대 반복
export function stopReason(f, theta, k, { tol = TOL, limit = DIVERGE_LIMIT, maxIter = MAX_ITER } = {}) {
  if (!Number.isFinite(theta) || !Number.isFinite(f(theta)) || Math.abs(theta) > limit) return 'diverged';
  if (Math.abs(derivative(f, theta)) < tol) return 'converged';
  if (k >= maxIter) return 'maxIter';
  return null;
}

// 범위 [a, b]를 n칸으로 나눠 J′ 부호 변화로 최솟값, 기울기가 아주 작은 구간으로 평지를 찾는다.
// 평지 기준: |J′| < flatRatio × (J 최대 − J 최소) / (b − a). 최솟값·극댓값이 들어 있는 구간은 평지가 아니다.
// 범위 끝점은 최솟값으로 보지 않는다.
export function findFeatures(f, [a, b], { n = 2000, flatRatio = 0.02 } = {}) {
  const xs = Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
  const gs = xs.map((x) => derivative(f, x));
  const ys = xs.map(f);

  // 부호 변화: 0인 점은 건너뛰고 직전의 0이 아닌 부호와 비교
  const crossings = []; // { lo, hi, kind: 'min' | 'max' }
  let last = -1;
  for (let i = 0; i <= n; i++) {
    if (gs[i] === 0) continue;
    if (last >= 0 && Math.sign(gs[i]) !== Math.sign(gs[last])) {
      crossings.push({ lo: last, hi: i, kind: gs[last] < 0 ? 'min' : 'max' });
    }
    last = i;
  }

  const minima = crossings
    .filter((c) => c.kind === 'min')
    .map(({ lo, hi }) => {
      // 이분법으로 J′ = 0 위치를 좁힌다
      let l = xs[lo], h = xs[hi];
      for (let i = 0; i < 60; i++) {
        const m = (l + h) / 2;
        if (derivative(f, m) < 0) l = m;
        else h = m;
      }
      const theta = (l + h) / 2;
      return { theta, J: f(theta), global: false };
    });
  if (minima.length > 0) {
    minima.reduce((best, m) => (m.J < best.J ? m : best)).global = true;
  }

  const eps = (flatRatio * (Math.max(...ys) - Math.min(...ys))) / (b - a);
  const plateaus = [];
  for (let i = 0; i <= n; ) {
    if (Math.abs(gs[i]) >= eps) { i++; continue; }
    let j = i;
    while (j + 1 <= n && Math.abs(gs[j + 1]) < eps) j++;
    // 구간 양옆 한 칸까지 포함해 부호 변화가 있으면 골짜기 바닥이나 꼭대기이므로 제외
    const lo = Math.max(i - 1, 0), hi = Math.min(j + 1, n);
    if (!crossings.some((c) => c.hi > lo && c.lo < hi)) {
      plateaus.push({ from: xs[i], to: xs[j] });
    }
    i = j + 1;
  }

  return { minima, plateaus };
}

// 멈춘 θ 판정: 'global' | 'local' | 'plateau' | null
// 최솟값에서 (범위 폭 × 1e-3) 이내면 최솟값, 평지 구간 안이면 평지
export function classifyStop(theta, { minima, plateaus }, [a, b]) {
  const tol = (b - a) * 1e-3;
  const m = minima.find((m) => Math.abs(theta - m.theta) < tol);
  if (m) return m.global ? 'global' : 'local';
  if (plateaus.some((p) => theta >= p.from && theta <= p.to)) return 'plateau';
  return null;
}

// 세분화한 상태 판정: 'global' | 'local' | 'plateauMoving' | 'plateauStopped' | null
// global: 전역 최솟값 도달, local: 지역 최솟값에 갇힘,
// plateauMoving: 평지에서 느리게 이동 중 (아직 안 멈춤), plateauStopped: 평지에서 멈춤
// reason: stopReason 결과 (null이면 진행 중). 발산이거나 해당 없으면 null
export function judgeState(reason, theta, features, range) {
  if (reason === 'diverged') return null;
  const place = classifyStop(theta, features, range);
  if (reason === null) return place === 'plateau' ? 'plateauMoving' : null;
  if (place === 'plateau') return 'plateauStopped';
  return place;
}
