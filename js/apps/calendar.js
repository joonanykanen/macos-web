/* ============================================
   Calendar App
   ============================================ */
class CalendarApp {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.events = {};
    this._generateSampleEvents();
  }

  _generateSampleEvents() {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();

    this.events = {
      [`${y}-${m}-${d}`]: [
        { time: '9:00 AM', title: 'Team Standup', color: '#007aff' },
        { time: '12:00 PM', title: 'Lunch with Sarah', color: '#34c759' },
        { time: '3:00 PM', title: 'Project Review', color: '#ff9500' },
      ],
      [`${y}-${m}-${d + 1}`]: [
        { time: '10:00 AM', title: 'Design Review', color: '#af52de' },
        { time: '2:00 PM', title: 'Client Meeting', color: '#ff3b30' },
      ],
      [`${y}-${m}-${d + 3}`]: [
        { time: 'All Day', title: 'Company Event', color: '#5ac8fa' },
      ]
    };
  }

  open() {
    const content = `
      <div class="calendar-container">
        <div class="calendar-header">
          <button class="calendar-nav-btn" id="cal-prev">◀</button>
          <span class="calendar-month-year" id="cal-month-year"></span>
          <button class="calendar-nav-btn" id="cal-next">▶</button>
          <button class="calendar-today-btn" id="cal-today">Today</button>
        </div>
        <div class="calendar-grid" id="cal-grid"></div>
      </div>
    `;

    windowManager.createWindow({
      id: 'calendar-window',
      title: 'Calendar',
      icon: '📅',
      content,
      width: 600,
      height: 480,
      appKey: 'calendar',
      onReady: (contentEl) => this._init(contentEl)
    });
  }

  _init(contentEl) {
    this.contentEl = contentEl;
    this.monthYearEl = contentEl.querySelector('#cal-month-year');
    this.gridEl = contentEl.querySelector('#cal-grid');

    contentEl.querySelector('#cal-prev').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this._render();
    });

    contentEl.querySelector('#cal-next').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this._render();
    });

    contentEl.querySelector('#cal-today').addEventListener('click', () => {
      this.currentDate = new Date();
      this._render();
    });

    this._render();
  }

  _render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const today = new Date();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    this.monthYearEl.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let html = dayNames.map(d => `<div class="calendar-day-header">${d}</div>`).join('');

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      html += `<div class="calendar-day other-month">${daysInPrevMonth - i}</div>`;
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      const dateKey = `${year}-${month}-${d}`;
      const dayEvents = this.events[dateKey] || [];
      const isSelected = this.selectedDate &&
        this.selectedDate.getDate() === d &&
        this.selectedDate.getMonth() === month &&
        this.selectedDate.getFullYear() === year;

      html += `<div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-date="${year}-${month}-${d}">
        ${d}
        ${dayEvents.map(e => `<div style="font-size:8px;background:${e.color};border-radius:2px;padding:1px 3px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60px;">${e.title}</div>`).join('')}
      </div>`;
    }

    // Next month days
    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
      html += `<div class="calendar-day other-month">${i}</div>`;
    }

    this.gridEl.innerHTML = html;

    // Click handlers
    this.gridEl.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
      day.addEventListener('click', () => {
        const [y, m, d] = day.dataset.date.split('-').map(Number);
        this.selectedDate = new Date(y, m, d);
        this._render();

        // Show events
        const dateKey = `${y}-${m}-${d}`;
        const events = this.events[dateKey] || [];
        const win = windowManager.getWindowById('calendar-window');
        if (win && events.length > 0) {
          win.title = `${d} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m]} — ${events.length} event${events.length > 1 ? 's' : ''}`;
        }
      });
    });
  }
}