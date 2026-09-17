const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=process.env.SHAHNAKH_ROOT||path.resolve(__dirname,'..');const m={exports:{}};new Function('module',fs.readFileSync(path.join(root,'assets/cloth-motion.js'),'utf8'))(m);
for(const width of [2,4,7])for(const grip of [.15,.55,.85]){
 const cloth=new m.exports(width,4.2,88,48);cloth.step(0,.37,grip);const baseline=Array.from(cloth.positions);
 for(let cycle=0;cycle<20;cycle++)for(let k=0;k<=20;k++){
  const p=cycle%2?1-k/20:k/20;cloth.step(.016,p,grip);const a=cloth.positions;
  for(let row=0;row<=48;row++)for(let col=0;col<=88;col++){const i=(row*89+col)*3;
   if(!Number.isFinite(a[i]+a[i+1]+a[i+2]))throw Error('Nonfinite geometry');
   if(col&&a[i]<=a[i-3])throw Error('Inverted column');
   if(row&&a[i+1]>=a[i-267+1])throw Error('Inverted row');
  }
 }
 cloth.step(0,.37,grip);assert.deepEqual(Array.from(cloth.positions),baseline);
}
console.log('PASS: 20 alternating scroll passes, 3 viewport proportions, 3 grip positions; ordered finite geometry and deterministic return.');
