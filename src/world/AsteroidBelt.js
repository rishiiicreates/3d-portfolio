import * as THREE from 'three';

export class AsteroidBelt {
  constructor(scene) {
    this.count = 2500; // Increased count for realism
    
    // Smooth 3D Noise for potato-like asteroid shapes
    const noise = (x, y, z) => {
      let n = Math.sin(x * 1.5) + Math.sin(y * 1.5) + Math.sin(z * 1.5);
      n += 0.5 * Math.sin(x * 3.0 + 1.2) + 0.5 * Math.sin(y * 3.0 + 2.3) + 0.5 * Math.sin(z * 3.0 + 3.4);
      return n * 0.2;
    };
    
    const geometry = new THREE.IcosahedronGeometry(1, 3); // High detail for smooth rock
    const posAttribute = geometry.attributes.position;
    const v = new THREE.Vector3();
    
    for (let i = 0; i < posAttribute.count; i++) {
      v.fromBufferAttribute(posAttribute, i);
      // Smooth deformation based on position
      const n = noise(v.x, v.y, v.z);
      v.normalize().multiplyScalar(1.0 + n);
      posAttribute.setXYZ(i, v.x, v.y, v.z);
    }
    geometry.computeVertexNormals(); // Crucial for lighting
    
    // Procedural Rock Texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    for (let x = 0; x < 256; x++) {
      for (let y = 0; y < 256; y++) {
        const val = Math.random() * 50 + 50; // Grayscale noise
        ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    
    const material = new THREE.MeshStandardMaterial({
      map: tex,
      bumpMap: tex,
      bumpScale: 0.05,
      color: new THREE.Color(0x888888),
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true // Gives a slightly faceted, realistic rocky look
    });

    this.instancedMesh = new THREE.InstancedMesh(geometry, material, this.count);
    this.instancedMesh.castShadow = true;
    this.instancedMesh.receiveShadow = true;
    
    this.dummy = new THREE.Object3D();
    
    // Data arrays
    this.rotations = new Float32Array(this.count * 3);
    this.orbitData = new Float32Array(this.count * 3);
    this.yOffsets = new Float32Array(this.count);
    this.scales = new Float32Array(this.count * 3);
    
    const BELT_RADIUS = 2600; // Between Mars (2100) and Jupiter (3200)
    const BELT_WIDTH = 450;

    for (let i = 0; i < this.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Gaussian-ish distribution for belt width
      const rRand = (Math.random() + Math.random() + Math.random() - 1.5) * 0.6;
      const radius = BELT_RADIUS + rRand * BELT_WIDTH;
      
      // Kepler-like speed (slower further out)
      const speed = 0.04 * (1000 / radius) + (Math.random() - 0.5) * 0.005; 
      
      const y = (Math.random() + Math.random() - 1.0) * 150; // Thicker in middle

      this.orbitData[i * 3] = angle;
      this.orbitData[i * 3 + 1] = radius;
      this.orbitData[i * 3 + 2] = speed;
      this.yOffsets[i] = y;

      const baseScale = 2.0 + Math.random() * 8.0; 
      const sx = baseScale * (0.7 + Math.random() * 0.6);
      const sy = baseScale * (0.7 + Math.random() * 0.6);
      const sz = baseScale * (0.7 + Math.random() * 0.6);
      
      this.scales[i * 3] = sx;
      this.scales[i * 3 + 1] = sy;
      this.scales[i * 3 + 2] = sz;

      // Subtle color variations (grey, brownish, dark)
      const cRand = Math.random();
      const color = new THREE.Color();
      if (cRand > 0.8) color.setHex(0x554433); // Brownish
      else if (cRand > 0.4) color.setHex(0x666666); // Grey
      else color.setHex(0x444444); // Dark
      
      this.instancedMesh.setColorAt(i, color);

      this.rotations[i * 3] = (Math.random() - 0.5) * 1.5;
      this.rotations[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      this.rotations[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      
      this.dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      this.dummy.scale.set(sx, sy, sz);
      this.dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) this.instancedMesh.instanceColor.needsUpdate = true;

    scene.add(this.instancedMesh);
  }

  update(time, delta) {
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
