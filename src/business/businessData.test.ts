import { describe, expect, it } from "vitest";
import { a2BusinessTerms, a2SyllabusSections, businessTerms, syllabusSections } from "./businessData";

const normalizeWords = (text: string) =>
  text.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/);

describe("Business glossary data", () => {
  it("covers all 300 source entries in the five AS units", () => {
    expect(businessTerms).toHaveLength(300);
    expect(businessTerms.filter((term) => term.unit === 1)).toHaveLength(73);
    expect(businessTerms.filter((term) => term.unit === 2)).toHaveLength(61);
    expect(businessTerms.filter((term) => term.unit === 3)).toHaveLength(72);
    expect(businessTerms.filter((term) => term.unit === 4)).toHaveLength(31);
    expect(businessTerms.filter((term) => term.unit === 5)).toHaveLength(63);
  });

  it("has a syllabus section and useful bilingual context for every entry", () => {
    const ids = businessTerms.map((term) => term.id);
    expect(new Set(ids).size).toBe(ids.length);
    const uniqueExamples = new Set(businessTerms.map((term) => term.exampleEn.trim()));
    expect(uniqueExamples.size).toBe(businessTerms.length);

    const missingTermUses: string[] = [];
    for (const term of businessTerms) {
      const exampleWords = new Set(normalizeWords(term.exampleEn));
      expect(syllabusSections[term.topicId]).toBeDefined();
      expect(term.term.trim()).not.toBe("");
      expect(term.termZh.trim()).not.toBe("");
      expect(term.definitionEn.trim()).not.toBe("");
      expect(term.explanationZh.trim()).not.toBe("");
      expect(term.exampleEn.trim()).not.toBe("");
      expect(term.exampleZh.trim()).not.toBe("");
      const bracketed = term.term.match(/\(([^)]+)\)/);
      const phrases = [term.term.replace(/\s*\([^)]*\)/g, ""), ...(bracketed ? [bracketed[1]] : [])];
      const phraseUsed = phrases.some((phrase) =>
        normalizeWords(phrase).every((word) => {
          const forms = [word];
          if (word.endsWith("ing")) forms.push(word.slice(0, -3));
          if (word.endsWith("ed")) forms.push(word.slice(0, -2));
          if (word.endsWith("s")) forms.push(word.slice(0, -1));
          else forms.push(`${word}s`, `${word}es`);
          if (word.endsWith("y")) forms.push(`${word.slice(0, -1)}ies`);
          if (word.endsWith("ancy")) forms.push(`${word.slice(0, -4)}ant`);
          if (word.endsWith("e")) forms.push(`${word}d`, `${word.slice(0, -1)}ing`);
          else forms.push(`${word}ed`, `${word}ing`);
          return forms.some((form) => exampleWords.has(form));
        }),
      );
      if (!phraseUsed) missingTermUses.push(term.term);
    }
    expect(missingTermUses, "Terms missing from their example sentences").toEqual([]);
  });

  it("covers the A2 source list while merging repeated concepts", () => {
    expect(a2BusinessTerms).toHaveLength(197);
    expect(a2BusinessTerms.filter((term) => term.unit === 6)).toHaveLength(78);
    expect(a2BusinessTerms.filter((term) => term.unit === 7)).toHaveLength(37);
    expect(a2BusinessTerms.filter((term) => term.unit === 8)).toHaveLength(19);
    expect(a2BusinessTerms.filter((term) => term.unit === 9)).toHaveLength(24);
    expect(a2BusinessTerms.filter((term) => term.unit === 10)).toHaveLength(39);
    const sourceNumbers = a2BusinessTerms.flatMap((term) => term.sourceRefs ?? []);
    expect([...new Set(sourceNumbers)].sort((first, second) => first - second)).toEqual(
      Array.from({ length: 203 }, (_, index) => index + 1),
    );

    const globalisation = a2BusinessTerms.find((term) => term.term === "Globalisation");
    expect(globalisation?.sourceRefs).toEqual([1, 99]);
    expect(globalisation?.relatedTopicIds).toContain("8.2.3");

    const outsourcing = a2BusinessTerms.find((term) => term.term === "Outsourcing");
    expect(outsourcing?.sourceRefs).toEqual([52, 112]);
    expect(outsourcing?.relatedTopicIds).toContain("9.3.1");

    for (const refs of [[2, 101], [3, 102], [4, 103], [7, 100]] as const) {
      const merged = a2BusinessTerms.find((entry) => entry.sourceRefs?.join(",") === refs.join(","));
      expect(merged?.sourceRefs).toEqual(refs);
      expect(merged?.relatedTopicIds).toContain("8.2.3");
    }

    expect(a2BusinessTerms.filter((term) => term.sourceRefs?.includes(111))).toHaveLength(2);
    expect(a2BusinessTerms.filter((term) => term.sourceRefs?.includes(157))).toHaveLength(2);
  });

  it("provides bilingual context and syllabus references for every A2 entry", () => {
    const ids = a2BusinessTerms.map((term) => term.id);
    expect(new Set(ids).size).toBe(ids.length);
    const uniqueExamples = new Set(a2BusinessTerms.map((term) => term.exampleEn.trim()));
    expect(uniqueExamples.size).toBe(a2BusinessTerms.length);

    for (const term of a2BusinessTerms) {
      expect(a2SyllabusSections[term.topicId]).toBeDefined();
      expect(a2SyllabusSections[term.topicId].unit).toBe(term.unit);
      for (const relatedTopicId of term.relatedTopicIds ?? []) {
        expect(a2SyllabusSections[relatedTopicId]).toBeDefined();
      }
      expect(term.termZh.trim()).not.toBe("");
      expect(term.definitionEn.trim()).not.toBe("");
      expect(term.explanationZh.trim()).not.toBe("");
      expect(term.exampleEn.trim()).not.toBe("");
      expect(term.exampleZh.trim()).not.toBe("");
      const exampleWords = new Set(normalizeWords(term.exampleEn));
      const bracketed = term.term.match(/\(([^)]+)\)/);
      const phrases = [term.term.replace(/\s*\([^)]*\)/g, ""), ...(bracketed ? [bracketed[1]] : [])];
      expect(phrases.some((phrase) => normalizeWords(phrase).every((word) => exampleWords.has(word)))).toBe(true);
    }
  });
});
