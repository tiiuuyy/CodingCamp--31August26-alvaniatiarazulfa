/* === STORAGE === */

const StorageService = {
  KEYS: Object.freeze({
    USER_NAME:      'tld_user_name',
    TASKS:          'tld_tasks',
    TASK_ORDER:     'tld_task_order',
    SORT_MODE:      'tld_sort_mode',
    TIMER_DURATION: 'tld_timer_duration',
    QUICK_LINKS:    'tld_quick_links',
    THEME_MODE:     'tld_theme_mode',
    MOOD_ENTRY:     'tld_mood_entry',
    SCHEMA_VERSION: 'tld_schema_version',
  }),

  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error(`[Storage] Failed to get "${key}":`, e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[Storage] Failed to set "${key}":`, e);
      NotificationService.show('Gagal menyimpan data. Penyimpanan mungkin penuh.', 4000);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`[Storage] Failed to remove "${key}":`, e);
      return false;
    }
  },

  clear() {
    try {
      Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
      return true;
    } catch (e) {
      console.error('[Storage] Failed to clear app keys:', e);
      return false;
    }
  },
};

/* === ANIMATIONS === */

const AnimationHelpers = {
  triggerAnimation(el, className) {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth; // Force reflow
    el.classList.add(className);
    el.addEventListener('animationend', () => {
      el.classList.remove(className);
    }, { once: true });
  }
};

/* === NOTIFICATIONS === */

const NotificationService = {
  show(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast--hiding');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 200);
    }, duration);
  },

  playBeep() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn('[NotificationService] playBeep failed:', e);
    }
  },

  requestPermission() {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } catch (e) {
      console.warn('[NotificationService] requestPermission failed:', e);
    }
  },
};

/* === CLOCK === */

const ClockModule = {
  _intervalId: null,

  _DAYS: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],

  _MONTHS: [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ],

  getFormattedTime(date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  },

  getFormattedDate(date) {
    const dayName   = this._DAYS[date.getDay()];
    const day       = date.getDate();
    const monthName = this._MONTHS[date.getMonth()];
    const year      = date.getFullYear();
    return `${dayName}, ${day} ${monthName} ${year}`;
  },

  getHour(date) {
    return date.getHours();
  },

  init() {
    const tick = () => {
      const now = new Date();

      const timeEl = document.getElementById('clock-time');
      if (timeEl) timeEl.textContent = this.getFormattedTime(now);

      const dateEl = document.getElementById('clock-date');
      if (dateEl) dateEl.textContent = this.getFormattedDate(now);

      const hour = this.getHour(now);

      if (typeof GreetingModule !== 'undefined' && typeof GreetingModule.update === 'function') {
        GreetingModule.update(hour);
      }
      if (typeof ThemeModule !== 'undefined' && typeof ThemeModule.update === 'function') {
        ThemeModule.update(hour);
      }
    };

    tick();
    this._intervalId = setInterval(tick, 1000);
  },

  destroy() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  },
};

/* === GREETING (TASK 13) === */

const GreetingModule = {
  _currentName: null,

  getGreeting(hour) {
    if (hour >= 5  && hour <= 11) return 'Selamat pagi';
    if (hour >= 12 && hour <= 14) return 'Selamat siang';
    if (hour >= 15 && hour <= 17) return 'Selamat sore';
    return 'Selamat malam';
  },

  formatGreetingWithName(greeting, name) {
    if (name && name.trim().length > 0) {
      return `${greeting}, ${name.trim()} 👋`;
    }
    return `${greeting} 👋`;
  },

  validateName(str) {
    if (str === null || str === undefined) return false;
    const trimmed = str.trim();
    if (trimmed.length === 0) return false;
    if (trimmed.length > 50) return false;
    return true;
  },

  saveName(name) {
    if (!this.validateName(name)) {
      return false;
    }
    const trimmed = name.trim();
    const ok = StorageService.set(StorageService.KEYS.USER_NAME, trimmed);
    if (!ok) {
      NotificationService.show('Gagal menyimpan nama. Coba lagi.', 3000);
      return false;
    }
    this._currentName = trimmed;
    this._render();
    return true;
  },

  enterEditMode() {
    const display = document.getElementById('greeting-name-display');
    const form    = document.getElementById('greeting-name-form');
    const input   = document.getElementById('input-name');

    if (display) display.hidden = true;
    if (form)    form.hidden    = false;

    if (input) {
      input.value = this._currentName || '';
      input.focus();
      input.select();
    }
  },

  exitEditMode(save) {
    const input = document.getElementById('input-name');
    if (save && input) {
      const submitted = this.saveName(input.value);
      if (!submitted) {
        AnimationHelpers.triggerAnimation(input, 'input--shake');
        return;
      }
    }
    const display = document.getElementById('greeting-name-display');
    const form    = document.getElementById('greeting-name-form');
    if (display) display.hidden = false;
    if (form)    form.hidden    = true;
  },

  update(hour) {
    const greetingEl = document.getElementById('greeting-text');
    if (!greetingEl) return;
    const greeting = this.getGreeting(hour);
    greetingEl.textContent = this.formatGreetingWithName(greeting, this._currentName);
  },

  _render() {
    const display   = document.getElementById('greeting-name-display');
    const nameText  = document.getElementById('greeting-name-text');
    const form      = document.getElementById('greeting-name-form');
    const input     = document.getElementById('input-name');

    if (this._currentName) {
      if (nameText) nameText.textContent = this._currentName;
      if (display)  display.hidden = false;
      if (form)     form.hidden    = true;
    } else {
      if (display) display.hidden = true;
      if (form)    form.hidden    = false;
      if (input)   input.value   = '';
    }

    const now = new Date();
    this.update(now.getHours());
  },

  _attachListeners() {
    const form = document.getElementById('greeting-name-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('input-name');
        this.exitEditMode(true);
        if (input && !form.hidden) {
          input.focus();
        }
      });
    }

    const btnEdit = document.getElementById('btn-edit-name');
    if (btnEdit) {
      btnEdit.addEventListener('click', () => {
        this.enterEditMode();
      });
    }

    const inputName = document.getElementById('input-name');
    if (inputName) {
      inputName.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.exitEditMode(false);
        }
      });
    }
  },

  init() {
    this._currentName = StorageService.get(StorageService.KEYS.USER_NAME) || null;
    this._attachListeners();
    this._render();
  },
};

/* === TIMER === */

const TimerModule = {
  _intervalId: null,
  _remainingSeconds: 25 * 60,
  _initialDurationMinutes: 25,
  _isRunning: false,

  formatTime(seconds) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  },

  setDuration(minutes) {
    const mins = parseInt(minutes, 10);
    if (isNaN(mins) || mins < 1 || mins > 180) {
      return false;
    }
    this.stop();
    this._initialDurationMinutes = mins;
    this._remainingSeconds = mins * 60;
    StorageService.set(StorageService.KEYS.TIMER_DURATION, mins);
    this.render();
    return true;
  },

  toggle() {
    if (this._isRunning) {
      this.stop();
    } else {
      this.start();
    }
  },

  start() {
    if (this._isRunning) return;
    this._isRunning = true;
    this._updateButtons();

    this._intervalId = setInterval(() => {
      this._remainingSeconds--;
      this.render();

      if (this._remainingSeconds <= 0) {
        this.stop();
        NotificationService.playBeep();
        NotificationService.show('⏰ Waktu fokus telah selesai!', 5000);
      }
    }, 1000);
  },

  stop() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    this._isRunning = false;
    this._updateButtons();
  },

  reset() {
    this.stop();
    this._remainingSeconds = this._initialDurationMinutes * 60;
    this.render();
  },

  render() {
    const countdownEl = document.getElementById('timer-countdown');
    if (countdownEl) {
      countdownEl.textContent = this.formatTime(this._remainingSeconds);
    }
    document.title = `${this.formatTime(this._remainingSeconds)} - Tiay's Life Dashboard`;
  },

  _updateButtons() {
    const btnStart = document.getElementById('btn-timer-start');
    const btnStop  = document.getElementById('btn-timer-stop');

    if (btnStart) btnStart.disabled = this._isRunning;
    if (btnStop)  btnStop.disabled  = !this._isRunning;
  },

  _attachListeners() {
    const btnStart = document.getElementById('btn-timer-start');
    const btnStop  = document.getElementById('btn-timer-stop');
    const btnReset = document.getElementById('btn-timer-reset');

    if (btnStart) btnStart.addEventListener('click', () => this.start());
    if (btnStop)  btnStop.addEventListener('click', () => this.stop());
    if (btnReset) btnReset.addEventListener('click', () => this.reset());

    const presetBtns = document.querySelectorAll('.timer-presets .btn--preset');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = parseInt(btn.dataset.minutes, 10);
        if (this.setDuration(mins)) {
          presetBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
          btn.setAttribute('aria-pressed', 'true');
        }
      });
    });

    const customForm = document.getElementById('timer-custom-form');
    if (customForm) {
      customForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('input-custom-duration');
        const errEl = document.getElementById('duration-error');
        if (!input) return;

        const val = parseInt(input.value, 10);
        if (this.setDuration(val)) {
          if (errEl) errEl.hidden = true;
          presetBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
          input.value = '';
        } else {
          if (errEl) {
            errEl.textContent = 'Durasi harus 1–180 menit.';
            errEl.hidden = false;
          }
        }
      });
    }
  },

  init() {
    const savedMins = StorageService.get(StorageService.KEYS.TIMER_DURATION);
    if (savedMins && !isNaN(savedMins)) {
      this._initialDurationMinutes = parseInt(savedMins, 10);
      this._remainingSeconds = this._initialDurationMinutes * 60;
    }
    this._attachListeners();
    this.render();
  },
};

