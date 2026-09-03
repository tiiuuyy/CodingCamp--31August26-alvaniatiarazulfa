# Implementation Plan: Todo Life Dashboard

## Overview

Implementasi Todo Life Dashboard sebagai single-page application statis menggunakan HTML5 + CSS3 + Vanilla JavaScript murni. Aplikasi terdiri dari tiga file (`index.html`, `css/style.css`, `js/app.js`) dengan 15 modul JavaScript yang menggunakan Revealing Module Pattern. Semua data persisten menggunakan Browser Local Storage. Urutan pengerjaan dimulai dari fondasi struktur dan styling, lalu modul-modul inti secara bertahap, kemudian signature features, dan diakhiri dengan polish.

---

## Tasks

- [x] 1. Setup proyek dan struktur HTML dasar
  - [x] 1.1 Buat struktur direktori dan file dasar proyek
    - Buat direktori `todo-life-dashboard/`, `todo-life-dashboard/css/`, `todo-life-dashboard/js/`
    - Buat `index.html` dengan boilerplate HTML5 (`<!DOCTYPE html>`, meta charset, meta viewport, title)
    - Buat `css/style.css` kosong dengan section header komentar placeholder
    - Buat `js/app.js` kosong dengan section header komentar placeholder
    - Hubungkan `style.css` via `<link>` dan `app.js` via `<script defer>` di `index.html`
    - _Requirements: 20.1, 20.2, 20.3_

  - [x] 1.2 Implementasikan markup HTML bento-grid dan semua widget card kosong
    - Tambahkan `<body data-theme="light" data-time-theme="day">` dan `<div class="dashboard-grid">`
    - Buat elemen `<section>` untuk setiap widget dengan class: `widget widget-greeting`, `widget widget-timer`, `widget widget-quick-links`, `widget widget-tasks`, `widget widget-sidebar`
    - Di dalam `.widget-sidebar` tambahkan `.widget-habit` dan `.widget-quote`
    - Tambahkan `<header>` dengan tombol theme toggle (ikon matahari/bulan) dan wrapper export/import
    - Tambahkan section notifikasi toast `<div id="toast-container">` di body
    - _Requirements: 12.1, 19.1, 20.1_

- [x] 2. Base CSS: variabel, tipografi, layout, dan animasi
  - [x] 2.1 Implementasikan CSS custom properties (design tokens) dan base reset
    - Tulis `/* === RESET & BASE === */`: box-sizing, margin/padding reset, font-family system stack
    - Tulis `/* === CSS CUSTOM PROPERTIES (TOKENS) === */` di `:root` — semua token warna, spacing, typography, radius, dan transition sesuai design document
    - Tambahkan `transition: var(--transition-theme)` pada selector `*` untuk transisi mode
    - _Requirements: 12.4, 18.3_

  - [x] 2.2 Implementasikan time-of-day themes dan dark mode overrides
    - Tulis `/* === TIME-OF-DAY THEMES === */` — selector `[data-time-theme="dawn/day/dusk/night"]` dengan `--gradient-bg` dan `--color-accent` masing-masing
    - Tulis `/* === LIGHT / DARK MODE OVERRIDES === */` — selector `[data-theme="dark"]` dengan override warna surface dan text
    - Terapkan `background: var(--gradient-bg)` pada `body` atau `.dashboard-grid`
    - _Requirements: 12.6, 13.1_

  - [x] 2.3 Implementasikan bento-grid layout desktop, tablet, dan mobile
    - Tulis `/* === BENTO GRID LAYOUT === */` dengan `grid-template-areas`, `grid-template-columns`, dan `grid-template-rows` untuk desktop (≥1024px)
    - Tulis `/* === RESPONSIVE — TABLET === */` dengan media query `(min-width: 768px) and (max-width: 1023px)` — 2-kolom layout
    - Tulis `/* === RESPONSIVE — MOBILE === */` dengan media query `(max-width: 767px)` — 1-kolom layout
    - Pastikan dashboard tidak perlu scroll vertikal di desktop
    - _Requirements: 19.1, 19.2, 19.3_

  - [x] 2.4 Implementasikan styling dasar widget dan komponen umum (tombol, input, toast)
    - Tulis section CSS untuk `.widget` (border-radius, background, padding, shadow)
    - Tulis styling untuk `button`, `input`, `select` menggunakan CSS custom properties
    - Tulis `/* === TOAST NOTIFICATIONS === */` — `.toast`, `.toast--hiding`, dan `@keyframes toastIn/toastOut`
    - Tulis `/* === ANIMATIONS === */` — `@keyframes fadeInUp`, `@keyframes checkboxPop`, `@keyframes shake`
    - Tambahkan staggered `animation-delay` untuk setiap `.widget` (fade-in on load)
    - _Requirements: 18.1, 18.2, 18.4_

