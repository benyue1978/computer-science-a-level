export type StorageLocation = { id: string; value: number };

export function copyValue(
  items: readonly StorageLocation[],
  sourceId: string,
  destinationId: string,
): StorageLocation[] {
  const source = items.find((item) => item.id === sourceId);
  if (!source) throw new Error(`Unknown source: ${sourceId}`);
  if (!items.some((item) => item.id === destinationId)) {
    throw new Error(`Unknown destination: ${destinationId}`);
  }

  return items.map((item) => ({
    ...item,
    value: item.id === destinationId ? source.value : item.value,
  }));
}
