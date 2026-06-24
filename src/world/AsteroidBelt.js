import * as THREE from 'three';

export class AsteroidBelt {
  constructor(scene) {
    this.count = 1000;
    
    // Create a base geometry and randomly perturb vertices for a rocky look
    const geometry = new THREE.IcosahedronGeometry(1, 1);
    const posAttribute = geometry.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
      const vertex = new THREE.Vector3().fromBufferAttribute(posAttribute, i);
      vertex.normalize().multiplyScalar(1 + (Math.random() - 0.5) * 0.4);
      posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0, 0, 0.4),
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true // Makes it look rocky
    });

    this.instancedMesh = new THREE.InstancedMesh(geometry, material, this.count);
    this.instancedMesh.castShadow = true;
    this.instancedMesh.receiveShadow = true;
    
    this.dummy = new THREE.Object3D();
    
    // Data arrays for orbit and rotation
    this.rotations = new Float32Array(this.count * 3);
    this.orbitData = new Float32Array(this.count * 3); // [angle, radius, speed]
    this.yOffsets = new Float32Array(this.count); // Fixed Y offset
    this.scales = new Float32Array(this.count * 3); // Non-uniform scaling for irregular shapes
    
    const BELT_RADIUS = 1350; 
    const BELT_WIDTH = 800;

    for (let i = 0; i < this.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = BELT_RADIUS + (Math.random() - 0.5) * BELT_WIDTH;
      const speed = (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1); // Some move opposite
      const y = (Math.random() - 0.5) * 200;

      this.orbitData[i * 3] = angle;
      this.orbitData[i * 3 + 1] = radius;
      this.orbitData[i * 3 + 2] = speed;
      this.yOffsets[i] = y;

      const baseScale = 1.0 + Math.random() * 6.0; // Much smaller, more realistic
      // Irregular scaling for each axis
      const sx = baseScale * (0.6 + Math.random() * 0.8);
      const sy = baseScale * (0.6 + Math.random() * 0.8);
      const sz = baseScale * (0.6 + Math.random() * 0.8);
      
      this.scales[i * 3] = sx;
      this.scales[i * 3 + 1] = sy;
      this.scales[i * 3 + 2] = sz;

      // Random color variations
      const color = new THREE.Color().setHSL(0, 0, 0.3 + Math.random() * 0.2);
      this.instancedMesh.setColorAt(i, color);

      // Store rotation speeds
      this.rotations[i * 3] = (Math.random() - 0.5) * 2.0;
      this.rotations[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
      this.rotations[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
      
      // Initialize matrix
      this.dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      this.dummy.scale.set(sx, sy, sz);
      this.dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    this.instancedMesh.instanceColor.needsUpdate = true;

    scene.add(this.instancedMesh);
  }

  update(time, delta) {
    for (let i = 0; i < this.count; i++) {
      // Update Orbit
      this.orbitData[i * 3] += this.orbitData[i * 3 + 2] * delta; // angle += speed * delta
      const angle = this.orbitData[i * 3];
      const radius = this.orbitData[i * 3 + 1];
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = this.yOffsets[i];

      // Reconstruct matrix from scratch to avoid matrix decomposition overhead
      this.dummy.position.set(x, y, z);
      this.dummy.scale.set(this.scales[i*3], this.scales[i*3+1], this.scales[i*3+2]);
      
      // Update Rotation
      this.dummy.rotation.x += this.rotations[i * 3] * delta;
      this.dummy.rotation.y += this.rotations[i * 3 + 1] * delta;
      this.dummy.rotation.z += this.rotations[i * 3 + 2] * delta;
      
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }
}
