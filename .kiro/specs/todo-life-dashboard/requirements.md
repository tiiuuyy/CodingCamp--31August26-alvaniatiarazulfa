# Requirements Document

## Introduction

**Todo Life Dashboard** adalah personal life dashboard berbasis web yang berfungsi sebagai "homepage harian" pengguna. Dashboard ini mengintegrasikan jam & sapaan personal, focus timer bergaya Pomodoro, manajemen task, dan akses cepat ke situs favorit dalam satu tampilan bento-grid yang estetis dan responsif. Seluruh data persisten menggunakan Browser Local Storage tanpa backend. Implementasi menggunakan HTML + CSS + Vanilla JavaScript murni.

---

## Glossary

- **Dashboard**: Halaman utama aplikasi yang menampilkan semua widget dalam satu layar.
- **Greeting_Widget**: Komponen yang menampilkan jam, tanggal, sapaan dinamis, dan nama pengguna.
- **Timer**: Komponen focus timer bergaya Pomodoro yang menghitung mundur durasi fokus dan break.
- **Task_Manager**: Komponen yang mengelola daftar task pengguna (tambah, edit, selesai, hapus).
- **Quick_Links**: Komponen yang menyimpan dan menampilkan tautan ke situs favorit pengguna.
- **Theme_Controller**: Komponen yang mengelola mode tampilan (light/dark) dan tema waktu-hari.
- **Storage**: Browser Local Storage API yang digunakan untuk semua data persistence.
- **Notification_Service**: Komponen yang menampilkan notifikasi berbasis Web Notification API atau audio beep.
- **Export_Import_Service**: Komponen yang menangani ekspor dan impor semua data dashboard ke/dari format JSON.
- **Habit_Widget**: Komponen mini mood/habit check-in harian pengguna.
- **Quote_Service**: Komponen yang memilih dan menampilkan kutipan acak dari kumpulan lokal.
- **Task**: Satu item pekerjaan dalam Task_Manager dengan atribut: teks, status selesai, prioritas, tag, dan timestamp pembuatan.
- **Quick_Link**: Satu item tautan dalam Quick_Links dengan atribut: label, URL, dan favicon.
- **Pomodoro_Session**: Satu siklus fokus (default 25 menit) diikuti break (5 menit).

---

## Requirements

### Requirement 1: Real-Time Clock & Greeting

**User Story:** As a pengguna, I want to melihat jam, tanggal, dan sapaan yang sesuai waktu saat ini, so that saya langsung tahu konteks hari saya ketika membuka dashboard.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL menampilkan jam digital dalam format HH:MM:SS yang diperbarui setiap detik.
2. THE Greeting_Widget SHALL menampilkan hari dan tanggal dalam format: [nama hari lengkap dalam Bahasa Indonesia], [tanggal 1–2 digit] [nama bulan lengkap dalam Bahasa Indonesia] [tahun 4 digit] (contoh: "Selasa, 3 September 2026").
3. WHEN jam berada di rentang 05:00–11:59, THE Greeting_Widget SHALL menampilkan sapaan "Selamat pagi".
4. WHEN jam berada di rentang 12:00–14:59, THE Greeting_Widget SHALL menampilkan sapaan "Selamat siang".
5. WHEN jam berada di rentang 15:00–17:59, THE Greeting_Widget SHALL menampilkan sapaan "Selamat sore".
6. WHEN jam berada di rentang 18:00–04:59, THE Greeting_Widget SHALL menampilkan sapaan "Selamat malam".
7. THE Greeting_Widget SHALL menggunakan waktu lokal sistem perangkat pengguna sebagai sumber waktu untuk jam dan sapaan.

---

### Requirement 2: Custom Name in Greeting

**User Story:** As a pengguna, I want to memasukkan nama saya agar sapaan terasa personal, so that dashboard terasa seperti milik saya sendiri.

#### Acceptance Criteria

