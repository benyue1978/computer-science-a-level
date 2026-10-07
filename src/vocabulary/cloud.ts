import {
  applyAliasesToCloudSnapshot,
  applyCloudSnapshot,
  createCloudSnapshot,
  type CloudSnapshot,
} from "./cloudState";
import type { SupabaseClient } from "@supabase/supabase-js";
import { applyWordAliases, mergeSource, parseBackup, parseSource, type Source, type State } from "./model";
import { supabase } from "./supabaseClient";

export async function isVocabularyAdmin(
  client: SupabaseClient | null = supabase,
): Promise<boolean> {
  if (!client) return false;
  const { data, error } = await client.rpc("is_vocabulary_admin");
  if (error) throw error;
  return data === true;
}

export async function generateVocabularyExplanation(
  word: string,
  example: string | undefined,
  client: SupabaseClient | null = supabase,
): Promise<string> {
  if (!client) throw new Error("Cloud storage is not configured.");
  const { data, error } = await client.functions.invoke(
    "generate-vocabulary-explanation",
    { body: { word, ...(example ? { example } : {}) } },
  );
  if (error) throw error;
  const raw = (data as { explanation?: unknown } | null)?.explanation;
  const explanation = typeof raw === "string" ? raw.trim() : "";
  if (!explanation || explanation.length > 1000)
    throw new Error("The generated explanation was invalid.");
  return explanation;
}

