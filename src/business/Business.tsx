import { useEffect, useMemo, useState } from "react";
import {
  a2BusinessTerms,
  a2BusinessUnits,
  a2SyllabusSections,
  businessTerms,
  businessUnits,
  syllabusSections,
} from "./businessData";
import type { BusinessTerm, BusinessUnit, SyllabusSection } from "./businessTypes";
import "./business.css";

type BusinessLevel = "AS" | "A2";
type PrintScope = { level: BusinessLevel; unit: BusinessUnit; topicId?: string };

const normalize = (text: string) => text.toLocaleLowerCase().trim();
const topicsFor = (term: BusinessTerm) => [term.topicId, ...(term.relatedTopicIds ?? [])];
const sectionDomId = (unit: number, topicId: string) =>
  `u${unit}-${topicId.replaceAll(".", "-")}`;

const collectionFor = (level: BusinessLevel) => level === "AS"
  ? { terms: businessTerms, units: businessUnits, sections: syllabusSections }
  : { terms: a2BusinessTerms, units: a2BusinessUnits, sections: a2SyllabusSections };

const belongsToUnit = (
  term: BusinessTerm,
  unit: BusinessUnit,
  sections: Record<string, SyllabusSection>,
) => term.unit === unit || (term.relatedTopicIds ?? []).some((topicId) => sections[topicId]?.unit === unit);

const topicsForUnit = (
  term: BusinessTerm,
  unit: BusinessUnit,
  sections: Record<string, SyllabusSection>,
) => {
  if (term.unit === unit) return [term.topicId];
  const unitTopics = topicsFor(term).filter((topicId) => sections[topicId]?.unit === unit);
  return unitTopics.slice(0, 1);
};

const sourceLabel = (term: BusinessTerm, level: BusinessLevel) => {
  if (level === "A2") return `A2 PDF · ${term.sourceRefs?.map((ref) => `#${ref}`).join(" / ") ?? "来源未标注"}`;
  const sourceNumber = term.id.match(/-(\d+)$/)?.[1];
  return `AS 词表 · Unit ${term.unit} · ${sourceNumber ?? ""}`;
};