1. WHEN pengguna membuka Dashboard untuk pertama kali dan nama belum tersimpan di Storage, THE Greeting_Widget SHALL menampilkan input untuk memasukkan nama.
2. WHEN pengguna menyimpan nama, THE Storage SHALL menyimpan nama tersebut sehingga nama dapat dibaca kembali pada sesi berikutnya.
3. WHEN nama tersimpan di Storage, THE Greeting_Widget SHALL menampilkan sapaan dalam format "[Sapaan waktu], [Nama] 👋".
4. IF nama belum tersimpan di Storage, THEN THE Greeting_Widget SHALL menampilkan sapaan generik tanpa nama (contoh: "Selamat pagi 👋").
5. THE Greeting_Widget SHALL menyediakan tombol atau ikon edit agar pengguna dapat mengubah nama kapan saja.
6. WHEN pengguna mengklik tombol edit nama, THE Greeting_Widget SHALL menampilkan input field yang terisi dengan nama saat ini.
7. IF pengguna mencoba menyimpan nama kosong (setelah trimming whitespace), THEN THE Greeting_Widget SHALL menolak penyimpanan dan mempertahankan nama sebelumnya.
8. IF pengguna memasukkan nama yang melebihi 50 karakter, THEN THE Greeting_Widget SHALL menolak input karakter ke-51 dan seterusnya.

---

### Requirement 3: Focus Timer (Pomodoro)

**User Story:** As a pengguna, I want to menggunakan focus timer bergaya Pomodoro, so that saya bisa mengelola waktu kerja dan istirahat dengan terstruktur.

#### Acceptance Criteria

1. THE Timer SHALL menampilkan countdown dalam format MM:SS, di mana MM adalah menit (00–99) dan SS adalah detik (00–59).
2. WHEN pengguna mengklik tombol Start, THE Timer SHALL mulai menghitung mundur dari durasi fokus yang dikonfigurasi, dengan nilai default 25 menit.
3. WHEN pengguna mengklik tombol Stop, THE Timer SHALL menghentikan countdown tanpa mereset nilai, sehingga countdown dapat dilanjutkan dari posisi terakhir saat tombol Start ditekan kembali.
4. WHEN pengguna mengklik tombol Reset, THE Timer SHALL mengembalikan countdown ke durasi awal sesi yang sedang berjalan (fokus atau break) dan menghentikan countdown jika sedang berjalan.
5. WHEN countdown mencapai 00:00 dalam sesi fokus, THE Notification_Service SHALL menampilkan notifikasi teks yang menginformasikan bahwa sesi fokus telah selesai dan memainkan suara beep satu kali.
6. WHEN countdown mencapai 00:00 dalam sesi fokus, THE Timer SHALL secara otomatis memulai countdown break selama 5 menit tanpa memerlukan interaksi pengguna.
7. WHEN countdown break mencapai 00:00, THE Notification_Service SHALL menampilkan notifikasi teks yang menginformasikan bahwa sesi break telah selesai dan memainkan suara beep satu kali.
8. WHEN countdown break mencapai 00:00, THE Timer SHALL menghentikan countdown dan kembali ke mode sesi fokus dengan durasi yang dikonfigurasi tanpa memulai countdown secara otomatis.
9. WHILE Timer berjalan, THE Timer SHALL memperbarui tampilan countdown setiap 1 detik.

---

### Requirement 4: Konfigurasi Durasi Pomodoro

**User Story:** As a pengguna, I want to mengubah durasi focus timer sesuai preferensi saya, so that saya bisa menyesuaikan sesi kerja dengan kebutuhan saya.

#### Acceptance Criteria

1. WHEN pengguna memilih salah satu preset durasi, THE Timer SHALL mengatur durasi fokus menjadi pilihan yang tersedia: 15, 25, 45, dan 60 menit.
2. THE Timer SHALL menyediakan opsi input angka bebas (dalam menit) dengan rentang valid 1–180 menit selain preset yang tersedia.
3. IF pengguna memasukkan durasi kurang dari 1 atau lebih dari 180, THEN THE Timer SHALL menampilkan pesan error validasi dan menolak nilai tersebut.
4. IF pengguna memasukkan nilai non-numerik sebagai durasi, THEN THE Timer SHALL menampilkan pesan error validasi dan menolak nilai tersebut.
5. WHEN pengguna menyimpan durasi baru, THE Storage SHALL menyimpan durasi tersebut agar persisten setelah refresh.
6. WHEN Dashboard dimuat ulang, THE Timer SHALL memuat durasi terakhir yang tersimpan di Storage; IF tidak ada nilai tersimpan, THEN durasi default 25 menit SHALL digunakan.
7. IF penyimpanan durasi ke Storage gagal, THEN THE Timer SHALL menampilkan pesan error dan tetap menggunakan durasi yang sedang aktif.

