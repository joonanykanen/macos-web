/* ============================================
   macOS Web - Main Application
   ============================================ */

// --- App Registry ---
const apps = {
  finder: { name: 'Finder', icon: '📁', cls: FinderApp },
  safari: { name: 'Safari', icon: '🧭', cls: SafariApp },
  terminal: { name: 'Terminal', icon: '⬛', cls: TerminalApp },
  calculator: { name: 'Calculator', icon: '🔢', cls: CalculatorApp },
  notes: { name: 'Notes', icon: '📝', cls: NotesApp },
  textedit: { name: 'TextEdit', icon: '📄', cls: TextEditApp },
  calendar: { name: 'Calendar', icon: '📅', cls: CalendarApp },
  'system-prefs': { name: 'System Preferences', icon: '⚙️', cls: SystemPrefsApp },
  photos: { name: 'Photos', icon: '🌈', cls: PhotosApp },
  music: { name: 'Music', icon: '🎵', cls: MusicApp },
  reminders: { name: 'Reminders', icon: '✅', cls: RemindersApp },
  weather: { name: 'Weather', icon: '🌤️', cls: WeatherApp },
};

// App instances cache
const appInstances = {};

function getAppInstance(key) {
  if (!appInstances[key]) {
    appInstances[key] = new apps[key].cls();
  }
  return appInstances[key];
}

// --- AppManager ---
const AppManager = {
  openApp(key) {
    const app = apps[key];
    if (!app) return;

    // Check if window already exists
    const existing = windowManager.getWindowsByApp(key);
    if (existing.length > 0) {
      const win = existing[existing.length - 1];
      if (win.minimized) {
        windowManager.restoreWindow(win.id);
      } else {
        windowManager.focusWindow(win.id);
      }
      return;
    }

    // Bounce dock icon
    const dockItem = document.querySelector(`.dock-item[data-app="${key}"]`);
    if (dockItem) {
      dockItem.classList.add('bouncing');
      setTimeout(() => dockItem.classList.remove('bouncing'), 700);
    }

    // Open app
    getAppInstance(key).open();

    // Activate dock dot
    const dot = document.querySelector(`.dock-dot[data-app-key="${key}"]`);
    if (dot) dot.classList.add('active');
  },

  getMenuForApp(key) {
    const menus = {
      finder: [
        { key: 'file', label: 'File' },
        { key: 'edit', label: 'Edit' },
        { key: 'view', label: 'View' },
        { key: 'go', label: 'Go' },
        { key: 'window', label: 'Window' },
        { key: 'help', label: 'Help' },
      ],
      terminal: [
        { key: 'shell', label: 'Shell' },
        { key: 'edit', label: 'Edit' },
        { key: 'view', label: 'View' },
        { key: 'window', label: 'Window' },
        { key: 'help', label: 'Help' },
      ],
      safari: [
        { key: 'file', label: 'File' },
        { key: 'edit', label: 'Edit' },
        { key: 'develop', label: 'Develop' },
        { key: 'bookmarks', label: 'Bookmarks' },
        { key: 'history', label: 'History' },
        { key: 'window', label: 'Window' },
        { key: 'help', label: 'Help' },
      ],
      notes: [
        { key: 'note', label: 'Note' },
        { key: 'edit', label: 'Edit' },
        { key: 'format', label: 'Format' },
        { key: 'view', label: 'View' },
        { key: 'window', label: 'Window' },
        { key: 'help', label: 'Help' },
      ],
    };
    return menus[key] || menus.finder;
  }
};

// --- Clock ---
function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById('menu-clock-time');
  const dateEl = document.getElementById('menu-clock-date');
  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // Login screen clock
  const loginTime = document.getElementById('login-time');
  const loginDate = document.getElementById('login-date');
  if (loginTime) {
    loginTime.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
  }
  if (loginDate) {
    loginDate.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
}

// --- Boot Sequence ---
function boot() {
  const progressBar = document.getElementById('boot-progress-bar');
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      setTimeout(() => {
        document.getElementById('boot-screen').classList.add('fade-out');
        setTimeout(() => {
          document.getElementById('boot-screen').classList.add('hidden');
          document.getElementById('login-screen').classList.remove('hidden');
          document.getElementById('login-password').focus();
        }, 800);
      }, 300);
    }
    progressBar.style.width = `${progress}%`;
  }, 200);
}

