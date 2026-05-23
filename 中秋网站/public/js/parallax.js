/**
 * 中秋节专题网站 - 视差滚动效果
 * "月满中华·情系中秋"
 */
(function() {
  'use strict';

  var parallaxElements = document.querySelectorAll('[data-parallax]');

  if (parallaxElements.length === 0) return;

  var ticking = false;

  function updateParallax() {
    var scrollY = window.scrollY || window.pageYOffset;

    parallaxElements.forEach(function(el) {
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.5;
      var offset = scrollY * speed;
      el.style.transform = 'translate3d(0, ' + offset + 'px, 0)';
    });

    ticking = false;
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });

  // 初始化
  updateParallax();
})();
