import { describe, expect, test } from "vitest";
import { copyValue } from "./copyModel";

describe("copyValue", () => {
  test("copies A into B without changing A or the input", () => {
    const input = [
      { id: "A", value: 7 },
      { id: "B", value: 42 },
    ];

    expect(copyValue(input, "A", "B")).toEqual([
      { id: "A", value: 7 },
      { id: "B", value: 7 },
    ]);
    expect(input).toEqual([
      { id: "A", value: 7 },
      { id: "B", value: 42 },
    ]);
  });

  test("changes only the destination in a memory copy", () => {
    const input = [
      { id: "m10", value: 7 },
      { id: "m11", value: 42 },
      { id: "m12", value: 9 },
      { id: "A", value: 7 },
    ];

    expect(copyValue(input, "m11", "A")).toEqual([
      { id: "m10", value: 7 },
      { id: "m11", value: 42 },
      { id: "m12", value: 9 },
      { id: "A", value: 42 },
    ]);
  });

  test("rejects unknown endpoints", () => {
    const input = [{ id: "A", value: 7 }];
    expect(() => copyValue(input, "missing", "A")).toThrow(
      "Unknown source: missing",
    );
    expect(() => copyValue(input, "A", "missing")).toThrow(
      "Unknown destination: missing",
    );
  });
});
