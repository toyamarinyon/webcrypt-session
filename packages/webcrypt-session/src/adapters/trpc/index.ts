import { z } from "zod";
import {
  createWebCryptSession,
  WebCryptSession,
  WebCryptSessionOption,
} from "../..";
import {
  AnyRouter,
  inferRouterContext,
  inferRouterError,
  ProcedureType,
  TRPCError,
} from "@trpc/server";
import { TRPCResponse } from "@trpc/server/rpc";

export async function getWebCryptSession<T extends z.AnyZodObject>(
  scheme: T,
  req: Request,
  option: WebCryptSessionOption
) {
  const webCryptSession = await createWebCryptSession(scheme, req, option);

  // Call this function inside tRPC.responseMeta to set cookie into header
  function responseHeader<TRouter extends AnyRouter>(opts: {
    data: TRPCResponse<unknown, inferRouterError<TRouter>>[];
    ctx?: inferRouterContext<TRouter>;
    paths?: string[];
    type: ProcedureType | "unknown";
    errors: TRPCError[];
  }) {
    const setCookieHeader = webCryptSession.toHeaderValue();
    return ["set-cookie", setCookieHeader];
  }

  Object.assign(webCryptSession, {
    responseHeader,
  });

  // Block calls to WebCryptSession's internal functions
  // allowing access only to the scheme.
  return (webCryptSession as unknown) as Exclude<
    WebCryptSession<T>,
    "toHeaderValue"
  >;
}
