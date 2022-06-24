import { z } from "zod";
import { createWebCryptSession, WebCryptSessionOption } from "../..";

export async function getWebCryptSession<T extends z.AnyZodObject>(
  scheme: T,
  req: Request,
  option: WebCryptSessionOption
) {
  const webCryptSession = await createWebCryptSession(scheme, req, option);

  // Enclose calls to WebcryptSession's internal functions
  // allowing access only to the scheme.
  return (webCryptSession as unknown) as z.infer<T>;
}
