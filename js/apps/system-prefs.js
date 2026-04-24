/* ============================================
   System Preferences App
   ============================================ */
class SystemPrefsApp {
  constructor() {
    this.activePanel = 'general';
  }

  open() {
    const content = `
      <div class="sysprefs-container">
        <div class="sysprefs-sidebar">
          <input type="text" class="sysprefs-search" placeholder="Search" id="sysprefs-search">
          <div class="sysprefs-item active" data-panel="general">
            <span class="sysprefs-item-icon">⚙️</span>
            <span class="sysprefs-item-label">General</span>
          </div>
          <div class="sysprefs-item" data-panel="about">
            <span class="sysprefs-item-icon">ℹ️</span>
            <span class="sysprefs-item-label">About This Mac</span>
          </div>
          <div class="sysprefs-item" data-panel="desktop">
            <span class="sysprefs-item-icon">🖼️</span>
            <span class="sysprefs-item-label">Desktop & Wallpapers</span>
          </div>
          <div class="sysprefs-item" data-panel="appearance">
            <span class="sysprefs-item-icon">🎨</span>
            <span class="sysprefs-item-label">Appearance</span>
          </div>
          <div class="sysprefs-item" data-panel="dock">
            <span class="sysprefs-item-icon">📌</span>
            <span class="sysprefs-item-label">Dock & Menu Bar</span>
          </div>
          <div class="sysprefs-item" data-panel="display">
            <span class="sysprefs-item-icon">🖥️</span>
            <span class="sysprefs-item-label">Displays</span>
          </div>
          <div class="sysprefs-item" data-panel="sound">
            <span class="sysprefs-item-icon">🔊</span>
            <span class="sysprefs-item-label">Sound</span>
          </div>
          <div class="sysprefs-item" data-panel="wifi">
            <span class="sysprefs-item-icon">📶</span>
            <span class="sysprefs-item-label">Wi-Fi</span>
          </div>
          <div class="sysprefs-item" data-panel="bluetooth">
            <span class="sysprefs-item-icon">🔵</span>
            <span class="sysprefs-item-label">Bluetooth</span>
          </div>
          <div class="sysprefs-item" data-panel="keyboard">
            <span class="sysprefs-item-icon">⌨️</span>
            <span class="sysprefs-item-label">Keyboard</span>
          </div>
          <div class="sysprefs-item" data-panel="trackpad">
            <span class="sysprefs-item-icon">👆</span>
            <span class="sysprefs-item-label">Trackpad</span>
          </div>
          <div class="sysprefs-item" data-panel="notifications">
            <span class="sysprefs-item-icon">🔔</span>
            <span class="sysprefs-item-label">Notifications</span>
          </div>
          <div class="sysprefs-item" data-panel="privacy">
            <span class="sysprefs-item-icon">🔒</span>
            <span class="sysprefs-item-label">Privacy & Security</span>
          </div>
        </div>
        <div class="sysprefs-content" id="sysprefs-content"></div>
      </div>
    `;

    windowManager.createWindow({
      id: 'sysprefs-window',
      title: 'System Preferences',
      icon: '⚙️',
      content,
      width: 820,
      height: 540,
      appKey: 'system-prefs',
      onReady: (contentEl) => this._init(contentEl)
    });
  }

