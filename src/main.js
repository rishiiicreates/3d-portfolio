import * as THREE from 'three';
import { PhysicsWorld } from './physics/PhysicsWorld.js';
import { Floor } from './world/Floor.js';
import { Planets } from './world/Planets.js';
import { Spacecraft } from './player/Spacecraft.js';
import { IsometricCamera } from './scene/IsometricCamera.js';
import { Input } from './player/Input.js';
import { ContentPanel } from './ui/ContentPanel.js';
import { HUD } from './ui/HUD.js';
import { StarField } from './world/StarField.js';
import { ShootingStars } from './world/ShootingStars.js';
import { AsteroidBelt } from './world/AsteroidBelt.js';
import { SpaceDust } from './world/SpaceDust.js';
import { SunCorona } from './world/SunCorona.js';
import { RealSpace } from './world/RealSpace.js';

class Application {
  constructor() {
    // Basic THREE setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.position = 'fixed';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';

    // Loading Screen
    this.loadingScreen = document.createElement('div');
    this.loadingScreen.id = 'loading-screen';
    this.loadingScreen.style.position = 'fixed';
    this.loadingScreen.style.top = '0';
    this.loadingScreen.style.left = '0';
    this.loadingScreen.style.width = '100vw';
    this.loadingScreen.style.height = '100vh';
    this.loadingScreen.style.backgroundColor = '#050811';
    this.loadingScreen.style.zIndex = '9999';
    this.loadingScreen.style.display = 'flex';
    this.loadingScreen.style.flexDirection = 'column';
    this.loadingScreen.style.alignItems = 'center';
    this.loadingScreen.style.justifyContent = 'center';
    this.loadingScreen.style.transition = 'opacity 0.8s ease-out';
    this.loadingScreen.innerHTML = `
      <div style="text-align: center;">
        <h1 style="font-family: Orbitron, sans-serif; color: #00f3ff; margin-bottom: 20px; text-shadow: 0 0 10px rgba(0, 243, 255, 0.5); letter-spacing: 2px;">INITIALIZING SOLAR SYSTEM</h1>
        <div style="width: 400px; height: 12px; border: 1px solid rgba(0, 243, 255, 0.4); border-radius: 6px; overflow: hidden; margin: 0 auto;">
          <div id="loading-bar" style="width: 0%; height: 100%; background: #00f3ff; box-shadow: 0 0 15px #00f3ff; transition: width 0.1s linear;"></div>
        </div>
        <p id="loading-text" style="font-family: 'Share Tech Mono', monospace; color: #00f3ff; margin-top: 15px; font-size: 16px; opacity: 0.8;">Booting engine...</p>
      </div>
    `;
    document.body.appendChild(this.loadingScreen);

    THREE.DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100;
      const bar = document.getElementById('loading-bar');
      const text = document.getElementById('loading-text');
      if (bar) bar.style.width = progress + '%';
      if (text) text.innerText = `Loading Assets... ${Math.round(progress)}%`;
    };

