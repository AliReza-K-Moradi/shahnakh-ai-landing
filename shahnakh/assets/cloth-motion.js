/* Reversible, bounded 3D drape. Each pose is derived from scroll, never from a
   previous folded state. Columns remain ordered to prevent self-intersection. */
(function(root){
 class ClothMotion{
  constructor(width,height,cols=40,rows=28){this.width=width;this.height=height;this.cols=cols;this.rows=rows;this.count=(cols+1)*(rows+1);this.positions=new Float32Array(this.count*3);this.step(0,0,.55);}
  step(dt,progress,grip){
   const p=Math.max(0,Math.min(1,progress)),t=Math.sin(p*Math.PI),w=this.width,h=this.height;
   for(let row=0;row<=this.rows;row++)for(let col=0;col<=this.cols;col++){
    const u=col/this.cols,v=row/this.rows,i=(row*(this.cols+1)+col)*3;
    const near=Math.exp(-(u-grip)*(u-grip)*7),fold=Math.sin(u*Math.PI*6+v*.8+p*.7);
    this.positions[i]=(u-.5)*w*(1-.16*t)+(grip-.5)*w*t*.08;
    // Local, bounded edge relaxation: no accumulated forces or reversing rows.
    const edge=Math.pow(v,12),ripple=Math.sin(u*31+p*1.8)+.32*Math.sin(u*73+.6);
    const corner=Math.pow(Math.abs(u-.5)*2,8);
    this.positions[i+1]=h*.56-v*h+p*h*1.55+near*t*h*(.12+.08*v*v)+t*h*.012*Math.sin(u*13+v*2)+edge*h*(.0025*ripple+.008*t*corner);
    this.positions[i+2]=(.11+.09*t)*fold+.035*Math.sin(u*13-v*3)+near*t*.28*v*v+.009*Math.sin(u*29+v*6)*v*v*t;
   }
   return 0;
  }
 }
 if(typeof module==='object'&&module.exports)module.exports=ClothMotion;else root.ShahnakhClothSolver=ClothMotion;
})(typeof window!=='undefined'?window:globalThis);
