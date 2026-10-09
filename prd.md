# PRD — Catatan Ujian Pintar

**Versi:** 1.0  
**Status:** Perencanaan fitur  
**Kategori:** Education / Productivity  
**Platform target:** Android dan PC desktop

## 1. Ringkasan Produk

**Catatan Ujian Pintar** adalah aplikasi belajar yang membantu pelajar mengelola materi, menyusun rangkuman, menyimpan catatan, mengerjakan latihan soal, dan mempersiapkan ujian melalui jadwal belajar yang terstruktur.

Aplikasi menggabungkan tujuh modul utama dalam satu sistem, sehingga pengguna dapat mengatur seluruh proses persiapan ujian dari satu tempat.

### Tujuan utama

- Mempermudah pengelolaan materi belajar dari berbagai sumber.
- Membantu pengguna membuat rangkuman dan catatan secara terorganisasi.
- Menyediakan latihan soal untuk mengukur pemahaman.
- Membantu pengguna membuat jadwal dan memantau progres belajar.
- Menyimpan data belajar dengan aman dan menyediakan akses melalui akun pengguna.
- Memberikan pengalaman penggunaan yang konsisten di Android dan desktop.

## 2. Target Pengguna

| Pengguna | Kebutuhan utama |
|---|---|
| Pelajar SMP/SMA | Memahami materi dan mempersiapkan ujian |
| Mahasiswa | Mengatur materi kuliah, rangkuman, dan latihan |
| Pengguna yang belajar mandiri | Menyusun jadwal serta mengevaluasi progres |
| Pengguna dengan banyak materi | Mengorganisasi file dan catatan dalam satu aplikasi |

## 3. Ruang Lingkup Fitur

### 3.1 Input Materi — Fase 1

- Unggah file materi.
- Tambah materi dari tautan.
- Lihat dan kelola daftar materi yang tersimpan.

**Tujuan:** Menjadi pusat penyimpanan seluruh sumber belajar.

### 3.2 Rangkuman Jadi Catatan — Fase 1

- Rangkuman otomatis.
- Rangkuman gabungan dari beberapa materi.
- Pengaturan gaya atau panjang rangkuman.
- Edit hasil rangkuman sebelum menyimpannya.

**Tujuan:** Mengubah materi panjang menjadi catatan yang mudah dipelajari.

### 3.3 Catatan Saya — Fase 2

- Buat, simpan, edit, dan hapus catatan.
- Kelompokkan catatan berdasarkan mata pelajaran atau kategori.
- Cari catatan berdasarkan judul dan isi.
- Hubungkan catatan dengan materi sumber.

**Tujuan:** Menyediakan perpustakaan catatan pribadi yang mudah dicari.

### 3.4 Soal Latihan — Fase 2

- Buat soal dari materi.
- Tentukan jenis dan jumlah soal.
- Kerjakan soal dan berpindah antarpertanyaan.
- Periksa hasil dan skor.
- Tampilkan jawaban benar serta pembahasan jika tersedia.
- Simpan riwayat latihan.

**Tujuan:** Menguji pemahaman dan mengidentifikasi materi yang perlu dipelajari ulang.

### 3.5 Jadwal Belajar — Fase 3

- Buat, edit, dan hapus jadwal belajar.
- Atur mata pelajaran, waktu, durasi, dan status.
- Atur pengingat harian.
- Tandai sesi belajar sebagai selesai.
- Pantau progres berdasarkan sesi yang diselesaikan.

**Tujuan:** Membantu pengguna belajar konsisten sesuai target ujian.

### 3.6 Akun & Masuk — Fase 4

- Daftar akun.
- Masuk.
- Keluar.
- Validasi data autentikasi.
- Pisahkan data berdasarkan kepemilikan akun.
- Kelola sesi autentikasi dengan aman.

**Tujuan:** Mengelola identitas pengguna dan akses ke data pribadi.

### 3.7 Pengaturan — Fase 4

- Lihat dan edit informasi profil yang diizinkan.
- Ubah tema terang atau gelap.
- Simpan preferensi tampilan.
- Akses panduan penggunaan dan bantuan.

**Tujuan:** Menyesuaikan aplikasi dengan kebutuhan pengguna.

> Catatan: Pembagian fase mengikuti label pada diagram yang diberikan. Urutan implementasi dapat disesuaikan dengan dependensi teknis.

## 4. Functional Requirements

### FR-01 — Input Materi

