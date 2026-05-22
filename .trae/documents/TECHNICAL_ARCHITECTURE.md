# 猫猫对战小游戏 - 技术架构文档 v2.0

## 1. 项目结构

```
cat-clash-claws/
├── index.html              # 游戏主入口文件
├── README.md              # 项目说明文档
├── css/
│   └── style.css         # 样式文件
├── js/
│   ├── game.js           # 游戏主控制器
│   ├── cat.js           # 猫猫角色类
│   ├── battle.js        # 战斗系统
│   ├── ai.js            # AI系统
│   ├── ui.js            # UI管理
│   ├── audio.js         # 音效系统
│   └── utils.js         # 工具函数
├── images/               # 角色图片
└── .trae/
    └── documents/        # 开发文档
        ├── PRD.md       # 产品需求文档
        └── TECHNICAL_ARCHITECTURE.md  # 本文档
```

## 2. 技术栈 v2.0

- **渲染技术**：HTML5 Canvas 2D + CSS3
- **动画系统**：requestAnimationFrame + CSS Animations
- **音效**：Web Audio API（程序化合成）
- **字体**：Google Fonts - Ma Shan Zheng, Noto Sans SC
- **无外部依赖**：纯原生 JavaScript ES6+ 实现

## 3. 核心类设计 v2.0

### 3.1 Game 类
**职责**：游戏主控制器，管理游戏状态和主循环

**主要属性**：
```javascript
- state: 'menu' | 'battle' | 'result'           // 游戏状态
- cats: Cat[]                                    // 猫猫角色数组
- battleSystem: BattleSystem                     // 战斗系统实例
- uiManager: UIManager                          // UI管理器
- aiSystem: CatAI                               // AI系统实例
- canvas: HTMLCanvasElement                     // 画布元素
- ctx: CanvasRenderingContext2D                // 画布上下文
- keys: Object                                  // 按键状态
- touchControls: Object                          // 触摸控制状态
- consecutiveKeys: Object                        // 连续按键计数
- rushingCats: Object                           // 冲撞状态
- rushTrails: Array                             // 冲撞轨迹
- foodItems: Array                              // 补血物品
```

**主要方法**：
```javascript
- init()                    // 初始化游戏
- start()                   // 开始游戏主循环
- update(deltaTime)        // 更新游戏逻辑
- render()                  // 渲染游戏画面
- moveCat(catId, dx, dy)  // 移动猫猫（含连按加速/冲撞）
- attackCat(catId)        // 发起攻击
- defendCat(catId)        // 防御
- skillCat(catId)         // 使用技能
- fireProjectileCat(catId) // 发射暗器
- checkCollision()        // 物理碰撞检测
- handleKeyHold()         // 持续按键处理
- updateRush(deltaTime)   // 更新冲撞状态
- updateFood(deltaTime)   // 更新补血物品
```

### 3.2 Cat 类
**职责**：猫猫角色数据模型、渲染和战斗逻辑

**主要属性**：
```javascript
- id: string                          // 唯一标识 ('kuro' | 'shiro')
- name: string                        // 名字（黑茶/茉莉）
- x, y: number                        // 位置坐标
- width, height: number               // 尺寸 (160x160)
- hp, maxHp: number                  // 当前/最大生命值
- energy, maxEnergy: number          // 当前/最大能量
- attack: number                      // 攻击力
- defense: number                      // 防御力
- speed: number                      // 速度
- state: 'idle' | 'move' | 'attack' | 'defend' | 'hurt' | 'dead' | 'skill'
- direction: 'left' | 'right'
- animationFrame: number              // 当前动画帧
- colors: Object                      // 颜色配置
- breed: string                      // 品种
- age: number                        // 年龄
- gender: string                     // 性别
- attackCooldown: number              // 攻击冷却
- skillCooldown: number              // 技能冷却
- isDefending: boolean              // 是否在防御
- isAttacking: boolean              // 是否在攻击
- isHurt: boolean                   // 是否在受伤
- isDead: boolean                   // 是否死亡
- combo: number                     // 连击数
- dodgeChance: number               // 闪避概率
- critChance: number                // 暴击概率
- backstabBonus: number            // 背刺加成
- projectiles: Array                 // 投射物数组
- particles: Array                  // 粒子数组
- hearts: Array                     // 爱心数组
- stars: Array                      // 星星数组
// 对话系统
- dialogTimer: number               // 对话计时器
- nextDialogTime: number           // 下次对话时间
- dialogCooldown: boolean           // 对话冷却
- kuroDialogs: Array               // 黑茶对话列表
- shiroDialogs: Array              // 茉莉对话列表
```

