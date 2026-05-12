# 猫猫对战小游戏 - 技术架构文档

## 1. 项目结构

```
cat-clash-claws/
├── index.html              # 游戏主入口文件
├── SPEC.md                 # 详细规格说明
├── css/
│   └── style.css          # 样式文件
└── js/
    ├── main.js            # 游戏主入口逻辑
    ├── game.js            # 游戏核心类
    ├── cat.js             # 猫猫角色类
    ├── battle.js          # 战斗系统
    ├── ui.js              # UI管理
    └── utils.js           # 工具函数
```

## 2. 技术栈

- **渲染技术**：HTML5 Canvas 2D + CSS3
- **动画系统**：requestAnimationFrame + CSS Animations
- **音效**：Web Audio API (可选)
- **字体**：Google Fonts - Ma Shan Zheng, Noto Sans SC
- **无外部依赖**：纯原生 JavaScript 实现

## 3. 核心类设计

### 3.1 Game 类
**职责**：游戏主控制器，管理游戏状态和主循环

**主要属性**：
```javascript
- state: 'menu' | 'battle' | 'result'  // 游戏状态
- cats: Cat[]                           // 猫猫角色数组
- battleSystem: BattleSystem            // 战斗系统实例
- uiManager: UIManager                  // UI管理器
- canvas: HTMLCanvasElement             // 画布元素
- ctx: CanvasRenderingContext2D         // 画布上下文
```

**主要方法**：
```javascript
- init()                    // 初始化游戏
- start()                   // 开始游戏主循环
- update(deltaTime)         // 更新游戏逻辑
- render()                  // 渲染游戏画面
- handleInput(event)        // 处理输入事件
- switchState(newState)     // 切换游戏状态
```

### 3.2 Cat 类
**职责**：猫猫角色数据模型和渲染

**主要属性**：
```javascript
- id: string                // 唯一标识
- name: string              // 名字（阿黑/小白）
- x, y: number              // 位置坐标
- hp, maxHp: number         // 当前/最大生命值
- energy, maxEnergy: number // 当前/最大能量
- attack: number            // 攻击力
- defense: number           // 防御力
- speed: number             // 速度
- state: 'idle' | 'move' | 'attack' | 'defend' | 'hurt' | 'dead'
- direction: 'left' | 'right'
- animationFrame: number     // 当前动画帧
- color: { body, eyes, ... } // 颜色配置
- breed: string             // 品种
- age: number               // 年龄
- gender: string            // 性别
```

**主要方法**：
```javascript
- draw(ctx)                 // 绘制猫猫
- move(dx, dy)              // 移动
- attack(target)            // 发起攻击
- defend()                  // 防御
- takeDamage(amount)         // 受到伤害
- heal(amount)               // 治疗
- update(deltaTime)         // 更新状态
- getAnimation()            // 获取当前动画
```

### 3.3 BattleSystem 类
**职责**：处理战斗逻辑和胜负判定

**主要属性**：
```javascript
- cats: Cat[]               // 参战猫猫
- turn: number              // 当前回合
- currentAttacker: Cat      // 当前攻击方
- attackCooldown: number    // 攻击冷却时间
```

**主要方法**：
```javascript
- processAttack(attacker, defender)  // 处理攻击
- processDefend(cat)                 // 处理防御
- calculateDamage(attacker, defender, isDefending) // 计算伤害
- checkWinCondition()               // 检查胜负
- getWinner()                        // 获取胜利者
- reset()                            // 重置战斗
```

### 3.4 UIManager 类
**职责**：管理所有UI元素的显示和更新

**主要属性**：
```javascript
- hpBars: Map<Cat, HPBar>  // 血量条映射
- energyBars: Map<Cat, EnergyBar> // 能量条映射
- damageTexts: DamageText[]       // 伤害数字数组
- buttons: Button[]               // 按钮数组
```

**主要方法**：
```javascript
- initUI()                        // 初始化UI
- updateHP(cat)                   // 更新血量显示
- updateEnergy(cat)               // 更新能量显示
- showDamage(cat, amount)         // 显示伤害数字
- showMessage(text)               // 显示消息
- createButton(config)            // 创建按钮
```

