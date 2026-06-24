import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Planets {
  constructor(physicsWorld, scene) {
    this.planets = [];
    this.time = 0;
    
    // Load textures
    const textureLoader = new THREE.TextureLoader();
    
    // Add Sun
    const sunTex = textureLoader.load('/textures/sun.jpg');
    sunTex.colorSpace = THREE.SRGBColorSpace;
    const sunGeom = new THREE.SphereGeometry(250, 64, 64);
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
    this.sunMesh = new THREE.Mesh(sunGeom, sunMat);
    this.sunMesh.position.set(0, 0, 0);
    scene.add(this.sunMesh);

    // Sun Physics (Static)
    const sunShape = new CANNON.Sphere(250);
    this.sunBody = new CANNON.Body({
      mass: 0,
      shape: sunShape,
      position: new CANNON.Vec3(0, 0, 0)
    });
    physicsWorld.world.addBody(this.sunBody);

    // Sun Light
    const sunLight = new THREE.PointLight(0xfff5e6, 2, 500);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Orbit paths config
    const layout = [
      { id: 'mercury',  name: 'Mercury', emoji: '📖', subtitle: 'Skills', color: 0x10B981, tex: '/textures/mercurymap.jpg',   radius: 60,  orbitDist: 600,  orbitSpeed: 0.18, offset: 4 },
      { id: 'venus',    name: 'Venus',   emoji: '📡', subtitle: 'Blog', color: 0x8B5CF6, tex: '/textures/venusmap.jpg',     radius: 70,  orbitDist: 1000, orbitSpeed: 0.12, offset: 5 },
      { id: 'earth',    name: 'Earth',   emoji: '🌍', subtitle: 'Who I Am', color: 0x3B82F6, tex: '/textures/earth_daymap.jpg', radius: 100, orbitDist: 1500, orbitSpeed: 0.1,  offset: 0 },
      { id: 'mars',     name: 'Mars',    emoji: '🔥', subtitle: 'My Projects', color: 0xEF4444, tex: '/textures/marsmap.jpg',      radius: 80,  orbitDist: 2100, orbitSpeed: 0.08, offset: 2 },
      { id: 'jupiter',  name: 'Jupiter', emoji: '✨', subtitle: 'My Story', color: 0xF59E0B, tex: '/textures/jupiter.jpg',      radius: 180, orbitDist: 3200, orbitSpeed: 0.05, offset: 1 },
      
      // Additional planets from the package
      { id: 'saturn',   name: 'Saturn',  emoji: '🪐', subtitle: 'Archives', color: 0xD97706, tex: '/textures/saturnmap.jpg',    radius: 160, orbitDist: 4400, orbitSpeed: 0.03, offset: 3, ringTex: '/textures/saturn_ring.png' },
      { id: 'uranus',   name: 'Uranus',  emoji: '🧊', subtitle: 'Experiments', color: 0x0EA5E9, tex: '/textures/uranus.jpg',       radius: 140, orbitDist: 5500, orbitSpeed: 0.02, offset: 4, ringTex: '/textures/uranus_ring.png' },
      { id: 'neptune',  name: 'Neptune', emoji: '🔗', subtitle: 'Connect', color: 0x06B6D4, tex: '/textures/neptune.jpg',      radius: 120, orbitDist: 6500, orbitSpeed: 0.015, offset: 3 },
      { id: 'pluto',    name: 'Pluto',   emoji: '🌑', subtitle: 'Secret', color: 0x64748B, tex: '/textures/plutomap.jpg',     radius: 40,  orbitDist: 7500, orbitSpeed: 0.01, offset: 2 }
    ];

    layout.forEach((config) => {
      // ─── THREE.JS ─────────────────────────
      const tex = textureLoader.load(config.tex);
      tex.colorSpace = THREE.SRGBColorSpace;
      
      const geom = new THREE.SphereGeometry(config.radius, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.5,
      });
      const mesh = new THREE.Mesh(geom, mat);
      
      // Placed exactly on Y=0 so the plane bisects it
      mesh.position.set(config.orbitDist, 0, 0); 
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      // Add Ring if configured
      let ringMesh = null;
      if (config.ringTex) {
        const rTex = textureLoader.load(config.ringTex);
        rTex.colorSpace = THREE.SRGBColorSpace;
        const rGeom = new THREE.RingGeometry(config.radius * 1.2, config.radius * 2.2, 64);
        // We need UV mapping for the ring texture to circle properly, 
        // but basic RingGeometry maps differently. Let's just use it with MeshStandardMaterial.
        const rMat = new THREE.MeshStandardMaterial({
          map: rTex,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide
        });
        ringMesh = new THREE.Mesh(rGeom, rMat);
        ringMesh.rotation.x = -Math.PI / 2.2; // Slight tilt
        scene.add(ringMesh);
      }

      // Label
      const label = document.createElement('div');
      label.className = 'planet-label';
      label.textContent = config.name;
      label.style.position = 'absolute';
      label.style.color = '#fff';
      label.style.fontFamily = 'Orbitron';
      label.style.pointerEvents = 'none';
      document.body.appendChild(label);

      // Orbit Line
      const orbitGeom = new THREE.BufferGeometry();
      const orbitPts = [];
      for (let i=0; i<=64; i++) {
        const a = (i/64) * Math.PI * 2;
        orbitPts.push(new THREE.Vector3(Math.cos(a)*config.orbitDist, 0, Math.sin(a)*config.orbitDist));
      }
      orbitGeom.setFromPoints(orbitPts);
      const orbitMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.3 });
      const orbitLine = new THREE.Line(orbitGeom, orbitMat);
      scene.add(orbitLine);

      // ─── CANNON.JS ─────────────────────────
      const shape = new CANNON.Sphere(config.radius);
      const body = new CANNON.Body({
        mass: 0, 
        type: CANNON.Body.KINEMATIC, // Moves via code, but pushes dynamic bodies
        shape: shape,
        position: new CANNON.Vec3(config.orbitDist, 0, 0)
      });
      physicsWorld.world.addBody(body);

      this.planets.push({
        id: config.id,
        name: config.name,
        mesh,
        ringMesh,
        body,
        label,
        radius: config.radius,
        orbitDist: config.orbitDist,
        orbitSpeed: config.orbitSpeed,
        offset: config.offset,
        config: { color: config.color, emoji: config.emoji, name: config.name, subtitle: config.subtitle }
      });
    });
  }

  update(delta, camera) {
    this.time += delta;
    
    // Rotate Sun
    this.sunMesh.rotation.y += delta * 0.05;

    // Orbit planets
    this.planets.forEach(p => {
      const angle = this.time * p.orbitSpeed + p.offset;
      const px = Math.cos(angle) * p.orbitDist;
      const pz = Math.sin(angle) * p.orbitDist;

      // Update Mesh & Physics Body
      p.mesh.position.set(px, 0, pz);
      if (p.ringMesh) {
        p.ringMesh.position.set(px, 0, pz);
      }
      p.body.position.set(px, 0, pz);
      
      p.mesh.rotation.y += delta * 0.2; // Axial rotation
      
      // Update label position
      const pos = p.mesh.position.clone();
      pos.y += p.radius + 3; 
      pos.project(camera);
      
      if (pos.z < 1) { // In front of camera
        const x = (pos.x * .5 + .5) * window.innerWidth;
        const y = (pos.y * -.5 + .5) * window.innerHeight;
        p.label.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
        p.label.style.display = 'block';
      } else {
        p.label.style.display = 'none';
      }
    });
  }
}