---

### Requirement 5: Task Management

**User Story:** As a pengguna, I want to mengelola daftar task harian saya, so that saya bisa melacak dan menyelesaikan pekerjaan dengan efisien.

#### Acceptance Criteria

1. THE Task_Manager SHALL menyediakan input field dengan maksimum 200 karakter untuk menambahkan Task baru.
2. IF pengguna mencoba menyimpan Task dengan input kosong atau hanya whitespace, THEN THE Task_Manager SHALL menolak penyimpanan dan menampilkan pesan validasi.
3. WHEN pengguna menambahkan Task baru yang valid, THE Storage SHALL menyimpan Task beserta timestamp pembuatan dalam format ISO 8601.
4. WHEN Dashboard dimuat, THE Task_Manager SHALL menampilkan semua Task yang tersimpan di Storage.
5. WHEN pengguna menandai Task sebagai selesai, THE Task_Manager SHALL memperbarui status Task dan memberikan indikasi visual (strikethrough pada teks Task dan checkbox tercentang).
6. WHEN pengguna mengklik tombol edit pada Task, THE Task_Manager SHALL menampilkan input field dengan maksimum 200 karakter yang terisi teks Task saat ini untuk diubah.
7. WHEN pengguna menyimpan perubahan Task, THE Storage SHALL memperbarui data Task yang sesuai dalam waktu tidak lebih dari 500ms.
8. WHEN pengguna menghapus Task, THE Task_Manager SHALL menghapus Task dari tampilan dan dari Storage.
9. WHEN pengguna melakukan aksi tambah, edit, hapus, atau tandai selesai pada Task, THE Storage SHALL memperbarui data yang tersimpan dalam waktu tidak lebih dari 500ms.

---

### Requirement 6: Prioritas dan Tag Task

**User Story:** As a pengguna, I want to memberikan prioritas pada setiap task, so that saya bisa fokus pada pekerjaan yang paling penting.

#### Acceptance Criteria

1. THE Task_Manager SHALL menyediakan tepat tiga pilihan prioritas — Low, Medium, dan High — saat menambah atau mengedit Task, dengan Medium sebagai nilai default jika pengguna tidak memilih.
2. WHEN Task ditambahkan atau diedit, THE Task_Manager SHALL menampilkan indikator visual yang berbeda untuk setiap level prioritas (Low, Medium, High) pada kartu atau baris Task yang bersangkutan.
3. THE Task_Manager SHALL menyimpan atribut prioritas sebagai bagian dari data Task di Storage, sehingga nilai prioritas tetap sama setelah halaman di-refresh atau sesi ditutup dan dibuka kembali.
4. IF pengguna menyimpan Task tanpa memilih prioritas, THEN THE Task_Manager SHALL menetapkan nilai prioritas secara otomatis menjadi Medium dan menyimpannya ke Storage.
5. WHEN pengguna mengubah prioritas sebuah Task yang sudah tersimpan, THE Task_Manager SHALL memperbarui indikator visual dan nilai yang tersimpan di Storage dalam waktu tidak lebih dari 1 detik setelah perubahan dikonfirmasi.

---

### Requirement 7: Pencegahan Task Duplikat

**User Story:** As a pengguna, I want to mendapat peringatan ketika menambah task yang sudah ada, so that daftar task saya tetap bersih dan tidak redundan.

#### Acceptance Criteria

1. IF pengguna mencoba menambahkan Task dengan teks yang identik secara case-insensitive dan setelah trimming whitespace dengan Task yang sudah ada dalam daftar yang sama, THEN THE Task_Manager SHALL menolak penambahan Task tersebut dan mempertahankan input field dengan teks yang dimasukkan pengguna.
2. IF penambahan Task ditolak karena duplikat, THEN THE Task_Manager SHALL menampilkan toast notification yang menginformasikan bahwa Task sudah ada, dan notification tersebut hilang secara otomatis setelah 3 detik.
3. THE Task_Manager SHALL menampilkan feedback duplikat tanpa menggunakan fungsi `alert()` bawaan browser.

---

### Requirement 8: Sorting Task

