/**
 * k-AIzen Site-Chatbot Widget — Mönch-an-der-Mauer-Edition
 * --------------------------------------------------------
 * Closed-State: Bar links unten mit Mönch-Avatar (LinkedIn-Style)
 * Open-State:   Modal mit Mönch oben + Chat auf Mauer-Fläche, Slide-Up-Animation
 *
 * Backend-URL via window.KAIZEN_BOT_URL — fallback auf same-origin /api/chat.
 * Defensive mount: prüft /health vor Render.
 */

(function () {
  const BOT_URL =
    (typeof window !== 'undefined' && window.KAIZEN_BOT_URL) || '/api/chat';

  const SUMI_INK = '#1F2933';
  const EMBER = '#E85A2B';
  const CREAM = '#F5F0E8';
  const CREAM_DEEP = '#EDE6D8';
  const WALL = '#DDC9A0'; // Mauer-Beige aus dem Bild
  const WALL_DARK = '#C7B186'; // Mauer-Schatten / Border

  /** @type {Array<{role:'user'|'assistant', content:string}>} */
  const history = [];
  let isOpen = false;
  let isSending = false;

  // ---------- Mount ----------
  async function mount() {
    if (document.getElementById('kaizen-bot-root')) return;

    const healthUrl = BOT_URL.replace(/\/chat$/, '/health');
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 3000);
      const r = await fetch(healthUrl, { signal: ctrl.signal });
      clearTimeout(timeout);
      if (!r.ok) {
        console.info('[kaizen-bot] backend not ready, widget hidden');
        return;
      }
    } catch (err) {
      console.info('[kaizen-bot] backend unreachable, widget hidden');
      return;
    }

    const root = document.createElement('div');
    root.id = 'kaizen-bot-root';
    document.body.appendChild(root);

    injectStyles();
    renderBar(root);
    renderModal(root);
  }

  function injectStyles() {
    if (document.getElementById('kaizen-bot-styles')) return;
    const style = document.createElement('style');
    style.id = 'kaizen-bot-styles';
    style.textContent = `
      #kaizen-bot-root {
        position: fixed; bottom: 24px; left: 24px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, system-ui, sans-serif;
      }

      /* ---------- Closed Bar (LinkedIn-style) ---------- */
      .kbot-bar {
        display: flex; align-items: center;
        background: ${CREAM};
        border: 1px solid ${WALL_DARK};
        border-radius: 36px;
        padding: 6px 18px 6px 6px;
        cursor: pointer;
        box-shadow: 0 12px 28px -8px rgba(31,41,51,0.22), 0 4px 10px rgba(31,41,51,0.10);
        transition: transform 200ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms;
        gap: 12px;
      }
      .kbot-bar:hover {
        transform: translateY(-2px);
        box-shadow: 0 18px 36px -8px rgba(31,41,51,0.28), 0 6px 14px rgba(31,41,51,0.14);
      }
      .kbot-bar-avatar {
        width: 56px; height: 56px;
        border-radius: 50%;
        overflow: hidden;
        background: ${WALL};
        flex-shrink: 0;
        position: relative;
      }
      .kbot-bar-avatar img {
        position: absolute;
        width: 200%; height: auto;
        top: -8%; left: -50%;
        /* Bild ist 800x450, Mönch sitzt oben-mittig.
           Bei 200% Width und top -8% zeigt der avatar nur Kopf+Schulter des Mönchs */
        pointer-events: none;
      }
      .kbot-bar-text {
        display: flex; flex-direction: column;
        gap: 2px;
      }
      .kbot-bar-title {
        font-size: 14px; font-weight: 600;
        color: ${SUMI_INK};
        line-height: 1.1;
      }
      .kbot-bar-sub {
        font-size: 12px; color: rgba(31,41,51,0.62);
        line-height: 1.1;
      }
      .kbot-bar-pulse {
        width: 8px; height: 8px; border-radius: 50%;
        background: #4A9B7A;
        margin-left: auto;
        box-shadow: 0 0 0 0 rgba(74,155,122,0.5);
        animation: kbot-pulse 2.4s cubic-bezier(0.22,1,0.36,1) infinite;
      }
      @keyframes kbot-pulse {
        0% { box-shadow: 0 0 0 0 rgba(74,155,122,0.5); }
        70% { box-shadow: 0 0 0 8px rgba(74,155,122,0); }
        100% { box-shadow: 0 0 0 0 rgba(74,155,122,0); }
      }

      /* ---------- Open Modal (Mauer + Mönch) ---------- */
      .kbot-modal {
        position: fixed; bottom: 24px; left: 24px;
        width: min(380px, calc(100vw - 48px));
        height: min(620px, calc(100vh - 80px));
        background: ${WALL};
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 32px 80px -16px rgba(31,41,51,0.42), 0 12px 24px rgba(31,41,51,0.18);
        display: none;
        flex-direction: column;
        transform: translateY(20px);
        opacity: 0;
        transition: transform 480ms cubic-bezier(0.22,1,0.36,1), opacity 360ms cubic-bezier(0.22,1,0.36,1);
      }
      .kbot-modal.open {
        display: flex;
        transform: translateY(0);
        opacity: 1;
      }

      /* Mönch oben — image absolute on top */
      .kbot-monk-layer {
        position: relative;
        width: 100%;
        height: 220px;
        flex-shrink: 0;
        background: linear-gradient(to bottom, ${CREAM} 0%, ${CREAM} 60%, ${WALL} 100%);
        overflow: hidden;
      }
      .kbot-monk-img {
        position: absolute;
        top: -4px; left: 50%;
        transform: translateX(-50%);
        width: 100%; height: auto;
        pointer-events: none;
        filter: drop-shadow(0 4px 8px rgba(31,41,51,0.10));
      }
      .kbot-close {
        position: absolute;
        top: 12px; right: 12px;
        width: 32px; height: 32px;
        border-radius: 50%;
        background: rgba(31,41,51,0.78);
        color: ${CREAM};
        border: none;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        font-size: 18px; line-height: 1;
        backdrop-filter: blur(6px);
        z-index: 5;
        transition: background 160ms;
      }
      .kbot-close:hover { background: ${SUMI_INK}; }

      /* Chat-Bereich auf der Mauer */
      .kbot-content {
        flex: 1;
        display: flex; flex-direction: column;
        background: ${WALL};
        position: relative;
        min-height: 0;
      }
      /* Mauer-Texture hint via subtle inset shadow */
      .kbot-content::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 12px;
        background: linear-gradient(to bottom, rgba(31,41,51,0.06), transparent);
        pointer-events: none;
      }

      .kbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px 18px;
        display: flex; flex-direction: column;
        gap: 10px;
      }
      .kbot-msg {
        max-width: 86%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px; line-height: 1.5;
        white-space: pre-wrap;
        word-wrap: break-word;
        box-shadow: 0 2px 6px rgba(31,41,51,0.06);
      }
      .kbot-msg.user {
        background: ${SUMI_INK}; color: ${CREAM};
        align-self: flex-end;
        border-bottom-right-radius: 4px;
      }
      .kbot-msg.assistant {
        background: ${CREAM}; color: ${SUMI_INK};
        align-self: flex-start;
        border-bottom-left-radius: 4px;
      }
      .kbot-msg.assistant a { color: ${EMBER}; text-decoration: underline; }
      .kbot-msg.system {
        background: transparent; color: ${SUMI_INK};
        align-self: center;
        font-size: 12px; font-style: italic;
        opacity: 0.7;
        text-align: center;
        max-width: 100%;
        box-shadow: none;
        padding: 4px 0;
      }
      .kbot-msg.error {
        background: rgba(232,90,43,0.14);
        color: #B53C12; border: 1px solid rgba(232,90,43,0.5);
        align-self: center; font-size: 13px;
      }

      .kbot-suggestions {
        padding: 0 18px 8px;
        display: flex; flex-wrap: wrap; gap: 6px;
      }
      .kbot-suggestions button {
        background: ${CREAM};
        color: ${SUMI_INK};
        border: 1px solid rgba(31,41,51,0.16);
        border-radius: 16px;
        padding: 6px 12px;
        font-size: 12px;
        cursor: pointer;
        font-family: inherit;
        transition: background 160ms, border-color 160ms, transform 160ms;
      }
      .kbot-suggestions button:hover {
        background: ${SUMI_INK}; color: ${CREAM};
        border-color: ${SUMI_INK};
        transform: translateY(-1px);
      }

      .kbot-input-row {
        padding: 12px;
        background: ${WALL};
        border-top: 1px solid rgba(31,41,51,0.10);
        display: flex; gap: 8px;
        flex-shrink: 0;
      }
      .kbot-input-row input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid rgba(31,41,51,0.18);
        border-radius: 10px;
        font-size: 14px;
        font-family: inherit;
        background: ${CREAM};
        color: ${SUMI_INK};
        outline: none;
        transition: border-color 160ms;
      }
      .kbot-input-row input:focus { border-color: ${SUMI_INK}; }
      .kbot-input-row button {
        background: ${SUMI_INK}; color: ${CREAM};
        border: none; border-radius: 10px;
        padding: 10px 16px;
        font-size: 14px; font-weight: 600;
        cursor: pointer; font-family: inherit;
        transition: background 160ms;
      }
      .kbot-input-row button:disabled { opacity: 0.4; cursor: not-allowed; }
      .kbot-input-row button:not(:disabled):hover { background: ${EMBER}; }

      .kbot-typing {
        align-self: flex-start;
        background: ${CREAM};
        padding: 12px 16px; border-radius: 12px;
        display: flex; gap: 6px;
        box-shadow: 0 2px 6px rgba(31,41,51,0.06);
      }
      .kbot-typing span {
        width: 6px; height: 6px;
        background: ${SUMI_INK}; opacity: 0.4;
        border-radius: 50%;
        animation: kbot-typing 1.2s infinite;
      }
      .kbot-typing span:nth-child(2) { animation-delay: 0.2s; }
      .kbot-typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes kbot-typing {
        0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
        30% { opacity: 1; transform: translateY(-3px); }
      }

      @media (max-width: 480px) {
        #kaizen-bot-root { bottom: 16px; left: 16px; right: 16px; }
        .kbot-bar { width: fit-content; }
        .kbot-modal {
          left: 16px; right: 16px; bottom: 16px;
          width: auto;
          height: min(70vh, calc(100vh - 100px));
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ---------- Bar (closed state) ----------
  function renderBar(root) {
    const bar = document.createElement('button');
    bar.id = 'kaizen-bot-bar';
    bar.className = 'kbot-bar';
    bar.setAttribute('aria-label', 'Chat mit dem k-AIzen-Mönch öffnen');
    bar.innerHTML = `
      <div class="kbot-bar-avatar">
        <img src="/widgets/monk-chat.png" alt="" />
      </div>
      <div class="kbot-bar-text">
        <span class="kbot-bar-title">Frag den Mönch</span>
        <span class="kbot-bar-sub">k-AIzen Bot · Online</span>
      </div>
      <span class="kbot-bar-pulse"></span>
    `;
    bar.onclick = openModal;
    root.appendChild(bar);
  }

  // ---------- Modal (open state) ----------
  function renderModal(root) {
    const modal = document.createElement('div');
    modal.id = 'kaizen-bot-modal';
    modal.className = 'kbot-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'k-AIzen Chat');
    modal.innerHTML = `
      <div class="kbot-monk-layer">
        <button class="kbot-close" aria-label="Chat schließen">×</button>
        <img class="kbot-monk-img" src="/widgets/monk-chat.png" alt="" />
      </div>
      <div class="kbot-content">
        <div class="kbot-messages" id="kbot-messages"></div>
        <div class="kbot-suggestions" id="kbot-suggestions"></div>
        <div class="kbot-input-row">
          <input type="text" id="kbot-input" placeholder="Frage stellen…" maxlength="2000" autocomplete="off">
          <button id="kbot-send" aria-label="Senden">→</button>
        </div>
      </div>
    `;
    root.appendChild(modal);

    modal.querySelector('.kbot-close').onclick = closeModal;

    const input = modal.querySelector('#kbot-input');
    const sendBtn = modal.querySelector('#kbot-send');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send(input.value);
      }
    });
    sendBtn.onclick = () => send(input.value);

    appendAssistant(
      'Ich bin der k-AIzen-Bot. Frag mich was zu k-AIzen — Pricing, Module, Methodik, Vertrauen — oder lass uns ein Mini-Audit durchgehen.',
    );
    renderSuggestions([
      'Was ist k-AIzen?',
      'Was kostet das Audit?',
      'Mini-Audit starten',
    ]);
  }

  // ---------- Open / Close ----------
  function openModal() {
    if (isOpen) return;
    isOpen = true;
    document.getElementById('kaizen-bot-bar').style.display = 'none';
    const modal = document.getElementById('kaizen-bot-modal');
    modal.classList.add('open');
    setTimeout(() => document.getElementById('kbot-input')?.focus(), 240);
  }
  function closeModal() {
    if (!isOpen) return;
    isOpen = false;
    document.getElementById('kaizen-bot-modal').classList.remove('open');
    setTimeout(() => {
      const bar = document.getElementById('kaizen-bot-bar');
      if (bar) bar.style.display = 'flex';
    }, 380);
  }

  // ---------- Message rendering ----------
  function appendUser(text) {
    const msg = document.createElement('div');
    msg.className = 'kbot-msg user';
    msg.textContent = text;
    document.getElementById('kbot-messages').appendChild(msg);
    scrollDown();
  }
  function appendAssistant(text) {
    const msg = document.createElement('div');
    msg.className = 'kbot-msg assistant';
    msg.innerHTML = formatAssistantText(text);
    document.getElementById('kbot-messages').appendChild(msg);
    scrollDown();
  }
  function appendError(text) {
    const msg = document.createElement('div');
    msg.className = 'kbot-msg error';
    msg.textContent = text;
    document.getElementById('kbot-messages').appendChild(msg);
    scrollDown();
  }
  function showTyping() {
    const t = document.createElement('div');
    t.id = 'kbot-typing';
    t.className = 'kbot-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    document.getElementById('kbot-messages').appendChild(t);
    scrollDown();
  }
  function hideTyping() {
    document.getElementById('kbot-typing')?.remove();
  }
  function scrollDown() {
    const el = document.getElementById('kbot-messages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  function formatAssistantText(text) {
    const esc = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return esc
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\n/g, '<br>');
  }

  function renderSuggestions(items) {
    const el = document.getElementById('kbot-suggestions');
    if (!el) return;
    el.innerHTML = '';
    items.forEach((label) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.onclick = () => send(label);
      el.appendChild(btn);
    });
  }
  function clearSuggestions() {
    const el = document.getElementById('kbot-suggestions');
    if (el) el.innerHTML = '';
  }

  // ---------- Send ----------
  async function send(rawText) {
    const text = String(rawText || '').trim();
    if (!text || isSending) return;
    isSending = true;

    const input = document.getElementById('kbot-input');
    const sendBtn = document.getElementById('kbot-send');
    if (input) input.value = '';
    if (sendBtn) sendBtn.disabled = true;

    appendUser(text);
    clearSuggestions();
    showTyping();

    history.push({ role: 'user', content: text });

    try {
      const response = await fetch(BOT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: history.slice(0, -1),
        }),
      });

      hideTyping();

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        appendError(`Verbindung wackelt — versuch's gleich nochmal. Direkt: kontakt@k-aizen.de`);
        console.error('[kaizen-bot]', response.status, errorBody);
        return;
      }

      const data = await response.json();
      if (data?.reply) {
        appendAssistant(data.reply);
        history.push({ role: 'assistant', content: data.reply });
      } else {
        appendError('Keine Antwort empfangen — versuch\'s nochmal.');
      }
    } catch (err) {
      hideTyping();
      appendError('Verbindung fehlgeschlagen. Direkt: kontakt@k-aizen.de');
      console.error('[kaizen-bot] fetch failed', err);
    } finally {
      isSending = false;
      if (sendBtn) sendBtn.disabled = false;
      if (input) input.focus();
    }
  }

  // ---------- Init ----------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
