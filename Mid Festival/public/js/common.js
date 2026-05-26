/**
 * 中秋节专题网站 - 公共脚本（增强版）
 * 导航 | 页面过渡 | 滚动监听 | 返回顶部 | 光标粒子 | 鼠标光晕 | 背景视差 | hover爆发
 */
(function() {
  'use strict';

  /* ================================================================
     1. 导航栏
     ================================================================ */
  var navbar = document.querySelector('.navbar');
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  var scrollTicking = false;
  window.addEventListener('scroll', function() {
    if (!scrollTicking) {
      requestAnimationFrame(function() {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navLinks.classList.toggle('mobile-open');
      navToggle.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        navLinks.classList.remove('mobile-open');
        navToggle.classList.remove('active');
      });
    });
  }

  (function highlightNav() {
    var pathname = window.location.pathname;
    var activeHref = '/';
    if (pathname.startsWith('/origin')) activeHref = '/origin';
    else if (pathname.startsWith('/customs')) activeHref = '/customs';
    else if (pathname.startsWith('/legends')) activeHref = '/legends';
    else if (pathname.startsWith('/food') || pathname.startsWith('/fame')) activeHref = '/food';
    else if (pathname.startsWith('/poetry')) activeHref = '/poetry';
    else if (pathname.startsWith('/gallery')) activeHref = '/gallery';
    else if (pathname.startsWith('/blessing')) activeHref = '/blessing';
    else if (pathname.startsWith('/admin')) activeHref = '/admin';

    function applyActive(container) {
      if (!container) return;
      container.querySelectorAll('a').forEach(function(link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === activeHref) {
          link.classList.add('active');
        }
      });
    }

    applyActive(document.querySelector('.nav-links'));
    applyActive(document.querySelector('.footer-links'));
  })();

  /* ================================================================
     2. 回到顶部
     ================================================================ */
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      backToTop.classList.toggle('visible', window.scrollY > 600);
    });
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ================================================================
     3. 滚动揭示动画
     ================================================================ */
  var revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
    revealElements.forEach(function(el) { revealObserver.observe(el); });
  } else if (revealElements.length > 0) {
    revealElements.forEach(function(el) { el.classList.add('visible'); });
  }

  /* ================================================================
     4. 卡片鼠标追踪光效
     ================================================================ */
  document.querySelectorAll('.card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });

  /* ================================================================
     5. 页面过渡动画
     ================================================================ */
  var transitionEl = document.querySelector('.page-transition');
  if (transitionEl) {
    window.addEventListener('load', function() {
      setTimeout(function() { transitionEl.classList.remove('active'); }, 300);
    });
    document.querySelectorAll('a[href$=".html"]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        var href = link.getAttribute('href');
        if (!href || href.startsWith('#') || link.getAttribute('target') === '_blank') return;
        e.preventDefault();
        if (transitionEl) transitionEl.classList.add('active');
        setTimeout(function() { window.location.href = href; }, 400);
      });
    });
  }
  if (transitionEl) { transitionEl.classList.add('active'); }

  /* ================================================================
     6. 背景装饰粒子
     ================================================================ */
  function createBgParticles() {
    var container = document.querySelector('.bg-particles');
    if (!container) return;
    var count = 25;
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var particle = document.createElement('div');
      particle.className = 'particle-float';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 5 + 's';
      particle.style.animationDuration = (3 + Math.random() * 6) + 's';
      particle.style.width = (2 + Math.random() * 5) + 'px';
      particle.style.height = particle.style.width;
      fragment.appendChild(particle);
    }
    container.appendChild(fragment);
  }
  createBgParticles();

  /* ================================================================
     7. 滚动进度条
     ================================================================ */
  var progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', function() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = Math.min(100, progress) + '%';
    });
  }

  /* ================================================================
     8. 全局鼠标跟随光晕（增强版）
     ================================================================ */
  var cursorGlow = null;
  var isTouchDevice = false;

  function initCursorGlow() {
    // 触摸设备跳过
    if ('ontouchstart' in window || (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches)) {
      isTouchDevice = true;
      return;
    }

    cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    document.body.appendChild(cursorGlow);

    var mouseX = -200, mouseY = -200;
    var currentX = -200, currentY = -200;
    var glowTicking = false;

    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // 检测是否在交互元素上
      var target = e.target;
      var isInteractive = target.closest('a, button, .btn, .card, .flip-card, .custom-item, .legend-pcard, .legend-card, .gallery-item, .poetry-card, .world-card, .heritage-milestone, .mooncake-card, .food-tag, .culture-card');
      if (cursorGlow) {
        cursorGlow.classList.toggle('on-interactive', !!isInteractive);
      }

      if (!glowTicking) {
        requestAnimationFrame(function() {
          // 平滑插值跟随
          currentX += (mouseX - currentX) * 0.15;
          currentY += (mouseY - currentY) * 0.15;
          if (cursorGlow) {
            cursorGlow.style.left = currentX + 'px';
            cursorGlow.style.top = currentY + 'px';
          }
          glowTicking = false;
        });
        glowTicking = true;
      }
    });

    // 鼠标离开窗口时隐藏
    document.addEventListener('mouseleave', function() {
      if (cursorGlow) cursorGlow.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function() {
      if (cursorGlow) cursorGlow.style.opacity = '1';
    });
  }

  /* ================================================================
     9. 光标拖尾粒子系统（增强版）
     ================================================================ */
  function initCursorTrail() {
    if (isTouchDevice) return;

    var sprites = [];
    var maxSprites = 30;
    var lastSpawnTime = 0;
    var spawnInterval = 35; // ms between particles
    var mouseX = -100, mouseY = -100;
    var prevX = -100, prevY = -100;
    var trailTicking = false;

    // 颜色池
    var colors = [
      'var(--moon-gold)',
      'var(--moon-glow)',
      '#fefef0',
      'var(--osmanthus-yellow)',
      '#fce08a'
    ];

    document.addEventListener('mousemove', function(e) {
      prevX = mouseX;
      prevY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!trailTicking) {
        requestAnimationFrame(function() {
          var now = performance.now();
          if (now - lastSpawnTime > spawnInterval) {
            // 计算移动速度，快速移动时生成更多粒子
            var dx = mouseX - prevX;
            var dy = mouseY - prevY;
            var speed = Math.sqrt(dx * dx + dy * dy);
            var count = speed > 15 ? 2 : 1;

            for (var c = 0; c < count; c++) {
              spawnTrailParticle(
                mouseX + (Math.random() - 0.5) * 6,
                mouseY + (Math.random() - 0.5) * 6,
                speed
              );
            }
            lastSpawnTime = now;
          }
          trailTicking = false;
        });
        trailTicking = true;
      }
    });

    function spawnTrailParticle(x, y, speed) {
      // 清理超出上限的粒子
      while (sprites.length >= maxSprites) {
        var old = sprites.shift();
        if (old && old.parentNode) old.parentNode.removeChild(old);
      }

      var size = Math.random() < 0.5 ? 2 : (Math.random() < 0.5 ? 4 : 6);
      var color = colors[Math.floor(Math.random() * colors.length)];
      var duration = 0.5 + Math.random() * 0.8;
      var angle = Math.random() * Math.PI * 2;
      var dist = 25 + Math.random() * 55 + speed * 1.5;
      var sx = Math.cos(angle) * dist;
      var sy = Math.sin(angle) * dist;

      var sprite = document.createElement('div');
      sprite.style.cssText = [
        'position:fixed;pointer-events:none;z-index:9999;',
        'border-radius:50%;',
        'width:' + size + 'px;height:' + size + 'px;',
        'background:' + color + ';',
        'box-shadow: 0 0 ' + (size * 2) + 'px ' + (size * 0.5) + 'px ' + color + ';',
        'left:' + x + 'px;top:' + y + 'px;',
        '--sx:' + sx + 'px;--sy:' + sy + 'px;',
        '--sr:' + (Math.random() * 360) + 'deg;',
        'animation:spriteFade ' + duration + 's ease-out forwards;'
      ].join('');

      document.body.appendChild(sprite);
      sprites.push(sprite);

      setTimeout(function() {
        if (sprite.parentNode) sprite.parentNode.removeChild(sprite);
        var idx = sprites.indexOf(sprite);
        if (idx > -1) sprites.splice(idx, 1);
      }, (duration + 0.1) * 1000);
    }
  }

  /* ================================================================
     10. Hover 粒子爆发
     ================================================================ */
  function initHoverBurst() {
    if (isTouchDevice) return;

    var burstTargets = 'a, .btn, .card, .flip-card, .custom-item, .legend-pcard, ' +
      '.legend-card, .gallery-item, .poetry-card, .world-card, .heritage-milestone, ' +
      '.mooncake-card, .culture-card, .gallery-preview-item, .food-tag, button';

    document.addEventListener('mouseover', function(e) {
      var target = e.target.closest(burstTargets);
      if (!target) return;

      var rect = target.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var count = 4 + Math.floor(Math.random() * 4);

      for (var i = 0; i < count; i++) {
        spawnBurstParticle(cx, cy, rect);
      }
    });
  }

  function spawnBurstParticle(cx, cy, rect) {
    var size = 2 + Math.random() * 3;
    var colors = ['var(--moon-gold)', '#fefef0', 'var(--osmanthus-yellow)', '#fce08a'];
    var color = colors[Math.floor(Math.random() * colors.length)];
    var angle = Math.random() * Math.PI * 2;
    var dist = 15 + Math.random() * 45;
    var bx = Math.cos(angle) * dist;
    var by = Math.sin(angle) * dist;
    var duration = 0.4 + Math.random() * 0.5;

    var sprite = document.createElement('div');
    sprite.style.cssText = [
      'position:fixed;pointer-events:none;z-index:9997;',
      'border-radius:50%;',
      'width:' + size + 'px;height:' + size + 'px;',
      'background:' + color + ';',
      'box-shadow: 0 0 ' + (size * 3) + 'px ' + color + ';',
      'left:' + cx + 'px;top:' + cy + 'px;',
      '--bx:' + bx + 'px;--by:' + by + 'px;',
      'animation:spriteBurst ' + duration + 's ease-out forwards;'
    ].join('');

    document.body.appendChild(sprite);
    setTimeout(function() {
      if (sprite.parentNode) sprite.parentNode.removeChild(sprite);
    }, (duration + 0.1) * 1000);
  }

  /* ================================================================
     11. 背景微视差（鼠标位置影响body背景）
     ================================================================ */
  function initBgParallax() {
    if (isTouchDevice) return;
    var bgTicking = false;

    document.addEventListener('mousemove', function(e) {
      if (!bgTicking) {
        requestAnimationFrame(function() {
          var x = (e.clientX / window.innerWidth - 0.5) * 8;
          var y = (e.clientY / window.innerHeight - 0.5) * 6;
          document.documentElement.style.setProperty('--bg-offset-x', x + 'px');
          document.documentElement.style.setProperty('--bg-offset-y', y + 'px');
          bgTicking = false;
        });
        bgTicking = true;
      }
    });
  }

  /* ================================================================
     12. 初始化所有
     ================================================================ */
  function init() {
    initCursorGlow();
    initCursorTrail();
    initHoverBurst();
    initBgParallax();
  }

  /* ================================================================
     13. 禁止复制
     ================================================================ */
  document.addEventListener('copy', function(e) { e.preventDefault(); });
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  document.addEventListener('selectstart', function(e) { e.preventDefault(); });
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' ||
                      e.key === 'u' || e.key === 'U' ||
                      e.key === 's' || e.key === 'S' ||
                      e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
    }
    if (e.key === 'F12') e.preventDefault();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
