// Shared research guide and hash-based pages; generated HTML also works offline.
export const layers = [
  {id:'tasks', name:'任务', question:'要让计算机完成什么，输出什么？', meaning:'明确做什么', how:'根据兴趣、导师方向和学习跨度，选择希望完成的工作', done:'能说清输入什么、输出什么', brief:'先用输入与输出定义工作，再去找值得解决的具体问题。'},
  {id:'problem', name:'研究问题', question:'现有方法有什么不足，值得解决？', meaning:'说明为什么做', how:'阅读该任务的论文、分析现有方法的失败案例', done:'能指出一个具体不足，并说明为什么值得解决', brief:'把宽泛的研究方向，缩小为一个可以被实验回答的问题。'},
  {id:'data', name:'输入与数据', question:'计算机能获得哪些信息，用什么数据研究？', meaning:'明确研究的信息基础', how:'检查解决这个问题需要哪些信息、标注，是否能够获得', done:'有适合的数据与使用方案', brief:'方法的起点，是实际能获得的信息与标注条件。'},
  {id:'methods', name:'学习设定与方法', question:'在这些数据与标注条件下，怎样学习、解决问题？', meaning:'说明解决思路', how:'先明确可用数据和标注的条件，再提出解决不足的办法', done:'能解释方法为什么可能有效', brief:'先交代学习条件，再解释你的改动为什么针对这个问题。'},
  {id:'models', name:'模型', question:'用什么计算结构实现这个思路？', meaning:'提供实现载体', how:'选择适合任务、能够实现方法且便于公平比较的模型', done:'有可运行的基础方案', brief:'让研究思路落到可运行、可比较的计算结构上。'},
  {id:'evaluation', name:'验证方式', question:'用什么实验和指标判断是否解决了问题？', meaning:'提供结论依据', how:'围绕研究问题，确定比较对象、指标与实验', done:'能判断什么结果支持或否定你的想法', brief:'让每项实验都回到研究问题，明确结论成立的条件。'},
];
const card=(title,text)=>`<div class="guide-card"><h3>${title}</h3><p>${text}</p></div>`;
const block=(title,items)=>`<section class="guide-block"><h2>${title}</h2><div class="guide-grid">${items.map(i=>card(...i)).join('')}</div></section>`;
const example=(text)=>`<aside class="worked-example"><span class="eyebrow">贯穿示例 · 果实检测</span><p>${text}</p><small>用于演示研究设计，不代表已完成的实验或结论。</small></aside>`;
const contents={
problem: block('从方向走向具体问题',[
 ['找到失败条件','先确定任务，再观察已有方法在哪些场景、对象或输入条件下表现不足。把失败样本按遮挡、尺度、光照等条件归类。'],
 ['解释研究价值','说明这个不足影响什么实际需求，已有工作解决到了哪一步，以及你要补充的范围。'],
 ['形成可检验的问题','写清研究对象、适用条件、要改善的能力与比较对象。避免只用“提高精度”代替具体问题。'],
 ])+example('任务是检测果实；研究问题可以是：在叶片遮挡较多的图像中，加入局部上下文信息，是否能减少小果实的漏检？需要先用失败样本确认这一不足确实存在。')+block('在开始方法设计之前',[
 ['一条问题陈述','在【具体条件】下，现有【基础方法】存在【可观察不足】，我们尝试通过【核心思路】改善【目标能力】。'],
 ['一组问题证据','保存失败案例、条件分组和基础结果；区分数据标注问题、任务难度与模型本身的不足。'],
 ['一个可否定的假设','预先说明什么结果意味着想法不成立，例如目标场景没有改善，或改善来自额外数据而非方法。'],
 ]),
data: block('先核对三件事',[
 ['输入是什么','单张 RGB 图像、视频、多视角图像、深度、光谱或文字？确认训练与实际使用时分别能拿到哪些信息。'],
 ['标注是什么','类别、边界框、像素掩码、关键点、深度或图文对应关系？已有标注是否真的支持目标任务？'],
 ['数据能否使用','核对许可、获取方式、采集条件、规模与标注质量。额外采集或标注的成本也属于研究边界。'],
 ])+block('把数据变成研究方案',[
 ['划分训练、验证与测试','训练集用于学习，验证集用于选择方案，测试集用于最终评估。同一对象、视频或地块的近似样本应按组划分，防止信息泄漏。'],
 ['记录分布与覆盖','按场景、设备、光照和目标尺度记录分布，确认研究问题对应的困难条件在评估集中有足够覆盖。'],
 ['写清预处理与约束','记录分辨率、归一化、数据增强和缺失处理；明确哪些标注只在训练阶段可用，保证比较条件一致。'],
 ])+example('检测任务需要图像与果实框。若研究遮挡，可补充遮挡程度标签用于分组评估；按果园、植株或采集批次划分数据，避免相邻画面同时出现在训练集与测试集中。'),
methods: block('学习设定：先说清可用条件',[
 ['监督信息','完整标注、少量标注、粗粒度标注或无目标任务标注，对应不同学习条件。先说明标注的数量与形式。'],
 ['训练与使用范围','是否可以使用预训练权重、外部数据或多种输入？训练阶段的辅助信息在使用时是否仍然存在？'],
 ['迁移与泛化目标','是在同一分布内预测，还是要迁移到新设备、新场景或新类别？明确目标条件以及可以访问的数据。'],
 ])+block('方法：说明改动如何起作用',[
 ['对应具体不足','用一条因果假设连接问题与改动：缺少什么信息，补充什么机制，预计改善哪类错误。'],
 ['描述完整流程','写清输入、特征提取、信息交互、预测与训练目标。指出哪些是已有步骤，哪些是本次提出的变化。'],
 ['设置可拆分的改动','每个主要模块都应能单独启用、移除或替换，便于用消融实验判断效果来自哪里。'],
 ])+example('学习设定可以是使用已有预训练权重的全监督检测；方法假设是局部上下文能帮助识别被遮挡的果实。先明确上下文如何进入特征或预测流程，再设计移除该机制的对照。'),
models: block('从方法需求选择计算结构',[
 ['匹配输入与输出','检查模型是否接收你的数据形式，并输出任务所需的类别、框、掩码、深度、文本或生成图像。'],
 ['区分方法与模型','方法描述解决问题的思路；模型提供实现结构。同一方法可能在多个模型上实现，同一模型也能承载不同方法。'],
 ['核对计算与实现成本','检查权重、代码、许可、显存、推理时间和输入尺寸。先让基础方案稳定运行，再加入新改动。'],
 ])+block('建立可复现的基础方案',[
 ['固定基础模型','记录模型名称、版本、预训练来源、配置和输入尺寸，保存基础结果与失败案例。'],
 ['控制比较条件','比较方法时尽量保持主干、数据、预训练、训练预算与后处理一致；无法一致时明确差异。'],
 ['验证是否依赖某个模型','当研究主张具有通用性时，选择另一种适合的模型验证；比较范围应与结论范围一致。'],
 ])+example('可以先运行任务页中的 YOLOv10n 检测示例，检查输入、输出与错误类型。要研究新的上下文机制，仍需准备可训练的实现与对照方案；展示推理结果本身不等于完成训练实验。')+'<a class="text-link" href="#task-03">查看目标检测的模型与真实示例 →</a>',
evaluation: block('让实验回答研究问题',[
 ['比较对象','至少包括可复现的基础方案；选择与研究条件相符的已有方法，记录训练数据、模型规模与计算预算差异。'],
 ['任务指标','分类可查看准确率及分类别结果；检测常用 AP 和召回率；分割常用 IoU；回归根据目标使用 MAE 等误差指标。明确指标定义与计算设置。'],
 ['问题对应的分组','总体指标之外，单独观察研究假设对应的条件，例如遮挡程度、目标尺寸或跨场景表现。分组方式应预先说明。'],
 ])+block('把效果与原因分开验证',[
 ['消融实验','移除或替换主要模块，在一致条件下比较；必要时设置相近参数量或计算量的对照，排查容量带来的收益。'],
 ['稳定性与成本','在资源允许时重复训练，报告波动；同时记录参数量、计算量、延迟与测试设备，使收益和代价可比较。'],
 ['失败分析与结论边界','同时展示成功与失败样本。根据实验支持程度收窄结论，写清未覆盖的数据、场景与限制。'],
 ])+example('比较基础检测器与加入上下文机制的版本，保持数据和训练设置一致；同时报告总体 AP、预先定义的遮挡组召回率和计算开销。若仅总体指标提高，仍不足以说明遮挡漏检问题得到改善。'),
};

