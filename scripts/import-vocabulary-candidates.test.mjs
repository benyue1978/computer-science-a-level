import test from "node:test";
import assert from "node:assert/strict";
import { parseCandidateReport, buildImportSql } from "./import-vocabulary-candidates.mjs";

const sample = {
  format_version: 1,
  batch_key: "a".repeat(64),
  source: { id: "cambridge-computer-science-2", name: "Cambridge CS" },
  packages: { spacy: "3.8.16", model: "en_core_web_sm", model_version: "3.8.0" },
  total_occurrences: 5,
  mapped_occurrences: 5,
  changed_occurrences: 3,
  identity_occurrences: 2,
  candidates: [{ surface: "started", lemma: "start", frequency: 3, pos_evidence: { VERB: 3 }, examples: ["It started."], ambiguous: false, review: false }],
};

test("accepts a complete candidate report and builds idempotent SQL", () => {
  const report = parseCandidateReport(sample);
  const sql = buildImportSql(report);
  assert.match(sql, /on conflict \(batch_key\) do nothing/i);
  assert.match(sql, /on conflict \(batch_key, surface_form, proposed_target\) do nothing/i);
  assert.match(sql, /examples,ambiguous,review_required/);
  assert.match(sql, /started/);
});

test("rejects invalid source ids, model metadata, frequency, examples and duplicate mappings", () => {
  for (const change of [
    (r) => { r.source.id = "../bad"; },
    (r) => { r.packages.model_version = ""; },
    (r) => { r.candidates[0].frequency = 0; },
    (r) => { r.candidates[0].examples = ["x".repeat(2001)]; },
    (r) => { delete r.candidates[0].review; },
    (r) => { r.candidates.push(structuredClone(r.candidates[0])); },
  ]) {
    const invalid = structuredClone(sample);
    change(invalid);
    assert.throws(() => parseCandidateReport(invalid));
  }
});

test("dry-run summary contains no executable SQL side effect", () => {
  const report = parseCandidateReport(sample);
  assert.deepEqual({ source: report.source.id, candidates: report.candidates.length, frequency: report.candidates.reduce((sum, row) => sum + row.frequency, 0) }, {
    source: "cambridge-computer-science-2", candidates: 1, frequency: 3,
  });
});
