class BattleSystem {
    constructor() {
        this.cats = [];
        this.turn = 1;
        this.maxRounds = 3;
        this.currentRound = 1;
        this.roundWins = { kuro: 0, shiro: 0 };
        this.isBattleActive = false;
        this.isTransitioningRound = false;
        this.roundEndTimeout = null;
        this.battleLog = [];
        this.onAttack = null;
        this.onDamage = null;
        this.onSkill = null;
        this.onDefend = null;
        this.onTurnChange = null;
        this.onRoundEnd = null;
        this.onBattleEnd = null;
        this.onHeal = null;
        this.audioManager = null;
    }

    setAudioManager(audioManager) {
        this.audioManager = audioManager;
    }

    init(cats) {
        this.clearRoundEndTimeout();
        this.cats = cats;
        this.turn = 1;
        this.currentRound = 1;
        this.roundWins = { kuro: 0, shiro: 0 };
        this.isBattleActive = true;
        this.isTransitioningRound = false;
        this.battleLog = [];

        const game = window.game;
        const spawns = game?.getCatSpawnPositions?.() || null;
        const canvasWidth = game?.worldWidth || window.innerWidth;
        const canvasHeight = game?.worldHeight || window.innerHeight;

        this.cats.forEach(cat => {
            cat.hp = cat.maxHp;
            cat.energy = 50;
            cat.isDefending = false;
            cat.defendUntil = 0;
            cat.defendCooldown = 0;
            cat.isDead = false;
            cat.isDying = false;
            cat.deathAnimComplete = false;
            cat.isAttacking = false;
            cat.isHurt = false;
            cat.state = 'idle';
            cat.scale = 1;
            cat.alpha = 1;
            cat.rotation = 0;
            cat.particles = [];
            cat.hearts = [];
            cat.stars = [];
            cat.projectiles = [];
            if (typeof cat.resetDialogState === 'function') {
                cat.resetDialogState();
            }

            if (cat.id === 'kuro') {
                cat.x = spawns ? spawns.kuro.x : canvasWidth * 0.12;
                cat.y = spawns ? spawns.kuro.y : canvasHeight / 2 - 70;
            } else {
                cat.x = spawns ? spawns.shiro.x : canvasWidth * 0.88 - cat.width;
                cat.y = spawns ? spawns.shiro.y : canvasHeight / 2 - 70;
            }
            cat.targetX = cat.x;
            cat.targetY = cat.y;
        });
    }

    clearRoundEndTimeout() {
        if (this.roundEndTimeout) {
            clearTimeout(this.roundEndTimeout);
            this.roundEndTimeout = null;
        }
    }

    processAttack(attacker, defender) {
        if (!this.isBattleActive || attacker.isDead || defender.isDead) return null;

        const attackResult = attacker.attackTarget(defender);

        if (attackResult) {
            if (attackResult.dodged) {
                this.logAction(`${defender.name} 闪避了 ${attacker.name} 的攻击！`);
            } else if (attackResult.damage > 0) {
                const actualDamage = defender.takeDamage(attackResult.damage, attacker, { damageKind: 'melee' });

                if (this.onDamage) {
                    this.onDamage(attacker, defender, actualDamage, attackResult.critical || attackResult.backstab, attackResult);
                }

                const attackType = attackResult.backstab ? '背刺' : (attackResult.critical ? '暴击' : '');
                const comboText = attackResult.combo > 1 ? ` [连击x${attackResult.combo}]` : '';
                const defendNote = actualDamage < attackResult.damage ? '（护盾减免）' : '';
                this.logAction(`${attacker.name} 攻击了 ${defender.name}，造成了 ${actualDamage} 点伤害！${attackType}${comboText}${defendNote}`);
            } else {
                this.logAction(`${attacker.name} 的攻击落空了！`);
            }
        }

        if (this.onAttack) {
            this.onAttack(attacker, defender, attackResult);
        }

        this.checkWinCondition();

        return attackResult;
    }

    processSkill(user, target) {
        if (!this.isBattleActive || user.isDead) return null;
        if (user.energy < 35) {
            this.logAction(`${user.name} 的能量不足，无法使用技能！`);
            return null;
        }

        const result = user.useSkill(target);

        if (result) {
            if (result.type === 'damage_heal') {
                const actualDamage = target.takeDamage(result.damage, user, { damageKind: 'skill' });

                if (this.onDamage) {
                    this.onDamage(user, target, actualDamage, true);
                }

                if (this.onHeal) {
                    this.onHeal(user, result.heal);
                }

                this.logAction(`${user.name} 使用了 ${user.skillName}，对 ${target.name} 造成了 ${result.damage} 点伤害，并恢复了 ${result.heal} 点生命！`);
            } else if (result.type === 'heal_only') {
                if (this.onHeal) {
                    this.onHeal(user, result.heal);
                }

                this.logAction(`${user.name} 使用了 ${user.skillName}，恢复了 ${result.heal} 点生命！`);
            } else if (result.type === 'damage') {
                const actualDamage = target.takeDamage(result.value, user, { damageKind: 'skill' });

                if (this.onDamage) {
                    this.onDamage(user, target, actualDamage, true);
                }

                this.logAction(`${user.name} 使用了 ${user.skillName}，造成了 ${actualDamage} 点伤害！`);
            } else if (result.type === 'buff') {
                this.logAction(`${user.name} 使用了 ${user.skillName}，防御力大幅提升！`);
            }
        } else {
            this.logAction(`${user.name} 的技能落空了！`);
        }

        if (this.onSkill) {
            this.onSkill(user, target, result);
        }

        this.checkWinCondition();

        return result;
    }

