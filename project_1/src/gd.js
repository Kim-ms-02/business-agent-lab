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
