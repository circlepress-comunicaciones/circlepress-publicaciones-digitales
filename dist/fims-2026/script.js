'use strict';
const publication=window.PUBLICATION;
function appendRegistered(element,text){
 const parts=text.split('®');
 parts.forEach((part,index)=>{if(index){const mark=document.createElement('sup');mark.className='registered';mark.textContent='®';element.append(mark);}element.append(document.createTextNode(part));});
}
const motion=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('[data-reload]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();location.reload();}));
const revealObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}},{threshold:.08,rootMargin:'0px 0px -20px 0px'});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
const timelineObserver=new IntersectionObserver(entries=>{
 for(const entry of entries)if(entry.isIntersecting){
  entry.target.classList.add('timeline-step-visible');
  timelineObserver.unobserve(entry.target);
 }
},{threshold:.18,rootMargin:'0px 0px -25px 0px'});
document.querySelectorAll('.evidence-timeline article').forEach(step=>timelineObserver.observe(step));

function count(el,index){
 if(el.dataset.animated)return;el.dataset.animated='1';
 const final=Number(el.dataset.count),digits=(el.dataset.count.split('.')[1]||'').length;
 const format=value=>value.toFixed(digits).replace('.',el.dataset.decimal||'.');
 const original=el.textContent;el.setAttribute('aria-label',original);
 if(motion.matches)return;
 setTimeout(()=>{const start=performance.now();function frame(now){const t=Math.min(1,(now-start)/1400);el.textContent=format(final*(1-(1-t)**3));if(t<1&&!motion.matches)requestAnimationFrame(frame);else el.textContent=original;}requestAnimationFrame(frame);},index*120);
}
const countObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){count(entry.target,Number(entry.target.dataset.delay||0));countObserver.unobserve(entry.target);}},{threshold:.55});
document.querySelectorAll('[data-count]').forEach((el,i)=>{el.dataset.delay=i%3;countObserver.observe(el);});
const fill=document.querySelector('#progress-fill');function progress(){const distance=document.documentElement.scrollHeight-innerHeight;fill.style.width=(distance>0?Math.min(100,Math.max(0,scrollY/distance*100)):100)+'%';}
addEventListener('scroll',progress,{passive:true});addEventListener('resize',progress);addEventListener('load',progress);progress();
const dialog=document.querySelector('#source-dialog'),title=document.querySelector('#dialog-title'),body=document.querySelector('#dialog-body');
let previousFocus;
function openDialog(label){previousFocus=document.activeElement;title.textContent=label;body.replaceChildren();dialog.showModal();document.body.style.overflow='hidden';body.scrollTop=0;}
function sourceOrigin(page,pageLabel){const origin=document.createElement('div');origin.className='source-origin';const label=document.createElement('span');label.textContent='Fuente: boletín FIMS 2026 · '+(pageLabel||(page?'página '+page:'página 3'));origin.append(label);body.append(origin);}
document.querySelectorAll('[data-source]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.source;if(key==='references'){openDialog('Referencias');const list=document.createElement('ol');publication.references.forEach(text=>{const li=document.createElement('li');appendRegistered(li,text);list.append(li);});body.append(list);sourceOrigin(3);}else{const passage=publication.passages[key];openDialog(passage.title);passage.paragraphs.forEach(text=>{const p=document.createElement('p');appendRegistered(p,text);body.append(p);});sourceOrigin(passage.page,passage.pageLabel);}}));
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{openDialog(button.dataset.title);const img=document.createElement('img');img.src=button.dataset.image;img.alt=button.dataset.title;body.append(img);}));
document.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.style.overflow='';previousFocus?.focus({preventScroll:true});});
