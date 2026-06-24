import * as THREE from 'three';

export class StarField {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);

    // Layer 1 - Deep field
    this.layer1Group = new THREE.Group();
    this.createLayer1();
    this.group.add(this.layer1Group);

    // Layer 2 - Mid field
    this.layer2Group = new THREE.Group();
    this.createLayer2();
    this.group.add(this.layer2Group);

    // Layer 3 - Near field
    this.layer3Group = new THREE.Group();
    this.createLayer3();
    this.group.add(this.layer3Group);
  }

  createLayer1() {
    const geometry = new THREE.BufferGeometry();
    const count = 8000;
    const radius = 80000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 4.0,
      color: 0xE8F4FF,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });

    this.layer1 = new THREE.Points(geometry, material);
    this.layer1Group.add(this.layer1);
  }

  createLayer2() {
    this.layer2Geometry = new THREE.BufferGeometry();
    const count = 3000;
    const radius = 50000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    this.layer2Phases = new Float32Array(count);
    this.layer2Colors = new Float32Array(count * 3);

    const baseColors = [
      new THREE.Color(0xFFFFFF),
      new THREE.Color(0xCCE8FF),
      new THREE.Color(0xFFE4CC)
    ];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = baseColors[Math.floor(Math.random() * baseColors.length)];
      this.layer2Colors[i * 3] = color.r;
      this.layer2Colors[i * 3 + 1] = color.g;
      this.layer2Colors[i * 3 + 2] = color.b;

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      this.layer2Phases[i] = Math.random() * Math.PI * 2;
    }

    this.layer2Geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.layer2Geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 7.0,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.layer2 = new THREE.Points(this.layer2Geometry, material);
    this.layer2Group.add(this.layer2);
  }

  createLayer3() {
    const count = 500;
    const radius = 30000;

    // Generate radial gradient texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    
    const baseColors = [0xFFF8DC, 0xFFE4B5];

    for (let i = 0; i < count; i++) {
      const material = new THREE.SpriteMaterial({
        map: texture,
        color: baseColors[Math.floor(Math.random() * baseColors.length)],
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const sprite = new THREE.Sprite(material);
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      sprite.position.x = radius * Math.sin(phi) * Math.cos(theta);
      sprite.position.y = radius * Math.sin(phi) * Math.sin(theta);
      sprite.position.z = radius * Math.cos(phi);
      
      sprite.scale.set(80, 80, 1);
      
      this.layer3Group.add(sprite);
    }
  }

  update(time, delta, shipPosition) {
    // Parallax
    if (shipPosition) {
      this.layer1Group.position.lerp(shipPosition.clone().multiplyScalar(0.02), 0.05);
      this.layer2Group.position.lerp(shipPosition.clone().multiplyScalar(0.05), 0.05);
      this.layer3Group.position.lerp(shipPosition.clone().multiplyScalar(0.1), 0.05);
    }

    // Twinkling for Layer 2
    if (this.layer2Geometry) {
      const colors = this.layer2Geometry.attributes.color.array;
      for (let i = 0; i < this.layer2Phases.length; i++) {
        const intensity = Math.sin(time + this.layer2Phases[i]) * 0.3 + 0.7;
        colors[i * 3] = this.layer2Colors[i * 3] * intensity;
        colors[i * 3 + 1] = this.layer2Colors[i * 3 + 1] * intensity;
        colors[i * 3 + 2] = this.layer2Colors[i * 3 + 2] * intensity;
      }
      this.layer2Geometry.attributes.color.needsUpdate = true;
    }
  }
}