    processDefend(cat, options = {}) {
        if (!this.isBattleActive || cat.isDead) return;

        cat.defend();

        if (this.onDefend) {
            this.onDefend(cat);
        }

        if (!options.silent) {
            this.logAction(`${cat.name} 举起护盾格挡暗器！`);
        }
    }

    nextTurn() {
        this.turn++;

        this.cats.forEach(cat => {
            cat.endTurn();
        });

        if (this.onTurnChange) {
            this.onTurnChange(this.turn);
        }

        this.logAction(`=== 第 ${this.turn} 回合 ===`);
    }

    checkWinCondition() {
        if (this.isTransitioningRound) {
            return null;
        }

        if (this.cats.some(cat => cat.isDying)) {
            return null;
        }

        const aliveCats = this.cats.filter(cat => cat.hp > 0 && !cat.isDead);

        if (aliveCats.length === 1) {
            const winner = aliveCats[0];
            this.roundWins[winner.id]++;
            this.isBattleActive = false;

            this.logAction(`🏆 第 ${this.currentRound} 局结束：${winner.name} 获胜！`);

            if (this.onRoundEnd) {
                this.onRoundEnd(winner, this.currentRound, { ...this.roundWins });
            }

            if (this.roundWins[winner.id] >= 2) {
                this.logAction(`🏆🏆🏆 ${winner.name} 以 ${this.roundWins[winner.id]} 胜 ${this.roundWins[winner.id === 'kuro' ? 'shiro' : 'kuro']} 负 赢得了比赛！`);

                if (this.onBattleEnd) {
                    this.onBattleEnd(winner);
                }
                return winner;
            }

            this.isTransitioningRound = true;
            this.clearRoundEndTimeout();
            this.roundEndTimeout = setTimeout(() => {
                this.roundEndTimeout = null;
                this.isTransitioningRound = false;
                this.startNextRound();
            }, 2800);
            return null;
        }

        if (aliveCats.length === 0) {
            this.isBattleActive = false;
            
            if (this.onBattleEnd) {
                this.onBattleEnd(null);
            }

            this.logAction('平局！');
            return null;
        }

        return null;
    }

    startNextRound() {
        this.currentRound++;

        const game = window.game;
        const spawns = game?.getCatSpawnPositions?.() || null;
        const canvasWidth = game?.worldWidth || window.innerWidth;
        const canvasHeight = game?.worldHeight || window.innerHeight;

        this.cats.forEach(cat => {
            cat.hp = cat.maxHp;
            cat.energy = 50;
            cat.isDefending = false;
            cat.defendUntil = 0;
            cat.defendCooldown = 0;
            cat.isDead = false;
            cat.isDying = false;
            cat.deathAnimComplete = false;
            cat.isAttacking = false;
            cat.state = 'idle';
            cat.isHurt = false;
            cat.scale = 1;
            cat.alpha = 1;
            cat.rotation = 0;
            cat.particles = [];
            cat.hearts = [];
            cat.stars = [];
            cat.projectiles = [];
            if (typeof cat.resetDialogState === 'function') {
                cat.resetDialogState();
            }

            if (cat.id === 'kuro') {
                cat.x = spawns ? spawns.kuro.x : canvasWidth * 0.12;
                cat.y = spawns ? spawns.kuro.y : canvasHeight / 2 - 70;
            } else {
                cat.x = spawns ? spawns.shiro.x : canvasWidth * 0.88 - cat.width;
                cat.y = spawns ? spawns.shiro.y : canvasHeight / 2 - 70;
            }
            cat.targetX = cat.x;
            cat.targetY = cat.y;
        });

        this.isBattleActive = true;

        this.logAction(`=== 第 ${this.currentRound} 局开始（三局两胜）===`);

        if (this.onTurnChange) {
            this.onTurnChange(this.currentRound);
        }
    }

    getWinner() {
        const aliveCats = this.cats.filter(cat => !cat.isDead && !cat.isDying);
        return aliveCats.length === 1 ? aliveCats[0] : null;
    }

    getCatById(id) {
        return this.cats.find(cat => cat.id === id);
    }

    logAction(message) {
        this.battleLog.push({
            turn: this.turn,
            message,
            timestamp: Date.now()
        });
    }

    reset() {
        this.clearRoundEndTimeout();
        this.cats = [];
        this.turn = 1;
        this.currentRound = 1;
        this.roundWins = { kuro: 0, shiro: 0 };
        this.isBattleActive = false;
        this.isTransitioningRound = false;
        this.battleLog = [];
    }
}

window.BattleSystem = BattleSystem;