export async function publishSharedExplanation(
  word: string,
  body: string,
  userId: string,
  client: SupabaseClient | null = supabase,
): Promise<void> {
  if (!client) throw new Error("Cloud storage is not configured.");
  const explanation = body.trim();
  if (!explanation) throw new Error("An explanation is required.");
  const { error } = await client.from("shared_explanations").upsert({
    word,
    body: explanation,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

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

export async function getVocabularyAliases(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const aliases: Record<string, string> = {};
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase
      .from("vocabulary_word_aliases")
      .select("alias, canonical")
      .order("alias")
      .range(start, start + 999);
    if (error) throw error;
    for (const row of data ?? []) aliases[row.alias] = row.canonical;
    if (!data || data.length < 1000) return aliases;
  }
}

export function buildSharedVocabularySources(
  sources: { id: string; name: string }[],
  catalogueWords: { word: string; forms: string[] | null; examples: string[] | null }[],
  links: { source_id: string; word: string; frequency: number }[],
): Source[] {
  const wordMap = new Map(catalogueWords.map((row) => [row.word, row]));
  const grouped = new Map<string, Source["words"]>();
  for (const link of links) {
    const detail = wordMap.get(link.word);
    if (!detail) continue;
    const entries = grouped.get(link.source_id) ?? [];
    entries.push({ word: link.word, frequency: link.frequency, forms: detail.forms ?? [link.word], examples: detail.examples ?? [] });
    grouped.set(link.source_id, entries);
  }
  return sources.filter((source) => (grouped.get(source.id)?.length ?? 0) > 0)
    .map((source) => ({ ...source, words: grouped.get(source.id)! }));
}

export async function getSharedVocabularySources(): Promise<Source[]> {
  if (!supabase) return [];
  const sources: { id: string; name: string }[] = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase.from("vocabulary_sources")
      .select("id,name").order("id").range(start, start + 999);
    if (error) throw error;
    sources.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  const catalogueWords: { word: string; forms: string[] | null; examples: string[] | null }[] = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase.from("vocabulary_words")
      .select("word,forms,examples").order("word").range(start, start + 999);
    if (error) throw error;
    catalogueWords.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  const links: { source_id: string; word: string; frequency: number }[] = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase.from("vocabulary_source_words")
      .select("source_id,word,frequency").order("source_id").order("word").range(start, start + 999);
    if (error) throw error;
    links.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return buildSharedVocabularySources(sources, catalogueWords, links);
}

export type LemmaBatch = {
  batch_key: string;
  source_id: string;
  source_name: string;
  spacy_version: string;
  model_name: string;
  model_version: string;
  created_at: string;
};
export type LemmaCandidate = {
  id: string;
  batch_key: string;
  surface_form: string;
  proposed_target: string;
  frequency: number;
  pos_evidence: Record<string, number>;
  examples: string[];
  ambiguous: boolean;
  review_required: boolean;
  status: "pending" | "merged" | "kept";
};

export async function getLemmaBatches(): Promise<LemmaBatch[]> {
  if (!supabase) throw new Error("Cloud storage is not configured.");
  const { data, error } = await supabase.from("vocabulary_lemma_batches")
    .select("batch_key,source_id,source_name,spacy_version,model_name,model_version,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getLemmaCandidates(batchKey: string): Promise<LemmaCandidate[]> {
  if (!supabase) throw new Error("Cloud storage is not configured.");
  const { data, error } = await supabase.from("vocabulary_lemma_candidates")
    .select("id,batch_key,surface_form,proposed_target,frequency,pos_evidence,examples,ambiguous,review_required,status")
    .eq("batch_key", batchKey)
    .order("frequency", { ascending: false })
    .order("surface_form")
    .order("proposed_target");
  if (error) throw error;
  return data ?? [];
}

export async function decideLemmaCandidate(candidateId: string, decision: "kept" | "pending") {
  if (!supabase) throw new Error("Cloud storage is not configured.");
  const { error } = await supabase.rpc("review_vocabulary_lemma_candidate", {
    p_candidate_id: candidateId, p_decision: decision,
  });
  if (error) throw error;
}

export async function mergeLemmaCandidate(candidateId: string, canonical: string) {
  if (!supabase) throw new Error("Cloud storage is not configured.");
  const { error } = await supabase.rpc("merge_vocabulary_lemma_candidate", {
    p_candidate_id: candidateId, p_canonical: canonical,
  });
  if (error) throw error;
}

export type LemmaBulkMergeResult = {
  merged: number;
  conflicting_forms: number;
  failed: number;
  failed_ids: string[];
  remaining: number;
};

export async function mergeAllSafeLemmaCandidates(
  batchKey: string,
  excludeIds: string[] = [],
): Promise<LemmaBulkMergeResult> {
  if (!supabase) throw new Error("Cloud storage is not configured.");
  const { data, error } = await supabase.rpc("merge_all_safe_vocabulary_lemma_candidates", {
    p_batch_key: batchKey,
    p_limit: 200,
    p_exclude_ids: excludeIds,
  });
  if (error) throw error;
  return data as LemmaBulkMergeResult;
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
  aliases: Record<string, string> = {},
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
    (raw.draftDate !== undefined && (typeof raw.draftDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw.draftDate))) ||
    (raw.customSources !== undefined && !Array.isArray(raw.customSources))
  ) throw new Error("The cloud vocabulary data has an invalid format.");
  const validSources = (raw.customSources ?? []).map((source) => parseSource(JSON.stringify(source)));
  const snapshot = applyAliasesToCloudSnapshot(
    { ...raw, customSources: validSources } as CloudSnapshot,
    aliases,
  );
  let expanded = catalogue;
  for (const source of snapshot.customSources) {
    expanded = mergeSource(expanded, source);
  }
  expanded = applyWordAliases(expanded, aliases);
  const keys = new Set(Object.keys(expanded.words));
  for (const [word, note] of Object.entries(snapshot.notes))
    if (!keys.has(word) || typeof note !== "string" || note.length > 10000)
      throw new Error("The cloud vocabulary data has an invalid explanation.");
  for (const [word, progress] of Object.entries(snapshot.progress))
    if (
      !keys.has(word) || !progress || typeof progress !== "object" ||
      typeof progress.known !== "boolean" || typeof progress.hidden !== "boolean" ||
      (progress.hiddenOverride !== undefined && typeof progress.hiddenOverride !== "boolean") ||
      !Number.isInteger(progress.stage) || progress.stage < 0 || progress.stage > 3
    ) throw new Error("The cloud vocabulary data has invalid review progress.");
  if (
    snapshot.draft.length > keys.size ||
    new Set(snapshot.draft).size !== snapshot.draft.length ||
    snapshot.draft.some((word) => typeof word !== "string" || !keys.has(word))
  ) throw new Error("The cloud vocabulary data has an invalid daily list.");
  const restored = applyCloudSnapshot(expanded, snapshot, sharedNotes);
  return parseBackup(JSON.stringify(restored));
}
