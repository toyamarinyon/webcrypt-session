import { test, expect } from "vitest";
import { z } from "zod";
import { createWebCryptSession, WebCryptSessionOption } from ".";

const scheme = z.object({
  userId: z.number(),
});
const defaultRequest = new Request("http://loclahost:8989/test");
const password = "IF4B#t69!WlX$uS22blaxDvzJJ%$vEh%";
const option: WebCryptSessionOption = { password, cookie: "session" };

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

test("no cookie name", async () => {
  await expect(() =>
    // @ts-ignore we actually want to test this
    createWebCryptSession(scheme, defaultRequest, { password })
  ).rejects.toThrowError("webcrypt-session: Bad usage");
});

test("session not exists", async () => {
  const webCryptSession = await createWebCryptSession(
    scheme,
    defaultRequest,
    option
  );
  expect(webCryptSession.session.userId).toBeUndefined();
  const response = await webCryptSession.response("Hello World");
  expect(response.headers.get("set-cookie")).toBeNull();
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
  expect(webCryptSession.session.userId).toBe(1);
});

test("update session", async () => {
  const webCryptSession = await createWebCryptSession(
    scheme,
    new Request("http://loclahost:8989/test"),
    option
  );
  expect(webCryptSession.session.userId).toBeUndefined();
  const responseWithoutSession = await webCryptSession.response("Hello World");
  expect(responseWithoutSession.headers.get("set-cookie")).toBeNull();

  webCryptSession.session.userId = 1;
  const responseWithSession = await webCryptSession.response("Hello World");
  expect(responseWithSession.headers.get("set-cookie")).not.toBeNull();
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
  const response = await webCryptSession.response("Hello World");
  expect(webCryptSession.session.userId).toBeUndefined();
  expect(response.headers.get("set-cookie")).toBeNull();
});
