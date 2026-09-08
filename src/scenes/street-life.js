import * as T from 'three';

// Characters and traffic own their geometry, materials, and animation transforms.
export function addStreetLife(root) {
  const materials=new Map(), geometries=new Map();
  const material=c=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.7}));return materials.get(c);};
  const geo=(key,fn)=>{if(!geometries.has(key))geometries.set(key,fn());return geometries.get(key);};
  function mesh(parent,g,c,x=0,y=0,z=0){const m=new T.Mesh(g,material(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function ball(p,c,x,y,z,sx,sy=sx,sz=sx){const m=mesh(p,geo('sphere',()=>new T.SphereGeometry(1,16,12)),c,x,y,z);m.scale.set(sx,sy,sz);return m;}
  function box(p,c,x,y,z,w,h,d){const m=mesh(p,geo('box',()=>new T.BoxGeometry(1,1,1)),c,x,y,z);m.scale.set(w,h,d);return m;}
  function rod(p,c,a,b,r){const v=new T.Vector3(...b).sub(new T.Vector3(...a));const mid=new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(.5);const m=mesh(p,geo('rod',()=>new T.CylinderGeometry(1,1,1,12)),c,...mid.toArray());m.scale.set(r,v.length(),r);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m;}
  function group(parent,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
  function cat({fur,shirt,pants,x,z,angle,female}) {
    const actor=group(root,x,.27,z);actor.rotation.y=angle;
    const body=group(actor);
    // Shoes, trouser legs, tailored torso and collar.
    for(const side of [-1,1]){
      ball(body,'#383e3d',side*.105,.065,.055,.09,.065,.15);
      ball(body,pants,side*.105,.29,0,.084,.24,.09);
    }
    ball(body,shirt,0,.66,0,.22,.29,.135);
    box(body,pants,0,.45,0,.33,.12,.22);
    for(const side of [-1,1]){const collar=box(body,'#eee2c9',side*.055,.9,.115,.085,.11,.025);collar.rotation.z=side*.4;}
    for(let i=0;i<3;i++)ball(body,'#d7bd8c',0,.82-i*.095,.139,.013);
    if(female){
      // Coral cardigan, small shoulder bag, simple pleated skirt.
      const skirt=mesh(body,geo('skirt',()=>new T.CylinderGeometry(.15,.235,.24,16)),'#426c70',0,.44,0);
      for(let i=0;i<12;i++){const a=i*Math.PI/6;rod(body,'#365e62',[Math.sin(a)*.158,.55,Math.cos(a)*.158],[Math.sin(a)*.226,.33,Math.cos(a)*.226],.008);}
      rod(body,'#73513b',[-.16,.86,.12],[.22,.48,.15],.018);
      box(body,'#b48957',.23,.48,.07,.16,.19,.12);
      box(body,'#d8b979',.23,.52,.139,.1,.07,.012);
    }else{
      // Rolled shirt sleeves and watch make the male cat a casual coffee customer.
      box(body,'#a9b9a4',-.105,.72,.137,.08,.09,.018);
    }
    const head=group(body,0,1.08,0);
    ball(head,fur,0,0,0,.235,.225,.185);
    for(const side of [-1,1]){
      const ear=mesh(head,geo('ear',()=>new T.ConeGeometry(.105,.25,3)),fur,side*.155,.205,-.012);ear.rotation.z=-side*.22;
      const inner=mesh(head,geo('inner',()=>new T.ConeGeometry(.06,.16,3)),'#dc9c9e',side*.155,.22,.035);inner.rotation.z=-side*.22;
      ball(head,female?'#fbf5e8':'#f4d5a0',side*.067,-.07,.155,.087,.065,.054);
      ball(head,'#e3d5b4',side*.089,.025,.165,.06,.067,.023);
      ball(head,female?'#638d9e':'#769052',side*.089,.025,.185,.033,.044,.012);
      ball(head,'#202e30',side*.089,.025,.196,.012,.036,.007);
      ball(head,'#fffdf0',side*.081,.04,.202,.008);
      for(let i=0;i<3;i++)rod(head,'#635c53',[side*.10,-.072-i*.016,.19],[side*.29,-.055-i*.037,.19],.003);
    }
    ball(head,'#c78786',0,-.068,.207,.027,.019,.019);
    rod(head,'#725854',[0,-.085,.205],[0,-.112,.202],.004);
    for(const side of [-1,1])rod(head,'#725854',[0,-.112,.202],[side*.035,-.121,.19],.004);
    if(!female){
      for(let i=-1;i<=1;i++){const stripe=ball(head,'#aa602c',i*.065,.125,.147,.02,.071,.014);stripe.rotation.z=-i*.22;}
      for(const side of [-1,1])for(let i=0;i<2;i++)ball(head,'#b76c31',side*.203,-.012-i*.045,.08,.024,.014,.071);
    }else{
      const bow=group(head,.17,.13,.13);
      for(const side of [-1,1])ball(bow,'#ba6c63',side*.045,0,0,.046,.027,.022);
      ball(bow,'#e3b18e',0,0,.01,.021);
    }
    const tail=group(body,0,.47,-.08);
    const curve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(.10,.02,-.23),new T.Vector3(.28,.15,-.35),new T.Vector3(.32,.38,-.33),new T.Vector3(.26,.47,-.29)]);
    mesh(tail,new T.TubeGeometry(curve,24,.045,8,false),fur);
    if(!female)for(let i=0;i<4;i++){const p=curve.getPoint(.3+i*.17);ball(tail,'#b76c31',p.x,p.y,p.z,.048);}
    const left=group(body,-.205,.8,0),right=group(body,.205,.8,0);
    for(const arm of [left,right]){
      ball(arm,shirt,0,-.09,0,.083,.14,.085);
      ball(arm,fur,0,-.235,.02,.062,.12,.062);
      ball(arm,fur,0,-.34,.03,.068,.063,.063);
      for(let i=0;i<3;i++)ball(arm,fur,-.03+i*.03,-.35,.075,.018,.025,.012);
    }
    if(!female){
      // A lidded takeaway cup moves with the paw during the drinking gesture.
      right.rotation.x=-.95;
      const cup=group(right,0,-.35,.10);
      mesh(cup,new T.CylinderGeometry(.053,.04,.14,16),'#efe1c3',0,-.015,0);
      mesh(cup,new T.CylinderGeometry(.057,.057,.018,16),'#455c53',0,.06,0);
      mesh(cup,new T.CylinderGeometry(.049,.045,.045,16),'#b88d57',0,-.02,0);
      box(cup,'#243c38',0,.072,.03,.021,.01,.012);
      ball(left,'#344742',0,-.22,.067,.07,.035,.012);
    }else{
      // Selection arm reaches towards the machine, other paw carries a wallet.
      right.rotation.x=-1.3;
      box(left,'#af8052',0,-.34,.085,.1,.075,.025);
    }
    return {actor,body,head,tail,left,right,female};
  }
  const orange=cat({fur:'#dc963e',shirt:'#72918c',pants:'#465566',x:-.55,z:1.86,angle:.3,female:false});
  const white=cat({fur:'#f0eee3',shirt:'#c9867c',pants:'#426c70',x:3.5,z:1.78,angle:Math.PI-.18,female:true});
  function car(color,lane,phase,direction){
    const vehicle=group(root);vehicle.rotation.y=direction*Math.PI/2;
    const wheels=[];
    box(vehicle,'#293b41',0,.28,0,.88,.14,1.76);
    box(vehicle,color,0,.49,0,.94,.3,1.82);
    box(vehicle,color,0,.74,-.10,.81,.3,.95);
    // Separate glazing on all four sides, roof pillars, hood and bumper.
    box(vehicle,'#537b88',0,.77,.389,.69,.21,.018);
    box(vehicle,'#537b88',0,.77,-.59,.69,.20,.018);
    for(const side of [-1,1]){
      for(const z of [-.35,.10])box(vehicle,'#466d79',side*.412,.77,z,.014,.20,.34);
      box(vehicle,color,side*.42,.77,-.125,.02,.25,.045);
      box(vehicle,'#bfc8bc',side*.479,.55,-.14,.02,.026,.13);
      box(vehicle,color,side*.53,.69,.28,.12,.055,.11);
      for(const z of [-.59,.58]){
        const wheel=group(vehicle,side*.46,.25,z);
        const tyre=mesh(wheel,new T.CylinderGeometry(.19,.19,.105,20),'#263033');tyre.rotation.z=Math.PI/2;
        const hub=mesh(wheel,new T.CylinderGeometry(.10,.10,.112,16),'#afb7af');hub.rotation.z=Math.PI/2;
        for(let i=0;i<5;i++){const a=i*Math.PI*2/5;rod(wheel,'#dde0d0',[side*.06,0,0],[side*.06,Math.sin(a)*.085,Math.cos(a)*.085],.013);}
        wheels.push(wheel);
      }
    }
    box(vehicle,color,0,.91,-.1,.86,.06,1.01);
    box(vehicle,'#46565b',0,.41,.932,.92,.07,.07);
    box(vehicle,'#46565b',0,.41,-.932,.92,.07,.07);
    box(vehicle,'#283b43',0,.5,.923,.36,.09,.018);
    for(let i=0;i<5;i++)box(vehicle,'#a8b3aa',-.14+i*.07,.5,.937,.018,.065,.014);
    for(const side of [-1,1]){
      box(vehicle,'#f4e5b4',side*.32,.56,.924,.17,.1,.026);
      box(vehicle,'#bd5140',side*.33,.55,-.924,.15,.09,.026);
    }
    box(vehicle,'#e5e0c3',0,.36,.963,.26,.07,.015);
    return {vehicle,wheels,lane,phase,direction};
  }
  const traffic=[car('#698e88',4.02,0,1),car('#d5af67',5.45,8,-1),car('#a96854',4.02,12,1)];
  return function update(time){
    for(const c of [orange,white]){
      c.body.position.y=Math.sin(time*1.7+(c.female?1:0))*.006;
      c.tail.rotation.y=Math.sin(time*1.2+(c.female?2:0))*.16;
      c.head.rotation.y=Math.sin(time*.55)*.08;
    }
    // Orange cat raises the cup periodically. White cat taps a selection key.
    const sip=Math.pow(Math.max(0,Math.sin(time*.55)),4);
    orange.right.rotation.x=-.95-sip*.85;
    orange.head.rotation.x=sip*.06;
    white.right.rotation.x=-1.3-Math.pow(Math.max(0,Math.sin(time*1.2)),8)*.17;
    white.head.rotation.x=-.06;
    for(const c of traffic){
      const distance=(time*1.15+c.phase)%24;
      const x=(distance-12)*c.direction;
      c.vehicle.position.set(x,.055,c.lane);
      // Wait offstage between passes; do not wrap visibly across the diorama.
      c.vehicle.visible=Math.abs(x)<5.95;
      c.wheels.forEach(w=>w.rotation.x=time*1.15/.19*c.direction);
    }
  };
}

