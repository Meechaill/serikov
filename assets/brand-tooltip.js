/**
 * Всплывающая подсказка на словах «Giesen» и «Probat» в секции «путь кофе»
 * (3-й шаг, про обжарку). Оба слова уже подчёркнуты пунктиром в бандле
 * (.decoration-dotted) — это и есть указатель на скрытую подсказку.
 *
 * При наведении показываем маленькую карточку: фото обжарочной машины,
 * имя бренда, короткую фразу и ссылку на официальный сайт бренда.
 */
(function () {
  var BRANDS = {
    Giesen: {
      img: '/assets/images/journey/giesen.png',
      text: 'Нидерландские обжарочные машины, известные точностью и мягким профилем обжарки.',
      url: 'https://giesen.com/'
    },
    Probat: {
      img: '/assets/images/journey/probat.png',
      text: 'Немецкий производитель с более чем 150-летней историей — эталон в обжарке кофе.',
      url: 'https://www.probat.com/'
    }
  };

  var CSS = [
    ".bt-card { position: fixed; z-index: 60; width: 240px; padding: 14px; background: #fffdf8; border-radius: 16px; box-shadow: 0 20px 40px rgba(60, 35, 10, .22); font-family: 'Geologica', Helvetica, sans-serif; text-align: left; opacity: 0; transform: translateY(8px) scale(.96); transition: opacity .2s ease, transform .25s cubic-bezier(.22, 1, .36, 1); pointer-events: none; }",
    '.bt-card.is-on { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }',
    '.bt-card img { display: block; width: 100%; height: 108px; object-fit: contain; border-radius: 10px; background: #f3ede0; }',
    '.bt-card b { display: block; margin-top: 10px; font-size: 16px; font-weight: 800; color: #074e2f; }',
    '.bt-card p { margin: 6px 0 0; font-size: 13px; font-weight: 300; line-height: 1.5; color: #555; }',
    '.bt-card span { display: inline-block; margin-top: 8px; font-size: 12.5px; font-weight: 700; color: #ef4f1f; }'
  ].join('\n');

  function boot() {
    var spans = Array.prototype.filter.call(
      document.querySelectorAll('#main-container span.underline.decoration-dotted'),
      function (s) { return BRANDS[s.textContent.trim()]; }
    );
    if (!spans.length) { setTimeout(boot, 300); return; }

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    // вся карточка — реальная ссылка: по ней можно кликнуть, а не только
    // успеть попасть курсором в узкую полоску текста внутри
    var card = document.createElement('a');
    card.className = 'bt-card';
    card.target = '_blank';
    card.rel = 'noopener';
    document.body.appendChild(card);

    var hideTimer = null;
    function show(brand, rect) {
      clearTimeout(hideTimer);
      card.href = brand.url;
      card.innerHTML =
        '<img src="' + brand.img + '" alt="Обжарочная машина ' + brand.name + '">' +
        '<b>' + brand.name + '</b><p>' + brand.text + '</p>' +
        '<span>' + brand.url.replace(/^https?:\/\//, '').replace(/\/$/, '') + ' →</span>';
      var left = Math.min(rect.left, window.innerWidth - 240 - 16);
      var top = rect.top - 108 - 24 < 8 ? rect.bottom + 10 : rect.top - 260;
      card.style.left = Math.max(8, left) + 'px';
      card.style.top = Math.max(8, top) + 'px';
      card.classList.add('is-on');
    }
    // задержка больше, чем расстояние от слова до карточки — курсор
    // успевает доехать до ссылки, прежде чем подсказка закроется
    function hide() {
      hideTimer = setTimeout(function () { card.classList.remove('is-on'); }, 350);
    }

    spans.forEach(function (span) {
      span.style.cursor = 'pointer';
      var name = span.textContent.trim();
      var brand = Object.assign({ name: name }, BRANDS[name]);
      span.addEventListener('mouseenter', function () { show(brand, span.getBoundingClientRect()); });
      span.addEventListener('mouseleave', hide);
      span.addEventListener('click', function () { window.open(brand.url, '_blank', 'noopener'); });
    });
    card.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
    card.addEventListener('mouseleave', hide);
  }

  boot();
})();