  _init(contentEl) {
    this.contentEl = contentEl;
    this.contentArea = contentEl.querySelector('#sysprefs-content');

    contentEl.querySelectorAll('.sysprefs-item').forEach(item => {
      item.addEventListener('click', () => {
        contentEl.querySelectorAll('.sysprefs-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.activePanel = item.dataset.panel;
        this._renderPanel();
      });
    });

    this._renderPanel();
  }

  _renderPanel() {
    switch (this.activePanel) {
      case 'general': this._renderGeneral(); break;
      case 'about': this._renderAbout(); break;
      case 'desktop': this._renderDesktop(); break;
      case 'appearance': this._renderAppearance(); break;
      case 'dock': this._renderDock(); break;
      case 'display': this._renderDisplay(); break;
      case 'sound': this._renderSound(); break;
      case 'wifi': this._renderWifi(); break;
      case 'bluetooth': this._renderBluetooth(); break;
      case 'keyboard': this._renderKeyboard(); break;
      case 'trackpad': this._renderTrackpad(); break;
      case 'notifications': this._renderNotifications(); break;
      case 'privacy': this._renderPrivacy(); break;
    }
  }

  _toggleSwitch(html) {
    const toggle = html.querySelector('.toggle-switch');
    toggle.addEventListener('click', () => toggle.classList.toggle('active'));
    return html;
  }

  _renderGeneral() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="sysprefs-panel-title">General</div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Allow Handoff</div>
          <div class="sysprefs-option-desc">Allow apps and features from your other devices</div>
        </div>
        ${this._toggleSwitch(document.createElement('div')).innerHTML || '<div class="toggle-switch active"></div>'}
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Default web browser</div>
          <div class="sysprefs-option-desc">Safari</div>
        </div>
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Open documents using</div>
          <div class="sysprefs-option-desc">The app most recently used with the document</div>
        </div>
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Close windows when quitting an app</div>
        </div>
        <div class="toggle-switch active"></div>
      </div>
    `;
    this.contentArea.innerHTML = '';
    this.contentArea.appendChild(div);
    div.querySelectorAll('.toggle-switch').forEach(t => {
      t.addEventListener('click', () => t.classList.toggle('active'));
    });
  }

  _renderAbout() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="about-mac">
        <div class="about-mac-logo">🍎</div>
        <div class="about-mac-name">macOS Web</div>
        <div class="about-mac-version">Version 14.0 (Sonoma Web)</div>
        <div class="about-mac-specs">
          <div class="about-mac-spec">
            <span class="about-mac-spec-label">Chip</span>
            <span class="about-mac-spec-value">Apple M3 Pro (Virtual)</span>
          </div>
          <div class="about-mac-spec">
            <span class="about-mac-spec-label">Memory</span>
            <span class="about-mac-spec-value">16 GB Unified</span>
          </div>
          <div class="about-mac-spec">
            <span class="about-mac-spec-label">Startup Disk</span>
            <span class="about-mac-spec-value">macOS-Web</span>
          </div>
          <div class="about-mac-spec">
            <span class="about-mac-spec-label">Serial Number</span>
            <span class="about-mac-spec-value">WEB${Math.random().toString(36).slice(2, 10).toUpperCase()}</span>
          </div>
          <div class="about-mac-spec">
            <span class="about-mac-spec-label">Display</span>
            <span class="about-mac-spec-value">${window.innerWidth} × ${window.innerHeight}</span>
          </div>
          <div class="about-mac-spec">
            <span class="about-mac-spec-label">Graphics</span>
            <span class="about-mac-spec-value">WebGL 2.0</span>
          </div>
          <div class="about-mac-spec">
            <span class="about-mac-spec-label">Browser</span>
            <span class="about-mac-spec-value">${navigator.userAgent.split(' ').pop()}</span>
          </div>
        </div>
      </div>
    `;
    this.contentArea.innerHTML = '';
    this.contentArea.appendChild(div);
  }

