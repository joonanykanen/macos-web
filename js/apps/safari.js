/* ============================================
   Safari App
   ============================================ */
class SafariApp {
  constructor() {
    this.currentUrl = '';
    this.history = [];
    this.historyIndex = -1;
  }

  open() {
    const content = `
      <div class="safari-container">
        <div class="safari-toolbar">
          <button class="safari-nav-btn" id="safari-back" title="Go Back">◀</button>
          <button class="safari-nav-btn" id="safari-forward" title="Go Forward">▶</button>
          <button class="safari-nav-btn" id="safari-reload" title="Reload">↻</button>
          <div class="safari-url-bar">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="#999"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <input type="text" class="safari-url-input" id="safari-url" placeholder="Search or enter website name">
          </div>
          <button class="safari-nav-btn" id="safari-share" title="Share">⤴</button>
        </div>
        <div class="safari-content" id="safari-content">
          <div class="safari-start-page" id="safari-start-page">
            <div class="safari-start-title">Favorites</div>
            <div class="safari-favorites">
              <div class="safari-fav-item" data-url="https://www.wikipedia.org">
                <div class="safari-fav-icon" style="background: #333;">📚</div>
                <span class="safari-fav-name">Wikipedia</span>
              </div>
              <div class="safari-fav-item" data-url="https://github.com">
                <div class="safari-fav-icon" style="background: #24292e;">🐙</div>
                <span class="safari-fav-name">GitHub</span>
              </div>
              <div class="safari-fav-item" data-url="https://www.youtube.com">
                <div class="safari-fav-icon" style="background: #ff0000;">▶️</div>
                <span class="safari-fav-name">YouTube</span>
              </div>
              <div class="safari-fav-item" data-url="https://news.ycombinator.com">
                <div class="safari-fav-icon" style="background: #ff6600;">🔶</div>
                <span class="safari-fav-name">Hacker News</span>
              </div>
              <div class="safari-fav-item" data-url="https://www.reddit.com">
                <div class="safari-fav-icon" style="background: #ff4500;">🤖</div>
                <span class="safari-fav-name">Reddit</span>
              </div>
              <div class="safari-fav-item" data-url="https://duckduckgo.com">
                <div class="safari-fav-icon" style="background: #de5833;">🦆</div>
                <span class="safari-fav-name">DuckDuckGo</span>
              </div>
              <div class="safari-fav-item" data-url="https://stackoverflow.com">
                <div class="safari-fav-icon" style="background: #f48024;">💡</div>
                <span class="safari-fav-name">Stack Overflow</span>
              </div>
              <div class="safari-fav-item" data-url="https://developer.mozilla.org">
                <div class="safari-fav-icon" style="background: #1a1a2e;">🦊</div>
                <span class="safari-fav-name">MDN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    windowManager.createWindow({
      id: 'safari-window',
      title: 'Safari',
      icon: '🧭',
      content,
      width: 950,
      height: 600,
      appKey: 'safari',
      onReady: (contentEl) => this._init(contentEl)
    });
  }

  _init(contentEl) {
    this.contentEl = contentEl;
    this.urlInput = contentEl.querySelector('#safari-url');
    this.contentArea = contentEl.querySelector('#safari-content');
    this.startPage = contentEl.querySelector('#safari-start-page');

    // URL bar
    this.urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this._navigate(this.urlInput.value);
      }
    });

    // Navigation buttons
    contentEl.querySelector('#safari-back').addEventListener('click', () => this._goBack());
    contentEl.querySelector('#safari-forward').addEventListener('click', () => this._goForward());
    contentEl.querySelector('#safari-reload').addEventListener('click', () => this._reload());

    // Favorites
    this.contentEl.querySelectorAll('.safari-fav-item').forEach(item => {
      item.addEventListener('click', () => {
        this._navigate(item.dataset.url);
      });
    });
  }

  _navigate(input) {
    let url = input.trim();

    // If it looks like a URL
    if (url.match(/^https?:\/\//)) {
      // already a URL
    } else if (url.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/)) {
      url = 'https://' + url;
    } else {
      // Treat as search
      url = `https://www.google.com/search?igu=1&q=${encodeURIComponent(url)}`;
    }

    this.currentUrl = url;
    this.urlInput.value = url;

    // Add to history
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(url);
    this.historyIndex = this.history.length - 1;

    // Show iframe
    this.startPage?.classList.add('hidden');
    let iframe = this.contentArea.querySelector('iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
      this.contentArea.appendChild(iframe);
    }
    iframe.src = url;

    // Update title
    const win = windowManager.getWindowById('safari-window');
    if (win) {
      try {
        const hostname = new URL(url).hostname;
        win.title = hostname + ' — Safari';
      } catch {
        win.title = 'Safari';
      }
    }
  }

  _goBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.currentUrl = this.history[this.historyIndex];
      this.urlInput.value = this.currentUrl;
      const iframe = this.contentArea.querySelector('iframe');
      if (iframe) iframe.src = this.currentUrl;
    }
  }

  _goForward() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.currentUrl = this.history[this.historyIndex];
      this.urlInput.value = this.currentUrl;
      const iframe = this.contentArea.querySelector('iframe');
      if (iframe) iframe.src = this.currentUrl;
    }
  }

  _reload() {
    const iframe = this.contentArea.querySelector('iframe');
    if (iframe) iframe.src = iframe.src;
  }
}