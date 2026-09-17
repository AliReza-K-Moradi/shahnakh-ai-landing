(() => {
 'use strict';
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 const curtain = document.querySelector('.hero-curtain');
 if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
   if(!window.SHAHNAKH_FABRIC_MESH)gsap.fromTo(curtain,{yPercent:0},{yPercent:-105,ease:'none',scrollTrigger:{trigger:'.hero-stage',start:'top top',end:'bottom bottom',scrub:true,invalidateOnRefresh:true}});
   gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{y:25,opacity:0,duration:.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 94%',once:true}}));
  });
 } else if(!window.SHAHNAKH_FABRIC_MESH) {
  let ticking=false;
  const update=()=>{if(!reduced.matches){const stage=document.querySelector('.hero-stage');const distance=stage.offsetHeight-document.querySelector('.hero-sticky').offsetHeight;const p=Math.max(0,Math.min(1,-stage.getBoundingClientRect().top/distance));curtain.style.transform=`translateY(${-105*p}%)`;}ticking=false;};
  window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(update);ticking=true;}},{passive:true});update();
 }
 const form=document.getElementById('enquiry-form');const status=document.getElementById('form-status');const submit=form.querySelector('button[type=submit]');const submitLabel=document.getElementById('submit-label');
 const endpoint=window.SHAHNAKH_CONFIG?.enquiryEndpoint?.trim();
 if(endpoint)document.getElementById('demo-note').hidden=true;
 else submitLabel.textContent='Check enquiry details';
 const normalize=value=>value.replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
 const message=(text,error=false)=>{status.hidden=false;status.textContent=text;status.classList.toggle('error',error);status.focus({preventScroll:true});};
 form.addEventListener('input',e=>e.target.removeAttribute('aria-invalid'));
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(submit.disabled)return;const data=Object.fromEntries(new FormData(form));
  for(const key of ['fullName','brandName','mobile','fabric','monthlyKg'])data[key]=data[key].trim();
  const phone=normalize(data.mobile).replace(/[\s()\-]/g,'').replace(/^(?:\+98|0098)/,'0');
  const kg=normalize(data.monthlyKg).replace(/٫/g,'.').replace(/[٬,]/g,'');
  const invalid=[];
  for(const key of ['fullName','brandName','fabric'])if(!data[key])invalid.push([key,'Please complete every field.']);
  if(!/^09\d{9}$/.test(phone))invalid.push(['mobile','Please enter an Iranian mobile number, e.g. 09123456789 or +98 9123456789.']);
  if(!/^\d+(\.\d{1,3})?$/.test(kg)||Number(kg)<=0||Number(kg)>100000000)invalid.push(['monthlyKg','Enter monthly consumption in kilograms, greater than zero.']);
  if(invalid.length){invalid.forEach(([key])=>{const field=form.elements.namedItem(key);field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby','form-status');});message(invalid[0][1],true);form.elements.namedItem(invalid[0][0]).focus();return;}
  if(!endpoint){message('Your details are valid. Nothing has been sent or stored. Please call or message our team to send your enquiry.');return;}
  if(data.website)return;
  submit.disabled=true;submitLabel.textContent='Sending your enquiry…';status.hidden=true;
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
  try{
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,mobile:phone,monthlyKg:Number(kg),source:'textile-exhibition',consent:true}),signal:controller.signal});
   const result=await response.json();if(!response.ok||result.success!==true)throw new Error('Submission not confirmed');
   message('Your enquiry has been received. We look forward to talking with you.');form.reset();document.getElementById('enquiry-color').value='PANTONE '+document.getElementById('fabric-hex').textContent.replace(' ≈','')+' (approximate)';
  }catch{message('We could not confirm your enquiry. Your details remain in the form. Please try again or contact us.',true);}
  finally{clearTimeout(timeout);submit.disabled=false;submitLabel.textContent='Send enquiry';}
 });
})();


