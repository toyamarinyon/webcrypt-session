export function getHello(): string {
  return "Hello";
}

async function importKey(rawKey: string) {
  const encoder = new TextEncoder();
  const encodedKey = encoder.encode(rawKey);
  const key = await crypto.subtle.importKey(
    "raw",
    encodedKey,
    "AES-CTR",
    true,
    ["encrypt", "decrypt"]
  );
  return key.algorithm;
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;
  test("import key", async () => {
    expect(await importKey("1234567890123456")).toStrictEqual({
      name: "AES-CTR",
      length: 128,
    });
  });
}
