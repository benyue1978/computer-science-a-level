import { content, type Language } from './content';
import { processorContent } from './processorContent';
import { copyingContent } from './copyingContent';
import { busesControlContent } from './busesControlContent';
import { instructionCycleContent } from './instructionCycleContent';
import { fetchRegistersContent } from './fetchRegistersContent';
import { rtnNotationContent } from './rtnNotationContent';
import { fetchCycleContent } from './fetchCycleContent';
import './home.css';

export default function Home({ language }: { language: Language }) {
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
  return <main id="main" className="catalogue">
    <div className="catalogue-intro"><div><p className="eyebrow">CAMBRIDGE AS & A LEVEL · COMPUTER SCIENCE</p><h1>{zh ? <>从一个概念，<br />看懂整个过程。</> : <>Small ideas.<br />A bigger understanding.</>}</h1><p>{zh ? '按主题探索计算机科学，用图解和小实验把概念连起来。' : 'Explore computer science by topic. Connect the ideas through visual guides and small experiments.'}</p></div><div className="catalogue-index" aria-hidden="true"><span>LEARNING ATLAS</span><strong>CS<span> / 9618</span></strong><div>01 — {zh ? '处理器与指令周期' : 'Processor & instruction cycle'}</div><div>02 — {zh ? '数据库' : 'Databases'}</div></div></div>

    <div className="catalogue-section-head"><h2>Computer Science</h2><span>{zh ? 'CAMBRIDGE 9618 · 2 个主题 · 9 节内容' : 'CAMBRIDGE 9618 · 2 topics · 9 lessons'}</span></div>
    <section className="topic topic-fde" aria-labelledby="fde-heading"><div className="topic-overview"><p className="eyebrow">01 / {zh ? '处理器' : 'PROCESSOR FUNDAMENTALS'}</p><h2 id="fde-heading">FDE Cycle</h2><h3>{zh ? '取指 · 译码 · 执行' : 'Fetch · Decode · Execute'}</h3><p>{zh ? '计算机如何执行一条指令？从存储器和寄存器开始，一步步走到完整的指令周期。' : 'How does a computer carry out an instruction? Start with memory and registers, then build up to the complete cycle.'}</p><div className="catalogue-cycle" aria-hidden="true"><span>FETCH</span><b>↓</b><span>DECODE</span><b>↓</b><span>EXECUTE</span><small>↳ REPEAT ↺</small></div><span className="topic-meta">{zh ? '8 节探索 · 中英双语' : '8 explorations · English / 中文'}</span></div><div className="topic-lessons"><p className="lesson-order">{zh ? '建议按顺序学习，也可以直接进入任意一节。' : 'Follow the sequence, or jump into any lesson.'}</p>{lessons.map(([slug,title,label],i)=><div key={slug}>{[0,4,7].includes(i) && <p className="lesson-group">{i===0 ? (zh?'建立基础':'THE FOUNDATIONS') : i===4 ? (zh?'理解指令与取指过程':'INSIDE THE INSTRUCTION CYCLE') : (zh?'串起完整过程':'PUT IT ALL TOGETHER')}</p>}<a className="catalogue-lesson" href={'/learn/'+slug} aria-label={label}><span className="catalogue-step">{String(i+1).padStart(2,'0')}</span><span>{title}</span><span aria-hidden="true">↗</span></a></div>)}</div></section>

    <section className="topic topic-database" aria-labelledby="database-heading"><div className="topic-overview"><p className="eyebrow">02 / {zh ? '数据组织' : 'ORGANISING DATA'}</p><h2 id="database-heading">{zh ? '数据库' : 'Databases'}</h2><p>{zh ? '数据怎样放进表里？不同的表如何建立联系？从一张学生名单开始。' : 'How do tables organise data, and how do they connect? Begin with a simple student list.'}</p><span className="topic-meta">{zh ? '1 节图解 · 中文' : '1 visual guide · 中文'}</span></div><div className="database-entry"><div className="catalogue-tables" aria-hidden="true"><div><b>STUDENT</b><span><em>S01</em> 小林</span><span><em>S02</em> 小雨</span></div><strong>→</strong><div><b>CLASS</b><span><em>7A</em> 201</span><span><em>7B</em> 202</span></div></div><a className="catalogue-lesson" href="/learn/database-keys"><span className="catalogue-step">01</span><span>{zh ? '一张名单，读懂数据库里的 Key' : 'Tables & keys: an illustrated guide'}<small>{zh ? '主键、候选键、次键、外键与复合键' : 'Primary, candidate, secondary, foreign & composite keys'}</small></span><span aria-hidden="true">↗</span></a></div></section>

    <div className="catalogue-section-head"><h2>{zh ? 'Business Study · 商业学习' : 'Business Study'}</h2><span>{zh ? 'CAMBRIDGE 9609 · AS 与 A Level' : 'CAMBRIDGE 9609 · AS & A LEVEL'}</span></div>
    <section className="business-study-panel" aria-labelledby="business-study-heading">
      <div className="business-study-mark" aria-hidden="true"><span>CAMBRIDGE</span><strong>9609</strong><span>AS & A LEVEL</span></div>
      <div className="business-study-copy"><p className="eyebrow">{zh ? '商业课程 · 独立学习站' : 'BUSINESS COURSE · STUDY SITE'}</p><h2 id="business-study-heading">{zh ? 'Business 商业学习站' : 'Business Study'}</h2><p>{zh ? '按 Cambridge 9609 考纲学习商业概念与答题方法，配合历年题练习和专题讲义。' : 'Follow the Cambridge 9609 syllabus, learn business concepts and exam technique, and practise with past questions and topic notes.'}</p><span>{zh ? 'AS 与 A Level · 考纲导向学习' : 'AS & A Level · syllabus-aligned learning'}</span></div>
      <a href="/business/">{zh ? '进入 Business Study' : 'Explore Business Study'} <span aria-hidden="true">↗</span></a>
    </section>

    <div className="catalogue-section-head"><h2>{zh ? '词汇与真题工具' : 'Vocabulary & past-paper tools'}</h2><span>{zh ? '独立练习工具' : 'STANDALONE PRACTICE TOOLS'}</span></div>
    <div className="catalogue-tools">
      <aside className="catalogue-vocab" aria-labelledby="vocab-heading"><div className="vocab-symbol" aria-hidden="true">Aa<span>词</span></div><div><p className="eyebrow">{zh ? '日常练习' : 'DAILY PRACTICE'}</p><h2 id="vocab-heading">{zh ? '每日词汇' : 'Daily vocabulary'}</h2><p>{zh ? '每天积累一点，按自己的节奏学习与复习。' : 'Build your vocabulary a little each day, with time to learn and review.'}</p></div><a href="/vocabulary">{zh ? '打开词汇本' : 'Open vocabulary'} <span aria-hidden="true">↗</span></a></aside>
      <aside className="catalogue-vocab catalogue-business-vocabulary" aria-labelledby="business-vocabulary-heading"><div className="vocab-symbol" aria-hidden="true">B<span>9609</span></div><div><p className="eyebrow">{zh ? 'CAMBRIDGE 9609 · AS 与 A Level' : 'CAMBRIDGE 9609 · AS & A LEVEL BUSINESS'}</p><h2 id="business-vocabulary-heading">{zh ? '商务术语库 · 情境英语' : 'Business vocabulary'}</h2><p>{zh ? '搜索英中术语，按单元查看解释和例句，也可以打印词条。' : 'Search bilingual business terms by unit, explore examples, and print entries.'}</p></div><a href="/business-vocabulary">{zh ? '打开商务术语库' : 'Open vocabulary'} <span aria-hidden="true">↗</span></a></aside>
      <aside className="catalogue-vocab catalogue-pastpaper" aria-labelledby="pastpaper-heading"><div className="vocab-symbol" aria-hidden="true">P<span>1–4</span></div><div><p className="eyebrow">CAMBRIDGE 9618 · PAST PAPERS</p><h2 id="pastpaper-heading">{zh ? '历年真题自习室' : 'Past paper study room'}</h2><p>{zh ? '按考纲章节学习笔记、筛选历年题目，打印题目与答案讲解。' : 'Study chapter notes, explore past paper questions, and print questions with answer guides.'}</p></div><a href="/pastpaper/">{zh ? '打开真题自习室' : 'Open past papers'} <span aria-hidden="true">↗</span></a></aside>
    </div>
    <footer className="catalogue-footer"><span>{zh ? '学习目录会随新内容持续扩充。' : 'This collection will grow as new topics are added.'}</span><span>{zh ? '先理解，再连接。' : 'Understand first. Then connect.'}</span></footer>
  </main>;
}
