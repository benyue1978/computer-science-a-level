import { useState } from "react";
import { instructionCycleContent, type InstructionCycleLanguage } from "./instructionCycleContent";

type Props = { language: InstructionCycleLanguage };

export default function InstructionCycle({ language }: Props) {
  const t = instructionCycleContent[language];
  const [eventIndex, setEventIndex] = useState(0);
  const [prediction, setPrediction] = useState<number | null>(null);
  const activePhase = eventIndex === 0 ? null : (eventIndex - 1) % 3;
  const reset = () => { setEventIndex(0); setPrediction(null); };

  return (
    <main id="main" className="cycle-lesson">
      <div className="lesson-topline">
        <a href="/">← {t.home}</a>
        <button className="text-button" onClick={reset}>{t.reset} <span aria-hidden="true">↺</span></button>
      </div>
      <header className="cycle-heading">
        <p className="eyebrow">{language === "en" ? "EXPLORATION 05" : "探索 05"}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </header>
      <p className="cycle-definition">{t.instructionMeaning}</p>

      <section className="cycle-diagram" aria-label={t.cycleLabel}>
        <ol className="cycle-phases">
          {t.phases.map((phase, index) => (
            <li key={phase} aria-label={phase} aria-current={activePhase === index ? "step" : undefined} className={activePhase === index ? "active" : ""}>
              <span className="cycle-phase-number">0{index + 1}</span>
              <strong>{phase}</strong>
              <span>{t.phaseDescriptions[index]}</span>
              {index < 2 && <span className="cycle-arrow" aria-hidden="true">→</span>}
            </li>
          ))}
        </ol>
        <p className="cycle-loop"><span aria-hidden="true">↶</span> {t.loopLabel}</p>
        <p className="cycle-meaning">{t.cycleMeaning}</p>
      </section>

      <section className="cycle-example" aria-label={t.exampleLabel}>
        <p className="eyebrow">{t.exampleLabel}</p>
        <div className="cycle-instructions">
          {t.instructions.map((instruction, index) => (
            <div className={eventIndex > index * 3 && eventIndex <= index * 3 + 3 ? "cycle-instruction active" : "cycle-instruction"} key={instruction}>
              <span>{language === "en" ? `Instruction ${index + 1}` : `指令 ${index + 1}`}</span>
              <strong>{instruction}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="cycle-walkthrough" aria-labelledby="cycle-try-heading">
        <div className="cycle-prediction">
          <p className="eyebrow">{t.tryLabel}</p>
          <h2 id="cycle-try-heading">{t.question}</h2>
          <div className="cycle-choices" role="group" aria-label={t.question}>
            {t.choices.map((choice, index) => <button key={choice} aria-pressed={prediction === index} onClick={() => setPrediction(index)}>{choice}</button>)}
          </div>
          {prediction !== null && <p className="cycle-feedback" role="status">{prediction === 0 ? t.predictionRight : t.predictionTry}</p>}
        </div>
        <div className="cycle-computer">
          <p className="eyebrow">{t.eventLabel}</p>
          <div className="cycle-event" role="status" aria-live="polite">{eventIndex === 0 ? t.initialEvent : t.events[eventIndex - 1]}</div>
          <button className="primary" disabled={prediction === null || eventIndex >= t.events.length} onClick={() => setEventIndex((current) => Math.min(current + 1, t.events.length))}>{eventIndex >= t.events.length ? t.completed : t.nextEvent}</button>
        </div>
      </section>

      <section className="cycle-clock" aria-labelledby="clock-heading">
        <p className="eyebrow">{language === "en" ? "TIMING" : "计时"}</p>
        <h2 id="clock-heading">{t.clockHeading}</h2>
        <p>{t.clockMeaning}</p>
        <figure className="clock-pulses" aria-label={t.clockImageLabel}>
          <svg className="clock-wave" viewBox="0 0 180 50" role="img" aria-label={t.clockImageLabel}>
            <path d="M0 36 H40 V12 H110 V36 H180" />
          </svg>
          <figcaption>{t.clockCycleLabel}</figcaption>
        </figure>
        <p className="clock-example">{t.clockExample}</p>
        <p className="clock-distinction">{t.clockDistinction}</p>
      </section>
    </main>
  );
}
