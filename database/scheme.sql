-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'rt', 'kades')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RT/RW table
CREATE TABLE rt_rw (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rt VARCHAR(5) NOT NULL,
  rw VARCHAR(5) NOT NULL,
  jumlah_kk INT NOT NULL,
  ketua_rt VARCHAR(100) NOT NULL,
  nomor_hp VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kategori Sampah
CREATE TABLE kategori_sampah (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_kategori VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jadwal
CREATE TABLE jadwal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rt_rw_id UUID NOT NULL REFERENCES rt_rw(id) ON DELETE CASCADE,
  hari VARCHAR(20) NOT NULL,
  tanggal DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sampah
CREATE TABLE sampah (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rt_rw_id UUID NOT NULL REFERENCES rt_rw(id) ON DELETE CASCADE,
  kategori_id UUID NOT NULL REFERENCES kategori_sampah(id) ON DELETE CASCADE,
  berat DECIMAL(10,2) NOT NULL,
  tanggal DATE NOT NULL,
  petugas VARCHAR(100) NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (nama, email, password, role) VALUES
('Admin Desa', 'admin@desa.id', 'admin123', 'admin'),
('Ketua RT 01', 'rt@desa.id', 'rt123', 'rt'),
('Kepala Desa', 'kades@desa.id', 'kades123', 'kades');

INSERT INTO kategori_sampah (nama_kategori) VALUES
('Organik'),
('Anorganik'),
('B3'),
('Plastik'),
('Kertas');