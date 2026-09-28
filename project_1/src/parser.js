// 식 해석기: 문자열 → (x) => number
// 토큰 분리 → 재귀 하강 구문 분석 → 계산 함수. eval / new Function 을 쓰지 않는다.
//
// 문법 (위가 우선순위 낮음)
//   expr    := term (('+' | '-') term)*
//   term    := unary (('*' | '/') unary | 곱하기 생략 power)*
//   unary   := ('-' | '+') unary | power
//   power   := primary ('^' unary)?          ← 오른쪽 결합, -x^2 = -(x^2)
//   primary := 숫자 | x | θ | pi | e | 함수 '(' expr ')' | '(' expr ')'
// 곱하기 생략: 값 뒤에 이름이나 '(' 가 바로 오면 곱하기 (2x, 2(x+1), (x+1)(x-1), 2sin(x))

export class ParseError extends Error {
  constructor(message, pos = null) {
    super(message);
    this.name = 'ParseError';
    this.pos = pos; // 입력 문자열에서 문제 위치 (0부터), 모르면 null
  }
}

// 허용 목록. 객체 프로토타입의 이름(constructor 등)이 끼어들지 않도록 Map 사용
const FUNCS = new Map([
  ['sin', Math.sin],
  ['cos', Math.cos],
  ['tan', Math.tan],
  ['exp', Math.exp],
  ['log', Math.log],
  ['sqrt', Math.sqrt],
  ['abs', Math.abs],
]);
const CONSTS = new Map([
  ['pi', Math.PI],
  ['e', Math.E],
]);
const VARS = new Set(['x', 'θ']);
const ALLOWED_NAMES = 'x, θ, pi, e, sin, cos, tan, exp, log, sqrt, abs';

// 토큰: { type: 'num' | 'name' | 'op' | '(' | ')', value, pos }
export function tokenize(text) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (/\s/.test(ch)) { i++; continue; }
    const num = /^(\d+\.?\d*|\.\d+)/.exec(text.slice(i));
    if (num) {
      tokens.push({ type: 'num', value: Number(num[0]), pos: i });
      i += num[0].length;
      continue;
    }
    const name = /^[a-zA-Zθ]+/.exec(text.slice(i));
    if (name) {
      tokens.push({ type: 'name', value: name[0], pos: i });
      i += name[0].length;
      continue;
    }
    if ('+-*/^'.includes(ch)) {
      tokens.push({ type: 'op', value: ch, pos: i });
      i++;
      continue;
    }
    if (ch === '(' || ch === ')') {
      tokens.push({ type: ch, value: ch, pos: i });
      i++;
      continue;
    }
    throw new ParseError(`'${ch}'는 사용할 수 없는 문자입니다. (${i + 1}번째 글자)`, i);
  }
  return tokens;
}

