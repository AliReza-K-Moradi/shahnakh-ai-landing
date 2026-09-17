(() => {
 'use strict';
 if(!window.THREE||!window.ShahnakhClothSolver)return;
 const T=window.THREE,stage=document.querySelector('.hero-stage'),surface=document.querySelector('.hero-curtain');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let renderer,contextLost=false;
 try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch{return;}
 renderer.setClearColor(0x000000,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.domElement.className='fabric-mesh cloth-three';renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,30);camera.position.set(0,0,6);
 scene.add(new T.HemisphereLight(0xe7efff,0x394052,1.65));
 const key=new T.DirectionalLight(0xfff4e5,3.2);key.position.set(-3,4,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=10;key.shadow.camera.bottom=-5;key.shadow.bias=-.0003;key.shadow.normalBias=.025;scene.add(key);
 key.shadow.normalBias=.006;key.shadow.radius=3;
 const fill=new T.DirectionalLight(0xc0d3ed,.8);fill.position.set(4,-1,3);scene.add(fill);
 const rim=new T.DirectionalLight(0xe2ebff,.85);rim.position.set(2,3,-2);scene.add(rim);
 const receiver=new T.Mesh(new T.PlaneGeometry(30,30),new T.ShadowMaterial({opacity:.18}));receiver.position.z=-.65;receiver.receiveShadow=true;scene.add(receiver);
 // Fine knit relief is a material bump, not a photograph containing static folds.
 const size=256,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size*16*Math.PI*2,v=y/size*16*Math.PI*2;
  const stitch=Math.cos(u+.65*Math.sin(v))*.5+.5;
  const value=Math.round(110+stitch*65+Math.cos(v)*12),i=(y*size+x)*4;
  data[i]=data[i+1]=data[i+2]=value;data[i+3]=255;
 }
 const bump=new T.DataTexture(data,size,size);bump.wrapS=bump.wrapT=T.RepeatWrapping;bump.needsUpdate=true;
 const front=new T.MeshPhysicalMaterial({color:0x263b64,roughness:.94,metalness:0,sheen:.32,sheenColor:0x8b9bb5,sheenRoughness:1,bumpMap:bump,bumpScale:.007,side:T.FrontSide});
 // Native-resolution yarn maps; keep relief linear and independent of base-color decoding.
 function materialTexture(image,x,y){
  const texture=new T.Texture(image);texture.wrapS=texture.wrapT=T.MirroredRepeatWrapping;
  texture.repeat.set(x,y);texture.colorSpace=T.SRGBColorSpace;
  texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());texture.needsUpdate=true;
  const relief=texture.clone();relief.colorSpace=T.NoColorSpace;relief.needsUpdate=true;
  return {texture,relief};
 }
 const faceImage=new Image();faceImage.onload=()=>{const {texture,relief}=materialTexture(faceImage,Math.max(2,camera.aspect*4),4);front.map=texture;front.bumpMap=relief;front.bumpScale=.012;front.color.set(0x8394b4);front.needsUpdate=true;wake();};faceImage.src=window.SHAHNAKH_CLOTH_FACE;
 const back=new T.MeshPhysicalMaterial({color:0x8e9fb7,roughness:1,sheen:.2,sheenColor:0x8d9cb4,sheenRoughness:1,side:T.BackSide});
 const backImage=new Image();backImage.onload=()=>{const {texture,relief}=materialTexture(backImage,3,3);back.map=texture;back.bumpMap=relief;back.bumpScale=.018;back.color.set(0xffffff);back.needsUpdate=true;wake();};backImage.src=window.SHAHNAKH_CLOTH_TEXTURE;
 // A thin cut-face strip adds thickness without a rolled or tubular silhouette.
 // It follows the cloth normals, so thickness stays attached throughout the lift.
 const hemMaterial=new T.MeshPhysicalMaterial({color:0x32496c,roughness:1,sheen:.42,sheenColor:0x9baac0,sheenRoughness:1,bumpMap:bump,bumpScale:.004,side:T.DoubleSide});
 let hemGeometry,hemMesh,tilt=0,targetTilt=0;
 function updateHem(){
  const pos=geometry.attributes.position.array,norm=geometry.attributes.normal.array,out=hemGeometry.attributes.position.array;
  for(let col=0;col<=solver.cols;col++){
   const i=(solver.rows*(solver.cols+1)+col)*3,above=i-(solver.cols+1)*3;
   const tangent=new T.Vector3(pos[above]-pos[i],pos[above+1]-pos[i+1],pos[above+2]-pos[i+2]).normalize();
   const radius=.002*(1+.1*Math.sin(col*2.37));
   for(let ring=0;ring<2;ring++){
    const side=ring===0?-1:1,j=(col*2+ring)*3;
    for(let axis=0;axis<3;axis++)out[j+axis]=pos[i+axis]+norm[i+axis]*side*radius-tangent.getComponent(axis)*.001;
   }
  }
  hemGeometry.attributes.position.needsUpdate=true;hemGeometry.computeVertexNormals();
 }
 let solver,geometry,frontMesh,backMesh,progress=0,grip=.55,targetGrip=.55,last=0,frame=0,activeUntil=0,age=0,ready=false;
 const copies=[...surface.querySelectorAll('.hero-content,.hero-bottom')];
 function resize(){
  const w=surface.clientWidth,h=surface.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
  const height=2*Math.tan(35*Math.PI/360)*6;
  const mobile=w<700,cols=mobile?56:88,rows=48;
  const shadowSize=mobile?1024:2048;
  if(key.shadow.mapSize.x!==shadowSize){key.shadow.mapSize.set(shadowSize,shadowSize);if(key.shadow.map){key.shadow.map.dispose();key.shadow.map=null;}}
  key.shadow.camera.left=-height*camera.aspect;key.shadow.camera.right=height*camera.aspect;
  key.shadow.camera.top=height*1.8;key.shadow.camera.bottom=-height;key.shadow.camera.updateProjectionMatrix();
  solver=new window.ShahnakhClothSolver(height*camera.aspect*1.13,height*1.13,cols,rows);
  if(frontMesh){scene.remove(frontMesh,backMesh,hemMesh);geometry.dispose();hemGeometry.dispose();}
  geometry=new T.PlaneGeometry(solver.width,solver.height,cols,rows);
  geometry.attributes.position.setUsage(T.DynamicDrawUsage);
  hemGeometry=new T.BufferGeometry();hemGeometry.setAttribute('position',new T.BufferAttribute(new Float32Array((cols+1)*2*3),3).setUsage(T.DynamicDrawUsage));
  const hemUV=new Float32Array((cols+1)*2*2);for(let c=0;c<=cols;c++)for(let q=0;q<2;q++){const i=(c*2+q)*2;hemUV[i]=c/cols;hemUV[i+1]=q*.005;}hemGeometry.setAttribute('uv',new T.BufferAttribute(hemUV,2));
  const hemIndices=[];for(let c=0;c<cols;c++){const a=c*2,b=a+2;hemIndices.push(a,b,a+1,b,b+1,a+1);}hemGeometry.setIndex(hemIndices);
  hemMesh=new T.Mesh(hemGeometry,hemMaterial);hemMesh.castShadow=true;hemMesh.frustumCulled=false;scene.add(hemMesh);
  bump.repeat.set(Math.max(2,camera.aspect*4),4);
  if(front.map)front.map.repeat.set(Math.max(2,camera.aspect*4),4);
  if(front.bumpMap)front.bumpMap.repeat.set(Math.max(2,camera.aspect*4),4);
  frontMesh=new T.Mesh(geometry,front);backMesh=new T.Mesh(geometry,back);frontMesh.castShadow=backMesh.castShadow=true;frontMesh.receiveShadow=backMesh.receiveShadow=true;frontMesh.frustumCulled=backMesh.frustumCulled=false;scene.add(frontMesh,backMesh);
  progress=target();solver.step(0,progress,grip);
  wake();
 }
 function target(){return Math.max(0,Math.min(1,-stage.getBoundingClientRect().top/Math.max(1,stage.offsetHeight-surface.clientHeight)));}
 function wake(){activeUntil=performance.now()+2200;if(!frame&&!document.hidden)frame=requestAnimationFrame(draw);}
 function draw(now){
  frame=0;if(contextLost)return;const dt=Math.min(.034,last?(now-last)/1000:1/60);last=now;age+=dt;
  if(reduced.matches){surface.classList.remove('mesh-active');copies.forEach(el=>{el.style.visibility='';});surface.style.removeProperty('--copy-opacity');return;}
  const goal=target(),old=progress;progress+=(goal-progress)*(1-Math.exp(-dt/ .14));grip+=(targetGrip-grip)*(1-Math.exp(-dt/.2));
  if(Math.abs(goal-progress)<.0001)progress=goal;
  const energy=Math.min(1,Math.abs(progress-old)/Math.max(dt,.001));
  const steps=Math.max(1,Math.ceil(dt/(1/120)));for(let i=0;i<steps;i++)solver.step(dt/steps,progress,grip,energy,age);
  geometry.attributes.position.array.set(solver.positions);geometry.attributes.position.needsUpdate=true;geometry.computeVertexNormals();updateHem();
  // A small camera response gives true parallax, while leaving the copy stable.
  camera.position.x=(grip-.5)*Math.sin(progress*Math.PI)*.13;camera.lookAt(0,0,0);
  tilt+=(targetTilt-tilt)*(1-Math.exp(-dt/.18));
  for(const mesh of [frontMesh,backMesh,hemMesh]){mesh.rotation.z=-tilt*.025;mesh.position.x=tilt*.12;}
  renderer.render(scene,camera);
  if(!ready){surface.prepend(renderer.domElement);ready=true;window.SHAHNAKH_FABRIC_MESH=true;}
  surface.classList.add('mesh-active');const opacity=Math.max(0,1-progress/.12);surface.style.setProperty('--copy-opacity',opacity);surface.style.setProperty('--copy-lift',`${-progress*100}px`);copies.forEach(el=>{el.style.visibility=opacity===0?'hidden':'';});surface.style.pointerEvents=progress>.12?'none':'';
  if(Math.abs(goal-progress)>.0001||Math.abs(targetGrip-grip)>.0001||Math.abs(targetTilt-tilt)>.0001)frame=requestAnimationFrame(draw);
 }
 window.addEventListener('shahnakh:tilt',event=>{targetTilt=reduced.matches?0:Math.max(-1,Math.min(1,Number(event.detail)||0));if(Math.abs(stage.getBoundingClientRect().top)<stage.offsetHeight)wake();});
 window.addEventListener('scroll',wake,{passive:true});window.addEventListener('resize',resize,{passive:true});
 stage.addEventListener('pointerdown',e=>{if(!e.target.closest('a,button,input')){targetGrip=Math.max(.15,Math.min(.85,e.clientX/innerWidth));wake();}},{passive:true});
 reduced.addEventListener('change',()=>{surface.style.pointerEvents='';wake();});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else wake();});
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;window.SHAHNAKH_FABRIC_MESH=false;window.dispatchEvent(new CustomEvent('shahnakh:renderer-state',{detail:false}));surface.classList.remove('mesh-active');surface.style.pointerEvents='';copies.forEach(el=>{el.style.visibility='';});surface.style.setProperty('--copy-opacity','1');surface.style.setProperty('--copy-lift','0px');cancelAnimationFrame(frame);frame=0;});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{contextLost=false;window.SHAHNAKH_FABRIC_MESH=true;last=0;wake();});
 window.SHAHNAKH_FABRIC_MESH=true; // Claim animation before the next deferred script, avoiding two competing scroll transforms.
 resize();
})();
