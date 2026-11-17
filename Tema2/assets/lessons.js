(function(){
 'use strict';
 const guideStates=new Map();
 function updateGuide(id,n,all=false){
  const grid=document.querySelector('[data-guide="'+id+'"]');if(!grid)return;
  const items=[...grid.querySelectorAll('.stage')];n=Math.max(1,Math.min(n,items.length));guideStates.set(id,n);
  grid.classList.toggle('focus-mode',!all);grid.classList.toggle('all-open',all);
  const nav=document.querySelector('[data-progress="'+id+'"]');nav.hidden=all;
  items.forEach((el,i)=>{const locked=!all&&i!==n-1;el.classList.toggle('locked',locked);el.classList.toggle('active-stage',i===n-1);el.querySelector('.stage-body').setAttribute('aria-hidden',String(locked));});
  nav.querySelectorAll('button').forEach((b,i)=>{b.setAttribute('aria-current',i===n-1?'step':'false');});
  const b=document.querySelector('[data-step="'+id+'"]');if(b){b.disabled=n===items.length;b.textContent=n===items.length?'Cálculo terminado · 4/4':'Siguiente paso · '+(n+1)+'/4';}
 }
 document.querySelectorAll('[data-guide]').forEach(el=>{
  const nav=document.createElement('nav');nav.className='guide-progress';nav.dataset.progress=el.dataset.guide;nav.setAttribute('aria-label','Pasos de la resolución');
  [...el.querySelectorAll('.stage')].forEach((st,i)=>{const b=document.createElement('button');b.textContent=(i+1)+'. '+st.querySelector('h3').textContent;b.onclick=()=>updateGuide(el.dataset.guide,i+1);nav.appendChild(b);});el.before(nav);updateGuide(el.dataset.guide,1);
 });
 document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>updateGuide(b.dataset.step,(guideStates.get(b.dataset.step)||1)+1));
 document.querySelectorAll('[data-all]').forEach(b=>b.onclick=()=>updateGuide(b.dataset.all,4,true));
 document.querySelectorAll('[data-reset]').forEach(b=>b.onclick=()=>updateGuide(b.dataset.reset,1));
 document.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>{const i=routes.indexOf(b.dataset.goto);if(i>=0)go(i);});
 document.querySelectorAll('.meaning-toggle').forEach(b=>b.onclick=()=>{const open=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!open));b.parentElement.querySelector('.formula-meaning').hidden=open;b.textContent=open?'¿Qué significa?':'Ocultar significado';});
 const temps=[10,20,30,40,50],salA=[28,29.2,30.5,31.9,33.4];
 const format=v=>v.toLocaleString('es-ES',{maximumFractionDigits:2});
 function updateSolubility(){const i=Number(document.getElementById('sol-temp').value),water=Number(document.getElementById('sol-water').value);document.getElementById('sol-max').textContent=format(salA[i]*water/100)+' g de sal como máximo';document.querySelector('.solubility-visual p').innerHTML='<b>'+water+' g de agua</b> es disolvente.<br>A '+temps[i]+' °C: '+format(salA[i])+' g de sal por 100 g de agua.';}
 document.getElementById('sol-temp').onchange=updateSolubility;document.getElementById('sol-water').onchange=updateSolubility;updateSolubility();
 document.getElementById('precip-button').onclick=()=>{const model=document.getElementById('precip-model'),on=model.classList.toggle('cooled');document.getElementById('precip-button').setAttribute('aria-pressed',String(on));document.getElementById('precip-button').textContent=on?'Volver al estado inicial':'Enfriar y observar';document.getElementById('precip-caption').textContent=on?'Aparecen cristales':'Soluto disuelto';};
 document.querySelectorAll('.formula-meaning').forEach(p=>p.addEventListener('click',()=>{}));
})();
