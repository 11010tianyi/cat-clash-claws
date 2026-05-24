class CatAI {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.reactionDelay = this.getReactionDelay();
        this.decisionCooldown = 0;
        this.cooldownMax = this.getCooldownMax();
        this.lastAction = null;
        this.targetPosition = null;
    }

    getReactionDelay() {
        switch (this.difficulty) {
            case 'easy':
                return 800;
            case 'medium':
                return 400;
            case 'hard':
                return 85;
            default:
                return 400;
        }
    }

    getCooldownMax() {
        switch (this.difficulty) {
            case 'easy':
                return 60;
            case 'medium':
                return 40;
            case 'hard':
                return 11;
            default:
                return 40;
        }
    }

    update(aiCat, target, deltaTime) {
        if (this.decisionCooldown > 0) {
            this.decisionCooldown -= deltaTime / 16.67;
            return;
        }

        const decision = this.makeDecision(aiCat, target);
        
        if (decision.action) {
            this.executeAction(decision, aiCat, target);
            this.lastAction = decision.action;
        }
        
        this.decisionCooldown = this.cooldownMax;
    }

    makeDecision(aiCat, target) {
        const distance = Utils.distance(
            aiCat.x + aiCat.width / 2,
            aiCat.y + aiCat.height / 2,
            target.x + target.width / 2,
            target.y + target.height / 2
        );

        const hpRatio = aiCat.hp / aiCat.maxHp;
        const targetHpRatio = target.hp / target.maxHp;
        const energyRatio = aiCat.energy / aiCat.maxEnergy;

        let action = null;
        let priority = 0;

        if (hpRatio < 0.3 && !aiCat.isDefending && Math.random() > 0.3) {
            action = 'defend';
            priority = 10;
        }

        if (distance < 220 && aiCat.attackCooldown <= 0) {
            const attackPriority = 5 + (1 - targetHpRatio) * 5;
            if (attackPriority > priority) {
                action = 'attack';
                priority = attackPriority;
            }
        }

        if (distance > 280 && Math.random() > 0.4 && energyRatio >= 0.2) {
            action = 'projectile';
            priority = 7;
        }

        if (distance > 300 && !aiCat.isAttacking) {
            action = 'approach';
            priority = 4;
        }

        if (distance < 250 && energyRatio >= 0.3 && aiCat.skillCooldown <= 0) {
            if (aiCat.skillEffect === 'defend' && hpRatio < 0.5) {
                action = 'skill';
                priority = 8;
            } else if (aiCat.skillEffect !== 'defend') {
                action = 'skill';
                priority = 6;
            }
        }

        if (distance < 180 && hpRatio > targetHpRatio && aiCat.energy >= 30 && aiCat.skillCooldown <= 0) {
            action = 'skill';
            priority = 9;
        }

        if (this.difficulty === 'easy' && Math.random() > 0.5) {
            const randomActions = ['approach', 'retreat', 'idle'];
            action = randomActions[Math.floor(Math.random() * randomActions.length)];
        }

        if (this.difficulty === 'hard' && distance < 240 && aiCat.attackCooldown <= 0 && Math.random() > 0.2) {
            action = 'attack';
            priority = Math.max(priority, 10);
        }

        if (this.difficulty === 'hard' && distance > 220 && distance < 480 && energyRatio >= 0.12 && Math.random() > 0.35) {
            action = 'projectile';
            priority = Math.max(priority, 9);
        }

        if (this.difficulty === 'hard' && targetHpRatio < 0.35) {
            if (distance > 200) {
                if (Math.random() > 0.5) {
                    action = 'projectile';
                    priority = 12;
                } else {
                    action = 'approach';
                    priority = 11;
                }
            } else if (aiCat.attackCooldown <= 0) {
                action = 'attack';
                priority = 12;
            }
        }

        if (!action) {
            action = 'idle';
        }

        return { action, priority };
    }

    executeAction(decision, aiCat, target) {
        setTimeout(() => {
            if (aiCat.isDead) return;

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
                    this.moveTowardsTarget(aiCat, target);
                    break;
                case 'retreat':
                    this.moveAwayFromTarget(aiCat, target);
                    break;
                case 'idle':
                default:
                    break;
            }
        }, this.reactionDelay);
    }

    performAttack(aiCat, target) {
        if (!aiCat.isDead && aiCat.attackCooldown <= 0) {
            game.attackCat('shiro');
        }
    }

    performDefend(aiCat) {
        if (!aiCat.isDead && !aiCat.isDefending) {
            game.defendCat('shiro');
            setTimeout(() => {
                if (!aiCat.isDead) {
                    aiCat.releaseDefend();
                }
            }, 600 + Math.random() * 500);
        }
    }

    performSkill(aiCat, target) {
        if (!aiCat.isDead && aiCat.energy >= 30 && aiCat.skillCooldown <= 0) {
            game.skillCat('shiro');
        }
    }

    performProjectile(aiCat, target) {
        if (!aiCat.isDead && aiCat.energy >= 10) {
            game.fireProjectileCat('shiro');
        }
    }

    moveTowardsTarget(aiCat, target) {
        if (!aiCat.isDead && !aiCat.isAttacking) {
            const dx = target.x - aiCat.x;
            const dy = target.y - aiCat.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 150) {
                const step = game.NORMAL_MOVE_SPEED;
                game.moveCat('shiro', Math.sign(dx) * step, Math.sign(dy) * step);
            }
        }
    }

    moveAwayFromTarget(aiCat, target) {
        if (!aiCat.isDead && !aiCat.isAttacking) {
            const dx = aiCat.x - target.x;
            const dy = aiCat.y - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) {
                const step = game.NORMAL_MOVE_SPEED;
                game.moveCat('shiro', Math.sign(dx) * step, Math.sign(dy) * step);
            }
        }
    }
}

window.CatAI = CatAI;
