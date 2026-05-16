class UIManager {
    constructor() {
        this.elements = {};
        this.damageNumbers = [];
        this.messageTimeout = null;
    }

    init() {
        this.elements = {
            menuScreen: document.getElementById('menu-screen'),
            battleScreen: document.getElementById('battle-screen'),
            resultScreen: document.getElementById('result-screen'),
            
            kuroHp: document.getElementById('kuro-hp'),
            kuroHpText: document.getElementById('kuro-hp-text'),
            kuroEnergy: document.getElementById('kuro-energy'),
            
            shiroHp: document.getElementById('shiro-hp'),
            shiroHpText: document.getElementById('shiro-hp-text'),
            shiroEnergy: document.getElementById('shiro-energy'),
            
            turnCount: document.getElementById('turn-count'),
            actionHint: document.getElementById('action-hint'),
            battleMessage: document.getElementById('battle-message'),
            damageNumbers: document.getElementById('damage-numbers'),
            
            resultBadge: document.getElementById('result-badge'),
            resultTitle: document.getElementById('result-title'),
            winnerDisplay: document.getElementById('winner-display'),
            winnerCat: document.getElementById('winner-cat'),
            winnerInfo: document.getElementById('winner-info'),
            resultSubtitle: document.getElementById('result-subtitle'),
            
            confetti: document.getElementById('confetti'),
            difficultyBadge: document.getElementById('difficulty-badge')
        };
        
        this.initMenuBackground();
    }

    initMenuBackground() {
        const bubblesContainer = document.querySelector('.floating-bubbles');
        if (bubblesContainer) {
            for (let i = 0; i < 12; i++) {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                bubble.style.left = `${Math.random() * 100}%`;
                bubble.style.width = `${20 + Math.random() * 40}px`;
                bubble.style.height = bubble.style.width;
                bubble.style.animationDuration = `${8 + Math.random() * 12}s`;
                bubble.style.animationDelay = `${Math.random() * 10}s`;
                bubblesContainer.appendChild(bubble);
            }
        }
        
        const petalsContainer = document.querySelector('.falling-petals-container');
        if (petalsContainer) {
            const petalEmojis = ['🌸', '🌺', '🌷', '💮', '✿', '❀'];
            for (let i = 0; i < 15; i++) {
                const petal = document.createElement('div');
                petal.className = 'petal';
                petal.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
                petal.style.left = `${Math.random() * 100}%`;
                petal.style.fontSize = `${16 + Math.random() * 12}px`;
                petal.style.animationDuration = `${6 + Math.random() * 8}s`;
                petal.style.animationDelay = `${Math.random() * 10}s`;
                petalsContainer.appendChild(petal);
            }
        }
        
        const starsContainer = document.querySelector('.stars');
        if (starsContainer) {
            for (let i = 0; i < 30; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.left = `${Math.random() * 100}%`;
                star.style.top = `${Math.random() * 60}%`;
                star.style.animationDelay = `${Math.random() * 2}s`;
                starsContainer.appendChild(star);
            }
        }
    }

    showScreen(screenName) {
        const screens = ['menu', 'battle', 'result'];
        
        screens.forEach(name => {
            const screen = document.getElementById(`${name}-screen`);
            if (screen) {
                screen.classList.remove('active');
            }
        });
        
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    updateHP(cat) {
        const hpElement = cat.id === 'kuro' ? this.elements.kuroHp : this.elements.shiroHp;
        const hpTextElement = cat.id === 'kuro' ? this.elements.kuroHpText : this.elements.shiroHpText;
        
        if (hpElement && hpTextElement) {
            const hpPercent = (cat.hp / cat.maxHp) * 100;
            hpElement.style.width = `${hpPercent}%`;
            
            if (hpPercent > 50) {
                hpElement.style.backgroundPosition = '100% 0';
            } else if (hpPercent > 25) {
                hpElement.style.backgroundPosition = '50% 0';
            } else {
                hpElement.style.backgroundPosition = '0% 0';
                hpElement.style.animation = 'hpPulse 0.5s ease-in-out infinite';
            }
            
            hpTextElement.textContent = `${Math.ceil(cat.hp)}/${cat.maxHp}`;
        }
    }

    updateEnergy(cat) {
        const energyElement = cat.id === 'kuro' ? this.elements.kuroEnergy : this.elements.shiroEnergy;
        
        if (energyElement) {
            const energyPercent = (cat.energy / cat.maxEnergy) * 100;
            energyElement.style.width = `${energyPercent}%`;
        }
    }

    updateTurn(turn) {
        if (this.elements.turnCount) {
            this.elements.turnCount.textContent = turn;
        }
    }

    updateActionHint(text) {
        if (this.elements.actionHint) {
            this.elements.actionHint.textContent = text;
        }
    }

    updateDifficultyBadge(difficulty) {
        if (this.elements.difficultyBadge) {
            this.elements.difficultyBadge.className = 'difficulty-badge ' + difficulty;
            
            const difficultyText = {
                'easy': '🌸 萌新模式',
                'medium': '🌸 挑战模式',
                'hard': '🌸 大师模式'
            };
            
            this.elements.difficultyBadge.textContent = difficultyText[difficulty] || '🌸 挑战模式';
        }
    }

    showDamage(cat, amount, isCritical = false, attackResult = null) {
        if (!this.elements.damageNumbers) return;
        
        const damageEl = document.createElement('div');
        damageEl.className = `damage-popup ${isCritical ? 'critical' : 'normal'}`;
        
        let text = `-${amount}`;
        if (attackResult) {
            if (attackResult.backstab) {
                damageEl.classList.add('backstab');
                text = `背刺! -${amount}`;
            } else if (attackResult.combo > 1) {
                damageEl.classList.add('combo');
                text = `连击x${attackResult.combo} -${amount}`;
            }
        }
        damageEl.textContent = text;
        
        const catX = cat.x + cat.width / 2;
        const catY = cat.y;
        
        damageEl.style.left = `${catX}px`;
        damageEl.style.top = `${catY}px`;
        
        this.elements.damageNumbers.appendChild(damageEl);
        
        setTimeout(() => {
            damageEl.remove();
        }, 1200);
    }

    showDodge(cat) {
        if (!this.elements.damageNumbers) return;
        
        const dodgeEl = document.createElement('div');
        dodgeEl.className = 'damage-popup dodge';
        dodgeEl.textContent = '闪避!';
        
        const catX = cat.x + cat.width / 2;
        const catY = cat.y;
        
        dodgeEl.style.left = `${catX}px`;
        dodgeEl.style.top = `${catY}px`;
        
        this.elements.damageNumbers.appendChild(dodgeEl);
        
        setTimeout(() => {
            dodgeEl.remove();
        }, 1200);
    }

    showCombo(cat, combo) {
        if (!this.elements.damageNumbers) return;
        
        const comboEl = document.createElement('div');
        comboEl.className = 'damage-popup combo';
        comboEl.textContent = `COMBO x${combo}!`;
        
        const catX = cat.x + cat.width / 2;
        const catY = cat.y - 60;
        
        comboEl.style.left = `${catX}px`;
        comboEl.style.top = `${catY}px`;
        
        this.elements.damageNumbers.appendChild(comboEl);
        
        setTimeout(() => {
            comboEl.remove();
        }, 1500);
    }

    showHeal(cat, amount) {
        if (!this.elements.damageNumbers) return;
        
        const healEl = document.createElement('div');
        healEl.className = 'damage-popup heal';
        healEl.textContent = `+${amount}`;
        
        const catX = cat.x + cat.width / 2;
        const catY = cat.y;
        
        healEl.style.left = `${catX}px`;
        healEl.style.top = `${catY}px`;
        
        this.elements.damageNumbers.appendChild(healEl);
        
        setTimeout(() => {
            healEl.remove();
        }, 1200);
    }

    showSkillEffect(catId) {
        const skillEffect = document.createElement('div');
        skillEffect.className = 'skill-effect';
        
        const isKuro = catId === 'kuro';
        skillEffect.classList.add(isKuro ? 'dark-skill' : 'light-skill');
        
        document.body.appendChild(skillEffect);
        
        setTimeout(() => {
            skillEffect.classList.add('active');
        }, 10);
        
        setTimeout(() => {
            skillEffect.classList.remove('active');
            setTimeout(() => {
                skillEffect.remove();
            }, 500);
        }, 1500);
    }

    showMessage(text, duration = 1500) {
        if (!this.elements.battleMessage) return;
        
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        
        this.elements.battleMessage.textContent = text;
        this.elements.battleMessage.classList.add('show');
        
        this.messageTimeout = setTimeout(() => {
            this.elements.battleMessage.classList.remove('show');
        }, duration);
    }

    showResult(winner, roundWins = { kuro: 0, shiro: 0 }) {
        this.showScreen('result');
        
        if (winner) {
            this.elements.resultBadge.textContent = '🏆';
            this.elements.resultTitle.textContent = '比赛结束';
            this.elements.resultSubtitle.innerHTML = `
                <div style="font-size: 32px; margin-bottom: 15px;">${winner.name} 获胜！</div>
                <div style="font-size: 20px; color: #666;">
                    最终比分：黑茶 ${roundWins.kuro} - ${roundWins.shiro} 茉莉
                </div>
            `;
            
            this.elements.winnerCat.innerHTML = winner.id === 'kuro' 
                ? this.createCatPreviewSVG('black')
                : this.createCatPreviewSVG('white');
            
            this.elements.winnerInfo.innerHTML = `
                <h3>${winner.name}</h3>
                <p>${winner.breed} · ${winner.gender} · ${winner.age}岁</p>
                <p style="margin-top: 10px; font-size: 24px;">🏆 ${roundWins[winner.id]} 胜</p>
            `;
            
            this.createConfetti();
        } else {
            this.elements.resultBadge.textContent = '🤝';
            this.elements.resultTitle.textContent = '平局';
            this.elements.resultSubtitle.innerHTML = `
                <div style="font-size: 24px;">双方同时倒下！</div>
                <div style="font-size: 18px; color: #666; margin-top: 10px;">
                    最终比分：黑茶 ${roundWins.kuro} - ${roundWins.shiro} 茉莉
                </div>
            `;
            this.elements.winnerDisplay.style.display = 'none';
        }
    }

    createCatPreviewSVG(type) {
        if (type === 'black') {
            return `
                <svg viewBox="0 0 100 100" width="100%" height="100%">
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
        } else {
            return `
                <svg viewBox="0 0 100 100" width="100%" height="100%">
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
        }
    }

    createConfetti() {
        if (!this.elements.confetti) return;
        
        this.elements.confetti.innerHTML = '';
        
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9FF3', '#74B9FF', '#A29BFE', '#FFB6C1', '#98D8C8'];
        
        for (let i = 0; i < 60; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = `${Math.random() * 4}s`;
            confetti.style.animationDuration = `${2.5 + Math.random() * 2.5}s`;
            confetti.style.width = `${8 + Math.random() * 10}px`;
            confetti.style.height = `${8 + Math.random() * 10}px`;
            
            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%';
            }
            
            this.elements.confetti.appendChild(confetti);
        }
    }

    addHPAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes hpPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
            }
        `;
        document.head.appendChild(style);
    }

    showDialog(cat, text, duration = 3000) {
        if (!this.elements.damageNumbers) return;

        const dialogEl = document.createElement('div');
        dialogEl.className = 'cat-dialog';
        dialogEl.textContent = text;

        const catX = cat.x + cat.width / 2;
        const catY = cat.y - 40;

        dialogEl.style.left = `${catX}px`;
        dialogEl.style.top = `${catY}px`;
        
        if (cat.id === 'kuro') {
            dialogEl.style.marginLeft = '-100px';
        } else {
            dialogEl.style.marginLeft = '-100px';
        }

        this.elements.damageNumbers.appendChild(dialogEl);

        setTimeout(() => {
            dialogEl.remove();
        }, duration);
    }
}

window.UIManager = UIManager;
