(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const copy = {
    ar: {
      sortLabel:'ترتيب السعر',sortDefault:'الترتيب الأصلي',sortAsc:'الأقل سعرًا',sortDesc:'الأعلى سعرًا',
      skip:'انتقل إلى المحتوى',japanese:'مطبخ ياباني',home:'الرئيسية',welcome:'أهلًا بك في هارو',headline1:'مذاق ياباني.',headline2:'تفاصيل هارو.',choose:'تجربتك تبدأ هنا',explore:'استكشف هارو',menu:'المنيو',menuHint:'اكتشف ما يشبه ذوقك',location:'الموقع',locationHint:'الطريق إلى هارو',reservations:'الحجوزات',reservationHint:'لحظتك، وطاولتك',instagram:'إنستغرام',loading:'نجهّز لك تجربة هارو',menuEyebrow:'من مطبخ هارو',menuTitle:'على ذوقك.',search:'ابحث عن طبقك',categories:'تصنيفات المنيو',noResults:'ما لقينا طبق بهذا الاسم',tryAgain:'جرّب اسمًا آخر أو تصنيفًا مختلفًا.',showAll:'عرض كل الأطباق',tableReady:'التجربة أجمل على طاولة هارو.',bookTable:'احجز طاولتك',close:'إغلاق',enjoyAtHaru:'استمتع بها في هارو',pending:'السعر عند الطلب',sar:'ريال سعودي',itemCount:n=>`${n} ${n===1?'صنف':'أصناف'}`,all:'الكل',appetizers:'المقبلات',maki:'الماكي',nigiri:'النيجيري',main:'الأطباق الرئيسية',drinks:'المشروبات',loadError:'تعذّر تحميل المنيو. أعد المحاولة.',retry:'إعادة المحاولة',detail:'عرض تفاصيل',languageChanged:'تم تفعيل اللغة العربية'
    },
    en: {
      sortLabel:'Sort by price',sortDefault:'Original order',sortAsc:'Lowest price',sortDesc:'Highest price',
      skip:'Skip to content',japanese:'JAPANESE DINING',home:'Home',welcome:'WELCOME TO HARU',headline1:'Japanese soul.',headline2:'The Haru touch.',choose:'YOUR EXPERIENCE STARTS HERE',explore:'Explore Haru',menu:'The Menu',menuHint:'Find your next favourite',location:'Find Us',locationHint:'Your way to Haru',reservations:'Reservations',reservationHint:'Your moment. Your table.',instagram:'Instagram',loading:'Preparing your Haru experience',menuEyebrow:'FROM THE HARU KITCHEN',menuTitle:'Good taste, your way.',search:'Find your dish',categories:'Menu categories',noResults:'No dishes found',tryAgain:'Try another name or category.',showAll:'Explore all dishes',tableReady:'Some things are better at a Haru table.',bookTable:'Reserve your table',close:'Close',enjoyAtHaru:'Enjoy it at Haru',pending:'Price on request',sar:'Saudi riyals',itemCount:n=>`${n} ${n===1?'item':'items'}`,all:'All',appetizers:'Appetizers',maki:'Maki',nigiri:'Nigiri',main:'Main Dishes',drinks:'Drinks',loadError:'The menu could not load. Please try again.',retry:'Try again',detail:'View',languageChanged:'English is now selected'
    }
  };
  Object.assign(copy.ar,{choices:'اختياراتي',choicesEmpty:'اختر أطباقك من المنيو لتجمعها هنا.',browseMenu:'تصفح المنيو',clearChoices:'مسح القائمة',total:'المجموع',addChoice:name=>`أضف ${name} إلى اختياراتي`,viewChoice:name=>`${name} ضمن اختياراتي؛ عرض القائمة`,removeChoice:name=>`إزالة ${name}`,added:name=>`أُضيف ${name} إلى اختياراتك`,removed:name=>`أُزيل ${name} من اختياراتك`,cleared:'تم مسح الاختيارات'});
  Object.assign(copy.en,{choices:'My picks',choicesEmpty:'Choose dishes from the menu to collect them here.',browseMenu:'Explore the menu',clearChoices:'Clear list',total:'Total',addChoice:name=>`Add ${name} to my picks`,viewChoice:name=>`${name} is in my picks; view list`,removeChoice:name=>`Remove ${name}`,added:name=>`${name} added to your picks`,removed:name=>`${name} removed from your picks`,cleared:'Your picks have been cleared'});
  const categoryOrder=['all','main','appetizers','maki','nigiri','drinks'];
  copy.ar.emptyChoices='اختياراتك فارغة';copy.en.emptyChoices='No picks yet';
  const choicesKey='haru-picks';
  let selectedIds=readChoices();
  let lang=document.documentElement.lang==='en'?'en':'ar';
  let activeCategory='all';
  let sortOrder='default';
  let products=[];
  let menuLoaded=false;
  let menuPromise=null;
  let currentProduct=null;
  let lastProductButton=null;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalise=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
  const icon=name=>`<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
  function announce(message){$('#announcement').textContent=message;}
  function readChoices(value){
    try{const ids=JSON.parse(value===undefined?localStorage.getItem(choicesKey):value);return new Set(Array.isArray(ids)?ids.filter(id=>Number.isInteger(id)&&id>0).slice(0,100):[]);}catch{return new Set();}
  }
  function saveChoices(){try{localStorage.setItem(choicesKey,JSON.stringify([...selectedIds]));}catch{}}
  function priceHTML(product){
    if(product.price===null)return `<span class="price-pending">${copy[lang].pending}</span>`;
    return `<span class="price" aria-label="${product.price} ${copy[lang].sar}"><span>${product.price}</span><img class="sar" src="assets/sar.svg" width="15" height="17" alt="" aria-hidden="true"></span>`;
  }
  function applyLanguage(next,announce=false){
    lang=next;document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    document.title=lang==='ar'?'HARU | هارو — مذاق ياباني':'HARU | Japanese Dining';
    $$('[data-i18n]').forEach(el=>{const t=copy[lang][el.dataset.i18n];if(typeof t==='string')el.textContent=t;});
    $$('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',copy[lang][el.dataset.i18nAria]));
    $$('[data-i18n-placeholder]').forEach(el=>{el.placeholder=copy[lang][el.dataset.i18nPlaceholder];el.setAttribute('aria-label',el.placeholder);});
    $$('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===lang)));
    $('#loading-screen').setAttribute('aria-label',copy[lang].loading);
    if(announce)try{localStorage.setItem('haru-language',lang);}catch{}
    renderCategories();if(menuLoaded)renderProducts();if(currentProduct)populateDialog(currentProduct);renderChoiceSummary();
    if(announce)$('#announcement').textContent=copy[lang].languageChanged;
  }
  function renderCategories(){
    $('#categories').innerHTML=categoryOrder.map(c=>`<button type="button" data-category="${c}" aria-pressed="${c===activeCategory}">${copy[lang][c]}</button>`).join('');
    $('#open-selections').setAttribute('aria-pressed',String(activeCategory==='choices'));
    $('#selection-count').textContent=String(selectedIds.size);
  }
  function drinkSVG(){return '<svg viewBox="0 0 80 100" aria-hidden="true"><path d="M19 25h42l-5 66H24zM25 34h30M43 26l9-21M24 91h32M30 51h20"/><circle cx="40" cy="55" r="12" opacity=".3"/></svg>';}
  function renderProducts(){
    const query=normalise($('#menu-search').value.trim());
    const result=products.filter(p=>(activeCategory==='choices'?selectedIds.has(p.id):(activeCategory==='all'||p.category===activeCategory))&&(!query||normalise(p.ar+' '+p.en).includes(query)));
    if(sortOrder!=='default')result.sort((a,b)=>{
      if(!Number.isFinite(a.price))return Number.isFinite(b.price)?1:0;
      if(!Number.isFinite(b.price))return -1;
      return sortOrder==='price-asc'?a.price-b.price:b.price-a.price;
    });
    $('#category-title').textContent=copy[lang][activeCategory];
    $('#results-count').textContent=copy[lang].itemCount(result.length);
    $('#no-results').hidden=result.length>0;
    const emptyChoices=activeCategory==='choices'&&selectedIds.size===0;
    const emptyTitle=$('#no-results h2'),emptyText=$('#no-results p');
    emptyTitle.dataset.i18n=emptyChoices?'emptyChoices':'noResults';emptyText.dataset.i18n=emptyChoices?'choicesEmpty':'tryAgain';
    emptyTitle.textContent=copy[lang][emptyTitle.dataset.i18n];emptyText.textContent=copy[lang][emptyText.dataset.i18n];
    $('#product-grid').innerHTML=result.map(p=>`<article class="product-card ${p.image?'':'text-only'}"><button class="product-open" type="button" data-product="${p.id}" aria-haspopup="dialog" aria-label="${escape(copy[lang].detail+' '+p[lang])}"><span class="product-art">${p.image?`<img src="${p.image}" alt="${escape(p[lang])}" width="650" height="470" loading="lazy" decoding="async">`:`<span class="drink-art">${drinkSVG()}</span>`}</span><span class="product-category">${copy[lang][p.category]}</span><span class="product-name">${escape(p[lang])}</span></button><div class="product-bottom">${priceHTML(p)}${choiceButtonHTML(p)}</div></article>`).join('');
    renderChoiceSummary();
  }
  function choiceButtonHTML(p){
    const selected=selectedIds.has(p.id);
    return `<button class="product-plus${selected?' is-selected':''}" type="button" data-add="${p.id}" aria-pressed="${selected}" aria-label="${escape(copy[lang][selected?'removeChoice':'addChoice'](p[lang]))}">${icon(selected?'check':'plus')}</button>`;
  }
  function syncChoiceButtons(){
    $$('[data-add]').forEach(button=>{
      const p=products.find(p=>p.id===Number(button.dataset.add));if(!p)return;
      const selected=selectedIds.has(p.id);button.classList.toggle('is-selected',selected);
      button.innerHTML=icon(selected?'check':'plus');button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',copy[lang][selected?'removeChoice':'addChoice'](p[lang]));
    });
  }
  function renderChoiceSummary(){
    const chosen=[...selectedIds].map(id=>products.find(p=>p.id===id)).filter(Boolean);
    $('#choices-summary').hidden=activeCategory!=='choices'||chosen.length===0;
    $('#clear-selections').disabled=chosen.length===0;
    $('#selections-total').innerHTML=priceHTML({price:chosen.reduce((sum,p)=>sum+(Number.isFinite(p.price)?p.price:0),0)});
  }
  function addChoice(id,trigger){
    const p=products.find(p=>p.id===id);if(!p)return;
    const index=$$('[data-add]').indexOf(trigger),wasSelected=selectedIds.has(id);
    if(wasSelected)selectedIds.delete(id);else selectedIds.add(id);
    saveChoices();renderCategories();
    if(activeCategory==='choices'){
      renderProducts();const buttons=$$('[data-add]');(buttons[Math.min(index,buttons.length-1)]||$('#open-selections')).focus({preventScroll:true});
    }else{syncChoiceButtons();renderChoiceSummary();}
    announce(copy[lang][wasSelected?'removed':'added'](p[lang]));
  }
  async function loadMenu(){
    if(menuLoaded)return;
    if(menuPromise)return menuPromise;
    menuPromise=(async()=>{
      try{
        const response=await fetch('menu.json');if(!response.ok)throw new Error('Menu unavailable');
        products=(await response.json()).sort((a,b)=>categoryOrder.indexOf(a.category)-categoryOrder.indexOf(b.category)||a.id-b.id);menuLoaded=true;selectedIds=new Set([...selectedIds].filter(id=>products.some(p=>p.id===id)));renderCategories();renderProducts();
      }catch(error){
        $('#product-grid').innerHTML=`<div class="no-results"><p>${copy[lang].loadError}</p><button type="button" id="retry-menu">${copy[lang].retry}</button></div>`;
        $('#retry-menu')?.addEventListener('click',()=>{menuPromise=null;loadMenu();});
      }
    })();
    return menuPromise;
  }
  function setView(menu,focus=true){
    $('#home-view').hidden=menu;$('#menu-view').hidden=!menu;
    document.body.classList.toggle('is-menu',menu);
    $('.header-back').hidden=!menu;
    window.scrollTo({top:0,behavior:'instant'});
    if(menu){loadMenu();if(focus){$('#menu-title').setAttribute('tabindex','-1');$('#menu-title').focus({preventScroll:true});}}
    else if(focus)$('#open-menu').focus({preventScroll:true});
  }
  function openMenu(){if(location.hash!=='#menu')location.hash='menu';else setView(true);}
  function goHome(e){e?.preventDefault();$$('dialog[open]').forEach(dialog=>dialog.close());history.replaceState(null,'',location.pathname+location.search);setView(false);}
  function populateDialog(p){
    $('#dialog-title').textContent=p[lang];$('#dialog-category').textContent=copy[lang][p.category];$('#dialog-price').innerHTML=priceHTML(p);
    const img=$('#dialog-image');img.hidden=!p.image;if(p.image){img.src=p.image;img.alt=p[lang];}
    $('.dialog-art').hidden=!p.image;
  }
  function openProduct(id,button){
    const p=products.find(p=>p.id===id);if(!p)return;
    currentProduct=p;lastProductButton=button;populateDialog(p);$('#product-dialog').showModal();document.body.style.overflow='hidden';$('#close-dialog').focus();
  }
  $$('[data-lang]').forEach(el=>el.addEventListener('click',()=>applyLanguage(el.dataset.lang,true)));
  $$('[data-home]').forEach(el=>el.addEventListener('click',goHome));
  $('#open-menu').addEventListener('click',openMenu);
  $('#open-selections').addEventListener('click',()=>{if(!menuLoaded)return;activeCategory='choices';renderCategories();renderProducts();});
  $('#categories').addEventListener('click',e=>{const button=e.target.closest('[data-category]');if(!button||!menuLoaded)return;activeCategory=button.dataset.category;renderCategories();renderProducts();$(`[data-category="${activeCategory}"]`).focus({preventScroll:true});});
  $('#menu-search').addEventListener('input',()=>{if(menuLoaded)renderProducts();});
  $('#menu-sort').addEventListener('change',e=>{sortOrder=e.target.value;$('.price-sort-control').classList.toggle('is-active',sortOrder!=='default');if(menuLoaded)renderProducts();});
  $('#reset-search').addEventListener('click',()=>{$('#menu-search').value='';activeCategory='all';renderCategories();renderProducts();$('#menu-search').focus();});
  $('#product-grid').addEventListener('click',e=>{const add=e.target.closest('[data-add]');if(add){addChoice(Number(add.dataset.add),add);return;}const button=e.target.closest('[data-product]');if(button)openProduct(Number(button.dataset.product),button);});
  $('#close-dialog').addEventListener('click',()=>$('#product-dialog').close());
  $('#product-dialog').addEventListener('click',e=>{if(e.target===$('#product-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  $('#product-dialog').addEventListener('close',()=>{document.body.style.overflow='';currentProduct=null;lastProductButton?.focus();});
  $('#clear-selections').addEventListener('click',()=>{selectedIds.clear();saveChoices();renderCategories();renderProducts();announce(copy[lang].cleared);$('#open-selections').focus({preventScroll:true});});
  window.addEventListener('storage',e=>{if(e.key===choicesKey){selectedIds=readChoices(e.newValue);if(menuLoaded)selectedIds=new Set([...selectedIds].filter(id=>products.some(p=>p.id===id)));renderCategories();if(menuLoaded)renderProducts();else renderChoiceSummary();}});
  window.addEventListener('hashchange',()=>setView(location.hash==='#menu'));
  window.addEventListener('keydown',e=>{if(e.key==='/'&&!$('#menu-view').hidden&&!$('#product-dialog').open&&!['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)){e.preventDefault();$('#menu-search').focus();}});
  $$('.year').forEach(el=>el.textContent=new Date().getFullYear());
  applyLanguage(lang);
  if(location.hash==='#menu')setView(true,false);
  const minimum=new Promise(resolve=>setTimeout(resolve,950));
  Promise.race([Promise.all([minimum,document.fonts?.ready||Promise.resolve()]),new Promise(resolve=>setTimeout(resolve,3200))]).then(()=>{document.body.classList.remove('is-loading');setTimeout(()=>$('#loading-screen').setAttribute('aria-hidden','true'),900);});
})();