**User Story:** As a pengguna, I want to mengurutkan daftar task sesuai preferensi saya, so that saya bisa melihat task yang paling relevan di bagian atas.

#### Acceptance Criteria

1. THE Task_Manager SHALL menyediakan dropdown yang berisi tepat empat opsi urutan tampilan: "Status", "A–Z", "Terbaru", dan "Terlama".
2. WHEN pengguna memilih opsi "Status", THE Task_Manager SHALL menampilkan Task yang belum selesai di atas Task yang sudah selesai; Task dalam kelompok yang sama diurutkan berdasarkan urutan asli penambahan.
3. WHEN pengguna memilih opsi "A–Z", THE Task_Manager SHALL menampilkan Task diurutkan secara alfabetikal berdasarkan teks Task secara case-insensitive dari A hingga Z.
4. WHEN pengguna memilih opsi "Terbaru", THE Task_Manager SHALL menampilkan Task diurutkan berdasarkan timestamp pembuatan dari yang terbaru ke yang terlama; Task tanpa timestamp SHALL ditempatkan di bagian akhir.
5. WHEN pengguna memilih opsi "Terlama", THE Task_Manager SHALL menampilkan Task diurutkan berdasarkan timestamp pembuatan dari yang terlama ke yang terbaru; Task tanpa timestamp SHALL ditempatkan di bagian akhir.
6. WHEN Dashboard dimuat untuk pertama kali, THE Task_Manager SHALL menampilkan Task dalam urutan default "Terlama" (urutan asli penambahan).
7. WHEN pengguna mengubah opsi sorting, THE Task_Manager SHALL memperbarui urutan tampilan Task tanpa mengubah data asli di Storage.

---

### Requirement 9: Drag-and-Drop Reorder Task

**User Story:** As a pengguna, I want to mengurutkan task secara manual dengan drag-and-drop, so that saya bisa mengatur urutan prioritas sesuai keinginan saya sendiri.

#### Acceptance Criteria

1. THE Task_Manager SHALL mendukung drag-and-drop reordering menggunakan native HTML5 Drag and Drop API, di mana setiap Task berfungsi sebagai drag source dan setiap posisi dalam daftar berfungsi sebagai drop target.
2. WHEN pengguna menggeser Task ke posisi baru, THE Task_Manager SHALL memperbarui urutan tampilan dalam waktu tidak lebih dari 100ms dan menampilkan indikator visual posisi drop target yang valid.
3. WHEN pengguna melepaskan Task di posisi baru yang valid, THE Storage SHALL menyimpan urutan baru sehingga urutan tetap sama setelah halaman di-refresh.
4. IF pengguna melepaskan Task di luar area daftar Task yang valid, THEN THE Task_Manager SHALL membatalkan drag dan mengembalikan Task ke posisi semula.
5. IF penyimpanan urutan baru ke Storage gagal, THEN THE Task_Manager SHALL menampilkan pesan error dan mengembalikan urutan tampilan ke posisi sebelum drag dilakukan.

---

### Requirement 10: Progress Stats

**User Story:** As a pengguna, I want to melihat ringkasan progres task saya, so that saya termotivasi dan tahu seberapa banyak yang sudah selesai.

#### Acceptance Criteria

1. THE Task_Manager SHALL menampilkan jumlah Task yang belum selesai.
2. THE Task_Manager SHALL menampilkan persentase Task yang sudah selesai dari total Task, dibulatkan ke bilangan bulat terdekat.
3. THE Task_Manager SHALL menampilkan indikator visual (progress ring atau progress bar) yang merepresentasikan persentase penyelesaian.
4. WHEN jumlah atau status Task berubah, THE Task_Manager SHALL memperbarui semua indikator progres dalam waktu tidak lebih dari 500ms.
5. IF tidak ada Task dalam daftar, THEN THE Task_Manager SHALL menampilkan 0 task belum selesai, persentase 0%, dan indikator visual dalam keadaan kosong (0% terisi).

---

### Requirement 11: Quick Links

**User Story:** As a pengguna, I want to menyimpan dan mengakses tautan ke situs favorit saya dengan cepat, so that saya tidak perlu mengetik URL berulang kali.

#### Acceptance Criteria

