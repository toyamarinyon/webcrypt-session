import { expect, test } from "vitest";
import { z } from "zod";
import { getWebCryptSession } from ".";
import { WebCryptSessionOption } from "../..";

const scheme = z.object({
  userId: z.number(),
});
const defaultRequest = new Request("http://loclahost:8989/test");
const password = "IF4B#t69!WlX$uS22blaxDvzJJ%$vEh%";
const option: WebCryptSessionOption = { password, cookie: "session" };

test("works properly", async () => {
  const session = await getWebCryptSession(scheme, defaultRequest, option);
  expect(session.userId).not.toBeNull();
  // @ts-ignore we actually want to test this
  expect(session.toHeaderValue).not.toBeNull();
});
