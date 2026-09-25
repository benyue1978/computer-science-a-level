import { useRef, useState } from "react";
import { copyingContent, type CopyingLanguage } from "./copyingContent";
import { copyValue } from "./copyModel";

type Props = { language: CopyingLanguage };

function Register({
  name,
  value,
  roleLabel,
}: {
  name: string;
  value: number;
  roleLabel?: string;
}) {
  return (
    <div className={`copy-location ${roleLabel ? roleLabel.toLowerCase() + "-location" : ""}`} role="group" aria-label={name}>
      {roleLabel && <small className="location-role">{roleLabel}</small>}
      <span>{name}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function CopyingValues({ language }: Props) {
  const t = copyingContent[language];
  const [section, setSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [spokenPrediction, setSpokenPrediction] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  const move = (next: number) => {
    setSection(next);
    setAnswers({});
    setRevealed(false);
    setSpokenPrediction(false);
    requestAnimationFrame(() => heading.current?.focus());
  };
  const answer = (key: string, value: number, locked = false) => {
    if (!locked) setAnswers((previous) => ({ ...previous, [key]: value }));
  };
  const choices = (
    key: string,
    labels: readonly string[],
    locked = false,
    values: readonly number[] = labels.map((_, index) => index),
  ) => (
    <div className="choices">
      {labels.map((label, index) => (
        <button
          key={label}
          className="choice"
          aria-pressed={answers[key] === values[index]}
          aria-disabled={locked || undefined}
          onClick={() => answer(key, values[index], locked)}
        >
          {label}
        </button>
      ))}
    </div>
  );
  const definitionsReady =
    answers.source !== undefined && answers.destination !== undefined;
  const registerPredictionReady =
    spokenPrediction ||
    (answers.registerSource !== undefined &&
      answers.registerDestination !== undefined);
  const registerAfter = copyValue(
    [
      { id: "A", value: 7 },
      { id: "B", value: 42 },
    ],
    "A",
    "B",
  );

  return (
    <main id="main">
      <div className="lesson-topline">
        <a href="/">← {t.home}</a>
        <button className="text-button" onClick={() => move(0)}>{t.reset} <span aria-hidden="true">↺</span></button>
      </div>
      <div className="lesson-heading">
        <div>
          <p className="eyebrow">{t.bite}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
        <span className="lesson-number" aria-hidden="true">03</span>
      </div>
      <nav className="step-nav processor-steps" aria-label={language === "en" ? "Lesson sections" : "学习小节"}>
        {t.steps.map((name, index) => (
          <button key={name} aria-current={section === index ? "step" : undefined} aria-label={`${index + 1}. ${name}`} onClick={() => move(index)}>
            <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="step-name">{name}</span>
          </button>
        ))}
      </nav>
      <div className="workspace processor-workspace">
        <section className="instruction">
          <p className="eyebrow">{t.stage} {section + 1} / 4</p>
          <h2 ref={heading} tabIndex={-1}>{t.sections[section].title}</h2>
          <p className="intro">{t.sections[section].intro}</p>
        </section>
        <section className="activity" aria-label={language === "en" ? "Copy diagram and questions" : "复制示意图与问题"}>
          <div className="activity-top"><span className="eyebrow">{t.computer}</span><span aria-hidden="true">↙</span></div>
          <div role={section === 1 ? "group" : undefined} aria-label={section === 1 ? t.before : undefined}>
            <div className="copy-computer" role="group" aria-label={t.computer}>
              <section className="copy-processor" role="group" aria-label={t.processor}>
                <h3>{t.processor}</h3>
                <div className="copy-registers">
                  <Register name={t.registerA} value={7} roleLabel={section <= 1 ? t.source : undefined} />
                  <Register name={t.registerB} value={42} roleLabel={section <= 1 ? t.destination : undefined} />
                </div>
              </section>
            </div>
          </div>
          {section === 0 && (
            <div className="interaction">
              <p className="copy-cue">{t.copyCue}</p>
              <p className="eyebrow">{t.tryIt}</p>
              <fieldset className="question-group" aria-label={t.recallTitle}>
                <legend>{t.recallTitle}</legend><p>{t.recallQuestion}</p>
                {choices("recall", ["7", "42"])}
                {answers.recall !== undefined && answers.recall !== 0 && <p className="quiet"><a href="/learn/processor-registers">{t.revisitProcessors}</a></p>}
              </fieldset>
              <fieldset className="question-group" aria-label={t.sourceQuestion}>
                <legend>{t.sourceQuestion}</legend>{choices("source", t.registerChoices, definitionsReady)}
                {definitionsReady && <p role="status" className="feedback">{answers.source === 0 ? t.positive : t.review}{t.sourceFeedback}</p>}
              </fieldset>
              <fieldset className="question-group" aria-label={t.destinationQuestion}>
                <legend>{t.destinationQuestion}</legend>{choices("destination", t.registerChoices, definitionsReady)}
                {definitionsReady && <p role="status" className="feedback">{answers.destination === 1 ? t.positive : t.review}{t.destinationFeedback}</p>}
              </fieldset>
            </div>
          )}
          {section === 1 && (
            <div className="interaction">
              <p className="copy-cue">{t.copyValue}: {t.registerA} {language === "en" ? "to" : "到"} {t.registerB}</p>
              <p className="eyebrow">{t.tryIt}</p>
              <fieldset className="question-group" aria-label={t.registerSourcePrediction}>
                <legend>{t.registerSourcePrediction}</legend>
                {choices("registerSource", ["7", "42"], revealed, [7, 42])}
              </fieldset>
              <fieldset className="question-group" aria-label={t.registerDestinationPrediction}>
                <legend>{t.registerDestinationPrediction}</legend>
                {choices("registerDestination", ["7", "42"], revealed, [7, 42])}
              </fieldset>
              <button
                className="spoken"
                aria-pressed={spokenPrediction}
                aria-disabled={revealed || undefined}
                onClick={() => { if (!revealed) setSpokenPrediction(true); }}
              >
                {t.spoken}
              </button>
              <button
                className="primary"
                disabled={!registerPredictionReady}
                aria-controls="register-copy-result"
                aria-expanded={revealed}
                onClick={() => setRevealed(true)}
              >
                {t.showCopy}
              </button>
              <div id="register-copy-result" data-testid="register-copy-result" hidden={!revealed}>
                <p className="phase-label">{t.before}: {t.registerA} 7 · {t.registerB} 42</p>
                <div className="copy-cue result-cue">{t.copyValue}: {t.registerA} {language === "en" ? "to" : "到"} {t.registerB}</div>
                <div className="copy-computer result-computer" role="group" aria-label={t.after}>
                  <section className="copy-processor" role="group" aria-label={t.processor}>
                    <h3>{t.processor}</h3>
                    <div className="copy-registers">
                      <Register name={t.registerA} value={registerAfter[0].value} roleLabel={t.source} />
                      <Register name={t.registerB} value={registerAfter[1].value} roleLabel={t.destination} />
                    </div>
                  </section>
                </div>
                <p role="status" className="feedback">{t.registerResult}</p>
              </div>
            </div>
          )}
          {section > 1 && <div className="interaction"><p className="eyebrow">{t.tryIt}</p></div>}
        </section>
      </div>
      <div className="lesson-controls">
        <button className="secondary" disabled={section === 0} onClick={() => move(section - 1)}>{t.back}</button>
        <span>{section + 1} / 4</span>
        {section < 3 ? <button className="primary" onClick={() => move(section + 1)}>{t.next}</button> : <a className="primary-link" href="/">{t.finish}</a>}
      </div>
    </main>
  );
}
