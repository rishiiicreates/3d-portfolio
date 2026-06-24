// ═══════════════════════════════════════════════════════════
// PORTFOLIO SOLAR SYSTEM — CONSTANTS
// ═══════════════════════════════════════════════════════════

export const COLORS = {
  void: 0x050A1A,
  nebulaPurple: 0x6B21A8,
  cyan: 0x22D3EE,
  sunAmber: 0xF59E0B,
  starWhite: 0xF1F5F9,
  danger: 0xEF4444,
  neonPink: 0xEC4899,
};

export const PLANET_CONFIG = {
  astra: {
    name: 'Astra',
    subtitle: 'Base Station',
    emoji: '🪐',
    orbitRadius: 900,
    orbitSpeed: 0,
    planetRadius: 40,
    color: 0x22D3EE,
    accentColor: 0x67E8F9,
    atmosphereColor: 0x22D3EE,
    hasRings: true,
    ringColor: 0x67E8F9,
    rotationSpeed: 0.002,
    moons: [
      { id: 'who-i-am', label: 'Who I Am', icon: '👤', orbitRadius: 80, orbitSpeed: 0.008, radius: 6 },
      { id: 'resume', label: 'Resume', icon: '📄', orbitRadius: 105, orbitSpeed: 0.006, radius: 5 },
      { id: 'contact-quick', label: 'Contact', icon: '📡', orbitRadius: 130, orbitSpeed: 0.004, radius: 5 },
    ],
  },
  forge: {
    name: 'Forge',
    subtitle: 'Projects & Builds',
    emoji: '🌋',
    orbitRadius: 1500,
    orbitSpeed: 0.00015,
    planetRadius: 35,
    color: 0xEA580C,
    accentColor: 0xFB923C,
    atmosphereColor: 0xEA580C,
    hasRings: false,
    rotationSpeed: 0.003,
    moons: [
      { id: 'rawfy', label: 'Rawfy', icon: '🕷️', orbitRadius: 70, orbitSpeed: 0.01, radius: 6 },
      { id: 'malloc', label: 'MallOC', icon: '🛍️', orbitRadius: 90, orbitSpeed: 0.008, radius: 5 },
      { id: 'shiro-project', label: 'Shiro', icon: '🤖', orbitRadius: 110, orbitSpeed: 0.006, radius: 5 },
      { id: 'vakilai', label: 'VakilAI', icon: '⚖️', orbitRadius: 130, orbitSpeed: 0.005, radius: 5 },
    ],
  },
  codex: {
    name: 'Codex',
    subtitle: 'Skills & Stack',
    emoji: '❄️',
    orbitRadius: 2200,
    orbitSpeed: 0.0001,
    planetRadius: 30,
    color: 0x93C5FD,
    accentColor: 0xDBEAFE,
    atmosphereColor: 0x60A5FA,
    hasRings: false,
    rotationSpeed: 0.0015,
    moons: [
      { id: 'ai-ml', label: 'AI / ML', icon: '🧠', orbitRadius: 65, orbitSpeed: 0.009, radius: 5 },
      { id: 'frontend', label: 'Frontend', icon: '🎨', orbitRadius: 85, orbitSpeed: 0.007, radius: 5 },
      { id: 'backend', label: 'Backend', icon: '⚙️', orbitRadius: 105, orbitSpeed: 0.006, radius: 5 },
      { id: 'devops', label: 'DevOps', icon: '🚀', orbitRadius: 125, orbitSpeed: 0.005, radius: 4 },
    ],
  },
  lore: {
    name: 'Lore',
    subtitle: 'About Me',
    emoji: '🌍',
    orbitRadius: 2900,
    orbitSpeed: 0.00008,
    planetRadius: 33,
    color: 0x4ADE80,
    accentColor: 0x86EFAC,
    atmosphereColor: 0x22C55E,
    hasRings: false,
    rotationSpeed: 0.002,
    moons: [
      { id: 'my-story', label: 'My Story', icon: '📖', orbitRadius: 70, orbitSpeed: 0.008, radius: 5 },
      { id: 'education', label: 'SRM × IIT-G', icon: '🎓', orbitRadius: 95, orbitSpeed: 0.006, radius: 5 },
      { id: 'philosophy', label: 'Philosophy', icon: '💭', orbitRadius: 115, orbitSpeed: 0.005, radius: 4 },
    ],
  },
  signal: {
    name: 'Signal',
    subtitle: 'Blog & Writing',
    emoji: '🔮',
    orbitRadius: 3500,
    orbitSpeed: 0.00006,
    planetRadius: 28,
    color: 0xA855F7,
    accentColor: 0xC084FC,
    atmosphereColor: 0x9333EA,
    hasRings: false,
    rotationSpeed: 0.001,
    moons: [
      { id: 'blog-1', label: 'Latest Post', icon: '✍️', orbitRadius: 60, orbitSpeed: 0.01, radius: 4 },
      { id: 'blog-2', label: 'Thoughts', icon: '💡', orbitRadius: 80, orbitSpeed: 0.008, radius: 4 },
    ],
  },
  nexus: {
    name: 'Nexus',
    subtitle: 'Connect',
    emoji: '✨',
    orbitRadius: 4200,
    orbitSpeed: 0.00004,
    planetRadius: 20,
    color: 0xEC4899,
    accentColor: 0xF472B6,
    atmosphereColor: 0xDB2777,
    hasRings: true,
    ringColor: 0xF472B6,
    rotationSpeed: 0.004,
    moons: [
      { id: 'email', label: 'Email', icon: '📧', orbitRadius: 45, orbitSpeed: 0.015, radius: 4 },
      { id: 'github', label: 'GitHub', icon: '🐙', orbitRadius: 60, orbitSpeed: 0.012, radius: 4 },
      { id: 'linkedin', label: 'LinkedIn', icon: '💼', orbitRadius: 75, orbitSpeed: 0.01, radius: 3 },
      { id: 'twitter', label: 'X / Twitter', icon: '🐦', orbitRadius: 90, orbitSpeed: 0.008, radius: 3 },
    ],
  },
};

