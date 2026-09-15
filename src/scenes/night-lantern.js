import * as THREE from 'three';

function mesh(geometry, color, position = [0, 0, 0]) {
  const object = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
  );
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

export function nightLantern() {
  const root = new THREE.Group();
  const lights = [];

  root.add(mesh(new THREE.BoxGeometry(5, 0.2, 4), '#252329', [0, -0.1, 0]));
  root.add(mesh(new THREE.BoxGeometry(2.8, 1.8, 0.5), '#5b3b2d', [0, 0.9, -1]));
  root.add(mesh(new THREE.BoxGeometry(0.3, 1.5, 1.5), '#b27b45', [-1.6, 0.8, 0]));

  const table = mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.12, 24), '#8b5a35', [0.4, 0.5, 0.4]);
  root.add(table);
  root.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 12), '#5a3a25', [0.4, 0.25, 0.4]));

  const lamp = mesh(new THREE.SphereGeometry(0.25, 16, 12), '#ffd36b', [0, 1.9, 0]);
  root.add(lamp);
  lights.push(lamp);

  const sign = mesh(new THREE.BoxGeometry(1.6, 0.45, 0.06), '#8b4338', [0, 2.3, -1.3]);
  root.add(sign);

  return {
    root,
    update(time) {
      lights.forEach((light) => {
        light.scale.setScalar(1 + Math.sin(time * 2) * 0.08);
      });
    },
  };
}
