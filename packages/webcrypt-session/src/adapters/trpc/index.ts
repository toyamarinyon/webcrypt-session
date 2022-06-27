import { z } from "zod";
import { createWebCryptSession, WebCryptSessionOption } from "../..";
import {
  AnyRouter,
  inferRouterContext,
  inferRouterError,
  ProcedureType,
  TRPCError,
} from "@trpc/server";
import { TRPCResponse } from "@trpc/server/dist/declarations/src/rpc";

export async function getWebCryptSession<T extends z.AnyZodObject>(
  scheme: T,
  req: Request,
  option: WebCryptSessionOption
) {
  const webCryptSession = await createWebCryptSession(scheme, req, option);

  // Call this function inside tRPC.responseMeta to set cookie into header
  async function responseHeader<TRouter extends AnyRouter>(opts: {
    data: TRPCResponse<unknown, inferRouterError<TRouter>>[];
    ctx?: inferRouterContext<TRouter>;
    paths?: string[];
    type: ProcedureType | "unknown";
    errors: TRPCError[];
  }) {
    const setCookieHeader = await webCryptSession.toHeaderValue();
    return ["set-cookie", setCookieHeader];
  }

  Object.assign(webCryptSession, {
    responseHeader,
  });

  // Block calls to WebCryptSession's internal functions
  // allowing access only to the scheme.
  return (webCryptSession as unknown) as z.infer<T>;
}
