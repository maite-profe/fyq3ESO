(function(){
 'use strict';
 const shuffle=(a,rng=Math.random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 function createAttempt(bank,mode,rng=Math.random){
  const positions=shuffle(bank.map((_,i)=>i%4),rng);
  const order=shuffle(bank.map((_,i)=>i),rng).map((qid,i)=>{const opts=shuffle([1,2,3],rng);opts.splice(positions[i],0,0);return {qid,opts};});
  return {version:1,mode,order,answers:bank.map(()=>null),checked:bank.map(()=>false),current:0,finished:false};
 }
 const isRight=(s,i)=>s.answers[i]!==null&&s.order[i].opts[s.answers[i]]===0;
 function score(s){return {correct:s.order.filter((_,i)=>isRight(s,i)).length,answered:s.answers.filter(x=>x!==null).length,total:s.order.length};}
 if(typeof module!=='undefined')module.exports={shuffle,createAttempt,isRight,score};
 if(typeof document==='undefined')return;
 const bank=window.TEMA2_QUIZ,key='fyq-tema2-test-v1',area=document.getElementById('exam-app');
 let state=null,review=false,summary=false,hint=false,showIndex=false;
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const button=(text,action,cls='')=>{const b=el('button',cls,text);b.type='button';b.onclick=action;return b;};
 function valid(s){return s&&s.version===1&&['study','exam'].includes(s.mode)&&s.order?.length===50&&new Set(s.order.map(x=>x.qid)).size===50&&s.order.every(x=>Number.isInteger(x.qid)&&x.qid>=0&&x.qid<50&&[...x.opts].sort().join()==='0,1,2,3')&&s.answers?.length===50&&s.answers.every(x=>x===null||Number.isInteger(x)&&x>=0&&x<4)&&s.checked?.length===50&&s.current>=0&&s.current<50;}
 function saved(){try{const s=JSON.parse(localStorage.getItem(key));return valid(s)?s:null;}catch{return null;}}
 function persist(){try{localStorage.setItem(key,JSON.stringify(state));}catch{}}
 function start(mode){state=createAttempt(bank,mode);review=false;summary=false;hint=false;showIndex=false;persist();render();}
 function intro(){area.replaceChildren();const intro=el('div','exam-intro');intro.append(el('p','exam-kicker','50 preguntas · 4 opciones · una respuesta correcta'),el('h3','','Comprender, comparar y justificar'),el('p','','Pon a prueba la teoría de toda la unidad. Las preguntas y las opciones cambian de orden en cada intento.'));
 const modes=el('div','exam-modes');
 for(const [mode,title,desc] of [['study','Practicar con explicación','Corrige cada pregunta y aprende del error.'],['exam','Simular examen','Responde todo y corrige al finalizar.']]){const card=el('div','exam-mode');card.append(el('h4','',title),el('p','',desc),button(mode==='study'?'Empezar práctica':'Empezar examen',()=>start(mode)));modes.append(card);}intro.append(modes);
 const old=saved();if(old)intro.append(button('Continuar el último intento',()=>{state=old;summary=state.finished;render();},'exam-secondary'));intro.append(el('p','exam-small','Se guarda el avance en este navegador. Sin límite de tiempo ni penalización por fallo.'));area.append(intro);
 }
 function move(delta){const list=review?state.order.map((_,i)=>i).filter(i=>!isRight(state,i)):state.order.map((_,i)=>i);const pos=list.indexOf(state.current),next=list[pos+delta];if(next!==undefined)state.current=next;hint=false;showIndex=false;persist();render();}
 function finish(){state.finished=true;summary=true;review=false;persist();render();}
 function renderSummary(){
  const sc=score(state);area.replaceChildren();const top=el('div','exam-summary');top.append(el('h3','',`${sc.correct} de ${sc.total} respuestas correctas`),el('p','',`Nota orientativa: ${(sc.correct/sc.total*10).toFixed(1).replace('.',',')} / 10 · ${sc.total-sc.answered} sin responder.`));
  const table=el('table','exam-topic-table');const tr=el('tr');tr.append(el('th','','Bloque de teoría'),el('th','','Aciertos'));table.append(tr);
  for(const topic of [...new Set(bank.map(q=>q[0]))]){const ids=state.order.map((x,i)=>bank[x.qid][0]===topic?i:-1).filter(i=>i>=0);const row=el('tr');row.append(el('td','',topic),el('td','',`${ids.filter(i=>isRight(state,i)).length} / ${ids.length}`));table.append(row);}top.append(table);
  const actions=el('div','exam-summary-actions');if(sc.correct<sc.total)actions.append(button('Repasar fallos y no contestadas',()=>{review=true;summary=false;state.current=state.order.findIndex((_,i)=>!isRight(state,i));render();}));actions.append(button('Revisar todas las preguntas',()=>{review=false;summary=false;state.current=0;render();}),button('Nuevo intento aleatorio',()=>{state=null;summary=false;review=false;intro();},'exam-secondary'));top.append(actions);area.append(top);
 }
 function render(){
  if(!state)return intro();if(summary)return renderSummary();area.replaceChildren();
  const i=state.current,{qid,opts}=state.order[i],q=bank[qid],answered=state.answers[i]!==null;
  const corrected=state.finished||state.mode==='study'&&state.checked[i];
  const top=el('div','exam-status');top.append(el('span','',`${state.mode==='study'?'Práctica':'Examen'} · ${i+1} / 50 · ${q[0]}`),button('Mapa de preguntas',()=>{showIndex=!showIndex;render();},'exam-secondary'));area.append(top);
  const meter=el('div','exam-meter');const fill=el('div');fill.style.width=score(state).answered/50*100+'%';meter.append(fill);area.append(meter);
  if(showIndex){const map=el('div','exam-map');map.append(el('p','','Salta a una pregunta. ✓ respondida; en revisión, + acierto / − fallo o en blanco.'));const grid=el('div','exam-map-grid');state.order.forEach((x,n)=>{const done=state.answers[n]!==null;const b=button(`${n+1}${state.finished?(isRight(state,n)?' +':' −'):(done?' ✓':'')}`,()=>{state.current=n;showIndex=false;hint=false;persist();render();},n===i?'current':'');grid.append(b);});map.append(grid);area.append(map);return;}
  area.append(el('h3','exam-question',q[1]));
  const options=el('div','exam-options');options.setAttribute('role','group');options.setAttribute('aria-label','Opciones de respuesta');
  opts.forEach((source,j)=>{const b=button('',()=>{if(corrected)return;state.answers[i]=j;persist();render();},'exam-option');b.append(el('b','','ABCD'[j]),el('span','',q[2][source]));b.setAttribute('aria-pressed',String(state.answers[i]===j));if(corrected){b.disabled=true;if(source===0)b.classList.add('right');else if(state.answers[i]===j)b.classList.add('wrong');}options.append(b);});area.append(options);
  const feedback=el('div','exam-feedback');feedback.setAttribute('aria-live','polite');
  if(corrected){const correctLetter='ABCD'[opts.indexOf(0)];const mark=el('b','',(isRight(state,i)?'Has acertado. ':answered?'Revisa tu respuesta. ':'Sin responder. ')+'Respuesta correcta: '+correctLetter+'.');feedback.append(mark,el('span','',q[3]));}
  else if(hint)feedback.append(el('b','','Pista: '),el('span','',q[4]));else feedback.append(el('span','','Elige una opción y justifica mentalmente por qué descartas las otras.'));area.append(feedback);
  const actions=el('div','exam-actions');const prev=button('Anterior',()=>move(-1),'exam-secondary');const list=review?state.order.map((_,n)=>n).filter(n=>!isRight(state,n)):state.order.map((_,n)=>n);prev.disabled=list.indexOf(i)<=0;actions.append(prev);
  if(!corrected&&state.mode==='study'){actions.append(button(hint?'Ocultar pista':'Ver pista',()=>{hint=!hint;render();},'exam-secondary'));const check=button('Comprobar',()=>{state.checked[i]=true;persist();render();});check.disabled=!answered;actions.append(check);}
  if(list.indexOf(i)<list.length-1)actions.append(button('Siguiente',()=>move(1)));else if(!state.finished){const end=button('Finalizar y corregir',finish);end.disabled=score(state).answered<50;actions.append(end);}
  if(state.finished)actions.append(button('Ver resultados',()=>{summary=true;render();},'exam-secondary'));area.append(actions);
  if(!state.finished&&i===49&&score(state).answered<50)area.append(el('p','exam-pending',`Quedan ${50-score(state).answered} preguntas sin responder. Localízalas en el mapa para finalizar.`));
 }
 intro();
})();
