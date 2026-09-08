import { addStreetLife } from './street-life.js';
import * as T from 'three';

// All dimensions are in metres. Front faces +Z; the side street is on +X.
// Repeated opaque geometry is instanced after authoring to limit draw calls.
export function city() {
  const root = new T.Group();
  const materials = new Map();
  const geometries = new Map();
  const animated = [];
  const mat = (color, extra = {}) => {
    const key = JSON.stringify([color, extra]);
    if (!materials.has(key)) materials.set(key, new T.MeshStandardMaterial({color, roughness:0.75,...extra}));
    return materials.get(key);
  };
  const geometry = (key, make) => {
    if (!geometries.has(key)) geometries.set(key, make());
    return geometries.get(key);
  };
  function add(g,c,x,y,z,extra={}) {
    const m = new T.Mesh(g,mat(c,extra)); m.position.set(x,y,z);
    m.castShadow=true; m.receiveShadow=true; root.add(m); return m;
  }
  function box(x,y,z,w,h,d,c,extra={}) {
    return add(geometry('b'+[w,h,d],()=>new T.BoxGeometry(w,h,d)),c,x,y,z,extra);
  }
  function cylinder(x,y,z,r,h,c,segments=16) {
    return add(geometry('c'+[r,h,segments],()=>new T.CylinderGeometry(r,r,h,segments)),c,x,y,z);
  }
  function sphere(x,y,z,r,c,extra={}) {
    return add(geometry('s'+r,()=>new T.SphereGeometry(r,12,8)),c,x,y,z,extra);
  }
  function line(a,b,r,c) {
    const p=new T.Vector3(...a), q=new T.Vector3(...b), v=q.clone().sub(p);
    const m=cylinder(...p.clone().add(q).multiplyScalar(.5).toArray(),r,v.length(),c,8);
    m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize()); return m;
  }
  function label(text,x,y,z,w,h,bg='#173f39',fg='#fff0cc',size=70) {
    const canvas=document.createElement('canvas'); canvas.width=1024; canvas.height=256;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);
    ctx.strokeStyle=fg;ctx.lineWidth=5;ctx.strokeRect(14,14,996,228);
    ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='600 '+size+'px sans-serif';ctx.fillText(text,512,128,950);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:texture,roughness:.9}));
    m.position.set(x,y,z);root.add(m);return m;
  }
  const cream='#e4c9a2', green='#245b50', iron='#293c40', brass='#b69961', wood='#a66b43';
  const glow={emissive:'#ffb766',emissiveIntensity:.7};
  // Raised display plinth, two intersecting streets, paving and kerbs.
  box(0,-.42,0,14,.7,12,'#253239');
  box(0,-.04,0,14,.16,12,'#383e43');
  box(-1,.12,-1.3,9.8,.26,8.4,'#b6b2a7');
  for(let x=-5.8;x<3.8;x+=.55) for(let z=-5.2;z<2.7;z+=.55)
    box(x,.257,z,.53,.022,.53,((Math.round(x*10)+Math.round(z*10))%3)?'#bdb9aa':'#adaeaa');
  for(let x=-5.9;x<4;x+=.5) box(x,.18,2.93,.47,.33,.25,'#ddd5bf');
  for(let z=-5.7;z<3;z+=.5) box(3.97,.18,z,.25,.33,.47,'#ddd5bf');
  for(let x=-6;x<3;x+=2) box(x,.05,4.75,1,.015,.10,'#dfcc8c');
  for(let z=-5;z<3;z+=2) box(5.5,.05,z,.10,.015,1,'#dfcc8c');
  for(let i=0;i<7;i++) box(2.4+i*.58,.058,3.72,.3,.016,1.2,'#e8e1c9');
  for(let i=0;i<5;i++) box(4.8,.058,1.5-i*.55,1.1,.016,.28,'#e8e1c9');
  // Storm drain, road patch and manhole with raised concentric rings.
  box(.9,.062,3.24,.9,.018,.35,iron);
  for(let i=0;i<10;i++) box(.51+i*.085,.08,3.24,.025,.02,.31,'#88908b');
  cylinder(-2,.065,4.05,.47,.025,'#242d30',48);
  for(let i=0;i<8;i++) box(-2,.085,3.73+i*.09,.6,.015,.024,'#637074');
  box(-4,.052,5.4,1.7,.012,.5,'#30383b').rotation.y=.13;
  // Building: rear and side walls; front openings are real openings.
  box(-1,.4,-1.6,6.4,.3,5.4,'#8d806d');
  box(-1,1.75,-4.2,6.4,2.7,.2,cream);
  box(-4.1,3,-1.65,.22,5.5,5.3,cream);
  box(2.1,3,-1.65,.22,5.5,5.3,'#d5b08c');
  box(-1,4.48,-4.2,6.4,2.55,.2,'#d8c3ad');
  box(-1,3.1,-1.6,6.45,.25,5.45,'#c4b69f');
  box(-1,5.85,-1.6,6.65,.24,5.65,'#bdb4a1');
  box(-1,3.34,1.02,6.55,.23,.35,'#f0dfbe');
  box(-1,5.6,1.04,6.6,.22,.4,cream);
  // Upper front masonry around two large residential windows.
  box(-1,3.62,.98,6.4,.46,.24,'#b7785b');
  box(-1,5.34,.98,6.4,.36,.24,'#b7785b');
  for(const x of [-4,-1,2]) box(x,4.5,.98,.38,1.7,.24,'#b7785b');
  for(let row=0;row<4;row++) for(let col=0;col<20;col++) {
    const x=-4+col*.31+(row%2)*.15;
    box(x,3.44+row*.10,1.115,.28,.075,.022,(col%4)?'#be8262':'#985c48');
    box(x,5.23+row*.10,1.115,.28,.075,.022,(col%3)?'#be8262':'#d39877');
  }
  // Roof parapet, flashing, rooftop equipment, antenna and downpipe.
  box(-1,6.06,-4.3,6.6,.35,.16,cream);
  for(const x of [-4.24,2.24]) box(x,6.06,-1.6,.16,.35,5.5,cream);
  box(-1,6.06,1.16,6.6,.35,.16,cream);
  box(-1,6.25,1.16,6.8,.08,.3,'#737f7a');
  box(.8,6.13,-2.7,1.5,.45,1,'#839391');
  for(let i=0;i<12;i++) box(.14+i*.115,6.14,-2.18,.035,.29,.03,iron);
  cylinder(-2.8,6.5,-3,.09,1.1,iron);
  line([-2.8,7,-3],[-2.8,7.8,-3],.024,iron);
  for(let i=0;i<4;i++) line([-3.35,7.15+i*.15,-3],[-2.25,7.15+i*.15,-3],.018,iron);
  cylinder(2.25,3,-3.9,.075,5.65,'#677876');
  for(const y of [.7,2,3.5,5]) box(2.25,y,-3.9,.25,.07,.2,iron);
  // Ground floor shop: green joinery, recessed working entrance and transom.
  for(const x of [-4,-.15,1.95]) box(x,1.6,1.07,.15,2.65,.22,green);
  box(-1,2.85,1.1,6.3,.18,.25,green);
  box(-2.1,.65,1.09,3.6,.72,.16,green);
  for(let i=0;i<8;i++) box(-3.7+i*.46,.65,1.19,.38,.54,.035,'#347266');
  box(.95,1.55,.75,1.7,2.4,.09,green);
  box(.95,1.76,.81,1.42,1.68,.02,'#76999a',{transparent:true,opacity:.15,depthWrite:false});
  box(.95,.65,.85,1.45,.42,.07,wood);
  // Cut-out door glazing is represented without an opaque door slab.
  // Remove broad slab; retain its perimeter so interior stays visible.
  const slab=root.children.find(m=>m.position.x===.95 && m.position.y===1.55 && m.position.z===.75);
  root.remove(slab); slab.geometry.dispose();
  for(const x of [.1,1.8]) box(x,1.55,.75,.1,2.4,.12,green);
  for(const y of [.36,2.75]) box(.95,y,.75,1.8,.1,.12,green);
  line([1.52,1.3,.92],[1.52,1.67,.92],.03,brass);
  box(.95,.3,1.0,1.9,.09,.65,'#e1d4b5');
  label('OPEN · 07:00—21:00',.93,2.18,.84,1.25,.22,'#173f39','#ffe1a3',54);
  box(-2.1,1.83,1.12,3.58,1.58,.016,'#b3d4cd',{transparent:true,opacity:.07,depthWrite:false});
  for(const x of [-3.95,-2.1,-.25]) box(x,1.8,1.17,.065,1.7,.07,brass);
  box(-2.1,2.64,1.17,3.8,.06,.08,brass);
  // Sign fascia, raised edges, striped awning and individual scallops.
  box(-1,3.02,1.26,6.4,.55,.24,green);
  label('CORNER  /  BAKERY & COFFEE',-1,3.02,1.39,5.85,.39);
  for(let i=0;i<22;i++) {
    const x=-4.1+i*.29;
    const awning=box(x,2.62,1.73,.29,.07,1.02,i%2?cream:green);
    awning.rotation.x=.19;
    box(x,2.46,2.21,.29,.22,.045,i%2?cream:green);
  }
  line([-3.9,2.1,1.12],[-3.9,2.5,2.15],.025,iron);
  line([1.9,2.1,1.12],[1.9,2.5,2.15],.025,iron);
  // Interior tiled floor; counter leaves a clear route from door to service area.
  for(let x=-3.9;x<2;x+=.4) for(let z=-4;z<.8;z+=.4)
    box(x,.57,z,.39,.015,.39,(Math.round((x+z)*2.5)%2)?'#ded4b9':'#8f9c8b');
  box(-2.25,1.04,-.02,2.8,.9,.72,wood);
  box(-2.25,1.53,-.02,2.95,.10,.88,'#eee0c0');
  // Bakery display: brass posts, glass front, two shelves, trays and pastries.
  for(const x of [-3.58,-.94]) line([x,1.58,.32],[x,2.13,.32],.022,brass);
  box(-2.26,1.86,.35,2.68,.57,.014,'#d9ece0',{transparent:true,opacity:.13,depthWrite:false});
  for(const y of [1.6,1.86]) {
    box(-2.25,y,0,2.6,.03,.64,'#bba679');
    for(let i=0;i<8;i++) {
      const p=sphere(-3.35+i*.31,y+.08,.08,.1,i%2?'#c78c46':'#e4af68');p.scale.set(1.3,.65,.7);
      for(let j=0;j<3;j++) box(-3.4+i*.31+j*.045,y+.139,.08,.017,.013,.09,'#f6d9a1').rotation.z=-.3;
    }
  }
  label('SOURDOUGH  4.50   /   CROISSANT  2.80',-2.25,1.32,.44,2.3,.18,'#483f35','#fff0cc',43);
  // Espresso station, grinder, cups, till and menu boards.
  box(-2.75,1.0,-3.48,2.4,.85,.85,green);
  box(-2.75,1.47,-3.48,2.5,.1,.95,'#d7cbbb');
  box(-2.65,1.8,-3.45,1.04,.54,.56,'#b6c1bb',{metalness:.65,roughness:.3});
  box(-2.65,1.72,-3.14,.94,.17,.04,iron);
  for(const x of [-2.91,-2.39]) {line([x,1.79,-3.12],[x,1.68,-2.98],.027,iron);cylinder(x,1.55,-3.03,.07,.1,cream);}
  cylinder(-3.53,1.71,-3.45,.14,.4,iron);
  cylinder(-3.53,2.05,-3.45,.16,.27,'#715242');
  box(-.65,1.78,-.2,.35,.07,.35,iron);
  box(-.65,1.98,-.2,.38,.27,.055,'#495e61').rotation.x=-.2;
  for(let i=0;i<5;i++) cylinder(-1.25+i*.11,1.6,-3.4,.045,.11,cream);
  label('ESPRESSO  2.50   /   LATTE  3.80',-1.1,2.28,-4.06,2.45,.48,'#243d35','#ffe9b6',48);
  label('FRESH BREAD · BAKED EVERY MORNING',-1.1,2.72,-4.06,2.45,.25,'#243d35','#ffe9b6',43);
  // Storage shelf with packaged stock and a sink for an operational shop.
  for(const y of [.85,1.4,1.95]) {
    box(.9,y,-3.66,1.65,.06,.55,wood);
    for(let i=0;i<6;i++) box(.26+i*.24,y+.19,-3.67,.17,.32,.25,i%2?'#e5c98f':'#d49971');
  }
  for(const x of [0,1.8]) box(x,1.35,-3.7,.07,1.8,.6,iron);
  box(-3.65,1.1,-1.9,.65,.85,1.0,green);
  box(-3.65,1.56,-1.9,.61,.05,.65,'#6f8584',{metalness:.7});
  line([-3.65,1.57,-2.15],[-3.65,1.87,-2.15],.022,brass);
  line([-3.65,1.87,-2.15],[-3.65,1.87,-1.94],.022,brass);
  // Pendant lamps.
  for(const x of [-2.7,.7]) {
    cylinder(x,2.7,-1.3,.012,.6,iron);
    add(new T.ConeGeometry(.22,.16,24,1,true),cream,x,2.37,-1.3,{side:T.DoubleSide});
    sphere(x,2.34,-1.3,.07,'#ffe5ad',glow);
  }
  const interior=new T.PointLight('#ffd49b',13,7,2);interior.position.set(-1,2.35,-1.5);root.add(interior);
  // Upstairs, actual furnished rooms visible through unobstructed large windows.
  box(-1,4.47,-1.8,.12,2.42,4.6,'#d8c3ad');
  for(let i=0;i<24;i++) box(-3.93+i*.25,3.25,-1.55,.235,.025,5,'#b98b5e');
  for(const center of [-2.5,.5]) {
    for(const x of [center-1.18,center+1.18]) box(x,4.48,1.04,.09,1.56,.16,cream);
    for(const y of [3.74,5.21]) box(center,y,1.07,2.45,.09,.24,cream);
    box(center,4.5,1.13,.055,1.46,.07,green);
    box(center,4.53,1.13,2.35,.05,.07,green);
    box(center,3.69,1.24,2.58,.13,.46,'#ddd4bf');
    // Folded curtains along edges leave an open sightline to furniture.
    for(const side of [-1,1]) for(let i=0;i<5;i++)
      cylinder(center+side*(.9+i*.045),4.47,.84,.055,1.36,'#e7d7b9',8);
    line([center-1.25,5.15,.77],[center+1.25,5.15,.77],.025,brass);
  }
  // Living room sofa, cushions, rug, coffee table, books and standing lamp.
  box(-2.5,3.42,-1.65,2.2,.24,1.9,'#657f79');
  box(-2.55,3.6,-2.45,1.85,.42,.75,'#bd825e');
  box(-2.55,3.96,-2.78,1.85,.54,.18,'#bd825e');
  for(const x of [-3.46,-1.64]) box(x,3.83,-2.43,.18,.52,.8,'#aa6f50');
  for(const x of [-3.05,-2.48,-1.94]) box(x,3.85,-2.4,.49,.14,.54,'#d79c72');
  box(-2.99,4,-2.62,.35,.32,.12,'#dcd3a4').rotation.z=.2;
  box(-2.1,4,-2.62,.35,.32,.12,green).rotation.z=-.12;
  box(-2.5,3.7,-.78,1.1,.09,.65,wood);
  for(const x of [-2.95,-2.05]) for(const z of [-1,-.56]) box(x,3.48,z,.05,.43,.05,iron);
  box(-2.6,3.77,-.8,.37,.06,.25,'#dc714e');
  cylinder(-2.2,3.8,-.7,.07,.12,cream);
  cylinder(-3.7,3.29,-1.3,.2,.04,iron);cylinder(-3.7,3.96,-1.3,.025,1.35,brass);
  add(new T.CylinderGeometry(.19,.3,.35,24,1,true),'#f3d5a3',-3.7,4.68,-1.3,{side:T.DoubleSide});
  // Bedroom bed, folded duvet, pillows, nightstand and study desk.
  box(.6,3.47,-2.5,1.7,.34,2.5,wood);
  box(.6,3.72,-2.5,1.65,.25,2.4,'#eee4cf');
  box(.6,3.89,-2.14,1.67,.14,1.65,'#6e989d');
  box(.6,3.97,-1.65,1.69,.08,.48,'#d1a876');
  box(.6,3.91,-3.23,1.2,.17,.47,'#faf0d8');
  box(.6,4.05,-3.76,1.8,1.15,.1,wood);
  box(1.66,3.55,-3.2,.44,.56,.55,wood);
  cylinder(1.66,3.94,-3.2,.035,.32,brass);
  add(new T.ConeGeometry(.17,.22,20),'#edcea0',1.66,4.16,-3.2);
  box(.5,3.85,-.25,1.55,.09,.65,wood);
  for(const x of [-.13,1.13]) for(const z of [-.48,-.04]) box(x,3.54,z,.055,.62,.055,iron);
  box(.5,3.94,-.2,.47,.035,.3,iron);
  box(.5,4.1,-.37,.46,.3,.025,'#425e68');
  box(.5,3.57,-.9,.47,.09,.44,green);
  box(.5,3.88,-1.1,.47,.6,.07,green);
  for(const x of [.3,.7]) for(const z of [-.73,-1.06]) box(x,3.38,z,.04,.38,.04,wood);
  const roomLight=new T.PointLight('#ffc984',8,6,2);roomLight.position.set(-2.3,4.8,-1.6);root.add(roomLight);
  const bedroomLight=new T.PointLight('#ffddab',6,5,2);bedroomLight.position.set(.6,4.7,-1.5);root.add(bedroomLight);
  // Front flower boxes, soil, stems and flowers.
  for(const center of [-2.5,.5]) {
    box(center,3.61,1.5,1.9,.22,.32,green);box(center,3.74,1.5,1.8,.025,.26,'#574638');
    for(let i=0;i<12;i++) {const x=center-.8+i*.145;line([x,3.74,1.5],[x,3.98+(i%3)*.05,1.5],.012,'#507b46');sphere(x,4+(i%3)*.05,1.5,.065,i%2?'#df775f':'#efc763');}
  }
  // Vending machine beside the shop: separate cans, selection keys and payment hardware.
  const vx=2.92,vz=.9;
  box(vx,1.29,vz,1.12,2.08,.85,'#bb5945',{metalness:.25,roughness:.42});
  box(vx,2.36,vz,1.15,.09,.9,'#e1b589');
  box(vx-.15,1.64,vz+.441,.68,1.13,.05,'#283c43');
  for(let row=0;row<4;row++) {
    box(vx-.15,1.17+row*.26,vz+.49,.67,.035,.13,'#bccbc7');
    for(let col=0;col<4;col++) {
      const x=vx-.39+col*.16,y=1.27+row*.26;
      cylinder(x,y,vz+.5,.047,.16,['#e3b44a','#619b85','#e0ddd0','#c75a4d'][col]);
      cylinder(x,y+.082,vz+.5,.039,.012,'#d6ded8');
      box(x,y,vz+.548,.05,.04,.005,'#f7e8c9');
      sphere(x,1.13+row*.26,vz+.55,.022,'#c9efd1');
    }
  }
  label('COLD DRINKS',vx,2.22,vz+.445,.98,.18,'#efe2be','#9d4035',72);
  box(vx+.39,1.72,vz+.45,.19,.23,.055,iron);
  label('2.50',vx+.39,1.74,vz+.483,.15,.055,'#172f2c','#b8f0ca',72);
  box(vx+.39,1.43,vz+.472,.13,.018,.018,'#131f25');
  box(vx+.39,1.31,vz+.472,.1,.095,.02,'#263e46');
  cylinder(vx+.39,1.14,vz+.48,.04,.02,brass).rotation.x=Math.PI/2;
  box(vx,.61,vz+.445,.79,.28,.06,'#25383b');
  box(vx,.51,vz+.54,.83,.06,.2,'#637c7a');
  for(const x of [vx-.42,vx+.42]) box(x,.23,vz,.1,.14,.65,iron);
  for(let i=0;i<7;i++) box(vx+.571,.7+i*.07,vz,.014,.022,.43,'#733c33');
  // Litter and recycling bins: lid, opening, ribs, handles and feet.
  for(let i=0;i<2;i++) {
    const x=2.85,z=-.5-i*.73;
    box(x,.76,z,.53,.93,.57,i?green:'#546973');
    box(x,1.26,z,.6,.09,.64,iron);
    box(x,1.15,z+.29,.32,.16,.02,'#17292f');
    for(let j=0;j<6;j++) box(x-.22+j*.09,.76,z+.29,.025,.65,.024,'#798b87');
    label(i?'RECYCLE':'LITTER',x,1,z+.312,.4,.1,'#2b4445','#f1e4b5',70);
    for(const sx of [-1,1]) box(x+sx*.3,1.06,z,.06,.14,.17,iron);
  }
  // Outside menu, crates, cafe furniture and cups.
  for(const x of [-.45,.45]) {
    const leg=box(-2.45+x,.76,2.05,.06,1.03,.07,wood);leg.rotation.x=-.12;
  }
  box(-2.45,.87,2.13,1,.77,.07,wood);
  label('TODAY  /  BREAD + COFFEE  6.00',-2.45,.89,2.174,.88,.62,'#273d35','#f7e4b2',54);
  for(let row=0;row<2;row++) {
    box(-3.6,.45+row*.3,1.95,.64,.26,.48,wood);
    for(let i=0;i<4;i++) sphere(-3.83+i*.14,.62+row*.3,1.97,.075,'#d99844');
    for(let i=0;i<3;i++) box(-3.6,.36+row*.3+i*.08,2.205,.68,.047,.03,'#c59662');
  }
  cylinder(.6,.94,2.08,.47,.065,wood,32);cylinder(.6,.59,2.08,.045,.68,iron);cylinder(.6,.27,2.08,.3,.045,iron);
  cylinder(.48,1.035,2.08,.067,.12,cream);box(.75,.99,2.06,.2,.025,.16,'#e8d6ab');
  for(const x of [-.12,1.32]) {
    cylinder(x,.57,2.05,.25,.055,wood);
    for(const dx of [-.16,.16]) for(const dz of [-.16,.16]) line([x+dx,.27,2.05+dz],[x+dx*.7,.57,2.05+dz*.7],.024,iron);
    line([x-.2,.58,1.89],[x-.2,1.07,1.89],.024,iron);line([x+.2,.58,1.89],[x+.2,1.07,1.89],.024,iron);
    box(x,.94,1.89,.43,.19,.045,wood);
  }
  // Side residential access and utility fixtures.
  box(2.224,1.53,-2.75,.03,2.5,1.2,green);
  box(2.25,1.55,-2.34,.05,.27,.05,brass);
  box(2.25,1.6,-1.78,.14,.48,.3,'#768783');
  for(let i=0;i<4;i++) box(2.33,1.76-i*.1,-1.78,.014,.025,.23,iron);
  box(2.25,4.72,-2.3,.55,.54,1,'#b5c3b9');
  for(let i=0;i<9;i++) box(2.535,4.51+i*.05,-2.3,.025,.017,.88,'#677c79');
  line([2.36,4.45,-2.7],[2.36,3.65,-2.7],.025,'#c0c0a7');
  // Bicycle leaning along the side wall.
  for(const z of [-3.5,-2.28]) {
    const tyre=add(new T.TorusGeometry(.35,.035,8,32),iron,3.1,.64,z);tyre.rotation.y=Math.PI/2;
    for(let i=0;i<12;i++) line([3.1,.64,z],[3.1,.64+Math.cos(i*Math.PI/6)*.32,z+Math.sin(i*Math.PI/6)*.32],.006,'#a0aaa3');
  }
  const A=[3.1,.64,-3.5], B=[3.1,.7,-2.91], C=[3.1,1.23,-3.12], D=[3.1,1.18,-2.43], E=[3.1,.64,-2.28];
  for(const [a,b] of [[A,B],[B,C],[C,A],[C,D],[D,B],[D,E]]) line(a,b,.023,'#d69d58');
  box(3.1,1.31,-3.14,.18,.055,.29,iron);
  line(D,[3.1,1.46,-2.38],.022,iron);
  line([2.88,1.46,-2.38],[3.32,1.46,-2.38],.022,iron);
  // Streetlamp, bollards, parking sign and overhead cables.
  for(const x of [-4.8,3.5]) {
    cylinder(x,.55,2.58,.085,.65,iron);cylinder(x,.85,2.58,.093,.08,brass);
  }
  cylinder(-5.1,.43,2.2,.18,.35,iron);cylinder(-5.1,2.35,2.2,.065,3.85,iron);
  line([-5.1,4.25,2.2],[-4.48,4.25,2.2],.05,iron);
  box(-4.48,4.2,2.2,.48,.15,.3,iron);
  box(-4.48,4.11,2.2,.38,.025,.23,'#ffe0a0',glow);
  const streetLight=new T.PointLight('#ffc985',12,6,2);streetLight.position.set(-4.48,4,2.2);root.add(streetLight);
  cylinder(3.55,1.53,-4.9,.035,2.65,iron);
  label('P  /  30 MIN',3.55,2.7,-4.85,.57,.55,'#326170','#fff6d9',66);
  const curve=new T.CatmullRomCurve3([new T.Vector3(-4.2,5.55,1.4),new T.Vector3(-1,5.05,1.7),new T.Vector3(2.2,5.55,1.4)]);
  add(new T.TubeGeometry(curve,32,.013,5,false),iron,0,0,0);
  for(let i=1;i<12;i++) {
    const p=curve.getPoint(i/12);
    line(p.toArray(),[p.x,p.y-.10,p.z],.01,iron);
    sphere(p.x,p.y-.15,p.z,.047,'#ffe4ab',glow);
  }
  // Slow rooftop fan: actual blades, independent from instanced static geometry.
  const fan=new T.Group();fan.position.set(.8,6.4,-2.7);root.add(fan);
  for(let i=0;i<4;i++) {
    const blade=new T.Mesh(new T.BoxGeometry(.5,.025,.12),mat('#425a5b'));
    blade.position.set(Math.cos(i*Math.PI/2)*.17,0,Math.sin(i*Math.PI/2)*.17);
    blade.rotation.y=-i*Math.PI/2;fan.add(blade);
  }
  animated.push(fan);
  // Batch identical opaque meshes without merging transparent panes or unique signs.
  root.updateMatrixWorld(true);
  const batches=new Map();
  for(const object of [...root.children]) if(object.isMesh && !object.material.transparent && !object.material.map) {
    const key=object.geometry.uuid+object.material.uuid;
    if(!batches.has(key)) batches.set(key,[]);
    batches.get(key).push(object);
  }
  for(const list of batches.values()) if(list.length>2) {
    const instanced=new T.InstancedMesh(list[0].geometry,list[0].material,list.length);
    list.forEach((m,i)=>{instanced.setMatrixAt(i,m.matrix);root.remove(m);});
    instanced.castShadow=true;instanced.receiveShadow=true;root.add(instanced);
  }
  const updateLife = addStreetLife(root);
  return {root, camera:[12,9,15],target:[-.4,2.5,0], minDistance:2, maxDistance:32,
    update(time){animated.forEach(f=>f.rotation.y=time*.8);updateLife(time);}};
}

