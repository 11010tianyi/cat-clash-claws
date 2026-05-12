class BattleSystem {
    constructor() {
        this.cats = [];
        this.turn = 1;
        this.isBattleActive = false;
        this.battleLog = [];
        this.onAttack = null;
        this.onDamage = null;
        this.onSkill = null;
        this.onDefend = null;
        this.onTurnChange = null;
        this.onBattleEnd = null;
        this.onHeal = null;
        this.audioManager = null;
    }

    setAudioManager(audioManager) {
        this.audioManager = audioManager;
    }

    init(cats) {
        this.cats = cats;
        this.turn = 1;
        this.isBattleActive = true;
        this.battleLog = [];

        this.cats.forEach(cat => {
            cat.hp = cat.maxHp;
            cat.energy = 50;
            cat.isDefending = false;
            cat.isDead = false;
            cat.state = 'idle';
            cat.x = cat.id === 'kuro' ? 150 : 600;
            cat.targetX = cat.x;
        });
    }

    processAttack(attacker, defender) {
        if (!this.isBattleActive || attacker.isDead || defender.isDead) return null;

        const attackResult = attacker.attackTarget(defender);

        if (attackResult) {
            if (attackResult.dodged) {
                this.logAction(`${defender.name} 闪避了 ${attacker.name} 的攻击！`);
            } else if (attackResult.damage > 0) {
                defender.takeDamage(attackResult.damage);

                if (this.onDamage) {
                    this.onDamage(attacker, defender, attackResult.damage, attackResult.critical || attackResult.backstab, attackResult);
                }

                const attackType = attackResult.backstab ? '背刺' : (attackResult.critical ? '暴击' : '');
                const comboText = attackResult.combo > 1 ? ` [连击x${attackResult.combo}]` : '';
                this.logAction(`${attacker.name} 攻击了 ${defender.name}，造成了 ${attackResult.damage} 点伤害！${attackType}${comboText}`);
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
        if (user.energy < 50) {
            this.logAction(`${user.name} 的能量不足，无法使用技能！`);
            return null;
        }

        const result = user.useSkill(target);

        if (result) {
            if (result.type === 'damage_heal') {
                target.takeDamage(result.damage);

                if (this.onDamage) {
                    this.onDamage(user, target, result.damage, true);
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
                target.takeDamage(result.value);

                if (this.onDamage) {
                    this.onDamage(user, target, result.value, true);
                }

                this.logAction(`${user.name} 使用了 ${user.skillName}，造成了 ${result.value} 点伤害！`);
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

    processDefend(cat) {
        if (!this.isBattleActive || cat.isDead) return;

        cat.defend();

        if (this.onDefend) {
            this.onDefend(cat);
        }

        this.logAction(`${cat.name} 进入防御姿态！`);
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
        const aliveCats = this.cats.filter(cat => !cat.isDead);

        if (aliveCats.length === 1) {
            this.isBattleActive = false;
            const winner = aliveCats[0];

            this.logAction(`🏆 ${winner.name} 获得了胜利！`);

            if (this.onBattleEnd) {
                this.onBattleEnd(winner);
            }

            return winner;
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

    getWinner() {
        const aliveCats = this.cats.filter(cat => !cat.isDead);
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
        this.cats = [];
        this.turn = 1;
        this.isBattleActive = false;
        this.battleLog = [];
    }
}

window.BattleSystem = BattleSystem;