export default function Business() {
  const [level, setLevel] = useState<BusinessLevel>("AS");
  const [query, setQuery] = useState("");
  const [openTopics, setOpenTopics] = useState<Set<string>>(() => new Set(["1:1.1.1", "6:6.1.1"]));
  const [closedTopics, setClosedTopics] = useState<Set<string>>(() => new Set());
  const [printScope, setPrintScope] = useState<PrintScope | null>(null);
  const printMode = printScope !== null;
  const search = normalize(query);
  const activeCollection = collectionFor(level);
  const printCollection = printScope ? collectionFor(printScope.level) : activeCollection;

  const matches = useMemo(() => {
    if (!search) return activeCollection.terms;
    return activeCollection.terms.filter((term) =>
      [
        term.term,
        term.termZh,
        term.definitionEn,
        term.explanationZh,
        term.exampleEn,
        term.exampleZh,
        term.usageNoteZh ?? "",
      ].some((value) => normalize(value).includes(search)),
    );
  }, [activeCollection.terms, search]);

  const entriesToRender = useMemo(() => {
    if (!printScope) return matches;
    return printCollection.terms.filter((term) => {
      if (printScope.topicId) return topicsFor(term).includes(printScope.topicId);
      return belongsToUnit(term, printScope.unit, printCollection.sections);
    });
  }, [matches, printCollection, printScope]);
  const matchingIds = useMemo(() => new Set(entriesToRender.map((term) => term.id)), [entriesToRender]);

  useEffect(() => {
    document.title = "Business, in context · CS Learning Atlas";
    document.documentElement.lang = "en";
    return () => {
      document.title = "Computer Science · Learning catalogue";
      document.documentElement.lang = "en";
    };
  }, []);

  useEffect(() => {
    if (printMode) window.print();
  }, [printMode]);

  useEffect(() => {
    const finishPrint = () => setPrintScope(null);
    window.addEventListener("afterprint", finishPrint);
    return () => window.removeEventListener("afterprint", finishPrint);
  }, []);

  const termsForUnit = (unit: BusinessUnit) => entriesToRender.filter((term) =>
    printMode
      ? unit === printScope?.unit && belongsToUnit(term, unit, printCollection.sections)
      : term.unit === unit,
  );

  return (
    <div className={`business-shell site-shell${printMode ? " business--printing" : ""}`}>
      <a className="skip-link" href="#business-main">跳到主要内容</a>
      <header className="business-header">
        <a className="business-brand" href="/" aria-label="CS Learning Atlas 首页">
          <span className="brand-mark" aria-hidden="true">↳</span>
          <span>CS LEARNING ATLAS</span>
        </a>
        <a className="business-back" href="/">← 返回学习目录</a>
      </header>

      <main id="business-main" className="business-page">
        <section className="business-intro" aria-labelledby="business-title">
          <div>
            <p className="eyebrow">CAMBRIDGE INTERNATIONAL · BUSINESS 9609 · AS &amp; A LEVEL</p>
            <h1 id="business-title">Business, <em>in context.</em></h1>
            <p className="business-deck">在真实的商业情境中理解概念、表达决策，也看清问题。</p>
          </div>
          <aside className="business-index" aria-label="内容范围">
            <span>THE {level} COLLECTION</span>
            <strong>{activeCollection.terms.length} <small>ideas</small></strong>
            <div>{activeCollection.units.length} units · syllabus {level === "AS" ? "1.1–5.5" : "6.1–10.4"}</div>
            <div>小节编号对应 Cambridge 考纲</div>
            <div>English terms · 中文理解 · real usage</div>
          </aside>
        </section>

        <section className="business-tools" aria-label="搜索与浏览">
          <div className="business-level-switch" role="tablist" aria-label="选择课程阶段">
            {(["AS", "A2"] as const).map((option) => (
              <button
                type="button"
                role="tab"
                aria-selected={level === option}
                key={option}
                onClick={() => setLevel(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <label className="business-search">
            <span>搜索英中术语</span>
            <input
              type="search"
              role="searchbox"
              aria-label="搜索英中术语"
              placeholder="例如 added value · 增值"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </section>

        <nav className="business-unit-nav" aria-label="按 Unit 浏览">
          {activeCollection.units.map((unit) => (
            <a key={unit.id} href={`#unit-${unit.id}`}>
              <span>{String(unit.id).padStart(2, "0")}</span>
              <span>{unit.titleZh}</span>
            </a>
          ))}
        </nav>

        {search && (
          <p className="business-results" role="status">
            {matches.length ? `找到 ${matches.length} 个相关词条` : "没有找到匹配的词条"}
          </p>
        )}

        <div className="business-units">
          {activeCollection.units.map((unit) => {
            const visibleEntries = termsForUnit(unit.id);
            if (!visibleEntries.length) return null;
            const sectionIds = [...new Set(visibleEntries.flatMap((term) => {
              if (printMode && printScope?.topicId) return [printScope.topicId];
              if (printMode) return topicsForUnit(term, unit.id, activeCollection.sections);
              return term.topicId ? [term.topicId] : [];
            }))];
            const sections = sectionIds
              .map((id) => activeCollection.sections[id])
              .filter((section) => section !== undefined)
              .sort((first, second) => first.id.localeCompare(second.id, "en", { numeric: true }));
            const isPrintUnit = printScope?.unit === unit.id;
            const unitCount = activeCollection.terms.filter((term) => term.unit === unit.id).length;

            return (
              <section
                className={`business-unit${isPrintUnit ? " business-unit--print-target" : ""}`}
                id={`unit-${unit.id}`}
                key={unit.id}
              >
                <header className="business-unit-heading">
                  <span className="business-unit-number">{String(unit.id).padStart(2, "0")}</span>
                  <div>
                    <p className="eyebrow">UNIT {unit.id} · {level === "AS" ? "AS LEVEL" : "A LEVEL"}</p>
                    <h2>{unit.titleEn}</h2>
                    <p>{unit.titleZh}</p>
                  </div>
                  <span className="business-unit-count">
                    {search ? `${visibleEntries.length} / ` : ""}{unitCount} 条
                  </span>
                  <button
                    type="button"
                    className="business-print-control business-print-unit"
                    aria-label={`打印 Unit ${unit.id} 全章`}
                    onClick={() => setPrintScope({ level, unit: unit.id })}
                  >
                    打印本章
                  </button>
                </header>

                <div className="business-topic-list">
                  {sections.map((section) => {
                    const topicKey = `${unit.id}:${section.id}`;
                    const sectionTerms = activeCollection.terms.filter((term) =>
                      printMode
                        ? printScope?.topicId
                          ? topicsFor(term).includes(section.id)
                          : topicsForUnit(term, unit.id, activeCollection.sections).includes(section.id)
                        : term.topicId === section.id,
                    );
                    const visibleTerms = sectionTerms.filter((term) =>
                      matchingIds.has(term.id),
                    );
                    if (!visibleTerms.length) return null;
                    const open = Boolean(
                      printMode || (!closedTopics.has(topicKey) && (search || openTopics.has(topicKey))),
                    );
                    const isPrintTopic = isPrintUnit && (!printScope?.topicId || printScope.topicId === section.id);
                    const topicDomKey = sectionDomId(unit.id, section.id);
                    const topicLabelId = `topic-title-${topicDomKey}`;
                    const listId = `entries-${topicDomKey}`;

                    return (
                      <section
                        className={`business-topic${isPrintTopic ? " business-topic--print-target" : ""}`}
                        key={section.id}
                      >
                        <div className="business-topic-heading">
                          <button
                            type="button"
                            className="business-topic-toggle"
                            aria-expanded={open}
                            aria-controls={listId}
                            aria-labelledby={topicLabelId}
                            onClick={() => {
                              if (open) {
                                setOpenTopics((previous) => {
                                  const next = new Set(previous);
                                  next.delete(topicKey);
                                  return next;
                                });
                                setClosedTopics((previous) => new Set(previous).add(topicKey));
                              } else {
                                setClosedTopics((previous) => {
                                  const next = new Set(previous);
                                  next.delete(topicKey);
                                  return next;
                                });
                                setOpenTopics((previous) => new Set(previous).add(topicKey));
                              }
                            }}
                          >
                            <span className="business-topic-code">{section.id}</span>
                            <span id={topicLabelId} className="business-topic-title" role="heading" aria-level={3}>
                              <strong>{section.titleEn}</strong>
                              <small>{section.titleZh}</small>
                            </span>
                            <span className="business-topic-count">{search ? `${visibleTerms.length} / ` : ""}{sectionTerms.length} 条</span>
                            <span className="business-topic-chevron" aria-hidden="true">{open ? "−" : "+"}</span>
                          </button>
                          <button
                            type="button"
                            className="business-print-control business-print-topic"
                            aria-label={`打印小节 ${section.id} ${section.titleEn}`}
                            onClick={() => setPrintScope({ level, unit: unit.id, topicId: section.id })}
                          >
                            打印本小节
                          </button>
                        </div>

                        <div id={listId} className="business-terms" hidden={!open}>
                          {visibleTerms.map((term) => {
                            const relatedSections = topicsFor(term)
                              .map((id) => activeCollection.sections[id])
                              .filter((related): related is SyllabusSection => related !== undefined);
                            return (
                              <article
                                className={`business-term${printMode ? " business-term--print-target" : ""}`}
                                key={term.id}
                              >
                                <div className="business-term-heading">
                                  <div>
                                    <h4>{term.term}</h4>
                                    <p className="business-term-zh">{term.termZh}</p>
                                  </div>
                                  <span className="business-term-ref">{sourceLabel(term, level)}</span>
                                </div>
                                {relatedSections.length > 0 && (
                                  <p className="business-related-topics">
                                    对应考纲：{relatedSections.map((related, index) => (
                                      <span key={related.id}>
                                        {index > 0 ? " · " : ""}{related.id} {related.titleEn}
                                      </span>
                                    ))}
                                  </p>
                                )}
                                <div className="business-definition">
                                  <p className="business-label">ENGLISH DEFINITION</p>
                                  <p>{term.definitionEn}</p>
                                </div>
                                <div className="business-explanation">
                                  <p className="business-label">中文理解</p>
                                  <p>{term.explanationZh}</p>
                                </div>
                                <div className="business-example">
                                  <p className="business-label">IN A BUSINESS SETTING · 真实语境</p>
                                  <p className="business-example-en">“{term.exampleEn}”</p>
                                  <p className="business-example-zh">{term.exampleZh}</p>
                                  {term.usageNoteZh && <p className="business-usage-note">用法提示：{term.usageNoteZh}</p>}
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="business-footer">
          <span>CAMBRIDGE 9609 · {level === "AS" ? "AS BUSINESS" : "A LEVEL BUSINESS"}</span>
          <a href="https://www.cambridgeinternational.org/Images/697371-2026-2028-syllabus.pdf" target="_blank" rel="noreferrer">
            Cambridge syllabus · 2026–2028 ↗
          </a>
          <a href="#business-main">回到页面顶部 ↑</a>
        </footer>
      </main>
    </div>
  );
}
