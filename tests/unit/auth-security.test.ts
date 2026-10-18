import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { isAuthDisabled } from "../../lib/auth/dev-bypass.ts";
import { bearerFromAccessCookie } from "../../lib/auth/session-header.ts";

const ENV_KEY = "NEXT_PUBLIC_ENABLE_AUTH";
const previous = process.env[ENV_KEY];

afterEach(() => {
  if (previous === undefined) delete process.env[ENV_KEY];
  else process.env[ENV_KEY] = previous;
});

describe("isAuthDisabled", () => {
  it("fails closed when the flag is unset", () => {
    delete process.env[ENV_KEY];
    assert.equal(isAuthDisabled(), false);
  });

  it("fails closed when auth is explicitly enabled", () => {
    process.env[ENV_KEY] = "true";
    assert.equal(isAuthDisabled(), false);
  });

  it("enables the bypass only for an explicit false", () => {
    process.env[ENV_KEY] = "false";
    assert.equal(isAuthDisabled(), true);
  });

  it("does not treat other values as the bypass", () => {
    process.env[ENV_KEY] = "yes";
    assert.equal(isAuthDisabled(), false);
  });
});

describe("bearerFromAccessCookie", () => {
  it("builds a bearer token from the access cookie", () => {
    assert.equal(bearerFromAccessCookie("abc", null), "Bearer abc");
  });

  it("leaves an existing authorization header alone", () => {
    assert.equal(bearerFromAccessCookie("abc", "Bearer existing"), null);
  });

  it("ignores a blank cookie", () => {
    assert.equal(bearerFromAccessCookie("  ", null), null);
    assert.equal(bearerFromAccessCookie(undefined, null), null);
  });
});
