/**
 * 小游戏：抢食物、打靶（耗子）
 */
const MINIGAME_DURATION_MS = 90000;
const RAT_ALPHA_BASE = 0.92;
const RAT_ALPHA_STEALTH_MIN = 0.88;

const RAT_VARIANTS = [
    { id: 'normal', label: '灰鼠', emoji: '🐀', hp: 1, speedMin: 1.8, speedMax: 3.2, size: 38, weight: 0.4, points: 1 },
    { id: 'swift', label: '飞鼠', emoji: '🐁', hp: 1, speedMin: 3.5, speedMax: 5.5, size: 36, weight: 0.25, points: 2 },
    { id: 'stealth', label: '隐身鼠', emoji: '👻', hp: 1, speedMin: 2, speedMax: 3.8, size: 38, weight: 0.18, points: 2, stealth: true },
    { id: 'counter', label: '反噬鼠', emoji: '💢', hp: 2, speedMin: 1.5, speedMax: 2.8, size: 44, weight: 0.17, points: 3, counterDamage: 10 }
];

const MinigameRatSystem = {
    getDisplaySize(game, baseSize) {
        const mapScale = game.mapScale || 1;
        const uiScale = game.layoutMetrics?.uiScale || 1;
        return Math.round(baseSize * mapScale * uiScale);
    },

    pickVariant() {
        const total = RAT_VARIANTS.reduce((s, v) => s + v.weight, 0);
        let r = Math.random() * total;
        for (const v of RAT_VARIANTS) {
            r -= v.weight;
            if (r <= 0) return v;
        }
        return RAT_VARIANTS[0];
    },

    spawnRat(game) {
        const variant = this.pickVariant();
        const margin = 80;
        const w = game.worldWidth;
        const h = game.worldHeight;
        const angle = Math.random() * Math.PI * 2;
        const speed = (variant.speedMin + Math.random() * (variant.speedMax - variant.speedMin)) * (game.mapScale || 1);
        const size = this.getDisplaySize(game, variant.size);
        game.rats.push({
            id: `rat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            variantId: variant.id,
            label: variant.label,
            emoji: variant.emoji,
            hp: variant.hp,
            maxHp: variant.hp,
            x: margin + Math.random() * (w - margin * 2),
            y: margin + Math.random() * (h - margin * 2),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size,
            points: variant.points,
            stealth: !!variant.stealth,
            counterDamage: variant.counterDamage || 0,
            wobble: Math.random() * Math.PI * 2,
            hitFlash: 0
        });
    },

    spawnHitEffects(game, x, y, kind = 'hit') {
        if (!game.ratHitEffects) game.ratHitEffects = [];
        const count = kind === 'kill' ? 14 : 7;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
            const speed = kind === 'kill' ? 2.5 + Math.random() * 3 : 1.5 + Math.random() * 2.5;
            game.ratHitEffects.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                size: kind === 'kill' ? 6 + Math.random() * 8 : 4 + Math.random() * 5,
                color: kind === 'kill' ? 'rgba(255, 215, 80, 0.95)' : 'rgba(255, 120, 120, 0.9)'
            });
        }
        game.ratHitEffects.push({
            x,
            y,
            vx: 0,
            vy: 0,
            life: 1,
            ring: true,
            ringMax: kind === 'kill' ? 52 : 36,
            color: kind === 'kill' ? 'rgba(255, 230, 120, 0.85)' : 'rgba(255, 180, 100, 0.75)'
        });
    },

    updateHitEffects(game, deltaTime) {
        if (!game.ratHitEffects?.length) return;
        const step = Math.max(0.25, Math.min(2.5, deltaTime / 16.67));
        game.ratHitEffects = game.ratHitEffects.filter((fx) => {
            fx.life -= 0.04 * step;
            if (!fx.ring) {
                fx.x += fx.vx * step;
                fx.y += fx.vy * step;
                fx.vy += 0.06 * step;
            }
            return fx.life > 0;
        });
    },

    drawHitEffects(ctx, game) {
        if (!game.ratHitEffects?.length) return;
        game.ratHitEffects.forEach((fx) => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, fx.life);
            if (fx.ring) {
                const r = fx.ringMax * (1.1 - fx.life * 0.5);
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, r, 0, Math.PI * 2);
                ctx.strokeStyle = fx.color;
                ctx.lineWidth = 3;
                ctx.stroke();
            } else {
                ctx.fillStyle = fx.color;
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, fx.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
    },

    updateRats(game, deltaTime) {
        const step = Math.max(0.25, Math.min(2.5, deltaTime / 16.67));
        const margin = 40;
        const w = game.worldWidth;
        const h = game.worldHeight;
        game.rats.forEach((rat) => {
            rat.x += rat.vx * step;
            rat.y += rat.vy * step;
            rat.wobble += 0.08 * step;
            if (rat.hitFlash > 0) rat.hitFlash -= 0.07 * step;
            if (rat.x < margin) { rat.x = margin; rat.vx = Math.abs(rat.vx); }
            if (rat.x > w - margin) { rat.x = w - margin; rat.vx = -Math.abs(rat.vx); }
            if (rat.y < margin) { rat.y = margin; rat.vy = Math.abs(rat.vy); }
            if (rat.y > h - margin) { rat.y = h - margin; rat.vy = -Math.abs(rat.vy); }
        });
        game.rats = game.rats.filter((r) => r.hp > 0);
        this.updateHitEffects(game, deltaTime);
    },

    drawRats(ctx, game) {
        const t = game.lastTime * 0.001;
        game.rats.forEach((rat) => {
            let alpha = RAT_ALPHA_BASE;
            if (rat.stealth) {
                alpha = RAT_ALPHA_STEALTH_MIN + (RAT_ALPHA_BASE - RAT_ALPHA_STEALTH_MIN) * (0.5 + 0.5 * Math.sin(t * 3 + rat.wobble));
            }
            if (rat.hitFlash > 0) alpha = Math.min(1, alpha + rat.hitFlash * 0.35);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = `${rat.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 2;
            ctx.lineWidth = Math.max(2, rat.size * 0.07);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
            ctx.strokeText(rat.emoji, rat.x, rat.y);
            ctx.fillText(rat.emoji, rat.x, rat.y);

            if (rat.hitFlash > 0.15) {
                ctx.beginPath();
                ctx.arc(rat.x, rat.y, rat.size * 0.72, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 200, 80, ${rat.hitFlash * 0.9})`;
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            if (rat.maxHp > 1) {
                ctx.shadowBlur = 0;
                ctx.font = `${Math.max(12, rat.size * 0.32)}px sans-serif`;
                ctx.fillStyle = '#fff';
                ctx.strokeStyle = 'rgba(0,0,0,0.55)';
                ctx.lineWidth = 2;
                ctx.strokeText(`${rat.hp}`, rat.x, rat.y - rat.size * 0.55);
                ctx.fillText(`${rat.hp}`, rat.x, rat.y - rat.size * 0.55);
            }
            if (rat.counterDamage) {
                ctx.font = `${Math.max(11, rat.size * 0.28)}px sans-serif`;
                ctx.fillStyle = '#ff6b6b';
                ctx.fillText('反噬', rat.x, rat.y + rat.size * 0.52);
            }
            ctx.restore();
        });
        this.drawHitEffects(ctx, game);
    },

    findNearestRat(game, fromX, fromY, maxDist = Infinity) {
        let best = null;
        let bestD = maxDist;
        for (const rat of game.rats) {
            const d = Math.hypot(rat.x - fromX, rat.y - fromY);
            if (d < bestD) { bestD = d; best = rat; }
        }
        return best;
    },

    ratAsTarget(rat) {
        const s = rat.size;
        return { id: rat.id, x: rat.x - s / 2, y: rat.y - s / 2, width: s, height: s, isDefending: false, isDead: false };
    }
};

window.MINIGAME_DURATION_MS = MINIGAME_DURATION_MS;
window.RAT_VARIANTS = RAT_VARIANTS;
window.MinigameRatSystem = MinigameRatSystem;
