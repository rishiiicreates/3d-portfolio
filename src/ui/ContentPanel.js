// ═══════════════════════════════════════════════════════════
// CONTENT PANEL UI (Docked State)
// ═══════════════════════════════════════════════════════════

export class ContentPanel {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'content-panel';

    if (!document.getElementById('content-panel-styles')) {
      const style = document.createElement('style');
      style.id = 'content-panel-styles';
      style.textContent = `
        #content-panel {
          position: fixed;
          right: 0;
          top: 0;
          height: 100vh;
          width: 100%;
          max-width: 420px;
          background: rgba(5, 10, 26, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 150;
          transform: translateX(100%);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
        }
        #content-panel.show {
          transform: translateX(0);
        }
        .panel-header {
          padding: 30px 30px 20px;
          position: relative;
        }
        .accent-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
        }
        .planet-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 24px;
          color: white;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .planet-subtitle {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }
        .panel-content {
          flex: 1;
          position: relative;
          overflow: hidden;
        }
        .view-container {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          padding: 0 30px 30px;
          overflow-y: auto;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
        }
        .view-container::-webkit-scrollbar { width: 6px; }
        .view-container::-webkit-scrollbar-track { background: transparent; }
        .view-container::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
        
        .grid-view {
          transform: translateX(0);
          opacity: 1;
          pointer-events: auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-content: flex-start;
        }
        .grid-view.slide-out {
          transform: translateX(-50%);
          opacity: 0;
          pointer-events: none;
        }
        
        .moon-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .moon-card:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-2px);
        }
        .moon-icon {
          font-size: 28px;
        }
        .moon-label {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          color: white;
          text-align: center;
        }
        
        .detail-view {
          transform: translateX(100%);
          opacity: 0;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .detail-view.slide-in {
          transform: translateX(0);
          opacity: 1;
          pointer-events: auto;
        }
        
        .back-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0;
          margin-bottom: 10px;
          transition: color 0.2s ease;
        }
        .back-btn:hover { color: white; }
        
        .detail-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 20px;
          color: white;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .status-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          padding: 4px 8px;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.1);
          text-transform: uppercase;
        }
        .detail-body {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }
        .tag-pill {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px 12px;
          border-radius: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #E2E8F0;
        }
        
        .links-container {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .link-btn {
          flex: 1;
          display: inline-block;
          text-align: center;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          text-decoration: none;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .link-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        
        .undock-btn {
          margin: 0 30px 30px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          pointer-events: auto;
        }
        .undock-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
        }
      `;
      document.head.appendChild(style);
    }

    this.header = document.createElement('div');
    this.header.className = 'panel-header';
    this.container.appendChild(this.header);

    this.contentArea = document.createElement('div');
    this.contentArea.className = 'panel-content';
    this.container.appendChild(this.contentArea);

    this.gridView = document.createElement('div');
    this.gridView.className = 'view-container grid-view';
    this.contentArea.appendChild(this.gridView);

    this.detailView = document.createElement('div');
    this.detailView.className = 'view-container detail-view';
    this.contentArea.appendChild(this.detailView);

    this.undockBtn = document.createElement('button');
    this.undockBtn.className = 'undock-btn';
    this.undockBtn.textContent = '← Return to Space';
    this.container.appendChild(this.undockBtn);

    document.body.appendChild(this.container);

    this.portfolioData = null;
    this.currentPlanetConfig = null;
  }

  show(planetId, planetConfig, portfolioData, onUndock) {
    this.portfolioData = portfolioData;
    this.currentPlanetConfig = planetConfig;
    
    // Setup header
    const colorHex = '#' + planetConfig.color.toString(16).padStart(6, '0');
    this.header.innerHTML = `
      <div class="accent-bar" style="background-color: ${colorHex}"></div>
      <div class="planet-title">${planetConfig.emoji} ${planetConfig.name}</div>
      <div class="planet-subtitle">${planetConfig.subtitle}</div>
    `;

    // Setup grid
    this.gridView.innerHTML = '';
    const moons = portfolioData[planetId]?.moons || [];
    
    moons.forEach(moon => {
      const card = document.createElement('div');
      card.className = 'moon-card';
      card.innerHTML = `
        <div class="moon-icon">${moon.icon}</div>
        <div class="moon-label">${moon.label}</div>
      `;
      card.onmouseenter = () => {
        card.style.borderColor = colorHex;
        card.style.boxShadow = `0 0 15px ${colorHex}40`;
      };
      card.onmouseleave = () => {
        card.style.borderColor = 'rgba(255,255,255,0.08)';
        card.style.boxShadow = 'none';
      };
      card.onclick = () => this.showMoonDetail(moon);
      this.gridView.appendChild(card);
    });

    // Reset views
    this.gridView.classList.remove('slide-out');
    this.detailView.classList.remove('slide-in');

    // Setup undock
    this.undockBtn.onclick = onUndock;

    // Show panel
    this.container.classList.add('show');
  }

  hide() {
    this.container.classList.remove('show');
  }

  showMoonDetail(moon) {
    this.detailView.innerHTML = `
      <button class="back-btn" id="panel-back-btn">← Back to ${this.currentPlanetConfig.name}</button>
    `;

    const content = moon.content;

    if (moon.type === 'project') {
      let linksHtml = '';
      if (content.links) {
        if (content.links.github) linksHtml += `<a href="${content.links.github}" target="_blank" class="link-btn">GitHub ↗</a>`;
        if (content.links.demo) linksHtml += `<a href="${content.links.demo}" target="_blank" class="link-btn">Demo ↗</a>`;
      }
      
      this.detailView.innerHTML += `
        <div class="detail-title">
          ${moon.icon} ${content.title}
          ${content.status ? `<span class="status-badge">${content.status}</span>` : ''}
        </div>
        <div class="detail-body">${content.description}</div>
        <div class="tags-container">
          ${(content.stack || []).map(t => `<div class="tag-pill">${t}</div>`).join('')}
        </div>
        <div class="links-container">${linksHtml}</div>
      `;
    } else if (moon.type === 'bio') {
      this.detailView.innerHTML += `
        <div class="detail-title">${moon.icon} ${content.heading}</div>
        <div class="detail-body">${content.body}</div>
      `;
    } else if (moon.type === 'skills') {
      this.detailView.innerHTML += `
        <div class="detail-title">${moon.icon} ${content.title}</div>
        <div class="tags-container">
          ${(content.skills || []).map(s => `<div class="tag-pill" style="border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.08);">${s}</div>`).join('')}
        </div>
      `;
    } else if (moon.type === 'social' || moon.type === 'link') {
      this.detailView.innerHTML += `
        <div class="detail-title">${moon.icon} ${moon.label}</div>
        <div class="links-container">
          <a href="${content.href}" target="_blank" class="link-btn" style="background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3);">
            ${content.label || moon.label} ↗
          </a>
        </div>
      `;
    }

    // Bind back button
    setTimeout(() => {
      const backBtn = document.getElementById('panel-back-btn');
      if (backBtn) {
        backBtn.onclick = () => {
          this.gridView.classList.remove('slide-out');
          this.detailView.classList.remove('slide-in');
        };
      }
    }, 0);

    this.gridView.classList.add('slide-out');
    this.detailView.classList.add('slide-in');
  }
}
