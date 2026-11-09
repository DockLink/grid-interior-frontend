import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatHoldDate, toHoldRequestDateIso } from "../../lib/hold-requests/display.ts";

describe("toHoldRequestDateIso", () => {
  it("serializes start as UTC midnight for the picked calendar day", () => {
    assert.equal(toHoldRequestDateIso("2027-01-22"), "2027-01-22T00:00:00.000Z");
  });

  it("serializes end as UTC end-of-day for the picked calendar day", () => {
    assert.equal(toHoldRequestDateIso("2027-01-22", true), "2027-01-22T23:59:59.999Z");
  });

  it("normalizes inputs that already include a time component via the date prefix", () => {
    assert.equal(toHoldRequestDateIso("2027-01-22T15:30:00.000Z"), "2027-01-22T00:00:00.000Z");
    assert.equal(toHoldRequestDateIso("2027-01-22T15:30:00.000Z", true), "2027-01-22T23:59:59.999Z");
  });
});

describe("formatHoldDate", () => {
  it("formats UTC midnight start without shifting the calendar day", () => {
    assert.equal(formatHoldDate("2027-01-22T00:00:00.000Z"), "Jan 22, 2027");
  });

  it("formats UTC end-of-day without shifting to the next calendar day", () => {
    assert.equal(formatHoldDate("2027-01-22T23:59:59.999Z"), "Jan 22, 2027");
  });

  it("formats a date-only string", () => {
    assert.equal(formatHoldDate("2027-01-22"), "Jan 22, 2027");
  });

  it("returns an em dash for invalid input", () => {
    assert.equal(formatHoldDate("not-a-date"), "—");
  });
});
