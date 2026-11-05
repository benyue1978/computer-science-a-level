import { describe, expect, it } from "vitest";
import { businessTerms, syllabusSections } from "./businessData";

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
});
