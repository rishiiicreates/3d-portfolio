// ═══════════════════════════════════════════════════════════
// PORTFOLIO CONTENT DATA
// ═══════════════════════════════════════════════════════════

export const portfolioData = {
  // ─── EARTH — Base Station ───────────────────────────────
  earth: {
    moons: [
      {
        id: 'who-i-am',
        label: 'Who I Am',
        icon: '👤',
        type: 'bio',
        content: {
          heading: 'Who I Am',
          body: `I'm Hrishikesh Yadav — most people call me Rishii. I'm a B.Tech Computer Science student at SRM Institute of Science and Technology, with a Minor in AI/ML from IIT Guwahati. I don't just study tech — I build with it. Whether it's shipping an AI-powered web perception pipeline at 2 AM or prototyping a hyperlocal marketplace over a weekend, I live in the space between "what if" and "it's live." I believe the best portfolio is running code, not bullet points.`,
        },
      },
      {
        id: 'resume',
        label: 'Resume',
        icon: '📄',
        type: 'link',
        content: {
          label: 'Download Resume',
          url: '/resume.pdf',
          description: 'My full CV — experience, projects, education, and skills in one place.',
        },
      },
      {
        id: 'contact-quick',
        label: 'Contact',
        icon: '📡',
        type: 'social',
        content: {
          label: 'Email Me',
          url: 'mailto:rishiicreates@gmail.com',
          icon: '📧',
          handle: 'rishiicreates@gmail.com',
        },
      },
    ],
  },

  // ─── MARS — Projects & Builds ──────────────────────────
  mars: {
    moons: [
      {
        id: 'rawfy',
        label: 'Rawfy',
        icon: '🕷️',
        type: 'project',
        content: {
          title: 'Rawfy',
          description:
            'A web perception pipeline that gives AI agents the ability to see and understand the web. Rawfy crawls, captures, and extracts structured data from any webpage — turning the messy internet into clean, parseable context for LLMs and autonomous systems.',
          stack: ['Node.js', 'Python', 'MCP', 'Playwright', 'REST API'],
          status: 'shipped',
          links: {
            github: 'https://github.com/rishiiicreates/rawfy',
          },
        },
      },
      {
        id: 'malloc',
        label: 'MallOC',
        icon: '🛍️',
        type: 'project',
        content: {
          title: 'MallOC',
          description:
            'A hyperlocal marketplace connecting vendors and buyers within walkable distance. Real-time inventory, geofenced deals, and seamless checkout — designed for the chaos of Indian local commerce.',
          stack: ['React Native', 'Expo', 'Node.js', 'PostGIS', 'Razorpay', 'PostgreSQL'],
          status: 'building',
          links: {
            github: 'https://github.com/rishiiicreates/MallOC',
          },
        },
      },
      {
        id: 'shiro-project',
        label: 'Shiro',
        icon: '🤖',
        type: 'project',
        content: {
          title: 'Shiro',
          description:
            'An AI companion with a real personality — not a chatbot, not an assistant, but a friend who remembers, roasts, cares, and shows up differently every conversation. Built on deep prompt engineering and emotional architecture.',
          stack: ['Python', 'LLMs', 'Prompt Engineering', 'Personality Architecture'],
          status: 'living',
          links: {},
        },
      },
      {
        id: 'vakilai',
        label: 'VakilAI',
        icon: '⚖️',
        type: 'project',
        content: {
          title: 'VakilAI',
          description:
            'Legal AI for Indian law — making case research, statute lookup, and legal drafting accessible to lawyers and citizens alike. Uses RAG pipelines over Indian legal corpora for accurate, cited responses.',
          stack: ['Python', 'NLP', 'FastAPI', 'RAG', 'LangChain', 'Vector DB'],
          status: 'building',
          links: {
            github: 'https://github.com/rishiiicreates/VakilAI',
          },
        },
      },
    ],
  },

  // ─── NEPTUNE — Skills & Stack ─────────────────────────────
  neptune: {
    moons: [
      {
        id: 'ai-ml',
        label: 'AI / ML',
        icon: '🧠',
        type: 'skills',
        content: {
          heading: 'AI / Machine Learning',
          skills: [
            'Python',
            'PyTorch',
            'TensorFlow',
            'Scikit-learn',
            'LangChain',
            'RAG Pipelines',
            'Prompt Engineering',
            'NLP',
            'Computer Vision',
            'Hugging Face',
            'Vector Databases',
            'Fine-tuning',
          ],
        },
      },
      {
        id: 'frontend',
        label: 'Frontend',
        icon: '🎨',
        type: 'skills',
        content: {
          heading: 'Frontend',
          skills: [
            'React',
            'Next.js',
            'React Native',
            'Three.js',
            'GSAP',
            'HTML5 / CSS3',
            'Tailwind CSS',
            'JavaScript (ES6+)',
            'TypeScript',
            'Framer Motion',
            'WebGL / Shaders',
            'Figma',
          ],
        },
      },
      {
        id: 'backend',
        label: 'Backend',
        icon: '⚙️',
        type: 'skills',
        content: {
          heading: 'Backend',
          skills: [
            'Node.js',
            'Express',
            'FastAPI',
            'Python',
            'PostgreSQL',
            'MongoDB',
            'Redis',
            'REST APIs',
            'GraphQL',
            'Prisma',
            'Supabase',
            'Firebase',
          ],
        },
      },
      {
        id: 'devops',
        label: 'DevOps',
        icon: '🚀',
        type: 'skills',
        content: {
          heading: 'DevOps & Tools',
          skills: [
            'Git / GitHub',
            'Docker',
            'Linux',
            'Vercel',
            'Railway',
            'Nginx',
            'CI/CD',
            'GCP',
            'AWS (basics)',
            'Cloudflare',
            'GitHub Actions',
          ],
        },
      },
    ],
  },

  // ─── JUPITER — About Me ──────────────────────────────────
  jupiter: {
    moons: [
      {
        id: 'my-story',
        label: 'My Story',
        icon: '📖',
        type: 'bio',
        content: {
          heading: 'My Story',
          body: `I started coding because I wanted to build things nobody else was building. Not because someone told me to — because I couldn't stop thinking about what was possible. From hacking together my first terrible website to shipping AI tools that actually work, every project taught me that the gap between "I have an idea" and "it's live" is just stubbornness and late nights. I'm not the smartest person in the room, but I might be the most obsessed with making things real.`,
        },
      },
      {
        id: 'education',
        label: 'SRM × IIT-G',
        icon: '🎓',
        type: 'bio',
        content: {
          heading: 'Education',
          body: `B.Tech in Computer Science & Engineering at SRM Institute of Science and Technology, Chennai. Simultaneously pursuing a Minor Degree in AI & Machine Learning from IIT Guwahati — because one institution's workload wasn't enough, apparently. The combination gives me both depth in systems thinking and hands-on AI research methodology.`,
        },
      },
      {
        id: 'philosophy',
        label: 'Philosophy',
        icon: '💭',
        type: 'bio',
        content: {
          heading: 'Philosophy',
          body: `Ship fast, learn faster. I believe in building in public, failing loudly, and treating every project like it matters — because it does. Code is just crystallized thinking, and the best engineers are the ones who never stop asking "but why does it work that way?" I'm not here to optimize for a career. I'm here to build things that make me lose track of time.`,
        },
      },
    ],
  },

  // ─── SATURN — Blog & Writing ────────────────────────────
  saturn: {
    moons: [
      {
        id: 'blog-1',
        label: 'Latest Post',
        icon: '✍️',
        type: 'bio',
        content: {
          heading: 'Coming Soon',
          body: `The blog is being forged in the same fire as everything else. Soon this space will hold essays on building AI tools, surviving engineering college, the philosophy of shipping, and whatever else keeps me up at 3 AM. Stay tuned — the signal is warming up.`,
        },
      },
      {
        id: 'blog-2',
        label: 'Thoughts',
        icon: '💡',
        type: 'bio',
        content: {
          heading: 'Thought Fragments',
          body: `Unstructured notes, half-formed ideas, and the kind of observations that don't fit anywhere else. Think of this as the raw feed — before the editing, before the polish. The interesting stuff happens here first.`,
        },
      },
    ],
  },

  // ─── VENUS — Connect ──────────────────────────────────
  venus: {
    moons: [
      {
        id: 'email',
        label: 'Email',
        icon: '📧',
        type: 'social',
        content: {
          label: 'Send an Email',
          url: 'mailto:rishiicreates@gmail.com',
          icon: '📧',
          handle: 'rishiicreates@gmail.com',
        },
      },
      {
        id: 'github',
        label: 'GitHub',
        icon: '🐙',
        type: 'social',
        content: {
          label: 'GitHub',
          url: 'https://github.com/rishiiicreates',
          icon: '🐙',
          handle: '@rishiiicreates',
        },
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        icon: '💼',
        type: 'social',
        content: {
          label: 'LinkedIn',
          url: 'https://linkedin.com/in/rishiiicreates',
          icon: '💼',
          handle: '@rishiiicreates',
        },
      },
      {
        id: 'twitter',
        label: 'X / Twitter',
        icon: '🐦',
        type: 'social',
        content: {
          label: 'X / Twitter',
          url: 'https://x.com/rishiiicreates',
          icon: '🐦',
          handle: '@rishiiicreates',
        },
      },
    ],
  },
};