- **FR-01.1:** Pengguna dapat mengunggah file materi dalam format yang didukung.
- **FR-01.2:** Pengguna dapat memasukkan URL materi.
- **FR-01.3:** Sistem menyimpan judul, sumber, tanggal penambahan, dan lokasi penyimpanan materi.
- **FR-01.4:** Pengguna dapat melihat, mencari, membuka, dan menghapus materi.
- **FR-01.5:** Sistem menampilkan status pemrosesan serta pesan kesalahan jika file gagal diproses.
- **FR-01.6:** Materi yang berhasil ditambahkan dapat digunakan oleh fitur rangkuman dan soal latihan.

**Kriteria penerimaan:** File valid dapat disimpan dan dibuka kembali. File tidak valid menghasilkan pesan kesalahan yang jelas tanpa merusak materi lain.

### FR-02 — Rangkuman Jadi Catatan

- **FR-02.1:** Pengguna dapat memilih satu atau beberapa materi sebagai sumber.
- **FR-02.2:** Pengguna dapat membuat rangkuman secara otomatis.
- **FR-02.3:** Pengguna dapat memilih panjang atau gaya rangkuman.
- **FR-02.4:** Pengguna dapat menggabungkan beberapa sumber dalam satu rangkuman.
- **FR-02.5:** Pengguna dapat mengedit hasil rangkuman sebelum menyimpannya.
- **FR-02.6:** Rangkuman yang disimpan masuk ke Catatan Saya.

**Kriteria penerimaan:** Rangkuman yang dihasilkan tersimpan setelah pengguna mengonfirmasi penyimpanan, dapat dibuka kembali, dan tetap dapat diedit.

### FR-03 — Catatan Saya

- **FR-03.1:** Pengguna dapat membuat catatan secara manual.
- **FR-03.2:** Pengguna dapat mengedit dan menghapus catatan.
- **FR-03.3:** Pengguna dapat mengelompokkan catatan berdasarkan mata pelajaran atau kategori.
- **FR-03.4:** Pengguna dapat mencari berdasarkan judul dan isi catatan.
- **FR-03.5:** Catatan dapat terhubung dengan materi sumber.

**Kriteria penerimaan:** Operasi tambah, baca, edit, hapus, pengelompokan, dan pencarian berfungsi dengan data yang benar.

### FR-04 — Soal Latihan

- **FR-04.1:** Pengguna dapat membuat soal dari materi yang dipilih.
- **FR-04.2:** Pengguna dapat menentukan jenis soal dan jumlah pertanyaan.
- **FR-04.3:** Pengguna dapat menjawab soal dan berpindah antarpertanyaan.
- **FR-04.4:** Sistem menghitung skor berdasarkan kunci jawaban.
- **FR-04.5:** Sistem menampilkan hasil, jawaban benar, dan pembahasan apabila tersedia.
- **FR-04.6:** Sistem menyimpan riwayat latihan untuk melihat perkembangan.

**Kriteria penerimaan:** Skor dihitung sesuai kunci jawaban, jawaban yang dipilih tercatat dengan benar, dan hasil tetap dapat dilihat setelah sesi berakhir.

### FR-05 — Jadwal Belajar

- **FR-05.1:** Pengguna dapat membuat, mengedit, dan menghapus jadwal.
- **FR-05.2:** Jadwal memiliki mata pelajaran, waktu, durasi, dan status.
- **FR-05.3:** Pengguna dapat mengatur pengingat.
- **FR-05.4:** Pengguna dapat menandai sesi belajar sebagai selesai.
- **FR-05.5:** Sistem menghitung progres berdasarkan sesi yang diselesaikan.

**Kriteria penerimaan:** Perubahan jadwal tersimpan, pengingat mengikuti waktu yang ditentukan, dan progres diperbarui setelah sesi selesai.

### FR-06 — Akun & Masuk

- **FR-06.1:** Pengguna dapat membuat akun dan masuk dengan metode autentikasi yang didukung.
- **FR-06.2:** Sistem memvalidasi data masuk dan menampilkan kesalahan yang sesuai.
- **FR-06.3:** Pengguna dapat keluar dari akun.
- **FR-06.4:** Data pengguna dipisahkan berdasarkan kepemilikan akun.
- **FR-06.5:** Sesi autentikasi dikelola secara aman.

**Kriteria penerimaan:** Pengguna hanya dapat mengakses data miliknya sendiri. Pengguna yang sudah keluar tidak dapat membuka fitur terlindungi menggunakan sesi yang telah berakhir.