- [x] 3. StorageService dan boilerplate modul JS
  - [x] 3.1 Implementasikan `StorageService` dengan semua storage keys dan error handling
    - Tulis `/* === STORAGE === */` di `app.js`
    - Definisikan `StorageService.KEYS` objek konstanta dengan 9 key: `tld_user_name`, `tld_tasks`, `tld_task_order`, `tld_sort_mode`, `tld_timer_duration`, `tld_quick_links`, `tld_theme_mode`, `tld_mood_entry`, `tld_schema_version`
    - Implementasikan `get(key)` — JSON.parse dengan try/catch, return null jika gagal
    - Implementasikan `set(key, value)` — JSON.stringify + localStorage.setItem, return true/false
    - Implementasikan `remove(key)` dan `clear()` dengan try/catch
    - Tampilkan toast error via `NotificationService.show()` jika storage gagal (siapkan referensi forward)
    - _Requirements: 2.2, 4.5, 5.3, 5.9_

  - [x] 3.2 Implementasikan `NotificationService` (toast dan audio beep)
    - Tulis `/* === NOTIFICATIONS === */`
    - Implementasikan `show(message, duration)` — buat elemen `.toast`, append ke `#toast-container`, auto-remove setelah `duration` ms menggunakan class `.toast--hiding`
    - Implementasikan `playBeep()` — buat `AudioContext`, buat `OscillatorNode` dengan frekuensi 880Hz, durasi 200ms; wrap dalam try/catch untuk silent fail
    - Implementasikan `requestPermission()` — request browser Notification API permission; wrap dalam try/catch
    - _Requirements: 3.5, 3.7, 7.2, 7.3_

- [x] 4. ClockModule dan GreetingModule
  - [x] 4.1 Implementasikan `ClockModule` dengan interval real-time dan fungsi pure
    - Tulis `/* === CLOCK === */`
    - Implementasikan `getFormattedTime(date)` — pure function, return string "HH:MM:SS" dengan padding nol
    - Implementasikan `getFormattedDate(date)` — pure function, gunakan array nama hari dan bulan Bahasa Indonesia, return format "Selasa, 3 September 2026"
    - Implementasikan `getHour(date)` — pure function, return integer 0–23
    - Implementasikan `init()` — mulai `setInterval(1000)`, update DOM clock/date, panggil `GreetingModule.update()` dan `ThemeModule.update()` setiap tick
    - Implementasikan `destroy()` untuk clearInterval
    - _Requirements: 1.1, 1.2, 1.7_

  - [x] 4.2 Implementasikan `GreetingModule` dengan sapaan dinamis dan manajemen nama
    - Tulis `/* === GREETING === */`
    - Implementasikan `getGreeting(hour)` — pure function: `[5–11]→"Selamat pagi"`, `[12–14]→"Selamat siang"`, `[15–17]→"Selamat sore"`, else `"Selamat malam"`
    - Implementasikan `formatGreetingWithName(greeting, name)` — pure: jika name ada return `"[greeting], [name] 👋"` else `"[greeting] 👋"`
    - Implementasikan `validateName(str)` — pure: return false jika null/undefined/empty setelah trim, atau panjang > 50
    - Implementasikan `saveName(name)` — validasi, simpan ke Storage, re-render
    - Implementasikan `enterEditMode()` — tampilkan input field terisi nama saat ini
    - Implementasikan `exitEditMode(save)` — simpan atau discard
    - Implementasikan `init()` — load nama dari storage, render sapaan dan nama, attach event listener tombol edit
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ]* 4.3 Tulis property test untuk `getGreeting` (Property 1)
    - **Property 1: Greeting Function Coverage**
    - Setup Vitest + fast-check: `npm init -y` di folder test, install `vitest` dan `fast-check`
    - Ekstrak `getGreeting` ke file yang dapat diimpor atau expose melalui global test setup
    - Buat file `tests/greeting.test.js`; untuk setiap integer hour dalam [0, 23], verifikasi `getGreeting(hour)` mengembalikan tepat salah satu dari empat sapaan valid, tidak pernah null/undefined/empty
    - Gunakan `fc.integer({ min: 0, max: 23 })` dengan `numRuns: 100`
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

  - [ ]* 4.4 Tulis property test untuk `validateName` (Property 5)
    - **Property 5: Task Whitespace Name Rejection**
    - Buat file `tests/greeting.test.js` (atau append); untuk setiap string yang hanya berisi whitespace, verifikasi `validateName(str)` return `false`
    - Gunakan `fc.stringMatching(/^[\s]+$/)` dengan `numRuns: 100`
    - **Validates: Requirements 2.7**