## 4. 渲染架构

### 4.1 渲染层次
1. **背景层**：天空、云朵、樱花、地面
2. **特效层**：粒子效果、光效
3. **角色层**：猫猫角色
4. **UI层**：血量条、能量条、按钮

### 4.2 渲染策略
- 使用 requestAnimationFrame 实现 60fps 渲染
- 脏矩形优化：只重绘变化的区域
- 对象池：复用粒子和文字对象

## 5. 输入处理

### 5.1 键盘映射
```javascript
// 玩家1 (阿黑)
{
  'KeyW': 'up',
  'KeyS': 'down',
  'KeyA': 'left',
  'KeyD': 'right',
  'KeyJ': 'attack',
  'KeyK': 'defend',
  'KeyL': 'skill'
}

// 玩家2 (小白)
{
  'Numpad8': 'up',
  'Numpad5': 'down',
  'Numpad4': 'left',
  'Numpad6': 'right',
  'Numpad1': 'attack',
  'Numpad2': 'defend',
  'Numpad3': 'skill'
}
```

### 5.2 输入处理流程
1. 键盘事件监听
2. 映射到对应动作
3. 检查冷却时间
4. 执行动作
5. 更新状态

## 6. 动画系统

### 6.1 动画类型
- **骨骼动画**：使用 CSS transforms
- **帧动画**：雪碧图或动态绘制
- **粒子动画**：canvas 粒子系统

### 6.2 动画状态机
```
idle ↔ move ↔ attack
  ↓       ↓       ↓
 hurt ←───←───────
  ↓
 dead
```

### 6.3 缓动函数
```javascript
// 自定义缓动
easeOutElastic(t)   // 弹性效果
easeOutBounce(t)     // 弹跳效果
easeInOutQuad(t)     // 平滑过渡
```

## 7. 资源管理

### 7.1 角色绘制方案
使用 Canvas 2D 绘制可爱的猫猫：
- 圆润的身体轮廓
- 大眼睛和小鼻子
- 简化的毛发质感
- 可爱的表情

### 7.2 背景绘制
- 渐变天空
- SVG 云朵
- CSS 樱花飘落效果

### 7.3 资源优化
- 所有资源内联（无外部请求）
- CSS 动画优先（GPU 加速）
- Canvas 绘制精简

## 8. 性能优化

### 8.1 渲染优化
- 使用 `will-change` 提示浏览器优化
- 避免在渲染循环中创建对象
- 使用对象池管理临时对象

### 8.2 动画优化
- CSS `transform` 和 `opacity` 优先（触发 GPU 加速）
- 避免在动画中触发重排
- 使用 `requestAnimationFrame` 同步刷新率

### 8.3 内存优化
- 及时清理不再使用的对象
- 避免内存泄漏（事件监听器清理）

## 9. 浏览器兼容性

### 9.1 支持的浏览器
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### 9.2 兼容性处理
- 使用 `addEventListener` 替代 `on` 事件
- 使用 `classList` 操作类名
- 提供 CSS 回退样式

## 10. 文件清单

### 10.1 index.html
- HTML5 文档结构
- Canvas 画布
- UI 元素（菜单、结算界面）
- 加载 Google Fonts
- 内联 SVG 装饰

### 10.2 css/style.css
- 响应式布局
- 动画定义
- UI 样式
- 背景效果

### 10.3 js/game.js
- Game 主类
- 游戏状态管理
- 主循环

### 10.4 js/cat.js
- Cat 角色类
- 角色绘制
- 动画状态机

### 10.5 js/battle.js
- 战斗系统
- 伤害计算
- 胜负判定

### 10.6 js/ui.js
- UI 管理
- 血量/能量条
- 按钮交互

### 10.7 js/utils.js
- 工具函数
- 缓动函数
- 向量计算

## 11. 调试和开发

### 11.1 开发模式
- 使用 `console.log` 输出调试信息
- 保持 `debug` 变量控制日志开关

### 11.2 常用调试快捷键
- `F`：显示/隐藏调试信息
- `R`：重置游戏

---

*文档版本：1.0*
*创建日期：2026-05-11*
