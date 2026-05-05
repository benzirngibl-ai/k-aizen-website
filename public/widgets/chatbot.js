/**
 * k-AIzen Site-Chatbot Widget — Mönch-an-der-Mauer (v2)
 * ------------------------------------------------------
 * Single Container, rechts unten gedockt. Closed: 88px tall (nur Mönch peekt
 * über die Mauer-Kante). Click → height grows auf 620px → Mauer-Fläche unter
 * dem Mönch wird zum Chat-Container. Mönch bleibt oben sichtbar.
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
  const WALL = '#DDC9A0'; // Mauer-Beige aus dem Bild
  const BAR_HEIGHT = 88;
  const IMAGE_HEIGHT = 202; // 360 width × 450/800 ratio

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

    injectStyles();
    renderContainer();
  }

  function injectStyles() {
    if (document.getElementById('kaizen-bot-styles')) return;
    const style = document.createElement('style');
    style.id = 'kaizen-bot-styles';
    style.textContent = `
      #kaizen-bot-root {
        position: fixed;
        bottom: 0;
        right: 24px;
        width: 360px;
        height: ${BAR_HEIGHT}px;
        background: ${WALL};
        border-radius: 18px 18px 0 0;
        overflow: hidden;
        box-shadow:
          0 -16px 40px -8px rgba(31,41,51,0.24),
          0 -4px 12px rgba(31,41,51,0.10);
        transition: height 560ms cubic-bezier(0.22, 1, 0.36, 1);
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, system-ui, sans-serif;
      }
      #kaizen-bot-root.open {
        height: min(620px, calc(100vh - 40px));
      }

      /* Mönch-Image-Sektion — oben, immer in voller Bild-Höhe.
         Im closed-state nur die top 88px sichtbar (overflow clip). */
      .kbot-image-section {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: ${IMAGE_HEIGHT}px;
        pointer-events: none;
      }
      .kbot-image-section img {
        width: 100%;
        height: auto;
        display: block;
      }

      /* Toggle-Klick-Fläche (closed-state) — über der Bar */
      .kbot-handle {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: ${BAR_HEIGHT}px;
        cursor: pointer;
        z-index: 5;
        background: linear-gradient(
          to bottom,
          rgba(245,240,232,0.0) 0%,
          rgba(245,240,232,0.0) 60%,
          rgba(31,41,51,0.06) 100%
        );
        transition: opacity 280ms;
      }
      #kaizen-bot-root.open .kbot-handle {
        opacity: 0;
        pointer-events: none;
      }

      /* Online-Indicator unten-rechts auf der Bar */
      .kbot-handle-label {
        position: absolute;
        bottom: 8px; right: 14px;
        display: flex; align-items: center; gap: 6px;
        font-size: 11px; font-weight: 600;
        color: rgba(31,41,51,0.78);
        background: rgba(245,240,232,0.78);
        padding: 4px 10px;
        border-radius: 999px;
        backdrop-filter: blur(4px);
      }
      .kbot-handle-pulse {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: #4A9B7A;
        box-shadow: 0 0 0 0 rgba(74,155,122,0.5);
        animation: kbot-pulse 2.4s cubic-bezier(0.22,1,0.36,1) infinite;
      }
      @keyframes kbot-pulse {
        0% { box-shadow: 0 0 0 0 rgba(74,155,122,0.5); }
        70% { box-shadow: 0 0 0 7px rgba(74,155,122,0); }
        100% { box-shadow: 0 0 0 0 rgba(74,155,122,0); }
      }

      /* Close-Button (open-state) */
      .kbot-close {
        position: absolute;
        top: 12px; right: 12px;
        width: 32px; height: 32px;
        border-radius: 50%;
        background: rgba(31,41,51,0.82);
        color: ${CREAM};
        border: none;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        font-size: 18px; line-height: 1;
        z-index: 6;
        opacity: 0;
        pointer-events: none;
        transition: opacity 280ms 200ms, background 160ms;
      }
      .kbot-close:hover { background: ${SUMI_INK}; }
      #kaizen-bot-root.open .kbot-close {
        opacity: 1;
        pointer-events: auto;
      }

      /* Chat-Sektion — auf der Mauer-Fläche, beginnt unter Mönch-Image */
      .kbot-chat-section {
        position: absolute;
        top: ${IMAGE_HEIGHT}px;
        left: 0; right: 0; bottom: 0;
        display: flex; flex-direction: column;
        background: ${WALL};
      }

      /* Subtle Mauer-Schatten oben (gibt der Mauer-Top-Edge mehr Tiefe) */
      .kbot-chat-section::before {
        content: '';
        position: absolute;
        top: 0; left: 8%; right: 8%;
        height: 8px;
        background: linear-gradient(to bottom, rgba(31,41,51,0.10), transparent);
        pointer-events: none;
      }

      .kbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 14px 16px 8px;
        display: flex; flex-direction: column;
        gap: 10px;
      }
      .kbot-msg {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 13.5px; line-height: 1.5;
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
      .kbot-msg.error {
        background: rgba(232,90,43,0.14);
        color: #B53C12; border: 1px solid rgba(232,90,43,0.5);
        align-self: center; font-size: 12px;
      }

      .kbot-suggestions {
        padding: 0 16px 8px;
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
        padding: 10px 12px 12px;
        border-top: 1px solid rgba(31,41,51,0.10);
        display: flex; gap: 8px;
        flex-shrink: 0;
      }
      .kbot-input-row input {
        flex: 1;
        padding: 9px 14px;
        border: 1px solid rgba(31,41,51,0.18);
        border-radius: 10px;
        font-size: 13.5px;
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
        padding: 9px 16px;
        font-size: 14px; font-weight: 600;
        cursor: pointer; font-family: inherit;
        transition: background 160ms;
      }
      .kbot-input-row button:disabled { opacity: 0.4; cursor: not-allowed; }
      .kbot-input-row button:not(:disabled):hover { background: ${EMBER}; }

      .kbot-typing {
        align-self: flex-start;
        background: ${CREAM};
        padding: 11px 14px; border-radius: 12px;
        display: flex; gap: 5px;
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
        #kaizen-bot-root {
          right: 8px; left: 8px;
          width: auto;
        }
        #kaizen-bot-root.open {
          height: min(82vh, calc(100vh - 40px));
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderContainer() {
    const root = document.createElement('div');
    root.id = 'kaizen-bot-root';
    root.innerHTML = `
      <div class="kbot-image-section">
        <img src="/widgets/monk-chat.png" alt="" />
      </div>

      <div class="kbot-handle" id="kbot-handle">
        <div class="kbot-handle-label">
          <span class="kbot-handle-pulse"></span>
          <span>Frag den Mönch</span>
        </div>
      </div>

      <button class="kbot-close" id="kbot-close" aria-label="Chat schließen">×</button>

      <div class="kbot-chat-section">
        <div class="kbot-messages" id="kbot-messages"></div>
        <div class="kbot-suggestions" id="kbot-suggestions"></div>
        <div class="kbot-input-row">
          <input type="text" id="kbot-input" placeholder="Frage stellen…" maxlength="2000" autocomplete="off">
          <button id="kbot-send" aria-label="Senden">→</button>
        </div>
      </div>
    `;
    document.body.appendChild(root);

    document.getElementById('kbot-handle').onclick = openModal;
    document.getElementById('kbot-close').onclick = closeModal;

    const input = document.getElementById('kbot-input');
    const sendBtn = document.getElementById('kbot-send');
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
    document.getElementById('kaizen-bot-root').classList.add('open');
    setTimeout(() => document.getElementById('kbot-input')?.focus(), 600);
  }
  function closeModal() {
    if (!isOpen) return;
    isOpen = false;
    document.getElementById('kaizen-bot-root').classList.remove('open');
  }

  // ---------- Messages ----------
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
        await response.text().catch(() => '');
        appendError(`Verbindung wackelt — versuch's gleich nochmal. Direkt: kontakt@k-aizen.de`);
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