- [x] 5. TaskModule — CRUD, validasi, duplikasi, dan storage
  - [x] 5.1 Implementasikan struktur data Task dan fungsi-fungsi pure TaskModule
    - Tulis `/* === TASKS === */`
    - Implementasikan `createTask(text, priority)` — factory function: buat objek Task dengan `id` format `task_{timestamp}_{randomHex6}`, `text`, `done: false`, `priority` (default `"medium"`), `createdAt` ISO 8601
    - Implementasikan `validateTaskText(str)` — pure: return false jika null/kosong setelah trim, atau panjang > 200
    - Implementasikan `isDuplicate(text, tasks)` — pure: normalize (trim + toLowerCase), cek apakah tasks berisi teks yang sama
    - Implementasikan `getTaskById(id)` — pure: return task atau null
    - Implementasikan `getStats(tasks)` — pure: hitung total, done, incomplete, dan percent (Math.round)
    - _Requirements: 5.1, 5.2, 6.1, 6.4, 7.1, 10.1, 10.2_

  - [x] 5.2 Implementasikan operasi CRUD TaskModule (add, edit, delete, toggle) dengan storage
    - Implementasikan `addTask(text, priority)` — validasi teks, cek duplikat (tampilkan toast + shake animation jika duplikat), buat task, simpan ke Storage, re-render
    - Implementasikan `editTask(id, newText, newPriority)` — validasi, update task di array, simpan, re-render dalam ≤500ms
    - Implementasikan `deleteTask(id)` — hapus dari array, simpan, re-render dalam ≤500ms
    - Implementasikan `toggleComplete(id)` — flip `done`, simpan, re-render, trigger checkbox pop animation; perbarui stats dalam ≤500ms
    - Implementasikan `init()` — load tasks dari Storage, render list, render stats
    - _Requirements: 5.3, 5.5, 5.6, 5.7, 5.8, 5.9, 6.5, 7.2, 7.3, 18.2, 18.4_

  - [x] 5.3 Implementasikan `renderAll()` dan `renderStats()` TaskModule
    - `renderAll()` — clear container, iterasi tasks (setelah apply sort), render tiap task sebagai card/row: teks, checkbox, tombol edit/hapus, indikator prioritas dengan warna berbeda (Low=hijau, Medium=oranye, High=merah), tombol drag handle
    - Tambahkan indikasi visual strikethrough pada task yang `done: true`
    - `renderStats()` — update angka "task belum selesai", persentase selesai, dan progress ring/bar menggunakan SVG circle stroke-dasharray atau CSS width; tampilkan 0/0% saat list kosong
    - _Requirements: 5.4, 5.5, 6.2, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 5.4 Tulis property test untuk `validateTaskText` (Property 4)
    - **Property 4: Whitespace Task Rejection**
    - Buat file `tests/tasks.test.js`; untuk setiap string yang hanya berisi whitespace, verifikasi `validateTaskText(str)` return `false`
    - **Validates: Requirements 5.2, 17.4**

  - [ ]* 5.5 Tulis property test untuk `getStats` (Property 16)
    - **Property 16: Progress Stats Correctness**
    - Untuk array tasks acak dengan variasi nilai `done`, verifikasi `getStats(tasks).percent === Math.round(doneCount / total * 100)` dan `getStats(tasks).incomplete === tasks.filter(t => !t.done).length`
    - Gunakan `fc.array(fc.record({ done: fc.boolean(), ... }), { minLength: 1 })`
    - **Validates: Requirements 10.1, 10.2**

  - [ ]* 5.6 Tulis property test untuk `isDuplicate` (Property 10)
    - **Property 10: Duplicate Detection**
    - Untuk string `s` dan array tasks acak, verifikasi bahwa `isDuplicate(s, tasks)` return `true` jika dan hanya jika ada task dengan `normalize(task.text) === normalize(s)`
    - **Validates: Requirements 7.1**

  - [ ]* 5.7 Tulis property test untuk Task storage round-trip (Property 6)
    - **Property 6: Task Storage Round-Trip**
    - Untuk setiap Task object valid, verifikasi `JSON.parse(JSON.stringify(task))` menghasilkan objek dengan field `id`, `text`, `done`, `priority`, `createdAt` yang identik
    - **Validates: Requirements 5.3, 6.3**

  - [ ]* 5.8 Tulis property test untuk `toggleComplete` (Property 7)
    - **Property 7: Task Completion Toggle**
    - Untuk setiap task `t`, verifikasi bahwa setelah `toggleComplete`, `done === !t.done` dan semua field lain tidak berubah
    - **Validates: Requirements 5.5**

  - [ ]* 5.9 Tulis property test untuk `createTask` default priority (Property 8)
    - **Property 8: Default Priority Assignment**
    - Untuk setiap call `createTask(text)` tanpa argumen priority, verifikasi `priority === "medium"`
    - **Validates: Requirements 6.4**

