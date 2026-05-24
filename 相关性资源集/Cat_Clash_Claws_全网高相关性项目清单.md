# Cat Clash Claws（本仓库）— 全网高相关性项目集合

> **说明**：本文档以本仓库「浏览器端 Canvas 2D、双猫对战、本地双人/AI、暗器与技能、多地图与照片场景、抢食物/打耗子小游戏」定位为锚点，汇总主题高度相关的网页格斗游戏、猫咪主题对战、开源 Canvas 格斗与平台格斗参考项目，并补充同类高相关条目。  
> **排序规则**：按 **与本项目主题的相关性得分（10 分制，高→低）** 降序排列；同分按「即开即玩的 Web 格斗 → 猫咪/萌宠主题 → 开源 Canvas 引擎示例 → 平台格斗标杆」大致分组。

**相关性打分维度（综合）**  
1. 是否为 **浏览器内 1v1 格斗/对战**（与本仓库交互形态接近）；  
2. 是否使用 **HTML5 Canvas + JavaScript**（技术栈可对照）；  
3. 是否具备 **本地双人、AI 对手、远程多人** 等模式之一；  
4. 是否含 **角色差异化、技能/远程、回合或计时小游戏** 等机制；  
5. 主题是否接近 **猫咪/萌宠/轻量休闲对战**（加分项，非必须）。

---

## 相关性排序总表（含链接直达）

| 排序 | 相关性 | 名称 | 类型 | 链接直达 | 一句话定位 |
|:---:|:---:|:---|:---|:---|:---|
| 1 | **10/10** | **MICHI FIGHTER** | 网页游戏 | https://pixelnamer.itch.io/michi-fighter | Phaser 制作的键盘双人猫咪格斗，角色与机制与本项目最接近 |
| 2 | **9.5/10** | **Street Fighter Game（Vanilla JS）** | 开源 | https://github.com/alfredang/street-fighter-game | 纯 Canvas 街机风 1v1，精灵表动画 + 回合制流程，架构可借鉴 |
| 3 | **9.5/10** | **mk.js** | 开源 | https://github.com/mgechev/mk.js | 经典 Canvas 格斗 Demo，含单机/本地双人/网络三种模式 |
| 4 | **9/10** | **Super Smash Flash 2** | 网页/下载 | https://www.supersmashflash.com/play/ssf2/ | 平台格斗标杆；多角色、在线与手柄支持，体量远大于本仓库 |
| 5 | **9/10** | **Pixel Arena** | 开源全栈 | https://github.com/aayush579/Pixel_Arena | Canvas 实时多人格斗 + Socket.IO 房间，可参考联网同步 |
| 6 | **8.5/10** | **PIXEL-AGE** | 开源全栈 | https://github.com/Aavishkar-Kolte/PIXEL-AGE | React + Canvas 在线双人，WebRTC/Socket 与预测可对照 |
| 7 | **8.5/10** | **Pixel Punch-Out** | 开源全栈 | https://github.com/yigitocak/Pixel-Punch-Out | 像素风网页格斗 + 房间与 JWT，偏多人运营向 |
| 8 | **8/10** | **ReFlash2（SSF2 社区重建）** | 开源 | https://github.com/stariwinkle/reflash2 | SSF2 体验增强与 ModAPI，研究角色/舞台扩展时有用 |
| 9 | **8/10** | **Phaser 3 官方示例（格斗/物理）** | 文档与示例 | https://phaser.io/examples | 若未来迁移引擎，格斗、碰撞、输入的官方范例入口 |
| 10 | **7.5/10** | **Kaboom.js** | 开源引擎 | https://github.com/replit/kaboom | 轻量 JS 游戏 DSL，适合快速原型化 2D 对战 |
| 11 | **7.5/10** | **Little Fighter 2（LF2）生态** | 经典/同人 | https://lf-empire.de/ | 2D 横版格斗经典；连段与道具思路可借鉴，非 Web 原生 |
| 12 | **7.5/10** | **OpenBOR** | 开源引擎 | https://www.chronocrash.com/oba/ | 2D beat em up / 格斗模组引擎，偏复古横版 |
| 13 | **7/10** | **Fighting Game Maker（FGM）社区资源** | 工具/社区 | （检索 OpenBOR / Mugen 系文档） | 角色与招式数据驱动思路，与本仓库「技能+暗器」扩展相关 |
| 14 | **7/10** | **Slither.io / Agar.io 类 .io** | 网页 | https://slither.io/ | 非格斗，但 **计时内争分** 与抢食物模式的目标结构相近 |
| 15 | **6.5/10** | **TowerFall / Duck Game 类本地派对** | 主机/PC | （Steam 检索） | 本地多人竞技氛围参考；操作密度高于本仓库 |
| 16 | **6.5/10** | **Nekojishi / 视觉小说+轻互动** | 商业/同人 | （各平台商店） | 猫主题叙事向，非格斗，仅角色气质可参考 |
| 17 | **6/10** | **Scratch 格斗教程项目** | 教育向 | https://scratch.mit.edu/ | 教学向 1v1 原型极多，适合对照最简碰撞与血条实现 |
| 18 | **6/10** | **Roblox / Core 用户创作格斗** | UGC 平台 | https://www.roblox.com/ | 平台内大量猫/动物格斗体验，产品形态不同 |

---

## 分项链接与备忘

### 网页 / 即开即玩

