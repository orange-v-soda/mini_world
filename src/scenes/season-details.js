import * as T from 'three';

// Seasonal additions share their owner's materials and are disposed with the root.
export function seasonDetails(season, kit) {
  const { root, mesh, sphere, branch, leaf, random, ripple } = kit;
  const moving = [];
  if (season === 'summer') {
    // Cupped lotus leaves collect beads; flowers sit above the warm rain.
    for (let i = 0; i < 8; i++) {
      const x = .1 + random() * 2.2, z = -.4 + random() * 1.7;
      const g = new T.Group(); g.position.set(x, .055, z); root.add(g);
      branch([[0,0,0],[.03,.35,0],[.08,.55,0]], .016, '#528755', g);
      const pad = mesh(new T.ConeGeometry(.34,.085,32,1,true), '#45996c', [.08,.54,0], [1,1,1], g, {side:T.DoubleSide,roughness:.25});
      for(let j=0;j<8;j++) {
        const a=j*Math.PI/4;
        branch([[.08,.59,0],[.08+Math.cos(a)*.29,.51,Math.sin(a)*.29]],.004,'#95bd79',g);
      }
      const bead=sphere([.18,.56,.06],[.035,.025,.035],'#dafff1',g,{roughness:.05,metalness:.3});
      if(i<4) {
        branch([[.15,0,.15],[.2,.8,.15]],.012,'#4d9768',g);
        for(let j=0;j<10;j++) {
          const a=j*Math.PI/5;
          const p=sphere([.2+Math.cos(a)*.09,.82,.15+Math.sin(a)*.09],[.055,.14,.035],j%2?'#f2bbca':'#f9e2dd',g);
          p.rotation.z=-Math.cos(a)*.6;p.rotation.x=Math.sin(a)*.6;
        }
        sphere([.2,.85,.15],[.05,.05,.05],'#ebcf63',g);
      }
      bead.userData.dynamic = true; pad.userData.dynamic = true;
      moving.push(t=>{g.rotation.z=Math.sin(t*1.3+i)*.028;bead.position.x=.18+Math.sin(t*.9+i)*.07;pad.rotation.z=Math.sin(t+i)*.025;});
    }
    // Hydrangea clusters: small flowers, individual wet leaves and drips.
    for(let i=0;i<9;i++) {
      const x=-3.9+random()*1.1,z=1.6+random()*1.8;
      branch([[x,.05,z],[x,.65,z]],.025,'#49855e');
      for(let j=0;j<18;j++) {
        const a=random()*6.28,r=random()*.23;
        sphere([x+Math.cos(a)*r,.65+random()*.18,z+Math.sin(a)*r],[.06,.045,.06],i%2?'#899ed8':'#b2b2e7');
      }
      for(const side of [-1,1]) mesh(leaf,'#36845b',[x+side*.15,.4,z],[.22,.035,.1]).rotation.z=side*.4;
    }
    // Frog beneath the reeds, with raised eyes and toes on a bank stone.
    sphere([3.6,.19,.8],[.3,.17,.23],'#899c83');
    sphere([3.6,.39,.8],[.14,.1,.16],'#76a256');
    for(const x of [3.51,3.69]) {
      sphere([x,.46,.89],[.055,.055,.05],'#9fba67');sphere([x,.47,.929],[.021,.029,.012],'#263b2e');
      sphere([x,.3,.92],[.085,.025,.06],'#779c55');
    }
  }
  if (season === 'autumn') {
    // Wet leaf litter and tumbling leaves retain distinct blade and vein geometry.
    const colors=['#c8793f','#d8a94f','#aa5538','#b89255'];
    function fallen(x,y,z,i,parent=root) {
      const g=new T.Group();g.position.set(x,y,z);parent.add(g);
      const blade=mesh(leaf,colors[i%4],[0,0,0],[.09,.013,.18],g,{roughness:.23});
      branch([[0,.015,-.2],[0,.018,.15]],.005,'#735940',g);
      for(const side of [-1,1]) for(let k=0;k<3;k++) branch([[0,.017,-.1+k*.07],[side*.06,.019,-.04+k*.07]],.0025,'#e0b66a',g);
      return {g,blade};
    }
    for(let i=0;i<95;i++) {
      const x=(random()-.5)*9,z=(random()-.5)*9;
      if(Math.hypot(x,z)>5 || ((x-1.25)/2.8)**2+((z-.5)/2)**2<1) continue;
      fallen(x,.1,z,i).g.rotation.y=random()*6;
    }
    for(let i=0;i<14;i++) {
      const {g}=fallen(0,0,0,i);const phase=random(),x=-3.7+random()*2,z=-2.5+random()*2;
      moving.push(t=>{const f=(t*.12+phase)%1;g.position.set(x+Math.sin(t+i)*.28+f*.8,.12+(1-f)*3.1,z+f*.8);g.rotation.set(Math.sin(t+i)*.6,t*.6+i,Math.cos(t*.8+i)*.45);});
    }
    for(let i=0;i<6;i++) {
      const {g}=fallen(.5+i*.35,.065,.5+Math.sin(i)*.5,i);
      moving.push(t=>{g.rotation.y=t*.1+i;g.position.y=.065+Math.sin(t+i)*.005;});
    }
    // Rain-darkened log, bracket mushrooms, chestnuts and dry seed heads.
    branch([[-3.9,.2,-.1],[-3.1,.22,.25],[-2.9,.25,.35]],.18,'#665344');
    for(let i=0;i<11;i++) {
      const x=-4+random(),z=-.4+random()*.9;
      branch([[x,.06,z],[x,.25,z]],.018,'#d8c7a0');
      sphere([x,.26,z],[.11,.065,.11],i%2?'#bf8957':'#caaa76');
      sphere([x-.02,.315,z+.02],[.012,.008,.012],'#eef7df');
    }
    for(let i=0;i<18;i++) {
      const x=1.5+random()*1.5,z=2.65+random()*.35;
      branch([[x,0,z],[x+.1,.8,z]],.009,'#a29462');
      sphere([x+.1,.82,z],[.035,.13,.04],'#9c835e');
    }
    for(let i=0;i<8;i++)sphere([-2.9+random()*.5,.1,1+random()*.6],[.055,.04,.05],'#895136');
  }
  if (season === 'winter') {
    // A late-winter thaw: cold rain falls into open water between shore ice.
    for(let i=0;i<24;i++) {
      const a=i/24*Math.PI*2;
      const ice=mesh(new T.CylinderGeometry(.28,.32,.025,5),'#b2ced0',[1.25+Math.cos(a)*2.42,.065,.5+Math.sin(a)*1.67],[1,1,.65],root,{roughness:.16,metalness:.2});ice.rotation.y=i;
    }
    for(let i=0;i<40;i++) {
      const a=random()*6.28,r=4+random();
      sphere([Math.cos(a)*r,.08,Math.sin(a)*r],[.2+random()*.2,.04,.15],'#d5dfd8');
    }
    // Frost-edged bench slats and icicles with actual melting drops.
    for(let i=0;i<4;i++) mesh(new T.BoxGeometry(1.6,.025,.1),'#d5e1dd',[2.1,.675,-3.4+i*.18]);
    for(let i=0;i<9;i++) {
      const x=1.4+i*.17,h=.09+random()*.12;
      const icicle=mesh(new T.ConeGeometry(.025,h,6),'#bcdde0',[x,.62-h/2,-2.83],[1,1,1],root,{roughness:.1});icicle.rotation.z=Math.PI;
      const drop=sphere([x,.4,-2.83],[.021,.033,.021],'#d5f0ef',root,{roughness:.05});
      drop.userData.dynamic = true;
      const ring=ripple(x,-2.83,root,.085);
      moving.push(t=>{const f=(t*.43+i*.13)%1;drop.visible=f<.8;drop.position.y=.62-h-Math.pow(f/.8,2)*(.54-h);ring.scale.setScalar(.01+Math.max(0,f-.8)*.7);ring.material.opacity=f>.8?(1-f)*2:0;});
    }
    // Red berries punctuate dormant shrubs, snowdrops nod beside the path.
    for(let i=0;i<8;i++) {
      const x=-3.7+random()*1.2,z=1.8+random();
      const g=new T.Group();g.position.set(x,.05,z);root.add(g);
      branch([[0,0,0],[.03,.5,0],[.2,.8,0]],.016,'#776a61',g);
      for(let j=0;j<4;j++) {
        branch([[.02,.3+j*.1,0],[-.2,.5+j*.1,.05]],.008,'#776a61',g);
        sphere([-.2,.5+j*.1,.05],[.035,.035,.035],'#bb5350',g);
      }
      moving.push(t=>{g.rotation.z=Math.sin(t*.8+i)*.025;});
    }
    for(let i=0;i<10;i++) {
      const x=-2.8+random()*.5,z=3.1+random()*.5;
      branch([[x,0,z],[x,.3,z],[x+.1,.33,z],[x+.14,.27,z]],.009,'#658678');
      for(let j=0;j<3;j++)sphere([x+.14+Math.cos(j*2.1)*.025,.24,z+Math.sin(j*2.1)*.025],[.025,.065,.023],'#e9eee3');
    }
  }
  return time => moving.forEach(update => update(time));
}
