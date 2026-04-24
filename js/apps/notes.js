/* ============================================
   Notes App
   ============================================ */
class NotesApp {
  constructor() {
    this.notes = [
      { id: 1, title: 'Welcome to Notes', content: 'Welcome to macOS Web Notes!\n\nThis is a fully functional note-taking app.\n\nFeatures:\n• Create multiple notes\n• Edit and save automatically\n• Search through your notes\n• Clean, minimal interface\n\nStart typing to edit this note!', date: new Date().toISOString() },
      { id: 2, title: 'Shopping List', content: 'Groceries:\n- Milk\n- Bread\n- Eggs\n- Butter\n- Coffee\n- Fruit\n\nOther:\n- Phone charger\n- Notebook\n- Pens', date: new Date(Date.now() - 86400000).toISOString() },
      { id: 3, title: 'Project Ideas', content: '1. Build a browser-based OS ✓\n2. Create a music visualizer\n3. Design a portfolio website\n4. Learn a new programming language\n5. Contribute to open source', date: new Date(Date.now() - 172800000).toISOString() },
      { id: 4, title: 'Meeting Notes', content: 'Team Standup - April 24, 2024\n\n• Discussed new feature roadmap\n• Review progress on current sprint\n• Assigned tasks for next week\n• Deadline: May 1st', date: new Date(Date.now() - 259200000).toISOString() },
    ];
    this.activeNoteId = 1;
    this.nextId = 5;
  }

  open() {
    const content = `
      <div class="notes-container">
        <div class="notes-sidebar">
          <div class="notes-sidebar-header">
            <h3>Notes</h3>
            <button class="notes-new-btn" id="notes-new-btn" title="New Note">+</button>
          </div>
          <div class="notes-list" id="notes-list"></div>
        </div>
        <div class="notes-editor">
          <textarea class="notes-editor-textarea" id="notes-editor" placeholder="Start typing..."></textarea>
          <div class="notes-editor-footer" id="notes-footer"></div>
        </div>
      </div>
    `;

    windowManager.createWindow({
      id: 'notes-window',
      title: 'Notes',
      icon: '📝',
      content,
      width: 750,
      height: 480,
      appKey: 'notes',
      onReady: (contentEl) => this._init(contentEl)
    });
  }

  _init(contentEl) {
    this.contentEl = contentEl;
    this.listEl = contentEl.querySelector('#notes-list');
    this.editorEl = contentEl.querySelector('#notes-editor');
    this.footerEl = contentEl.querySelector('#notes-footer');

    this._renderList();
    this._loadNote(this.activeNoteId);

    // New note button
    contentEl.querySelector('#notes-new-btn').addEventListener('click', () => this._createNote());

    // Auto-save on input
    this.editorEl.addEventListener('input', () => this._saveCurrentNote());
  }

  _renderList() {
    const sorted = [...this.notes].sort((a, b) => new Date(b.date) - new Date(a.date));
    this.listEl.innerHTML = sorted.map(note => {
      const isActive = note.id === this.activeNoteId;
      const preview = note.content.split('\n').find(l => l.trim)?.trim().slice(0, 50) || 'No content';
      const date = new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `
        <div class="notes-list-item ${isActive ? 'active' : ''}" data-id="${note.id}">
          <div class="notes-list-title">${this._escapeHtml(note.title)}</div>
          <div class="notes-list-preview">${this._escapeHtml(preview)}</div>
          <div class="notes-list-date">${date}</div>
        </div>
      `;
    }).join('');

    this.listEl.querySelectorAll('.notes-list-item').forEach(item => {
      item.addEventListener('click', () => {
        this.activeNoteId = parseInt(item.dataset.id);
        this._loadNote(this.activeNoteId);
        this._renderList();
      });
    });
  }

  _loadNote(id) {
    const note = this.notes.find(n => n.id === id);
    if (!note) return;
    this.editorEl.value = note.content;
    this._updateFooter(note);
  }

  _updateFooter(note) {
    const date = new Date(note.date).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
    const lines = note.content.split('\n').length;
    const words = note.content.split(/\s+/).filter(Boolean).length;
    this.footerEl.textContent = `${date} · ${lines} lines · ${words} words`;
  }

  _saveCurrentNote() {
    const note = this.notes.find(n => n.id === this.activeNoteId);
    if (!note) return;

    note.content = this.editorEl.value;
    note.date = new Date().toISOString();

    // Update title from first line
    const firstLine = note.content.split('\n').find(l => l.trim);
    note.title = firstLine ? firstLine.trim().slice(0, 50) : 'Untitled';

    // Update window title
    const win = windowManager.getWindowById('notes-window');
    if (win) win.title = note.title;

    this._renderList();
    this._updateFooter(note);
  }

  _createNote() {
    const note = {
      id: this.nextId++,
      title: 'Untitled',
      content: '',
      date: new Date().toISOString()
    };
    this.notes.push(note);
    this.activeNoteId = note.id;
    this._loadNote(note.id);
    this._renderList();
    this.editorEl.focus();
  }

  _escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}