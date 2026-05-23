/**
 * 中秋节专题网站 - 粒子系统
 * "月满中华·情系中秋"
 * 星星 | 孔明灯 | 桂花花瓣 | 烟花 | 水面倒影
 */
var ParticleSystem = (function() {
  'use strict';

  /* ========== 星星类 ========== */
  function Star(x, y, radius, twinkleSpeed, twinkleOffset) {
    this.x = x;
    this.y = y;
    this.radius = radius || Math.random() * 2 + 0.5;
    this.twinkleSpeed = twinkleSpeed || Math.random() * 0.02 + 0.005;
    this.twinkleOffset = twinkleOffset || Math.random() * Math.PI * 2;
    this.baseAlpha = Math.random() * 0.5 + 0.3;
    this.alpha = this.baseAlpha;
  }

  Star.prototype.update = function(time) {
    this.alpha = this.baseAlpha + Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.4;
    this.alpha = Math.max(0.1, Math.min(1, this.alpha));
  };

  Star.prototype.draw = function(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = '#fefef0';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // 亮星加十字光芒
    if (this.radius > 1.5 && this.alpha > 0.7) {
      ctx.globalAlpha = this.alpha * 0.3;
      ctx.strokeStyle = '#fefef0';
      ctx.lineWidth = 0.5;
      var len = this.radius * 4;
      ctx.beginPath();
      ctx.moveTo(this.x - len, this.y);
      ctx.lineTo(this.x + len, this.y);
      ctx.moveTo(this.x, this.y - len);
      ctx.lineTo(this.x, this.y + len);
      ctx.stroke();
    }
    ctx.restore();
  };

  /* ========== 孔明灯类 ========== */
  function Lantern(canvasWidth, canvasHeight, speedScale) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.speedScale = speedScale || 1;
    this.reset();
  }

  Lantern.prototype.reset = function() {
    this.x = Math.random() * this.canvasWidth * 0.8 + this.canvasWidth * 0.1;
    this.y = this.canvasHeight + Math.random() * 100 + 50;
    this.size = Math.random() * 18 + 14;
    this.speed = (Math.random() * 0.6 + 0.3) * this.speedScale;
    this.swayAmplitude = Math.random() * 40 + 20;
    this.swayFrequency = Math.random() * 0.01 + 0.005;
    this.swayOffset = Math.random() * Math.PI * 2;
    this.glowIntensity = Math.random() * 0.3 + 0.5;
    this.opacity = Math.random() * 0.3 + 0.6;
    this.time = Math.random() * 1000;
  };

  Lantern.prototype.update = function() {
    this.time += 1;
    this.y -= this.speed;
    this.x += Math.sin(this.time * this.swayFrequency + this.swayOffset) * 0.4;

    if (this.y < -100) {
      this.reset();
    }
  };

  Lantern.prototype.draw = function(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    var x = this.x;
    var y = this.y;
    var w = this.size * 0.6;
    var h = this.size;

    // 光晕
    var glow = ctx.createRadialGradient(x, y - h * 0.1, w * 0.1, x, y, w * 1.2);
    glow.addColorStop(0, 'rgba(245, 210, 122, ' + this.glowIntensity + ')');
    glow.addColorStop(0.5, 'rgba(232, 115, 74, ' + (this.glowIntensity * 0.4) + ')');
    glow.addColorStop(1, 'rgba(232, 115, 74, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y - h * 0.1, w * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 灯笼主体
    var bodyGrad = ctx.createLinearGradient(x, y - h, x, y);
    bodyGrad.addColorStop(0, '#f5d27a');
    bodyGrad.addColorStop(0.3, '#e8734a');
    bodyGrad.addColorStop(0.7, '#d4453b');
    bodyGrad.addColorStop(1, '#a03028');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(x, y - h * 0.25, w, h * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // 灯笼顶部
    ctx.fillStyle = '#c9a96e';
    ctx.fillRect(x - w * 0.4, y - h * 0.75, w * 0.8, h * 0.08);

    // 灯笼底部
    ctx.fillRect(x - w * 0.3, y + h * 0.2, w * 0.6, h * 0.06);

    // 支架线
    ctx.strokeStyle = 'rgba(201, 169, 110, 0.6)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y - h * 0.75);
    ctx.lineTo(x, y - h);
    ctx.stroke();

    ctx.restore();
  };

  /* ========== 花瓣类 ========== */
  function Petal(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.reset();
  }

  Petal.prototype.reset = function() {
    this.x = Math.random() * this.canvasWidth;
    this.y = -20;
    this.size = Math.random() * 6 + 3;
    this.speedY = Math.random() * 1.2 + 0.5;
    this.speedX = Math.random() * 0.6 - 0.3;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = Math.random() * 0.03 - 0.015;
    this.opacity = Math.random() * 0.5 + 0.3;
    // 花瓣颜色：暖金色系
    var colors = ['#f5d27a', '#f0c75e', '#e8c86a', '#fce08a', '#dba959'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  };

  Petal.prototype.update = function() {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.y * 0.02) * 0.3;
    this.rotation += this.rotationSpeed;

    if (this.y > this.canvasHeight + 50) {
      this.reset();
    }
  };

  Petal.prototype.draw = function(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  /* ========== 烟花粒子 ========== */
  function FireworkParticle(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color || '#f5d27a';
    var angle = Math.random() * Math.PI * 2;
    var speed = Math.random() * 4 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1;
    this.decay = Math.random() * 0.015 + 0.008;
    this.size = Math.random() * 2.5 + 1;
  }

  FireworkParticle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.03; // 重力
    this.vx *= 0.99;
    this.vy *= 0.99;
    this.life -= this.decay;
  };

  FireworkParticle.prototype.draw = function(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  /* ========== 烟花类 ========== */
  function Firework(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.particles = [];
    this.alive = true;
    this.reset();
  }

  Firework.prototype.reset = function() {
    this.x = Math.random() * this.canvasWidth * 0.6 + this.canvasWidth * 0.2;
    this.y = this.canvasHeight;
    this.targetY = Math.random() * this.canvasHeight * 0.35 + this.canvasHeight * 0.1;
    this.rising = true;
    this.riseSpeed = Math.random() * 3 + 4;
    this.trailParticles = [];
    this.particles = [];
    this.alive = true;
    var colors = ['#f5d27a', '#e8734a', '#f0c75e', '#fef5d7', '#ff6b6b', '#ffd93d'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  };

  Firework.prototype.update = function() {
    if (this.rising) {
      this.y -= this.riseSpeed;
      // 尾迹
      if (Math.random() < 0.6) {
        this.trailParticles.push(new FireworkParticle(this.x, this.y, this.color));
      }
      if (this.y <= this.targetY) {
        this.rising = false;
        this.explode();
      }
    }

    // 更新爆炸粒子
    for (var i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 更新尾迹
    for (var j = this.trailParticles.length - 1; j >= 0; j--) {
      this.trailParticles[j].update();
      if (this.trailParticles[j].life <= 0) {
        this.trailParticles.splice(j, 1);
      }
    }

    if (!this.rising && this.particles.length === 0 && this.trailParticles.length === 0) {
      this.alive = false;
    }
  };

  Firework.prototype.explode = function() {
    var count = Math.floor(Math.random() * 40) + 40;
    for (var i = 0; i < count; i++) {
      this.particles.push(new FireworkParticle(this.x, this.y, this.color));
    }
  };

  Firework.prototype.draw = function(ctx) {
    if (this.rising) {
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(ctx);
    }
    for (var j = 0; j < this.trailParticles.length; j++) {
      this.trailParticles[j].draw(ctx);
    }
  };

  /* ========== 月亮类 ========== */
  function Moon(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius || 120;
    this.glowPhase = 0;
    this.glowSpeed = 0.008;
  }

  Moon.prototype.update = function() {
    this.glowPhase += this.glowSpeed;
  };

  Moon.prototype.draw = function(ctx, time) {
    var cx = this.x;
    var cy = this.y;
    var r = this.radius;

    // 外层大光晕
    var outerGlow = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 2.5);
    var glowAlpha = 0.12 + Math.sin(time * 0.003) * 0.04;
    outerGlow.addColorStop(0, 'rgba(245, 210, 122, ' + (glowAlpha * 2.5) + ')');
    outerGlow.addColorStop(0.5, 'rgba(245, 210, 122, ' + glowAlpha + ')');
    outerGlow.addColorStop(1, 'rgba(245, 210, 122, 0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 中层光晕
    var midGlow = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r * 1.6);
    midGlow.addColorStop(0, 'rgba(254, 245, 215, 0.25)');
    midGlow.addColorStop(0.6, 'rgba(245, 210, 122, 0.10)');
    midGlow.addColorStop(1, 'rgba(245, 210, 122, 0)');
    ctx.fillStyle = midGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // 月亮主体
    var moonGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.25, r * 0.1, cx, cy, r);
    moonGrad.addColorStop(0, '#fefef0');
    moonGrad.addColorStop(0.15, '#fef8e0');
    moonGrad.addColorStop(0.4, '#fdf0c8');
    moonGrad.addColorStop(0.7, '#f5d27a');
    moonGrad.addColorStop(1, '#dba959');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 月海暗纹（模拟月球表面）
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    var spots = [
      { dx: -0.15, dy: -0.1, sr: 0.25 },
      { dx: 0.2, dy: 0.05, sr: 0.2 },
      { dx: -0.05, dy: 0.25, sr: 0.18 },
      { dx: 0.1, dy: -0.3, sr: 0.15 },
      { dx: -0.3, dy: 0.2, sr: 0.22 },
    ];

    spots.forEach(function(s) {
      var sx = cx + s.dx * r;
      var sy = cy + s.dy * r;
      var sr = s.sr * r;
      var spotGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
      spotGrad.addColorStop(0, 'rgba(180, 160, 120, 0.15)');
      spotGrad.addColorStop(1, 'rgba(180, 160, 120, 0)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  /* ========== 水面倒影 ========== */
  function WaterReflection(canvasWidth, canvasHeight, moonY, moonRadius) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.moonY = moonY;
    this.moonRadius = moonRadius;
    this.waveOffset = 0;
  }

  WaterReflection.prototype.update = function() {
    this.waveOffset += 0.015;
  };

  WaterReflection.prototype.draw = function(ctx) {
    var waterY = this.height * 0.72;
    var cx = this.width * 0.5;
    var reflectionY = waterY + (waterY - this.moonY) * 0.5;

    // 水面渐变
    var waterGrad = ctx.createLinearGradient(0, waterY, 0, this.height);
    waterGrad.addColorStop(0, 'rgba(20, 30, 60, 0.85)');
    waterGrad.addColorStop(0.3, 'rgba(15, 22, 45, 0.9)');
    waterGrad.addColorStop(1, 'rgba(10, 14, 39, 0.98)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterY, this.width, this.height - waterY);

    // 月光倒影
    ctx.save();
    var reflectGrad = ctx.createLinearGradient(0, waterY, 0, this.height);
    reflectGrad.addColorStop(0, 'rgba(245, 210, 122, 0.5)');
    reflectGrad.addColorStop(0.3, 'rgba(245, 210, 122, 0.2)');
    reflectGrad.addColorStop(0.7, 'rgba(245, 210, 122, 0.05)');
    reflectGrad.addColorStop(1, 'rgba(245, 210, 122, 0)');
    ctx.fillStyle = reflectGrad;

    // 波浪形倒影
    ctx.beginPath();
    ctx.moveTo(0, waterY);
    for (var x = 0; x <= this.width; x += 4) {
      var wave = Math.sin(x * 0.02 + this.waveOffset) * 6 +
                 Math.sin(x * 0.05 + this.waveOffset * 2) * 3 +
                 Math.sin(x * 0.08 + this.waveOffset * 1.5) * 1.5;
      var alpha = 1 - Math.abs(x - cx) / (this.width * 0.7);
      alpha = Math.max(0, alpha);
      wave *= alpha;
      ctx.lineTo(x, waterY + wave + 5);
    }
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();

    // 波光粼粼
    for (var i = 0; i < 30; i++) {
      var wx = cx + (Math.random() - 0.5) * this.width * 0.6;
      var wy = waterY + 20 + Math.random() * 80;
      var shimmer = Math.sin(this.waveOffset * 3 + i) * 0.5 + 0.5;
      ctx.fillStyle = 'rgba(245, 210, 122, ' + (shimmer * 0.25) + ')';
      ctx.fillRect(wx, wy, Math.random() * 40 + 15, 1.5);
    }

    ctx.restore();
  };

  /* ========== 主引擎 ========== */
  function Engine(canvas, options) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options || {};
    this.width = canvas.width;
    this.height = canvas.height;
    this.time = 0;
    this.running = false;
    this.animFrameId = null;

    // 场景元素
    this.moon = null;
    this.stars = [];
    this.lanterns = [];
    this.petals = [];
    this.fireworks = [];
    this.waterReflection = null;

    this._init(options);
  }

  Engine.prototype._init = function(options) {
    var self = this;
    var w = this.width;
    var h = this.height;

    // 月亮
    if (options.moon !== false) {
      this.moon = new Moon(
        options.moonX || w * 0.5,
        options.moonY || h * 0.28,
        options.moonRadius || Math.min(w, h) * 0.12
      );
    }

    // 星星
    if (options.stars !== false) {
      var starCount = options.starCount || 200;
      for (var i = 0; i < starCount; i++) {
        this.stars.push(new Star(
          Math.random() * w,
          Math.random() * h * 0.72,
          undefined, undefined, undefined
        ));
      }
    }

    // 孔明灯
    if (options.lanterns !== false) {
      var lanternCount = options.lanternCount || 8;
      for (var j = 0; j < lanternCount; j++) {
        var lantern = new Lantern(w, h, options.lanternSpeed || 1);
        lantern.y = Math.random() * h; // 初始随机高度
        this.lanterns.push(lantern);
      }
    }

    // 花瓣
    if (options.petals !== false) {
      var petalCount = options.petalCount || 25;
      for (var k = 0; k < petalCount; k++) {
        var petal = new Petal(w, h);
        petal.y = Math.random() * h;
        this.petals.push(petal);
      }
    }

    // 水面倒影
    if (options.waterReflection !== false && this.moon) {
      this.waterReflection = new WaterReflection(w, h, this.moon.y, this.moon.radius);
    }

    // 烟花
    if (options.fireworks !== false) {
      this._scheduleFirework();
    }

    // 响应窗口大小变化
    this._resizeHandler = function() {
      self.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', this._resizeHandler);
  };

  Engine.prototype._scheduleFirework = function() {
    var self = this;
    var delay = Math.random() * 5000 + 3000;
    this._fireworkTimer = setTimeout(function() {
      if (self.running && self.fireworks.length < 3) {
        self.fireworks.push(new Firework(self.width, self.height));
      }
      self._scheduleFirework();
    }, delay);
  };

  Engine.prototype.start = function() {
    if (this.running) return;
    this.running = true;
    this._loop();
  };

  Engine.prototype.stop = function() {
    this.running = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this._fireworkTimer) {
      clearTimeout(this._fireworkTimer);
    }
    window.removeEventListener('resize', this._resizeHandler);
  };

  Engine.prototype.resize = function(width, height) {
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    if (this.waterReflection) {
      this.waterReflection.width = width;
      this.waterReflection.height = height;
    }
  };

  Engine.prototype._loop = function() {
    if (!this.running) return;
    var self = this;
    this.time += 1;
    var ctx = this.ctx;
    var w = this.width;
    var h = this.height;

    // 清屏
    ctx.clearRect(0, 0, w, h);

    // 夜空渐变背景
    var skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#070b1f');
    skyGrad.addColorStop(0.3, '#0a0e27');
    skyGrad.addColorStop(0.6, '#0d1530');
    skyGrad.addColorStop(1, '#0a1028');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 地平线微光
    var horizonGlow = ctx.createLinearGradient(0, h * 0.65, 0, h * 0.8);
    horizonGlow.addColorStop(0, 'transparent');
    horizonGlow.addColorStop(0.5, 'rgba(245, 210, 122, 0.03)');
    horizonGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, h * 0.65, w, h * 0.15);

    // 绘制星星
    for (var i = 0; i < this.stars.length; i++) {
      this.stars[i].update(this.time);
      this.stars[i].draw(ctx);
    }

    // 绘制月亮（在水面之前）
    if (this.moon) {
      this.moon.update();
      this.moon.draw(ctx, this.time);
    }

    // 绘制水面倒影
    if (this.waterReflection) {
      this.waterReflection.update();
      this.waterReflection.draw(ctx);
    }

    // 绘制孔明灯
    for (var j = 0; j < this.lanterns.length; j++) {
      this.lanterns[j].update();
      this.lanterns[j].draw(ctx);
    }

    // 绘制花瓣
    for (var k = 0; k < this.petals.length; k++) {
      this.petals[k].update();
      this.petals[k].draw(ctx);
    }

    // 绘制烟花
    for (var m = this.fireworks.length - 1; m >= 0; m--) {
      this.fireworks[m].update();
      this.fireworks[m].draw(ctx);
      if (!this.fireworks[m].alive) {
        this.fireworks.splice(m, 1);
      }
    }

    // 远景山影
    this._drawMountains(ctx, w, h);

    this.animFrameId = requestAnimationFrame(function() { self._loop(); });
  };

  Engine.prototype._drawMountains = function(ctx, w, h) {
    var baseY = h * 0.72;
    ctx.save();
    ctx.fillStyle = 'rgba(8, 12, 28, 0.8)';

    // 远山 1
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.quadraticCurveTo(w * 0.15, baseY - 60, w * 0.3, baseY);
    ctx.quadraticCurveTo(w * 0.4, baseY - 30, w * 0.5, baseY - 15);
    ctx.quadraticCurveTo(w * 0.65, baseY - 55, w * 0.8, baseY - 5);
    ctx.quadraticCurveTo(w * 0.9, baseY - 35, w, baseY);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 近山 2（更暗）
    ctx.fillStyle = 'rgba(5, 8, 20, 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, baseY + 15);
    ctx.quadraticCurveTo(w * 0.2, baseY - 30, w * 0.35, baseY + 5);
    ctx.quadraticCurveTo(w * 0.5, baseY - 40, w * 0.6, baseY);
    ctx.quadraticCurveTo(w * 0.75, baseY - 25, w, baseY + 10);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // 公开 API
  return {
    Engine: Engine,
    Star: Star,
    Lantern: Lantern,
    Petal: Petal,
    Firework: Firework,
    FireworkParticle: FireworkParticle,
    Moon: Moon,
    WaterReflection: WaterReflection
  };
})();