- [-] 6. Checkpoint — Pastikan semua test lulus dan fitur task berfungsi
  - Pastikan task CRUD (tambah, edit, hapus, toggle) berfungsi dengan benar di browser
  - Pastikan data task persisten setelah refresh halaman
  - Pastikan semua property test yang sudah ditulis lulus; tanyakan kepada user jika ada pertanyaan

- [~] 7. TimerModule — countdown, state machine, dan notifikasi
  - [~] 7.1 Implementasikan fungsi pure dan state machine TimerModule
    - Tulis `/* === TIMER === */`
    - Definisikan state: `{ mode: 'focus'|'break', status: 'idle'|'running'|'paused', remaining, duration, startTimestamp, startRemaining, intervalId }`
    - Implementasikan `formatTime(totalSeconds)` — pure: integer → string "MM:SS" dengan padding nol
    - Implementasikan `isValidDuration(value)` — pure: return true jika dan hanya jika numeric dan dalam [1, 180]
    - Implementasikan `getState()` — return snapshot state saat ini
    - _Requirements: 3.1, 4.2, 4.3, 4.4_

  - [~] 7.2 Implementasikan start, stop, reset, dan drift-correction interval
    - Implementasikan `start()` — jika sudah running return early; set `status = 'running'`, catat `startTimestamp = Date.now()` dan `startRemaining`; mulai setInterval 1000ms dengan drift correction (elapsed = floor((now - startTimestamp) / 1000), remaining = startRemaining - elapsed)
    - Implementasikan `stop()` — clearInterval, `status = 'paused'`; tidak mereset nilai remaining
    - Implementasikan `reset()` — clearInterval, `status = 'idle'`, kembalikan remaining ke durasi awal mode saat ini, re-render
    - Implementasikan rendering countdown: update DOM setiap tick
    - _Requirements: 3.2, 3.3, 3.4, 3.9_

  - [~] 7.3 Implementasikan transisi sesi fokus → break dan notifikasi
    - Implementasikan `_handleSessionEnd(mode)` — jika mode `'focus'`: tampilkan toast + playBeep, otomatis mulai countdown break 5 menit; jika mode `'break'`: tampilkan toast + playBeep, kembali ke mode fokus dengan durasi yang dikonfigurasi, stop (tidak auto-start)
    - Implementasikan `init()` — load durasi dari Storage (fallback 25 menit), render timer, attach event listener tombol Start/Stop/Reset
    - _Requirements: 3.5, 3.6, 3.7, 3.8_

  - [~] 7.4 Implementasikan konfigurasi durasi Pomodoro dengan preset dan input bebas
    - Render UI preset durasi: tombol 15, 25, 45, 60 menit
    - Render input angka bebas dengan validasi di UI (tampilkan pesan error jika < 1, > 180, atau non-numerik)
    - Implementasikan `setDuration(minutes)` — validasi via `isValidDuration`, simpan ke Storage, terapkan ke state; tampilkan toast error jika Storage gagal
    - Load durasi tersimpan saat `init()`, gunakan default 25 menit jika tidak ada
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  -
- [ ] 8. QuickLinksModule — CRUD, validasi URL, dan favicon
  - [ ] 8.1 Implementasikan QuickLinksModule dengan validasi dan storage
    - Tulis `/* === QUICK_LINKS === */`
    - Implementasikan `validateURL(str)` — pure: return true jika dan hanya jika string dimulai dengan `"http://"` atau `"https://"`
    - Implementasikan `getFaviconURL(url)` — pure: ekstrak hostname via `new URL(url)`, return Google Favicon Service URL `https://www.google.com/s2/favicons?domain={hostname}&sz=32`; return null jika URL tidak valid
    - Implementasikan `addLink(label, url)` — validasi URL (tampilkan pesan validasi jika gagal), buat QuickLink object `{ id, label, url }`, simpan ke Storage; tampilkan toast error jika Storage gagal (jangan tambahkan ke UI)
    - Implementasikan `deleteLink(id)` — hapus dari array, simpan ke Storage
    - Implementasikan `renderAll()` — render semua link sebagai kartu dengan favicon (`<img onerror>` untuk fallback ke ikon generik), label, dan tombol hapus; buka URL di tab baru saat diklik
    - Implementasikan `init()` — load links dari Storage, render, attach event listener form tambah
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9_


