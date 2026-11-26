(() => {
  const $ = (id) => document.getElementById(id);
  const list = (value) => Array.isArray(value) ? value : value ? [value] : [];
  const catalog = window.BUSINESS_CATALOG || {};
  const guides = window.BUSINESS_GUIDES || {};
  const sectionGuides = window.BUSINESS_SECTION_GUIDES || {};
  const formulas = window.BUSINESS_FORMULAS || {};
  const terms = window.BUSINESS_TERMS || [];
  const bank = window.BUSINESS_QUESTIONS || [];
  const byId = new Map(bank.map((question) => [question.id, question]));
  const topicMap = new Map(list(catalog.sections).map((section) => [section.id, section]));
  const unitMap = new Map(list(catalog.units).map((unit) => [unit.id, unit]));
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  let payload = {};
  try { payload = JSON.parse(sessionStorage.getItem("9609-business-print-payload") || "{}"); } catch (_) {}

  const topicName = (code) => {
    const topic = topicMap.get(String(code));
    return topic ? `${topic.id} ${topic.titleZh} · ${topic.titleEn}` : String(code || "");
  };
  const commandName = { define: "定义", identify: "识别", explain: "解释", calculate: "计算", analyse: "分析", analyze: "分析", evaluate: "评价", assess: "评估", advise: "建议", recommend: "建议", discuss: "讨论", justify: "论证", compare: "比较", distinguish: "区分", state: "陈述", describe: "描述" };
  const paperLabel = (question) => question.paperLabel || `${question.year} ${question.season} · P${question.paper} · V${question.variant}`;

  function sectionNoteHtml(section) {
    const guide = sectionGuides[section.id] || {};
    const sectionTerms = terms.filter((term) => term.topicId === section.id);
    const termHtml = sectionTerms.map((term) => `<article class="term-card"><h3>${esc(term.term)} <span>${esc(term.termZh)}</span></h3><p>${esc(term.explanationZh || term.definitionEn)}</p>${term.exampleEn ? `<p class="example"><em>${esc(term.exampleEn)}</em><br>${esc(term.exampleZh || "")}</p>` : ""}</article>`).join("");
    return `<section class="note-block point-note"><h2>${esc(section.id)} ${esc(section.titleZh)} <span class="section-en">${esc(section.titleEn)}</span></h2><h3>考纲讲解</h3><p>${esc(guide.core || "本小节讲解待补充。")}</p><div class="point-note-grid"><section><h3>本点要掌握</h3><ul>${list(guide.scope).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></section><section class="exam-note"><h3>得分怎么拿</h3><ul>${list(guide.answer).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></section><section class="pitfall-note"><h3>容易失分</h3><ul>${list(guide.pitfalls).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></section></div>${termHtml ? `<h3>本考纲点术语</h3><div class="term-grid">${termHtml}</div>` : ""}</section>`;
  }

  function noteSheet() {
    const unit = unitMap.get(Number(payload.unitId));
    const key = String(payload.topic || "");
    const guide = guides[key];
    if (!unit || !guide) return `<p class="empty-print">笔记数据未找到，请返回单元页重新生成打印内容。</p>`;
    const groupSections = list(catalog.sections).filter((section) => section.id.startsWith(`${key}.`));
    const formulaHtml = list(formulas[key]);
    return `<article class="note-sheet"><p class="eyebrow">9609 Business · Unit ${String(unit.id).padStart(2, "0")} · ${esc(unit.titleZh)} · ${esc(key)}</p><h1>${esc(guide.titleZh)}</h1><p class="subtitle">${esc(guide.titleEn)}</p><section class="note-block"><h2>核心理解</h2><p>${esc(guide.summary || "")}</p></section>${guide.points?.length ? `<section class="note-block"><h2>知识框架</h2><ul>${guide.points.map((point) => `<li>${esc(point)}</li>`).join("")}</ul></section>` : ""}${formulaHtml.length ? `<section class="note-block"><h2>公式与计算</h2>${formulaHtml.map((formula) => `<p class="formula">${esc(formula)}</p>`).join("")}</section>` : ""}${guide.exam?.length ? `<section class="note-block exam-note"><h2>答题抓手</h2><ul>${guide.exam.map((point) => `<li>${esc(point)}</li>`).join("")}</ul></section>` : ""}${guide.pitfalls?.length ? `<section class="note-block pitfall-note"><h2>易错点</h2><ul>${guide.pitfalls.map((point) => `<li>${esc(point)}</li>`).join("")}</ul></section>` : ""}${groupSections.map(sectionNoteHtml).join("")}<p class="source-note">本页按 9609 考纲组织，包含概念讲解、范围清单、答题建议、易错点与对应术语；答题时以题目给出的数据和情境为准。</p></article>`;
  }

  function questionSheet(question, index, withTip) {
    const topics = list(question.topicIds).map((topic) => `<span class="tag">${esc(topicName(topic))}</span>`).join("");
    return `<article class="question-sheet"><p class="eyebrow">${esc(question.primaryTopic ? topicName(question.primaryTopic) : "考纲题目索引")} · ${question.marks ?? "—"} 分</p><h2>Q${String(index).padStart(3, "0")} · ${esc(paperLabel(question))}</h2><div class="question-facts"><span>指令词：${esc(commandName[question.command] || question.command || "待核")}</span><span>分值：${question.marks ?? "—"}</span><span>练习方式：${esc(question.mode || "综合")}</span><span>练习强度估计：${question.difficulty || "—"} / 4（非官方）</span></div><p class="focus-line"><strong>练习焦点：</strong>${esc(question.focusZh || "待复核")}</p><div class="tag-list">${topics}</div>${withTip ? `<section class="answer-tip"><h3>得分提示</h3><p>${esc(question.scoreHintZh || "按指令词和分值组织答案，并用题目情境说明相关性。")}</p><h3>作答自检</h3><ul>${checklist(question).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></section>` : `<div class="answer-space"><span>练习后得分：_____ / ${question.marks ?? "___"}</span><span>复盘：□ 概念　□ 案例应用　□ 因果分析　□ 评价判断</span></div>`}</article>`;
  }

  function checklist(question) {
    if (question.mode === "calculation") return ["公式与题目口径一致", "代入过程、单位和最终所求写全", "说明计算结果对该企业意味着什么"];
    if (question.mode === "evaluation") return ["判断对象与题目建议明确", "案例证据支持分析", "比较条件、影响大小或时间", "结论回应题目并说明条件"];
    if (question.mode === "analysis") return ["观点回应题目", "引用具体案例或数据", "写出原因到结果的因果链", "说明对企业目标的影响"];
    if (question.mode === "understanding") return ["准确使用概念", "按要求说明特征、原因或差异", "需要时联系题中企业情境"];
    return ["答案直接回应题目指令", "术语准确、数量符合要求", "用题目提供的情境支持答案"];
  }

  function renderQuestions(format) {
    const selected = list(payload.ids).map((id) => byId.get(id)).filter(Boolean);
    if (!selected.length) return `<p class="empty-print">没有可打印的小问索引。请回到考纲小节选择练习。</p>`;
    const unit = unitMap.get(Number(payload.unitId));
    const scope = payload.topic ? topicName(payload.topic) : unit?.titleZh || "Business";
    const refs = selected.map((question, index) => questionSheet(question, index + 1, format === "combined")).join("");
    const answers = selected.map((question, index) => `<article class="answer-only-sheet"><p class="eyebrow">得分提示 · A${String(index + 1).padStart(3, "0")}</p><h2>对应 Q${String(index + 1).padStart(3, "0")} · ${esc(paperLabel(question))}</h2><p class="focus-line"><strong>考纲焦点：</strong>${esc(question.focusZh || "待复核")}</p><p><strong>指令词：</strong>${esc(commandName[question.command] || question.command || "待核")}　<strong>分值：</strong>${question.marks ?? "—"}</p><p>${esc(question.scoreHintZh || "按指令词和分值组织答案，并用题目情境说明相关性。")}</p><h3>作答自检</h3><ul>${checklist(question).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article>`).join("");
    const prefix = `<div class="print-scope"><p class="eyebrow">9609 BUSINESS · ${esc(scope)}</p><h1>${format === "answers" ? "答题思路与得分检查" : format === "questions" ? "历年考点练习索引" : "考点索引与得分提示"}</h1><p>${selected.length} 道小问索引 · 按考纲标签归档</p><p class="copyright-note">本册列出历年小问的卷次、题号、分值、指令词和考点焦点，并附通用答题提示；题目练习请结合所用题本上的完整案例与要求。</p></div>`;
    if (format === "questions") return prefix + refs;
    if (format === "answers") return prefix + answers;
    if (format === "separate") return `<div class="print-scope"><p class="eyebrow">9609 BUSINESS · ${esc(scope)}</p><h1>考点练习索引</h1><p>${selected.length} 道小问索引 · 按考纲标签归档</p><p class="copyright-note">索引册列出卷次、题号和考点焦点，并提供答题纸空间。</p></div>${selected.map((question, index) => questionSheet(question, index + 1, false)).join("")}<div class="print-scope"><h1>独立答题思路与得分检查册</h1><p>题号与前册保持一致。</p></div>${answers}`;
    return prefix + refs;
  }

  function render() {
    const content = $("print-content");
    content.innerHTML = "";
    const isNotes = payload.kind === "notes";
    $("format-control").hidden = isNotes;
    $("print-title").textContent = isNotes ? "笔记打印预览" : "考点练习打印预览";
    if (isNotes) {
      const unit = unitMap.get(Number(payload.unitId));
      $("print-summary").textContent = unit ? `${unit.titleZh} · ${payload.topic}` : "笔记";
      content.innerHTML = noteSheet();
      return;
    }
    $("print-summary").textContent = `${list(payload.ids).length} 道小问 · ${unitMap.get(Number(payload.unitId))?.titleZh || "9609 Business"}`;
    content.innerHTML = renderQuestions($("print-format").value);
  }

  $("print-format").addEventListener("change", render);
  $("print-now").addEventListener("click", () => window.print());
  if (!payload.kind) {
    $("print-content").innerHTML = `<p class="empty-print">打印内容已失效，请返回单元页重新选择。</p>`;
    $("print-now").disabled = true;
  } else render();
})();
