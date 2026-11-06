import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  findHandoverNamedMilestone,
  resolveHandoverDateLabel,
} from "../../lib/timeline/resolve-handover-key-date.ts";

describe("resolveHandoverDateLabel / findHandoverNamedMilestone", () => {
  it("uses a named Handover milestone date", () => {
    const date = resolveHandoverDateLabel(
      [
        { name: "Concept Approval", date: "14 Nov 2026" },
        { name: "Handover", date: "18 Dec 2026" },
      ],
      "20 May 2027",
    );

    assert.equal(date, "18 Dec 2026");
  });

  it("uses a Site Handover milestone date", () => {
    const date = resolveHandoverDateLabel(
      [
        { name: "Brief confirmed", date: "10 Nov 2026" },
        { name: "Site Handover (Final)", date: "2 Jun 2027" },
      ],
      "20 May 2027",
    );

    assert.equal(date, "2 Jun 2027");
  });

  it("falls back to projectEndLabel when no handover-named milestone exists", () => {
    const milestones = [
      { name: "Concept Approval", date: "14 Nov 2026" },
      { name: "Furniture delivery", date: "2 Dec 2026" },
    ];

    assert.equal(resolveHandoverDateLabel(milestones, "20 May 2027"), "20 May 2027");
    assert.equal(findHandoverNamedMilestone(milestones), undefined);
  });

  it("does not treat a bare completion milestone as handover", () => {
    const date = resolveHandoverDateLabel(
      [
        { name: "Concept completion", date: "2 Dec 2026" },
        { name: "Layout review", date: "15 Jan 2027" },
      ],
      "20 May 2027",
    );

    assert.equal(date, "20 May 2027");
  });

  it("prefers the latest matching handover-named milestone", () => {
    const date = resolveHandoverDateLabel(
      [
        { name: "Soft handover", date: "1 Mar 2027" },
        { name: "Close-out", date: "20 May 2027" },
      ],
      "1 Jan 2028",
    );

    assert.equal(date, "20 May 2027");
  });

  it("falls back to projectEndLabel when milestones are empty", () => {
    assert.equal(resolveHandoverDateLabel([], "20 May 2027"), "20 May 2027");
  });
});
