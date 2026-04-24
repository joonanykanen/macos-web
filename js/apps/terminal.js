/* ============================================
   Terminal App
   ============================================ */
class TerminalApp {
  constructor() {
    this.currentDir = '/';
    this.history = [];
    this.historyIndex = -1;
    this.env = {
      HOME: '/',
      USER: 'User',
      SHELL: '/bin/zsh',
      PATH: '/usr/bin:/bin:/usr/sbin:/sbin',
      TERM: 'xterm-256color',
      LANG: 'en_US.UTF-8',
      PWD: '/'
    };
    this.fs = {};
    this._initFs();
  }

  _initFs() {
    // Create a virtual filesystem
    const createNode = (type, content = '') => ({ type, content, modified: new Date() });
    const folder = () => createNode('folder');

    this.fs = {
      '/': {
        ...folder(),
        children: {
          'Desktop': {
            ...folder(),
            children: {
              'hello.txt': createNode('file', 'Hello from macOS Web!'),
              'notes.md': createNode('file', '# My Notes\n\n- Learn JavaScript\n- Build cool projects\n- Have fun!'),
            }
          },
          'Documents': {
            ...folder(),
            children: {
              'project': {
                ...folder(),
                children: {
                  'index.html': createNode('file', '<!DOCTYPE html>\n<html>\n<head><title>My Project</title></head>\n<body>Hello World</body>\n</html>'),
                  'style.css': createNode('file', 'body { margin: 0; font-family: sans-serif; }'),
                  'app.js': createNode('file', 'console.log("Hello World");'),
                }
              },
              'readme.txt': createNode('file', 'Welcome to macOS Web Terminal!'),
            }
          },
          'Downloads': folder(),
          'Music': folder(),
          'Pictures': folder(),
          '.zshrc': createNode('file', '# ~/.zshrc\nexport PATH="/usr/local/bin:$PATH"\nalias ll="ls -la"\nalias gs="git status"'),
          '.config': {
            ...folder(),
            children: {
              'settings.json': createNode('file', '{\n  "theme": "dark",\n  "font-size": 13\n}'),
            }
          }
        }
      }
    };
  }

