export type Cell = { address: number; value: number };
const scenarios: Record<"first" | "fresh", readonly Cell[]> = {
  first: [
    { address: 10, value: 7 },
    { address: 11, value: 42 },
    { address: 12, value: 9 },
  ],
  fresh: [
    { address: 20, value: 8 },
    { address: 21, value: 3 },
    { address: 22, value: 8 },
  ],
};
export const resetMemory = (scenario: "first" | "fresh" = "first"): Cell[] =>
  scenarios[scenario].map((cell) => ({ ...cell }));
export const readMemory = (
  cells: Cell[],
  address: number,
): number | undefined => cells.find((cell) => cell.address === address)?.value;
export const writeMemory = (
  cells: Cell[],
  address: number,
  value: number,
): Cell[] =>
  cells.map((cell) =>
    cell.address === address ? { ...cell, value } : { ...cell },
  );
