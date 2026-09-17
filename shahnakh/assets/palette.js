(() => {
 'use strict';
 const colors={navy:['آبی شاه‌نخ','01 / DEEP BLUE','#2149a6'],rose:['رز اناری','02 / POMEGRANATE','#d6274a'],jade:['سبز یشمی','03 / JADE GREEN','#008f72'],lilac:['بنفش یاسی','04 / SOFT LILAC','#a457d9'],gold:['طلایی عسلی','05 / HONEY GOLD','#dc9b23'],milk:['سفید شیری','06 / MILK WHITE','#eee5d4'],sky:['آبی آسمانی','07 / SKY BLUE','#329fda'],olive:['سبز زیتونی','08 / OLIVE','#7e962f'],terracotta:['آجری','09 / TERRACOTTA','#d65d35'],cocoa:['قهوه‌ای کاکائویی','10 / COCOA','#804730'],sand:['بژ شنی','11 / SAND','#d4ab77'],charcoal:['خاکستری زغالی','12 / CHARCOAL','#454951']};

 // Curated related TCX references, NOT an official RGB-to-Pantone library.
 const pantoneCodes={"navy": "19-4052", "rose": "18-1750", "jade": "17-5641", "lilac": "18-3838", "gold": "15-0953", "milk": "11-0608", "sky": "16-4535", "olive": "18-0625", "terracotta": "18-1448", "cocoa": "19-1235", "sand": "15-1214", "charcoal": "19-4007"};
 const hexInput=document.getElementById('custom-hex');
 const help=document.getElementById('color-help');
 // Compare the 12 existing display swatches in perceptual OKLab space.
 function lab(hex){
  const [r,g,b]=hex.match(/[a-f\d]{2}/gi).map(x=>{const v=parseInt(x,16)/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];
 }
 function nearest(hex){const a=lab(hex);return Object.keys(colors).reduce((best,key)=>{const b=lab(colors[key][2]),distance=b.reduce((sum,v,i)=>sum+(v-a[i])**2,0);return distance<best.distance?{key,distance}:best;},{key:'navy',distance:Infinity}).key;}
 let selectedPantone='19-4052 TCX';
 function showPantone(hex,button){
  const key=button?button.dataset.color:nearest(hex);
  selectedPantone=pantoneCodes[key]+' TCX';
  hexInput.value=selectedPantone;hexInput.removeAttribute('aria-invalid');
  const display=selectedPantone+' ≈';
  document.getElementById('fabric-hex').textContent=display;
  document.getElementById('enquiry-color').value='PANTONE '+selectedPantone+' (تقریبی)';
  document.getElementById('enquiry-color-label').textContent=display;
  help.textContent=button?'مرجع پنتون پیشنهادی؛ تطبیق نهایی با نمونه پارچه انجام می‌شود.':'پیشنهاد تقریبی از میان ۱۲ مرجع این صفحه؛ جست‌وجوی کامل کاتالوگ پنتون نیست.';
 }
 const buttons=[...document.querySelectorAll('.swatch')];
 const image=document.getElementById('palette-fabric');
 const art=document.querySelector('.palette-art');
 const zoom=document.getElementById('texture-zoom');
 const channels=['r','g','b'].map(c=>document.getElementById('dye-'+c));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function toHsl(rgb){const [r,g,b]=rgb.map(v=>v/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;if(!d)return [0,0,l];const s=d/(1-Math.abs(2*l-1));let h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;return [(h*60+360)%360,s,l];}
 function fromHsl([h,s,l]){h=(h%360+360)%360;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;const base=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return base.map(v=>(v+m)*255);}
 let rgb=[33,73,166],frame=0;
 const apply=()=>{
  const light=Math.max(0,Math.min(1,(toHsl(rgb)[2]-.55)/.3));
  channels.forEach((channel,i)=>{
   const c=rgb[i]/255;
   // Preserve dye saturation in dark colors, preserve headroom for milk white.
   channel.setAttribute('slope',String((c*.70+.045)*(1-light)+.38*light));
   channel.setAttribute('intercept',String(Math.max(.008,c*.57-.025)*(1-light)+(c*.80-.19)*light));
  });
 };
 let selectedHex='#2149A6';
 function setColor(name,code,hex,button=null,instant=false){
  selectedHex=hex.toUpperCase();
  document.getElementById('custom-color').value=hex;
  showPantone(hex,button);
  buttons.forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  document.getElementById('color-name').textContent=name;document.getElementById('color-code').textContent=code;
  image.alt=`دورس دونخ با پشت حلقه‌ای، ${name}`;
  art.setAttribute('aria-label',`دورس دونخ، ${name}؛ برای جابه‌جایی نمای بزرگ‌شده از کلیدهای جهت استفاده کنید`);
  const target=hex.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16));
  cancelAnimationFrame(frame);
  if(reduced.matches||instant){rgb=target;apply();return;}
  const from=toHsl(rgb),to=toHsl(target),start=performance.now();
  if(from[1]<.12)from[0]=to[0];if(to[1]<.12)to[0]=from[0];
  let hue=to[0]-from[0];if(hue>0)hue-=360;
  const duration=Math.abs(hue)>170?420:280;
  const tween=now=>{const p=Math.min(1,(now-start)/duration),ease=p*p*(3-2*p);rgb=p===1?target:fromHsl([from[0]+hue*ease,from[1]+(to[1]-from[1])*ease,from[2]+(to[2]-from[2])*ease]);apply();if(p<1)frame=requestAnimationFrame(tween);};
  frame=requestAnimationFrame(tween);
 }
 function select(button){setColor(...colors[button.dataset.color],button);}
 document.getElementById('custom-color').addEventListener('input',event=>setColor('رنگ دلخواه','CUSTOM COLOUR',event.target.value,null,true));
 function applyPantone(){
  const raw=hexInput.value.replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).toUpperCase().replace(/^PANTONE\s*/,'').replace(/\s*TCX$/,'').trim();
  const key=Object.keys(pantoneCodes).find(key=>pantoneCodes[key]===raw);
  if(!key){hexInput.setAttribute('aria-invalid','true');help.textContent='این کد در ۱۲ مرجع این نسخه نیست؛ از پیشنهادهای فهرست انتخاب کنید. رنگ فعلی حفظ شد.';return;}
  select(buttons.find(button=>button.dataset.color===key));
 }
 hexInput.addEventListener('change',applyPantone);hexInput.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();applyPantone();}});
 document.getElementById('copy-color').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText('PANTONE '+selectedPantone);help.textContent='کد پنتون '+selectedPantone+' کپی شد؛ تطبیق رنگ تقریبی است.';}
  catch{hexInput.value=selectedPantone;hexInput.focus();hexInput.select();help.textContent='کد انتخاب شد؛ از گزینهٔ کپی دستگاه استفاده کنید.';}
 });
 buttons.forEach((button,i)=>{
  button.style.setProperty('--swatch',colors[button.dataset.color][2]);
  button.title=colors[button.dataset.color][0]+' · PANTONE '+pantoneCodes[button.dataset.color]+' TCX (تقریبی)';
  button.setAttribute('aria-label',button.title);
  button.addEventListener('click',()=>select(button));
  button.addEventListener('keydown',event=>{
   let next=i;if(event.key==='ArrowLeft')next=(i+1)%buttons.length;else if(event.key==='ArrowRight')next=(i+buttons.length-1)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;
   event.preventDefault();buttons[next].focus();select(buttons[next]);
  });
 });
 let originX=50,originY=50,dragging=false;
 const position=()=>{image.style.transformOrigin=`${originX}% ${originY}%`;};
 zoom.addEventListener('input',()=>{
  const value=Number(zoom.value);image.style.setProperty('--texture-scale',String(value));
  document.getElementById('zoom-value').textContent=value.toLocaleString('fa-IR',{maximumFractionDigits:1})+'×';
  zoom.setAttribute('aria-valuetext',value.toLocaleString('fa-IR')+' برابر');
  art.classList.toggle('zoomed',value>1);if(value===1){originX=originY=50;position();}
 });
 const point=event=>{const box=art.getBoundingClientRect();originX=Math.max(0,Math.min(100,(event.clientX-box.left)/box.width*100));originY=Math.max(0,Math.min(100,(event.clientY-box.top)/box.height*100));position();};
 art.addEventListener('pointerdown',event=>{if(Number(zoom.value)<=1)return;dragging=true;art.setPointerCapture(event.pointerId);point(event);});
 art.addEventListener('pointermove',event=>{if(Number(zoom.value)>1&&(dragging||event.pointerType==='mouse'))point(event);});
 art.addEventListener('pointerup',()=>{dragging=false;});art.addEventListener('pointercancel',()=>{dragging=false;});
 art.addEventListener('keydown',event=>{
  if(Number(zoom.value)<=1||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  event.preventDefault();if(event.key==='ArrowLeft')originX-=10;if(event.key==='ArrowRight')originX+=10;if(event.key==='ArrowUp')originY-=10;if(event.key==='ArrowDown')originY+=10;
  originX=Math.max(0,Math.min(100,originX));originY=Math.max(0,Math.min(100,originY));position();
 });
 showPantone(colors.navy[2],buttons.find(b=>b.dataset.color==='navy'));
 apply();
})();
