/* ============================================
   Music App
   ============================================ */
class MusicApp {
  constructor() {
    this.isPlaying = false;
    this.currentTrack = 0;
    this.currentTime = 0;
    this.playInterval = null;

    this.tracks = [
      { title: 'Midnight Dreams', artist: 'Synthwave Collective', album: 'Neon Nights', duration: '3:42', durationSec: 222, emoji: '🌙' },
      { title: 'Electric Sunrise', artist: 'Digital Horizons', album: 'Neon Nights', duration: '4:15', durationSec: 255, emoji: '🌅' },
      { title: 'Ocean Waves', artist: 'Ambient Flow', album: 'Neon Nights', duration: '3:58', durationSec: 238, emoji: '🌊' },
      { title: 'City Lights', artist: 'Urban Echo', album: 'Neon Nights', duration: '3:21', durationSec: 201, emoji: '🏙️' },
      { title: 'Starfall', artist: 'Cosmic Drift', album: 'Neon Nights', duration: '4:33', durationSec: 273, emoji: '⭐' },
      { title: 'Neon Pulse', artist: 'Retro Future', album: 'Neon Nights', duration: '3:47', durationSec: 227, emoji: '💜' },
      { title: 'Digital Rain', artist: 'Cyber Ambient', album: 'Neon Nights', duration: '5:02', durationSec: 302, emoji: '🌧️' },
      { title: 'Crystal Caves', artist: 'Ethereal Sound', album: 'Neon Nights', duration: '3:15', durationSec: 195, emoji: '💎' },
      { title: 'Aurora Borealis', artist: 'Northern Lights', album: 'Neon Nights', duration: '4:48', durationSec: 288, emoji: '🌌' },
      { title: 'Velvet Sky', artist: 'Dream State', album: 'Neon Nights', duration: '3:36', durationSec: 216, emoji: '🎵' },
    ];

    this.albumArt = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  open() {
    const content = `
      <div class="music-container">
        <div class="music-sidebar">
          <div class="music-sidebar-item active">
            <span>🏠</span> Library
          </div>
          <div class="music-sidebar-item">
            <span>📻</span> Radio
          </div>
          <div style="height:1px;background:rgba(255,255,255,0.08);margin:8px 16px;"></div>
          <div class="finder-sidebar-header" style="padding:4px 16px;">PLAYLISTS</div>
          <div class="music-sidebar-item">
            <span>❤️</span> Favorites
          </div>
          <div class="music-sidebar-item">
            <span>🕐</span> Recently Added
          </div>
          <div class="music-sidebar-item">
            <span>🎧</span> Chill Mix
          </div>
          <div class="music-sidebar-item">
            <span>🔥</span> Workout
          </div>
        </div>
        <div class="music-main">
          <div class="music-content">
            <div class="music-header">
              <div class="music-album-art" style="background:${this.albumArt};">💿</div>
              <div class="music-album-info">
                <div style="font-size:12px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;">Album</div>
                <h2>Neon Nights</h2>
                <p>Various Artists · 2024 · 10 songs</p>
              </div>
            </div>
            <ul class="music-track-list" id="music-track-list">
              ${this.tracks.map((track, i) => `
                <li class="music-track ${i === 0 ? 'playing' : ''}" data-index="${i}">
                  <span class="music-track-num">${i === 0 ? '♫' : i + 1}</span>
                  <div class="music-track-info">
                    <div class="music-track-title">${track.title}</div>
                    <div class="music-track-artist">${track.artist}</div>
                  </div>
                  <span class="music-track-duration">${track.duration}</span>
                </li>
              `).join('')}
            </ul>
          </div>
          <div class="music-player-bar">
            <div class="music-player-info">
              <div class="music-player-art" style="background:${this.albumArt};">💿</div>
              <div class="music-player-text">
                <div class="music-player-title" id="music-player-title">${this.tracks[0].title}</div>
                <div class="music-player-artist" id="music-player-artist">${this.tracks[0].artist}</div>
              </div>
            </div>
            <div class="music-player-controls">
              <button class="music-player-btn" id="music-prev" title="Previous">⏮</button>
              <button class="music-player-btn play-btn" id="music-play" title="Play">▶</button>
              <button class="music-player-btn" id="music-next" title="Next">⏭</button>
            </div>
            <div class="music-progress">
              <span class="music-progress-time" id="music-current-time">0:00</span>
              <div class="music-progress-bar" id="music-progress-bar">
                <div class="music-progress-fill" id="music-progress-fill"></div>
              </div>
              <span class="music-progress-time" id="music-total-time">${this.tracks[0].duration}</span>
            </div>
            <div class="music-volume">
              <span>🔊</span>
              <input type="range" class="music-volume-slider" min="0" max="100" value="70">
            </div>
          </div>
        </div>
      </div>
    `;

    windowManager.createWindow({
      id: 'music-window',
      title: 'Music',
      icon: '🎵',
      content,
      width: 850,
      height: 550,
      appKey: 'music',
      onReady: (contentEl) => this._init(contentEl)
    });
  }

  _init(contentEl) {
    this.contentEl = contentEl;
    this.playBtn = contentEl.querySelector('#music-play');
    this.prevBtn = contentEl.querySelector('#music-prev');
    this.nextBtn = contentEl.querySelector('#music-next');
    this.progressFill = contentEl.querySelector('#music-progress-fill');
    this.currentTimeEl = contentEl.querySelector('#music-current-time');
    this.totalTimeEl = contentEl.querySelector('#music-total-time');
    this.titleEl = contentEl.querySelector('#music-player-title');
    this.artistEl = contentEl.querySelector('#music-player-artist');
    this.progressBar = contentEl.querySelector('#music-progress-bar');

    // Play/Pause
    this.playBtn.addEventListener('click', () => this._togglePlay());

    // Prev/Next
    this.prevBtn.addEventListener('click', () => this._prevTrack());
    this.nextBtn.addEventListener('click', () => this._nextTrack());

    // Progress bar click
    this.progressBar.addEventListener('click', (e) => {
      const rect = this.progressBar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      this.currentTime = pct * this.tracks[this.currentTrack].durationSec;
      this._updateProgress();
    });

    // Track selection
    contentEl.querySelectorAll('.music-track').forEach(track => {
      track.addEventListener('click', () => {
        this.currentTrack = parseInt(track.dataset.index);
        this.currentTime = 0;
        this._selectTrack();
        if (!this.isPlaying) this._togglePlay();
        else this._updateProgress();
      });
    });

    this._selectTrack();
  }

  _togglePlay() {
    this.isPlaying = !this.isPlaying;
    this.playBtn.textContent = this.isPlaying ? '⏸' : '▶';

    if (this.isPlaying) {
      this.playInterval = setInterval(() => {
        this.currentTime++;
        if (this.currentTime >= this.tracks[this.currentTrack].durationSec) {
          this._nextTrack();
        }
        this._updateProgress();
      }, 1000);
    } else {
      clearInterval(this.playInterval);
    }
  }

  _prevTrack() {
    this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
    this.currentTime = 0;
    this._selectTrack();
    this._updateProgress();
  }

  _nextTrack() {
    this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
    this.currentTime = 0;
    this._selectTrack();
    this._updateProgress();
  }

  _selectTrack() {
    const track = this.tracks[this.currentTrack];
    this.titleEl.textContent = track.title;
    this.artistEl.textContent = track.artist;
    this.totalTimeEl.textContent = track.duration;

    // Update track list
    this.contentEl.querySelectorAll('.music-track').forEach((el, i) => {
      el.classList.toggle('playing', i === this.currentTrack);
      el.querySelector('.music-track-num').textContent = i === this.currentTrack ? '♫' : i + 1;
    });
  }

  _updateProgress() {
    const track = this.tracks[this.currentTrack];
    const pct = (this.currentTime / track.durationSec) * 100;
    this.progressFill.style.width = `${pct}%`;

    const mins = Math.floor(this.currentTime / 60);
    const secs = this.currentTime % 60;
    this.currentTimeEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}