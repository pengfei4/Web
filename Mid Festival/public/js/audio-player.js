/**
 * 中秋节网站 - 背景氛围音乐系统
 * 基于 Web Audio API，为每个页面生成独特的氛围音景
 * 无需外部音频文件
 */
(function() {
  'use strict';

  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var ctx = null;
  var masterGain = null;
  var isPlaying = false;
  var isMuted = false;
  var currentTheme = null;
  var activeNodes = [];
  var userInteracted = false;
  var initQueue = null;

  // ========== 主题音景定义 ==========
  var themes = {
    // 首页 — 大气恢弘，温暖迎宾
    'index': {
      baseFreq: 130.81,   // C3
      chordNotes: [261.63, 329.63, 392.00, 440.00, 523.25], // C E G A C pentatonic
      modRate: 0.12,
      filterBase: 800,
      padType: 'sawtooth',
      droneVol: 0.06,
      chordVol: 0.04,
      chordInterval: 8
    },
    // 节日起源 — 古远深邃，历史厚重
    'origin': {
      baseFreq: 98.00,    // G2
      chordNotes: [196.00, 246.94, 293.66, 329.63, 392.00], // G B D E G
      modRate: 0.06,
      filterBase: 500,
      padType: 'triangle',
      droneVol: 0.07,
      chordVol: 0.03,
      chordInterval: 12
    },
    // 民间习俗 — 热闹欢快，民俗气息
    'customs': {
      baseFreq: 146.83,   // D3
      chordNotes: [293.66, 369.99, 440.00, 493.88, 587.33], // D F# A B D
      modRate: 0.18,
      filterBase: 1200,
      padType: 'triangle',
      droneVol: 0.05,
      chordVol: 0.05,
      chordInterval: 5
    },
    // 神话传说 — 空灵梦幻，月宫仙气
    'legends': {
      baseFreq: 174.61,   // F3
      chordNotes: [349.23, 392.00, 466.16, 523.25, 698.46], // F4 G4 Bb4 C5 F5
      modRate: 0.04,
      filterBase: 1600,
      padType: 'sine',
      droneVol: 0.05,
      chordVol: 0.04,
      chordInterval: 10
    },
    // 美食文化 — 温暖人间烟火
    'food': {
      baseFreq: 110.00,   // A2
      chordNotes: [220.00, 277.18, 329.63, 369.99, 440.00], // A C# E F# A
      modRate: 0.10,
      filterBase: 700,
      padType: 'triangle',
      droneVol: 0.06,
      chordVol: 0.04,
      chordInterval: 7
    },
    // 诗词鉴赏 — 清雅脱俗，文人气质
    'poetry': {
      baseFreq: 164.81,   // E3
      chordNotes: [329.63, 392.00, 440.00, 523.25, 659.25], // E4 G4 A4 C5 E5
      modRate: 0.05,
      filterBase: 900,
      padType: 'sine',
      droneVol: 0.04,
      chordVol: 0.03,
      chordInterval: 14
    },
    // 诗词详情 — 沉思静谧，深度赏析
    'poetry-detail': {
      baseFreq: 138.59,   // C#3
      chordNotes: [277.18, 329.63, 415.30, 440.00, 554.37], // C#4 E4 G#4 A4 C#5
      modRate: 0.03,
      filterBase: 600,
      padType: 'sine',
      droneVol: 0.04,
      chordVol: 0.02,
      chordInterval: 16
    },
    // 中秋图集 — 宁静平和，画面感
    'gallery': {
      baseFreq: 116.54,   // Bb2
      chordNotes: [233.08, 293.66, 349.23, 392.00, 466.16], // Bb3 D4 F4 G4 Bb4
      modRate: 0.07,
      filterBase: 1000,
      padType: 'sine',
      droneVol: 0.05,
      chordVol: 0.03,
      chordInterval: 9
    },
    // 祝福寄语 — 温暖希望，感动人心
    'blessing': {
      baseFreq: 123.47,   // B2
      chordNotes: [246.94, 311.13, 369.99, 415.30, 493.88], // B3 D#4 F#4 G#4 B4
      modRate: 0.09,
      filterBase: 850,
      padType: 'triangle',
      droneVol: 0.05,
      chordVol: 0.04,
      chordInterval: 6
    },
    // 名人与食 — 沉稳大气，历史人物
    'fame-detail': {
      baseFreq: 103.83,   // G#2
      chordNotes: [207.65, 261.63, 311.13, 349.23, 415.30], // G#3 C4 D#4 F4 G#4
      modRate: 0.08,
      filterBase: 650,
      padType: 'triangle',
      droneVol: 0.06,
      chordVol: 0.03,
      chordInterval: 11
    }
  };

  // ========== 内部工具函数 ==========
  function createGain(vol) {
    var g = ctx.createGain();
    g.gain.value = vol;
    g.connect(masterGain);
    activeNodes.push(g);
    return g;
  }

  function createFilter(type, freq) {
    var f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = 0.7;
    return f;
  }

  // ========== 创建低频氛围底音 ==========
  function createDrone(theme) {
    var now = ctx.currentTime;

    // 主振荡器
    var osc = ctx.createOscillator();
    osc.type = theme.padType;
    osc.frequency.value = theme.baseFreq;

    // 轻微频率调制（模拟颤音/呼吸感）
    var lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = theme.modRate;
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start(now);

    // 低通滤波
    var filter = createFilter('lowpass', theme.filterBase);
    osc.connect(filter);

    var gain = createGain(0);
    filter.connect(gain);

    osc.start(now);
    gain.gain.setTargetAtTime(theme.droneVol, now, 3);

    activeNodes.push(osc, lfo);
  }

  // ========== 创建和弦泛音层 ==========
  function createChordLayer(theme) {
    var now = ctx.currentTime;

    theme.chordNotes.forEach(function(freq, i) {
      // 每个和弦音错开启动
      var delay = i * 0.3;
      playChordNote(freq, theme, now + delay, i);
    });

    // 循环演奏
    var intervalId = setInterval(function() {
      if (!isPlaying || currentTheme !== theme) {
        clearInterval(intervalId);
        return;
      }
      var noteIdx = Math.floor(Math.random() * theme.chordNotes.length);
      playChordNote(theme.chordNotes[noteIdx], theme, ctx.currentTime + 0.5, noteIdx);
    }, theme.chordInterval * 1000);

    activeNodes.push({ clear: function() { clearInterval(intervalId); } });
  }

  function playChordNote(freq, theme, startTime, idx) {
    var osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    // 高次泛音使用低通滤波，避免尖锐
    var filter = createFilter('lowpass', theme.filterBase * (1 + idx * 0.3));
    osc.connect(filter);

    var gain = createGain(0);
    filter.connect(gain);

    // 柔和的音量包络
    var vol = theme.chordVol * (0.6 + Math.random() * 0.4);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 1.2);
    gain.gain.linearRampToValueAtTime(vol * 0.5, startTime + 3);
    gain.gain.linearRampToValueAtTime(0, startTime + 5);

    osc.start(startTime);
    osc.stop(startTime + 5.5);

    setTimeout(function() {
      var idx = activeNodes.indexOf(osc);
      if (idx > -1) { activeNodes.splice(idx, 1); }
      idx = activeNodes.indexOf(gain);
      if (idx > -1) { activeNodes.splice(idx, 1); }
    }, 6000);
  }

  // ========== 公共 API ==========
  window.AudioPlayer = {
    init: function(themeName) {
      currentTheme = themes[themeName] || themes['index'];

      // 如果用户还没交互，排队等待
      if (!userInteracted) {
        initQueue = themeName;
        return;
      }

      if (ctx && isPlaying) {
        this.stop();
      }

      try {
        if (!ctx) {
          ctx = new AudioContext();
        }

        masterGain = ctx.createGain();
        masterGain.gain.value = isMuted ? 0 : 1;
        masterGain.connect(ctx.destination);

        createDrone(currentTheme);
        createChordLayer(currentTheme);

        isPlaying = true;
        updateToggleIcon();
      } catch (e) {
        console.warn('音频初始化失败:', e.message);
      }
    },

    toggle: function() {
      if (!ctx) {
        // 首次交互，尝试初始化
        userInteracted = true;
        if (initQueue) {
          this.init(initQueue);
          initQueue = null;
        }
        return;
      }

      isMuted = !isMuted;
      if (masterGain) {
        var now = ctx.currentTime;
        masterGain.gain.setTargetAtTime(isMuted ? 0 : 1, now, 0.3);
      }
      updateToggleIcon();
      try { localStorage.setItem('mid-autumn-audio-muted', isMuted ? '1' : '0'); } catch(e) {}
    },

    stop: function() {
      isPlaying = false;
      activeNodes.forEach(function(node) {
        try {
          if (node.clear) { node.clear(); }
          if (node.stop) { node.stop(); }
          if (node.disconnect) { node.disconnect(); }
        } catch(e) {}
      });
      activeNodes = [];
    },

    setVolume: function(v) {
      if (masterGain && ctx) {
        masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), ctx.currentTime, 0.5);
      }
    }
  };

  // ========== 音乐开关图标更新 ==========
  function updateToggleIcon() {
    var btn = document.getElementById('music-toggle');
    if (!btn) return;
    var icon = btn.querySelector('.music-icon');
    if (!icon) return;
    icon.textContent = isMuted ? '🔇' : '🎵';
    if (isMuted) {
      btn.classList.add('muted');
    } else {
      btn.classList.remove('muted');
    }
  }

  // ========== 创建音乐开关按钮 ==========
  function createToggleButton() {
    if (document.getElementById('music-toggle')) return;
    var btn = document.createElement('div');
    btn.id = 'music-toggle';
    btn.title = '背景音乐 开/关';
    btn.innerHTML = '<span class="music-icon">🎵</span>';
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.AudioPlayer.toggle();
    });
    document.body.appendChild(btn);
  }

  // ========== 监听用户首次交互 ==========
  function onFirstInteraction() {
    if (userInteracted) return;
    userInteracted = true;
    document.removeEventListener('click', onFirstInteraction);
    document.removeEventListener('keydown', onFirstInteraction);
    document.removeEventListener('scroll', onFirstInteraction);
    document.removeEventListener('touchstart', onFirstInteraction);

    if (initQueue) {
      window.AudioPlayer.init(initQueue);
      initQueue = null;
    }
  }

  // ========== 启动 ==========
  function setup() {
    createToggleButton();

    // 读取静音偏好
    try {
      if (localStorage.getItem('mid-autumn-audio-muted') === '1') {
        isMuted = true;
        updateToggleIcon();
      }
    } catch(e) {}

    // 监听首次交互以启动音频（浏览器自动播放策略要求）
    document.addEventListener('click', onFirstInteraction);
    document.addEventListener('keydown', onFirstInteraction);
    document.addEventListener('scroll', onFirstInteraction, { once: true });
    document.addEventListener('touchstart', onFirstInteraction);

    // 如果页面已有交互（如从其他页面导航回来），直接启动
    if (document.readyState === 'complete') {
      setTimeout(function() {
        if (!userInteracted && initQueue) {
          // 延迟检查 - 某些浏览器在页面加载后允许自动播放
          try {
            var testCtx = new AudioContext();
            if (testCtx.state === 'running') {
              onFirstInteraction();
            }
            testCtx.close();
          } catch(e) {}
        }
      }, 1000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
