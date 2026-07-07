/**
 * Секция «Новости» — две ленты в стиле Instagram Stories.
 *
 * Контент подхватывается автоматически: сервер (server.js, эндпоинт /api/news)
 * сканирует папки assets/images/news/main и assets/images/news/karaganda.
 * Кладёте туда фото или видео — они появляются в секции, свежие первыми,
 * имя файла становится подписью («svezhaya-obzharka.mp4» → «svezhaya obzharka»).
 * Показывается до 3 последних постов на канал; видео проигрывается при наведении.
 *
 * Слот «просто новость» — объект NEWS ниже, редактируется руками.
 *
 * Врезается между секцией заявки (request.js) и футером (footer.js):
 * ждёт .req-section, footer.js ждёт .news-section.
 */
(function () {
  var SECTION_HEIGHT = 860;
  var MAX_POSTS = 3; // карточек в общей ленте (оба канала вместе, свежие первыми)

  var CHANNELS = {
    main: {
      handle: 'serikovcoffeecompany',
      url: 'https://www.instagram.com/serikovcoffeecompany/',
      label: 'Основной канал'
    },
    karaganda: {
      handle: 'serikov_club_karaganda',
      url: 'https://www.instagram.com/serikov_club_karaganda/',
      label: 'Караганда'
    }
  };

  // слот для любой новости — просто текст, меняется здесь
  var NEWS = {
    date: '6 июля 2026',
    tag: 'Новость',
    title: 'Выходной в честь Дня столицы',
    text: 'Сегодня обжарочный цех и доставка отдыхают — поздравляем всех с праздником! Заявки, оставленные на сайте, обработаем завтра с самого утра, с первой чашкой кофе.'
  };

  var CSS = [
    '.news-section { position: absolute; left: calc(50% - 680px); width: 1360px; height: ' + SECTION_HEIGHT + "px; font-family: 'Geologica', Helvetica, sans-serif; }",
    '.news-head { display: flex; align-items: flex-end; justify-content: space-between; margin: 70px 40px 0; }',
    '.news-title { margin: 0; font-size: 52px; font-weight: 900; letter-spacing: 1px; color: #1a1a1a; }',
    '.news-title em { font-style: normal; color: #116c42; }',
    '.news-sub { margin: 10px 0 0; font-size: 17px; font-weight: 300; color: #555; }',
    /* шапки каналов: аватары в градиентных кольцах + ники, в одну строку */
    '.news-chans { display: flex; gap: 34px; margin: 40px 40px 20px; }',
    '.news-chan { display: flex; align-items: center; gap: 10px; }',
    '.news-chan .news-ava { width: 36px; height: 36px; }',
    '.news-chan a { font-size: 17px; font-weight: 700; color: #1a1a1a; text-decoration: none; }',
    '.news-chan a:hover { color: #116c42; }',

    '.news-row { display: flex; gap: 32px; align-items: stretch; margin: 0 40px; }',

    /* сториз-карточка: телефонная пропорция, кольцо, прогресс-бары */
    '.news-story { position: relative; display: block; width: 268px; height: 476px; border-radius: 26px; overflow: hidden; text-decoration: none; background: #074e2f; box-shadow: 0 18px 40px rgba(60, 35, 10, .18); transition: transform .3s cubic-bezier(.22, 1, .36, 1), box-shadow .3s ease; }',
    '.news-story:hover { transform: translateY(-10px) rotate(-1deg); box-shadow: 0 28px 55px rgba(60, 35, 10, .28); }',
    '.news-story .news-media { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }',
    '.news-story::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.35) 0%, transparent 22%, transparent 62%, rgba(0,0,0,.55) 100%); }',
    '.news-bars { position: absolute; top: 10px; left: 12px; right: 12px; z-index: 2; display: flex; gap: 5px; }',
    '.news-bars i { flex: 1; height: 3px; border-radius: 2px; background: rgba(255,255,255,.35); overflow: hidden; }',
    '.news-bars i::before { content: ""; display: block; height: 100%; width: 0; background: #fff; }',
    '@keyframes newsBar { to { width: 100%; } }',
    '.news-story:hover .news-bars i:first-child::before { animation: newsBar 2.2s linear forwards; }',
    '.news-story-top { position: absolute; top: 22px; left: 12px; right: 12px; z-index: 2; display: flex; align-items: center; gap: 9px; }',
    '.news-ava { width: 34px; height: 34px; border-radius: 50%; padding: 2px; background: conic-gradient(#f9ce34, #ee2a7b, #6228d7, #f9ce34); box-sizing: content-box; flex-shrink: 0; }',
    '.news-ava span { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; border-radius: 50%; background: #074e2f; border: 2px solid #fff; box-sizing: border-box; }',
    '.news-ava img { width: 50%; filter: brightness(0) invert(1); }',
    '.news-story-top b { font-size: 13px; font-weight: 600; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,.4); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
    '.news-story-cap { position: absolute; left: 16px; right: 16px; bottom: 16px; z-index: 2; font-size: 15px; font-weight: 600; line-height: 1.4; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,.5); }',
    /* бейдж видео */
    '.news-play { position: absolute; top: 50%; left: 50%; z-index: 2; width: 54px; height: 54px; transform: translate(-50%, -50%); border-radius: 50%; background: rgba(0,0,0,.45); backdrop-filter: blur(2px); transition: opacity .3s ease; }',
    '.news-play::before { content: ""; position: absolute; top: 50%; left: 54%; transform: translate(-50%, -50%); border: 11px solid transparent; border-left: 17px solid #fff; border-right: none; }',
    '.news-story:hover .news-play { opacity: 0; }',
    /* заглушка пустого канала */
    '.news-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; width: 268px; height: 476px; border: 2px dashed #d9cbab; border-radius: 26px; color: #a99e86; font-size: 15px; font-weight: 300; text-align: center; padding: 0 24px; box-sizing: border-box; }',

    /* правая колонка: карточка новости + подписка */
    /* высота колонки = высота сториз-карточки, чтобы низы блоков совпадали */
    '.news-col { display: flex; flex-direction: column; gap: 24px; flex: 1; height: 476px; }',
    '.news-note { position: relative; flex: 1; min-height: 0; background: #fffdf8; border-radius: 18px; padding: 30px 40px 26px; transform: rotate(.8deg); box-shadow: 0 18px 40px rgba(60, 35, 10, .14); }',
    '.news-pin { position: absolute; top: -14px; left: 54px; width: 118px; height: 32px; background: rgba(239, 79, 31, .8); border-radius: 4px; transform: rotate(-3deg); box-shadow: 0 3px 8px rgba(0,0,0,.12); }',
    '.news-meta { display: flex; gap: 12px; align-items: center; }',
    '.news-tag { padding: 5px 12px; background: #116c42; border-radius: 7px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #fff; }',
    '.news-date { font-size: 14px; font-weight: 300; color: #999; }',
    '.news-note h3 { margin: 16px 0 0; font-size: 28px; font-weight: 800; color: #1a1a1a; line-height: 1.2; }',
    '.news-note p { margin: 12px 0 0; font-size: 16px; font-weight: 300; line-height: 1.65; color: #555; }',
    '.news-follow { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-shrink: 0; padding: 20px 30px; background: #074e2f; border-radius: 18px; text-decoration: none; box-shadow: 0 18px 40px rgba(7, 78, 47, .22); transition: transform .3s cubic-bezier(.22, 1, .36, 1); }',
    '.news-follow:hover { transform: translateY(-6px); }',
    '.news-follow-txt b { display: block; font-size: 19px; font-weight: 800; color: #f8efe0; }',
    '.news-follow-txt span { display: block; margin-top: 4px; font-size: 14px; font-weight: 300; color: rgba(248, 239, 224, .65); }',
    '.news-follow-btn { flex-shrink: 0; padding: 12px 24px; background: linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7); border-radius: 12px; font-size: 15px; font-weight: 700; color: #fff; white-space: nowrap; }',

    /* появление по скроллу */
    '@media (prefers-reduced-motion: no-preference) {',
    '  .news-reveal { opacity: 0; transform: translateY(32px); transition: opacity .6s ease, transform .7s cubic-bezier(.22, 1, .36, 1); transition-delay: var(--delay, 0s); }',
    '  .news-section.is-shown .news-reveal { opacity: 1; transform: translateY(0); }',
    '  .news-note.news-reveal { transform: translateY(40px) rotate(3deg); }',
    '  .news-section.is-shown .news-note.news-reveal { transform: translateY(0) rotate(.8deg); }',
    '}'
  ].join('\n');

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  function ava() {
    return '<div class="news-ava"><span><img src="/assets/images/logo-no-text.svg" alt=""></span></div>';
  }

  function buildStory(post, chan, i) {
    var a = el('a', 'news-story news-reveal');
    a.href = chan.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.style.setProperty('--delay', (0.15 + i * 0.12) + 's');

    var media;
    if (post.type === 'video') {
      media = '<video class="news-media" src="' + post.url + '" muted loop playsinline preload="metadata"></video>' +
              '<div class="news-play" aria-hidden="true"></div>';
    } else {
      media = '<img class="news-media" src="' + post.url + '" alt="Пост Instagram: ' + post.caption + '">';
    }
    a.innerHTML = media +
      '<div class="news-bars"><i></i><i></i><i></i></div>' +
      '<div class="news-story-top">' + ava() + '<b>' + chan.handle + '</b></div>' +
      '<div class="news-story-cap">' + post.caption + '</div>';

    if (post.type === 'video') {
      var v = a.querySelector('video');
      a.addEventListener('mouseenter', function () { v.play().catch(function () {}); });
      a.addEventListener('mouseleave', function () { v.pause(); v.currentTime = 0; });
    }
    return a;
  }

  function buildChanHead(chan) {
    var head = el('div', 'news-chan');
    head.innerHTML = ava() +
      '<a href="' + chan.url + '" target="_blank" rel="noopener">@' + chan.handle + '</a>';
    return head;
  }

  function buildFollow(chan, text, delay) {
    var follow = el('a', 'news-follow news-reveal');
    follow.href = chan.url;
    follow.target = '_blank';
    follow.rel = 'noopener';
    follow.style.setProperty('--delay', delay);
    follow.innerHTML =
      '<div class="news-follow-txt"><b>@' + chan.handle + '</b><span>' + text + '</span></div>' +
      '<span class="news-follow-btn">Подписаться</span>';
    return follow;
  }

  function buildEmpty() {
    var d = el('div', 'news-empty news-reveal', '☕<br>Скоро здесь появятся посты');
    return d;
  }

  function buildSection(top, feed) {
    var section = el('section', 'news-section');
    section.style.top = top + 'px';
    section.style.left = 'calc(50% - 680px)'; // маркер для скрипта адаптации
    section.setAttribute('aria-label', 'Новости и Instagram');

    var head = el('div', 'news-head news-reveal');
    head.innerHTML =
      '<div><h2 class="news-title">МЫ В <em>ЭФИРЕ</em></h2>' +
      '<p class="news-sub">Свежие лоты, акции и жизнь обжарочного цеха — в наших Instagram-каналах</p></div>';
    section.appendChild(head);

    /* шапки обоих каналов в одну строку */
    var chans = el('div', 'news-chans news-reveal');
    chans.append(buildChanHead(CHANNELS.main), buildChanHead(CHANNELS.karaganda));
    section.appendChild(chans);

    /* общая лента: свежие посты обоих каналов, канал виден в шапке карточки */
    var posts = (feed.main || []).map(function (p) { return { post: p, chan: CHANNELS.main }; })
      .concat((feed.karaganda || []).map(function (p) { return { post: p, chan: CHANNELS.karaganda }; }))
      .sort(function (a, b) { return b.post.mtime - a.post.mtime; })
      .slice(0, MAX_POSTS);

    var row = el('div', 'news-row');
    if (posts.length) {
      posts.forEach(function (x, i) { row.appendChild(buildStory(x.post, x.chan, i)); });
    } else {
      row.appendChild(buildEmpty());
    }

    var col = el('div', 'news-col');
    var note = el('article', 'news-note news-reveal');
    note.style.setProperty('--delay', '.35s');
    note.innerHTML =
      '<div class="news-pin" aria-hidden="true"></div>' +
      '<div class="news-meta"><span class="news-tag">' + NEWS.tag + '</span><span class="news-date">' + NEWS.date + '</span></div>' +
      '<h3>' + NEWS.title + '</h3><p>' + NEWS.text + '</p>';
    col.append(note,
      buildFollow(CHANNELS.main, 'Раздаём кофе в сторис и первыми показываем новые лоты', '.45s'),
      buildFollow(CHANNELS.karaganda, 'Встречи и каппинги кофейного клуба Караганды', '.55s'));
    row.appendChild(col);
    section.appendChild(row);

    return section;
  }

  function insert(feed) {
    var canvas = document.getElementById('main-container');
    if (canvas.querySelector('.news-section')) return;

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var pageBottom = window.__pageHeight || canvas.offsetHeight;
    var section = buildSection(pageBottom, feed);
    canvas.appendChild(section);

    canvas.style.height = (pageBottom + SECTION_HEIGHT) + 'px';
    window.__pageHeight = pageBottom + SECTION_HEIGHT;
    window.dispatchEvent(new Event('resize'));

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          section.classList.add('is-shown');
          io.disconnect();
        }
      }, { threshold: 0.1 });
      io.observe(section);
    } else {
      section.classList.add('is-shown');
    }
  }

  function boot() { // ждём секцию заявки — встаём сразу после неё
    var feedPromise = fetch('/api/news')
      .then(function (r) { return r.json(); })
      .catch(function () { return { main: [], karaganda: [] }; });

    function whenReady(cb) {
      var canvas = document.getElementById('main-container');
      if (canvas && canvas.querySelector('.req-section')) { cb(); return; }
      var tries = 0;
      var iv = setInterval(function () {
        canvas = document.getElementById('main-container');
        if ((canvas && canvas.querySelector('.req-section')) || ++tries > 50) {
          clearInterval(iv);
          if (canvas) cb();
        }
      }, 150);
    }
    whenReady(function () {
      feedPromise.then(insert);
    });
  }

  boot();
})();
