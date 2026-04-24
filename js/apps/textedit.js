/* ============================================
   TextEdit App
   ============================================ */
class TextEditApp {
  constructor() {
    this.content = '';
  }

  open() {
    const content = `
      <div class="textedit-container">
        <div class="textedit-toolbar">
          <button class="textedit-toolbar-btn" data-action="bold" title="Bold"><b>B</b></button>
          <button class="textedit-toolbar-btn" data-action="italic" title="Italic"><i>I</i></button>
          <button class="textedit-toolbar-btn" data-action="underline" title="Underline"><u>U</u></button>
          <button class="textedit-toolbar-btn" data-action="strikeThrough" title="Strikethrough"><s>S</s></button>
          <div class="textedit-toolbar-sep"></div>
          <button class="textedit-toolbar-btn" data-action="justifyLeft" title="Align Left">⫷</button>
          <button class="textedit-toolbar-btn" data-action="justifyCenter" title="Align Center">≡</button>
          <button class="textedit-toolbar-btn" data-action="justifyRight" title="Align Right">⫸</button>
          <div class="textedit-toolbar-sep"></div>
          <button class="textedit-toolbar-btn" data-action="insertUnorderedList" title="Bullet List">•≡</button>
          <button class="textedit-toolbar-btn" data-action="insertOrderedList" title="Numbered List">1≡</button>
          <div class="textedit-toolbar-sep"></div>
          <button class="textedit-toolbar-btn" data-action="undo" title="Undo">↩</button>
          <button class="textedit-toolbar-btn" data-action="redo" title="Redo">↪</button>
        </div>
        <div class="textedit-content" id="textedit-content" contenteditable="true"></div>
        <div class="textedit-status" id="textedit-status">0 characters · 0 words</div>
      </div>
    `;

    windowManager.createWindow({
      id: 'textedit-window',
      title: 'TextEdit',
      icon: '📝',
      content,
      width: 700,
      height: 500,
      appKey: 'textedit',
      onReady: (contentEl) => this._init(contentEl)
    });
  }

  _init(contentEl) {
    this.editorEl = contentEl.querySelector('#textedit-content');
    this.statusEl = contentEl.querySelector('#textedit-status');

    // Toolbar actions
    contentEl.querySelectorAll('.textedit-toolbar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        document.execCommand(action, false, null);
        this.editorEl.focus();
      });
    });

    // Update status on input
    this.editorEl.addEventListener('input', () => this._updateStatus());

    // Set initial content
    this.editorEl.innerHTML = `<h1>Welcome to TextEdit</h1>
<p>This is a rich text editor for <b>macOS Web</b>. You can:</p>
<ul>
<li><b>Bold</b>, <i>italic</i>, and <u>underline</u> text</u></li>
<li>Create <b>bullet</b> and <b>numbered</b> lists</li>
<li>Align text left, center, or right</li>
<li>Undo and redo changes</li>
</ul>
<p>Start editing to see the word count update in real-time!</p>`;
    this._updateStatus();
  }

  _updateStatus() {
    const text = this.editorEl.innerText || '';
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    this.statusEl.textContent = `${chars} characters · ${words} words`;
  }
}