import { parse, serialize } from "cookie";
import { AnyZodObject, z } from "zod";
import { encrypt, decrypt, importKey } from "./helper";

const webCryptSessionOptionScheme = z.object({
  password: z.string().length(32),
  cookie: z.string(),
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
  sessionEncrypted: string,
  counter: string
) {
  try {
    const sessionDecrypted = await decrypt(key, sessionEncrypted, counter);
    const session = JSONCookie(scheme, sessionDecrypted);
    return session;
  } catch (_) {
    return {} as z.infer<typeof scheme>;
  }
}

export type WebCryptSession<T extends AnyZodObject> = {
  session: z.infer<T>,
  response: (body: string) => Promise<Response>;
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

  const rawCookie = req.headers.get("cookie");
  const cookie = rawCookie ? parse(rawCookie) : { session: "" };
  const [sessionEncrypted, counter] = cookie.session.split("--");

  const session = await decryptSession(key, scheme, sessionEncrypted, counter);
  return Object.assign({
    session,
    response: async (body: BodyInit | null, init?: ResponseInit) => {
      const headers = new Headers(init?.headers);
      try {
        const safeSession = scheme.parse(session);
        const safeSessionString = JSON.stringify(safeSession);
        const { encrypted, counter } = await encrypt(key, safeSessionString);
        headers.set(
          "Set-Cookie",
          serialize("session", `${encrypted}--${counter}`)
        );
        return new Response(body, {
          ...init,
          headers,
        });
      } catch (e) {
        return new Response(body, {
          headers,
        });
      }
    },
  });
}