export const SUN_CONFIG = {
  radius: 120,
  color: 0xF59E0B,
  coronaColor: 0xFBBF24,
  emissiveIntensity: 2,
  deathZones: {
    safe: 800,
    warning: 500,
    danger: 300,
    death: 180,
  },
};

export const SHIP_CONFIG = {
  maxSpeed: 8,
  boostMultiplier: 2.5,
  acceleration: 0.15,
  deceleration: 0.97,
  brakeForce: 0.92,
  rotationSpeed: 0.003,
  mouseSmoothing: 0.08,
  bobbingAmplitude: 0.3,
  bobbingSpeed: 1.5,
};

export const CAMERA_CONFIG = {
  fov: 65,
  near: 0.1,
  far: 50000,
  followDistance: 25,
  followHeight: 8,
  followSmoothing: 0.05,
  dockTransitionDuration: 2,
};

export const WORLD_CONFIG = {
  starCount: 12000,
  starFieldRadius: 25000,
  asteroidCount: 400,
  asteroidBeltInnerRadius: 1100,
  asteroidBeltOuterRadius: 1350,
  asteroidBeltHeight: 80,
  galaxyCount: 7,
  galaxyMinDistance: 15000,
  galaxyMaxDistance: 30000,
  shootingStarInterval: [4, 12], // seconds min/max
  dustParticleCount: 3000,
};

export const INTERACTION_CONFIG = {
  planetLabelDistance: 500,
  dockDistance: 120,
  moonClickDistance: 30,
};

export const DEATH_QUIPS = [
  "The sun doesn't care about your portfolio.",
  "Icarus had the same idea. Look how that turned out.",
  "Hot take: you shouldn't have done that.",
  "Your resume is now plasma.",
  "Achievement unlocked: Sunburn (fatal).",
  "Maybe stick to the planets next time?",
  "The sun: undefeated since 4.6 billion years.",
  "That's one way to make a stellar impression.",
  "You were so bright. Briefly.",
  "Solar-powered career move. Bold.",
];
