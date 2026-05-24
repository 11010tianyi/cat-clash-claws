/**
 * 真实场景图库：从 images/scenes/photos/manifest.json 读取列表，支持平铺无限背景。
 * 新增图片：把 jpg/png/webp 放进 images/scenes/photos/，在 manifest.json 里加一行文件名即可。
 */
const PhotoSceneGallery = {
    basePath: 'images/scenes/photos/',
    fallbackFiles: [
        'sakura.jpg',
        'bamboo.jpg',
        'canyon.jpg',
        'garden.jpg',
        'lake.jpg'
    ],
    entries: [],
    images: {},
    loaded: {},
    currentIndex: 0,
    ready: false,

    normalizeFile(name) {
        if (!name || typeof name !== 'string') return null;
        const trimmed = name.trim().replace(/^\.?\//, '');
        if (!trimmed || trimmed.includes('..')) return null;
        if (!/\.(jpe?g|png|webp)$/i.test(trimmed)) return null;
        return trimmed;
    },

    buildUrl(file) {
        return `${this.basePath}${file}`;
    },

    async loadManifest() {
        const merged = new Set();
        try {
            const res = await fetch(`${this.basePath}manifest.json`, { cache: 'no-cache' });
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : (data.files || data.photos || []);
                list.forEach((item) => {
                    const file = this.normalizeFile(item);
                    if (file) merged.add(file);
                });
            }
        } catch (e) {
            console.warn('Photo manifest load failed, using fallback list', e);
        }

        this.fallbackFiles.forEach((file) => {
            const normalized = this.normalizeFile(file);
            if (normalized) merged.add(normalized);
        });

        this.entries = Array.from(merged).map((file) => ({
            file,
            url: this.buildUrl(file)
        }));

        if (this.entries.length === 0) {
            this.entries = [{ file: 'sakura.jpg', url: this.buildUrl('sakura.jpg') }];
        }

        await Promise.all(this.entries.map((entry) => this.ensureImage(entry.file)));
        this.ready = true;
        return this.entries;
    },

    ensureImage(file) {
        if (this.images[file]) return Promise.resolve(this.images[file]);

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.loaded[file] = true;
                this.images[file] = img;
                resolve(img);
            };
            img.onerror = () => {
                this.loaded[file] = false;
                resolve(null);
            };
            img.src = this.buildUrl(file);
        });
    },

    getCurrentEntry() {
        if (!this.entries.length) return null;
        return this.entries[this.currentIndex % this.entries.length];
    },

    getCurrentImage() {
        const entry = this.getCurrentEntry();
        if (!entry) return null;
        return this.images[entry.file] || null;
    },

    pickRandomNext() {
        if (this.entries.length <= 1) {
            this.currentIndex = 0;
            return this.getCurrentEntry();
        }
        let next = this.currentIndex;
        while (next === this.currentIndex) {
            next = Math.floor(Math.random() * this.entries.length);
        }
        this.currentIndex = next;
        return this.getCurrentEntry();
    },

    setByMapId(mapId) {
        const preset = window.MAP_PRESETS?.[mapId];
        if (!preset?.photoSrc) return this.getCurrentEntry();
        const file = preset.photoSrc.split('/').pop();
        const idx = this.entries.findIndex((e) => e.file === file);
        if (idx >= 0) this.currentIndex = idx;
        return this.getCurrentEntry();
    }
};

window.PhotoSceneGallery = PhotoSceneGallery;