**主要方法**：
```javascript
- draw(ctx)                         // 绘制猫猫
- drawEffects(ctx)                // 绘制特效（粒子、爱心等）
- drawProjectiles(ctx)            // 绘制投射物
- move(dx, dy)                    // 移动
- attackTarget(target)             // 发起攻击
- fireProjectile(target)           // 发射暗器
- useSkill(target)                 // 使用技能
- takeDamage(amount, attacker)    // 受到伤害
- defend()                         // 防御
- heal(amount)                     // 治疗
- die()                           // 死亡
- update(deltaTime)                // 更新状态
- updateDialog(deltaTime)          // 更新对话系统
- updateProjectiles(deltaTime)     // 更新投射物
- updateParticles(deltaTime)       // 更新粒子
- calculateDamage()                // 计算伤害
```

### 3.3 BattleSystem 类
**职责**：处理战斗逻辑和胜负判定

**主要属性**：
```javascript
- cats: Cat[]                       // 参战猫猫
- turn: number                      // 当前回合
- currentRound: number              // 当前局数
- roundWins: Object               // 比分 { kuro: 0, shiro: 0 }
- maxRounds: number               // 最大局数 (3)
- isBattleActive: boolean          // 战斗是否进行中
- battleLog: Array                 // 战斗日志
// 事件回调
- onAttack: Function
- onDamage: Function
- onSkill: Function
- onDefend: Function
- onTurnChange: Function
- onRoundEnd: Function
- onBattleEnd: Function
- onHeal: Function
```

**主要方法**：
```javascript
- init(cats)                         // 初始化战斗
- processAttack(attacker, defender) // 处理攻击
- processSkill(user, target)      // 处理技能
- processDefend(cat)               // 处理防御
- checkWinCondition()              // 检查胜负
- startNextRound()                // 开始下一局
- reset()                         // 重置战斗
```

### 3.4 CatAI 类
**职责**：AI决策和执行

**主要属性**：
```javascript
- difficulty: 'easy' | 'medium' | 'hard'  // 难度
- reactionDelay: number                         // 反应延迟
- decisionCooldown: number                     // 决策冷却
- cooldownMax: number                          // 冷却最大值
- lastAction: string                          // 上次动作
```

**主要方法**：
```javascript
- update(aiCat, target, deltaTime)        // 更新AI
- makeDecision(aiCat, target)            // 做出决策
- executeAction(decision, aiCat, target)  // 执行动作
- performAttack(aiCat, target)           // 执行攻击
- performDefend(aiCat)                  // 执行防御
- performSkill(aiCat, target)           // 执行技能
- performProjectile(aiCat, target)       // 执行暗器
- moveTowardsTarget(aiCat, target)       // 接近目标
- moveAwayFromTarget(aiCat, target)      // 远离目标
```

### 3.5 AudioManager 类
**职责**：管理所有音效

**主要属性**：
```javascript
- audioContext: AudioContext        // Web Audio上下文
- isInitialized: boolean            // 是否已初始化
- isMuted: boolean                 // 是否静音
- masterVolume: number             // 主音量
```

**主要方法**：
```javascript
- init()                             // 初始化音频
- playNote(frequency, duration, type, volume)  // 播放音符
- playAttackSound()                 // 攻击音效
- playHitSound()                   // 命中音效
- playDefendSound()                 // 防御音效
- playSkillSound()                 // 技能音效
- playHealSound()                  // 治疗音效
- playProjectileSound()            // 暗器音效
- playVictorySound()              // 胜利音效
- playDefeatSound()              // 失败音效
- playFoodPickupSound()          // 拾取食物音效
- playCanSound()                 // 罐头音效
- playFreezeDriedSound()         // 冻干音效
- playKuroDialogSound()          // 黑茶对话音效
- playShiroDialogSound()          // 茉莉对话音效
- startBackgroundMusic()          // 开始背景音乐
- stopBackgroundMusic()           // 停止背景音乐
```

### 3.6 UIManager 类
**职责**：管理所有UI元素的显示和更新

**主要方法**：
```javascript
- init()                           // 初始化UI
- showScreen(screen)              // 显示界面
- showMessage(text, duration)     // 显示消息
- showDamage(cat, amount, critical, attackResult)  // 显示伤害
- showDodge(cat)                  // 显示闪避
- showCombo(cat, combo)          // 显示连击
- showSkillEffect(catId)          // 显示技能特效
- updateHP(cat)                   // 更新血量
- updateEnergy(cat)               // 更新能量
- updateTurn(round)               // 更新回合
- showResult(winner, roundWins)  // 显示结果
- showDialog(cat, text, duration) // 显示对话气泡
```

