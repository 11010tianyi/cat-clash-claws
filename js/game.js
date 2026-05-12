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
        this.characterStyle = 'cartoon';
        this.touchMode = 'auto';
        this.currentTouchPlayer = 'kuro';
        this.keyMappings = {
            kuro: {
                'KeyW': () => this.moveCat('kuro', 0, -1),
                'KeyS': () => this.moveCat('kuro', 0, 1),
                'KeyA': () => this.moveCat('kuro', -1, 0),
                'KeyD': () => this.moveCat('kuro', 1, 0),
                'KeyJ': () => this.attackCat('kuro'),
                'KeyK': () => this.defendCat('kuro'),
                'KeyL': () => this.skillCat('kuro')
            },
            shiro: {
                'ArrowUp': () => this.moveCat('shiro', 0, -1),
                'ArrowDown': () => this.moveCat('shiro', 0, 1),
                'ArrowLeft': () => this.moveCat('shiro', -1, 0),
                'ArrowRight': () => this.moveCat('shiro', 1, 0),
                'Numpad1': () => this.attackCat('shiro'),
                'Numpad2': () => this.defendCat('shiro'),
                'Numpad3': () => this.skillCat('shiro')
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
        this.setupTouchControls();
        this.updateTouchControlsVisibility();
        this.showMenu();
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
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
        });
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
        
        if (document.querySelector('.style-btn.cartoon')) {
            document.querySelector('.style-btn.cartoon').classList.add('selected');
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
            });
        });

        const moveButtons = {
            'move-up': { dx: 0, dy: -1 },
            'move-down': { dx: 0, dy: 1 },
            'move-left': { dx: -1, dy: 0 },
            'move-right': { dx: 1, dy: 0 }
        };

        Object.keys(moveButtons).forEach(id => {
            const btn = document.querySelector(`.touch-btn.${id}`);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.moveCat(this.currentTouchPlayer, moveButtons[id].dx, moveButtons[id].dy);
                });
                btn.addEventListener('mousedown', () => {
                    this.moveCat(this.currentTouchPlayer, moveButtons[id].dx, moveButtons[id].dy);
                });
            }
        });

        const actionButtons = {
            'attack-btn': () => this.attackCat(this.currentTouchPlayer),
            'defend-btn': () => this.defendCat(this.currentTouchPlayer),
            'skill-btn': () => this.skillCat(this.currentTouchPlayer)
        };

        Object.keys(actionButtons).forEach(id => {
            const btn = document.querySelector(`.touch-btn.${id}`);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    actionButtons[id]();
                });
                btn.addEventListener('mousedown', actionButtons[id]);
            }
        });

        this.setupTwoPlayerTouchControls();
    }

    setupTwoPlayerTouchControls() {
        const p1MoveButtons = {
            'move-up-p1': { dx: 0, dy: -1 },
            'move-down-p1': { dx: 0, dy: 1 },
            'move-left-p1': { dx: -1, dy: 0 },
            'move-right-p1': { dx: 1, dy: 0 }
        };

        Object.keys(p1MoveButtons).forEach(id => {
            const btn = document.querySelector(`.touch-btn.${id}`);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.moveCat('kuro', p1MoveButtons[id].dx, p1MoveButtons[id].dy);
                });
                btn.addEventListener('mousedown', () => {
                    this.moveCat('kuro', p1MoveButtons[id].dx, p1MoveButtons[id].dy);
                });
            }
        });

        const p2MoveButtons = {
            'move-up-p2': { dx: 0, dy: -1 },
            'move-down-p2': { dx: 0, dy: 1 },
            'move-left-p2': { dx: -1, dy: 0 },
            'move-right-p2': { dx: 1, dy: 0 }
        };

        Object.keys(p2MoveButtons).forEach(id => {
            const btn = document.querySelector(`.touch-btn.${id}`);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.moveCat('shiro', p2MoveButtons[id].dx, p2MoveButtons[id].dy);
                });
                btn.addEventListener('mousedown', () => {
                    this.moveCat('shiro', p2MoveButtons[id].dx, p2MoveButtons[id].dy);
                });
            }
        });

        const p1ActionButtons = {
            'attack-btn-p1': () => this.attackCat('kuro'),
            'defend-btn-p1': () => this.defendCat('kuro'),
            'skill-btn-p1': () => this.skillCat('kuro')
        };

        Object.keys(p1ActionButtons).forEach(id => {
            const btn = document.querySelector(`.touch-btn.${id}`);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    p1ActionButtons[id]();
                });
                btn.addEventListener('mousedown', p1ActionButtons[id]);
            }
        });

        const p2ActionButtons = {
            'attack-btn-p2': () => this.attackCat('shiro'),
            'defend-btn-p2': () => this.defendCat('shiro'),
            'skill-btn-p2': () => this.skillCat('shiro')
        };

        Object.keys(p2ActionButtons).forEach(id => {
            const btn = document.querySelector(`.touch-btn.${id}`);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    p2ActionButtons[id]();
                });
                btn.addEventListener('mousedown', p2ActionButtons[id]);
            }
        });
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

    initBattle() {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        const kuro = new KuroCat(150, canvasHeight / 2 - 70, 'right', this.characterStyle);
        const shiro = new ShiroCat(canvasWidth - 290, canvasHeight / 2 - 70, 'left', this.characterStyle);

        this.cats = [kuro, shiro];
        this.foodItems = [];
        this.foodSpawnTimer = 0;

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
                this.uiManager.showResult(winner);
            }, 1500);
        };

        this.uiManager.updateHP(kuro);
        this.uiManager.updateHP(shiro);
        this.uiManager.updateEnergy(kuro);
        this.uiManager.updateEnergy(shiro);
        this.uiManager.updateTurn(1);
        
        const shiroIndicator = document.getElementById('shiro-indicator');
        if (shiroIndicator) {
            shiroIndicator.textContent = this.gameMode === 'ai' ? 'AI' : '玩家2';
            shiroIndicator.className = this.gameMode === 'ai' ? 'ai-indicator' : 'player-indicator';
        }
    }

    moveCat(catId, dx, dy) {
        const cat = this.cats.find(c => c.id === catId);
        if (!cat || cat.isDead) return;

        const moveSpeed = 5;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            cat.move(dx, dy);
        } else {
            cat.targetX += dx * moveSpeed;
            cat.targetY += dy * moveSpeed;
            if (dx > 0) cat.direction = 'right';
            if (dx < 0) cat.direction = 'left';
        }

        const padding = 60;
        cat.targetX = Utils.clamp(cat.targetX, padding, this.canvas.width - cat.width - padding);
        cat.targetY = Utils.clamp(cat.targetY, 180, this.canvas.height - cat.height - 180);

        cat.x = Utils.clamp(cat.x, padding, this.canvas.width - cat.width - padding);
        cat.y = Utils.clamp(cat.y, 180, this.canvas.height - cat.height - 180);
    }

    attackCat(catId) {
        const attacker = this.cats.find(c => c.id === catId);
        const defender = this.cats.find(c => c.id !== catId);

        if (!attacker || !defender || attacker.isDead) return;

        audioManager.playAttackSound();

        const damage = this.battleSystem.processAttack(attacker, defender);

        if (damage > 0) {
            this.uiManager.updateHP(defender);
        } else {
            audioManager.playProjectileSound();
        }
    }

    defendCat(catId) {
        const cat = this.cats.find(c => c.id === catId);
        if (!cat || cat.isDead) return;

        audioManager.playDefendSound();

        this.battleSystem.processDefend(cat);

        // 检查是否两个猫都在防御
        const kuro = this.cats.find(c => c.id === 'kuro');
        const shiro = this.cats.find(c => c.id === 'shiro');
        if (kuro.isDefending && shiro.isDefending && !this.heartsEffect) {
            this.heartsEffect = {
                startTime: Date.now(),
                duration: 1500
            };
        }
    }

    skillCat(catId) {
        const user = this.cats.find(c => c.id === catId);
        const target = this.cats.find(c => c.id !== catId);

        if (!user || !target || user.isDead) return;

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
            if (this.keys['KeyW']) this.moveCat('kuro', 0, -0.12);
            if (this.keys['KeyS']) this.moveCat('kuro', 0, 0.12);
            if (this.keys['KeyA']) this.moveCat('kuro', -0.12, 0);
            if (this.keys['KeyD']) this.moveCat('kuro', 0.12, 0);
        }

        if (shiro && !shiro.isDead && this.gameMode === 'local') {
            if (this.keys['ArrowUp']) this.moveCat('shiro', 0, -0.12);
            if (this.keys['ArrowDown']) this.moveCat('shiro', 0, 0.12);
            if (this.keys['ArrowLeft']) this.moveCat('shiro', -0.12, 0);
            if (this.keys['ArrowRight']) this.moveCat('shiro', 0.12, 0);
        }
    }

    checkGameOverCheck() {
        for (const cat of this.cats) {
            if (cat.hp <= 0 && !cat.isDead) {
                cat.die();
            }
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
        const groundY = this.canvas.height * 0.78 - 30;

        const foodItem = {
            x: Math.random() * (this.canvas.width - 100) + 50,
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
                    audioManager.playFoodPickupSound();
                    this.uiManager.showMessage(`${cat.name} 捡到了 ${food.type.name}！恢复 ${actualHeal} 点生命！`, 1500);
                    break;
                }
            }
        }
    }

    checkProjectileCollisions() {
        for (let i = 0; i < this.cats.length; i++) {
            const attacker = this.cats[i];
            const defender = this.cats[(i + 1) % this.cats.length];

            const hits = attacker.checkProjectileHits(defender, this.canvas);
            hits.forEach(hit => {
                audioManager.playHitSound();

                let finalDamage = hit.damage;
                if (defender.isDefending) {
                    finalDamage = Math.max(0, Math.floor(hit.damage * 0.5));
                }
                defender.takeDamage(finalDamage);
                this.uiManager.showDamage(defender, finalDamage, false, null);
                this.uiManager.updateHP(defender);
            });
        }
    }

    render() {
        if (!this.ctx) return;

        this.renderBackground();
        this.renderGround();
        this.renderClouds();
        this.renderPetals();
        this.renderCats();
        this.renderFood();
        this.renderHeartsEffect();
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
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#ffecd2');
        gradient.addColorStop(0.3, '#fcb69f');
        gradient.addColorStop(0.6, '#e0c3fc');
        gradient.addColorStop(1, '#8ec5fc');

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

    renderGround() {
        const groundY = this.canvas.height * 0.78;
        
        const groundGradient = this.ctx.createLinearGradient(0, groundY, 0, this.canvas.height);
        groundGradient.addColorStop(0, '#98D8C8');
        groundGradient.addColorStop(0.3, '#7CCD7C');
        groundGradient.addColorStop(1, '#6BBF6B');

        this.ctx.fillStyle = groundGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(0, groundY);
        
        for (let x = 0; x <= this.canvas.width; x += 40) {
            const waveY = Math.sin(x * 0.015 + Date.now() * 0.001) * 6;
            this.ctx.lineTo(x, groundY + waveY);
        }
        
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = 'rgba(144, 238, 144, 0.4)';
        for (let i = 0; i < 25; i++) {
            const x = (i * 90 + 30) % this.canvas.width;
            const baseY = groundY + 15 + (i % 3) * 15;
            const height = 20 + Math.sin(i) * 8;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, baseY);
            this.ctx.lineTo(x - 6, baseY - height);
            this.ctx.lineTo(x, baseY - height + 5);
            this.ctx.lineTo(x + 6, baseY - height);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        for (let i = 0; i < 15; i++) {
            const x = (i * 120 + 60) % this.canvas.width;
            const baseY = groundY + 25;
            const height = 15 + Math.cos(i) * 5;
            
            this.ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
            this.ctx.beginPath();
            this.ctx.ellipse(x, baseY - height / 2, 8, height / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
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
}

window.CatClashGame = CatClashGame;

window.game = new CatClashGame();
window.game.init();