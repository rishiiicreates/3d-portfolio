import * as CANNON from 'cannon-es';

export class HUD {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'scifi-hud';

    // Inject styles
    if (!document.getElementById('hud-styles')) {
      const style = document.createElement('style');
      style.id = 'hud-styles';
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Share+Tech+Mono&display=swap');

        #scifi-hud {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 50;
          font-family: 'Share Tech Mono', monospace;
          color: #00f3ff;
          text-shadow: 0 0 5px rgba(0, 243, 255, 0.5);
        }

        .hud-panel {
          position: absolute;
          background: rgba(5, 10, 20, 0.6);
          border: 1px solid rgba(0, 243, 255, 0.3);
          backdrop-filter: blur(4px);
          padding: 15px;
          box-shadow: 0 0 15px rgba(0, 243, 255, 0.1) inset;
        }

        /* Top Left: Status */
        .hud-status {
          top: 20px;
          left: 20px;
          border-left: 4px solid #00f3ff;
          clip-path: polygon(0 0, 100% 0, 100% 80%, 90% 100%, 0 100%);
        }
        .status-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
          letter-spacing: 2px;
        }

        /* Bottom Left: Telemetry */
        .hud-telemetry {
          bottom: 20px;
          left: 20px;
          border-bottom: 4px solid #00f3ff;
          clip-path: polygon(0 0, 90% 0, 100% 20%, 100% 100%, 0 100%);
          width: 250px;
        }
        .telemetry-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .speed-bar {
          height: 6px;
          background: rgba(0, 243, 255, 0.2);
          margin-top: 5px;
          width: 100%;
        }
        .speed-fill {
          height: 100%;
          background: #00f3ff;
          width: 0%;
          transition: width 0.1s linear;
          box-shadow: 0 0 10px #00f3ff;
        }

        /* Top Right: Minimap */
        .hud-minimap {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          border: 2px solid rgba(0, 243, 255, 0.5);
          background: rgba(5, 10, 20, 0.9);
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0, 243, 255, 0.2) inset, 0 0 10px rgba(0, 243, 255, 0.2);
          z-index: 10;
        }
        .minimap-center {
          position: absolute;
          top: 50%; left: 50%;
          width: 8px; height: 8px;
          background: #ffaa00;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 8px #ffaa00;
        }
        .minimap-crosshair {
          position: absolute;
          top: 0; bottom: 0; left: 50%;
          width: 1px; background: rgba(0,243,255,0.2);
        }
        .minimap-crosshair-h {
          position: absolute;
          top: 50%; left: 0; right: 0;
          height: 1px; background: rgba(0,243,255,0.2);
        }
        
        .minimap-dot {
          position: absolute;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          z-index: 5;
        }
        .minimap-player {
          position: absolute;
          width: 0; height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 12px solid #00ffaa;
          transform-origin: 50% 50%;
          margin-top: -6px;
          margin-left: -6px;
          filter: drop-shadow(0 0 4px #00ffaa);
          z-index: 100;
        }
        
        .hud-controls-hint {
          position: absolute;
          bottom: 20px;
          right: 20px;
          text-align: right;
          font-size: 12px;
          opacity: 0.7;
          line-height: 1.6;
        }
      `;
      document.head.appendChild(style);
    }

    // Status Panel
    this.statusPanel = document.createElement('div');
    this.statusPanel.className = 'hud-panel hud-status';
    this.statusPanel.innerHTML = `
      <div class="status-title">SYS.NOMINAL</div>
      <div>HULL: 100%</div>
      <div>GRAV: 1G</div>
      <div>THRUST: ONLINE</div>
    `;
    this.container.appendChild(this.statusPanel);

    // Telemetry Panel
    this.telemetryPanel = document.createElement('div');
    this.telemetryPanel.className = 'hud-panel hud-telemetry';
    
    this.speedText = document.createElement('div');
    this.speedText.className = 'telemetry-row';
    this.speedText.innerHTML = `<span>VELOCITY</span><span id="vel-val">0.00 AU/S</span>`;
    this.telemetryPanel.appendChild(this.speedText);
    
    const speedBar = document.createElement('div');
    speedBar.className = 'speed-bar';
    this.speedFill = document.createElement('div');
    this.speedFill.className = 'speed-fill';
    speedBar.appendChild(this.speedFill);
    this.telemetryPanel.appendChild(speedBar);

    this.coordText = document.createElement('div');
    this.coordText.className = 'telemetry-row';
    this.coordText.style.marginTop = '15px';
    this.coordText.innerHTML = `<span>COORDS</span><span id="coord-val">X:000 Z:000</span>`;
    this.telemetryPanel.appendChild(this.coordText);

    this.container.appendChild(this.telemetryPanel);

    // Minimap
    this.minimap = document.createElement('div');
    this.minimap.className = 'hud-minimap';
    this.minimap.innerHTML = `
      <div class="minimap-crosshair"></div>
      <div class="minimap-crosshair-h"></div>
      <div class="minimap-center"></div>
    `;
    
    this.playerBlip = document.createElement('div');
    this.playerBlip.className = 'minimap-player';
    this.minimap.appendChild(this.playerBlip);
    
    this.container.appendChild(this.minimap);

    // Controls Hint
    const controlsHint = document.createElement('div');
    controlsHint.className = 'hud-controls-hint';
    controlsHint.innerHTML = `
      [W/A/S/D] THRUST<br>
      [SPACE] JUMP<br>
      [SCROLL] ZOOM<br>
      [DRAG] PAN CAM
    `;
    this.container.appendChild(controlsHint);

    document.body.appendChild(this.container);

    this.planetBlips = {};
    this.maxMapDistance = 8000; // Radius of solar system map in world units
  }

  update(spacecraft, planets) {
    if (!spacecraft || !spacecraft.body) return;

    // Telemetry
    const speed = spacecraft.body.velocity.length();
    document.getElementById('vel-val').innerText = speed.toFixed(2) + ' AU/S';
    
    // Max visual speed for bar
    const maxSpeed = 1000;
    this.speedFill.style.width = Math.min((speed / maxSpeed) * 100, 100) + '%';

    const pos = spacecraft.body.position;
    document.getElementById('coord-val').innerText = `X:${Math.round(pos.x / 10)} Z:${Math.round(pos.z / 10)}`;

    // Minimap Player Update (Player stays in center!)
    this.playerBlip.style.left = '50%';
    this.playerBlip.style.top = '50%';
    
    // Player Rotation on minimap
    const forward = new CANNON.Vec3(0, 0, -1);
    spacecraft.body.quaternion.vmult(forward, forward);
    const angle = Math.atan2(forward.x, forward.z);
    this.playerBlip.style.transform = `translate(-50%, -50%) rotate(${-angle + Math.PI}rad)`;

    // Update Sun Position (Sun is at 0, 0) relative to player
    const sunBlip = this.minimap.querySelector('.minimap-center');
    if (sunBlip) {
      this.updateMinimapPos(sunBlip, 0 - pos.x, 0 - pos.z);
    }

    // Minimap Planets Update relative to player
    planets.forEach(p => {
      let blip = this.planetBlips[p.id];
      if (!blip) {
        blip = document.createElement('div');
        blip.className = 'minimap-dot';
        blip.style.width = Math.max(p.radius * 0.05, 3) + 'px';
        blip.style.height = Math.max(p.radius * 0.05, 3) + 'px';
        blip.style.backgroundColor = '#' + p.config.color.toString(16).padStart(6, '0');
        blip.style.boxShadow = `0 0 5px ${blip.style.backgroundColor}`;
        this.minimap.appendChild(blip);
        this.planetBlips[p.id] = blip;
      }
      this.updateMinimapPos(blip, p.mesh.position.x - pos.x, p.mesh.position.z - pos.z);
    });
  }

  updateMinimapPos(element, relX, relZ) {
    const mapScale = 50 / this.maxMapDistance;
    const pctX = 50 + (relX * mapScale);
    const pctY = 50 + (relZ * mapScale);
    element.style.left = pctX + '%';
    element.style.top = pctY + '%';
  }
}
