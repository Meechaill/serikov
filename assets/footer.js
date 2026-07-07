/**
 * Футер. Врезается в самый низ страницы после секции заявки (request.js),
 * тем же способом: читает низ из window.__pageHeight и растит холст.
 *
 * Контент курирован относительно старого сайта: оставлены логотип, навигация
 * (ведёт к реальным секциям этой страницы), телефон, Instagram, реквизиты
 * и способы оплаты. Убраны мёртвые разделы старого магазина («Блог»,
 * «Доставка», «Все отделения», Facebook) и устаревший копирайт Coffee-Online.
 */
(function () {
  var FOOTER_HEIGHT = 320;

  // навигация — «Главная» и «Оставить заявку» ведут к реальным секциям
  // этой страницы; «Каталог» и «О нас» — самостоятельные страницы, которых
  // пока нет, поэтому вместо скролла к похожему по теме куску страницы
  // показываем тот же тост-заглушку, что и в шапке (см. disable-nav-modals.js)
  var NAV = [
    { label: 'Главная', target: 'top' },
    { label: 'Каталог', stub: true },
    { label: 'О нас', stub: true },
    { label: 'Оставить заявку', target: '.req-section' }
  ];

  var CSS = [
    /* во всю ширину холста (left:0 + width:1440) — скрипт раскладки сам
       растянет её на всю ширину окна, как бегущую строку */
    '.ftr { position: absolute; left: 0; width: 1440px; height: ' + FOOTER_HEIGHT + "px; background: #074e2f; color: #f8efe0; font-family: 'Geologica', Helvetica, sans-serif; overflow: hidden; }",
    '.ftr-in { position: relative; width: 1360px; margin: 0 auto; padding-top: 56px; box-sizing: border-box; }',
    '.ftr-cols { display: flex; justify-content: space-between; gap: 40px; }',

    /* бренд */
    '.ftr-brand { width: 340px; }',
    '.ftr-logo { display: flex; align-items: center; gap: 14px; }',
    /* logo.svg тёмный — на зелёном перекрашиваем в крем фильтром */
    '.ftr-logo img { width: 46px; height: 46px; filter: brightness(0) saturate(100%) invert(93%) sepia(10%) saturate(432%) hue-rotate(346deg); }',
    '.ftr-logo b { font-size: 20px; font-weight: 800; line-height: 1.15; }',
    '.ftr-tagline { margin: 16px 0 0; font-size: 14px; font-weight: 300; line-height: 1.6; color: rgba(248, 239, 224, .65); }',

    /* навигация */
    '.ftr-nav { display: flex; flex-direction: column; gap: 12px; }',
    '.ftr-h { margin: 0 0 6px; font-size: 15px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #fdbb03; }',
    '.ftr-nav a { font-size: 15px; font-weight: 300; color: rgba(248, 239, 224, .85); text-decoration: none; cursor: pointer; transition: color .2s ease; }',
    '.ftr-nav a:hover { color: #fdbb03; }',

    /* контакты */
    '.ftr-contact { display: flex; flex-direction: column; gap: 12px; }',
    '.ftr-phone { font-size: 21px; font-weight: 700; color: #f8efe0; text-decoration: none; transition: color .2s ease; }',
    '.ftr-phone:hover { color: #fdbb03; }',
    '.ftr-hours { font-size: 13px; font-weight: 300; color: rgba(248, 239, 224, .55); }',
    '.ftr-inst { display: inline-flex; align-items: center; gap: 8px; margin-top: 6px; font-size: 15px; color: rgba(248, 239, 224, .85); text-decoration: none; transition: color .2s ease; }',
    '.ftr-inst:hover { color: #fdbb03; }',
    '.ftr-inst svg { width: 20px; height: 20px; }',

    /* реквизиты и оплата */
    '.ftr-legal { text-align: right; }',
    '.ftr-legal p { margin: 0 0 8px; font-size: 13px; font-weight: 300; line-height: 1.5; color: rgba(248, 239, 224, .55); }',
    '.ftr-pay { display: flex; gap: 8px; justify-content: flex-end; margin-top: 14px; }',
    '.ftr-pay span { padding: 5px 12px; border: 1px solid rgba(248, 239, 224, .25); border-radius: 8px; font-size: 12px; font-weight: 600; letter-spacing: .5px; color: rgba(248, 239, 224, .7); }',

    /* нижняя строка */
    '.ftr-bottom { display: flex; justify-content: space-between; margin-top: 44px; padding-top: 20px; border-top: 1px solid rgba(248, 239, 224, .14); font-size: 13px; font-weight: 300; color: rgba(248, 239, 224, .45); }'
  ].join('\n');

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  function scrollTo(target) {
    if (target === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var t = document.querySelector(target);
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function build(top) {
    var footer = el('footer', 'ftr');
    footer.style.top = top + 'px';
    footer.setAttribute('aria-label', 'Подвал сайта');

    var inner = el('div', 'ftr-in');
    var cols = el('div', 'ftr-cols');

    var brand = el('div', 'ftr-brand');
    var logo = el('div', 'ftr-logo',
      '<img src="/assets/images/logo-no-text.svg" alt=""><b>Serikov<br>Coffee Company</b>');
    var tagline = el('p', 'ftr-tagline',
      'Первая обжарка в Казахстане. Свежеобжаренный спешелти-кофе для дома, офиса и кофеен — с 2009 года.');
    brand.append(logo, tagline);

    var nav = el('nav', 'ftr-nav');
    nav.appendChild(el('p', 'ftr-h', 'Разделы'));
    NAV.forEach(function (item) {
      var a = el('a', '', item.label);
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (item.stub && window.__navStub) window.__navStub(item.label);
        else scrollTo(item.target);
      });
      a.href = '#';
      nav.appendChild(a);
    });

    var contact = el('div', 'ftr-contact');
    contact.appendChild(el('p', 'ftr-h', 'Контакты'));
    var phone = el('a', 'ftr-phone', '+7 (705) 793-70-00');
    phone.href = 'tel:+77057937000';
    var hours = el('p', 'ftr-hours', 'Ежедневно с 9:00 до 21:00');
    // TODO: проверить актуальный адрес Instagram-аккаунта
    var inst = el('a', 'ftr-inst',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>Instagram');
    inst.href = 'https://instagram.com/serikovcoffee';
    inst.target = '_blank';
    inst.rel = 'noopener';
    contact.append(phone, hours, inst);

    var legal = el('div', 'ftr-legal');
    legal.appendChild(el('p', '', 'ТОО «КОФЕ ОНЛАЙН»<br>БИН 160940028757'));
    var pay = el('div', 'ftr-pay');
    pay.append(el('span', '', 'VISA'), el('span', '', 'Mastercard'), el('span', '', 'Kaspi'));
    legal.appendChild(pay);

    cols.append(brand, nav, contact, legal);

    var bottom = el('div', 'ftr-bottom');
    bottom.append(
      el('span', '', '© 2009–' + new Date().getFullYear() + ' Serikov Coffee Company'),
      el('span', '', 'Сделано с любовью к кофе ☕')
    );

    inner.append(cols, bottom);
    footer.appendChild(inner);
    return footer;
  }

  function insert() {
    var canvas = document.getElementById('main-container');
    if (canvas.querySelector('.ftr')) return;

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var pageBottom = window.__pageHeight || canvas.offsetHeight;
    canvas.appendChild(build(pageBottom));

    canvas.style.height = (pageBottom + FOOTER_HEIGHT) + 'px';
    window.__pageHeight = pageBottom + FOOTER_HEIGHT;
    window.dispatchEvent(new Event('resize'));
  }

  function boot() { // ждём секцию новостей — она последняя растит __pageHeight
    var canvas = document.getElementById('main-container');
    if (canvas && canvas.querySelector('.news-section')) { insert(); return; }
    var tries = 0;
    var iv = setInterval(function () {
      canvas = document.getElementById('main-container');
      if ((canvas && canvas.querySelector('.news-section')) || ++tries > 50) {
        clearInterval(iv);
        if (canvas) insert();
      }
    }, 150);
  }

  boot();
})();