const homeBreakdown = [
 ['计算机要完成的工作，由输入和预期输出定义。','目标检测','输入果园图像，输出每个苹果的位置框与置信度。'],
 ['在具体条件下，现有方法仍未解决好的不足。','密集苹果的漏检','苹果相互遮挡、紧邻且大小不一；研究如何减少这类场景中的漏检。'],
 ['研究可用的信息，以及承载这些信息的样本与标注。','果园图像 + 苹果框标注','包含密集、遮挡和小苹果的 RGB 图像，每个可辨认苹果对应一个标注框。'],
 ['学习设定是可用的监督条件；方法是解决问题的思路。','全监督学习 + 保留细节','利用苹果框标注训练；尝试融合高分辨率特征，保留小苹果的细节。'],
 ['把方法实现为可训练、可推理的具体计算结构。','改造 YOLO','在选定的 YOLO 基线中加入高分辨率检测分支，接入浅层特征与多尺度融合。'],
 ['用对照实验和指标，判断研究问题是否得到改善。','基线对照 + 分支消融','比较原版、改造版及移除新分支的版本，观察密集组召回率、AP 与推理延迟。'],
];

function renderHomeBreakdown(){
 return `<figure class="research-breakdown" aria-labelledby="breakdown-title"><div class="breakdown-root"><span class="root-kicker">一个研究想法</span><svg class="apple-sketch" viewBox="0 0 180 108" role="img" aria-label="相互遮挡的密集苹果示意"><path d="M13 23Q80 1 164 20M40 24L50 53M113 16L108 41M146 18L143 62" fill="none" stroke="#8a9e79" stroke-width="3"/><g fill="#c98567" stroke="#af7058" stroke-width="1.5"><circle cx="53" cy="60" r="22"/><circle cx="83" cy="55" r="24"/><circle cx="114" cy="62" r="22"/><circle cx="144" cy="76" r="19"/><circle cx="77" cy="84" r="18"/></g><g fill="#68845a"><ellipse cx="53" cy="34" rx="12" ry="5" transform="rotate(-25 53 34)"/><ellipse cx="110" cy="36" rx="13" ry="5" transform="rotate(25 110 36)"/></g><g fill="none" stroke="#fff8e6" stroke-width="1.5" stroke-dasharray="4 3"><rect x="29" y="36" width="48" height="48" rx="2"/><rect x="57" y="29" width="52" height="52" rx="2"/><rect x="91" y="38" width="47" height="48" rx="2"/></g></svg><h3>改造 YOLO<br>检测密集苹果</h3><p>拆开来看，这项研究<br>包含哪些层面？</p></div><ol class="breakdown-branches">${layers.map((l,i)=>`<li class="breakdown-branch"><a href="#${l.id}" class="breakdown-definition"><span class="branch-name"><span class="branch-index">0${i+1}</span><strong>${l.name}</strong><span class="branch-open" aria-hidden="true">↗</span></span><p>${homeBreakdown[i][0]}</p></a><div class="breakdown-example"><h3>${homeBreakdown[i][1]}</h3><p>${homeBreakdown[i][2]}</p></div></li>`).join('')}</ol></figure>`;
}

