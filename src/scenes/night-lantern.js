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

function addBox(root, size, color, position) {
  const item = mesh(new THREE.BoxGeometry(...size), color, position);
  root.add(item);
  return item;
}

export function nightLantern() {
  const root = new THREE.Group();
  const animated = [];

  // Wet alley street.
  addBox(root, [16, 0.12, 12], '#24262b', [0, -0.08, 0]);
  addBox(root, [16, 0.12, 1.8], '#3d4142', [0, 0, 4.5]);
  addBox(root, [16, 0.03, 0.08], '#d7c38a', [0, 0.08, 3.55]);

  // Three-storey street facade.
  addBox(root, [8, 7, 0.35], '#51433d', [-2, 3.5, -4]);
  addBox(root, [3.2, 2.2, 0.08], '#18242a', [-2, 5.1, -3.78]);
  addBox(root, [3.2, 2.2, 0.08], '#18242a', [2, 5.1, -3.78]);

  // Shop front.
  addBox(root, [3, 3.2, 0.18], '#60432f', [-2, 1.6, -3.72]);
  addBox(root, [2.4, 2.5, 0.04], '#ffc66d', [-2, 1.55, -3.62]);
  addBox(root, [4.8, 0.45, 0.12], '#173f39', [-2, 3.35, -3.72]);

  // Outdoor seating.
  addBox(root, [0.9, 0.08, 0.9], '#8b5a35', [2, 0.55, 1]);
  addBox(root, [0.12, 0.5, 0.12], '#4b3020', [2, 0.25, 1]);
  addBox(root, [0.5, 0.45, 0.5], '#8b5a35', [3.2, 0.25, 1]);
  addBox(root, [0.5, 0.45, 0.5], '#8b5a35', [0.8, 0.25, 1]);

  // Street lamp and lantern.
  addBox(root, [0.12, 4, 0.12], '#302820', [5, 2, -1]);
  const lantern = mesh(new THREE.SphereGeometry(0.4, 20, 12), '#ffd36b', [5, 4, -1]);
  root.add(lantern);
  animated.push(lantern);

  // Plant boxes and street objects.
  [-5, -4.3, 3.8].forEach((x) => {
    addBox(root, [0.5, 0.4, 0.5], '#594332', [x, 0.2, 2]);
    root.add(mesh(new THREE.ConeGeometry(0.5, 1.4, 8), '#315b45', [x, 1, 2]));
  });

  // Bicycle silhouette.
  const wheel1 = mesh(new THREE.TorusGeometry(0.35, 0.035, 8, 24), '#202124', [-4, 0.38, 0.5]);
  const wheel2 = mesh(new THREE.TorusGeometry(0.35, 0.035, 8, 24), '#202124', [-2.8, 0.38, 0.5]);
  root.add(wheel1, wheel2);
  addBox(root, [1.2, 0.04, 0.04], '#444', [-3.4, 0.7, 0.5]);

  return {
    root,
    update(time) {
      animated.forEach((item) => {
        item.scale.setScalar(1 + Math.sin(time * 2) * 0.08);
      });
    },
  };
}
