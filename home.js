(()=>{
 const cards=[...document.querySelectorAll('.tool-card')],input=document.getElementById('tool-search');
 if(!input)return;
 const valid=new Set(cards.map(c=>c.dataset.tool)),key='calqio_home_favorites_v1';let saved=new Set(),category='all';
 try{const data=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(data))saved=new Set(data.filter(id=>valid.has(id)));}catch{}
 const normalize=s=>s.toLocaleLowerCase().replace(/\s+/g,'');
 function render(){
  const q=normalize(input.value);let count=0;
  cards.forEach(card=>{const visible=(category==='all'||(category==='saved'?saved.has(card.dataset.tool):card.dataset.category===category))&&normalize(card.querySelector('h3').textContent+' '+card.querySelector('p').textContent+' '+card.dataset.keywords).includes(q);card.hidden=!visible;if(visible)count++;});
  document.getElementById('tool-count').textContent=count+'개 도구';
  const empty=document.getElementById('tools-empty');empty.hidden=count!==0;empty.textContent=category==='saved'&&!q?'저장한 도구가 없습니다. 전체 목록에서 ☆를 눌러 즐겨찾기에 추가해 주세요.':'일치하는 도구가 없습니다. 다른 검색어를 입력하거나 ‘전체’를 선택해 주세요.';
  document.getElementById('search-clear').hidden=!input.value;
  document.querySelectorAll('[data-save]').forEach(button=>{const on=saved.has(button.dataset.save);button.setAttribute('aria-pressed',String(on));button.textContent=on?'★':'☆';});
 }
 document.querySelectorAll('.home-search,.tool-filters,.save-help,[data-save]').forEach(el=>el.hidden=false);
 input.addEventListener('input',render);
 document.getElementById('search-clear').addEventListener('click',()=>{input.value='';render();input.focus();});
 document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();}));
 document.querySelectorAll('[data-save]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);try{localStorage.setItem(key,JSON.stringify([...saved]));}catch{document.querySelector('.save-help').textContent='저장 공간을 사용할 수 없어 즐겨찾기는 이 화면을 이용하는 동안만 유지됩니다.';}render();}));
 render();
})();
