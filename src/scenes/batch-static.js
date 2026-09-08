import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Merge only static siblings. Moving parent groups retain their animation,
// while explicitly animated meshes and transparent water remain independent.
export function batchStaticMeshes(root) {
  const parents=[]; root.traverse(o => { if(o.children.length) parents.push(o); });
  const retired=new Set();
  for(const parent of parents) {
    const buckets=new Map();
    for(const mesh of [...parent.children]) {
      if(!mesh.isMesh || mesh.isInstancedMesh || mesh.children.length || mesh.userData.dynamic ||
         Array.isArray(mesh.material) || mesh.material.transparent) continue;
      const key=mesh.material.uuid+mesh.castShadow+mesh.receiveShadow;
      if(!buckets.has(key)) buckets.set(key,[]);
      buckets.get(key).push(mesh);
    }
    for(const list of buckets.values()) {
      if(list.length<2) continue;
      const copies=list.map(m => {m.updateMatrix();return m.geometry.clone().applyMatrix4(m.matrix);});
      const merged=mergeGeometries(copies,false);
      copies.forEach(g=>g.dispose());
      if(!merged) continue;
      const mesh=new T.Mesh(merged,list[0].material);
      mesh.castShadow=list[0].castShadow;mesh.receiveShadow=list[0].receiveShadow;
      for(const old of list){parent.remove(old);retired.add(old.geometry);}
      parent.add(mesh);
    }
  }
  const retained=new Set();root.traverse(o=>{if(o.geometry)retained.add(o.geometry);});
  retired.forEach(g=>{if(!retained.has(g))g.dispose();});
}
