# 🎵 猫猫对战 - 音频系统

## 概述
使用 Web Audio API 生成所有音效，无需外部音频文件。

## 功能
- ✅ 背景音乐循环播放
- ✅ 攻击音效
- ✅ 防御音效
- ✅ 技能音效
- ✅ 受伤音效
- ✅ 暴击音效
- ✅ 闪避音效
- ✅ 回血音效
- ✅ 胜利/失败音效
- ✅ 食物拾取音效
- ✅ 暗器音效
- ✅ 对话语音（浏览器 TTS 朗读字幕；不支持时回退到合成音）
- ✅ 对话音效回退（黑茶 280Hz / 茉莉 480Hz）
- ✅ 静音功能

## 使用方法
在游戏初始化时会自动初始化音频系统：
```javascript
audioManager.init();
```

播放各种音效：
```javascript
audioManager.playAttackSound();  // 攻击
audioManager.playDefendSound();  // 防御
audioManager.playSkillSound();  // 技能
audioManager.playHitSound();  // 受伤
audioManager.playCriticalSound();  // 暴击
audioManager.playDodgeSound();  // 闪避
audioManager.playHealSound();  // 回血
audioManager.playVictorySound();  // 胜利
audioManager.playDefeatSound();  // 失败
audioManager.playFoodPickupSound();  // 拾取食物
audioManager.playProjectileSound();  // 暗器
audioManager.speakDialog('喵~', 'kuro');   // TTS 朗读具体台词
audioManager.speakDialog('好疼啊！', 'shiro');
audioManager.playKuroDialogSound();  // 无 TTS 时的回退音
audioManager.playShiroDialogSound();

// 背景音乐
audioManager.startBackgroundMusic();
audioManager.stopBackgroundMusic();

// 静音控制
audioManager.toggleMute();
audioManager.setVolume(0.5);  // 0.0 - 1.0
```

## 音效说明
- 背景音乐：轻柔的旋律循环
- 攻击：快速的重击声
- 防御：上升音阶
- 技能：能量爆发声
- 受伤：沉闷的撞击声
- 暴击：强烈的爆炸声
- 闪避：轻快的上升音
- 回血：治愈的音符
- 胜利：欢快的旋律
- 失败：下降的音符
- 食物：清脆的拾取声
- 暗器：飞行的嗖嗖声
