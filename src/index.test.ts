import { test, expect } from "vitest";
import { z } from "zod";
import { createWebCryptSession } from ".";

test("session not exists", () => {
  const scheme = z.object({
    userId: z.number(),
  });
  const webCryptSession = createWebCryptSession(
    scheme,
    new Request("http://loclahost:8989/test")
  );
  expect(webCryptSession.session.userId).toBeUndefined();
  expect(
    webCryptSession.response("Hello World").headers.get("set-cookie")
  ).toBeNull();
});

test("session exists", () => {
  const scheme = z.object({
    userId: z.number(),
  });
  const webCryptSession = createWebCryptSession(
    scheme,
    new Request("http://loclahost:8989/test", {
      headers: {
        cookie: "session=%7B%22userId%22%3A1%7D",
      },
    })
  );
  expect(webCryptSession.session.userId).toBe(1);
  expect(
    webCryptSession.response("Hello World").headers.get("set-cookie")
  ).toBe("session=%7B%22userId%22%3A1%7D");
});

test("update session", () => {
  const scheme = z.object({
    userId: z.number(),
  });
  const webCryptSession = createWebCryptSession(
    scheme,
    new Request("http://loclahost:8989/test")
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
  const scheme = z.object({
    userId: z.number(),
  });
  const webCryptSession = createWebCryptSession(
    scheme,
    new Request("http://loclahost:8989/test", {
      headers: {
        cookie: "session=%7B%22userId%22%3A1%7",
      },
    })
  );
  expect(webCryptSession.session.userId).toBeUndefined();
  expect(
    webCryptSession.response("Hello World").headers.get("set-cookie")
  ).toBeNull();
});