### FR-07 — Pengaturan

- **FR-07.1:** Pengguna dapat melihat dan mengedit informasi profil yang diizinkan.
- **FR-07.2:** Pengguna dapat mengubah tema terang atau gelap.
- **FR-07.3:** Preferensi tersimpan dan diterapkan ketika aplikasi dibuka kembali.
- **FR-07.4:** Pengguna dapat mengakses panduan penggunaan dan bantuan.
- **FR-07.5:** Pengguna memperoleh pesan yang jelas ketika terjadi masalah.

**Kriteria penerimaan:** Preferensi yang diubah tetap diterapkan setelah aplikasi dimulai ulang, dan halaman bantuan dapat diakses.

## 5. Alur Utama Pengguna

1. **Membuka aplikasi:** Pengguna masuk atau mendaftar akun.
2. **Menambahkan materi:** Pengguna mengunggah file atau memasukkan tautan.
3. **Mengolah materi:** Pengguna membuat rangkuman dan catatan.
4. **Menguji pemahaman:** Pengguna mengerjakan soal latihan dan melihat skor.
5. **Mengevaluasi progres:** Pengguna mengikuti jadwal, menyelesaikan sesi, dan mengulang materi yang belum dikuasai.

## 6. Non-Functional Requirements

| Aspek | Persyaratan |
|---|---|
| Performa | Navigasi umum terasa responsif; operasi berat menampilkan indikator proses |
| Keamanan | Autentikasi aman, akses data berbasis kepemilikan, dan komunikasi terenkripsi |
| Reliabilitas | Kegagalan pemrosesan tidak menghapus data yang sudah tersimpan |
| Usability | Navigasi konsisten, pesan kesalahan mudah dipahami, dan tersedia tampilan kosong yang informatif |
| Kompatibilitas | Mendukung Android dan PC desktop sesuai versi minimum yang ditetapkan |
| Aksesibilitas | Ukuran teks terbaca, kontras memadai, dan kontrol dapat digunakan dengan keyboard pada desktop |
| Pemeliharaan | Kode modular, pengujian otomatis, serta pencatatan error tanpa membocorkan informasi sensitif |
| Privasi | Data pribadi hanya digunakan untuk kebutuhan aplikasi dan dapat dikelola oleh pemiliknya |

**Target performa awal:** Navigasi lokal ditargetkan memiliki waktu respons di bawah 300 ms pada perangkat acuan. Operasi jaringan dan pembuatan rangkuman memiliki target terpisah karena bergantung pada koneksi dan layanan pemrosesan.

## 7. Struktur Data yang Dibutuhkan

Skema berikut adalah rancangan awal dan belum tentu sama dengan struktur database yang sudah ada.

### User

- `id`
- `email`
- `name`
- `created_at`

### Material

- `id`
- `user_id`
- `title`
- `source_type`
- `source_url`
- `file_path`
- `status`
- `created_at`

### Note

- `id`
- `user_id`
- `title`
- `content`
- `subject`
- `source_material_ids`
- `updated_at`

### Quiz & Question

- `quiz_id`
- `user_id`
- `material_id`
- `question_type`
- `question_text`
- `options`
- `correct_answer`
- `explanation`

### Quiz Attempt

- `id`
- `quiz_id`
- `user_id`
- `answers`
- `score`
- `completed_at`

### Study Schedule

- `id`
- `user_id`
- `subject`
- `start_at`
- `duration`
- `reminder_at`
- `status`

### User Preferences

- `user_id`
- `theme`
- `notification_settings`
- `updated_at`

### Relasi utama

- Satu pengguna dapat memiliki banyak materi, catatan, jadwal, dan riwayat latihan.
- Satu materi dapat menjadi sumber beberapa rangkuman dan kuis.
- Satu kuis dapat memiliki banyak pertanyaan dan percobaan pengerjaan.
- Catatan yang dibuat dari rangkuman tetap dapat ditelusuri ke sumbernya.

**Keamanan kuis:** Jawaban benar sebaiknya tidak dikirim ke klien sebelum dibutuhkan agar tidak mudah diakses sebelum latihan selesai.

## 8. Rekomendasi Teknologi

