import { parse, serialize } from "cookie";
import { AnyZodObject, z } from "zod";
import { encrypt, decrypt, importKey } from "./helper";

const webCryptSessionOptionScheme = z.object({
  password: z.string().length(32),
});
export type WebCryptSessionOption = z.infer<typeof webCryptSessionOptionScheme>;

function JSONCookie(
  scheme: z.AnyZodObject,
  cookie: string
): z.infer<typeof scheme> {
  if (typeof cookie !== "string") {
    return {} as z.infer<typeof scheme>;
  }

  try {
    const json = JSON.parse(cookie);
    return scheme.parse(json);
  } catch (err) {
    return {} as z.infer<typeof scheme>;
  }
}

async function decryptSession(
  key: CryptoKey,
  scheme: z.AnyZodObject,
  cookie: string | null
) {
  try {
    const cookieParsed = cookie ? parse(cookie) : { session: "" };
    const [sessionEncrypted, counter] = cookieParsed.session.split("--");
    const sessionDecrypted = await decrypt(key, sessionEncrypted, counter);
    const session = JSONCookie(scheme, sessionDecrypted);
    return session;
  } catch (_) {
    return {} as z.infer<typeof scheme>;
  }
}

export type WebCryptSession<T extends AnyZodObject> = z.infer<T> & {
  save: (scheme: z.infer<T>) => Promise<void>;
  toHeaderValue: () => string | undefined;
};

export async function createWebCryptSession<T extends AnyZodObject>(
  scheme: T,
  req: Request,
  option: WebCryptSessionOption
): Promise<WebCryptSession<T>> {
  if (
    req == null ||
    scheme == null ||
    option == null ||
    option.password == null
  ) {
    throw new Error(`webcrypt-session: Bad usage`);
  }
  const parsedOption = webCryptSessionOptionScheme.safeParse(option);
  if (!parsedOption.success) {
    throw new Error(`webcrypt-session: Bad usage`);
  }
  const key = await importKey(parsedOption.data.password);

  const session = await decryptSession(key, scheme, req.headers.get("cookie"));
  let encryptedSession: string;
  let encryptedCounter: string;
  return Object.assign(session, {
    save: async (newSession: z.infer<T>) => {
      const safeSession = scheme.parse(newSession);
      const safeSessionString = JSON.stringify(safeSession);
      const { encrypted, counter } = await encrypt(key, safeSessionString);
      encryptedSession = encrypted;
      encryptedCounter = counter;
    },
    toHeaderValue: () => {
      if (encryptedSession == null || encryptedCounter == null) {
        return undefined;
      }
      return serialize("session", `${encryptedSession}--${encryptedCounter}`);
    },
  });
}
