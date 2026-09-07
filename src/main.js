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
  materials.forEach(m => m.dispose());
}

function start() {
  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  viewport.append(renderer.domElement);
  const world = new THREE.Scene();
  world.background = new THREE.Color('#091322');
  const camera = new THREE.PerspectiveCamera(42,1,0.1,100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 6;
  controls.maxDistance = 22;
  controls.enablePan = false;
  world.add(new THREE.HemisphereLight('#c7eaff','#514934',3));
  const sun = new THREE.DirectionalLight('#ffe1b0',4);
  sun.position.set(5,8,4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera, { left:-6, right:6, top:6, bottom:-6 });
  world.add(sun);

  function reset() {
    camera.position.set(9,7,10);
    controls.target.set(0,0.4,0);
    controls.update();
  }
  function switchScene() {
    const definition = scenes.find(s => s.id === select.value) || scenes[0];
    if(active) { world.remove(active.root); disposeRoot(active.root); }
    active = definition.create();
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
