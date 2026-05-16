#!/bin/bash

# 猫猫对战游戏 - GitHub 部署脚本

echo "🎮 猫猫对战游戏部署脚本"
echo "=============================="

# 检查 git 是否安装
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装"
    exit 1
fi

# 检查是否在项目目录
if [ ! -f "index.html" ]; then
    echo "❌ 请在项目目录下运行此脚本"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 设置 GitHub Token
echo "请输入你的 GitHub Personal Access Token："
read -s TOKEN

if [ -z "$TOKEN" ]; then
    echo "❌ Token 不能为空"
    exit 1
fi

echo ""
echo "🔄 正在初始化 Git..."

# 初始化 git（如果还没有）
if [ ! -d .git ]; then
    git init
    git add .
    git commit -m "🎮 猫猫对战游戏 v1.0 - 完整版"
fi

# 配置 remote
git remote remove origin 2>/dev/null
git remote add origin https://${TOKEN}@github.com/tianyi/cat-clash-claws.git

echo "🔄 正在推送到 GitHub..."

# 推送到 GitHub
GIT_TERMINAL_PROMPT=0 git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo "=============================="
    echo "🎉 仓库地址：https://github.com/tianyi/cat-clash-claws"
    echo ""
    echo "⚙️  启用 GitHub Pages："
    echo "   1. 访问 https://github.com/tianyi/cat-clash-claws/settings/pages"
    echo "   2. Source 选择 'Deploy from a branch'"
    echo "   3. Branch 选择 'main' 和 '/ (root)'"
    echo "   4. 点击 Save"
    echo ""
    echo "🌐 游戏访问地址（几分钟后）：https://tianyi.github.io/cat-clash-claws"
else
    echo "❌ 推送失败，请检查网络和 Token 权限"
    exit 1
fi
