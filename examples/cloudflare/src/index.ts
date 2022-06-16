/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { z } from "zod";
import { createWebCryptSession } from "webcrypt-session";
export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}
const sessionScheme = z.object({
  username: z.string(),
});

const signInParamScheme = z.object({
  username: z.string(),
});
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const webCryptSession = await createWebCryptSession(
      sessionScheme,
      request,
      {
        password: "IF4B#t69!WlX$uS22blaxDvzJJ%$vEh%",
        cookie: "session",
      }
    );
    const url = new URL(request.url);
    if (url.pathname === "/signIn") {
      if (request.method !== "POST") {
        return new Response(null, { status: 405 });
      }
      try {
        const signInParam = signInParamScheme.parse(await request.json());
        webCryptSession.session.username = signInParam.username;
        return webCryptSession.response(`Hello ${signInParam.username}!`);
      } catch {
        return new Response(null, {
          status: 400,
        });
      }
    }
    if (webCryptSession.session.username == null) {
      return webCryptSession.response(
        "Please sign in first with http://localhost:8787/signIn"
      );
    }
    return webCryptSession.response(`Hello ${webCryptSession.session.username}`);
  },
};
