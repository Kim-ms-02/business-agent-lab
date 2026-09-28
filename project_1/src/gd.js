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
