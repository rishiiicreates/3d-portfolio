// ═══════════════════════════════════════════════════════════
// PROCEDURAL CARTOON STARSHIP
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';
import { SHIP_CONFIG } from '../utils/constants.js';

const PARTICLE_COUNT = 300;

// Engine trail vertex shader
const trailVertexShader = `
  attribute float aLifetime;
  attribute float aSize;
  uniform float uTime;
  uniform float uBoost;
  varying float vLifetime;

  void main() {
    vLifetime = aLifetime;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Particles shrink and fade as lifetime approaches 0
    float scale = mix(0.5, 1.0, aLifetime) * mix(1.0, 2.2, uBoost);
    gl_PointSize = aSize * scale * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Engine trail fragment shader
const trailFragmentShader = `
  uniform vec3 uColorNormal;
  uniform vec3 uColorBoost;
  uniform float uBoost;
  varying float vLifetime;

  void main() {
    // Circular point shape
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Soft edge falloff
    float alpha = smoothstep(0.5, 0.1, dist) * vLifetime * 0.8;
    vec3 color = mix(uColorNormal, uColorBoost, uBoost);
    // Add hot white core
    vec3 finalColor = mix(color, vec3(1.0), smoothstep(0.3, 0.0, dist) * 0.6);
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export class Starship {
  constructor() {
    this.group = new THREE.Group();
    this.elapsedTime = 0;
    this.isBoosting = false;
    this.boostLerp = 0; // smooth transition for boost visuals

    this._buildBody();
    this._buildCockpit();
    this._buildWings();
    this._buildEngine();
    this._buildTrail();

    this.group.name = 'starship';
  }

  // ─── Body ────────────────────────────────────────────
  _buildBody() {
    const geo = new THREE.ConeGeometry(3, 12, 8);
    // Rotate so tip points forward (+Z)
    geo.rotateX(Math.PI / 2);
    const mat = new THREE.MeshToonMaterial({ color: 0xcbd5e1 });
    this.body = new THREE.Mesh(geo, mat);
    this.group.add(this.body);
  }

  // ─── Cockpit ─────────────────────────────────────────
  _buildCockpit() {
    const geo = new THREE.SphereGeometry(1.8, 16, 12);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.6,
      shininess: 120,
    });
    this.cockpit = new THREE.Mesh(geo, mat);
    this.cockpit.position.set(0, 1.6, 2.5);
    this.group.add(this.cockpit);
  }

  // ─── Wings ───────────────────────────────────────────
  _buildWings() {
    const wingGeo = new THREE.BoxGeometry(8, 0.3, 4);
    const wingMat = new THREE.MeshToonMaterial({ color: 0x94a3b8 });

    // Right wing
    this.rightWing = new THREE.Mesh(wingGeo, wingMat);
    this.rightWing.position.set(5, 0, -1);
    this.rightWing.rotation.z = -0.15; // slight angle outward
    this.group.add(this.rightWing);

    // Left wing
    this.leftWing = new THREE.Mesh(wingGeo, wingMat.clone());
    this.leftWing.position.set(-5, 0, -1);
    this.leftWing.rotation.z = 0.15;
    this.group.add(this.leftWing);
  }

  // ─── Engine nozzle ───────────────────────────────────
  _buildEngine() {
    const geo = new THREE.CylinderGeometry(1.5, 2, 3, 8);
    geo.rotateX(Math.PI / 2);
    const mat = new THREE.MeshToonMaterial({ color: 0x475569 });
    this.engine = new THREE.Mesh(geo, mat);
    this.engine.position.set(0, 0, -6.5);
    this.group.add(this.engine);
  }

  // ─── Engine trail particles ──────────────────────────
  _buildTrail() {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const lifetimes = new Float32Array(PARTICLE_COUNT);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const velocities = []; // store per-particle velocity for spread

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Start behind the ship engine
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      lifetimes[i] = Math.random(); // stagger initial lifetimes
      sizes[i] = 1.5 + Math.random() * 3.0;

      // Cone spread velocity — particles move backward and slightly outward
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.random() * 0.4;
      velocities.push(
        Math.cos(angle) * spread,  // x
        Math.sin(angle) * spread,  // y
        -(0.8 + Math.random() * 0.5) // z backward
      );
    }

    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    trailGeo.setAttribute('aLifetime', new THREE.BufferAttribute(lifetimes, 1));
    trailGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    this.trailMaterial = new THREE.ShaderMaterial({
      vertexShader: trailVertexShader,
      fragmentShader: trailFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uBoost: { value: 0 },
        uColorNormal: { value: new THREE.Color(0x22d3ee) },   // cyan
        uColorBoost: { value: new THREE.Color(0xfbbf24) },    // golden
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.trailPoints = new THREE.Points(trailGeo, this.trailMaterial);
    this.trailPoints.frustumCulled = false;
    this.group.add(this.trailPoints);

    // Store velocity data for CPU-side updates
    this._trailVelocities = velocities;
    this._trailDecayRate = 0.4; // how fast particles die
  }

  // ─── Update trail particles ──────────────────────────
  _updateTrail(delta, speed) {
    const posAttr = this.trailPoints.geometry.getAttribute('position');
    const lifeAttr = this.trailPoints.geometry.getAttribute('aLifetime');
    const positions = posAttr.array;
    const lifetimes = lifeAttr.array;
    const vel = this._trailVelocities;

    const speedFactor = Math.min(speed / SHIP_CONFIG.maxSpeed, 1);
    const decayRate = this._trailDecayRate + speedFactor * 0.6;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Age the particle
      lifetimes[i] -= delta * decayRate;

      if (lifetimes[i] <= 0) {
        // Respawn at engine position (local to the group)
        positions[i * 3] = (Math.random() - 0.5) * 1.5;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
        positions[i * 3 + 2] = -7;
        lifetimes[i] = 0.6 + Math.random() * 0.4;
      } else {
        // Move along velocity
        const trailSpeed = 1.0 + speedFactor * 2.0;
        positions[i * 3] += vel[i * 3] * delta * trailSpeed * 10;
        positions[i * 3 + 1] += vel[i * 3 + 1] * delta * trailSpeed * 10;
        positions[i * 3 + 2] += vel[i * 3 + 2] * delta * trailSpeed * 10;
      }
    }

    posAttr.needsUpdate = true;
    lifeAttr.needsUpdate = true;
  }

  // ─── Public API ──────────────────────────────────────

  setBoostMode(boosting) {
    this.isBoosting = boosting;
  }

  getMesh() {
    return this.group;
  }

  update(delta, speed, isBoosting) {
    this.elapsedTime += delta;
    this.isBoosting = isBoosting;

    // Smooth boost lerp for visual transitions
    const boostTarget = isBoosting ? 1 : 0;
    this.boostLerp += (boostTarget - this.boostLerp) * 4 * delta;

    // Idle bobbing on Y axis
    const bobAmount = SHIP_CONFIG.bobbingAmplitude * (1 - Math.min(speed / SHIP_CONFIG.maxSpeed, 0.8));
    this.body.position.y = Math.sin(this.elapsedTime * SHIP_CONFIG.bobbingSpeed) * bobAmount;
    this.cockpit.position.y = 1.6 + Math.sin(this.elapsedTime * SHIP_CONFIG.bobbingSpeed) * bobAmount;

    // Subtle wing flutter at speed
    const flutter = Math.sin(this.elapsedTime * 8) * 0.02 * Math.min(speed / SHIP_CONFIG.maxSpeed, 1);
    this.rightWing.rotation.z = -0.15 + flutter;
    this.leftWing.rotation.z = 0.15 - flutter;

    // Engine glow pulse
    const glowPulse = 0.4 + Math.sin(this.elapsedTime * 6) * 0.1 + this.boostLerp * 0.3;
    this.engine.material.emissive = this.engine.material.color;
    this.engine.material.emissiveIntensity = glowPulse;

    // Update shader uniforms
    this.trailMaterial.uniforms.uTime.value = this.elapsedTime;
    this.trailMaterial.uniforms.uBoost.value = this.boostLerp;

    // Update trail particles
    this._updateTrail(delta, speed);
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
  }
}