/* === SORTING (TASK 11) === */

const SortModule = {
  sortByStatus(tasks) {
    return tasks.slice().sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));
  },

  sortByName(tasks) {
    return tasks.slice().sort((a, b) => a.text.localeCompare(b.text, undefined, { sensitivity: 'base' }));
  },

  sortByNewest(tasks) {
    return tasks.slice().sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  },

  sortByOldest(tasks) {
    return tasks.slice().sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  },

  apply(tasks, mode) {
    switch (mode) {
      case 'status':
        return this.sortByStatus(tasks);
      case 'az':
      case 'name':
        return this.sortByName(tasks);
      case 'newest':
        return this.sortByNewest(tasks);
      case 'oldest':
      default:
        return this.sortByOldest(tasks);
    }
  },
};

/* === TASKS (TASK 11 & 15) === */

const TaskModule = {
  _tasks: [],

  getPriorityClass(priority) {
    switch (priority) {
      case 'high':   return 'task-item--priority-high';
      case 'low':    return 'task-item--priority-low';
      case 'medium':
      default:       return 'task-item--priority-medium';
    }
  },

  createTask(text, priority = 'medium') {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).slice(2, 8);
    return {
      id:        `task_${timestamp}_${randomHex}`,
      text:      text.trim(),
      done:      false,
      priority:  priority || 'medium',
      createdAt: new Date().toISOString(),
    };
  },

  validateTaskText(str) {
    if (str === null || str === undefined) return false;
    const trimmed = str.trim();
    if (trimmed.length === 0) return false;
    if (trimmed.length > 200) return false;
    return true;
  },

  _normalize(str) {
    return str.trim().toLowerCase();
  },

  isDuplicate(text, tasks) {
    const normalized = this._normalize(text);
    return tasks.some(task => this._normalize(task.text) === normalized);
  },

  getTaskById(id) {
    return this._tasks.find(t => t.id === id) || null;
  },

  getStats(tasks) {
    const total = tasks.length;
    if (total === 0) return { total: 0, done: 0, incomplete: 0, percent: 0 };
    const done = tasks.filter(t => t.done).length;
    return {
      total,
      done,
      incomplete: total - done,
      percent:    Math.round((done / total) * 100),
    };
  },

  addTask(text, priority = 'medium') {
    const inputEl = document.getElementById('input-task');

    if (!this.validateTaskText(text)) {
      const errorEl = document.getElementById('task-input-error');
      if (errorEl) {
        errorEl.textContent = 'Task tidak boleh kosong.';
        errorEl.hidden = false;
      }
      AnimationHelpers.triggerAnimation(inputEl, 'input--shake');
      return;
    }

    if (this.isDuplicate(text, this._tasks)) {
      NotificationService.show('Task sudah ada dalam daftar.', 3000);
      AnimationHelpers.triggerAnimation(inputEl, 'input--shake');
      return;
    }

    const errorEl = document.getElementById('task-input-error');
    if (errorEl) errorEl.hidden = true;

    const task = this.createTask(text, priority);
    this._tasks.push(task);

    const ok = StorageService.set(StorageService.KEYS.TASKS, this._tasks);
    if (!ok) {
      NotificationService.show('Gagal menyimpan task ke penyimpanan.', 3000);
    }

    this.renderAll();
    this.renderStats();
  },

  editTask(id, newText, newPriority) {
    if (!this.validateTaskText(newText)) {
      NotificationService.show('Teks task tidak valid.', 3000);
      return;
    }

    const task = this.getTaskById(id);
    if (!task) return;

    task.text     = newText.trim();
    task.priority = newPriority || task.priority;

    const ok = StorageService.set(StorageService.KEYS.TASKS, this._tasks);
    if (!ok) {
      NotificationService.show('Gagal menyimpan perubahan task.', 3000);
    }

    this.renderAll();
    this.renderStats();
  },

  deleteTask(id) {
    const idx = this._tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    this._tasks.splice(idx, 1);

    const ok = StorageService.set(StorageService.KEYS.TASKS, this._tasks);
    if (!ok) {
      NotificationService.show('Gagal menyimpan perubahan ke penyimpanan.', 3000);
    }

    this.renderAll();
    this.renderStats();
  },

  toggleComplete(id) {
    const task = this.getTaskById(id);
    if (!task) return;
    task.done = !task.done;

    const ok = StorageService.set(StorageService.KEYS.TASKS, this._tasks);
    if (!ok) {
      NotificationService.show('Gagal menyimpan status task.', 3000);
    }

    this.renderAll();
    this.renderStats();
  },

  init() {
    const stored = StorageService.get(StorageService.KEYS.TASKS);
    this._tasks = Array.isArray(stored) ? stored : [];

    this._attachListeners();
    this.renderAll();
    this.renderStats();
  },

  renderAll() {
    const container = document.getElementById('task-list');
    if (!container) return;

    let tasksToRender = this._tasks.slice();
    const sortSelect = document.getElementById('select-sort');
    const mode = (sortSelect && sortSelect.value) || 'oldest';
    tasksToRender = SortModule.apply(tasksToRender, mode);

    container.innerHTML = '';

    if (tasksToRender.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'task-empty-state';
      empty.textContent = 'Belum ada task. Tambahkan task pertamamu!';
      container.appendChild(empty);
      return;
    }

    tasksToRender.forEach(task => {
      const li = this._createTaskElement(task);
      container.appendChild(li);
    });

    if (typeof DragDropModule !== 'undefined' && typeof DragDropModule.init === 'function') {
      DragDropModule.init(container);
    }
  },

  _createTaskElement(task) {
    const li = document.createElement('li');
    const priorityClass = this.getPriorityClass(task.priority);
    li.className = `task-item ${priorityClass}` + (task.done ? ' task-item--done' : '');
    li.dataset.taskId = task.id;
    li.setAttribute('draggable', 'true');

    const dragHandle = document.createElement('span');
    dragHandle.className = 'task-drag-handle';
    dragHandle.setAttribute('aria-hidden', 'true');
    dragHandle.textContent = '⠿';
    li.appendChild(dragHandle);

    const checkbox = document.createElement('input');
    checkbox.type      = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked   = task.done;
    checkbox.setAttribute('aria-label', `Tandai selesai: ${task.text}`);
    checkbox.addEventListener('change', () => {
      AnimationHelpers.triggerAnimation(checkbox, 'checkbox--animating');
      this.toggleComplete(task.id);
    });
    li.appendChild(checkbox);

    const dot = document.createElement('span');
    dot.className = `task-priority-indicator task-priority-indicator--${task.priority}`;
    dot.setAttribute('aria-hidden', 'true');
    dot.title = `Prioritas: ${task.priority}`;
    li.appendChild(dot);

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text' + (task.done ? ' task-text--done' : '');
    textSpan.textContent = task.text;
    li.appendChild(textSpan);

    const badge = document.createElement('span');
    badge.className = `priority-badge priority-badge--${task.priority}`;
    badge.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    li.appendChild(badge);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.type      = 'button';
    editBtn.className = 'btn btn--icon btn-task-edit';
    editBtn.dataset.id = task.id;
    editBtn.setAttribute('aria-label', `Edit task: ${task.text}`);
    editBtn.textContent = '✏️';
    editBtn.addEventListener('click', () => this._enterEditMode(task.id));
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.type      = 'button';
    deleteBtn.className = 'btn btn--danger btn-task-delete';
    deleteBtn.dataset.id = task.id;
    deleteBtn.setAttribute('aria-label', `Hapus task: ${task.text}`);
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
    actions.appendChild(deleteBtn);

    li.appendChild(actions);
    return li;
  },

  _enterEditMode(id) {
    const task = this.getTaskById(id);
    if (!task) return;

    const li = document.querySelector(`[data-task-id="${id}"]`);
    if (!li) return;

    li.innerHTML = '';
    li.classList.remove('task-item--done');
    li.setAttribute('draggable', 'false');

    const input = document.createElement('input');
    input.type      = 'text';
    input.className = 'input input--task';
    input.value     = task.text;
    input.maxLength = 200;
    input.setAttribute('aria-label', 'Edit teks task');
    li.appendChild(input);

    const prioritySelect = document.createElement('select');
    prioritySelect.className = 'select select--priority';
    prioritySelect.setAttribute('aria-label', 'Pilih prioritas task');
    ['low', 'medium', 'high'].forEach(p => {
      const opt = document.createElement('option');
      opt.value    = p;
      opt.textContent = p.charAt(0).toUpperCase() + p.slice(1);
      if (p === task.priority) opt.selected = true;
      prioritySelect.appendChild(opt);
    });
    li.appendChild(prioritySelect);

    const saveBtn = document.createElement('button');
    saveBtn.type      = 'button';
    saveBtn.className = 'btn btn--primary';
    saveBtn.textContent = 'Simpan';
    saveBtn.setAttribute('aria-label', 'Simpan perubahan task');
    saveBtn.addEventListener('click', () => {
      this.editTask(id, input.value, prioritySelect.value);
    });
    li.appendChild(saveBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.type      = 'button';
    cancelBtn.className = 'btn btn--secondary';
    cancelBtn.textContent = 'Batal';
    cancelBtn.setAttribute('aria-label', 'Batal edit task');
    cancelBtn.addEventListener('click', () => this.renderAll());
    li.appendChild(cancelBtn);

    input.focus();
    input.select();

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.editTask(id, input.value, prioritySelect.value);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.renderAll();
      }
    });
  },

  renderStats() {
    const stats = this.getStats(this._tasks);

    const incompleteEl = document.getElementById('stats-incomplete');
    if (incompleteEl) incompleteEl.textContent = stats.incomplete;

    const percentEl = document.getElementById('stats-percent');
    if (percentEl) percentEl.textContent = `${stats.percent}%`;

    const ringFill = document.getElementById('progress-ring-fill');
    if (ringFill) {
      const r = parseFloat(ringFill.getAttribute('r')) || 15.9;
      const circumference = 2 * Math.PI * r;
      const filled = (stats.percent / 100) * circumference;
      ringFill.setAttribute('stroke-dasharray', `${filled.toFixed(2)} ${circumference.toFixed(2)}`);
    }
  },

  _attachListeners() {
    const form = document.getElementById('task-add-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputEl   = document.getElementById('input-task');
        const text      = inputEl ? inputEl.value : '';

        const prioritySelect = document.getElementById('select-priority') || form.querySelector('input[name="task-priority"]:checked');
        const priority = prioritySelect ? prioritySelect.value : 'medium';

        const isValid = this.validateTaskText(text);
        const isDup   = isValid && this.isDuplicate(text, this._tasks);

        this.addTask(text, priority);

        if (isValid && !isDup) {
          if (inputEl) inputEl.value = '';
        }
      });
    }

    const sortSelect = document.getElementById('select-sort');
    if (sortSelect) {
      const storedSort = StorageService.get(StorageService.KEYS.SORT_MODE) || 'oldest';
      if (sortSelect.querySelector(`option[value="${storedSort}"]`)) {
        sortSelect.value = storedSort;
      }

      sortSelect.addEventListener('change', () => {
        StorageService.set(StorageService.KEYS.SORT_MODE, sortSelect.value);
        this.renderAll();
      });
    }
  },
};

