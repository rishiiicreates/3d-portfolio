import * as THREE from 'three';

export class Galaxies {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);
    this.galaxies = [];

    const numGalaxies = 8;
    const colors = [
      [255, 100, 255], // Pink
      [100, 200, 255], // Cyan
      [150, 100, 255], // Purple
      [255, 150, 100]  // Orange
    ];

    for (let i = 0; i < numGalaxies; i++) {
      const color = colors[i % colors.length];
      const texture = this.createGalaxyTexture(color);
      
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.6 + Math.random() * 0.4
      });

      const sprite = new THREE.Sprite(material);
      
      const radius = 60000 + Math.random() * 40000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      sprite.position.x = radius * Math.sin(phi) * Math.cos(theta);
      sprite.position.y = radius * Math.sin(phi) * Math.sin(theta);
      sprite.position.z = radius * Math.cos(phi);
      
      const scale = 15000 + Math.random() * 20000;
      sprite.scale.set(scale, scale, 1);
      
      // Store rotation speed
      this.galaxies.push({
        mesh: sprite,
        rotationSpeed: (Math.random() - 0.5) * 0.0005
      });
      
      this.group.add(sprite);
    }
  }

  createGalaxyTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const center = 256;

    // Background gradient
    const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
    grad.addColorStop(0, \`rgba(255, 255, 255, 1)\`);
    grad.addColorStop(0.1, \`rgba(\${color[0]}, \${color[1]}, \${color[2]}, 0.8)\`);
    grad.addColorStop(0.4, \`rgba(\${color[0]}, \${color[1]}, \${color[2]}, 0.2)\`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Spiral arms
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5000; i++) {
      const r = Math.random() * center;
      const theta = Math.random() * Math.PI * 2;
      
      // Force points into spiral shape
      const spiralOffset = r * 0.02;
      const arm = Math.floor(theta / (Math.PI)) * Math.PI; // 2 arms
      const distFromArm = Math.abs((theta + spiralOffset) % Math.PI);
      
      if (distFromArm < 0.5 + (r / center)) {
        const x = center + r * Math.cos(theta);
        const y = center + r * Math.sin(theta);
        
        const alpha = Math.random() * 0.5 * (1 - r / center);
        ctx.fillStyle = \`rgba(255, 255, 255, \${alpha})\`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return new THREE.CanvasTexture(canvas);
  }

  update(delta) {
    this.galaxies.forEach(galaxy => {
      // Sprites don't have rotation in 3D exactly like meshes, but we can rotate their material
      galaxy.mesh.material.rotation += galaxy.rotationSpeed;
    });
  }
}
