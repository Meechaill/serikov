/**
 * Плавающие кнопки связи внизу слева — «Позвонить» и «Написать в WhatsApp».
 * Видны на любой странице/скролле поверх всего контента.
 */
(function () {
  var PHONE = '+7 705 793 70 00';
  var PHONE_TEL = 'tel:+77057937000';
  var WHATSAPP = 'https://wa.me/77057937000';

  var CSS = [
    '.fcb-wrap { position: fixed; left: 16px; bottom: 16px; z-index: 9998; display: flex; flex-direction: column; gap: 8px; ' +
      "font-family: 'Geologica', Helvetica, sans-serif; }",
    '.fcb { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px 8px 10px; border-radius: 999px; ' +
      'text-decoration: none; font-size: 12.5px; font-weight: 600; white-space: nowrap; box-shadow: 0 8px 20px rgba(0,0,0,.16); ' +
      'transition: transform .2s ease, box-shadow .2s ease; }',
    '.fcb:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 12px 26px rgba(0,0,0,.22); }',
    '.fcb-call { background: #074e2f; color: #f8efe0; }',
    '.fcb-wa { background: #25d366; color: #06371f; }',
    '.fcb svg { flex-shrink: 0; overflow: visible; }',
    '.fcb img { width: 16px; height: 16px; flex-shrink: 0; }',
    '@media (max-width: 480px) { .fcb-wrap { left: 10px; bottom: 10px; } .fcb span { display: none; } .fcb { padding: 9px; } }'
  ].join('\n');

  function boot() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var wrap = document.createElement('div');
    wrap.className = 'fcb-wrap';

    var call = document.createElement('a');
    call.className = 'fcb fcb-call';
    call.href = PHONE_TEL;
    call.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
      '<span>' + PHONE + '</span>';

    var wa = document.createElement('a');
    wa.className = 'fcb fcb-wa';
    wa.href = WHATSAPP;
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.innerHTML =
      '<img src="/assets/images/whatsapp.svg" alt="">' +
      '<span>Написать в WhatsApp</span>';

    wrap.append(call, wa);
    document.body.appendChild(wrap);
  }

  boot();
})();
