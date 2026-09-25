import { useRef, useState } from "react";
import { processorContent, type ProcessorLanguage } from "./processorContent";

type Props = { language: ProcessorLanguage };

function MemoryBlock({
  language,
  fresh = false,
}: {
  language: ProcessorLanguage;
  fresh?: boolean;
}) {
  const t = processorContent[language];
  const cells = fresh
    ? [
        { address: 20, value: 8 },
        { address: 21, value: 4 },
      ]
    : [
        { address: 10, value: 7 },
        { address: 11, value: 42 },
        { address: 12, value: 9 },
      ];
  return (
    <section
      className="component-box main-memory"
      role="group"
      aria-label={t.memory}
    >
      <h4>{t.memory}</h4>
      <p>{t.memoryNote}</p>
      <div className="mini-memory">
        {cells.map((cell) => (
          <div key={cell.address} className="mini-memory-cell">
            <span>
              {t.address} {cell.address}
            </span>
            <strong>{cell.value}</strong>
            <small>{t.contents}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function Register({ name, value }: { name: string; value: number }) {
  return (
    <div className="register-box" role="group" aria-label={name}>
      <span>{name}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProcessorBlock({
  language,
  showRegisters,
  fresh = false,
}: {
  language: ProcessorLanguage;
  showRegisters: boolean;
  fresh?: boolean;
}) {
  const t = processorContent[language];
  return (
    <section
      className="component-box processor-box"
      role="group"
      aria-label={t.processor}
    >
      <h4>{t.processor}</h4>
      <p>{t.processorNote}</p>
      {showRegisters ? (
        <div className="registers">
          <Register name={t.registerA} value={fresh ? 9 : 7} />
          <Register name={t.registerB} value={fresh ? 3 : 42} />
        </div>
      ) : (
        <div className="processor-placeholder" aria-hidden="true">
          ···
        </div>
      )}
    </section>
  );
}

export default function ProcessorRegisters({ language }: Props) {
  const t = processorContent[language];
  const [section, setSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [inside, setInside] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const current = t.sections[section];

  const move = (next: number) => {
    setSection(next);
    setAnswers({});
    setInside(false);
    requestAnimationFrame(() => heading.current?.focus());
  };
  const reset = () => move(0);
  const answer = (key: string, value: number) =>
    setAnswers((previous) => ({ ...previous, [key]: value }));
  const allAnswered = (keys: string[]) =>
    keys.every((key) => answers[key] !== undefined);
  const choices = (key: string, labels: readonly string[]) => (
    <div className="choices">
      {labels.map((label, index) => (
        <button
          key={label}
          className="choice"
          aria-pressed={answers[key] === index}
          onClick={() => answer(key, index)}
        >
          {label}
        </button>
      ))}
    </div>
  );
  const status = (key: string, correct: number, message: string) => (
    <p role="status" className="feedback">
      {answers[key] === correct ? t.positive : t.retry}
      {message}
    </p>
  );

  const componentKeys = ["component0", "component1"];
  const registerKeys = ["register0", "register1"];
  const freshKeys = ["fresh0", "fresh1", "fresh2", "fresh3"];

  return (
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
          02
        </span>
      </div>
      <nav
        className="step-nav processor-steps"
        aria-label={language === "en" ? "Lesson sections" : "学习小节"}
      >
        {t.steps.map((name, index) => (
          <button
            key={name}
            aria-current={section === index ? "step" : undefined}
            aria-label={`${index + 1}. ${name}`}
            onClick={() => move(index)}
          >
            <span className="step-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="step-name">{name}</span>
          </button>
        ))}
      </nav>
      <div className="workspace processor-workspace">
        <section className="instruction">
          <p className="eyebrow">
            {t.stage} {section + 1} / 4
          </p>
          <h2 ref={heading} tabIndex={-1}>
            {current.title}
          </h2>
          <p className="intro">{current.intro}</p>
        </section>
        <section
          className="activity"
          aria-label={
            language === "en"
              ? "Component diagram and questions"
              : "组成部分示意图与问题"
          }
        >
          <div className="activity-top">
            <span className="eyebrow">{t.computer}</span>
            <span aria-hidden="true">↙</span>
          </div>
          <div
            className={`computer-diagram ${section === 3 ? "reversed" : ""}`}
            role="group"
            aria-label={t.computer}
          >
            {section === 3 ? (
              <>
                <ProcessorBlock language={language} showRegisters fresh />
                <MemoryBlock language={language} fresh />
              </>
            ) : (
              <>
                <MemoryBlock language={language} />
                <ProcessorBlock
                  language={language}
                  showRegisters={section >= 2 || inside}
                />
              </>
            )}
          </div>
          {(section >= 2 || inside) && (
            <p className="model-caption">{t.presetNote}</p>
          )}
          <div className="interaction">
            <p className="eyebrow">{t.tryIt}</p>
            <h3>{current.prompt}</h3>
            {section === 0 && (
              <>
                <fieldset className="question-group" aria-label={t.recallTitle}>
                  <legend>{t.recallTitle}</legend>
                  <p>{t.recallQuestion}</p>
                  {choices("recall", ["11", "42", "7"])}
                  {answers.recall !== undefined && answers.recall !== 1 && (
                    <p className="quiet">
                      <a href="/learn/memory">{t.revisit}</a>
                    </p>
                  )}
                </fieldset>
                {t.componentQuestions.map((question, index) => (
                  <fieldset
                    key={question}
                    className="question-group"
                    aria-label={question}
                  >
                    <legend>{question}</legend>
                    {choices(`component${index}`, t.componentChoices)}
                    {allAnswered(componentKeys) &&
                      status(
                        `component${index}`,
                        index,
                        t.componentFeedback[index],
                      )}
                  </fieldset>
                ))}
              </>
            )}
            {section === 1 && (
              <>
                <button
                  className="primary"
                  aria-expanded={inside}
                  aria-controls="register-disclosure"
                  onClick={() => setInside(true)}
                >
                  {t.lookInside}
                </button>
                <div id="register-disclosure" hidden={!inside}>
                  {inside && (
                    <>
                      <p className="quiet reveal-note">{t.revealNote}</p>
                      <fieldset
                        className="question-group"
                        aria-label={t.locationQuestion}
                      >
                        <legend>{t.locationQuestion}</legend>
                        {choices("location", t.locationChoices)}
                        {answers.location !== undefined &&
                          status("location", 0, t.locationFeedback)}
                      </fieldset>
                    </>
                  )}
                </div>
              </>
            )}
            {section === 2 &&
              t.registerQuestions.map((question, index) => (
                <fieldset
                  key={question}
                  className="question-group"
                  aria-label={question}
                >
                  <legend>{question}</legend>
                  {choices(`register${index}`, t.registerChoices[index])}
                  {allAnswered(registerKeys) &&
                    status(`register${index}`, 0, t.registerFeedback[index])}
                </fieldset>
              ))}
            {section === 3 && (
              <div className="fresh-questions">
                {t.freshQuestions.map((question, index) => (
                  <fieldset
                    key={question}
                    className="question-group"
                    aria-label={question}
                  >
                    <legend>
                      <span>{index + 1}.</span> {question}
                    </legend>
                    {choices(`fresh${index}`, t.freshChoices[index])}
                    {allAnswered(freshKeys) &&
                      status(`fresh${index}`, 0, t.freshFeedback[index])}
                  </fieldset>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <div className="lesson-controls">
        <button
          className="secondary"
          disabled={section === 0}
          onClick={() => move(section - 1)}
        >
          {t.back}
        </button>
        <span>{section + 1} / 4</span>
        {section < 3 ? (
          <button className="primary" onClick={() => move(section + 1)}>
            {t.next}
          </button>
        ) : (
          <a className="primary-link" href="/">
            {t.home}
          </a>
        )}
      </div>
      {section === 3 && allAnswered(freshKeys) && (
        <div className="ending">
          <h2>{t.finish}</h2>
          <p>{t.finishText}</p>
        </div>
      )}
    </main>
  );
}