export function renderResearchSite({sections,directory,definitions,componentCSS}){
 const guideContents={},subnavigation={};
 for(const l of layers.slice(1)){
  const entries=[];let n=0;
  guideContents[l.id]=contents[l.id].replace(/<section class="guide-block"><h2>([^<]+)<\/h2>/g,(_,title)=>{
   const id=l.id+'-section-'+(++n);entries.push({id,title});
   return `<section class="guide-block" id="${id}"><h2>${title}</h2>`;
  }).replace('<aside class="worked-example">',()=>{
   const id=l.id+'-example';entries.push({id,title:'果实检测 · 研究示例'});
   return `<aside class="worked-example" id="${id}">`;
  }).replace(/<a class="text-link"[\s\S]*?<\/a>/g,'');
  // Preserve the visual reading order of sections and the example.
  entries.sort((a,b)=>guideContents[l.id].indexOf(`id="${a.id}"`)-guideContents[l.id].indexOf(`id="${b.id}"`));
  subnavigation[l.id]=entries.map(e=>`<a class="section-link" href="#${e.id}">${e.title}</a>`).join('');
 }
 const heading=(l,i)=>`<header class="page-heading"><p class="eyebrow">研究的六个层面 / 0${i+1}</p><h1>${l.name}</h1><p>${l.brief}</p></header>`;
 const home=`<section class="research-page" id="home" aria-labelledby="home-title"><header class="home-heading"><h1 id="home-title">CVList<span>，从研究想法，到可检验的研究</span></h1><div class="hero-highlight"><p class="hero-question">要把一个研究想法变成可实施、可检验的研究，需要说明哪些事情？</p></div></header><section class="guide-block"><div class="section-heading"><h2 id="breakdown-title">一项研究，拆成六个层面</h2><span>层面的定义 → 例子中的对应内容</span></div>${renderHomeBreakdown()}</section></section>`;
 const pages=layers.map((l,i)=>`<section class="research-page" id="${l.id}" aria-label="${l.name}">${l.id==='tasks'?sections:heading(l,i)+guideContents[l.id]}</section>`).join('');
 return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="CVList 从任务、研究问题、输入与数据、学习设定与方法、模型和验证方式六个层面，讲解计算机视觉研究。"><title>CVList · 计算机视觉研究指南</title><style>${componentCSS}${styles}${revisionStyles}</style></head><body><a class="skip-link" href="#main-content">跳到正文</a><svg class="image-definitions" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs>${definitions}</defs></svg><aside class="floating-nav" aria-label="研究导航"><details id="directory" class="nav-panel" open><summary aria-label="展开或收起左侧导航" title="展开或收起导航"><span class="nav-brand">CVList<span class="nav-subtitle">计算机视觉研究指南</span></span><span class="nav-toggle-label" aria-hidden="true"></span></summary><div class="nav-contents"><a class="home-link" href="#home">首页 <span>↗</span></a><p class="nav-caption">研究的六个层面</p><nav aria-label="六个研究层面">${layers.map((l,i)=>`<div class="layer-group"><a class="layer-link" href="#${l.id}" aria-controls="nav-${l.id}" aria-expanded="false"><span>0${i+1}</span>${l.name}<b aria-hidden="true">⌄</b></a><nav class="secondary-nav" id="nav-${l.id}" data-layer="${l.id}" aria-label="${l.name}二级导航" hidden>${l.id==='tasks'?directory:subnavigation[l.id]}</nav></div>`).join('')}</nav></div></details></aside><main id="main-content" tabindex="-1">${home}${pages}<footer class="site-footer"><span>CVList</span><span>理解任务，组织研究，验证想法。</span></footer></main><script>${routerScript}</script></body></html>`;
}

export const routerScript=`(()=>{
 const panel=document.getElementById('directory');
 const mobile=window.matchMedia('(max-width:820px)');
 const pages=Array.from(document.querySelectorAll('.research-page'));
 const projects=Array.from(document.querySelectorAll('.project'));
 const nav=Array.from(document.querySelectorAll('.layer-link, .home-link'));
 const secondary=Array.from(document.querySelectorAll('.secondary-nav'));
 const sublinks=Array.from(document.querySelectorAll('.task-link, .task-sublink, .section-link'));
 let expandedLayer=null,primaryNavigation=false;
 function resolve(){
  const id=window.location.hash.slice(1)||'home';
  const target=document.getElementById(id);
  const project=id==='tasks'?projects[0]:target&&target.closest('.project');
  const owner=target&&target.closest('.research-page');
  return {id,target,project,page:project?'tasks':owner?owner.id:'home'};
 }
 function update(scroll=false,preserveMenu=false){
  const state=resolve();
  if(!preserveMenu)expandedLayer=state.page;
  for(const p of pages)p.hidden=p.id!==state.page;
  for(const p of projects)p.hidden=p!==state.project;
  for(const link of nav){if(link.getAttribute('href')==='#'+state.page)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}
  for(const group of secondary)group.hidden=group.getAttribute('data-layer')!==expandedLayer;
  for(const link of nav)if(link.getAttribute('aria-controls'))link.setAttribute('aria-expanded',String(link.getAttribute('href')==='#'+expandedLayer));
  for(const link of sublinks){
   const href=link.getAttribute('href');
   const active=href==='#'+state.id||(state.id==='tasks'&&href==='#'+projects[0].id);
   if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
   if(active&&!preserveMenu){const group=link.closest('.task-group');if(group)group.open=true;}
  }
  document.title='CVList · '+(state.project?state.project.querySelector('h2').textContent:state.page==='home'?'计算机视觉研究指南':document.getElementById(state.page).querySelector('h1').textContent);
  if(mobile.matches&&!preserveMenu)panel.open=false;
  if(scroll){if(state.target&&state.id!==state.page&&state.target!==state.project)state.target.scrollIntoView({block:'start'});else window.scrollTo(0,0);}
 }
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"]');
  if(a&&a.getAttribute('href')!=='#main-content'){
   if(e.button>0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
   if(a.getAttribute('aria-controls')){
    e.preventDefault();
    const layer=a.getAttribute('href').slice(1);
    if(resolve().page===layer){expandedLayer=expandedLayer===layer?null:layer;update(false,true);}
    else{expandedLayer=layer;primaryNavigation=true;window.location.hash=a.getAttribute('href');}
    return;
   }
   if(mobile.matches)panel.open=false;
   if(a.getAttribute('href')===window.location.hash){e.preventDefault();update(true);}
  }
 });
 window.addEventListener('hashchange',()=>{const keepMenu=primaryNavigation;primaryNavigation=false;update(true,keepMenu);if(!keepMenu)document.getElementById('main-content').focus({preventScroll:true});});
 mobile.addEventListener('change',()=>{panel.open=!mobile.matches;});
 panel.open=!mobile.matches;
 update();
 if(window.location.hash)window.requestAnimationFrame(()=>update(true));
})();`;

const styles=`
:root{--ink:#293d32;--muted:#657369;--green:#486b4e;--line:#dde4da;--paper:#fafbf7}body{padding-left:280px;background:#f6f7f2;color:var(--ink);font:14px/1.8 "Segoe UI","Microsoft YaHei",sans-serif}a{color:var(--green)}a:focus-visible,summary:focus-visible{outline:2px solid #557959;outline-offset:4px}main{max-width:1320px;margin:auto;padding:48px 52px 28px;min-width:0}.floating-nav{position:fixed;inset:20px auto 20px 20px;width:240px;border:1px solid var(--line);border-radius:16px;background:#fffefb;z-index:10;overflow:auto}.nav-panel>summary{list-style:none;padding:26px 23px 23px;cursor:default;border-bottom:1px solid var(--line)}.nav-panel>summary::-webkit-details-marker{display:none}.nav-brand{font-size:29px;line-height:1.2;font-weight:650;letter-spacing:-1px}.nav-subtitle{display:block;font-size:11px;font-weight:400;letter-spacing:1px;color:var(--muted);margin-top:9px}.nav-toggle-label{display:none}.nav-contents{padding:23px 13px}.home-link{display:flex;justify-content:space-between;text-decoration:none;padding:10px 13px;border-radius:7px;font-size:14px}.home-link span{color:#8fa08e}.nav-caption{font-size:10px;color:#879182;letter-spacing:1.3px;margin:28px 13px 12px}.layer-link{display:flex;align-items:center;gap:12px;text-decoration:none;padding:12px 13px;margin:3px 0;border-radius:7px;font-size:13px}.layer-link>span{font:10px Consolas,monospace;color:#899a83}.layer-link b{margin-left:auto;font-size:12px;font-weight:400;opacity:0}.layer-link:hover,.home-link:hover{background:#f1f5ed}[aria-current=page]{background:#eaf0e4;color:#36583b;font-weight:600}.layer-link[aria-current=page] b{opacity:1}.nav-note{border-top:1px solid var(--line);margin:45px 13px 0;padding-top:20px;font-size:11px;color:#8a9586}.nav-note>span{color:#596e54}.nav-note p{line-height:2}.research-page{margin:0}.research-page[hidden],.project[hidden]{display:none!important}.project{display:block!important}.project:target{display:block}header,.home-heading,.page-heading{display:block!important;margin:0 0 30px;padding:0;border:0}.eyebrow{font:10px/1.7 "Segoe UI","Microsoft YaHei",sans-serif;letter-spacing:1.5px;color:#788975;margin:0 0 18px}h1{font-size:40px;letter-spacing:-1px;font-weight:600;line-height:1.45}.home-heading h1{font-size:51px;letter-spacing:-2px;margin:0 0 25px}.home-heading h1>span{display:block;font-size:19px;font-weight:400;letter-spacing:.5px;color:#597053;margin-top:7px}.home-heading .hero-question{font-size:24px;line-height:1.7;color:var(--ink);max-width:730px;margin:0 0 17px;letter-spacing:.2px}.home-heading .intro{font-size:13px;color:var(--muted);max-width:710px;line-height:2}.flow{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));background:#eaf0e4;border:1px solid #dfe7d8;border-radius:9px;padding:16px 10px;margin:30px 0 48px}.flow a{position:relative;text-decoration:none;font-size:12px;padding:0 12px;border-right:1px solid #d7e0d0;white-space:nowrap}.flow a:last-child{border:0}.flow a>span{display:block;font:10px Consolas,monospace;color:#85997c;margin-bottom:7px}.flow b{font-weight:400;margin-left:7px;color:#879c7e}.flow a:hover{color:#1f4c29}.guide-block{margin-top:36px}.guide-block h2{font-size:20px;font-weight:550;margin-bottom:18px}.section-heading{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:17px}.section-heading .eyebrow{margin:0 0 6px}.section-heading h2{margin:0}.section-heading>span{font-size:11px;color:#899280}.table-wrap{border:1px solid var(--line);border-radius:9px;overflow:auto;background:white}table{table-layout:auto;width:100%;font-size:13px;line-height:1.9}thead th{background:#edf1e8;color:#76816c;font-size:11px;font-weight:400;padding:12px 20px}thead th:first-child{width:21%}thead th:nth-child(2){width:45%}tbody>tr>th,tbody>tr>td{display:table-cell;vertical-align:middle;padding:19px 20px;border-bottom:1px solid #e8ece3;font-size:12px;color:#667361}tbody>tr:last-child>*{border:0}tbody>tr>th{font-weight:500;white-space:nowrap;color:#3f583b}tbody th a{text-decoration:none}.table-index{font:10px Consolas,monospace;color:#97a18e;margin-right:12px}.home-note{display:flex;align-items:center;gap:20px;background:#ebf0e5;border-radius:8px;padding:19px 23px;margin-top:34px}.home-note>span{font-size:11px;color:#6f8263;white-space:nowrap}.home-note p{font-size:12px;margin:0;color:#5b6f51}.home-note a{font-size:12px;white-space:nowrap;margin-left:auto;text-decoration:none}.page-heading{padding-bottom:25px;border-bottom:1px solid var(--line)}.page-heading .eyebrow{margin-bottom:12px}.page-heading h1{font-size:34px;margin:0 0 12px}.page-heading>p:last-child{font-size:14px;color:var(--muted)}.guide-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.guide-card{padding:23px;border:1px solid var(--line);border-radius:9px;background:#fffefb}.guide-card h3{font-size:15px;font-weight:550;margin:0 0 11px}.guide-card p{font-size:13px;color:var(--muted);line-height:2;margin:0}.worked-example{border-left:3px solid #91a981;background:#eaf0e3;padding:22px 26px;margin-top:32px;border-radius:0 8px 8px 0}.worked-example .eyebrow{display:block;margin-bottom:8px}.worked-example p{font-size:14px;line-height:2;margin:0 0 12px}.worked-example small{font-size:11px;color:#7c8c73}.page-footer{display:flex;justify-content:space-between;margin-top:45px;padding-top:20px;border-top:1px solid var(--line)}.page-footer a,.text-link{text-decoration:none;font-size:13px}.text-link{display:inline-block;margin-top:20px}.site-footer{display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:20px;margin-top:50px;font-size:11px;color:#95a08c}.site-footer a{text-decoration:none;color:#6b7f60}.task-overview{display:flex;gap:48px;margin:25px 0}.task-overview>div{display:flex;gap:12px;align-items:center}.task-overview strong{font:30px Georgia,serif;color:#496c44}.task-overview span{font-size:12px;color:var(--muted)}.section-intro{color:var(--muted);font-size:13px}.task-directory .list-group{margin-top:28px}.task-directory h2{font-size:16px}.task-list{border:1px solid var(--line);border-radius:8px;overflow:hidden}.task-link{grid-template-columns:26px 155px 1fr 18px;padding:14px 18px}.task-subnav{list-style:none;margin:0;padding:0 20px 12px 56px;display:grid;grid-template-columns:1fr 1fr;gap:5px}.task-sublink{font-size:12px;text-decoration:none;padding:5px}.task-sublink:hover{text-decoration:underline}.task-list li{border-color:var(--line)}.list-name{font-size:13px}.list-description{font-size:12px}.project h2{font-size:30px}.project-example{border:1px solid var(--line);border-radius:9px}.project-group{padding-top:8px}.agriculture-visuals{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin:20px 0}.agriculture-visuals.single{grid-template-columns:1fr}.agriculture-visuals svg{margin:auto}.agriculture-item{scroll-margin-top:25px}.agriculture-item:target{box-shadow:inset 3px 0 #91aa7c}.agriculture-source{font-size:11px}.example-details{padding:15px;background:#f4f6ef;border-radius:6px}.example-details>div{display:grid;grid-template-columns:80px 1fr;gap:12px;margin:10px 0}.example-details dt{font-size:12px;color:#819177}.example-details dd{font-size:13px;margin:0}.reconstruction-animation{max-width:360px;margin:20px auto}.reconstruction-animation img{width:100%;height:auto}.project-example .reconstruction-views{grid-template-columns:repeat(3,minmax(0,1fr))}.skip-link{position:fixed;top:-100px;left:300px;z-index:30;background:#fff;padding:10px}.skip-link:focus{top:5px}#main-content:focus{outline:none}
@media(min-width:821px){.nav-panel:not([open])>.nav-contents{display:block}}
@media(max-width:1200px){body{padding-left:254px}.floating-nav{width:224px;left:15px;top:15px;bottom:15px}main{padding:35px 30px}.flow{grid-template-columns:repeat(3,1fr);gap:18px 0}.flow a:nth-child(3){border:0}.guide-card{padding:18px}.section-heading>span{display:none}}
@media(max-width:820px){body{padding:0}.floating-nav{inset:10px 10px auto;width:auto;max-height:calc(100dvh - 20px);border-radius:11px;box-shadow:0 6px 20px #273d3210}.nav-panel>summary{display:flex;align-items:center;justify-content:space-between;padding:12px 17px;cursor:pointer;border:0}.nav-brand{font-size:21px}.nav-subtitle{display:inline;font-size:10px;margin-left:12px;letter-spacing:0}.nav-toggle-label{display:block;font-size:11px;color:#6b8060}.nav-contents{max-height:68dvh;overflow:auto;padding-top:8px}.nav-caption{margin-top:15px}.nav-note{display:none}.layer-link{padding:10px 13px}main{padding:99px 23px 26px}.home-heading h1{font-size:43px}.home-heading .hero-question{font-size:22px}.guide-grid{grid-template-columns:1fr}.home-note{flex-wrap:wrap;gap:9px 15px}.home-note a{margin-left:0}.guide-card p{font-size:13px}.task-link{grid-template-columns:26px 1fr 18px}.list-description{grid-row:2;grid-column:2}.list-arrow{grid-column:3;grid-row:1/span 2}.task-overview{gap:24px}.task-overview>div{gap:8px}.task-overview strong{font-size:25px}.task-overview span{font-size:11px}.agriculture-item{scroll-margin-top:90px}.skip-link{left:20px}}
@media(max-width:600px){main{padding:94px 16px 24px}.home-heading h1{font-size:39px}.home-heading h1>span{font-size:16px}.home-heading .hero-question{font-size:20px}.flow{padding:14px 2px;margin-bottom:32px}.flow a{padding:0 8px;font-size:11px}.flow b{margin-left:4px}.section-heading h2{font-size:18px}.table-wrap{overflow-x:auto}table{display:table;min-width:610px}thead{display:table-header-group}tbody{display:table-row-group}tr,tbody>tr{display:table-row;width:auto}tbody>tr{padding:0}tbody>tr>th,tbody>tr>td{display:table-cell;width:auto;padding:15px 17px!important}thead th{padding:11px 17px}.guide-block{margin-top:29px}.page-heading h1{font-size:28px}.project h2{font-size:25px}.task-subnav{grid-template-columns:1fr}.task-overview{gap:17px}.task-overview>div{display:block}.task-overview span{display:block}.agriculture-visuals,.project-example .reconstruction-views{grid-template-columns:1fr}.example-details>div{grid-template-columns:1fr;gap:3px}.site-footer span{font-size:10px}}
@media print{body{padding:0}.floating-nav,.skip-link,.page-footer{display:none}main{padding:0}.research-page[hidden],.project[hidden]{display:none!important}.research-page{break-inside:auto}.guide-card{break-inside:avoid}.flow{display:none}}
`;

const revisionStyles=`
/* A research idea branches into six definitions and their concrete example. */
.research-breakdown{display:grid;grid-template-columns:180px minmax(0,1fr);gap:0 38px;align-items:center;margin:24px 0 0;isolation:isolate}.breakdown-root{position:relative;background:#e9efdf;border:1px solid #cedbc1;border-radius:12px;padding:24px 16px;text-align:center}.breakdown-root:after{content:'';position:absolute;left:100%;top:50%;width:20px;border-top:1px solid #9eaf91}.root-kicker{font-size:11px;letter-spacing:2px;color:#768669}.apple-sketch{display:block;width:100%;height:auto;margin:18px 0 12px}.breakdown-root h3{font-size:20px;line-height:1.65;font-weight:600;margin:0}.breakdown-root p{font-size:12px;color:#728065;margin:14px 0}.root-caption{font-size:10px;color:#8b977e}.breakdown-branches{list-style:none;padding:0;margin:0;display:grid;gap:12px;position:relative}.breakdown-branches:before{content:'';position:absolute;left:-19px;top:calc((100% - 60px)/12);bottom:calc((100% - 60px)/12);border-left:1px solid #9eaf91}.breakdown-branch{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr);border:1px solid #dbe3d4;background:#fffefb;border-radius:9px;min-width:0}.breakdown-branch:before{content:'';position:absolute;right:100%;top:50%;width:19px;border-top:1px solid #9eaf91}.breakdown-definition{display:block;text-decoration:none;padding:17px 19px;border-radius:9px 0 0 9px}.breakdown-definition:hover{background:#f0f4e9}.branch-name{display:flex;align-items:center;gap:10px;color:#344f35}.branch-index{font:11px Consolas,monospace;color:#93a086}.branch-name strong{font-size:14px;font-weight:600}.branch-open{margin-left:auto;color:#9ca98e;font-size:12px}.breakdown-definition p,.breakdown-example p{font-size:12px;line-height:1.85;color:#6c7864;margin:9px 0 0}.breakdown-example{padding:15px 19px;background:#f1f4ec;border-left:1px solid #e0e7d9;border-radius:0 9px 9px 0}.example-kicker{font-size:10px;color:#8c987e}.breakdown-example h3{font-size:13px;font-weight:550;margin:3px 0 0;color:#48613e}.breakdown-example p{margin-top:4px}.research-breakdown>figcaption{grid-column:1/-1;text-align:right;font-size:11px;color:#8a957f;margin-top:17px}
@media(max-width:1100px){.research-breakdown{grid-template-columns:145px minmax(0,1fr);gap:0 30px}.breakdown-root{padding:20px 12px}.breakdown-root h3{font-size:17px}.breakdown-root:after{width:16px}.breakdown-branches:before{left:-15px}.breakdown-branch:before{width:15px}.breakdown-definition,.breakdown-example{padding:14px}.branch-name{gap:7px}}
@media(max-width:950px) and (min-width:821px){.research-breakdown{grid-template-columns:1fr}.breakdown-root{max-width:340px;justify-self:center;margin-bottom:30px;padding:18px 30px}.apple-sketch{width:110px;margin:10px auto}.breakdown-root:after{left:50%;top:100%;width:0;height:30px;border-top:0;border-left:1px solid #9eaf91}.breakdown-root p{margin:8px 0}.breakdown-branches{margin-left:20px}}
@media(max-width:650px){.research-breakdown{grid-template-columns:1fr;gap:0}.breakdown-root{justify-self:stretch;text-align:left;min-height:132px;padding:18px 20px;margin-bottom:26px}.apple-sketch{float:right;width:110px;margin:7px 0 0 12px}.breakdown-root h3{font-size:19px;margin-top:6px}.breakdown-root h3 br,.breakdown-root p br{display:none}.breakdown-root p{margin:6px 0}.breakdown-root:after{left:13px;top:100%;width:0;height:26px;border-top:0;border-left:1px solid #9eaf91}.root-caption{display:none}.breakdown-branches{margin-left:28px;gap:14px}.breakdown-branches:before{left:-15px;top:0;bottom:0}.breakdown-branch{grid-template-columns:1fr}.breakdown-branch:before{top:27px;width:15px}.breakdown-definition{padding:14px 16px;border-radius:9px 9px 0 0}.breakdown-example{padding:12px 16px;border-left:0;border-top:1px solid #e0e7d9;border-radius:0 0 9px 9px}.research-breakdown>figcaption{text-align:left;line-height:1.8;margin-left:28px}.branch-name strong{font-size:15px}}
@media print{.breakdown-branch{break-inside:avoid}.breakdown-definition,.breakdown-example{padding:10px 14px}.research-breakdown{gap:0 32px}}
/* Collapsible primary rail and contextual second-level navigation. */
.nav-panel>summary{display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;padding:22px 18px}.nav-brand{font-size:25px}.nav-subtitle{font-size:10px;letter-spacing:0}.nav-toggle-label{display:block;flex:none;font-size:20px;line-height:1;color:#647d5c}.nav-toggle-label:after{content:'‹'}.nav-panel:not([open]) .nav-toggle-label:after{content:'›'}.nav-panel:not([open])>.nav-contents{display:none}.nav-contents{padding:16px 10px}.nav-caption{margin-top:22px}.secondary-nav{margin:5px 4px 15px 20px;padding-left:10px;border-left:1px solid #dbe4d4}.secondary-nav[hidden]{display:none!important}.layer-link b{opacity:1}.layer-link[aria-expanded=false] b{transform:rotate(-90deg)}.secondary-nav .list-group{margin:15px 0 0}.secondary-nav .list-group>h2{font-size:10px;line-height:1.8;font-weight:400;color:#8b9980;margin:0 0 5px;padding:0 5px}.secondary-nav .task-group>summary{display:flex;align-items:center;gap:5px;list-style:none;cursor:pointer;padding:6px 5px;border-radius:5px}.secondary-nav .task-group>summary::-webkit-details-marker{display:none}.secondary-nav .task-group>summary:after{content:"›";margin-left:auto;color:#7e9173;font-size:14px;flex:none}.secondary-nav .task-group[open]>summary:after{transform:rotate(90deg)}.secondary-nav .task-group>summary:hover{background:#f0f4eb}.secondary-nav .task-group>summary>h2{font-size:11px;line-height:1.8;font-weight:500;color:#65785c;margin:0}.secondary-nav .task-group>.task-list{padding-left:8px}.secondary-nav .task-group .task-sublink{display:flex;gap:7px;align-items:baseline}.secondary-nav .task-sublink .list-number{flex:none}.secondary-nav .task-sublink .list-name{font-size:inherit}.secondary-nav .task-list{border:0;background:transparent;border-radius:0;overflow:visible}.secondary-nav .task-list li{border:0}.secondary-nav .task-link{display:flex;gap:7px;padding:8px 6px;min-height:34px;border-radius:5px}.secondary-nav .list-number{width:17px;flex:none;font-size:10px}.secondary-nav .list-name{font-size:12px;font-weight:400}.secondary-nav .list-description,.secondary-nav .list-arrow{display:none}.secondary-nav .task-sublink,.section-link{display:block;padding:8px 6px;font-size:11px;line-height:1.8;border-radius:5px;text-decoration:none}.section-link:hover,.task-sublink:hover{background:#f0f4eb}.secondary-nav [aria-current=location]{background:#eaf0e4;color:#36583b;font-weight:600}.guide-block,.worked-example{scroll-margin-top:26px}
.home-heading h1{display:flex;align-items:baseline;white-space:nowrap;gap:0;font-size:clamp(25px,3.2vw,40px);margin:0 0 27px;letter-spacing:-1px}.home-heading h1>span{display:inline;font-size:.62em;letter-spacing:0;margin:0;font-weight:400}.hero-highlight{padding:26px 29px;background:#eaf0e2;border:1px solid #d9e3cf;border-left:4px solid #819b70;border-radius:9px}.home-heading .hero-question{font-size:21px;max-width:none;margin:0}.home-heading .intro{font-size:13px;margin:0;max-width:none;color:#63765a}thead th:first-child{width:18%}thead th:nth-child(2){width:32%}thead th:nth-child(3){width:16%}thead th:nth-child(4){width:34%}table{table-layout:auto}tbody>tr>th,tbody>tr>td{padding:18px 15px}thead th{padding:12px 15px}.table-index{margin-right:9px}
@media(min-width:821px){body:has(.nav-panel:not([open])){padding-left:96px}.floating-nav:has(.nav-panel:not([open])){width:58px}.nav-panel:not([open])>summary{justify-content:center;padding:25px 12px;border:0}.nav-panel:not([open]) .nav-brand{display:none}.floating-nav:has(.nav-panel:not([open])) .nav-toggle-label{font-size:26px}}
@media(max-width:820px){.nav-panel>summary{padding:13px 17px}.nav-brand{font-size:21px}.nav-subtitle{font-size:10px}.nav-toggle-label:after{content:'−'}.nav-panel:not([open]) .nav-toggle-label:after{content:'＋'}.secondary-nav .list-name{font-size:13px}.secondary-nav .task-link{padding:9px 6px}.secondary-nav .task-sublink,.section-link{font-size:12px}.guide-block,.worked-example{scroll-margin-top:90px}.hero-highlight{padding:21px}.home-heading .hero-question{font-size:19px}}
@media(max-width:600px){.home-heading h1{font-size:25px}.home-heading h1>span{font-size:.49em}.hero-highlight{padding:18px}.home-heading .hero-question{font-size:17px}.home-heading .intro{font-size:12px}table{min-width:680px}tbody>tr>th,tbody>tr>td{padding:16px 14px!important}.home-heading{margin-bottom:28px}.nav-subtitle{display:inline}}
@media print{body:has(.nav-panel:not([open])){padding:0}.hero-highlight{break-inside:avoid}}
`;
