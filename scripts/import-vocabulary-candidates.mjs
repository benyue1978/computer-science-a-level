#!/usr/bin/env node
import { chmodSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const keyPattern = /^[a-z][a-z'-]{0,59}$/;
const sourcePattern = /^[a-z0-9][a-z0-9_-]{0,79}$/;
const isObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);

export function parseCandidateReport(report) {
  if (!isObject(report) || report.format_version !== 1 || !/^[a-f0-9]{64}$/.test(report.batch_key ?? ""))
    throw new Error("Invalid candidate report header or batch key.");
  if (!isObject(report.source) || !sourcePattern.test(report.source.id ?? "") || typeof report.source.name !== "string" || !report.source.name.trim() || report.source.name.length > 200)
    throw new Error("Invalid candidate report source.");
  const { spacy, model, model_version } = report.packages ?? {};
  if (![spacy, model, model_version].every((value) => typeof value === "string" && value.length > 0 && value.length <= 200))
    throw new Error("Invalid lemmatizer package metadata.");
  for (const field of ["total_occurrences", "mapped_occurrences", "changed_occurrences", "identity_occurrences"])
    if (!Number.isSafeInteger(report[field]) || report[field] < 0) throw new Error(`Invalid ${field}.`);
  if (report.total_occurrences !== report.mapped_occurrences || report.changed_occurrences + report.identity_occurrences !== report.total_occurrences || !Array.isArray(report.candidates))
    throw new Error("Candidate report occurrence totals do not balance.");
  const seen = new Set();
  let total = 0;
  for (const candidate of report.candidates) {
    if (!isObject(candidate) || !keyPattern.test(candidate.surface ?? "") || !keyPattern.test(candidate.lemma ?? "") || candidate.surface === candidate.lemma)
      throw new Error("Invalid candidate word pair.");
    if (!Number.isSafeInteger(candidate.frequency) || candidate.frequency <= 0) throw new Error("Invalid candidate frequency.");
    if (!isObject(candidate.pos_evidence) || Object.values(candidate.pos_evidence).some((n) => !Number.isSafeInteger(n) || n < 0))
      throw new Error("Invalid candidate part-of-speech evidence.");
    if (!Array.isArray(candidate.examples) || candidate.examples.length > 2 || candidate.examples.some((example) => typeof example !== "string" || example.length > 2000))
      throw new Error("Invalid candidate examples.");
    if (typeof candidate.ambiguous !== "boolean") throw new Error("Invalid candidate ambiguity flag.");
    const pair = `${candidate.surface}\0${candidate.lemma}`;
    if (seen.has(pair)) throw new Error("Duplicate alias-target candidate.");
    seen.add(pair);
    total += candidate.frequency;
    if (!Number.isSafeInteger(total)) throw new Error("Candidate frequencies exceed the safe integer range.");
  }
  if (total !== report.changed_occurrences) throw new Error("Candidate frequencies do not match changed occurrences.");
  return report;
}

const sqlText = (value) => `'${String(value).replaceAll("'", "''")}'`;
const sqlJson = (value) => `${sqlText(JSON.stringify(value))}::jsonb`;

export function buildImportSql(report) {
  const batch = `insert into public.vocabulary_lemma_batches(batch_key,source_id,source_name,spacy_version,model_name,model_version) values (${sqlText(report.batch_key)},${sqlText(report.source.id)},${sqlText(report.source.name)},${sqlText(report.packages.spacy)},${sqlText(report.packages.model)},${sqlText(report.packages.model_version)}) on conflict (batch_key) do nothing;`;
  const candidates = report.candidates.map((row) => `(${sqlText(report.batch_key)},${sqlText(row.surface)},${sqlText(row.lemma)},${row.frequency},${sqlJson(row.pos_evidence)},${sqlJson(row.examples)},${row.ambiguous})`).join(",\n");
  return batch + (candidates ? `\ninsert into public.vocabulary_lemma_candidates(batch_key,surface_form,proposed_target,frequency,pos_evidence,examples,ambiguous) values ${candidates} on conflict (batch_key, surface_form, proposed_target) do nothing;\n` : "\n");
}

function runQuery(sql, number) {
  const path = join(tmpdir(), `vocabulary-lemma-import-${process.pid}-${number}.sql`);
  try {
    writeFileSync(path, sql, { mode: 0o600, flag: "wx" });
    chmodSync(path, 0o600);
    const result = spawnSync("supabase", ["db", "query", "--linked", "--file", path, "--output", "json"], {
      encoding: "utf8", maxBuffer: 8 * 1024 * 1024,
      env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
    });
    if (result.status !== 0) {
      console.error(`Candidate import stopped at batch ${number}. Supabase CLI exit code: ${result.status ?? "unknown"}.`);
      if (result.stderr) console.error(result.stderr.split("\n").filter((line) => !line.includes(path)).slice(-4).join("\n"));
      process.exitCode = 1;
      return false;
    }
    return true;
  } finally {
    try { unlinkSync(path); } catch {}
  }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const args = process.argv.slice(2).filter((arg) => arg !== "--dry-run");
  const dryRun = process.argv.includes("--dry-run");
  if (args.length !== 1) throw new Error("Usage: node scripts/import-vocabulary-candidates.mjs REPORT.json [--dry-run]");
  const report = parseCandidateReport(JSON.parse(readFileSync(args[0], "utf8")));
  const frequency = report.candidates.reduce((sum, row) => sum + row.frequency, 0);
  console.log(`${dryRun ? "Dry run: " : "Ready to import "}${report.candidates.length} candidates, ${frequency} occurrences from ${report.source.name} (${report.batch_key}).`);
  if (!dryRun && runQuery(buildImportSql(report), 1)) console.log("Candidate batch imported. Existing decisions and approved mappings were left unchanged.");
}
