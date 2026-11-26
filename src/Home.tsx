import type { Language } from './content';
import './home.css';

export default function Home({ language }: { language: Language }) {
  const zh = language === 'zh';

  return <main id="main" className="catalogue home-catalogue">
    <div className="catalogue-intro">
      <div>
        <p className="eyebrow">CAMBRIDGE AS & A LEVEL · 9618 COMPUTER SCIENCE · 9609 BUSINESS</p>
        <h1>{zh ? <>计算机科学与商业，<br />从理解到应用。</> : <>Computer Science<br />and Business.</>}</h1>
        <p>{zh ? '选择课程，进入对应的词汇、真题和主题学习内容。' : 'Choose a subject to explore its vocabulary, past papers, and guided learning.'}</p>
      </div>
      <div className="catalogue-index" aria-hidden="true">
        <span>LEARNING ATLAS</span>
        <strong>{zh ? 'CS + 商业' : 'CS + BUSINESS'}</strong>
        <div>01 — Computer Science / 9618</div>
        <div>02 — Business / 9609</div>
      </div>
    </div>

    <section className="subject-section subject-computer-science" aria-labelledby="cs-subject-heading">
      <header className="subject-section-heading">
        <div><p className="eyebrow">CAMBRIDGE AS & A LEVEL</p><h2 id="cs-subject-heading">Computer Science</h2></div>
        <span className="subject-code">9618</span>
      </header>
      <div className="subject-resource-grid">
        <a className="subject-resource" href="/vocabulary">
          <span className="subject-resource-label">VOCABULARY · COURSEBOOK</span>
          <h3>{zh ? '计算机科学词汇' : 'CS Vocabulary'}</h3>
          <p>{zh ? '来自 Cambridge 计算机科学教材的词汇，结合原文例句学习。' : 'Learn vocabulary from the Cambridge Computer Science coursebook in context.'}</p>
          <span className="subject-resource-arrow" aria-hidden="true">↗</span>
        </a>
        <a className="subject-resource" href="/pastpaper/">
          <span className="subject-resource-label">PAST PAPERS · 9618</span>
          <h3>{zh ? '历年真题自习室' : 'Past paper study room'}</h3>
          <p>{zh ? '按考纲章节查看笔记、筛选历年题目，并打印练习与讲解。' : 'Study by syllabus chapter, find past questions, and print practice sets with explanations.'}</p>
          <span className="subject-resource-arrow" aria-hidden="true">↗</span>
        </a>
        <a className="subject-resource" href="/computer-science#fde">
          <span className="subject-resource-label">PROCESSOR FUNDAMENTALS</span>
          <h3>FDE Cycle</h3>
          <p>{zh ? '用 8 节交互内容学习取指、译码与执行。' : 'Explore fetch, decode, and execute through eight interactive lessons.'}</p>
          <span className="subject-resource-arrow" aria-hidden="true">↗</span>
        </a>
        <a className="subject-resource" href="/computer-science#databases">
          <span className="subject-resource-label">ORGANISING DATA</span>
          <h3>{zh ? '数据库' : 'Databases'}</h3>
          <p>{zh ? '用图解理解数据表、主键以及不同类型的 Key。' : 'Use an illustrated guide to understand tables and database keys.'}</p>
          <span className="subject-resource-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    </section>

    <section className="subject-section subject-business" aria-labelledby="business-subject-heading">
      <header className="subject-section-heading">
        <div><p className="eyebrow">CAMBRIDGE AS & A LEVEL</p><h2 id="business-subject-heading">Business</h2></div>
        <span className="subject-code">9609</span>
      </header>
      <div className="subject-resource-grid subject-business-grid">
        <a className="subject-resource subject-resource-featured" href="/business/">
          <span className="subject-resource-label">COURSE · SYLLABUS & EXAM PRACTICE</span>
          <h3>{zh ? 'Business Study' : 'Business Study'}</h3>
          <p>{zh ? '按 9609 考纲学习商业概念、答题方法，并练习历年小问。' : 'Follow the 9609 syllabus, learn business concepts and exam technique, and practise past questions.'}</p>
          <span className="subject-resource-arrow" aria-hidden="true">↗</span>
        </a>
        <a className="subject-resource subject-resource-vocabulary" href="/business-vocabulary">
          <span className="subject-resource-label">VOCABULARY · ENGLISH / 中文</span>
          <h3>{zh ? 'Business 词汇' : 'Business vocabulary'}</h3>
          <p>{zh ? '按单元搜索英中商业术语，查看解释、例句并打印词条。' : 'Search bilingual business terms by unit, explore examples, and print entries.'}</p>
          <span className="subject-resource-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    </section>

    <footer className="catalogue-footer"><span>{zh ? '学习目录会随新内容持续扩充。' : 'This collection will grow as new topics are added.'}</span><span>{zh ? '先理解，再连接。' : 'Understand first. Then connect.'}</span></footer>
  </main>;
}
