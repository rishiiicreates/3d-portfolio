import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class AsteroidBelt {
  constructor(scene) {
    this.count = 1500; // Adjusted for performance with a real model
    this.scene = scene;
    
    this.dummy = new THREE.Object3D();
    
    // Data arrays
    this.rotations = new Float32Array(this.count * 3);
    this.orbitData = new Float32Array(this.count * 3);
    this.yOffsets = new Float32Array(this.count);
    this.scales = new Float32Array(this.count * 3);
    
    const BELT_RADIUS = 2600; 
    const BELT_WIDTH = 450;

    for (let i = 0; i < this.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rRand = (Math.random() + Math.random() + Math.random() - 1.5) * 0.6;
      const radius = BELT_RADIUS + rRand * BELT_WIDTH;
      const speed = 0.04 * (1000 / radius) + (Math.random() - 0.5) * 0.005; 
      const y = (Math.random() + Math.random() - 1.0) * 150;

      this.orbitData[i * 3] = angle;
      this.orbitData[i * 3 + 1] = radius;
      this.orbitData[i * 3 + 2] = speed;
      this.yOffsets[i] = y;

      const baseScale = 4.0 + Math.random() * 15.0; // Larger for real model
      const sx = baseScale * (0.8 + Math.random() * 0.4);
      const sy = baseScale * (0.8 + Math.random() * 0.4);
      const sz = baseScale * (0.8 + Math.random() * 0.4);
      
      this.scales[i * 3] = sx;
      this.scales[i * 3 + 1] = sy;
      this.scales[i * 3 + 2] = sz;

      this.rotations[i * 3] = (Math.random() - 0.5) * 1.5;
      this.rotations[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      this.rotations[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }

    // Load Real Asteroid Model
    const loader = new GLTFLoader();
    this.instancedMesh = null;

    loader.load(
      '/models/asteroid.glb',
      (gltf) => {
        let asteroidGeometry = null;
        let asteroidMaterial = null;

        // Extract first mesh geometry and material
        gltf.scene.traverse((child) => {
          if (child.isMesh && !asteroidGeometry) {
            asteroidGeometry = child.geometry;
            asteroidMaterial = child.material;
          }
        });

        if (asteroidGeometry && asteroidMaterial) {
          this.instancedMesh = new THREE.InstancedMesh(asteroidGeometry, asteroidMaterial, this.count);
          this.instancedMesh.castShadow = true;
          this.instancedMesh.receiveShadow = true;

          for (let i = 0; i < this.count; i++) {
            const angle = this.orbitData[i * 3];
            const radius = this.orbitData[i * 3 + 1];
            const y = this.yOffsets[i];
            const sx = this.scales[i * 3];
            const sy = this.scales[i * 3 + 1];
            const sz = this.scales[i * 3 + 2];

            this.dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
            this.dummy.scale.set(sx, sy, sz);
            this.dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            this.dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
          }
          this.instancedMesh.instanceMatrix.needsUpdate = true;
          this.scene.add(this.instancedMesh);
        }
      },
      undefined,
      (error) => {
        console.warn("Asteroid model not found. Drop a .glb file at /public/models/asteroid.glb");
      }
    );
  }

  update(time, delta) {
    if (!this.instancedMesh) return; // Wait until model loads

    for (let i = 0; i < this.count; i++) {
      this.orbitData[i * 3] += this.orbitData[i * 3 + 2] * delta;
      const angle = this.orbitData[i * 3];
      const radius = this.orbitData[i * 3 + 1];
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = this.yOffsets[i];

      this.dummy.position.set(x, y, z);
      this.dummy.scale.set(this.scales[i*3], this.scales[i*3+1], this.scales[i*3+2]);
      
      this.dummy.rotation.x += this.rotations[i * 3] * delta;
      this.dummy.rotation.y += this.rotations[i * 3 + 1] * delta;
      this.dummy.rotation.z += this.rotations[i * 3 + 2] * delta;
      
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }
}