## 4. 渲染架构 v2.0

### 4.1 渲染层次
1. **背景层**：天空、云朵、樱花、地面
2. **冲撞轨迹层**：冲撞效果
3. **投射物层**：暗器飞行
4. **角色层**：猫猫角色
5. **特效层**：粒子效果、爱心、星星
6. **UI层**：血量条、能量条、按钮

### 4.2 渲染策略
- 使用 requestAnimationFrame 实现 60fps 渲染
- 对象池：复用粒子和文字对象
- 粒子生命周期管理

### 4.3 特效渲染

#### 暗器特效
- **黑茶手里剑**：四角星形，旋转动画，暗紫色发光
- **茉莉星星**：五角星形，旋转动画，金色发光
- 轨迹：渐变透明度的圆点

#### 技能特效
- **暗影爆发**：50个紫色暗影粒子，随机方向扩散
- **神圣光芒**：25个粉色爱心，向上漂浮

## 5. 输入处理 v2.0

### 5.1 键盘映射
```javascript
// 玩家1 (黑茶)
{
  'KeyW': 'up',
  'KeyS': 'down',
  'KeyA': 'left',
  'KeyD': 'right',
  'KeyJ': 'attack',
  'KeyK': 'defend',
  'KeyL': 'skill',
  'KeyU': 'projectile'
}

// 玩家2 (茉莉)
{
  'ArrowUp': 'up',
  'ArrowDown': 'down',
  'ArrowLeft': 'left',
  'ArrowRight': 'right',
  'Numpad1': 'attack',
  'Numpad2': 'defend',
  'Numpad3': 'skill',
  'Numpad0': 'projectile'
}
```

### 5.2 连续按键系统
```javascript
consecutiveKeys: {
  [catId]: {
    lastDirection: string | null,    // 上次按下的方向
    pressCount: number,             // 连续按下次数
    lastPressTime: number,         // 上次按下时间
    lastRushTime: number           // 上次冲撞时间
  }
}

// 连按规则
- 2次同方向（300ms内）：快速移动（双倍速度）
- 3次同方向（300ms内）：冲撞（60秒冷却）
```

### 5.3 触摸控制
- 方向键状态跟踪
- 持续移动支持
- 双人模式分离控制

### 5.4 输入处理流程
1. 键盘/触摸事件监听
2. 更新按键状态
3. handleKeyHold 检查持续按键
4. 执行动作（基于状态）
5. 更新角色状态

## 6. 物理系统 v2.0

### 6.1 物理碰撞
```javascript
checkCollision() {
  // 检测两只猫的距离
  // 如果距离 < minDistance
  // 计算重叠量
  // 分离两只猫
}
```

### 6.2 冲撞系统
```javascript
startRush(catId, direction) {
  // 设置冲撞状态
  // 计算目标位置（屏幕边界）
  // 移动猫猫到目标
  // 检测碰撞
}

updateRush(deltaTime) {
  // 更新冲撞进度
  // 检测命中
  // 造成伤害
  // 撞飞敌人
}
```

### 6.3 投射物物理
```javascript
// 投射物更新
- 位置 += 速度
- 旋转角度 += 旋转速度
- 轨迹记录
- 生命周期递减
```

## 7. 动画系统 v2.0

### 7.1 动画状态机
```
idle ↔ move ↔ attack
  ↓       ↓       ↓
 hurt ←───←───────
  ↓
 skill → hurt
  ↓
dead
```

### 7.2 动画类型
- **呼吸动画**：sin函数控制身体起伏
- **眨眼动画**：定时切换眼睛状态
- **尾巴摇摆**：sin函数控制尾巴角度
- **移动动画**：身体前倾+移动轨迹
- **攻击动画**：身体前冲+粒子效果
- **受伤动画**：缩小+后退+星星
- **技能动画**：角色特定特效

### 7.3 粒子系统
```javascript
粒子类型：
- attack: 攻击粒子（多彩）
- defend: 防御粒子（蓝色）
- heal: 治疗粒子（粉色）
- sparkle: 闪亮粒子（金色）
- shadow: 暗影粒子（紫色）
```

## 8. 对话系统 v2.0

### 8.1 触发条件
```javascript
// 血量低于70%
if (hp / maxHp < 0.7) {
  // 检查计时器
  // 如果时间到了，触发对话
}
```

### 8.2 对话内容
```javascript
// 黑茶（男声）
kuroDialogs = ['喵~', '喵！', '喵呜~', '喵喵！']

// 茉莉（女声）
shiroDialogs = ['你把我打疼了！', '快停下黑茶！', '你个傻猫！', ...]
```

