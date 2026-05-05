/**
 * k-AIzen Site-Chatbot Widget — Mönch-an-der-Mauer (v3, image-as-UI)
 * -------------------------------------------------------------------
 * KEIN Container, KEIN Border, KEIN Shadow — nur das Bild ist das UI.
 * 3 Bild-Stücke vertikal gestackt:
 *   1. monk-top.png   — Mönch + Mauer-Cap (176px hoch bei 320px width)
 *   2. wall-tile.png  — 2px-Slice der Mauer-Front, vertikal getiled (flex)
 *   3. wall-bottom.png — Mauer-Bottom mit Ornamental-Border (34px)
 *
 * Closed-State: Nur monk-top sichtbar (chat-area collapsed auf height 0)
 * Open-State:   chat-area expandiert + wall-bottom appears
 */

(function () {
  const BOT_URL =
    (typeof window !== 'undefined' && window.KAIZEN_BOT_URL) || '/api/chat';

  const SUMI_INK = '#1F2933';
  const EMBER = '#E85A2B';
  const CREAM = '#F5F0E8';

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
    renderWidget();
  }

  function injectStyles() {
    if (document.getElementById('kaizen-bot-styles')) return;
    const style = document.createElement('style');
    style.id = 'kaizen-bot-styles';
    style.textContent = `
      #kaizen-bot-root {
        position: fixed;
        bottom: 0;
        right: 16px;
        width: 280px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, system-ui, sans-serif;
        /* KEIN background, KEIN border, KEIN shadow — Bild IST das UI */
      }

      /* Mönch + Mauer-Cap (immer sichtbar, click-target im closed-state) */
      .kbot-handle {
        display: block;
        width: 100%;
        margin: 0; padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        position: relative;
      }

      /* Sprech-Blasen — links überhalb vom Mönch.
         Tail unten-rechts der Bubble zeigt nach unten-rechts auf den Mönch. */
      .kbot-bubble {
        position: absolute;
        bottom: 100%;      /* bubble komplett oberhalb root */
        margin-bottom: -10px; /* leichter overlap nach unten */
        right: 55%;        /* tail-Anchor links der Mönch-Mitte → bubble extends nach links */
        width: 160px;
        height: auto;
        pointer-events: none;
        opacity: 0;
        transform: translateY(8px) scale(0.92);
        transform-origin: bottom right;
        transition:
          opacity 380ms cubic-bezier(0.22, 1, 0.36, 1),
          transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
        filter: drop-shadow(0 6px 10px rgba(31,41,51,0.18));
        z-index: 4;
      }
      .kbot-bubble.show {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      #kaizen-bot-root.open .kbot-bubble {
        opacity: 0 !important;
        transform: translateY(8px) scale(0.92) !important;
      }
      .kbot-monk-top {
        display: block;
        width: 100%;
        height: auto;
        user-select: none;
        -webkit-user-drag: none;
        filter: drop-shadow(0 8px 16px rgba(31,41,51,0.14));
      }

      /* Online-Pulse rechts unten auf der Mauer-Cap (im closed-state) */
      .kbot-pulse-badge {
        position: absolute;
        right: 14px;
        bottom: 8px;
        display: flex; align-items: center; gap: 6px;
        font-size: 11px; font-weight: 600;
        color: rgba(31,41,51,0.85);
        opacity: 1;
        transition: opacity 240ms;
        pointer-events: none;
      }
      #kaizen-bot-root.open .kbot-pulse-badge {
        opacity: 0;
      }
      .kbot-pulse-dot {
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

      /* Close-Button (open-state) — top-right über dem Mönch */
      .kbot-close {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 28px; height: 28px;
        border-radius: 50%;
        background: rgba(31,41,51,0.78);
        color: ${CREAM};
        border: none;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        font-size: 16px; line-height: 1;
        opacity: 0;
        pointer-events: none;
        transition: opacity 280ms 200ms, background 160ms;
        z-index: 6;
      }
      #kaizen-bot-root.open .kbot-close {
        opacity: 1;
        pointer-events: auto;
      }
      .kbot-close:hover { background: ${SUMI_INK}; }

      /* Expand-Wrapper — collapsed im closed, expanded im open */
      .kbot-expand {
        height: 0;
        overflow: hidden;
        display: flex; flex-direction: column;
        transition: height 560ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      #kaizen-bot-root.open .kbot-expand {
        height: min(380px, calc(100vh - 240px));
      }

      /* Chat-Area — Mauer-Tile als Background */
      .kbot-chat-area {
        flex: 1;
        background: url(/widgets/wall-tile.png) repeat-y;
        background-size: 100% auto;
        display: flex; flex-direction: column;
        min-height: 0;
      }

      /* Wall-Bottom (immer am unteren Ende) */
      .kbot-wall-bottom {
        display: block;
        width: 100%;
        height: auto;
        flex-shrink: 0;
        user-select: none;
        -webkit-user-drag: none;
      }

      /* Chat-Messages */
      .kbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 14px 26px 6px;
        display: flex; flex-direction: column;
        gap: 9px;
      }
      .kbot-msg {
        max-width: 86%;
        padding: 9px 13px;
        border-radius: 11px;
        font-size: 13px; line-height: 1.5;
        white-space: pre-wrap;
        word-wrap: break-word;
        box-shadow: 0 2px 5px rgba(31,41,51,0.07);
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
        padding: 0 26px 6px;
        display: flex; flex-wrap: wrap; gap: 5px;
      }
      .kbot-suggestions button {
        background: ${CREAM};
        color: ${SUMI_INK};
        border: 1px solid rgba(31,41,51,0.16);
        border-radius: 14px;
        padding: 5px 11px;
        font-size: 11.5px;
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
        padding: 8px 24px 10px;
        display: flex; gap: 6px;
        flex-shrink: 0;
      }
      .kbot-input-row input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid rgba(31,41,51,0.18);
        border-radius: 8px;
        font-size: 13px;
        font-family: inherit;
        background: ${CREAM};
        color: ${SUMI_INK};
        outline: none;
        transition: border-color 160ms;
      }
      .kbot-input-row input:focus { border-color: ${SUMI_INK}; }
      .kbot-input-row button {
        background: ${SUMI_INK}; color: ${CREAM};
        border: none; border-radius: 8px;
        padding: 8px 14px;
        font-size: 14px; font-weight: 600;
        cursor: pointer; font-family: inherit;
        transition: background 160ms;
      }
      .kbot-input-row button:disabled { opacity: 0.4; cursor: not-allowed; }
      .kbot-input-row button:not(:disabled):hover { background: ${EMBER}; }

      .kbot-typing {
        align-self: flex-start;
        background: ${CREAM};
        padding: 10px 13px; border-radius: 11px;
        display: flex; gap: 5px;
        box-shadow: 0 2px 5px rgba(31,41,51,0.07);
      }
      .kbot-typing span {
        width: 5px; height: 5px;
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
          right: 12px;
          width: min(320px, calc(100vw - 24px));
        }
        #kaizen-bot-root.open .kbot-expand {
          height: min(60vh, 440px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderWidget() {
    const root = document.createElement('div');
    root.id = 'kaizen-bot-root';
    root.innerHTML = `
      <div class="kbot-handle" id="kbot-handle" role="button" tabindex="0" aria-label="Chat öffnen">
        <img class="kbot-bubble kbot-bubble-welcome" src="/widgets/bubble-welcome.png" alt="" />
        <img class="kbot-bubble kbot-bubble-help" src="/widgets/bubble-help.png" alt="" />
        <img class="kbot-monk-top" src="/widgets/monk-top.png" alt="" />
        <span class="kbot-pulse-badge">
          <span class="kbot-pulse-dot"></span>
          <span>Frag den Mönch</span>
        </span>
      </div>
      <button class="kbot-close" id="kbot-close" aria-label="Chat schließen">×</button>

      <div class="kbot-expand">
        <div class="kbot-chat-area">
          <div class="kbot-messages" id="kbot-messages"></div>
          <div class="kbot-suggestions" id="kbot-suggestions"></div>
          <div class="kbot-input-row">
            <input type="text" id="kbot-input" placeholder="Frage stellen…" maxlength="2000" autocomplete="off">
            <button id="kbot-send" aria-label="Senden">→</button>
          </div>
        </div>
        <img class="kbot-wall-bottom" src="/widgets/wall-bottom.png" alt="" />
      </div>
    `;
    document.body.appendChild(root);

    const handle = document.getElementById('kbot-handle');
    const closeBtn = document.getElementById('kbot-close');

    handle.onclick = () => {
      if (!isOpen) openModal();
    };
    handle.onkeydown = (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !isOpen) {
        e.preventDefault();
        openModal();
      }
    };
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      closeModal();
    };

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

    scheduleBubbles();
  }

  // ---------- Sprech-Blasen ----------
  function showBubble(name, durationMs = 5500) {
    if (isOpen) return;
    const bubbles = document.querySelectorAll('.kbot-bubble');
    bubbles.forEach((b) => b.classList.remove('show'));
    const target = document.querySelector('.kbot-bubble-' + name);
    if (!target) return;
    // kleine Verzögerung damit die transition triggert wenn vorherige aktive war
    requestAnimationFrame(() => {
      target.classList.add('show');
    });
    clearTimeout(target._kbotHideTimer);
    target._kbotHideTimer = setTimeout(() => {
      target.classList.remove('show');
    }, durationMs);
  }

  function scheduleBubbles() {
    // Welcome: nach 8s, hide nach 5.5s
    setTimeout(() => showBubble('welcome', 5500), 8000);
    // Hilfe: nach 25s erstes Mal
    setTimeout(() => showBubble('help', 5500), 25000);
    // Hilfe danach: alle 60-120s random
    const scheduleNext = () => {
      const delay = 60000 + Math.random() * 60000;
      setTimeout(() => {
        showBubble('help', 5000);
        scheduleNext();
      }, delay);
    };
    setTimeout(scheduleNext, 35000); // start after first help-bubble window
  }

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
