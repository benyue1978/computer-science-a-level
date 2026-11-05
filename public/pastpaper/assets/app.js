(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const el = (tag, cls, text) => { const node=document.createElement(tag); if(cls)node.className=cls; if(text!==undefined)node.textContent=String(text); return node; };
  const asList = value => Array.isArray(value) ? value : value ? [value] : [];
  const banks = [1,2,3,4].flatMap(p => asList(window['BANK'+p]).map(q => ({...q,paper:Number(q.paper)||p})));
  const catalog=window.CATALOG||{}, guides=window.GUIDES||{};
  const topics=asList(catalog.topics), topicMap=new Map(topics.map(x=>[String(x.code),x]));
  const methodIndex=new Map();for(const [topic,guide] of Object.entries(guides))for(const method of asList(guide.methods))for(const id of asList(method.evidence)){if(!methodIndex.has(id))methodIndex.set(id,[]);methodIndex.get(id).push({topic,method});}
  const paperNames={1:'理论基础',2:'解决问题与编程基础',3:'进阶理论',4:'实用编程'};
  const modeNames={memory:'记忆',understanding:'理解',procedure:'步骤',application:'应用',implementation:'编程'};
  const levelNames={1:'入门',2:'基础',3:'进阶',4:'挑战'};
  const state={paper:1,topic:'',mode:'',difficulty:'',search:'',page:1,selected:new Set(),results:[]};
  const pageSize=20;
  function topicName(code){const t=topicMap.get(String(code));if(!t)return String(code);const zh=t.title_zh||t.title_en||'',en=t.title_en&&t.title_zh?` · ${t.title_en}`:'';return `${code} ${zh}${en}`;}
  function questionName(q){const raw=String(q.label||'');return /^(question|q\s*\d)/i.test(raw)?raw:`Question ${raw||q.id}`;}
  function markLabel(value){const n=Number(value);return Number.isFinite(n)?`${n}分`:'—分';}
  function escapeText(value){return String(value??'');}
  function fillTopics(){
    const codes=[...new Set(banks.filter(q=>q.paper===state.paper).flatMap(q=>asList(q.topics).map(String)))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    const select=$('topic-filter');select.replaceChildren(new Option('选择一个主题',''));
    for(const code of codes)select.add(new Option(topicName(code),code));
    select.value=state.topic;
    $('paper-description').textContent=paperNames[state.paper];
    document.querySelectorAll('[data-paper]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.paper)===state.paper)));
  }
  function matches(){
    const term=state.search.trim().toLowerCase();
    state.results=banks.filter(q=>q.paper===state.paper&&state.topic&&asList(q.topics).map(String).includes(state.topic)&&(!state.mode||q.mode===state.mode)&&(!state.difficulty||Number(q.difficulty)===Number(state.difficulty))&&(!term||[q.id,q.label,q.text,q.context,q.explanation_zh,q.approach_zh,q.pitfalls_zh,...asList(q.topics)].join(' ').toLowerCase().includes(term)));
    const order={memory:0,procedure:1,understanding:2,application:3,implementation:4};
    state.results.sort((a,b)=>Number(a.difficulty)-Number(b.difficulty)||(order[a.mode]??9)-(order[b.mode]??9)||String(a.label).localeCompare(String(b.label),undefined,{numeric:true})||a.id.localeCompare(b.id));
    const max=Math.max(1,Math.ceil(state.results.length/pageSize));state.page=Math.min(state.page,max);
  }
  function addImages(host,paths,label,sourcePath=''){
    for(const [i,path] of asList(paths).entries()){
      if(!path)continue;
      const src=typeof path==='string'?path:path.path||path.src||'';
      const figure=el('figure','source-figure');const img=el('img','print-source-image');img.dataset.src=src;img.alt=`${label} ${i+1}`;img.loading='lazy';img.decoding='async';
      img.addEventListener('error',()=>{const fallback=el('div','image-fallback',`图片未能加载：${src.split('/').pop()||label}`);if(sourcePath){const link=el('a','', '打开对应原卷 PDF');link.href=sourcePath;link.target='_blank';link.rel='noopener';fallback.append(' · ',link);}figure.replaceChild(fallback,img);},{once:true});
      figure.append(img,el('figcaption','source-caption',`${label}${asList(paths).length>1?` · ${i+1}/${asList(paths).length}`:''}`));host.append(figure);
    }
  }
  function hydrateImages(host){
    host.querySelectorAll('img[data-src]').forEach(img=>{const sourceDetails=img.closest('.source-page-details');if(sourceDetails&&!sourceDetails.open)return;img.loading='eager';img.src=img.dataset.src;delete img.dataset.src;});
  }
  function addSourcePages(host,paths,label,sourcePath=''){
    const pages=asList(paths);if(!pages.length)return;
    const details=el('details','source-page-details');details.append(el('summary','',`${label}（${pages.length}页）`));
    const body=el('div','source-page-grid');addImages(body,pages,'原卷完整页面',sourcePath);details.append(body);
    if(sourcePath){const link=el('a','source-pdf-link','打开完整原卷 PDF ↗');link.href=sourcePath;link.target='_blank';link.rel='noopener';details.append(link);}
    details.addEventListener('toggle',()=>{if(details.open)hydrateImages(details);});
    host.append(details);
  }
  function renderGuide(){
    const hasTopic=Boolean(state.topic), guide=guides[state.topic]||{};
    $('choose-topic').hidden=hasTopic;$('notes-section').hidden=!hasTopic;$('questions-section').hidden=!hasTopic;
    if(!hasTopic)return;
    $('lesson-title').textContent=guide.title_zh||topicName(state.topic);$('lesson-subtitle').textContent=guide.title_en||'';
    const body=$('lesson-body');body.replaceChildren();
    if(guide.explanation)body.append(el('p','guide-explanation',guide.explanation));
    const memories=asList(guide.memorize);
    if(memories.length){body.append(el('h3','guide-section-title','术语与双语背诵'));const grid=el('div','memory-grid');for(const item of memories){const card=el('article','memory-pair');const en=typeof item==='string'?item:item.en||item.term_en||'';const zh=typeof item==='string'?'':item.zh||item.term_zh||'';if(en)card.append(el('strong','',en));if(zh)card.append(el('span','',zh));grid.append(card);}body.append(grid);}
    for(const [field,title] of [['steps','学习与答题步骤'],['pitfalls','容易混淆的地方']]){
      const items=asList(guide[field]);if(!items.length)continue;body.append(el('h3','guide-section-title',title));const list=el(field==='steps'?'ol':'ul','guide-list');for(const item of items)list.append(el('li','',typeof item==='string'?item:item.zh||item.text||''));body.append(list);
    }
    const methods=asList(guide.methods);
    if(methods.length){body.append(el('h3','guide-section-title','题目线索与记忆技巧'));const grid=el('div','method-grid');for(const m of methods){const card=el('details','method-card');const summary=el('summary','');summary.append(el('strong','',m.name_zh||'答题方法'));if(m.trigger_zh)summary.append(el('span','method-trigger-preview',`题目信号：${m.trigger_zh}`));if(m.memory_hook_zh)summary.append(el('span','method-hook-preview',`速记：${m.memory_hook_zh}`));card.append(summary);appendMethodBody(card,m,false);grid.append(card);}body.append(grid);}
    const terms=asList(guide.terms);
    if(terms.length){body.append(el('h3','guide-section-title glossary-section-title','术语英中对照'));const grid=el('div','glossary-grid');for(const term of terms){const card=el('article','glossary-card');card.append(el('h4','glossary-term-en',term.en||''),el('p','glossary-term-zh',term.zh||''),el('p','glossary-meaning',term.meaning_zh||''));grid.append(card);}body.append(grid);}
  }
  function appendMethodBody(host,method,includeEvidence=false){
    const hook=[method.memory_hook_zh,method.memory_hook_en].filter(Boolean);if(hook.length)host.append(el('p','method-hook',`记忆钩子：${hook.join(' / ')}`));
    if(asList(method.steps).length){host.append(el('h5','method-subheading','得分步骤'));const steps=el('ol','guide-list');for(const step of asList(method.steps))steps.append(el('li','',step));host.append(steps);}
    if(method.limits_zh)host.append(el('p','method-limit',`适用边界：${method.limits_zh}`));
    const evidence=asList(method.evidence);if(includeEvidence&&evidence.length)host.append(el('p','method-source','对应练习题：'+evidence.join(' · ')));
  }
  function methodsForQuestion(q){return methodIndex.get(q.id)||[];}
  function appendQuestionMethods(host,q){
    const methods=methodsForQuestion(q);if(!methods.length)return;
    const section=el('section','question-tip-block');section.append(el('h5','tip-heading','题目线索与记忆技巧'));
    for(const item of methods){const {method,topic}=item,card=el('article','linked-method-card');card.append(el('h6','',method.name_zh||'答题方法'));if(!asList(q.topics).map(String).includes(topic))card.append(el('p','method-topic-link',`关联笔记主题：${topicName(topic)}`));if(method.trigger_zh)card.append(el('p','method-trigger',`题目信号：${method.trigger_zh}`));appendMethodBody(card,method,false);section.append(card);}
    host.append(section);
  }
  function renderQuestionCard(q,number){
    const card=el('article','question-row-card');const head=el('div','question-row-head');
    const label=el('label','question-select');const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=state.selected.has(q.id);checkbox.setAttribute('aria-label',`选择打印 ${questionName(q)}`);checkbox.addEventListener('change',()=>{if(checkbox.checked)state.selected.add(q.id);else state.selected.delete(q.id);updateSelection();});
    label.append(checkbox,el('span','print-sequence',String(number).padStart(3,'0')));head.append(label);
    const title=el('div','question-row-title');title.append(el('strong','',questionName(q)),el('span','question-meta-line',`${levelNames[q.difficulty]||'练习'} · ${modeNames[q.mode]||'综合'} · ${markLabel(q.marks)}`));head.append(title);
    const codes=el('div','question-tags');for(const code of asList(q.topics))codes.append(el('span','topic-tag',topicName(code)));head.append(codes);card.append(head);
    const details=el('details','question-detail');details.append(el('summary','','展开题目原文与中文讲解'));const content=el('div','question-detail-content');
    if(q.context||asList(q.context_images).length){const background=el('section','question-background-block');background.append(el('h4','part-heading','题目前提'));addImages(background,q.context_images,'题目前提图片',q.qp);if(q.context)background.append(el('h5','transcript-heading','题目前提原文'),el('pre','question-context-text',q.context));content.append(background);}
    const question=el('section','question-paper-block');question.append(el('h4','part-heading','题目'));
    addImages(question,q.question_images,'原卷题目图',q.qp);
    if(q.text)question.append(el('h5','transcript-heading','英文原题'),el('pre','question-text',q.text));
    content.append(question);
    addSourcePages(content,q.related_images,'查看本大题完整原卷页',q.qp);
    const answer=el('section','question-answer');answer.append(el('h4','part-heading','答案与中文讲解'),el('p','explanation-copy',q.explanation_zh||''));if(q.approach_zh)answer.append(el('h5','','解题思路'),el('p','explanation-copy',q.approach_zh));appendQuestionMethods(answer,q);if(q.pitfalls_zh)answer.append(el('h5','','易错点'),el('p','explanation-copy',q.pitfalls_zh));if(q.source_caveat_zh)answer.append(el('h5','','补充说明'),el('p','explanation-copy',q.source_caveat_zh));
    if(q.answer_text)answer.append(el('h5','','评分要点'),el('pre','mark-text',q.answer_text));
    if(asList(q.answer_images).length)answer.append(el('h5','','官方评分标准'));
    addImages(answer,q.answer_images,'官方评分标准原页',q.ms);content.append(answer);details.append(content);details.addEventListener('toggle',()=>{if(details.open)hydrateImages(content);});card.append(details);return card;
  }
  function renderQuestions(){
    matches();const host=$('question-list');host.replaceChildren();
    const count=state.results.length;$('result-summary').textContent=count?`${count} 道题 · 由易到难`:'暂无符合条件的题目';
    $('questions-title').textContent=`${topicName(state.topic)} · 历年题`;
    if(!count){host.append(el('div','empty-state','当前筛选没有题目。试试清除练习方式、难度或搜索条件。'));}
    const start=(state.page-1)*pageSize;state.results.slice(start,start+pageSize).forEach((q,i)=>host.append(renderQuestionCard(q,start+i+1)));
    const pages=Math.max(1,Math.ceil(count/pageSize));$('page-info').textContent=`${state.page} / ${pages} 页 · ${count} 道`;$('prev-page').disabled=state.page<=1;$('next-page').disabled=state.page>=pages;
    $('select-all').checked=count>0&&state.results.every(q=>state.selected.has(q.id));$('select-all').indeterminate=state.results.some(q=>state.selected.has(q.id))&&!$('select-all').checked;
    updateSelection();
  }
  function updateSelection(){
    const visibleIds=new Set(state.results.map(q=>q.id));const selectedVisible=[...state.selected].filter(id=>visibleIds.has(id)).length;
    $('selected-count').textContent=`已选 ${selectedVisible} 题`;$('print-selected').disabled=selectedVisible===0;$('print-filtered').disabled=state.results.length===0;
  }
  function clearSelectionOnFilter(){state.selected.clear();state.page=1;}
  function render(){fillTopics();renderGuide();if(state.topic)renderQuestions();}
  function printView(payload){
    try{sessionStorage.setItem('9618-print-payload',JSON.stringify(payload));const w=window.open('print.html','_blank');if(!w)toast('浏览器阻止了新页面，请允许打开打印页。');}
    catch(_){toast('无法准备打印页，请改用常规静态网站地址打开。');}
  }
  function toast(text){const node=$('toast');node.textContent=text;node.hidden=false;setTimeout(()=>node.hidden=true,3200);}
  document.querySelectorAll('[data-paper]').forEach(button=>button.addEventListener('click',()=>{state.paper=Number(button.dataset.paper);state.topic='';state.mode='';state.difficulty='';state.search='';state.page=1;state.selected.clear();$('topic-filter').value='';$('mode-filter').value='';$('difficulty-filter').value='';$('search-filter').value='';render();}));
  $('topic-filter').addEventListener('change',event=>{state.topic=event.target.value;state.page=1;state.selected.clear();render();});
  for(const name of ['mode','difficulty'])$(name+'-filter').addEventListener('change',event=>{state[name]=event.target.value;clearSelectionOnFilter();renderQuestions();});
  $('search-filter').addEventListener('input',event=>{state.search=event.target.value;clearSelectionOnFilter();renderQuestions();});
  $('reset-filters').addEventListener('click',()=>{state.mode='';state.difficulty='';state.search='';state.page=1;state.selected.clear();$('mode-filter').value='';$('difficulty-filter').value='';$('search-filter').value='';renderQuestions();});
  $('select-all').addEventListener('change',event=>{if(event.target.checked)state.results.forEach(q=>state.selected.add(q.id));else state.results.forEach(q=>state.selected.delete(q.id));renderQuestions();});
  $('clear-selection').addEventListener('click',()=>{state.selected.clear();renderQuestions();});
  $('prev-page').addEventListener('click',()=>{state.page=Math.max(1,state.page-1);renderQuestions();});$('next-page').addEventListener('click',()=>{state.page++;renderQuestions();});
  $('print-notes').addEventListener('click',()=>{if(state.topic)printView({kind:'notes',paper:state.paper,topic:state.topic});});
  $('print-selected').addEventListener('click',()=>{const ids=state.results.filter(q=>state.selected.has(q.id)).map(q=>q.id);if(ids.length)printView({kind:'questions',paper:state.paper,topic:state.topic,ids});});
  $('print-filtered').addEventListener('click',()=>{if(state.results.length)printView({kind:'questions',paper:state.paper,topic:state.topic,ids:state.results.map(q=>q.id)});});
  $('total-count').textContent=banks.length.toLocaleString();fillTopics();render();
})();
