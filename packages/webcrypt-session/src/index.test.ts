import { test, expect } from "vitest";
import { z } from "zod";
import { createWebCryptSession, WebCryptSessionOption } from ".";

const scheme = z.object({
  userId: z.number(),
});
const defaultRequest = new Request("http://loclahost:8989/test");
const password = "IF4B#t69!WlX$uS22blaxDvzJJ%$vEh%";
const option: WebCryptSessionOption = { password };

test("no scheme", async () => {
  // @ts-ignore we actually want to test this
  await expect(createWebCryptSession()).rejects.toThrowError(
    "webcrypt-session: Bad usage"
  );
});

test("no req", async () => {
  await expect(
    // @ts-ignore we actually want to test this
    createWebCryptSession(scheme)
  ).rejects.toThrowError("webcrypt-session: Bad usage");
});

test("no option", async () => {
  await expect(() =>
    // @ts-ignore we actually want to test this
    createWebCryptSession(scheme, defaultRequest)
  ).rejects.toThrowError("webcrypt-session: Bad usage");
});

test("no password", async () => {
  await expect(() =>
    // @ts-ignore we actually want to test this
    createWebCryptSession(scheme, defaultRequest, {})
  ).rejects.toThrowError("webcrypt-session: Bad usage");
});

test("bad password length", async () => {
  await expect(() =>
    // @ts-ignore we actually want to test this
    createWebCryptSession(scheme, defaultRequest, { password: "a" })
  ).rejects.toThrowError("webcrypt-session: Bad usage");
});

test("session not exists", async () => {
  const webCryptSession = await createWebCryptSession(
    scheme,
    defaultRequest,
    option
  );
  expect(webCryptSession.userId).toBeUndefined();
  const setCookieHeader = webCryptSession.toHeaderValue();
  expect(setCookieHeader).toBeUndefined();
});

test("session exists", async () => {
  const webCryptSession = await createWebCryptSession(
    scheme,
    new Request("http://loclahost:8989/test", {
      headers: {
        cookie: "session=Ekvxbb%2F1pRAsZZWq--%2FybF8SeKlgnR%2FKn7eEiFeA%3D%3D",
      },
    }),
    option
  );
  expect(webCryptSession.userId).toBe(1);
});

test("save session", async () => {
  const webCryptSession = await createWebCryptSession(
    scheme,
    new Request("http://loclahost:8989/test"),
    option
  );
  expect(webCryptSession.userId).toBeUndefined();
  const nonSessionHeader = await webCryptSession.toHeaderValue();
  expect(nonSessionHeader).toBeUndefined();
  await webCryptSession.save({
    userId: 1,
  });
  const sessionHeader = webCryptSession.toHeaderValue();
  expect(sessionHeader).not.toBeUndefined();
});

test("invalid session", async () => {
  const webCryptSession = await createWebCryptSession(
    scheme,
    new Request("http://loclahost:8989/test", {
      headers: {
        cookie: "session=%7B%22userId%22%3A1%7",
      },
    }),
    option
  );
  const nonSessionHeader = webCryptSession.toHeaderValue();
  expect(webCryptSession.userId).toBeUndefined();
  expect(nonSessionHeader).toBeUndefined();
});

test("there is no session in cookie", async () => {
  const webCryptSession = await createWebCryptSession(
    scheme,
    new Request("http://loclahost:8989/test", {
      headers: {
        cookie: "googleAnalytics=%7B%22userId%22%3A1%7",
      },
    }),
    option
  );
  const nonSessionHeader = webCryptSession.toHeaderValue();
  expect(webCryptSession.userId).toBeUndefined();
  expect(nonSessionHeader).toBeUndefined();
});