// --- Login ---
function handleLogin() {
  const loginScreen = document.getElementById('login-screen');
  loginScreen.classList.add('fade-out');

  setTimeout(() => {
    loginScreen.classList.add('hidden');
    document.getElementById('desktop').classList.remove('hidden');

    // Initialize desktop
    initDesktop();

    // Send welcome notification
    setTimeout(() => {
      showNotification('macOS Web', 'Welcome to macOS Web!', 'Click apps in the dock to get started. Press Cmd+Space for Spotlight search.');
    }, 1000);
  }, 500);
}

// --- Desktop Initialization ---
function initDesktop() {
  windowManager = new WindowManager();

  // Build dock
  buildDock();

  // Build desktop icons
  buildDesktopIcons();

  // Start clock
  updateClock();
  setInterval(updateClock, 1000);

  // Bind menu bar events
  bindMenuBar();

  // Bind spotlight
  bindSpotlight();

  // Bind context menu
  bindContextMenu();

  // Bind control center
  bindControlCenter();

  // Bind notification center
  bindNotificationCenter();

  // Global keyboard shortcuts
  bindKeyboardShortcuts();
}

// --- Dock ---
function buildDock() {
  const dock = document.getElementById('dock');
  const dockApps = [
    'finder', 'safari', 'terminal', 'calculator', 'notes',
    'textedit', 'calendar', 'photos', 'music', 'reminders', 'weather', 'system-prefs'
  ];

  dock.innerHTML = dockApps.map(key => {
    const app = apps[key];
    return `
      <div class="dock-item" data-app="${key}" onclick="AppManager.openApp('${key}')">
        <div class="dock-tooltip">${app.name}</div>
        <div class="dock-icon">${app.icon}</div>
        <div class="dock-dot" data-app-key="${key}"></div>
      </div>
    `;
  }).join('');
}

// --- Desktop Icons ---
function buildDesktopIcons() {
  const container = document.getElementById('desktop-icons');
  const icons = [
    { name: 'Macintosh HD', icon: '💾', action: () => AppManager.openApp('finder') },
    { name: 'Documents', icon: '📁', action: () => AppManager.openApp('finder') },
    { name: 'Screenshot.png', icon: '🖼️', action: () => AppManager.openApp('photos') },
  ];

  container.innerHTML = icons.map((ic, i) => `
    <div class="desktop-icon" data-index="${i}" ondblclick="(${ic.action.toString()})()">
      <div class="desktop-icon-img">${ic.icon}</div>
      <div class="desktop-icon-label">${ic.name}</div>
    </div>
  `).join('');

  // Single click to select
  container.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', (e) => {
      container.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
      e.stopPropagation();
    });
  });
}

