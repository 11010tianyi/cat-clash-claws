class CatAI {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.reactionDelay = this.getReactionDelay();
        this.decisionCooldown = this.reactionDelay / 16.67;
        this.cooldownMax = this.getCooldownMax();
        this.lastAction = null;
        this.targetPosition = null;
    }

    getReactionDelay() {
        switch (this.difficulty) {
            case 'easy':
                return 800;
            case 'medium':
                return 280;
            case 'hard':
                return 85;
            default:
                return 280;
        }
    }

    getCooldownMax() {
        switch (this.difficulty) {
            case 'easy':
                return 28;
            case 'medium':
                return 16;
            case 'hard':
                return 10;
            default:
                return 16;
        }
    }

    getMoveParams() {
        switch (this.difficulty) {
            case 'easy':
                return { speedMult: 0.62, hesitate: 0.14, projectileChance: 0.55 };
            case 'medium':
                return { speedMult: 0.88, hesitate: 0.04, projectileChance: 0.85 };
            case 'hard':
                return { speedMult: 1.05, hesitate: 0.02, projectileChance: 0.95 };
            default:
                return { speedMult: 0.88, hesitate: 0.04, projectileChance: 0.85 };
        }
    }

    update(aiCat, target, deltaTime) {
        if (!aiCat || aiCat.isDead || aiCat.isDying || !target || target.isDead || target.isDying) return;

        const step = Math.max(0.25, Math.min(2.5, (deltaTime || 16.67) / 16.67));
        this.chase(aiCat, target, step);

        if (this.decisionCooldown > 0) {
            this.decisionCooldown -= step;
            return;
        }

        const decision = this.makeDecision(aiCat, target);
        this.executeAction(decision, aiCat, target);
        this.lastAction = decision.action;
        this.decisionCooldown = this.cooldownMax;
    }

    makeDecision(aiCat, target) {
        const distance = Utils.distance(
            aiCat.x + aiCat.width / 2,
            aiCat.y + aiCat.height / 2,
            target.x + target.width / 2,
            target.y + target.height / 2
        );
        const melee = 220 * (aiCat.layoutScale || 1);
        const hpRatio = aiCat.hp / aiCat.maxHp;
        const targetHpRatio = target.hp / target.maxHp;
        const params = this.getMoveParams();
        const candidates = [];

        if (hpRatio < 0.28 && !aiCat.isDefending && Math.random() < 0.45) {
            candidates.push({ action: 'defend', priority: 6 });
        }

        if (distance > melee && aiCat.energy >= 10 && Math.random() < params.projectileChance) {
            const priority = this.difficulty === 'hard' ? 8 : 7;
            candidates.push({ action: 'projectile', priority });
        }

        if (distance <= melee + 40 && aiCat.attackCooldown <= 0) {
            candidates.push({
                action: 'attack',
                priority: 9 + (1 - targetHpRatio) * 2
            });
        }

        if (distance < 280 * (aiCat.layoutScale || 1) && aiCat.energy >= 35 && aiCat.skillCooldown <= 0) {
            candidates.push({ action: 'skill', priority: distance < melee ? 5 : 4 });
        }

        if (distance > melee * 0.85) {
            candidates.push({ action: 'approach', priority: 3 });
        }

        if (candidates.length === 0) {
            return { action: 'idle', priority: 0 };
        }

        candidates.sort((a, b) => b.priority - a.priority);
        return candidates[0];
    }

    executeAction(decision, aiCat, target) {
        if (!decision || aiCat.isDead || aiCat.isDying) return;

        switch (decision.action) {
            case 'attack':
                this.performAttack(aiCat, target);
                break;
            case 'defend':
                this.performDefend(aiCat);
                break;
            case 'skill':
                this.performSkill(aiCat, target);
                break;
            case 'projectile':
                this.performProjectile(aiCat, target);
                break;
            case 'approach':
            case 'retreat':
            case 'idle':
            default:
                break;
        }
    }

    performAttack(aiCat, target) {
        if (!aiCat.isDead && !aiCat.isDying && !target?.isDead && !target?.isDying && aiCat.attackCooldown <= 0) {
            game.attackCat('shiro');
        }
    }

    performDefend(aiCat) {
        if (!aiCat.isDead && !aiCat.isDying && !aiCat.isDefending) {
            game.defendCat('shiro');
            setTimeout(() => {
                if (!aiCat.isDead && !aiCat.isDying) {
                    aiCat.releaseDefend();
                }
            }, 420 + Math.random() * 280);
        }
    }

    performSkill(aiCat, target) {
        if (!aiCat.isDead && !aiCat.isDying && !target?.isDying && aiCat.energy >= 35 && aiCat.skillCooldown <= 0) {
            game.skillCat('shiro');
        }
    }

    performProjectile(aiCat, target) {
        if (!aiCat.isDead && !aiCat.isDying && !target?.isDead && !target?.isDying && aiCat.energy >= 10) {
            game.fireProjectileCat('shiro');
        }
    }

    chase(aiCat, target, step) {
        if (!aiCat || aiCat.isDead || aiCat.isDying || !target || target.isDead) return;
        if (!game || game.rushingCats?.[aiCat.id]?.active) return;

        const params = this.getMoveParams();
        if (Math.random() < params.hesitate) return;

        const dx = target.x - aiCat.x;
        const dy = target.y - aiCat.y;
        const distance = Math.hypot(dx, dy);
        const hold = 130 * (aiCat.layoutScale || 1);
        if (distance <= hold) return;

        const speed = (game.NORMAL_MOVE_SPEED || 3) * params.speedMult * step;
        game.moveCat(aiCat.id, (dx / distance) * speed, (dy / distance) * speed);
    }
}

window.CatAI = CatAI;
