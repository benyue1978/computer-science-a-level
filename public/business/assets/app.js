(() => {
  const catalog = window.BUSINESS_CATALOG;
  const questionBank = window.BUSINESS_QUESTIONS || [];
  if (!catalog) return;
  const stageButtons = [...document.querySelectorAll("[data-stage-filter]")];
  const search = document.querySelector("#unit-search");
  const grid = document.querySelector("#unit-grid");
  let stage = "all";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  function render() {
    const q = (search?.value || "").trim().toLowerCase();
    const units = catalog.units.filter((u) => {
      const sections = catalog.sections.filter((s) => s.unit === u.id);
      return (stage === "all" || u.stage === stage) && (!q || `${u.titleEn} ${u.titleZh} ${sections.map((s) => `${s.id} ${s.titleEn} ${s.titleZh}`).join(" ")}`.toLowerCase().includes(q));
    });
    grid.innerHTML = units.map((u) => {
      const sections = catalog.sections.filter((s) => s.unit === u.id);
      const codes = new Set(sections.map((s) => s.id));
      const terms = (window.BUSINESS_TERMS || []).filter((t) => codes.has(t.topicId)).length;
      const unitQuestionCount = questionBank.filter((q) => (q.topicIds || []).some((code) => codes.has(code))).length;
      const stageName = u.stage === "AS" ? "AS · Paper 1 & 2" : "A Level · Paper 3 & 4";
      const topicKeys = [...new Set(sections.map((section) => section.id.split(".").slice(0, 2).join(".")))];
      const topicNames = topicKeys.map((key) => window.BUSINESS_GUIDES?.[key]?.titleZh).filter(Boolean);
      const description = topicNames.join(" · ");
      return `<a class="unit-card" href="lessons/unit-${String(u.id).padStart(2,"0")}.html"><span class="unit-number">${String(u.id).padStart(2,"0")}</span><h3>${esc(u.titleZh)}</h3><span class="en-title">${esc(u.titleEn)}</span><p>${esc(description)}</p><div class="unit-meta"><span>${stageName}</span><span>${sections.length} 个考纲要点</span><span>${terms} 个术语</span><span>${unitQuestionCount} 个历年题目索引</span></div></a>`;
    }).join("") || `<div class="no-results">没有找到匹配章节。</div>`;
    const summary = document.querySelector("#unit-summary");
    if (summary) summary.textContent = `显示 ${units.length} / 10 个单元`;
  }
  stageButtons.forEach((button) => button.addEventListener("click", () => {
    stage = button.dataset.stageFilter;
    stageButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    render();
  }));
  search?.addEventListener("input", render);
  const indexedCount = document.querySelector("#question-index-count");
  if (indexedCount) indexedCount.textContent = questionBank.filter((question) => (question.topicIds || []).length > 0).length.toLocaleString("en");
  render();
})();
