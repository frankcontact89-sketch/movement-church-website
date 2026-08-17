/* Movement Church giving selector fix for custom domain path. */
(function(){
  'use strict';

  const languageText={
    en:{select:'Select payment method',hide:'Hide payment methods',card:'Card / Stripe'},
    es:{select:'Seleccionar método de pago',hide:'Ocultar métodos de pago',card:'Tarjeta / Stripe'},
    pt:{select:'Selecionar forma de pagamento',hide:'Ocultar formas de pagamento',card:'Cartão / Stripe'}
  };

  const fallbackTranslations={
    en:{aboutNav:'About',liveNav:'LIVE',sermonsNav:'Sermons',mediaNav:'Media',eventsNav:'Events',giveNav:'Give',liveNow:'LIVE CHURCH',joinLive:'Join LIVE',learnMore:'Learn more',aboutTitle:'A church in movement.',joinChurch:'Join church from anywhere.',giveTitle:'Tithes & Offerings',giveText:'Trust God with your finances by giving your first 10% back to Him.',footerText:'Encounter God. Grow in faith. Live on mission.'},
    es:{aboutNav:'Nosotros',liveNav:'EN VIVO',sermonsNav:'Predicaciones',mediaNav:'Multimedia',eventsNav:'Eventos',giveNav:'Ofrendar',liveNow:'IGLESIA EN VIVO',joinLive:'Entrar EN VIVO',learnMore:'Conocer más',aboutTitle:'Una iglesia en movimiento.',joinChurch:'Únete a la iglesia desde cualquier lugar.',giveTitle:'Diezmos y Ofrendas',giveText:'Confía en Dios con tus finanzas dando a Él el primer 10%.',footerText:'Encuentra a Dios. Crece en la fe. Vive en misión.'},
    pt:{aboutNav:'Sobre',liveNav:'AO VIVO',sermonsNav:'Pregações',mediaNav:'Mídia',eventsNav:'Eventos',giveNav:'Ofertar',liveNow:'IGREJA AO VIVO',joinLive:'Entrar AO VIVO',learnMore:'Saiba mais',aboutTitle:'Uma igreja em movimento.',joinChurch:'Participe da igreja de qualquer lugar.',giveTitle:'Dízimos e Ofertas',giveText:'Confie em Deus com suas finanças, devolvendo a Ele os primeiros 10%.',footerText:'Encontre Deus. Cresça na fé. Viva em missão.'}
  };

  const style=document.createElement('style');
  style.textContent=`
    #givingGrid{display:none}
    .give-method-title{display:none!important}
    .giving-label small{display:none!important}
    .give-method-picker{width:100%;min-height:58px;border:1px solid #d9e0e8;border-radius:16px;background:#fff;color:#071827;font-weight:850;font-size:18px;padding:0 50px 0 18px;text-align:left;position:relative;cursor:pointer}
    .give-method-picker:after{content:'⌄';position:absolute;right:18px;top:50%;transform:translateY(-50%);font-size:23px}
    .give-method-picker.open:after{content:'⌃'}
    #givingGrid.payment-methods-open{display:block;margin-top:10px}
    .giving-details{padding-left:18px!important;text-align:center}
    .giving-details p{font-size:16px;font-weight:750;color:#334155!important;word-break:break-word}
    .giving-details .qr{margin:14px auto!important;width:min(220px,100%)!important}
    .giving-actions{justify-content:center}
    .giving-item:first-child .copy-btn{display:none!important}
    @media(max-width:620px){.give-method-picker{min-height:54px;font-size:17px}.giving-details{padding:8px 12px 18px!important}}
  `;
  document.head.appendChild(style);

  function getLang(){
    const stored=localStorage.getItem('movementLanguage');
    return stored==='es'||stored==='pt'?stored:'en';
  }

  function installNavigationFallback(){
    const menu=document.getElementById('menu');
    const mobile=document.getElementById('mobile');

    if(menu&&mobile&&!menu.dataset.fallbackReady){
      menu.dataset.fallbackReady='1';
      menu.addEventListener('click',function(e){
        e.preventDefault();
        mobile.classList.toggle('open');
        document.body.classList.toggle('menu-open',mobile.classList.contains('open'));
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      if(a.dataset.scrollFallbackReady)return;
      a.dataset.scrollFallbackReady='1';
      a.addEventListener('click',function(e){
        const href=a.getAttribute('href');
        if(!href||href==='#')return;
        const target=document.querySelector(href);
        if(!target)return;
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth',block:'start'});
        if(mobile)mobile.classList.remove('open');
        document.body.classList.remove('menu-open');
        try{history.replaceState(null,'',href)}catch(_){ }
      });
    });

    const langSelect=document.getElementById('lang');
    if(langSelect&&!langSelect.dataset.fallbackReady){
      langSelect.dataset.fallbackReady='1';
      langSelect.addEventListener('change',function(){
        const selected=langSelect.value==='es'||langSelect.value==='pt'?langSelect.value:'en';
        localStorage.setItem('movementLanguage',selected);
        document.documentElement.lang=selected==='pt'?'pt-BR':selected;
        const words=fallbackTranslations[selected]||fallbackTranslations.en;
        document.querySelectorAll('[data-t]').forEach(function(el){
          const key=el.getAttribute('data-t');
          if(words[key])el.textContent=words[key];
        });
      });
    }
  }

  function enhanceGiving(){
    const grid=document.getElementById('givingGrid');
    if(!grid||grid.dataset.paymentSelectorReady==='1')return false;
    grid.dataset.paymentSelectorReady='1';

    const text=languageText[getLang()]||languageText.en;
    const picker=document.createElement('button');
    picker.type='button';
    picker.className='give-method-picker';
    picker.textContent=text.select;
    picker.setAttribute('aria-expanded','false');
    picker.setAttribute('aria-controls','givingGrid');
    grid.parentNode.insertBefore(picker,grid);

    function setOpen(open){
      grid.classList.toggle('payment-methods-open',open);
      picker.classList.toggle('open',open);
      picker.setAttribute('aria-expanded',open?'true':'false');
      picker.textContent=open?text.hide:text.select;
      if(!open)grid.querySelectorAll('.giving-item.open').forEach(item=>item.classList.remove('open'));
    }
    setOpen(false);
    picker.addEventListener('click',()=>setOpen(!grid.classList.contains('payment-methods-open')));

    function cleanLabels(){
      grid.querySelectorAll('.giving-item').forEach(item=>{
        const strong=item.querySelector('.giving-label strong');
        if(!strong)return;
        const method=(strong.textContent||'').toLowerCase();
        const rawType=(item.querySelector('.giving-label small')?.textContent||'').toLowerCase();
        if(method.includes('card')||method.includes('stripe')||rawType.includes('card')||rawType.includes('stripe')) strong.textContent=text.card;
      });
    }
    cleanLabels();
    new MutationObserver(cleanLabels).observe(grid,{childList:true,subtree:true});
    return true;
  }

  function boot(){
    installNavigationFallback();
    enhanceGiving();
    let attempts=0;
    const timer=setInterval(()=>{
      attempts++;
      installNavigationFallback();
      enhanceGiving();
      if(attempts>40)clearInterval(timer);
    },250);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
