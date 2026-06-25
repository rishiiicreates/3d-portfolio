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

    // Orbit paths config (orbitSpeed relative to Earth's 0.1, rotationSpeed relative to Earth's 0.2)
    const layout = [
      { id: 'mercury',  name: 'Mercury', emoji: '📖', subtitle: 'Skills', color: 0x10B981, tex: '/textures/mercurymap.jpg',   radius: 60,  orbitDist: 600,  orbitSpeed: 0.416, offset: 4, inclination: 0.122, rotationSpeed: 0.0034 },
      { id: 'venus',    name: 'Venus',   emoji: '📡', subtitle: 'Blog', color: 0x8B5CF6, tex: '/textures/venusmap.jpg',     radius: 70,  orbitDist: 1000, orbitSpeed: 0.162, offset: 5, inclination: 0.059, rotationSpeed: -0.0008 },
      { id: 'earth',    name: 'Earth',   emoji: '🌍', subtitle: 'Who I Am', color: 0x3B82F6, tex: '/textures/earth_daymap.jpg', radius: 100, orbitDist: 1500, orbitSpeed: 0.1,  offset: 0, inclination: 0.000, rotationSpeed: 0.2 },
      { id: 'mars',     name: 'Mars',    emoji: '🔥', subtitle: 'My Projects', color: 0xEF4444, tex: '/textures/marsmap.jpg',      radius: 80,  orbitDist: 2100, orbitSpeed: 0.053, offset: 2, inclination: 0.032, rotationSpeed: 0.194 },
      { id: 'jupiter',  name: 'Jupiter', emoji: '✨', subtitle: 'My Story', color: 0xF59E0B, tex: '/textures/jupiter.jpg',      radius: 180, orbitDist: 3200, orbitSpeed: 0.0084, offset: 1, inclination: 0.023, rotationSpeed: 0.48 },
      
      // Additional planets from the package
      { id: 'saturn',   name: 'Saturn',  emoji: '🪐', subtitle: 'Archives', color: 0xD97706, tex: '/textures/saturnmap.jpg',    radius: 160, orbitDist: 4400, orbitSpeed: 0.0034, offset: 3, ringTex: '/textures/saturn_ring.png', inclination: 0.043, rotationSpeed: 0.44 },
      { id: 'uranus',   name: 'Uranus',  emoji: '🧊', subtitle: 'Experiments', color: 0x0EA5E9, tex: '/textures/uranus.jpg',       radius: 140, orbitDist: 5500, orbitSpeed: 0.0012, offset: 4, ringTex: '/textures/uranus_ring.png', inclination: 0.013, rotationSpeed: -0.278 },
      { id: 'neptune',  name: 'Neptune', emoji: '🔗', subtitle: 'Connect', color: 0x06B6D4, tex: '/textures/neptune.jpg',      radius: 120, orbitDist: 6500, orbitSpeed: 0.0006, offset: 3, inclination: 0.031, rotationSpeed: 0.298 },
      { id: 'pluto',    name: 'Pluto',   emoji: '🌑', subtitle: 'Secret', color: 0x64748B, tex: '/textures/plutomap.jpg',     radius: 40,  orbitDist: 7500, orbitSpeed: 0.0004, offset: 2, inclination: 0.300, rotationSpeed: -0.03 }
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
      
      // Placed with inclination at angle 0
      const initPx = config.orbitDist;
      const initPz = 0;
      const initPy = 0; // At angle 0, sin(angle) is 0, so y is 0
      mesh.position.set(initPx, initPy, initPz); 
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
      const incl = config.inclination || 0;
      for (let i=0; i<=64; i++) {
        const a = (i/64) * Math.PI * 2;
        const ox = Math.cos(a) * config.orbitDist;
        const oz = Math.sin(a) * config.orbitDist;
        const oy = oz * Math.sin(incl);
        const fz = oz * Math.cos(incl);
        orbitPts.push(new THREE.Vector3(ox, oy, fz));
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
        position: new CANNON.Vec3(initPx, initPy, initPz)
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
        rotationSpeed: config.rotationSpeed || 0.2,
        offset: config.offset,
        inclination: config.inclination || 0,
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
      
      const py = pz * Math.sin(p.inclination);
      const finalZ = pz * Math.cos(p.inclination);

      // Update Mesh & Physics Body
      p.mesh.position.set(px, py, finalZ);
      if (p.ringMesh) {
        p.ringMesh.position.set(px, py, finalZ);
      }
      p.body.position.set(px, py, finalZ);
      
      p.mesh.rotation.y += delta * p.rotationSpeed; // Proportional axial rotation
      
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
