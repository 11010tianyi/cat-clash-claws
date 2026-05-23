/**
 * 手绘场景装饰绘制（仅边缘装饰，不阻挡中央对战区）
 */
class SceneryRenderer {
    roundRect(ctx, x, y, w, h, r) {
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
            return;
        }
        ctx.beginPath();
        ctx.rect(x, y, w, h);
    }

    drawAll(ctx, preset, worldWidth, worldHeight, time = 0) {
        if (!preset?.scenery?.length) return;
        const groundY = worldHeight * 0.78;

        preset.scenery.forEach(item => {
            const cx = item.x * worldWidth;
            const cy = (item.y ?? 0.7) * worldHeight;
            const s = item.scale || 1;

            ctx.save();
            ctx.translate(cx, cy);
            if (item.flip) ctx.scale(-1, 1);

            switch (item.kind) {
                case 'sakura_tree': this.drawSakuraTree(ctx, s, time); break;
                case 'torii': this.drawTorii(ctx, s); break;
                case 'stone_lantern': this.drawStoneLantern(ctx, s); break;
                case 'flower_patch': this.drawFlowerPatch(ctx, s); break;
                case 'bush': this.drawBush(ctx, s, '#4a8a4a'); break;
                case 'bamboo_grove': this.drawBambooGrove(ctx, s, time); break;
                case 'mist_band': this.drawMistBand(ctx, s, worldWidth); break;
                case 'rock_moss': this.drawRockMoss(ctx, s); break;
                case 'fern_patch': this.drawFernPatch(ctx, s); break;
                case 'pond_edge': this.drawPondEdge(ctx, s); break;
                case 'mesa': this.drawMesa(ctx, s, groundY - cy); break;
                case 'ruin_pillar': this.drawRuinPillar(ctx, s); break;
                case 'cactus': this.drawCactus(ctx, s); break;
                case 'sand_dune': this.drawSandDune(ctx, s, worldWidth); break;
                case 'rock_pile': this.drawRockPile(ctx, s); break;
                case 'sun_glow': this.drawSunGlow(ctx, s, time); break;
            }

            ctx.restore();
        });
    }

    drawSakuraTree(ctx, s, time) {
        const trunkH = 90 * s;
        const sway = Math.sin(time * 0.002) * 4 * s;

        const trunkGrad = ctx.createLinearGradient(0, 0, 8 * s, 0);
        trunkGrad.addColorStop(0, '#5a3d2b');
        trunkGrad.addColorStop(1, '#3d2818');
        ctx.fillStyle = trunkGrad;
        this.roundRect(ctx, -10 * s, -trunkH, 20 * s, trunkH, 4 * s);
        ctx.fill();

        const layers = [
            { r: 55 * s, y: -trunkH - 20 * s, color: 'rgba(255, 183, 197, 0.95)' },
            { r: 42 * s, y: -trunkH - 45 * s, color: 'rgba(255, 200, 210, 0.9)' },
            { r: 30 * s, y: -trunkH - 65 * s, color: 'rgba(255, 220, 230, 0.85)' }
        ];
        layers.forEach((layer, i) => {
            ctx.fillStyle = layer.color;
            ctx.beginPath();
            ctx.ellipse(sway * (i + 1) * 0.3, layer.y, layer.r, layer.r * 0.75, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = '#ffb7c5';
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2 + time * 0.001;
            const px = Math.cos(a) * 40 * s + sway;
            const py = -trunkH - 35 * s + Math.sin(a) * 25 * s;
            ctx.beginPath();
            ctx.arc(px, py, 3 * s, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawTorii(ctx, s) {
        const w = 120 * s;
        const h = 95 * s;
        ctx.fillStyle = '#c23b3b';
        ctx.strokeStyle = '#8b2020';
        ctx.lineWidth = 3 * s;

        ctx.fillRect(-w / 2, -h, 14 * s, h);
        ctx.fillRect(w / 2 - 14 * s, -h, 14 * s, h);
        ctx.fillRect(-w / 2 - 8 * s, -h - 12 * s, w + 16 * s, 14 * s);
        ctx.fillRect(-w / 2 + 20 * s, -h * 0.55, w - 40 * s, 10 * s);

        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.moveTo(-w / 2, 0);
        ctx.lineTo(w / 2, 0);
        ctx.stroke();
    }

    drawStoneLantern(ctx, s) {
        ctx.fillStyle = '#7a7a72';
        ctx.fillRect(-12 * s, -50 * s, 24 * s, 50 * s);
        ctx.fillRect(-18 * s, -58 * s, 36 * s, 10 * s);
        ctx.fillStyle = '#9a9a90';
        ctx.beginPath();
        ctx.arc(0, -62 * s, 14 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 220, 150, 0.5)';
        ctx.fillRect(-8 * s, -55 * s, 16 * s, 12 * s);
    }

    drawFlowerPatch(ctx, s) {
        const colors = ['#ff9ec4', '#ffb6d9', '#fff0a0', '#e8a0ff'];
        for (let i = 0; i < 12; i++) {
            const fx = (i % 4 - 1.5) * 14 * s;
            const fy = Math.floor(i / 4) * 10 * s;
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.arc(fx, -fy, 5 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fffacd';
            ctx.beginPath();
            ctx.arc(fx, -fy, 2 * s, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#3d7a3d';
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.ellipse((i - 2.5) * 12 * s, 4 * s, 8 * s, 4 * s, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawBush(ctx, s, color) {
        ctx.fillStyle = color || '#4a8a4a';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.ellipse((i - 2) * 16 * s, -20 * s - (i % 2) * 8 * s, 22 * s, 18 * s, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawBambooGrove(ctx, s, time) {
        const count = 7;
        for (let i = 0; i < count; i++) {
            const bx = (i - count / 2) * 18 * s;
            const bh = (70 + (i % 3) * 25) * s;
            const sway = Math.sin(time * 0.003 + i) * 3 * s;

            const grad = ctx.createLinearGradient(bx, 0, bx + 6 * s, 0);
            grad.addColorStop(0, '#3d6b42');
            grad.addColorStop(1, '#2a4a2e');
            ctx.fillStyle = grad;
            ctx.fillRect(bx + sway, -bh, 8 * s, bh);

            ctx.strokeStyle = '#1e3320';
            ctx.lineWidth = 1.5 * s;
            for (let seg = 0; seg < 5; seg++) {
                const sy = -bh + seg * (bh / 5);
                ctx.beginPath();
                ctx.moveTo(bx + sway - 2 * s, sy);
                ctx.lineTo(bx + sway + 10 * s, sy);
                ctx.stroke();
            }

            ctx.fillStyle = '#5a9a5a';
            ctx.beginPath();
            ctx.ellipse(bx + sway + 12 * s, -bh - 5 * s, 4 * s, 12 * s, 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(bx + sway - 8 * s, -bh + 15 * s, 3 * s, 10 * s, -0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawMistBand(ctx, s, worldWidth) {
        const w = Math.min(worldWidth * 0.5, 400 * s);
        const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.5, 'rgba(255,255,255,0.35)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, 25 * s, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRockMoss(ctx, s) {
        ctx.fillStyle = '#5a6a5a';
        ctx.beginPath();
        ctx.ellipse(0, -15 * s, 35 * s, 22 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4a7a4a';
        ctx.beginPath();
        ctx.ellipse(-10 * s, -25 * s, 20 * s, 12 * s, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3d6a3d';
        ctx.beginPath();
        ctx.ellipse(12 * s, -28 * s, 18 * s, 10 * s, 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFernPatch(ctx, s) {
        ctx.strokeStyle = '#2d5a30';
        ctx.lineWidth = 2 * s;
        for (let i = 0; i < 8; i++) {
            const angle = -Math.PI / 2 + (i - 3.5) * 0.15;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(
                Math.cos(angle) * 20 * s,
                Math.sin(angle) * 20 * s - 15 * s,
                Math.cos(angle) * 35 * s,
                Math.sin(angle) * 35 * s - 40 * s
            );
            ctx.stroke();
        }
    }

    drawPondEdge(ctx, s) {
        ctx.fillStyle = 'rgba(70, 150, 200, 0.55)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 45 * s, 22 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.ellipse(0, -5 * s, 30 * s, 8 * s, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawMesa(ctx, s, relGround) {
        const h = (120 + Math.abs(relGround) * 0.3) * s;
        const w = 90 * s;
        const grad = ctx.createLinearGradient(0, -h, 0, 0);
        grad.addColorStop(0, '#c49a6a');
        grad.addColorStop(0.5, '#a67b4a');
        grad.addColorStop(1, '#7a5a38');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-w / 2, 0);
        ctx.lineTo(-w * 0.35, -h);
        ctx.lineTo(w * 0.35, -h * 0.92);
        ctx.lineTo(w / 2, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(-w / 2, -8 * s, w, 8 * s);
    }

    drawRuinPillar(ctx, s) {
        const h = 75 * s;
        ctx.fillStyle = '#8a7a68';
        ctx.fillRect(-12 * s, -h, 24 * s, h);
        ctx.fillStyle = '#6a5a48';
        ctx.fillRect(-16 * s, -h - 8 * s, 32 * s, 10 * s);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(-10 * s, -h + 15 * s + i * 22 * s, 20 * s, 4 * s);
        }
    }

    drawCactus(ctx, s) {
        ctx.fillStyle = '#3d7a45';
        this.roundRect(ctx, -8 * s, -55 * s, 16 * s, 55 * s, 6 * s);
        ctx.fill();
        this.roundRect(ctx, -28 * s, -38 * s, 14 * s, 8 * s, 4 * s);
        ctx.fill();
        this.roundRect(ctx, -28 * s, -50 * s, 8 * s, 18 * s, 4 * s);
        ctx.fill();
        this.roundRect(ctx, 14 * s, -42 * s, 14 * s, 8 * s, 4 * s);
        ctx.fill();
        this.roundRect(ctx, 20 * s, -54 * s, 8 * s, 16 * s, 4 * s);
        ctx.fill();
    }

    drawSandDune(ctx, s, worldWidth) {
        const w = Math.min(worldWidth * 0.4, 350 * s);
        ctx.fillStyle = 'rgba(210, 170, 110, 0.45)';
        ctx.beginPath();
        ctx.moveTo(-w / 2, 0);
        ctx.quadraticCurveTo(-w * 0.2, -25 * s, 0, -18 * s);
        ctx.quadraticCurveTo(w * 0.2, -30 * s, w / 2, 0);
        ctx.closePath();
        ctx.fill();
    }

    drawRockPile(ctx, s) {
        const rocks = [
            { x: 0, y: -12, rx: 22, ry: 14 },
            { x: -18, y: -8, rx: 16, ry: 11 },
            { x: 20, y: -6, rx: 14, ry: 10 }
        ];
        rocks.forEach(r => {
            ctx.fillStyle = '#8a7060';
            ctx.beginPath();
            ctx.ellipse(r.x * s, r.y * s, r.rx * s, r.ry * s, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawSunGlow(ctx, s, time) {
        const pulse = 1 + Math.sin(time * 0.002) * 0.08;
        const r = 55 * s * pulse;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grad.addColorStop(0, 'rgba(255, 240, 180, 0.9)');
        grad.addColorStop(0.4, 'rgba(255, 200, 100, 0.4)');
        grad.addColorStop(1, 'rgba(255, 150, 50, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

window.SceneryRenderer = SceneryRenderer;
