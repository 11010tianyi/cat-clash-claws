class Cat {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.breed = config.breed;
        this.age = config.age;
        this.gender = config.gender;

        this.x = config.x;
        this.y = config.y;
        this.width = 160;
        this.height = 160;
        this.baseSpeed = 5;

        this.maxHp = config.maxHp;
        this.hp = this.maxHp;
        this.maxEnergy = 100;
        this.energy = 50;

        this.attack = config.attack;
        this.defense = config.defense;
        this.speed = config.speed;

        this.colors = config.colors;
        this.style = config.style || 'cartoon';

        this.state = 'idle';
        this.direction = config.direction || 'right';
        this.animationFrame = 0;
        this.animationTime = 0;

        this.isDefending = false;
        this.isAttacking = false;
        this.isHurt = false;
        this.isDead = false;

        this.attackCooldown = 0;
        this.attackCooldownMax = 25;
        this.skillCooldown = 0;
        this.skillCooldownMax = 180;

        this.targetX = this.x;
        this.targetY = this.y;

        this.blinkTimer = 0;
        this.isBlinking = false;
        this.breathPhase = Math.random() * Math.PI * 2;
        this.tailPhase = Math.random() * Math.PI * 2;
        this.earWiggle = 0;

        this.particles = [];
        this.trailParticles = [];
        this.hearts = [];
        this.stars = [];
        this.foodItems = [];
        this.projectiles = [];

        this.scale = 1;
        this.skillScale = 1;
        this.rotation = 0;
        this.alpha = 1;
        this.bounceOffset = 0;

        this.combo = 0;
        this.maxCombo = 5;
        this.comboTimer = 0;
        this.comboTimerMax = 120;
        this.lastAttackerId = null;

        this.dodgeChance = 0.15;
        this.critChance = 0.2;
        this.backstabBonus = 1.5;

        this.skillName = config.skillName;
        this.skillDamage = config.skillDamage || 1.5;
        this.skillEffect = config.skillEffect || 'normal';

        this.shadowOffset = 0;

        this.image = null;
        this.imageLoaded = false;
        this.imageSrc = config.imageSrc || null;
        if (this.imageSrc) {
            this.loadImage();
        }
    }

    loadImage() {
        this.image = new Image();
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.image.onerror = () => {
            console.warn('Failed to load image:', this.imageSrc);
            this.imageLoaded = false;
        };
        this.image.src = this.imageSrc;
    }

    update(deltaTime) {
        if (this.isDead) return;

        this.animationTime += deltaTime;
        this.breathPhase += deltaTime * 0.003;
        this.tailPhase += deltaTime * 0.005;

        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.skillCooldown > 0) this.skillCooldown--;

        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }

        this.blinkTimer += deltaTime;

        if (this.blinkTimer > 2500 + Math.random() * 1500) {
            this.isBlinking = true;
            setTimeout(() => {
                this.isBlinking = false;
            }, 120);
            this.blinkTimer = 0;
        }

        if (this.state === 'idle') {
            this.bounceOffset = Math.sin(this.breathPhase * 2) * 3;
        }

        if (this.isHurt) {
            this.scale = Utils.lerp(this.scale, 1, 0.15);
            this.bounceOffset = Math.sin(this.animationTime * 0.05) * 8;
            if (Math.abs(this.scale - 1) < 0.01) {
                this.isHurt = false;
                this.scale = 1;
                this.bounceOffset = 0;
            }
        }

        if (this.isAttacking) {
            this.scale = Utils.lerp(this.scale, 1.15, 0.25);
        }

        this.x = Utils.lerp(this.x, this.targetX, 0.12);
        this.y = Utils.lerp(this.y, this.targetY, 0.12);

        this.earWiggle = Math.sin(this.animationTime * 0.01) * 0.1;

        this.updateParticles(deltaTime);
        this.updateProjectiles(deltaTime);

        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + 0.15);
        }

        if (this.state === 'skill' || this.skillCooldown > this.skillCooldownMax - 30) {
            const progress = (this.skillCooldownMax - this.skillCooldown) / 30;
            if (progress < 0.4) {
                this.skillScale = 1.0 + progress * 1.0;
            } else if (progress < 0.8) {
                this.skillScale = 1.4 - (progress - 0.4) * 1.0;
            } else {
                this.skillScale = 1.0;
            }
        } else {
            this.skillScale = 1.0;
        }
    }

    move(dx, dy) {
        if (this.isDead || this.isAttacking) return;

        const speed = this.baseSpeed;
        this.targetX += dx * speed;
        this.targetY += dy * speed;

        if (dx !== 0 || dy !== 0) {
            this.state = 'move';
            this.direction = dx > 0 ? 'right' : dx < 0 ? 'left' : this.direction;
            this.bounceOffset = Math.sin(this.animationTime * 0.02) * 5;

            if (Math.random() > 0.6) {
                for (let i = 0; i < 3; i++) {
                    this.trailParticles.push({
                        x: this.x + this.width / 2 + Utils.randomRange(-20, 20),
                        y: this.y + this.height,
                        alpha: 0.6,
                        size: Utils.randomRange(6, 12),
                        life: 1,
                        color: 'rgba(255, 182, 193, 0.5)'
                    });
                }
            }
        } else {
            this.state = 'idle';
        }
    }

    attackTarget(target) {
        if (this.isDead || this.attackCooldown > 0) return null;

        this.isAttacking = true;
        this.state = 'attack';
        this.attackCooldown = this.attackCooldownMax;

        const attackAnimationTime = 400;

        setTimeout(() => {
            for (let i = 0; i < 8; i++) {
                this.particles.push(Utils.createParticle(
                    this.x + this.width / 2,
                    this.y + this.height / 3,
                    'attack'
                ));
            }
        }, 150);

        setTimeout(() => {
            this.isAttacking = false;
            if (!this.isDead) this.state = 'idle';
        }, attackAnimationTime);

        const distance = Utils.distance(
            this.x + this.width / 2,
            this.y + this.height / 2,
            target.x + target.width / 2,
            target.y + target.height / 2
        );

        if (distance < 220) {
            const attackResult = this.calculateAttackResult(this, target);
            this.energy = Math.min(this.maxEnergy, this.energy + 3);
            return attackResult;
        } else {
            this.fireProjectile(target);
        }

        return null;
    }

    fireProjectile(target) {
        const startX = this.x + this.width / 2;
        const startY = this.y + this.height / 2;
        const targetX = target.x + target.width / 2;
        const targetY = target.y + target.height / 2;

        const angle = Math.atan2(targetY - startY, targetX - startX);
        const speed = 8;

        this.projectiles.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage: Math.floor(Math.random() * 5) + 1,
            targetId: target.id,
            lifetime: 200,
            color: this.id === 'kuro' ? '#4B0082' : '#FFD700',
            trail: []
        });
    }

    updateProjectiles(deltaTime) {
        this.projectiles = this.projectiles.filter(proj => {
            proj.x += proj.vx;
            proj.y += proj.vy;
            proj.lifetime--;

            proj.trail.push({ x: proj.x, y: proj.y, alpha: 1 });
            if (proj.trail.length > 10) {
                proj.trail.shift();
            }
            proj.trail.forEach(t => t.alpha *= 0.9);

            return proj.lifetime > 0;
        });
    }

    checkProjectileHits(target, canvas) {
        const hits = [];

        this.projectiles = this.projectiles.filter(proj => {
            const dist = Utils.distance(proj.x, proj.y, target.x + target.width / 2, target.y + target.height / 2);

            if (dist < 60 && proj.targetId === target.id) {
                hits.push({ damage: proj.damage, x: proj.x, y: proj.y });
                return false;
            }

            if (proj.x < 0 || proj.x > canvas.width || proj.y < 0 || proj.y > canvas.height) {
                return false;
            }

            return true;
        });

        return hits;
    }

    calculateAttackResult(attacker, target) {
        if (target.dodgeChance > 0 && Math.random() < target.dodgeChance) {
            return {
                damage: 0,
                dodged: true,
                backstab: false,
                critical: false,
                combo: 0
            };
        }

        let isBackstab = false;

        const attackerCenterX = attacker.x + attacker.width / 2;
        const targetCenterX = target.x + target.width / 2;

        if (target.direction === 'right' && attackerCenterX < targetCenterX - 20) {
            isBackstab = true;
        } else if (target.direction === 'left' && attackerCenterX > targetCenterX + 20) {
            isBackstab = true;
        }

        let isCritical = Math.random() < attacker.critChance;

        let combo = 0;
        if (attacker.lastAttackerId !== target.id) {
            attacker.combo = 1;
        } else {
            attacker.combo = Math.min(attacker.maxCombo, attacker.combo + 1);
        }
        attacker.comboTimer = attacker.comboTimerMax;
        attacker.lastAttackerId = target.id;
        combo = attacker.combo;

        const baseDamage = attacker.attack * (0.8 + Math.random() * 0.2);
        let damage = baseDamage - target.defense * (target.isDefending ? 2 : 1);

        if (isBackstab) {
            damage *= attacker.backstabBonus;
        }

        if (isCritical) {
            damage *= 1.35;
        }

        if (combo > 1) {
            damage *= (1 + (combo - 1) * 0.1);
        }

        damage = Math.max(1, Math.floor(damage));

        return {
            damage: damage,
            dodged: false,
            backstab: isBackstab,
            critical: isCritical,
            combo: combo
        };
    }

    useSkill(target) {
        if (this.isDead || this.skillCooldown > 0 || this.energy < 50) return null;

        this.isAttacking = true;
        this.state = 'skill';
        this.skillCooldown = this.skillCooldownMax;
        this.energy -= 50;
        this.skillScale = 1.0;

        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.particles.push(Utils.createParticle(
                    this.x + this.width / 2 + Utils.randomRange(-40, 40),
                    this.y + this.height / 2 + Utils.randomRange(-40, 40),
                    this.id === 'shiro' ? 'heal' : 'sparkle'
                ));
            }, i * 30);
        }

        if (this.id === 'shiro') {
            for (let i = 0; i < 8; i++) {
                this.hearts.push({
                    x: this.x + this.width / 2 + Utils.randomRange(-40, 40),
                    y: this.y - 20,
                    size: Utils.randomRange(18, 28),
                    alpha: 1,
                    vy: -1.2,
                    life: 1
                });
            }
        }

        setTimeout(() => {
            this.isAttacking = false;
            if (!this.isDead) this.state = 'idle';
        }, 700);

        if (this.id === 'shiro') {
            this.defense *= 1.5;
            setTimeout(() => {
                this.defense /= 1.5;
            }, 3000);

            const healAmount = Math.floor(this.maxHp * 0.15);
            this.hp = Math.min(this.maxHp, this.hp + healAmount);

            for (let i = 0; i < 10; i++) {
                this.hearts.push({
                    x: this.x + this.width / 2 + Utils.randomRange(-30, 30),
                    y: this.y + this.height / 2,
                    size: Utils.randomRange(15, 22),
                    alpha: 1,
                    vy: -1.5,
                    life: 1
                });
            }

            const distance = Utils.distance(
                this.x + this.width / 2,
                this.y + this.height / 2,
                target.x + target.width / 2,
                target.y + target.height / 2
            );

            if (distance < 250) {
                const damage = this.calculateDamage(this.attack * this.skillDamage, target, true);
                return { type: 'damage_heal', damage: damage, heal: healAmount };
            }

            return { type: 'heal_only', heal: healAmount };
        }

        const distance = Utils.distance(
            this.x + this.width / 2,
            this.y + this.height / 2,
            target.x + target.width / 2,
            target.y + target.height / 2
        );

        if (distance < 280) {
            const damage = this.calculateDamage(this.attack * this.skillDamage, target, true);
            return { type: 'damage', value: damage };
        }

        return { type: 'miss' };
    }

    calculateDamage(attackPower, target, isCritical = false) {
        const baseDamage = attackPower * (0.8 + Math.random() * 0.2);
        let damage = baseDamage - target.defense * (target.isDefending ? 0.5 : 1);

        if (isCritical) {
            damage *= 1.35;
        }

        return Math.max(1, Math.floor(damage));
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        this.isHurt = true;
        this.scale = 0.85;
        this.state = 'hurt';

        this.x += (this.direction === 'left' ? 25 : -25);
        this.targetX = this.x;

        for (let i = 0; i < 12; i++) {
            this.particles.push(Utils.createParticle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                'sparkle'
            ));
        }

        for (let i = 0; i < 3; i++) {
            this.stars.push({
                x: this.x + this.width / 2 + Utils.randomRange(-20, 20),
                y: this.y + Utils.randomRange(-20, 20),
                size: Utils.randomRange(12, 20),
                alpha: 1,
                rotation: 0,
                life: 1
            });
        }

        for (let i = 0; i < 5; i++) {
            this.hearts.push({
                x: this.x + this.width / 2 + Utils.randomRange(-30, 30),
                y: this.y + this.height / 2,
                size: Utils.randomRange(10, 15),
                alpha: 0.8,
                vy: -1,
                life: 1
            });
        }

        setTimeout(() => {
            if (!this.isDead) this.state = 'idle';
        }, 350);

        if (this.hp <= 0) {
            this.die();
        }
    }

    defend() {
        if (this.isDead) return;
        this.isDefending = true;
        this.state = 'defend';

        for (let i = 0; i < 10; i++) {
            this.particles.push(Utils.createParticle(
                this.x + this.width / 2 + Utils.randomRange(-30, 30),
                this.y + this.height / 2 + Utils.randomRange(-30, 30),
                'defend'
            ));
        }

        setTimeout(() => {
            this.isDefending = false;
            if (!this.isDead) this.state = 'idle';
        }, 600);
    }

    endTurn() {
        this.isDefending = false;
        this.energy = Math.min(this.maxEnergy, this.energy + 5);
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);

        for (let i = 0; i < 15; i++) {
            this.hearts.push({
                x: this.x + this.width / 2 + Utils.randomRange(-30, 30),
                y: this.y + this.height / 2,
                size: Utils.randomRange(15, 25),
                alpha: 1,
                vy: -1.5,
                life: 1
            });
        }
    }

    die() {
        this.isDead = true;
        this.state = 'dead';
        this.alpha = 0.6;
        this.scale = 0.7;
    }

    updateParticles(deltaTime) {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.12;
            p.life -= p.decay;
            p.alpha = p.life;
            p.size *= 0.97;
            return p.life > 0;
        });

        this.trailParticles = this.trailParticles.filter(p => {
            p.life -= 0.025;
            p.alpha = p.life * 0.5;
            p.size *= 0.92;
            return p.life > 0;
        });

        this.hearts = this.hearts.filter(h => {
            h.y += h.vy;
            h.life -= 0.015;
            h.alpha = h.life;
            return h.life > 0;
        });

        this.stars = this.stars.filter(s => {
            s.y -= 1;
            s.rotation += 0.1;
            s.life -= 0.02;
            s.alpha = s.life;
            return s.life > 0;
        });

        this.foodItems = this.foodItems.filter(f => {
            f.y += f.vy;
            f.rotation += f.rotationSpeed;
            f.life -= 0.008;
            f.alpha = f.life;
            return f.life > 0;
        });
    }

    spawnFood(canvasWidth, canvasHeight) {
        const foodTypes = [
            { name: '猫粮', emoji: '🐱', healMin: 8, healMax: 15, color: '#FFB347', size: 20, rarity: 0.35 },
            { name: '鸡肉冻干', emoji: '🍗', healMin: 12, healMax: 22, color: '#FFA07A', size: 25, rarity: 0.28 },
            { name: '罐头', emoji: '🥫', healMin: 18, healMax: 30, color: '#FFD700', size: 30, rarity: 0.22 },
            { name: '鱼干', emoji: '🐟', healMin: 10, healMax: 18, color: '#87CEEB', size: 22, rarity: 0.15 }
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

        const foodItem = {
            x: Math.random() * (canvasWidth - 100) + 50,
            y: -30,
            vy: 2 + Math.random() * 1.5,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            alpha: 1,
            life: 1,
            type: selectedFood,
            heal: healAmount,
            size: selectedFood.size
        };

        this.foodItems.push(foodItem);
        return foodItem;
    }

    checkFoodCollision() {
        const catCenterX = this.x + this.width / 2;
        const catCenterY = this.y + this.height / 2;

        for (let i = this.foodItems.length - 1; i >= 0; i--) {
            const food = this.foodItems[i];
            const dist = Math.sqrt(
                Math.pow(food.x - catCenterX, 2) +
                Math.pow(food.y - catCenterY, 2)
            );

            if (dist < 80) {
                const healAmount = food.heal;
                const oldHp = this.hp;
                this.hp = Math.min(this.maxHp, this.hp + healAmount);
                const actualHeal = this.hp - oldHp;

                for (let j = 0; j < 6; j++) {
                    this.hearts.push({
                        x: this.x + this.width / 2 + Utils.randomRange(-20, 20),
                        y: this.y + this.height / 2,
                        size: Utils.randomRange(12, 18),
                        alpha: 1,
                        vy: -1.2,
                        life: 1
                    });
                }

                this.foodItems.splice(i, 1);
                return { food: food.type.name, heal: actualHeal };
            }
        }

        return null;
    }

    draw(ctx) {
        ctx.save();

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2 + this.bounceOffset;

        ctx.translate(centerX, centerY);

        const currentScale = this.scale * this.skillScale;
        let scaleX = currentScale;
        if (this.style === 'photo') {
            if (this.id === 'kuro') {
                scaleX = this.direction === 'left' ? currentScale : -currentScale;
            } else {
                scaleX = this.direction === 'left' ? -currentScale : currentScale;
            }
        } else {
            scaleX = this.direction === 'left' ? -currentScale : currentScale;
        }

        ctx.scale(scaleX, currentScale);
        ctx.globalAlpha = this.alpha;

        this.drawShadow(ctx);

        if (this.style === 'photo' && this.image && this.imageLoaded) {
            this.drawImageBody(ctx);
            this.drawPhotoEffects(ctx);
        } else {
            this.drawBody(ctx);
        }

        this.drawEffects(ctx);

        ctx.restore();

        this.drawProjectiles(ctx);
    }

    drawImageBody(ctx) {
        const w = this.width;
        const h = this.height;
        const breathe = Math.sin(this.breathPhase) * 4;

        ctx.save();
        ctx.translate(0, breathe);

        ctx.drawImage(
            this.image,
            -w / 2,
            -h / 2,
            w,
            h
        );

        if (this.state === 'skill' || this.skillCooldown > this.skillCooldownMax - 30) {
            const skillProgress = Math.min(1, (this.skillCooldownMax - this.skillCooldown) / 30);
            let stretchScale = 1 + Math.sin(skillProgress * Math.PI) * 1;

            if (this.id === 'kuro') {
                ctx.save();
                ctx.strokeStyle = 'rgba(75, 0, 130, 0.8)';
                ctx.lineWidth = 12;
                ctx.lineCap = 'round';

                const handStartX = -35;
                const handStartY = -5;

                ctx.beginPath();
                ctx.moveTo(handStartX, handStartY);
                ctx.lineTo(handStartX - 50 * stretchScale, handStartY + 20 * stretchScale);
                ctx.stroke();

                ctx.strokeStyle = 'rgba(162, 155, 254, 0.6)';
                ctx.lineWidth = 18;
                ctx.beginPath();
                ctx.moveTo(handStartX, handStartY);
                ctx.lineTo(handStartX - 50 * stretchScale, handStartY + 20 * stretchScale);
                ctx.stroke();

                ctx.restore();
            } else if (this.id === 'shiro') {
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
                ctx.lineWidth = 12;
                ctx.lineCap = 'round';

                const handStartX = 35;
                const handStartY = -5;

                ctx.beginPath();
                ctx.moveTo(handStartX, handStartY);
                ctx.lineTo(handStartX + 50 * stretchScale, handStartY + 20 * stretchScale);
                ctx.stroke();

                ctx.strokeStyle = 'rgba(255, 255, 200, 0.6)';
                ctx.lineWidth = 18;
                ctx.beginPath();
                ctx.moveTo(handStartX, handStartY);
                ctx.lineTo(handStartX + 50 * stretchScale, handStartY + 20 * stretchScale);
                ctx.stroke();

                ctx.restore();
            }
        }

        ctx.restore();
    }

    drawShadow(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.ellipse(0, this.height / 2 - 5, 50, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawPhotoEffects(ctx) {
        if (this.state === 'defend' || this.isDefending) {
            ctx.save();
            ctx.strokeStyle = 'rgba(162, 155, 254, 0.8)';
            ctx.lineWidth = 5;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(0, 0, 70 + i * 15, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.fillStyle = 'rgba(162, 155, 254, 0.2)';
            ctx.fill();
            ctx.restore();
        }

        if (this.state === 'hurt' || this.isHurt) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, 60, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (this.state === 'skill' || (this.isAttacking && this.skillCooldown > this.skillCooldownMax - 30)) {
            ctx.save();
            const pulseSize = 80 + Math.sin(this.animationTime * 0.02) * 20;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);

            if (this.id === 'kuro') {
                gradient.addColorStop(0, 'rgba(162, 155, 254, 0.8)');
                gradient.addColorStop(0.5, 'rgba(100, 50, 200, 0.4)');
                gradient.addColorStop(1, 'rgba(50, 20, 100, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
                gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.4)');
                gradient.addColorStop(1, 'rgba(150, 200, 220, 0)');
            }

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    drawBody(ctx) {
        const w = this.width;
        const h = this.height;
        const bodyColor = this.colors.body;
        const bellyColor = this.colors.belly;
        const eyeColor = this.colors.eyes;
        const noseColor = this.colors.nose;
        const innerEarColor = this.colors.innerEar || '#FFB6C1';

        const breathe = Math.sin(this.breathPhase) * 4;
        const tailWave = Math.sin(this.tailPhase) * 15;

        ctx.save();
        ctx.translate(0, breathe);

        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, 15, 52, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        if (bellyColor) {
            ctx.fillStyle = bellyColor;
            ctx.beginPath();
            ctx.ellipse(0, 28, 35, 32, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, -28, 40, 35, 0, 0, Math.PI * 2);
        ctx.fill();

        const pawY = 50;
        const pawSize = 18;

        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(-28, pawY, pawSize, pawSize * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(28, pawY, pawSize, pawSize * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = bellyColor;
        ctx.beginPath();
        ctx.ellipse(-28, pawY + 5, pawSize * 0.5, pawSize * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(28, pawY + 5, pawSize * 0.5, pawSize * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = bodyColor;
        ctx.save();
        ctx.translate(-35, -18);
        ctx.rotate(-0.3 + this.earWiggle);
        ctx.beginPath();
        ctx.moveTo(-8, 8);
        ctx.lineTo(-5, -25);
        ctx.lineTo(8, 15);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = innerEarColor;
        ctx.beginPath();
        ctx.moveTo(-3, 6);
        ctx.lineTo(-2, -15);
        ctx.lineTo(3, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = bodyColor;
        ctx.save();
        ctx.translate(35, -18);
        ctx.rotate(0.3 - this.earWiggle);
        ctx.beginPath();
        ctx.moveTo(-8, 5);
        ctx.lineTo(-5, -25);
        ctx.lineTo(8, 8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = innerEarColor;
        ctx.beginPath();
        ctx.moveTo(-4, 2);
        ctx.lineTo(-2, -15);
        ctx.lineTo(3, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = bodyColor;
        ctx.save();
        ctx.translate(30, 8);
        ctx.rotate(0.4 + Math.sin(this.tailPhase * 1.5) * 0.2);
        ctx.beginPath();
        ctx.moveTo(5, -5);
        ctx.quadraticCurveTo(50 + tailWave * 0.5, -25, 60 + tailWave, 10);
        ctx.quadraticCurveTo(55 + tailWave * 0.8, 35, 5, 15);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        const eyeScale = this.isBlinking ? 0.08 : 1;
        const eyeY = -32;
        const eyeHeight = 18 * eyeScale;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-14, eyeY, 13 * eyeScale, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(14, eyeY, 13 * eyeScale, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fill();

        if (!this.isBlinking) {
            ctx.fillStyle = eyeColor;
            ctx.beginPath();
            ctx.ellipse(-12, eyeY + 1, 8, 11, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(16, eyeY + 1, 8, 11, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(-10, eyeY, 4, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(18, eyeY, 4, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.ellipse(-8, eyeY - 3, 3, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(20, eyeY - 3, 3, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = noseColor;
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(-5, -12);
        ctx.lineTo(5, -12);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = noseColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-7, -12);
        ctx.quadraticCurveTo(-4, -7, 0, -10);
        ctx.quadraticCurveTo(4, -7, 7, -12);
        ctx.stroke();

        const whiskerY = -14;
        ctx.strokeStyle = this.colors.whiskers || '#444';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(-10, whiskerY);
        ctx.quadraticCurveTo(-35, whiskerY - 8, -50, whiskerY - 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-10, whiskerY + 4);
        ctx.quadraticCurveTo(-32, whiskerY + 4, -45, whiskerY + 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-10, whiskerY + 8);
        ctx.quadraticCurveTo(-30, whiskerY + 15, -40, whiskerY + 20);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(10, whiskerY);
        ctx.quadraticCurveTo(35, whiskerY - 8, 50, whiskerY - 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(10, whiskerY + 4);
        ctx.quadraticCurveTo(32, whiskerY + 4, 45, whiskerY + 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(10, whiskerY + 8);
        ctx.quadraticCurveTo(30, whiskerY + 15, 40, whiskerY + 20);
        ctx.stroke();

        if (this.state === 'defend' || this.isDefending) {
            ctx.strokeStyle = 'rgba(162, 155, 254, 0.7)';
            ctx.lineWidth = 4;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(0, 0, 60 + i * 12, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.fillStyle = 'rgba(162, 155, 254, 0.15)';
            ctx.fill();
        }

        if (this.state === 'hurt' || this.isHurt) {
            ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, 55, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.state === 'attack' || this.isAttacking) {
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 70, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (this.state === 'skill' || (this.isAttacking && this.skillCooldown > this.skillCooldownMax - 30)) {
            const pulseSize = 80 + Math.sin(this.animationTime * 0.02) * 20;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);

            if (this.id === 'kuro') {
                gradient.addColorStop(0, 'rgba(162, 155, 254, 0.8)');
                gradient.addColorStop(0.5, 'rgba(100, 50, 200, 0.4)');
                gradient.addColorStop(1, 'rgba(50, 20, 100, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
                gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.4)');
                gradient.addColorStop(1, 'rgba(150, 200, 220, 0)');
            }

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawEffects(ctx) {
        this.trailParticles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x - this.x - this.width / 2, p.y - this.y - this.height / 2, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x - this.x - this.width / 2, p.y - this.y - this.height / 2, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        this.hearts.forEach(h => {
            ctx.save();
            ctx.globalAlpha = h.alpha;
            ctx.fillStyle = '#FF69B4';
            ctx.translate(h.x - this.x - this.width / 2, h.y - this.y - this.height / 2);
            ctx.scale(h.size / 20, h.size / 20);
            ctx.beginPath();
            ctx.moveTo(0, 5);
            ctx.bezierCurveTo(0, 0, -10, 0, -10, 5);
            ctx.bezierCurveTo(-10, 10, 0, 15, 0, 20);
            ctx.bezierCurveTo(0, 15, 10, 10, 10, 5);
            ctx.bezierCurveTo(10, 0, 0, 0, 0, 5);
            ctx.fill();
            ctx.restore();
        });

        this.stars.forEach(s => {
            ctx.save();
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle = '#FFD700';
            ctx.translate(s.x - this.x - this.width / 2, s.y - this.y - this.height / 2);
            ctx.rotate(s.rotation);
            ctx.scale(s.size / 15, s.size / 15);

            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * 10;
                const y = Math.sin(angle) * 10;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });
    }

    drawProjectiles(ctx) {
        this.projectiles.forEach(proj => {
            proj.trail.forEach((t, i) => {
                ctx.save();
                ctx.globalAlpha = t.alpha * 0.5;
                ctx.fillStyle = proj.color;
                ctx.beginPath();
                ctx.arc(t.x, t.y, 4 - i * 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            ctx.save();
            ctx.translate(proj.x, proj.y);
            ctx.shadowColor = proj.color;
            ctx.shadowBlur = 15;
            ctx.fillStyle = proj.color;
            ctx.font = '20px Arial';
            ctx.fillText('✨', -10, 7);
            ctx.restore();
        });
    }

    drawFood(ctx) {
        this.foodItems.forEach(food => {
            ctx.save();
            ctx.globalAlpha = food.alpha;
            ctx.font = `${food.size}px Arial`;
            ctx.translate(food.x, food.y);
            ctx.rotate(food.rotation);
            ctx.shadowColor = food.type.color;
            ctx.shadowBlur = 10;
            ctx.fillText(food.type.emoji, -food.size / 2, food.size / 2);
            ctx.restore();
        });
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class KuroCat extends Cat {
    constructor(x, y, direction, style = 'cartoon') {
        const config = {
            id: 'kuro',
            name: '黑茶',
            breed: '黑猫',
            age: 5,
            gender: '男孩',
            x,
            y,
            direction,
            style,
            maxHp: 100,
            attack: 25,
            defense: 15,
            speed: 12,
            colors: {
                body: '#2C2C2C',
                belly: '#3A3A3A',
                eyes: '#FFD700',
                nose: '#FFB6C1',
                whiskers: '#1a1a1a',
                innerEar: '#4A3A3A'
            },
            skillName: '利爪突袭',
            skillDamage: 1.5,
            skillEffect: 'normal',
            imageSrc: style === 'photo' ? 'images/black-tea.png' : null
        };
        super(config);
    }
}

class ShiroCat extends Cat {
    constructor(x, y, direction, style = 'cartoon') {
        const config = {
            id: 'shiro',
            name: '茉莉',
            breed: '白猫',
            age: 2.5,
            gender: '女孩',
            x,
            y,
            direction,
            style,
            maxHp: 100,
            attack: 22,
            defense: 18,
            speed: 10,
            colors: {
                body: '#FFFFFF',
                belly: '#F8F8F8',
                eyes: '#F5DEB3',
                nose: '#FFB6C1',
                whiskers: '#888',
                innerEar: '#FFB6C1'
            },
            skillName: '治愈光波',
            skillDamage: 1.3,
            skillEffect: 'defend',
            imageSrc: style === 'photo' ? 'images/white-Jasmine.png' : null
        };
        super(config);
    }
}

window.Cat = Cat;
window.KuroCat = KuroCat;
window.ShiroCat = ShiroCat;
