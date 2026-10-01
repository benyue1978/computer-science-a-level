import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { lazy, Suspense } from "react";
const DatabaseKeys = lazy(() => import("./database/DatabaseKeys"));
const Vocabulary = lazy(() => import("./vocabulary/Vocabulary"));
const VocabularyLemmaReview = lazy(() => import("./vocabulary/VocabularyLemmaReview"));
import "./styles.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<p>Opening your notebook…</p>}>
      {window.location.pathname.replace(/\/$/, "") === "/learn/database-keys" ? (
        <DatabaseKeys />
      ) : window.location.pathname.replace(/\/$/, "") === "/vocabulary/merge" ? (
        <VocabularyLemmaReview />
      ) : window.location.pathname.replace(/\/$/, "") === "/vocabulary" ? (
        <Vocabulary />
      ) : (
        <App />
      )}
    </Suspense>
  </React.StrictMode>,
);
