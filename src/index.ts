export function getHello(): string {
  return "Hello";
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('add', () => {
    expect(getHello()).toBe('Hello')
  })
}