| 项目 | 主要入口（建议自行核验时效） |
|:---|:---|
| MICHI FIGHTER | https://pixelnamer.itch.io/michi-fighter |
| Super Smash Flash 2 | https://www.supersmashflash.com/play/ssf2/ |
| mk.js 在线 Demo | https://github.com/mgechev/mk.js（见 README 演示链接） |
| Slither.io | https://slither.io/ |

### 开源仓库（Canvas / 格斗逻辑）

| 项目 | 备忘 |
|:---|:---|
| street-fighter-game | https://github.com/alfredang/street-fighter-game — 精灵表、AABB、回合 UI |
| mk.js | https://github.com/mgechev/mk.js — gameType: basic / multiplayer / network |
| Pixel Arena | https://github.com/aayush579/Pixel_Arena — 前后端分离 + Socket.IO |
| PIXEL-AGE | https://github.com/Aavishkar-Kolte/PIXEL-AGE — WebRTC + 主机权威碰撞 |
| Pixel Punch-Out | https://github.com/yigitocak/Pixel-Punch-Out — React + Socket.IO 房间 |
| ReFlash2 | https://github.com/stariwinkle/reflash2 — SSF2 模组与 QoL |

### 引擎与示例（若重构或扩展）

| 项目 | 备忘 |
|:---|:---|
| Phaser 3 | https://phaser.io/ — MICHI FIGHTER 同款技术路线 |
| Kaboom.js | https://kaboomjs.com/ — 更轻量的场景与碰撞抽象 |
| PixiJS | https://pixijs.com/ — 渲染层替代纯 Canvas 手写 |

---

## 重点条目：与本仓库机制的对照

### 猫咪主题 1v1（最直接竞品/灵感）

- **MICHI FIGHTER**：四只猫、本地双人、WASD + 方向键、像素动画与 AI 性格（残血更凶）与本仓库 **黑茶/茉莉、双键位、AI 难度** 高度同构，是最值得逐条对照操作与手感的一项。

### 纯 Canvas 架构（与本仓库当前栈一致）

- **street-fighter-game**：无框架依赖，强调精灵切片、碰撞盒与回合结束流程；适合阅读 **渲染循环、状态机、伤害数字** 的实现方式。  
- **mk.js**：代码量小，适合理解 **双人输入映射、网络房间** 的最小实现；本仓库若加在线对战可从此类项目抽象协议。

### 平台格斗与大体量参考（学系统设计，不照搬体量）

- **Super Smash Flash 2**：击飞、百分比、舞台与大型 roster；本仓库是 **平面血条对战 + 小游戏**，可只借鉴 **角色差异化、观感和音效层次**。  
- **ReFlash2**：社区 Mod 与 API，若未来做 **皮肤/场景 mod 或 manifest 热加载**，可参考其数据驱动思路（本仓库已有 photos/manifest.json 照片场景管线）。

### 小游戏模式（抢食物 / 打靶）

- **计时争分** 类网页游戏（如 .io）：强调 **90 秒内资源争夺** 的 UX（HUD、结束结算、平局），而非格斗连段。  
- **射击/打靶** 子模式：可参考轻量 **弹幕、命中反馈、对象池** 的 Canvas 教程与 Phaser Arcade Physics 示例，与本仓库 **暗器打耗子、反噬鼠** 机制对照。

---

## 扩展条目补充说明（为何入选）

- **Pixel Arena / PIXEL-AGE / Pixel Punch-Out**：入选因 **实时多人 + Canvas** 与本仓库技术路线相邻；若只做本地双人与 AI，可只读其 **状态同步与房间** 章节。  
- **SSF2 / ReFlash2**：入选因 **平台格斗与 mod 生态** 是品类天花板，用于拉高对 **角色数、舞台、联机稳定性** 的预期上限。  
- **Phaser / Kaboom**：入选因本仓库为 **手写 Canvas**；若维护成本上升，可评估迁移，但当前零构建链是优势。  
- **Scratch / Roblox**：入选因 **教育向与 UGC** 大量重复实现「双角色、血条、按键映射」，适合快速检索常见坑（输入冲突、Tab 失焦）。

---

## 使用建议

- **调 AI 与手感**：优先试玩 **MICHI FIGHTER**，对照其残血进攻性与本地双人键位分配。  
- **改碰撞/投射物**：阅读 **street-fighter-game** 的 AABB 与 **mk.js** 的 hit 判定，再回看本仓库 cat.js / game.js 中的投射物寿命与大地图缩放。  
- **做联网对战**：从 **mk.js network 模式** 或 **Pixel Arena** 的 Socket 房间模型起步，保持与现有 gameMode: ai | vs 配置兼容。  
- **扩展小游戏**：抢食物计分规则宜 **数据驱动**（如 getFoodRushScoreDelta）；打耗子可参考 Phaser 示例中的生成间隔与对象池。  
- **场景与 mod**：继续沿用 **manifest 照片场景** 思路，并对照 **ReFlash2 ModAPI** 的「内容包」边界设计。

---

## 与本仓库目录的关系

- 本文件位于 **cat-clash-claws/相关性资源集/**，仅为 **Markdown 文档**，不参与 index.html 脚本加载。  
- 游戏入口仍为项目根目录 **index.html**；部署方式见根目录 DEPLOY.md / deploy.sh。  
- 若将文档站与游戏同域托管，建议静态路径与游戏资源分离，避免缓存策略互相影响。

---

*整理说明：基于 Cat Clash Claws v2.x 功能定位与公开检索、领域常识汇编；链接与产品形态可能随时间变更，请以各项目官方页面为准。*