/* === DRAG_DROP (TASK 12) === */

const DragDropModule = {
  _draggedTaskId: null,
  _containerEl: null,

  reorderArray(arr, fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length) {
      return arr.slice();
    }
    const result = arr.slice();
    const [movedItem] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, movedItem);
    return result;
  },

  isValidDrop(target) {
    if (!target) return false;
    const item = target.closest('.task-item');
    return item !== null;
  },

  onDragStart(e) {
    const item = e.target.closest('.task-item');
    if (!item) return;
    this._draggedTaskId = item.dataset.taskId;
    e.dataTransfer.setData('text/plain', this._draggedTaskId);
    e.dataTransfer.effectAllowed = 'move';
    item.classList.add('task-item--dragging');
  },

  onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const targetItem = e.target.closest('.task-item');
    if (this.isValidDrop(targetItem)) {
      document.querySelectorAll('.task-item--drag-over').forEach(el => el.classList.remove('task-item--drag-over'));
      targetItem.classList.add('task-item--drag-over');
    }
  },

  onDrop(e) {
    e.preventDefault();
    this.onDragEnd();

    const targetItem = e.target.closest('.task-item');
    if (!targetItem || !this._draggedTaskId) return;

    const targetTaskId = targetItem.dataset.taskId;
    if (this._draggedTaskId === targetTaskId) return;

    const allItems = Array.from(this._containerEl.querySelectorAll('.task-item'));
    const fromIndex = allItems.findIndex(el => el.dataset.taskId === this._draggedTaskId);
    const toIndex   = allItems.findIndex(el => el.dataset.taskId === targetTaskId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const previousTasks = TaskModule._tasks.slice();
      const updatedTasks = this.reorderArray(TaskModule._tasks, fromIndex, toIndex);

      TaskModule._tasks = updatedTasks;
      const ok = StorageService.set(StorageService.KEYS.TASKS, updatedTasks);
      StorageService.set(StorageService.KEYS.TASK_ORDER, updatedTasks.map(t => t.id));

      if (!ok) {
        TaskModule._tasks = previousTasks;
        NotificationService.show('Gagal menyimpan urutan baru.', 3000);
      }
      TaskModule.renderAll();
    }
  },

  onDragEnd() {
    this._draggedTaskId = null;
    if (this._containerEl) {
      this._containerEl.querySelectorAll('.task-item').forEach(el => {
        el.classList.remove('task-item--dragging', 'task-item--drag-over');
      });
    }
  },

  init(containerEl) {
    this._containerEl = containerEl;
    if (!containerEl) return;

    containerEl.addEventListener('dragstart', (e) => this.onDragStart(e));
    containerEl.addEventListener('dragover', (e) => this.onDragOver(e));
    containerEl.addEventListener('drop', (e) => this.onDrop(e));
    containerEl.addEventListener('dragend', () => this.onDragEnd());
  },
};