### 8.3 对话音效
```javascript
// 黑茶：低沉男声
playKuroDialogSound() {
  const baseFreq = 280  // Hz
  // 播放3个音符，音色较粗
}

// 茉莉：活泼女声
playShiroDialogSound() {
  const baseFreq = 480  // Hz
  // 播放4个音符，音色清脆
}
```

## 9. 音效系统 v2.0

### 9.1 音效合成
使用 Web Audio API 的 OscillatorNode：
- sine: 正弦波（柔和）
- square: 方波（尖锐）
- triangle: 三角波（中性）
- sawtooth: 锯齿波（刺耳）

### 9.2 音效列表
| 音效 | 频率(Hz) | 波形 | 时长(s) | 音量 |
|------|---------|------|---------|------|
| 攻击 | 440 | square | 0.1 | 0.2 |
| 命中 | 300 | square | 0.1 | 0.3 |
| 防御 | 200 | triangle | 0.15 | 0.25 |
| 技能 | 600 | sine | 0.3 | 0.3 |
| 胜利 | 523, 659, 784 | sine | 0.5 | 0.4 |
| 失败 | 392, 330, 262 | sine | 0.8 | 0.3 |

## 10. 性能优化 v2.0

### 10.1 渲染优化
- 使用 `will-change` 提示浏览器优化
- 避免在渲染循环中创建对象
- 使用对象池管理临时对象
- Canvas 绘制精简

### 10.2 动画优化
- CSS `transform` 和 `opacity` 优先（触发 GPU 加速）
- 避免在动画中触发重排
- 使用 `requestAnimationFrame` 同步刷新率

### 10.3 内存优化
- 及时清理不再使用的对象（粒子、投射物等）
- 避免内存泄漏（事件监听器清理）
- 对象生命周期管理

### 10.4 粒子系统优化
- 最大粒子数限制
- 粒子生命周期自动清理
- 粒子数量根据性能动态调整

## 11. 浏览器兼容性 v2.0

### 11.1 支持的浏览器
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### 11.2 兼容性处理
- 使用 `addEventListener` 替代 `on` 事件
- 使用 `classList` 操作类名
- 提供 CSS 回退样式
- Web Audio API 特性检测

### 11.3 触摸设备支持
- 触摸事件监听
- 防止默认滚动行为
- 触摸按钮设计
- 响应式布局

## 12. 文件清单 v2.0

### 12.1 index.html
- HTML5 文档结构
- Canvas 画布
- UI 元素（菜单、结算界面）
- 加载 Google Fonts
- 内联 SVG 装饰

### 12.2 css/style.css
- 响应式布局
- 动画定义
- UI 样式
- 背景效果
- 对话气泡样式
- 冲撞轨迹样式

### 12.3 js/game.js
- Game 主类
- 游戏状态管理
- 主循环
- 输入处理
- 物理碰撞
- 冲撞系统
- 补血物品系统

### 12.4 js/cat.js
- Cat 角色类
- 角色绘制
- 动画状态机
- 暗器系统
- 技能系统
- 对话系统
- 粒子系统

### 12.5 js/battle.js
- BattleSystem 类
- 伤害计算
- 胜负判定
- 多回合管理
- 事件回调

### 12.6 js/ai.js
- CatAI 类
- 决策逻辑
- 反应延迟
- 难度适配
- 暗器使用

### 12.7 js/ui.js
- UIManager 类
- UI 管理
- 血量/能量条
- 按钮交互
- 对话气泡
- 伤害显示

### 12.8 js/audio.js
- AudioManager 类
- Web Audio API 封装
- 音效合成
- 背景音乐
- 对话音效
- 物品音效

### 12.9 js/utils.js
- 工具函数
- 缓动函数
- 向量计算
- 随机数生成

## 13. 调试和开发 v2.0

### 13.1 开发模式
- 使用 `console.log` 输出调试信息
- 保持 `debug` 变量控制日志开关

### 13.2 常用调试快捷键
- `F`：显示/隐藏调试信息
- `R`：重置游戏

### 13.3 性能监控
- FPS 显示（可选）
- 粒子数量监控
- 内存使用监控

---

## 附录：版本历史

### v2.0 (2026-05-16)
- 新增多回合制系统
- 新增冲撞系统
- 新增暗器系统
- 新增对话系统
- 新增补血物品系统
- 新增技能特效系统
- 新增物理碰撞系统
- 新增连续按键系统
- 增强AI系统
- 完善音效系统

### v1.0 (2026-05-11)
- 初始版本
- 基础战斗系统
- 角色绘制
- 基础动画

---

*文档版本：2.0*
*创建日期：2026-05-11*
*最后更新：2026-05-16*