  _renderDesktop() {
    const wallpapers = [
      { name: 'Aurora', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' },
      { name: 'Ocean', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { name: 'Sunset', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)' },
      { name: 'Forest', bg: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
      { name: 'Midnight', bg: 'linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #2d2d6e 100%)' },
      { name: 'Fire', bg: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
      { name: 'Lavender', bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
      { name: 'Peach', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
      { name: 'Arctic', bg: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' },
    ];

    const div = document.createElement('div');
    div.innerHTML = `
      <div class="sysprefs-panel-title">Desktop & Wallpapers</div>
      <div class="wallpaper-grid">
        ${wallpapers.map((w, i) => `
          <div class="wallpaper-preview ${i === 0 ? 'active' : ''}" style="background: ${w.bg};" data-index="${i}">
            <div style="position:absolute;bottom:8px;left:8px;font-size:11px;color:white;text-shadow:0 1px 3px rgba(0,0,0,0.5);">${w.name}</div>
          </div>
        `).join('')}
      </div>
    `;
    this.contentArea.innerHTML = '';
    this.contentArea.appendChild(div);

    div.querySelectorAll('.wallpaper-preview').forEach(wp => {
      wp.addEventListener('click', () => {
        div.querySelectorAll('.wallpaper-preview').forEach(w => w.classList.remove('active'));
        wp.classList.add('active');
        document.getElementById('desktop').style.background = wallpapers[parseInt(wp.dataset.index)].bg;
        document.getElementById('desktop').style.backgroundSize = 'cover';
      });
    });
  }

  _renderAppearance() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="sysprefs-panel-title">Appearance</div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Appearance</div>
          <div class="sysprefs-option-desc">Dark mode is currently active</div>
        </div>
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Accent color</div>
        </div>
        <div style="display:flex;gap:6px;">
          ${['#007aff','#ff3b30','#ff9500','#34c759','#af52de','#ff2d55','#5ac8fa','#ffcc00'].map(c =>
            `<div style="width:22px;height:22px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${c === '#007aff' ? 'white' : 'transparent'};" data-color="${c}"></div>`
          ).join('')}
        </div>
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Sidebar icon size</div>
        </div>
        <span style="color:var(--text-secondary);">Medium</span>
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Show recent items in Go menu</div>
        </div>
        <div class="toggle-switch active"></div>
      </div>
    `;
    this.contentArea.innerHTML = '';
    this.contentArea.appendChild(div);

    div.querySelectorAll('.toggle-switch').forEach(t => {
      t.addEventListener('click', () => t.classList.toggle('active'));
    });

    div.querySelectorAll('[data-color]').forEach(el => {
      el.addEventListener('click', () => {
        document.documentElement.style.setProperty('--accent-color', el.dataset.color);
        div.querySelectorAll('[data-color]').forEach(e => e.style.borderColor = 'transparent');
        el.style.borderColor = 'white';
      });
    });
  }

  _renderDock() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="sysprefs-panel-title">Dock & Menu Bar</div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Size</div>
        </div>
        <input type="range" min="30" max="80" value="48" style="width:150px;" id="dock-size-slider">
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Magnification</div>
        </div>
        <div class="toggle-switch active"></div>
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Minimize windows using</div>
          <div class="sysprefs-option-desc">Genie effect</div>
        </div>
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Show recent applications in Dock</div>
        </div>
        <div class="toggle-switch active"></div>
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Automatically hide and show the Dock</div>
        </div>
        <div class="toggle-switch"></div>
      </div>
    `;
    this.contentArea.innerHTML = '';
    this.contentArea.appendChild(div);

    div.querySelectorAll('.toggle-switch').forEach(t => {
      t.addEventListener('click', () => t.classList.toggle('active'));
    });

    const slider = div.querySelector('#dock-size-slider');
    if (slider) {
      slider.addEventListener('input', () => {
        document.documentElement.style.setProperty('--dock-icon-size', slider.value + 'px');
      });
    }
  }

  _renderDisplay() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="sysprefs-panel-title">Displays</div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Brightness</div>
        </div>
        <input type="range" min="20" max="100" value="80" style="width:200px;" id="brightness-slider">
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">True Tone</div>
          <div class="sysprefs-option-desc">Adjust display color temperature</div>
        </div>
        <div class="toggle-switch active"></div>
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Night Shift</div>
          <div class="sysprefs-option-desc">Warmer color temperature at night</div>
        </div>
        <div class="toggle-switch"></div>
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Resolution</div>
          <div class="sysprefs-option-desc">${window.innerWidth} × ${window.innerHeight}</div>
        </div>
      </div>
    `;
    this.contentArea.innerHTML = '';
    this.contentArea.appendChild(div);

    div.querySelectorAll('.toggle-switch').forEach(t => {
      t.addEventListener('click', () => t.classList.toggle('active'));
    });

    const slider = div.querySelector('#brightness-slider');
    if (slider) {
      slider.addEventListener('input', () => {
        document.getElementById('desktop').style.filter = `brightness(${slider.value / 100})`;
      });
    }
  }

  _renderSound() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="sysprefs-panel-title">Sound</div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Output volume</div>
        </div>
        <input type="range" min="0" max="100" value="70" style="width:200px;">
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Alert volume</div>
        </div>
        <input type="range" min="0" max="100" value="50" style="width:200px;">
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Play sound on startup</div>
        </div>
        <div class="toggle-switch active"></div>
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Alert sound</div>
          <div class="sysprefs-option-desc">Basso</div>
        </div>
      </div>
    `;
    this.contentArea.innerHTML = '';
    this.contentArea.appendChild(div);
    div.querySelectorAll('.toggle-switch').forEach(t => {
      t.addEventListener('click', () => t.classList.toggle('active'));
    });
  }

  _renderWifi() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="sysprefs-panel-title">Wi-Fi</div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Wi-Fi</div>
        </div>
        <div class="toggle-switch active"></div>
      </div>
      <div style="margin-top:16px;">
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">KNOWN NETWORKS</div>
        <div class="sysprefs-option" style="background:rgba(0,122,255,0.15);border:1px solid rgba(0,122,255,0.3);">
          <div>
            <div class="sysprefs-option-label">📶 Home Network</div>
            <div class="sysprefs-option-desc">Connected · Secure</div>
          </div>
        </div>
        <div class="sysprefs-option">
          <div>
            <div class="sysprefs-option-label">📶 Neighbor_WiFi</div>
            <div class="sysprefs-option-desc">Secure</div>
          </div>
        </div>
        <div class="sysprefs-option">
          <div>
            <div class="sysprefs-option-label">📶 CoffeeShop_Free</div>
            <div class="sysprefs-option-desc">Open</div>
          </div>
        </div>
      </div>
    `;
    this.contentArea.innerHTML = '';
    this.contentArea.appendChild(div);
    div.querySelectorAll('.toggle-switch').forEach(t => {
      t.addEventListener('click', () => t.classList.toggle('active'));
    });
  }

  _renderBluetooth() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="sysprefs-panel-title">Bluetooth</div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Bluetooth</div>
        </div>
        <div class="toggle-switch active"></div>
      </div>
      <div style="margin-top:16px;">
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">MY DEVICES</div>
        <div class="sysprefs-option">
          <div>
            <div class="sysprefs-option-label">🎧 AirPods Pro</div>
            <div class="sysprefs-option-desc">Connected</div>
          </div>
        </div>
        <div class="sysprefs-option">
          <div>
            <div class="sysprefs-option-label">⌨️ Magic Keyboard</div>
            <div class="sysprefs-option-desc">Connected</div>
          </div>
        </div>
        <div style="font-size:12px;color:var(--text-secondary);margin:16px 0 8px;">NEARBY DEVICES</div>
        <div class="sysprefs-option">
          <div>
            <div class="sysprefs-option-label">🖨️ HP LaserJet</div>
            <div class="sysprefs-option-desc">Not connected</div>
          </div>
        </div>
      </div>
    `;
    this.contentArea.innerHTML = '';
    this.contentArea.appendChild(div);
    div.querySelectorAll('.toggle-switch').forEach(t => {
      t.addEventListener('click', () => t.classList.toggle('active'));
    });
  }

  _renderKeyboard() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="sysprefs-panel-title">Keyboard</div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Key repeat rate</div>
        </div>
        <input type="range" min="1" max="100" value="60" style="width:150px;">
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Delay until repeat</div>
        </div>
        <input type="range" min="1" max="100" value="40" style="width:150px;">
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Slow keys</div>
          <div class="sysprefs-option-desc">Ignore brief or accidental key presses</div>
        </div>
        <div class="toggle-switch"></div>
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Use F1, F2, etc. as standard function keys</div>
        </div>
        <div class="toggle-switch active"></div>
      </div>
    `;
    this.contentArea.innerHTML = '';
    this.contentArea.appendChild(div);
    div.querySelectorAll('.toggle-switch').forEach(t => {
      t.addEventListener('click', () => t.classList.toggle('active'));
    });
  }

  _renderTrackpad() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="sysprefs-panel-title">Trackpad</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">POINT & CLICK</div>
      <div class="sysprefs-option">
        <div><div class="sysprefs-option-label">Tap to click</div></div>
        <div class="toggle-switch active"></div>
      </div>
      <div class="sysprefs-option">
        <div><div class="sysprefs-option-label">Three-finger tap</div><div class="sysprefs-option-desc">Secondary click</div></div>
        <div class="toggle-switch"></div>
      </div>
      <div style="font-size:12px;color:var(--text-secondary);margin:12px 0 8px;">SCROLL & ZOOM</div>
      <div class="sysprefs-option">
        <div><div class="sysprefs-option-label">Natural scrolling</div></div>
        <div class="toggle-switch active"></div>
      </div>
      <div class="sysprefs-option">
        <div><div class="sysprefs-option-label">Smart zoom</div></div>
        <div class="toggle-switch active"></div>
      </div>
    `;
    this.contentArea.innerHTML = '';
    this.contentArea.appendChild(div);
    div.querySelectorAll('.toggle-switch').forEach(t => {
      t.addEventListener('click', () => t.classList.toggle('active'));
    });
  }

  _renderNotifications() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="sysprefs-panel-title">Notifications</div>
      <div class="sysprefs-option">
        <div><div class="sysprefs-option-label">Allow notifications</div></div>
        <div class="toggle-switch active"></div>
      </div>
      <div class="sysprefs-option">
        <div><div class="sysprefs-option-label">Show previews</div><div class="sysprefs-option-desc">Always</div></div>
      </div>
      <div class="sysprefs-option">
        <div><div class="sysprefs-option-label">Show notification banners</div></div>
        <div class="toggle-switch active"></div>
      </div>
      <div class="sysprefs-option">
        <div><div class="sysprefs-option-label">Play sound for notifications</div></div>
        <div class="toggle-switch active"></div>
      </div>
    `;
    this.contentArea.innerHTML = '';
    this.contentArea.appendChild(div);
    div.querySelectorAll('.toggle-switch').forEach(t => {
      t.addEventListener('click', () => t.classList.toggle('active'));
    });
  }

  _renderPrivacy() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="sysprefs-panel-title">Privacy & Security</div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Location Services</div>
          <div class="sysprefs-option-desc">Allow apps to access your location</div>
        </div>
        <div class="toggle-switch active"></div>
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Analytics & Improvements</div>
          <div class="sysprefs-option-desc">Share macOS analytics with Apple</div>
        </div>
        <div class="toggle-switch"></div>
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Allow apps downloaded from</div>
          <div class="sysprefs-option-desc">App Store and identified developers</div>
        </div>
      </div>
      <div class="sysprefs-option">
        <div>
          <div class="sysprefs-option-label">Firewall</div>
          <div class="sysprefs-option-desc">Block incoming connections</div>
        </div>
        <div class="toggle-switch active"></div>
      </div>
    `;
    this.contentArea.innerHTML = '';
    this.contentArea.appendChild(div);
    div.querySelectorAll('.toggle-switch').forEach(t => {
      t.addEventListener('click', () => t.classList.toggle('active'));
    });
  }
}