/* === QUICK_LINKS (TASK 8) === */

const QuickLinksModule = {
  _links: [],

  validateURL(str) {
    if (typeof str !== 'string') return false;
    const trimmed = str.trim();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://');
  },

  getFaviconURL(url) {
    if (!this.validateURL(url)) return null;
    try {
      const parsed = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`;
    } catch (e) {
      return null;
    }
  },

  addLink(label, url) {
    if (!label.trim()) {
      NotificationService.show('Label tautan tidak boleh kosong.', 3000);
      return false;
    }
    if (!this.validateURL(url)) {
      const errEl = document.getElementById('link-url-error');
      if (errEl) {
        errEl.textContent = 'URL harus diawali dengan http:// atau https://';
        errEl.hidden = false;
      }
      return false;
    }

    const errEl = document.getElementById('link-url-error');
    if (errEl) errEl.hidden = true;

    const newLink = {
      id: `ql_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      label: label.trim(),
      url: url.trim(),
    };

    const nextLinks = [...this._links, newLink];
    const ok = StorageService.set(StorageService.KEYS.QUICK_LINKS, nextLinks);

    if (!ok) {
      NotificationService.show('Gagal menyimpan tautan ke penyimpanan.', 3000);
      return false;
    }

    this._links = nextLinks;
    this.renderAll();
    return true;
  },

  deleteLink(id) {
    this._links = this._links.filter(l => l.id !== id);
    StorageService.set(StorageService.KEYS.QUICK_LINKS, this._links);
    this.renderAll();
  },

  renderAll() {
    const listEl = document.getElementById('quick-links-list');
    if (!listEl) return;

    listEl.innerHTML = '';

    if (this._links.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'task-empty-state';
      empty.textContent = 'Belum ada tautan tersimpan.';
      listEl.appendChild(empty);
      return;
    }

    this._links.forEach(link => {
      const li = document.createElement('li');
      li.className = 'quick-link-item';

      const faviconUrl = this.getFaviconURL(link.url);
      const img = document.createElement('img');
      img.className = 'quick-link-favicon';
      img.src = faviconUrl || '';
      img.alt = '';
      img.onerror = () => {
        img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23888" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';
      };

      const a = document.createElement('a');
      a.className = 'quick-link-label';
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = link.label;

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn btn--icon';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', `Hapus tautan: ${link.label}`);
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteLink(link.id);
      });

      li.appendChild(img);
      li.appendChild(a);
      li.appendChild(delBtn);
      listEl.appendChild(li);
    });
  },

  _attachListeners() {
    const form = document.getElementById('quick-links-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const labelInput = document.getElementById('input-link-label');
        const urlInput   = document.getElementById('input-link-url');

        if (labelInput && urlInput) {
          if (this.addLink(labelInput.value, urlInput.value)) {
            labelInput.value = '';
            urlInput.value = '';
          }
        }
      });
    }
  },

  init() {
    const stored = StorageService.get(StorageService.KEYS.QUICK_LINKS);
    this._links = Array.isArray(stored) ? stored : [
      { id: 'ql_1', label: 'Instagram', url: 'https://www.instagram.com/ti.ayy/' },
      { id: 'ql_2', label: 'LinkedIn', url: 'https://www.linkedin.com/in/alvania-t-78734a125/' },
    ];
    this._attachListeners();
    this.renderAll();
  },
};