// 구문 트리 노드: { kind: 'num', value } | { kind: 'var' } | { kind: 'neg', arg }
//                | { kind: 'bin', op, left, right } | { kind: 'call', fn, name, arg }
export function parse(tokens, text = '') {
  let i = 0;
  const peek = () => tokens[i];
  const endPos = text.length;

  const describe = (t) => (t.type === 'num' ? String(t.value) : t.value);

  function parseExpr() {
    let node = parseTerm();
    while (peek()?.type === 'op' && (peek().value === '+' || peek().value === '-')) {
      const op = tokens[i++].value;
      node = { kind: 'bin', op, left: node, right: parseTerm() };
    }
    return node;
  }

  function parseTerm() {
    let node = parseUnary();
    for (;;) {
      const t = peek();
      if (t?.type === 'op' && (t.value === '*' || t.value === '/')) {
        i++;
        node = { kind: 'bin', op: t.value, left: node, right: parseUnary() };
      } else if (t && (t.type === 'name' || t.type === '(')) {
        // 곱하기 생략
        node = { kind: 'bin', op: '*', left: node, right: parsePower() };
      } else {
        return node;
      }
    }
  }

  function parseUnary() {
    const t = peek();
    if (t?.type === 'op' && (t.value === '-' || t.value === '+')) {
      i++;
      const arg = parseUnary();
      return t.value === '-' ? { kind: 'neg', arg } : arg;
    }
    return parsePower();
  }

  function parsePower() {
    const base = parsePrimary();
    if (peek()?.type === 'op' && peek().value === '^') {
      i++;
      return { kind: 'bin', op: '^', left: base, right: parseUnary() };
    }
    return base;
  }

  function parsePrimary() {
    const t = peek();
    if (!t) throw new ParseError('식이 끝났는데 값이 더 필요합니다. (예: "x +" 뒤에 값이 없음)', endPos);
    if (t.type === 'num') {
      i++;
      return { kind: 'num', value: t.value };
    }
    if (t.type === 'name') {
      i++;
      if (VARS.has(t.value)) return { kind: 'var' };
      if (CONSTS.has(t.value)) return { kind: 'num', value: CONSTS.get(t.value) };
      if (FUNCS.has(t.value)) {
        if (peek()?.type !== '(') {
          throw new ParseError(`함수 ${t.value} 뒤에는 괄호가 필요합니다. (예: ${t.value}(x))`, t.pos);
        }
        const open = tokens[i++];
        const arg = parseExpr();
        expectClose(open);
        return { kind: 'call', fn: FUNCS.get(t.value), name: t.value, arg };
      }
      throw new ParseError(`'${t.value}'는 모르는 이름입니다. 사용할 수 있는 이름: ${ALLOWED_NAMES}`, t.pos);
    }
    if (t.type === '(') {
      i++;
      const node = parseExpr();
      expectClose(t);
      return node;
    }
    if (t.type === ')') {
      throw new ParseError(`여는 괄호 '(' 없이 닫는 괄호 ')'가 있습니다. (${t.pos + 1}번째 글자)`, t.pos);
    }
    throw new ParseError(`'${describe(t)}' 앞에 값이 필요합니다. (${t.pos + 1}번째 글자)`, t.pos);
  }

  function expectClose(open) {
    const t = peek();
    if (t?.type === ')') { i++; return; }
    if (!t) throw new ParseError(`닫는 괄호 ')'가 빠졌습니다. (${open.pos + 1}번째 글자의 '('를 닫아야 함)`, open.pos);
    throw new ParseError(`'${describe(t)}' 앞에 연산자가 필요합니다. (${t.pos + 1}번째 글자)`, t.pos);
  }

  const ast = parseExpr();
  const rest = peek();
  if (rest) {
    if (rest.type === ')') {
      throw new ParseError(`여는 괄호 '(' 없이 닫는 괄호 ')'가 있습니다. (${rest.pos + 1}번째 글자)`, rest.pos);
    }
    throw new ParseError(`'${describe(rest)}' 앞에 연산자가 필요합니다. (${rest.pos + 1}번째 글자)`, rest.pos);
  }
  return ast;
}

// 구문 트리 → (x) => number
export function compile(node) {
  switch (node.kind) {
    case 'num': {
      const v = node.value;
      return () => v;
    }
    case 'var':
      return (x) => x;
    case 'neg': {
      const a = compile(node.arg);
      return (x) => -a(x);
    }
    case 'call': {
      const { fn } = node;
      const a = compile(node.arg);
      return (x) => fn(a(x));
    }
    case 'bin': {
      const l = compile(node.left), r = compile(node.right);
      switch (node.op) {
        case '+': return (x) => l(x) + r(x);
        case '-': return (x) => l(x) - r(x);
        case '*': return (x) => l(x) * r(x);
        case '/': return (x) => l(x) / r(x);
        case '^': return (x) => l(x) ** r(x);
      }
    }
  }
  throw new Error(`알 수 없는 노드: ${node.kind}`);
}

// 식 문자열 → (x) => number. 잘못된 식이면 ParseError
export function parseFunction(text) {
  if (text.trim() === '') throw new ParseError('식을 입력하세요.', 0);
  return compile(parse(tokenize(text), text));
}

// θ 범위 [a, b]를 n+1개 점으로 나눴을 때 절반을 넘는 점에서 값이 정의되지 않으면 ParseError
export function checkDefinedOnRange(f, [a, b], n = 200) {
  let bad = 0;
  for (let i = 0; i <= n; i++) {
    if (!Number.isFinite(f(a + ((b - a) * i) / n))) bad++;
  }
  if (bad > (n + 1) / 2) {
    throw new ParseError(`θ 범위 [${a}, ${b}]의 대부분에서 값이 정의되지 않습니다. (예: 음수의 log, sqrt) 범위나 식을 바꿔 보세요.`);
  }
}
