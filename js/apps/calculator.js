/* ============================================
   Calculator App
   ============================================ */
class CalculatorApp {
  constructor() {
    this.currentValue = '0';
    this.previousValue = '';
    this.operator = null;
    this.shouldResetScreen = false;
    this.expression = '';
  }

  open() {
    const content = `
      <div class="calculator-container">
        <div class="calc-display">
          <div class="calc-expression" id="calc-expression"></div>
          <div class="calc-result" id="calc-result">0</div>
        </div>
        <div class="calc-buttons">
          <button class="calc-btn calc-btn-function" data-action="clear">AC</button>
          <button class="calc-btn calc-btn-function" data-action="negate">+/−</button>
          <button class="calc-btn calc-btn-function" data-action="percent">%</button>
          <button class="calc-btn calc-btn-operator" data-action="operator" data-value="÷">÷</button>

          <button class="calc-btn calc-btn-number" data-action="number" data-value="7">7</button>
          <button class="calc-btn calc-btn-number" data-action="number" data-value="8">8</button>
          <button class="calc-btn calc-btn-number" data-action="number" data-value="9">9</button>
          <button class="calc-btn calc-btn-operator" data-action="operator" data-value="×">×</button>

          <button class="calc-btn calc-btn-number" data-action="number" data-value="4">4</button>
          <button class="calc-btn calc-btn-number" data-action="number" data-value="5">5</button>
          <button class="calc-btn calc-btn-number" data-action="number" data-value="6">6</button>
          <button class="calc-btn calc-btn-operator" data-action="operator" data-value="−">−</button>

          <button class="calc-btn calc-btn-number" data-action="number" data-value="1">1</button>
          <button class="calc-btn calc-btn-number" data-action="number" data-value="2">2</button>
          <button class="calc-btn calc-btn-number" data-action="number" data-value="3">3</button>
          <button class="calc-btn calc-btn-operator" data-action="operator" data-value="+">+</button>

          <button class="calc-btn calc-btn-number calc-btn-zero" data-action="number" data-value="0">0</button>
          <button class="calc-btn calc-btn-number" data-action="decimal">.</button>
          <button class="calc-btn calc-btn-operator" data-action="equals">=</button>
        </div>
      </div>
    `;

    windowManager.createWindow({
      id: 'calculator-window',
      title: 'Calculator',
      icon: '🔢',
      content,
      width: 280,
      height: 420,
      minWidth: 280,
      minHeight: 420,
      appKey: 'calculator',
      onReady: (contentEl) => this._init(contentEl)
    });
  }

