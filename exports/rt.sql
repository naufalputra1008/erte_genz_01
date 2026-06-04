PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE profil_rt (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      nama_rt TEXT NOT NULL,
      nama_rw TEXT NOT NULL,
      kelurahan TEXT NOT NULL,
      kecamatan TEXT NOT NULL,
      kota TEXT NOT NULL,
      ketua TEXT NOT NULL,
      sekretaris TEXT NOT NULL,
      bendahara TEXT NOT NULL,
      visi TEXT NOT NULL,
      misi TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
INSERT INTO profil_rt VALUES(1,'RT 01 Taman Balaraja','RW 01','Taman Balaraja','Parahu','Sukamulya, Kabupaten Tangerang','Bapak H. Jasmani','Imam Ahmad Ridho','Naufal Putra','Menjadi RT yang harmonis, transparan, dan peduli terhadap seluruh warga dengan semangat gotong royong.',replace('1. Meningkatkan keharmonisan antarwarga\n2. Mengelola keuangan RT secara transparan\n3. Mengadakan kegiatan sosial rutin\n4. Menjaga keamanan dan ketertiban lingkungan\n5. Mendorong partisipasi aktif seluruh warga','\n',char(10)),'2026-05-30T08:16:12.822Z');
CREATE TABLE kegiatan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      judul TEXT NOT NULL,
      deskripsi TEXT NOT NULL,
      tanggal TEXT NOT NULL,
      lokasi TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('rencana', 'berlangsung', 'selesai')),
      created_at TEXT NOT NULL
    , detail TEXT NOT NULL DEFAULT '');
INSERT INTO kegiatan VALUES(1,'Kerja Bakti Bulanan','Membersihkan lingkungan RT dan saluran air','2026-06-07','Lapangan RT','rencana','2026-05-30T07:51:52.722Z','');
INSERT INTO kegiatan VALUES(2,'Rapat Warga Triwulan','Pembahasan program kerja dan laporan keuangan','2026-06-14','Balai RT','rencana','2026-05-30T07:51:52.722Z','');
INSERT INTO kegiatan VALUES(3,'Posyandu Balita','Pemeriksaan kesehatan balita dan imunisasi','2026-06-01','Balai RT','berlangsung','2026-05-30T07:51:52.722Z','');
INSERT INTO kegiatan VALUES(4,'Pembagian Sembako','Bantuan sembako untuk warga yang membutuhkan','2026-05-20','Balai RT','selesai','2026-05-30T07:51:52.722Z','');
CREATE TABLE warga (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      alamat TEXT NOT NULL,
      no_hp TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('aktif', 'pindah')),
      created_at TEXT NOT NULL
    );
INSERT INTO warga VALUES(1,'Ahmad Suryadi','Jl. Merdeka No. 1','081234567890','aktif','2026-05-30T07:51:52.722Z');
INSERT INTO warga VALUES(2,'Siti Rahayu','Jl. Merdeka No. 2','081234567891','aktif','2026-05-30T07:51:52.722Z');
INSERT INTO warga VALUES(3,'Budi Santoso','Jl. Merdeka No. 3','081234567892','aktif','2026-05-30T07:51:52.722Z');
INSERT INTO warga VALUES(4,'Dewi Lestari','Jl. Merdeka No. 4','081234567893','aktif','2026-05-30T07:51:52.722Z');
INSERT INTO warga VALUES(5,'Eko Prasetyo','Jl. Merdeka No. 5','081234567894','aktif','2026-05-30T07:51:52.722Z');
INSERT INTO warga VALUES(6,'Fitri Handayani','Jl. Merdeka No. 6','081234567895','aktif','2026-05-30T07:51:52.722Z');
INSERT INTO warga VALUES(7,'Gunawan Wijaya','Jl. Merdeka No. 7','081234567896','pindah','2026-05-30T07:51:52.722Z');
CREATE TABLE keuangan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jenis TEXT NOT NULL CHECK (jenis IN ('pemasukan', 'pengeluaran')),
      kategori TEXT NOT NULL,
      deskripsi TEXT NOT NULL,
      jumlah INTEGER NOT NULL,
      tanggal TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
INSERT INTO keuangan VALUES(1,'pemasukan','Iuran Warga','Iuran bulan Mei 2026',2500000,'2026-05-05','2026-05-30T07:51:52.722Z');
INSERT INTO keuangan VALUES(2,'pemasukan','Donasi','Donasi dari alumni RT',500000,'2026-05-10','2026-05-30T07:51:52.722Z');
INSERT INTO keuangan VALUES(3,'pengeluaran','Kebersihan','Bayar tukang sampah bulan Mei',400000,'2026-05-08','2026-05-30T07:51:52.722Z');
INSERT INTO keuangan VALUES(4,'pengeluaran','Kegiatan','Biaya kerja bakti (snack & alat)',350000,'2026-05-15','2026-05-30T07:51:52.722Z');
INSERT INTO keuangan VALUES(5,'pemasukan','Iuran Warga','Iuran bulan April 2026',2300000,'2026-04-05','2026-05-30T07:51:52.722Z');
INSERT INTO keuangan VALUES(6,'pengeluaran','Perbaikan','Perbaikan pagar balai RT',1200000,'2026-04-20','2026-05-30T07:51:52.722Z');
CREATE TABLE kegiatan_foto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kegiatan_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (kegiatan_id) REFERENCES kegiatan(id) ON DELETE CASCADE
    );
INSERT INTO kegiatan_foto VALUES(1,2,'2-1780128519625.jpeg','WhatsApp Image 2026-05-29 at 08.37.53.jpeg',326395,'2026-05-30T08:08:39.626Z');
CREATE TABLE otp_session (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
INSERT INTO otp_session VALUES('fcd94a2aa7cf7a6f4d59a331c1f87f8247c207802191d17980e733ace7472a1a','admin@tamanbalaraja.rt','d68d7231622483def3c361041aaaf004c3e5641822a4e957b9a50fe50a975614','2026-05-30T08:32:39.192Z',0,'2026-05-30T08:27:39.192Z');
CREATE TABLE admin_session (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('kegiatan',4);
INSERT INTO sqlite_sequence VALUES('warga',7);
INSERT INTO sqlite_sequence VALUES('keuangan',6);
INSERT INTO sqlite_sequence VALUES('kegiatan_foto',1);
COMMIT;
