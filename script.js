/* ═══════════════════════════════════════════════════════════════════
   CINEMATIC THEME SWITCHER — Environment System
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Configuration ── */
  const CONFIG = {
    STORAGE_KEY: 'aetheria-theme',
    TRANSITION_DURATION: 800,
    THEMES: ['night', 'sunset', 'softlight', 'colorful', 'professional'],
    STAR_COUNT: 80,
    SHOOTING_STAR_INTERVAL: 4000,
    CLOUD_COUNT: 5,
    BIRD_COUNT: 3,
    MAX_FPS: 60,
  };

  /* ── DOM References ── */
  const DOM = {
    html: document.documentElement,
    body: document.body,
    sky: document.getElementById('sky'),
    skyGradient: document.getElementById('skyGradient'),
    sunContainer: document.getElementById('sunContainer'),
    sun: document.getElementById('sun'),
    moonContainer: document.getElementById('moonContainer'),
    moon: document.getElementById('moon'),
    starsContainer: document.getElementById('starsContainer'),
    shootingStarsContainer: document.getElementById('shootingStars'),
    cloudsContainer: document.getElementById('cloudsContainer'),
    birdsContainer: document.getElementById('birdsContainer'),
    aurora: document.getElementById('aurora'),
    parallax: document.getElementById('parallax'),
    soundToggle: document.getElementById('soundToggle'),
    themeSelector: document.getElementById('themeSelector'),
    themeTrigger: document.getElementById('themeTrigger'),
    themePanel: document.getElementById('themePanel'),
    themeIcon: document.getElementById('themeIcon'),
    themeOptions: document.querySelectorAll('.theme-selector__option'),
    heroAccent: document.getElementById('heroAccent'),
    heroBadge: document.getElementById('heroBadge'),
    heroSubtitle: document.getElementById('heroSubtitle'),
    cardTag1: document.getElementById('cardTag1'),
    currentThemeLabel: document.getElementById('currentThemeLabel'),
    soundStatus: document.getElementById('soundStatus'),
    toggleParallax: document.getElementById('toggleParallax'),
    transitionOverlay: document.getElementById('transitionOverlay'),
  };

  /* ── Theme Configuration ── */
  const THEME_CONFIG = {
    night: {
      label: 'Midnight',
      badge: '🌌 Cinematic Environment System',
      subtitle: 'Deep space gradient with animated stars, shooting meteors, and a glowing moon with aurora effects.',
      accentText: 'Midnight Sky',
      cardTag: 'Night',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    },
    sunset: {
      label: 'Sunset',
      badge: '🌅 Golden Hour Mode',
      subtitle: 'Warm golden hour sky with animated sun movement, flying birds, and soft drifting clouds.',
      accentText: 'Sunset Glow',
      cardTag: 'Sunset',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>`,
    },
    softlight: {
      label: 'Soft Light',
      badge: '🌤️ Minimal Day Mode',
      subtitle: 'Clean and minimal light theme with soft blues, gentle clouds, and subtle animations.',
      accentText: 'Soft Light',
      cardTag: 'Day',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
    },
    colorful: {
      label: 'Colorful',
      badge: '🌈 Vibrant Gradient Mode',
      subtitle: 'Bold gradients, vibrant colors, and dynamic effects for a playful, energetic feel.',
      accentText: 'Vibrant',
      cardTag: 'Color',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 2 1 4 3 5s3 3 7 3z"/></svg>`,
    },
    professional: {
      label: 'Professional',
      badge: '💼 Corporate Clean Mode',
      subtitle: 'Corporate clean UI with refined colors, sharp typography, and professional styling.',
      accentText: 'Professional',
      cardTag: 'Pro',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    },
  };

  /* ════════════════════════════════════════════
     THEME MANAGER CLASS
     ════════════════════════════════════════════ */
  class ThemeManager {
    constructor() {
      this.currentTheme = this._resolveInitialTheme();
      this.isTransitioning = false;
      this.soundEnabled = false;
      this.parallaxEnabled = true;
      this.mouseX = 0;
      this.mouseY = 0;
      this.shootingStarInterval = null;
      this.animationFrameId = null;
      this.lastFrameTime = 0;
      this.cloudElements = [];
      this.birdElements = [];

      this._bindMethods();
      this._init();
    }

    _bindMethods() {
      this._handleTriggerClick = this._handleTriggerClick.bind(this);
      this._handleOptionClick = this._handleOptionClick.bind(this);
      this._handleDocumentClick = this._handleDocumentClick.bind(this);
      this._handleSoundToggle = this._handleSoundToggle.bind(this);
      this._handleParallaxToggle = this._handleParallaxToggle.bind(this);
      this._handleMouseMove = this._handleMouseMove.bind(this);
      this._handleSystemChange = this._handleSystemChange.bind(this);
    }

    _init() {
      this._applyTheme(this.currentTheme);
      this._updateUI();
      this._generateStars();
      this._generateShootingStars();
      this._generateClouds();
      this._generateBirds();
      this._setupParallax();

      // Event listeners
      DOM.themeTrigger.addEventListener('click', this._handleTriggerClick);
      DOM.themeOptions.forEach((opt) =>
        opt.addEventListener('click', this._handleOptionClick)
      );
      document.addEventListener('click', this._handleDocumentClick);
      DOM.soundToggle.addEventListener('click', this._handleSoundToggle);
      DOM.toggleParallax.addEventListener('click', this._handleParallaxToggle);

      // System theme detection
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', this._handleSystemChange);

      // Start shooting stars loop
      this._startShootingStars();
    }

    /* ── Public API ── */

    switchTheme(theme) {
      if (!CONFIG.THEMES.includes(theme) || theme === this.currentTheme) return;
      if (this.isTransitioning) return;

      this.isTransitioning = true;

      // Trigger overlay
      this._triggerTransitionOverlay();

      // Apply after brief delay
      requestAnimationFrame(() => {
        this._applyTheme(theme);
        this._updateUI();
        this._persistPreference(theme);

        setTimeout(() => {
          this.isTransitioning = false;
        }, CONFIG.TRANSITION_DURATION);
      });
    }

    cycleTheme() {
      const currentIndex = CONFIG.THEMES.indexOf(this.currentTheme);
      const nextIndex = (currentIndex + 1) % CONFIG.THEMES.length;
      this.switchTheme(CONFIG.THEMES[nextIndex]);
    }

    getTheme() {
      return this.currentTheme;
    }

    /* ── Theme Resolution ── */

    _resolveInitialTheme() {
      try {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (stored && CONFIG.THEMES.includes(stored)) {
          return stored;
        }
      } catch (e) {
        // Ignore storage errors
      }

      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'night';
      }

      return 'sunset';
    }

    /* ── Theme Application ── */

    _applyTheme(theme) {
      this.currentTheme = theme;
      DOM.html.setAttribute('data-theme', theme);
    }

    _updateUI() {
      const config = THEME_CONFIG[this.currentTheme];

      // Update trigger icon
      DOM.themeIcon.innerHTML = config.icon;

      // Update panel options
      DOM.themeOptions.forEach((opt) => {
        const isActive = opt.dataset.theme === this.currentTheme;
        opt.setAttribute('aria-checked', isActive.toString());
      });

      // Update hero content
      DOM.heroAccent.textContent = config.accentText;
      DOM.heroBadge.textContent = config.badge;
      DOM.heroSubtitle.textContent = config.subtitle;

      // Update card tag
      if (DOM.cardTag1) {
        DOM.cardTag1.textContent = config.cardTag;
      }

      // Update footer
      if (DOM.currentThemeLabel) {
        DOM.currentThemeLabel.textContent = `${config.label} Mode`;
      }
    }

    _persistPreference(theme) {
      try {
        localStorage.setItem(CONFIG.STORAGE_KEY, theme);
      } catch (e) {
        console.warn('Unable to persist theme:', e);
      }
    }

    /* ── Event Handlers ── */

    _handleTriggerClick() {
      const isOpen = DOM.themePanel.classList.contains('open');
      DOM.themePanel.classList.toggle('open', !isOpen);
      DOM.themeTrigger.setAttribute('aria-expanded', (!isOpen).toString());
    }

    _handleOptionClick(e) {
      const theme = e.currentTarget.dataset.theme;
      DOM.themePanel.classList.remove('open');
      DOM.themeTrigger.setAttribute('aria-expanded', 'false');
      this.switchTheme(theme);
    }

    _handleDocumentClick(e) {
      if (!DOM.themeSelector.contains(e.target)) {
        DOM.themePanel.classList.remove('open');
        DOM.themeTrigger.setAttribute('aria-expanded', 'false');
      }
    }

    _handleSoundToggle() {
      this.soundEnabled = !this.soundEnabled;
      DOM.soundToggle.classList.toggle('active', this.soundEnabled);
      if (DOM.soundStatus) {
        DOM.soundStatus.textContent = this.soundEnabled ? 'Sound On' : 'Sound Off';
      }
      // In a real app, you'd play ambient audio here
    }

    _handleParallaxToggle() {
      this.parallaxEnabled = !this.parallaxEnabled;
      DOM.toggleParallax.textContent = `Parallax: ${this.parallaxEnabled ? 'ON' : 'OFF'}`;

      if (!this.parallaxEnabled) {
        DOM.parallax.style.transform = '';
        DOM.sky.style.transform = '';
      }
    }

    _handleMouseMove(e) {
      if (!this.parallaxEnabled) return;

      this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

      // Update button radial gradient
      document.querySelectorAll('.btn').forEach((btn) => {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty('--x', `${x}%`);
        btn.style.setProperty('--y', `${y}%`);
      });
    }

    _handleSystemChange(e) {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (stored) return;

      const theme = e.matches ? 'night' : 'sunset';
      this.switchTheme(theme);
    }

    /* ── Parallax System ── */

    _setupParallax() {
      document.addEventListener('mousemove', this._handleMouseMove);
      this._startParallaxLoop();
    }

    _startParallaxLoop() {
      const loop = (timestamp) => {
        const elapsed = timestamp - this.lastFrameTime;

        if (elapsed >= 1000 / CONFIG.MAX_FPS) {
          this.lastFrameTime = timestamp;

          if (this.parallaxEnabled) {
            const parallaxX = this.mouseX * 10;
            const parallaxY = this.mouseY * 10;

            DOM.parallax.style.transform = `translate(${parallaxX}px, ${parallaxY}px)`;

            // Sky layers move at different speeds for depth
            const skyX = this.mouseX * 5;
            const skyY = this.mouseY * 5;
            DOM.sky.style.transform = `translate(${skyX}px, ${skyY}px)`;
          }
        }

        this.animationFrameId = requestAnimationFrame(loop);
      };

      this.animationFrameId = requestAnimationFrame(loop);
    }

    /* ── Stars Generation ── */

    _generateStars() {
      DOM.starsContainer.innerHTML = '';

      for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--duration', `${2 + Math.random() * 4}s`);
        star.style.setProperty('--delay', `${Math.random() * 5}s`);
        star.style.width = `${1 + Math.random() * 2}px`;
        star.style.height = star.style.width;
        DOM.starsContainer.appendChild(star);
      }
    }

    /* ── Shooting Stars ── */

    _generateShootingStars() {
      DOM.shootingStarsContainer.innerHTML = '';
    }

    _startShootingStars() {
      setInterval(() => {
        if (this.currentTheme === 'night' || this.currentTheme === 'colorful') {
          this._createShootingStar();
        }
      }, CONFIG.SHOOTING_STAR_INTERVAL);
    }

    _createShootingStar() {
      const star = document.createElement('div');
      star.className = 'shooting-star';
      star.style.top = `${Math.random() * 50}%`;
      star.style.left = `${Math.random() * 50}%`;
      star.style.setProperty('--duration', `${1.5 + Math.random() * 1.5}s`);
      star.style.setProperty('--delay', '0s');
      star.style.width = `${80 + Math.random() * 60}px`;
      DOM.shootingStarsContainer.appendChild(star);

      setTimeout(() => {
        if (star.parentNode) {
          star.parentNode.removeChild(star);
        }
      }, 3000);
    }

    /* ── Clouds Generation ── */

    _generateClouds() {
      DOM.cloudsContainer.innerHTML = '';

      for (let i = 0; i < CONFIG.CLOUD_COUNT; i++) {
        const cloud = document.createElement('div');
        cloud.className = `cloud cloud--${(i % 3) + 1}`;
        cloud.style.top = `${10 + Math.random() * 60}%`;
        cloud.style.setProperty('--duration', `${40 + Math.random() * 30}s`);
        cloud.style.setProperty('--delay', `${-Math.random() * 50}s`);
        cloud.style.opacity = `${0.1 + Math.random() * 0.3}`;
        DOM.cloudsContainer.appendChild(cloud);
        this.cloudElements.push(cloud);
      }
    }

    /* ── Birds Generation ── */

    _generateBirds() {
      DOM.birdsContainer.innerHTML = '';

      const birdSymbols = ['🐦', '🕊️', '🦅'];

      for (let i = 0; i < CONFIG.BIRD_COUNT; i++) {
        const bird = document.createElement('div');
        bird.className = 'bird';
        bird.textContent = birdSymbols[i % birdSymbols.length];
        bird.style.top = `${15 + Math.random() * 35}%`;
        bird.style.setProperty('--duration', `${12 + Math.random() * 10}s`);
        bird.style.setProperty('--delay', `${-Math.random() * 15}s`);
        bird.style.setProperty('--fly-y', `${-30 + Math.random() * 60}px`);
        bird.style.fontSize = `${0.8 + Math.random() * 0.8}rem`;
        DOM.birdsContainer.appendChild(bird);
        this.birdElements.push(bird);
      }
    }

    /* ── Transition Overlay ── */

    _triggerTransitionOverlay() {
      const rect = DOM.themeTrigger.getBoundingClientRect();
      const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
      const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;

      DOM.transitionOverlay.style.setProperty('--x', `${x}%`);
      DOM.transitionOverlay.style.setProperty('--y', `${y}%`);
      DOM.transitionOverlay.classList.remove('active');
      void DOM.transitionOverlay.offsetWidth;
      DOM.transitionOverlay.classList.add('active');

      setTimeout(() => {
        DOM.transitionOverlay.classList.remove('active');
      }, 900);
    }
  }

  /* ── Initialize ── */
  function init() {
    window.themeManager = new ThemeManager();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