/* === THEME (TASK 10) === */

const ThemeModule = {
  _currentMode: 'light',
  _currentTimeTheme: 'day',

  getStoredPreference() {
    return StorageService.get(StorageService.KEYS.THEME_MODE) || 'light';
  },

  savePreference(mode) {
    StorageService.set(StorageService.KEYS.THEME_MODE, mode);
  },

  getTimeTheme(hour) {
    if (hour >= 4 && hour <= 7)   return 'dawn';
    if (hour >= 8 && hour <= 16)  return 'day';
    if (hour >= 17 && hour <= 19) return 'dusk';
    return 'night';
  },

  applyTheme(mode, timeTheme) {
    this._currentMode = mode;
    this._currentTimeTheme = timeTheme;

    document.body.setAttribute('data-theme', mode);
    document.body.setAttribute('data-time-theme', timeTheme);

    const btn = document.getElementById('btn-theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
    }
  },

  toggle() {
    const nextMode = this._currentMode === 'dark' ? 'light' : 'dark';
    this.savePreference(nextMode);
    this.applyTheme(nextMode, this._currentTimeTheme);
  },

  update(hour) {
    const newTimeTheme = this.getTimeTheme(hour);
    if (newTimeTheme !== this._currentTimeTheme) {
      this.applyTheme(this._currentMode, newTimeTheme);
    }
  },

  _attachListeners() {
    const btn = document.getElementById('btn-theme-toggle');
    if (btn) {
      btn.addEventListener('click', () => this.toggle());
    }
  },

  init() {
    const mode = this.getStoredPreference();
    const currentHour = new Date().getHours();
    const timeTheme = this.getTimeTheme(currentHour);

    this.applyTheme(mode, timeTheme);
    this._attachListeners();
  },
};

