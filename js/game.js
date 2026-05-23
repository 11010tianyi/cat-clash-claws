class CatClashGame {
    constructor() {
        this.state = 'menu';
        this.canvas = null;
        this.ctx = null;
        this.cats = [];
        this.battleSystem = null;
        this.uiManager = null;
        this.aiSystem = null;
        this.lastTime = 0;
        this.animationId = null;
        this.keys = {};
        this.difficulty = 'medium';
        this.gameMode = 'ai';
        this.characterStyle = 'photo';
        this.touchMode = 'auto';
        this.currentTouchPlayer = 'kuro';
        this.keyMappings = {
            kuro: {
                'KeyW': () => this.moveCat('kuro', 0, -1, true),
                'KeyS': () => this.moveCat('kuro', 0, 1, true),
                'KeyA': () => this.moveCat('kuro', -1, 0, true),
                'KeyD': () => this.moveCat('kuro', 1, 0, true),
                'KeyJ': () => this.attackCat('kuro'),
                'KeyL': () => this.skillCat('kuro'),
                'KeyU': () => this.fireProjectileCat('kuro')
            },
            shiro: {
                'ArrowUp': () => this.moveCat('shiro', 0, -1, true),
                'ArrowDown': () => this.moveCat('shiro', 0, 1, true),
                'ArrowLeft': () => this.moveCat('shiro', -1, 0, true),
                'ArrowRight': () => this.moveCat('shiro', 1, 0, true),
                'Numpad1': () => this.attackCat('shiro'),
                'Numpad3': () => this.skillCat('shiro'),
                'Numpad0': () => this.fireProjectileCat('shiro')
            }
        };
        this.backgroundElements = {
            clouds: [],
            petals: []
        };
        this.isRunning = false;
        this.foodItems = [];
        this.foodSpawnTimer = 0;
        this.foodSpawnInterval = 5000;
        this.heartsEffect = null;
        this.blockedProjectileDebris = [];
        this.defendKeyMap = { kuro: 'KeyK', shiro: 'Numpad2' };
        this.touchDefendHeld = { kuro: false, shiro: false };
        
        this.touchControls = {
            kuro: { up: false, down: false, left: false, right: false },
            shiro: { up: false, down: false, left: false, right: false }
        };

        // 连续按键系统
        this.consecutiveKeys = {
            kuro: { lastDirection: null, pressCount: 0, lastPressTime: 0, lastRushTime: 0 },
            shiro: { lastDirection: null, pressCount: 0, lastPressTime: 0, lastRushTime: 0 }
        };

        // 冲撞状态
        this.rushingCats = {};
        this.rushTrails = [];

        // 慢移/快移速度（单击与长按慢移共用 NORMAL_MOVE_SPEED）
        this.fastMoveState = {
            kuro: { active: false, direction: null, dx: 0, dy: 0 },
            shiro: { active: false, direction: null, dx: 0, dy: 0 }
        };
        this.NORMAL_MOVE_SPEED = 3;
        this.FAST_MOVE_SPEED = 6;
        this.FAST_TAP_ENERGY_COST = 8;
        this.FAST_MOVE_ENERGY_DRAIN = 0.35;
        this.FAST_MOVE_MIN_ENERGY = 3;

        this.selectedMap = 'sakura';
        this.sceneBackgroundMode = 'painted';
        this.worldWidth = window.innerWidth;
        this.worldHeight = window.innerHeight;
        this.renderScale = 1;
        this.camera = { x: 0, y: 0 };
        this.obstacles = [];
        this.pendingRoundCheck = false;
        this.sceneryRenderer = new SceneryRenderer();
        this.sceneImages = {};
        this.sceneImagesLoaded = {};

        this.directionKeyMap = {
            kuro: { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD' },
            shiro: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }
        };
    }

    init() {
        audioManager.init();

        this.canvas = document.getElementById('game-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        this.uiManager = new UIManager();
        this.uiManager.init();
        this.uiManager.addHPAnimation();

        this.initBackgroundElements();
        this.setupEventListeners();
        this.setupDifficultyButtons();
        this.setupModeButtons();
        this.setupStyleButtons();
        this.setupTouchModeButtons();
        this.setupMapButtons();
        this.setupSceneButtons();
        this.preloadSceneImages();
        this.setupTouchControls();
        this.updateTouchControlsVisibility();
        this.updateCatPreview();
        this.showMenu();
    }

    getMapPreset() {
        return MAP_PRESETS[this.selectedMap] || MAP_PRESETS.sakura;
    }

    getLayoutMetrics() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const shortSide = Math.min(vw, vh);
        const uiScale = Utils.clamp(shortSide / 820, 0.52, 1.2);
        const isMobile = vw <= 768 || ('ontouchstart' in window && shortSide < 900);
        return {
            vw,
            vh,
            uiScale,
            catSize: Math.round(160 * uiScale),
            isMobile
        };
    }

    applyMapLayout() {
        const preset = this.getMapPreset();
        const metrics = this.getLayoutMetrics();
        const vw = metrics.vw;
        const vh = metrics.vh;
        const scale = preset.scale;
        this.layoutMetrics = metrics;

        document.documentElement.style.setProperty('--ui-scale', String(metrics.uiScale));
        document.documentElement.style.setProperty(
            '--hud-pad',
            metrics.isMobile ? '8px' : '20px'
        );
        // 逻辑世界随地图放大，渲染时同步缩小以保持在视口内
        this.worldWidth = vw * scale;
        this.worldHeight = vh * scale;
        this.mapPreset = preset;
        this.mapScale = scale;
        this.renderScale = 1 / scale;
        this.camera = { x: 0, y: 0 };

        if (this.canvas) {
            this.canvas.width = vw;
            this.canvas.height = vh;
        }

        this.obstacles = (preset.obstacles || []).map((o, i) => ({
            id: i,
            x: o.x * this.worldWidth,
            y: o.y * this.worldHeight,
            w: o.w * this.worldWidth,
            h: o.h * this.worldHeight,
            kind: o.kind,
            color: o.color
        }));

        this.refreshAmbientForMap(preset);
        this.ensureSceneImageLoaded(this.selectedMap);
    }

    preloadSceneImages() {
        Object.keys(MAP_PRESETS).forEach(mapId => {
            this.ensureSceneImageLoaded(mapId);
        });
    }

    ensureSceneImageLoaded(mapId) {
        const preset = MAP_PRESETS[mapId];
        if (!preset?.photoSrc || this.sceneImages[mapId]) return;

        const img = new Image();
        img.onload = () => {
            this.sceneImagesLoaded[mapId] = true;
        };
        img.onerror = () => {
            this.sceneImagesLoaded[mapId] = false;
        };
        img.src = preset.photoSrc;
        this.sceneImages[mapId] = img;
    }

    refreshAmbientForMap(preset) {
        const ambient = preset.ambient || { petals: true, clouds: 8, mist: false };
        this.backgroundElements.petals = [];
        if (ambient.petals) {
            for (let i = 0; i < 30; i++) {
                this.backgroundElements.petals.push({
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    size: 10 + Math.random() * 12,
                    speedY: 0.4 + Math.random() * 1.2,
                    speedX: -0.6 + Math.random() * 1.2,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: 0.015 + Math.random() * 0.035,
                    wobble: Math.random() * Math.PI * 2
                });
            }
        }

        const targetClouds = ambient.clouds ?? 8;
        while (this.backgroundElements.clouds.length < targetClouds) {
            this.backgroundElements.clouds.push({
                x: Math.random() * window.innerWidth,
                y: 50 + Math.random() * 150,
                width: 120 + Math.random() * 120,
                height: 50 + Math.random() * 40,
                speed: 0.15 + Math.random() * 0.25,
                opacity: 0.25 + Math.random() * 0.35
            });
        }
        this.backgroundElements.clouds.length = targetClouds;
        this.mapAmbientMist = ambient.mist;
    }

    setupSceneButtons() {
        const menuButtons = document.querySelectorAll('.scene-btn');
        menuButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setSceneBackgroundMode(btn.dataset.scene);
            });
        });

        const battlePainted = document.getElementById('battle-scene-painted');
        const battlePhoto = document.getElementById('battle-scene-photo');
        if (battlePainted) {
            battlePainted.addEventListener('click', () => this.setSceneBackgroundMode('painted'));
        }
        if (battlePhoto) {
            battlePhoto.addEventListener('click', () => this.setSceneBackgroundMode('photo'));
        }

        this.setSceneBackgroundMode(this.sceneBackgroundMode, true);
    }

    setSceneBackgroundMode(mode, silent = false) {
        this.sceneBackgroundMode = mode === 'photo' ? 'photo' : 'painted';

        document.querySelectorAll('.scene-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.scene === this.sceneBackgroundMode);
        });

        const battlePainted = document.getElementById('battle-scene-painted');
        const battlePhoto = document.getElementById('battle-scene-photo');
        if (battlePainted) {
            battlePainted.classList.toggle('active', this.sceneBackgroundMode === 'painted');
        }
        if (battlePhoto) {
            battlePhoto.classList.toggle('active', this.sceneBackgroundMode === 'photo');
        }

        if (!silent && this.uiManager) {
            const label = this.sceneBackgroundMode === 'photo' ? '真实场景' : '手绘场景';
            this.uiManager.showMessage(`已切换为${label}`, 1200);
        }
    }

    resizeCanvas() {
        this.applyMapLayout();
    }

    setupMapButtons() {
        const buttons = document.querySelectorAll('.map-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedMap = btn.dataset.map;
                this.applyMapLayout();
            });
        });
        const defaultBtn = document.querySelector('.map-btn[data-map="sakura"]');
        if (defaultBtn) defaultBtn.classList.add('selected');
    }

    updateCamera() {
        this.camera.x = 0;
        this.camera.y = 0;
    }

    getCatSpawnPositions() {
        const scale = this.mapScale || 1;
        const w = this.worldWidth;
        const h = this.worldHeight;
        const catW = this.layoutMetrics?.catSize || 160;
        const edge = scale === 1 ? 0.12 : scale === 2 ? 0.08 : 0.06;
        const y = h * 0.5 - catW * 0.45;
        return {
            kuro: { x: w * edge, y },
            shiro: { x: w * (1 - edge) - catW, y }
        };
    }

    getWorldPadding() {
        return 60;
    }

    getPlayBounds() {
        const pad = this.getWorldPadding();
        return {
            minX: pad,
            maxX: this.worldWidth - pad,
            minY: Math.round(this.worldHeight * 0.2),
            maxY: this.worldHeight - Math.round(this.worldHeight * 0.12)
        };
    }

    clampCatToWorld(cat) {
        const b = this.getPlayBounds();
        const maxX = b.maxX - cat.width;
        const maxY = b.maxY - cat.height;
        cat.targetX = Utils.clamp(cat.targetX, b.minX, maxX);
        cat.targetY = Utils.clamp(cat.targetY, b.minY, maxY);
        cat.x = Utils.clamp(cat.x, b.minX, maxX);
        cat.y = Utils.clamp(cat.y, b.minY, maxY);
        this.resolveObstacleCollision(cat);
    }

    resolveObstacleCollision(cat) {
        for (const obs of this.obstacles) {
            if (!this.catOverlapsObstacle(cat, obs)) continue;
            const catCx = cat.x + cat.width / 2;
            const catCy = cat.y + cat.height / 2;
            const obsCx = obs.x + obs.w / 2;
            const obsCy = obs.y + obs.h / 2;
            const dx = catCx - obsCx;
            const dy = catCy - obsCy;
            const overlapX = (cat.width / 2 + obs.w / 2) - Math.abs(dx);
            const overlapY = (cat.height / 2 + obs.h / 2) - Math.abs(dy);
            if (overlapX > 0 && overlapY > 0) {
                if (overlapX < overlapY) {
                    cat.x += dx > 0 ? overlapX + 2 : -(overlapX + 2);
                } else {
                    cat.y += dy > 0 ? overlapY + 2 : -(overlapY + 2);
                }
                cat.targetX = cat.x;
                cat.targetY = cat.y;
            }
        }
    }

    catOverlapsObstacle(cat, obs) {
        return cat.x < obs.x + obs.w &&
            cat.x + cat.width > obs.x &&
            cat.y < obs.y + obs.h &&
            cat.y + cat.height > obs.y;
    }

    initBackgroundElements() {
        for (let i = 0; i < 8; i++) {
            this.backgroundElements.clouds.push({
                x: Math.random() * window.innerWidth,
                y: 50 + Math.random() * 150,
                width: 120 + Math.random() * 120,
                height: 50 + Math.random() * 40,
                speed: 0.15 + Math.random() * 0.25,
                opacity: 0.25 + Math.random() * 0.35
            });
        }

        for (let i = 0; i < 30; i++) {
            this.backgroundElements.petals.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: 10 + Math.random() * 12,
                speedY: 0.4 + Math.random() * 1.2,
                speedX: -0.6 + Math.random() * 1.2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: 0.015 + Math.random() * 0.035,
                wobble: Math.random() * Math.PI * 2
            });
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.keys[e.code]) return;
            this.keys[e.code] = true;
            
            this.handleKeyPress(e.code);
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.handleDirectionKeyUp(e.code);
            this.handleDefendKeyUp(e.code);
        });
    }

    handleDirectionKeyUp(code) {
        for (const catId of ['kuro', 'shiro']) {
            const map = this.directionKeyMap[catId];
            const state = this.fastMoveState[catId];
            if (!state?.active || !state.direction) continue;
            if (map[state.direction] === code) {
                state.active = false;
                state.direction = null;
            }
        }
    }

    handleTouchDirectionRelease(catId, direction) {
        const state = this.fastMoveState[catId];
        if (!state?.active || state.direction !== direction) return;
        state.active = false;
        state.direction = null;
    }

    bindTouchMoveButton(selector, catId, { dir, dx, dy }, options = {}) {
        const btn = document.querySelector(selector);
        if (!btn) return;

        const resolveCatId = () => (options.useActivePlayer ? this.currentTouchPlayer : catId);
        let pressedCatId = null;

        const onStart = (e) => {
            e.preventDefault();
            pressedCatId = resolveCatId();
            this.touchControls[pressedCatId][dir] = true;
            this.moveCat(pressedCatId, dx, dy, true);
        };

        const onEnd = (e) => {
            e.preventDefault();
            const activeCatId = pressedCatId || resolveCatId();
            this.touchControls[activeCatId][dir] = false;
            this.handleTouchDirectionRelease(activeCatId, dir);
            pressedCatId = null;
        };

        btn.addEventListener('touchstart', onStart, { passive: false });
        btn.addEventListener('touchend', onEnd, { passive: false });
        btn.addEventListener('touchcancel', onEnd, { passive: false });
        btn.addEventListener('mousedown', onStart);
        btn.addEventListener('mouseup', onEnd);
        btn.addEventListener('mouseleave', onEnd);
    }

    bindTouchTapButton(selector, onTap) {
        const btn = document.querySelector(selector);
        if (!btn) return;

        const fire = (e) => {
            e.preventDefault();
            onTap();
        };

        btn.addEventListener('touchstart', fire, { passive: false });
        btn.addEventListener('mousedown', fire);
    }

    handleDefendKeyUp(code) {
        for (const catId of ['kuro', 'shiro']) {
            if (this.defendKeyMap[catId] === code) {
                const cat = this.cats.find(c => c.id === catId);
                if (cat) cat.releaseDefend();
            }
        }
    }

    bindTouchDefendHold(selector, catId, options = {}) {
        const btn = document.querySelector(selector);
        if (!btn) return;
        const resolveCatId = () => (options.useActivePlayer ? this.currentTouchPlayer : catId);
        let pressedCatId = null;
        const setDefend = (active) => {
            if (active) {
                pressedCatId = resolveCatId();
                this.touchDefendHeld[pressedCatId] = true;
            } else {
                const activeCatId = pressedCatId || resolveCatId();
                this.touchDefendHeld[activeCatId] = false;
                pressedCatId = null;
            }
        };
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); setDefend(true); });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); setDefend(false); });
        btn.addEventListener('touchcancel', (e) => { e.preventDefault(); setDefend(false); });
        btn.addEventListener('mousedown', () => setDefend(true));
        btn.addEventListener('mouseup', () => setDefend(false));
        btn.addEventListener('mouseleave', () => setDefend(false));
    }

    updateDefendHold() {
        if (this.state !== 'battle') return;

        ['kuro', 'shiro'].forEach(catId => {
            if (catId === 'shiro' && this.gameMode === 'ai') return;

            const cat = this.cats.find(c => c.id === catId);
            if (!cat || cat.isDead) return;

            const keyHeld = this.keys[this.defendKeyMap[catId]] || this.touchDefendHeld[catId];
            if (keyHeld) {
                if (!cat.isDefending && !cat.defendHoldExhausted) {
                    this.defendCat(catId, { silent: true });
                }
            } else {
                cat.defendHoldExhausted = false;
                if (cat.isDefending) {
                    cat.releaseDefend();
                }
            }
        });
    }

    isDirectionHeld(catId, direction) {
        const code = this.directionKeyMap[catId]?.[direction];
        if (code && this.keys[code]) return true;

        const touch = this.touchControls[catId];
        return touch && touch[direction];
    }

    setupDifficultyButtons() {
        const buttons = document.querySelectorAll('.difficulty-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.difficulty = btn.dataset.difficulty;
            });
        });
        
        if (document.querySelector('.difficulty-btn.medium')) {
            document.querySelector('.difficulty-btn.medium').classList.add('selected');
        }
    }

    setupModeButtons() {
        const buttons = document.querySelectorAll('.mode-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.gameMode = btn.dataset.mode;
                
                const difficultySection = document.querySelector('.difficulty-section');
                if (this.gameMode === 'ai') {
                    difficultySection.style.display = 'block';
                } else {
                    difficultySection.style.display = 'none';
                }
            });
        });
        
        if (document.querySelector('.mode-btn.ai-mode')) {
            document.querySelector('.mode-btn.ai-mode').classList.add('selected');
        }
    }

    setupStyleButtons() {
        const buttons = document.querySelectorAll('.style-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.characterStyle = btn.dataset.style;
                
                this.updateCatPreview();
            });
        });
        
        const defaultStyleBtn = document.querySelector('.style-btn.photo') || document.querySelector('.style-btn.cartoon');
        if (defaultStyleBtn) {
            defaultStyleBtn.classList.add('selected');
            this.characterStyle = defaultStyleBtn.dataset.style || 'photo';
            this.updateCatPreview();
        }
    }

    setupTouchModeButtons() {
        const buttons = document.querySelectorAll('.touch-mode-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.touchMode = btn.dataset.touch;
                this.updateTouchControlsVisibility();
            });
        });
        
        if (document.querySelector('.touch-mode-btn.auto')) {
            document.querySelector('.touch-mode-btn.auto').classList.add('selected');
        }
    }

    updateTouchControlsVisibility() {
        const singlePlayerControls = document.getElementById('single-player-controls');
        const twoPlayerControls = document.getElementById('two-player-controls');
        if (!singlePlayerControls || !twoPlayerControls) return;

        let shouldShow = false;
        
        if (this.touchMode === 'enabled') {
            shouldShow = true;
        } else if (this.touchMode === 'disabled') {
            shouldShow = false;
        } else {
            shouldShow = this.isTouchDevice();
        }

        if (shouldShow) {
            if (this.gameMode === 'ai') {
                singlePlayerControls.classList.add('visible');
                twoPlayerControls.classList.remove('visible');
            } else {
                singlePlayerControls.classList.remove('visible');
                twoPlayerControls.classList.add('visible');
            }
        } else {
            singlePlayerControls.classList.remove('visible');
            twoPlayerControls.classList.remove('visible');
        }
    }

    isTouchDevice() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    }

    setupTouchControls() {
        const touchTabs = document.querySelectorAll('.touch-tab');
        touchTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                touchTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentTouchPlayer = tab.dataset.player;
                ['kuro', 'shiro'].forEach((id) => {
                    this.touchControls[id] = { up: false, down: false, left: false, right: false };
                    this.touchDefendHeld[id] = false;
                });
            });
        });

        const singleMoves = [
            { selector: '.touch-btn.move-up', dir: 'up', dx: 0, dy: -1 },
            { selector: '.touch-btn.move-down', dir: 'down', dx: 0, dy: 1 },
            { selector: '.touch-btn.move-left', dir: 'left', dx: -1, dy: 0 },
            { selector: '.touch-btn.move-right', dir: 'right', dx: 1, dy: 0 }
        ];

        singleMoves.forEach(({ selector, dir, dx, dy }) => {
            this.bindTouchMoveButton(selector, 'kuro', { dir, dx, dy }, { useActivePlayer: true });
        });

        this.bindTouchTapButton('.touch-btn.attack-btn', () => this.attackCat(this.currentTouchPlayer));
        this.bindTouchTapButton('.touch-btn.skill-btn', () => this.skillCat(this.currentTouchPlayer));
        this.bindTouchDefendHold('.touch-btn.defend-btn', 'kuro', { useActivePlayer: true });

        this.setupTwoPlayerTouchControls();
    }

    setupTwoPlayerTouchControls() {
        const p1Moves = [
            { selector: '.touch-btn.move-up-p1', dir: 'up', dx: 0, dy: -1 },
            { selector: '.touch-btn.move-down-p1', dir: 'down', dx: 0, dy: 1 },
            { selector: '.touch-btn.move-left-p1', dir: 'left', dx: -1, dy: 0 },
            { selector: '.touch-btn.move-right-p1', dir: 'right', dx: 1, dy: 0 }
        ];
        p1Moves.forEach((cfg) => this.bindTouchMoveButton(cfg.selector, 'kuro', cfg));

        const p2Moves = [
            { selector: '.touch-btn.move-up-p2', dir: 'up', dx: 0, dy: -1 },
            { selector: '.touch-btn.move-down-p2', dir: 'down', dx: 0, dy: 1 },
            { selector: '.touch-btn.move-left-p2', dir: 'left', dx: -1, dy: 0 },
            { selector: '.touch-btn.move-right-p2', dir: 'right', dx: 1, dy: 0 }
        ];
        p2Moves.forEach((cfg) => this.bindTouchMoveButton(cfg.selector, 'shiro', cfg));

        this.bindTouchTapButton('.touch-btn.attack-btn-p1', () => this.attackCat('kuro'));
        this.bindTouchTapButton('.touch-btn.skill-btn-p1', () => this.skillCat('kuro'));
        this.bindTouchTapButton('.touch-btn.attack-btn-p2', () => this.attackCat('shiro'));
        this.bindTouchTapButton('.touch-btn.skill-btn-p2', () => this.skillCat('shiro'));

        this.bindTouchDefendHold('.touch-btn.defend-btn-p1', 'kuro');
        this.bindTouchDefendHold('.touch-btn.defend-btn-p2', 'shiro');
    }

    updateCatPreview() {
        const kuroPreview = document.querySelector('.cat-card.kuro .cat-avatar');
        const shiroPreview = document.querySelector('.cat-card.shiro .cat-avatar');
        
        if (this.characterStyle === 'cartoon') {
            kuroPreview.innerHTML = `
                <svg viewBox="0 0 100 100" class="cat-svg black-cat">
                    <ellipse cx="50" cy="55" rx="30" ry="25" fill="#2C2C2C"/>
                    <ellipse cx="50" cy="35" rx="22" ry="20" fill="#2C2C2C"/>
                    <polygon points="35,20 30,5 42,15" fill="#2C2C2C"/>
                    <polygon points="65,20 70,5 58,15" fill="#2C2C2C"/>
                    <polygon points="33,6 30,2 37,5" fill="#4A3A3A"/>
                    <polygon points="67,6 70,2 63,5" fill="#4A3A3A"/>
                    <ellipse cx="40" cy="32" rx="7" ry="9" fill="#FFFFFF"/>
                    <ellipse cx="60" cy="32" rx="7" ry="9" fill="#FFFFFF"/>
                    <ellipse cx="42" cy="33" rx="4" ry="6" fill="#FFD700"/>
                    <ellipse cx="62" cy="33" rx="4" ry="6" fill="#FFD700"/>
                    <ellipse cx="43" cy="32" rx="2" ry="2.5" fill="#000000"/>
                    <ellipse cx="63" cy="32" rx="2" ry="2.5" fill="#000000"/>
                    <ellipse cx="50" cy="42" rx="5" ry="3" fill="#FFB6C1"/>
                    <path d="M 45 46 Q 50 50 55 46" stroke="#FFB6C1" stroke-width="1.5" fill="none"/>
                </svg>
            `;
            shiroPreview.innerHTML = `
                <svg viewBox="0 0 100 100" class="cat-svg white-cat">
                    <ellipse cx="50" cy="55" rx="30" ry="25" fill="#FFFFFF" stroke="#E8E8E8" stroke-width="1"/>
                    <ellipse cx="50" cy="35" rx="22" ry="20" fill="#FFFFFF" stroke="#E8E8E8" stroke-width="1"/>
                    <polygon points="35,20 30,5 42,15" fill="#FFFFFF" stroke="#E8E8E8" stroke-width="1"/>
                    <polygon points="65,20 70,5 58,15" fill="#FFFFFF" stroke="#E8E8E8" stroke-width="1"/>
                    <polygon points="33,6 30,2 37,5" fill="#FFB6C1"/>
                    <polygon points="67,6 70,2 63,5" fill="#FFB6C1"/>
                    <ellipse cx="40" cy="32" rx="7" ry="9" fill="#FFFFFF" stroke="#E8E8E8" stroke-width="1"/>
                    <ellipse cx="60" cy="32" rx="7" ry="9" fill="#FFFFFF" stroke="#E8E8E8" stroke-width="1"/>
                    <ellipse cx="42" cy="33" rx="4" ry="6" fill="#F5DEB3"/>
                    <ellipse cx="62" cy="33" rx="4" ry="6" fill="#F5DEB3"/>
                    <ellipse cx="43" cy="32" rx="2" ry="2.5" fill="#000000"/>
                    <ellipse cx="63" cy="32" rx="2" ry="2.5" fill="#000000"/>
                    <ellipse cx="50" cy="42" rx="5" ry="3" fill="#FFB6C1"/>
                    <path d="M 45 46 Q 50 50 55 46" stroke="#FFB6C1" stroke-width="1.5" fill="none"/>
                </svg>
            `;
        } else {
            kuroPreview.innerHTML = `
                <img src="images/black-tea.png" alt="黑茶" style="width: 100%; height: 100%; object-fit: contain; border-radius: 20px;">
            `;
            shiroPreview.innerHTML = `
                <img src="images/white-Jasmine.png" alt="茉莉" style="width: 100%; height: 100%; object-fit: contain; border-radius: 20px;">
            `;
        }
    }

    handleKeyPress(code) {
        if (this.state !== 'battle') return;

        const mappings = { ...this.keyMappings.kuro, ...this.keyMappings.shiro };
        if (mappings[code]) {
            mappings[code]();
        }
    }

    showMenu() {
        this.state = 'menu';
        this.uiManager.showScreen('menu');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    start() {
        this.state = 'battle';
        this.uiManager.showScreen('battle');
        this.setSceneBackgroundMode(this.sceneBackgroundMode, true);

        this.initBattle();

        audioManager.startBackgroundMusic();

        this.lastTime = performance.now();
        this.isRunning = true;
        this.gameLoop(this.lastTime);

        this.uiManager.showMessage('战斗开始！', 2000);
        
        if (this.gameMode === 'ai') {
            this.uiManager.updateActionHint('控制黑茶：WASD移动 | J攻击 K防御 L技能');
            this.uiManager.updateDifficultyBadge(this.difficulty);
        } else {
            this.uiManager.updateActionHint('玩家1(WASD/JKL) vs 玩家2(方向键/小键盘123)');
            const difficultyBadge = document.getElementById('difficulty-badge');
            if (difficultyBadge) {
                difficultyBadge.textContent = '🎮 双人对战';
                difficultyBadge.className = 'difficulty-badge';
            }
        }
    }

    resetBattleRuntimeState() {
        this.keys = {};
        this.rushingCats = {};
        this.rushTrails = [];
        this.consecutiveKeys = {
            kuro: { lastDirection: null, pressCount: 0, lastPressTime: 0, lastRushTime: 0 },
            shiro: { lastDirection: null, pressCount: 0, lastPressTime: 0, lastRushTime: 0 }
        };
        this.fastMoveState = {
            kuro: { active: false, direction: null, dx: 0, dy: 0 },
            shiro: { active: false, direction: null, dx: 0, dy: 0 }
        };
        if (this.battleSystem?.roundEndTimeout) {
            clearTimeout(this.battleSystem.roundEndTimeout);
            this.battleSystem.roundEndTimeout = null;
        }
    }

    initBattle() {
        this.applyMapLayout();
        const canvasWidth = this.worldWidth;
        const canvasHeight = this.worldHeight;

        this.resetBattleRuntimeState();

        const spawns = this.getCatSpawnPositions();
        const layoutScale = this.layoutMetrics?.uiScale || 1;
        const kuro = new KuroCat(spawns.kuro.x, spawns.kuro.y, 'right', this.characterStyle);
        const shiro = new ShiroCat(spawns.shiro.x, spawns.shiro.y, 'left', this.characterStyle);
        kuro.applyLayoutScale(layoutScale);
        shiro.applyLayoutScale(layoutScale);

        this.cats = [kuro, shiro];
        this.foodItems = [];
        this.foodSpawnTimer = 0;
        this.heartsEffect = null;
        this.blockedProjectileDebris = [];
        this.touchDefendHeld = { kuro: false, shiro: false };
        this.touchControls = {
            kuro: { up: false, down: false, left: false, right: false },
            shiro: { up: false, down: false, left: false, right: false }
        };

        if (this.battleSystem) {
            this.battleSystem.reset();
        }
        this.battleSystem = new BattleSystem();
        this.battleSystem.init(this.cats);

        if (this.gameMode === 'ai') {
            this.aiSystem = new CatAI(this.difficulty);
        }

        this.battleSystem.onAttack = (attacker, defender, attackResult) => {
            this.uiManager.updateEnergy(attacker);
            if (attackResult && attackResult.combo > 1) {
                this.uiManager.showCombo(attacker, attackResult.combo);
            }
        };

        this.battleSystem.onDamage = (attacker, defender, damage, isCritical, attackResult) => {
            this.uiManager.updateHP(defender);
            this.uiManager.showDamage(defender, damage, isCritical, attackResult);
            
            if (attackResult && attackResult.dodged) {
                this.uiManager.showDodge(defender);
                this.uiManager.showMessage('闪避！', 800);
            } else if (attackResult && attackResult.backstab) {
                this.uiManager.showMessage('背刺！💥', 800);
            } else if (attackResult && attackResult.critical) {
                this.uiManager.showMessage('暴击！💥', 800);
            }
        };

        this.battleSystem.onSkill = (user, target, result) => {
            audioManager.playSkillSound();

            this.uiManager.updateEnergy(user);

            if (result && result.type === 'buff') {
                this.uiManager.showMessage(`${user.name} 发动护盾！✨`, 1000);
            } else if (result && result.type === 'damage') {
                this.uiManager.updateHP(target);
                this.uiManager.showMessage(`${user.name} 使用技能！⚡`, 1000);
            }
        };

        this.battleSystem.onHeal = (cat, amount) => {
            audioManager.playHealSound();
        };

        this.battleSystem.onBattleEnd = (winner) => {
            this.isRunning = false;
            audioManager.stopBackgroundMusic();

            if (winner) {
                audioManager.playVictorySound();
            } else {
                audioManager.playDefeatSound();
            }

            setTimeout(() => {
                this.uiManager.showResult(winner, this.battleSystem.roundWins);
            }, 1500);
        };

        this.battleSystem.onRoundEnd = (winner, round, roundWins) => {
            this.rushingCats = {};
            this.rushTrails = [];
            const message = `第 ${round} 局结束：${winner.name} 获胜！\n当前比分：黑茶 ${roundWins.kuro} - ${roundWins.shiro} 茉莉（三局两胜）`;
            this.uiManager.showMessage(message, 2500);
            this.uiManager.updateRound(round, roundWins);
        };

        this.battleSystem.onTurnChange = (round) => {
            this.uiManager.updateRound(round, this.battleSystem.roundWins);
        };

        this.uiManager.updateHP(kuro);
        this.uiManager.updateHP(shiro);
        this.uiManager.updateEnergy(kuro);
        this.uiManager.updateEnergy(shiro);
        this.uiManager.updateRound(1, { kuro: 0, shiro: 0 });
        
        const shiroIndicator = document.getElementById('shiro-indicator');
        if (shiroIndicator) {
            shiroIndicator.textContent = this.gameMode === 'ai' ? 'AI' : '玩家2';
            shiroIndicator.className = this.gameMode === 'ai' ? 'ai-indicator' : 'player-indicator';
        }
    }

    moveCat(catId, dx, dy, fromKeyPress = false) {
        const cat = this.cats.find(c => c.id === catId);
        if (!cat || cat.isDead) return;
        if (this.rushingCats[catId]?.active) return;

        const padding = 60;
        const applyDirection = () => {
            if (dx > 0) cat.direction = 'right';
            else if (dx < 0) cat.direction = 'left';
        };

        // 长按慢移：调用方传入 ±NORMAL_MOVE_SPEED，与单击慢移同速
        if (!fromKeyPress) {
            cat.targetX += dx;
            cat.targetY += dy;
            applyDirection();
        } else {
            const now = Date.now();
            const keyState = this.consecutiveKeys[catId];

            let direction = null;
            if (dx < 0) direction = 'left';
            else if (dx > 0) direction = 'right';
            else if (dy < 0) direction = 'up';
            else if (dy > 0) direction = 'down';

            if (direction) {
                const timeSinceLastPress = now - keyState.lastPressTime;
                if (keyState.lastDirection === direction && timeSinceLastPress < 300) {
                    keyState.pressCount++;
                } else {
                    keyState.pressCount = 1;
                }
                keyState.lastDirection = direction;
                keyState.lastPressTime = now;

                if (keyState.pressCount === 2) {
                    if (cat.energy < this.FAST_TAP_ENERGY_COST + this.FAST_MOVE_MIN_ENERGY) {
                        this.uiManager.showMessage('能量不足，无法快移', 1200);
                        keyState.pressCount = 0;
                    } else {
                        cat.energy = Math.max(0, cat.energy - this.FAST_TAP_ENERGY_COST);
                        this.uiManager.updateEnergy(cat);
                        cat.targetX += dx * this.FAST_MOVE_SPEED;
                        cat.targetY += dy * this.FAST_MOVE_SPEED;
                        applyDirection();
                        this.createRushTrail(cat);
                        this.activateFastMove(catId, direction, dx, dy);
                    }
                } else if (keyState.pressCount >= 3) {
                    this.deactivateFastMove(catId);
                    const timeSinceLastRush = now - keyState.lastRushTime;
                    if (timeSinceLastRush >= 60000) {
                        this.startRush(catId, direction);
                        keyState.pressCount = 0;
                        keyState.lastRushTime = now;
                    } else {
                        this.uiManager.showMessage('没力气了...', 1500);
                        keyState.pressCount = 0;
                    }
                } else {
                    cat.targetX += dx * this.NORMAL_MOVE_SPEED;
                    cat.targetY += dy * this.NORMAL_MOVE_SPEED;
                    applyDirection();
                }
            } else {
                cat.targetX += dx * this.NORMAL_MOVE_SPEED;
                cat.targetY += dy * this.NORMAL_MOVE_SPEED;
                applyDirection();
            }
        }

        this.clampCatToWorld(cat);
    }

    activateFastMove(catId, direction, dx, dy) {
        if (!this.fastMoveState[catId]) return;
        const cat = this.cats.find(c => c.id === catId);
        if (!cat || cat.energy < this.FAST_MOVE_MIN_ENERGY) return;

        this.fastMoveState[catId] = {
            active: true,
            direction,
            dx: dx || 0,
            dy: dy || 0
        };
    }

    deactivateFastMove(catId) {
        if (!this.fastMoveState[catId]) return;
        this.fastMoveState[catId].active = false;
        this.fastMoveState[catId].direction = null;
    }

    applyFastMoveHold(catId, cat) {
        const state = this.fastMoveState[catId];
        if (!state?.active || !state.direction) return false;

        if (!this.isDirectionHeld(catId, state.direction)) {
            this.deactivateFastMove(catId);
            return false;
        }

        if (cat.energy < this.FAST_MOVE_MIN_ENERGY) {
            this.deactivateFastMove(catId);
            this.uiManager.showMessage('能量不足，快移结束', 1000);
            return false;
        }

        cat.targetX += state.dx * this.FAST_MOVE_SPEED;
        cat.targetY += state.dy * this.FAST_MOVE_SPEED;
        if (state.dx > 0) cat.direction = 'right';
        else if (state.dx < 0) cat.direction = 'left';

        cat.energy = Math.max(0, cat.energy - this.FAST_MOVE_ENERGY_DRAIN);
        this.uiManager.updateEnergy(cat);

        if (Math.random() > 0.7) {
            this.createRushTrail(cat);
        }

        this.clampCatToWorld(cat);
        return true;
    }

    createRushTrail(cat) {
        for (let i = 0; i < 3; i++) {
            this.rushTrails.push({
                x: cat.x + cat.width / 2,
                y: cat.y + cat.height / 2,
                alpha: 0.6 - i * 0.15,
                size: 30 - i * 5,
                color: cat.id === 'kuro' ? 'rgba(100, 50, 150)' : 'rgba(255, 215, 0)',
                life: 1
            });
        }
    }

    startRush(catId, direction) {
        const cat = this.cats.find(c => c.id === catId);
        if (!cat || cat.isDead) return;

        this.rushingCats[catId] = {
            active: true,
            direction: direction,
            startX: cat.x,
            startY: cat.y,
            startTime: Date.now(),
            duration: 500 // 0.5秒
        };

        cat.isAttacking = true;

        const b = this.getPlayBounds();
        let targetX = cat.x;
        let targetY = cat.y;

        switch (direction) {
            case 'left':
                targetX = b.minX;
                break;
            case 'right':
                targetX = b.maxX - cat.width;
                break;
            case 'up':
                targetY = b.minY;
                break;
            case 'down':
                targetY = b.maxY - cat.height;
                break;
        }

        cat.targetX = targetX;
        cat.targetY = targetY;
    }

    updateRush(deltaTime) {
        for (const catId in this.rushingCats) {
            const rush = this.rushingCats[catId];
            if (!rush.active) continue;

            const cat = this.cats.find(c => c.id === catId);
            if (!cat) continue;

            const elapsed = Date.now() - rush.startTime;
            const progress = Math.min(elapsed / rush.duration, 1);

            // 冲撞轨迹
            if (Math.random() > 0.5) {
                this.createRushTrail(cat);
            }

            // 检测碰撞
            const otherCat = this.cats.find(c => c.id !== catId);
            if (otherCat && !otherCat.isDead) {
                const dx = (cat.x + cat.width / 2) - (otherCat.x + otherCat.width / 2);
                const dy = (cat.y + cat.height / 2) - (otherCat.y + otherCat.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 100) {
                    // 碰撞！把对方撞到边界
                    const pushDirectionX = dx > 0 ? 1 : -1;
                    const b = this.getPlayBounds();
                    const targetX = pushDirectionX > 0 
                        ? b.maxX - otherCat.width 
                        : b.minX;
                    
                    otherCat.targetX = targetX;
                    otherCat.x = otherCat.targetX;

                    // 造成伤害
                    const damage = 6 + Math.floor(Math.random() * 10);
                    const actualDamage = otherCat.takeDamage(damage, cat, { damageKind: 'melee' });
                    if (actualDamage > 0) {
                        audioManager.playHitSound();
                    }
                    this.uiManager.showDamage(otherCat, actualDamage, false, null);
                    this.uiManager.updateHP(otherCat);
                }
            }

            if (progress >= 1) {
                rush.active = false;
                cat.isAttacking = false;
                delete this.rushingCats[catId];
            }
        }

        // 更新轨迹
        this.rushTrails = this.rushTrails.filter(trail => {
            trail.life -= 0.05;
            trail.alpha = trail.life * 0.6;
            return trail.life > 0;
        });
    }

    attackCat(catId) {
        const attacker = this.cats.find(c => c.id === catId);
        const defender = this.cats.find(c => c.id !== catId);

        if (!attacker || !defender || attacker.isDead || !attacker.canStartAction('attack')) return;

        this.faceTarget(attacker, defender);
        audioManager.playAttackSound();

        const damage = this.battleSystem.processAttack(attacker, defender);

        if (damage > 0) {
            this.uiManager.updateHP(defender);
        } else {
            audioManager.playProjectileSound();
        }
    }

    faceTarget(cat, target) {
        if (!cat || !target) return;
        const catCenterX = cat.x + cat.width / 2;
        const targetCenterX = target.x + target.width / 2;
        cat.direction = targetCenterX >= catCenterX ? 'right' : 'left';
    }

    defendCat(catId, options = {}) {
        const cat = this.cats.find(c => c.id === catId);
        if (!cat || cat.isDead) return;
        if (!cat.isDefending && !cat.canStartAction('defend')) return;

        if (!cat.isDefending) {
            if (!options.silent) {
                audioManager.playDefendSound();
            }
            this.battleSystem.processDefend(cat);
        }

        // 检查是否两个猫都在防御
        const kuro = this.cats.find(c => c.id === 'kuro');
        const shiro = this.cats.find(c => c.id === 'shiro');
        if (kuro.isDefending && shiro.isDefending && !this.heartsEffect) {
            this.heartsEffect = {
                startTime: Date.now(),
                duration: 1500
            };
            audioManager.playKissSound();
        }
    }

    fireProjectileCat(catId) {
        const attacker = this.cats.find(c => c.id === catId);
        const target = this.cats.find(c => c.id !== catId);

        if (!attacker || !target || attacker.isDead || !attacker.canStartAction('projectile')) return;

        audioManager.playProjectileSound();
        attacker.fireProjectile(target);
    }

    skillCat(catId) {
        const user = this.cats.find(c => c.id === catId);
        const target = this.cats.find(c => c.id !== catId);

        if (!user || !target || user.isDead || !user.canStartAction('skill')) return;

        this.faceTarget(user, target);
        audioManager.playSkillSound();

        const result = this.battleSystem.processSkill(user, target);
        
        if (result) {
            this.uiManager.showSkillEffect(catId);
            this.uiManager.updateEnergy(user);
            
            if (result.type === 'damage') {
                this.uiManager.updateHP(target);
            }
        }
    }

    restart() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.resetBattleRuntimeState();
        if (this.battleSystem) {
            this.battleSystem.reset();
            this.battleSystem = null;
        }
        const winnerDisplay = document.getElementById('winner-display');
        if (winnerDisplay) {
            winnerDisplay.style.display = '';
        }
        this.start();
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        this.updateBackground(deltaTime);

        this.cats.forEach(cat => {
            cat.update(deltaTime);
        });

        if (this.aiSystem && this.gameMode === 'ai') {
            const aiCat = this.cats.find(c => c.id === 'shiro');
            const playerCat = this.cats.find(c => c.id === 'kuro');
            if (aiCat && playerCat && !aiCat.isDead) {
                this.aiSystem.update(aiCat, playerCat, deltaTime);
            }
        }

        this.handleKeyHold();
        this.updateDefendHold();
        this.updateBlockedProjectileDebris(deltaTime);
        this.updateCamera();

        this.checkCollision();
        this.updateRush(deltaTime);

        this.updateFood(deltaTime);
        this.checkFoodCollisions();
        this.checkProjectileCollisions();
        this.checkGameOverCheck();

        this.uiManager.updateHP(this.cats.find(c => c.id === 'kuro'));
        this.uiManager.updateHP(this.cats.find(c => c.id === 'shiro'));
        this.uiManager.updateEnergy(this.cats.find(c => c.id === 'kuro'));
        this.uiManager.updateEnergy(this.cats.find(c => c.id === 'shiro'));
    }

    handleKeyHold() {
        if (this.state !== 'battle') return;

        const kuro = this.cats.find(c => c.id === 'kuro');
        const shiro = this.cats.find(c => c.id === 'shiro');

        if (kuro && !kuro.isDead) {
            if (!this.applyFastMoveHold('kuro', kuro)) {
            const ms = this.NORMAL_MOVE_SPEED;
            if (this.keys['KeyW']) this.moveCat('kuro', 0, -ms);
            if (this.keys['KeyS']) this.moveCat('kuro', 0, ms);
            if (this.keys['KeyA']) this.moveCat('kuro', -ms, 0);
            if (this.keys['KeyD']) this.moveCat('kuro', ms, 0);

            if (this.touchControls.kuro.up) this.moveCat('kuro', 0, -ms);
            if (this.touchControls.kuro.down) this.moveCat('kuro', 0, ms);
            if (this.touchControls.kuro.left) this.moveCat('kuro', -ms, 0);
            if (this.touchControls.kuro.right) this.moveCat('kuro', ms, 0);
            }
        }

        if (shiro && !shiro.isDead && this.gameMode !== 'ai') {
            if (!this.applyFastMoveHold('shiro', shiro)) {
            const ms = this.NORMAL_MOVE_SPEED;
            if (this.keys['ArrowUp']) this.moveCat('shiro', 0, -ms);
            if (this.keys['ArrowDown']) this.moveCat('shiro', 0, ms);
            if (this.keys['ArrowLeft']) this.moveCat('shiro', -ms, 0);
            if (this.keys['ArrowRight']) this.moveCat('shiro', ms, 0);

            if (this.touchControls.shiro.up) this.moveCat('shiro', 0, -ms);
            if (this.touchControls.shiro.down) this.moveCat('shiro', 0, ms);
            if (this.touchControls.shiro.left) this.moveCat('shiro', -ms, 0);
            if (this.touchControls.shiro.right) this.moveCat('shiro', ms, 0);
            }
        }
    }

    checkCollision() {
        if (this.cats.length < 2) return;

        const cat1 = this.cats[0];
        const cat2 = this.cats[1];

        if (cat1.isDead || cat2.isDead) return;

        const cat1CenterX = cat1.x + cat1.width / 2;
        const cat1CenterY = cat1.y + cat1.height / 2;
        const cat2CenterX = cat2.x + cat2.width / 2;
        const cat2CenterY = cat2.y + cat2.height / 2;

        const dx = cat2CenterX - cat1CenterX;
        const dy = cat2CenterY - cat1CenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = cat1.width * 0.7;

        if (distance < minDistance) {
            const overlap = minDistance - distance;
            const separationX = dx > 0 ? -overlap / 2 : overlap / 2;
            const separationY = dy > 0 ? -overlap / 2 : overlap / 2;

            if (distance > 0) {
                const ratio = overlap / distance;
                cat1.x -= dx * ratio / 2;
                cat1.y -= dy * ratio / 2;
                cat1.targetX = cat1.x;
                cat1.targetY = cat1.y;
                
                cat2.x += dx * ratio / 2;
                cat2.y += dy * ratio / 2;
                cat2.targetX = cat2.x;
                cat2.targetY = cat2.y;
            } else {
                cat1.x -= overlap / 2;
                cat1.targetX = cat1.x;
                cat2.x += overlap / 2;
                cat2.targetX = cat2.x;
            }
        }
    }

    checkGameOverCheck() {
        for (const cat of this.cats) {
            if (cat.hp <= 0 && !cat.isDead && !cat.isDying) {
                cat.beginDeathAnimation();
            }
        }
        if (this.cats.some(c => c.isDying)) {
            return;
        }
        this.battleSystem.checkWinCondition();
    }

    updateBackground(deltaTime) {
        this.backgroundElements.clouds.forEach(cloud => {
            cloud.x += cloud.speed;
            if (cloud.x > this.canvas.width + cloud.width) {
                cloud.x = -cloud.width;
            }
        });

        this.backgroundElements.petals.forEach(petal => {
            petal.y += petal.speedY;
            petal.wobble += 0.025;
            petal.x += petal.speedX + Math.sin(petal.wobble) * 0.6;
            petal.rotation += petal.rotationSpeed;

            if (petal.y > this.canvas.height + petal.size) {
                petal.y = -petal.size;
                petal.x = Math.random() * this.canvas.width;
            }
            if (petal.x < -petal.size) {
                petal.x = this.canvas.width + petal.size;
            }
        });
    }

    spawnFood() {
        const foodTypes = [
            { name: '猫粮', emoji: '🐱', healMin: 3, healMax: 7, color: '#FFB347', size: 20, rarity: 0.35 },
            { name: '鸡肉冻干', emoji: '🍗', healMin: 5, healMax: 10, color: '#FFA07A', size: 25, rarity: 0.28 },
            { name: '罐头', emoji: '🥫', healMin: 8, healMax: 15, color: '#FFD700', size: 30, rarity: 0.22 },
            { name: '鱼干', emoji: '🐟', healMin: 4, healMax: 9, color: '#87CEEB', size: 22, rarity: 0.15 }
        ];

        const random = Math.random();
        let cumulative = 0;
        let selectedFood = foodTypes[0];

        for (const food of foodTypes) {
            cumulative += food.rarity;
            if (random <= cumulative) {
                selectedFood = food;
                break;
            }
        }

        const healAmount = Math.floor(Math.random() * (selectedFood.healMax - selectedFood.healMin + 1)) + selectedFood.healMin;
        const isStayingOnGround = Math.random() < 0.15;
        const groundY = this.worldHeight * 0.78 - 30;

        const foodItem = {
            x: Math.random() * (this.worldWidth - 100) + 50,
            y: -30,
            vy: 2 + Math.random() * 1.5,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            alpha: 1,
            life: 1,
            type: selectedFood,
            heal: healAmount,
            size: selectedFood.size,
            isStayingOnGround: isStayingOnGround,
            groundY: groundY,
            stayTime: isStayingOnGround ? 10000 : 0,
            startTime: Date.now()
        };

        this.foodItems.push(foodItem);
    }

    updateFood(deltaTime) {
        this.foodSpawnTimer += deltaTime;
        if (this.foodSpawnTimer >= this.foodSpawnInterval) {
            this.spawnFood();
            this.foodSpawnTimer = 0;
        }

        const currentTime = Date.now();
        this.foodItems = this.foodItems.filter(f => {
            if (f.isStayingOnGround && f.y < f.groundY) {
                f.y += f.vy;
            } else if (f.isStayingOnGround && f.y >= f.groundY) {
                f.y = f.groundY;
                const elapsed = currentTime - f.startTime;
                const stayProgress = elapsed / f.stayTime;
                f.life = Math.max(0, 1 - stayProgress);
                f.alpha = f.life;
                if (stayProgress >= 1) {
                    return false;
                }
            } else {
                f.y += f.vy;
                f.life -= 0.008;
                f.alpha = f.life;
            }
            f.rotation += f.rotationSpeed;
            return f.life > 0 && f.y < this.canvas.height + 50;
        });
    }

    checkFoodCollisions() {
        for (const cat of this.cats) {
            const catCenterX = cat.x + cat.width / 2;
            const catCenterY = cat.y + cat.height / 2;

            for (let i = this.foodItems.length - 1; i >= 0; i--) {
                const food = this.foodItems[i];
                const dist = Math.sqrt(
                    Math.pow(food.x - catCenterX, 2) +
                    Math.pow(food.y - catCenterY, 2)
                );

                if (dist < 80) {
                    const healAmount = food.heal;
                    const oldHp = cat.hp;
                    cat.hp = Math.min(cat.maxHp, cat.hp + healAmount);
                    const actualHeal = cat.hp - oldHp;

                    for (let j = 0; j < 6; j++) {
                        cat.hearts.push({
                            x: cat.x + cat.width / 2 + Utils.randomRange(-20, 20),
                            y: cat.y + cat.height / 2,
                            size: Utils.randomRange(12, 18),
                            alpha: 1,
                            vy: -1.2,
                            life: 1
                        });
                    }

                    this.foodItems.splice(i, 1);

                    if (food.type.name === '罐头') {
                        audioManager.playCanSound();
                    } else if (food.type.name === '鸡肉冻干') {
                        audioManager.playFreezeDriedSound();
                    } else {
                        audioManager.playFoodPickupSound();
                    }

                    this.uiManager.showMessage(`${cat.name} 捡到了 ${food.type.name}！恢复 ${actualHeal} 点生命！`, 1500);
                    break;
                }
            }
        }
    }

    spawnBlockedProjectileDebris(hit) {
        const groundY = this.worldHeight * 0.78;
        const count = hit.type === 'shuriken' ? 1 : 1;
        for (let i = 0; i < count; i++) {
            this.blockedProjectileDebris.push({
                x: hit.x + Utils.randomRange(-8, 8),
                y: hit.y,
                vy: 0.5 + Math.random() * 1.2,
                vx: Utils.randomRange(-1.5, 1.5),
                rotation: hit.rotation || 0,
                spin: hit.type === 'shuriken' ? 0.25 : 0.15,
                type: hit.type,
                color: hit.color,
                life: 1,
                groundY,
                settled: false,
                bounce: 0
            });
        }
        for (let i = 0; i < 6; i++) {
            this.blockedProjectileDebris.push({
                x: hit.x + Utils.randomRange(-20, 20),
                y: hit.y + Utils.randomRange(-10, 10),
                vy: Utils.randomRange(-2, 1),
                vx: Utils.randomRange(-2, 2),
                rotation: 0,
                spin: 0,
                type: 'spark',
                color: 'rgba(162, 155, 254, 0.9)',
                life: 0.6 + Math.random() * 0.3,
                groundY,
                settled: false,
                size: Utils.randomRange(3, 7)
            });
        }
    }

    updateBlockedProjectileDebris(deltaTime) {
        const dt = deltaTime * 0.001;
        this.blockedProjectileDebris = this.blockedProjectileDebris.filter(d => {
            d.life -= dt * (d.type === 'spark' ? 2.2 : 0.35);
            if (d.type === 'spark') {
                d.x += d.vx;
                d.y += d.vy;
                d.vy += 0.12;
                return d.life > 0;
            }

            if (!d.settled) {
                d.x += d.vx;
                d.y += d.vy;
                d.vy += 0.35;
                d.rotation += d.spin;
                if (d.y >= d.groundY) {
                    d.y = d.groundY;
                    d.settled = true;
                    d.bounce = 2;
                    d.vy = 0;
                    d.vx *= 0.3;
                }
            } else if (d.bounce > 0) {
                d.y = d.groundY - Math.sin((3 - d.bounce) * Math.PI) * 8;
                d.bounce -= dt * 4;
            }
            return d.life > 0;
        });
    }

    renderBlockedProjectileDebris(ctx) {
        this.blockedProjectileDebris.forEach(d => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, d.life));

            if (d.type === 'spark') {
                ctx.fillStyle = d.color;
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.size || 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                return;
            }

            ctx.translate(d.x, d.y);
            ctx.rotate(d.rotation);
            ctx.globalAlpha *= 0.85;

            if (d.type === 'shuriken') {
                ctx.fillStyle = '#4B0082';
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                    const angle = (i * Math.PI) / 2;
                    const r = i % 2 === 0 ? 10 : 4;
                    const px = Math.cos(angle) * r;
                    const py = Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                    const r = i % 2 === 0 ? 9 : 4;
                    const px = Math.cos(angle) * r;
                    const py = Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        });
    }

    checkProjectileCollisions() {
        for (let i = 0; i < this.cats.length; i++) {
            const attacker = this.cats[i];
            const defender = this.cats[(i + 1) % this.cats.length];

            const hits = attacker.checkProjectileHits(defender, this.worldWidth, this.worldHeight);
            hits.forEach(hit => {
                if (hit.blocked) {
                    audioManager.playShieldBlockProjectileSound();
                    this.spawnBlockedProjectileDebris(hit);
                    this.uiManager.showMessage('格挡！', 500);
                    return;
                }

                audioManager.playHitSound();
                defender.takeDamage(hit.damage, attacker);
                this.uiManager.showDamage(defender, hit.damage, false, null);
                this.uiManager.updateHP(defender);
            });
        }
    }

    render() {
        if (!this.ctx) return;

        const preset = this.mapPreset || MAP_PRESETS.sakura;
        const usePhoto = this.sceneBackgroundMode === 'photo' &&
            this.sceneImagesLoaded[this.selectedMap];

        if (usePhoto) {
            this.renderPhotoBackground(preset);
        } else {
            this.renderBackground();
            this.renderClouds();
            this.renderPetals();
            if (this.mapAmbientMist) {
                this.renderAmbientMist();
            }
        }

        this.ctx.save();
        this.ctx.scale(this.renderScale || 1, this.renderScale || 1);
        this.ctx.translate(-this.camera.x, -this.camera.y);

        if (usePhoto) {
            this.renderPhotoGroundOverlay(preset);
        } else {
            this.renderWorldGround();
            this.sceneryRenderer.drawAll(
                this.ctx,
                preset,
                this.worldWidth,
                this.worldHeight,
                this.lastTime
            );
        }

        this.renderRushTrails();
        this.renderFood();
        this.renderCats();
        this.renderAllProjectiles();
        this.renderBlockedProjectileDebris(this.ctx);
        this.ctx.restore();

        this.renderHeartsEffect();
    }

    renderPhotoBackground(preset) {
        const img = this.sceneImages[this.selectedMap];
        if (!img || !img.complete) {
            this.renderBackground();
            return;
        }

        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        const scale = Math.max(this.canvas.width / iw, this.canvas.height / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (this.canvas.width - dw) / 2;
        const dy = (this.canvas.height - dh) / 2;

        this.ctx.drawImage(img, dx, dy, dw, dh);

        const shade = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        shade.addColorStop(0, 'rgba(0,0,0,0.08)');
        shade.addColorStop(0.55, 'rgba(0,0,0,0)');
        shade.addColorStop(1, 'rgba(0,0,0,0.35)');
        this.ctx.fillStyle = shade;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderPhotoGroundOverlay(preset) {
        const groundY = this.worldHeight * 0.78;
        const grad = this.ctx.createLinearGradient(0, groundY - 40, 0, this.worldHeight);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.35, 'rgba(30,40,30,0.25)');
        grad.addColorStop(1, 'rgba(20,30,20,0.55)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, groundY - 40, this.worldWidth, this.worldHeight - groundY + 40);
    }

    renderAmbientMist() {
        const t = this.lastTime * 0.0003;
        for (let i = 0; i < 3; i++) {
            const y = this.canvas.height * (0.35 + i * 0.12) + Math.sin(t + i) * 15;
            const grad = this.ctx.createLinearGradient(0, y - 40, 0, y + 40);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(0.5, 'rgba(255,255,255,0.22)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, y - 40, this.canvas.width, 80);
        }
    }

    renderObstacles() {
        const preset = this.mapPreset || MAP_PRESETS.sakura;
        this.obstacles.forEach(obs => {
            this.ctx.save();
            this.ctx.fillStyle = obs.color;
            this.ctx.globalAlpha = 0.92;
            const r = 12;
            this.ctx.beginPath();
            if (this.ctx.roundRect) {
                this.ctx.roundRect(obs.x, obs.y, obs.w, obs.h, r);
            } else {
                this.ctx.rect(obs.x, obs.y, obs.w, obs.h);
            }
            this.ctx.fill();

            if (obs.kind === 'bamboo') {
                this.ctx.strokeStyle = 'rgba(45, 90, 61, 0.6)';
                this.ctx.lineWidth = 3;
                for (let i = 0; i < 4; i++) {
                    const bx = obs.x + obs.w * (0.2 + i * 0.2);
                    this.ctx.beginPath();
                    this.ctx.moveTo(bx, obs.y);
                    this.ctx.lineTo(bx, obs.y + obs.h);
                    this.ctx.stroke();
                }
            } else if (obs.kind === 'pond') {
                this.ctx.fillStyle = 'rgba(255,255,255,0.25)';
                this.ctx.beginPath();
                this.ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w * 0.35, obs.h * 0.3, 0, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (obs.kind === 'pillar') {
                this.ctx.fillStyle = 'rgba(0,0,0,0.15)';
                this.ctx.fillRect(obs.x + 8, obs.y + obs.h - 12, obs.w - 16, 12);
            }

            this.ctx.restore();
        });
    }

    renderRushTrails() {
        this.rushTrails.forEach(trail => {
            this.ctx.save();
            this.ctx.globalAlpha = trail.alpha;
            this.ctx.fillStyle = trail.color;
            this.ctx.beginPath();
            this.ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    renderHeartsEffect() {
        if (!this.heartsEffect) return;

        const currentTime = Date.now();
        const elapsed = currentTime - this.heartsEffect.startTime;
        if (elapsed > this.heartsEffect.duration) {
            this.heartsEffect = null;
            return;
        }

        const progress = elapsed / this.heartsEffect.duration;
        const size = 50 + progress * 200;
        const alpha = 1 - progress * 0.8;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.font = `${size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = '#FF69B4';
        this.ctx.shadowBlur = 30;
        this.ctx.fillText('❤️', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.restore();
    }

    renderFood() {
        this.foodItems.forEach(food => {
            this.ctx.save();
            this.ctx.globalAlpha = food.alpha;
            this.ctx.font = `${food.size}px Arial`;
            this.ctx.translate(food.x, food.y);
            this.ctx.rotate(food.rotation);
            this.ctx.shadowColor = food.type.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillText(food.type.emoji, -food.size / 2, food.size / 2);
            this.ctx.restore();
        });
    }

    renderBackground() {
        const preset = this.mapPreset || MAP_PRESETS.sakura;
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        preset.skyStops.forEach(([pos, color]) => gradient.addColorStop(pos, color));

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < 50; i++) {
            const x = (i * 73 + Date.now() * 0.001) % this.canvas.width;
            const y = (i * 47) % (this.canvas.height * 0.6);
            const size = 1 + Math.sin(Date.now() * 0.002 + i) * 0.5;
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(Date.now() * 0.003 + i) * 0.2})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    renderWorldGround() {
        const preset = this.mapPreset || MAP_PRESETS.sakura;
        const groundY = this.worldHeight * 0.78;
        const t = Date.now() * 0.001;

        const groundGradient = this.ctx.createLinearGradient(0, groundY - 30, 0, this.worldHeight);
        groundGradient.addColorStop(0, preset.ground.top);
        groundGradient.addColorStop(0.25, preset.ground.mid);
        groundGradient.addColorStop(1, preset.ground.bottom);

        this.ctx.fillStyle = groundGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(0, groundY);

        for (let x = 0; x <= this.worldWidth; x += 28) {
            const waveY = Math.sin(x * 0.012 + t) * 8 + Math.sin(x * 0.03 + t * 1.3) * 3;
            this.ctx.lineTo(x, groundY + waveY);
        }

        this.ctx.lineTo(this.worldWidth, this.worldHeight);
        this.ctx.lineTo(0, this.worldHeight);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        for (let x = 0; x <= this.worldWidth; x += 28) {
            const waveY = Math.sin(x * 0.012 + t) * 8;
            if (x === 0) this.ctx.moveTo(x, groundY + waveY);
            else this.ctx.lineTo(x, groundY + waveY);
        }
        this.ctx.stroke();

        const grassSets = {
            sakura: { color: 'rgba(120, 200, 120, 0.55)', accent: 'rgba(255, 182, 193, 0.5)' },
            bamboo: { color: 'rgba(80, 160, 90, 0.5)', accent: 'rgba(180, 220, 160, 0.4)' },
            canyon: { color: 'rgba(180, 150, 100, 0.5)', accent: 'rgba(220, 180, 120, 0.35)' }
        };
        const grass = grassSets[preset.id] || grassSets.sakura;

        this.ctx.fillStyle = grass.color;
        const grassStep = preset.scale > 1 ? 55 : 70;
        for (let i = 0; i < Math.ceil(this.worldWidth / grassStep); i++) {
            const x = i * grassStep + (i % 2) * 20;
            const baseY = groundY + 12 + (i % 4) * 10;
            const height = 22 + Math.sin(i * 0.7) * 10;

            this.ctx.beginPath();
            this.ctx.moveTo(x, baseY);
            this.ctx.lineTo(x - 7, baseY - height);
            this.ctx.lineTo(x, baseY - height + 6);
            this.ctx.lineTo(x + 7, baseY - height);
            this.ctx.closePath();
            this.ctx.fill();
        }

        if (preset.id === 'sakura') {
            this.ctx.fillStyle = grass.accent;
            for (let i = 0; i < Math.ceil(this.worldWidth / 100); i++) {
                const x = i * 100 + 40;
                const baseY = groundY + 20;
                this.ctx.beginPath();
                this.ctx.ellipse(x, baseY, 10, 6, 0, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        if (preset.id === 'canyon') {
            this.ctx.fillStyle = 'rgba(160, 130, 90, 0.25)';
            for (let i = 0; i < Math.ceil(this.worldWidth / 80); i++) {
                const x = i * 80 + 20;
                this.ctx.beginPath();
                this.ctx.ellipse(x, groundY + 35, 25, 8, 0, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    renderClouds() {
        this.backgroundElements.clouds.forEach(cloud => {
            this.ctx.save();
            this.ctx.globalAlpha = cloud.opacity;
            
            const gradient = this.ctx.createRadialGradient(
                cloud.x, cloud.y, 0,
                cloud.x, cloud.y, cloud.width / 2
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            
            this.ctx.beginPath();
            this.ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.ellipse(cloud.x - cloud.width * 0.25, cloud.y + 8, cloud.width * 0.35, cloud.height * 0.45, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.ellipse(cloud.x + cloud.width * 0.3, cloud.y + 5, cloud.width * 0.3, cloud.height * 0.4, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    renderPetals() {
        const petalColors = [
            'rgba(255, 182, 193, 0.75)',
            'rgba(255, 192, 203, 0.7)',
            'rgba(255, 218, 233, 0.65)',
            'rgba(253, 203, 213, 0.7)'
        ];

        this.backgroundElements.petals.forEach((petal, index) => {
            this.ctx.save();
            this.ctx.translate(petal.x, petal.y);
            this.ctx.rotate(petal.rotation);
            
            this.ctx.fillStyle = petalColors[index % petalColors.length];
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, petal.size / 2, petal.size / 3, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    renderCats() {
        this.cats.forEach(cat => {
            cat.draw(this.ctx);
        });
    }

    renderAllProjectiles() {
        this.cats.forEach(cat => {
            cat.drawProjectiles(this.ctx);
        });
    }
}

window.CatClashGame = CatClashGame;

window.game = new CatClashGame();
window.game.init();