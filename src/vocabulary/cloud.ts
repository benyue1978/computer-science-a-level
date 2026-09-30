import {
  applyCloudSnapshot,
  createCloudSnapshot,
  type CloudSnapshot,
} from "./cloudState";
import { mergeSource, parseBackup, parseSource, type State } from "./model";
import { supabase } from "./supabaseClient";

export async function getSharedExplanations(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const result: Record<string, string> = {};
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase
      .from("shared_explanations")
      .select("word, body")
      .order("word")
      .range(start, start + 999);
    if (error) throw error;
    for (const row of data ?? []) result[row.word] = row.body;
    if (!data || data.length < 1000) return result;
  }
}

export async function loadAccountSnapshot(userId: string) {
  if (!supabase) throw new Error("Cloud storage is not configured.");
  const { data, error } = await supabase
    .from("user_vocabulary_state")
    .select("payload")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.payload as unknown | undefined;
}

export async function saveAccountSnapshot(
  userId: string,
  state: State,
  sharedNotes: Record<string, string> = {},
) {
  if (!supabase) throw new Error("Cloud storage is not configured.");
  const { error } = await supabase.from("user_vocabulary_state").upsert({
    user_id: userId,
    payload: createCloudSnapshot(state, sharedNotes),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export function addSharedDefaults(state: State, sharedNotes: Record<string, string>) {
  const next = structuredClone(state);
  for (const [word, body] of Object.entries(sharedNotes))
    if (next.words[word] && !next.words[word].note.trim())
      next.words[word].note = body;
  return next;
}

export function restoreAccountState(
  catalogue: State,
  rawSnapshot: unknown,
  sharedNotes: Record<string, string>,
): State {
  if (!rawSnapshot || typeof rawSnapshot !== "object" || Array.isArray(rawSnapshot))
    throw new Error("The cloud vocabulary data has an invalid format.");
  const raw = rawSnapshot as Partial<CloudSnapshot>;
  if (
    !Number.isInteger(raw.limit) ||
    (raw.limit as number) < 5 ||
    (raw.limit as number) > 10 ||
    !raw.notes || typeof raw.notes !== "object" || Array.isArray(raw.notes) ||
    !raw.progress || typeof raw.progress !== "object" || Array.isArray(raw.progress) ||
    !Array.isArray(raw.draft) ||
    !Array.isArray(raw.history) ||
    (raw.customSources !== undefined && !Array.isArray(raw.customSources))
  ) throw new Error("The cloud vocabulary data has an invalid format.");
  const snapshot: CloudSnapshot = { ...raw, customSources: raw.customSources ?? [] } as CloudSnapshot;
  let expanded = catalogue;
  for (const source of snapshot.customSources) {
    const valid = parseSource(JSON.stringify(source));
    expanded = mergeSource(expanded, valid);
  }
  const keys = new Set(Object.keys(expanded.words));
  for (const [word, note] of Object.entries(snapshot.notes))
    if (!keys.has(word) || typeof note !== "string" || note.length > 10000)
      throw new Error("The cloud vocabulary data has an invalid explanation.");
  for (const [word, progress] of Object.entries(snapshot.progress))
    if (
      !keys.has(word) || !progress || typeof progress !== "object" ||
      typeof progress.known !== "boolean" || typeof progress.hidden !== "boolean" ||
      !Number.isInteger(progress.stage) || progress.stage < 0 || progress.stage > 3
    ) throw new Error("The cloud vocabulary data has invalid review progress.");
  if (
    snapshot.draft.length > snapshot.limit ||
    new Set(snapshot.draft).size !== snapshot.draft.length ||
    snapshot.draft.some((word) => typeof word !== "string" || !keys.has(word))
  ) throw new Error("The cloud vocabulary data has an invalid daily list.");
  const restored = applyCloudSnapshot(expanded, snapshot, sharedNotes);
  return parseBackup(JSON.stringify(restored));
}
