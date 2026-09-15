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
  const item = mesh(new THREE.BoxGeometry(...size), color, position);
  root.add(item);
  return item;
}

export function nightLantern() {
  const root = new THREE.Group();
  const animated = [];

  // Wet street and sidewalk.
  box(root, [18, .12, 14], '#202328', [0, -.08, 0]);
  box(root, [18, .18, 2.2], '#464744', [0, .02, 4.8]);
  box(root, [18, .03, .08], '#d6c28b', [0, .14, 3.65]);
  for (let i = -7; i <= 7; i += 1.2) {
    box(root, [.9, .01, .03], '#77736a', [i, .08, 4.35]);
  }

  // Main street building.
  box(root, [10, 8, .45], '#51443f', [-2.2, 4, -4.2]);
  box(root, [10.5, .25, .55], '#332b29', [-2.2, 8.1, -4.2]);

  // Windows and warm interiors.
  for (const x of [-5, -2.2, .6]) {
    for (const y of [5.1, 6.7]) {
      box(root, [1.5, .9, .05], '#18262b', [x, y, -3.95]);
      const glow = box(root, [1.25, .65, .02], '#dca95d', [x, y, -3.91]);
      animated.push(glow);
    }
  }

  // Ground floor shop.
  box(root, [4, 3.2, .25], '#634532', [-2.2, 1.7, -4]);
  box(root, [3.3, 2.5, .03], '#ffd17b', [-2.2, 1.7, -3.84]);
  box(root, [5.8, .5, .18], '#173f39', [-2.2, 3.45, -4]);

  // Sign board.
  box(root, [3.8, .45, .08], '#8c4437', [-2.2, 3.9, -3.75]);

  // Air conditioner and pipes.
  box(root, [1.1, .5, .5], '#b7b4aa', [1.8, 6, -3.7]);
  box(root, [.08, 2, .08], '#55585a', [2.4, 4.7, -3.7]);

  // Outdoor seating.
  box(root, [1.1, .08, 1], '#875432', [2.6, .6, .8]);
  box(root, [.12, .5, .12], '#493020', [2.6, .3, .8]);
  for (const x of [1.5, 3.7]) {
    box(root, [.55, .45, .55], '#875432', [x, .3, .8]);
  }

  // Lamp post and lantern.
  box(root, [.14, 4.5, .14], '#302820', [5, 2.2, -1]);
  const lantern = mesh(new THREE.SphereGeometry(.42, 20, 12), '#ffd36b', [5, 4.6, -1]);
  root.add(lantern);
  animated.push(lantern);

  // Plants and trash bin.
  for (const x of [-6, -5.3, 4]) {
    box(root, [.5, .4, .5], '#594332', [x, .2, 2]);
    root.add(mesh(new THREE.ConeGeometry(.5, 1.5, 8), '#315b45', [x, 1, 2]));
  }
  box(root, [.5, .9, .5], '#30383b', [4.5, .45, 2]);

  // Bicycle.
  for (const x of [-4.8, -3.5]) {
    root.add(mesh(new THREE.TorusGeometry(.38, .035, 8, 24), '#202124', [x, .38, .5]));
  }
  box(root, [1.4, .04, .04], '#444', [-4.15, .75, .5]);

  return {
    root,
    update(time) {
      animated.forEach((item, index) => {
        item.scale.setScalar(1 + Math.sin(time * 2 + index) * .04);
      });
    },
  };
}
