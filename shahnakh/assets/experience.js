(() => {
 'use strict';
 const en=document.documentElement.lang==='en',say=(fa,english)=>en?english:fa;
 const button=document.getElementById('motion-toggle'),status=document.getElementById('motion-status');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let active=false,pending=false,baseline=null,timeout=0;
 const emit=value=>window.dispatchEvent(new CustomEvent('shahnakh:tilt',{detail:value}));
 const reset=()=>{baseline=null;emit(0);};
 function stop(message=''){
  active=false;clearTimeout(timeout);window.removeEventListener('deviceorientation',orient);reset();
  button.setAttribute('aria-pressed','false');button.textContent=say('حرکت با گوشی','Enable tilt');status.textContent=message;
 }
 function orient(event){
  if(!active||document.hidden||reduced.matches||!Number.isFinite(event.gamma)||!Number.isFinite(event.beta))return;
  const angle=(screen.orientation?.angle??window.orientation??0)*Math.PI/180;
  const value=event.gamma*Math.cos(angle)+event.beta*Math.sin(angle);
  if(baseline===null){baseline=value;clearTimeout(timeout);status.textContent=say('گوشی را آرام به چپ و راست کج کنید.','Gently tilt your device left and right.');}
  const stage=document.querySelector('.hero-stage').getBoundingClientRect();
  if(stage.bottom<0||stage.top>innerHeight)return;
  emit(Math.max(-1,Math.min(1,(value-baseline)/25)));
 }
 button.addEventListener('click',async()=>{
  if(pending)return;
  if(active){stop();return;}
  if(reduced.matches){status.textContent=say('کاهش حرکت در تنظیمات دستگاه فعال است.','Reduced motion is enabled on your device.');return;}
  if(!window.isSecureContext||!window.DeviceOrientationEvent){status.textContent=say('حرکت گوشی در این مرورگر در دسترس نیست؛ اسکرول همچنان کار می‌کند.','Tilt is unavailable in this browser. You can still scroll.');return;}
  if(!window.SHAHNAKH_FABRIC_MESH){status.textContent=say('نمای سه‌بعدی در این دستگاه در دسترس نیست.','The 3D view is unavailable on this device.');return;}
  pending=true;button.disabled=true;
  try{
   const permission=typeof DeviceOrientationEvent.requestPermission==='function'?await DeviceOrientationEvent.requestPermission():'granted';
   if(permission!=='granted'){stop(say('دسترسی داده نشد؛ می‌توانید با اسکرول ادامه دهید.','Permission was not granted. You can continue scrolling.'));return;}
   if(reduced.matches)return;
   active=true;baseline=null;button.setAttribute('aria-pressed','true');button.textContent=say('توقف حرکت گوشی','Disable tilt');
   status.textContent=say('در حال دریافت حرکت گوشی…','Waiting for your device sensor…');
   window.addEventListener('deviceorientation',orient,{passive:true});
   timeout=setTimeout(()=>stop(say('دادهٔ حرکتی دریافت نشد؛ دوباره امتحان کنید یا اسکرول کنید.','No motion data received. Try again or continue scrolling.')),4000);
  }catch{stop(say('فعال‌سازی ممکن نشد؛ می‌توانید با اسکرول ادامه دهید.','Tilt could not be enabled. You can continue scrolling.'));}
  finally{pending=false;button.disabled=false;}
 });
 window.addEventListener('orientationchange',reset,{passive:true});
 screen.orientation?.addEventListener('change',reset);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){reset();clearTimeout(timeout);}else if(active){timeout=setTimeout(()=>{if(baseline===null)stop(say('دادهٔ حرکتی دریافت نشد.','No motion data received.'));},4000);}});
 reduced.addEventListener('change',()=>{if(reduced.matches)stop();});
 window.addEventListener('pagehide',()=>stop());
 window.addEventListener('shahnakh:renderer-state',event=>{if(!event.detail)stop();});
 // Transfer only the chosen display color between languages; never persist personal form data.
 const initial=new URLSearchParams(location.search).get('color');
 const picker=document.getElementById('custom-color');
 if(initial&&/^#[0-9a-f]{6}$/i.test(initial)){picker.value=initial;picker.dispatchEvent(new Event('input',{bubbles:true}));}
 document.querySelector('.language-switch').addEventListener('click',event=>{
  const link=event.currentTarget,url=new URL(link.href,location.href);url.searchParams.set('color',picker.value);url.hash=location.hash;link.href=url.href;
 });
})();
