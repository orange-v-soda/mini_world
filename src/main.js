import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { scenes } from './scenes/index.js';
import './style.css';

const viewport = document.querySelector('#viewport');
const select = document.querySelector('#scene');
const motion = document.querySelector('#motion');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
let active;
let elapsed = 0;
let previous = 0;

function disposeRoot(root) {
  const geometries = new Set();
  const materials = new Set();
  root.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m));
  });
  geometries.forEach(g => g.dispose());
  const textures = new Set();
  materials.forEach(m => { for (const value of Object.values(m)) if(value?.isTexture) textures.add(value); m.dispose(); });
  textures.forEach(t => t.dispose());
}

function start() {
  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  viewport.append(renderer.domElement);
  const world = new THREE.Scene();
  world.background = new THREE.Color('#091322');
  const camera = new THREE.PerspectiveCamera(42,1,0.1,100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 6;
  controls.maxDistance = 22;
  controls.enablePan = true;
  controls.maxPolarAngle = Math.PI * .49;
  world.add(new THREE.HemisphereLight('#c7eaff','#514934',1.7));
  const sun = new THREE.DirectionalLight('#ffe1b0',4);
  sun.position.set(5,8,4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048,2048);
  sun.shadow.normalBias = .025;
  Object.assign(sun.shadow.camera, { left:-10, right:10, top:10, bottom:-10 });
  world.add(sun);

  function reset() {
    camera.position.set(...(active?.camera || [9,7,10]));
    controls.target.set(...(active?.target || [0,.4,0]));
    controls.minDistance = active?.minDistance ?? 6;
    controls.maxDistance = active?.maxDistance ?? 22;
    controls.update();
  }
  const views = document.createElement('div');
  views.className = 'toolbar'; views.setAttribute('aria-label','城市细节视角');
  viewport.before(views);
  const presets = [
    ['街角全景',[12,9,15],[-.4,2.5,0]],
    ['店铺与陈列',[-1,2.6,7],[-1,1.6,-1]],
    ['自动贩卖机',[5.2,2.4,5],[2.9,1.35,.9]],
    ['二楼客厅',[-2.5,4.8,5],[-2.5,4,-1.7]],
    ['二楼卧室',[.5,4.8,5],[.5,3.95,-1.7]],
    ['街边设施',[9,4,3],[2.8,1.5,-2.1]],
  ];
  function updateViews(definition) {
    const choices = active.views || (definition.id === 'city' ? presets : []);
    views.replaceChildren();
    views.setAttribute('aria-label', definition.title + '细节视角');
    views.hidden = choices.length === 0;
    views.style.display = choices.length ? 'flex' : 'none';
    choices.forEach(([name, position, target]) => {
      const button = document.createElement('button'); button.textContent = name;
      button.addEventListener('click', () => {
        camera.position.set(...position); controls.target.set(...target); controls.update();
      });
      views.append(button);
    });
  }
  function switchScene() {
    const definition = scenes.find(s => s.id === select.value) || scenes[0];
    if(active) { world.remove(active.root); disposeRoot(active.root); }
    active = definition.create();
    updateViews(definition);
    world.background.set(active.background || '#091322');
    sun.color.set(active.lightColor || '#ffe1b0');
    sun.intensity = active.lightIntensity ?? 4;
    world.add(active.root);
    elapsed = 0;
    active.update(0);
    document.querySelector('#title').textContent = definition.title;
    document.querySelector('#description').textContent = definition.description;
    document.querySelector('#number').textContent = 'WORLD ' + String(scenes.indexOf(definition)+1).padStart(2,'0');
    reset();
  }
  scenes.forEach(s => select.add(new Option(s.title,s.id)));
  select.addEventListener('change',switchScene);
  document.querySelector('#reset').addEventListener('click',reset);
  function updateMotion() {
    motion.textContent = paused ? '播放动画' : '暂停动画';
    motion.setAttribute('aria-pressed', String(paused));
  }
  motion.addEventListener('click', () => { paused = !paused; updateMotion(); });
  updateMotion();
  switchScene();
  const observer = new ResizeObserver(() => {
    const { width, height } = viewport.getBoundingClientRect();
    camera.aspect = width / Math.max(height,1);
    camera.updateProjectionMatrix();
    renderer.setSize(width,height);
  });
  observer.observe(viewport);
  renderer.setAnimationLoop((timestamp) => {
    const delta = previous ? Math.min((timestamp-previous)/1000,0.05) : 0;
    previous = timestamp;
    if(!paused && !document.hidden) elapsed += delta;
    active.update(elapsed);
    controls.update();
    renderer.render(world,camera);
  });
  const cleanup = () => {
    renderer.setAnimationLoop(null);
    observer.disconnect();
    controls.dispose();
    disposeRoot(active.root);
    sun.shadow.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    views.remove();
  };
  if(import.meta.hot) import.meta.hot.dispose(cleanup);
}

try { start(); } catch(error) {
  console.error(error);
  const message = document.querySelector('#error');
  message.hidden = false;
  message.textContent = '无法启动 3D 场景。请使用支持 WebGL 2 的浏览器，并开启硬件加速后刷新页面。';
  document.querySelectorAll('button,select').forEach(control => { control.disabled = true; });
}
