import { useState } from "react";
import { rtnNotationContent, type RTNNotationLanguage } from "./rtnNotationContent";

type Props = { language: RTNNotationLanguage };

export default function RTNNotation({ language }: Props) {
  const t = rtnNotationContent[language];
  const [exampleIndex, setExampleIndex] = useState(0);
  const [eventIndex, setEventIndex] = useState(0);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [challengeAnswer, setChallengeAnswer] = useState<number | null>(null);
  const example = t.examples[exampleIndex];
  const complete = eventIndex >= example.events.length;
  const stateBefore = eventIndex > 1 ? example.results[eventIndex - 2] : example.initial;
  const stateAfter = eventIndex > 0 ? example.results[eventIndex - 1] : null;
  const currentQuestion = example.question[eventIndex];
  const reset = () => {
    setExampleIndex(0);
    setEventIndex(0);
    setPrediction(null);
    setChallengeAnswer(null);
  };
  const selectExample = (index: number) => {
    setExampleIndex(index);
    setEventIndex(0);
    setPrediction(null);
  };
  const revealEvent = () => {
    if (prediction === null || complete) return;
    setEventIndex((current) => Math.min(current + 1, example.events.length));
    setPrediction(null);
  };
  const state = (name: string, contents: string, value: string) => (
    <div className="rtn-register" role="group" aria-label={name}>
      <strong>{name}</strong>
      <span aria-label={contents}>{value}</span>
    </div>
  );

  return (
    <main id="main" className="rtn-lesson">
      <div className="lesson-topline">
        <a href="/">← {t.home}</a>
        <button className="text-button" onClick={reset}>{t.reset} <span aria-hidden="true">↺</span></button>
      </div>
      <header className="rtn-heading">
        <p className="eyebrow">{t.homeEyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </header>

      <section className="rtn-keys" aria-label={language === "en" ? "Notation key" : "表示法符号说明"}>
        <article><strong>{t.arrowKey}</strong><p>{t.arrowMeaning}</p></article>
        <article><strong>{t.singleBracketKey}</strong><p>{t.singleBracketMeaning}</p></article>
        <article><strong>{t.doubleBracketKey}</strong><p>{t.doubleBracketMeaning}</p></article>
      </section>
      <p className="rtn-reading-rule">{t.rightSideFirst}</p>

      <nav className="rtn-example-nav" aria-label={t.exampleLabel}>
        {t.examples.map((item, index) => <button key={item.label} aria-pressed={exampleIndex === index} onClick={() => selectExample(index)}>{`0${index + 1}`} <span>{item.label}</span></button>)}
      </nav>

      <section className="rtn-workbench" aria-label={example.label}>
        <div className="rtn-expression-panel">
          <p className="eyebrow">{t.expression}</p>
          <div className="rtn-expression" aria-label={t.expression} role="group">
            {example.lines.map((line, index) => <code key={`${line}-${index}`} aria-current={index === eventIndex && !complete ? "step" : undefined}>{line}</code>)}
          </div>
          <p>{example.note}</p>
          {exampleIndex === 0 && <p className="rtn-arrow-explain">{t.arrowMeaning} {t.singleBracketMeaning}</p>}
          {exampleIndex === 1 && <p className="rtn-bracket-explain">{t.doubleBracketMeaning}</p>}
          {example.nextAddressNote && <p className="rtn-next-address-note">{example.nextAddressNote}</p>}
        </div>

        <div className="rtn-state-panel">
          <p className="eyebrow">{t.processorState}</p>
          <div className="rtn-state-columns">
            <div className="rtn-state-column">
              <h2>{stateAfter ? t.before : t.currentState}</h2>
              {state(t.pc, t.pcContents, stateBefore.pc)}
              {state(t.mar, t.marContents, stateBefore.mar)}
              {state(t.mdr, t.mdrContents, stateBefore.mdr)}
            </div>
            {stateAfter && <div className="rtn-state-column after-state">
              <h2>{t.after}</h2>
              {state(t.pc, t.pcContents, stateAfter.pc)}
              {state(t.mar, t.marContents, stateAfter.mar)}
              {state(t.mdr, t.mdrContents, stateAfter.mdr)}
            </div>}
          </div>
          {example.memoryAddress && <div className="rtn-memory-cell" role="group" aria-label={`${t.memoryCell} ${example.memoryAddress}`}>
            <strong>{t.memory} · {t.memoryCell} {example.memoryAddress}</strong>
            <span aria-label={`${t.memoryCell} ${example.memoryAddress}`}>{example.memoryValue}</span>
          </div>}
        </div>
      </section>

      <section className="rtn-action-area">
        {!complete && <div className="rtn-prediction">
          <p className="eyebrow">{t.prediction}</p>
          <h2>{currentQuestion}</h2>
          <div className="rtn-choices" role="group" aria-label={currentQuestion}>
            {example.choices[eventIndex].map((choice, index) => <button key={choice} aria-pressed={prediction === index} onClick={() => setPrediction(index)}>{choice}</button>)}
          </div>
          {prediction !== null && <p role="status" className="rtn-answer-feedback">{prediction === example.answer[eventIndex] ? (language === "en" ? "Prediction recorded. Now reveal the computer event." : "预测已记录。现在显示计算机事件。") : example.retry[eventIndex]}</p>}
        </div>}
        <div className="rtn-computer-event">
          <p className="eyebrow">{t.eventLabel}{!complete ? ` · ${eventIndex + 1}/${example.events.length}` : ""}</p>
          <p role="status" aria-live="polite">{eventIndex === 0 ? "" : example.events[eventIndex - 1]}</p>
          <button className="primary" disabled={complete ? exampleIndex >= t.examples.length - 1 : prediction === null} onClick={complete ? () => selectExample(exampleIndex + 1) : revealEvent}>
            {complete ? exampleIndex < t.examples.length - 1 ? t.nextExample : t.completed : t.showEvent}
          </button>
        </div>
      </section>

      {exampleIndex === t.examples.length - 1 && complete && <section className="rtn-challenge">
        <p className="eyebrow">{t.challengeTitle}</p>
        <h2>{t.challengeQuestion}</h2>
        <div className="rtn-choices" role="group" aria-label={t.challengeQuestion}>
          {t.challengeChoices.map((choice, index) => <button key={choice} aria-pressed={challengeAnswer === index} onClick={() => setChallengeAnswer(index)}>{choice}</button>)}
        </div>
        {challengeAnswer !== null && <p role="status">{challengeAnswer === 0 ? t.challengeAnswer : t.challengeRetry}</p>}
      </section>}
    </main>
  );
}
