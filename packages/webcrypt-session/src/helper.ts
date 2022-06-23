const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Convert a ByteString (a string whose code units are all in the range
// [0, 255]), to a Uint8Array. If you pass in a string with code units larger
// than 255, their values will overflow.
function byteStringToUint8Array(byteString: string) {
  const ui = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; ++i) {
    ui[i] = byteString.charCodeAt(i);
  }
  return ui;
}

export async function importKey(password: string) {
  const rawKey = encoder.encode(password);
  const key = await crypto.subtle.importKey("raw", rawKey, "AES-CTR", true, [
    "encrypt",
    "decrypt",
  ]);
  return key;
}
export async function encrypt(
  key: CryptoKey,
  string: string
): Promise<{
  encrypted: string;
  counter: string;
}> {
  const sessionEncoded = encoder.encode(string);
  const counter = crypto.getRandomValues(new Uint8Array(16));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-CTR",
      counter,
      length: 128,
    },
    key,
    sessionEncoded
  );

  const encryptedString = btoa(
    String.fromCharCode(...new Uint8Array(encrypted))
  );
  const counterString = btoa(String.fromCharCode(...counter));
  return { encrypted: encryptedString, counter: counterString };
}

export async function decrypt(key: CryptoKey, string: string, counter: string) {
  const result = await crypto.subtle.decrypt(
    {
      name: "AES-CTR",
      counter: byteStringToUint8Array(atob(counter)),
      length: 64,
    },
    key,
    byteStringToUint8Array(atob(string))
  );

  return decoder.decode(result);
}

