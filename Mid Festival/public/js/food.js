/**
 * 美食文化专题页 — "烟火人间·食味中秋"
 * 模块化交互脚本
 * 依赖: common.js（滚动词示、导航、光标粒子等公共功能）
 */
(function() {
  'use strict';

  /* ================================================================
     模块1: 食物模块滚动揭示
     ================================================================ */
  function initReveal() {
    var reveals = document.querySelectorAll('.food-reveal');
    if (reveals.length === 0) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      reveals.forEach(function(el) { observer.observe(el); });
    } else {
      // Fallback: show all
      reveals.forEach(function(el) { el.classList.add('visible'); });
    }
  }

  /* ================================================================
     模块2: 区域卡片鼠标追踪光效
     ================================================================ */
  function initRegionCardGlow() {
    var cards = document.querySelectorAll('.region-card');
    cards.forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    });
  }

  /* ================================================================
     模块3: 折叠面板 (Accordion)
     ================================================================ */
  function initAccordion() {
    var panels = document.querySelectorAll('.customs-panel');
    panels.forEach(function(panel) {
      var header = panel.querySelector('.cp-header');
      if (!header) return;

      header.addEventListener('click', function() {
        var isOpen = panel.classList.contains('open');

        // 关闭所有面板
        panels.forEach(function(p) { p.classList.remove('open'); });

        // 如果之前不是打开的，就打开当前面板
        if (!isOpen) {
          panel.classList.add('open');
        }
      });
    });

    // 默认打开第一个面板
    if (panels.length > 0) {
      panels[0].classList.add('open');
    }
  }

  /* ================================================================
     模块4: 横向时间轴自动居中
     ================================================================ */
  function initTimeline() {
    // 时间轴自动滚动由 CSS @keyframes timelineAutoScroll 驱动
    // hover时 CSS animation-play-state: paused 自动暂停
    // 用户也可通过滚动条手动浏览
  }

  /* ================================================================
     模块5: 3D翻转卡片 — 点击也支持翻转（移动端兼容）
     ================================================================ */
  function initFlipCards() {
    var cards = document.querySelectorAll('.fame-card');
    cards.forEach(function(card) {
      card.addEventListener('click', function(e) {
        // 如果已经在hover状态（桌面端），不处理click
        // 移动端没有hover，用click切换
        if (window.innerWidth <= 768) {
          var inner = card.querySelector('.fame-card-inner');
          if (inner) {
            var isFlipped = inner.style.transform === 'rotateY(180deg)';
            inner.style.transform = isFlipped ? '' : 'rotateY(180deg)';
          }
        }
      });
    });
  }

  /* ================================================================
     模块6: 图集项hover详情展开
     ================================================================ */
  function initGalleryItems() {
    var items = document.querySelectorAll('.gallery-item');
    // CSS already handles hover expansion via .gi-detail max-height transition
    // This function exists for future touch-device enhancements
    if (window.innerWidth <= 768) {
      items.forEach(function(item) {
        item.addEventListener('click', function() {
          // Toggle mobile detail
          var detail = item.querySelector('.gi-detail');
          if (detail) {
            var isOpen = detail.style.maxHeight !== '0px' && detail.style.maxHeight !== '';
            detail.style.maxHeight = isOpen ? '0px' : '200px';
            detail.style.marginTop = isOpen ? '0' : '15px';
          }
        });
      });
    }
  }

  /* ================================================================
     模块7: 蒸汽粒子再生（在craft-steam-bg中循环重生）
     ================================================================ */
  function initSteamLoop() {
    var container = document.querySelector('.craft-steam-bg');
    if (!container) return;

    // 蒸汽的CSS动画是infinite的，无需额外JS
    // 但可以动态添加更多蒸汽粒子以增加密度
    var existingWisps = container.querySelectorAll('.cs-wisp');
    if (existingWisps.length >= 10) return; // 已有足够粒子

    // 如果粒子少于10个，补充到10个
    var needed = 10 - existingWisps.length;
    for (var i = 0; i < needed; i++) {
      var wisp = document.createElement('div');
      wisp.className = 'cs-wisp';
      wisp.style.left = (Math.random() * 90 + 5) + '%';
      wisp.style.width = (3 + Math.random() * 5) + 'px';
      wisp.style.height = (50 + Math.random() * 80) + 'px';
      wisp.style.animationDelay = (Math.random() * 2) + 's';
      wisp.style.animationDuration = (3 + Math.random() * 3) + 's';
      container.appendChild(wisp);
    }
  }

  /* ================================================================
     模块8: Hover粒子爆发（覆盖food页面专属交互元素）
     ================================================================ */
  function initHoverBurst() {
    // 检测触摸设备则跳过
    if ('ontouchstart' in window || (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches)) {
      return;
    }

    var burstTargets = '.region-card, .timeline-node, .craft-step, .fame-card, .gallery-item, .customs-panel .cp-header';

    document.addEventListener('mouseover', function(e) {
      var target = e.target.closest(burstTargets);
      if (!target) return;

      var rect = target.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var count = 3 + Math.floor(Math.random() * 4);

      for (var i = 0; i < count; i++) {
        var size = 2 + Math.random() * 3;
        var colors = ['#d4a853', '#f0e0c8', '#c87941', '#fce08a'];
        var color = colors[Math.floor(Math.random() * colors.length)];
        var angle = Math.random() * Math.PI * 2;
        var dist = 12 + Math.random() * 40;
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
    });
  }

  /* ================================================================
     模块9: 页面入场动画
     ================================================================ */
  function initPageEntrance() {
    // Hero section staggered entrance
    var heroContent = document.querySelector('.food-hero .hero-content');
    if (heroContent) {
      heroContent.style.opacity = '0';
      heroContent.style.transform = 'translateY(30px)';
      setTimeout(function() {
        heroContent.style.transition = 'opacity 1s ease, transform 1s ease';
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
      }, 200);
    }
  }

  /* ================================================================
     初始化所有模块
     ================================================================ */
  function init() {
    initReveal();
    initRegionCardGlow();
    initAccordion();
    initTimeline();
    initFlipCards();
    initGalleryItems();
    initSteamLoop();
    initHoverBurst();
    initPageEntrance();
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
