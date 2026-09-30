import { parseBackup, type State } from "./model";
const database = new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open("daily-vocabulary", 1);
  request.onupgradeneeded = () =>
    request.result.createObjectStore("collection");
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
  request.onblocked = () =>
    reject(new Error("Close other vocabulary tabs and reload."));
});
const storageKey = (owner: string) =>
  owner === "guest" ? "state" : `state:${owner}`;
export async function loadState(owner = "guest"): Promise<State | undefined> {
  const db = await database;
  return new Promise((resolve, reject) => {
    const request = db
      .transaction("collection")
      .objectStore("collection")
      .get(storageKey(owner));
    request.onsuccess = () => {
      try {
        resolve(
          request.result
            ? parseBackup(JSON.stringify(request.result))
            : undefined,
        );
      } catch (e) {
        reject(e);
      }
    };
    request.onerror = () => reject(request.error);
  });
}
export async function saveState(state: State, owner = "guest"): Promise<void> {
  const db = await database;
  return new Promise((resolve, reject) => {
    const tx = db.transaction("collection", "readwrite");
    tx.objectStore("collection").put(state, storageKey(owner));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
