// Check that each HTML is portable and its embedded examples remain real.
import './lib/paths.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {layers} from './lib/research-site.mjs';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
const root=path.dirname(fileURLToPath(import.meta.url));
const html=await fs.readFile(path.join(root,'index.html'),'utf8');
assert.equal(html,await fs.readFile(path.join(root,'web','dist','index.html'),'utf8'));
const names=['分类','回归','目标检测','图像分割','图像匹配','深度估计','三维重建','多光谱视觉感知','多目标跟踪','变化检测','视频时刻定位','图像描述','视觉问答','指称表述定位','图文检索','指称表述分割','文生图','图像编辑与转换'];
const tasks=JSON.parse(await fs.readFile(path.join(root,'tasks.json'),'utf8'));
assert.deepEqual(tasks.map(t=>t.name),names);
assert.deepEqual([...html.matchAll(/<article class="project" id="task-(\d+)"/g)].map(m=>m[1]),tasks.map(t=>t.id));
assert.deepEqual([...html.matchAll(/class="task-link" href="#task-(\d+)"/g)].map(m=>m[1]),tasks.map(t=>t.id));
assert.equal((html.match(/<details class="list-group task-group">/g)??[]).length,6);
assert.equal((html.match(/class="floating-nav"/g)??[]).length,1);
assert(html.includes('.floating-nav{position:fixed;'));
assert(html.includes('<details id="directory" class="nav-panel" open>'));
assert(html.includes('id="home-title"'));
assert.equal((html.match(/class="layer-link"/g)||[]).length,6);
assert.equal((html.match(/<table>/g)||[]).length,0);
assert.equal((html.match(/class="breakdown-branch"/g)||[]).length,6);
assert.equal((html.match(/class="breakdown-definition"/g)||[]).length,6);
assert(html.includes('改造 YOLO<br>检测密集苹果'));
assert(!html.includes('COMPUTER VISION · RESEARCH GUIDE'));
assert(html.includes('<h1 id="home-title">CVList<span>，从研究想法，到可检验的研究</span></h1>'));
assert(/class="hero-highlight">[\s\S]*?class="hero-question">/.test(html));
assert(!/<nav\b/.test(html.match(/<main[\s\S]*?<\/main>/)[0]));
assert.equal((html.match(/class="secondary-nav"/g)||[]).length,6);
for(const layer of layers){assert(html.includes('id="'+layer.id+'"'));assert(html.includes('data-layer="'+layer.id+'"'));}
const homepage=html.slice(html.indexOf('<section class="research-page" id="home"'),html.indexOf('<section class="research-page" id="tasks"'));
for(const heading of ['关键行动','完成标志','怎么确定'])assert(!homepage.includes(heading));
assert(html.includes('要把一个研究想法变成可实施、可检验的研究，需要说明哪些事情？'));
assert(html.includes('.project:target{display:block}'));
assert.equal((html.match(/data-example="real"/g)??[]).length,11);
assert.equal((html.match(/data-example="public"/g)??[]).length,7);
assert.equal((html.match(/data-example="text"/g)??[]).length,0);
for(const article of html.matchAll(/<article class="project"[^>]*>([\s\S]*?)<\/article>/g))assert(article[1].includes('<figure>'),'A task is missing its illustrated example');

