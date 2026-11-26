(() => {
  const catalog = window.BUSINESS_CATALOG;
  const guides = window.BUSINESS_GUIDES || {};
  const sectionGuides = window.BUSINESS_SECTION_GUIDES || {};
  const formulaBank = window.BUSINESS_FORMULAS || {};
  const terms = window.BUSINESS_TERMS || [];
  const questions = window.BUSINESS_QUESTIONS || [];
  const unitId = Number(document.body.dataset.unit);
  const unit = catalog?.units.find((item) => item.id === unitId);
  if (!unit) return;

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const sections = catalog.sections.filter((section) => section.unit === unitId);
  const sectionMap = new Map(sections.map((section) => [section.id, section]));
  const unitQuestions = questions.filter((question) => (question.topicIds || []).some((topic) => sectionMap.has(topic)));
  const groups = new Map();
  for (const section of sections) {
    const key = section.id.split(".").slice(0, 2).join(".");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(section);
  }
  const selected = new Set();
  const qById = new Map(questions.map((question) => [question.id, question]));
  const topicName = (code) => {
    const section = catalog.sections.find((item) => item.id === code);
    return section ? `${code} ${section.titleZh}` : String(code || "");
  };

  function sectionExplanation(guide) {
    if (!guide) return `<p class="muted">本小节的逐点讲解正在补充。</p>`;
    return `<section class="section-explanation"><div class="section-explanation-core"><h4>考纲讲解</h4><p>${esc(guide.core)}</p></div><div class="section-explanation-grid"><section><h4>本点要掌握</h4><ul>${(guide.scope || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></section><section class="section-score-guide"><h4>得分怎么拿</h4><ul>${(guide.answer || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></section><section class="section-pitfalls"><h4>容易失分</h4><ul>${(guide.pitfalls || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></section></div></section>`;
  }
  const paperName = { 1: "P1", 2: "P2", 3: "P3", 4: "P4" };
  const modeName = { memory: "记忆", understanding: "理解", calculation: "计算", analysis: "分析", evaluation: "评价" };

  const nav = [...groups.entries()].map(([key, items]) => `<a href="#topic-${key.replace(".", "-")}">${key} ${esc(guides[key]?.titleZh || items[0].titleZh)}</a>`).join("");

  function questionCard(question) {
    const qTopics = (question.topicIds || []).map((topic) => `<span class="question-topic-tag">${esc(topicName(topic))}</span>`).join("");
    const part = question.id.split("_Q").pop();
    const status = question.reviewStatus === "context-inferred" ? "同组推断" : "关键词匹配";
    return `<article class="question-card" data-question-id="${esc(question.id)}" data-year="${question.year}" data-paper="${question.paper}" data-mode="${esc(question.mode)}" data-difficulty="${question.difficulty}" data-search="${esc(`${question.id} ${question.paperLabel} ${question.command} ${question.focusZh} ${(question.topicIds || []).map(topicName).join(" ")}`).toLowerCase()}">
      <div class="question-card-head"><label class="question-select"><input type="checkbox" class="question-checkbox" value="${esc(question.id)}" aria-label="选择打印 ${esc(question.paperLabel)}"><span>选入打印</span></label><div class="question-ref"><strong>${esc(question.paperLabel || `${question.year} ${question.season} · ${paperName[question.paper]} · Q${part}`)}</strong><span>${question.marks ?? "—"} 分 · ${esc(question.command || "题目指令待核")}${question.mode ? ` · ${modeName[question.mode] || "综合"}` : ""} · 练习强度估计 ${question.difficulty}/4</span></div><span class="question-status">${esc(status)}</span></div>
      <p class="question-focus"><strong>练习焦点：</strong>${esc(question.focusZh || "待复核")}</p>
      <div class="question-topic-tags">${qTopics}</div>
      <details class="question-guidance"><summary>答题得分提示</summary><div class="question-guidance-body"><p><strong>答题抓手：</strong>${esc(question.scoreHintZh || "按指令词和分值组织答案，并用具体情境说明相关性。")}</p></div></details>
    </article>`;
  }

  const groupHtml = [...groups.entries()].map(([key, items]) => {
    const guide = guides[key] || { titleEn: items[0].titleEn, titleZh: items[0].titleZh, summary: "", points: [], exam: [], pitfalls: [] };
    const sectionHtml = items.map((section) => {
      const sectionTerms = terms.filter((term) => term.topicId === section.id);
      const sectionQuestions = unitQuestions.filter((question) => (question.topicIds || []).includes(section.id));
      const sectionGuide = sectionGuides[section.id];
      const termHtml = sectionTerms.length ? `<div class="term-list">${sectionTerms.map((term) => `<article class="term-card"><h4>${esc(term.term)}</h4><p class="term-zh">${esc(term.termZh)}</p><p>${esc(term.explanationZh || term.definitionEn)}</p>${term.exampleEn ? `<p class="term-example"><em>${esc(term.exampleEn)}</em><br>${esc(term.exampleZh || "")}</p>` : ""}</article>`).join("")}</div>` : `<p class="muted">本小节没有独立术语卡；按考纲标题复习，并用总词表搜索关联概念。</p>`;
      const questionHtml = sectionQuestions.length ? sectionQuestions.map(questionCard).join("") : `<p class="muted">当前索引没有找到直接匹配的小问。可在收录说明里查看待人工复核列表。</p>`;
      return `<details class="syllabus-row" id="section-${section.id.replaceAll(".", "-")}"><summary><span class="syllabus-code">${esc(section.id)}</span><span class="syllabus-name">${esc(section.titleZh)} <span class="muted">· ${esc(section.titleEn)}</span></span><span class="syllabus-question-count">${sectionQuestions.length} 道练习索引</span></summary><p class="muted syllabus-scope">考纲定位：${unit.stage === "AS" ? "AS 内容，直接对应 Paper 1 / Paper 2" : "A Level 内容，Paper 3 / Paper 4 以本阶段为直接考查范围；AS 为假定知识"}。</p>${sectionExplanation(sectionGuide)}<h3>本考纲点术语</h3>${termHtml}<div class="topic-question-heading"><h3>历年考点练习索引 <span class="muted">· ${sectionQuestions.length}</span></h3><button type="button" class="text-button print-topic-questions" data-topic="${esc(section.id)}">打印本考纲点索引</button></div><p class="question-source-note">按考纲点归类历年小问的卷次、分值、指令词和考点焦点，并提供答题提示。归类为自动辅助，练习时要依据当前题目给出的案例和完整指令作答。</p><div class="question-list">${questionHtml}</div></details>`;
    }).join("");
    const formulas = formulaBank[key] || [];
    return `<section class="topic-group" id="topic-${key.replace(".", "-")}"><div class="topic-group-title"><span class="code">${key}</span><h2>${esc(guide.titleZh)}</h2><small>${esc(guide.titleEn)}</small><button type="button" class="text-button print-topic-notes" data-topic="${esc(key)}">打印本主题笔记</button></div><p class="topic-summary">${esc(guide.summary || "")}</p>${guide.points?.length ? `<h3>知识框架</h3><ul class="points-list">${guide.points.map((point) => `<li>${esc(point)}</li>`).join("")}</ul>` : ""}${formulas.length ? `<h3>常用公式与计算</h3><div class="formula-list">${formulas.map((formula) => `<div class="formula">${esc(formula)}</div>`).join("")}</div>` : ""}${guide.exam?.length ? `<div class="exam-box"><h3>答题抓手</h3><ul>${guide.exam.map((point) => `<li>${esc(point)}</li>`).join("")}</ul></div>` : ""}${guide.pitfalls?.length ? `<div class="pitfall-box"><h3>易混点</h3><ul>${guide.pitfalls.map((point) => `<li>${esc(point)}</li>`).join("")}</ul></div>` : ""}<h3>考纲小节：术语与真题</h3><div class="syllabus-list">${sectionHtml}</div></section>`;
  }).join("");

  document.title = `${String(unitId).padStart(2, "0")} ${unit.titleZh} · 9609 Business Study`;
  document.querySelector("#unit-title").textContent = unit.titleZh;
  document.querySelector("#unit-title-en").textContent = unit.titleEn;
  document.querySelector("#unit-stage").textContent = unit.stage === "AS" ? "AS Level · Papers 1–2" : "A Level · Papers 3–4";
  document.querySelector("#unit-count").textContent = `${sections.length} 个考纲小节 · ${terms.filter((term) => term.unit === unitId).length} 个术语 · ${unitQuestions.length} 道已归类小问`;
  const paperA = unit.stage === "AS" ? 1 : 3;
  const paperB = unit.stage === "AS" ? 2 : 4;
  document.querySelector("#unit-sidebar").innerHTML = `<h2>本单元考纲</h2><nav>${nav}<a href="../glossary.html?unit=${unitId}">本单元术语词表 ↗</a><a href="../exam-skills.html">答题结构 ↗</a><a href="../review.html">待复核题目 ↗</a></nav>`;
  document.querySelector("#unit-content").innerHTML = `<section class="content-card unit-study-intro"><p class="eyebrow">9609 · ${unit.stage === "AS" ? "AS LEVEL" : "A LEVEL"}</p><h2>按考纲理解，按考点练习</h2><p>${unit.stage === "AS" ? "Paper 1 与 Paper 2 直接考查 1.1–5.5。" : "Paper 3 与 Paper 4 直接考查 6.1–10.4；AS 内容是默认掌握的前置知识。"} 展开任一考纲小节，可查看逐点讲解、考纲范围、得分写法、易错点、术语与历年考点练习索引。小问按卷次、分值、指令词和考点组织，卡片提供答题提示。</p><div class="topic-index">${nav.replaceAll("<a ", "<a class=\"topic-chip\" ")}</div><div class="filter-panel question-filter-panel" aria-label="历年小问筛选"><div class="field"><label for="question-search">搜索考点或卷次</label><input id="question-search" type="search" placeholder="考纲编号、年份、题号、焦点"></div><div class="field"><label for="question-paper-filter">试卷</label><select id="question-paper-filter"><option value="stage">本阶段 P${paperA} + P${paperB}</option><option value="">所有 Paper 1–4</option><option value="1">Paper 1</option><option value="2">Paper 2</option><option value="3">Paper 3</option><option value="4">Paper 4</option></select></div><div class="field"><label for="question-mode-filter">练习方式</label><select id="question-mode-filter"><option value="">全部方式</option><option value="memory">记忆</option><option value="understanding">理解</option><option value="calculation">计算</option><option value="analysis">分析</option><option value="evaluation">评价</option></select></div><div class="field"><label for="question-difficulty-filter">练习强度估计（非官方）</label><select id="question-difficulty-filter"><option value="">全部级别</option><option value="1">1 · 入门</option><option value="2">2 · 基础</option><option value="3">3 · 提高</option><option value="4">4 · 挑战</option></select></div></div><div class="question-actions"><span id="question-results-count" aria-live="polite"></span><span id="question-selected-count" aria-live="polite">已选 0 题</span><button type="button" class="text-button" id="select-visible-questions">选择当前可见题目</button><button type="button" class="text-button" id="clear-question-selection">清除选择</button><button type="button" class="button secondary" id="print-visible-questions">打印当前筛选索引</button><button type="button" class="button" id="print-selected-questions" disabled>打印所选索引</button></div></section>${groupHtml}`;
  document.querySelector("#unit-prev").href = unitId > 1 ? `unit-${String(unitId - 1).padStart(2, "0")}.html` : "../index.html";
  document.querySelector("#unit-next").href = unitId < 10 ? `unit-${String(unitId + 1).padStart(2, "0")}.html` : "../index.html";
  document.querySelector("#unit-prev").textContent = unitId > 1 ? `← 单元 ${String(unitId - 1).padStart(2, "0")}` : "← 首页";
  document.querySelector("#unit-next").textContent = unitId < 10 ? `单元 ${String(unitId + 1).padStart(2, "0")} →` : "返回首页 →";

  function syncChecks() {
    document.querySelectorAll(".question-checkbox").forEach((checkbox) => { checkbox.checked = selected.has(checkbox.value); });
    const count = selected.size;
    document.querySelector("#question-selected-count").textContent = `已选 ${count} 题`;
    document.querySelector("#print-selected-questions").disabled = count === 0;
  }

  function applyFilters() {
    const search = document.querySelector("#question-search").value.trim().toLowerCase();
    const paper = document.querySelector("#question-paper-filter").value;
    const papers = paper === "stage" ? [String(paperA), String(paperB)] : paper ? [paper] : [];
    const mode = document.querySelector("#question-mode-filter").value;
    const difficulty = document.querySelector("#question-difficulty-filter").value;
    let visibleCount = 0;
    for (const card of document.querySelectorAll(".question-card")) {
      const visible = (!papers.length || papers.includes(card.dataset.paper)) && (!mode || card.dataset.mode === mode) && (!difficulty || card.dataset.difficulty === difficulty) && (!search || card.dataset.search.includes(search));
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    }
    document.querySelectorAll(".syllabus-row").forEach((row) => {
      const visible = row.querySelectorAll(".question-card:not([hidden])").length;
      const empty = row.querySelector(".question-empty-filter");
      if (empty) empty.hidden = visible > 0;
    });
    document.querySelector("#question-results-count").textContent = `显示 ${visibleCount} 个考纲题卡`;
    syncChecks();
  }

  function printPage(payload) {
    try {
      sessionStorage.setItem("9609-business-print-payload", JSON.stringify(payload));
      const popup = window.open("../print.html", "_blank");
      if (!popup) window.alert("浏览器拦截了打印预览页。请允许此站点打开新页面后重试。");
    } catch (error) {
      window.alert("无法保存打印内容，请允许本站点使用浏览器存储后重试。");
    }
  }

  document.querySelectorAll(".question-checkbox").forEach((checkbox) => checkbox.addEventListener("change", () => {
    if (checkbox.checked) selected.add(checkbox.value); else selected.delete(checkbox.value);
    syncChecks();
  }));
  ["question-search", "question-paper-filter", "question-mode-filter", "question-difficulty-filter"].forEach((id) => document.querySelector(`#${id}`).addEventListener(id === "question-search" ? "input" : "change", applyFilters));
  document.querySelector("#select-visible-questions").addEventListener("click", () => {
    document.querySelectorAll(".question-card:not([hidden])").forEach((card) => selected.add(card.dataset.questionId));
    syncChecks();
  });
  document.querySelector("#clear-question-selection").addEventListener("click", () => { selected.clear(); syncChecks(); });
  const visibleIds = () => [...new Set([...document.querySelectorAll(".question-card:not([hidden])")].map((card) => card.dataset.questionId))];
  document.querySelector("#print-visible-questions").addEventListener("click", () => printPage({ kind: "questions", unitId, ids: visibleIds() }));
  document.querySelector("#print-selected-questions").addEventListener("click", () => printPage({ kind: "questions", unitId, ids: [...selected].filter((id) => qById.has(id)) }));
  document.querySelectorAll(".print-topic-notes").forEach((button) => button.addEventListener("click", () => printPage({ kind: "notes", unitId, topic: button.dataset.topic })));
  document.querySelectorAll(".print-topic-questions").forEach((button) => button.addEventListener("click", () => {
    const topic = button.dataset.topic;
    const ids = unitQuestions.filter((question) => (question.topicIds || []).includes(topic)).map((question) => question.id);
    printPage({ kind: "questions", unitId, topic, ids });
  }));
  applyFilters();
})();
