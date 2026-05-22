const MAP_PRESETS = {
    sakura: {
        id: 'sakura',
        label: '🌸 樱花庭院',
        desc: '标准场地 · 温馨对决',
        scale: 1,
        skyStops: [
            [0, '#ffecd2'],
            [0.3, '#fcb69f'],
            [0.6, '#e0c3fc'],
            [1, '#8ec5fc']
        ],
        ground: { top: '#98D8C8', mid: '#7CCD7C', bottom: '#6BBF6B' },
        obstacles: []
    },
    bamboo: {
        id: 'bamboo',
        label: '🎋 竹海秘境',
        desc: '更大活动区 · 竹石障碍',
        scale: 2,
        skyStops: [
            [0, '#d4fc79'],
            [0.35, '#96e6a1'],
            [0.7, '#7dd3a8'],
            [1, '#4a9f7a']
        ],
        ground: { top: '#7CB87C', mid: '#5A9A5A', bottom: '#3D7A4A' },
        obstacles: [
            { x: 0.38, y: 0.38, w: 0.14, h: 0.22, kind: 'bamboo', color: '#2D5A3D' },
            { x: 0.52, y: 0.45, w: 0.1, h: 0.18, kind: 'rock', color: '#6B7B6E' },
            { x: 0.44, y: 0.58, w: 0.18, h: 0.12, kind: 'pond', color: '#5BA8C9' }
        ]
    },
    canyon: {
        id: 'canyon',
        label: '🏜️ 峡谷遗迹',
        desc: '最大空间 · 废墟障碍',
        scale: 3,
        skyStops: [
            [0, '#f6d365'],
            [0.4, '#fda085'],
            [0.75, '#c779d0'],
            [1, '#4e4376']
        ],
        ground: { top: '#C4A574', mid: '#9B7B4F', bottom: '#6B5340' },
        obstacles: [
            { x: 0.32, y: 0.4, w: 0.12, h: 0.2, kind: 'pillar', color: '#8B7355' },
            { x: 0.48, y: 0.42, w: 0.16, h: 0.16, kind: 'rock', color: '#7A6A5A' },
            { x: 0.58, y: 0.52, w: 0.1, h: 0.24, kind: 'pillar', color: '#6E5C48' },
            { x: 0.42, y: 0.55, w: 0.2, h: 0.1, kind: 'rubble', color: '#9A8B7A' },
            { x: 0.5, y: 0.35, w: 0.08, h: 0.15, kind: 'rock', color: '#5C5048' }
        ]
    }
};

window.MAP_PRESETS = MAP_PRESETS;
