(function(){
'use strict';

const LANG_TO_BIBLE={en:'kjv',es:'rvr',pt:'aa'};
const BIBLE_TO_LANG={kjv:'en',rvr:'es',aa:'pt'};
const labels={
 en:{save:'Save preferences',saved:'Saved',live:'LIVE',bible:'Bible',messages:'Messages',gatherings:'Gatherings',give:'Give',church:'Our Church',connect:'Connect',chapter:'Chapter',lead:'Read a passage while the sermon keeps playing.',placeholder:'Example: John 3:16',go:'Go',listen:'Listen',note:'Bible version and chapter labels follow your selected language.'},
 es:{save:'Guardar preferencias',saved:'Guardado',live:'EN VIVO',bible:'Biblia',messages:'Mensajes',gatherings:'Reuniones',give:'Dar',church:'Nuestra Iglesia',connect:'Conectar',chapter:'Capítulo',lead:'Lee un pasaje mientras la predicación continúa reproduciéndose.',placeholder:'Ejemplo: Juan 3:16',go:'Ir',listen:'Escuchar',note:'La Biblia y los capítulos siguen el idioma seleccionado.'},
 pt:{save:'Salvar preferências',saved:'Salvo',live:'AO VIVO',bible:'Bíblia',messages:'Mensagens',gatherings:'Encontros',give:'Contribuir',church:'Nossa Igreja',connect:'Conectar',chapter:'Capítulo',lead:'Leia uma passagem enquanto a pregação continua tocando.',placeholder:'Exemplo: João 3:16',go:'Ir',listen:'Ouvir',note:'A Bíblia e os capítulos seguem o idioma selecionado.'}
};

function siteLang(){return document.getElementById('lang')?.value||localStorage.getItem('movement_lang')||'en'}
function bibleLang(){const tr=document.getElementById('mcTranslation');return BIBLE_TO_LANG[tr?.value]||siteLang()}
function L(l){return labels[l||siteLang()]||labels.en}

function addStyles(){
 if(document.getElementById('mcEnhanceStyles'))return;
 const s=document.createElement('style');s.id='mcEnhanceStyles';s.textContent=`
 .mc-quick{position:sticky;top:76px;z-index:29;display:flex;overflow-x:auto;scrollbar-width:none;background:#fff;color:#071827;border-bottom:1px solid #dce3ea;box-shadow:0 5px 18px #00000012}.mc-quick::-webkit-scrollbar{display:none}.mc-quick a{min-width:92px;flex:1;padding:10px 8px 11px;text-align:center;font-size:12px;font-weight:850;white-space:nowrap}.mc-quick .ico{display:block;font-size:21px;line-height:1.1;margin-bottom:4px}.mc-pref-save{border:1px solid var(--line);background:#ffffff0c;color:#fff;border-radius:10px;padding:10px 12px;font-weight:850;cursor:pointer}.mc-pref-save.saved{background:#135f38;border-color:#135f38}.mc-admin-hint{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:1200;background:#071827;color:#fff;border:1px solid #ffffff26;border-radius:999px;padding:9px 14px;font-size:12px;font-weight:800;box-shadow:0 12px 30px #0008;pointer-events:none}.mc-bible-pref-note{font-size:12px;color:var(--muted);margin-top:8px}
 @media(max-width:900px){.mc-quick{top:76px}.mc-pref-save{font-size:12px;padding:9px 10px}}
 @media(max-width:620px){.mc-pref-save{display:none}.mc-quick a{min-width:82px;font-size:11px;padding-left:5px;padding-right:5px}}
 `;document.head.appendChild(s);
}

function addQuickAccess(){
 if(document.getElementById('mcQuick'))return;
 const header=document.querySelector('header');if(!header)return;
 const q=document.createElement('nav');q.id='mcQuick';q.className='mc-quick';q.setAttribute('aria-label','Quick access');
 q.innerHTML=`<a href="#live" data-q="live"><span class="ico">●</span><span></span></a><a href="#bible" data-q="bible"><span class="ico">▤</span><span></span></a><a href="#sermons" data-q="messages"><span class="ico">▶</span><span></span></a><a href="#events" data-q="gatherings"><span class="ico">◷</span><span></span></a><a href="#give" data-q="give"><span class="ico">♡</span><span></span></a><a href="#about" data-q="church"><span class="ico">◎</span><span></span></a><a href="#contact" data-q="connect"><span class="ico">✦</span><span></span></a>`;
 header.insertAdjacentElement('afterend',q);updateQuickLabels();
}
function updateQuickLabels(){const l=L();document.querySelectorAll('#mcQuick [data-q]').forEach(a=>{const span=a.querySelector('span:last-child');if(span)span.textContent=l[a.dataset.q]||a.dataset.q})}

function installAdminShortcut(){
 const brand=document.querySelector('.brand');const logo=brand?.querySelector('img');if(!brand||brand.dataset.adminReady)return;brand.dataset.adminReady='1';
 let taps=0,timer=0;
 function hit(e){e.preventDefault();e.stopPropagation();taps++;clearTimeout(timer);timer=setTimeout(()=>{taps=0},6000);if(taps===7)showHint('3 more taps for Administration');if(taps>=10){taps=0;window.location.href='/admin.html'}}
 brand.addEventListener('click',hit,true);
 if(logo)logo.addEventListener('touchend',function(e){e.preventDefault();hit(e)},{passive:false});
}
function showHint(msg){const d=document.createElement('div');d.className='mc-admin-hint';d.textContent=msg;document.body.appendChild(d);setTimeout(()=>d.remove(),1400)}

function addSaveButton(){
 const actions=document.querySelector('.actions'),sel=document.getElementById('lang');if(!actions||!sel||document.getElementById('mcSavePrefs'))return;
 const b=document.createElement('button');b.id='mcSavePrefs';b.className='mc-pref-save';b.type='button';b.textContent=L().save;b.onclick=savePreferences;actions.insertBefore(b,actions.querySelector('.menu')||null);
}
function savePreferences(){
 localStorage.setItem('movement_lang',siteLang());
 const tr=document.getElementById('mcTranslation');if(tr)localStorage.setItem('movement_bible_translation',tr.value);
 const book=document.getElementById('mcBook');if(book)localStorage.setItem('movement_bible_book',book.value);
 const ch=document.getElementById('mcChapter');if(ch)localStorage.setItem('movement_bible_chapter',ch.value);
 const b=document.getElementById('mcSavePrefs');if(b){b.textContent=L().saved;b.classList.add('saved');setTimeout(()=>{b.textContent=L().save;b.classList.remove('saved')},1400)}
}

function translateBibleControls(){
 const bl=bibleLang(),l=L(bl);
 document.querySelectorAll('[data-mc="bibleTop"],[data-mc="bibleEyebrow"],[data-mc="bibleTitle"]').forEach(x=>x.textContent=l.bible);
 document.querySelectorAll('[data-mc="bibleLead"]').forEach(x=>x.textContent=l.lead);
 const q=document.getElementById('mcBibleSearch');if(q)q.placeholder=l.placeholder;
 const g=document.getElementById('mcBibleGo');if(g)g.textContent=l.go;
 const a=document.getElementById('mcBibleAudio');if(a&&!window.speechSynthesis?.speaking)a.textContent='▶ '+l.listen;
 const ch=document.getElementById('mcChapter');if(ch){[...ch.options].forEach((o,i)=>o.textContent=l.chapter+' '+(i+1));}
 let note=document.querySelector('.mc-bible-pref-note');if(!note){note=document.createElement('div');note.className='mc-bible-pref-note';const tools=document.querySelector('.mc-bible-tools');if(tools)tools.insertAdjacentElement('afterend',note)}if(note)note.textContent=l.note;
 document.documentElement.lang=siteLang();
}

function forceBibleToSiteLanguage(){
 const tr=document.getElementById('mcTranslation');if(!tr)return false;
 const desired=LANG_TO_BIBLE[siteLang()]||'kjv';
 localStorage.setItem('movement_bible_translation',desired);
 if(tr.value!==desired){tr.value=desired;tr.dispatchEvent(new Event('change',{bubbles:true}));}
 setTimeout(translateBibleControls,80);setTimeout(translateBibleControls,350);return true;
}

function restoreBiblePosition(){
 const book=document.getElementById('mcBook'),ch=document.getElementById('mcChapter');if(!book||!ch)return;
 const b=localStorage.getItem('movement_bible_book'),c=localStorage.getItem('movement_bible_chapter');
 if(b!==null&&book.querySelector(`option[value="${CSS.escape(b)}"]`)){book.value=b;book.dispatchEvent(new Event('change',{bubbles:true}));setTimeout(()=>{if(c!==null&&ch.querySelector(`option[value="${CSS.escape(c)}"]`)){ch.value=c;ch.dispatchEvent(new Event('change',{bubbles:true}));translateBibleControls()}},160)}
 book.addEventListener('change',()=>{localStorage.setItem('movement_bible_book',book.value);setTimeout(translateBibleControls,20)});
 ch.addEventListener('change',()=>localStorage.setItem('movement_bible_chapter',ch.value));
}

function wireLanguage(){
 const sel=document.getElementById('lang');if(!sel||sel.dataset.prefReady)return;sel.dataset.prefReady='1';
 const saved=localStorage.getItem('movement_lang');if(saved&&['en','es','pt'].includes(saved)&&sel.value!==saved){sel.value=saved;sel.dispatchEvent(new Event('change',{bubbles:true}));}
 sel.addEventListener('change',()=>{localStorage.setItem('movement_lang',sel.value);updateQuickLabels();const b=document.getElementById('mcSavePrefs');if(b)b.textContent=L().save;setTimeout(forceBibleToSiteLanguage,40)});
}
function wireBible(){
 const tr=document.getElementById('mcTranslation');if(!tr||tr.dataset.prefReady)return false;tr.dataset.prefReady='1';
 tr.addEventListener('change',()=>{localStorage.setItem('movement_bible_translation',tr.value);setTimeout(translateBibleControls,30);setTimeout(translateBibleControls,300)});
 forceBibleToSiteLanguage();setTimeout(restoreBiblePosition,500);return true;
}

function init(){addStyles();addQuickAccess();installAdminShortcut();addSaveButton();wireLanguage();let tries=0;const timer=setInterval(()=>{tries++;if(wireBible()||tries>60)clearInterval(timer)},150)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();