    THREE.DefaultLoadingManager.onLoad = () => {
      setTimeout(() => {
        if (this.loadingScreen) {
          this.loadingScreen.style.opacity = '0';
          setTimeout(() => {
            this.loadingScreen.remove();
          }, 800);
        }
      }, 500); // Small delay to let textures hit the GPU
    };
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050811);
    this.scene.fog = new THREE.Fog(0x050811, 50000, 150000); // Soft fade into distance

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);
    
    const dirLight = new THREE.DirectionalLight(0xffeebb, 1.5);
    dirLight.position.set(50, 100, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 300;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    this.scene.add(dirLight);

    // Camera
    this.cameraController = new IsometricCamera(this.renderer);
    
    // Physics
    this.physics = new PhysicsWorld();
    
    // Input
    this.input = new Input();

    // World Elements
    this.floor = new Floor(this.physics, this.scene);
    this.planets = new Planets(this.physics, this.scene);
    this.spacecraft = new Spacecraft(this.physics, this.scene);

    // UI
    this.contentPanel = new ContentPanel();
    this.hud = new HUD();
    this.isDocked = false;
    
    // Interaction Prompt
    this.prompt = document.createElement('div');
    this.prompt.style.position = 'absolute';
    this.prompt.style.bottom = '40px';
    this.prompt.style.left = '50%';
    this.prompt.style.transform = 'translateX(-50%)';
    this.prompt.style.fontFamily = 'Space Grotesk, sans-serif';
    this.prompt.style.color = '#fff';
    this.prompt.style.backgroundColor = 'rgba(0,0,0,0.6)';
    this.prompt.style.padding = '10px 20px';
    this.prompt.style.borderRadius = '8px';
    this.prompt.style.display = 'none';
    this.prompt.style.pointerEvents = 'none';
    document.body.appendChild(this.prompt);

    this.clock = new THREE.Clock();
    
    // Environment Systems
    this.starField = new StarField(this.scene);
    this.shootingStars = new ShootingStars(this.scene);
    this.asteroidBelt = new AsteroidBelt(this.scene);
    this.spaceDust = new SpaceDust(this.scene);
    this.sunCorona = new SunCorona(this.scene);
    this.realSpace = new RealSpace(this.scene);

    // Initial Resize
    // Handled by IsometricCamera constructor and resize listener
    
    // Start loop
    this.renderer.setAnimationLoop(() => this.update());
    
    // Remove old planet cards from DOM if they exist from previous load
    document.querySelectorAll('.planet-card').forEach(el => el.remove());
  }

  update() {
    const delta = this.clock.getDelta();
    
    // Stop physics/movement if UI panel is open
    if (this.isDocked) {
      if (this.input.state.interact || this.input.state.jump) {
        // Debounce interact
      }
      this.renderer.render(this.scene, this.cameraController.camera);
      return;
    }

    // Physics Step
    this.physics.update(delta);
    
    // Player Update
    this.spacecraft.update(delta, this.input.state);
    
    // Camera Update
    this.cameraController.update(delta, this.spacecraft);
    
    // Planets Update (Labels)
    this.planets.update(delta, this.cameraController.camera);

    // HUD Update
    this.hud.update(this.spacecraft, this.planets.planets);
    
    // Proximity check
    let nearestPlanet = null;
    let minDist = 15;
    
    this.planets.planets.forEach(p => {
      const dist = p.mesh.position.distanceTo(this.spacecraft.getPosition());
      if (dist < minDist) {
        minDist = dist;
        nearestPlanet = p;
      }
    });

    if (nearestPlanet) {
      this.prompt.textContent = `[E] EXPLORE ${nearestPlanet.name.toUpperCase()}`;
      this.prompt.style.display = 'block';
      
      if (this.input.state.interact) {
        this.input.state.interact = false;
        import('./content/portfolio.js').then(({ portfolioData }) => {
          this.isDocked = true;
          this.contentPanel.show(nearestPlanet.id, nearestPlanet.config, portfolioData, () => {
            this.contentPanel.hide();
            this.isDocked = false;
          });
        });
        this.prompt.style.display = 'none';
      }
    } else {
      this.prompt.style.display = 'none';
    }

    // Environment Systems Update
    const time = this.clock.getElapsedTime();
    if (this.starField) this.starField.update(time, delta, this.spacecraft.getPosition());
    if (this.shootingStars) this.shootingStars.update(time, delta, this.spacecraft.getPosition());
    if (this.asteroidBelt) this.asteroidBelt.update(time, delta);
    if (this.spaceDust) this.spaceDust.update(time, delta);
    if (this.sunCorona) this.sunCorona.update(time, delta);
    if (this.realSpace) this.realSpace.update(delta);

    // Render
    this.renderer.render(this.scene, this.cameraController.camera);
  }
}

new Application();
