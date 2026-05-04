/**
 * k-AIzen Site-Chatbot Widget
 * ----------------------------
 * Floating-Button rechts unten + Chat-Modal. Vanilla JS, kein Framework.
 *
 * Backend-URL via window.KAIZEN_BOT_URL — fallback auf same-origin /api/chat.
 * Conversation-State im Memory (kein Persist), History wird mit jedem POST mitgeschickt.
 */

(function () {
  const BOT_URL =
    (typeof window !== 'undefined' && window.KAIZEN_BOT_URL) || '/api/chat';

  const SUMI_INK = '#1F2933';
  const EMBER = '#E85A2B';
  const CREAM = '#F5F0E8';
  const CREAM_DEEP = '#EDE6D8';

  // Conversation-State
  /** @type {Array<{role:'user'|'assistant', content:string}>} */
  const history = [];
  let isOpen = false;
  let isSending = false;

  // ---------- Mount ----------
  async function mount() {
    if (document.getElementById('kaizen-bot-root')) return;

    // Defensive: erst Health-Check, dann mounten. Verhindert dass Visitor
    // den Button sieht wenn Backend nicht erreichbar ist (z.B. während Deploy).
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
    renderButton(root);
    renderModal(root);
  }

  function injectStyles() {
    if (document.getElementById('kaizen-bot-styles')) return;
    const style = document.createElement('style');
    style.id = 'kaizen-bot-styles';
    style.textContent = `
      #kaizen-bot-root {
        position: fixed; bottom: 24px; right: 24px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, system-ui, sans-serif;
      }
      #kaizen-bot-button {
        width: 56px; height: 56px;
        border-radius: 50%;
        background: ${SUMI_INK};
        color: ${CREAM};
        border: none;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 16px 40px -8px rgba(31,41,51,0.32), 0 4px 12px rgba(31,41,51,0.16);
        transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms;
      }
      #kaizen-bot-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 22px 50px -8px rgba(31,41,51,0.4), 0 6px 14px rgba(31,41,51,0.2);
      }
      #kaizen-bot-button .kanji {
        font-family: "Noto Serif JP", "Hiragino Mincho ProN", serif;
        font-size: 26px;
        color: ${EMBER};
        line-height: 1;
      }
      #kaizen-bot-modal {
        display: none;
        position: fixed; bottom: 92px; right: 24px;
        width: min(380px, calc(100vw - 48px));
        height: min(560px, calc(100vh - 140px));
        background: ${CREAM};
        border-radius: 16px;
        box-shadow: 0 32px 80px -16px rgba(31,41,51,0.4), 0 12px 24px rgba(31,41,51,0.16);
        flex-direction: column;
        overflow: hidden;
        animation: kbot-fade-up 240ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      @keyframes kbot-fade-up {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      #kaizen-bot-modal.open { display: flex; }
      .kbot-header {
        background: ${SUMI_INK}; color: ${CREAM};
        padding: 16px 20px;
        display: flex; align-items: center; gap: 12px;
        flex-shrink: 0;
      }
      .kbot-header .kanji {
        font-family: "Noto Serif JP", serif;
        font-size: 22px;
        color: ${EMBER};
        line-height: 1;
      }
      .kbot-header h3 {
        margin: 0; font-size: 15px; font-weight: 600;
        font-family: -apple-system, system-ui, sans-serif;
      }
      .kbot-header .sub {
        margin: 2px 0 0; font-size: 12px;
        color: rgba(245,240,232,0.7);
      }
      .kbot-header button.close {
        margin-left: auto;
        background: transparent; border: none;
        color: ${CREAM}; font-size: 22px; line-height: 1;
        cursor: pointer; padding: 0; opacity: 0.7;
      }
      .kbot-header button.close:hover { opacity: 1; }
      .kbot-messages {
        flex: 1; overflow-y: auto;
        padding: 20px;
        display: flex; flex-direction: column; gap: 14px;
        background: ${CREAM};
      }
      .kbot-msg {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px; line-height: 1.5;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      .kbot-msg.user {
        background: ${SUMI_INK}; color: ${CREAM};
        align-self: flex-end;
        border-bottom-right-radius: 4px;
      }
      .kbot-msg.assistant {
        background: ${CREAM_DEEP}; color: ${SUMI_INK};
        align-self: flex-start;
        border-bottom-left-radius: 4px;
      }
      .kbot-msg.assistant a { color: ${EMBER}; text-decoration: underline; }
      .kbot-msg.system {
        background: transparent; color: ${SUMI_INK};
        align-self: center;
        font-size: 13px; font-style: italic;
        opacity: 0.7;
        text-align: center;
        max-width: 100%;
      }
      .kbot-msg.error {
        background: rgba(232,90,43,0.1);
        color: ${EMBER}; border: 1px solid ${EMBER};
        align-self: center; font-size: 13px;
      }
      .kbot-suggestions {
        padding: 0 20px 12px;
        display: flex; flex-wrap: wrap; gap: 8px;
      }
      .kbot-suggestions button {
        background: ${CREAM_DEEP}; color: ${SUMI_INK};
        border: 1px solid rgba(31,41,51,0.12);
        border-radius: 16px;
        padding: 6px 12px;
        font-size: 12px;
        cursor: pointer;
        transition: background 160ms, border-color 160ms;
        font-family: inherit;
      }
      .kbot-suggestions button:hover {
        background: ${SUMI_INK}; color: ${CREAM};
        border-color: ${SUMI_INK};
      }
      .kbot-input-row {
        padding: 12px;
        background: ${CREAM};
        border-top: 1px solid rgba(31,41,51,0.08);
        display: flex; gap: 8px;
        flex-shrink: 0;
      }
      .kbot-input-row input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid rgba(31,41,51,0.16);
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        background: ${CREAM};
        color: ${SUMI_INK};
        outline: none;
        transition: border-color 160ms;
      }
      .kbot-input-row input:focus {
        border-color: ${SUMI_INK};
      }
      .kbot-input-row button {
        background: ${SUMI_INK}; color: ${CREAM};
        border: none; border-radius: 8px;
        padding: 10px 16px;
        font-size: 14px; font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: background 160ms;
      }
      .kbot-input-row button:disabled {
        opacity: 0.4; cursor: not-allowed;
      }
      .kbot-input-row button:not(:disabled):hover {
        background: ${EMBER};
      }
      .kbot-typing {
        align-self: flex-start;
        background: ${CREAM_DEEP};
        padding: 12px 16px; border-radius: 12px;
        display: flex; gap: 6px;
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
        #kaizen-bot-root { bottom: 16px; right: 16px; }
        #kaizen-bot-modal {
          bottom: 80px; right: 16px;
          width: calc(100vw - 32px);
          height: min(70vh, calc(100vh - 120px));
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderButton(root) {
    const btn = document.createElement('button');
    btn.id = 'kaizen-bot-button';
    btn.setAttribute('aria-label', 'Chat öffnen');
    btn.innerHTML = '<span class="kanji">話</span>';
    btn.onclick = toggleOpen;
    root.appendChild(btn);
  }

  function renderModal(root) {
    const modal = document.createElement('div');
    modal.id = 'kaizen-bot-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'k-AIzen Chat');
    modal.innerHTML = `
      <div class="kbot-header">
        <span class="kanji">話</span>
        <div>
          <h3>k-AIzen Bot</h3>
          <p class="sub">Frag mich was — oder starte ein Mini-Audit</p>
        </div>
        <button class="close" aria-label="Chat schließen">×</button>
      </div>
      <div class="kbot-messages" id="kbot-messages"></div>
      <div class="kbot-suggestions" id="kbot-suggestions"></div>
      <div class="kbot-input-row">
        <input type="text" id="kbot-input" placeholder="Frage stellen…" maxlength="2000" autocomplete="off">
        <button id="kbot-send">→</button>
      </div>
    `;
    root.appendChild(modal);

    modal.querySelector('.close').onclick = toggleOpen;

    const input = modal.querySelector('#kbot-input');
    const sendBtn = modal.querySelector('#kbot-send');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send(input.value);
      }
    });
    sendBtn.onclick = () => send(input.value);

    // Initial greeting + suggestion-chips
    appendSystem('Hallo, ich bin der k-AIzen-Bot.');
    appendAssistant(
      'Ich kann dir erklären was wir machen, was Module kosten, oder ein Mini-Audit mit dir durchgehen. Wo soll\'s losgehen?',
    );
    renderSuggestions([
      'Was ist k-AIzen?',
      'Was kostet ein Audit?',
      'Wie funktionieren die Module?',
      'Mini-Audit starten',
    ]);
  }

  // ---------- Conversation ----------
  function toggleOpen() {
    isOpen = !isOpen;
    const modal = document.getElementById('kaizen-bot-modal');
    if (isOpen) {
      modal.classList.add('open');
      setTimeout(() => document.getElementById('kbot-input')?.focus(), 100);
    } else {
      modal.classList.remove('open');
    }
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
  function appendSystem(text) {
    const msg = document.createElement('div');
    msg.className = 'kbot-msg system';
    msg.textContent = text;
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
    // Sehr basic: \n → <br>, [x](y) → <a>, **x** → <strong>, escape HTML
    const esc = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return esc
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
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
          history: history.slice(0, -1), // history-without-last (last ist current user)
        }),
      });

      hideTyping();

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        appendError(`Fehler ${response.status} — versuch's nochmal in einer Minute. Direkt-Kontakt: kontakt@k-aizen.de`);
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
      appendError('Verbindung fehlgeschlagen. Direkt-Kontakt: kontakt@k-aizen.de');
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