/* === QUOTES (TASK 14) === */

const QuoteModule = {
  QUOTES: [
    { text: "Cara terbaik untuk memprediksi masa depan adalah dengan menciptakannya.", author: "Abraham Lincoln" },
    { text: "Kecerdasan tanpa ambisi bagaikan burung tanpa sayap.", author: "Salvador Dali" },
    { text: "Kerja keras mengalahkan bakat ketika bakat tidak bekerja keras.", author: "Tim Notke" },
    { text: "Satu-satunya cara untuk melakukan pekerjaan hebat adalah mencintai apa yang kamu lakukan.", author: "Steve Jobs" },
    { text: "Jangan menunda apa yang bisa kamu kerjakan hari ini.", author: "Benjamin Franklin" },
    { text: "Fokus pada prosesnya, bukan hanya pada hasil akhirnya.", author: "Anonim" },
    { text: "Kesempatan kecil sering kali merupakan awal dari usaha yang besar.", author: "Demosthenes" },
    { text: "Kedisiplinan adalah jembatan antara cita-cita dan pencapaian.", author: "Jim Rohn" },
    { text: "Tindakan adalah kunci dasar untuk semua kesuksesan.", author: "Pablo Picasso" },
    { text: "Hari esok milik mereka yang mempersiapkannya hari ini.", author: "Malcolm X" }
  ],

  getRandomQuote(quotes) {
    if (!Array.isArray(quotes) || quotes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  },

  init() {
    const quoteEl  = document.getElementById('quote-text');
    const authorEl = document.getElementById('quote-author');
    if (!quoteEl || !authorEl) return;

    const selected = this.getRandomQuote(this.QUOTES);
    if (!selected) {
      quoteEl.textContent = '"Tetap semangat dan terus melangkah."';
      authorEl.textContent = '— Anonim';
      return;
    }

    quoteEl.textContent = `"${selected.text}"`;
    authorEl.textContent = selected.author ? `— ${selected.author}` : '— Anonim';
  },
};

/* === HABITS (TASK 14) === */

const HabitModule = {
  _activeMood: null,

  getTodayString() {
    return new Date().toISOString().split('T')[0];
  },

  isMoodForToday(storedDate) {
    return storedDate === this.getTodayString();
  },

  selectMood(mood) {
    const today = this.getTodayString();

    if (this._activeMood === mood) {
      this._activeMood = null;
      StorageService.remove(StorageService.KEYS.MOOD_ENTRY);
      this.renderMood(null);
      return;
    }

    const ok = StorageService.set(StorageService.KEYS.MOOD_ENTRY, { mood, date: today });
    if (!ok) {
      NotificationService.show('Gagal menyimpan mood.', 3000);
      return;
    }

    this._activeMood = mood;
    this.renderMood(mood);
    NotificationService.show('Mood hari ini telah dicatat!', 2500);
  },

  renderMood(activeMood) {
    const buttons = document.querySelectorAll('#mood-picker .mood-btn');
    buttons.forEach(btn => {
      const mood = btn.dataset.mood;
      if (activeMood && mood === activeMood) {
        btn.setAttribute('aria-pressed', 'true');
        btn.classList.add('mood-btn--active');
      } else {
        btn.setAttribute('aria-pressed', 'false');
        btn.classList.remove('mood-btn--active');
      }
    });
  },

  _attachListeners() {
    const buttons = document.querySelectorAll('#mood-picker .mood-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mood = btn.dataset.mood;
        this.selectMood(mood);
      });
    });
  },

  init() {
    const saved = StorageService.get(StorageService.KEYS.MOOD_ENTRY);
    if (saved && saved.date && this.isMoodForToday(saved.date)) {
      this._activeMood = saved.mood;
    } else {
      this._activeMood = null;
    }
    this.renderMood(this._activeMood);
    this._attachListeners();
  },
};

