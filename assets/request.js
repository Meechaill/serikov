/**
 * Финальная секция «Оставить заявку».
 *
 * Врезается тем же способом, что и «Хиты продаж» (hits.js): холст #main-container
 * фиксированный, секция ставится в самый низ страницы, холст растёт на её высоту.
 * Скрипт ждёт hits.js (тот двигает низ страницы), поэтому читает актуальную
 * высоту из window.__pageHeight.
 *
 * Композиция: тёмно-зелёная панель во всю ширину контента, слева — заголовок
 * и телефон, в центре — полароидная карточка-форма на «скотче», справа из-за
 * нижнего края панели поднимается Сериков и указывает на форму.
 */
(function () {
  var SECTION_HEIGHT = 900; // высота новой секции
  var PANEL_TOP = 90;       // отступ панели от верха секции

  var CSS = [
    '.req-section { position: absolute; left: calc(50% - 680px); width: 1360px; height: ' + SECTION_HEIGHT + "px; font-family: 'Geologica', Helvetica, sans-serif; }",
    '.req-panel { position: absolute; top: ' + PANEL_TOP + 'px; left: 0; right: 0; bottom: 60px; background: #074e2f; border-radius: 44px; overflow: hidden; box-shadow: 0 30px 60px rgba(7, 78, 47, .25); }',
    /* гигантская фоновая надпись — фирменный приём «дорогих» лендингов */
    '.req-watermark { position: absolute; left: 50%; bottom: -44px; transform: translateX(-50%); font-size: 200px; font-weight: 900; letter-spacing: 8px; line-height: 1; color: rgba(248, 239, 224, .05); white-space: nowrap; pointer-events: none; user-select: none; }',
    '.req-doodle { position: absolute; pointer-events: none; user-select: none; opacity: .5; }',

    /* левая колонка */
    '.req-left { position: absolute; top: 96px; left: 84px; width: 430px; color: #f8efe0; }',
    '.req-chip { display: inline-block; padding: 7px 16px; background: #ef4f1f; border-radius: 8px; transform: rotate(-3deg); font-size: 14px; font-weight: 700; letter-spacing: 1px; color: #fff; }',
    '.req-title { margin: 26px 0 0; font-size: 54px; font-weight: 900; line-height: 1.08; letter-spacing: 1px; color: #f8efe0; }',
    '.req-title em { font-style: normal; color: #fdbb03; }',
    '.req-text { margin: 20px 0 0; font-size: 17px; font-weight: 300; line-height: 1.6; color: rgba(248, 239, 224, .82); }',
    '.req-phone { display: inline-block; margin-top: 28px; font-size: 24px; font-weight: 700; color: #f8efe0; text-decoration: none; border-bottom: 2px dashed rgba(253, 187, 3, .6); padding-bottom: 4px; transition: color .25s ease, border-color .25s ease; }',
    '.req-phone:hover { color: #fdbb03; border-color: #fdbb03; }',
    '.req-note { margin: 18px 0 0; font-size: 14px; color: rgba(248, 239, 224, .5); }',

    /* полароидная карточка-форма */
    '.req-card { position: absolute; top: 74px; left: 570px; width: 400px; background: #fffdf8; border-radius: 18px; padding: 46px 36px 34px; transform: rotate(-1.4deg); box-shadow: 0 24px 50px rgba(0, 0, 0, .28); }',
    '.req-tape { position: absolute; top: -16px; left: 50%; width: 128px; height: 34px; transform: translateX(-50%) rotate(3deg); background: rgba(253, 187, 3, .85); border-radius: 4px; box-shadow: 0 3px 8px rgba(0,0,0,.12); }',
    '.req-field { display: block; width: 100%; margin-top: 22px; padding: 10px 2px; background: none; border: none; border-bottom: 2px solid #e4d9c4; font-family: inherit; font-size: 17px; color: #1a1a1a; outline: none; box-sizing: border-box; transition: border-color .25s ease; }',
    '.req-field::placeholder { color: #b1a68d; font-weight: 300; }',
    '.req-field:focus { border-color: #116c42; }',
    'textarea.req-field { resize: none; height: 64px; line-height: 1.45; }',
    '.req-field.req-err { border-color: #ab1b3f; }',
    '.req-card-title { margin: 0; font-size: 24px; font-weight: 800; color: #1a1a1a; }',
    '.req-card-sub { margin: 6px 0 0; font-size: 14px; font-weight: 300; color: #777; }',

    /* кнопка — фирменная скошенная подложка */
    '.req-submit { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 54px; margin-top: 30px; padding: 0; background: none; border: none; cursor: pointer; font-family: inherit; }',
    '.req-submit-bg { position: absolute; top: 0; bottom: 0; left: 8px; width: calc(100% - 16px); background: #ef4f1f; border-radius: 18px; transform: skewX(-12.53deg); transition: scale .3s ease, background .3s ease; }',
    '.req-submit:hover .req-submit-bg { scale: 1.04; background: #d94314; }',
    '.req-submit span { position: relative; z-index: 1; color: #fff; font-size: 19px; font-weight: 600; }',
    '.req-privacy { margin: 14px 0 0; font-size: 12px; line-height: 1.5; color: #a99e86; text-align: center; }',

    /* состояние «заявка отправлена» */
    '.req-done { display: none; text-align: center; padding: 36px 0 24px; }',
    '.req-done-mark { width: 74px; height: 74px; margin: 0 auto; border-radius: 50%; background: #116c42; color: #fff; font-size: 36px; line-height: 74px; }',
    '.req-done h3 { margin: 20px 0 0; font-size: 24px; font-weight: 800; color: #1a1a1a; }',
    '.req-done p { margin: 10px 0 0; font-size: 15px; font-weight: 300; color: #777; line-height: 1.5; }',
    '.req-card.is-done form { display: none; }',
    '.req-card.is-done .req-done { display: block; }',

    /* Сериков: поднимается из-за нижнего края панели, указывает на форму */
    '.req-serikov { position: absolute; bottom: 0; right: -30px; width: 400px; pointer-events: none; user-select: none; filter: drop-shadow(-18px 12px 30px rgba(0, 0, 0, .35)); }',
    '.req-bubble { position: absolute; right: 96px; bottom: 570px; padding: 12px 20px; background: #f8efe0; border-radius: 18px 18px 18px 4px; font-size: 16px; font-weight: 600; color: #074e2f; transform: rotate(-3deg); box-shadow: 0 8px 20px rgba(0,0,0,.2); }',

    /* появление по скроллу — та же пластика, что у «Хитов продаж» */
    '@media (prefers-reduced-motion: no-preference) {',
    '  .req-reveal { opacity: 0; transform: translateY(34px); transition: opacity .65s ease, transform .75s cubic-bezier(.22, 1, .36, 1); transition-delay: var(--delay, 0s); }',
    '  .req-section.is-shown .req-reveal { opacity: 1; transform: translateY(0); }',
    /* карточка «ложится» со своим наклоном */
    '  .req-card.req-reveal { transform: translateY(44px) rotate(2deg); }',
    '  .req-section.is-shown .req-card.req-reveal { transform: translateY(0) rotate(-1.4deg); }',
    /* Сериков выезжает снизу из-за края панели */
    '  .req-serikov.req-reveal { transform: translateY(70%); transition-duration: .9s; }',
    '  .req-section.is-shown .req-serikov.req-reveal { transform: translateY(0); }',
    '  .req-bubble { opacity: 0; scale: .5; transform-origin: bottom right; transition: opacity .4s ease, scale .5s cubic-bezier(.34, 1.56, .64, 1); transition-delay: 1.1s; }',
    '  .req-section.is-shown .req-bubble { opacity: 1; scale: 1; }',
    /* после отправки: Сериков ныряет за край панели и выныривает с новой картинкой */
    '  .req-section.is-shown .req-serikov.req-dip { transform: translateY(78%); transition-duration: .45s; transition-timing-function: ease-in; }',
    '  @keyframes reqBubblePop { 0% { opacity: 0; scale: .4; } 70% { scale: 1.08; } 100% { opacity: 1; scale: 1; } }',
    '  .req-section.is-shown .req-bubble.req-bubble-pop { animation: reqBubblePop .5s cubic-bezier(.34, 1.56, .64, 1) both; transition: none; }',
    '}'
  ].join('\n');

  function el(tag, cls, attrs) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (attrs) Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  function buildForm(card) {
    var form = el('form');
    form.noValidate = true;

    var name = el('input', 'req-field', { type: 'text', name: 'name', placeholder: 'Как вас зовут?', autocomplete: 'name' });
    var phone = el('input', 'req-field', { type: 'tel', name: 'phone', placeholder: '+7 ___ ___ __ __', autocomplete: 'tel' });
    var comment = el('textarea', 'req-field', { name: 'comment', placeholder: 'Что вас интересует? Кофе для дома, офиса, кофейни…', rows: '2' });

    var submit = el('button', 'req-submit', { type: 'submit' });
    var submitBg = el('div', 'req-submit-bg');
    var submitText = el('span');
    submitText.textContent = 'Оставить заявку';
    submit.append(submitBg, submitText);

    var privacy = el('p', 'req-privacy');
    privacy.textContent = 'Нажимая кнопку, вы соглашаетесь на обработку персональных данных';

    form.append(name, phone, comment, submit, privacy);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      [name, phone].forEach(function (f) {
        var bad = !f.value.trim();
        f.classList.toggle('req-err', bad);
        if (bad) ok = false;
      });
      if (!ok) return;
      // бэкенда пока нет — фиксируем состояние «принято»
      card.classList.add('is-done');
      // Сериков ныряет за край панели и поднимается с довольным жестом
      var serikov = document.querySelector('.req-serikov');
      var bubble = document.querySelector('.req-bubble');
      if (serikov) {
        serikov.classList.add('req-dip');
        // пузырь прячется на время нырка; keyframes попа перебьют inline-opacity
        if (bubble) bubble.style.opacity = '0';
        setTimeout(function () {
          serikov.src = '/assets/images/request/serikov-like.png';
          serikov.classList.remove('req-dip');
          if (bubble) {
            bubble.textContent = 'Спасибо! Скоро позвоню';
            bubble.classList.add('req-bubble-pop');
          }
        }, 450);
      }
    });
    [name, phone].forEach(function (f) {
      f.addEventListener('input', function () { f.classList.remove('req-err'); });
    });
    return form;
  }

  function buildSection(top) {
    var section = el('section', 'req-section', { 'aria-label': 'Оставить заявку' });
    section.style.top = top + 'px';
    section.style.left = 'calc(50% - 680px)'; // маркер для скрипта адаптации

    var panel = el('div', 'req-panel req-reveal');

    var watermark = el('div', 'req-watermark', { 'aria-hidden': 'true' });
    watermark.textContent = 'SERIKOV';

    // бежевые дудлы из hits — на тёмном зелёном читаются как узор
    var doodles = [
      { img: '/assets/images/hits/Vector.png',   w: 170, top: 40,  left: 430, rotate: 18 },
      { img: '/assets/images/hits/Vector-2.png', w: 120, top: 430, left: 60,  rotate: -10 },
      { img: '/assets/images/hits/Vector-1.png', w: 120, top: 60,  left: 1120, rotate: 8 }
    ];
    doodles.forEach(function (d) {
      var img = el('img', 'req-doodle', { src: d.img, alt: '', 'aria-hidden': 'true' });
      img.style.cssText = 'width:' + d.w + 'px;top:' + d.top + 'px;left:' + d.left + 'px;transform:rotate(' + d.rotate + 'deg);';
      panel.appendChild(img);
    });

    var left = el('div', 'req-left');
    var chip = el('div', 'req-chip req-reveal');
    chip.textContent = 'ОТВЕТИМ ЗА 15 МИНУТ';
    chip.style.setProperty('--delay', '.15s');
    var title = el('h2', 'req-title req-reveal');
    title.innerHTML = 'ДАВАЙТЕ<br>ПОДБЕРЁМ <em>ВАШ</em> КОФЕ';
    title.style.setProperty('--delay', '.25s');
    var text = el('p', 'req-text req-reveal');
    text.textContent = 'Расскажите, для чего вам кофе — для дома, офиса или кофейни. Подберём сорта под ваш вкус и способ заваривания, привезём свежую обжарку.';
    text.style.setProperty('--delay', '.35s');
    var phone = el('a', 'req-phone req-reveal', { href: 'tel:+77057937000' });
    phone.textContent = '+7 705 793 70 00';
    phone.style.setProperty('--delay', '.45s');
    var note = el('p', 'req-note req-reveal');
    note.textContent = 'Или позвоните сами — с 9:00 до 21:00, без выходных';
    note.style.setProperty('--delay', '.5s');
    left.append(chip, title, text, phone, note);

    var card = el('div', 'req-card req-reveal');
    card.style.setProperty('--delay', '.35s');
    var tape = el('div', 'req-tape', { 'aria-hidden': 'true' });
    var cardTitle = el('h3', 'req-card-title');
    cardTitle.textContent = 'Оставьте заявку';
    var cardSub = el('p', 'req-card-sub');
    cardSub.textContent = 'Перезвоним и всё расскажем';
    var done = el('div', 'req-done');
    var mark = el('div', 'req-done-mark');
    mark.textContent = '✓';
    var doneTitle = el('h3');
    doneTitle.textContent = 'Заявка принята!';
    var doneText = el('p');
    doneText.textContent = 'Уже завариваем кофе и набираем ваш номер. Перезвоним в течение 15 минут.';
    done.append(mark, doneTitle, doneText);
    card.append(tape, cardTitle, cardSub, buildForm(card), done);

    var serikov = el('img', 'req-serikov req-reveal', {
      src: '/assets/images/request/serikov.png',
      alt: 'Основатель Serikov Coffee указывает на форму заявки'
    });
    serikov.style.setProperty('--delay', '.5s');
    var bubble = el('div', 'req-bubble');
    bubble.textContent = 'Отвечу лично!';

    panel.append(watermark, left, card, serikov, bubble);
    section.appendChild(panel);
    return section;
  }

  function insert() {
    var canvas = document.getElementById('main-container');
    if (canvas.querySelector('.req-section')) return;

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    // низ страницы с учётом врезки hits.js
    var pageBottom = window.__pageHeight || canvas.offsetHeight;
    var section = buildSection(pageBottom);
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
      }, { threshold: 0.2 });
      io.observe(section);
    } else {
      section.classList.add('is-shown');
    }
  }

  function boot() { // ждём React и hits.js (та секция растит __pageHeight)
    var canvas = document.getElementById('main-container');
    if (canvas && canvas.querySelector('.hits-section')) { insert(); return; }
    var tries = 0;
    var iv = setInterval(function () {
      canvas = document.getElementById('main-container');
      if ((canvas && canvas.querySelector('.hits-section')) || ++tries > 40) {
        clearInterval(iv);
        if (canvas) insert();
      }
    }, 150);
  }

  boot();
})();
