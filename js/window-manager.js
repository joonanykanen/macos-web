/* ============================================
   macOS Web - Window Manager
   ============================================ */
class WindowManager {
  constructor() {
    this.windows = new Map();
    this.zIndexCounter = 100;
    this.activeWindowId = null;
    this.dragState = null;
    this.resizeState = null;
    this.windowIdCounter = 0;

    this._bindEvents();
  }

  _bindEvents() {
    document.addEventListener('mousemove', (e) => this._onMouseMove(e));
    document.addEventListener('mouseup', (e) => this._onMouseUp(e));
    document.addEventListener('mousedown', (e) => {
      // Click on desktop background - deselect all
      if (e.target.id === 'desktop' || e.target.id === 'windows-container') {
        this.deselectAll();
      }
    });
  }

  createWindow(options) {
    const {
      id, title, icon, content, width = 800, height = 500,
      x, y, minWidth = 300, minHeight = 200, appKey, onClose
    } = options;

    const windowId = id || `window-${++this.windowIdCounter}`;

    // Calculate position
    const desktopRect = document.getElementById('desktop').getBoundingClientRect();
    const winX = x ?? Math.max(50, (desktopRect.width - width) / 2 + (Math.random() * 40 - 20));
    const winY = y ?? Math.max(30, (desktopRect.height - height) / 2 + (Math.random() * 30 - 15));

    // Create window element
    const win = document.createElement('div');
    win.className = 'window opening focused';
    win.id = windowId;
    win.dataset.appKey = appKey || '';
    win.style.cssText = `
      left: ${winX}px;
      top: ${winY}px;
      width: ${width}px;
      height: ${height}px;
      min-width: ${minWidth}px;
      min-height: ${minHeight}px;
      z-index: ${++this.zIndexCounter};
    `;

    win.innerHTML = `
      <div class="window-titlebar">
        <div class="window-controls">
          <button class="window-btn window-btn-close" title="Close">✕</button>
          <button class="window-btn window-btn-minimize" title="Minimize">−</button>
          <button class="window-btn window-btn-maximize" title="Maximize">+</button>
        </div>
        <div class="window-title">
          ${icon ? `<span class="window-titlebar-icon">${icon}</span>` : ''}${title}
        </div>
      </div>
      <div class="window-content">${content}</div>
      <div class="resize-handle resize-handle-n"></div>
      <div class="resize-handle resize-handle-s"></div>
      <div class="resize-handle resize-handle-e"></div>
      <div class="resize-handle resize-handle-w"></div>
      <div class="resize-handle resize-handle-ne"></div>
      <div class="resize-handle resize-handle-nw"></div>
      <div class="resize-handle resize-handle-se"></div>
      <div class="resize-handle resize-handle-sw"></div>
    `;

    document.getElementById('windows-container').appendChild(win);

    // Store window data
    this.windows.set(windowId, {
      id: windowId,
      title,
      icon,
      appKey,
      element: win,
      minimized: false,
      maximized: false,
      preMaximize: null,
      onClose,
      onReady: options.onReady || null
    });

    // Bind window events
    this._bindWindowEvents(win, windowId);

    // Focus this window
    this.focusWindow(windowId);

    // Remove opening animation class
    setTimeout(() => win.classList.remove('opening'), 250);

    // Call onReady
    if (options.onReady) {
      options.onReady(win.querySelector('.window-content'), windowId);
    }

    return windowId;
  }