- [ ] 9. Checkpoint MVP — Verifikasi fitur-fitur core berfungsi end-to-end
  - Pastikan Greeting (jam, tanggal, sapaan) berjalan real-time
  - Pastikan TaskModule (tambah, edit, hapus, toggle) bekerja dan data persisten
  - Pastikan TimerModule (start/stop/reset, fokus→break) berfungsi dengan notifikasi
  - Pastikan QuickLinks (tambah, hapus, buka tab baru, favicon) berfungsi
  - Pastikan tidak ada JavaScript error di browser console saat load dan interaksi normal
  - Pastikan semua test lulus; tanyakan kepada user jika ada pertanyaan
  - _Requirements: 19.4_

- [ ] 10. ThemeModule — light/dark toggle dan time-of-day theme
  - [ ] 10.1 Implementasikan ThemeModule dengan toggle light/dark dan persistence
    - Tulis `/* === THEME === */`
    - Implementasikan `getStoredPreference()` — baca dari Storage, return `'light'` atau `'dark'`
    - Implementasikan `savePreference(mode)` — simpan ke Storage
    - Implementasikan `toggle()` — flip `data-theme` attribute di body antara `"light"` dan `"dark"`, simpan preferensi
    - Implementasikan `applyTheme(mode, timeTheme)` — set `data-theme` dan `data-time-theme` pada body
    - Implementasikan `init()` — load preferensi dari Storage (default `'light'`), terapkan tema, attach event listener tombol toggle
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [ ] 10.2 Implementasikan time-of-day theme detection dan auto-update
    - Implementasikan `getTimeTheme(hour)` — pure: `[4–7]→'dawn'`, `[8–16]→'day'`, `[17–19]→'dusk'`, else `'night'`
    - Implementasikan `update(hour)` — panggil `getTimeTheme(hour)`, apply `data-time-theme` ke body jika berbeda dari nilai saat ini; dipanggil oleh ClockModule setiap tick
    - Pastikan time-of-day hanya mengoverride `--gradient-bg` dan `--color-accent`, tidak mengganggu light/dark mode
    - _Requirements: 13.1, 13.2, 13.3, 13.4_