  _resolvePath(path) {
    if (!path) return this.currentDir;

    // Handle ~
    if (path.startsWith('~/')) path = '/' + path.slice(2);
    else if (path === '~') path = '/';

    // Handle relative paths
    if (!path.startsWith('/')) {
      path = this.currentDir === '/' ? `/${path}` : `${this.currentDir}/${path}`;
    }

    // Normalize
    const parts = path.split('/').filter(Boolean);
    const normalized = [];
    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') normalized.pop();
      else normalized.push(part);
    }
    return '/' + normalized.join('/');
  }

  _getNode(path) {
    if (path === '/') return this.fs['/'];
    const parts = path.split('/').filter(Boolean);
    let node = this.fs['/'];
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
      <div class="terminal-container">
        <div class="terminal-tabs">
          <div class="terminal-tab active">
            <span>⬛</span>
            <span>zsh</span>
          </div>
        </div>
        <div class="terminal-output" id="terminal-output"></div>
        <div class="terminal-input-line">
          <span class="terminal-prompt" id="terminal-prompt">User@macOS ~ %</span>
          <input type="text" class="terminal-input" id="terminal-input" autofocus spellcheck="false" autocomplete="off">
        </div>
      </div>
    `;

    windowManager.createWindow({
      id: 'terminal-window',
      title: 'Terminal',
      icon: '⬛',
      content,
      width: 720,
      height: 450,
      appKey: 'terminal',
      onReady: (contentEl) => this._init(contentEl)
    });
  }

  _init(contentEl) {
    this.outputEl = contentEl.querySelector('#terminal-output');
    this.inputEl = contentEl.querySelector('#terminal-input');
    this.promptEl = contentEl.querySelector('#terminal-prompt');

    this._printWelcome();
    this._updatePrompt();

    this.inputEl.addEventListener('keydown', (e) => this._handleInput(e));

    // Focus input when clicking terminal
    contentEl.querySelector('.terminal-container').addEventListener('click', () => {
      this.inputEl.focus();
    });
  }

  _updatePrompt() {
    const dir = this.currentDir === '/' ? '~' : '~/' + this.currentDir.slice(1);
    this.promptEl.textContent = `User@macOS ${dir} %`;
  }

  _print(text, className = 'terminal-line-output') {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = text;
    this.outputEl.appendChild(line);
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }

  _printWelcome() {
    this._print(`
<span style="color: #74c0fc;">  ___                        ___      ___      ___      ___      ___      ___      ___      ___     </span>
<span style="color: #74c0fc;"> /__  |  |  |  |\ |    /.   |  |    |  |    |  |    |  |    |  |    |  |    |  |    |  |    </span>
<span style="color: #74c0fc;">  /\\ |_|  \\|  |  \\|    \\_\\   \\__/    \\__/    \\__/    \\__/    \\__/    \\__/    \\__/    \\__/    </span>

Welcome to <span style="color: #ffd43b;">macOS Web Terminal</span> (v1.0.0)
Type <span style="color: #69db7c;">help</span> for available commands.

`, 'terminal-line-welcome');
  }

  _handleInput(e) {
    if (e.key === 'Enter') {
      const cmd = this.inputEl.value.trim();
      if (cmd) {
        this.history.push(cmd);
        this.historyIndex = this.history.length;
        this._print(`<span class="terminal-prompt">${this.promptEl.textContent}</span> ${this._escapeHtml(cmd)}`);
        this._executeCommand(cmd);
      } else {
        this._print(`<span class="terminal-prompt">${this.promptEl.textContent}</span>`);
      }
      this.inputEl.value = '';
      this._updatePrompt();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.inputEl.value = this.history[this.historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.inputEl.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        this.inputEl.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this._autocomplete();
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      this._print(`<span class="terminal-prompt">${this.promptEl.textContent}</span> ^C`);
      this.inputEl.value = '';
    }
  }

  _escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  _autocomplete() {
    const val = this.inputEl.value;
    const parts = val.split(' ');
    const last = parts[parts.length - 1];

    if (!last) return;

    const dir = last.includes('/') ? this._resolvePath(last.substring(0, last.lastIndexOf('/') + 1)) : this.currentDir;
    const partial = last.includes('/') ? last.substring(last.lastIndexOf('/') + 1) : last;
    const node = this._getNode(dir);

    if (!node || !node.children) return;

    const matches = Object.keys(node.children).filter(name => name.startsWith(partial));
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      const target = this._getNode(dir + '/' + matches[0]);
      if (target && target.type === 'folder') {
        parts[parts.length - 1] += '/';
      }
      this.inputEl.value = parts.join(' ');
    } else if (matches.length > 1) {
      this._print(matches.join('  '), 'terminal-line-info');
    }
  }

  _executeCommand(cmd) {
    const parts = cmd.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const command = parts[0];
    const args = parts.slice(1).map(a => a.replace(/^"|"$/g, ''));

    switch (command) {
      case 'help': this._cmdHelp(); break;
      case 'ls': this._cmdLs(args); break;
      case 'cd': this._cmdCd(args); break;
      case 'pwd': this._cmdPwd(); break;
      case 'echo': this._cmdEcho(args); break;
      case 'cat': this._cmdCat(args); break;
      case 'mkdir': this._cmdMkdir(args); break;
      case 'touch': this._cmdTouch(args); break;
      case 'rm': this._cmdRm(args); break;
      case 'rmdir': this._cmdRmdir(args); break;
      case 'clear': this._cmdClear(); break;
      case 'date': this._cmdDate(); break;
      case 'whoami': this._cmdWhoami(); break;
      case 'uname': this._cmdUname(args); break;
      case 'neofetch': this._cmdNeofetch(); break;
      case 'uptime': this._cmdUptime(); break;
      case 'df': this._cmdDf(); break;
      case 'free': this._cmdFree(); break;
      case 'ps': this._cmdPs(); break;
      case 'top': this._cmdTop(); break;
      case 'curl': this._cmdCurl(args); break;
      case 'wget': this._cmdWget(args); break;
      case 'which': this._cmdWhich(args); break;
      case 'env': this._cmdEnv(); break;
      case 'export': this._cmdExport(args); break;
      case 'history': this._cmdHistory(); break;
      case 'cal': this._cmdCal(); break;
      case 'bc': this._cmdBc(args); break;
      case 'seq': this._cmdSeq(args); break;
      case 'rev': this._cmdRev(args); break;
      case 'wc': this._cmdWc(args); break;
      case 'head': this._cmdHead(args); break;
      case 'tail': this._cmdTail(args); break;
      case 'grep': this._cmdGrep(args); break;
      case 'sort': this._cmdSort(args); break;
      case 'uniq': this._cmdUniq(args); break;
      case 'tr': this._cmdTr(args); break;
      case 'yes': this._cmdYes(args); break;
      case 'sleep': this._cmdSleep(args); break;
      case 'true': break;
      case 'false': break;
      case 'test': break;
      case 'open': this._cmdOpen(args); break;
      case 'say': this._cmdSay(args); break;
      case 'cowsay': this._cmdCowsay(args); break;
      case 'fortune': this._cmdFortune(); break;
      case 'matrix': this._cmdMatrix(); break;
      case 'exit': this._cmdExit(); break;
      case 'sudo': this._cmdSudo(args); break;
      case 'ping': this._cmdPing(args); break;
      case 'ifconfig': this._cmdIfconfig(); break;
      case 'ip': this._cmdIp(args); break;
      case 'chmod': this._print('chmod: simulated (no real permissions)', 'terminal-line-info'); break;
      case 'cp': this._cmdCp(args); break;
      case 'mv': this._cmdMv(args); break;
      case 'find': this._cmdFind(args); break;
      case 'tree': this._cmdTree(args); break;
      case 'du': this._cmdDu(args); break;
      default:
        this._print(`zsh: command not found: ${this._escapeHtml(command)}`, 'terminal-line-error');
    }
  }

  _cmdHelp() {
    this._print(`<span style="color: #74c0fc;">Available Commands:</span>

  <span style="color: #69db7c;">Navigation:</span>
    ls [path]          List directory contents
    cd [path]          Change directory
    pwd                Print working directory
    tree [path]        Display directory tree
    find [path] [name] Find files

  <span style="color: #69db7c;">Files:</span>
    cat [file]         Display file contents
    touch [file]       Create empty file
    mkdir [name]       Create directory
    rm [file]          Remove file
    cp [src] [dst]     Copy file
    mv [src] [dst]     Move/rename file
    head [file]        Show first lines
    tail [file]        Show last lines

  <span style="color: #69db7c;">Text:</span>
    echo [text]        Print text
    grep [pat] [file]  Search for pattern
    wc [file]          Word/line count
    sort [file]        Sort lines
    rev [text]         Reverse text
    tr [set1] [set2]   Translate characters

  <span style="color: #69db7c;">System:</span>
    neofetch           System information
    uname [-a]         System name
    uptime             System uptime
    whoami             Current user
    date               Current date/time
    df                 Disk usage
    free               Memory usage
    ps                 Process list
    top                System monitor
    env                Environment variables
    history            Command history

  <span style="color: #69db7c;">Fun:</span>
    cowsay [text]      Cow says...
    fortune            Random fortune
    matrix             Matrix rain
    say [text]         Text-to-speech
    open [app]         Open an app

  <span style="color: #69db7c;">Other:</span>
    clear              Clear terminal
    exit               Close terminal
    tab                Autocomplete (press Tab)
    ↑/↓               Command history`, 'terminal-line-info');
  }

  _cmdLs(args) {
    let path = this.currentDir;
    let showAll = false;
    let longFormat = false;

    args.forEach(arg => {
      if (arg.startsWith('-')) {
        if (arg.includes('a')) showAll = true;
        if (arg.includes('l')) longFormat = true;
      } else {
        path = this._resolvePath(arg);
      }
    });

    const node = this._getNode(path);
    if (!node || !node.children) {
      this._print(`ls: ${path}: No such file or directory`, 'terminal-line-error');
      return;
    }

    let names = Object.keys(node.children);
    if (!showAll) names = names.filter(n => !n.startsWith('.'));

    if (longFormat) {
      this._print(`total ${names.length}`);
      names.forEach(name => {
        const child = node.children[name];
        const isDir = child.type === 'folder';
        const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
        const size = isDir ? '4096' : String(child.content?.length || 0).padStart(5);
        this._print(`${perms}  1 user staff  ${size}  ${new Date().toLocaleDateString()}  ${isDir ? '\x1b[34m' : ''}${name}${isDir ? '/' : ''}`);
      });
    } else {
      const colored = names.map(name => {
        const child = node.children[name];
        return child.type === 'folder'
          ? `<span style="color: #74c0fc; font-weight: 600;">${name}/</span>`
          : name;
      });
      this._print(colored.join('  '));
    }
  }

  _cmdCd(args) {
    let path = args[0] || '~';
    if (path === '-') {
      this._print(this.currentDir);
      return;
    }
    path = this._resolvePath(path);
    const node = this._getNode(path);
    if (!node) {
      this._print(`cd: no such file or directory: ${this._escapeHtml(args[0])}`, 'terminal-line-error');
      return;
    }
    if (node.type !== 'folder') {
      this._print(`cd: not a directory: ${this._escapeHtml(args[0])}`, 'terminal-line-error');
      return;
    }
    this.currentDir = path;
    this.env.PWD = path;
  }

  _cmdPwd() { this._print(this.currentDir); }

  _cmdEcho(args) { this._print(args.join(' ')); }

  _cmdCat(args) {
    if (!args.length) { this._print('cat: no file specified', 'terminal-line-error'); return; }
    const path = this._resolvePath(args[0]);
    const node = this._getNode(path);
    if (!node) { this._print(`cat: ${args[0]}: No such file`, 'terminal-line-error'); return; }
    if (node.type === 'folder') { this._print(`cat: ${args[0]}: Is a directory`, 'terminal-line-error'); return; }
    this._print(node.content || '');
  }

  _cmdMkdir(args) {
    if (!args.length) { this._print('mkdir: missing operand', 'terminal-line-error'); return; }
    args.forEach(name => {
      const path = this._resolvePath(name);
      const parent = this._getNode(path.substring(0, path.lastIndexOf('/')) || '/');
      const baseName = path.split('/').pop();
      if (parent && parent.children && !parent.children[baseName]) {
        parent.children[baseName] = { type: 'folder', children: {}, modified: new Date() };
      } else {
        this._print(`mkdir: ${name}: File exists`, 'terminal-line-error');
      }
    });
  }

  _cmdTouch(args) {
    if (!args.length) { this._print('touch: missing operand', 'terminal-line-error'); return; }
    args.forEach(name => {
      const path = this._resolvePath(name);
      const parent = this._getNode(path.substring(0, path.lastIndexOf('/')) || '/');
      const baseName = path.split('/').pop();
      if (parent && parent.children && !parent.children[baseName]) {
        parent.children[baseName] = { type: 'file', content: '', modified: new Date() };
      }
    });
  }

  _cmdRm(args) {
    let recursive = false;
    const files = [];
    args.forEach(arg => { if (arg.startsWith('-')) { if (arg.includes('r') || arg.includes('R')) recursive = true; } else files.push(arg); });
    if (!files.length) { this._print('rm: missing operand', 'terminal-line-error'); return; }
    files.forEach(name => {
      const path = this._resolvePath(name);
      const parent = this._getNode(path.substring(0, path.lastIndexOf('/')) || '/');
      const baseName = path.split('/').pop();
      if (parent && parent.children && parent.children[baseName]) {
        if (parent.children[baseName].type === 'folder' && !recursive) {
          this._print(`rm: ${name}: is a directory`, 'terminal-line-error');
        } else {
          delete parent.children[baseName];
        }
      } else {
        this._print(`rm: ${name}: No such file`, 'terminal-line-error');
      }
    });
  }

  _cmdRmdir(args) {
    if (!args.length) { this._print('rmdir: missing operand', 'terminal-line-error'); return; }
    args.forEach(name => {
      const path = this._resolvePath(name);
      const node = this._getNode(path);
      if (!node) { this._print(`rmdir: ${name}: No such directory`, 'terminal-line-error'); return; }
      if (node.children && Object.keys(node.children).length > 0) {
        this._print(`rmdir: ${name}: Directory not empty`, 'terminal-line-error'); return;
      }
      const parent = this._getNode(path.substring(0, path.lastIndexOf('/')) || '/');
      const baseName = path.split('/').pop();
      delete parent.children[baseName];
    });
  }

  _cmdClear() { this.outputEl.innerHTML = ''; }

  _cmdDate() { this._print(new Date().toString()); }

  _cmdWhoami() { this._print('User'); }

  _cmdUname(args) {
    if (args.includes('-a')) {
      this._print('macOS-Web 1.0.0 Darwin Kernel Version 23.0.0 x86_64');
    } else {
      this._print('macOS-Web');
    }
  }

  _cmdNeofetch() {
    this._print(`
<span style="color: #74c0fc;">         .'     '.         </span>  <span style="color: #69db7c; font-weight: 600;">User</span>@<span style="color: #69db7c; font-weight: 600;">macOS-Web</span>
<span style="color: #74c0fc;">       .---------.         </span>  ─────────────────
<span style="color: #74c0fc;">      /|  🍎    |\\         </span>  <span style="color: #fff; font-weight: 500;">OS:</span> macOS Web 14.0 (Sonoma)
<span style="color: #74c0fc;">     / |        | \\        </span>  <span style="color: #fff; font-weight: 500;">Host:</span> Browser
<span style="color: #74c0fc;">    |  |        |  |       </span>  <span style="color: #fff; font-weight: 500;">Kernel:</span> JavaScript ES2024
<span style="color: #74c0fc;">    |  |        |  |       </span>  <span style="color: #fff; font-weight: 500;">Uptime:</span> ${Math.floor((Date.now() % 86400000) / 3600000)} hours, ${Math.floor((Date.now() % 3600000) / 60000)} mins
<span style="color: #74c0fc;">    |  |        |  |       </span>  <span style="color: #fff; font-weight: 500;">Shell:</span> zsh 5.9
<span style="color: #74c0fc;">     \\ |        | /        </span>  <span style="color: #fff; font-weight: 500;">Resolution:</span> ${window.innerWidth}x${window.innerHeight}
<span style="color: #74c0fc;">      \\|        |/         </span>  <span style="color: #fff; font-weight: 500;">DE:</span> Aqua Web
<span style="color: #74c0fc;">       '---------'         </span>  <span style="color: #fff; font-weight: 500;">WM:</span> WindowManager
<span style="color: #74c0fc;">         '     '.         </span>  <span style="color: #fff; font-weight: 500;">Terminal:</span> macOS-Web Terminal
                           <span style="color: #fff; font-weight: 500;">CPU:</span> Virtual Core @ Infinity GHz
                           <span style="color: #fff; font-weight: 500;">Memory:</span> ∞ MB / ∞ MB
                           <span style="color: #fff; font-weight: 500;">Disk:</span> ∞ GB / ∞ GB
`, 'terminal-line-info');
  }

  _cmdUptime() {
    const mins = Math.floor((Date.now() % 86400000) / 60000);
    this._print(` ${new Date().toLocaleTimeString()}  up ${mins} mins, 1 user, load averages: 0.${Math.floor(Math.random()*50+10)}, 0.${Math.floor(Math.random()*30+5)}, 0.${Math.floor(Math.random()*20+2)}`);
  }

  _cmdDf() {
    this._print(`Filesystem    Size   Used  Avail  Capacity  Mounted on
map_host     1000G   256G   744G     26%    /
devfs         240K   240K     0B    100%    /dev`);
  }

  _cmdFree() {
    this._print(`              Total        Used       Free
Mem:        16384MB      8192MB      8192MB
Swap:        4096MB            0      4096MB`);
  }

  _cmdPs() {
    const procs = [
      ['1', '0', 'Ss', '0.0', '2.1', '/sbin/launchd'],
      ['245', '1', 'Ss', '0.0', '1.8', '/usr/libexec/UserEventAgent'],
      ['512', '1', 'Ss', '0.1', '3.2', '/System/Library/CoreServices/windowserver'],
      ['1024', '1', 'S+', '0.0', '1.5', '/bin/zsh'],
      ['2048', '1', 'Ss', '0.2', '4.1', 'macOS Web Desktop'],
    ];
    this._print(`  PID   PPID  STAT  %CPU  MEM  COMMAND
${procs.map(p => p.join('  ')).join('\n')}`);
  }

  _cmdTop() {
    this._print(`<span style="color: #ffd43b;">Top Process Summary</span> (simulated)
Processes: ${Math.floor(Math.random()*50+80)} total, ${Math.floor(Math.random()*5+2)} running
CPU usage: ${Math.floor(Math.random()*30+10)}% user, ${Math.floor(Math.random()*10+2)}% sys, ${Math.floor(Math.random()*60+50)}% idle
Memory: 8192MB used, 8192MB free
Swap: 0MB used, 4096MB free

Top 5 processes by CPU:
  PID  COMMAND      %CPU   MEM
  512  windowserver  2.1   320MB
  1024 zsh           0.5   45MB
  2048 Desktop       1.2   180MB
  245  UserEvent     0.1   30MB
    1  launchd       0.0   12MB`, 'terminal-line-info');
  }

  _cmdCurl(args) {
    if (!args.length) { this._print('curl: no URL specified', 'terminal-line-error'); return; }
    this._print(`  % Total    % Received  Time       Current
  100  1234  100  1234    0     0   6170      0 --:--:-- --:--:-- --:--:--  6170
<span style="color: #69db7c;">[Simulated response for ${args[0]}]</span>`, 'terminal-line-info');
  }

  _cmdWget(args) {
    if (!args.length) { this._print('wget: no URL specified', 'terminal-line-error'); return; }
    this._print(`--${new Date().toLocaleString()}--  ${args[0]}
Resolving... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1234 (1.2K)
Saving to: 'index.html'

index.html          100%[================>]   1.2K  --.-KB/s    in 0s

<span style="color: #69db7c;">${new Date().toLocaleString()} - 'index.html' saved [1234/1234]</span>`, 'terminal-line-info');
  }

  _cmdWhich(args) {
    if (!args.length) return;
    const known = ['ls', 'cd', 'pwd', 'echo', 'cat', 'mkdir', 'rm', 'clear', 'date', 'whoami', 'neofetch', 'grep', 'sort', 'find', 'tree'];
    if (known.includes(args[0])) {
      this._print(`/usr/bin/${args[0]}`);
    } else {
      this._print(`${args[0]} not found`, 'terminal-line-error');
    }
  }

  _cmdEnv() {
    Object.entries(this.env).forEach(([k, v]) => this._print(`${k}=${v}`));
  }

  _cmdExport(args) {
    if (args.length >= 1 && args[0].includes('=')) {
      const [key, val] = args[0].split('=');
      this.env[key] = val;
    }
  }

  _cmdHistory() {
    this.history.forEach((cmd, i) => this._print(`  ${String(i + 1).padStart(4)}  ${cmd}`));
  }

  _cmdCal() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    this._print(`     ${monthNames[month]} ${year}`);
    this._print('Su Mo Tu We Th Fr Sa');
    let line = '   '.repeat(firstDay);
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = d === today ? `[${d.toString().padStart(2)}]` : ` ${d.toString().padStart(2)} `;
      line += dayStr;
      if ((firstDay + d) % 7 === 0) {
        this._print(line);
        line = '';
      }
    }
    if (line) this._print(line);
  }

  _cmdBc(args) {
    if (!args.length) { this._print('bc: ready for input (type expression)'); return; }
    try {
      const expr = args.join(' ').replace(/[^0-9+\-*/().%\s]/g, '');
      if (expr) this._print(String(eval(expr)));
    } catch { this._print('bc: parse error', 'terminal-line-error'); }
  }

  _cmdSeq(args) {
    const start = parseInt(args[0]) || 1;
    const end = parseInt(args[1]) || parseInt(args[0]) || 10;
    this._print(Array.from({length: end - start + 1}, (_, i) => start + i).join('\n'));
  }

  _cmdRev(args) {
    if (!args.length) return;
    this._print(args.join(' ').split('').reverse().join(''));
  }

  _cmdWc(args) {
    if (!args.length) return;
    const path = this._resolvePath(args[0]);
    const node = this._getNode(path);
    if (!node || node.type === 'folder') { this._print(`wc: ${args[0]}: No such file`, 'terminal-line-error'); return; }
    const content = node.content || '';
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).filter(Boolean).length;
    const chars = content.length;
    this._print(`  ${lines}  ${words} ${chars} ${args[0]}`);
  }

  _cmdHead(args) {
    let n = 10, file = null;
    args.forEach(arg => { if (arg.startsWith('-')) n = parseInt(arg.slice(1)) || 10; else file = arg; });
    if (!file) return;
    const node = this._getNode(this._resolvePath(file));
    if (!node || node.type === 'folder') return;
    const lines = (node.content || '').split('\n').slice(0, n);
    this._print(lines.join('\n'));
  }

  _cmdTail(args) {
    let n = 10, file = null;
    args.forEach(arg => { if (arg.startsWith('-')) n = parseInt(arg.slice(1)) || 10; else file = arg; });
    if (!file) return;
    const node = this._getNode(this._resolvePath(file));
    if (!node || node.type === 'folder') return;
    const lines = (node.content || '').split('\n').slice(-n);
    this._print(lines.join('\n'));
  }

  _cmdGrep(args) {
    if (args.length < 2) { this._print('Usage: grep [pattern] [file]', 'terminal-line-error'); return; }
    const pattern = args[0];
    const node = this._getNode(this._resolvePath(args[1]));
    if (!node || node.type === 'folder') return;
    const lines = (node.content || '').split('\n');
    const matches = lines.filter(l => l.includes(pattern));
    if (matches.length) this._print(matches.join('\n'));
  }

  _cmdSort(args) {
    if (!args.length) return;
    const node = this._getNode(this._resolvePath(args[0]));
    if (!node || node.type === 'folder') return;
    const lines = (node.content || '').split('\n').sort();
    this._print(lines.join('\n'));
  }

  _cmdUniq(args) {
    if (!args.length) return;
    const node = this._getNode(this._resolvePath(args[0]));
    if (!node || node.type === 'folder') return;
    const lines = [...new Set((node.content || '').split('\n'))];
    this._print(lines.join('\n'));
  }

  _cmdTr(args) {
    if (args.length < 2) return;
    this._print(args.slice(2).join(' ').replace(new RegExp(args[0].split('').map(c => '\\' + c).join('|'), 'g'), args[1][0]));
  }

  _cmdYes(args) {
    this._print((args.join(' ') || 'y').repeat(5) + '... (truncated)');
  }

  _cmdSleep(args) {
    if (!args.length) return;
    this._print(`Slept for ${args[0]}s (simulated)`);
  }

  _cmdOpen(args) {
    if (!args.length) return;
    const appNames = {
      'finder': 'finder', 'safari': 'safari', 'terminal': 'terminal',
      'calculator': 'calculator', 'notes': 'notes', 'textedit': 'textedit',
      'calendar': 'calendar', 'photos': 'photos', 'music': 'music',
      'reminders': 'reminders', 'weather': 'weather', 'system-prefs': 'system-prefs'
    };
    const appName = args[0].toLowerCase().replace('.app', '');
    if (appNames[appName]) {
      AppManager.openApp(appNames[appName]);
      this._print(`Opening ${appName}...`);
    } else {
      this._print(`open: no application found for ${args[0]}`, 'terminal-line-error');
    }
  }

  _cmdSay(args) {
    if (!args.length) return;
    const text = args.join(' ');
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
    this._print(`🔊 "${text}"`);
  }

  _cmdCowsay(args) {
    const text = args.join(' ') || 'Moo!';
    const border = '-'.repeat(text.length + 2);
    this._print(` ${border}
< ${text} >
 ${border}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`);
  }

  _cmdFortune() {
    const fortunes = [
      'You will have a great day!',
      'A surprising event awaits you.',
      'The best is yet to come.',
      'Your code will compile on the first try.',
      'A bug is never just a bug — it\'s an undocumented feature.',
      'The cloud is just someone else\'s computer.',
      'There are 10 types of people: those who understand binary and those who don\'t.',
      'It works on my machine! — Every developer ever',
      'First, solve the problem. Then, write the code.',
      'The computer was born to solve problems that did not exist before.',
    ];
    this._print(fortunes[Math.floor(Math.random() * fortunes.length)]);
  }

  _cmdMatrix() {
    const chars = '01アイウエオカキクケコサシスセソ';
    let output = '';
    for (let i = 0; i < 10; i++) {
      let line = '';
      for (let j = 0; j < 60; j++) {
        line += chars[Math.floor(Math.random() * chars.length)];
      }
      output += `<span style="color: #69db7c;">${line}</span>\n`;
    }
    this._print(output.trim(), 'terminal-line-success');
  }

  _cmdExit() {
    const win = windowManager.getWindowById('terminal-window');
    if (win) windowManager.closeWindow('terminal-window');
  }

  _cmdSudo(args) {
    this._print('<span style="color: #ff6b6b;">🚫 Nice try! This is a web browser.</span>', 'terminal-line-error');
  }

  _cmdPing(args) {
    if (!args.length) { this._print('ping: no host specified', 'terminal-line-error'); return; }
    this._print(`PING ${args[0]} (93.184.216.34): 56 data bytes
64 bytes: icmp_seq=0 ttl=56 time=23.456 ms
64 bytes: icmp_seq=1 ttl=56 time=21.234 ms
64 bytes: icmp_seq=2 ttl=56 time=22.789 ms

--- ${args[0]} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
round-trip min/avg/max/stddev = 21.234/22.493/23.456/0.890 ms`, 'terminal-line-info');
  }

  _cmdIfconfig() {
    this._print(`en0: flags=8863&lt;UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST&gt;
  inet 192.168.1.${Math.floor(Math.random()*254+1)} netmask 0xffffff00 broadcast 192.168.1.255
  ether aa:bb:cc:dd:ee:ff
  status: active

lo0: flags=8049&lt;UP,LOOPBACK,RUNNING,MULTICAST&gt;
  inet 127.0.0.1 netmask 0xff000000
  inet6 ::1 prefixlen 128`);
  }

  _cmdIp(args) {
    if (args[0] === 'addr' || args[0] === 'a') {
      this._cmdIfconfig();
    } else {
      this._print('Usage: ip addr show');
    }
  }

  _cmdCp(args) {
    if (args.length < 2) { this._print('cp: missing file operand', 'terminal-line-error'); return; }
    const srcNode = this._getNode(this._resolvePath(args[0]));
    if (!srcNode) { this._print(`cp: ${args[0]}: No such file`, 'terminal-line-error'); return; }
    const destPath = this._resolvePath(args[1]);
    const destParent = this._getNode(destPath.substring(0, destPath.lastIndexOf('/')) || '/');
    const destName = destPath.split('/').pop() || args[0].split('/').pop();
    if (destParent && destParent.children) {
      destParent.children[destName] = JSON.parse(JSON.stringify(srcNode));
      this._print(`Copied ${args[0]} → ${args[1]}`);
    }
  }

  _cmdMv(args) {
    if (args.length < 2) { this._print('mv: missing file operand', 'terminal-line-error'); return; }
    const srcPath = this._resolvePath(args[0]);
    const srcParent = this._getNode(srcPath.substring(0, srcPath.lastIndexOf('/')) || '/');
    const srcName = srcPath.split('/').pop();
    if (!srcParent || !srcParent.children[srcName]) {
      this._print(`mv: ${args[0]}: No such file`, 'terminal-line-error'); return;
    }
    const destPath = this._resolvePath(args[1]);
    const destParent = this._getNode(destPath.substring(0, destPath.lastIndexOf('/')) || '/');
    const destName = destPath.split('/').pop() || srcName;
    if (destParent && destParent.children) {
      destParent.children[destName] = srcParent.children[srcName];
      delete srcParent.children[srcName];
      this._print(`Moved ${args[0]} → ${args[1]}`);
    }
  }

  _cmdFind(args) {
    let path = '/';
    let nameFilter = null;
    args.forEach(arg => {
      if (arg === '-name') nameFilter = true;
      else if (nameFilter) { nameFilter = arg.replace(/[?*]/g, c => c === '*' ? '.*' : '\\' + c); }
      else path = this._resolvePath(arg);
    });

    const results = [];
    const search = (node, currentPath) => {
      if (!node || !node.children) return;
      Object.entries(node.children).forEach(([name, child]) => {
        const fullPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
        if (!nameFilter || new RegExp(nameFilter).test(name)) {
          results.push(fullPath);
        }
        if (child.type === 'folder') search(child, fullPath);
      });
    };

    const startNode = this._getNode(path);
    search(startNode, path);
    results.forEach(r => this._print(r));
  }

  _cmdTree(args) {
    let path = this.currentDir;
    if (args[0] && !args[0].startsWith('-')) path = this._resolvePath(args[0]);

    const node = this._getNode(path);
    if (!node) { this._print(`tree: ${args[0] || path}: No such directory`, 'terminal-line-error'); return; }

    const displayName = path === '/' ? '/' : path.split('/').pop();
    this._print(`<span style="color: #74c0fc; font-weight: 600;">${displayName}</span>`);

    const buildTree = (node, prefix) => {
      if (!node.children) return;
      const keys = Object.keys(node.children);
      keys.forEach((name, i) => {
        const child = node.children[name];
        const isLast = i === keys.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        const color = child.type === 'folder' ? '#74c0fc' : '#d4d4d4';
        this._print(`${prefix}${connector}<span style="color: ${color};">${name}${child.type === 'folder' ? '/' : ''}</span>`);
        if (child.type === 'folder' && child.children) {
          buildTree(child, prefix + (isLast ? '    ' : '│   '));
        }
      });
    };

    buildTree(node, '');
  }

  _cmdDu(args) {
    let path = this.currentDir;
    if (args[0] && !args[0].startsWith('-')) path = this._resolvePath(args[0]);
    const node = this._getNode(path);
    if (!node) return;

    const calcSize = (n) => {
      if (!n.children) return 4;
      let size = 4;
      Object.values(n.children).forEach(child => {
        size += child.type === 'folder' ? calcSize(child) : (child.content?.length || 0);
      });
      return size;
    };

    const size = calcSize(node);
    const displayPath = path === '/' ? '/' : path.split('/').pop();
    this._print(`${(size / 1024).toFixed(1)}\t${displayPath}`);
  }
}