(() => {
  'use strict';
  const $=id=>document.getElementById(id), el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;}, list=v=>Array.isArray(v)?v:v?[v]:[];
  const banks=[1,2,3,4].flatMap(p=>list(window['BANK'+p]).map(q=>({...q,paper:Number(q.paper)||p}))), byId=new Map(banks.map(q=>[q.id,q]));
  const guides=window.GUIDES||{},catalog=window.CATALOG||{},papers=new Map(list(catalog.papers).map(p=>[p.id,p]));
  let payload={};try{payload=JSON.parse(sessionStorage.getItem('9618-print-payload')||'{}');}catch(_){}
  const topicMap=new Map(list(catalog.topics).map(t=>[String(t.code),t]));
  const topicName=c=>{const t=topicMap.get(String(c));if(!t)return String(c||'');const zh=t.title_zh||t.title_en||'',en=t.title_en&&t.title_zh?` · ${t.title_en}`:'';return `${c} ${zh}${en}`;};
  const methodIndex=new Map();for(const [topic,guide] of Object.entries(guides))for(const method of list(guide.methods))for(const id of list(method.evidence)){if(!methodIndex.has(id))methodIndex.set(id,[]);methodIndex.get(id).push({topic,method});}
  const methodsForQuestion=q=>methodIndex.get(q.id)||[];
  const appendMethodBody=(host,method,includeEvidence=false)=>{
    const hook=[method.memory_hook_zh,method.memory_hook_en].filter(Boolean);
    if(hook.length)host.append(el('p','method-hook',`记忆钩子：${hook.join(' / ')}`));
    if(list(method.steps).length){
      host.append(el('h4','method-subheading','得分步骤'));
      const ol=el('ol','');for(const step of list(method.steps))ol.append(el('li','',step));host.append(ol);
    }
    if(method.limits_zh)host.append(el('p','method-limit',`适用边界：${method.limits_zh}`));
    const evidence=list(method.evidence);
    if(includeEvidence&&evidence.length)host.append(el('p','method-source','对应练习题：'+evidence.join(' · ')));
  };
  const appendQuestionMethods=(host,q)=>{
    const methods=methodsForQuestion(q);if(!methods.length)return;
    const section=el('section','question-tip-block');section.append(el('h4','tip-heading','题目线索与记忆技巧'));
    for(const item of methods){
      const {method,topic}=item,card=el('article','linked-method-card');card.append(el('h5','',method.name_zh||'答题方法'));
      if(!list(q.topics).map(String).includes(topic))card.append(el('p','method-topic-link',`关联笔记主题：${topicName(topic)}`));
      if(method.trigger_zh)card.append(el('p','method-trigger',`题目信号：${method.trigger_zh}`));
      appendMethodBody(card,method,false);section.append(card);
    }
    host.append(section);
  };
  const questionName=q=>{const raw=String(q.label||'');return /^(question|q\s*\d)/i.test(raw)?raw:`Question ${raw||q.id}`;};
  const markLabel=value=>{const n=Number(value);return Number.isFinite(n)?`${n} ${n===1?'mark':'marks'}`:'— marks';};
  const addImages=(parent,paths,label,sourcePath='')=>{for(const [i,p] of list(paths).entries()){if(!p)continue;const src=typeof p==='string'?p:p.path||p.src||'';const figure=el('figure','source-figure');const img=el('img','source-image');img.dataset.src=src;img.alt=`${label} ${i+1}`;img.loading='lazy';img.decoding='async';img.addEventListener('error',()=>{const fallback=el('div','image-fallback',`图片未能加载：${src.split('/').pop()||label}`);if(sourcePath){const link=el('a','','打开对应原卷 PDF');link.href=sourcePath;link.target='_blank';link.rel='noopener';fallback.append(' · ',link);}figure.replaceChild(fallback,img);},{once:true});figure.append(img,el('figcaption','source-caption',`${label}${list(paths).length>1?` · ${i+1}/${list(paths).length}`:''}`));parent.append(figure);}};
  const hydrateImages=host=>host.querySelectorAll('img[data-src]').forEach(img=>{const sourceDetails=img.closest('.source-page-details');if(sourceDetails&&!sourceDetails.open)return;img.loading='eager';img.src=img.dataset.src;delete img.dataset.src;});
  const watchImages=host=>{const sheets=host.querySelectorAll('article.question-sheet,article.answer-only-sheet');if(!('IntersectionObserver'in window)){sheets.forEach(hydrateImages);return;}const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;hydrateImages(entry.target);observer.unobserve(entry.target);}},{rootMargin:'700px 0px'});sheets.forEach(sheet=>observer.observe(sheet));};
  const addSourcePages=(parent,paths,label,sourcePath='')=>{const pages=list(paths);if(!pages.length)return;const details=el('details','source-page-details');details.append(el('summary','',`${label}（${pages.length}页）`));const body=el('div','source-page-grid');addImages(body,pages,'完整原卷页',sourcePath);details.append(body);if(sourcePath){const link=el('a','source-pdf-link','打开完整原卷 PDF ↗');link.href=sourcePath;link.target='_blank';link.rel='noopener';details.append(link);}details.addEventListener('toggle',()=>{if(details.open)hydrateImages(details);});parent.append(details);};
  function renderNotes(){
    const guide=guides[payload.topic]||{},paper=Number(payload.paper)||1;const wrap=el('article','note-sheet');
    wrap.append(el('p','eyebrow',`P${paper} · ${topicName(payload.topic)}`),el('h1','',guide.title_zh||topicName(payload.topic)),el('p','subtitle',guide.title_en||''));
    if(guide.explanation)wrap.append(el('section','note-block',guide.explanation));
    const cards=list(guide.memorize);if(cards.length){const section=el('section','note-block');section.append(el('h2','','术语与中英背诵'));const grid=el('div','memory-grid');for(const item of cards){const card=el('article','memory-card');card.append(el('strong','',typeof item==='string'?item:item.en||item.term_en||''));if(typeof item!=='string'&&(item.zh||item.term_zh))card.append(el('p','',item.zh||item.term_zh));grid.append(card);}section.append(grid);wrap.append(section);}
    for(const [key,title] of [['steps','学习与答题步骤'],['pitfalls','容易混淆的地方']]){const items=list(guide[key]);if(!items.length)continue;const section=el('section','note-block');section.append(el('h2','',title));const ol=el(key==='steps'?'ol':'ul','');for(const item of items)ol.append(el('li','',typeof item==='string'?item:item.zh||item.text||''));section.append(ol);wrap.append(section);}
    const methods=list(guide.methods);if(methods.length){const section=el('section','note-block');section.append(el('h2','','题目线索与记忆技巧'));for(const m of methods){const card=el('article','method-print-card');card.append(el('h3','',m.name_zh||'方法'));if(m.trigger_zh)card.append(el('p','method-trigger',`题目信号：${m.trigger_zh}`));appendMethodBody(card,m,false);section.append(card);}wrap.append(section);}
    const terms=list(guide.terms);if(terms.length){const section=el('section','note-block glossary-print-section');section.append(el('h2','','术语英中对照'));const grid=el('div','glossary-print-grid');for(const term of terms){const card=el('article','glossary-print-card');card.append(el('h3','',term.en||''),el('p','glossary-term-zh',term.zh||''),el('p','glossary-meaning',term.meaning_zh||''));grid.append(card);}section.append(grid);wrap.append(section);}
    $('print-content').append(wrap);
  }
  function questionBlock(q,index,withAnswer){
    const section=el('article','question-sheet');section.append(el('p','eyebrow',`${topicName(payload.topic)} · ${markLabel(q.marks)}`),el('h2','',`Q${String(index).padStart(3,'0')} · ${questionName(q)}`));
    if(q.context||list(q.context_images).length){const background=el('section','question-background-block');background.append(el('h3','part-heading','题目前提'));addImages(background,q.context_images,'题目前提图片',q.qp);if(q.context)background.append(el('h4','transcript-heading','题目前提原文'),el('pre','source-text',q.context));section.append(background);}
    const question=el('section','question-paper-block');question.append(el('h3','part-heading','题目'));addImages(question,q.question_images,'原卷题目图',q.qp);if(q.text)question.append(el('h4','transcript-heading','英文原题'),el('pre','source-text',q.text));section.append(question);
    addSourcePages(section,q.related_images,'查看完整原卷页',q.qp);
    const warning=papers.get(q.paper_id)?.support_files_missing;if(warning){const box=el('aside','support-warning');box.append(el('strong','',`本卷支持文件未收录：${warning.archive}`));box.append(el('p','',`依赖文件：${list(warning.files).join('、')}`));section.append(box);}
    if(withAnswer)appendAnswer(section,q,index);
    section.append(el('p','source-ref',`考纲主题：${list(q.topics).map(topicName).join(' / ')}`));return section;
  }
  function appendAnswer(section,q,index){
    const answer=el('section','answer-sheet');answer.append(el('h3','part-heading',`A${String(index).padStart(3,'0')} · 答案与中文讲解`),el('p','explanation',q.explanation_zh||''));if(q.approach_zh)answer.append(el('h4','','解题思路'),el('p','explanation',q.approach_zh));appendQuestionMethods(answer,q);if(q.pitfalls_zh)answer.append(el('h4','','易错点'),el('p','explanation',q.pitfalls_zh));if(q.source_caveat_zh)answer.append(el('h4','','补充说明'),el('p','explanation',q.source_caveat_zh));if(q.answer_text)answer.append(el('h4','','评分要点'),el('pre','mark-text',q.answer_text));if(list(q.answer_images).length)answer.append(el('h4','','官方评分标准'));addImages(answer,q.answer_images,'官方评分标准原页',q.ms);answer.append(el('p','source-ref',`答案对应：Q${String(index).padStart(3,'0')}`));section.append(answer);
  }
  function renderQuestions(format){
    const selected=list(payload.ids).map(id=>byId.get(id)).filter(Boolean);if(!selected.length){$('print-content').append(el('p','empty-print','没有可打印的题目。请返回章节页重新选择。'));return;}
    if(format==='questions'||format==='combined'||format==='separate'){$('print-content').append(el('h1','print-section-title',format==='questions'?'题目册':format==='separate'?'题目册':'题目与讲解'));selected.forEach((q,i)=>$('print-content').append(questionBlock(q,i+1,format==='combined')));}
    if(format==='answers'||format==='separate'){$('print-content').append(el('h1','print-section-title','答案讲解册'));selected.forEach((q,i)=>{const section=el('article','answer-only-sheet');section.append(el('p','eyebrow',topicName(payload.topic)),el('h2','',`A${String(i+1).padStart(3,'0')} · 对应 Q${String(i+1).padStart(3,'0')} · ${questionName(q)}`));appendAnswer(section,q,i+1);$('print-content').append(section);});}
  }
  function render(){
    const notes=payload.kind==='notes';$('format-control').hidden=notes;$('print-title').textContent=notes?'笔记打印预览':'题目打印预览';
    if(notes){$('print-summary').textContent='完整主题笔记';renderNotes();return;}
    $('print-summary').textContent=`${list(payload.ids).length} 道题 · ${topicName(payload.topic)}`;
    renderQuestions($('print-format').value);watchImages($('print-content'));
  }
  $('print-format').addEventListener('change',()=>{ $('print-content').replaceChildren();render();});
  $('print-now').addEventListener('click',async()=>{const button=$('print-now'),images=[...$('print-content').querySelectorAll('img[data-src]')].filter(img=>{const sourceDetails=img.closest('.source-page-details');return !sourceDetails||sourceDetails.open;});button.disabled=true;button.textContent='正在准备图片…';const waits=images.map(img=>new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});}));images.forEach(img=>{img.loading='eager';img.src=img.dataset.src;delete img.dataset.src;});await Promise.all(waits);button.disabled=false;button.textContent='打开打印对话框';window.print();});
  if(!payload.kind||!payload.topic){$('print-content').append(el('p','empty-print','打印内容已失效，请返回章节页重新生成。'));$('print-now').disabled=true;}else render();
})();
