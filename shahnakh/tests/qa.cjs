const {JSDOM}=require('jsdom'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;};
const source=f=>fs.readFileSync(path.join(root,f),'utf8');
function setup(lang='fa',endpoint=''){
 const dom=new JSDOM(source(lang==='en'?'en.html':'index.html'),{url:'https://example.test/portfolio/'+(lang==='en'?'en.html':'index.html'),runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;const media=new w.EventTarget();media.matches=true;w.matchMedia=()=>media;w.SHAHNAKH_FABRIC_MESH=true;w.SHAHNAKH_CONFIG={enquiryEndpoint:endpoint};
 const frames=new Map();let id=0,time=100;w.requestAnimationFrame=fn=>{frames.set(++id,fn);return id;};w.cancelAnimationFrame=id=>frames.delete(id);
 Object.defineProperty(w,'isSecureContext',{value:true,configurable:true});w.DeviceOrientationEvent=function(){};
 Object.defineProperty(w.screen,'orientation',{value:Object.assign(new w.EventTarget(),{angle:0})});
 w.navigator.clipboard={writeText:async text=>w.copied=text};
 return {dom,w,d:w.document,media,frames,run(file){w.eval(source('assets/'+file));},flush(){for(let k=0;k<80&&frames.size;k++){const items=[...frames.values()];frames.clear();time+=16.667;items.forEach(fn=>fn(time));}}};
}
const settle=async()=>{for(let i=0;i<10;i++)await Promise.resolve();};
async function main(){
 for(const lang of ['fa','en']){
  const t=setup(lang),{w,d}=t;
  const ids=[...d.querySelectorAll('[id]')].map(e=>e.id);ok(new Set(ids).size===ids.length,'unique IDs');ok(d.documentElement.dir===(lang==='en'?'ltr':'rtl'),'language direction');
  for(const el of d.querySelectorAll('[src],link[href]')){const ref=el.getAttribute('src')||el.getAttribute('href');if(!/^(https?:|#|data:)/.test(ref))ok(fs.existsSync(path.join(root,ref)),ref);}
  for(const el of d.querySelectorAll('a[href^="#"]'))ok(d.querySelector(el.getAttribute('href')),'anchor destination');
  for(const input of d.querySelectorAll('input:not([type=hidden])'))ok(input.getAttribute('aria-label')||d.querySelector(`label[for="${input.id}"]`),'input label');
  if(lang==='en'){
   const copy=d.body.cloneNode(true);copy.querySelectorAll('script,.language-switch').forEach(e=>e.remove());ok(!/[\u0600-\u06ff]/.test(copy.textContent),'English visible copy translated');
   for(const e of d.querySelectorAll('[alt],[placeholder],[aria-label]'))if(!e.matches('.language-switch'))ok(!/[\u0600-\u06ff]/.test([e.alt,e.placeholder,e.getAttribute('aria-label')].join('')),'English attributes');
  }
  t.run(lang==='en'?'palette.en.js':'palette.js');t.run(lang==='en'?'app.en.js':'app.js');t.run('experience.js');
  const buttons=[...d.querySelectorAll('.swatch')];
  for(const b of buttons){b.click();ok(b.getAttribute('aria-pressed')==='true','swatch active');ok(d.querySelectorAll('.swatch.active').length===1,'single active');ok(/TCX/.test(d.getElementById('enquiry-color').value),'form colour');}
  const code=d.getElementById('custom-hex');code.value='۱۱-۰۶۰۸ TCX';code.dispatchEvent(new w.Event('change'));ok(d.getElementById('custom-color').value==='#eee5d4','Persian code entry');
  const prior=d.getElementById('enquiry-color').value;code.value='99-9999 TCX';code.dispatchEvent(new w.Event('change'));ok(d.getElementById('enquiry-color').value===prior,'unknown code preserves selection');
  const picker=d.getElementById('custom-color');picker.value='#008f72';picker.dispatchEvent(new w.Event('input'));ok(code.value==='17-5641 TCX','custom matching');
  d.getElementById('copy-color').click();await settle();ok(w.copied==='PANTONE 17-5641 TCX','clipboard');
  w.navigator.clipboard.writeText=async()=>{throw Error('denied');};d.getElementById('copy-color').click();await settle();ok(d.activeElement===code,'clipboard fallback');
  const zoom=d.getElementById('texture-zoom');zoom.value='2';zoom.dispatchEvent(new w.Event('input'));ok(d.querySelector('.palette-art').classList.contains('zoomed'),'zoom');
  const form=d.getElementById('enquiry-form');form.dispatchEvent(new w.Event('submit',{cancelable:true}));ok(d.getElementById('full-name').getAttribute('aria-invalid')==='true','required validation');
  for(const [name,value] of Object.entries({fullName:'QA Name',brandName:'QA Brand',mobile:'۰۹۱۲۳۴۵۶۷۸۹',fabric:'Fleece',monthlyKg:'۵۰۰'}))form.elements.namedItem(name).value=value;
  let network=0;w.fetch=async()=>{network++;};form.dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();ok(network===0,'no fake request with empty endpoint');ok(!d.getElementById('form-status').hidden,'no endpoint status');
  const motion=d.getElementById('motion-toggle');motion.click();await settle();ok(motion.getAttribute('aria-pressed')==='false','reduced motion blocks sensor');
  t.media.matches=false;w.DeviceOrientationEvent.requestPermission=async()=>'denied';motion.click();await settle();ok(motion.getAttribute('aria-pressed')==='false','permission denied');
  w.DeviceOrientationEvent.requestPermission=async()=>'granted';let value=0;w.addEventListener('shahnakh:tilt',e=>value=e.detail);motion.click();await settle();ok(motion.getAttribute('aria-pressed')==='true','permission granted');
  const orientation=(beta,gamma)=>{const event=new w.Event('deviceorientation');Object.assign(event,{beta,gamma});w.dispatchEvent(event);};
  orientation(30,0);orientation(30,20);ok(value>.5&&value<=1,'right tilt');orientation(30,-80);ok(value===-1,'bounded left tilt');
  w.screen.orientation.angle=90;w.screen.orientation.dispatchEvent(new w.Event('change'));orientation(30,0);orientation(50,0);ok(value>.5,'landscape tilt');
  motion.click();ok(value===0&&motion.getAttribute('aria-pressed')==='false','disable resets pose');orientation(20,30);ok(value===0,'listener removed');
  Object.defineProperty(w,'isSecureContext',{value:false,configurable:true});motion.click();await settle();ok(motion.getAttribute('aria-pressed')==='false','insecure context gracefully unavailable');Object.defineProperty(w,'isSecureContext',{value:true,configurable:true});
  let timedOut;w.setTimeout=fn=>{timedOut=fn;return 1;};w.clearTimeout=()=>{};motion.click();await settle();timedOut();ok(motion.getAttribute('aria-pressed')==='false','missing sensor timeout');
  if(lang==='en'){for(const id of ['color-help','color-name','form-status','motion-status'])ok(!/[\u0600-\u06ff]/.test(d.getElementById(id).textContent),'dynamic English '+id);}
  t.dom.window.close();
 }
 for(const success of [false,true]){
  const t=setup('en','https://example.test/enquiries'),{w,d}=t;t.run('palette.en.js');t.run('app.en.js');
  const form=d.getElementById('enquiry-form');for(const [n,v] of Object.entries({fullName:'QA Name',brandName:'QA Brand',mobile:'+98 9123456789',fabric:'Fleece',monthlyKg:'500'}))form.elements.namedItem(n).value=v;
  let payload;w.fetch=async(url,opts)=>{payload=JSON.parse(opts.body);return {ok:success,json:async()=>({success})};};
  form.dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();ok(payload.mobile==='09123456789'&&payload.monthlyKg===500,'normalization');ok(payload.selectedColor.includes('TCX'),'payload code');ok(d.querySelector('button[type=submit]').disabled===false,'submit restored');ok(form.elements.fullName.value===(success?'':'QA Name'),'success reset or failure preserves input');t.dom.window.close();
 }
 // Execute the real Three.js scene and geometry with a renderer stub (no GPU claim).
 for(const [width,height] of [[390,740],[820,1000],[1440,900]]){
  const t=setup(),{w,d}=t;t.media.matches=false;
  Object.defineProperty(w,'innerWidth',{value:width});Object.defineProperty(w,'innerHeight',{value:height});
  const surface=d.querySelector('.hero-curtain'),stage=d.querySelector('.hero-stage');
  Object.defineProperty(surface,'clientWidth',{value:width});Object.defineProperty(surface,'clientHeight',{value:height});Object.defineProperty(stage,'offsetHeight',{value:height*2});let scroll=0;stage.getBoundingClientRect=()=>({top:-scroll,bottom:height*2-scroll});
  t.run('three-local.js');const THREE=w.THREE;let rendered;
  class Renderer{constructor(){this.domElement=d.createElement('canvas');this.shadowMap={};this.capabilities={getMaxAnisotropy:()=>8};}setClearColor(){}setPixelRatio(){}setSize(){}render(scene,camera){rendered={scene,camera};}}
  w.THREE={...THREE,WebGLRenderer:Renderer};t.run('cloth-motion.js');t.run('cloth-scene.js');t.flush();
  ok(!!rendered,'scene rendered through adapter');
  for(const p of [0,.25,.65,1,.4,0]){scroll=p*height;w.dispatchEvent(new w.Event('scroll'));t.flush();for(const mesh of rendered.scene.children.filter(o=>o.isMesh)){const pos=mesh.geometry.attributes.position.array;ok(pos.every(Number.isFinite),'finite scene geometry');}}
  const hem=rendered.scene.children.filter(o=>o.isMesh).find(o=>o.geometry.attributes.position.count===(width<700?57:89)*2);ok(!!hem,'thin strip, not tube');
  w.dispatchEvent(new w.CustomEvent('shahnakh:tilt',{detail:1}));t.flush();ok(hem.position.x>.1,'sensor moves rendered fabric');
  const canvas=d.querySelector('canvas');canvas.dispatchEvent(new w.Event('webglcontextlost',{cancelable:true}));ok(!w.SHAHNAKH_FABRIC_MESH&&!surface.classList.contains('mesh-active'),'context loss restores fallback');canvas.dispatchEvent(new w.Event('webglcontextrestored'));t.flush();ok(w.SHAHNAKH_FABRIC_MESH&&surface.classList.contains('mesh-active'),'context restore resumes scene');
  t.dom.window.close();
 }
 console.log(`PASS ${checks} assertions: FA/EN DOM, assets, controls, form success/failure, reduced motion, sensor permission/portrait/landscape/stop, Three.js geometry at phone/tablet/desktop sizes. GPU and real-device tests not covered.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