  _bindWindowEvents(win, windowId) {
    const titlebar = win.querySelector('.window-titlebar');

    // Focus on click
    win.addEventListener('mousedown', () => this.focusWindow(windowId));

    // Close button
    win.querySelector('.window-btn-close').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeWindow(windowId);
    });

    // Minimize button
    win.querySelector('.window-btn-minimize').addEventListener('click', (e) => {
      e.stopPropagation();
      this.minimizeWindow(windowId);
    });

    // Maximize button
    win.querySelector('.window-btn-maximize').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMaximize(windowId);
    });

    // Double-click titlebar to maximize
    titlebar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.window-controls')) return;
      this.toggleMaximize(windowId);
    });

    // Drag from titlebar
    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.window-controls')) return;
      const winData = this.windows.get(windowId);
      if (winData.maximized) return;

      this.dragState = {
        windowId,
        startX: e.clientX,
        startY: e.clientY,
        origLeft: parseInt(win.style.left),
        origTop: parseInt(win.style.top)
      };
      e.preventDefault();
    });

    // Resize handles
    const handles = win.querySelectorAll('.resize-handle');
    handles.forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        const winData = this.windows.get(windowId);
        if (winData.maximized) return;

        const rect = win.getBoundingClientRect();
        this.resizeState = {
          windowId,
          handle: handle.className.replace('resize-handle ', ''),
          startX: e.clientX,
          startY: e.clientY,
          origRect: {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          }
        };
        e.preventDefault();
        e.stopPropagation();
      });
    });
  }

  _onMouseMove(e) {
    if (this.dragState) {
      const { windowId, startX, startY, origLeft, origTop } = this.dragState;
      const win = this.windows.get(windowId)?.element;
      if (!win) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      win.style.left = `${origLeft + dx}px`;
      win.style.top = `${Math.max(0, origTop + dy)}px`;
    }

    if (this.resizeState) {
      const { windowId, handle, startX, startY, origRect } = this.resizeState;
      const win = this.windows.get(windowId)?.element;
      if (!win) return;

      const winData = this.windows.get(windowId);
      const minWidth = parseInt(win.style.minWidth) || 300;
      const minHeight = parseInt(win.style.minHeight) || 200;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newLeft = origRect.left;
      let newTop = origRect.top;
      let newWidth = origRect.width;
      let newHeight = origRect.height;

      if (handle.includes('e')) newWidth = Math.max(minWidth, origRect.width + dx);
      if (handle.includes('w')) {
        newWidth = Math.max(minWidth, origRect.width - dx);
        newLeft = origRect.left + (origRect.width - newWidth);
      }
      if (handle.includes('s')) newHeight = Math.max(minHeight, origRect.height + dy);
      if (handle.includes('n')) {
        newHeight = Math.max(minHeight, origRect.height - dy);
        newTop = origRect.top + (origRect.height - newHeight);
      }

      win.style.left = `${newLeft}px`;
      win.style.top = `${newTop}px`;
      win.style.width = `${newWidth}px`;
      win.style.height = `${newHeight}px`;
    }
  }

  _onMouseUp(e) {
    this.dragState = null;
    this.resizeState = null;
  }

  focusWindow(windowId) {
    // Remove focus from all
    this.windows.forEach((data) => {
      data.element.classList.remove('focused');
    });

    // Focus this window
    const winData = this.windows.get(windowId);
    if (!winData) return;

    winData.element.classList.add('focused');
    winData.element.style.zIndex = ++this.zIndexCounter;
    this.activeWindowId = windowId;

    // Update menu bar app name
    const appNameEl = document.getElementById('menu-app-name');
    if (appNameEl) {
      appNameEl.textContent = winData.title;
    }

    // Update menu items for the app
    this._updateMenuBar(winData.appKey);
  }

  _updateMenuBar(appKey) {
    const menuItems = document.getElementById('menu-items');
    if (!menuItems || !appKey) return;

    const menus = AppManager?.getMenuForApp(appKey);
    if (menus) {
      menuItems.innerHTML = menus.map(item =>
        `<div class="menu-item" data-menu="${item.key}">${item.label}</div>`
      ).join('');
    }
  }

  closeWindow(windowId) {
    const winData = this.windows.get(windowId);
    if (!winData) return;

    if (winData.onClose) winData.onClose();

    winData.element.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
    winData.element.style.transform = 'scale(0.9)';
    winData.element.style.opacity = '0';

    setTimeout(() => {
      winData.element.remove();
      this.windows.delete(windowId);
      this._updateDockDots();

      // Focus next window
      if (this.windows.size > 0) {
        const lastWin = Array.from(this.windows.values()).pop();
        this.focusWindow(lastWin.id);
      } else {
        document.getElementById('menu-app-name').textContent = 'Finder';
      }
    }, 200);
  }

  minimizeWindow(windowId) {
    const winData = this.windows.get(windowId);
    if (!winData) return;

    winData.minimized = true;
    winData.element.classList.add('minimizing');

    setTimeout(() => {
      winData.element.style.display = 'none';
      winData.element.classList.remove('minimizing');
    }, 400);

    // Focus next window
    const otherWindows = Array.from(this.windows.values()).filter(w => w.id !== windowId && !w.minimized);
    if (otherWindows.length > 0) {
      this.focusWindow(otherWindows[otherWindows.length - 1].id);
    } else {
      document.getElementById('menu-app-name').textContent = 'Finder';
    }
  }

  restoreWindow(windowId) {
    const winData = this.windows.get(windowId);
    if (!winData) return;

    winData.minimized = false;
    winData.element.style.display = 'flex';
    this.focusWindow(windowId);
  }

  toggleMaximize(windowId) {
    const winData = this.windows.get(windowId);
    if (!winData) return;

    const win = winData.element;

    if (winData.maximized) {
      // Restore
      const pre = winData.preMaximize;
      win.style.left = pre.left;
      win.style.top = pre.top;
      win.style.width = pre.width;
      win.style.height = pre.height;
      win.classList.remove('maximized');
      winData.maximized = false;
    } else {
      // Maximize
      const desktopRect = document.getElementById('desktop').getBoundingClientRect();
      winData.preMaximize = {
        left: win.style.left,
        top: win.style.top,
        width: win.style.width,
        height: win.style.height
      };

      win.style.left = '0px';
      win.style.top = '0px';
      win.style.width = `${desktopRect.width}px`;
      win.style.height = `${desktopRect.height}px`;
      win.classList.add('maximized');
      winData.maximized = true;
    }
  }

  deselectAll() {
    this.windows.forEach((data) => {
      data.element.classList.remove('focused');
    });
    document.getElementById('menu-app-name').textContent = 'Finder';
  }

  _updateDockDots() {
    const appKeys = new Set();
    this.windows.forEach((data) => {
      if (data.appKey) appKeys.add(data.appKey);
    });

    document.querySelectorAll('.dock-dot').forEach(dot => {
      const key = dot.dataset.appKey;
      dot.classList.toggle('active', appKeys.has(key));
    });
  }

  getActiveWindow() {
    return this.windows.get(this.activeWindowId);
  }

  getWindowById(windowId) {
    return this.windows.get(windowId);
  }

  getAllWindows() {
    return Array.from(this.windows.values());
  }

  getWindowsByApp(appKey) {
    return Array.from(this.windows.values()).filter(w => w.appKey === appKey);
  }
}

// Global instance
let windowManager;