1. WHEN Dashboard dimuat, THE Quick_Links SHALL menampilkan semua Quick_Link yang tersimpan di Storage.
2. THE Quick_Links SHALL menyediakan form untuk menambahkan Quick_Link baru dengan input label (maksimum 50 karakter) dan URL.
3. IF pengguna memasukkan URL yang tidak dimulai dengan "http://" atau "https://", THEN THE Quick_Links SHALL menampilkan pesan validasi dan menolak penyimpanan.
4. WHEN pengguna menambahkan Quick_Link baru yang valid, THE Storage SHALL menyimpan data Quick_Link tersebut.
5. WHEN pengguna mengklik Quick_Link, THE Dashboard SHALL membuka URL tersebut di tab baru.
6. THE Quick_Links SHALL menampilkan favicon dari domain Quick_Link menggunakan layanan favicon berbasis URL domain (client-side, tanpa backend); IF favicon gagal dimuat, THEN THE Quick_Links SHALL menampilkan ikon generik sebagai fallback.
7. THE Quick_Links SHALL menyediakan opsi untuk menghapus Quick_Link yang sudah tersimpan.
8. WHEN pengguna menghapus Quick_Link, THE Storage SHALL memperbarui data yang tersimpan.
9. IF penyimpanan Quick_Link baru ke Storage gagal, THEN THE Quick_Links SHALL menampilkan pesan error dan tidak menambahkan Quick_Link ke tampilan.

---

### Requirement 12: Light / Dark Mode

**User Story:** As a pengguna, I want to beralih antara tampilan terang dan gelap, so that saya nyaman menggunakan dashboard di berbagai kondisi cahaya.

#### Acceptance Criteria

1. THE Theme_Controller SHALL menyediakan toggle switch dengan ikon matahari (light mode) dan bulan (dark mode) di header.
2. WHEN pengguna mengklik toggle, THE Theme_Controller SHALL beralih antara light mode dan dark mode.
3. THE Theme_Controller SHALL mengubah warna semua komponen Dashboard secara konsisten saat mode berubah, sehingga tidak ada komponen yang tertinggal menggunakan warna mode sebelumnya.
4. WHEN mode berubah, THE Dashboard SHALL menampilkan transisi warna dalam durasi tidak lebih dari 300ms.
5. WHEN pengguna mengubah mode, THE Storage SHALL menyimpan preferensi mode tersebut.
6. WHEN Dashboard dimuat ulang, THE Theme_Controller SHALL memuat preferensi mode terakhir dari Storage; IF tidak ada preferensi tersimpan, THEN light mode SHALL digunakan sebagai default.
7. WHEN Dashboard dimuat untuk pertama kali tanpa preferensi tersimpan, THE Theme_Controller SHALL menampilkan Dashboard dalam light mode.

---

### Requirement 13: Dynamic Time-of-Day Theme

**User Story:** As a pengguna, I want to melihat tampilan dashboard yang berubah sesuai waktu hari, so that dashboard terasa hidup dan kontekstual.

#### Acceptance Criteria

1. THE Theme_Controller SHALL mengubah gradient background dan warna aksen secara otomatis berdasarkan waktu hari: dawn (04:00–07:59), day (08:00–16:59), dusk (17:00–19:59), dan night (20:00–03:59).
2. WHEN waktu hari berubah ke periode berikutnya, THE Theme_Controller SHALL mendeteksi perubahan dan menerapkan tema yang sesuai dalam waktu tidak lebih dari 60 detik setelah pergantian periode.
3. WHILE light/dark mode aktif, THE Theme_Controller SHALL menerapkan gradient dan warna aksen berbasis waktu tanpa mengubah atribut kecerahan (lightness) yang ditentukan oleh preferensi light/dark mode pengguna.
4. WHEN Dashboard dimuat, THE Theme_Controller SHALL menerapkan tema waktu yang sesuai dengan waktu saat ini dalam waktu tidak lebih dari 1 detik setelah halaman selesai dimuat.

---

### Requirement 14: Kutipan Harian (Daily Quote)

**User Story:** As a pengguna, I want to melihat kutipan inspiratif setiap kali membuka dashboard, so that saya mendapat motivasi di awal hari.

#### Acceptance Criteria

