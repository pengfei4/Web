/**
 * 月华流转 — 全站动态背景引擎
 * 月亮从升到落的时空旅程，贯穿首页→二级页→三级页
 * 依赖：无（独立运行，与common.js/particles.js兼容共存）
 */
var MoonJourney = (function() {
  'use strict';

  /* ================================================================
     页面时空配置表
     phase: 叙事阶段序号
     moonX/moonY: 月亮在视口中的目标位置 (百分比)
     skyTop/skyBot: 天穹顶部/底部颜色
     glowColor: 月光辉晕主色
     petalDensity: 花瓣密度系数 (0-1)
     lanternChance: 每帧生成孔明灯的概率
     starDensity: 星星密度系数 (0-1)
     moonScale: 月亮大小系数
     ================================================================ */
  var JOURNEY_MAP = {
    'index-hero':    { phase:0, moonX:18, moonY:18, skyTop:'#1a1520', skyBot:'#3a2510', glowColor:'255,200,140', petalDensity:0.15, lanternChance:0.0003, starDensity:0.4, moonScale:0.85 },
    'index-main':    { phase:1, moonX:28, moonY:14, skyTop:'#0f1528', skyBot:'#1a1530', glowColor:'240,200,160', petalDensity:0.25, lanternChance:0.0005, starDensity:0.7, moonScale:0.90 },
    'origin':        { phase:2, moonX:38, moonY:11, skyTop:'#0a0e27', skyBot:'#0d1530', glowColor:'230,210,180', petalDensity:0.30, lanternChance:0.0008, starDensity:0.85, moonScale:0.92 },
    'customs':       { phase:3, moonX:48, moonY:9,  skyTop:'#0a0e27', skyBot:'#0d1530', glowColor:'245,220,190', petalDensity:0.40, lanternChance:0.0012, starDensity:0.75, moonScale:0.95 },
    'legends':       { phase:4, moonX:50, moonY:8,  skyTop:'#080c22', skyBot:'#0a1028', glowColor:'250,230,200', petalDensity:0.55, lanternChance:0.0010, starDensity:0.5,  moonScale:1.0 },
    'food':          { phase:5, moonX:55, moonY:14, skyTop:'#1a1010', skyBot:'#2d0f1a', glowColor:'255,210,140', petalDensity:0.70, lanternChance:0.0015, starDensity:0.3,  moonScale:1.0 },
    'fame-detail':   { phase:6, moonX:56, moonY:16, skyTop:'#1a1010', skyBot:'#2d0f1a', glowColor:'255,200,130', petalDensity:0.60, lanternChance:0.0010, starDensity:0.35, moonScale:0.98 },
    'poetry':        { phase:7, moonX:60, moonY:13, skyTop:'#0a0e27', skyBot:'#0d1530', glowColor:'220,210,200', petalDensity:0.45, lanternChance:0.0006, starDensity:0.65, moonScale:0.93 },
    'poetry-detail': { phase:8, moonX:64, moonY:16, skyTop:'#080c24', skyBot:'#0c1230', glowColor:'210,205,200', petalDensity:0.35, lanternChance:0.0004, starDensity:0.75, moonScale:0.90 },
    'gallery':       { phase:9, moonX:68, moonY:22, skyTop:'#070b1f', skyBot:'#090e28', glowColor:'200,200,200', petalDensity:0.25, lanternChance:0.0003, starDensity:0.85, moonScale:0.85 },
    'blessing':      { phase:10,moonX:75, moonY:35, skyTop:'#0a0e27', skyBot:'#0d1530', glowColor:'240,200,170', petalDensity:0.20, lanternChance:0.0030, starDensity:0.7,  moonScale:0.78 }
  };

  /* ================================================================
     全局状态
     ================================================================ */
  var canvas = null;
  var ctx = null;
  var W = 0, H = 0;
  var running = false;
  var animId = null;
  var time = 0;

  // 月亮当前位置（会从上一页位置平滑过渡到目标位置）
  var moonStartX, moonStartY;  // 过渡起始位置
  var moonTargetX, moonTargetY; // 过渡目标位置
  var moonTransitioning = false;
  var transitionStartTime = 0;
  var transitionDuration = 1200; // ms

  // 当前页面参数
  var currentConfig = null;
  var currentPhase = 0;

  // 星星池
  var stars = [];
  // 花瓣池
  var petals = [];
  // 孔明灯池
  var lanterns = [];
  // 水面河灯池
  var waterLanterns = [];
  // 萤火虫池
  var fireflies = [];
  // 远村灯火池（固定位置）
  var villageLights = [];

  /* ================================================================
     星星
     ================================================================ */
  function Star(x, y, r, twinkleSpeed, twinkleOffset) {
    this.x = x; this.y = y; this.r = r;
    this.twinkleSpeed = twinkleSpeed; this.twinkleOffset = twinkleOffset;
    this.baseAlpha = 0.25 + Math.random() * 0.45;
    this.alpha = this.baseAlpha;
  }
  Star.prototype.update = function(t) {
    this.alpha = this.baseAlpha + Math.sin(t * this.twinkleSpeed + this.twinkleOffset) * 0.35;
    this.alpha = Math.max(0.08, Math.min(1, this.alpha));
  };
  Star.prototype.draw = function(c) {
    c.save();
    c.globalAlpha = this.alpha;
    c.fillStyle = '#fefef0';
    c.beginPath();
    c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    c.fill();
    if (this.r > 1.3 && this.alpha > 0.6) {
      c.globalAlpha = this.alpha * 0.25;
      c.strokeStyle = '#fefef0';
      c.lineWidth = 0.4;
      var len = this.r * 3.5;
      c.beginPath();
      c.moveTo(this.x - len, this.y); c.lineTo(this.x + len, this.y);
      c.moveTo(this.x, this.y - len); c.lineTo(this.x, this.y + len);
      c.stroke();
    }
    c.restore();
  };

  /* ================================================================
     花瓣
     ================================================================ */
  function Petal(w, h) {
    this.w = w; this.h = h;
    this.reset(true);
  }
  Petal.prototype.reset = function(init) {
    this.x = Math.random() * this.w;
    this.y = init ? Math.random() * this.h : -20;
    this.size = 2.5 + Math.random() * 5;
    this.speedY = 0.4 + Math.random() * 1.0;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = Math.random() * 0.025 - 0.012;
    this.opacity = 0.2 + Math.random() * 0.4;
    var clrs = ['#f5d27a','#f0c75e','#e8c86a','#fce08a','#dba959','#fef5d7'];
    this.color = clrs[Math.floor(Math.random() * clrs.length)];
  };
  Petal.prototype.update = function() {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.y * 0.018) * 0.25;
    this.rotation += this.rotSpeed;
    if (this.y > this.h + 60) this.reset(false);
    if (this.x < -30) this.x = this.w + 30;
    if (this.x > this.w + 30) this.x = -30;
  };
  Petal.prototype.draw = function(c) {
    c.save();
    c.globalAlpha = this.opacity;
    c.fillStyle = this.color;
    c.translate(this.x, this.y);
    c.rotate(this.rotation);
    c.beginPath();
    c.ellipse(0, 0, this.size, this.size * 0.45, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  };

  /* ================================================================
     孔明灯
     ================================================================ */
  function Lantern(w, h) {
    this.w = w; this.h = h;
    this.reset(true);
  }
  Lantern.prototype.reset = function(init) {
    this.x = Math.random() * this.w * 0.7 + this.w * 0.15;
    this.y = init ? Math.random() * this.h : this.h + 40 + Math.random() * 80;
    this.size = 10 + Math.random() * 14;
    this.speed = 0.25 + Math.random() * 0.5;
    this.swayAmp = 25 + Math.random() * 35;
    this.swayFreq = 0.005 + Math.random() * 0.008;
    this.swayOff = Math.random() * Math.PI * 2;
    this.glowIntensity = 0.3 + Math.random() * 0.4;
    this.opacity = 0.35 + Math.random() * 0.45;
    this.life = 0;
  };
  Lantern.prototype.update = function() {
    this.life++;
    this.y -= this.speed;
    this.x += Math.sin(this.life * this.swayFreq + this.swayOff) * 0.35;
    if (this.y < -120) this.reset(false);
  };
  Lantern.prototype.draw = function(c) {
    c.save();
    c.globalAlpha = this.opacity;
    var x = this.x, y = this.y, w = this.size * 0.55, h = this.size;
    var glow = c.createRadialGradient(x, y - h*0.1, w*0.1, x, y, w*1.1);
    glow.addColorStop(0, 'rgba(245,210,122,' + this.glowIntensity + ')');
    glow.addColorStop(0.5, 'rgba(232,115,74,' + (this.glowIntensity*0.35) + ')');
    glow.addColorStop(1, 'rgba(232,115,74,0)');
    c.fillStyle = glow;
    c.beginPath(); c.arc(x, y - h*0.1, w*1.1, 0, Math.PI*2); c.fill();
    var body = c.createLinearGradient(x, y-h, x, y);
    body.addColorStop(0, '#f5d27a'); body.addColorStop(0.3, '#e8734a');
    body.addColorStop(0.7, '#d4453b'); body.addColorStop(1, '#a03028');
    c.fillStyle = body;
    c.beginPath(); c.ellipse(x, y - h*0.25, w, h*0.5, 0, 0, Math.PI*2); c.fill();
    c.fillStyle = '#c9a96e';
    c.fillRect(x - w*0.35, y - h*0.72, w*0.7, h*0.07);
    c.fillRect(x - w*0.25, y + h*0.18, w*0.5, h*0.05);
    c.strokeStyle = 'rgba(201,169,110,0.5)'; c.lineWidth = 0.4;
    c.beginPath(); c.moveTo(x, y - h*0.72); c.lineTo(x, y - h*0.92); c.stroke();
    c.restore();
  };

  /* ================================================================
     水面河灯
     ================================================================ */
  function WaterLantern(w, waterY, waterH) {
    this.w = w; this.waterY = waterY; this.waterH = waterH;
    this.reset(true);
  }
  WaterLantern.prototype.reset = function(init) {
    this.x = Math.random() * this.w;
    this.y = init ? this.waterY + Math.random() * this.waterH : this.waterY + this.waterH + 10;
    this.size = 3 + Math.random() * 5;
    this.speedX = (Math.random() - 0.5) * 0.25;
    this.wobbleAmp = 8 + Math.random() * 20;
    this.wobbleFreq = 0.015 + Math.random() * 0.02;
    this.wobbleOff = Math.random() * Math.PI * 2;
    this.glowIntensity = 0.4 + Math.random() * 0.5;
    this.opacity = 0.5 + Math.random() * 0.4;
    this.life = Math.random() * 500;
    this.color = Math.random() < 0.6 ? '255,200,100' : (Math.random() < 0.5 ? '255,180,80' : '255,220,140');
  };
  WaterLantern.prototype.update = function() {
    this.life++;
    this.x += this.speedX + Math.sin(this.life * this.wobbleFreq + this.wobbleOff) * 0.15;
    if (this.x < -20) this.x = this.w + 20;
    if (this.x > this.w + 20) this.x = -20;
  };
  WaterLantern.prototype.draw = function(c) {
    var x = this.x, y = this.y, s = this.size;
    var glow = c.createRadialGradient(x, y, 0, x, y, s * 3);
    glow.addColorStop(0, 'rgba(' + this.color + ',' + this.glowIntensity + ')');
    glow.addColorStop(0.3, 'rgba(' + this.color + ',' + (this.glowIntensity * 0.5) + ')');
    glow.addColorStop(1, 'rgba(' + this.color + ',0)');
    c.fillStyle = glow;
    c.beginPath(); c.arc(x, y, s * 3, 0, Math.PI * 2); c.fill();
    // 灯芯
    c.fillStyle = 'rgba(255,240,200,' + (this.opacity * 0.9) + ')';
    c.beginPath(); c.arc(x, y, s * 0.6, 0, Math.PI * 2); c.fill();
  };

  /* ================================================================
     萤火虫
     ================================================================ */
  function Firefly(w, groundY) {
    this.w = w; this.groundY = groundY;
    this.reset(true);
  }
  Firefly.prototype.reset = function(init) {
    this.x = Math.random() * this.w;
    this.y = init ? this.groundY - 20 - Math.random() * 200 : this.groundY - Math.random() * 30;
    this.baseX = this.x; this.baseY = this.y;
    this.size = 1 + Math.random() * 2;
    this.phase = Math.random() * Math.PI * 2;
    this.speedX = 0.2 + Math.random() * 0.5;
    this.speedY = 0.1 + Math.random() * 0.3;
    this.rangeX = 30 + Math.random() * 80;
    this.rangeY = 20 + Math.random() * 60;
    this.flickerFreq = 0.03 + Math.random() * 0.06;
    this.color = Math.random() < 0.5 ? '255,240,180' : '255,220,150';
  };
  Firefly.prototype.update = function() {
    var t = performance.now() * 0.001;
    this.x = this.baseX + Math.sin(t * this.speedX + this.phase) * this.rangeX;
    this.y = this.baseY + Math.cos(t * this.speedY + this.phase + 1) * this.rangeY;
    if (this.x < 0) this.x = this.w;
    if (this.x > this.w) this.x = 0;
  };
  Firefly.prototype.draw = function(c, time) {
    var alpha = 0.2 + Math.sin(time * this.flickerFreq + this.phase) * 0.5 + 0.5;
    alpha = Math.max(0.1, Math.min(0.9, alpha));
    var glow = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4);
    glow.addColorStop(0, 'rgba(' + this.color + ',' + alpha + ')');
    glow.addColorStop(0.4, 'rgba(' + this.color + ',' + (alpha * 0.4) + ')');
    glow.addColorStop(1, 'rgba(' + this.color + ',0)');
    c.fillStyle = glow;
    c.beginPath(); c.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2); c.fill();
  };

  /* ================================================================
     绘制月亮
     ================================================================ */
  function drawMoon(c, cx, cy, radius, glowColor, phase) {
    // 外层大光晕
    var outerGlow = c.createRadialGradient(cx, cy, radius*0.75, cx, cy, radius*2.6);
    outerGlow.addColorStop(0, 'rgba(' + glowColor + ',0.28)');
    outerGlow.addColorStop(0.4, 'rgba(' + glowColor + ',0.12)');
    outerGlow.addColorStop(1, 'rgba(' + glowColor + ',0)');
    c.fillStyle = outerGlow;
    c.beginPath(); c.arc(cx, cy, radius*2.6, 0, Math.PI*2); c.fill();

    // 中层光晕
    var midGlow = c.createRadialGradient(cx, cy, radius*0.8, cx, cy, radius*1.7);
    midGlow.addColorStop(0, 'rgba(254,245,215,0.22)');
    midGlow.addColorStop(0.5, 'rgba(' + glowColor + ',0.10)');
    midGlow.addColorStop(1, 'rgba(' + glowColor + ',0)');
    c.fillStyle = midGlow;
    c.beginPath(); c.arc(cx, cy, radius*1.7, 0, Math.PI*2); c.fill();

    // 月亮主体
    var moonGrad = c.createRadialGradient(cx - radius*0.18, cy - radius*0.22, radius*0.08, cx, cy, radius);
    moonGrad.addColorStop(0, '#fefef0');
    moonGrad.addColorStop(0.12, '#fef8e0');
    moonGrad.addColorStop(0.35, '#fdf0c8');
    moonGrad.addColorStop(0.65, '#f5d27a');
    moonGrad.addColorStop(1, '#dba959');
    c.fillStyle = moonGrad;
    c.beginPath(); c.arc(cx, cy, radius, 0, Math.PI*2); c.fill();

    // 月海暗纹
    c.save();
    c.beginPath(); c.arc(cx, cy, radius, 0, Math.PI*2); c.clip();
    var spots = [
      { dx:-0.14, dy:-0.08, sr:0.24 },
      { dx:0.18, dy:0.04, sr:0.19 },
      { dx:-0.04, dy:0.22, sr:0.17 },
      { dx:0.09, dy:-0.28, sr:0.14 },
      { dx:-0.28, dy:0.18, sr:0.20 }
    ];
    spots.forEach(function(s) {
      var sx = cx + s.dx * radius, sy = cy + s.dy * radius, sr = s.sr * radius;
      var sg = c.createRadialGradient(sx, sy, 0, sx, sy, sr);
      sg.addColorStop(0, 'rgba(170,150,110,0.14)');
      sg.addColorStop(1, 'rgba(170,150,110,0)');
      c.fillStyle = sg;
      c.beginPath(); c.arc(sx, sy, sr, 0, Math.PI*2); c.fill();
    });

    // 玉兔剪影（仅在 legends/food/poetry 阶段可见，即 phase 4-8）
    if (phase >= 4 && phase <= 8) {
      var rabbitAlpha = phase === 4 ? 0.4 : (phase === 5 ? 0.55 : (phase === 6 ? 0.5 : (phase === 7 ? 0.45 : 0.35)));
      var rx = cx + radius * 0.32, ry = cy - radius * 0.1;
      c.fillStyle = 'rgba(160,140,110,' + rabbitAlpha + ')';
      // 玉兔简化剪影
      c.beginPath();
      c.ellipse(rx, ry, radius*0.08, radius*0.06, 0, 0, Math.PI*2); // 身体
      c.fill();
      c.beginPath();
      c.arc(rx + radius*0.06, ry - radius*0.07, radius*0.045, 0, Math.PI*2); // 头
      c.fill();
      c.beginPath();
      c.ellipse(rx - radius*0.02, ry + radius*0.04, radius*0.03, radius*0.06, -0.3, 0, Math.PI*2); // 耳
      c.fill();
    }
    c.restore();
  }

  function getMoonPos() {
    if (!moonTransitioning) {
      return { x: moonTargetX / 100 * W, y: moonTargetY / 100 * H };
    }
    var elapsed = performance.now() - transitionStartTime;
    var t = Math.min(1, elapsed / transitionDuration);
    t = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
    var cx = moonStartX + (moonTargetX - moonStartX) * t;
    var cy = moonStartY + (moonTargetY - moonStartY) * t;
    if (t >= 1) {
      moonTransitioning = false;
      cx = moonTargetX;
      cy = moonTargetY;
    }
    return { x: cx / 100 * W, y: cy / 100 * H };
  }

  /* ================================================================
     主循环
     ================================================================ */
  function loop() {
    if (!running) return;
    time++;
    var c = ctx, w = W, h = H;

    // 天穹渐变背景
    var skyGrad = c.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, currentConfig ? currentConfig.skyTop : '#0a0e27');
    skyGrad.addColorStop(0.55, currentConfig ? currentConfig.skyBot : '#0d1530');
    skyGrad.addColorStop(1, '#0a1028');
    c.fillStyle = skyGrad;
    c.fillRect(0, 0, w, h);

    // 地平线微光
    // (removed - now handled in drawBottomScene)

    // 底部场景：远山+灯火+水面+倒影+河灯
    drawBottomScene(c, w, h, mx, my, moonR, glowCol, currentPhase, time);

    // 萤火虫
    for (var fi = 0; fi < fireflies.length; fi++) {
      fireflies[fi].update();
      fireflies[fi].draw(c, time);
    }

    // 星星
    for (var i = 0; i < stars.length; i++) {
      stars[i].update(time);
      stars[i].draw(c);
    }

    // 月亮
    var moonR = Math.min(w, h) * 0.11 * (currentConfig ? currentConfig.moonScale : 1);
    var moonPos = getMoonPos();
    var mx = moonPos.x, my = moonPos.y;
    var glowCol = currentConfig ? currentConfig.glowColor : '245,210,122';
    drawMoon(c, mx, my, moonR, glowCol, currentPhase);

    // 花瓣
    for (var j = 0; j < petals.length; j++) {
      petals[j].update();
      petals[j].draw(c);
    }

    // 孔明灯
    for (var k = 0; k < lanterns.length; k++) {
      lanterns[k].update();
      lanterns[k].draw(c);
    }

    // 随机生成孔明灯
    if (currentConfig && Math.random() < currentConfig.lanternChance && lanterns.length < 14) {
      lanterns.push(new Lantern(w, h));
    }

    animId = requestAnimationFrame(loop);
  }

  /* ================================================================
     绘制底部场景：远山→远村灯火→水面→月光倒影
     ================================================================ */
  function drawBottomScene(c, w, h, moonX, moonY, moonR, glowColor, phase, time) {
    var mountainBase = h * 0.68;
    var waterLine = h * 0.78;

    // ---- 远山剪影（近山） ----
    c.save();
    c.fillStyle = 'rgba(8,12,28,0.8)';
    c.beginPath();
    c.moveTo(0, mountainBase + 8);
    c.quadraticCurveTo(w*0.10, mountainBase-45, w*0.22, mountainBase+3);
    c.quadraticCurveTo(w*0.32, mountainBase-20, w*0.45, mountainBase-8);
    c.quadraticCurveTo(w*0.58, mountainBase-38, w*0.72, mountainBase-2);
    c.quadraticCurveTo(w*0.84, mountainBase-25, w*0.94, mountainBase+5);
    c.quadraticCurveTo(w*0.97, mountainBase-15, w, mountainBase);
    c.lineTo(w, waterLine);
    c.lineTo(0, waterLine);
    c.closePath();
    c.fill();

    // 近山
    c.fillStyle = 'rgba(5,8,22,0.85)';
    c.beginPath();
    c.moveTo(0, mountainBase + 15);
    c.quadraticCurveTo(w*0.15, mountainBase-22, w*0.28, mountainBase+5);
    c.quadraticCurveTo(w*0.42, mountainBase-30, w*0.52, mountainBase);
    c.quadraticCurveTo(w*0.65, mountainBase-18, w*0.78, mountainBase+4);
    c.quadraticCurveTo(w*0.88, mountainBase-12, w, mountainBase+10);
    c.lineTo(w, waterLine);
    c.lineTo(0, waterLine);
    c.closePath();
    c.fill();
    c.restore();

    // ---- 远村灯火（在山脚区域） ----
    c.save();
    for (var vi = 0; vi < villageLights.length; vi++) {
      var vl = villageLights[vi];
      var flicker = 0.6 + Math.sin(time * 0.04 + vl.phase) * 0.3 + Math.sin(time * 0.07 + vl.phase * 1.7) * 0.1;
      flicker = Math.max(0.35, Math.min(1, flicker));
      var vlGlow = c.createRadialGradient(vl.x, vl.y, 0, vl.x, vl.y, vl.size * 2.5);
      vlGlow.addColorStop(0, 'rgba(255,220,140,' + (flicker * 0.75) + ')');
      vlGlow.addColorStop(0.5, 'rgba(255,180,80,' + (flicker * 0.25) + ')');
      vlGlow.addColorStop(1, 'rgba(255,150,50,0)');
      c.fillStyle = vlGlow;
      c.beginPath(); c.arc(vl.x, vl.y, vl.size * 2.5, 0, Math.PI*2); c.fill();

      c.fillStyle = 'rgba(255,235,180,' + (flicker * 0.85) + ')';
      c.beginPath(); c.arc(vl.x, vl.y, vl.size * 0.6, 0, Math.PI*2); c.fill();
    }
    c.restore();

    // ---- 地平线暖光带（节日氛围） ----
    var groundGlow = c.createLinearGradient(0, waterLine - 10, 0, waterLine + 20);
    var glowAlpha = 0.04 + Math.sin(time * 0.005) * 0.01;
    groundGlow.addColorStop(0, 'transparent');
    groundGlow.addColorStop(0.4, 'rgba(255,180,80,' + glowAlpha + ')');
    groundGlow.addColorStop(0.7, 'rgba(255,140,40,' + (glowAlpha * 0.7) + ')');
    groundGlow.addColorStop(1, 'transparent');
    c.fillStyle = groundGlow;
    c.fillRect(0, waterLine - 10, w, 30);

    // ---- 水面区域 ----
    var waterGrad = c.createLinearGradient(0, waterLine, 0, h);
    waterGrad.addColorStop(0, 'rgba(10,14,34,0.7)');
    waterGrad.addColorStop(0.3, 'rgba(8,12,30,0.85)');
    waterGrad.addColorStop(0.7, 'rgba(6,10,26,0.92)');
    waterGrad.addColorStop(1, 'rgba(4,8,22,0.98)');
    c.fillStyle = waterGrad;
    c.fillRect(0, waterLine, w, h - waterLine);

    // ---- 月光水面倒影 ----
    if (moonY < waterLine) {
      var reflectCY = waterLine + (waterLine - moonY) * 0.55;
      var reflectCX = moonX + (moonX - w * 0.5) * 0.3;
      reflectCX = Math.max(w*0.1, Math.min(w*0.9, reflectCX));
      reflectCY = Math.min(reflectCY, h - 40);

      // 倒影光柱
      c.save();
      var reflectGrad = c.createLinearGradient(0, waterLine, 0, reflectCY + 120);
      reflectGrad.addColorStop(0, 'rgba(' + glowColor + ',0.3)');
      reflectGrad.addColorStop(0.25, 'rgba(' + glowColor + ',0.15)');
      reflectGrad.addColorStop(0.6, 'rgba(' + glowColor + ',0.04)');
      reflectGrad.addColorStop(1, 'rgba(' + glowColor + ',0)');
      c.fillStyle = reflectGrad;

      c.beginPath();
      var reflectWidth = moonR * 1.2;
      c.moveTo(reflectCX - reflectWidth, waterLine);
      for (var rx = 0; rx <= reflectWidth * 2; rx += 3) {
        var waveX = reflectCX - reflectWidth + rx;
        var waveY = waterLine + Math.sin(rx * 0.04 + time * 0.03) * 5 +
                    Math.sin(rx * 0.09 + time * 0.05) * 2.5 +
                    Math.sin(rx * 0.15 + time * 0.07) * 1.2;
        var edgeAlpha = 1 - Math.abs(waveX - reflectCX) / reflectWidth;
        edgeAlpha = Math.max(0, edgeAlpha);
        waveY *= edgeAlpha;
        c.lineTo(waveX, waterLine + waveY + 8);
      }
      c.lineTo(reflectCX + reflectWidth, h);
      c.lineTo(reflectCX - reflectWidth, h);
      c.closePath();
      c.fill();
      c.restore();

      // 水面波光粼粼
      for (var si = 0; si < 35; si++) {
        var sx = reflectCX + (Math.sin(si * 2.7 + time * 0.01) * 0.5 + 0.5 - 0.5) * reflectWidth * 1.8;
        var sy = waterLine + 15 + (si / 35) * (h - waterLine - 20);
        var shimmer = Math.sin(time * 0.06 + si * 0.7) * 0.4 + 0.4;
        shimmer *= (1 - Math.abs(sx - reflectCX) / (reflectWidth * 1.5));
        shimmer = Math.max(0, shimmer);
        c.fillStyle = 'rgba(' + glowColor + ',' + (shimmer * 0.3) + ')';
        c.fillRect(sx, sy, Math.random() * 25 + 12, 1);
      }
    }

    // ---- 水面河灯 ----
    for (var wli = 0; wli < waterLanterns.length; wli++) {
      waterLanterns[wli].update();
      waterLanterns[wli].draw(c);
    }
  }

  /* ================================================================
     初始化 / 调整大小
     ================================================================ */
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
  }

  function initStars(density) {
    stars = [];
    var count = Math.floor(160 * density);
    for (var i = 0; i < count; i++) {
      stars.push(new Star(
        Math.random() * W,
        Math.random() * H * 0.72,
        Math.random() * 1.8 + 0.3,
        Math.random() * 0.018 + 0.004,
        Math.random() * Math.PI * 2
      ));
    }
  }

  function initPetals(density) {
    petals = [];
    var count = Math.floor(30 * density);
    for (var i = 0; i < count; i++) {
      var p = new Petal(W, H);
      p.y = Math.random() * H;
      petals.push(p);
    }
  }

  function initLanterns() {
    lanterns = [];
    var count = 2 + Math.floor(Math.random() * 3);
    for (var i = 0; i < count; i++) {
      var l = new Lantern(W, H);
      l.y = Math.random() * H;
      lanterns.push(l);
    }
  }

  function initWaterLanterns() {
    var waterLine = H * 0.78;
    var waterH = H - waterLine;
    waterLanterns = [];
    var count = 15 + Math.floor(Math.random() * 15);
    for (var i = 0; i < count; i++) {
      var wl = new WaterLantern(W, waterLine, waterH);
      wl.y = waterLine + 5 + Math.random() * waterH;
      waterLanterns.push(wl);
    }
  }

  function initFireflies() {
    var groundY = H * 0.7;
    fireflies = [];
    var count = 25 + Math.floor(Math.random() * 15);
    for (var i = 0; i < count; i++) {
      fireflies.push(new Firefly(W, groundY));
    }
  }

  function initVillageLights() {
    var mountainBase = H * 0.68;
    villageLights = [];
    // 在山脚区域分布灯火（沿着山脉轮廓）
    var clusters = [
      { cx: 0.15, cy: mountainBase + 8, spread: 60, count: 8 },
      { cx: 0.30, cy: mountainBase + 12, spread: 55, count: 10 },
      { cx: 0.48, cy: mountainBase + 5, spread: 70, count: 12 },
      { cx: 0.65, cy: mountainBase + 10, spread: 50, count: 9 },
      { cx: 0.80, cy: mountainBase + 7, spread: 65, count: 11 },
      { cx: 0.92, cy: mountainBase + 3, spread: 40, count: 6 }
    ];
    clusters.forEach(function(cl) {
      for (var i = 0; i < cl.count; i++) {
        villageLights.push({
          x: (cl.cx + (Math.random() - 0.5) * cl.spread / W) * W,
          y: cl.cy - Math.random() * 25,
          size: 1.2 + Math.random() * 2.5,
          phase: Math.random() * Math.PI * 2
        });
      }
    });
  }

  /* ================================================================
     公开 API
     ================================================================ */

  var initialized = false;

  /**
   * 启动引擎（首次调用初始化，后续调用平滑切换配置）
   * @param {string} journeyKey - JOURNEY_MAP 中的键名
   */
  function start(journeyKey) {
    var cfg = JOURNEY_MAP[journeyKey] || JOURNEY_MAP['origin'];

    if (!initialized) {
      // 首次初始化
      canvas = document.getElementById('moonJourneyCanvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'moonJourneyCanvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;';
        document.body.insertBefore(canvas, document.body.firstChild);
      }
      ctx = canvas.getContext('2d');
      resize();

      // 读取上一页存储的月亮位置
      var prevData = null;
      try {
        var stored = sessionStorage.getItem('moonJourneyPrev');
        if (stored) prevData = JSON.parse(stored);
      } catch(e) {}

      if (prevData && prevData.x !== undefined) {
        moonStartX = prevData.x;
        moonStartY = prevData.y;
      } else {
        moonStartX = cfg.moonX;
        moonStartY = cfg.moonY;
      }
      moonTargetX = cfg.moonX;
      moonTargetY = cfg.moonY;
      moonTransitioning = (prevData && prevData.x !== undefined);
      transitionStartTime = performance.now();

      currentConfig = cfg;
      currentPhase = cfg.phase;

      initStars(cfg.starDensity);
      initPetals(cfg.petalDensity);
      initLanterns();
      initWaterLanterns();
      initFireflies();
      initVillageLights();

      window.addEventListener('resize', function() {
        resize();
        initStars(currentConfig.starDensity);
        initWaterLanterns();
        initFireflies();
        initVillageLights();
      });

      initialized = true;
      running = true;
      loop();

    } else {
      // 后续调用：仅平滑切换月亮位置和粒子密度
      moonStartX = moonTargetX; // 从当前位置开始
      moonStartY = moonTargetY;
      moonTargetX = cfg.moonX;
      moonTargetY = cfg.moonY;
      moonTransitioning = true;
      transitionStartTime = performance.now();

      currentConfig = cfg;
      currentPhase = cfg.phase;

      // 平滑调整星星密度（增量添加或逐步移除）
      adjustStarDensity(cfg.starDensity);
      // 平滑调整花瓣密度
      adjustPetalDensity(cfg.petalDensity);
    }
  }

  function adjustStarDensity(targetDensity) {
    var target = Math.floor(160 * targetDensity);
    while (stars.length < target) {
      stars.push(new Star(Math.random()*W, Math.random()*H*0.72, Math.random()*1.8+0.3, Math.random()*0.018+0.004, Math.random()*Math.PI*2));
    }
    while (stars.length > target + 10) {
      stars.pop();
    }
  }

  function adjustPetalDensity(targetDensity) {
    var target = Math.floor(30 * targetDensity);
    while (petals.length < target) {
      var p = new Petal(W, H);
      p.y = Math.random() * H;
      petals.push(p);
    }
    while (petals.length > target + 5) {
      petals.pop();
    }
  }

  /**
   * 页面离开时存储月亮位置
   */
  function savePosition() {
    try {
      sessionStorage.setItem('moonJourneyPrev', JSON.stringify({
        x: moonTargetX,
        y: moonTargetY
      }));
    } catch(e) {}
  }

  // 监听页面离开
  window.addEventListener('beforeunload', savePosition);
  window.addEventListener('pagehide', savePosition);

  return {
    start: start,
    savePosition: savePosition,
    JOURNEY_MAP: JOURNEY_MAP
  };

})();
