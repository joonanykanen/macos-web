/* ============================================
   Finder App
   ============================================ */
class FinderApp {
  constructor() {
    this.currentPath = '/';
    this.viewMode = 'grid'; // grid or list
    this.fileSystem = this._createFileSystem();
  }

  _createFileSystem() {
    return {
      '/': {
        type: 'folder',
        children: {
          'Desktop': {
            type: 'folder', children: {
              'Screenshot 2024.png': { type: 'file', icon: '🖼️', size: '2.4 MB', modified: 'Jan 15, 2024' },
              'Notes.txt': { type: 'file', icon: '📝', size: '1.2 KB', modified: 'Feb 3, 2024' },
            }
          },
          'Documents': {
            type: 'folder', children: {
              'Project': {
                type: 'folder', children: {
                  'index.html': { type: 'file', icon: '🌐', size: '4.1 KB', modified: 'Mar 10, 2024' },
                  'style.css': { type: 'file', icon: '🎨', size: '2.8 KB', modified: 'Mar 10, 2024' },
                  'app.js': { type: 'file', icon: '📜', size: '12.5 KB', modified: 'Mar 11, 2024' },
                  'README.md': { type: 'file', icon: '📋', size: '1.5 KB', modified: 'Mar 8, 2024' },
                }
              },
              'Resume.pdf': { type: 'file', icon: '📄', size: '1.8 MB', modified: 'Dec 20, 2023' },
              'Budget.xlsx': { type: 'file', icon: '📊', size: '340 KB', modified: 'Jan 28, 2024' },
              'Presentation.key': { type: 'file', icon: '📽️', size: '15.2 MB', modified: 'Feb 14, 2024' },
            }
          },
          'Downloads': {
            type: 'folder', children: {
              'macOS-Web.zip': { type: 'file', icon: '📦', size: '45.6 MB', modified: 'Apr 1, 2024' },
              'photo.jpg': { type: 'file', icon: '🖼️', size: '3.2 MB', modified: 'Mar 25, 2024' },
              'song.mp3': { type: 'file', icon: '🎵', size: '8.1 MB', modified: 'Mar 20, 2024' },
              'installer.dmg': { type: 'file', icon: '💿', size: '128 MB', modified: 'Feb 10, 2024' },
            }
          },
          'Pictures': {
            type: 'folder', children: {
              'Vacation': {
                type: 'folder', children: {
                  'beach.jpg': { type: 'file', icon: '🖼️', size: '4.5 MB', modified: 'Jun 15, 2023' },
                  'sunset.jpg': { type: 'file', icon: '🖼️', size: '3.8 MB', modified: 'Jun 15, 2023' },
                  'mountain.jpg': { type: 'file', icon: '🖼️', size: '5.1 MB', modified: 'Jun 16, 2023' },
                }
              },
              'Screenshots': {
                type: 'folder', children: {
                  'Screen Shot 1.png': { type: 'file', icon: '🖼️', size: '2.1 MB', modified: 'Mar 1, 2024' },
                  'Screen Shot 2.png': { type: 'file', icon: '🖼️', size: '1.8 MB', modified: 'Mar 5, 2024' },
                }
              },
              'wallpaper.png': { type: 'file', icon: '🖼️', size: '8.2 MB', modified: 'Jan 1, 2024' },
              'avatar.png': { type: 'file', icon: '🖼️', size: '245 KB', modified: 'Dec 15, 2023' },
            }
          },
          'Music': {
            type: 'folder', children: {
              'Playlist': {
                type: 'folder', children: {
                  'track01.mp3': { type: 'file', icon: '🎵', size: '7.2 MB', modified: 'Nov 1, 2023' },
                  'track02.mp3': { type: 'file', icon: '🎵', size: '6.8 MB', modified: 'Nov 1, 2023' },
                  'track03.mp3': { type: 'file', icon: '🎵', size: '8.1 MB', modified: 'Nov 2, 2023' },
                }
              },
              'favorite.mp3': { type: 'file', icon: '🎵', size: '5.4 MB', modified: 'Oct 15, 2023' },
            }
          },
          'Applications': {
            type: 'folder', children: {
              'Finder.app': { type: 'app', icon: '📁', size: '—', modified: '—' },
              'Safari.app': { type: 'app', icon: '🧭', size: '—', modified: '—' },
              'Terminal.app': { type: 'app', icon: '⬛', size: '—', modified: '—' },
              'Calculator.app': { type: 'app', icon: '🔢', size: '—', modified: '—' },
              'Notes.app': { type: 'app', icon: '📝', size: '—', modified: '—' },
            }
          }
        }
      }
    };
  }

  _getNode(path) {
    if (path === '/') return this.fileSystem['/'];
    const parts = path.split('/').filter(Boolean);
    let node = this.fileSystem['/'];
    for (const part of parts) {
      if (node.children && node.children[part]) {
        node = node.children[part];
      } else {
        return null;
      }
    }
    return node;
  }