// --- Menu Bar ---
function bindMenuBar() {
  // Apple menu
  document.getElementById('menu-apple-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllMenus();
    const menu = createDropdownMenu([
      { label: 'About This Mac', action: () => { AppManager.openApp('system-prefs'); } },
      { separator: true },
      { label: 'System Preferences...', action: () => AppManager.openApp('system-prefs') },
      { label: 'App Store...', action: () => showNotification('App Store', 'Coming soon!') },
      { separator: true },
      { label: 'Recent Items', disabled: true },
      { separator: true },
      { label: 'Force Quit...', shortcut: '⌥⌘Esc', action: () => {} },
      { separator: true },
      { label: 'Sleep', action: () => {} },
      { label: 'Restart...', action: () => location.reload() },
      { label: 'Shut Down...', action: () => {
        document.getElementById('desktop').style.transition = 'opacity 1s';
        document.getElementById('desktop').style.opacity = '0';
        setTimeout(() => {
          document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:white;font-size:18px;">Shut down. Refresh to restart.</div>';
        }, 1000);
      }},
    ]);

    menu.style.top = '28px';
    menu.style.left = '4px';
    document.body.appendChild(menu);
  });

  // Menu items
  document.getElementById('menu-items').addEventListener('click', (e) => {
    const item = e.target.closest('.menu-item');
    if (!item) return;
    e.stopPropagation();
    closeAllMenus();

    const menuKey = item.dataset.menu;
    const menus = {
      file: [
        { label: 'New Window', shortcut: '⌘N', action: () => AppManager.openApp('finder') },
        { label: 'New Folder', shortcut: '⇧⌘N', action: () => showNotification('Finder', 'New folder created') },
        { separator: true },
        { label: 'Open', shortcut: '⌘O', action: () => {} },
        { label: 'Close Window', shortcut: '⌘W', action: () => {
          if (windowManager.activeWindowId) windowManager.closeWindow(windowManager.activeWindowId);
        }},
        { separator: true },
        { label: 'Get Info', shortcut: '⌘I', action: () => {} },
        { separator: true },
        { label: 'Quit', shortcut: '⌘Q', action: () => {} },
      ],
      edit: [
        { label: 'Undo', shortcut: '⌘Z', action: () => document.execCommand('undo') },
        { label: 'Redo', shortcut: '⇧⌘Z', action: () => document.execCommand('redo') },
        { separator: true },
        { label: 'Cut', shortcut: '⌘X', action: () => document.execCommand('cut') },
        { label: 'Copy', shortcut: '⌘C', action: () => document.execCommand('copy') },
        { label: 'Paste', shortcut: '⌘V', action: () => document.execCommand('paste') },
        { label: 'Select All', shortcut: '⌘A', action: () => document.execCommand('selectAll') },
        { separator: true },
        { label: 'Find...', shortcut: '⌘F', action: () => {} },
      ],
      view: [
        { label: 'as Icons', shortcut: '⌘1', action: () => {} },
        { label: 'as List', shortcut: '⌘2', action: () => {} },
        { label: 'as Columns', shortcut: '⌘3', action: () => {} },
        { label: 'as Gallery', shortcut: '⌘4', action: () => {} },
        { separator: true },
        { label: 'Show Path Bar', action: () => {} },
        { label: 'Show Status Bar', action: () => {} },
        { separator: true },
        { label: 'Enter Full Screen', shortcut: '⌃⌘F', action: () => {} },
      ],
      go: [
        { label: 'Back', shortcut: '⌘[', action: () => {} },
        { label: 'Forward', shortcut: '⌘]', action: () => {} },
        { separator: true },
        { label: 'Desktop', shortcut: '⇧⌘D', action: () => {} },
        { label: 'Documents', shortcut: '⌥⌘O', action: () => {} },
        { label: 'Downloads', shortcut: '⌥⌘L', action: () => {} },
        { label: 'Home', shortcut: '⇧⌘H', action: () => {} },
      ],
      window: [
        { label: 'Minimize', shortcut: '⌘M', action: () => {
          if (windowManager.activeWindowId) windowManager.minimizeWindow(windowManager.activeWindowId);
        }},
        { label: 'Zoom', action: () => {
          if (windowManager.activeWindowId) windowManager.toggleMaximize(windowManager.activeWindowId);
        }},
        { separator: true },
        { label: 'Bring All to Front', action: () => {} },
      ],
      help: [
        { label: 'macOS Web Help', action: () => {} },
        { label: 'Keyboard Shortcuts', action: () => showNotification('Shortcuts', 'Cmd+Space: Spotlight\nCmd+W: Close Window\nCmd+M: Minimize') },
      ],
    };

    const menuItems = menus[menuKey] || [];
    if (menuItems.length === 0) return;

    const rect = item.getBoundingClientRect();
    const menu = createDropdownMenu(menuItems);
    menu.style.top = '28px';
    menu.style.left = `${rect.left}px`;
    document.body.appendChild(menu);
  });
}

function createDropdownMenu(items) {
  const menu = document.createElement('div');
  menu.className = 'dropdown-menu';

  menu.innerHTML = items.map(item => {
    if (item.separator) return '<div class="ctx-separator"></div>';
    return `
      <div class="ctx-item ${item.disabled ? 'disabled' : ''}">
        <span>${item.label}</span>
        ${item.shortcut ? `<span class="ctx-shortcut">${item.shortcut}</span>` : ''}
      </div>
    `;
  }).join('');

  menu.querySelectorAll('.ctx-item:not(.disabled)').forEach((el, i) => {
    const item = items.filter(it => !it.separator)[i];
    if (item && item.action) {
      el.addEventListener('click', () => {
        closeAllMenus();
        item.action();
      });
    }
  });

  return menu;
}

function closeAllMenus() {
  document.querySelectorAll('.dropdown-menu').forEach(m => m.remove());
  document.getElementById('context-menu')?.remove();
}

