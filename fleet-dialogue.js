// One cancellable transmission per execution; Python output is always plain text.
export function createFleetDialogue(host) {
  const panel = document.createElement('section');
  panel.id = 'fleet-dialogue';
  panel.hidden = true;
  panel.setAttribute('aria-label', '艦隊通訊');
  panel.innerHTML = `<div class="transmission-head"><b>⚓ 先鋒號 · 通訊官</b><button type="button" aria-label="關閉艦隊通訊">×</button></div><div class="transmission-status" role="status"></div><pre class="transmission-output" aria-hidden="true"></pre><span class="transmission-accessible" role="status"></span><div class="transmission-foot"><span>艦隊通訊</span><button type="button">立即顯示全文</button></div>`;
  host.append(panel);
  const status = panel.querySelector('.transmission-status');
  const output = panel.querySelector('pre');
  const accessible = panel.querySelector('.transmission-accessible');
  const reveal = panel.querySelector('.transmission-foot button');
  let timer, message = '', characters = [], cursor = 0;
  function finish() { clearTimeout(timer); output.textContent = message; reveal.hidden = true; }
  function hide() { clearTimeout(timer); panel.hidden = true; accessible.textContent = ''; }
  function type() {
    cursor = Math.min(characters.length, cursor + Math.max(1, Math.ceil(characters.length / 80)));
    output.textContent = characters.slice(0, cursor).join('');
    if (cursor < characters.length) timer = setTimeout(type, 25); else reveal.hidden = true;
  }
  panel.querySelector('.transmission-head button').onclick = hide;
  reveal.onclick = finish;
  return {
    hide,
    show(text, {error = false, passed = false, action = false} = {}) {
      hide(); message = text || '（沒有輸出）'; characters = Array.from(message); cursor = 0;
      status.textContent = action ? '艦隊回報 · 指令已接收' : error ? '通訊未完成 · 請修正程式' : passed ? '執行成功 · 任務訊號確認！' : '執行成功 · 已收到輸出，請核對任務目標';
      panel.dataset.tone = error ? 'error' : 'success';
      output.textContent = ''; accessible.textContent = status.textContent + '：' + message;
      panel.hidden = false; reveal.hidden = false;
      // Recreate the entrance on each run without retaining old animation callbacks.
      panel.getAnimations().forEach(animation => animation.cancel());
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        panel.animate([{opacity: 0, transform: 'translateY(14px) scale(.96)'}, {opacity: 1, transform: 'translateY(0) scale(1)'}], {duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)'});
        type();
      } else finish();
    }
  };
}
