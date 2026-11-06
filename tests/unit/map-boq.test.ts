import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mapBoqQuoteApi, toQuotesPayload } from "../../lib/boq/map-boq.ts";

describe("mapBoqQuoteApi", () => {
  it("maps supplier quotes by default", () => {
    assert.deepEqual(
      mapBoqQuoteApi({
        supplier_id: "s1",
        supplier_name: "Acme",
        price: 100,
      }),
      {
        supplierId: "s1",
        supplierName: "Acme",
        price: 100,
        kind: "supplier",
      },
    );
  });

  it("maps subvendor party_kind", () => {
    assert.deepEqual(
      mapBoqQuoteApi({
        party_kind: "subvendor",
        supplier_id: "sv1",
        supplier_name: "Build Co",
        price: 250,
      }),
      {
        supplierId: "sv1",
        supplierName: "Build Co",
        price: 250,
        kind: "subvendor",
      },
    );
  });
});

describe("toQuotesPayload", () => {
  it("sends party_kind and party_id for suppliers and sub-vendors", () => {
    assert.deepEqual(
      toQuotesPayload([
        {
          supplierId: "s1",
          supplierName: "Acme",
          price: 100,
          kind: "supplier",
        },
        {
          supplierId: "sv1",
          supplierName: "Build Co",
          price: 200,
          kind: "subvendor",
        },
      ]),
      {
        quotes: [
          { party_kind: "supplier", party_id: "s1", price: 100 },
          { party_kind: "subvendor", party_id: "sv1", price: 200 },
        ],
      },
    );
  });
});
