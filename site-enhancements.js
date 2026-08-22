(function(){
  'use strict';

  const labels={
    en:{save:'Save preferences',saved:'Saved',live:'LIVE',home:'Home',bible:'Bible',give:'Give',chapter:'Chapter',lead:'Read a passage while the sermon keeps playing.',placeholder:'Example: John 3:16',go:'Go',listen:'Listen',note:'Bible reading preferences are saved on this device.'},
    es:{save:'Guardar preferencias',saved:'Guardado',live:'EN VIVO',home:'Inicio',bible:'Biblia',give:'Dar',chapter:'Capítulo',lead:'Lee un pasaje mientras la predicación continúa reproduciéndose.',placeholder:'Ejemplo: Juan 3:16',go:'Ir',listen:'Escuchar',note:'Las preferencias de lectura se guardan en este dispositivo.'},
    pt:{save:'Salvar preferências',saved:'Salvo',live:'AO VIVO',home:'Início',bible:'Bíblia',give:'Contribuir',chapter:'Capítulo',lead:'Leia uma passagem enquanto a pregação continua tocando.',placeholder:'Exemplo: João 3:16',go:'Ir',listen:'Ouvir',note:'As preferências de leitura são salvas neste dispositivo.'}
  };

  const siteLang=()=>document.getElementById('lang')?.value||localStorage.getItem('movement_lang')||'en';
  const L=(language)=>labels[language||siteLang()]||labels.en;

  function styles(){
    if(document.getElementById('mcEnhanceStyles'))return;
    const style=document.createElement('style');
    style.id='mcEnhanceStyles';
    style.textContent=`
      :root{--mc-bottom-nav-height:0px}
      .mc-mobile-nav{display:none}
      .mc-pref-save{border:1px solid var(--line);background:#ffffff0c;color:#fff;border-radius:10px;padding:10px 12px;font-weight:850;cursor:pointer;min-height:44px}
      .mc-pref-save:focus-visible,.mc-mobile-nav a:focus-visible{outline:3px solid #83b5ff;outline-offset:3px}
      .mc-admin-hint{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:1200;background:#071827;color:#fff;border-radius:999px;padding:9px 14px;font-size:12px;font-weight:800}
      .mc-bible-pref-note{font-size:12px;color:var(--muted);margin-top:8px}
      @media(max-width:900px){
        :root{--mc-bottom-nav-height:calc(68px + env(safe-area-inset-bottom))}
        html{scroll-padding-bottom:var(--mc-bottom-nav-height)}
        body{padding-bottom:var(--mc-bottom-nav-height);overflow-x:hidden}
        #menu,#mobile{display:none!important}
        .mc-mobile-nav{position:fixed;z-index:1200;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));min-height:var(--mc-bottom-nav-height);padding:7px 8px max(7px,env(safe-area-inset-bottom));background:#fffffffa;color:#071827;border-top:1px solid #dce3ea;box-shadow:0 -10px 26px #0003;backdrop-filter:blur(14px)}
        .mc-mobile-nav a{display:flex;min-width:0;min-height:50px;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-radius:11px;color:#526174;font-size:11px;font-weight:900;letter-spacing:.02em;text-decoration:none;white-space:nowrap}
        .mc-mobile-nav .mc-nav-icon{font-size:20px;line-height:22px;color:currentColor}
        .mc-mobile-nav a[aria-current="page"]{color:#0b5bd3;background:#eaf2ff}
        .mc-mobile-nav a[data-destination="live"] .mc-nav-icon{color:#ef4444}
        .mc-mobile-nav a[data-destination="live"][aria-current="page"] .mc-nav-icon{color:#d93535}
      }
      @media(max-width:620px){.mc-pref-save{display:none}}
    `;
    document.head.appendChild(style);
  }

  function currentDestination(){
    const hash=(location.hash||'#home').toLowerCase();
    if(hash==='#bible')return'bible';
    if(hash==='#give')return'give';
    return'home';
  }

  function setActive(destination){
    const active=destination||currentDestination();
    document.querySelectorAll('#mcMobileNav a[data-destination]').forEach((link)=>{
      const isActive=link.dataset.destination===active;
      if(isActive)link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
  }

  function mobileNav(){
    if(document.getElementById('mcMobileNav'))return;
    const nav=document.createElement('nav');
    nav.id='mcMobileNav';
    nav.className='mc-mobile-nav';
    nav.setAttribute('aria-label','Primary mobile navigation');
    nav.innerHTML=`
      <a href="/live-meeting.html" data-destination="live"><span class="mc-nav-icon" aria-hidden="true">●</span><span></span></a>
      <a href="#bible" data-destination="bible"><span class="mc-nav-icon" aria-hidden="true">▤</span><span></span></a>
      <a href="#give" data-destination="give"><span class="mc-nav-icon" aria-hidden="true">♡</span><span></span></a>
      <a href="#home" data-destination="home"><span class="mc-nav-icon" aria-hidden="true">⌂</span><span></span></a>
    `;
    document.body.appendChild(nav);
    nav.addEventListener('click',(event)=>{
      const link=event.target.closest('a[data-destination]');
      if(!link)return;
      const destination=link.dataset.destination;
      if(destination==='live')return;
      setActive(destination);
    });
    window.addEventListener('hashchange',()=>setActive());
    quickLabels();
    setActive();
  }

  function quickLabels(){
    document.querySelectorAll('#mcMobileNav [data-destination]').forEach((link)=>{
      const label=link.querySelector('span:last-child');
      if(label)label.textContent=L()[link.dataset.destination];
    });
  }

  function admin(){
    const brand=document.querySelector('.brand');
    if(!brand||brand.dataset.adminReady)return;
    brand.dataset.adminReady='1';
    let count=0,timer;
    function hit(event){
      event.preventDefault();
      event.stopPropagation();
      count++;
      clearTimeout(timer);
      timer=setTimeout(()=>count=0,6000);
      if(count===7){
        const hint=document.createElement('div');
        hint.className='mc-admin-hint';
        hint.textContent='3 more taps for Administration';
        document.body.appendChild(hint);
        setTimeout(()=>hint.remove(),1400);
      }
      if(count>=10)location.href='/admin.html';
    }
    brand.addEventListener('click',hit,true);
  }

  function savePreferences(){
    const actions=document.querySelector('.actions');
    const language=document.getElementById('lang');
    if(!actions||!language||document.getElementById('mcSavePrefs'))return;
    const button=document.createElement('button');
    button.id='mcSavePrefs';
    button.className='mc-pref-save';
    button.type='button';
    button.textContent=L().save;
    button.addEventListener('click',()=>{
      localStorage.setItem('movement_lang',siteLang());
      window.MovementChurchBible?.savePreferences?.();
      button.textContent=L().saved;
      setTimeout(()=>button.textContent=L().save,1200);
    });
    actions.insertBefore(button,actions.querySelector('.menu')||null);
  }

  function translateBible(){
    const translation=document.getElementById('mcTranslation');
    const translationLanguage=translation?.value==='rvr'?'es':translation?.value==='aa'?'pt':siteLang();
    const language=L(translationLanguage);
    document.querySelectorAll('[data-mc="bibleTop"],[data-mc="bibleEyebrow"],[data-mc="bibleTitle"]').forEach((node)=>node.textContent=language.bible);
    document.querySelectorAll('[data-mc="bibleLead"]').forEach((node)=>node.textContent=language.lead);
    const query=document.getElementById('mcBibleSearch');
    if(query)query.placeholder=language.placeholder;
    const go=document.getElementById('mcBibleGo');
    if(go)go.textContent=language.go;
    const audio=document.getElementById('mcBibleAudio');
    if(audio&&!(window.speechSynthesis&&speechSynthesis.speaking))audio.textContent='▶ '+language.listen;
    const chapters=document.getElementById('mcChapter');
    if(chapters)[...chapters.options].forEach((option,index)=>option.textContent=language.chapter+' '+(index+1));
    let note=document.querySelector('.mc-bible-pref-note');
    if(!note){
      note=document.createElement('div');
      note.className='mc-bible-pref-note';
      document.querySelector('.mc-bible-tools')?.after(note);
    }
    if(note)note.textContent=language.note;
  }

  function wire(){
    const language=document.getElementById('lang');
    if(language&&!language.dataset.prefReady){
      language.dataset.prefReady='1';
      const saved=localStorage.getItem('movement_lang');
      if(saved&&['en','es','pt'].includes(saved)){
        language.value=saved;
        language.dispatchEvent(new Event('change',{bubbles:true}));
      }
      language.addEventListener('change',()=>{
        localStorage.setItem('movement_lang',language.value);
        quickLabels();
        const save=document.getElementById('mcSavePrefs');
        if(save)save.textContent=L().save;
        setTimeout(translateBible,40);
      });
    }
    const translation=document.getElementById('mcTranslation');
    if(!translation||translation.dataset.prefReady)return Boolean(translation);
    translation.dataset.prefReady='1';
    translation.addEventListener('change',()=>setTimeout(translateBible,30));
    translateBible();
    return true;
  }

  function init(){
    styles();
    mobileNav();
    admin();
    savePreferences();
    wire();
    let attempts=0;
    const timer=setInterval(()=>{
      attempts++;
      if(wire()||attempts>60)clearInterval(timer);
    },150);
    window.MovementChurchNavigation={setActive};
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