/* === EXPORT_IMPORT (TASK 16) === */

const ExportImportModule = {
  SCHEMA_VERSION: "1.0",

  exportData() {
    const snapshot = {
      schemaVersion: this.SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        userName: StorageService.get(StorageService.KEYS.USER_NAME),
        tasks: StorageService.get(StorageService.KEYS.TASKS),
        timerDuration: StorageService.get(StorageService.KEYS.TIMER_DURATION),
        quickLinks: StorageService.get(StorageService.KEYS.QUICK_LINKS),
        themeMode: StorageService.get(StorageService.KEYS.THEME_MODE),
        moodEntry: StorageService.get(StorageService.KEYS.MOOD_ENTRY),
      }
    };

    const jsonStr = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    NotificationService.show('Data berhasil diekspor!', 3000);
  },

  validateSchema(obj) {
    if (!obj || typeof obj !== 'object') return false;
    if (obj.schemaVersion !== "1.0") return false;
    if (!obj.data || typeof obj.data !== 'object') return false;

    const { userName, tasks, timerDuration, quickLinks, themeMode, moodEntry } = obj.data;

    if (userName !== null && userName !== undefined && typeof userName !== 'string') return false;
    if (tasks !== null && tasks !== undefined && !Array.isArray(tasks)) return false;
    if (quickLinks !== null && quickLinks !== undefined && !Array.isArray(quickLinks)) return false;
    if (timerDuration !== null && timerDuration !== undefined && typeof timerDuration !== 'number') return false;
    if (themeMode !== null && themeMode !== undefined && typeof themeMode !== 'string') return false;
    if (moodEntry !== null && moodEntry !== undefined && typeof moodEntry !== 'object') return false;

    return true;
  },

  importData(file) {
    if (file.size > 10 * 1024 * 1024) {
      NotificationService.show('Ukuran file melebihi batas 10MB.', 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      let parsed;
      try {
        parsed = JSON.parse(e.target.result);
      } catch (err) {
        NotificationService.show('Sintaks JSON tidak valid.', 4000);
        return;
      }

      if (!this.validateSchema(parsed)) {
        NotificationService.show('Format data tidak sesuai.', 4000);
        return;
      }

      const confirmed = window.confirm('Apakah Anda yakin ingin menimpa seluruh data dashboard dengan file cadangan ini?');
      if (!confirmed) return;

      const d = parsed.data;
      if (d.userName !== undefined) StorageService.set(StorageService.KEYS.USER_NAME, d.userName);
      if (d.tasks !== undefined) StorageService.set(StorageService.KEYS.TASKS, d.tasks);
      if (d.timerDuration !== undefined) StorageService.set(StorageService.KEYS.TIMER_DURATION, d.timerDuration);
      if (d.quickLinks !== undefined) StorageService.set(StorageService.KEYS.QUICK_LINKS, d.quickLinks);
      if (d.themeMode !== undefined) StorageService.set(StorageService.KEYS.THEME_MODE, d.themeMode);
      if (d.moodEntry !== undefined) StorageService.set(StorageService.KEYS.MOOD_ENTRY, d.moodEntry);

      NotificationService.show('Data berhasil diimpor! Memuat ulang...', 2000);
      setTimeout(() => window.location.reload(), 1500);
    };
    reader.readAsText(file);
  },

  init() {
    const btnExport = document.getElementById('btn-export');
    if (btnExport) {
      btnExport.addEventListener('click', () => this.exportData());
    }

    const inputImport = document.getElementById('input-import');
    if (inputImport) {
      inputImport.setAttribute('accept', '.json');
      inputImport.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          this.importData(file);
          inputImport.value = '';
        }
      });
    }
  },
};

