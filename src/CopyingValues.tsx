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

function Memory({
  language,
  values,
  sourceAddress,
}: {
  language: CopyingLanguage;
  values: readonly { address: number; value: number }[];
  sourceAddress?: number;
}) {
  const t = copyingContent[language];
  return (
    <section className="copy-memory" role="group" aria-label={t.mainMemory}>
      <h3>{t.mainMemory}</h3>
      <div className="copy-memory-cells">
        {values.map((cell) => (
          <div
            key={cell.address}
            className={`copy-location memory-location ${cell.address === sourceAddress ? "source-location" : ""}`}
            role="group"
            aria-label={`${t.address} ${cell.address}`}
          >
            {cell.address === sourceAddress && <small className="location-role">{t.source}</small>}
            <span>{t.address} {cell.address}</span>
            <strong>{cell.value}</strong>
            <small>{t.contents}</small>
          </div>
        ))}
      </div>
    </section>
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
  const memoryBefore = [
    { id: "m10", value: 7 },
    { id: "m11", value: 42 },
    { id: "m12", value: 9 },
    { id: "A", value: 7 },
  ];
  const memoryAfter = copyValue(memoryBefore, "m11", "A");
  const memoryPredictionReady =
    answers.memorySource !== undefined &&
    answers.memoryDestination !== undefined;
  const memoryRecallLocked =
    answers.memoryRecall !== undefined && answers.memoryRecall !== 42;
  const freshKeys = [
    "fresh1Source",
    "fresh1Destination",
    "fresh1SourceValue",
    "fresh1DestinationValue",
    "fresh2Source",
    "fresh2Destination",
    "fresh2SourceValue",
    "fresh2DestinationValue",
  ];
  const freshReady = freshKeys.every((key) => answers[key] !== undefined);
  const freshRegisterAfter = copyValue(
    [
      { id: "B", value: 3 },
      { id: "A", value: 9 },
    ],
    "B",
    "A",
  );
  const freshMemoryAfter = copyValue(
    [
      { id: "m21", value: 4 },
      { id: "B", value: 8 },
    ],
    "m21",
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
          {section !== 3 && <div hidden={revealed && (section === 1 || section === 2)} role={section === 1 || section === 2 ? "group" : undefined} aria-label={section === 1 || section === 2 ? t.before : undefined}>
            <div className={`copy-computer ${section === 2 ? "memory-copy-layout" : ""}`} role="group" aria-label={t.computer}>
              {section === 2 && <Memory language={language} values={[{ address: 10, value: 7 }, { address: 11, value: 42 }, { address: 12, value: 9 }]} sourceAddress={11} />}
              <section className="copy-processor" role="group" aria-label={t.processor}>
                <h3>{t.processor}</h3>
                <div className="copy-registers">
                  <Register name={t.registerA} value={7} roleLabel={section <= 1 ? t.source : section === 2 ? t.destination : undefined} />
                  {section !== 2 && <Register name={t.registerB} value={42} roleLabel={section <= 1 ? t.destination : undefined} />}
                </div>
              </section>
            </div>
          </div>}
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
                <div className="copy-cue result-cue">{t.copyValue}: {t.registerA} {language === "en" ? "to" : "到"} {t.registerB}</div>
                <div className="copy-comparison">
                  <div className="copy-computer" role="group" aria-label={t.before}>
                    <section className="copy-processor" role="group" aria-label={t.processor}><h3>{t.processor}</h3><div className="copy-registers"><Register name={t.registerA} value={7} roleLabel={t.source} /><Register name={t.registerB} value={42} roleLabel={t.destination} /></div></section>
                  </div>
                  <div className="copy-computer result-computer" role="group" aria-label={t.after}>
                    <section className="copy-processor" role="group" aria-label={t.processor}>
                      <h3>{t.processor}</h3>
                      <div className="copy-registers">
                        <Register name={t.registerA} value={registerAfter[0].value} roleLabel={t.source} />
                        <Register name={t.registerB} value={registerAfter[1].value} roleLabel={t.destination} />
                      </div>
                    </section>
                  </div>
                </div>
                <p role="status" className="feedback">{t.registerResult}</p>
              </div>
            </div>
          )}
          {section === 2 && (
            <div className="interaction">
              <p className="copy-cue">{language === "en" ? "Copy the contents at address 11 into Register A" : "把地址 11 的内容复制到寄存器 A"}</p>
              <p className="eyebrow">{t.tryIt}</p>
              <fieldset className="question-group" aria-label={t.memoryRecallTitle}>
                <legend>{t.memoryRecallTitle}</legend><p>{t.memoryRecallQuestion}</p>
                {choices("memoryRecall", ["11", "42", "7"], revealed || memoryRecallLocked, [11, 42, 7])}
                {answers.memoryRecall !== undefined && answers.memoryRecall !== 42 && (
                  <p className="quiet">
                    {answers.memoryRecall === 11
                      ? t.memoryRecallCorrection
                      : t.memoryRecallRetry}{" "}
                    <a href="/learn/memory">{t.revisitMemory}</a>
                  </p>
                )}
              </fieldset>
              <fieldset className="question-group" aria-label={t.memorySourcePrediction}>
                <legend>{t.memorySourcePrediction}</legend>
                {choices("memorySource", ["42", "7", "0"], revealed, [42, 7, 0])}
              </fieldset>
              <fieldset className="question-group" aria-label={t.memoryDestinationPrediction}>
                <legend>{t.memoryDestinationPrediction}</legend>
                {choices("memoryDestination", ["42", "7", "11"], revealed, [42, 7, 11])}
              </fieldset>
              <button className="primary" disabled={!memoryPredictionReady} aria-controls="memory-copy-result" aria-expanded={revealed} onClick={() => setRevealed(true)}>{t.showCopy}</button>
              <div id="memory-copy-result" data-testid="memory-copy-result" hidden={!revealed}>
                <div className="copy-comparison memory-comparison">
                  <div className="copy-computer memory-copy-layout" role="group" aria-label={t.before}><Memory language={language} values={[{ address: 10, value: 7 }, { address: 11, value: 42 }, { address: 12, value: 9 }]} sourceAddress={11} /><section className="copy-processor" role="group" aria-label={t.processor}><h3>{t.processor}</h3><div className="copy-registers"><Register name={t.registerA} value={7} roleLabel={t.destination} /></div></section></div>
                  <div className="copy-computer memory-copy-layout result-computer" role="group" aria-label={t.after}>
                    <Memory language={language} values={memoryAfter.slice(0, 3).map((item, index) => ({ address: 10 + index, value: item.value }))} sourceAddress={11} />
                    <section className="copy-processor" role="group" aria-label={t.processor}>
                      <h3>{t.processor}</h3><div className="copy-registers"><Register name={t.registerA} value={memoryAfter[3].value} roleLabel={t.destination} /></div>
                    </section>
                  </div>
                </div>
                <p role="status" className="feedback">{t.memoryResult}</p>
              </div>
              <p className="route-note">{t.physicalRoute}</p>
            </div>
          )}
          {section === 3 && (
            <div className="interaction fresh-copy-interaction">
              <p className="eyebrow">{t.tryIt}</p>
              <div className="fresh-copy-grid">
                <section className="fresh-copy-example" aria-labelledby="fresh-example-1">
                  <h3 id="fresh-example-1">{t.example1}</h3>
                  <div className="copy-computer" role="group" aria-label={`${t.example1} ${t.before}`}>
                    <section className="copy-processor" role="group" aria-label={t.processor}>
                      <h4>{t.processor}</h4><div className="copy-registers"><Register name={t.registerB} value={3} roleLabel={t.source} /><Register name={t.registerA} value={9} roleLabel={t.destination} /></div>
                    </section>
                  </div>
                  {[
                    ["fresh1Source", [t.registerB, t.registerA], [0, 1]],
                    ["fresh1Destination", [t.registerB, t.registerA], [0, 1]],
                    ["fresh1SourceValue", ["3", "9"], [3, 9]],
                    ["fresh1DestinationValue", ["3", "9"], [3, 9]],
                  ].map(([key, labels, values], index) => (
                    <fieldset key={key as string} className="question-group" aria-label={`${t.example1}: ${t.freshQuestions[index]}`}>
                      <legend>{t.freshQuestions[index]}</legend>
                      {choices(key as string, labels as readonly string[], revealed, values as readonly number[])}
                    </fieldset>
                  ))}
                </section>
                <section className="fresh-copy-example" aria-labelledby="fresh-example-2">
                  <h3 id="fresh-example-2">{t.example2}</h3>
                  <div className="copy-computer memory-copy-layout" role="group" aria-label={`${t.example2} ${t.before}`}>
                    <Memory language={language} values={[{ address: 21, value: 4 }]} sourceAddress={21} />
                    <section className="copy-processor" role="group" aria-label={t.processor}><h4>{t.processor}</h4><div className="copy-registers"><Register name={t.registerB} value={8} roleLabel={t.destination} /></div></section>
                  </div>
                  {[
                    ["fresh2Source", [`${t.address} 21`, t.registerB], [0, 1]],
                    ["fresh2Destination", [`${t.address} 21`, t.registerB], [0, 1]],
                    ["fresh2SourceValue", ["4", "8"], [4, 8]],
                    ["fresh2DestinationValue", ["4", "8"], [4, 8]],
                  ].map(([key, labels, values], index) => (
                    <fieldset key={key as string} className="question-group" aria-label={`${t.example2}: ${t.freshQuestions[index]}`}>
                      <legend>{t.freshQuestions[index]}</legend>
                      {choices(key as string, labels as readonly string[], revealed, values as readonly number[])}
                    </fieldset>
                  ))}
                </section>
              </div>
              <button
                className="primary"
                disabled={!freshReady}
                aria-controls="fresh-copy-results"
                aria-expanded={revealed}
                onClick={() => setRevealed(true)}
              >
                {t.showBothCopies}
              </button>
              <div id="fresh-copy-results" data-testid="fresh-copy-results" hidden={!revealed}>
                <div className="fresh-copy-grid fresh-results-grid">
                  <section className="fresh-copy-example" aria-label={`${t.example1} ${t.after}`}>
                    <h3>{t.example1}: {t.after}</h3>
                    <div className="copy-computer result-computer" role="group" aria-label={`${t.example1} ${t.after}`}><section className="copy-processor" role="group" aria-label={t.processor}><h4>{t.processor}</h4><div className="copy-registers"><Register name={t.registerB} value={freshRegisterAfter[0].value} roleLabel={t.source} /><Register name={t.registerA} value={freshRegisterAfter[1].value} roleLabel={t.destination} /></div></section></div>
                    <p role="status" className="feedback">{t.freshResult1}</p>
                  </section>
                  <section className="fresh-copy-example" aria-label={`${t.example2} ${t.after}`}>
                    <h3>{t.example2}: {t.after}</h3>
                    <div className="copy-computer memory-copy-layout result-computer" role="group" aria-label={`${t.example2} ${t.after}`}><Memory language={language} values={[{ address: 21, value: freshMemoryAfter[0].value }]} sourceAddress={21} /><section className="copy-processor" role="group" aria-label={t.processor}><h4>{t.processor}</h4><div className="copy-registers"><Register name={t.registerB} value={freshMemoryAfter[1].value} roleLabel={t.destination} /></div></section></div>
                    <p role="status" className="feedback">{t.freshResult2}</p>
                  </section>
                </div>
              </div>
            </div>
          )}
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
