# 🎮 猫猫对战游戏 - GitHub Pages 部署指南

## 方法一：使用 GitHub 网页（最简单）

### 步骤 1️⃣：创建仓库

1. 访问 https://github.com/new
2. Repository name: `cat-clash-claws`
3. 选择 **Public**
4. ✖ **不要勾选** "Add a README file"
5. 点击 **"Create repository"**

### 步骤 2️⃣：推送代码

在项目目录运行：

```bash
cd /Users/tianyi/Documents/Trea_solo_project/cat-clash-claws

# 添加远程仓库
git remote add origin https://github.com/tianyi/cat-clash-claws.git

# 推送代码
git push -u origin main
```

输入用户名和密码即可。

### 步骤 3️⃣：启用 GitHub Pages

1. 进入仓库页面
2. 点击 **Settings**
3. 左侧菜单点击 **Pages**
4. Source: 选择 **"Deploy from a branch"**
5. Branch: 选择 **"main"** 和 **"/ (root)"**
6. 点击 **Save**

### 步骤 4️⃣：访问游戏

等待 1-2 分钟，访问：
**https://tianyi.github.io/cat-clash-claws**

---

## 方法二：使用 GitHub Desktop

### 步骤 1️⃣：下载 GitHub Desktop
- 访问 https://desktop.github.com
- 下载并安装

### 步骤 2️⃣：添加仓库
1. 点击 **"Add an Existing Repository"**
2. 选择项目文件夹
3. 点击 **"Publish repository"**
4. 勾选 **"Keep my code private"**（可选）
5. 点击 **"Publish repository"**

### 步骤 3️⃣：启用 Pages
同上步骤 3

---

## 方法三：使用命令行

### 完整命令：

```bash
# 进入项目目录
cd /Users/tianyi/Documents/Trea_solo_project/cat-clash-claws

# 初始化 Git（如果还没初始化）
git init
git add .
git commit -m "🎮 猫猫对战游戏 v1.0"

# 创建远程仓库并推送
gh repo create cat-clash-claws --public --source=. --push

# 或者手动添加
git remote add origin https://github.com/tianyi/cat-clash-claws.git
git push -u origin main
```

---

## 🎉 完成！

部署成功后，你可以：

1. **分享链接** 给朋友玩：https://tianyi.github.io/cat-clash-claws
2. **嵌入到简历**：展示你的前端技能
3. **继续开发**：每次推送到 main 分支都会自动更新

---

## 📁 项目文件结构

```
cat-clash-claws/
├── index.html          # 游戏主页面
├── css/
│   └── style.css      # 样式文件
├── js/
│   ├── audio.js       # 音频管理器
│   ├── battle.js      # 战斗系统
│   ├── cat.js         # 猫角色类
│   ├── game.js        # 游戏主逻辑
│   ├── ui.js          # UI管理器
│   ├── ai.js          # AI系统
│   └── utils.js       # 工具函数
├── images/
│   ├── black-tea.png  # 黑猫图片
│   └── white-Jasmine.png  # 白猫图片
└── README.md          # 项目说明
```

---

## 🎮 游戏特性

- ⚔️ **双人对战**：两个玩家本地对战
- 🤖 **AI 对战**：三个难度级别
- 📱 **触屏支持**：移动端也可以玩
- 🎨 **两种风格**：卡通风格和真实照片
- 🎵 **音效系统**：完整的背景音乐和战斗音效
- 🍖 **食物系统**：掉落食物可以回血
- ✨ **技能特效**：华丽的技能动画
- 💖 **双人防御特效**：同时防御触发爱心特效
