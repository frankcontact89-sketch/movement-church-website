/* Movement Church giving selector fix for custom domain path. */
(function(){
  'use strict';

  const languageText={
    en:{select:'Select payment method',hide:'Hide payment methods',card:'Card / Stripe'},
    es:{select:'Seleccionar método de pago',hide:'Ocultar métodos de pago',card:'Tarjeta / Stripe'},
    pt:{select:'Selecionar forma de pagamento',hide:'Ocultar formas de pagamento',card:'Cartão / Stripe'}
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
    if(enhanceGiving())return;
    let attempts=0;
    const timer=setInterval(()=>{
      attempts++;
      if(enhanceGiving()||attempts>30)clearInterval(timer);
    },250);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
