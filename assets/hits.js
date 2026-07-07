/**
 * Секция «Хиты продаж».
 *
 * Сайт — это React-бандл (app.js) с фиксированным холстом #main-container,
 * где все секции позиционированы абсолютно. Исходников у бандла нет, поэтому
 * новая секция врезается этим скриптом: она вставляется между каталогом
 * (заканчивается на 2092px макета) и секцией «путь кофе», а всё, что ниже,
 * сдвигается на её высоту.
 *
 * Стилистика — «полароиды» из секции пути: слегка повёрнутые карточки
 * с цветными лентами-скотчем, фирменная палитра, шрифт Geologica.
 */
(function () {
  var INSERT_AT = 2092;      // низ секции каталога в координатах макета
  var SECTION_HEIGHT = 950;  // высота новой секции
  var DESIGN_HEIGHT = 5182;  // исходная высота холста

  var PRODUCTS = [
    {
      name: 'Italian Blend',
      origin: 'Эспрессо-смесь',
      notes: 'Тёмный шоколад, карамель, фундук',
      price: '4 900 ₸ · 250 г',
      img: '/assets/images/hits/italian-blend.png',
      accent: '#ef4f1f',
      rotate: -2
    },
    {
      name: 'Чепсангор Хиллс',
      origin: 'Кения · фильтр',
      notes: 'Красная смородина, грейпфрут, мёд',
      price: '6 400 ₸ · 250 г',
      img: '/assets/images/hits/kenya-chepsangor.png',
      accent: '#00a9bb',
      rotate: 1.5
    },
    {
      name: 'Матунда',
      origin: 'Кения · эспрессо',
      notes: 'Спелая вишня, виноград, какао',
      price: '6 200 ₸ · 250 г',
      img: '/assets/images/hits/kenya-matunda.png',
      accent: '#116c42',
      rotate: -1
    },
    {
      name: 'Ндуруту',
      origin: 'Кения · фильтр',
      notes: 'Чёрная смородина, апельсин, тростниковый сахар',
      price: '5 900 ₸ · 250 г',
      img: '/assets/images/hits/kenya-ndurutu.png',
      accent: '#fdbb03',
      rotate: 2
    }
  ];

  // декоративные дудлы по краям секции (лист, конфетти, зёрна, спираль)
  var DOODLES = [
    { img: '/assets/images/hits/Vector.png',   w: 150, top: 120, left: 30,   rotate: -15 },
    { img: '/assets/images/hits/Vector-1.png', w: 130, top: 560, left: 1200, rotate: 10 },
    { img: '/assets/images/hits/Vector-2.png', w: 110, top: 640, left: 60,   rotate: 8 },
    { img: '/assets/images/hits/Vector-3.png', w: 120, top: 90,  left: 1190, rotate: 12 }
  ];

  var CSS = [
    '.hits-section { position: absolute; top: ' + INSERT_AT + 'px; left: calc(50% - 680px); width: 1360px; height: ' + SECTION_HEIGHT + "px; font-family: 'Geologica', Helvetica, sans-serif; }",
    '.hits-doodle { position: absolute; pointer-events: none; user-select: none; }', // вставляются первыми детьми секции — рисуются под контентом
    '.hits-title-wrap { position: relative; width: 668px; margin: 60px auto 0; }',
    '.hits-title { margin: 0; text-align: center; font-size: 56px; font-weight: 900; line-height: 1.1; letter-spacing: 1px; color: #1a1a1a; }',
    '.hits-title em { font-style: normal; color: #116c42; }',
    /* «потёртость» — как у остальных заголовков: крапчатая накладка glow.svg,
       которая через mix-blend-mode: lighten просвечивает тёмный текст */
    '.hits-title-grain { position: absolute; top: 50%; left: 50%; width: 665px; height: 134px; transform: translate(-50%, -50%); mix-blend-mode: lighten; pointer-events: none; }',
    '.hits-subtitle { margin: 16px auto 0; max-width: 640px; text-align: center; font-size: 18px; font-weight: 400; line-height: 1.5; color: #333; }',
    '.hits-grid { display: flex; justify-content: center; gap: 28px; margin-top: 56px; }',
    '.hits-card-tilt { width: 306px; }',
    '.hits-card { position: relative; background: #fffdf8; border-radius: 16px; padding: 44px 22px 24px; transition: transform .25s ease; }',
    '.hits-card:hover { transform: translateY(-8px) rotate(0deg) !important; }',
    '.hits-badge { position: absolute; top: 14px; left: -10px; padding: 6px 14px; border-radius: 8px; transform: rotate(-4deg); font-size: 14px; font-weight: 700; color: #fff; letter-spacing: .5px; }',
    '.hits-photo { display: block; width: 218px; height: 218px; margin: 6px auto 0; object-fit: contain; }',
    '.hits-name { margin: 18px 0 0; font-size: 22px; font-weight: 700; color: #1a1a1a; text-align: center; }',
    '.hits-origin { margin: 4px 0 0; font-size: 14px; font-weight: 600; letter-spacing: .5px; text-transform: uppercase; text-align: center; }',
    '.hits-notes { margin: 10px 0 0; min-height: 42px; font-size: 14px; font-weight: 400; line-height: 1.5; color: #555; text-align: center; }',
    '.hits-price { margin: 14px 0 0; font-size: 18px; font-weight: 700; color: #074e2f; text-align: center; }',
    '.hits-cta-wrap { margin-top: 64px; text-align: center; }',
    /* кнопка — как остальные кнопки сайта: скошенная подложка (скос 12px
       при высоте 54, скругление 20 — по фигме) + текст поверх */
    '.hits-cta { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 300px; height: 54px; padding: 0; background: none; border: none; cursor: pointer; font-family: inherit; }',
    '.hits-cta-bg { position: absolute; top: 0; bottom: 0; left: 6px; width: calc(100% - 12px); background: #074e2f; border-radius: 20px; transform: skewX(-12.53deg); transition: scale .3s ease; }',
    '.hits-cta:hover .hits-cta-bg { scale: 1.05; }',
    '.hits-cta span { position: relative; z-index: 1; color: #f5f5f5; font-size: 20px; font-weight: 500; line-height: 1; white-space: nowrap; }',
    /* появление секции при скролле: заголовок всплывает, карточки по очереди
       «ложатся на стол» (подъём + доворот через переменную --settle), кнопка — последней.
       Задержка каскада — через transition-delay, выставляется из JS */
    '@media (prefers-reduced-motion: no-preference) {',
    '  .hits-reveal { opacity: 0; transform: translateY(28px) rotate(var(--settle, 0deg)); transition: opacity .6s ease, transform .7s cubic-bezier(.22, 1, .36, 1); transition-delay: var(--delay, 0s); }',
    '  .hits-section.is-shown .hits-reveal { opacity: 1; transform: translateY(0) rotate(0deg); }',
    /* только затухание, без transform — для крапчатой накладки заголовка */
    '  .hits-fade { opacity: 0; transition: opacity .6s ease; transition-delay: var(--delay, 0s); }',
    '  .hits-section.is-shown .hits-fade { opacity: 1; }',
    '}'
  ].join('\n');

  function buildCard(p) {
    var i = PRODUCTS.indexOf(p);
    var tilt = document.createElement('div');
    tilt.className = 'hits-card-tilt hits-reveal';
    // карточка «доворачивается» в свой финальный наклон с противоположной стороны
    tilt.style.setProperty('--settle', (p.rotate > 0 ? -3 : 3) + 'deg');
    tilt.style.setProperty('--delay', (0.15 + i * 0.12) + 's');

    var card = document.createElement('article');
    card.className = 'hits-card';
    card.style.transform = 'rotate(' + p.rotate + 'deg)';

    var badge = document.createElement('div');
    badge.className = 'hits-badge';
    badge.style.background = p.accent;
    badge.textContent = 'ХИТ №' + (PRODUCTS.indexOf(p) + 1);

    var img = document.createElement('img');
    img.className = 'hits-photo';
    img.src = p.img;
    img.alt = 'Упаковка кофе ' + p.name;

    var name = document.createElement('h3');
    name.className = 'hits-name';
    name.textContent = p.name;

    var origin = document.createElement('p');
    origin.className = 'hits-origin';
    origin.style.color = p.accent;
    origin.textContent = p.origin;

    var notes = document.createElement('p');
    notes.className = 'hits-notes';
    notes.textContent = p.notes;

    var price = document.createElement('p');
    price.className = 'hits-price';
    price.textContent = p.price;

    card.append(badge, img, name, origin, notes, price);
    tilt.appendChild(card);
    return tilt;
  }

  function buildSection() {
    var section = document.createElement('section');
    section.className = 'hits-section';
    // left дублируем inline: по нему скрипт адаптации в index.html понимает,
    // что блок центрируется сам, и не двигает его
    section.style.left = 'calc(50% - 680px)';
    section.setAttribute('aria-label', 'Хиты продаж');

    DOODLES.forEach(function (d, i) {
      var doodle = document.createElement('img');
      doodle.className = 'hits-doodle hits-fade';
      doodle.src = d.img;
      doodle.alt = '';
      doodle.setAttribute('aria-hidden', 'true');
      doodle.style.cssText = 'width:' + d.w + 'px;top:' + d.top + 'px;left:' + d.left + 'px;transform:rotate(' + d.rotate + 'deg);';
      doodle.style.setProperty('--delay', (0.3 + i * 0.15) + 's');
      section.appendChild(doodle);
    });

    var titleWrap = document.createElement('div');
    // reveal вешаем на сам заголовок, а не на обёртку: transform/opacity
    // на обёртке создают stacking context и ломают mix-blend-mode
    // накладки (фон становится чёрным)
    titleWrap.className = 'hits-title-wrap';

    var title = document.createElement('h2');
    title.className = 'hits-title hits-reveal';
    title.innerHTML = 'ХИТЫ <em>ПРОДАЖ</em>';

    var grain = document.createElement('img');
    grain.className = 'hits-title-grain hits-fade'; // накладке нельзя .hits-reveal: её transform-центрирование перебилось бы
    grain.src = '/assets/images/journey/glow.svg';
    grain.alt = '';
    grain.setAttribute('aria-hidden', 'true');

    titleWrap.append(title, grain);

    var subtitle = document.createElement('p');
    subtitle.className = 'hits-subtitle hits-reveal';
    subtitle.style.setProperty('--delay', '0.1s');
    subtitle.textContent = 'То, что заказывают снова и снова. Четыре сорта, с которых чаще всего начинается любовь к нашему кофе.';

    var grid = document.createElement('div');
    grid.className = 'hits-grid';
    PRODUCTS.forEach(function (p) { grid.appendChild(buildCard(p)); });

    var ctaWrap = document.createElement('div');
    ctaWrap.className = 'hits-cta-wrap hits-reveal';
    ctaWrap.style.setProperty('--delay', '0.55s');
    var cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'hits-cta';
    // пока пустышка — полного каталога ещё нет
    var ctaBg = document.createElement('div');
    ctaBg.className = 'hits-cta-bg';
    var ctaText = document.createElement('span');
    ctaText.textContent = 'Смотреть весь каталог →';
    cta.append(ctaBg, ctaText);
    ctaWrap.appendChild(cta);

    section.append(titleWrap, subtitle, grid, ctaWrap);
    return section;
  }

  function boot() { // ждём React (MutationObserver: rAF заморожен в фоновых вкладках)
    if (document.getElementById('main-container')) { insert(); return; }
    var mo = new MutationObserver(function () {
      if (document.getElementById('main-container')) { mo.disconnect(); insert(); }
    });
    mo.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
  }

  function insert() {
    var canvas = document.getElementById('main-container');
    if (canvas.querySelector('.hits-section')) return;

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var section = buildSection();
    canvas.appendChild(section);

    // запускаем появление, когда секция входит в вьюпорт (один раз)
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          section.classList.add('is-shown');
          io.disconnect();
        }
      }, { threshold: 0.15 });
      io.observe(section);
    } else {
      section.classList.add('is-shown');
    }

    // Сдвигаем вниз всё, что было ниже точки вставки (секция «путь кофе»),
    // и растим холст. app.js пропатчен читать высоту из __pageHeight.
    Array.prototype.forEach.call(canvas.children, function (el) {
      if (el.offsetTop >= INSERT_AT && !el.classList.contains('hits-section')) {
        el.style.top = (el.offsetTop + SECTION_HEIGHT) + 'px';
      }
    });
    canvas.style.height = (DESIGN_HEIGHT + SECTION_HEIGHT) + 'px';
    window.__pageHeight = DESIGN_HEIGHT + SECTION_HEIGHT;
    window.dispatchEvent(new Event('resize')); // app.js пересчитает высоту обёртки
  }

  boot();
})();
