import { expect, test } from "vitest";
import { z } from "zod";
import { getWebCryptSession } from ".";
import { WebCryptSessionOption } from "../..";

const scheme = z.object({
  userId: z.number(),
});
const defaultRequest = new Request("http://loclahost:8989/test");
const password = "IF4B#t69!WlX$uS22blaxDvzJJ%$vEh%";
const option: WebCryptSessionOption = { password };

test("works properly", async () => {
  const session = await getWebCryptSession(scheme, defaultRequest, option);
  expect(session.userId).not.toBeNull();
  // @ts-ignore we actually want to test this
  const [key, value] = await session.responseHeader()
  expect(key).toBe('set-cookie')
  expect(value).toBeUndefined()

  session.userId = 1
  // @ts-ignore we actually want to test this
  const [key2, value2] = await session.responseHeader()
  expect(key2).toBe('set-cookie')
  expect(value2).not.toBeUndefined()
});
