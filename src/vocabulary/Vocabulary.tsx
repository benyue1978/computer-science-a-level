import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { User } from "@supabase/supabase-js";
import {
  emptyState,
  feedback,
  listText,
  mergeSource,
  parseBackup,
  parseSource,
  sendDraft,
  sentToday,
  suggestions,
  today,
  type Source,
  type State,
  type Word,
  type SentList,
} from "./model";
import { loadState, saveState } from "./storage";
import {
  addSharedDefaults,
  getSharedExplanations,
  isVocabularyAdmin,
  loadAccountSnapshot,
  publishSharedExplanation,
  restoreAccountState,
  saveAccountSnapshot,
} from "./cloud";
import { usePublishedExplanation } from "./cloudState";
import { supabase } from "./supabaseClient";
import "./vocabulary.css";

type View = "today" | "words" | "known" | "history" | "data";
export default function Vocabulary() {
  const [state, setState] = useState<State>();
  const [view, setView] = useState<View>("today");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sendFeedback, setSendFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [publishFeedback, setPublishFeedback] = useState<{
    word: string;
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(0);
  const [day, setDay] = useState(today());
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [pending, setPending] = useState<{ backup?: State; source?: Source }>();
  const [copyFallback, setCopyFallback] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [vocabularyAdmin, setVocabularyAdmin] = useState(false);
  const [publishingWord, setPublishingWord] = useState<string | null>(null);
  const [loadedOwner, setLoadedOwner] = useState<string | null>(null);
  const [cloudOwner, setCloudOwner] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const queue = useRef(Promise.resolve());
  const revision = useRef(0);
  const cloudTimer = useRef<number | undefined>(undefined);
  const sharedNotesRef = useRef<Record<string, string>>({});
  const owner = user?.id ?? "guest";
  useEffect(() => {
    document.title = "Word by word · Daily vocabulary";
    if (!supabase) {
      setAuthReady(true);
      return;
    }
    let cancelled = false;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: result, error: sessionError }) => {
      if (cancelled) return;
      if (sessionError) setError("Could not read your sign-in session.");
      setUser(result.session?.user ?? null);
      setAuthReady(true);
    });
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    setVocabularyAdmin(false);
    if (!user || !supabase) return;
    isVocabularyAdmin()
      .then((isAdmin) => {
        if (!cancelled) setVocabularyAdmin(isAdmin);
      })
      .catch(() => {
        if (!cancelled)
          setError("Could not check administrator access. Personal explanations are still available.");
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);
  useEffect(() => {
    document.title = "Word by word · Daily vocabulary";
    if (!authReady) return;
    let cancelled = false;
    (async () => {
      try {
        const activeOwner = user?.id ?? "guest";
        setState(undefined);
        setLoadedOwner(null);
        setCloudOwner(null);
        setError("");
        const [guestState, accountCache, sharedNotes] = await Promise.all([
          loadState("guest"),
          user ? loadState(user.id) : Promise.resolve(undefined),
          getSharedExplanations().catch(() => ({})),
        ]);
        sharedNotesRef.current = sharedNotes;
        const catalogue = async () => {
          const response = await fetch("/vocabulary/coursebook.json");
          if (!response.ok)
            throw new Error(
              "Could not load the initial word collection. Please reload to try again.",
            );
          return mergeSource(emptyState(), parseSource(await response.text()));
        };
        let value: State;
        if (user && supabase) {
          const payload = await loadAccountSnapshot(user.id);
          if (payload === undefined) {
            value = addSharedDefaults(
              accountCache ?? guestState ?? (await catalogue()),
              sharedNotes,
            );
            await saveAccountSnapshot(user.id, value, sharedNotesRef.current);
          } else {
            value = restoreAccountState(await catalogue(), payload, sharedNotes);
          }
          await saveState(value, user.id);
          if (!cancelled) setCloudOwner(user.id);
        } else {
          value = addSharedDefaults(guestState ?? (await catalogue()), sharedNotes);
          await saveState(value, "guest");
        }
        if (!cancelled) {
          setState(value);
          setLoadedOwner(activeOwner);
          setSaved(true);
        }
      } catch (e) {
        const activeOwner = user?.id ?? "guest";
        const local = await loadState(activeOwner).catch(() => undefined);
        const fallback = local ?? (activeOwner !== "guest" ? await loadState("guest") : undefined);
        if (!cancelled && fallback) {
          setState(fallback);
          setLoadedOwner(activeOwner);
          setCloudOwner(null);
          setSaved(true);
          setError(
            activeOwner === "guest"
              ? `Unable to open your collection. ${e instanceof Error ? e.message : "Browser storage is unavailable."}`
              : "Could not load your cloud data. Your local copy is open; cloud changes are paused until you reload and retry.",
          );
        } else if (!cancelled) {
          setError(
            `Unable to open your collection. ${e instanceof Error ? e.message : "Browser storage is unavailable."}`,
          );
        }
      }
    })();
    const timer = window.setInterval(() => setDay(today()), 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [authReady, user?.id]);
  useEffect(() => {
    if (!state || loadedOwner !== owner) return;
    setSaved(false);
    const id = ++revision.current;
    const storageOwner = owner;
    queue.current = queue.current
      .catch(() => {})
      .then(() => saveState(state, storageOwner))
      .then(() => {
        if (id !== revision.current) return;
        if (storageOwner === "guest" || cloudOwner !== storageOwner) {
          setSaved(true);
          return;
        }
        window.clearTimeout(cloudTimer.current);
        cloudTimer.current = window.setTimeout(() => {
          saveAccountSnapshot(storageOwner, state, sharedNotesRef.current)
            .then(() => {
              if (id === revision.current) setSaved(true);
            })
            .catch(() => {
              if (id !== revision.current) return;
              setSaved(true);
              setError("Saved on this device, but cloud sync failed. Check your connection and reload to retry.");
            });
        }, 650);
      })
      .catch(() => {
        setError(
          "Your latest changes could not be saved. Export a backup now before closing this page.",
        );
      });
    return () => window.clearTimeout(cloudTimer.current);
  }, [state, owner, loadedOwner, cloudOwner]);
  useEffect(() => {
    setPage(0);
  }, [search, filter, source, view]);
  useEffect(() => {
    const protect = (e: BeforeUnloadEvent) => {
      if (state && !saved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [state, saved]);
  const update = (fn: (s: State) => State) => {
    setMessage("");
    setSaved(false);
    setState((s) => (s ? fn(s) : s));
  };
  async function publishExplanation(word: string, body: string) {
    if (!user || !vocabularyAdmin || !body.trim()) return;
    setPublishingWord(word);
    setPublishFeedback(null);
    try {
      const sharedBody = body.trim();
      await publishSharedExplanation(word, sharedBody, user.id);
      sharedNotesRef.current = { ...sharedNotesRef.current, [word]: sharedBody };
      update((current) => usePublishedExplanation(current, word, sharedBody));
      setPublishFeedback({ word, tone: "success", text: "Published for everyone." });
    } catch (e) {
      setPublishFeedback({
        word,
        tone: "error",
        text: e instanceof Error
          ? `Could not publish this explanation. ${e.message}`
          : "Could not publish this explanation. Check your connection and try again.",
      });
    } finally {
      setPublishingWord(null);
    }
  }
  async function signInWithGoogle() {
    if (!supabase) return;
    setAuthBusy(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/vocabulary` },
    });
    if (signInError) {
      setAuthBusy(false);
      setError(`Google sign-in could not start. ${signInError.message}`);
    }
  }
  async function signOut() {
    if (!supabase) return;
    setAuthBusy(true);
    const { error: signOutError } = await supabase.auth.signOut();
    setAuthBusy(false);
    if (signOutError) setError(`Could not sign out. ${signOutError.message}`);
  }
  function toggle(w: Word) {
    if (!state) return;
    if (state.draft.includes(w.word))
      update((s) => ({ ...s, draft: s.draft.filter((k) => k !== w.word) }));
    else if (
      state.draft.length + sentToday(state, day) < state.limit &&
      w.lastSent !== day
    )
      update((s) => ({ ...s, draft: [...s.draft, w.word] }));
    else
      setMessage(
        w.lastSent === day
          ? "This word was already sent today."
          : "Your list is full. Remove a word or increase the daily total.",
      );
  }
  function toggleKnown(w: Word) {
    const nextKnown = !w.known && !w.hidden;
    update((s) => ({
      ...s,
      draft: s.draft.filter((k) => k !== w.word),
      words: {
        ...s.words,
        [w.word]: {
          ...s.words[w.word],
          hidden: nextKnown,
          known: nextKnown,
        },
      },
    }));
    setMessage(
      w.known
        ? `“${w.word}” returned to your active words.`
        : w.hidden
          ? `“${w.word}” restored to your active words.`
          : `“${w.word}” added to your Known list.`,
    );
  }
  async function copy(list: SentList) {
    const text = listText(list);
    setSendFeedback(null);
    setCopyFallback("");
    try {
      await navigator.clipboard.writeText(text);
      setSendFeedback({
        tone: "success",
        text: "List copied. Paste it into your notebook or message.",
      });
    } catch {
      setCopyFallback(text);
      setSendFeedback({ tone: "error", text: "Select and copy the text below." });
    }
  }
  function download() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vocabulary-backup-${day}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Backup downloaded. Keep it somewhere safe.");
  }
  async function importFile(
    event: ChangeEvent<HTMLInputElement>,
    kind: "backup" | "source",
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 40 * 1024 * 1024)
        throw new Error("Please use a file smaller than 40 MB.");
      const raw = await file.text();
      setPending(
        kind === "backup"
          ? { backup: parseBackup(raw) }
          : { source: parseSource(raw) },
      );
      setError("");
    } catch (e) {
      setError(
        e instanceof SyntaxError
          ? "This is not a readable JSON file. Your collection has not changed."
          : e instanceof Error
            ? e.message
            : "Could not import this file.",
      );
    }
  }
  const shell = (content: React.ReactNode) => (
    <div className="vocab">
      <header className="v-header">
        <a href="/" className="v-brand">
          <span aria-hidden="true">w.</span> WORD BY WORD
        </a>
        <span className="v-private">A little, every day.</span>
        <div className="v-auth">
          {user ? (
            <>
              <span title={user.email ?? "Signed in"}>
                {user.email ?? "Signed in"}
              </span>
              {vocabularyAdmin && <span className="v-admin-label">Vocabulary admin</span>}
              <button disabled={authBusy} onClick={signOut}>
                {authBusy ? "Signing out…" : "Sign out"}
              </button>
            </>
          ) : supabase ? (
            <button disabled={authBusy || !authReady} onClick={signInWithGoogle}>
              {authBusy ? "Opening Google…" : "Sign in with Google · Sync"}
            </button>
          ) : (
            <span>Guest · Saved on this device</span>
          )}
        </div>
      </header>
      {content}
    </div>
  );
  if (!state)
    return shell(
      <main className="v-loading">
        <h1>Your words, gathered.</h1>
        <p role={error ? "alert" : "status"}>
          {error || "Opening your vocabulary collection…"}
        </p>
        {error && <button onClick={() => location.reload()}>Try again</button>}
      </main>,
    );
  const words = Object.values(state.words);
  const alreadySent = sentToday(state, day);
  const dueCount = words.filter(
    (w) => !w.hidden && w.due && w.due <= day && w.lastSent !== day,
  ).length;
  const selected = state.draft.map((k) => state.words[k]);
  const dailyList = {
    date: day,
    entries: selected.map((w) => ({
      word: w.word,
      example: w.examples[0] ?? "",
      note: w.note,
    })),
  };
  const candidates = suggestions(state, day).filter(
    (w) =>
      !state.draft.includes(w.word) &&
      (!source || w.sources[source]) &&
      (!search ||
        [w.word, ...(w.forms ?? [])].some((f) =>
          f.includes(search.toLowerCase().trim()),
        )),
  );
  const filtered = words
    .filter(
      (w) =>
        (!source || w.sources[source]) &&
        (!search ||
          [w.word, ...(w.forms ?? [])].some((f) =>
            f.includes(search.toLowerCase().trim()),
          )) &&
        (view === "known"
          ? w.known
          : filter === "all" ||
            (filter === "hidden"
              ? w.hidden && !w.known
              : filter === "due"
                ? !w.hidden && w.due && w.due <= day
                : !w.hidden)),
    )
    .sort((a, b) => b.frequency - a.frequency || a.word.localeCompare(b.word));
  const pageCount = Math.max(1, Math.ceil(filtered.length / 40));
  const currentPage = Math.min(page, pageCount - 1);
  const reviewButtons = (w: Word) =>
    w.lastSent &&
    !w.hidden && (
      <div className="v-review">
        <span>Recall:</span>
        <button
          onClick={() => {
            update((s) => feedback(s, w.word, "remembered", day));
            setMessage(
              `“${w.word}” remembered. Its next review has moved forward.`,
            );
          }}
        >
          Remembered
        </button>
        <button
          onClick={() => {
            update((s) => feedback(s, w.word, "practice", day));
            setMessage(`“${w.word}” will return tomorrow.`);
          }}
        >
          Needs practice
        </button>
      </div>
    );
  const card = (w: Word) => (
    <article className="v-word" key={w.word}>
      <div className="v-word-top">
        <div>
          <span className={`v-tag ${w.due ? "review" : ""}`}>
            {w.known
              ? "Known"
              : w.hidden
                ? "Hidden"
                : w.lastSent === day
                  ? "Sent today"
                  : w.due
                    ? w.due <= day
                      ? "Due for review"
                      : `Review ${w.due}`
                    : "New word"}
          </span>
          <h3>{w.word}</h3>
        </div>
        <span className="v-frequency">
          {w.frequency.toLocaleString()}
          <small>occurrences</small>
        </span>
      </div>
      {w.examples[0] ? (
        <p className="v-example">{w.examples[0]}</p>
      ) : (
        <p className="v-example v-muted">
          No clean sentence available from this source.
        </p>
      )}
      {!!w.forms && w.forms.length > 1 && (
        <p className="v-forms">Includes {w.forms.join(", ")}</p>
      )}
      <div className="v-word-actions">
        <button
          className={state.draft.includes(w.word) ? "v-selected" : "v-add"}
          disabled={
            w.hidden ||
            w.lastSent === day ||
            (!state.draft.includes(w.word) &&
              state.draft.length + alreadySent >= state.limit)
          }
          onClick={() => toggle(w)}
        >
          {state.draft.includes(w.word) ? "✓ Selected" : "+ Add to today"}
        </button>
        <button className="v-text-button" onClick={() => toggleKnown(w)}>
          {w.known
            ? "Move back to active words"
            : w.hidden
              ? "Restore word"
              : "Already known / trivial"}
        </button>
      </div>
      {(view === "words" || view === "known") && (
        <div className="v-library-note">
          {w.note && editingNote !== w.word && (
            <p className="v-note-preview">{w.note}</p>
          )}
          <button
            className="v-note-toggle"
            aria-expanded={editingNote === w.word}
            aria-controls={`word-note-${w.word}`}
            onClick={() =>
              setEditingNote(editingNote === w.word ? null : w.word)
            }
          >
            {editingNote === w.word
              ? "Close explanation"
              : w.note
                ? "Edit explanation"
                : "Add explanation"}
          </button>
          {editingNote === w.word && (
            <div className="v-library-note-editor" id={`word-note-${w.word}`}>
              <label>
                <span>
                  Your explanation <small>optional · 中文 / English</small>
                </span>
                <textarea
                  aria-label={`Explanation for ${w.word}`}
                  maxLength={10000}
                  placeholder="What does this word mean to you?"
                  value={w.note}
                  onChange={(e) => {
                    const note = e.target.value;
                    update((s) => ({
                      ...s,
                      words: {
                        ...s.words,
                        [w.word]: { ...s.words[w.word], note },
                      },
                    }));
                  }}
                />
              </label>
              <small>Saved with this word · shown in your daily list</small>
              {user && vocabularyAdmin && (
                <button
                  className="v-publish-button"
                  disabled={!w.note.trim() || publishingWord === w.word}
                  onClick={() => void publishExplanation(w.word, w.note)}
                >
                  {publishingWord === w.word ? "Publishing…" : "Publish for everyone"}
                </button>
              )}
              {publishFeedback?.word === w.word && (
                <p
                  className={`v-action-feedback ${publishFeedback.tone}`}
                  role={publishFeedback.tone === "error" ? "alert" : "status"}
                >
                  {publishFeedback.text}
                </p>
              )}
            </div>
          )}
        </div>
      )}
      {reviewButtons(w)}
    </article>
  );
  return shell(
    <>
      <main className="v-main">
        <section className="v-intro">
          <div>
            <p className="v-eyebrow">YOUR DAILY VOCABULARY NOTEBOOK</p>
            <h1>
              A few words.
              <br />
              <em>A wider world.</em>
            </h1>
            <p>Choose a little. Explain it your way. Come back to it.</p>
          </div>
          <div className="v-tally">
            <strong>{words.length.toLocaleString()}</strong>
            <span>words to make your own</span>
            <small>
              {Object.keys(state.sources).length} book
              {Object.keys(state.sources).length === 1 ? "" : "s"} · {dueCount}{" "}
              due for review
            </small>
          </div>
        </section>
        <nav className="v-nav" aria-label="Vocabulary sections">
          {(
            [
              ["today", "Today"],
              ["words", "All words"],
              ["known", "Known list"],
              ["history", "Sent lists"],
              ["data", "Books & backup"],
            ] as const
          ).map(([id, title]) => (
            <button
              key={id}
              aria-current={view === id ? "page" : undefined}
              onClick={() => {
                setView(id);
                setEditingNote(null);
                setSearch("");
              }}
            >
              {title}
              {id === "today" && <span>{state.draft.length}</span>}
              {id === "known" && (
                <span>{words.filter((w) => w.known).length}</span>
              )}
            </button>
          ))}
          <span className="v-save" role="status">
            {saved
              ? user && cloudOwner === user.id
                ? "● Saved to your account"
                : "● Saved on this device"
              : "Saving…"}
          </span>
        </nav>
        {error && (
          <div className="v-alert" role="alert">
            {error}
            <button onClick={() => setError("")}>Dismiss</button>
          </div>
        )}
        {message && (
          <p className="v-notice" role="status">
            {message}
          </p>
        )}
        {(view === "today" || view === "words" || view === "known") && (
          <div className="v-workspace">
            <section className="v-discover">
              <div className="v-section-heading">
                <div>
                  <p className="v-eyebrow">
                    {view === "today"
                      ? "A PLACE TO BEGIN"
                      : view === "known"
                        ? "WORDS YOU ALREADY KNOW"
                        : "THE WHOLE COLLECTION"}
                  </p>
                  <h2>
                    {view === "today"
                      ? "Suggested for you"
                      : view === "known"
                        ? "Your Known list"
                        : "All your words"}
                  </h2>
                </div>
                <span className="v-muted">
                  {view === "today"
                    ? "Reviews first, then frequent words"
                    : `${filtered.length.toLocaleString()} words`}
                </span>
              </div>
              <div className="v-filters">
                <label className="v-search">
                  <span className="v-sr">Search words</span>
                  <input
                    placeholder="Find a word…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <label>
                  <span className="v-sr">Book</span>
                  <select
                    aria-label="Book"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  >
                    <option value="">All books</option>
                    {Object.entries(state.sources).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                {view === "words" && (
                  <select
                    aria-label="Word status"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="active">Active words</option>
                    <option value="due">Due for review</option>
                    <option value="hidden">Hidden</option>
                    <option value="all">Everything</option>
                  </select>
                )}
              </div>
              {view === "today" && (
                <p className="v-helper">
                  Pick the words that feel useful. Mark easy ones as already
                  known.
                </p>
              )}
              <div className="v-cards">
                {(view === "today"
                  ? candidates.slice(0, 12)
                  : filtered.slice(currentPage * 40, (currentPage + 1) * 40)
                ).map(card)}
              </div>
              {(view === "today"
                ? candidates.length === 0
                : filtered.length === 0) && (
                <div className="v-empty">
                  <h3>
                    {search || source
                      ? "No matching words"
                      : view === "known"
                        ? "Your Known list is empty"
                        : "All caught up"}
                  </h3>
                  <p>
                    {search || source
                      ? "Try another search or book."
                      : view === "known"
                        ? "Mark a word “Already known / trivial” to add it here."
                        : "Browse All words to choose something else, or come back when a review is due."}
                  </p>
                </div>
              )}
              {view !== "today" && (
                <div className="v-pagination">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage + 1} of {pageCount}
                  </span>
                  <button
                    disabled={currentPage + 1 >= pageCount}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
            <aside className="v-notebook" aria-label="Today's list">
              <div className="v-notebook-head">
                <p className="v-eyebrow">
                  {new Date(`${day}T12:00:00`).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })}
                </p>
                <h2>Today’s little list</h2>
                <div className="v-quota">
                  <span>
                    {state.draft.length} of {state.limit} chosen
                  </span>
                  <label>
                    Daily total{" "}
                    <select
                      value={state.limit}
                      onChange={(e) =>
                        update((s) => ({ ...s, limit: Number(e.target.value) }))
                      }
                    >
                      {[5, 6, 7, 8, 9, 10].map((n) => (
                        <option
                          value={n}
                          key={n}
                          disabled={n < state.draft.length + alreadySent}
                        >
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <p className="v-helper">
                  {alreadySent} sent today ·{" "}
                  {Math.max(0, state.limit - alreadySent - state.draft.length)}{" "}
                  places left
                </p>
                <div className="v-progress" aria-hidden="true">
                  {Array.from({ length: state.limit }, (_, i) => (
                    <span
                      className={
                        i < state.draft.length + alreadySent ? "filled" : ""
                      }
                      key={i}
                    />
                  ))}
                </div>
              </div>
              {!selected.length && (
                <div className="v-blank">
                  <span aria-hidden="true">Aa</span>
                  <h3>
                    {alreadySent >= state.limit
                      ? "Today’s words are on their way."
                      : "A fresh page, every day."}
                  </h3>
                  <p>
                    {alreadySent >= state.limit
                      ? "You’ve reached today’s total. Come back tomorrow, or increase the total up to ten."
                      : "Add a word from the collection, then explain it your way."}
                  </p>
                </div>
              )}
              {selected.map((w, i) => (
                <section className="v-picked" key={w.word}>
                  <div>
                    <span className="v-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3>{w.word}</h3>
                    <button
                      aria-label={`Remove ${w.word}`}
                      onClick={() => toggle(w)}
                    >
                      ×
                    </button>
                  </div>
                  {w.examples[0] && (
                    <p className="v-example">{w.examples[0]}</p>
                  )}
                  <label>
                    <span>
                      Your explanation <small>optional · 中文 / English</small>
                    </span>
                    <textarea
                      aria-label={`Explanation for ${w.word}`}
                      maxLength={10000}
                      placeholder="What does this word mean to you?"
                      value={w.note}
                      onChange={(e) => {
                        const note = e.target.value;
                        update((s) => ({
                          ...s,
                          words: {
                            ...s.words,
                            [w.word]: { ...s.words[w.word], note },
                          },
                        }));
                      }}
                    />
                  </label>
                  {user && vocabularyAdmin && (
                    <button
                      className="v-publish-button"
                      disabled={!w.note.trim() || publishingWord === w.word}
                      onClick={() => void publishExplanation(w.word, w.note)}
                    >
                      {publishingWord === w.word ? "Publishing…" : "Publish for everyone"}
                    </button>
                  )}
                  {publishFeedback?.word === w.word && (
                    <p
                      className={`v-action-feedback ${publishFeedback.tone}`}
                      role={publishFeedback.tone === "error" ? "alert" : "status"}
                    >
                      {publishFeedback.text}
                    </p>
                  )}
                  {w.due && (
                    <p className="v-helper">
                      Review word ·{" "}
                      {w.note
                        ? "Your saved explanation is above."
                        : "Add a note to keep for next time."}
                    </p>
                  )}
                </section>
              ))}
              <div className="v-send">
                <button
                  className="v-primary"
                  disabled={!selected.length}
                  onClick={() => copy(dailyList)}
                >
                  Copy today’s list <span aria-hidden="true">↗</span>
                </button>
                <button
                  className="v-send-button"
                  disabled={!selected.length || !saved}
                  onClick={() => {
                    setSendFeedback(null);
                    try {
                      const next = sendDraft(state, day);
                      update(() => next);
                      setSendFeedback({
                        tone: "success",
                        text: "Marked as sent. Your list is in Sent lists, and review dates are scheduled.",
                      });
                    } catch (e) {
                      setSendFeedback({ tone: "error", text: (e as Error).message });
                    }
                  }}
                >
                  Mark as sent
                </button>
                {sendFeedback && (
                  <p
                    className={`v-action-feedback ${sendFeedback.tone}`}
                    role={sendFeedback.tone === "error" ? "alert" : "status"}
                  >
                    {sendFeedback.text}
                  </p>
                )}
                {copyFallback && (
                  <div className="v-copy-fallback">
                    <label>
                      Copy this list
                      <textarea
                        readOnly
                        value={copyFallback}
                        onFocus={(e) => e.target.select()}
                        rows={12}
                      />
                    </label>
                    <button onClick={() => setCopyFallback("")}>Close</button>
                  </div>
                )}
                <p>
                  Copy, send it to the student, then mark it sent.
                  <br />
                  Review dates start only when you do.
                </p>
              </div>
            </aside>
          </div>
        )}
        {view === "history" && (
          <section className="v-history">
            <p className="v-eyebrow">LITTLE STEPS, KEPT</p>
            <h2>Your sent lists</h2>
            <p className="v-muted">
              Saved as they were sent. Record recall here or in All words.
            </p>
            {!state.history.length && (
              <div className="v-empty">
                Your first list will appear here after you mark it as sent.
              </div>
            )}
            {state.history.map((list, i) => (
              <article className="v-history-list" key={`${list.date}-${i}`}>
                <div className="v-section-heading">
                  <h3>
                    {list.date} <small>· {list.entries.length} words</small>
                  </h3>
                  <button onClick={() => copy(list)}>Copy list</button>
                </div>
                {list.entries.map((e) => (
                  <section key={e.word}>
                    <h4>{e.word}</h4>
                    {e.example && <p className="v-example">{e.example}</p>}
                    {e.note && <p className="v-note-text">{e.note}</p>}
                    <p className="v-helper">
                      {state.words[e.word].hidden
                        ? "Hidden from suggestions"
                        : `Next review: ${state.words[e.word].due ?? "Not scheduled"}`}
                    </p>
                    {reviewButtons(state.words[e.word])}
                  </section>
                ))}
              </article>
            ))}
          </section>
        )}
        {view === "data" && (
          <section className="v-data">
            <div>
              <p className="v-eyebrow">ROOM TO GROW</p>
              <h2>Your books & your words</h2>
              <p>
                {user && cloudOwner === user.id
                  ? "Your account keeps your explanations, selection and review history across devices. Export a backup as an extra copy whenever you like."
                  : "Without signing in, notes and progress live only in this browser at this website address. Export a backup before clearing browser data or changing devices."}
              </p>
            </div>
            <div className="v-data-grid">
              <article>
                <h3>Keep a copy</h3>
                <p>
                  A backup includes every word, your explanations, learning
                  progress and sent lists.
                </p>
                <button className="v-primary" onClick={download}>
                  Export backup ↓
                </button>
                <label className="v-file">
                  Restore a backup
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) => importFile(e, "backup")}
                  />
                </label>
                <small>
                  Restoring replaces this browser’s collection. You can review
                  the file before applying it.
                </small>
              </article>
              <article>
                <h3>Add another book</h3>
                <p>
                  Import a prepared vocabulary JSON file. Matching words merge;
                  your notes and progress stay with them.
                </p>
                <label className="v-file">
                  Import word list
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) => importFile(e, "source")}
                  />
                </label>
                <small>
                  Use the extraction script supplied with this project to
                  prepare a PDF. PDF upload is not part of this version.
                </small>
                <ul>
                  {Object.entries(state.sources).map(([id, name]) => (
                    <li key={id}>{name}</li>
                  ))}
                </ul>
                <details>
                  <summary>Word-list file format</summary>
                  <pre>
                    {JSON.stringify(
                      {
                        id: "my-book",
                        name: "My book",
                        words: [
                          {
                            word: "available",
                            frequency: 12,
                            examples: [
                              "The information is available in several different formats.",
                            ],
                          },
                        ],
                      },
                      null,
                      2,
                    )}
                  </pre>
                </details>
              </article>
            </div>
            {pending && (
              <div
                className="v-import-preview"
                role="region"
                aria-label="Import preview"
              >
                <h3>
                  {pending.backup
                    ? "Restore this backup?"
                    : "Add this word collection?"}
                </h3>
                <p>
                  {pending.backup
                    ? `${Object.keys(pending.backup.words).length.toLocaleString()} words and ${pending.backup.history.length} sent lists. This will replace your current collection. Export a backup first if you want to keep it.`
                    : `${pending.source!.name}: ${pending.source!.words.length.toLocaleString()} words. Existing explanations and review dates will be preserved.`}
                </p>
                <button
                  className="v-primary"
                  onClick={() => {
                    try {
                      const imported =
                        pending.backup ?? mergeSource(state, pending.source!);
                      update(() => imported);
                      setPending(undefined);
                      setMessage("Import complete.");
                    } catch (e) {
                      setError(
                        e instanceof Error
                          ? e.message
                          : "Could not merge this collection.",
                      );
                    }
                  }}
                >
                  {" "}
                  {pending.backup
                    ? "Replace with this backup"
                    : "Merge word list"}
                </button>
                <button onClick={() => setPending(undefined)}>Cancel</button>
              </div>
            )}
          </section>
        )}
      </main>
      <footer className="v-footer">
        <span>Word by word. Day by day.</span>
        <span>
          {user && cloudOwner === user.id
            ? "Private account sync · "
            : "Private notes · Guest mode · "}
          <button onClick={() => setView("data")}>Back up your words</button>
        </span>
      </footer>
    </>,
  );
}
