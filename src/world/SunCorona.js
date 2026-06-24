import * as THREE from 'three';

export class SunCorona {
  constructor(scene, position = new THREE.Vector3(0, 0, 0), radius = 250) {
    this.group = new THREE.Group();
    this.group.position.copy(position);
    scene.add(this.group);

    // Main PointLight
    this.light = new THREE.PointLight(0xFF8833, 5, 50000, 1.5);
    this.group.add(this.light);

    // Load Texture
    const textureLoader = new THREE.TextureLoader();
    const sunTexture = textureLoader.load('/textures/sun.jpg');
    sunTexture.colorSpace = THREE.SRGBColorSpace;

    // Solid Sun Sphere (No flares, no glows)
    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    const material = new THREE.MeshBasicMaterial({ 
      map: sunTexture,
      color: 0xFFFFFF
    });
    this.sunMesh = new THREE.Mesh(geometry, material);
    this.group.add(this.sunMesh);
  }

  update(time, delta) {
    if (this.sunMesh) {
      this.sunMesh.rotation.y += 0.1 * delta;
    }
  }
}
