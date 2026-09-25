/* Copy the complete request, including its source-verification instructions. */
(function () {
  'use strict';
  const status = document.getElementById('ai-copy-status');
  async function copyPrompt(button) {
    const id = button.dataset.copyPrompt;
    const prompt = document.getElementById('ap' + id);
    const text = document.getElementById('ai-common').textContent.trim() + '\n\n' + prompt.textContent.trim();
    button.disabled = true;
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        try { await navigator.clipboard.writeText(text); copied = true; } catch { /* Try a selectable fallback. */ }
      }
      if (!copied) {
        const input = document.createElement('textarea');
        input.value = text;
        input.setAttribute('aria-label', '복사할 전체 프롬프트');
        input.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
        document.body.appendChild(input);
        try { input.focus(); input.select(); copied = document.execCommand('copy'); }
        catch { copied = false; }
        finally { input.remove(); button.focus({ preventScroll: true }); }
      }
      if (copied) {
        document.getElementById('ai-manual-copy')?.remove();
        status.textContent = '공통 검증 지침과 선택한 프롬프트를 복사했습니다. [대괄호]를 채워 사용하세요.';
        button.textContent = '복사됨 ✓';
        setTimeout(() => { button.textContent = '프롬프트 복사'; }, 2000);
      } else {
        // Retain the exact complete text for manual copying when clipboard access is denied.
        let manual = document.getElementById('ai-manual-copy');
        if (!manual) {
          manual = document.createElement('textarea');
          manual.id = 'ai-manual-copy'; manual.readOnly = true;
          manual.setAttribute('aria-label', '수동 복사용 전체 프롬프트');
          manual.style.cssText = 'display:block;width:100%;min-height:220px;padding:14px;font:inherit;font-size:16px;color:var(--text);background:var(--bg2);border:1px solid var(--border);border-radius:8px;margin:12px 0';
          status.after(manual);
        }
        manual.value = text; manual.focus(); manual.select();
        status.textContent = '자동 복사를 사용할 수 없습니다. 아래 전체 문장을 선택해 직접 복사해주세요.';
      }
    } finally { button.disabled = false; }
  }
  document.querySelectorAll('[data-copy-prompt]').forEach(button => {
    button.addEventListener('click', () => copyPrompt(button));
  });
})();