  open() {
    const content = `
      <div class="finder-container">
        <div class="finder-sidebar">
          <div class="finder-sidebar-section">
            <div class="finder-sidebar-header">Favorites</div>
            <div class="finder-sidebar-item active" data-path="/">
              <span class="finder-sidebar-icon">🏠</span> Home
            </div>
            <div class="finder-sidebar-item" data-path="/Desktop">
              <span class="finder-sidebar-icon">🖥️</span> Desktop
            </div>
            <div class="finder-sidebar-item" data-path="/Documents">
              <span class="finder-sidebar-icon">📄</span> Documents
            </div>
            <div class="finder-sidebar-item" data-path="/Downloads">
              <span class="finder-sidebar-icon">⬇️</span> Downloads
            </div>
            <div class="finder-sidebar-item" data-path="/Pictures">
              <span class="finder-sidebar-icon">🖼️</span> Pictures
            </div>
            <div class="finder-sidebar-item" data-path="/Music">
              <span class="finder-sidebar-icon">🎵</span> Music
            </div>
          </div>
          <div class="finder-sidebar-section">
            <div class="finder-sidebar-header">Locations</div>
            <div class="finder-sidebar-item" data-path="/Applications">
              <span class="finder-sidebar-icon">📱</span> Applications
            </div>
          </div>
        </div>
        <div class="finder-main">
          <div class="finder-toolbar">
            <button class="finder-toolbar-btn" id="finder-back">◀</button>
            <button class="finder-toolbar-btn" id="finder-forward">▶</button>
            <div class="finder-path" id="finder-path">/</div>
            <div class="finder-view-toggle">
              <button class="finder-view-btn active" data-view="grid" title="Grid View">▦</button>
              <button class="finder-view-btn" data-view="list" title="List View">☰</button>
            </div>
          </div>
          <div class="finder-content" id="finder-content"></div>
          <div class="finder-status-bar" id="finder-status">0 items</div>
        </div>
      </div>
    `;

    windowManager.createWindow({
      id: 'finder-window',
      title: 'Finder',
      icon: '📁',
      content,
      width: 900,
      height: 550,
      appKey: 'finder',
      onReady: (contentEl) => this._init(contentEl)
    });
  }

  _init(contentEl) {
    this.contentEl = contentEl;
    this.history = ['/'];
    this.historyIndex = 0;
    this._navigateTo('/');

    // Sidebar navigation
    contentEl.querySelectorAll('.finder-sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        const path = item.dataset.path;
        this._addToHistory(path);
        this._navigateTo(path);
      });
    });

    // Back/Forward
    contentEl.querySelector('#finder-back').addEventListener('click', () => {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this._navigateTo(this.history[this.historyIndex]);
      }
    });

    contentEl.querySelector('#finder-forward').addEventListener('click', () => {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this._navigateTo(this.history[this.historyIndex]);
      }
    });

    // View toggle
    contentEl.querySelectorAll('.finder-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        contentEl.querySelectorAll('.finder-view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.viewMode = btn.dataset.view;
        this._renderContent();
      });
    });
  }

  _addToHistory(path) {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(path);
    this.historyIndex = this.history.length - 1;
  }

  _navigateTo(path) {
    this.currentPath = path;
    this._renderContent();

    // Update path display
    const pathEl = this.contentEl.querySelector('#finder-path');
    if (pathEl) pathEl.textContent = path;

    // Update sidebar active state
    this.contentEl.querySelectorAll('.finder-sidebar-item').forEach(item => {
      item.classList.toggle('active', item.dataset.path === path);
    });
  }

  _renderContent() {
    const container = this.contentEl.querySelector('#finder-content');
    const statusEl = this.contentEl.querySelector('#finder-status');
    const node = this._getNode(this.currentPath);

    if (!node || !node.children) {
      container.innerHTML = '<div style="padding:20px;color:var(--text-secondary)">Empty folder</div>';
      statusEl.textContent = '0 items';
      return;
    }

    const items = Object.entries(node.children);
    statusEl.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

    if (this.viewMode === 'grid') {
      container.innerHTML = `<div class="finder-grid">
        ${items.map(([name, data]) => `
          <div class="finder-item" data-name="${name}" data-type="${data.type}">
            <div class="finder-item-icon">${data.icon || (data.type === 'folder' ? '📁' : '📄')}</div>
            <div class="finder-item-name">${name}</div>
          </div>
        `).join('')}
      </div>`;
    } else {
      container.innerHTML = `
        <div class="finder-list">
          <div class="finder-list-header">
            <span>Name</span><span>Size</span><span>Type</span><span>Modified</span>
          </div>
          ${items.map(([name, data]) => `
            <div class="finder-list-item" data-name="${name}" data-type="${data.type}">
              <span>${data.icon || (data.type === 'folder' ? '📁' : '📄')} ${name}</span>
              <span>${data.size || '—'}</span>
              <span>${data.type === 'folder' ? 'Folder' : 'File'}</span>
              <span>${data.modified || '—'}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Double-click to open folders
    container.querySelectorAll('.finder-item, .finder-list-item').forEach(item => {
      item.addEventListener('dblclick', () => {
        const name = item.dataset.name;
        const type = item.dataset.type;
        if (type === 'folder') {
          const newPath = this.currentPath === '/' ? `/${name}` : `${this.currentPath}/${name}`;
          this._addToHistory(newPath);
          this._navigateTo(newPath);
        }
      });

      item.addEventListener('click', (e) => {
        container.querySelectorAll('.finder-item, .finder-list-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
      });
    });
  }
}