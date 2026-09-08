import { batchStaticMeshes } from './batch-static.js';
import { seasonDetails } from './season-details.js';
import * as T from 'three';

// A deterministic, self-contained diorama. All animation uses viewer time,
// so pausing, resetting and switching scenes never leave background timers.
export function springRain(season = 'spring') {
  const root = new T.Group();
  const winter = season === 'winter', autumn = season === 'autumn';
  const palette = winter ? {'#62876a':'#788887','#7fa771':'#a0a695','#538c88':'#66868f','#79ae67':'#969e83','#85b971':'#abb39c'} : autumn ? {'#62876a':'#928568','#7fa771':'#b4a168','#83b66c':'#bba357','#b5cb7c':'#d6b56c','#538c88':'#71877b','#79ae67':'#b7a167','#85b971':'#c2af77'} : season === 'summer' ? {'#62876a':'#4d795d','#83b66c':'#4a965d','#b5cb7c':'#7eae64','#538c88':'#397c79'} : {};

  let seed = 731;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  const materials = new Map();
  const material = (color, options = {}) => {
    color = palette[color] || color;
    const key = JSON.stringify([color, options]);
    if (!materials.has(key)) materials.set(key, new T.MeshStandardMaterial({ color, roughness: .66, ...options }));
    return materials.get(key);
  };
  const ball = new T.SphereGeometry(1, 10, 8);
  const cube = new T.BoxGeometry(1, 1, 1);
  const leaf = new T.SphereGeometry(1, 6, 4);
  function mesh(geometry, color, position, scale = [1, 1, 1], parent = root, options = {}) {
    const obj = new T.Mesh(geometry, material(color, options));
    obj.position.set(...position); obj.scale.set(...scale);
    obj.castShadow = true; obj.receiveShadow = true; parent.add(obj); return obj;
  }
  const sphere = (p, s, c, parent = root, options = {}) => mesh(ball, c, p, s, parent, options);
  function branch(points, radius, color, parent = root) {
    const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
    return mesh(new T.TubeGeometry(curve, 16, radius, 5, false), color, [0, 0, 0], [1, 1, 1], parent);
  }
  const wet = { roughness: .24 };
  mesh(new T.CylinderGeometry(5.5, 5.15, .65, 80), '#3a514b', [0, -.45, 0]);
  mesh(new T.CylinderGeometry(5.5, 5.5, .14, 80), '#62876a', [0, -.06, 0], [1, 1, 1], root, wet);
  // Soil strata, pebbles and low moss along the cut-away island edge.
  for (let i = 0; i < 100; i++) {
    const a = random() * Math.PI * 2, r = 5.15 + random() * .25;
    sphere([Math.cos(a) * r, -.2 - random() * .38, Math.sin(a) * r], [.07 + random() * .16, .045, .09], '#718274');
  }
  const pond = mesh(new T.CircleGeometry(1, 80), '#538c88', [1.25, .035, .5], [2.6, 1.85, 1], root, { metalness: .32, roughness: .17 });
  pond.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 55; i++) {
    const a = i / 55 * Math.PI * 2;
    const stone = sphere([1.25 + Math.cos(a) * 2.68, .075, .5 + Math.sin(a) * 1.94], [.15 + random() * .12, .1 + random() * .08, .14 + random() * .12], i % 3 ? '#82948b' : '#b0b5a0', root, wet);
    stone.rotation.y = random() * 6;
  }
  // A curving path with wet inset patches and moss in the joints.
  for (let i = 0; i < 13; i++) {
    const z = 4.3 - i * .59, x = -1.7 - Math.sin(i * .27) * .9;
    const stone = mesh(new T.CylinderGeometry(.43, .48, .1, 7), '#a4ada0', [x, .07, z], [1, 1, .74], root, wet);
    stone.rotation.y = i * .61;
    const patch = mesh(new T.CircleGeometry(.22, 20), '#78918a', [x + .04, .126, z], [1, .6, 1], root, { roughness: .12, metalness: .3 });
    patch.rotation.x = -Math.PI / 2;
  }
  // Willow: each hanging spray bends at its attachment, leaves ripple locally.
  const willow = new T.Group(); willow.position.set(-2.55, 0, -1.65); root.add(willow);
  branch([[0, 0, 0], [.12, 1.3, 0], [-.15, 2.7, .08], [.3, 4.15, .05]], .18, '#716a4c', willow);
  for (let i = 0; i < 7; i++) branch([[.02, 0, 0], [Math.cos(i) * .35, .12, Math.sin(i) * .35], [Math.cos(i) * .65, .03, Math.sin(i) * .65]], .065, '#716a4c', willow);
  const sprays = [];
  for (let i = 0; i < 32; i++) {
    const a = i * 2.39996, r = .5 + random() * 1.55, y = 3.3 + random() * .95;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (i % 3 === 0) branch([[0, 2.5, 0], [x * .4, y + .15, z * .4], [x, y, z]], .047, '#797553', willow);
    const spray = new T.Group(); spray.position.set(x, y, z); willow.add(spray);
    const length = 1.4 + random() * 1.5;
    branch([[0, 0, 0], [.11, -length * .35, .05], [.17, -length * .7, 0], [.26, -length, .08]], .012, '#889756', spray);
    for (let j = 0; j < (winter ? 0 : autumn ? 7 : 13); j++) {
      const f = (j + .4) / 13;
      const l = mesh(leaf, j % 3 ? '#83b66c' : '#b5cb7c', [.22 * f + (j % 2 ? .075 : -.075), -length * f, .025], [.045, .17, .022], spray);
      l.rotation.z = j % 2 ? -.45 : .45;
    }
    sprays.push({ obj: spray, phase: a, weight: .6 + random() });
  }
  const plants = [], droplets = [];
  function plant(x, z, height, flower = false) {
    const group = new T.Group(); group.position.set(x, .06, z); root.add(group);
    branch([[0, 0, 0], [.04, height * .55, 0], [.12, height, 0]], .012, '#54894f', group);
    for (let j = 0; j < 3; j++) {
      const side = j % 2 ? -1 : 1;
      const l = mesh(leaf, '#6ba968', [side * .11, height * (.25 + j * .18), 0], [.18, .038, .07], group, wet); l.rotation.z = side * .43;
    }
    if (flower) {
      const head = new T.Group(); head.position.set(.12, height, 0); head.rotation.x = .22; group.add(head);
      const color = ['#f1d4cc', '#e8e8cc', '#b3a6d1', '#e4bb72'][Math.floor(random() * 4)];
      for (let j = 0; j < 6; j++) {
        const a = j * Math.PI / 3;
        const petal = sphere([Math.cos(a) * .085, .01, Math.sin(a) * .085], [.078, .027, .05], color, head, wet); petal.rotation.y = -a;
      }
      sphere([0, .035, 0], [.045, .03, .045], '#e7b64f', head);
      sphere([.075, .04, .015], [.019, .023, .019], '#d6f3ee', head, { roughness: .05, metalness: .25 });
    }
    plants.push({ obj: group, phase: random() * 7, weight: height });
    return group;
  }
  // Foreground flowers are deliberately large enough for macro camera presets.
  for (let i = 0; i < (season === 'spring' ? 44 : 0); i++) {
    const x = -4.3 + random() * 3.1, z = 1.2 + random() * 2.4;
    if (Math.hypot(x, z) < 5.05 && Math.abs(x + 1.7 + Math.sin((4.3 - z) / .59 * .27) * .9) > .55) plant(x, z, .3 + random() * .4, true);
  }
  // Fine grass is instanced: hundreds of blades without hundreds of draw calls.
  const grass = new T.InstancedMesh(new T.ConeGeometry(.025, .35, 3), material('#7fa771'), 650);
  const dummy = new T.Object3D(); let grassCount = 0;
  for (let i = 0; i < 1200 && grassCount < 650; i++) {
    const x = (random() - .5) * 10.6, z = (random() - .5) * 10.6;
    if (Math.hypot(x, z) > 5.2 || ((x - 1.25) / 2.95) ** 2 + ((z - .5) / 2.16) ** 2 < 1) continue;
    if (Math.abs(x + 1.7 + Math.sin((4.3 - z) / .59 * .27) * .9) < .48) continue;
    dummy.position.set(x, .17, z); dummy.rotation.set((random() - .5) * .5, random() * 6, (random() - .5) * .5); dummy.scale.setScalar(.6 + random()); dummy.updateMatrix(); grass.setMatrixAt(grassCount++, dummy.matrix);
  }
  grass.count = grassCount; root.add(grass);
  // Broad blades carry a bead that grows, releases, falls, and makes a ripple.
  const rippleGeometry = new T.RingGeometry(.92, 1, 40);
  function ripple(x, z, parent = root, y = .049) {
    const obj = new T.Mesh(rippleGeometry, new T.MeshBasicMaterial({ color: '#d7eee2', transparent: true, opacity: .4, depthWrite: false, side: T.DoubleSide }));
    obj.rotation.x = -Math.PI / 2; obj.position.set(x, y, z); parent.add(obj); return obj;
  }
  for (let i = 0; i < 9; i++) {
    const group = new T.Group(); group.position.set(1.5 + i * .18, .06, 2.8 + Math.sin(i) * .2); root.add(group);
    const h = .48 + random() * .38;
    branch([[0, 0, 0], [-.07, h * .8, 0], [.12, h, 0], [.3, h * .84, 0]], .024, '#85b971', group);
    const blade = mesh(leaf, '#79ae67', [.12, h * .82, 0], [.26, .05, .055], group, wet); blade.rotation.z = -.14;
    const bead = sphere([.32, h * .78, 0], [.033, .045, .033], '#c5eae1', group, { roughness: .04, metalness: .45 });
    const ring = ripple(.32, 0, group, .01);
    droplets.push({ bead, ring, h: h * .78, phase: i * .43 });
    plants.push({ obj: group, phase: i, weight: .45 });
  }
  // Reeds, lily pads, a floating petal and a tiny snail on a wet stone.
  for (let i = 0; i < 12; i++) plant(3.4 + random() * .35, -.7 + random() * .9, .65 + random() * .4);
  for (let i = 0; i < (winter || autumn ? 0 : 7); i++) {
    const pad = mesh(new T.CircleGeometry(.19 + random() * .12, 24, .12, Math.PI * 1.88), '#77a581', [.3 + random() * 2, .053, -.45 + random()], [1, 1, 1], root, wet); pad.rotation.x = -Math.PI / 2; pad.rotation.z = random() * 6;
  }
  sphere([-.4, .22, 2.62], [.42, .2, .32], '#99a59a', root, wet);
  if (!winter) {
  sphere([-.4, .43, 2.62], [.16, .05, .055], '#b4aa87');
  sphere([-.43, .51, 2.62], [.087, .085, .07], '#a07750');
  for (let i = 0; i < 3; i++) {
    const curl = mesh(new T.TorusGeometry(.065 - i * .017, .006, 4, 20), '#d6b385', [-.43, .51, 2.69]); curl.rotation.z = i;
  }
  for (const z of [2.59, 2.66]) branch([[-.27, .45, z], [-.23, .53, z]], .006, '#b4aa87');
  }
  // Weathered wooden bench and a folded red umbrella on the back bank.
  for (const x of [1.5, 2.7]) for (const z of [-3.35, -2.85]) mesh(cube, '#526662', [x, .3, z], [.09, .6, .09]);
  for (let i = 0; i < 4; i++) mesh(cube, '#9c8464', [2.1, .62, -3.4 + i * .18], [1.65, .08, .14], root, wet);
  for (const x of [1.5, 2.7]) mesh(cube, '#526662', [x, .95, -3.45], [.07, .8, .07]);
  for (let i = 0; i < 3; i++) mesh(cube, '#9c8464', [2.1, .86 + i * .16, -3.45], [1.65, .12, .065], root, wet);
  const umbrella = mesh(new T.ConeGeometry(.14, 1.1, 8), '#ac7066', [2.3, .76, -3.06]); umbrella.rotation.z = Math.PI / 2;
  branch([[1.7, .76, -3.06], [1.5, .76, -3.06], [1.46, .83, -3.06], [1.54, .86, -3.06]], .018, '#ded0a7');
  // Transparent rain uses one line draw call; rings are pooled and recycled.
  const count = season === 'summer' ? 1450 : winter ? 650 : 950;
  const rainSpeed = season === 'summer' ? 1.5 : winter ? .8 : 1;
  const positions = new Float32Array(count * 6), rainSeeds = [];
  for (let i = 0; i < count; i++) rainSeeds.push([random(), random(), random(), random()]);
  const rainGeometry = new T.BufferGeometry(); rainGeometry.setAttribute('position', new T.BufferAttribute(positions, 3).setUsage(T.DynamicDrawUsage));
  const rain = new T.LineSegments(rainGeometry, new T.LineBasicMaterial({ color: '#c8e1dc', transparent: true, opacity: .3, depthWrite: false })); rain.frustumCulled = false; root.add(rain);
  const rings = Array.from({ length: 32 }, (_, i) => {
    const a = random() * Math.PI * 2, r = Math.sqrt(random()) * .92;
    return { obj: ripple(1.25 + Math.cos(a) * r * 2.5, .5 + Math.sin(a) * r * 1.75), phase: i / 32 };
  });
  const petal = sphere([1, .08, .7], [.09, .015, .05], '#efd2c8');
  petal.visible = season === 'spring';
  petal.userData.dynamic = true;
  droplets.forEach(d => d.bead.userData.dynamic = true);
  const updateSeason = seasonDetails(season, { root, mesh, sphere, branch, leaf, random, ripple });
  batchStaticMeshes(root);
  const detailNames = { summer: ['盛夏荷塘','绣球含雨','荷叶凝珠','绿柳骤雨','荷花听雨','雨中长椅'], autumn: ['秋雨柳岸','林下秋菇','枯穗滴雨','金叶飘落','浮叶雨纹','秋日长椅'], winter: ['冬雨初融','红果寒枝','岸冰冷雨','疏柳冬雨','薄冰融池','冰凌滴水'] }[season];
  return {
    root, camera: [10, 8, 12], target: [0, 1.2, 0], minDistance: 1.2, maxDistance: 24,
    background: winter ? '#303e4e' : autumn ? '#45433b' : season === 'summer' ? '#203d3c' : '#263e42', lightColor: '#d5eeea', lightIntensity: 2.1,
    views: [
      ['柳岸全景', [10, 8, 12], [0, 1.2, 0]],
      ['风中小花', [-4.4, 1.55, 5], [-3.15, .45, 2.65]],
      ['草尖滴雨', [3.5, 1.45, 5], [2.45, .48, 2.9]],
      ['柳丝听雨', [0, 3.4, 5], [-2.3, 2.2, -1.35]],
      ['池面涟漪', [5.6, 4.7, 5], [1.25, .1, .5]],
      ['雨中长椅', [4.7, 2.7, -.8], [2.1, .65, -3.15]],
    ].map((view, i) => {
      if (!detailNames) return view;
      if (season === 'summer' && i === 2) return [detailNames[i], [3.5,2.5,4], [1.2,.5,.5]];
      if (autumn && i === 1) return [detailNames[i], [-4.8,1.3,2], [-3.5,.3,.1]];
      if (winter && i === 2) return [detailNames[i], [4.6,1.6,4], [2.6,.15,1.5]];
      return [detailNames[i], ...view.slice(1)];
    }),
    update(time) {
      updateSeason(time);
      const wind = Math.sin(time * .72) * .045 + Math.sin(time * 1.31) * .018;
      for (const s of sprays) { s.obj.rotation.z = wind * s.weight + Math.sin(time * 1.7 + s.phase) * .035; s.obj.rotation.x = Math.sin(time * 1.1 + s.phase) * .04; }
      for (const p of plants) { p.obj.rotation.z = wind + Math.sin(time * 1.9 + p.phase) * .04 * p.weight; p.obj.rotation.x = Math.cos(time * 1.3 + p.phase) * .025; }
      for (const d of droplets) {
        const cycle = (time * .38 + d.phase) % 1;
        const falling = Math.max(0, (cycle - .64) / .23);
        d.bead.visible = cycle < .87;
        d.bead.position.y = d.h - falling * falling * d.h;
        d.bead.scale.setScalar(cycle < .64 ? .012 + cycle * .037 : .035);
        d.bead.scale.y *= cycle < .64 ? 1.25 : 1.7;
        const splash = Math.max(0, (cycle - .87) / .13);
        d.ring.scale.setScalar(.01 + splash * .2); d.ring.material.opacity = cycle >= .87 ? (1 - splash) * .5 : 0;
      }
      for (let i = 0; i < count; i++) {
        const [a, b, c, speed] = rainSeeds[i], y = ((b * 6 - time * rainSpeed * (2.5 + speed) % 6) + 6) % 6;
        const x = (a - .5) * 10.3 + wind * y, z = (c - .5) * 10.3;
        const k = i * 6; positions[k] = x; positions[k + 1] = y; positions[k + 2] = z;
        positions[k + 3] = x - .025 - wind; positions[k + 4] = y + .13 + speed * .09; positions[k + 5] = z;
      }
      rainGeometry.attributes.position.needsUpdate = true;
      for (const r of rings) { const f = (time * .55 + r.phase) % 1; r.obj.scale.setScalar(.02 + f * .3); r.obj.material.opacity = (1 - f) ** 2 * .5; }
      petal.position.x = 1 + Math.sin(time * .18) * .3; petal.position.z = .7 + Math.cos(time * .15) * .2; petal.rotation.y = time * .12;
    },
  };
}
