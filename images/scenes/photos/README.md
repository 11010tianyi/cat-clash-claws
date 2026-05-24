# 真实场景背景图

把照片放在本目录，无需改 JS，只需更新 manifest.json。

## 步骤

1. 复制图片到 `images/scenes/photos/`
2. 编辑 `manifest.json`，增加文件名，例如 `"my-scene.webp"`
3. 用本地 HTTP 打开游戏后刷新

可选：运行 `scripts/update-photo-manifest.sh` 自动扫描生成 manifest。

## 格式

- 支持：jpg / jpeg / png / webp
- 尺寸：无固定要求，任意分辨率，显示时自动 cover + 平铺
- 文件名：不要包含 `..` 或子路径

## 游戏内

- 首页「展开更多选项」→ 真实场景
- 战斗中点 📸 随机切换背景
