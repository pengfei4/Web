/**
 * 中秋节专题网站 - 祝福寄语互动脚本
 * "月满中华·情系中秋"
 * 孔明灯放飞 | 祝福墙 | 随机祝福 | API 持久化
 */
(function() {
  'use strict';

  var blessingCount = 0;
  var lanternTotal = 0;
  var apiAvailable = false;

  // 内置随机祝福语库（API 不可用时的后备）
  var fallbackBlessings = [
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

  var quickBlessings = fallbackBlessings.slice();

  /* ========== API 请求封装 ========== */
  function apiGet(url) {
    return fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function(r) {
        if (!r.ok) throw new Error('API error: ' + r.status);
        return r.json();
      });
  }

  function apiPost(url, data) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(r) {
      if (!r.ok) throw new Error('API error: ' + r.status);
      return r.json();
    });
  }

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

    setTimeout(function() {
      if (lantern.parentNode) lantern.parentNode.removeChild(lantern);
    }, 9000);
  }

  /* ========== 添加祝福卡片到祝福墙 ========== */
  function addBlessingCard(text, author, time) {
    var wall = document.getElementById('blessingWall');
    if (!wall) return;

    var card = document.createElement('div');
    card.className = 'blessing-card';
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = '';

    card.innerHTML = '<p class="bc-text">' + escapeHTML(text) + '</p>' +
      '<p class="bc-time">' + escapeHTML(author || '匿名') + ' · ' + escapeHTML(time || '刚刚') + '</p>';

    wall.insertBefore(card, wall.firstChild);
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

    if (apiAvailable) {
      apiPost('/api/blessings', { text: text, author: '匿名' }).then(function(data) {
        if (data.success) {
          addBlessingCard(text, '匿名', '刚刚');
          launchLantern(text);
          blessingCount = data.count || (blessingCount + 1);
          updateStats();
        }
      }).catch(function() {
        addBlessingCard(text, '匿名', '刚刚');
        launchLantern(text);
        blessingCount++;
        updateStats();
      });
    } else {
      addBlessingCard(text, '匿名', '刚刚');
      launchLantern(text);
      blessingCount++;
      updateStats();
    }

    textarea.value = '';
  };

  /* ========== 随机祝福 ========== */
  window.sendQuickBlessing = function() {
    var idx = Math.floor(Math.random() * quickBlessings.length);
    var text = quickBlessings[idx];
    var textarea = document.getElementById('blessingText');
    if (textarea) textarea.value = text;

    if (apiAvailable) {
      apiPost('/api/blessings', { text: text, author: '中秋祝福' }).then(function(data) {
        if (data.success) {
          addBlessingCard(text, '中秋祝福', '刚刚');
          launchLantern(text);
          blessingCount = data.count || (blessingCount + 1);
          updateStats();
        }
      }).catch(function() {
        addBlessingCard(text, '中秋祝福', '刚刚');
        launchLantern(text);
        blessingCount++;
        updateStats();
      });
    } else {
      addBlessingCard(text, '中秋祝福', '刚刚');
      launchLantern(text);
      blessingCount++;
      updateStats();
    }
  };

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

  /* ========== 从 API 加载初始数据 ========== */
  function loadFromAPI() {
    return Promise.all([
      apiGet('/api/blessings'),
      apiGet('/api/blessings/stats'),
      apiGet('/api/quick-blessings')
    ]).then(function(results) {
      var blessings = results[0];
      var stats = results[1];
      var qbList = results[2];

      apiAvailable = true;
      blessingCount = stats.blessingCount || 0;

      if (qbList && qbList.length > 0) {
        quickBlessings = qbList.map(function(b) { return b.text; });
      }

      var wall = document.getElementById('blessingWall');
      if (wall) wall.innerHTML = '';

      if (blessings && blessings.length > 0) {
        blessings.forEach(function(b) {
          addBlessingCard(b.text, b.author, b.created_at);
        });
      } else {
        var defaults = [
          { text: '但愿人长久，千里共婵娟。祝所有远方的亲人中秋快乐，平安幸福！', author: '中秋寄语', time: '' },
          { text: '月圆人团圆，祝大家中秋快乐，阖家幸福，万事如意！', author: '中秋寄语', time: '' },
          { text: '海上生明月，天涯共此时。无论身在何方，我们共赏同一轮明月。', author: '中秋寄语', time: '' },
          { text: '愿月光照亮每一个思乡的夜晚，愿团圆温暖每一颗漂泊的心。', author: '中秋寄语', time: '' }
        ];
        defaults.forEach(function(d) { addBlessingCard(d.text, d.author, d.time); });
        blessingCount = defaults.length;
      }

      updateStats();
    });
  }

  /* ========== 初始化 ========== */
  function init() {
    loadFromAPI().catch(function() {
      apiAvailable = false;
      blessingCount = 4;
      updateStats();
    });

    var textarea = document.getElementById('blessingText');
    if (textarea) {
      textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          window.sendBlessing();
        }
      });
    }

    setInterval(function() {
      if (lanternTotal < 30) {
        var idx = Math.floor(Math.random() * quickBlessings.length);
        launchLantern(quickBlessings[idx]);
      }
    }, 8000);
  }

  init();
})();
