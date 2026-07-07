/**
 * «Стикеры» в секции «путь кофе» — вместо одной статичной фотографии на
 * каждом из 5 шагов теперь крутится слайд-шоу из фото/видео (папки
 * assets/images/journey/{farms,selection,roasting,check,coffee} — по одной
 * на шаг 01..05), а клик открывает просмотр на весь экран с листанием,
 * как сторис в Instagram: полосы прогресса, тап по краям — соседний слайд,
 * стрелки по бокам (десктоп) — соседний шаг, свайп вниз — закрыть,
 * долгое нажатие — пауза.
 *
 * Список медиа отдаёт сервер (server.js, /api/journey-media) — он просто
 * сканирует папки, так что новые файлы подхватываются без правки кода.
 *
 * Оригинальные .j-photo элементы не удаляются, а получают новое содержимое:
 * так сохраняется их «приклеивание» (jStick keyframe в index.html) при
 * скролле — сам класс .j-photo и его позиционирование не трогаем.
 */
(function () {
  var STEP_META = [
    { folder: 'farms', num: '01', title: 'Плантации' },
    { folder: 'selection', num: '02', title: 'Ручной отбор' },
    { folder: 'roasting', num: '03', title: 'Раскрытие вкуса' },
    { folder: 'check', num: '04', title: 'Гарантия качества' },
    { folder: 'coffee', num: '05', title: 'Идеальная чашка' }
  ];
  var STICKER_CYCLE_MS = 3400;
  var STORY_IMAGE_MS = 4200;
  // общий наклон карточек «путь кофе» (rotate-[3.89deg] из бандла) —
  // используем для стикера №2, у которого рамка не была отдельным блоком
  var TILT = 3.89;

  var CSS = [
    /* содержимое стикера: медиа кроп-заполняет рамку, чуть увеличено и
       повернуто в противовес наклону самой карточки — фото остаётся
       «ровным», как в оригинальном дизайне полароидов */
    '.jst-stage { position: relative; width: 100%; height: 100%; border-radius: 14px; overflow: hidden; background: #1a1a1a; cursor: pointer; }',
    '.jst-media-wrap { position: absolute; inset: -10%; width: 120%; height: 120%; transform: rotate(' + (-TILT) + 'deg); }',
    '.jst-slide { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity .5s ease; }',
    '.jst-slide.is-on { opacity: 1; }',
    '.jst-dots { position: absolute; bottom: 8px; left: 0; right: 0; display: flex; justify-content: center; gap: 4px; z-index: 2; }',
    '.jst-dots i { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.5); transition: background .25s ease, transform .25s ease; }',
    '.jst-dots i.is-on { background: #fff; transform: scale(1.35); }',
    '.jst-play { position: absolute; top: 50%; left: 50%; z-index: 2; width: 32px; height: 32px; transform: translate(-50%, -50%); border-radius: 50%; background: rgba(0,0,0,.4); pointer-events: none; }',
    '.jst-play::before { content: ""; position: absolute; top: 50%; left: 56%; transform: translate(-50%, -50%); border: 7px solid transparent; border-left: 10px solid #fff; border-right: none; }',

    /* полноэкранный просмотр */
    '.jsv-overlay { position: fixed; inset: 0; z-index: 999; display: flex; align-items: center; justify-content: center; background: rgba(10, 8, 4, .92); opacity: 0; visibility: hidden; transition: opacity .25s ease; }',
    '.jsv-overlay.is-open { opacity: 1; visibility: visible; }',
    '.jsv-frame { position: relative; width: min(92vw, 420px); height: min(90vh, 746px); border-radius: 18px; overflow: hidden; background: #000; box-shadow: 0 30px 80px rgba(0,0,0,.5); touch-action: none; }',
    '.jsv-media { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: #000; }',
    '.jsv-empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 0 40px; text-align: center; color: rgba(255,255,255,.7); font-family: "Geologica", Helvetica, sans-serif; font-size: 15px; font-weight: 300; line-height: 1.5; }',
    '.jsv-bars { position: absolute; top: 10px; left: 10px; right: 10px; z-index: 3; display: flex; gap: 5px; }',
    '.jsv-bars i { flex: 1; height: 3px; border-radius: 2px; background: rgba(255,255,255,.3); overflow: hidden; }',
    '.jsv-bars i b { display: block; height: 100%; width: 0; background: #fff; }',
    ".jsv-head { position: absolute; top: 24px; left: 14px; right: 52px; z-index: 3; display: flex; align-items: center; gap: 10px; font-family: 'Geologica', Helvetica, sans-serif; }",
    '.jsv-head i { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: #074e2f; border: 2px solid #fff; box-sizing: border-box; flex-shrink: 0; }',
    '.jsv-head i img { width: 14px; filter: brightness(0) invert(1); }',
    '.jsv-head b { font-size: 14px; font-weight: 700; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,.4); white-space: nowrap; }',
    '.jsv-close { position: absolute; top: 20px; right: 14px; z-index: 4; width: 32px; height: 32px; border: none; background: rgba(255,255,255,.16); border-radius: 50%; color: #fff; font-size: 16px; line-height: 1; cursor: pointer; }',
    '.jsv-zone { position: absolute; top: 0; bottom: 0; width: 34%; z-index: 3; cursor: pointer; }',
    '.jsv-zone.prev { left: 0; } .jsv-zone.next { right: 0; }',
    '.jsv-edge { position: absolute; top: 50%; z-index: 900; width: 42px; height: 42px; margin-top: -21px; border: none; border-radius: 50%; background: rgba(255,255,255,.14); color: #fff; font-size: 20px; cursor: pointer; transition: background .2s ease; }',
    '.jsv-edge:hover { background: rgba(255,255,255,.26); }',
    '.jsv-edge.l { left: calc(50% - min(46vw, 210px) - 54px); } .jsv-edge.r { right: calc(50% - min(46vw, 210px) - 54px); }',
    '@media (max-width: 900px) { .jsv-edge { display: none; } }'
  ].join('\n');

  function tag(name, cls, attrs) {
    var el = document.createElement(name);
    if (cls) el.className = cls;
    if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  /* ============== стикер внутри карточки (мини-превью) ============== */
  function buildSticker(list, onOpen) {
    var stage = tag('div', 'jst-stage');
    var mediaWrap = tag('div', 'jst-media-wrap');
    stage.appendChild(mediaWrap);

    var slides = list.map(function (m, i) {
      var el = m.type === 'video'
        ? tag('video', 'jst-slide', { src: m.url, muted: '', loop: '', playsinline: '', preload: 'metadata' })
        : tag('img', 'jst-slide', { src: m.url, alt: '' });
      el.muted = true;
      if (i === 0) el.classList.add('is-on');
      mediaWrap.appendChild(el);
      return el;
    });

    var playBadge = tag('div', 'jst-play');
    stage.appendChild(playBadge);

    var dots = null;
    if (list.length > 1) {
      dots = tag('div', 'jst-dots');
      list.forEach(function (_, i) {
        var d = tag('i');
        if (i === 0) d.classList.add('is-on');
        dots.appendChild(d);
      });
      stage.appendChild(dots);
    }

    var idx = 0, timer = null;
    function updateBadge() { playBadge.style.display = list[idx].type === 'video' ? '' : 'none'; }
    updateBadge();

    function goto(i) {
      slides[idx].classList.remove('is-on');
      if (slides[idx].tagName === 'VIDEO') slides[idx].pause();
      if (dots) dots.children[idx].classList.remove('is-on');
      idx = (i + list.length) % list.length;
      slides[idx].classList.add('is-on');
      if (dots) dots.children[idx].classList.add('is-on');
      if (slides[idx].tagName === 'VIDEO') {
        slides[idx].currentTime = 0;
        slides[idx].play().catch(function () {});
      }
      updateBadge();
    }
    function start() { stop(); if (list.length > 1) timer = setInterval(function () { goto(idx + 1); }, STICKER_CYCLE_MS); }
    function stop() { clearInterval(timer); timer = null; }

    if (slides[0].tagName === 'VIDEO') slides[0].play().catch(function () {});
    start();

    stage.addEventListener('mouseenter', stop);
    stage.addEventListener('mouseleave', start);
    stage.addEventListener('click', function () { onOpen(idx); });

    return stage;
  }

  /* ============== полноэкранный просмотрщик (один на всю страницу) ============== */
  function buildViewer(MEDIA) {
    var overlay = tag('div', 'jsv-overlay');
    var edgeL = tag('button', 'jsv-edge l', { type: 'button', 'aria-label': 'Предыдущий этап' });
    edgeL.textContent = '‹';
    var edgeR = tag('button', 'jsv-edge r', { type: 'button', 'aria-label': 'Следующий этап' });
    edgeR.textContent = '›';
    var frame = tag('div', 'jsv-frame');
    var bars = tag('div', 'jsv-bars');
    var head = tag('div', 'jsv-head');
    head.innerHTML = '<i><img src="/assets/images/logo-no-text.svg" alt=""></i><b></b>';
    var closeBtn = tag('button', 'jsv-close', { type: 'button', 'aria-label': 'Закрыть' });
    closeBtn.innerHTML = '&#10005;';
    var mediaHolder = tag('div', 'jsv-media-holder');
    var zonePrev = tag('div', 'jsv-zone prev');
    var zoneNext = tag('div', 'jsv-zone next');

    frame.append(mediaHolder, bars, head, closeBtn, zonePrev, zoneNext);
    overlay.append(edgeL, frame, edgeR);
    document.body.appendChild(overlay);

    var state = { stepIdx: 0, mediaIdx: 0, list: [], videoEl: null, imgTimer: null, rafId: null,
      currentBar: null, imgDeadline: 0, paused: false, imgRemainingAtPause: STORY_IMAGE_MS };

    function onVideoEnded() { next(); }

    function clearMediaTimers() {
      if (state.imgTimer) { clearTimeout(state.imgTimer); state.imgTimer = null; }
      if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = null; }
      if (state.videoEl) { state.videoEl.pause(); state.videoEl.removeEventListener('ended', onVideoEnded); state.videoEl = null; }
    }

    function renderBars() {
      bars.innerHTML = '';
      state.list.forEach(function () { var i = tag('i'); i.appendChild(tag('b')); bars.appendChild(i); });
    }
    function markBarsDone(idx) {
      Array.prototype.forEach.call(bars.children, function (el, i) {
        var b = el.firstChild;
        if (i < idx) b.style.width = '100%';
        else if (i > idx) b.style.width = '0%';
      });
    }
    function setBarProgress(i, ratio) {
      var b = bars.children[i] && bars.children[i].firstChild;
      if (b) b.style.width = Math.max(0, Math.min(1, ratio)) * 100 + '%';
    }

    function beginImgTimer(remaining) {
      var bar = state.currentBar;
      bar.style.transition = 'none';
      void bar.offsetWidth;
      bar.style.transition = 'width ' + remaining + 'ms linear';
      bar.style.width = '100%';
      state.imgDeadline = performance.now() + remaining;
      state.imgTimer = setTimeout(next, remaining);
    }

    function showMedia(i) {
      clearMediaTimers();
      mediaHolder.innerHTML = '';
      state.paused = false;
      var item = state.list[i];
      markBarsDone(i);
      state.currentBar = bars.children[i].firstChild;
      state.currentBar.style.transition = 'none';
      state.currentBar.style.width = '0%';
      void state.currentBar.offsetWidth;
      if (item.type === 'video') {
        var v = tag('video', 'jsv-media', { src: item.url, playsinline: '' });
        mediaHolder.appendChild(v);
        state.videoEl = v;
        v.addEventListener('ended', onVideoEnded);
        v.play().catch(function () {});
        (function loop() {
          if (v.duration && !isNaN(v.duration)) setBarProgress(i, v.currentTime / v.duration);
          state.rafId = requestAnimationFrame(loop);
        })();
      } else {
        mediaHolder.appendChild(tag('img', 'jsv-media', { src: item.url, alt: '' }));
        beginImgTimer(STORY_IMAGE_MS);
      }
    }

    function openStep(stepIdx, mediaIdx) {
      state.stepIdx = stepIdx;
      var step = STEP_META[stepIdx];
      state.list = MEDIA[step.folder] || [];
      head.querySelector('b').textContent = step.num + ' · ' + step.title;
      renderBars();
      if (!state.list.length) {
        clearMediaTimers();
        mediaHolder.innerHTML = '<div class="jsv-empty">Материалы для этого этапа скоро появятся</div>';
        return;
      }
      state.mediaIdx = Math.min(mediaIdx || 0, state.list.length - 1);
      showMedia(state.mediaIdx);
    }

    function next() {
      if (state.mediaIdx + 1 < state.list.length) { state.mediaIdx++; showMedia(state.mediaIdx); }
      else nextStep();
    }
    function prev() {
      if (state.mediaIdx - 1 >= 0) { state.mediaIdx--; showMedia(state.mediaIdx); }
      else prevStep();
    }
    function nextStep() {
      if (state.stepIdx + 1 < STEP_META.length) openStep(state.stepIdx + 1, 0); else close();
    }
    function prevStep() {
      if (state.stepIdx - 1 >= 0) openStep(state.stepIdx - 1, 0);
    }

    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    }

    function open(stepIdx, mediaIdx) {
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      openStep(stepIdx, mediaIdx);
      document.addEventListener('keydown', onKey);
    }
    function close() {
      clearMediaTimers();
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    }

    /* долгое нажатие — пауза (без сброса прогресса), короткое — навигация */
    function pauseCurrent() {
      state.paused = true;
      if (state.videoEl) { state.videoEl.pause(); return; }
      if (state.imgTimer) {
        clearTimeout(state.imgTimer); state.imgTimer = null;
        state.currentBar.style.width = getComputedStyle(state.currentBar).width;
        state.currentBar.style.transition = 'none';
        state.imgRemainingAtPause = Math.max(0, state.imgDeadline - performance.now());
      }
    }
    function resumeCurrent() {
      if (!state.paused) return;
      state.paused = false;
      if (state.videoEl) { state.videoEl.play().catch(function () {}); return; }
      beginImgTimer(Math.max(300, state.imgRemainingAtPause));
    }

    var holdTimer = null, didHold = false;
    frame.addEventListener('pointerdown', function (e) {
      if (e.target === closeBtn) return;
      didHold = false;
      holdTimer = setTimeout(function () { didHold = true; pauseCurrent(); }, 170);
    });
    function endHold() {
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
      if (didHold) resumeCurrent();
    }
    frame.addEventListener('pointerup', endHold);
    frame.addEventListener('pointerleave', endHold);

    zonePrev.addEventListener('click', function () { if (didHold) { didHold = false; return; } prev(); });
    zoneNext.addEventListener('click', function () { if (didHold) { didHold = false; return; } next(); });
    edgeL.addEventListener('click', prevStep);
    edgeR.addEventListener('click', nextStep);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    /* свайп вниз — закрыть, как в сторис */
    var dragY = null;
    frame.addEventListener('touchstart', function (e) { dragY = e.touches[0].clientY; }, { passive: true });
    frame.addEventListener('touchmove', function (e) {
      if (dragY == null) return;
      var dy = e.touches[0].clientY - dragY;
      if (dy > 0) frame.style.transform = 'translateY(' + dy + 'px)';
    }, { passive: true });
    frame.addEventListener('touchend', function (e) {
      var dy = (e.changedTouches[0].clientY - dragY) || 0;
      frame.style.transform = '';
      if (dy > 90) close();
      dragY = null;
    });

    return { open: open };
  }

  /* ============== поиск стикеров на странице и монтаж ============== */
  function findStepPhotos() {
    var sec = null;
    document.querySelectorAll('#main-container > section').forEach(function (s) {
      if (!sec && (s.className || '').toString().indexOf('top-[2092px]') !== -1) sec = s;
    });
    if (!sec) return null;
    var map = {};
    sec.querySelectorAll(':scope > section').forEach(function (st) {
      var h2 = st.querySelector('h2');
      var m = (st.textContent || '').match(/^\s*(0[1-5])/);
      if (h2 && m) {
        var photo = st.querySelector('.j-photo');
        if (photo) map[parseInt(m[1], 10)] = photo;
      }
    });
    return Object.keys(map).length ? map : null;
  }

  function mount(photoMap, MEDIA, viewer) {
    STEP_META.forEach(function (step, i) {
      var el = photoMap[i + 1];
      var list = MEDIA[step.folder];
      if (!el || !list || !list.length) return;

      if (el.tagName === 'IMG') {
        // шаг 02: рамки раньше не было — рисуем её, приводя стикер
        // к общему виду остальных четырёх (белая карточка, наклон, тень)
        var wrap = tag('div', el.className + ' j-photo');
        wrap.style.cssText =
          'display:flex;align-items:center;justify-content:center;padding:4px;' +
          'background:#fffdf6;border-radius:16px;overflow:hidden;' +
          'transform:rotate(' + TILT + 'deg);box-shadow:0 0 10px #f4e5cd;';
        el.replaceWith(wrap);
        wrap.appendChild(buildSticker(list, function (mediaIdx) { viewer.open(i, mediaIdx); }));
      } else {
        el.innerHTML = '';
        el.appendChild(buildSticker(list, function (mediaIdx) { viewer.open(i, mediaIdx); }));
      }
    });
  }

  function boot() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var mediaPromise = fetch('/api/journey-media').then(function (r) { return r.json(); })
      .catch(function () { return {}; });

    var tries = 0;
    (function poll() {
      var photoMap = findStepPhotos();
      if (photoMap || ++tries > 60) {
        if (photoMap) {
          mediaPromise.then(function (MEDIA) {
            var viewer = buildViewer(MEDIA);
            mount(photoMap, MEDIA, viewer);
          });
        }
        return;
      }
      setTimeout(poll, 250);
    })();
  }

  boot();
})();
