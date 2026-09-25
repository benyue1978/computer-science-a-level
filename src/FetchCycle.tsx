import { useState } from "react";
import { fetchCycleContent, type FetchCycleLanguage } from "./fetchCycleContent";

type Props = { language: FetchCycleLanguage };

export default function FetchCycle({ language }: Props) {
  const t = fetchCycleContent[language];
  const [stepIndex, setStepIndex] = useState(0);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [examAnswer, setExamAnswer] = useState("");
  const [showGuidance, setShowGuidance] = useState(false);
  const complete = stepIndex >= t.steps.length;
  const currentStep = t.steps[stepIndex];
  const state = stepIndex === 0 ? {
    pc: "20", mar: t.notFilled, mdr: t.notFilled, cir: t.notFilled, acc: "7",
    addressBus: "—", dataBus: "—", controlBus: "—",
  } : t.steps[stepIndex - 1].state;
  const lastStep = stepIndex > 0 ? t.steps[stepIndex - 1] : null;
  const stage = currentStep?.stage ?? "execute";
  const reset = () => {
    setStepIndex(0);
    setPrediction(null);
    setExamAnswer("");
    setShowGuidance(false);
  };
  const advance = () => {
    if (prediction === null || complete) return;
    setStepIndex((value) => value + 1);
    setPrediction(null);
  };

  const register = (name: string, fullName: string, value: string) => (
    <div className="fetch-cycle-register" role="group" aria-label={name}>
      <strong>{name}</strong><span>{fullName}</span>{name === "ACC" && <small>{t.accRole}</small>}{value === t.instructionText ? <span className="fetch-cycle-instruction">“{value}”</span> : <code>{value}</code>}
    </div>
  );

  return (
    <main id="main" className="fetch-cycle-lesson">
      <div className="lesson-topline">
        <a href="/">← {t.home}</a>
        <button className="text-button" onClick={reset}>{t.reset} <span aria-hidden="true">↺</span></button>
      </div>
      <header className="fetch-cycle-heading">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </header>

      <section className="fetch-cycle-map" aria-labelledby="fetch-cycle-map-title">
        <h2 id="fetch-cycle-map-title">{t.cycleMapTitle}</h2>
        <ol>
          {(["fetch", "decode", "execute"] as const).map((name) => (
            <li key={name} aria-current={stage === name && !complete ? "step" : undefined}>
              <strong>{t.stageNames[name]}</strong><span>{t[`${name}Short`]}</span>
            </li>
          ))}
        </ol>
        <p className="fetch-cycle-loop"><span aria-hidden="true">↶</span> {t.loopShort}</p>
      </section>

      <section className="fetch-cycle-workbench" aria-labelledby="fetch-cycle-workbench-title">
        <div className="fetch-cycle-title-row">
          <div><p className="eyebrow">{t.stepLabel}{!complete ? ` · ${stepIndex + 1}/${t.steps.length}` : ""}</p><h2 id="fetch-cycle-workbench-title">{t.walkthrough}</h2></div>
          {currentStep && <span className="fetch-cycle-stage-badge">{t.stageNames[currentStep.stage]}</span>}
        </div>

        <section className="fetch-cycle-rtn" aria-label={t.rtnTitle}>
          <p className="eyebrow">{t.rtnTitle}</p>
          <div className="fetch-cycle-rtn-lines" aria-label={t.rtnSequenceLabel}>
            {["MAR ← [PC]", "PC ← [PC] + 1", "MDR ← [[MAR]]", "CIR ← [MDR]"].map((line, index) => (
              <code key={line} aria-current={currentStep?.rtLine === index ? "step" : undefined}>{line}</code>
            ))}
          </div>
        </section>

        <div className="fetch-cycle-layout">
          <section className="fetch-cycle-computer" aria-label={t.stateTitle}>
            <div className="fetch-cycle-memory" role="group" aria-label={t.memoryTitle}>
              <p className="eyebrow">{t.memoryTitle}</p>
              <strong>{t.memoryAddress}</strong>
              <span>{t.instruction}</span>
              <span className="fetch-cycle-instruction">“{t.instructionText}”</span>
              <small>{t.instructionCaveat}</small>
            </div>
            <div className="fetch-cycle-processor">
              <p className="eyebrow">{t.stateTitle}</p>
              <div className="fetch-cycle-registers">
                {register("PC", t.pc, state.pc)}
                {register("MAR", t.mar, state.mar)}
                {register("MDR", t.mdr, state.mdr)}
                {register("CIR", t.cir, state.cir)}
                {register("ACC", t.acc, state.acc)}
              </div>
              <div className="fetch-cycle-units">
                <div role="group" aria-label={t.cuTitle}><strong>{t.cuTitle}</strong><span>{stepIndex > 4 ? t.decodeResult : t.cuWaiting}</span></div>
                <div role="group" aria-label={t.aluTitle}><strong>{t.aluTitle}</strong><span>{stepIndex > 5 ? "7 + 5 = 12" : t.aluWaiting}</span></div>
              </div>
            </div>
            <div className="fetch-cycle-buses" role="group" aria-label={t.busActivityLabel}>
              <div><strong>{t.addressBus}</strong><code>{state.addressBus === "—" ? t.noSignal : state.addressBus}</code></div>
              <div><strong>{t.controlBus}</strong><code>{state.controlBus === "—" ? t.noSignal : state.controlBus}</code></div>
              <div><strong>{t.dataBus}</strong><code>{state.dataBus === "—" ? t.noSignal : state.dataBus}</code></div>
            </div>
          </section>

          <section className="fetch-cycle-action" aria-label={t.questionLabel}>
            {!complete && currentStep ? <>
              <p className="eyebrow">{t.questionLabel}</p>
              <h3>{currentStep.question}</h3>
              <div className="fetch-cycle-choices" role="group" aria-label={currentStep.question}>
                {currentStep.choices.map((choice, index) => <button key={choice} aria-pressed={prediction === index} onClick={() => setPrediction(index)}>{choice}</button>)}
              </div>
              {prediction !== null && <p className="fetch-cycle-feedback" role="status">{prediction === currentStep.answer ? (language === "en" ? "Prediction recorded. The processor has not moved yet." : "预测已记录。处理器还没有执行下一步。") : currentStep.retry}</p>}
            </> : <div className="fetch-cycle-complete"><p className="eyebrow">{t.stageNames.execute}</p><h3>{t.completeTitle}</h3><p>{t.completeText}</p><strong>{t.nextAddress}</strong></div>}
            <div className="fetch-cycle-event">
              <p className="eyebrow">{t.eventLabel}{!complete ? ` · ${stepIndex}/${t.steps.length}` : ""}</p>
              <p role="status" aria-live="polite">{lastStep?.event ?? ""}</p>
              <button className="primary" disabled={complete || prediction === null} onClick={advance}>{complete ? t.completeTitle : t.nextStep}</button>
            </div>
          </section>
        </div>
      </section>

      {complete && <>
        <section className="fetch-cycle-clock" aria-labelledby="fetch-cycle-clock-title">
          <p className="eyebrow">{t.clockTitle}</p>
          <h2 id="fetch-cycle-clock-title">{t.clockTitle}</h2>
          <p>{t.clockText}</p><p>{t.clockDifference}</p>
        </section>
        <section className="fetch-cycle-exam" aria-labelledby="fetch-cycle-exam-title">
          <p className="eyebrow">{t.examTitle}</p><h2 id="fetch-cycle-exam-title">{t.examPrompt}</h2>
          <label htmlFor="fetch-cycle-exam-answer">{t.examLabel}</label>
          <textarea id="fetch-cycle-exam-answer" value={examAnswer} onChange={(event) => { setExamAnswer(event.target.value); setShowGuidance(false); }} placeholder={t.examPlaceholder} rows={6} />
          <button className="primary" disabled={!examAnswer.trim()} onClick={() => setShowGuidance(true)}>{t.examButton}</button>
          {showGuidance && <div className="fetch-cycle-guidance" aria-live="polite">
            <h3>{t.markPointsTitle}</h3><ol>{t.markPoints.map((point) => <li key={point}>{point}</li>)}</ol>
            <h3>{t.modelAnswerTitle}</h3><p>{t.modelAnswer}</p>
          </div>}
        </section>
      </>}
    </main>
  );
}
