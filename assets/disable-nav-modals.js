/**
 * Заглушка для всего, что ведёт на страницы/разделы, которых пока нет:
 * ссылки в шапке («О нас», «Каталог», «Контакты», «Отзывы»), кнопки хиро
 * («Выбрать кофе», «Для бизнеса»), CTA каталога («Смотреть весь каталог»)
 * и одноимённые пункты в футере. Вместо служебной модалки из бандла или
 * молчаливого игнорирования клика — понятный тост «раздел в разработке»,
 * чтобы у заказчика не было вопросов, почему кнопка «не работает».
 *
 * Внимание: <header> физически лежит внутри #main-container, так что для
 * шапки ищем именно .closest('header'), без доп. проверок на контейнер.
 */
(function () {
  var CSS = [
    '.nav-stub-toast { position: fixed; top: 24px; left: 50%; z-index: 9999; transform: translateX(-50%) translateY(-16px); ' +
      'display: flex; align-items: center; gap: 10px; padding: 14px 22px; background: #074e2f; color: #f8efe0; ' +
      "border-radius: 14px; box-shadow: 0 16px 40px rgba(7,78,47,.35); font-family: 'Geologica', Helvetica, sans-serif; " +
      'font-size: 15px; font-weight: 500; opacity: 0; transition: opacity .25s ease, transform .25s ease; pointer-events: none; white-space: nowrap; }',
    '.nav-stub-toast.is-on { opacity: 1; transform: translateX(-50%) translateY(0); }',
    '.nav-stub-toast b { color: #fdbb03; font-weight: 700; }',
    '.nav-stub-toast svg { flex-shrink: 0; }'
  ].join('\n');

  var toast, hideTimer;
  function ensureToast() {
    if (toast) return toast;
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    toast = document.createElement('div');
    toast.className = 'nav-stub-toast';
    toast.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fdbb03" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 7v5.5l3.5 2"/></svg>' +
      '<span></span>';
    document.body.appendChild(toast);
    return toast;
  }

  function showStub(label) {
    var t = ensureToast();
    clearTimeout(hideTimer);
    t.querySelector('span').innerHTML = 'Раздел «<b>' + label + '</b>» скоро будет готов';
    t.classList.add('is-on');
    hideTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2200);
  }
  // используется из footer.js для тех же самых пунктов «Каталог» / «О нас»
  window.__navStub = showStub;

  // aria-label / текст конкретных кнопок вне шапки, которые тоже пока никуда не ведут
  var STUB_BUTTON_LABELS = {
    'Выбрать кофе': 'Каталог',
    'Для бизнеса': 'Для бизнеса',
    'Смотреть весь каталог →': 'Каталог'
  };

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a');
    if (link && link.closest('header')) {
      var label = link.textContent.trim();
      if (!label || label === 'Главная') return; // «Главная» и логотип продолжают работать как есть
      e.preventDefault();
      e.stopPropagation();
      showStub(label);
      return;
    }

    var btn = e.target.closest && e.target.closest('button');
    if (btn) {
      var key = (btn.getAttribute('aria-label') || btn.textContent || '').trim();
      if (STUB_BUTTON_LABELS[key]) {
        e.preventDefault();
        e.stopPropagation();
        showStub(STUB_BUTTON_LABELS[key]);
      }
    }
  }, true); // capture phase — раньше, чем обработчик React на самой кнопке/ссылке
})();
