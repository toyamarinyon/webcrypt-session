import { parse, serialize } from "cookie";
import { AnyZodObject, z } from "zod";

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

export function createWebCryptSession<T extends AnyZodObject>(
  scheme: T,
  req: Request,
  option: WebCryptSessionOption
): {
  session: z.infer<T>;
  response: (body: string) => Response;
} {
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
  const rawCookie = req.headers.get("cookie");
  const cookie = rawCookie ? parse(rawCookie) : { session: "" };
  const session = JSONCookie(scheme, cookie.session);
  return Object.assign({
    session,
    response: (body: BodyInit | null, init?: ResponseInit) => {
      const headers = new Headers(init?.headers);
      try {
        const safeSession = scheme.parse(session);
        JSON.stringify(safeSession);
        headers.set(
          "Set-Cookie",
          serialize("session", JSON.stringify(safeSession))
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
