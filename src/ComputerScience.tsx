import { content, type Language } from './content';
import { processorContent } from './processorContent';
import { copyingContent } from './copyingContent';
import { busesControlContent } from './busesControlContent';
import { instructionCycleContent } from './instructionCycleContent';
import { fetchRegistersContent } from './fetchRegistersContent';
import { rtnNotationContent } from './rtnNotationContent';
import { fetchCycleContent } from './fetchCycleContent';
import './home.css';

export default function ComputerScience({ language }: { language: Language }) {
  const zh = language === 'zh';
  const lessons = [
    ['memory', content[language].title, content[language].enter],
    ['processor-registers', processorContent[language].title, zh ? '探索处理器' : 'Explore processors'],
    ['copying-values', copyingContent[language].title, zh ? '探索复制' : 'Explore copying'],
    ['buses-and-control', busesControlContent[language].title, busesControlContent[language].explore],
    ['instruction-cycle', instructionCycleContent[language].title, instructionCycleContent[language].explore],
    ['fetch-registers', fetchRegistersContent[language].title, fetchRegistersContent[language].explore],
    ['rtn-notation', rtnNotationContent[language].title, rtnNotationContent[language].explore],
    ['fetch-cycle', fetchCycleContent[language].title, fetchCycleContent[language].explore],
  ];

  return <main id="main" className="catalogue cs-library-page">
    <a className="cs-library-back" href="/">← {zh ? '返回课程首页' : 'Back to subjects'}</a>
    <div className="catalogue-intro">
      <div><p className="eyebrow">CAMBRIDGE AS & A LEVEL · COMPUTER SCIENCE · 9618</p><h1>{zh ? <>计算机科学<br />主题学习</> : <>Computer Science<br />topic library.</>}</h1><p>{zh ? '从处理器指令周期到数据库，用交互内容和图解逐步理解考纲概念。' : 'Build your understanding of the syllabus through interactive processor lessons and an illustrated database guide.'}</p></div>
      <div className="catalogue-index" aria-hidden="true"><span>COURSE 9618</span><strong>CS<span> / 9618</span></strong><div>01 — {zh ? '处理器与指令周期' : 'Processor & instruction cycle'}</div><div>02 — {zh ? '数据库' : 'Databases'}</div></div>
    </div>

    <div className="catalogue-section-head"><h2>{zh ? '处理器基础 · FDE Cycle' : 'Processor fundamentals · FDE Cycle'}</h2><span>{zh ? '8 节探索 · 中英双语' : '8 lessons · English / 中文'}</span></div>
    <section id="fde" className="topic topic-fde" aria-labelledby="fde-heading"><div className="topic-overview"><p className="eyebrow">01 / {zh ? '处理器' : 'PROCESSOR FUNDAMENTALS'}</p><h2 id="fde-heading">FDE Cycle</h2><h3>{zh ? '取指 · 译码 · 执行' : 'Fetch · Decode · Execute'}</h3><p>{zh ? '计算机如何执行一条指令？从存储器和寄存器开始，一步步走到完整的指令周期。' : 'How does a computer carry out an instruction? Start with memory and registers, then build up to the complete cycle.'}</p><div className="catalogue-cycle" aria-hidden="true"><span>FETCH</span><b>↓</b><span>DECODE</span><b>↓</b><span>EXECUTE</span><small>↳ REPEAT ↺</small></div><span className="topic-meta">{zh ? '8 节探索 · 中英双语' : '8 explorations · English / 中文'}</span></div><div className="topic-lessons"><p className="lesson-order">{zh ? '建议按顺序学习，也可以直接进入任意一节。' : 'Follow the sequence, or jump into any lesson.'}</p>{lessons.map(([slug, title, label], i) => <div key={slug}>{[0, 4, 7].includes(i) && <p className="lesson-group">{i === 0 ? (zh ? '建立基础' : 'THE FOUNDATIONS') : i === 4 ? (zh ? '理解指令与取指过程' : 'INSIDE THE INSTRUCTION CYCLE') : (zh ? '串起完整过程' : 'PUT IT ALL TOGETHER')}</p>}<a className="catalogue-lesson" href={'/learn/' + slug} aria-label={label}><span className="catalogue-step">{String(i + 1).padStart(2, '0')}</span><span>{title}</span><span aria-hidden="true">↗</span></a></div>)}</div></section>

    <div className="catalogue-section-head"><h2>{zh ? '数据库' : 'Databases'}</h2><span>{zh ? '1 节图解 · 中文' : '1 visual guide · 中文'}</span></div>
    <section id="databases" className="topic topic-database" aria-labelledby="database-heading"><div className="topic-overview"><p className="eyebrow">02 / {zh ? '数据组织' : 'ORGANISING DATA'}</p><h2 id="database-heading">{zh ? '数据库' : 'Databases'}</h2><p>{zh ? '数据怎样放进表里？不同的表如何建立联系？从一张学生名单开始。' : 'How do tables organise data, and how do they connect? Begin with a simple student list.'}</p><span className="topic-meta">{zh ? '1 节图解 · 中文' : '1 visual guide · 中文'}</span></div><div className="database-entry"><div className="catalogue-tables" aria-hidden="true"><div><b>STUDENT</b><span><em>S01</em> 小林</span><span><em>S02</em> 小雨</span></div><strong>→</strong><div><b>CLASS</b><span><em>7A</em> 201</span><span><em>7B</em> 202</span></div></div><a className="catalogue-lesson" href="/learn/database-keys"><span className="catalogue-step">01</span><span>{zh ? '一张名单，读懂数据库里的 Key' : 'Tables & keys: an illustrated guide'}<small>{zh ? '主键、候选键、次键、外键与复合键' : 'Primary, candidate, secondary, foreign & composite keys'}</small></span><span aria-hidden="true">↗</span></a></div></section>

    <footer className="catalogue-footer"><span>{zh ? '更多计算机科学主题会持续加入。' : 'More Computer Science topics will be added over time.'}</span><span><a href="/">{zh ? '返回全部课程' : 'Back to all subjects'} ↗</a></span></footer>
  </main>;
}