1. THE Quote_Service SHALL menyimpan kumpulan minimal 10 kutipan secara lokal di dalam kode JavaScript, tanpa memerlukan koneksi internet.
2. WHEN Dashboard dimuat, THE Quote_Service SHALL memilih satu kutipan secara acak dari kumpulan lokal dan menampilkannya.
3. THE Dashboard SHALL menampilkan kutipan beserta nama pengarang atau sumber kutipan; IF pengarang atau sumber tidak diketahui, THEN teks "— Anonim" SHALL ditampilkan sebagai pengganti.
4. IF kumpulan kutipan tidak tersedia atau kosong, THEN THE Quote_Service SHALL menampilkan teks fallback default tanpa error.

---

### Requirement 15: Mini Habit / Mood Check-In

**User Story:** As a pengguna, I want to mencatat mood harian saya dengan cepat, so that saya bisa melacak pola perasaan saya dari hari ke hari.

#### Acceptance Criteria

1. THE Habit_Widget SHALL menampilkan tepat empat pilihan mood menggunakan emoji: 😄 (Senang), 😐 (Biasa), 😔 (Sedih), 😤 (Frustrasi).
2. WHEN pengguna memilih emoji mood, THE Storage SHALL menyimpan pilihan mood beserta tanggal hari ini dalam format YYYY-MM-DD.
3. WHEN pengguna memilih emoji mood yang sudah aktif, THE Habit_Widget SHALL menghapus pilihan mood yang tersimpan dan menampilkan semua emoji dalam keadaan tidak aktif.
4. WHEN Dashboard dimuat pada hari yang sama dengan mood terakhir tersimpan (tanggal Storage sama dengan tanggal hari ini), THE Habit_Widget SHALL menampilkan emoji yang sesuai dengan mood tersimpan dalam keadaan aktif (tersorot secara visual berbeda dari emoji yang tidak dipilih).
5. WHEN hari berganti (tanggal hari ini berbeda dengan tanggal mood tersimpan), THE Habit_Widget SHALL menampilkan semua emoji dalam keadaan tidak aktif.
6. IF penyimpanan mood ke Storage gagal, THEN THE Habit_Widget SHALL menampilkan pesan error singkat dan tetap menampilkan pilihan mood yang dapat diinteraksi.

---

### Requirement 16: Export dan Import Data

**User Story:** As a pengguna, I want to mengekspor dan mengimpor semua data dashboard saya, so that saya bisa mem-backup data atau memindahkannya ke perangkat lain.

#### Acceptance Criteria

1. WHEN pengguna mengklik tombol Export, THE Export_Import_Service SHALL membuat file JSON yang berisi seluruh data dari Storage dan mengunduhnya ke perangkat pengguna dengan nama file `dashboard-backup.json`.
2. THE Export_Import_Service SHALL menyediakan tombol Import yang membuka file picker yang hanya menerima file dengan ekstensi `.json` dan ukuran maksimum 10 MB.
3. WHEN pengguna memilih file untuk diimpor, THE Export_Import_Service SHALL menampilkan dialog konfirmasi yang menginformasikan bahwa semua data yang ada akan digantikan sebelum melanjutkan proses impor.
4. WHEN pengguna mengkonfirmasi impor file JSON yang valid secara sintaks dan sesuai dengan skema data aplikasi, THE Export_Import_Service SHALL menggantikan semua data Storage dengan data dari file tersebut dan memuat ulang Dashboard.
5. IF file yang diimpor bukan JSON yang valid secara sintaks, THEN THE Export_Import_Service SHALL menampilkan pesan error yang menyebutkan kegagalan sintaks, dan Storage SHALL tetap tidak berubah.
6. IF file JSON yang diimpor valid secara sintaks tetapi tidak sesuai dengan skema data aplikasi, THEN THE Export_Import_Service SHALL menampilkan pesan error yang menyebutkan ketidaksesuaian skema, dan Storage SHALL tetap tidak berubah.

---

### Requirement 17: Keyboard Shortcuts

**User Story:** As a pengguna, I want to menggunakan keyboard shortcut untuk aksi umum, so that saya bisa mengoperasikan dashboard lebih cepat tanpa bergantung pada mouse.

#### Acceptance Criteria

