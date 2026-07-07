/**
 * Секция «Мы помогаем разным клиентам»: аккордеон-раскрытие карточек.
 *
 * При наведении карточка плавно разъезжается вширь (соседние ужимаются),
 * и в освободившемся месте проявляется панель с подробностями: адреса
 * шоурумов, сервис кофемашин, обучение Serikov Coffee Education
 * (тексты — из Instagram и старого сайта компании).
 *
 * Работает на чистом CSS (flex-grow + :hover), JS только врезает панели.
 * 3D-наклон карточек за курсором отключён в index.html — он конфликтовал
 * бы с раскрытием.
 *
 * Здесь же глушится временная модалка заказа из бандла: кнопки без
 * реальной функции теперь ничего не делают.
 */
(function () {
  // подробности карточек, по порядку: ДЛЯ ДОМА / ДЛЯ БИЗНЕСА / ДЛЯ БАРИСТА.
  // Раскрытая карточка верстается с нуля (слой .s2x-full): бейдж + штамп,
  // крупный заголовок, суть, доказательство (живой отзыв с сайта или чипы
  // реальных курсов), список городов и рабочая кнопка к форме заявки.
  var DETAILS = [
    {
      color: '#074e2f', soft: 'rgba(7, 78, 47, .12)', line: 'rgba(7, 78, 47, .28)',
      tag: 'Шоурумы', stamp: 'Доставка по всему Казахстану',
      title: 'Посмотреть, потрогать, попробовать',
      intro: 'Шоурумы в трёх городах, а онлайн-заказ на Serikovcoffee.kz и Kaspi.kz привезём в любой город и посёлок страны.',
      quote: ['Кофе просто шикарный — лучше в РК я не пробовал.', 'Артём, постоянный клиент уже более двух лет'],
      items: [
        ['Караганда', 'пр. Абдирова, 5, офис 209', 'https://2gis.kz/karaganda/search/' + encodeURIComponent('проспект Нуркена Абдирова, 5')],
        ['Алматы', 'ул. Досмухамедова, 44', 'https://2gis.kz/almaty/search/' + encodeURIComponent('Досмухамедова, 44')],
        ['Астана', 'ул. Нурмагамбетова, 19', 'https://2gis.kz/astana/search/' + encodeURIComponent('Нурмагамбетова, 19')]
      ],
      cta: 'Заказать кофе →', ctaBg: '#074e2f', ctaColor: '#f8efe0'
    },
    {
      color: '#fff8f0', soft: 'rgba(255, 255, 255, .16)', line: 'rgba(255, 255, 255, .32)',
      tag: 'Сервис', stamp: 'Работаем по всему Казахстану',
      title: 'Мастер приедет к вашей кофемашине',
      intro: 'Обслуживаем кофейни, рестораны, офисы и домашних любителей кофе. Диагностика на месте — быстро найдём и решим проблему.',
      quote: ['Действительно лучший кофе в аэропорту Астаны!', 'Вячеслав, партнёр'],
      items: [
        ['Караганда', '+7 771 283 4620', 'tel:+77712834620'],
        ['Астана', '+7 771 373 8836', 'tel:+77713738836'],
        ['Алматы', '+7 777 501 8466', 'tel:+77775018466']
      ],
      cta: 'Вызвать мастера →', ctaBg: '#074e2f', ctaColor: '#fff8f0'
    },
    {
      color: '#f8efe0', soft: 'rgba(248, 239, 224, .14)', line: 'rgba(248, 239, 224, .32)',
      tag: 'Education', stamp: 'Учим по мировым стандартам',
      title: 'Курсы бариста в трёх городах',
      intro: 'Классы с профессиональным оборудованием, тренеры с многолетним опытом и выездные тренинги для вашей команды.',
      chips: ['BASE', 'LATTE ART', 'SENSORY', 'BREW', 'FULL', 'КОФЕ ДОМА'],
      // у курсов зовём в WhatsApp — как в их Instagram
      items: [
        ['Караганда', '+7 771 283 4620', 'https://wa.me/77712834620'],
        ['Астана', '+7 771 373 8836', 'https://wa.me/77713738836'],
        ['Алматы', '+7 777 501 8466', 'https://wa.me/77775018466']
      ],
      cta: 'Записаться на курс →', ctaBg: '#fdbb03', ctaColor: '#074e2f'
    }
  ];

  var CSS = [
    /* раскрытие: ряд отдаёт место карточке под курсором; соседи почти
       не ужимаются — их фото и заголовки остаются целыми */
    '.s2x article { transition: flex-grow .65s cubic-bezier(.22, 1, .36, 1); }',
    '.s2x:hover article { flex-grow: .9; }',
    '.s2x article:hover { flex-grow: 2.05; }',
    /* у соседей остаётся только заголовок: он чуть ужимается,
       а подпункты тают — чистая цветная обложка с фото */
    '.s2x article h2 { transition: font-size .45s cubic-bezier(.22, 1, .36, 1); }',
    '.s2x:hover article:not(:hover) h2 { font-size: 32px; }',
    '.s2x article h2 + div { transition: opacity .3s ease; }',
    '.s2x:hover article:not(:hover) h2 + div { opacity: 0; }',
    /* кнопки с лицевой стороны убраны: до них всё равно не добраться —
       карточка раскрывается раньше, и там своя рабочая кнопка */
    '.s2x article > div:not(.s2x-full) button { display: none; }',

    /* раскрытая карточка: родное содержимое растворяется целиком… */
    '.s2x article > img, .s2x article > div:not(.s2x-full) { transition: opacity .35s ease; }',
    '.s2x article:hover > img, .s2x article:hover > div:not(.s2x-full) { opacity: 0; }',

    /* …и вместо него всплывает свой слой-«разворот» */
    ".s2x-full { position: absolute; inset: 0; display: flex; flex-direction: column; box-sizing: border-box; padding: 44px 46px 36px; font-family: 'Geologica', Helvetica, sans-serif; opacity: 0; transform: translateY(16px); transition: opacity .4s ease .14s, transform .55s cubic-bezier(.22, 1, .36, 1) .14s; pointer-events: none; }",
    '.s2x article:hover .s2x-full { opacity: 1; transform: none; pointer-events: auto; }',

    /* узоры-дудлы на «обратной стороне» — как в остальных секциях */
    '.s2x-doodle { position: absolute; opacity: .3; pointer-events: none; user-select: none; }',

    '.s2x-tag { align-self: flex-start; padding: 7px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }',
    '.s2x-full h3 { margin: 20px 0 0; max-width: 380px; font-size: 34px; font-weight: 900; line-height: 1.14; }',
    '.s2x-intro { margin: 14px 0 0; max-width: 385px; font-size: 15.5px; font-weight: 300; line-height: 1.6; opacity: .92; }',

    /* штамп в углу — как оттиск на посылке; главное сообщение карточки */
    '.s2x-stamp { position: absolute; top: 52px; right: 46px; max-width: 168px; padding: 12px 18px; border: 2px solid; border-radius: 14px; transform: rotate(5deg); font-size: 13px; font-weight: 800; letter-spacing: 1px; line-height: 1.4; text-transform: uppercase; text-align: center; }',

    /* доказательство: живой отзыв с сайта… */
    '.s2x-quote { margin: 18px 0 0; max-width: 385px; padding-left: 16px; border-left: 3px solid; font-size: 15px; font-style: italic; font-weight: 300; line-height: 1.55; }',
    '.s2x-quote b { display: block; margin-top: 6px; font-style: normal; font-size: 12.5px; font-weight: 700; letter-spacing: .3px; opacity: .72; }',
    /* …или чипы реальных курсов */
    '.s2x-chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0 0; max-width: 420px; }',
    '.s2x-chips span { padding: 8px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; letter-spacing: .5px; }',

    /* города — воздушный список с линейками, как оглавление в журнале */
    '.s2x-cities { margin-top: auto; }',
    '.s2x-city { display: flex; justify-content: space-between; align-items: baseline; gap: 18px; padding: 14px 2px; border-top: 1px solid; }',
    '.s2x-city b { font-size: 19px; font-weight: 800; }',
    '.s2x-city span, .s2x-city a { font-size: 15px; font-weight: 300; opacity: .92; white-space: nowrap; }',
    /* адрес — ссылка в 2ГИС */
    '.s2x-city a { color: inherit; text-decoration: none; border-bottom: 1px dashed; cursor: pointer; transition: opacity .2s ease; }',
    '.s2x-city a:hover { opacity: 1; border-bottom-style: solid; }',

    /* рабочая кнопка: ведёт к форме заявки внизу страницы */
    '.s2x-cta { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 250px; height: 52px; margin-top: 20px; padding: 0; background: none; border: none; cursor: pointer; font-family: inherit; }',
    '.s2x-cta i { position: absolute; top: 0; bottom: 0; left: 6px; width: calc(100% - 12px); border-radius: 18px; transform: skewX(-12.53deg); transition: scale .3s ease; }',
    '.s2x-cta:hover i { scale: 1.05; }',
    '.s2x-cta span { position: relative; z-index: 1; font-size: 18px; font-weight: 600; }'
  ].join('\n');

  function buildPanel(d) {
    var panel = document.createElement('div');
    panel.className = 's2x-full';
    panel.style.color = d.color;
    var cities = d.items.map(function (it) {
      var link = it[2];
      var detail = !link ? '<span>' + it[1] + '</span>'
        : link.indexOf('tel:') === 0
          ? '<a href="' + link + '" title="Позвонить">' + it[1] + '</a>'
          : '<a href="' + link + '" target="_blank" rel="noopener" title="' +
            (link.indexOf('wa.me') !== -1 ? 'Написать в WhatsApp' : 'Открыть в 2ГИС') + '">' + it[1] + '</a>';
      return '<div class="s2x-city" style="border-color:' + d.line + '"><b>' + it[0] + '</b>' + detail + '</div>';
    }).join('');
    var proof = d.quote
      ? '<blockquote class="s2x-quote" style="border-color:' + d.line + '">«' + d.quote[0] + '»<b>— ' + d.quote[1] + '</b></blockquote>'
      : '<div class="s2x-chips">' + d.chips.map(function (c) {
          return '<span style="background:' + d.soft + '">' + c + '</span>';
        }).join('') + '</div>';
    panel.innerHTML =
      '<img class="s2x-doodle" src="/assets/images/hits/Vector.png" alt="" aria-hidden="true" style="width:160px;top:210px;right:58px;transform:rotate(-16deg)">' +
      '<img class="s2x-doodle" src="/assets/images/hits/Vector-1.png" alt="" aria-hidden="true" style="width:110px;top:420px;right:84px;transform:rotate(10deg)">' +
      '<div class="s2x-tag" style="background:' + d.soft + '">' + d.tag + '</div>' +
      '<div class="s2x-stamp">' + d.stamp + '</div>' +
      '<h3>' + d.title + '</h3>' +
      '<p class="s2x-intro">' + d.intro + '</p>' +
      proof +
      '<div class="s2x-cities">' + cities + '</div>' +
      '<button type="button" class="s2x-cta"><i style="background:' + d.ctaBg + '"></i>' +
      '<span style="color:' + d.ctaColor + '">' + d.cta + '</span></button>';
    var cta = panel.querySelector('.s2x-cta');
    cta.addEventListener('click', function () {
      var form = document.querySelector('.req-section');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return panel;
  }

  function boot() {
    var wrap = document.querySelector('#main-container .mt-\\[-102px\\]');
    var row = wrap && wrap.querySelector('article') && wrap.querySelector('article').parentElement;
    if (!row) { setTimeout(boot, 300); return; }

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    row.classList.add('s2x');
    row.querySelectorAll(':scope > article').forEach(function (card, i) {
      if (DETAILS[i]) card.appendChild(buildPanel(DETAILS[i]));
    });
  }

  // Кнопки бандла открывали временную модалку заказа — теперь молчат.
  // Слушатель на capture-фазе документа срабатывает раньше обработчиков
  // React на #root и не даёт им запуститься. Живые кнопки новых секций
  // (форма заявки) не задеваются — у них свои классы.
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('button');
    if (!btn) return;
    if (btn.closest('.req-section')) return;              // форма заявки работает
    if (btn.classList.contains('s2x-cta')) return;        // кнопки раскрытых карточек тоже
    if (btn.closest('#main-container')) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  boot();
})();
