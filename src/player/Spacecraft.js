import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class Spacecraft {
  constructor(physicsWorld, scene) {
    this.physicsWorld = physicsWorld;
    this.scene = scene;

    // ─── THREE.JS MESH ─────────────────────────────────────────────
    this.mesh = new THREE.Group();
    scene.add(this.mesh);

    // Engine glow light
    this.engineLight = new THREE.PointLight(0x00FFFF, 0, 60, 2);
    this.engineLight.position.set(0, 0, 5);
    this.mesh.add(this.engineLight);
    // Thruster Fire Shader Material
    this.fireUniforms = { time: { value: 0 } };
    const fireMat = new THREE.ShaderMaterial({
      uniforms: this.fireUniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
          float flicker = sin(vUv.y * 20.0 - time * 40.0) * 0.2 + 0.8;
          float fade = pow(1.0 - vUv.y, 1.5);
          vec3 baseColor = vec3(0.0, 0.6, 1.0);
          vec3 coreColor = vec3(0.8, 0.95, 1.0);
          vec3 color = mix(baseColor, coreColor, fade) * flicker;
          gl_FragColor = vec4(color, fade * flicker);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // Spaceship width is 5 parts. 1-fire-1-fire-1
    // Fire centers are at -w and +w. Fire diameter is w. 
    const w = 6.0; // 1 part of the width
    const shipLength = 60.0;
    
    // Fire length is 2/3 of rocket length
    const fireLength = shipLength * (2.0 / 3.0); 
    const fireRadius = w / 2.0;

    const fireGeom = new THREE.ConeGeometry(fireRadius, fireLength, 16);
    fireGeom.translate(0, fireLength / 2.0, 0); 
    
    // Left Engine
    this.fireLeft = new THREE.Mesh(fireGeom, fireMat);
    this.fireLeft.position.set(-w, 1.5, 10.0);
    this.fireLeft.rotation.x = Math.PI / 2;
    this.fireLeft.scale.setScalar(0.001); 
    this.mesh.add(this.fireLeft);

    // Right Engine
    this.fireRight = new THREE.Mesh(fireGeom, fireMat);
    this.fireRight.position.set(w, 1.5, 10.0);
    this.fireRight.rotation.x = Math.PI / 2;
    this.fireRight.scale.setScalar(0.001); 
    this.mesh.add(this.fireRight);

    // Load FBX Model
    const loader = new FBXLoader();
    loader.load('/models/spaceship.fbx', (object) => {
      // Scale down if necessary
      object.scale.set(0.05, 0.05, 0.05);
      
      // The FBX might not be oriented correctly, adjust rotation
      // Assuming it needs to face -Z like our physics forward vector
      object.rotation.y = Math.PI; 
      
      // Load and apply textures
      const textureLoader = new THREE.TextureLoader();
      const colorMap = textureLoader.load('/models/Intergalactic Spaceship_color_4.jpg');
      colorMap.colorSpace = THREE.SRGBColorSpace;
      const normalMap = textureLoader.load('/models/Intergalactic Spaceship_nmap_2_Tris.jpg');

      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: colorMap,
            normalMap: normalMap,
            roughness: 0.6,
            metalness: 0.8
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      this.mesh.add(object);
    });

    // ─── CANNON.JS PHYSICS ─────────────────────────────────────────
    // Using a sphere for bouncy, drifty hovercraft physics
    const shape = new CANNON.Sphere(35);
    this.body = new CANNON.Body({
      mass: 50,
      material: physicsWorld.defaultMaterial,
      position: new CANNON.Vec3(0, 50, 2500), // Start far away from the sun
      linearDamping: 0.1, // Much lower drag for high top speed
      angularDamping: 0.6
    });
    this.body.addShape(shape);
    this.body.angularFactor.set(1, 1, 1); // Unlock pitch, yaw, and roll for full 3D flight
    physicsWorld.world.addBody(this.body);
  }

  update(delta, input) {
    // Sync mesh to physics body
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);

    if (!this.body) return;

    if (this.isDead) {
      if (this.explosion) {
        this.explosion.age += delta;
        const positions = this.explosion.particles.geometry.attributes.position.array;
        for (let i = 0; i < 200; i++) {
          positions[i*3] += this.explosion.velocities[i*3] * delta;
          positions[i*3+1] += this.explosion.velocities[i*3+1] * delta;
          positions[i*3+2] += this.explosion.velocities[i*3+2] * delta;
        }
        this.explosion.particles.geometry.attributes.position.needsUpdate = true;
        this.explosion.particles.material.opacity = Math.max(0, 1.0 - this.explosion.age / 2.0);
      }
      return;
    }

    // Check collision with Sun
    if (this.body.position.length() < 280) {
      this.explode();
      return;
    }

    // Update shader time
    this.fireUniforms.time.value += delta;

    const force = 45000; // Adjusted force with low drag

    if (input.forward) {
      this.body.applyLocalForce(new CANNON.Vec3(0, 0, -force), new CANNON.Vec3(0, 0, 0));
      
      // Animate fire scale: flicker effect
      const flicker = 0.8 + Math.random() * 0.4;
      this.fireLeft.scale.set(1, flicker, 1);
      this.fireRight.scale.set(1, flicker, 1);
    } else if (input.backward) {
      this.body.applyLocalForce(new CANNON.Vec3(0, 0, force * 0.5), new CANNON.Vec3(0, 0, 0));
      this.fireLeft.scale.setScalar(0.001);
      this.fireRight.scale.setScalar(0.001);
    } else {
      // Manual brake/drag when coasting to feel like a hovercraft
      this.body.velocity.scale(0.98, this.body.velocity); 
      this.fireLeft.scale.setScalar(0.001);
      this.fireRight.scale.setScalar(0.001);
    }

    // Engine glow light bleed (lerp intensity)
    this.engineLight.intensity = THREE.MathUtils.lerp(
      this.engineLight.intensity,
      input.forward ? 2.5 : 0.2,
      0.08
    );

    // Direct local angular velocity for full 3D 6DOF responsive turning
    let pitch = 0;
    let yaw = 0;
    let roll = 0;

    if (input.pitchDown) pitch = 2.0;
    if (input.pitchUp) pitch = -2.0;
    if (input.left) yaw = 2.5;
    if (input.right) yaw = -2.5;
    if (input.rollLeft) roll = 2.5;
    if (input.rollRight) roll = -2.5;

    // Convert local angular velocity to world space
    const localAngVel = new CANNON.Vec3(pitch, yaw, roll);
    const worldAngVel = new CANNON.Vec3();
    this.body.quaternion.vmult(localAngVel, worldAngVel);
    
    // Set directly for tight arcade feel
    this.body.angularVelocity.copy(worldAngVel);

    // Jump / Bounce
    if (input.jump && this.body.position.y < 3) {
      this.body.velocity.y = 20;
    }

    // Respawn if out of bounds (flew out of solar system)
    if (this.body.position.length() > 25000) {
      this.body.position.set(0, 5, 500);
      this.body.velocity.set(0, 0, 0);
      this.body.angularVelocity.set(0, 0, 0);
      this.body.quaternion.set(0, 0, 0, 1);
    }
  }

  getPosition() {
    return this.mesh.position;
  }

  explode() {
    if (this.isDead) return;
    this.isDead = true;
    this.mesh.visible = false;
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);

    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    const origin = this.getPosition();
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = origin.x;
      positions[i * 3 + 1] = origin.y;
      positions[i * 3 + 2] = origin.z;
      velocities.push(
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400
      );
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 15,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    this.explosion = { particles, velocities, age: 0 };

    setTimeout(() => {
      this.scene.remove(particles);
      this.explosion = null;
      this.body.position.set(0, 50, 2500); // Respawn far away
      this.body.velocity.set(0, 0, 0);
      this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0);
      this.mesh.visible = true;
      this.isDead = false;
    }, 2000);
  }
}
