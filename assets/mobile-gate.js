/**
 * Макет сайта — фиксированный холст под десктоп, адаптации под мобильные
 * экраны пока нет. Вместо сломанной вёрстки на узких экранах (< 784px)
 * показываем отдельный экран-заглушку с просьбой открыть сайт на компьютере.
 *
 * Скрипт подключён без defer и стоит в <head> перед бандлом — класс
 * html.mobile-gate-on и CSS-правило, скрывающее всё содержимое <body>,
 * ставятся синхронно ДО того, как <body> вообще появится в разметке.
 * Так контент ни на миг не успевает отрисоваться на узком экране.
 */
(function () {
  var BREAKPOINT = 784;
  var narrow = window.innerWidth < BREAKPOINT;

  var style = document.createElement('style');
  style.textContent =
    'html.mobile-gate-on body > *:not(#mobile-gate) { display: none !important; }' +
    '#mobile-gate { position: fixed; inset: 0; z-index: 99999; display: flex; flex-direction: column; ' +
    'align-items: center; justify-content: center; gap: 18px; padding: 32px; box-sizing: border-box; ' +
    "background: #f8efe0; text-align: center; font-family: 'Geologica', Helvetica, sans-serif; }" +
    '#mobile-gate img { width: 56px; height: 74px; }' +
    '#mobile-gate h1 { margin: 0; font-size: 22px; font-weight: 800; color: #074e2f; }' +
    '#mobile-gate p { margin: 0; max-width: 320px; font-size: 15px; font-weight: 300; line-height: 1.6; color: #4a4a42; }' +
    '#mobile-gate svg { stroke: #074e2f; }';
  document.head.appendChild(style);

  if (narrow) document.documentElement.classList.add('mobile-gate-on');

  function insertGate() {
    if (document.getElementById('mobile-gate')) return;
    var gate = document.createElement('div');
    gate.id = 'mobile-gate';
    gate.innerHTML =
      '<img src="/assets/images/logo-no-text.svg" alt="Serikov Coffee">' +
      '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 20h8"/><path d="M12 18v2"/></svg>' +
      '<h1>Откройте сайт на компьютере</h1>' +
      '<p>Мы ещё не адаптировали Serikov Coffee под мобильные экраны — зайдите с ноутбука или ПК, чтобы всё выглядело как надо.</p>';
    document.body.appendChild(gate);
  }

  if (narrow) {
    if (document.body) insertGate();
    else document.addEventListener('DOMContentLoaded', insertGate);
  }

  function check() {
    var isNarrow = window.innerWidth < BREAKPOINT;
    if (isNarrow) {
      document.documentElement.classList.add('mobile-gate-on');
      insertGate();
    } else {
      document.documentElement.classList.remove('mobile-gate-on');
      var gate = document.getElementById('mobile-gate');
      if (gate) gate.remove();
    }
  }

  window.addEventListener('resize', check);
})();