assert(!/<script\b[^>]*\bsrc=|<button\b|<dialog\b|<link\b/i.test(html));
assert(!/\bsrc="(?!data:|#)/i.test(html));
assert(!/\bhref="(?:file:|\.\.|[a-z]:)/i.test(html));
const publicSources=JSON.parse(await fs.readFile(path.join(root,'public-examples.json'),'utf8'));
const agriculture=JSON.parse(await fs.readFile(path.join(root,'agriculture.json'),'utf8'));
const taskNotes=JSON.parse(await fs.readFile(path.join(root,'task-notes.json'),'utf8'));
assert.equal(Object.keys(taskNotes).length,18);
assert.equal((html.match(/<dl class="technical-notes"/g)??[]).length,18);
for(const task of tasks){const note=taskNotes[task.id];assert(note.core&&note.current&&note.application&&note.models.length);assert(html.includes(note.application));assert(html.includes(note.core));assert(html.includes(note.current));}
const expectedUrls=new Set([...Object.values(publicSources).map(s=>s.source_url),...agriculture.references.map(ref=>ref.url),...agriculture.categories.flatMap(c=>c.items.flatMap(i=>i.sources.map(s=>s.url)))]);
for(const note of Object.values(taskNotes))for(const model of note.models){assert(model.name&&model.url.startsWith('https://'));expectedUrls.add(model.url);}
for(const link of html.matchAll(/\bhref="(https:[^"]+)"/g))assert(expectedUrls.has(link[1]));
assert.equal((html.match(/class="source-link"/g)??[]).length,7);
assert.equal((html.match(/<dt>主要应用<\/dt>/g)??[]).length,18);
assert(html.includes('计算机视觉研究指南'));

assert(!html.includes('选择任务，查看说明'));
assert(html.includes('YOLO 系列（本例采用 YOLOv10n）'));
const reconstruction=html.match(/<article class="project" id="task-07"[\s\S]*?<\/article>/)[0];
assert(reconstruction.includes('reconstruction-animation'));
assert.equal((reconstruction.match(/<figure/g)??[]).length,4);
assert(reconstruction.includes('观察重点'));
assert(!html.includes('???'));
assert(!/本机|本地已运行|并非本地/.test(html));
assert(!html.includes('D:\\project')&&!html.includes('C:\\Users'));
const embedded=new Map();
for(const match of html.matchAll(/<image id="([^"]+)"[^>]*href="data:image\/webp;base64,([^"]+)"/g)){
  const meta=await sharp(Buffer.from(match[2],'base64')).metadata();assert(meta.width>0&&meta.height>0);embedded.set(match[1],meta);
}
let animatedCount=0;
for(const match of html.matchAll(/<img[^>]*src="data:image\/webp;base64,([^"]+)"/g)){
 const meta=await sharp(Buffer.from(match[1],'base64'),{animated:true}).metadata();
 assert(meta.width>0&&meta.pageHeight>0&&meta.pages===40);animatedCount++;
}
assert.equal(animatedCount,1);assert(embedded.size>0);
for(const match of html.matchAll(/<use href="#([^"]+)"/g))assert(embedded.has(match[1]));
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
for(const match of html.matchAll(/\bhref="#([^"]+)"/g))assert(ids.has(match[1]),'Broken internal link: '+match[1]);
const exported=JSON.parse(await fs.readFile(path.join(root,'results','web-export.json'),'utf8'));
for(const item of exported.models){assert(item.model&&item.revision);}
const code=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0]?.[1];assert(code);
const agriculturalItems=agriculture.categories.flatMap(c=>c.items);
// Exercise page ownership, contextual subnavigation and collapse persistence.
const events={},mobile={matches:false,addEventListener:(name,fn)=>{events['media:'+name]=fn;}};
const panel={open:true};
const pages=['home',...layers.map(l=>l.id)].map(id=>({id,hidden:false,querySelector:()=>({textContent:id})}));
const projects=[...tasks.map(t=>'task-'+t.id),'task-agriculture'].map(id=>({id,hidden:false,querySelector:()=>({textContent:id})}));
const makeLink=(id,attrs={})=>({attrs:{href:'#'+id,...attrs},closest(){return null;},getAttribute(n){return this.attrs[n];},setAttribute(n,v){this.attrs[n]=v;},removeAttribute(n){delete this.attrs[n];}});
const links=['home',...layers.map(l=>l.id)].map(id=>makeLink(id,id==='home'?{}:{'aria-controls':'nav-'+id}));
const secondary=layers.map(l=>({...makeLink('',{'data-layer':l.id}),hidden:true}));
const sectionIds=[...html.matchAll(/class="(?:guide-block|worked-example)" id="([^"]+)"/g)].map(m=>m[1]);
const sublinks=[...projects.map(p=>makeLink(p.id)),...agriculturalItems.map(t=>makeLink(t.id)),...sectionIds.map(id=>makeLink(id))];
const groupStates=Array.from({length:6},()=>({open:false}));
for(const link of sublinks){const task=tasks.find(t=>link.attrs.href==='#task-'+t.id);const index=task?task.group-1:agriculturalItems.some(t=>link.attrs.href==='#'+t.id)?5:null;link.closest=()=>index===null?null:groupStates[index];}

