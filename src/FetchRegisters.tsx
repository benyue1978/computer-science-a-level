import { useState } from "react";
import { fetchRegistersContent, type FetchRegistersLanguage } from "./fetchRegistersContent";

type Props = { language: FetchRegistersLanguage };

export default function FetchRegisters({ language }: Props) {
  const t = fetchRegistersContent[language];
  const [eventIndex, setEventIndex] = useState(0);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [reviewAnswers, setReviewAnswers] = useState<Record<number, number>>({});
  const registers = [
    { key: "pc", roleKey: "pcRole", value: "20", color: "pc" },
    { key: "mar", roleKey: "marRole", value: eventIndex >= 1 ? "20" : t.notFilled, color: "mar" },
    { key: "mdr", roleKey: "mdrRole", value: eventIndex >= 3 ? t.instruction : t.notFilled, color: "mdr" },
    { key: "cir", roleKey: "cirRole", value: eventIndex >= 4 ? t.instruction : t.notFilled, color: "cir" },
  ] as const;
  const reset = () => { setEventIndex(0); setPrediction(null); setReviewAnswers({}); };
  const events = [t.event1, t.event2, t.event3, t.event4];

  return (
    <main id="main" className="fetch-registers-lesson">
      <div className="lesson-topline">
        <a href="/">← {t.home}</a>
        <button className="text-button" onClick={reset}>{t.reset} <span aria-hidden="true">↺</span></button>
      </div>
      <header className="fetch-heading">
        <p className="eyebrow">{t.homeEyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </header>

      <section className="fetch-topology" aria-label={language === "en" ? "Processor and memory connected by system buses" : "由系统总线连接的处理器与存储器"}>
        <section className="fetch-processor" role="region" aria-label={t.processor}>
          <h2>{t.processor}</h2>
          <p className="fetch-chip-note">{language === "en" ? "Four small storage locations" : "四个小型存储位置"}</p>
          <div className="fetch-register-grid">
            {registers.map((register) => {
              const name = t[register.key];
              const role = t[register.roleKey];
              const active = (eventIndex === 0 && register.key === "pc") ||
                (eventIndex === 1 && ["pc", "mar"].includes(register.key)) ||
                (eventIndex === 2 && register.key === "mar") ||
                (eventIndex === 3 && register.key === "mdr") ||
                (eventIndex === 4 && ["mdr", "cir"].includes(register.key));
              return <article key={register.key} className={`fetch-register ${register.color}${active ? " active" : ""}`} aria-label={name} aria-current={active ? "step" : undefined}>
                <strong>{name}</strong>
                <span className="fetch-register-value">{register.value}</span>
                <span className="fetch-register-role">{role}</span>
              </article>;
            })}
          </div>
          {eventIndex === 1 || eventIndex === 4 ? <p className="internal-transfer-note"><span aria-hidden="true">{eventIndex === 1 ? "PC → MAR" : "MDR → CIR"}</span> · {t.internalTransfer}</p> : null}
        </section>

        <section className="fetch-buses" aria-label={language === "en" ? "System buses" : "系统总线"}>
          <div className={`fetch-bus address${eventIndex === 2 ? " active" : ""}`} aria-label={t.addressBus} aria-current={eventIndex === 2 ? "step" : undefined}>
            <strong>{t.addressBus}</strong><span aria-hidden="true">{eventIndex === 2 ? "MAR ───────→ Memory" : "MAR ───────── Memory"}</span><b>{eventIndex >= 2 ? "20" : t.idle}</b>
          </div>
          <div className={`fetch-bus control${eventIndex === 2 ? " active" : ""}`} aria-label={t.controlBus} aria-current={eventIndex === 2 ? "step" : undefined}>
            <strong>{t.controlBus}</strong><span aria-hidden="true">CU ─────────→ Memory</span><b>{eventIndex >= 2 ? t.read : t.idle}</b>
          </div>
          <div className={`fetch-bus data${eventIndex === 3 ? " active" : ""}`} aria-label={t.dataBus} aria-current={eventIndex === 3 ? "step" : undefined}>
            <strong>{t.dataBus}</strong><span aria-hidden="true">Memory ──────→ MDR</span><b>{eventIndex >= 3 ? t.instruction : t.idle}</b>
          </div>
        </section>

        <section className="fetch-memory" role="region" aria-label={t.memory}>
          <p className="eyebrow">{t.memory}</p>
          <h2>{t.memoryAt}</h2>
          <strong>{t.instruction}</strong>
          <p>{t.standIn}</p>
        </section>
      </section>

      <p className="fetch-caveat">{t.caveat}</p>
      <p className="fetch-scope-note">{t.partialRelay}</p>

      <section className="fetch-walkthrough">
        <div className="fetch-prediction">
          <p className="eyebrow">{t.predictionLabel}</p>
          <h2>{t.question}</h2>
          <div role="group" aria-label={t.question} className="fetch-choices">
            {t.choices.map((choice, index) => <button key={choice} aria-pressed={prediction === index} onClick={() => setPrediction(index)}>{choice}</button>)}
          </div>
          {prediction !== null && <p role="status">{prediction === 0 ? t.correct : t.tryAgain}</p>}
        </div>
        <div className="fetch-computer-event">
          <p className="eyebrow">{t.eventLabel} · {t.eventIndex[eventIndex]}</p>
          <p role="status" aria-live="polite">{eventIndex === 0 ? t.initialEvent : events[eventIndex - 1]}</p>
          <button className="primary" disabled={prediction === null || eventIndex >= events.length} onClick={() => setEventIndex((current) => Math.min(current + 1, events.length))}>{eventIndex >= events.length ? t.completed : t.next}</button>
        </div>
      </section>

      {eventIndex === events.length && <section className="fetch-review" aria-labelledby="fetch-review-title">
        <p className="eyebrow">{language === "en" ? "YOUR TURN" : "轮到你了"}</p>
        <h2 id="fetch-review-title">{t.reviewTitle}</h2>
        <div className="fetch-review-grid">
          {t.reviewQuestions.map((question, index) => <fieldset className="fetch-review-question" key={question.prompt}>
            <legend>{question.prompt}</legend>
            <div className="fetch-choices">
              {question.choices.map((choice, choiceIndex) => <button type="button" key={choice} aria-pressed={reviewAnswers[index] === choiceIndex} onClick={() => setReviewAnswers((current) => ({ ...current, [index]: choiceIndex }))}>{choice}</button>)}
            </div>
            {reviewAnswers[index] !== undefined && <p className="fetch-review-feedback" role="status">{reviewAnswers[index] === question.answer ? question.explanation : (language === "en" ? "Check which kind of information that bus or signal carries." : "想一想这条总线或信号传送的是什么信息。")}</p>}
          </fieldset>)}
        </div>
      </section>}
    </main>
  );
}
