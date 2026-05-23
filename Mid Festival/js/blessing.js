/**
 * 中秋节专题网站 - 祝福寄语互动脚本
 * "月满中华·情系中秋"
 * 孔明灯放飞 | 祝福墙 | 随机祝福
 */
(function() {
  'use strict';

  var blessingCount = 4; // 初始4条默认祝福
  var lanternTotal = 0;

  // 随机祝福语库
  var quickBlessings = [
    '愿月圆人团圆，中秋快乐，阖家幸福！',
    '但愿人长久，千里共婵娟。祝中秋安康！',
    '海上生明月，天涯共此时。中秋快乐！',
    '月是故乡明，情是中秋浓。祝福满满！',
    '桂花飘香，月饼甜蜜，祝中秋团圆美满！',
    '月到中秋分外明，我把祝福寄月宫。',
    '举杯邀明月，千里寄相思。中秋快乐！',
    '愿每一个家庭都团圆美满，中秋节快乐！',
    '今夕何夕，见此明月。愿君安康，岁岁年年。',
    '月圆之夜，愿所有美好如期而至。',
    '花好月圆人团圆，中秋佳节共欢喜。',
    '明月本无价，高山皆有情。中秋快乐！',
    '月是今夜明，情是今宵浓。祝您中秋快乐！',
    '万里无云镜九州，最团圆夜是中秋。',
    '秋已至，一缕桂香；醉芬芳，月上中秋。',
  ];

  /* ========== 孔明灯放飞动画 ========== */
  function launchLantern(text) {
    var layer = document.getElementById('lanternLayer');
    if (!layer) return;

    var lantern = document.createElement('div');
    lantern.className = 'flying-lantern';
    lantern.textContent = '🏮';
    lantern.style.left = (Math.random() * 60 + 20) + '%';
    lantern.style.bottom = '-50px';
    lantern.style.animationDuration = (Math.random() * 4 + 6) + 's';
    lantern.title = text;

    layer.appendChild(lantern);

    lanternTotal++;
    updateStats();

    // 动画结束后清除
    setTimeout(function() {
      if (lantern.parentNode) {
        lantern.parentNode.removeChild(lantern);
      }
    }, 9000);
  }

  /* ========== 发送祝福 ========== */
  window.sendBlessing = function() {
    var textarea = document.getElementById('blessingText');
    if (!textarea) return;

    var text = textarea.value.trim();
    if (!text) {
      textarea.style.borderColor = '#e8734a';
      textarea.placeholder = '请先写下您的祝福再放飞哦~';
      setTimeout(function() {
        textarea.style.borderColor = '';
        textarea.placeholder = '写下你的中秋祝福……';
      }, 2000);
      return;
    }

    addBlessingCard(text);
    launchLantern(text);
    textarea.value = '';
    blessingCount++;
    updateStats();
  };

  /* ========== 随机祝福 ========== */
  window.sendQuickBlessing = function() {
    var idx = Math.floor(Math.random() * quickBlessings.length);
    var text = quickBlessings[idx];
    var textarea = document.getElementById('blessingText');
    if (textarea) {
      textarea.value = text;
    }
    addBlessingCard(text);
    launchLantern(text);
    blessingCount++;
    updateStats();
  };

  /* ========== 添加祝福卡片到祝福墙 ========== */
  function addBlessingCard(text) {
    var wall = document.getElementById('blessingWall');
    if (!wall) return;

    var card = document.createElement('div');
    card.className = 'blessing-card';
    card.style.animation = 'none';
    card.offsetHeight; // 触发回流
    card.style.animation = '';

    var now = new Date();
    var timeStr = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0');

    card.innerHTML = '<p class="bc-text">' + escapeHTML(text) + '</p>' +
      '<p class="bc-time">' + timeStr + '</p>';

    wall.insertBefore(card, wall.firstChild);
  }

  /* ========== 更新统计数据 ========== */
  function updateStats() {
    var bc = document.getElementById('blessingCount');
    var lc = document.getElementById('lanternCount');
    if (bc) bc.textContent = blessingCount;
    if (lc) lc.textContent = lanternTotal;
  }

  /* ========== HTML 转义 ========== */
  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ========== 初始化 ========== */
  function init() {
    updateStats();

    // 回车发送
    var textarea = document.getElementById('blessingText');
    if (textarea) {
      textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          window.sendBlessing();
        }
      });
    }

    // 定时自动放飞孔明灯（背景效果）
    setInterval(function() {
      if (lanternTotal < 30) {
        var idx = Math.floor(Math.random() * quickBlessings.length);
        launchLantern(quickBlessings[idx]);
      }
    }, 8000);
  }

  init();
})();
