import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { paginate, parseListParams } from "../src/app/service/pagination.service.ts";

describe("parseListParams", () => {
  it("uses safe defaults for malformed, fractional, and non-finite values", () => {
    const params = new URLSearchParams("page=2.5&limit=1e309");

    assert.deepEqual(parseListParams(params), {
      page: 1,
      limit: 10,
      q: "",
      sortBy: undefined,
      sortOrder: -1,
    });
  });

  it("keeps pagination values within the supported range", () => {
    const params = new URLSearchParams("page=0&limit=250");

    assert.deepEqual(parseListParams(params), {
      page: 1,
      limit: 100,
      q: "",
      sortBy: undefined,
      sortOrder: -1,
    });
  });
});

describe("paginate", () => {
  it("normalizes invalid values supplied directly before querying", async () => {
    let queryOptions;
    const query = {
      sort(options) {
        queryOptions.sort = options;
        return this;
      },
      skip(value) {
        queryOptions.skip = value;
        return this;
      },
      limit(value) {
        queryOptions.limit = value;
        return this;
      },
      lean: async () => [],
    };
    const model = {
      find: (filter) => {
        queryOptions = { filter };
        return query;
      },
      countDocuments: async () => 0,
    };

    const result = await paginate(model, {
      page: Number.POSITIVE_INFINITY,
      limit: 1.5,
    });

    assert.equal(queryOptions.skip, 0);
    assert.equal(queryOptions.limit, 10);
    assert.equal(result.meta.page, 1);
    assert.equal(result.meta.limit, 10);

    const largeResult = await paginate(model, {
      page: Number.MAX_SAFE_INTEGER,
      limit: 100,
    });

    assert.ok(Number.isSafeInteger(queryOptions.skip));
    assert.equal(queryOptions.limit, 100);
    assert.equal(largeResult.meta.page, Math.floor(Number.MAX_SAFE_INTEGER / 100) + 1);
  });
});