- [ ] 11. SortModule dan integrasi sorting di TaskModule
  - [ ] 11.1 Implementasikan SortModule dengan empat fungsi sort murni
    - Tulis `/* === SORTING === */`
    - Implementasikan `sortByStatus(tasks)` — pure, menggunakan `.slice().sort()`, incomplete first
    - Implementasikan `sortByName(tasks)` — pure, `.slice().sort()` dengan `localeCompare` case-insensitive
    - Implementasikan `sortByNewest(tasks)` — pure, sort berdasarkan `createdAt` descending; task tanpa timestamp di akhir
    - Implementasikan `sortByOldest(tasks)` — pure, sort berdasarkan `createdAt` ascending; task tanpa timestamp di akhir
    - Implementasikan `apply(tasks, mode)` — dispatch ke fungsi yang tepat berdasarkan mode string
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [ ] 11.2 Integrasi SortModule ke TaskModule dengan dropdown UI dan persistence
    - Tambahkan dropdown UI dengan empat opsi: "Status", "A–Z", "Terbaru", "Terlama"
    - Default sort "Terlama" (oldest) saat Dashboard pertama dimuat
    - Saat pengguna mengubah sort, panggil `SortModule.apply()` dan re-render; jangan ubah data asli di Storage
    - Simpan sort mode yang dipilih ke Storage sehingga persisten setelah refresh
    - _Requirements: 8.1, 8.6, 8.7_

- [ ] 12. DragDropModule — HTML5 Drag and Drop reorder
  - [ ] 12.1 Implementasikan DragDropModule dengan pure `reorderArray` dan event handlers
    - Tulis `/* === DRAG_DROP === */`
    - Implementasikan `reorderArray(arr, fromIndex, toIndex)` — pure: gunakan `.slice()`, splice out dan insert, return array baru yang merupakan permutasi dari asli
    - Implementasikan `init(containerEl)` — attach `dragstart`, `dragover`, `drop`, `dragend` event listeners ke container menggunakan event delegation
    - Implementasikan `onDragStart(e)` — simpan dragged task ID ke `dataTransfer`
    - Implementasikan `onDragOver(e)` — `e.preventDefault()`, tampilkan indikator visual posisi drop target
    - Implementasikan `onDrop(e)` — hitung fromIndex dan toIndex, panggil `reorderArray`, update Storage (`tld_task_order`), re-render; jika Storage gagal tampilkan toast dan kembalikan ke urutan sebelumnya
    - Implementasikan `onDragEnd(e)` — hapus semua indikator visual drop target
    - Implementasikan `isValidDrop(target)` — pure: return boolean apakah target adalah posisi drop valid
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_


