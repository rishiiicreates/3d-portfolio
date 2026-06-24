import * as THREE from 'three';

export class ShootingStars {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);
    
    this.stars = [];
    this.poolSize = 10;
    this.spawnTimer = 0;
    this.showerTimer = 0;
    this.spawnRadius = 15000;
    this.baseSpeed = 3000;
    this.nextSpawn = 5 + Math.random() * 5;

    for (let i = 0; i < this.poolSize; i++) {
      this.stars.push(this.createStar());
    }
  }

  createStar() {
    const group = new THREE.Group();
    group.visible = false;

    // Line trail
    const points = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points * 3);
    const colors = new Float32Array(points * 3);
    
    for (let i = 0; i < points; i++) {
      // Fade out towards tail
      const alpha = 1.0 - (i / points);
      colors[i * 3] = 0.6 * alpha;
      colors[i * 3 + 1] = 0.8 * alpha;
      colors[i * 3 + 2] = 1.0 * alpha;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const line = new THREE.Line(geometry, material);
    group.add(line);

    // Light head
    const light = new THREE.PointLight(0xAADDFF, 0.5, 80, 2);
    group.add(light);

    this.group.add(group);

    return {
      group,
      line,
      light,
      geometry,
      positions,
      active: false,
      age: 0,
      life: 0,
      direction: new THREE.Vector3(),
      speed: 0
    };
  }

  spawn(shipPosition, forceDirection = null) {
    const star = this.stars.find(s => !s.active);
    if (!star) return;

    star.active = true;
    star.group.visible = true;
    star.age = 0;
    star.life = 1.5 + Math.random();
    star.speed = this.baseSpeed + Math.random() * this.baseSpeed;

    // Spawn on a 15000 radius sphere around ship
    const r = this.spawnRadius;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    const head = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    
    if (shipPosition) {
      head.add(shipPosition);
    }

    if (forceDirection) {
      star.direction.copy(forceDirection);
    } else {
      star.direction.set(
        Math.random() - 0.5,
        -0.3 + Math.random() * 0.3, // slight downward bias
        Math.random() - 0.5
      ).normalize();
    }

    // Initialize trail points
    for (let i = 0; i < 20; i++) {
      const p = head.clone().sub(star.direction.clone().multiplyScalar(i * 80));
      star.positions[i * 3] = p.x;
      star.positions[i * 3 + 1] = p.y;
      star.positions[i * 3 + 2] = p.z;
    }
    
    star.light.position.copy(head);
    star.geometry.attributes.position.needsUpdate = true;
  }

  update(time, delta, shipPosition) {
    this.spawnTimer += delta;
    this.showerTimer += delta;

    if (this.spawnTimer > this.nextSpawn) {
      this.spawnTimer = 0;
      this.nextSpawn = 5 + Math.random() * 5;
      this.spawn(shipPosition);
    }

    if (this.showerTimer > 60) {
      this.showerTimer = 0;
      // Meteor shower: 5 parallel stars
      const dir = new THREE.Vector3(
        Math.random() - 0.5,
        -0.3 + Math.random() * 0.3,
        Math.random() - 0.5
      ).normalize();
      
      for(let i=0; i<5; i++) {
        setTimeout(() => this.spawn(shipPosition, dir), Math.random() * 500);
      }
    }

    this.stars.forEach(star => {
      if (!star.active) return;

      star.age += delta;
      if (star.age > star.life) {
        star.active = false;
        star.group.visible = false;
        return;
      }

      // Move head
      const head = new THREE.Vector3(star.positions[0], star.positions[1], star.positions[2]);
      head.add(star.direction.clone().multiplyScalar(star.speed * delta));

      // Scroll trail points
      for (let i = 19; i > 0; i--) {
        star.positions[i * 3] = star.positions[(i - 1) * 3];
        star.positions[i * 3 + 1] = star.positions[(i - 1) * 3 + 1];
        star.positions[i * 3 + 2] = star.positions[(i - 1) * 3 + 2];
      }

      // Set new head
      star.positions[0] = head.x;
      star.positions[1] = head.y;
      star.positions[2] = head.z;

      star.light.position.copy(head);
      star.geometry.attributes.position.needsUpdate = true;
    });
  }
}
