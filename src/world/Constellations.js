import * as THREE from 'three';

export class Constellations {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);
    
    const numConstellations = 15;
    const material = new THREE.LineBasicMaterial({
      color: 0x88CCFF,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < numConstellations; i++) {
      const numStars = 4 + Math.floor(Math.random() * 5); // 4 to 8 stars
      const points = [];
      
      // Center of the constellation
      const radius = 70000;
      const thetaC = Math.random() * Math.PI * 2;
      const phiC = Math.acos(2 * Math.random() - 1);
      
      let currentTheta = thetaC;
      let currentPhi = phiC;
      
      for (let j = 0; j < numStars; j++) {
        const x = radius * Math.sin(currentPhi) * Math.cos(currentTheta);
        const y = radius * Math.sin(currentPhi) * Math.sin(currentTheta);
        const z = radius * Math.cos(currentPhi);
        
        points.push(new THREE.Vector3(x, y, z));
        
        // Random walk for the next star
        currentTheta += (Math.random() - 0.5) * 0.15;
        currentPhi += (Math.random() - 0.5) * 0.15;
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      
      this.group.add(line);
      
      // Add slightly larger stars at the vertices
      const starGeo = new THREE.BufferGeometry().setFromPoints(points);
      const starMat = new THREE.PointsMaterial({
        size: 250,
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const stars = new THREE.Points(starGeo, starMat);
      this.group.add(stars);
    }
  }

  update(delta) {
    // Optional: add slow rotation or pulsing opacity
  }
}
