(function(){
'use strict';

const BIBLE_SOURCES={
  kjv:{label:'English | KJV',url:'https://cdn.jsdelivr.net/gh/frankcontact89-sketch/prayerandfireapp@main/src/data/bible/kjv.json'},
  rvr:{label:'Español | Reina-Valera 1960',url:'https://cdn.jsdelivr.net/gh/frankcontact89-sketch/prayerandfireapp@main/src/data/bible/rvr.json'},
  aa:{label:'Português | Almeida',url:'https://cdn.jsdelivr.net/gh/frankcontact89-sketch/prayerandfireapp@main/src/data/bible/aa.json'}
};
const SB='https://yecywtxbuhfukergbwfc.supabase.co';
const KEY='sb_publishable_jFIuvZYIs1b-6IjqCnDPDw_BDivhFKs';
const BIBLE_PREFERENCES='movement_bible_preferences_v2';
const bibleCache={};
let currentBooks=null,currentTranslation='kjv',currentBook=0,currentChapter=0;
let activeMedia=null;

const BOOKS={
 en:['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'],
 es:['Génesis','Éxodo','Levítico','Números','Deuteronomio','Josué','Jueces','Rut','1 Samuel','2 Samuel','1 Reyes','2 Reyes','1 Crónicas','2 Crónicas','Esdras','Nehemías','Ester','Job','Salmos','Proverbios','Eclesiastés','Cantares','Isaías','Jeremías','Lamentaciones','Ezequiel','Daniel','Oseas','Joel','Amós','Abdías','Jonás','Miqueas','Nahúm','Habacuc','Sofonías','Hageo','Zacarías','Malaquías','Mateo','Marcos','Lucas','Juan','Hechos','Romanos','1 Corintios','2 Corintios','Gálatas','Efesios','Filipenses','Colosenses','1 Tesalonicenses','2 Tesalonicenses','1 Timoteo','2 Timoteo','Tito','Filemón','Hebreos','Santiago','1 Pedro','2 Pedro','1 Juan','2 Juan','3 Juan','Judas','Apocalipsis'],
 pt:['Gênesis','Êxodo','Levítico','Números','Deuteronômio','Josué','Juízes','Rute','1 Samuel','2 Samuel','1 Reis','2 Reis','1 Crônicas','2 Crônicas','Esdras','Neemias','Ester','Jó','Salmos','Provérbios','Eclesiastes','Cânticos','Isaías','Jeremias','Lamentações','Ezequiel','Daniel','Oséias','Joel','Amós','Obadias','Jonas','Miquéias','Naum','Habacuque','Sofonias','Ageu','Zacarias','Malaquias','Mateus','Marcos','Lucas','João','Atos','Romanos','1 Coríntios','2 Coríntios','Gálatas','Efésios','Filipenses','Colossenses','1 Tessalonicenses','2 Tessalonicenses','1 Timóteo','2 Timóteo','Tito','Filemom','Hebreus','Tiago','1 Pedro','2 Pedro','1 João','2 João','3 João','Judas','Apocalipse']
};
const ui={
 en:{bible:'Bible',bibleTitle:'Bible',bibleLead:'Read a passage while the sermon keeps playing.',translation:'Translation',book:'Book',chapter:'Chapter',search:'Search passage',searchPlaceholder:'Example: John 3:16',go:'Go',listen:'Listen',stop:'Stop',loading:'Loading Bible…',loadError:'The Bible could not be loaded. Please try again.',notFound:'Passage not found. Try John 3:16.',pip:'Picture in Picture',minimize:'Minimize',expand:'Expand',close:'Close',watch:'Watch sermon',joinMeeting:'Join meeting',openZoom:'Open in Zoom',liveReady:'The current Movement Church meeting is available below.',liveOffline:'No live meeting is available right now.',zelle:'Scan the verified Zelle QR code below.'},
 es:{bible:'Biblia',bibleTitle:'Biblia',bibleLead:'Lee un pasaje mientras la predicación continúa reproduciéndose.',translation:'Versión',book:'Libro',chapter:'Capítulo',search:'Buscar pasaje',searchPlaceholder:'Ejemplo: Mateo 10 o Juan 3:16',go:'Ir',listen:'Escuchar',stop:'Detener',loading:'Cargando Biblia…',loadError:'No se pudo cargar la Biblia. Inténtalo de nuevo.',notFound:'No encontré ese pasaje. Prueba Mateo 10 o Juan 3:16.',pip:'Pantalla flotante',minimize:'Minimizar',expand:'Ampliar',close:'Cerrar',watch:'Ver predicación',joinMeeting:'Entrar a la reunión',openZoom:'Abrir en Zoom',liveReady:'La reunión actual de Movement Church está disponible abajo.',liveOffline:'No hay una reunión en vivo disponible en este momento.',zelle:'Escanea el código QR verificado de Zelle.'},
 pt:{bible:'Bíblia',bibleTitle:'Bíblia',bibleLead:'Leia uma passagem enquanto a pregação continua tocando.',translation:'Versão',book:'Livro',chapter:'Capítulo',search:'Buscar passagem',searchPlaceholder:'Exemplo: Mateus 10 ou João 3:16',go:'Ir',listen:'Ouvir',stop:'Parar',loading:'Carregando Bíblia…',loadError:'Não foi possível carregar a Bíblia. Tente novamente.',notFound:'Não encontrei essa passagem. Tente Mateus 10 ou João 3:16.',pip:'Tela flutuante',minimize:'Minimizar',expand:'Ampliar',close:'Fechar',watch:'Ver pregação',joinMeeting:'Entrar na reunião',openZoom:'Abrir no Zoom',liveReady:'A reunião atual de Movement Church está disponível abaixo.',liveOffline:'Não há uma reunião ao vivo disponível neste momento.',zelle:'Escaneie o QR Code verificado do Zelle abaixo.'}
};

function lang(){return document.getElementById('lang')?.value||localStorage.getItem('movement_lang')||'en'}
function bibleLang(){return currentTranslation==='rvr'?'es':currentTranslation==='aa'?'pt':'en'}
function text(key,language){return(ui[language||lang()]||ui.en)[key]||ui.en[key]||key}
function norm(value){return(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[.,;]+/g,' ').replace(/\s+/g,' ').trim()}
function esc(value){return String(value??'').replace(/[&<>"']/g,(character)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]))}
function localizedBookName(index){return BOOKS[bibleLang()]?.[index]||currentBooks?.[index]?.name||currentBooks?.[index]?.abbrev||('Book '+(index+1))}
function readBiblePreferences(){try{return JSON.parse(localStorage.getItem(BIBLE_PREFERENCES)||'{}')}catch(_){return{}}}
function saveBiblePreferences(){
  const preferences={translation:currentTranslation,book:currentBook,chapter:currentChapter};
  try{localStorage.setItem(BIBLE_PREFERENCES,JSON.stringify(preferences));localStorage.setItem('movement_bible_translation',currentTranslation);localStorage.setItem('movement_bible_book',String(currentBook));localStorage.setItem('movement_bible_chapter',String(currentChapter))}catch(_){}
}
function bookIndexFromName(input){
 const normalized=norm(input);if(!normalized)return-1;
 for(let index=0;index<66;index++){
   const aliases=[BOOKS.en[index],BOOKS.es[index],BOOKS.pt[index],currentBooks?.[index]?.name,currentBooks?.[index]?.abbrev].filter(Boolean).map(norm);
   if(aliases.some((alias)=>alias===normalized||alias.startsWith(normalized)||normalized.startsWith(alias)))return index;
 }
 return-1;
}

function addStyles(){
 const style=document.createElement('style');
 style.textContent=`
 body.mc-bible-open{overflow:hidden}.mc-bible-overlay{display:none;position:fixed;inset:0;z-index:1300;background:#04111f;overflow:auto;-webkit-overflow-scrolling:touch;padding:0 0 max(28px,env(safe-area-inset-bottom))}.mc-bible-overlay.open{display:block}.mc-bible-top{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:68px;padding:calc(10px + env(safe-area-inset-top)) 18px 10px;background:#04111ff5;border-bottom:1px solid var(--line);backdrop-filter:blur(16px)}.mc-bible-top strong{font-size:20px;letter-spacing:.02em}.mc-bible-close{width:44px;height:44px;border:1px solid var(--line);border-radius:50%;background:#ffffff0d;color:#fff;font-size:27px;line-height:1;cursor:pointer}.mc-bible-content{width:min(900px,calc(100% - 28px));margin:0 auto;padding:26px 0 40px}.mc-bible-content .title{font-size:clamp(34px,7vw,52px);margin:4px 0 8px}.mc-bible-tools{display:grid;grid-template-columns:1.15fr 1fr .7fr;gap:10px;margin:22px 0 14px}.mc-bible-tools select,.mc-search input{width:100%;min-height:48px;border:1px solid var(--line);border-radius:10px;background:#071827;color:#fff;padding:0 12px}.mc-search{display:flex;gap:10px;margin-bottom:16px}.mc-search input{flex:1}.mc-search button,.mc-audio,.mc-watch{min-height:48px;border:0;border-radius:10px;background:var(--blue);color:#fff;padding:0 16px;font-weight:900;cursor:pointer}.mc-bible-reader{background:#fff;color:#111827;border-radius:18px;padding:22px;overflow:visible;box-shadow:0 18px 50px #0004}.mc-bible-reader h3{margin:0 0 14px;font-size:26px}.mc-verse{font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:1.8;margin:0 0 6px}.mc-verse sup{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:900;color:#2468f2;margin-right:7px}.mc-bible-status{color:var(--muted);padding:18px 0}.mc-bible-actions{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0 18px}.mc-player{display:none;position:fixed;right:10px;top:max(88px,calc(env(safe-area-inset-top) + 58px));z-index:999;width:min(360px,52vw);background:#02060a;border:1px solid #ffffff28;border-radius:16px;overflow:hidden;box-shadow:0 24px 70px #000a;transition:.2s ease}.mc-player.open{display:block}.mc-player.expanded{width:min(960px,calc(100vw - 20px));right:10px;top:max(82px,calc(env(safe-area-inset-top) + 48px))}.mc-player-head{height:42px;display:flex;align-items:center;gap:7px;padding:0 8px 0 12px;background:#071827}.mc-player-title{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:850}.mc-player-btn{border:0;background:#ffffff12;color:#fff;border-radius:8px;min-width:36px;min-height:32px;cursor:pointer;font-size:17px}.mc-player-stage{background:#000;aspect-ratio:16/9}.mc-player-stage video,.mc-player-stage iframe{width:100%;height:100%;display:block;border:0;background:#000}.mc-player.system-pip{display:none!important}.mc-sermon-card{position:relative}.mc-watch{display:inline-flex;align-items:center;justify-content:center;margin-top:10px;min-height:42px}.method-body .mc-zelle-qr{width:210px;max-width:100%;display:block;margin:16px 0 4px;border-radius:12px;border:1px solid #e5e7eb;background:#fff;padding:8px}.mc-live-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}.mc-live-actions a{min-height:50px;padding:0 20px;border-radius:10px;background:var(--blue);color:#fff;font-weight:900;display:inline-flex;align-items:center;justify-content:center}.mc-live-actions a.mc-live-secondary{background:#fff;color:#071827}.mc-live-meta{color:var(--muted);font-size:14px;margin-top:12px}@media(max-width:700px){.mc-bible-tools{grid-template-columns:1fr}.mc-search{flex-direction:column}.mc-search button{width:100%}.mc-bible-content{width:calc(100% - 24px);padding-top:18px;padding-bottom:calc(40px + var(--mc-bottom-nav-height,0px))}.mc-bible-content .lead{font-size:16px}.mc-bible-reader{padding:17px;border-radius:15px}.mc-verse{font-size:19px}.mc-player{width:min(330px,58vw);right:8px;top:max(82px,calc(env(safe-area-inset-top) + 52px))}.mc-player.expanded{width:calc(100vw - 16px);right:8px;top:max(78px,calc(env(safe-area-inset-top) + 48px))}.mc-player-head{height:40px}.mc-live-actions{display:grid}.mc-live-actions a{width:100%}}
 `;
 document.head.appendChild(style);
}

function addBibleNav(){
 document.querySelectorAll('.desktop').forEach((nav)=>{
   if(nav.querySelector('a[data-mc-bible]'))return;
   const give=nav.querySelector('a[href="#give"]');
   const link=document.createElement('a');
   link.href='#bible';link.textContent=text('bible');link.dataset.mcBible='1';nav.insertBefore(link,give||null);
 });
}
function addBibleSection(){
 if(document.getElementById('bible'))return;
 const section=document.createElement('section');section.id='bible';section.className='mc-bible-overlay';
 section.innerHTML=`<div class="mc-bible-top"><strong data-mc="bibleTop">${esc(text('bible'))}</strong><button id="mcBibleClose" class="mc-bible-close" type="button" aria-label="${esc(text('close'))}">×</button></div><div class="mc-bible-content"><span class="eyebrow" data-mc="bibleEyebrow">${esc(text('bible'))}</span><h2 class="title" data-mc="bibleTitle">${esc(text('bibleTitle'))}</h2><p class="lead" data-mc="bibleLead">${esc(text('bibleLead'))}</p><div class="mc-bible-tools"><select id="mcTranslation" aria-label="Bible translation"><option value="kjv">English | KJV</option><option value="rvr">Español | Reina-Valera 1960</option><option value="aa">Português | Almeida</option></select><select id="mcBook" aria-label="Bible book"></select><select id="mcChapter" aria-label="Bible chapter"></select></div><div class="mc-search"><input id="mcBibleSearch" placeholder="${esc(text('searchPlaceholder'))}" aria-label="Search Bible passage"><button id="mcBibleGo" type="button">${esc(text('go'))}</button></div><div class="mc-bible-actions"><button id="mcBibleAudio" class="mc-audio" type="button">▶ ${esc(text('listen'))}</button></div><div id="mcBibleStatus" class="mc-bible-status" role="status" aria-live="polite"></div><div id="mcBibleReader" class="mc-bible-reader" style="display:none"></div></div>`;
 document.body.appendChild(section);
 document.getElementById('mcBibleClose').onclick=closeBible;
 const saved=readBiblePreferences();
 const preferred={en:'kjv',es:'rvr',pt:'aa'}[lang()]||'kjv';
 currentTranslation=preferred;
 document.getElementById('mcTranslation').value=currentTranslation;
 document.getElementById('mcTranslation').onchange=(event)=>loadBible(event.target.value,true);
 document.getElementById('mcBook').onchange=(event)=>{currentBook=Number(event.target.value)||0;currentChapter=0;fillChapters();renderChapter();saveBiblePreferences()};
 document.getElementById('mcChapter').onchange=(event)=>{currentChapter=Number(event.target.value)||0;renderChapter();saveBiblePreferences()};
 document.getElementById('mcBibleGo').onclick=searchPassage;
 document.getElementById('mcBibleSearch').onkeydown=(event)=>{if(event.key==='Enter'){event.preventDefault();searchPassage()}};
 document.getElementById('mcBibleAudio').onclick=toggleAudio;
 loadBible(currentTranslation,false,saved);
}
function openBible(){
 const bible=document.getElementById('bible');if(!bible)return;
 bible.classList.add('open');document.body.classList.add('mc-bible-open');
 if(activeMedia){minimizePlayer();if(activeMedia.tagName==='VIDEO')enterSystemPiP()}
 window.MovementChurchNavigation?.setActive?.('bible');
 setTimeout(()=>document.getElementById('mcBibleSearch')?.focus({preventScroll:true}),250);
}
function closeBible(){document.getElementById('bible')?.classList.remove('open');document.body.classList.remove('mc-bible-open');window.speechSynthesis?.cancel();window.MovementChurchNavigation?.setActive?.('home')}

async function loadBible(code,reset,restore){
 currentTranslation=code;
 const status=document.getElementById('mcBibleStatus'),reader=document.getElementById('mcBibleReader');
 status.textContent=text('loading',bibleLang());status.style.display='block';reader.style.display='none';window.speechSynthesis?.cancel();
 try{
   if(!bibleCache[code]){const response=await fetch(BIBLE_SOURCES[code].url,{cache:'force-cache'});if(!response.ok)throw new Error('Bible '+response.status);bibleCache[code]=await response.json()}
   currentBooks=bibleCache[code];
   if(reset){currentBook=0;currentChapter=0}
   if(restore&&Number.isInteger(Number(restore.book))&&Number.isInteger(Number(restore.chapter))){currentBook=Number(restore.book);currentChapter=Number(restore.chapter)}
   fillBooks();fillChapters();renderChapter();saveBiblePreferences();
   status.style.display='none';reader.style.display='block';
   const search=document.getElementById('mcBibleSearch');if(search)search.placeholder=text('searchPlaceholder',bibleLang());
   const go=document.getElementById('mcBibleGo');if(go)go.textContent=text('go',bibleLang());
   const audio=document.getElementById('mcBibleAudio');if(audio&&!window.speechSynthesis?.speaking)audio.textContent='▶ '+text('listen',bibleLang());
 }catch(error){console.error(error);status.textContent=text('loadError',bibleLang());status.style.display='block'}
}
function fillBooks(){const select=document.getElementById('mcBook');select.innerHTML='';(currentBooks||[]).forEach((book,index)=>{const option=document.createElement('option');option.value=index;option.textContent=localizedBookName(index);select.appendChild(option)});currentBook=Math.max(0,Math.min(currentBook,(currentBooks?.length||1)-1));select.value=String(currentBook)}
function fillChapters(){const select=document.getElementById('mcChapter'),book=currentBooks?.[currentBook];select.innerHTML='';(book?.chapters||[]).forEach((_,index)=>{const option=document.createElement('option');option.value=index;option.textContent=text('chapter',bibleLang())+' '+(index+1);select.appendChild(option)});currentChapter=Math.max(0,Math.min(currentChapter,(book?.chapters?.length||1)-1));select.value=String(currentChapter)}
function renderChapter(focusVerse){const reader=document.getElementById('mcBibleReader'),book=currentBooks?.[currentBook],verses=book?.chapters?.[currentChapter]||[];if(!book)return;reader.innerHTML='<h3>'+esc(localizedBookName(currentBook))+' '+(currentChapter+1)+'</h3>'+verses.map((verse,index)=>'<p class="mc-verse" id="mc-v'+(index+1)+'"><sup>'+(index+1)+'</sup>'+esc(verse)+'</p>').join('');reader.style.display='block';if(focusVerse)setTimeout(()=>document.getElementById('mc-v'+focusVerse)?.scrollIntoView({block:'center',behavior:'smooth'}),80)}
function searchPassage(){
 if(!currentBooks)return;
 const input=document.getElementById('mcBibleSearch'),status=document.getElementById('mcBibleStatus'),raw=input.value.trim();
 const match=raw.match(/^(.*?)[\s.]+(\d+)(?::(\d+))?\s*$/);
 if(!match){status.textContent=text('notFound',bibleLang());status.style.display='block';return}
 const index=bookIndexFromName(match[1]),chapter=Math.max(1,Number(match[2])),verse=match[3]?Math.max(1,Number(match[3])):null;
 if(index<0||!currentBooks[index]){status.textContent=text('notFound',bibleLang());status.style.display='block';return}
 currentBook=index;currentChapter=Math.min(chapter-1,(currentBooks[index].chapters?.length||1)-1);
 document.getElementById('mcBook').value=String(currentBook);fillChapters();renderChapter(verse);saveBiblePreferences();status.style.display='none';
 setTimeout(()=>document.getElementById('mcBibleReader')?.scrollIntoView({block:'start',behavior:'smooth'}),60);
}
function toggleAudio(){const synth=window.speechSynthesis;if(!synth)return;const button=document.getElementById('mcBibleAudio');if(synth.speaking){synth.cancel();button.textContent='▶ '+text('listen',bibleLang());return}const verses=currentBooks?.[currentBook]?.chapters?.[currentChapter]||[];if(!verses.length)return;const utterance=new SpeechSynthesisUtterance(verses.join(' '));utterance.lang=currentTranslation==='rvr'?'es-US':currentTranslation==='aa'?'pt-BR':'en-US';utterance.onend=()=>button.textContent='▶ '+text('listen',bibleLang());button.textContent='■ '+text('stop',bibleLang());synth.speak(utterance)}

function addPlayer(){
 if(document.getElementById('mcPlayer'))return;
 const player=document.createElement('div');player.id='mcPlayer';player.className='mc-player';
 player.innerHTML=`<div class="mc-player-head"><div id="mcPlayerTitle" class="mc-player-title">Movement Church</div><button id="mcPip" class="mc-player-btn" type="button" title="${esc(text('pip'))}" aria-label="${esc(text('pip'))}">◱</button><button id="mcMin" class="mc-player-btn" type="button" title="${esc(text('minimize'))}" aria-label="${esc(text('minimize'))}">−</button><button id="mcExpand" class="mc-player-btn" type="button" title="${esc(text('expand'))}" aria-label="${esc(text('expand'))}">⛶</button><button id="mcClose" class="mc-player-btn" type="button" title="${esc(text('close'))}" aria-label="${esc(text('close'))}">×</button></div><div id="mcPlayerStage" class="mc-player-stage"></div>`;
 document.body.appendChild(player);
 document.getElementById('mcMin').onclick=minimizePlayer;document.getElementById('mcExpand').onclick=toggleExpand;document.getElementById('mcClose').onclick=closePlayer;document.getElementById('mcPip').onclick=enterSystemPiP;
}
function youtube(url){const match=String(url||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|live\/|embed\/))([^?&/]+)/);return match?.[1]||''}
function openMedia(url,title){
 if(!url)return;addPlayer();const stage=document.getElementById('mcPlayerStage');stage.innerHTML='';let element;const id=youtube(url);
 if(id){element=document.createElement('iframe');element.src='https://www.youtube.com/embed/'+encodeURIComponent(id)+'?autoplay=1&playsinline=1&rel=0';element.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';element.allowFullscreen=true}
 else if(/\.(mp4|m4v|webm)(\?|$)/i.test(url)||String(url).includes('/storage/v1/object/public/')){element=document.createElement('video');element.src=url;element.controls=true;element.autoplay=true;element.playsInline=true;element.setAttribute('playsinline','');element.setAttribute('webkit-playsinline','');element.disablePictureInPicture=false;element.addEventListener('enterpictureinpicture',()=>document.getElementById('mcPlayer').classList.add('system-pip'));element.addEventListener('leavepictureinpicture',()=>document.getElementById('mcPlayer').classList.remove('system-pip'))}
 else{element=document.createElement('iframe');element.src=url;element.allow='autoplay; picture-in-picture; fullscreen';element.allowFullscreen=true}
 stage.appendChild(element);activeMedia=element;document.getElementById('mcPlayerTitle').textContent=title||'Movement Church';document.getElementById('mcPlayer').classList.add('open');minimizePlayer();
}
function minimizePlayer(){document.getElementById('mcPlayer')?.classList.remove('expanded')}
function toggleExpand(){document.getElementById('mcPlayer')?.classList.toggle('expanded')}
function closePlayer(){try{if(activeMedia?.tagName==='VIDEO')activeMedia.pause()}catch(_){}document.getElementById('mcPlayerStage').innerHTML='';document.getElementById('mcPlayer')?.classList.remove('open','expanded','system-pip');activeMedia=null}
async function enterSystemPiP(){if(!activeMedia)return;if(activeMedia.tagName==='VIDEO'&&document.pictureInPictureEnabled&&activeMedia.requestPictureInPicture){try{if(activeMedia.paused)await activeMedia.play();await activeMedia.requestPictureInPicture();return}catch(error){console.warn('PiP unavailable',error)}}minimizePlayer()}

async function loadSermons(){
 const grid=document.querySelector('#sermons .grid');if(!grid)return;
 try{const response=await fetch(SB+'/rest/v1/movement_sermons?select=*&is_published=eq.true&order=sort_order.asc',{headers:{apikey:KEY}});if(!response.ok)return;const rows=await response.json();if(!Array.isArray(rows)||!rows.length)return;grid.innerHTML='';rows.forEach((sermon)=>{const title=sermon['title_'+lang()]||sermon.title_en||sermon.title_es||sermon.title_pt||'Movement Church';const url=sermon.video_url||sermon.file_url||'';const card=document.createElement('article');card.className='card mc-sermon-card';card.innerHTML=(sermon.thumbnail_url?'<img src="'+esc(sermon.thumbnail_url)+'" alt="">':'')+'<div class="body"><h3>'+esc(title)+'</h3>'+(sermon.speaker?'<p>'+esc(sermon.speaker)+'</p>':'')+(url?'<button class="mc-watch" type="button">▶ '+esc(text('watch'))+'</button>':'')+'</div>';if(url)card.querySelector('.mc-watch').onclick=()=>openMedia(url,title);grid.appendChild(card)})}catch(error){console.warn('Sermons unavailable',error)}
}
async function loadLiveConfig(){
 const panel=document.querySelector('#live .panel');if(!panel)return;
 try{const response=await fetch(SB+'/rest/v1/movement_live_config?id=eq.1&select=*',{headers:{apikey:KEY},cache:'no-store'});if(!response.ok)throw new Error('LIVE '+response.status);const rows=await response.json(),config=Array.isArray(rows)?rows[0]:null;let box=document.getElementById('mcLiveDynamic');if(!box){box=document.createElement('div');box.id='mcLiveDynamic';panel.appendChild(box)}const notice=panel.querySelector('.notice');if(!config||!config.zoom_join_url){box.innerHTML='';if(notice)notice.textContent=text('liveOffline');return}if(notice)notice.textContent=text('liveReady');const url=String(config.zoom_join_url||'').trim();const website=config.website_join_enabled!==false;const zoom=config.zoom_join_enabled!==false;let html='<div class="mc-live-actions">';if(website)html+='<a href="live-meeting.html">'+esc(text('joinMeeting'))+'</a>';if(zoom)html+='<a class="mc-live-secondary" href="'+esc(url)+'" target="_blank" rel="noopener">'+esc(text('openZoom'))+'</a>';if(!website&&!zoom)html+='<a href="'+esc(url)+'" target="_blank" rel="noopener">'+esc(text('joinMeeting'))+'</a>';html+='</div>';if(config.meeting_number)html+='<div class="mc-live-meta">Meeting ID: '+esc(config.meeting_number)+(config.meeting_passcode?' · Passcode: '+esc(config.meeting_passcode):'')+'</div>';box.innerHTML=html}catch(error){console.warn('LIVE settings unavailable',error)}
}
function installZelleQR(){document.querySelectorAll('.method').forEach((method)=>{const label=method.querySelector('.method-head span')?.textContent?.trim().toLowerCase();if(label!=='zelle')return;const body=method.querySelector('.method-body');if(!body)return;body.innerHTML='<p data-mc-zelle>'+esc(text('zelle'))+'</p><img class="mc-zelle-qr" src="zelle-qr.svg?v=1" alt="Zelle verified QR code">'})}
function attachNavigationBehavior(){
 document.addEventListener('click',(event)=>{const link=event.target.closest('a[href]');if(!link)return;const href=link.getAttribute('href')||'';if(href==='#bible'){event.preventDefault();openBible();return}if((href==='#give'||/donate\.stripe\.com/i.test(link.href))&&activeMedia){minimizePlayer();if(activeMedia.tagName==='VIDEO')enterSystemPiP()}},true);
 document.addEventListener('keydown',(event)=>{if(event.key==='Escape'&&document.getElementById('bible')?.classList.contains('open'))closeBible()});
}
function refreshLanguage(){
 addBibleNav();
 document.querySelectorAll('[data-mc="bibleTop"],[data-mc="bibleEyebrow"],[data-mc="bibleTitle"]').forEach((node)=>node.textContent=text('bible'));
 document.querySelectorAll('[data-mc="bibleLead"]').forEach((node)=>node.textContent=text('bibleLead'));
 document.querySelectorAll('[data-mc-bible]').forEach((node)=>node.textContent=text('bible'));
 document.querySelectorAll('[data-mc-zelle]').forEach((node)=>node.textContent=text('zelle'));
 const preferred={en:'kjv',es:'rvr',pt:'aa'}[lang()]||'kjv';
 if(currentTranslation!==preferred){
   const select=document.getElementById('mcTranslation');
   if(select)select.value=preferred;
   loadBible(preferred,false,readBiblePreferences());
 }else if(currentBooks){fillBooks();fillChapters();renderChapter()}
 const query=document.getElementById('mcBibleSearch');if(query)query.placeholder=text('searchPlaceholder',bibleLang());
 const go=document.getElementById('mcBibleGo');if(go)go.textContent=text('go',bibleLang());
 const audio=document.getElementById('mcBibleAudio');if(audio&&!window.speechSynthesis?.speaking)audio.textContent='▶ '+text('listen',bibleLang());
 loadSermons();loadLiveConfig();
}
function init(){addStyles();addPlayer();addBibleNav();addBibleSection();installZelleQR();attachNavigationBehavior();loadSermons();loadLiveConfig();setInterval(loadLiveConfig,30000);document.getElementById('lang')?.addEventListener('change',()=>setTimeout(refreshLanguage,0));window.MovementChurchPlayer={open:openMedia,minimize:minimizePlayer,expand:toggleExpand,pictureInPicture:enterSystemPiP,close:closePlayer};window.MovementChurchBible={open:openBible,close:closeBible,savePreferences:saveBiblePreferences};if(location.hash==='#bible')setTimeout(openBible,0)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
