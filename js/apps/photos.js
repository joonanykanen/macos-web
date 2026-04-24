/* ============================================
   Photos App
   ============================================ */
class PhotosApp {
  constructor() {
    this.photos = [];
    this._generatePhotos();
  }

  _generatePhotos() {
    const gradients = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
      'linear-gradient(135deg, #a18cd1, #fbc2eb)',
      'linear-gradient(135deg, #ffecd2, #fcb69f)',
      'linear-gradient(135deg, #ff9a9e, #fecfef)',
      'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
      'linear-gradient(135deg, #fdcbf1, #e6dee9)',
      'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
      'linear-gradient(135deg, #d4fc79, #96e6a1)',
      'linear-gradient(135deg, #84fab0, #8fd3f4)',
      'linear-gradient(135deg, #cfd9df, #e2ebf0)',
      'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
      'linear-gradient(135deg, #667eea, #f093fb)',
    ];

    const emojis = ['🏔️', '🌊', '🌅', '🌄', '🏖️', '🌺', '🌸', '🍁', '🌈', '🦋', '🐝', '🌻', '🎆', '🏙️', '🌃', '🎑'];
    const names = ['Mountain', 'Ocean', 'Sunset', 'Sunrise', 'Beach', 'Garden', 'Cherry Blossom', 'Autumn', 'Rainbow', 'Butterfly', 'Bee', 'Sunflower', 'Fireworks', 'City', 'Night Sky', 'Moon View'];

    for (let i = 0; i < 16; i++) {
      this.photos.push({
        id: i,
        gradient: gradients[i],
        emoji: emojis[i],
        name: names[i],
        date: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString()
      });
    }
  }

  open() {
    const content = `
      <div class="photos-container">
        <div class="photos-sidebar">
          <div class="photos-sidebar-section">
            <div class="finder-sidebar-header">Library</div>
            <div class="photos-sidebar-item active" data-view="all">
              <span class="finder-sidebar-icon">🖼️</span> All Photos
            </div>
            <div class="photos-sidebar-item" data-view="favorites">
              <span class="finder-sidebar-icon">⭐</span> Favorites
            </div>
            <div class="photos-sidebar-item" data-view="recents">
              <span class="finder-sidebar-icon">🕐</span> Recent
            </div>
          </div>
          <div class="photos-sidebar-section">
            <div class="finder-sidebar-header">Albums</div>
            <div class="photos-sidebar-item" data-view="vacation">
              <span class="finder-sidebar-icon">✈️</span> Vacation
            </div>
            <div class="photos-sidebar-item" data-view="nature">
              <span class="finder-sidebar-icon">🌿</span> Nature
            </div>
          </div>
        </div>
        <div class="photos-main">
          <div class="photos-toolbar">
            <span style="font-weight:600;font-size:14px;">All Photos</span>
            <span style="color:var(--text-secondary);font-size:12px;margin-left:8px;">16 Photos</span>
          </div>
          <div class="photos-grid" id="photos-grid"></div>
        </div>
      </div>
    `;

    windowManager.createWindow({
      id: 'photos-window',
      title: 'Photos',
      icon: '🌈',
      content,
      width: 800,
      height: 520,
      appKey: 'photos',
      onReady: (contentEl) => this._init(contentEl)
    });
  }

  _init(contentEl) {
    const grid = contentEl.querySelector('#photos-grid');

    grid.innerHTML = this.photos.map(photo => `
      <div class="photo-item" style="background:${photo.gradient};" title="${photo.name}">
        ${photo.emoji}
      </div>
    `).join('');

    contentEl.querySelectorAll('.photos-sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        contentEl.querySelectorAll('.photos-sidebar-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }
}