/* ============================================
   Weather App
   ============================================ */
class WeatherApp {
  constructor() {
    this.cities = {
      'San Francisco': {
        temp: 18, condition: 'Partly Cloudy', icon: '⛅',
        high: 20, low: 14, humidity: 72, wind: '12 km/h', uv: 5,
        forecast: [
          { day: 'Mon', icon: '☀️', high: 22, low: 15 },
          { day: 'Tue', icon: '⛅', high: 20, low: 14 },
          { day: 'Wed', icon: '🌧️', high: 17, low: 12 },
          { day: 'Thu', icon: '⛅', high: 19, low: 13 },
          { day: 'Fri', icon: '☀️', high: 23, low: 16 },
          { day: 'Sat', icon: '☀️', high: 24, low: 17 },
          { day: 'Sun', icon: '⛅', high: 21, low: 15 },
        ]
      },
      'New York': {
        temp: 24, condition: 'Sunny', icon: '☀️',
        high: 27, low: 19, humidity: 55, wind: '8 km/h', uv: 7,
        forecast: [
          { day: 'Mon', icon: '☀️', high: 28, low: 20 },
          { day: 'Tue', icon: '☀️', high: 29, low: 21 },
          { day: 'Wed', icon: '⛅', high: 25, low: 18 },
          { day: 'Thu', icon: '🌧️', high: 22, low: 16 },
          { day: 'Fri', icon: '⛅', high: 24, low: 17 },
          { day: 'Sat', icon: '☀️', high: 27, low: 19 },
          { day: 'Sun', icon: '☀️', high: 28, low: 20 },
        ]
      },
      'London': {
        temp: 15, condition: 'Rainy', icon: '🌧️',
        high: 17, low: 11, humidity: 85, wind: '20 km/h', uv: 2,
        forecast: [
          { day: 'Mon', icon: '🌧️', high: 16, low: 12 },
          { day: 'Tue', icon: '🌧️', high: 15, low: 11 },
          { day: 'Wed', icon: '⛅', high: 17, low: 12 },
          { day: 'Thu', icon: '⛅', high: 18, low: 13 },
          { day: 'Fri', icon: '🌧️', high: 14, low: 10 },
          { day: 'Sat', icon: '⛅', high: 16, low: 11 },
          { day: 'Sun', icon: '☀️', high: 19, low: 13 },
        ]
      },
      'Tokyo': {
        temp: 28, condition: 'Clear', icon: '☀️',
        high: 31, low: 24, humidity: 65, wind: '10 km/h', uv: 8,
        forecast: [
          { day: 'Mon', icon: '☀️', high: 32, low: 25 },
          { day: 'Tue', icon: '⛅', high: 30, low: 24 },
          { day: 'Wed', icon: '🌧️', high: 27, low: 22 },
          { day: 'Thu', icon: '⛅', high: 29, low: 23 },
          { day: 'Fri', icon: '☀️', high: 31, low: 25 },
          { day: 'Sat', icon: '☀️', high: 33, low: 26 },
          { day: 'Sun', icon: '⛅', high: 30, low: 24 },
        ]
      }
    };
    this.currentCity = 'San Francisco';
  }

  open() {
    const content = `
      <div class="weather-container" id="weather-container">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div style="display:flex;gap:8px;">
            <select id="weather-city-select" style="background:rgba(0,0,0,0.2);border:0.5px solid rgba(255,255,255,0.2);border-radius:6px;padding:4px 8px;color:white;font-size:12px;outline:none;">
              ${Object.keys(this.cities).map(c => `<option value="${c}" ${c === this.currentCity ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <span style="font-size:12px;color:rgba(255,255,255,0.6);">Updated just now</span>
        </div>
        <div class="weather-main-display" id="weather-main"></div>
        <div class="weather-forecast" id="weather-forecast"></div>
      </div>
    `;

    windowManager.createWindow({
      id: 'weather-window',
      title: 'Weather',
      icon: '🌤️',
      content,
      width: 500,
      height: 480,
      appKey: 'weather',
      onReady: (contentEl) => this._init(contentEl)
    });
  }

  _init(contentEl) {
    this.contentEl = contentEl;
    this.mainEl = contentEl.querySelector('#weather-main');
    this.forecastEl = contentEl.querySelector('#weather-forecast');
    this.selectEl = contentEl.querySelector('#weather-city-select');
    this.containerEl = contentEl.querySelector('#weather-container');

    this.selectEl.addEventListener('change', () => {
      this.currentCity = this.selectEl.value;
      this._render();
    });

    this._render();
  }

  _render() {
    const city = this.cities[this.currentCity];

    // Update gradient based on condition
    const gradients = {
      'Sunny': 'linear-gradient(180deg, #4a90d9 0%, #87ceeb 40%, #f0e68c 100%)',
      'Clear': 'linear-gradient(180deg, #1a3a5c 0%, #2d5a87 40%, #4a8ab5 100%)',
      'Partly Cloudy': 'linear-gradient(180deg, #4a6fa5 0%, #6b8db5 40%, #8fabc9 100%)',
      'Rainy': 'linear-gradient(180deg, #2c3e50 0%, #4a6274 40%, #5d7a8c 100%)',
    };
    this.containerEl.style.background = gradients[city.condition] || gradients['Partly Cloudy'];

    this.mainEl.innerHTML = `
      <div class="weather-city">${this.currentCity}</div>
      <div class="weather-icon">${city.icon}</div>
      <div class="weather-current-temp">${city.temp}°</div>
      <div class="weather-condition">${city.condition}</div>
      <div class="weather-details">
        <span>H:${city.high}° L:${city.low}°</span>
        <span>💧 ${city.humidity}%</span>
        <span>💨 ${city.wind}</span>
        <span>☀️ UV ${city.uv}</span>
      </div>
    `;

    this.forecastEl.innerHTML = city.forecast.map(day => `
      <div class="weather-forecast-day">
        <div class="day-name">${day.day}</div>
        <div class="day-icon">${day.icon}</div>
        <div class="day-temps">
          <span class="temp-high">${day.high}°</span>
          <span class="temp-low">${day.low}°</span>
        </div>
      </div>
    `).join('');
  }
}