// --- Spotlight ---
function bindSpotlight() {
  const overlay = document.getElementById('spotlight-overlay');
  const input = document.getElementById('spotlight-input');
  const results = document.getElementById('spotlight-results');

  document.getElementById('menu-spotlight').addEventListener('click', () => openSpotlight());

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase().trim();
    if (!query) {
      results.innerHTML = '';
      return;
    }

    const matchedApps = Object.entries(apps).filter(([key, app]) =>
      app.name.toLowerCase().includes(query) || key.includes(query)
    );

    results.innerHTML = matchedApps.map(([key, app]) => `
      <div class="spotlight-result" data-app="${key}">
        <div class="spotlight-result-icon">${app.icon}</div>
        <div class="spotlight-result-info">
          <div class="spotlight-result-name">${app.name}</div>
          <div class="spotlight-result-sub">Application</div>
        </div>
      </div>
    `).join('');

    // Add web search option
    if (matchedApps.length > 0 || query.length > 2) {
      results.innerHTML += `
        <div class="ctx-separator"></div>
        <div class="spotlight-result" data-search="${query}">
          <div class="spotlight-result-icon">🔍</div>
          <div class="spotlight-result-info">
            <div class="spotlight-result-name">"${query}" in Google</div>
            <div class="spotlight-result-sub">Web Search</div>
          </div>
        </div>
      `;
    }

    // Bind clicks
    results.querySelectorAll('.spotlight-result').forEach(el => {
      el.addEventListener('click', () => {
        if (el.dataset.app) {
          AppManager.openApp(el.dataset.app);
          closeSpotlight();
        } else if (el.dataset.search) {
          AppManager.openApp('safari');
          setTimeout(() => {
            const urlInput = document.querySelector('#safari-url');
            if (urlInput) {
              urlInput.value = el.dataset.search;
              urlInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            }
          }, 300);
          closeSpotlight();
        }
      });
    });
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSpotlight();
    if (e.key === 'Enter') {
      const selected = results.querySelector('.spotlight-result');
      if (selected) selected.click();
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSpotlight();
  });
}

function openSpotlight() {
  const overlay = document.getElementById('spotlight-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('spotlight-input').value = '';
  document.getElementById('spotlight-results').innerHTML = '';
  setTimeout(() => document.getElementById('spotlight-input').focus(), 50);
}

function closeSpotlight() {
  document.getElementById('spotlight-overlay').classList.add('hidden');
}

// --- Context Menu ---
function bindContextMenu() {
  document.getElementById('desktop').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    closeAllMenus();

    const menu = document.createElement('div');
    menu.id = 'context-menu';
    menu.className = '';

    menu.innerHTML = `
      <div class="ctx-item" data-action="new-folder">New Folder</div>
      <div class="ctx-separator"></div>
      <div class="ctx-item" data-action="get-info">Get Info</div>
      <div class="ctx-item" data-action="change-wallpaper">Change Desktop Background...</div>
      <div class="ctx-separator"></div>
      <div class="ctx-item" data-action="use-stacks">Use Stacks</div>
      <div class="ctx-item" data-action="sort-by">Sort By</div>
      <div class="ctx-item" data-action="clean-up">Clean Up</div>
      <div class="ctx-separator"></div>
      <div class="ctx-item" data-action="show-view-options">Show View Options</div>
    `;

    menu.style.left = `${Math.min(e.clientX, window.innerWidth - 230)}px`;
    menu.style.top = `${Math.min(e.clientY, window.innerHeight - 300)}px`;

    menu.querySelectorAll('.ctx-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        switch (action) {
          case 'new-folder': showNotification('Finder', 'New folder created on Desktop'); break;
          case 'get-info': AppManager.openApp('system-prefs'); break;
          case 'change-wallpaper': AppManager.openApp('system-prefs'); break;
          case 'show-view-options': showNotification('View Options', 'View options panel coming soon'); break;
        }
        closeAllMenus();
      });
    });

    document.body.appendChild(menu);
  });

  // Close context menu on click elsewhere
  document.addEventListener('click', () => {
    const ctx = document.getElementById('context-menu');
    if (ctx) ctx.remove();
  });
}

