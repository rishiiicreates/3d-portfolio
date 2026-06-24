import * as THREE from 'three';

export class SpaceDust {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);

    // 1. Dust Particles
    const count = 3000;
    const radius = 25000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random()); // Even distribution in sphere
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const speed = 0.2 + Math.random() * 0.6;
      const vDir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
      
      this.velocities[i * 3] = vDir.x * speed;
      this.velocities[i * 3 + 1] = vDir.y * speed;
      this.velocities[i * 3 + 2] = vDir.z * speed;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 15.0,
      color: 0x334466,
      transparent: true,
      opacity: 0.25,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.group.add(this.particles);

    // 2. Nebula Background Sprites
    const gradients = [
      ['#4a0080', 'rgba(74, 0, 128, 0)'],
      ['#001a4d', 'rgba(0, 26, 77, 0)'],
      ['#003333', 'rgba(0, 51, 51, 0)']
    ];

    const configs = [
      { pos: [-8000, 2000, -30000], scale: 30000 },
      { pos: [20000, -4000, -40000], scale: 40000 },
      { pos: [-25000, 6000, -50000], scale: 50000 }
    ];

    configs.forEach((config, i) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      grad.addColorStop(0, gradients[i][0]);
      grad.addColorStop(1, gradients[i][1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(...config.pos);
      sprite.scale.set(config.scale, config.scale, 1);
      
      this.group.add(sprite);
    });
  }

  update(time, delta) {
    const positions = this.particles.geometry.attributes.position.array;
    const count = positions.length / 3;

    for (let i = 0; i < count; i++) {
      positions[i * 3] += this.velocities[i * 3];
      positions[i * 3 + 1] += this.velocities[i * 3 + 1];
      positions[i * 3 + 2] += this.velocities[i * 3 + 2];

      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];

      if (x*x + y*y + z*z > 625000000) { // 25000^2
        // Wrap to opposite side
        positions[i * 3] *= -0.99;
        positions[i * 3 + 1] *= -0.99;
        positions[i * 3 + 2] *= -0.99;
      }
    }
    
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
}