  _init(contentEl) {
    this.resultEl = contentEl.querySelector('#calc-result');
    this.expressionEl = contentEl.querySelector('#calc-expression');

    contentEl.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', () => this._handleButton(btn));
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      const win = windowManager.getWindowById('calculator-window');
      if (!win || win.minimized) return;

      const keyMap = {
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
        '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
        '.': '.', '+': '+', '-': '−', '*': '×', '/': '÷',
        'Enter': '=', '=': '=', 'Escape': 'clear', 'Backspace': 'backspace',
        '%': 'percent'
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        const action = keyMap[e.key];
        if (action === 'clear') this._clear();
        else if (action === 'backspace') this._backspace();
        else if ('0123456789'.includes(action)) this._inputNumber(action);
        else if (action === '.') this._inputDecimal();
        else if ('+−×÷'.includes(action)) this._inputOperator(action);
        else if (action === '=') this._calculate();
        else if (action === 'percent') this._percent();
      }
    });
  }

  _handleButton(btn) {
    const action = btn.dataset.action;
    const value = btn.dataset.value;

    switch (action) {
      case 'number': this._inputNumber(value); break;
      case 'decimal': this._inputDecimal(); break;
      case 'operator': this._inputOperator(value); break;
      case 'equals': this._calculate(); break;
      case 'clear': this._clear(); break;
      case 'negate': this._negate(); break;
      case 'percent': this._percent(); break;
    }
  }

  _updateDisplay() {
    let display = this.currentValue;
    if (display.length > 12) {
      const num = parseFloat(display);
      if (!isNaN(num)) display = num.toExponential(6);
    }
    this.resultEl.textContent = display;
    this.expressionEl.textContent = this.expression;

    // Adjust font size for long numbers
    this.resultEl.style.fontSize = display.length > 9 ? `${Math.max(24, 42 - (display.length - 9) * 2)}px` : '42px';
  }

  _inputNumber(num) {
    if (this.shouldResetScreen) {
      this.currentValue = '';
      this.shouldResetScreen = false;
    }
    if (this.currentValue === '0' && num !== '0') {
      this.currentValue = num;
    } else if (this.currentValue === '0' && num === '0') {
      // do nothing
    } else {
      if (this.currentValue.replace(/[^0-9]/g, '').length >= 15) return;
      this.currentValue += num;
    }
    this._updateDisplay();
  }

  _inputDecimal() {
    if (this.shouldResetScreen) {
      this.currentValue = '0';
      this.shouldResetScreen = false;
    }
    if (!this.currentValue.includes('.')) {
      this.currentValue += '.';
    }
    this._updateDisplay();
  }

  _inputOperator(op) {
    if (this.operator && !this.shouldResetScreen) {
      this._calculate(true);
    }
    this.previousValue = this.currentValue;
    this.operator = op;
    this.expression = `${this.previousValue} ${op}`;
    this.shouldResetScreen = true;
    this._updateDisplay();

    // Highlight active operator
    const contentEl = this.resultEl.closest('.calculator-container');
    contentEl.querySelectorAll('.calc-btn-operator').forEach(b => b.classList.remove('active-op'));
    contentEl.querySelector(`.calc-btn-operator[data-value="${op}"]`)?.classList.add('active-op');
  }

  _calculate(chaining = false) {
    if (!this.operator || !this.previousValue) return;

    const prev = parseFloat(this.previousValue);
    const curr = parseFloat(this.currentValue);
    let result;

    switch (this.operator) {
      case '+': result = prev + curr; break;
      case '−': result = prev - curr; break;
      case '×': result = prev * curr; break;
      case '÷': result = curr === 0 ? 'Error' : prev / curr; break;
    }

    if (!chaining) {
      this.expression = `${this.previousValue} ${this.operator} ${this.currentValue} =`;
    }

    if (result === 'Error') {
      this.currentValue = 'Error';
    } else {
      // Handle floating point precision
      result = Math.round(result * 1e10) / 1e10;
      this.currentValue = String(result);
    }

    if (!chaining) {
      this.operator = null;
      this.previousValue = '';
    } else {
      this.previousValue = this.currentValue;
    }

    this.shouldResetScreen = true;
    this._updateDisplay();

    // Remove active operator highlight
    if (!chaining) {
      const contentEl = this.resultEl.closest('.calculator-container');
      contentEl.querySelectorAll('.calc-btn-operator').forEach(b => b.classList.remove('active-op'));
    }
  }

  _clear() {
    this.currentValue = '0';
    this.previousValue = '';
    this.operator = null;
    this.shouldResetScreen = false;
    this.expression = '';
    this._updateDisplay();

    const contentEl = this.resultEl.closest('.calculator-container');
    contentEl.querySelectorAll('.calc-btn-operator').forEach(b => b.classList.remove('active-op'));
  }

  _backspace() {
    if (this.shouldResetScreen) return;
    this.currentValue = this.currentValue.slice(0, -1) || '0';
    this._updateDisplay();
  }

  _negate() {
    if (this.currentValue === '0' || this.currentValue === 'Error') return;
    this.currentValue = this.currentValue.startsWith('-')
      ? this.currentValue.slice(1)
      : '-' + this.currentValue;
    this._updateDisplay();
  }

  _percent() {
    const val = parseFloat(this.currentValue);
    if (isNaN(val)) return;
    this.currentValue = String(val / 100);
    this._updateDisplay();
  }
}