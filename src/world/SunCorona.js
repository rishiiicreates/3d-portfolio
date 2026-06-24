import * as THREE from 'three';

export class SunCorona {
  constructor(scene, position = new THREE.Vector3(0, 0, 0), radius = 250) {
    this.group = new THREE.Group();
    this.group.position.copy(position);
    scene.add(this.group);

    // Main PointLight
    this.light = new THREE.PointLight(0xFF8833, 5, 50000, 1.5);
    this.group.add(this.light);

    // Layers
    this.halo = this.createSprite(this.createGlowCanvas('#FF2200', 'rgba(0,0,0,0)'), radius * 12, 0.4);
    this.outerRays = this.createSprite(this.createRaysCanvas('#FF4400', 40, 0.6), radius * 9, 0.6);
    this.innerRays = this.createSprite(this.createRaysCanvas('#FF8800', 60, 0.4), radius * 6, 0.8);
    this.core = this.createSprite(this.createGlowCanvas('#FFFFFF', '#FFAA00'), radius * 4, 1.0);

    this.group.add(this.halo);
    this.group.add(this.outerRays);
    this.group.add(this.innerRays);
    this.group.add(this.core);
  }

  createGlowCanvas(innerColor, outerColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(0.2, innerColor);
    grad.addColorStop(0.6, outerColor);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    return canvas;
  }

  createRaysCanvas(color, numRays, lengthJitter) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.translate(256, 256);
    
    for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 2 + Math.random() * 0.1;
        ctx.save();
        ctx.rotate(angle);
        
        ctx.beginPath();
        const length = 256 * (1 - Math.random() * lengthJitter);
        const width = 8 + Math.random() * 8;
        
        ctx.moveTo(-width, 0);
        ctx.lineTo(0, length);
        ctx.lineTo(width, 0);
        
        const grad = ctx.createLinearGradient(0, 0, 0, length);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    }
    return canvas;
  }

  createSprite(canvas, scale, opacity) {
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(scale, scale, 1);
    sprite.userData.baseScale = scale;
    return sprite;
  }

  update(time, delta) {
    // Rotate rays
    this.innerRays.material.rotation += 0.5 * delta;
    this.outerRays.material.rotation -= 0.3 * delta;

    // Pulse scale slightly
    const pulse = Math.sin(time * 2.0) * 0.02 + 1.0;
    
    [this.core, this.innerRays, this.outerRays, this.halo].forEach((sprite, index) => {
      const s = sprite.userData.baseScale * (pulse + index * 0.01);
      sprite.scale.set(s, s, 1);
    });
  }
}
