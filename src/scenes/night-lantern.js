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

function box(root, size, color, position) {
  root.add(mesh(new THREE.BoxGeometry(...size), color, position));
}

export function nightLantern() {
  const root = new THREE.Group();
  const animated = [];

  // Wet night street, pavement and curb.
  box(root, [12, 0.15, 10], '#25262b', [0, -0.1, 0]);
  box(root, [12, 0.06, 1.2], '#3b3b3d', [0, 0, 3.8]);
  box(root, [12, 0.08, 0.08], '#d7c38a', [0, 0.05, 3.15]);

  // Narrow alley building facade.
  box(root, [7, 4.8, 0.35], '#473b39', [-1, 2.3, -3.8]);
  box(root, [2.8, 2.5, 0.12], '#16252b', [-1, 2.2, -3.62]);

  // Bakery / bar entrance with warm interior.
  box(root, [2.2, 2.8, 0.18], '#6b4832', [0.2, 1.4, -3.55]);
  box(root, [1.7, 1.9, 0.04], '#ffc66d', [0.2, 1.35, -3.43]);

  // Wooden sign.
  box(root, [2.6, 0.5, 0.12], '#8b4338', [-1, 4.1, -3.55]);

  // Street furniture.
  box(root, [0.8, 0.08, 0.8], '#8b5a35', [2.2, 0.55, 1]);
  box(root, [0.12, 0.5, 0.12], '#4b3020', [2.2, 0.25, 1]);
  box(root, [0.45, 0.08, 0.45], '#a06b3d', [3, 0.55, 1]);

  // Lantern poles.
  box(root, [0.12, 3.2, 0.12], '#302820', [3.8, 1.6, -0.8]);
  const lantern = mesh(new THREE.SphereGeometry(0.35, 16, 12), '#ffd36b', [3.8, 3.1, -0.8]);
  root.add(lantern);
  animated.push(lantern);

  // Plants and street details.
  for (const x of [-3.3, -2.9, 2.9]) {
    box(root, [0.35, 0.35, 0.35], '#594332', [x, 0.2, 1.8]);
    const plant = mesh(new THREE.ConeGeometry(0.45, 1.2, 8), '#315b45', [x, 0.9, 1.8]);
    root.add(plant);
  }

  return {
    root,
    update(time) {
      animated.forEach((item) => {
        item.scale.setScalar(1 + Math.sin(time * 2) * 0.06);
      });
    },
  };
}
