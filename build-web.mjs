// Build the portable CVList research guide and task branch.
import './lib/paths.mjs';
import {renderResearchSite} from './lib/research-site.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
const root=path.dirname(fileURLToPath(import.meta.url));
const tasks=JSON.parse(await fs.readFile(path.join(root,'tasks.json'),'utf8'));
const publicExamples=JSON.parse(await fs.readFile(path.join(root,'public-examples.json'),'utf8'));
const taskNotes=JSON.parse(await fs.readFile(path.join(root,'task-notes.json'),'utf8'));
const agriculture=JSON.parse(await fs.readFile(path.join(root,'agriculture.json'),'utf8'));
const groups=['基础视觉任务','空间感知、三维、图图任务','时序与动态视觉任务','视觉与语言结合的任务','视觉生成与编辑任务'];
const descriptions={
  '01':'判断整张图像属于哪个类别。',
  '02':'根据图像预测一个连续数值。',
  '03':'识别目标，并用矩形框标出位置。',
  '04':'逐像素标出不同类别或物体的区域。',
  '05':'找到两张图中同一位置的对应点。',
  '06':'预测画面中各个位置的远近。',
  '07':'利用多个视角恢复物体或场景的三维形状。',
  '08':'结合可见光、近红外等波段进行分类、检测或分割。',
  '09':'在视频中持续识别同一个目标并记录位置。',
  '10':'找出同一场景在不同时间发生变化的区域。',
  '11':'根据一句描述，找到视频中对应的起止时间。',
  '12':'将图像内容描述成一句或一段文字。',
  '13':'结合图片内容回答一个问题。',
  '14':'用文字指定对象，输出其位置框。',
  '15':'根据文字找图片，或根据图片找文字。',
  '16':'用文字指定对象，输出该对象的像素掩码。',
  '17':'根据文字描述生成新图像。',
  '18':'根据已有图片和可选指令，生成修改后的图片。'
};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const images=new Map();
const animationImages=[];
const provenance=[];
const publicProvenance=[];
function technicalNotes(task){
  const note=taskNotes[task.id];
  if(!note?.core||!note.models?.length||!note.current||!note.application)throw Error('Missing technical notes for '+task.id);
  const models=note.models.map(model=>`<a class="model-reference" href="${esc(model.url)}" target="_blank" rel="noopener noreferrer">${esc(model.name)}</a>`).join('');
  return `<dl class="technical-notes" aria-label="核心技术与模型"><div><dt>核心技术</dt><dd>${esc(note.core)}</dd></div><div><dt>代表模型／方法</dt><dd class="model-links">${models}</dd></div><div><dt>本例方法</dt><dd>${esc(note.current)}</dd></div><div><dt>主要应用</dt><dd>${esc(note.application)}</dd></div></dl>`;
}
async function figure(file,caption,crop=null){
  if(!images.has(file)){
    const published=file.startsWith('assets/public-examples/')||file.startsWith('assets/agriculture/');
    const compressed=await sharp(path.join(root,file)).resize({width:published?1200:560,height:published?900:420,fit:'inside',withoutEnlargement:true}).webp({quality:published?86:80}).toBuffer();
    const meta=await sharp(compressed).metadata();
    images.set(file,{id:'image-'+images.size,width:meta.width,height:meta.height,data:compressed.toString('base64'),source:file});
  }
  const im=images.get(file);
  const [cx,cy,cw,ch]=crop??[0,0,1,1];
  if(![cx,cy,cw,ch].every(Number.isFinite)||cx<0||cy<0||cw<=0||ch<=0||cx+cw>1.00001||cy+ch>1.00001)throw Error('Invalid illustration viewport');
  const [x,y,w,h]=[cx*im.width,cy*im.height,cw*im.width,ch*im.height];
  return `<figure><svg viewBox="${x} ${y} ${w} ${h}" style="aspect-ratio:${w}/${h};max-width:${w}px" role="img" aria-label="${esc(caption)}"><title>${esc(caption)}</title><use href="#${im.id}"></use></svg><figcaption>${esc(caption)}</figcaption></figure>`;
}
async function animationFigure(item){
  const data=await fs.readFile(path.join(root,item.file));
  const meta=await sharp(data,{animated:true}).metadata();
  if(!meta.pages||meta.pages<2)throw Error('Expected animated reconstruction example');
  animationImages.push({source:item.file,width:meta.width,height:meta.pageHeight,pages:meta.pages});
  return `<figure class="reconstruction-animation"><img width="${meta.width}" height="${meta.pageHeight}" src="data:image/webp;base64,${data.toString('base64')}" alt="${esc(item.caption)}"><figcaption>${esc(item.caption)}</figcaption></figure>`;
}
async function pair(a,labelA,b,labelB){return `<div class="examples">${await figure(a,labelA)}${await figure(b,labelB)}</div>`;}
async function example(task){
  if(!task.script && publicExamples[task.id]){
    const sample=publicExamples[task.id];
    publicProvenance.push({id:task.id,kind:sample.kind,source_url:sample.source_url});
    const pictures=[];
    for(const f of sample.figures)pictures.push(await figure(f.file,f.caption));
    let details=sample.details?`<dl class="example-details">${sample.details.map(d=>`<div><dt>${esc(d.label)}</dt><dd>${esc(d.text)}</dd></div>`).join('')}</dl>`:'';
    if(sample.animation)details+=await animationFigure(sample.animation);
    if(sample.prediction){const p=sample.prediction;details+=`<p class="published-time">作者示例的第 ${p.rank} 个预测候选：<strong>${p.start.toFixed(2)}—${p.end.toFixed(2)} 秒</strong>；人工标注：${p.ground_truth_start}—${p.ground_truth_end} 秒。</p>`;}
    return `<div class="public-example"><p>${esc(sample.text)}</p>${details}<div class="examples ${task.id==='07'?'reconstruction-views':pictures.length===1?'public-single':''}">${pictures.join('')}</div><p class="example-origin"><a class="source-link" href="${esc(sample.source_url)}" target="_blank" rel="noopener noreferrer">来源：${esc(sample.source_name)} ↗</a></p></div>`;
  }
  if(!task.script)return `<p>${esc(task.example)}</p><small>文字示例，暂无模型运行图。</small>`;
  const result=JSON.parse(await fs.readFile(path.join(root,'results',task.result_dir,'result.json'),'utf8'));
  provenance.push({id:task.id,model:result.model,revision:result.revision});
  switch(task.id){
    case '01':return `<p>输入汽车照片 → 预测类别为“汽车”。</p><div class="examples single">${await figure('assets/car.jpg','预测：汽车')}</div>`;
    case '02':return `<p>输入照片 → 图像质量原始分数为 <strong>${Number(result.score_raw).toFixed(4)}</strong>。</p><div class="examples single">${await figure('assets/car.jpg','质量回归示例；原始值，不是百分制')}</div>`;
    case '03':return `<p>输入照片 → 框出狗、自行车等目标。</p>${await pair('assets/dog.jpg','输入照片','results/03_detection/detections.png','YOLOv10n 检测结果：类别、置信度与边界框')}`;
    case '04':return `<p>输入房屋照片 → 分割建筑、天空和植被。</p>${await pair('assets/house.jpg','输入照片','results/04_segmentation/segmentation.png','语义分割结果')}`;
    case '06':return `<p>输入汽车照片 → 预测前景与背景的相对远近。</p>${await pair('assets/car.jpg','输入照片','results/06_depth_estimation/depth.png','相对深度图，非米制距离')}`;
    case '09':return `<p>输入真实监控视频 → 为不同采样时刻中的目标关联编号。</p>${await pair('results/09_multi_object_tracking/frame_0000.png','较早采样帧','results/09_multi_object_tracking/frame_0005.png','后续采样帧；基础跟踪示例')}`;
    case '10':return `<p>对比两个时刻 → 红色标出语义类别发生变化的区域。</p>${await pair('assets/frames/frame_0000.jpg','较早时刻','results/10_change_detection/overlay.png','较晚时刻的变化标记；基础实现')}`;
    case '12':return `<p>输入汽车照片 → 生成场景描述。</p><div class="caption-example">${await figure('assets/car.jpg','输入照片')}<blockquote>${esc(result.caption)}</blockquote></div>`;
    case '14':return `<p>输入“the green car” → 框出绿色汽车。</p>${await pair('assets/car.jpg','输入照片','results/14_referring_grounding/grounding.png','文字指定的目标框')}`;
    case '15':return `<p>输入“two cats on a sofa” → 从图库中优先找到两只猫的照片。</p><div class="examples single">${await figure('assets/'+path.basename(result.ranking[0].file),'实际检索的第一名')}</div>`;
    case '16':return `<p>输入“the green car” → 沿轮廓分割出绿色汽车。</p>${await pair('assets/car.jpg','输入照片','results/16_referring_segmentation/overlay.png','文字指定的分割区域')}`;
    default:throw Error('No example renderer for '+task.id);
  }
}
let sections='',directory='';
for(const [index,name] of groups.entries()){
  const links=[];
  for(const task of tasks.filter(t=>t.group===index+1)){
    links.push(`<li><a class="task-link" href="#task-${task.id}"><span class="list-number">${task.id}</span><span class="list-name">${esc(task.name)}</span><span class="list-description">${esc(descriptions[task.id])}</span><span class="list-arrow" aria-hidden="true">→</span></a></li>`);
    sections+=`<article class="project" id="task-${task.id}" data-task="${task.id}" data-example="${task.script?'real':publicExamples[task.id]?'public':'text'}"><p class="project-group">${esc(name)}</p><h2><span class="project-number">${task.id}</span>${esc(task.name)}</h2><p class="project-description">${esc(descriptions[task.id])}</p>${technicalNotes(task)}<div class="project-example"><h3>示例</h3>${await example(task)}</div></article>`;
  }
  directory+=`<details class="list-group task-group"><summary><h2>${['一','二','三','四','五'][index]}、${esc(name)}</h2></summary><ol class="task-list" aria-label="${esc(name)}">${links.join('')}</ol></details>`;
}
const agricultureItems=agriculture.categories.flatMap(c=>c.items);
let agricultureCategories='';
for(const category of agriculture.categories){
  let entries='';
  for(const item of category.items){
    if(!item.figures?.length||!item.sources?.length)throw Error('Missing agricultural illustrations: '+item.name);
    const pictures=[];
    for(const f of item.figures)pictures.push(await figure(f.file,f.caption,f.crop));
    const sources=item.sources.map(ref=>`<a class="agriculture-source" href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">${esc(ref.name)} ↗</a>`).join(' · ');
    entries+=`<li class="agriculture-item" id="${esc(item.id)}"><h4>${esc(item.name)}</h4><p class="agriculture-flow">${esc(item.flow)}</p><p><span class="agriculture-label">示例</span>${esc(item.example)}</p><div class="agriculture-visuals ${pictures.length===1?'single':''}">${pictures.join('')}</div><p class="agriculture-image-note">${esc(item.image_note)}</p><p class="agriculture-image-origin">来源：${sources}</p><p class="agriculture-condition"><span class="agriculture-label">数据条件</span>${esc(item.condition)}</p></li>`;
  }
  agricultureCategories+=`<section class="agriculture-category"><h3>${esc(category.name)}</h3><ol class="agriculture-list">${entries}</ol></section>`;
}
sections+=`<article class="project agriculture" id="task-agriculture"><p class="project-group">农业数据应用拓展</p><h2>${esc(agriculture.title)}</h2><p class="project-description">${esc(agriculture.intro)}</p>${agricultureCategories}<p class="agriculture-references">方法参考：${agriculture.references.map(ref=>`<a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">${esc(ref.name)}</a>`).join(' · ')}</p></article>`;
const agricultureLinks=agricultureItems.map((item,index)=>`<li><a class="task-sublink" href="#${esc(item.id)}"><span class="list-number">${String(index+1).padStart(2,'0')}</span><span class="list-name">${esc(item.name)}</span></a></li>`).join('');
directory+=`<details class="list-group task-group"><summary><h2>六、${esc(agriculture.title)}</h2></summary><ol class="task-list" aria-label="农业数据任务组合">${agricultureLinks}</ol></details>`;
const agricultureCSS=`body:has(#task-agriculture:target) .task-link[href="#task-agriculture"]{background:#e9f0e1;color:#39562a}.agriculture-category{margin:26px 0 0}.agriculture-category>h3{font-size:15px;font-weight:500;margin:0 0 12px;color:#647656}.agriculture-list{list-style:none;padding:0;margin:0;border:1px solid #e6ebdf;border-radius:8px;background:#fff;overflow:hidden}.agriculture-list>li{padding:18px 22px;border-bottom:1px solid #e8ecdf}.agriculture-list>li:last-child{border-bottom:0}.agriculture-list h4{font-size:16px;font-weight:500;margin:0 0 7px;color:#35492b}.agriculture-list p{font-size:13px;margin:6px 0 0;line-height:1.85;color:#66755a}.agriculture-list .agriculture-flow{color:#4f6741}.agriculture-label{display:inline-block;margin-right:10px;color:#92a084;font-size:11px}.agriculture-list .agriculture-condition{color:#85917b;font-size:12px}.agriculture-references{font-size:11px;color:#8a967f;line-height:2.2;margin:22px 0 0}.agriculture-references a{color:#708562;text-underline-offset:3px}@media(max-width:700px){.agriculture-list>li{padding:16px}.agriculture-list h4{font-size:15px}.agriculture-category>h3{font-size:14px}}`;
const definitions=[...images.values()].map(im=>`<image id="${im.id}" width="${im.width}" height="${im.height}" href="data:image/webp;base64,${im.data}"></image>`).join('');
const css=`:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;color:#262c27;background:#f5f5f0;font:15px/1.75 -apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif}main{max-width:1180px;margin:auto;padding:46px 32px 64px}header{margin-bottom:38px}h1{font-size:30px;line-height:1.4;letter-spacing:-.6px;font-weight:600;margin:0 0 12px}header p{font-size:13px;color:#777f76;margin:0}section{margin-top:38px}h2{font-size:20px;font-weight:600;margin:0 0 14px;letter-spacing:.1px}table{width:100%;border-collapse:collapse;table-layout:fixed;background:#fff}.task-column{width:18%}.description-column{width:26%}.example-column{width:56%}thead th{text-align:left;font-size:13px;font-weight:500;padding:12px 18px;background:#e9ede5;color:#606b5d;border-bottom:1px solid #dce2d7}tbody>tr>th,tbody>tr>td{text-align:left;vertical-align:top;padding:20px 18px;border-bottom:1px solid #e4e8df}tbody>tr>th{font-size:15px;font-weight:500}.number{display:block;font:11px/1.6 Consolas,monospace;color:#a0a89c;margin-bottom:5px}.description{color:#707a6d;font-size:14px}.example p{margin:0 0 12px;font-size:14px}.example small{display:block;color:#949c8f;font-size:12px}.examples{display:grid;grid-template-columns:1fr 1fr;gap:12px}.examples.single{grid-template-columns:1fr;max-width:245px}figure{margin:0;min-width:0}figure svg{width:100%;height:auto;aspect-ratio:4/3;display:block;background:#f0f0e8;border-radius:3px}figcaption{font-size:11px;color:#8a9383;margin-top:5px;line-height:1.6}strong{font-weight:600}.caption-example{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:center}blockquote{font-size:13px;line-height:1.8;color:#5c6857;margin:0;padding-left:12px;border-left:2px solid #b6c3ac;overflow-wrap:anywhere}.image-definitions{position:absolute;width:0;height:0;overflow:hidden}@media(max-width:850px){main{padding:32px 20px 45px}.task-column{width:21%}.description-column{width:26%}.example-column{width:53%}tbody>tr>th,tbody>tr>td{padding:16px 13px}thead th{padding:11px 13px}.examples{gap:8px}.caption-example{grid-template-columns:1fr}.caption-example figure{max-width:230px}}@media(max-width:600px){main{padding:28px 16px 38px}header{margin-bottom:24px}h1{font-size:25px}header p{font-size:12px}h2{font-size:18px;margin-bottom:10px}section{margin-top:28px}table,tbody,tr,tbody>tr>th,tbody>tr>td{display:block;width:100%}colgroup,thead{display:none}tbody>tr{padding:18px 16px;border-bottom:1px solid #e0e5da}tbody>tr>th,tbody>tr>td{padding:0;border:0}.number{display:inline;font-size:11px;margin-right:10px}tbody>tr>th{font-size:16px}.description{font-size:13px;padding-top:5px!important;padding-bottom:12px!important}.example p{font-size:13px}.examples.single{max-width:260px}.examples{gap:10px}.caption-example{grid-template-columns:1fr 1fr;gap:12px}.caption-example figure{max-width:none}blockquote{font-size:12px;padding-left:9px}figcaption{font-size:10px}}@media print){body{background:#fff}main{padding:0;max-width:none}header{margin-bottom:20px}section{break-inside:auto;margin-top:24px}tr{break-inside:avoid}h2{break-after:avoid}thead{display:table-header-group}}`;
const listCSS=`main{max-width:1000px}header{margin-bottom:28px}.list-group{margin-top:25px}.list-group>h2{font-size:17px;margin:0 0 10px}.task-list{list-style:none;padding:0;margin:0;background:#fff}.task-list li{border-bottom:1px solid #e4e8df}.task-list li:last-child{border-bottom:0}.task-link{display:grid;grid-template-columns:32px 148px 1fr 18px;gap:12px;align-items:center;padding:16px 20px;color:inherit;text-decoration:none}.task-link:hover{background:#eaf0e5}.task-link:focus-visible,.back-link:focus-visible{outline:2px solid #627e50;outline-offset:2px}.list-number{font:12px Consolas,monospace;color:#98a38f}.list-name{font-size:15px;font-weight:500}.list-description{font-size:13px;color:#7b8673}.list-arrow{font-size:16px;color:#91a084}.project{display:none;margin:0;scroll-margin-top:24px}.project:target{display:block}.back-link{display:inline-block;color:#6e805f;text-decoration:none;font-size:13px;margin-bottom:28px}.project-group{font-size:12px;color:#8a9681;margin:0 0 5px}.project h2{font-size:28px;line-height:1.5;display:flex;gap:15px;align-items:center}.project-number{font:20px Consolas,monospace;color:#9aa58f}.project-description{font-size:15px;color:#6e7b63;margin:12px 0 26px}.project-example{background:white;padding:25px}.project-example h3{font-size:14px;font-weight:500;margin:0 0 14px;color:#7f8d74}.project-example>p{margin:0 0 18px;font-size:14px}.project-example>small{font-size:12px;color:#949c8f}.project-example .examples.single{max-width:440px}.project-example .caption-example{grid-template-columns:1fr 1fr}.project-example blockquote{font-size:17px}.project-example figcaption{font-size:12px;margin-top:8px}@media(max-width:700px){.task-link{grid-template-columns:26px 1fr 18px;gap:3px 10px;padding:13px 15px}.list-description{grid-column:2;grid-row:2;font-size:12px}.list-arrow{grid-column:3;grid-row:1 / span 2}.list-name{font-size:14px}.project-example{padding:18px}.project h2{font-size:24px}.project-example .examples{grid-template-columns:1fr}.project-example .caption-example{grid-template-columns:1fr}.project-example blockquote{font-size:15px}.project-description{font-size:14px}.back-link{margin-bottom:22px}}@media print{#directory{display:block!important}.project{display:block!important;break-before:page}header{display:block!important}.back-link{display:none}}`;
const publicCSS='.public-example>p{font-size:14px;margin:0 0 16px}.public-example .public-single{grid-template-columns:1fr}.public-example .example-origin{font-size:12px;line-height:1.8;color:#89977c;margin:18px 0 0}.source-link{color:#6d805c;text-decoration:underline;text-underline-offset:3px}.published-time{background:#f2f5ee;padding:10px 13px;border-left:2px solid #9db18d}';
const notesCSS='.technical-notes{margin:-9px 0 26px;padding:15px 18px;background:#ecf1e6;border-radius:7px}.technical-notes>div{display:grid;grid-template-columns:105px minmax(0,1fr);gap:13px;align-items:start;margin-bottom:10px}.technical-notes>div:last-child{margin-bottom:0}.technical-notes dt{font-size:12px;color:#88977b;line-height:1.9}.technical-notes dd{margin:0;font-size:13px;line-height:1.85;color:#536548;overflow-wrap:anywhere}.model-links{display:flex;flex-wrap:wrap;gap:6px 9px}.model-reference{display:inline-block;padding:1px 7px;border-radius:3px;background:#fbfcf8;color:#5e7950;text-decoration:none;border-bottom:1px solid #d2deca;font-size:12px}.model-reference:hover{text-decoration:underline}.model-reference:focus-visible{outline:2px solid #627e50;outline-offset:2px}@media(max-width:600px){.technical-notes{padding:13px 15px;margin-bottom:21px}.technical-notes>div{grid-template-columns:1fr;gap:2px;margin-bottom:11px}.technical-notes dt{font-size:11px}.technical-notes dd{font-size:12px}}';
const html=renderResearchSite({sections,directory,definitions,componentCSS:css.replace('@media print)','@media print')+listCSS+publicCSS+notesCSS+agricultureCSS});
const destinations=[path.join(root,'index.html'),path.join(root,'web','dist','index.html')];
await fs.mkdir(path.join(root,'web','dist'),{recursive:true});
for(const file of destinations)await fs.writeFile(file,html);
const report={generated_at:new Date().toISOString(),mode:'portable-six-layer-research-guide',research_pages:7,tasks:18,groups:6,agricultural_combinations:agricultureItems.length,agricultural_sublinks:agricultureItems.length,agricultural_illustrations:agricultureItems.reduce((n,t)=>n+t.figures.length,0),technical_notes:Object.keys(taskNotes).length,real_examples:provenance.length,public_examples:publicProvenance.length,text_only_examples:tasks.length-provenance.length-publicProvenance.length,embedded_images:images.size+animationImages.length,html_bytes:Buffer.byteLength(html),models:provenance,public_sources:publicProvenance,sources:[...[...images.values()].map(({source,width,height})=>({source,width,height})),...animationImages],outputs:destinations.map(f=>path.relative(root,f))};
await fs.writeFile(path.join(root,'results','web-export.json'),JSON.stringify(report,null,2));
console.log(`Built portable HTML: 18 task links plus an agricultural combinations chapter, ${images.size+animationImages.length} embedded images, ${(Buffer.byteLength(html)/1024).toFixed(0)} KiB. No external files required.`);