let focusCount=0,topScrolls=0;const scrolled=[];
const targets=new Map();
for(const p of pages){p.closest=selector=>selector==='.research-page'?p:null;targets.set(p.id,p);}
for(const p of projects){p.closest=selector=>selector==='.project'?p:pages[1];targets.set(p.id,p);}
for(const id of sectionIds)targets.set(id,{closest:s=>s==='.research-page'?pages.find(p=>id.startsWith(p.id+'-')):null,scrollIntoView:()=>scrolled.push(id)});
for(const item of agriculturalItems)targets.set(item.id,{closest:s=>s==='.project'?projects.at(-1):pages[1],scrollIntoView:()=>scrolled.push(item.id)});
targets.set('directory',panel);targets.set('main-content',{focus:()=>{focusCount++;}});
const document={title:'',getElementById:id=>targets.get(id)||null,querySelectorAll:s=>({'.research-page':pages,'.project':projects,'.layer-link, .home-link':links,'.secondary-nav':secondary,'.task-link, .task-sublink, .section-link':sublinks}[s]),addEventListener:(name,fn)=>{events['document:'+name]=fn;}};
const window={location:{hash:''},matchMedia:()=>mobile,addEventListener:(name,fn)=>{events[name]=fn;},scrollTo:()=>{topScrolls++;},requestAnimationFrame:fn=>fn()};
vm.runInNewContext(code,{window,document});
const visiblePage=()=>pages.filter(p=>!p.hidden).map(p=>p.id);
const visibleSubnav=()=>secondary.filter(p=>!p.hidden).map(p=>p.getAttribute('data-layer'));
const navigate=hash=>{window.location.hash=hash;events.hashchange();};
assert.deepEqual(visiblePage(),['home']);assert(panel.open);assert.deepEqual(visibleSubnav(),[]);
for(const layer of layers){navigate('#'+layer.id);assert.deepEqual(visiblePage(),[layer.id]);assert.deepEqual(visibleSubnav(),[layer.id]);assert.equal(links.filter(l=>l.attrs['aria-current']).length,1);}
navigate('#tasks');assert(groupStates[0].open);assert.equal(projects.find(p=>!p.hidden).id,'task-01');assert.equal(sublinks[0].attrs['aria-current'],'location');
// Primary links toggle without changing the selected task, scroll or focus.
const click=link=>{let prevented=false;events['document:click']({target:{closest:()=>link},preventDefault:()=>{prevented=true;}});return prevented;};
for(const layer of layers){
 navigate('#'+layer.id);
 const link=links.find(l=>l.attrs.href==='#'+layer.id),focusBefore=focusCount,scrollBefore=topScrolls;
 assert.equal(link.attrs['aria-expanded'],'true');assert(click(link));assert.deepEqual(visibleSubnav(),[]);assert.equal(link.attrs['aria-expanded'],'false');
 assert(click(link));assert.deepEqual(visibleSubnav(),[layer.id]);assert.equal(link.attrs['aria-expanded'],'true');
 assert.equal(focusCount,focusBefore);assert.equal(topScrolls,scrollBefore);
}
navigate('#task-03');click(links[1]);assert.deepEqual(visibleSubnav(),[]);assert.equal(projects.find(p=>!p.hidden).id,'task-03');
click(links[1]);assert.deepEqual(visibleSubnav(),['tasks']);
mobile.matches=true;panel.open=true;
click(links.find(l=>l.attrs.href==='#models'));events.hashchange();
assert(panel.open);assert.deepEqual(visibleSubnav(),['models']);
click(links.find(l=>l.attrs.href==='#models'));assert(panel.open);assert.deepEqual(visibleSubnav(),[]);
click(links.find(l=>l.attrs.href==='#models'));assert(panel.open);assert.deepEqual(visibleSubnav(),['models']);
mobile.matches=false;
// Desktop collapse is native details state and must survive navigation.
panel.open=false;navigate('#models');assert(!panel.open);navigate('#task-03');assert(!panel.open);panel.open=true;navigate('#data');assert(panel.open);
for(const id of sectionIds){navigate('#'+id);assert.deepEqual(visiblePage(),[id.split('-')[0]]);assert.deepEqual(visibleSubnav(),[id.split('-')[0]]);assert.equal(scrolled.at(-1),id);assert.equal(sublinks.find(l=>l.attrs.href==='#'+id).attrs['aria-current'],'location');}
mobile.matches=true;events['media:change']();assert(!panel.open);
for(const t of tasks){panel.open=true;navigate('#task-'+t.id);assert.deepEqual(visiblePage(),['tasks']);assert.equal(projects.filter(p=>!p.hidden).length,1);assert.equal(projects.find(p=>!p.hidden).id,'task-'+t.id);assert.equal(links[1].attrs['aria-current'],'page');assert(!panel.open);}
for(const item of agriculturalItems){navigate('#'+item.id);assert.deepEqual(visiblePage(),['tasks']);assert.equal(projects.at(-1).hidden,false);assert.equal(scrolled.at(-1),item.id);assert(groupStates[5].open);assert.equal(sublinks.find(l=>l.attrs.href==='#'+item.id).attrs['aria-current'],'location');}
let prevented=false;events['document:click']({target:{closest:s=>s==='a[href^="#"]'?{getAttribute:()=>window.location.hash}:null},preventDefault:()=>{prevented=true;}});assert(prevented);assert.equal(scrolled.at(-1),agriculturalItems.at(-1).id);
navigate('#unknown');assert.deepEqual(visiblePage(),['home']);assert.deepEqual(visibleSubnav(),[]);assert.equal(links[0].attrs['aria-current'],'page');
mobile.matches=false;events['media:change']();assert(panel.open);
window.location.hash='#task-07';vm.runInNewContext(code,{window,document});assert.deepEqual(visiblePage(),['tasks']);assert.equal(projects.find(p=>!p.hidden).id,'task-07');
window.location.hash='#data-section-1';vm.runInNewContext(code,{window,document});assert.deepEqual(visiblePage(),['data']);assert.equal(scrolled.at(-1),'data-section-1');
assert(focusCount>0);assert(topScrolls>0);
assert.equal((html.match(/class="task-sublink"/g)??[]).length,8);
assert(!html.includes('任务组合与数据条件'));
assert(!html.includes('agriculture-navigation'));
const taskGroups=[...html.matchAll(/<details class="list-group task-group"><summary><h2>([^<]+)<\/h2><\/summary>([\s\S]*?)<\/details>/g)];
assert.equal(taskGroups.length,6);
assert.deepEqual([...taskGroups[5][2].matchAll(/class="list-number">(\d+)<\/span>/g)].map(m=>m[1]),['01','02','03','04','05','06','07','08']);
assert(/<h2>六、[^<]+<\/h2><\/summary><ol class="task-list"[^>]*><li><a class="task-sublink"/.test(html));
const agricultureHtml=html.match(/<article class="project agriculture"[\s\S]*?<\/article>/)?.[0];assert(agricultureHtml);
assert(html.includes('<h2>六、'+agriculture.title+'</h2>'));
const combinations=agriculture.categories.flatMap(c=>c.items);assert.equal(combinations.length,8);
for(const item of combinations){assert(agricultureHtml.includes(item.name));assert(agricultureHtml.includes(item.flow));assert(agricultureHtml.includes(item.example));assert(agricultureHtml.includes(item.condition));assert(item.figures.length>0&&item.sources.length>0);for(const f of item.figures)assert(agricultureHtml.includes(f.caption));}
assert.equal((agricultureHtml.match(/<div class="agriculture-visuals/g)??[]).length,8);
assert.equal((agricultureHtml.match(/<figure>/g)??[]).length,15);
assert.equal(exported.agricultural_illustrations,15);

const report={checked_at:new Date().toISOString(),mode:'portable six-layer research guide',research_pages:7,task_order:'passed',groups:6,task_links:18,project_targets:19,agricultural_combinations:8,agricultural_sublinks:8,agricultural_illustrations:15,technical_notes:18,model_reference_links:(html.match(/class="model-reference"/g)??[]).length,navigation_state_tests:'passed: collapsible sidebar persistence, six toggleable contextual submenus, six collapsible task groups, numbered agricultural links, section deep links, task default, 18 tasks, eight agricultural targets, mobile close, repeat clicks, fallback and focus',internal_links:'passed',real_examples:11,public_examples:7,text_only_examples:0,source_links:7,embedded_images:embedded.size+animatedCount,application_notes:18,reconstruction_views:3,reconstruction_animation_frames:40,external_file_dependencies:0,inline_navigation_script:true,file_bytes:Buffer.byteLength(html),browser_visual_check:'not performed in this revision; file/data and navigation state validation completed'};
await fs.writeFile(path.join(root,'results','web-verification.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
