import * as THREE from 'three';

export class RealSpace {
  constructor(scene) {
    this.scene = scene;
    
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/textures/milkyway.jpg', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      
      // Set as background and environment map
      scene.background = texture;
      scene.environment = texture;
      
      // Optional: adjust the rotation of the background
      scene.backgroundRotation.set(Math.PI / 8, Math.PI / 4, 0);
      scene.environmentRotation.set(Math.PI / 8, Math.PI / 4, 0);
      
      // Adjust ambient intensity since we now have a bright environment map
      scene.backgroundIntensity = 1.0;
    });
  }

  update(delta) {
    // The background rotates with the camera naturally in Three.js
  }
}
