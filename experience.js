(function(){
'use strict';

const BIBLE_SOURCES={
  kjv:{label:'English | KJV',url:'https://cdn.jsdelivr.net/gh/frankcontact89-sketch/prayerandfireapp@main/src/data/bible/kjv.json'},
  rvr:{label:'Español | Reina-Valera 1960',url:'https://cdn.jsdelivr.net/gh/frankcontact89-sketch/prayerandfireapp@main/src/data/bible/rvr.json'},
  aa:{label:'Português | Almeida',url:'https://cdn.jsdelivr.net/gh/frankcontact89-sketch/prayerandfireapp@main/src/data/bible/aa.json'}
};
const SB='https://yecywtxbuhfukergbwfc.supabase.co';
const KEY='sb_publishable_jFIuvZYIs1b-6IjqCnDPDw_BDivhFKs';
const bibleCache={};
let currentBooks=null,currentTranslation='kjv',currentBook=0,currentChapter=0;
let activeMedia=null;

const ui={
 en:{bible:'Bible',bibleTitle:'Read the Bible without leaving the message.',bibleLead:'Open a passage while the sermon continues playing.',translation:'Translation',book:'Book',chapter:'Chapter',search:'Search passage',searchPlaceholder:'Example: John 3:16',go:'Go',listen:'Listen',stop:'Stop',loading:'Loading Bible…',loadError:'The Bible could not be loaded. Please try again.',pip:'Picture in Picture',minimize:'Minimize',expand:'Expand',close:'Close',watch:'Watch sermon',zelle:'Scan the verified Zelle QR code below.',sermon:'Watch sermon'},
 es:{bible:'Biblia',bibleTitle:'Lee la Biblia sin salir de la predicación.',bibleLead:'Abre un pasaje mientras la predicación continúa reproduciéndose.',translation:'Versión',book:'Libro',chapter:'Capítulo',search:'Buscar pasaje',searchPlaceholder:'Ejemplo: Juan 3:16',go:'Ir',listen:'Escuchar',stop:'Detener',loading:'Cargando Biblia…',loadError:'No se pudo cargar la Biblia. Inténtalo de nuevo.',pip:'Pantalla flotante',minimize:'Minimizar',expand:'Ampliar',close:'Cerrar',watch:'Ver predicación',zelle:'Escanea el código QR verificado de Zelle.',sermon:'Ver predicación'},
 pt:{bible:'Bíblia',bibleTitle:'Leia a Bíblia sem sair da pregação.',bibleLead:'Abra uma passagem enquanto a pregação continua tocando.',translation:'Versão',book:'Livro',chapter:'Capítulo',search:'Buscar passagem',searchPlaceholder:'Exemplo: João 3:16',go:'Ir',listen:'Ouvir',stop:'Parar',loading:'Carregando Bíblia…',loadError:'Não foi possível carregar a Bíblia. Tente novamente.',pip:'Tela flutuante',minimize:'Minimizar',expand:'Ampliar',close:'Fechar',watch:'Ver pregação',zelle:'Escaneie o QR Code verificado do Zelle abaixo.',sermon:'Ver pregação'}
};
function lang(){return document.getElementById('lang')?.value||localStorage.getItem('movement_lang')||'en'}
function text(k){return (ui[lang()]||ui.en)[k]||ui.en[k]||k}
function norm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function addStyles(){
 const st=document.createElement('style');
 st.textContent=`
 .mc-bible-tools{display:grid;grid-template-columns:1.15fr 1fr .7fr;gap:10px;margin:22px 0 14px}.mc-bible-tools select,.mc-search input{width:100%;min-height:48px;border:1px solid var(--line);border-radius:10px;background:#071827;color:#fff;padding:0 12px}.mc-search{display:flex;gap:10px;margin-bottom:16px}.mc-search input{flex:1}.mc-search button,.mc-audio,.mc-watch{min-height:48px;border:0;border-radius:10px;background:var(--blue);color:#fff;padding:0 16px;font-weight:900;cursor:pointer}.mc-bible-reader{background:#fff;color:#111827;border-radius:18px;padding:22px;max-height:68vh;overflow:auto;-webkit-overflow-scrolling:touch;box-shadow:0 18px 50px #0004}.mc-bible-reader h3{margin:0 0 14px;font-size:26px}.mc-verse{font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:1.8;margin:0 0 6px}.mc-verse sup{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:900;color:#2468f2;margin-right:7px}.mc-bible-status{color:var(--muted);padding:18px 0}.mc-bible-actions{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0 18px}.mc-player{display:none;position:fixed;right:10px;top:max(88px,calc(env(safe-area-inset-top) + 58px));z-index:999;width:min(360px,52vw);background:#02060a;border:1px solid #ffffff28;border-radius:16px;overflow:hidden;box-shadow:0 24px 70px #000a;transition:.2s ease}.mc-player.open{display:block}.mc-player.expanded{width:min(960px,calc(100vw - 20px));right:10px;top:max(82px,calc(env(safe-area-inset-top) + 48px))}.mc-player-head{height:42px;display:flex;align-items:center;gap:7px;padding:0 8px 0 12px;background:#071827}.mc-player-title{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:850}.mc-player-btn{border:0;background:#ffffff12;color:#fff;border-radius:8px;min-width:32px;height:30px;cursor:pointer;font-size:17px}.mc-player-stage{background:#000;aspect-ratio:16/9}.mc-player-stage video,.mc-player-stage iframe{width:100%;height:100%;display:block;border:0;background:#000}.mc-player.system-pip{display:none!important}.mc-sermon-card{position:relative}.mc-watch{display:inline-flex;align-items:center;justify-content:center;margin-top:10px;min-height:42px}.method-body .mc-zelle-qr{width:210px;max-width:100%;display:block;margin:16px 0 4px;border-radius:12px;border:1px solid #e5e7eb;background:#fff;padding:8px}
 @media(max-width:700px){.mc-bible-tools{grid-template-columns:1fr}.mc-search{flex-direction:column}.mc-search button{width:100%}.mc-bible-reader{padding:17px;max-height:64vh}.mc-verse{font-size:19px}.mc-player{width:min(330px,58vw);right:8px;top:max(82px,calc(env(safe-area-inset-top) + 52px))}.mc-player.expanded{width:calc(100vw - 16px);right:8px;top:max(78px,calc(env(safe-area-inset-top) + 48px))}.mc-player-head{height:40px}}
 `;
 document.head.appendChild(st);
}

function addBibleNav(){
 document.querySelectorAll('.desktop').forEach(nav=>{
   if(nav.querySelector('a[href="#bible"]'))return;
   const give=nav.querySelector('a[href="#give"]');
   const a=document.createElement('a');a.href='#bible';a.textContent=text('bible');a.dataset.mcBible='1';nav.insertBefore(a,give||null);
 });
 const mobile=document.getElementById('mobile');
 if(mobile&&!mobile.querySelector('a[href="#bible"]')){
   const give=mobile.querySelector('a[href="#give"]');const a=document.createElement('a');a.href='#bible';a.textContent=text('bible');a.dataset.mcBible='1';mobile.insertBefore(a,give||null);
 }
}

function addBibleSection(){
 if(document.getElementById('bible'))return;
 const give=document.getElementById('give');
 const section=document.createElement('section');section.id='bible';section.className='section alt';
 section.innerHTML=`<div class="container"><span class="eyebrow" data-mc="bibleEyebrow">${esc(text('bible'))}</span><h2 class="title" data-mc="bibleTitle">${esc(text('bibleTitle'))}</h2><p class="lead" data-mc="bibleLead">${esc(text('bibleLead'))}</p><div class="mc-bible-tools"><select id="mcTranslation"><option value="kjv">English | KJV</option><option value="rvr">Español | Reina-Valera 1960</option><option value="aa">Português | Almeida</option></select><select id="mcBook"></select><select id="mcChapter"></select></div><div class="mc-search"><input id="mcBibleSearch" placeholder="${esc(text('searchPlaceholder'))}"><button id="mcBibleGo" type="button">${esc(text('go'))}</button></div><div class="mc-bible-actions"><button id="mcBibleAudio" class="mc-audio" type="button">▶ ${esc(text('listen'))}</button></div><div id="mcBibleStatus" class="mc-bible-status"></div><div id="mcBibleReader" class="mc-bible-reader" style="display:none"></div></div>`;
 (give||document.querySelector('footer')).before(section);
 const preferred={en:'kjv',es:'rvr',pt:'aa'}[lang()]||'kjv';currentTranslation=preferred;
 document.getElementById('mcTranslation').value=preferred;
 document.getElementById('mcTranslation').onchange=e=>loadBible(e.target.value,true);
 document.getElementById('mcBook').onchange=e=>{currentBook=Number(e.target.value)||0;currentChapter=0;fillChapters();renderChapter()};
 document.getElementById('mcChapter').onchange=e=>{currentChapter=Number(e.target.value)||0;renderChapter()};
 document.getElementById('mcBibleGo').onclick=searchPassage;
 document.getElementById('mcBibleSearch').onkeydown=e=>{if(e.key==='Enter')searchPassage()};
 document.getElementById('mcBibleAudio').onclick=toggleAudio;
 loadBible(preferred,false);
}
async function loadBible(code,reset){
 currentTranslation=code;const status=document.getElementById('mcBibleStatus'),reader=document.getElementById('mcBibleReader');
 status.textContent=text('loading');status.style.display='block';reader.style.display='none';window.speechSynthesis?.cancel();
 try{
   if(!bibleCache[code]){const r=await fetch(BIBLE_SOURCES[code].url,{cache:'force-cache'});if(!r.ok)throw new Error('Bible '+r.status);bibleCache[code]=await r.json()}
   currentBooks=bibleCache[code];if(reset){currentBook=0;currentChapter=0}fillBooks();fillChapters();renderChapter();status.style.display='none';reader.style.display='block';
 }catch(err){console.error(err);status.textContent=text('loadError');status.style.display='block'}
}
function fillBooks(){const s=document.getElementById('mcBook');s.innerHTML='';(currentBooks||[]).forEach((b,i)=>{const o=document.createElement('option');o.value=i;o.textContent=b.name||b.abbrev||('Book '+(i+1));s.appendChild(o)});currentBook=Math.max(0,Math.min(currentBook,(currentBooks?.length||1)-1));s.value=String(currentBook)}
function fillChapters(){const s=document.getElementById('mcChapter'),b=currentBooks?.[currentBook];s.innerHTML='';(b?.chapters||[]).forEach((_,i)=>{const o=document.createElement('option');o.value=i;o.textContent=text('chapter')+' '+(i+1);s.appendChild(o)});currentChapter=Math.max(0,Math.min(currentChapter,(b?.chapters?.length||1)-1));s.value=String(currentChapter)}
function renderChapter(focusVerse){const r=document.getElementById('mcBibleReader'),b=currentBooks?.[currentBook],v=b?.chapters?.[currentChapter]||[];if(!b)return;r.innerHTML='<h3>'+esc(b.name)+' '+(currentChapter+1)+'</h3>'+v.map((x,i)=>'<p class="mc-verse" id="mc-v'+(i+1)+'"><sup>'+(i+1)+'</sup>'+esc(x)+'</p>').join('');r.style.display='block';if(focusVerse)setTimeout(()=>document.getElementById('mc-v'+focusVerse)?.scrollIntoView({block:'center',behavior:'smooth'}),80)}
function searchPassage(){if(!currentBooks)return;const raw=document.getElementById('mcBibleSearch').value.trim();const m=raw.match(/^(.*?)[\s.]+(\d+)(?::(\d+))?\s*$/);if(!m)return;const name=norm(m[1]),ch=Math.max(1,Number(m[2])),vs=m[3]?Math.max(1,Number(m[3])):null;let idx=currentBooks.findIndex(b=>[b.name,b.abbrev].map(norm).some(x=>x===name||x.startsWith(name)||name.startsWith(x)));if(idx<0)return;currentBook=idx;currentChapter=Math.min(ch-1,(currentBooks[idx].chapters?.length||1)-1);document.getElementById('mcBook').value=String(currentBook);fillChapters();renderChapter(vs)}
function toggleAudio(){const synth=window.speechSynthesis;if(!synth)return;const btn=document.getElementById('mcBibleAudio');if(synth.speaking){synth.cancel();btn.textContent='▶ '+text('listen');return}const verses=currentBooks?.[currentBook]?.chapters?.[currentChapter]||[];if(!verses.length)return;const u=new SpeechSynthesisUtterance(verses.join(' '));u.lang=currentTranslation==='rvr'?'es-US':currentTranslation==='aa'?'pt-BR':'en-US';u.onend=()=>btn.textContent='▶ '+text('listen');btn.textContent='■ '+text('stop');synth.speak(u)}

function addPlayer(){
 if(document.getElementById('mcPlayer'))return;
 const p=document.createElement('div');p.id='mcPlayer';p.className='mc-player';
 p.innerHTML=`<div class="mc-player-head"><div id="mcPlayerTitle" class="mc-player-title">Movement Church</div><button id="mcPip" class="mc-player-btn" title="${esc(text('pip'))}">◱</button><button id="mcMin" class="mc-player-btn" title="${esc(text('minimize'))}">−</button><button id="mcExpand" class="mc-player-btn" title="${esc(text('expand'))}">⛶</button><button id="mcClose" class="mc-player-btn" title="${esc(text('close'))}">×</button></div><div id="mcPlayerStage" class="mc-player-stage"></div>`;
 document.body.appendChild(p);
 document.getElementById('mcMin').onclick=minimizePlayer;document.getElementById('mcExpand').onclick=toggleExpand;document.getElementById('mcClose').onclick=closePlayer;document.getElementById('mcPip').onclick=enterSystemPiP;
}
function youtube(url){const m=String(url||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|live\/|embed\/))([^?&/]+)/);return m?.[1]||''}
function openMedia(url,title){
 if(!url)return;addPlayer();const stage=document.getElementById('mcPlayerStage');stage.innerHTML='';let el;const y=youtube(url);
 if(y){el=document.createElement('iframe');el.src='https://www.youtube.com/embed/'+encodeURIComponent(y)+'?autoplay=1&playsinline=1&rel=0';el.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';el.allowFullscreen=true}
 else if(/\.(mp4|m4v|webm)(\?|$)/i.test(url)||String(url).includes('/storage/v1/object/public/')){el=document.createElement('video');el.src=url;el.controls=true;el.autoplay=true;el.playsInline=true;el.setAttribute('playsinline','');el.setAttribute('webkit-playsinline','');el.disablePictureInPicture=false;el.addEventListener('enterpictureinpicture',()=>document.getElementById('mcPlayer').classList.add('system-pip'));el.addEventListener('leavepictureinpicture',()=>document.getElementById('mcPlayer').classList.remove('system-pip'))}
 else{el=document.createElement('iframe');el.src=url;el.allow='autoplay; picture-in-picture; fullscreen';el.allowFullscreen=true}
 stage.appendChild(el);activeMedia=el;document.getElementById('mcPlayerTitle').textContent=title||'Movement Church';document.getElementById('mcPlayer').classList.add('open');minimizePlayer();
}
function minimizePlayer(){document.getElementById('mcPlayer')?.classList.remove('expanded')}
function toggleExpand(){document.getElementById('mcPlayer')?.classList.toggle('expanded')}
function closePlayer(){try{if(activeMedia?.tagName==='VIDEO')activeMedia.pause()}catch{};document.getElementById('mcPlayerStage').innerHTML='';document.getElementById('mcPlayer')?.classList.remove('open','expanded','system-pip');activeMedia=null}
async function enterSystemPiP(){
 if(!activeMedia)return;
 if(activeMedia.tagName==='VIDEO'&&document.pictureInPictureEnabled&&activeMedia.requestPictureInPicture){try{if(activeMedia.paused)await activeMedia.play();await activeMedia.requestPictureInPicture();return}catch(e){console.warn('PiP unavailable',e)}}
 minimizePlayer();
}

async function loadSermons(){
 const grid=document.querySelector('#sermons .grid');if(!grid)return;
 try{
   const r=await fetch(SB+'/rest/v1/movement_sermons?select=*&is_published=eq.true&order=sort_order.asc',{headers:{apikey:KEY}});if(!r.ok)return;const rows=await r.json();if(!Array.isArray(rows)||!rows.length)return;
   grid.innerHTML='';rows.forEach(s=>{const title=s['title_'+lang()]||s.title_en||s.title_es||s.title_pt||'Movement Church';const url=s.video_url||s.file_url||'';const card=document.createElement('article');card.className='card mc-sermon-card';card.innerHTML=(s.thumbnail_url?'<img src="'+esc(s.thumbnail_url)+'" alt="">':'')+'<div class="body"><h3>'+esc(title)+'</h3>'+(s.speaker?'<p>'+esc(s.speaker)+'</p>':'')+(url?'<button class="mc-watch" type="button">▶ '+esc(text('sermon'))+'</button>':'')+'</div>';if(url)card.querySelector('.mc-watch').onclick=()=>openMedia(url,title);grid.appendChild(card)})
 }catch(e){console.warn('Sermons unavailable',e)}
}

function installZelleQR(){
 document.querySelectorAll('.method').forEach(m=>{
   const label=m.querySelector('.method-head span')?.textContent?.trim().toLowerCase();if(label!=='zelle')return;
   const body=m.querySelector('.method-body');if(!body)return;
   body.innerHTML='<p data-mc-zelle>'+esc(text('zelle'))+'</p><img class="mc-zelle-qr" src="zelle-qr.svg?v=1" alt="Zelle verified QR code">';
 });
}

function attachNavigationBehavior(){
 document.addEventListener('click',e=>{
   const a=e.target.closest('a[href]');if(!a)return;const href=a.getAttribute('href')||'';
   if((href==='#give'||href==='#bible'||/donate\.stripe\.com/i.test(a.href))&&activeMedia){minimizePlayer();if(activeMedia.tagName==='VIDEO')enterSystemPiP()}
   if(href==='#bible')setTimeout(()=>document.getElementById('mcBibleSearch')?.focus({preventScroll:true}),450);
 },true);
}
function refreshLanguage(){
 addBibleNav();document.querySelectorAll('[data-mc="bibleEyebrow"]').forEach(x=>x.textContent=text('bible'));document.querySelectorAll('[data-mc="bibleTitle"]').forEach(x=>x.textContent=text('bibleTitle'));document.querySelectorAll('[data-mc="bibleLead"]').forEach(x=>x.textContent=text('bibleLead'));document.querySelectorAll('[data-mc-bible]').forEach(x=>x.textContent=text('bible'));document.querySelectorAll('[data-mc-zelle]').forEach(x=>x.textContent=text('zelle'));const q=document.getElementById('mcBibleSearch');if(q)q.placeholder=text('searchPlaceholder');const g=document.getElementById('mcBibleGo');if(g)g.textContent=text('go');const b=document.getElementById('mcBibleAudio');if(b&&!window.speechSynthesis?.speaking)b.textContent='▶ '+text('listen');loadSermons();
}
function init(){addStyles();addPlayer();addBibleNav();addBibleSection();installZelleQR();attachNavigationBehavior();loadSermons();document.getElementById('lang')?.addEventListener('change',()=>setTimeout(refreshLanguage,0));window.MovementChurchPlayer={open:openMedia,minimize:minimizePlayer,expand:toggleExpand,pictureInPicture:enterSystemPiP,close:closePlayer}}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();