(() => {
  const questions = (window.BUSINESS_QUESTIONS || []).filter((question) => !(question.topicIds || []).length).sort((a, b) => b.year - a.year || b.paper - a.paper || a.id.localeCompare(b.id));
  const selected = new Set();
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const list = document.querySelector("#review-list");
  const visibleQuestions = [];

  function render() {
    const search = document.querySelector("#review-search").value.trim().toLowerCase();
    const paper = document.querySelector("#review-paper").value;
    const results = questions.filter((question) => {
      const blob = `${question.id} ${question.paperLabel} ${question.command} ${question.focusZh}`.toLowerCase();
      return (!paper || String(question.paper) === paper) && (!search || blob.includes(search));
    });
    visibleQuestions.splice(0, visibleQuestions.length, ...results);
    list.innerHTML = results.map((question) => {
      const label = question.id.split("_Q").pop();
      return `<article class="review-card"><label class="question-select"><input type="checkbox" class="review-checkbox" value="${esc(question.id)}" ${selected.has(question.id) ? "checked" : ""}><span>选入打印</span></label><div><h2>${esc(question.paperLabel)} · ${esc(label)}</h2><p>${question.marks ?? "—"} 分 · ${esc(question.command || "指令词待核")}</p><p class="muted">尚未可靠匹配到具体考纲小节，因此未并入单元内的考点练习索引。</p></div></article>`;
    }).join("") || `<div class="no-results">没有符合筛选条件的待复核题目。</div>`;
    list.querySelectorAll(".review-checkbox").forEach((checkbox) => checkbox.addEventListener("change", () => {
      if (checkbox.checked) selected.add(checkbox.value); else selected.delete(checkbox.value);
      updateSelection();
    }));
    document.querySelector("#review-count").textContent = `显示 ${results.length} / ${questions.length} 个待复核小问`;
    updateSelection();
  }

  function updateSelection() {
    const visibleIds = new Set(visibleQuestions.map((question) => question.id));
    const count = [...selected].filter((id) => visibleIds.has(id)).length;
    document.querySelector("#review-selected-count").textContent = `已选 ${count} 题`;
    document.querySelector("#review-print-selected").disabled = count === 0;
  }

  function printQuestions(ids) {
    sessionStorage.setItem("9609-business-print-payload", JSON.stringify({ kind: "questions", ids }));
    const popup = window.open("print.html", "_blank");
    if (!popup) window.alert("浏览器拦截了打印预览页。请允许此站点打开新页面后重试。");
  }

  for (const id of ["review-search", "review-paper"]) document.querySelector(`#${id}`).addEventListener(id === "review-search" ? "input" : "change", render);
  document.querySelector("#review-select-visible").addEventListener("click", () => { visibleQuestions.forEach((question) => selected.add(question.id)); render(); });
  document.querySelector("#review-clear").addEventListener("click", () => { selected.clear(); render(); });
  document.querySelector("#review-print-visible").addEventListener("click", () => printQuestions(visibleQuestions.map((question) => question.id)));
  document.querySelector("#review-print-selected").addEventListener("click", () => printQuestions([...selected]));
  render();
})();
