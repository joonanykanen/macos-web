/* ============================================
   Reminders App
   ============================================ */
class RemindersApp {
  constructor() {
    this.lists = {
      'All': [
        { id: 1, text: 'Complete macOS Web project', completed: false },
        { id: 2, text: 'Review pull requests', completed: false },
        { id: 3, text: 'Buy groceries', completed: true },
        { id: 4, text: 'Schedule dentist appointment', completed: false },
        { id: 5, text: 'Update portfolio website', completed: false },
        { id: 6, text: 'Read "Clean Code" chapter 5', completed: true },
        { id: 7, text: 'Call mom', completed: false },
        { id: 8, text: 'Prepare presentation for Friday', completed: false },
      ],
      'Personal': [
        { id: 9, text: 'Buy groceries', completed: true },
        { id: 10, text: 'Schedule dentist appointment', completed: false },
        { id: 11, text: 'Call mom', completed: false },
        { id: 12, text: 'Clean the apartment', completed: false },
      ],
      'Work': [
        { id: 13, text: 'Complete macOS Web project', completed: false },
        { id: 14, text: 'Review pull requests', completed: false },
        { id: 15, text: 'Update portfolio website', completed: false },
        { id: 16, text: 'Prepare presentation for Friday', completed: false },
      ],
      'Shopping': [
        { id: 17, text: 'Milk', completed: true },
        { id: 18, text: 'Bread', completed: true },
        { id: 19, text: 'Eggs', completed: false },
        { id: 20, text: 'Coffee beans', completed: false },
      ]
    };
    this.activeList = 'All';
    this.nextId = 21;
  }

  open() {
    const content = `
      <div class="reminders-container">
        <div class="reminders-sidebar">
          <div class="reminders-sidebar-item active" data-list="All">
            <span>📋</span> All
            <span class="reminders-sidebar-count" id="count-All"></span>
          </div>
          <div class="reminders-sidebar-item" data-list="Personal">
            <span>👤</span> Personal
            <span class="reminders-sidebar-count" id="count-Personal"></span>
          </div>
          <div class="reminders-sidebar-item" data-list="Work">
            <span>💼</span> Work
            <span class="reminders-sidebar-count" id="count-Work"></span>
          </div>
          <div class="reminders-sidebar-item" data-list="Shopping">
            <span>🛒</span> Shopping
            <span class="reminders-sidebar-count" id="count-Shopping"></span>
          </div>
        </div>
        <div class="reminders-main">
          <div class="reminders-toolbar">
            <span style="font-weight:600;font-size:16px;" id="reminders-list-title">All</span>
            <input type="text" class="reminders-add-input" id="reminders-add-input" placeholder="New Reminder">
            <button class="reminders-add-btn" id="reminders-add-btn">+</button>
          </div>
          <div class="reminders-list" id="reminders-list"></div>
        </div>
      </div>
    `;

    windowManager.createWindow({
      id: 'reminders-window',
      title: 'Reminders',
      icon: '✅',
      content,
      width: 650,
      height: 450,
      appKey: 'reminders',
      onReady: (contentEl) => this._init(contentEl)
    });
  }

  _init(contentEl) {
    this.contentEl = contentEl;
    this.listEl = contentEl.querySelector('#reminders-list');
    this.addInput = contentEl.querySelector('#reminders-add-input');
    this.titleEl = contentEl.querySelector('#reminders-list-title');

    // List selection
    contentEl.querySelectorAll('.reminders-sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        contentEl.querySelectorAll('.reminders-sidebar-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.activeList = item.dataset.list;
        this.titleEl.textContent = this.activeList;
        this._render();
      });
    });

    // Add reminder
    contentEl.querySelector('#reminders-add-btn').addEventListener('click', () => this._addReminder());
    this.addInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._addReminder();
    });

    this._render();
  }

  _render() {
    const reminders = this.lists[this.activeList] || [];
    const activeCount = reminders.filter(r => !r.completed).length;

    // Update counts
    Object.keys(this.lists).forEach(key => {
      const countEl = this.contentEl.querySelector(`#count-${key}`);
      if (countEl) {
        const count = this.lists[key].filter(r => !r.completed).length;
        countEl.textContent = count > 0 ? count : '';
      }
    });

    // Sort: incomplete first, then completed
    const sorted = [...reminders].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.id - b.id;
    });

    this.listEl.innerHTML = sorted.map(reminder => `
      <div class="reminder-item" data-id="${reminder.id}">
        <div class="reminder-checkbox ${reminder.completed ? 'checked' : ''}" data-id="${reminder.id}"></div>
        <span class="reminder-text ${reminder.completed ? 'completed' : ''}">${this._escapeHtml(reminder.text)}</span>
        <button class="reminder-delete" data-id="${reminder.id}">✕</button>
      </div>
    `).join('');

    // Checkbox clicks
    this.listEl.querySelectorAll('.reminder-checkbox').forEach(cb => {
      cb.addEventListener('click', () => this._toggleReminder(parseInt(cb.dataset.id)));
    });

    // Delete clicks
    this.listEl.querySelectorAll('.reminder-delete').forEach(btn => {
      btn.addEventListener('click', () => this._deleteReminder(parseInt(btn.dataset.id)));
    });
  }

  _addReminder() {
    const text = this.addInput.value.trim();
    if (!text) return;

    const reminder = {
      id: this.nextId++,
      text,
      completed: false
    };

    this.lists[this.activeList].push(reminder);
    if (this.activeList !== 'All') {
      // Also add to All
      this.lists['All'].push({ ...reminder });
    }

    this.addInput.value = '';
    this._render();
  }

  _toggleReminder(id) {
    Object.values(this.lists).forEach(list => {
      const reminder = list.find(r => r.id === id);
      if (reminder) reminder.completed = !reminder.completed;
    });
    this._render();
  }

  _deleteReminder(id) {
    Object.keys(this.lists).forEach(key => {
      this.lists[key] = this.lists[key].filter(r => r.id !== id);
    });
    this._render();
  }

  _escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}