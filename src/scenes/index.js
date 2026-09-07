import { city } from './city.js';
import * as THREE from 'three';

function mesh(geometry, color, position = [0,0,0]) {
  const object = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.8 }));
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

function forest() {
  const root = new THREE.Group();
  root.add(mesh(new THREE.CylinderGeometry(4, 3.1, 1.2, 8), '#53604b', [0,-0.8,0]));
  root.add(mesh(new THREE.CylinderGeometry(4.05, 4.05, 0.18, 8), '#72ac72', [0,-0.12,0]));
  const positions = [[-2,0,-1],[-1,0,-2],[1,0,-1.8],[2.2,0,0.1],[-2,0,1.3],[0.4,0,1.8]];
  positions.forEach(([x,y,z], i) => {
    const tree = new THREE.Group();
    tree.add(mesh(new THREE.CylinderGeometry(0.13,0.18,1.2,6), '#876043', [0,0.5,0]));
    tree.add(mesh(new THREE.ConeGeometry(0.75,1.8,7), i % 2 ? '#258a76' : '#24745c', [0,1.6,0]));
    tree.add(mesh(new THREE.ConeGeometry(0.55,1.4,7), '#40a188', [0,2.3,0]));
    tree.position.set(x,y,z);
    root.add(tree);
  });
  root.add(mesh(new THREE.BoxGeometry(0.9,0.65,0.9), '#ead2a4', [0,0.3,0]));
  const roof = mesh(new THREE.ConeGeometry(0.85,0.65,4), '#d57b4e', [0,0.95,0]);
  roof.rotation.y = Math.PI / 4;
  root.add(roof);
  return { root, update: (time) => { root.position.y = Math.sin(time * 0.65) * 0.08; } };
}

function orbit() {
  const root = new THREE.Group();
  const planet = mesh(new THREE.SphereGeometry(1.7,48,32), '#447ec7');
  root.add(planet);
  const ring = mesh(new THREE.TorusGeometry(2.6,0.18,12,100), '#e1b67b');
  ring.rotation.x = Math.PI * 0.62;
  root.add(ring);
  const moon = mesh(new THREE.IcosahedronGeometry(0.38,1), '#bed5e8');
  root.add(moon);
  return { root, update: (time) => {
    planet.rotation.y = time * 0.15;
    moon.position.set(Math.cos(time * 0.45) * 3.7, Math.sin(time * 0.45) * 0.8, Math.sin(time * 0.45) * 3.7);
  }};
}

// Each factory returns a fresh root and an update(timeInSeconds) callback.
// Keep GPU resources owned by that root; the viewer disposes them on switching.
export const scenes = [
  { id:'city', title:'街角 · 面包与日常', description:'烘焙咖啡店、饮料贩卖机与楼上的家。选择近景视角，放大观察物体结构。', create:city },
  { id:'forest', title:'森林小岛', description:'一座悬浮的小岛，一间藏在松林里的小屋。', create:forest },
  { id:'orbit', title:'轨道星球', description:'沿着倾斜的星环，观察一颗缓慢公转的卫星。', create:orbit }
];
