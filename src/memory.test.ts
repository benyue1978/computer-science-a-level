import { readMemory, resetMemory, writeMemory } from "./memory";
test("reset restores each authored scenario and returns independent cells", () => {
  const cells = resetMemory();
  expect(cells).toEqual([
    { address: 10, value: 7 },
    { address: 11, value: 42 },
    { address: 12, value: 9 },
  ]);
  cells[0].value = 99;
  expect(resetMemory()[0].value).toBe(7);
  expect(resetMemory("fresh")).toEqual([
    { address: 20, value: 8 },
    { address: 21, value: 3 },
    { address: 22, value: 8 },
  ]);
});
test("reading returns the contents without changing memory", () => {
  const cells = [
    { address: 10, value: 7 },
    { address: 11, value: 42 },
    { address: 12, value: 9 },
  ];
  const before = structuredClone(cells);
  expect(readMemory(cells, 11)).toBe(42);
  expect(cells).toEqual(before);
});
test("writing replaces only the addressed contents, preserving source and labels", () => {
  const cells = [
    { address: 10, value: 7 },
    { address: 11, value: 42 },
    { address: 12, value: 9 },
  ];
  expect(writeMemory(cells, 11, 6)).toEqual([
    { address: 10, value: 7 },
    { address: 11, value: 6 },
    { address: 12, value: 9 },
  ]);
  expect(cells[1].value).toBe(42);
});