- [ ] 13. Nama pengguna kustom (Custom Name) di Greeting
  - [ ] 13.1 Implementasikan UI input nama pertama kali dan tombol edit nama
    - Tambahkan ke HTML Greeting widget: elemen untuk menampilkan sapaan, elemen input (awalnya hidden), tombol edit dengan ikon
    - Saat Dashboard dimuat tanpa nama tersimpan: tampilkan input untuk memasukkan nama
    - Saat nama sudah tersimpan: tampilkan sapaan dengan nama dan tombol edit
    - Tombol edit (`enterEditMode`) menampilkan input terisi nama saat ini
    - Simpan: validasi (non-empty setelah trim, ≤50 karakter), simpan ke Storage, exit edit mode
    - Tolak nama kosong setelah trim: pertahankan nama sebelumnya, jangan simpan
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ] 14. QuoteModule dan HabitModule (sidebar)
  - [ ] 14.1 Implementasikan QuoteModule dengan koleksi lokal dan random picker
    - Tulis `/* === QUOTES === */`
    - Definisikan `QuoteModule.QUOTES` — array minimal 10 objek `{ text, author }` hardcoded di JS
    - Implementasikan `getRandomQuote(quotes)` — pure: pilih satu elemen random dari array; jika array kosong return null
    - Implementasikan `init()` — panggil `getRandomQuote`, render teks dan author; jika author tidak ada tampilkan `"— Anonim"`; jika QUOTES kosong tampilkan teks fallback
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ] 14.2 Implementasikan HabitModule dengan mood check-in dan persistence per hari
    - Tulis `/* === HABITS === */`
    - Definisikan 4 emoji mood: `😄 (happy)`, `😐 (neutral)`, `😔 (sad)`, `😤 (frustrated)`
    - Implementasikan `getTodayString()` — pure: return tanggal hari ini dalam format YYYY-MM-DD
    - Implementasikan `isMoodForToday(storedDate)` — pure: return `storedDate === getTodayString()`
    - Implementasikan `selectMood(mood)` — jika mood sama dengan yang aktif, hapus selection (deselect); jika tidak, simpan `{ mood, date: getTodayString() }` ke Storage via `tld_mood_entry`; tampilkan toast error jika gagal; re-render
    - Implementasikan `renderMood(activeMood)` — highlight emoji yang aktif secara visual berbeda dari yang tidak dipilih
    - Implementasikan `init()` — load mood dari Storage, cek `isMoodForToday`; jika hari sama tampilkan mood aktif; jika hari berbeda tampilkan semua tidak aktif
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [ ] 15. Prioritas task dan indikator visual (Priority & Visual)
  - [ ] 15.1 Implementasikan UI pemilihan prioritas saat add dan edit task
    - Tambahkan ke form tambah task: dropdown atau tombol radio untuk pilihan Low/Medium/High
    - Tambahkan ke edit mode task: pilihan prioritas yang terisi nilai saat ini
    - Default ke `"medium"` jika pengguna tidak memilih
    - Pastikan indikator visual (warna badge/border) berbeda untuk setiap level: Low=hijau, Medium=oranye, High=merah
    - Tulis `getPriorityClass(priority)` — pure: return unique non-empty CSS class string untuk setiap priority value
    - Simpan `priority` sebagai bagian dari Task object di Storage
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 16. ExportImportModule — backup dan restore data
  - [ ] 16.1 Implementasikan export data ke file JSON
    - Tulis `/* === EXPORT_IMPORT === */`
    - Definisikan `ExportImportModule.SCHEMA_VERSION = "1.0"`
    - Implementasikan `exportData()` — baca semua data dari StorageService, susun sebagai ExportImport Snapshot Object dengan `schemaVersion`, `exportedAt`, dan `data`; buat Blob JSON, buat object URL, trigger download dengan nama file `dashboard-backup.json`
    - Attach event listener ke tombol Export
    - _Requirements: 16.1_

  - [ ] 16.2 Implementasikan import data dari file JSON dengan validasi dan konfirmasi
    - Implementasikan `validateSchema(obj)` — pure: return true jika obj memiliki `schemaVersion === "1.0"`, field `data` dengan semua sub-field yang diharapkan bertipe benar
    - Implementasikan `importData(file)` — baca file, parse JSON (tampilkan error "Sintaks JSON tidak valid" jika gagal), validasi schema (tampilkan error "Format data tidak sesuai" jika gagal), tampilkan dialog konfirmasi sebelum proses; jika dikonfirmasi gantikan semua Storage dan reload halaman
    - Pastikan Storage tidak berubah jika JSON invalid atau schema tidak sesuai
    - Attach event listener ke tombol Import dengan file picker yang hanya menerima `.json` dan ≤10MB
    - _Requirements: 16.2, 16.3, 16.4, 16.5, 16.6_

- [ ] 17. KeyboardModule — keyboard shortcuts
  - [ ] 17.1 Implementasikan KeyboardModule dengan shortcut N, Escape, Enter, dan Space
    - Tulis `/* === KEYBOARD === */`
    - Implementasikan `handleKey(e)` — dispatch ke modul yang tepat berdasarkan `e.key` dan fokus status:
      - `N` (bukan di input): fokuskan input tambah task baru (`TaskModule`)
      - `Escape` (di input task): blur input tanpa menyimpan
      - `Enter` (di input task berisi teks valid): panggil `addTask`; jika kosong tampilkan validasi
      - `Space` (bukan di input): toggle Start/Stop timer (`TimerModule`)
    - Implementasikan `init()` — attach `keydown` listener ke `document`
    - Pastikan shortcut tidak terpicu saat input/textarea sedang focused (kecuali shortcut yang memang untuk input)
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [ ] 18. AnimationHelpers dan polish visual
  - [ ] 18.1 Implementasikan AnimationHelpers dan pastikan semua CSS animation berfungsi
    - Tulis `/* === ANIMATIONS === */` di `app.js`
    - Implementasikan helper untuk menambah dan menghapus class animasi: `triggerAnimation(el, className)` — tambahkan class, hapus setelah `animationend` event
    - Pastikan `fadeInUp` (400ms, staggered) terpicu saat halaman dimuat pada setiap `.widget`
    - Pastikan `checkboxPop` (250ms) terpicu via `AnimationHelpers` saat `toggleComplete` dipanggil
    - Pastikan `shake` (400ms) terpicu via `AnimationHelpers` saat task duplikat ditolak
    - Pastikan CSS `transition: var(--transition-theme)` (300ms) berjalan saat mode/tema berubah
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [ ] 19. App.init() — wiring semua modul dan inisialisasi
  - [ ] 19.1 Implementasikan `App.init()` untuk menginisialisasi semua modul dalam urutan yang benar
    - Tulis `/* === INIT === */`
    - Panggil modul dalam urutan: `StorageService` (tidak perlu init eksplisit), `NotificationService.requestPermission()`, `ThemeModule.init()`, `ClockModule.init()`, `GreetingModule.init()`, `QuoteModule.init()`, `HabitModule.init()`, `TaskModule.init()`, `TimerModule.init()`, `QuickLinksModule.init()`, `ExportImportModule` (attach listeners), `KeyboardModule.init()`
    - Pastikan `App.init()` dipanggil di `DOMContentLoaded` event atau setelah script defer dieksekusi
    - Pastikan tidak ada JavaScript error atau unhandled promise rejection di console saat load
    - _Requirements: 19.4, 20.4, 20.5_

