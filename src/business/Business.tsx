import { useEffect, useMemo, useState } from "react";
import { businessTerms, businessUnits, syllabusSections } from "./businessData";
import type { BusinessUnit } from "./businessTypes";
import "./business.css";

const normalize = (text: string) => text.toLocaleLowerCase().trim();
type PrintScope = { unit: BusinessUnit; topicId?: string };

export default function Business() {
  const [query, setQuery] = useState("");
  const [openTopics, setOpenTopics] = useState<Set<string>>(() => new Set(["1:1.1.1"]));
  const [closedTopics, setClosedTopics] = useState<Set<string>>(() => new Set());
  const [printScope, setPrintScope] = useState<PrintScope | null>(null);
  const printMode = printScope !== null;
  const search = normalize(query);

  const matches = useMemo(() => {
    if (!search) return businessTerms;
    return businessTerms.filter((term) =>
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
  }, [search]);

  const entriesToRender = useMemo(
    () => printScope
      ? businessTerms.filter((term) => term.unit === printScope.unit && (!printScope.topicId || term.topicId === printScope.topicId))
      : matches,
    [matches, printScope],
  );
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
    if (!printMode) return;
    window.print();
  }, [printMode]);

  useEffect(() => {
    const finishPrint = () => setPrintScope(null);
    window.addEventListener("afterprint", finishPrint);
    return () => window.removeEventListener("afterprint", finishPrint);
  }, []);

  const unitEntries = (unit: BusinessUnit) => entriesToRender.filter((term) => term.unit === unit);

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
            <p className="eyebrow">CAMBRIDGE INTERNATIONAL · BUSINESS 9609 · AS LEVEL</p>
            <h1 id="business-title">Business, <em>in context.</em></h1>
            <p className="business-deck">在真实的商业情境中理解概念、表达决策，也看清问题。</p>
          </div>
          <aside className="business-index" aria-label="内容范围">
            <span>THE AS COLLECTION</span>
            <strong>300 <small>ideas</small></strong>
            <div>5 units · syllabus 1.1–5.5</div>
            <div>小节编号对应 Cambridge 考纲</div>
            <div>English terms · 中文理解 · real usage</div>
          </aside>
        </section>

        <section className="business-tools" aria-label="搜索与打印">
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
          {businessUnits.map((unit) => (
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
          {businessUnits.map((unit) => {
            const visibleEntries = unitEntries(unit.id);
            if (!visibleEntries.length) return null;
            const sectionIds = [...new Set(visibleEntries.map((term) => term.topicId))];
            const sections = sectionIds
              .map((id) => syllabusSections[id])
              .filter((section) => section !== undefined)
              .sort((first, second) => first.id.localeCompare(second.id, "en", { numeric: true }));
            const isPrintUnit = printScope?.unit === unit.id;

            return (
              <section
                className={`business-unit${isPrintUnit ? " business-unit--print-target" : ""}`}
                id={`unit-${unit.id}`}
                key={unit.id}
              >
                <header className="business-unit-heading">
                  <span className="business-unit-number">0{unit.id}</span>
                  <div>
                    <p className="eyebrow">UNIT {unit.id} · AS LEVEL</p>
                    <h2>{unit.titleEn}</h2>
                    <p>{unit.titleZh}</p>
                  </div>
                  <span className="business-unit-count">
                    {search ? visibleEntries.length : businessTerms.filter((term) => term.unit === unit.id).length} 条
                  </span>
                  <button
                    type="button"
                    className="business-print-control business-print-unit"
                    aria-label={`打印 Unit ${unit.id} 全章`}
                    onClick={() => setPrintScope({ unit: unit.id })}
                  >
                    打印本章
                  </button>
                </header>

                <div className="business-topic-list">
                  {sections.map((section) => {
                    const topicKey = `${unit.id}:${section.id}`;
                    const sectionTerms = businessTerms.filter(
                      (term) => term.unit === unit.id && term.topicId === section.id,
                    );
                    const visibleTerms = sectionTerms.filter((term) => matchingIds.has(term.id));
                    if (!visibleTerms.length) return null;
                    const open = Boolean(
                      printMode || (!closedTopics.has(topicKey) && (search || openTopics.has(topicKey))),
                    );
                    const isPrintTopic = isPrintUnit && (!printScope?.topicId || printScope.topicId === section.id);
                    const topicDomKey = `u${unit.id}-${section.id.replaceAll(".", "-")}`;
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
                            onClick={() => setPrintScope({ unit: unit.id, topicId: section.id })}
                          >
                            打印本小节
                          </button>
                        </div>

                        <div id={listId} className="business-terms" hidden={!open}>
                          {visibleTerms.map((term) => (
                            <article
                              className={`business-term${printMode ? " business-term--print-target" : ""}`}
                              key={term.id}
                            >
                              <div className="business-term-heading">
                                <div>
                                  <h4>{term.term}</h4>
                                  <p className="business-term-zh">{term.termZh}</p>
                                </div>
                                <span className="business-term-ref">{term.id.replace("u", "#").replace("-", " · ")}</span>
                              </div>
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
                          ))}
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
          <span>CAMBRIDGE 9609 · AS BUSINESS</span>
          <a href="https://www.cambridgeinternational.org/Images/697371-2026-2028-syllabus.pdf" target="_blank" rel="noreferrer">
            Cambridge syllabus · 2026–2028 ↗
          </a>
          <a href="#business-main">回到页面顶部 ↑</a>
        </footer>
      </main>
    </div>
  );
}
