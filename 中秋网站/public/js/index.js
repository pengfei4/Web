/**
 * 中秋节专题网站 - 首页脚本（扩建版）
 * Canvas动画 | 倒计时翻牌 | 月相 | 美食轮播 | 鼠标视差 | 光标粒子 | 逐字动画
 */
(function() {
  'use strict';

  /* ================================================================
     1. Canvas 动画引擎（Hero区域）
     ================================================================ */
  var heroCanvas = document.getElementById('heroCanvas');
  var engine = null;

  if (heroCanvas && typeof ParticleSystem !== 'undefined') {
    heroCanvas.width = window.innerWidth;
    heroCanvas.height = window.innerHeight;

    engine = new ParticleSystem.Engine(heroCanvas, {
      moon: true,
      moonX: heroCanvas.width * 0.5,
      moonY: heroCanvas.height * 0.28,
      moonRadius: Math.min(heroCanvas.width, heroCanvas.height) * 0.12,
      stars: true, starCount: 280,
      lanterns: true, lanternCount: 10, lanternSpeed: 0.65,
      petals: true, petalCount: 35,
      waterReflection: true,
      fireworks: true
    });
    engine.start();

    window.addEventListener('resize', function() {
      heroCanvas.width = window.innerWidth;
      heroCanvas.height = window.innerHeight;
      if (engine) engine.resize(window.innerWidth, window.innerHeight);
    });
  }

  /* ================================================================
     2. 标题逐字动画
     ================================================================ */
  function initTitleAnimation() {
    var titleEl = document.querySelector('.hero-main-title');
    if (!titleEl) return;
    var text = titleEl.textContent.trim();
    titleEl.innerHTML = '';
    text.split('').forEach(function(ch, i) {
      var span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      span.style.animationDelay = (i * 0.12) + 's';
      titleEl.appendChild(span);
    });
  }

  /* ================================================================
     3. 倒计时（含翻牌效果）
     ================================================================ */
  var prevSeconds = -1;

  function getMidAutumnDate(year) {
    var dates = {
      2020:{month:10,day:1}, 2021:{month:9,day:21}, 2022:{month:9,day:10},
      2023:{month:9,day:29}, 2024:{month:9,day:17}, 2025:{month:10,day:6},
      2026:{month:9,day:25}, 2027:{month:9,day:15}, 2028:{month:10,day:3},
      2029:{month:9,day:22}, 2030:{month:9,day:12}
    };
    var d = dates[year];
    return d ? new Date(year, d.month-1, d.day) : new Date(year, 8, 15);
  }

  function updateCountdown() {
    var now = new Date();
    var currentYear = now.getFullYear();
    var target = getMidAutumnDate(currentYear);
    if (now > target) target = getMidAutumnDate(currentYear + 1);

    var diff = target - now;
    var days = Math.floor(diff / (1000*60*60*24));
    var hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
    var minutes = Math.floor((diff % (1000*60*60)) / (1000*60));
    var seconds = Math.floor((diff % (1000*60)) / 1000);

    function setNum(id, val) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.textContent !== String(val).padStart(2,'0')) {
        el.classList.remove('flip');
        void el.offsetWidth;
        el.classList.add('flip');
      }
      el.textContent = String(val).padStart(2,'0');
    }

    setNum('cd-days', days);
    setNum('cd-hours', hours);
    setNum('cd-minutes', minutes);
    setNum('cd-seconds', seconds);
    prevSeconds = seconds;

    // 更新公历日期显示
    var dateEl = document.getElementById('midAutumnDateDisplay');
    if (dateEl) {
      dateEl.textContent = target.getFullYear() + '年' +
        (target.getMonth()+1) + '月' + target.getDate() + '日';
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ================================================================
     6. 美食轮播
     ================================================================ */
  function initFoodCarousel() {
    var track = document.querySelector('.food-carousel-track');
    var prevBtn = document.querySelector('.food-carousel-btn.prev');
    var nextBtn = document.querySelector('.food-carousel-btn.next');
    var dots = document.querySelectorAll('.food-carousel-dots .dot');
    if (!track) return;

    var slides = track.querySelectorAll('.food-carousel-slide');
    var current = 0;
    var total = slides.length;
    if (total === 0) return;

    function goTo(idx) {
      current = (idx + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function(d, i) { d.classList.toggle('active', i === current); });
    }

    if (prevBtn) prevBtn.addEventListener('click', function() { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function() { goTo(current + 1); });
    dots.forEach(function(d, i) { d.addEventListener('click', function() { goTo(i); }); });

    // 自动播放
    setInterval(function() { goTo(current + 1); }, 5000);
  }

  /* ================================================================
     6. 祝福内联互动
     ================================================================ */
  function initInlineBlessing() {
    var input = document.getElementById('inlineBlessingInput');
    var sendBtn = document.getElementById('inlineBlessingSend');
    var cardsContainer = document.getElementById('inlineBlessingCards');
    if (!input || !sendBtn || !cardsContainer) return;

    var quickWords = [
      '愿月圆人团圆，中秋快乐，阖家幸福！',
      '但愿人长久，千里共婵娟。',
      '海上生明月，天涯共此时。',
      '月是故乡明，情是中秋浓。',
      '桂花飘香，月饼甜蜜，祝中秋团圆美满！',
      '花好月圆人团圆，中秋佳节共欢喜。',
      '举杯邀明月，千里寄相思。',
      '月圆之夜，愿所有美好如期而至。'
    ];

    function addCard(text) {
      var card = document.createElement('div');
      card.className = 'bi-card';
      card.style.animation = 'none';
      card.offsetHeight;
      card.style.animation = 'fadeInUp 0.5s ease';
      var now = new Date();
      var ts = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
      card.innerHTML = '<p class="bic-text">' + escapeHTML(text) + '</p><p class="bic-time">' + ts + '</p>';
      cardsContainer.insertBefore(card, cardsContainer.firstChild);
      // Keep max 9 cards
      if (cardsContainer.children.length > 9) {
        cardsContainer.removeChild(cardsContainer.lastChild);
      }
    }

    sendBtn.addEventListener('click', function() {
      var text = input.value.trim();
      if (!text) {
        text = quickWords[Math.floor(Math.random() * quickWords.length)];
        input.value = text;
      }
      addCard(text);
      input.value = '';
    });

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendBtn.click();
      }
    });
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ================================================================
     7. IntersectionObserver 增强：段落高亮线触发
     ================================================================ */
  function initHighlightLines() {
    var boxes = document.querySelectorAll('.highlight-box');
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.borderLeftColor = 'var(--moon-gold)';
        }
      });
    }, { threshold: 0.5 });
    boxes.forEach(function(b) { obs.observe(b); });
  }

  /* ================================================================
     10. 初始化所有
     ================================================================ */
  function init() {
    initTitleAnimation();
    initFoodCarousel();
    initInlineBlessing();
    initHighlightLines();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