- [ ] 20. Checkpoint final — Verifikasi lengkap semua fitur dan responsivitas
  - Uji semua fitur: clock, greeting, timer (focus+break+notifikasi), task CRUD, sort, DnD, quick links, light/dark toggle, time-of-day theme, quote, mood, export/import, keyboard shortcuts
  - Verifikasi layout responsif di ketiga breakpoint (desktop, tablet, mobile)
  - Verifikasi semua animasi berjalan (fadeIn, checkboxPop, shake, theme transition)
  - Pastikan tidak ada JavaScript error di console
  - Pastikan semua test (unit + property-based) lulus
  - Tanyakan kepada user jika ada pertanyaan atau fitur yang perlu penyesuaian
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 20.1, 20.2, 20.3, 20.4, 20.5_

---

## Notes

- Task yang ditandai `*` bersifat opsional dan dapat dilewati untuk implementasi MVP yang lebih cepat
- Setiap task mereferensikan requirement spesifik untuk keterlacakan
- Property-based test menggunakan **fast-check** dengan minimum 100 iterasi per property
- Unit test dan property test menggunakan **Vitest** sebagai test runner
- Semua 25 correctness properties dari design document tercakup dalam sub-task test
- Modul JS menggunakan Revealing Module Pattern (objek literal / IIFE) — tidak ada ES modules import/export
- Seluruh kode hanya dalam tiga file statis: `index.html`, `css/style.css`, `js/app.js`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 3, "tasks": ["3.1", "3.2"] },
    { "id": 4, "tasks": ["4.1"] },
    { "id": 5, "tasks": ["4.2"] },
    { "id": 6, "tasks": ["4.3", "4.4", "5.1"] },
    { "id": 7, "tasks": ["5.2"] },
    { "id": 8, "tasks": ["5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "5.9"] },
    { "id": 9, "tasks": ["7.1", "8.1"] },
    { "id": 10, "tasks": ["7.2"] },
    { "id": 11, "tasks": ["7.3"] },
    { "id": 12, "tasks": ["7.4", "7.5", "7.6", "8.2"] },
    { "id": 13, "tasks": ["10.1"] },
    { "id": 14, "tasks": ["10.2"] },
    { "id": 15, "tasks": ["10.3", "10.4", "11.1"] },
    { "id": 16, "tasks": ["11.2"] },
    { "id": 17, "tasks": ["11.3", "11.4", "11.5", "11.6", "12.1"] },
    { "id": 18, "tasks": ["12.2", "13.1"] },
    { "id": 19, "tasks": ["14.1", "14.2", "15.1"] },
    { "id": 20, "tasks": ["14.3", "14.4", "14.5", "15.2"] },
    { "id": 21, "tasks": ["16.1"] },
    { "id": 22, "tasks": ["16.2"] },
    { "id": 23, "tasks": ["16.3", "16.4", "16.5", "17.1"] },
    { "id": 24, "tasks": ["18.1"] },
    { "id": 25, "tasks": ["19.1"] }
  ]
}
```