// --- Control Center ---
function bindControlCenter() {
  const cc = document.getElementById('control-center');
  let ccOpen = false;

  document.getElementById('menu-control-center').addEventListener('click', (e) => {
    e.stopPropagation();
    ccOpen = !ccOpen;
    cc.classList.toggle('hidden', !ccOpen);
    document.getElementById('notification-center').classList.add('hidden');
  });

  // Toggle items
  cc.querySelectorAll('.cc-tile-item[data-toggle]').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('active');
      const feature = item.dataset.toggle;
      const status = item.classList.contains('active') ? 'On' : 'Off';
      item.querySelector('.cc-status').textContent = status;
    });
  });

  // Focus modes
  cc.querySelectorAll('.cc-focus-item').forEach(item => {
    item.addEventListener('click', () => {
      cc.querySelectorAll('.cc-focus-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Lock button
  document.getElementById('cc-lock-btn').addEventListener('click', () => {
    cc.classList.add('hidden');
    ccOpen = false;
    document.getElementById('desktop').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('login-password').value = '';
    document.getElementById('login-password').focus();
  });

  // Screenshot button
  document.getElementById('cc-screenshot-btn').addEventListener('click', () => {
    showNotification('Screenshot', 'Screenshot saved to Desktop', '📸');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (ccOpen && !cc.contains(e.target) && e.target.id !== 'menu-control-center') {
      cc.classList.add('hidden');
      ccOpen = false;
    }
  });
}

// --- Notification Center ---
function bindNotificationCenter() {
  const nc = document.getElementById('notification-center');
  let ncOpen = false;

  // Click on clock to toggle
  document.getElementById('menu-clock').addEventListener('click', () => {
    ncOpen = !ncOpen;
    nc.classList.toggle('hidden', !ncOpen);
    document.getElementById('control-center').classList.add('hidden');
  });

  // Clear all
  document.getElementById('nc-clear').addEventListener('click', () => {
    document.getElementById('nc-notifications').innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:40px;">No Notifications</div>';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (ncOpen && !nc.contains(e.target) && e.target.id !== 'menu-clock') {
      nc.classList.add('hidden');
      ncOpen = false;
    }
  });
}

// --- Notifications ---
function showNotification(app, title, body = '') {
  const container = document.getElementById('nc-notifications');

  // Remove "No Notifications" placeholder
  if (container.querySelector('[style*="No Notifications"]')) {
    container.innerHTML = '';
  }

  const notif = document.createElement('div');
  notif.className = 'nc-notification';
  notif.innerHTML = `
    <div class="nc-notif-app">${app}</div>
    <div class="nc-notif-title">${title}</div>
    ${body ? `<div class="nc-notif-body">${body}</div>` : ''}
    <div class="nc-notif-time">Just now</div>
  `;

  container.prepend(notif);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notif.style.transition = 'opacity 0.3s, transform 0.3s';
    notif.style.opacity = '0';
    notif.style.transform = 'translateX(100%)';
    setTimeout(() => notif.remove(), 300);
  }, 5000);
}

// --- Keyboard Shortcuts ---
function bindKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Cmd+Space = Spotlight
    if ((e.metaKey || e.ctrlKey) && e.key === ' ') {
      e.preventDefault();
      const overlay = document.getElementById('spotlight-overlay');
      if (overlay.classList.contains('hidden')) {
        openSpotlight();
      } else {
        closeSpotlight();
      }
    }

    // Cmd+W = Close window
    if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
      e.preventDefault();
      if (windowManager?.activeWindowId) {
        windowManager.closeWindow(windowManager.activeWindowId);
      }
    }

    // Cmd+M = Minimize window
    if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
      e.preventDefault();
      if (windowManager?.activeWindowId) {
        windowManager.minimizeWindow(windowManager.activeWindowId);
      }
    }

    // Cmd+, = System Preferences
    if ((e.metaKey || e.ctrlKey) && e.key === ',') {
      e.preventDefault();
      AppManager.openApp('system-prefs');
    }

    // Escape = Close overlays
    if (e.key === 'Escape') {
      closeSpotlight();
      closeAllMenus();
      document.getElementById('control-center')?.classList.add('hidden');
      document.getElementById('notification-center')?.classList.add('hidden');
    }
  });
}

// --- Login Handler ---
document.getElementById('login-password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleLogin();
});

// --- Start Boot ---
window.addEventListener('DOMContentLoaded', boot);