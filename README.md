# WebCrypt Session

demo: https://webcrypt-session.sat0shi.workers.dev/

_🛠 Stateless session utility using signed and encrypted cookies to store data. Works with WebCrypt API on Cloudflare Workers._

```ts
import { createWebCryptSession } from "webcrypt-session";
import { z } from "zod";

const sessionScheme = z.object({
  username: z.string(),
});
export default {
  async fetch(request: Request): Promise<Response> {
    const webCryptSession = await createWebCryptSession(
      sessionScheme,
      request,
      {
        password: "IF4B#t69!WlX$uS22blaxDvzJJ%$vEh%",
      }
    );
    return new Response(`Hello ${webCryptSession.username}`, {
      headers: {
        "Set-Cookie": webCryptSession.toHeaderValue(),
      },
    });
  },
};
```

# Acknowledgment

This package is greatly influenced by [iron-session](https://github.com/vvo/iron-session) developed by [@vvoyer](https://twitter.com/vvoyer). iron-session is quite cool library that it allows to manage a stateless session.

I'd like to use iron-session on CloudFlare worker, but it could not run it because it requires Node.js runtime.

So, I started to develop a library that it allows to manage a stateless session on Cloudflare Worker, using iron-session's api design and implementation as a reference.

# Example

https://github.com/toyamarinyon/webcrypt-session/tree/main/examples/cloudflare
