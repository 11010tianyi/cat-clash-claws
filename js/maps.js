const MAP_PRESETS = {
    sakura: {
        id: 'sakura',
        label: '🌸 樱花庭院',
        desc: '标准场地 · 樱花盛开',
        scale: 1,
        photoSrc: 'images/scenes/sakura.jpg',
        skyStops: [
            [0, '#ffeef8'],
            [0.25, '#ffd4e8'],
            [0.55, '#e8c4f8'],
            [0.82, '#b8d4f8'],
            [1, '#8ec5fc']
        ],
        ground: { top: '#9AD4A8', mid: '#7CCD7C', bottom: '#5AAF5A' },
        obstacles: [],
        scenery: [
            { kind: 'sakura_tree', x: 0.06, y: 0.52, scale: 1.1 },
            { kind: 'sakura_tree', x: 0.92, y: 0.5, scale: 1.0, flip: true },
            { kind: 'sakura_tree', x: 0.14, y: 0.58, scale: 0.75 },
            { kind: 'sakura_tree', x: 0.86, y: 0.56, scale: 0.85, flip: true },
            { kind: 'torii', x: 0.5, y: 0.42, scale: 0.9 },
            { kind: 'stone_lantern', x: 0.22, y: 0.72, scale: 0.7 },
            { kind: 'stone_lantern', x: 0.78, y: 0.71, scale: 0.75, flip: true },
            { kind: 'flower_patch', x: 0.35, y: 0.8, scale: 1 },
            { kind: 'flower_patch', x: 0.65, y: 0.81, scale: 0.9 },
            { kind: 'bush', x: 0.04, y: 0.74, scale: 0.9 },
            { kind: 'bush', x: 0.96, y: 0.73, scale: 1, flip: true }
        ],
        ambient: { petals: true, clouds: 8, mist: false }
    },
    bamboo: {
        id: 'bamboo',
        label: '🎋 竹海秘境',
        desc: '场地 ×2 · 云雾竹海',
        scale: 2,
        photoSrc: 'images/scenes/bamboo.jpg',
        skyStops: [
            [0, '#e8f8e0'],
            [0.3, '#b8e8b0'],
            [0.6, '#7ec89a'],
            [0.85, '#4a9f7a'],
            [1, '#2d6b52']
        ],
        ground: { top: '#6BA86B', mid: '#4A8A52', bottom: '#2E6B3A' },
        obstacles: [],
        scenery: [
            { kind: 'bamboo_grove', x: 0.04, y: 0.45, scale: 1.2 },
            { kind: 'bamboo_grove', x: 0.96, y: 0.44, scale: 1.15, flip: true },
            { kind: 'bamboo_grove', x: 0.1, y: 0.5, scale: 0.85 },
            { kind: 'bamboo_grove', x: 0.9, y: 0.48, scale: 0.9, flip: true },
            { kind: 'mist_band', x: 0.5, y: 0.55, scale: 1.4 },
            { kind: 'mist_band', x: 0.5, y: 0.38, scale: 1.1 },
            { kind: 'rock_moss', x: 0.18, y: 0.76, scale: 0.8 },
            { kind: 'rock_moss', x: 0.82, y: 0.75, scale: 0.85 },
            { kind: 'fern_patch', x: 0.12, y: 0.82, scale: 1 },
            { kind: 'fern_patch', x: 0.88, y: 0.81, scale: 1.05, flip: true },
            { kind: 'pond_edge', x: 0.08, y: 0.7, scale: 0.6 },
            { kind: 'pond_edge', x: 0.93, y: 0.69, scale: 0.55, flip: true }
        ],
        ambient: { petals: false, clouds: 5, mist: true }
    },
    canyon: {
        id: 'canyon',
        label: '🏜️ 峡谷遗迹',
        desc: '场地 ×3 · 落日峡谷',
        scale: 3,
        photoSrc: 'images/scenes/canyon.jpg',
        skyStops: [
            [0, '#ffe8b8'],
            [0.35, '#ffb07a'],
            [0.6, '#e87850'],
            [0.8, '#9a5a78'],
            [1, '#3a2a50']
        ],
        ground: { top: '#D4A86A', mid: '#A67B45', bottom: '#6B4A30' },
        obstacles: [],
        scenery: [
            { kind: 'mesa', x: 0.05, y: 0.48, scale: 1.1 },
            { kind: 'mesa', x: 0.95, y: 0.46, scale: 1.05, flip: true },
            { kind: 'mesa', x: 0.12, y: 0.55, scale: 0.7 },
            { kind: 'mesa', x: 0.88, y: 0.54, scale: 0.75, flip: true },
            { kind: 'ruin_pillar', x: 0.15, y: 0.62, scale: 0.85 },
            { kind: 'ruin_pillar', x: 0.85, y: 0.61, scale: 0.9, flip: true },
            { kind: 'cactus', x: 0.08, y: 0.72, scale: 0.9 },
            { kind: 'cactus', x: 0.92, y: 0.71, scale: 1, flip: true },
            { kind: 'cactus', x: 0.2, y: 0.78, scale: 0.65 },
            { kind: 'sand_dune', x: 0.5, y: 0.85, scale: 1.5 },
            { kind: 'rock_pile', x: 0.25, y: 0.8, scale: 0.7 },
            { kind: 'rock_pile', x: 0.75, y: 0.79, scale: 0.75, flip: true },
            { kind: 'sun_glow', x: 0.72, y: 0.18, scale: 1 }
        ],
        ambient: { petals: false, clouds: 4, mist: false }
    }
};

window.MAP_PRESETS = MAP_PRESETS;
