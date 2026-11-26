(() => {
  const terms = window.BUSINESS_TERMS || [];
  const catalog = window.BUSINESS_CATALOG;
  const search = document.querySelector("#term-search");
  const unitSelect = document.querySelector("#term-unit");
  const topicSelect = document.querySelector("#term-topic");
  const results = document.querySelector("#term-results");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  let page = 0;
  const pageSize = 36;
  const initial = new URLSearchParams(location.search);
  for (const u of catalog.units) unitSelect.add(new Option(`${String(u.id).padStart(2,"0")} · ${u.titleZh}`, u.id));
  for (const s of catalog.sections) topicSelect.add(new Option(`${s.id} · ${s.titleZh}`, s.id));
  if (initial.has("unit")) unitSelect.value = initial.get("unit");
  if (initial.has("topic")) topicSelect.value = initial.get("topic");
  const pager = document.querySelector("#term-pagination");
  function render() {
    const q = (search.value || "").trim().toLowerCase();
    const unitId = unitSelect.value;
    const topicId = topicSelect.value;
    const list = terms.filter((t) => (!unitId || String(t.unit) === unitId) && (!topicId || t.topicId === topicId) && (!q || `${t.term} ${t.termZh} ${t.definitionEn} ${t.explanationZh} ${t.exampleEn}`.toLowerCase().includes(q))).sort((a,b)=>a.term.localeCompare(b.term));
    page = Math.min(page, Math.max(0, Math.ceil(list.length / pageSize) - 1));
    results.innerHTML = list.slice(page*pageSize,(page+1)*pageSize).map((t) => {
      const section = catalog.sections.find((s) => s.id === t.topicId);
      return `<article class="term-card"><h4>${esc(t.term)}</h4><p class="term-zh">${esc(t.termZh)} <span class="pill">${esc(t.topicId || "")}</span></p><p><strong>EN</strong> ${esc(t.definitionEn)}</p><p><strong>说明</strong> ${esc(t.explanationZh)}</p>${t.exampleEn ? `<p class="term-example"><em>${esc(t.exampleEn)}</em><br>${esc(t.exampleZh||"")}</p>` : ""}${section ? `<p class="muted"><a href="lessons/unit-${String(section.unit).padStart(2,"0")}.html#section-${section.id.replaceAll(".","-")}">打开 ${esc(section.titleZh)} ↗</a></p>` : ""}</article>`;
    }).join("") || `<div class="no-results">没有找到匹配术语。试试英文词、中文词或考纲编号。</div>`;
    document.querySelector("#term-count").textContent = `共 ${list.length} 条 · 第 ${list.length ? page+1 : 0} / ${Math.max(1,Math.ceil(list.length/pageSize))} 页`;
    pager.querySelector("#term-prev").disabled = page <= 0;
    pager.querySelector("#term-next").disabled = (page+1)*pageSize >= list.length;
  }
  for (const control of [search,unitSelect,topicSelect]) control.addEventListener(control === search ? "input" : "change", () => {page=0;render();});
  pager.querySelector("#term-prev").addEventListener("click",()=>{page=Math.max(0,page-1);render();window.scrollTo({top:document.querySelector("#term-results").offsetTop-20,behavior:"smooth"});});
  pager.querySelector("#term-next").addEventListener("click",()=>{page++;render();window.scrollTo({top:document.querySelector("#term-results").offsetTop-20,behavior:"smooth"});});
  render();
})();