/* === KEYBOARD (TASK 17) === */

const KeyboardModule = {
  handleKey(e) {
    const activeEl = document.activeElement;
    const isInput = activeEl && (
      activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      activeEl.tagName === 'SELECT'
    );

    const taskInput = document.getElementById('input-task');

    if (isInput) {
      if (e.key === 'Escape' && activeEl === taskInput) {
        e.preventDefault();
        taskInput.blur();
      } else if (e.key === 'Enter' && activeEl === taskInput) {
        // Form submit disetujui secara alami oleh browser
      }
      return;
    }

    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      if (taskInput) taskInput.focus();
    } else if (e.key === ' ') {
      e.preventDefault();
      if (typeof TimerModule !== 'undefined' && typeof TimerModule.toggle === 'function') {
        TimerModule.toggle();
      }
    }
  },

  init() {
    document.addEventListener('keydown', (e) => this.handleKey(e));
  },
};

/* === INIT (TASK 19) === */

const App = {
  init() {
    NotificationService.requestPermission();
    ThemeModule.init();
    ClockModule.init();
    GreetingModule.init();
    QuoteModule.init();
    HabitModule.init();
    TaskModule.init();
    TimerModule.init();
    QuickLinksModule.init();
    ExportImportModule.init();
    KeyboardModule.init();
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());