1. WHEN pengguna menekan tombol `N` dan tidak ada input field yang sedang dalam kondisi focused, THE Task_Manager SHALL memfokuskan input field untuk menambah Task baru.
2. WHEN pengguna menekan tombol `Escape` saat input field Task baru sedang focused, THE Task_Manager SHALL menghapus fokus dari input field tanpa menyimpan Task.
3. WHEN pengguna menekan tombol `Enter` di dalam input Task yang berisi teks valid (tidak kosong setelah trimming whitespace), THE Task_Manager SHALL menyimpan Task yang sedang diisi.
4. IF pengguna menekan tombol `Enter` di dalam input Task yang kosong atau hanya berisi whitespace, THEN THE Task_Manager SHALL menampilkan pesan validasi dan tidak menyimpan Task.
5. WHEN pengguna menekan tombol `Space` dan tidak ada input field yang sedang dalam kondisi focused, THE Timer SHALL beralih dari kondisi berjalan ke berhenti (Stop) jika Timer sedang berjalan, atau dari kondisi berhenti ke berjalan (Start) jika Timer sedang berhenti.

---

### Requirement 18: Micro-Animations dan Visual Polish

**User Story:** As a pengguna, I want to merasakan animasi halus pada interaksi UI, so that dashboard terasa premium dan responsif.

#### Acceptance Criteria

1. WHEN Dashboard selesai dimuat, THE Dashboard SHALL menampilkan animasi fade-in pada setiap kartu widget dengan durasi antara 200ms dan 600ms.
2. WHEN pengguna menandai Task sebagai selesai, THE Task_Manager SHALL menampilkan animasi scale (pop) pada checkbox dengan durasi antara 150ms dan 400ms.
3. WHEN mode atau tema berubah, THE Dashboard SHALL menampilkan transisi warna dengan durasi antara 200ms dan 300ms menggunakan CSS transition.
4. WHEN Task duplikat ditolak, THE Task_Manager SHALL menampilkan animasi shake pada input field Task dengan durasi antara 300ms dan 500ms.

---

### Requirement 19: Bento-Grid Layout dan Responsivitas

**User Story:** As a pengguna, I want to melihat semua widget tersusun dalam layout yang bersih dan rapi, so that saya bisa mengakses semua fitur tanpa scrolling berlebih.

#### Acceptance Criteria

1. THE Dashboard SHALL mengimplementasikan bento-grid layout menggunakan CSS Grid untuk menampilkan semua widget (Greeting_Widget, Timer, Task_Manager, Quick_Links) secara bersamaan dalam satu viewport tanpa memerlukan scroll vertikal pada resolusi desktop (lebar ≥ 1024px).
2. THE Dashboard SHALL menampilkan seluruh widget dalam tata letak satu kolom yang dapat di-scroll pada resolusi mobile (lebar < 768px), di mana setiap widget merender kontennya dan merespons interaksi pengguna.
3. THE Dashboard SHALL menampilkan seluruh widget dalam tata letak dua kolom pada resolusi tablet (768px ≤ lebar < 1024px), di mana setiap widget merender kontennya dan merespons interaksi pengguna.
4. THE Dashboard SHALL tidak menghasilkan JavaScript error atau unhandled promise rejection pada browser console selama proses pemuatan halaman dan penggunaan normal.

---

### Requirement 20: Kualitas Kode dan Struktur File

**User Story:** As a developer, I want to memiliki kode yang terstruktur dan mudah dibaca, so that proyek mudah dipelihara dan dikembangkan lebih lanjut.

#### Acceptance Criteria

1. THE Dashboard SHALL diimplementasikan dalam struktur file: `todo-life-dashboard/index.html`, `css/style.css`, dan `js/app.js`.
2. THE Dashboard SHALL menggunakan HTML, CSS, dan Vanilla JavaScript murni tanpa framework atau library eksternal.
3. THE Dashboard SHALL dapat dijalankan langsung di browser modern (Chrome, Firefox, Edge, Safari) tanpa proses build atau server backend.
4. THE Dashboard SHALL memiliki minimal satu komentar section header per blok fungsional yang berbeda di file CSS dan JavaScript (contoh: `/* === TIMER === */`, `/* === TODO === */`).
5. THE Dashboard SHALL menggunakan penamaan variabel dan fungsi dalam format camelCase dengan panjang nama antara 2 dan 50 karakter.
