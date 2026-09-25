import { useState } from "react";
import { busesControlContent, type BusesLanguage } from "./busesControlContent";

type Props = { language: BusesLanguage };
type Mode = "read" | "write";

export default function BusesControl({ language }: Props) {
  const t = busesControlContent[language];
  const [mode, setMode] = useState<Mode>("read");
  const [eventIndex, setEventIndex] = useState(0);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [showMatches, setShowMatches] = useState(false);
  const events = mode === "read" ? t.readEvents : t.writeEvents;
  const memory = mode === "read" ? t.readMemory : t.writeMemory;
  const finalMemory = mode === "write" && eventIndex >= events.length;
  const finalReceiver = mode === "read" && eventIndex >= events.length;
  const correctPrediction = prediction === 0;
  const activeBus = eventIndex === 0 ? null : eventIndex === 1 ? "address" : eventIndex === 2 ? "control" : eventIndex === 3 ? "data" : null;

  const reset = () => {
    setMode("read");
    setEventIndex(0);
    setPrediction(null);
    setShowMatches(false);
  };

  return (
    <main id="main" className="buses-lesson">
      <div className="lesson-topline">
        <a href="/">← {t.home}</a>
        <button className="text-button" onClick={reset}>
          {t.reset} <span aria-hidden="true">↺</span>
        </button>
      </div>
      <header className="buses-heading">
        <p className="eyebrow">{language === "en" ? "EXPLORATION 04" : "探索 04"}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </header>

      <section className="bus-topology" aria-label={t.systemBus}>
        <div className="bus-flow-diagram">
          <div className="bus-node bus-cpu">{t.cpu}</div>
          <div className="bus-group">
            <span className="bus-group-label">{t.systemBus}</span>
            <div className={`bus-lane address-lane${activeBus === "address" ? " active" : ""}`} aria-label={language === "en" ? "Address bus lane" : "地址总线通道"} aria-current={activeBus === "address" ? "step" : undefined}>
              <strong>{t.addressBus}</strong><span>{t.addressDirection}</span><small>{t.where}</small>
            </div>
            <div className={`bus-lane data-lane${activeBus === "data" ? " active" : ""}`} aria-label={language === "en" ? "Data bus lane" : "数据总线通道"} aria-current={activeBus === "data" ? "step" : undefined}>
              <strong>{t.dataBus}</strong><span>{t.dataDirection}</span><small>{t.value}</small>
            </div>
            <div className={`bus-lane control-lane${activeBus === "control" ? " active" : ""}`} aria-label={language === "en" ? "Control bus lane" : "控制总线通道"} aria-current={activeBus === "control" ? "step" : undefined}>
              <strong>{t.controlBus}</strong><span>{t.controlSignals}<br />{t.controlDirection}</span><small>{t.request}</small>
            </div>
          </div>
          <div className="bus-endpoints">
            <div className="bus-node">{t.memory}</div>
            <div className="bus-node">{t.ports}</div>
          </div>
        </div>
        <div className="bus-roles">
          <p><strong>{t.addressBus} · {t.where}</strong>{t.addressMeaning}</p>
          <p><strong>{t.dataBus} · {t.value}</strong>{t.dataMeaning}</p>
          <p><strong>{t.controlBus} · {t.request}</strong>{t.controlMeaning}</p>
        </div>
        <p className="port-note">{t.portMeaning}</p>
        <p className="cu-note">{t.cu}</p>
      </section>

      <section className="bus-explorer" aria-labelledby="explorer-heading">
        <div className="bus-explorer-heading">
          <div>
            <p className="eyebrow">{t.tryIt}</p>
            <h2 id="explorer-heading">{t.modePrompt}</h2>
          </div>
          <div className="bus-mode" role="group" aria-label={t.modePrompt}>
            <button aria-pressed={mode === "read"} onClick={() => { setMode("read"); setEventIndex(0); setPrediction(null); }}>{t.read}</button>
            <button aria-pressed={mode === "write"} onClick={() => { setMode("write"); setEventIndex(0); setPrediction(null); }}>{t.write}</button>
          </div>
        </div>

        <div className="bus-example-state" aria-live="polite">
          <div><span>{t.memory}</span><strong>{finalMemory ? t.finalMemory : memory}</strong></div>
          <div><span>{t.cpu}</span><strong>{mode === "read" ? finalReceiver ? t.finalReceiver : t.readReceiver : t.writeValue}</strong></div>
        </div>

        <div className="bus-try">
          <h3>{t.tryIt}</h3>
          <p>{mode === "read" ? t.readQuestion : t.writeQuestion}</p>
          <div className="bus-predictions">
            {(mode === "read" ? t.readChoices : t.writeChoices).map((choice, index) => (
              <button key={choice} aria-pressed={prediction === index} onClick={() => setPrediction(index)}>{choice}</button>
            ))}
          </div>
          {prediction !== null && <p className="prediction-note" aria-live="polite">{correctPrediction ? t.correctPrediction : t.incorrectPrediction}</p>}
        </div>

        <div className="computer-event">
          <p className="eyebrow">{t.eventLabel}</p>
          <div className="event-output" role="status" aria-live="polite">
            {eventIndex === 0 ? t.predictFirst : events[eventIndex - 1]}
          </div>
          <button className="primary" disabled={prediction === null || eventIndex >= events.length} onClick={() => setEventIndex((current) => Math.min(current + 1, events.length))}>
            {eventIndex >= events.length ? t.completed : t.nextEvent}
          </button>
        </div>
      </section>

      <section className="bus-check" aria-label={t.checkQuestion}>
        <p className="eyebrow">{t.checkQuestion}</p>
        <button className="text-button" aria-expanded={showMatches} onClick={() => setShowMatches((shown) => !shown)}>{showMatches ? t.hideMatches : t.showMatches}</button>
        {showMatches && <div className="bus-check-grid">
          <p><strong>{t.where}</strong><span>{t.addressBus}</span></p>
          <p><strong>{t.value}</strong><span>{t.dataBus}</span></p>
          <p><strong>{t.request}</strong><span>{t.controlBus}</span></p>
        </div>}
      </section>
    </main>
  );
}