| Komponen | Pilihan yang disarankan |
|---|---|
| Aplikasi | Flutter untuk Android dan desktop |
| Backend | Supabase atau backend API khusus |
| Database | PostgreSQL melalui backend |
| File materi | Penyimpanan file lokal atau object storage |
| Pembuatan rangkuman | Layanan AI yang diakses melalui backend |
| Pengingat | Notifikasi lokal dan dukungan notifikasi sesuai platform |
| Pengujian | Unit test, integration test, dan pengujian manual di Android serta desktop |

**Catatan arsitektur:** Pilihan teknologi final harus mengikuti kode yang sudah ada. Jika aplikasi saat ini dikembangkan menggunakan teknologi web, keputusan apakah akan dimigrasikan atau dibungkus menjadi aplikasi desktop dan Android perlu dibuat sebelum implementasi lebih lanjut.

## 9. Prioritas Pengembangan

### P0 — Fondasi dan Alur Belajar (Wajib MVP)

- Struktur aplikasi.
- Penyimpanan data.
- Input Materi.
- Catatan Saya.
- Autentikasi.
- Penanganan error.

### P1 — Fitur Belajar Inti

- Rangkuman otomatis.
- Pembuatan soal.
- Penilaian.
- Riwayat hasil latihan.

### P2 — Produktivitas Belajar

- Jadwal.
- Pengingat.
- Progres belajar.
- Profil.
- Tema.
- Bantuan.

### P3 — Kesiapan Rilis

- Optimasi performa.
- Penguatan keamanan.
- Pemulihan data.
- Pengujian lintas platform.
- Distribusi aplikasi.

*MVP (Minimum Viable Product) adalah versi pertama yang sudah dapat digunakan untuk menyelesaikan alur belajar utama.*

## 10. Definition of Done

Sebuah fitur dinyatakan selesai apabila:

- [ ] Seluruh fungsi utama bekerja sesuai persyaratan.
- [ ] Data tersimpan dan dapat dibuka kembali.
- [ ] Validasi input serta kondisi gagal sudah ditangani.
- [ ] Loading, error, empty state, dan success state tersedia.
- [ ] Hak akses pengguna telah diuji.
- [ ] Pengujian otomatis dan manual yang relevan telah lulus.
- [ ] Tampilan dan interaksi berjalan di platform yang ditargetkan.
- [ ] Dokumentasi penggunaan serta konfigurasi yang diperlukan tersedia.

## 11. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Rangkuman AI tidak akurat | Izinkan pengeditan, tampilkan sumber, dan minta pengguna memverifikasi informasi |
| File sulit dibaca | Tetapkan format yang didukung dan berikan pesan jika ekstraksi gagal |
| Kebocoran data | Terapkan otorisasi pada backend dan pengujian akses lintas akun |
| Pengingat tidak muncul | Uji izin notifikasi serta perilaku aplikasi di setiap platform |
| Data hilang atau konflik sinkronisasi | Tentukan strategi backup, pemulihan, dan sinkronisasi sejak awal |

### Keputusan yang masih diperlukan

- Format file yang didukung.
- Metode autentikasi.
- Apakah data harus tersinkronisasi antarperangkat.
- Layanan AI yang akan digunakan.
- Teknologi aplikasi yang sudah dipakai.

## 12. Indikator Keberhasilan

Keberhasilan produk dapat diukur setelah aplikasi diuji oleh pengguna melalui metrik berikut:

- Tingkat keberhasilan pengguna menyelesaikan alur materi hingga latihan.
- Persentase materi yang berhasil diproses.
- Tingkat keberhasilan pembuatan dan penyimpanan rangkuman.
- Persentase sesi belajar yang diselesaikan sesuai jadwal.
- Tingkat error dan kehilangan data.
- Retensi pengguna setelah minggu pertama dan bulan pertama.

Nilai target numerik ditetapkan setelah pengujian awal dan pengumpulan data dasar.

## 13. Langkah Berikutnya

1. Validasi PRD ini terhadap proyek yang sudah ada.
2. Tentukan arsitektur teknis berdasarkan teknologi yang digunakan.
3. Buat technical design dan struktur database final.
4. Susun daftar tugas implementasi untuk setiap fitur.
5. Implementasikan fitur berdasarkan prioritas.
6. Jalankan pengujian dan persiapkan distribusi aplikasi Android serta desktop.

---

**Kesimpulan:** Catatan Ujian Pintar dirancang sebagai aplikasi belajar yang menghubungkan pengumpulan materi, pembuatan catatan, latihan soal, dan evaluasi progres dalam satu alur.
