import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export class AsteroidBelt {
  constructor(scene) {
    this.scene = scene;
    this.totalCount = 1500;
    this.modelsCount = 3;
    this.countPerModel = Math.floor(this.totalCount / this.modelsCount);
    
    this.instancedMeshes = [];
    this.dummy = new THREE.Object3D();
    
    // Data arrays
    this.rotations = new Float32Array(this.totalCount * 3);
    this.orbitData = new Float32Array(this.totalCount * 3);
    this.yOffsets = new Float32Array(this.totalCount);
    this.scales = new Float32Array(this.totalCount * 3);
    
    const BELT_RADIUS = 2600; 
    const BELT_WIDTH = 450;

    for (let i = 0; i < this.totalCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rRand = (Math.random() + Math.random() + Math.random() - 1.5) * 0.6;
      const radius = BELT_RADIUS + rRand * BELT_WIDTH;
      const speed = 0.04 * (1000 / radius) + (Math.random() - 0.5) * 0.005; 
      const y = (Math.random() + Math.random() - 1.0) * 150;

      this.orbitData[i * 3] = angle;
      this.orbitData[i * 3 + 1] = radius;
      this.orbitData[i * 3 + 2] = speed;
      this.yOffsets[i] = y;

      const baseScale = 0.15 + Math.random() * 0.35; // Adjusted scale for FBX
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

    this.loadModels();
  }

  async loadModels() {
    const fbxLoader = new FBXLoader();
    const texLoader = new THREE.TextureLoader();

    for (let m = 1; m <= this.modelsCount; m++) {
      try {
        const basePath = `/models/asteroids/${m}`;
        
        // Load textures and model concurrently
        const [colorMap, normalMap, roughMap, fbx] = await Promise.all([
          texLoader.loadAsync(`${basePath}/color.png`),
          texLoader.loadAsync(`${basePath}/normal.png`),
          texLoader.loadAsync(`${basePath}/roughness.png`),
          fbxLoader.loadAsync(`${basePath}/model.fbx`)
        ]);

        colorMap.colorSpace = THREE.SRGBColorSpace;
        
        let asteroidGeometry = null;
        
        fbx.traverse((child) => {
          if (child.isMesh && !asteroidGeometry) {
            asteroidGeometry = child.geometry;
          }
        });

        if (asteroidGeometry) {
          const material = new THREE.MeshStandardMaterial({
            map: colorMap,
            normalMap: normalMap,
            roughnessMap: roughMap,
            roughness: 1.0,
            metalness: 0.1
          });

          const instancedMesh = new THREE.InstancedMesh(asteroidGeometry, material, this.countPerModel);
          instancedMesh.castShadow = true;
          instancedMesh.receiveShadow = true;

          const startIndex = (m - 1) * this.countPerModel;
          
          for (let i = 0; i < this.countPerModel; i++) {
            const globalIdx = startIndex + i;
            const angle = this.orbitData[globalIdx * 3];
            const radius = this.orbitData[globalIdx * 3 + 1];
            const y = this.yOffsets[globalIdx];
            const sx = this.scales[globalIdx * 3];
            const sy = this.scales[globalIdx * 3 + 1];
            const sz = this.scales[globalIdx * 3 + 2];

            this.dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
            this.dummy.scale.set(sx, sy, sz);
            this.dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            this.dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, this.dummy.matrix);
          }
          
          instancedMesh.instanceMatrix.needsUpdate = true;
          this.scene.add(instancedMesh);
          this.instancedMeshes.push({ mesh: instancedMesh, startIndex });
        }
      } catch(e) {
        console.warn(`Failed to load asteroid model ${m}`, e);
      }
    }
  }

  update(time, delta) {
    if (this.instancedMeshes.length === 0) return;

    for (const { mesh, startIndex } of this.instancedMeshes) {
      for (let i = 0; i < this.countPerModel; i++) {
        const globalIdx = startIndex + i;
        
        this.orbitData[globalIdx * 3] += this.orbitData[globalIdx * 3 + 2] * delta;
        const angle = this.orbitData[globalIdx * 3];
        const radius = this.orbitData[globalIdx * 3 + 1];
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = this.yOffsets[globalIdx];

        this.dummy.position.set(x, y, z);
        this.dummy.scale.set(this.scales[globalIdx*3], this.scales[globalIdx*3+1], this.scales[globalIdx*3+2]);
        
        this.dummy.rotation.x += this.rotations[globalIdx * 3] * delta;
        this.dummy.rotation.y += this.rotations[globalIdx * 3 + 1] * delta;
        this.dummy.rotation.z += this.rotations[globalIdx * 3 + 2] * delta;
        
        this.dummy.updateMatrix();
        mesh.setMatrixAt(i, this.dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  }
}
