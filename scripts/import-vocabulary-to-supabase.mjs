import { chmodSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const input = process.argv.slice(2).find((arg) => !arg.startsWith("--")) ?? "vocabulary-backup-2026-09-30.json";
const dryRun = process.argv.includes("--dry-run");
const backup = JSON.parse(readFileSync(input, "utf8"));
const model = readFileSync("src/vocabulary/model.ts", "utf8");
const basicWords = new Set(model.match(/const basic = new Set\(\s*"([^"]+)"/)?.[1]?.split(" ") ?? []);
if (!basicWords.size) throw new Error("Could not read the initial common-word list.");

const words = Object.values(backup.words);
const explanations = words.filter((word) => word.note?.trim());
const sources = Object.entries(backup.sources);
console.log(`Ready to import ${words.length} words, ${sources.length} source, and ${explanations.length} shared explanations.`);
if (dryRun) process.exit(0);

function sqlText(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}
function sqlArray(values) {
  return `array[${values.map(sqlText).join(",")}]::text[]`;
}
function runQuery(sql, batchNumber) {
  const path = join(tmpdir(), `vocabulary-import-${process.pid}-${batchNumber}.sql`);
  try {
    writeFileSync(path, sql, { mode: 0o600, flag: "wx" });
    chmodSync(path, 0o600);
    const result = spawnSync("supabase", ["db", "query", "--linked", "--file", path, "--output", "json"], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
    if (result.status !== 0) {
      console.error(`Import stopped in batch ${batchNumber}. Supabase CLI exit code: ${result.status ?? "unknown"}.`);
      if (result.stderr) console.error(result.stderr.split("\n").filter((line) => !line.includes(path)).slice(-4).join("\n"));
      process.exit(1);
    }
  } finally {
    try { unlinkSync(path); } catch {}
  }
}

const chunkSize = 250;
let batchNumber = 0;
for (let i = 0; i < words.length; i += chunkSize) {
  const chunk = words.slice(i, i + chunkSize);
  const statements = [];
  if (i === 0) {
    statements.push(...sources.map(([id, name]) =>
      `insert into public.vocabulary_sources(id,name) values (${sqlText(id)},${sqlText(name)}) on conflict(id) do update set name=excluded.name;`));
  }
  const rows = chunk.map((word) => `(${sqlText(word.word)},${word.frequency},${sqlArray(word.forms ?? [word.word])},${sqlText(JSON.stringify(word.examples ?? []) )}::jsonb,${basicWords.has(word.word)})`).join(",\n");
  statements.push(`insert into public.vocabulary_words(word,frequency,forms,examples,initially_hidden) values ${rows} on conflict(word) do update set
    forms=(select array_agg(form order by lower(form),form) from (select distinct unnest(public.vocabulary_words.forms || excluded.forms) as form) merged_forms),
    examples=(select coalesce(jsonb_agg(item order by first_position),'[]'::jsonb) from (select value as item,min(ord) as first_position from jsonb_array_elements(public.vocabulary_words.examples || excluded.examples) with ordinality e(value,ord) group by value order by min(ord) limit 3) merged_examples),
    initially_hidden=public.vocabulary_words.initially_hidden or excluded.initially_hidden, updated_at=now();`);
  const links = chunk.flatMap((word) => Object.entries(word.sources).map(([source, frequency]) =>
    `(${sqlText(source)},${sqlText(word.word)},${frequency})`)).join(",\n");
  statements.push(`insert into public.vocabulary_source_words(source_id,word,frequency) values ${links} on conflict(source_id,word) do update set frequency=excluded.frequency;`);
  statements.push(`update public.vocabulary_words w set frequency=coalesce((select sum(sw.frequency) from public.vocabulary_source_words sw where sw.word=w.word),0),updated_at=now() where w.word in (${chunk.map((word) => sqlText(word.word)).join(",")});`);
  const notes = chunk.filter((word) => word.note?.trim());
  if (notes.length) {
    const values = notes.map((word) => `(${sqlText(word.word)},${sqlText(word.note.trim())})`).join(",\n");
    statements.push(`insert into public.shared_explanations(word,body) values ${values} on conflict(word) do nothing;`);
  }
  runQuery(statements.join("\n") + "\n", ++batchNumber);
  console.log(`Imported ${Math.min(i + chunk.length, words.length)} of ${words.length} words.`);
}
console.log("Import completed. Personal Known, review, draft, and sent-list data remains local until sign-in migration is configured.");
