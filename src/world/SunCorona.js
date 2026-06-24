import * as THREE from 'three';

export class SunCorona {
  constructor(scene, position = new THREE.Vector3(0, 0, 0), radius = 250) {
    this.group = new THREE.Group();
    this.group.position.copy(position);
    scene.add(this.group);

    // Main PointLight
    this.light = new THREE.PointLight(0xFF8833, 5, 50000, 1.5);
    this.group.add(this.light);

    // Layers (Only core remains)
    this.core = this.createSprite(this.createGlowCanvas('#FFFFFF', '#FFAA00'), radius * 4, 1.0);
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
    // Pulse scale slightly
    const pulse = Math.sin(time * 2.0) * 0.02 + 1.0;
    const s = this.core.userData.baseScale * pulse;
    this.core.scale.set(s, s, 1);
  }
}
