import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Floor {
  constructor(physicsWorld, scene) {
    // ─── THREE.JS MESH ─────────────────────────────────────────────
    // Invisible plane to receive shadows
    const geometry = new THREE.PlaneGeometry(10000, 10000);
    const material = new THREE.ShadowMaterial({
      opacity: 0.3
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    // Visual Grid instead of a solid floor to look like space plane
    const grid = new THREE.GridHelper(100000, 1000, 0x001133, 0x000d22);
    grid.material.transparent = true;
    grid.material.opacity = 0.06;
    grid.material.depthWrite = false;
    grid.position.y = -0.1; // Slightly below so it doesn't z-fight
    scene.add(grid);

    // ─── CANNON.JS PHYSICS ─────────────────────────────────────────
    const shape = new CANNON.Plane();
    this.body = new CANNON.Body({
      mass: 0, // Static
      material: physicsWorld.defaultMaterial,
    });
    this.body.addShape(shape);
    // Rotate to match Three.js (Cannon planes face Z by default)
    this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    physicsWorld.world.addBody(this.body);
  }
}
