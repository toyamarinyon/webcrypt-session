import { test, expect } from "vitest";
import { z } from "zod";
import { createWebCryptSession, WebCryptSessionOption } from ".";

const scheme = z.object({
  userId: z.number(),
});
const defaultRequest = new Request("http://loclahost:8989/test");
const password = "IF4B#t69!WlX$uS22blaxDvzJJ%$vEh%";
const option: WebCryptSessionOption = { password, cookie: "session" };

test("no scheme", () => {
  // @ts-ignore we actually want to test this
  expect(() => createWebCryptSession()).toThrowErrorMatchingInlineSnapshot(
    '"webcrypt-session: Bad usage"'
  );
});

test("no req", () => {
  expect(() =>
    // @ts-ignore we actually want to test this
    createWebCryptSession(scheme)
  ).toThrowErrorMatchingInlineSnapshot('"webcrypt-session: Bad usage"');
});

test("no option", () => {
  expect(() =>
    // @ts-ignore we actually want to test this
    createWebCryptSession(scheme, defaultRequest)
  ).toThrowErrorMatchingInlineSnapshot('"webcrypt-session: Bad usage"');
});

test("no password", () => {
  expect(() =>
    // @ts-ignore we actually want to test this
    createWebCryptSession(scheme, defaultRequest, {})
  ).toThrowErrorMatchingInlineSnapshot('"webcrypt-session: Bad usage"');
});

test("bad password length", () => {
  expect(() =>
    // @ts-ignore we actually want to test this
    createWebCryptSession(scheme, defaultRequest, { password: "a" })
  ).toThrowErrorMatchingInlineSnapshot('"webcrypt-session: Bad usage"');
});

test("no cookie name", () => {
  expect(() =>
    // @ts-ignore we actually want to test this
    createWebCryptSession(scheme, defaultRequest, { password })
  ).toThrowErrorMatchingInlineSnapshot('"webcrypt-session: Bad usage"');
});

test("session not exists", () => {
  const webCryptSession = createWebCryptSession(scheme, defaultRequest, option);
  expect(webCryptSession.session.userId).toBeUndefined();
  expect(
    webCryptSession.response("Hello World").headers.get("set-cookie")
  ).toBeNull();
});

test("session exists", () => {
  const webCryptSession = createWebCryptSession(
    scheme,
    new Request("http://loclahost:8989/test", {
      headers: {
        cookie: "session=%7B%22userId%22%3A1%7D",
      },
    }),
    option
  );
  expect(webCryptSession.session.userId).toBe(1);
  expect(
    webCryptSession.response("Hello World").headers.get("set-cookie")
  ).toBe("session=%7B%22userId%22%3A1%7D");
});

test("update session", () => {
  const webCryptSession = createWebCryptSession(
    scheme,
    new Request("http://loclahost:8989/test"),
    option
  );
  expect(webCryptSession.session.userId).toBeUndefined();
  expect(
    webCryptSession.response("Hello World").headers.get("set-cookie")
  ).toBeNull();

  webCryptSession.session.userId = 1;
  expect(webCryptSession.session.userId).toBe(1);
  expect(
    webCryptSession.response("Hello World").headers.get("set-cookie")
  ).toBe("session=%7B%22userId%22%3A1%7D");
});

test("invalid session", () => {
  const webCryptSession = createWebCryptSession(
    scheme,
    new Request("http://loclahost:8989/test", {
      headers: {
        cookie: "session=%7B%22userId%22%3A1%7",
      },
    }),
    option
  );
  expect(webCryptSession.session.userId).toBeUndefined();
  expect(
    webCryptSession.response("Hello World").headers.get("set-cookie")
  ).toBeNull();
});
