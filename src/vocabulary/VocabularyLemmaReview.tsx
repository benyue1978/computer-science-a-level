import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  decideLemmaCandidate,
  getLemmaBatches,
  getLemmaCandidates,
  isVocabularyAdmin,
  mergeLemmaCandidate,
  type LemmaBatch,
  type LemmaCandidate,
} from "./cloud";
import "./vocabulary.css";

type Status = "pending" | "merged" | "kept";
export default function VocabularyLemmaReview() {
  const [ready, setReady] = useState(!supabase);
  const [signedIn, setSignedIn] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [batches, setBatches] = useState<LemmaBatch[]>([]);
  const [batchKey, setBatchKey] = useState("");
  const [candidates, setCandidates] = useState<LemmaCandidate[]>([]);
  const [status, setStatus] = useState<Status>("pending");
  const [search, setSearch] = useState("");
  const [targets, setTargets] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, { error: boolean; text: string }>>({});
  const [recentlyReviewed, setRecentlyReviewed] = useState<Set<string>>(() => new Set());
  const [error, setError] = useState("");

  async function loadBatches() {
    const rows = await getLemmaBatches();
    setBatches(rows);
    setBatchKey((current) => current && rows.some((row) => row.batch_key === current) ? current : rows[0]?.batch_key ?? "");
  }
  async function loadCandidates(key = batchKey) {
    if (!key) { setCandidates([]); return; }
    const rows = await getLemmaCandidates(key);
    setCandidates(rows);
    setTargets((previous) => Object.fromEntries(rows.map((row) => [row.id, previous[row.id] ?? row.proposed_target])));
  }

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setSignedIn(!!session?.user);
    });
    supabase.auth.getSession().then(async ({ data: result }) => {
      if (cancelled) return;
      const user = !!result.session?.user;
      setSignedIn(user);
      if (user) {
        try { setAdmin(await isVocabularyAdmin()); }
        catch { setError("Could not check administrator access. Reload to try again."); }
      }
      if (!cancelled) setReady(true);
    });
    return () => { cancelled = true; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!ready || !admin) return;
    let cancelled = false;
    (async () => {
      try {
        await loadBatches();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load review batches.");
      }
    })();
    return () => { cancelled = true; };
  }, [ready, admin]);

  useEffect(() => {
    if (!admin || !batchKey) return;
    setRecentlyReviewed(new Set());
    let cancelled = false;
    getLemmaCandidates(batchKey).then((rows) => {
      if (cancelled) return;
      setCandidates(rows);
      setTargets((previous) => Object.fromEntries(rows.map((row) => [row.id, previous[row.id] ?? row.proposed_target])));
    }).catch((e) => {
      if (!cancelled) setError(e instanceof Error ? e.message : "Could not load review candidates.");
    });
    return () => { cancelled = true; };
  }, [admin, batchKey]);

  async function decide(row: LemmaCandidate, action: "merge" | "keep") {
    setBusy(row.id);
    setError("");
    setFeedback((state) => ({ ...state, [row.id]: { error: false, text: "" } }));
    try {
      if (action === "merge") await mergeLemmaCandidate(row.id, (targets[row.id] ?? row.proposed_target).trim());
      else await decideLemmaCandidate(row.id, "kept");
      setRecentlyReviewed((previous) => new Set(previous).add(row.id));
      setFeedback((state) => ({ ...state, [row.id]: { error: false, text: action === "merge" ? `Merged into “${(targets[row.id] ?? row.proposed_target).trim()}”.` : "Kept as a separate word." } }));
      await loadCandidates();
    } catch (e) {
      setFeedback((state) => ({ ...state, [row.id]: { error: true, text: e instanceof Error ? e.message : "Could not save this decision." } }));
    } finally { setBusy(null); }
  }

  const selectedBatch = batches.find((row) => row.batch_key === batchKey);
  const visible = candidates.filter((row) =>
    (row.status === status || (status === "pending" && recentlyReviewed.has(row.id))) &&
    (!search || `${row.surface_form} ${row.proposed_target}`.includes(search.trim().toLowerCase())),
  );

  return <div className="vocab v-lemma-page">
    <header className="v-header">
      <a href="/vocabulary" className="v-brand"><span aria-hidden="true">w.</span> WORD BY WORD</a>
      <span className="v-private">Word form review</span>
      <a href="/">Home</a>
    </header>
    <main className="v-lemma-main">
      <a className="v-lemma-back" href="/vocabulary">← Back to vocabulary</a>
      <p className="v-lemma-eyebrow">ADMIN REVIEW</p>
      <h1>Word forms</h1>
      <p className="v-lemma-intro">Review suggested word forms. Merge only when the words belong together; otherwise keep them separate.</p>
      {!ready ? <p role="status">Checking access…</p> : !signedIn ? <p role="status">Sign in to review vocabulary word forms. <a href="/vocabulary">Open vocabulary sign-in</a>.</p> : !admin ? <p role="status">This page is available to vocabulary administrators.</p> : <>
        {error && <p className="v-lemma-error" role="alert">{error}</p>}
        <div className="v-lemma-controls">
          <label>Source batch<select value={batchKey} onChange={(e) => setBatchKey(e.target.value)}>
            {batches.length === 0 && <option value="">No review batches yet</option>}
            {batches.map((batch) => <option value={batch.batch_key} key={batch.batch_key}>{batch.source_name} · {new Date(batch.created_at).toLocaleDateString()}</option>)}
          </select></label>
          <label>Show<select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            <option value="pending">Needs review</option><option value="merged">Merged</option><option value="kept">Kept separate</option>
          </select></label>
          <label className="v-lemma-search">Search<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Word or target" /></label>
        </div>
        {selectedBatch && <p className="v-lemma-meta">{selectedBatch.source_name} · {selectedBatch.model_name} {selectedBatch.model_version} · {visible.length} shown</p>}
        {batches.length === 0 ? <p>No candidate batches have been imported.</p> : visible.length === 0 ? <p>No {status === "pending" ? "unreviewed" : status} candidates match.</p> : <div className="v-lemma-list">
          {visible.map((row) => <article className="v-lemma-card" key={row.id}>
            <div className="v-lemma-card-top"><div><span className="v-lemma-label">WORD FORM</span><h2>{row.surface_form}</h2></div><div className="v-lemma-proposal"><span className="v-lemma-label">SUGGESTED WORD</span><strong>{row.proposed_target}</strong></div>{row.status !== "pending" && <span className="v-lemma-state">{row.status === "merged" ? "Merged" : "Kept separate"}</span>}<span className="v-lemma-frequency">{row.frequency.toLocaleString()}×</span></div>
            <p className="v-lemma-evidence">{Object.entries(row.pos_evidence).map(([part, count]) => `${part} ${count}`).join(" · ") || "No part-of-speech detail"}{row.ambiguous ? " · May have more than one meaning" : ""}</p>
            {row.examples.length > 0 && <ul className="v-lemma-examples">{row.examples.map((example, index) => <li key={index}>{example}</li>)}</ul>}
            {row.status === "pending" && <div className="v-lemma-actions"><label>Merge into<input value={targets[row.id] ?? row.proposed_target} onChange={(e) => setTargets((state) => ({ ...state, [row.id]: e.target.value }))} /></label><button disabled={busy === row.id} onClick={() => decide(row, "merge")}>{busy === row.id ? "Saving…" : "Merge"}</button><button className="v-lemma-keep" disabled={busy === row.id} onClick={() => decide(row, "keep")}>Keep separate</button></div>}
            {feedback[row.id]?.text && <p className={feedback[row.id].error ? "v-lemma-error" : "v-lemma-feedback"} role={feedback[row.id].error ? "alert" : "status"}>{feedback[row.id].text}</p>}
          </article>)}
        </div>}
      </>}
    </main>
  </div>;
}
