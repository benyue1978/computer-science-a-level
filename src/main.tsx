import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { lazy, Suspense } from "react";
const Vocabulary = lazy(() => import("./vocabulary/Vocabulary"));
import "./styles.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<p>Opening your notebook…</p>}>
      {window.location.pathname.replace(/\/$/, "") === "/vocabulary" ? (
        <Vocabulary />
      ) : (
        <App />
      )}
    </Suspense>
  </React.StrictMode>,
);
