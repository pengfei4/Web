/**
 * 节日起源页面 - 直线轴时间轴脚本 (v3)
 * 滚动驱动SVG直线轴绘制 | 时代背景切换 | 卡片折叠/伸展
 */
(function() {
  'use strict';

  /* ================================================================
     1. SVG 直线轴路径动态生成
     直线轴固定在水平中央，从第一张卡片顶部延伸至最后一张卡片底部
     同时存储 pathStartY / pathEndY 供滚动绘制使用，确保坐标系一致
     ================================================================ */
  var axisPathStartY = 0;
  var axisPathEndY = 0;
  var axisSvgHeight = 0;

  function generateAxisPath() {
    var cards = document.querySelectorAll('.era-card');
    var svg = document.querySelector('.era-axis-svg');
    if (!svg || cards.length === 0) return;

    var wrapper = document.querySelector('.era-timeline-wrapper');
    var wrapperRect = wrapper.getBoundingClientRect();
    var wrapperTop = wrapperRect.top + window.scrollY;

    // 第一个卡片的顶部和最后一个卡片的底部
    var firstCard = cards[0];
    var lastCard = cards[cards.length - 1];
    var firstRect = firstCard.getBoundingClientRect();
    var lastRect = lastCard.getBoundingClientRect();

    var firstCardTopY = firstRect.top + window.scrollY - wrapperTop;
    var lastCardBottomY = lastRect.bottom + window.scrollY - wrapperTop;
    var svgHeight = lastCardBottomY + 60;

    // 存储参照坐标，供 updateDraw 使用，确保与 SVG 坐标系严格一致
    axisPathStartY = firstCardTopY;
    axisPathEndY = lastCardBottomY;
    axisSvgHeight = svgHeight;

    svg.setAttribute('viewBox', '0 0 1100 ' + svgHeight);
    svg.style.height = svgHeight + 'px';

    var centerX = 550; // viewBox 水平中心

    // 重置穿针数据
    cardPierceData = [];

    // 记录每张卡片的针眼位置（直线轴上 X 恒为中心）
    cards.forEach(function(card) {
      var cardRect = card.getBoundingClientRect();
      var cardTop = cardRect.top + window.scrollY - wrapperTop;
      var cardMidY = cardTop + cardRect.height / 2;

      cardPierceData.push({
        card: card,
        needleY: cardMidY,
        needleX: centerX
      });
    });

    // 构建直线轴路径：起点精确对齐第一张卡片上边缘，终点精确对齐最后一张卡片下边缘
    var pathStartY = firstCardTopY;
    var pathEndY = lastCardBottomY;
    var pathD = 'M ' + centerX + ' ' + pathStartY + ' L ' + centerX + ' ' + pathEndY;

    // 更新SVG路径
    var axisLine = svg.querySelector('.axis-line');
    var axisGlow = svg.querySelector('.axis-glow');
    if (axisLine) axisLine.setAttribute('d', pathD);
    if (axisGlow) axisGlow.setAttribute('d', pathD);

    // 获取路径总长度
    if (axisLine && axisLine.getTotalLength) {
      var totalLength = axisLine.getTotalLength();
      axisLine.style.strokeDasharray = totalLength;
      axisLine.style.strokeDashoffset = totalLength;
      if (axisGlow) {
        axisGlow.style.strokeDasharray = totalLength;
        axisGlow.style.strokeDashoffset = totalLength;
      }
      axisLine._totalLength = totalLength;
      if (axisGlow) axisGlow._totalLength = totalLength;
    }
  }

  /* ================================================================
     2. 滚动驱动SVG绘制（视口中心交点模式）+ 卡片折叠/伸展
     每帧读取卡片实时位置，当卡片展开导致布局变化时动态更新
     SVG 路径、viewBox 和针眼坐标，确保直线轴始终延伸到最后一个卡片底部
     ================================================================ */
  var cardPierceData = []; // { card, needleY } — 动态更新

  function initScrollDraw() {
    var svg = document.querySelector('.era-axis-svg');
    var axisLine = svg.querySelector('.axis-line');
    var axisGlow = svg.querySelector('.axis-glow');
    if (!axisLine) return;

    var wrapper = document.querySelector('.era-timeline-wrapper');
    var ticking = false;

    function updateDraw() {
      var wrapperRect = wrapper.getBoundingClientRect();
      var wrapperTop = wrapperRect.top + window.scrollY;
      var windowH = window.innerHeight;

      var viewportCenterY = window.scrollY + windowH / 2;
      var svgY = viewportCenterY - wrapperTop;

      // ---- 读取所有卡片实时位置 ----
      var cards = document.querySelectorAll('.era-card');
      if (cards.length === 0) return;
      var firstCard = cards[0];
      var lastCard = cards[cards.length - 1];
      var firstRect = firstCard.getBoundingClientRect();
      var lastRect = lastCard.getBoundingClientRect();

      var liveFirstCardTopY = firstRect.top + window.scrollY - wrapperTop;
      var liveLastCardBottomY = lastRect.bottom + window.scrollY - wrapperTop;

      // ---- 检测布局是否因卡片展开而变化 ----
      if (liveLastCardBottomY !== axisPathEndY || liveFirstCardTopY !== axisPathStartY) {
        axisPathStartY = liveFirstCardTopY;
        axisPathEndY = liveLastCardBottomY;
        var newSvgHeight = liveLastCardBottomY + 60;
        axisSvgHeight = newSvgHeight;

        // 更新 SVG viewBox 与高度
        svg.setAttribute('viewBox', '0 0 1100 ' + newSvgHeight);
        svg.style.height = newSvgHeight + 'px';

        // 更新直线轴路径（起点=第一张卡片上边缘，终点=最后一张卡片下边缘）
        var pathD = 'M 550 ' + liveFirstCardTopY + ' L 550 ' + liveLastCardBottomY;
        axisLine.setAttribute('d', pathD);
        if (axisGlow) axisGlow.setAttribute('d', pathD);

        // 重新计算总长度与 dasharray
        var newTotalLen = axisLine.getTotalLength();
        axisLine.style.strokeDasharray = newTotalLen;
        axisLine._totalLength = newTotalLen;
        if (axisGlow) {
          axisGlow.style.strokeDasharray = newTotalLen;
          axisGlow._totalLength = newTotalLen;
        }

        // 更新每张卡片的针眼坐标
        cardPierceData = [];
        cards.forEach(function(card) {
          var cardRect = card.getBoundingClientRect();
          var cardTop = cardRect.top + window.scrollY - wrapperTop;
          var cardMidY = cardTop + cardRect.height / 2;
          cardPierceData.push({ card: card, needleY: cardMidY, needleX: 550 });
        });
      }

      // ---- 使用实时坐标计算滚动进度 ----
      var pathRange = liveLastCardBottomY - liveFirstCardTopY;
      if (pathRange <= 0) pathRange = 1;
      var progress = (svgY - liveFirstCardTopY) / pathRange;
      progress = Math.max(0, Math.min(1, progress));

      var totalLen = axisLine._totalLength || 3000;
      var offset = totalLen * (1 - progress);
      axisLine.style.strokeDashoffset = offset;
      if (axisGlow) axisGlow.style.strokeDashoffset = offset;

      // ---- 卡片折叠/伸展判断 ----
      var triggerAdvance = 60;
      cardPierceData.forEach(function(item) {
        if (svgY >= item.needleY - triggerAdvance) {
          item.card.classList.add('pierced');
          item.card.classList.remove('collapsed');
        } else {
          item.card.classList.add('collapsed');
          item.card.classList.remove('pierced');
        }
      });
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          updateDraw();
          ticking = false;
        });
        ticking = true;
      }
    });

    // 初始调用
    updateDraw();
  }

  /* ================================================================
     3. 时代背景切换 + 卡片激活
     ================================================================ */
  function initEraBackgroundSwitch() {
    var cards = document.querySelectorAll('.era-card');
    if (cards.length === 0) return;

    var eraClasses = ['era-ancient', 'era-han', 'era-weijin', 'era-tang', 'era-song', 'era-yuan', 'era-ming', 'era-qing', 'era-recent', 'era-modern'];

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          var eraClass = entry.target.getAttribute('data-era');
          if (eraClass) {
            eraClasses.forEach(function(cls) { document.body.classList.remove(cls); });
            document.body.classList.add(eraClass);
          }
        }
      });
    }, { threshold: 0.35, rootMargin: '-10% 0px -30% 0px' });

    cards.forEach(function(card) { observer.observe(card); });
  }

  /* ================================================================
     4. 初始化
     ================================================================ */
  function init() {
    // 将每张卡片中的描述和引用内容包裹进折叠容器
    var cards = document.querySelectorAll('.era-card');
    cards.forEach(function(card) {
      // 避免重复包裹
      if (card.querySelector('.era-collapsible')) return;

      var wrapper = document.createElement('div');
      wrapper.className = 'era-collapsible';

      // 收集需要折叠的内容：.era-desc + .era-quote
      var desc = card.querySelector('.era-desc');
      var quotes = card.querySelectorAll('.era-quote');

      if (desc) {
        card.insertBefore(wrapper, desc);
        wrapper.appendChild(desc);
      }
      quotes.forEach(function(q) { wrapper.appendChild(q); });

      // 初始折叠态
      card.classList.add('collapsed');
    });

    generateAxisPath();
    initScrollDraw();
    initEraBackgroundSwitch();
  }

  // 延长延迟确保布局完全稳定（修复 Bug5）
  if (document.readyState === 'loading') {
    window.addEventListener('load', function() {
      setTimeout(init, 500);
    });
  } else {
    // 页面已加载，仍需等待渲染
    setTimeout(init, 500);
  }

  // resize 重建路径
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      generateAxisPath();
      // 重建后重新获取长度
      var axisLine = document.querySelector('.axis-line');
      if (axisLine && axisLine.getTotalLength) {
        var len = axisLine.getTotalLength();
        axisLine.style.strokeDasharray = len;
        axisLine._totalLength = len;
        var glow = document.querySelector('.axis-glow');
        if (glow) { glow.style.strokeDasharray = len; glow._totalLength = len; }
      }
    }, 400);
  });

})();
