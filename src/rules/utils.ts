export function isCjk(char: string): boolean {
  return /[\u3400-\u9FFF\uF900-\uFAFF]/u.test(char)
}

export function isAsciiWord(char: string): boolean {
  return /[A-Za-z0-9\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A]/.test(char)
}
