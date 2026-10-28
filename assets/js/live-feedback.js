/* ==========================================================================
   DigitizingDesk - In-Page Live Visual Feedback & Commenting System
   Allows clicking anywhere on the live website to pin comments.
   Comments persist across sessions in localStorage and can be exported
   or copied in 1-click for the AI assistant.
   ========================================================================== */

(function () {
  if (window.__dd_feedback_installed) return;
  window.__dd_feedback_installed = true;

  const STORAGE_KEY = 'digitizingdesk_feedback_comments_v1';

  // Inject Styles
  const style = document.createElement('style');
  style.innerHTML = `
    /* Feedback Floating Bar */
    #dd-feedback-toolbar {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 10px;
      background: #17203A;
      color: #F7F3EA;
      padding: 8px 14px 8px 10px;
      border-radius: 9999px;
      box-shadow: 0 12px 35px rgba(23, 32, 58, 0.4), 0 0 0 2px #F0B33F;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      user-select: none;
      transition: all 0.25s ease;
    }
    #dd-feedback-toolbar:hover {
      box-shadow: 0 16px 45px rgba(23, 32, 58, 0.5), 0 0 0 2px #D63C30;
    }
    #dd-fb-toggle-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #D63C30;
      color: #fff;
      border: none;
      padding: 7px 14px;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    #dd-fb-toggle-btn:hover {
      background: #b52e23;
    }
    #dd-fb-toggle-btn.active {
      background: #1F7F82;
      box-shadow: 0 0 0 3px rgba(31, 127, 130, 0.4);
    }
    #dd-fb-counter {
      background: #F0B33F;
      color: #17203A;
      padding: 2px 7px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 11px;
    }
    .dd-fb-tool-action {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      color: #F7F3EA;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    .dd-fb-tool-action:hover {
      background: rgba(255,255,255,0.15);
      border-color: #fff;
    }

    /* Pin Marker on Page */
    .dd-comment-pin {
      position: absolute;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 4px;
      background: #D63C30;
      color: #ffffff;
      font-weight: 800;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate(-16px, -32px);
      box-shadow: 0 6px 18px rgba(214, 60, 48, 0.5), 0 0 0 2px #ffffff;
      cursor: pointer;
      z-index: 999990;
      transition: transform 0.2s ease, background 0.2s;
      animation: dd-pin-drop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .dd-comment-pin:hover {
      transform: translate(-16px, -36px) scale(1.15);
      background: #17203A;
    }
    .dd-comment-pin.resolved {
      background: #2E9E6B;
      box-shadow: 0 4px 12px rgba(46, 158, 107, 0.4), 0 0 0 2px #ffffff;
    }

    @keyframes dd-pin-drop {
      0% { opacity: 0; transform: translate(-16px, -50px) scale(0.5); }
      100% { opacity: 1; transform: translate(-16px, -32px) scale(1); }
    }

    /* Comment Popover Modal */
    #dd-fb-modal {
      position: absolute;
      z-index: 999995;
      background: #ffffff;
      color: #17203A;
      width: 320px;
      border-radius: 12px;
      box-shadow: 0 20px 50px rgba(23, 32, 58, 0.3), 0 0 0 1px rgba(23,32,58,0.1);
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: none;
    }
    #dd-fb-modal h4 {
      margin: 0 0 8px 0;
      font-size: 13px;
      font-weight: 700;
      color: #17203A;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    #dd-fb-modal textarea {
      width: 100%;
      height: 75px;
      border: 1px solid #D0D5DD;
      border-radius: 8px;
      padding: 8px;
      font-size: 13px;
      font-family: inherit;
      box-sizing: border-box;
      resize: vertical;
      outline: none;
    }
    #dd-fb-modal textarea:focus {
      border-color: #D63C30;
      box-shadow: 0 0 0 3px rgba(214, 60, 48, 0.15);
    }
    .dd-modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 10px;
    }
    .dd-btn-save {
      background: #D63C30;
      color: #fff;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
    }
    .dd-btn-cancel {
      background: #F2F4F7;
      color: #344054;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
    }
    .dd-btn-del {
      background: transparent;
      color: #D63C30;
      border: none;
      padding: 6px 8px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      margin-right: auto;
    }

    /* Comment List Drawer */
    #dd-fb-drawer {
      position: fixed;
      top: 0;
      right: -380px;
      width: 360px;
      max-width: 90vw;
      height: 100vh;
      background: #ffffff;
      box-shadow: -10px 0 30px rgba(0,0,0,0.15);
      z-index: 1000000;
      transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #dd-fb-drawer.open {
      right: 0;
    }
    .dd-drawer-header {
      padding: 18px 20px;
      background: #17203A;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .dd-drawer-header h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
    }
    .dd-drawer-close {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
    }
    .dd-drawer-body {
      padding: 16px;
      overflow-y: auto;
      flex: 1;
    }
    .dd-card-comment {
      background: #F7F3EA;
      border-left: 4px solid #D63C30;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      font-size: 13px;
      position: relative;
    }
    .dd-card-comment .meta {
      font-size: 11px;
      color: #8A93A6;
      margin-bottom: 6px;
      font-family: monospace;
      display: flex;
      justify-content: space-between;
    }
    .dd-card-comment .text {
      color: #17203A;
      line-height: 1.45;
      white-space: pre-wrap;
    }
    .dd-card-comment .del-icon {
      color: #D63C30;
      cursor: pointer;
      font-weight: bold;
    }
    .dd-drawer-footer {
      padding: 16px;
      border-top: 1px solid #E4E7EC;
      background: #F9FAFB;
      display: flex;
      gap: 10px;
    }
    .dd-btn-copy-all {
      flex: 1;
      background: #17203A;
      color: #F7F3EA;
      border: none;
      padding: 10px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .dd-btn-copy-all:hover {
      background: #D63C30;
    }

    /* Mode Banner when Commenting is Active */
    #dd-fb-banner {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: #D63C30;
      color: #ffffff;
      text-align: center;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 600;
      z-index: 999998;
      display: none;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    body.dd-comment-mode-active {
      cursor: crosshair !important;
    }
    body.dd-comment-mode-active * {
      cursor: crosshair !important;
    }
  `;
  document.head.appendChild(style);

  // Load saved comments
  let comments = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) comments = JSON.parse(raw);
  } catch (e) {
    comments = [];
  }

  let isCommentMode = false;
  let activePendingPin = null;

  // Banner
  const banner = document.createElement('div');
  banner.id = 'dd-fb-banner';
  banner.innerHTML = '<strong>[REVIEW MODE]</strong> Click anywhere on the webpage to drop a pin and leave feedback. <span style="text-decoration:underline;cursor:pointer;margin-left:12px;" id="dd-banner-done">Done</span>';
  document.body.appendChild(banner);

  document.getElementById('dd-banner-done').addEventListener('click', () => {
    toggleCommentMode(false);
  });

  // Floating Toolbar
  const toolbar = document.createElement('div');
  toolbar.id = 'dd-feedback-toolbar';
  toolbar.innerHTML = `
    <button id="dd-fb-toggle-btn" title="Click anywhere on page to leave a comment">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      <span>+ Add Comment</span>
    </button>
    <button class="dd-fb-tool-action" id="dd-fb-list-btn">
      Comments <span id="dd-fb-counter">${comments.length}</span>
    </button>
  `;
  document.body.appendChild(toolbar);

  // Popover modal for entering comment
  const modal = document.createElement('div');
  modal.id = 'dd-fb-modal';
  modal.innerHTML = `
    <h4><span>Add Note / Feedback</span> <span id="dd-modal-target" style="font-weight:400;font-size:11px;color:#8A93A6;"></span></h4>
    <textarea placeholder="e.g. Change this title to..., make this button bigger, fix alignment..."></textarea>
    <div class="dd-modal-actions">
      <button class="dd-btn-del" id="dd-modal-del" style="display:none;">Delete</button>
      <button class="dd-btn-cancel" id="dd-modal-cancel">Cancel</button>
      <button class="dd-btn-save" id="dd-modal-save">Save Note</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Drawer for reviewing all comments
  const drawer = document.createElement('div');
  drawer.id = 'dd-fb-drawer';
  drawer.innerHTML = `
    <div class="dd-drawer-header">
      <h3>Review Comments (<span id="dd-drawer-count">0</span>)</h3>
      <button class="dd-drawer-close" id="dd-drawer-close-btn">&times;</button>
    </div>
    <div class="dd-drawer-body" id="dd-drawer-body"></div>
    <div class="dd-drawer-footer">
      <button class="dd-btn-copy-all" id="dd-copy-all-btn">
        Copy All for Assistant
      </button>
    </div>
  `;
  document.body.appendChild(drawer);

  function saveComments() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    } catch (e) {}
    updateCounter();
    renderPins();
    renderDrawerList();
  }

  function updateCounter() {
    const curPath = window.location.pathname;
    const pageComments = comments.filter(c => c.path === curPath || c.url === window.location.href);
    const countEl = document.getElementById('dd-fb-counter');
    if (countEl) countEl.innerText = comments.length;
    const drawerCount = document.getElementById('dd-drawer-count');
    if (drawerCount) drawerCount.innerText = comments.length;
  }

  function toggleCommentMode(force) {
    isCommentMode = force !== undefined ? force : !isCommentMode;
    const btn = document.getElementById('dd-fb-toggle-btn');
    if (isCommentMode) {
      document.body.classList.add('dd-comment-mode-active');
      banner.style.display = 'block';
      btn.classList.add('active');
      btn.querySelector('span').innerText = 'Click on Page...';
    } else {
      document.body.classList.remove('dd-comment-mode-active');
      banner.style.display = 'none';
      btn.classList.remove('active');
      btn.querySelector('span').innerText = '+ Add Comment';
      hideModal();
    }
  }

  document.getElementById('dd-fb-toggle-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleCommentMode();
  });

  document.getElementById('dd-fb-list-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    drawer.classList.add('open');
    renderDrawerList();
  });

  document.getElementById('dd-drawer-close-btn').addEventListener('click', () => {
    drawer.classList.remove('open');
  });

  // Click on page to place a pin
  document.addEventListener('click', (e) => {
    if (!isCommentMode) return;

    // Do not capture if clicking inside feedback UI
    if (
      e.target.closest('#dd-feedback-toolbar') ||
      e.target.closest('#dd-fb-modal') ||
      e.target.closest('#dd-fb-drawer') ||
      e.target.closest('#dd-fb-banner') ||
      e.target.closest('.dd-comment-pin')
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const pageX = e.pageX;
    const pageY = e.pageY;
    const targetTag = e.target.tagName.toLowerCase();
    const targetText = (e.target.innerText || '').trim().slice(0, 30);
    const selectorDesc = targetTag + (e.target.className ? '.' + String(e.target.className).split(' ')[0] : '') + (targetText ? ` ("${targetText}...")` : '');

    activePendingPin = {
      id: 'c_' + Date.now(),
      pageX,
      pageY,
      url: window.location.href,
      path: window.location.pathname,
      pageTitle: document.title,
      targetDesc: selectorDesc,
      text: '',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    openModalForPin(activePendingPin, e.clientX, e.clientY, false);
  }, true);

  function openModalForPin(commentObj, clientX, clientY, isExisting) {
    const textarea = modal.querySelector('textarea');
    textarea.value = commentObj.text || '';
    modal.querySelector('#dd-modal-target').innerText = commentObj.targetDesc || '';

    // Position modal safely on screen
    let left = clientX + 15;
    let top = clientY + 15;
    if (left + 330 > window.innerWidth) left = window.innerWidth - 340;
    if (top + 200 > window.innerHeight) top = window.innerHeight - 210;

    modal.style.left = (window.scrollX + left) + 'px';
    modal.style.top = (window.scrollY + top) + 'px';
    modal.style.display = 'block';

    const delBtn = modal.querySelector('#dd-modal-del');
    if (isExisting) {
      delBtn.style.display = 'inline-block';
      delBtn.onclick = () => {
        comments = comments.filter(c => c.id !== commentObj.id);
        saveComments();
        hideModal();
      };
    } else {
      delBtn.style.display = 'none';
    }

    textarea.focus();

    modal.querySelector('#dd-modal-save').onclick = () => {
      const val = textarea.value.trim();
      if (!val) return;
      commentObj.text = val;
      if (!isExisting) {
        comments.push(commentObj);
      } else {
        const idx = comments.findIndex(c => c.id === commentObj.id);
        if (idx !== -1) comments[idx] = commentObj;
      }
      saveComments();
      hideModal();
      toggleCommentMode(false);
    };

    modal.querySelector('#dd-modal-cancel').onclick = () => {
      hideModal();
    };
  }

  function hideModal() {
    modal.style.display = 'none';
    activePendingPin = null;
  }

  function renderPins() {
    document.querySelectorAll('.dd-comment-pin').forEach(el => el.remove());

    const curPath = window.location.pathname;
    const curComments = comments.filter(c => c.path === curPath || c.url === window.location.href);

    curComments.forEach((c, index) => {
      const pin = document.createElement('div');
      pin.className = 'dd-comment-pin';
      pin.style.left = c.pageX + 'px';
      pin.style.top = c.pageY + 'px';
      pin.innerText = index + 1;
      pin.title = c.text;

      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        openModalForPin(c, e.clientX, e.clientY, true);
      });

      document.body.appendChild(pin);
    });
  }

  function renderDrawerList() {
    const body = document.getElementById('dd-drawer-body');
    if (!body) return;

    if (comments.length === 0) {
      body.innerHTML = `
        <div style="text-align:center;padding:40px 10px;color:#8A93A6;">
          <p style="font-size:12px;font-weight:700;letter-spacing:0.05em;color:#8A93A6;margin:0 0 10px 0;">[ NO NOTES ]</p>
          <p style="font-weight:600;margin:0 0 4px 0;">No comments yet</p>
          <p style="font-size:12px;margin:0;">Click <strong>"+ Add Comment"</strong> at the bottom right and tap anywhere on the screen.</p>
        </div>
      `;
      return;
    }

    body.innerHTML = comments.map((c, i) => `
      <div class="dd-card-comment">
        <div class="meta">
          <span>#${i + 1} &bull; ${c.pageTitle ? c.pageTitle.split('|')[0].trim() : 'Page'}</span>
          <span class="del-icon" data-del-id="${c.id}" title="Delete comment">&times;</span>
        </div>
        <div class="text">${escapeHtml(c.text)}</div>
        <div style="margin-top:6px;font-size:11px;color:#1F7F82;font-family:monospace;">${escapeHtml(c.targetDesc || '')}</div>
      </div>
    `).join('');

    body.querySelectorAll('.del-icon').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-del-id');
        comments = comments.filter(c => c.id !== id);
        saveComments();
      });
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Copy All comments formatted for the AI Assistant
  document.getElementById('dd-copy-all-btn').addEventListener('click', () => {
    if (comments.length === 0) {
      alert('No comments to copy yet! Click anywhere on the page to leave comments.');
      return;
    }

    let report = "### Feedback from Live Review (" + comments.length + " notes):\n\n";
    comments.forEach((c, idx) => {
      report += (idx + 1) + ". **[" + (c.pageTitle ? c.pageTitle.split('|')[0].trim() : c.path) + "]** Element: `" + (c.targetDesc || 'Screen Area') + "`\n";
      report += "   - " + c.text + "\n\n";
    });

    navigator.clipboard.writeText(report).then(() => {
      const btn = document.getElementById('dd-copy-all-btn');
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Copied to Clipboard!';
      setTimeout(() => { btn.innerHTML = originalText; }, 2000);
      alert('Copied! Ab aap seedha yahan chat me paste kardein.');
    }).catch(() => {
      alert(report);
    });
  });

  // Initial render
  updateCounter();
  renderPins();

  // Re-render pins on window resize
  window.addEventListener('resize', renderPins);
})();
