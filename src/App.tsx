import { useEffect, useRef, useState } from "react";
import { content, type Language } from "./content";
import { readMemory, resetMemory, writeMemory } from "./memory";

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [stage, setStage] = useState(0);
  const [reveal, setReveal] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [cells, setCells] = useState(resetMemory);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [readout, setReadout] = useState<number | null>(null);
  const [written, setWritten] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const t = content[language];
  const lesson =
    window.location.pathname.replace(/\/$/, "") === "/learn/memory";
  const home = window.location.pathname === "/";
  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "zh-Hans";
    document.title = t.title + " · " + t.brand;
  }, [language, t]);
  const move = (to: number) => {
    setStage(to);
    setSelected(null);
    setCells(resetMemory());
    setAnswers({});
    setReadout(null);
    setWritten(false);
    setReveal(0);
    requestAnimationFrame(() => heading.current?.focus());
  };
  const reset = () => {
    setStage(0);
    setReveal(0);
    setSelected(null);
    setCells(resetMemory());
    setAnswers({});
    setReadout(null);
    setWritten(false);
    requestAnimationFrame(() => heading.current?.focus());
  };
  const answer = (key: string, value: number) =>
    setAnswers((previous) => ({ ...previous, [key]: value }));
  const choice = (
    key: string,
    labels: string[],
    values: number[] = labels.map((_, i) => i),
  ) => (
    <div className="choices">
      {labels.map((label, i) => (
        <button
          key={label}
          className="choice"
          aria-pressed={answers[key] === values[i]}
          onClick={() => answer(key, values[i])}
        >
          {label}
        </button>
      ))}
    </div>
  );
  const feedback = (key: string, correct: number, text: string) =>
    answers[key] !== undefined && (
      <p role="status" className="feedback">
        {answers[key] === correct ? t.positive : t.retry}
        {text}
      </p>
    );
  const displayCells =
    stage === 5
      ? resetMemory("fresh")
      : stage === 0
        ? cells.slice(0, 1)
        : cells;
  const s = t.stages[stage];
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        {language === "en" ? "Skip to content" : "跳到主要内容"}
      </a>
      <header className="site-header">
        <a className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            ↳
          </span>
          {t.brand}
        </a>
        <div
          className="languages"
          aria-label={language === "en" ? "Language" : "语言"}
        >
          <button
            aria-pressed={language === "en"}
            onClick={() => setLanguage("en")}
          >
            English
          </button>
          <span aria-hidden="true">/</span>
          <button
            lang="zh-Hans"
            aria-pressed={language === "zh"}
            onClick={() => setLanguage("zh")}
          >
            中文
          </button>
        </div>
      </header>
      {home ? (
        <main id="main" className="home">
          <p className="eyebrow">{t.series}</p>
          <h1>{t.homeTitle}</h1>
          <p className="home-intro">{t.homeIntro}</p>
          <section className="lesson-invitation">
            <div className="invitation-copy">
              <p className="eyebrow">{t.available}</p>
              <h2>{t.lessonTitle}</h2>
              <p>{t.lessonIntro}</p>
              <a className="primary-link" href="/learn/memory">
                {t.enter}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="home-illustration" aria-hidden="true">
              <span className="outside">11</span>
              <div>42</div>
              <span className="small-note">
                {t.address} ↗<br />
                {t.contents} →
              </span>
            </div>
          </section>
          <p className="home-note">{t.homeNote}</p>
        </main>
      ) : !lesson ? (
        <main id="main" className="home">
          <h1>{t.unknown}</h1>
          <a href="/">{t.backHome}</a>
        </main>
      ) : (
        <main id="main">
          <div className="lesson-topline">
            <a href="/">← {t.home}</a>
            <button className="text-button" onClick={reset}>
              {t.reset} <span aria-hidden="true">↺</span>
            </button>
          </div>
          <div className="lesson-heading">
            <div>
              <p className="eyebrow">{t.bite}</p>
              <h1>{t.title}</h1>
              <p>{t.subtitle}</p>
            </div>
            <span className="lesson-number" aria-hidden="true">
              01
            </span>
          </div>
          <nav
            className="step-nav"
            aria-label={language === "en" ? "Lesson steps" : "学习步骤"}
          >
            {t.steps.map((name, i) => (
              <button
                key={i}
                aria-current={stage === i ? "step" : undefined}
                aria-label={`${i + 1}. ${name}`}
                onClick={() => move(i)}
              >
                <span className="step-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="step-name">{name}</span>
              </button>
            ))}
          </nav>
          <div className="workspace">
            <section className="instruction">
              <p className="eyebrow">
                {t.stage} {stage + 1} {t.of} 6
              </p>
              <h2 ref={heading} tabIndex={-1}>
                {s.title}
              </h2>
              <p className="intro">{s.intro}</p>
              <div className="state-notes">
                <p>
                  <span>{t.four[0]}</span>
                  {s.state}
                </p>
                <p>
                  <span>{t.four[1]}</span>
                  {s.action}
                </p>
              </div>
            </section>
            <section className="activity" aria-label={t.memory}>
              <div className="activity-top">
                <span className="eyebrow">{t.memory}</span>
                <span aria-hidden="true">↙</span>
              </div>
              <div className={"memory-cells" + (stage === 0 ? " single" : "")}>
                {displayCells.map((cell) => (
                  <button
                    key={cell.address}
                    className="memory-cell"
                    disabled={stage === 0}
                    aria-label={
                      stage === 0
                        ? undefined
                        : language === "en"
                          ? `Address ${cell.address}, contents ${cell.value}`
                          : `地址 ${cell.address}，内容 ${cell.value}`
                    }
                    aria-pressed={selected === cell.address}
                    onClick={() => {
                      setSelected(cell.address);
                      if (stage === 1) answer("choose", cell.address);
                      if (stage === 3) answer("find", cell.address);
                    }}
                  >
                    <span
                      className={
                        "address-label" +
                        (stage === 0 && reveal < 1 ? " concealed" : "")
                      }
                    >
                      <span>{t.address}</span>
                      {(stage !== 0 || reveal >= 1) && (
                        <strong>{cell.address}</strong>
                      )}
                    </span>
                    <span className="cell-compartment">
                      <span
                        className={
                          "contents-label" +
                          (stage === 0 && reveal < 2 ? " concealed" : "")
                        }
                      >
                        {t.contents}
                      </span>
                      <strong
                        className={
                          written && cell.address === 11
                            ? "value updated"
                            : "value"
                        }
                        key={cell.value}
                      >
                        {stage !== 0 || reveal >= 2 ? (
                          cell.value
                        ) : (
                          <span className="unrevealed" aria-hidden="true">
                            ·
                          </span>
                        )}
                      </strong>
                    </span>
                    <span className="selection-note">
                      {selected === cell.address ? "✓ " + t.selected : "\u00a0"}
                    </span>
                  </button>
                ))}
              </div>
              <p className="model-caption">{t.model}</p>
              <div className="interaction">
                <h3>{s.prompt}</h3>
                {stage === 0 && (
                  <>
                    <button
                      className="primary"
                      onClick={() => setReveal(Math.min(reveal + 1, 2))}
                      disabled={reveal === 2}
                    >
                      {reveal === 0 ? t.revealAddress : t.revealContents}
                    </button>
                    {reveal === 2 && <p className="feedback">{s.why}</p>}
                  </>
                )}
                {(stage === 1 || stage === 3) && (
                  <>
                    <p className="quiet">{t.choiceHint}</p>
                    {stage === 1
                      ? feedback("choose", 11, t.chooseFeedback)
                      : feedback("find", 10, t.findFeedback)}
                  </>
                )}
                {stage === 2 && (
                  <>
                    <p className="mini-label">{t.predict}</p>
                    {choice("read", ["11", "42", "7"], [11, 42, 7])}
                    <button
                      className="spoken"
                      aria-pressed={answers.read === -1}
                      onClick={() => answer("read", -1)}
                    >
                      {t.spoken}
                    </button>
                    <button
                      className="primary"
                      disabled={answers.read === undefined}
                      onClick={() => {
                        setReadout(readMemory(cells, 11) ?? null);
                        setSelected(11);
                      }}
                    >
                      {t.read}
                    </button>
                    {readout !== null && (
                      <>
                        <div className="readout" aria-label={t.readout}>
                          <span>{t.readout}</span>
                          <strong>{readout}</strong>
                          <small>{t.readoutNote}</small>
                        </div>
                        <p role="status" className="feedback">
                          {t.readFeedback}
                        </p>
                      </>
                    )}
                  </>
                )}
                {stage === 4 && (
                  <>
                    <p className="mini-label">{t.predict}</p>
                    {choice("write", t.writeChoices)}
                    <button
                      className="spoken"
                      aria-pressed={answers.write === -1}
                      onClick={() => answer("write", -1)}
                    >
                      {t.spoken}
                    </button>
                    <button
                      className="primary"
                      disabled={answers.write === undefined || written}
                      onClick={() => {
                        setCells(writeMemory(cells, 11, 6));
                        setWritten(true);
                        setSelected(11);
                      }}
                    >
                      {t.replace}
                    </button>
                    {written && (
                      <p role="status" className="feedback">
                        {t.writeFeedback}
                      </p>
                    )}
                  </>
                )}
                {stage === 5 && (
                  <div className="fresh-questions">
                    {t.freshQuestions.map((question, i) => (
                      <fieldset key={question}>
                        <legend>
                          <span>{i + 1}.</span> {question}
                        </legend>
                        {choice(
                          "fresh" + i,
                          i === 0
                            ? ["3", "21", "8"]
                            : i === 1
                              ? ["3", "21", "20"]
                              : t.duplicateChoices,
                          i === 0 ? [3, 21, 8] : i === 1 ? [3, 21, 20] : [0, 1],
                        )}
                        {[0, 1, 2].every(
                          (index) => answers["fresh" + index] !== undefined,
                        ) &&
                          feedback(
                            "fresh" + i,
                            [3, 21, 0][i],
                            t.freshFeedback[i],
                          )}
                      </fieldset>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
          <section className="reflection">
            <div>
              <span className="mini-label">{t.four[2]}</span>
              <p>{s.change}</p>
            </div>
            <div>
              <span className="mini-label">{t.four[3]}</span>
              <p>{s.why}</p>
            </div>
          </section>
          <div className="lesson-controls">
            <button
              className="secondary"
              disabled={stage === 0}
              onClick={() => move(stage - 1)}
            >
              {t.back}
            </button>
            <span>{stage + 1} / 6</span>
            {stage < 5 ? (
              <button className="primary" onClick={() => move(stage + 1)}>
                {t.next}
              </button>
            ) : (
              <a className="primary-link" href="/">
                {t.home}
              </a>
            )}
          </div>
          {stage === 5 && (
            <div className="ending">
              <h2>{t.end}</h2>
              <p>{t.endText}</p>
            </div>
          )}
          <details className="parent-guide">
            <summary>
              {t.parent}
              <span aria-hidden="true">＋</span>
            </summary>
            <p>{t.parentIntro}</p>
            <dl>
              {t.guide.map(([label, text]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>
          </details>
        </main>
      )}
      <footer>
        <span>{t.brand}</span>
        <span>
          {language === "en"
            ? "Observe. Predict. Explain."
            : "观察 · 预测 · 解释"}
        </span>
      </footer>
    </div>
  );
}
