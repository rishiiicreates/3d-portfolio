import * as CANNON from 'cannon-es';

export class PhysicsWorld {
  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -30, 0); // High gravity for snappy bounces
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    
    // Default material
    this.defaultMaterial = new CANNON.Material('default');
    const defaultContactMaterial = new CANNON.ContactMaterial(
      this.defaultMaterial,
      this.defaultMaterial,
      {
        friction: 0.1, // Low friction for drift
        restitution: 0.5, // Bouncy
      }
    );
    this.world.addContactMaterial(defaultContactMaterial);
  }

  update(delta) {
    // Step the physics world
    // Clamp delta to prevent huge jumps on lag
    this.world.step(1 / 60, Math.min(delta, 0.1), 3);
  }
}
