# CleanTrack Frontend

Frontend React + Vite untuk aplikasi CleanTrack (Pelaporan Sampah Liar).

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- npm atau yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file**
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. **Jalankan development server**
   ```bash
   npm run dev
   ```

   Frontend akan berjalan di `http://localhost:5173`

## 📁 Struktur Folder

```
cleantrack-frontend/
├── src/
│   ├── components/        # Reusable components
│   ├── pages/             # Page components
│   ├── services/          # API service
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── package.json
```

## 🎨 Fitur Aplikasi

### Halaman Utama (HomePage)
- Daftar semua laporan dengan thumbnail foto
- Filter berdasarkan status (Pending, Diproses, Selesai)
- Tombol buat laporan (untuk user yang sudah login)

### Login & Registrasi (LoginPage)
- Form login dengan email & password
- Form registrasi dengan nama, email, password, dan role
- Role dapat dipilih: Warga atau Petugas

### Buat Laporan (CreateReportPage)
- Form input laporan (judul, deskripsi, alamat)
- Input koordinat (latitude, longitude)
- Upload foto dengan preview
- Auto upload foto ke S3 saat submit

### Detail Laporan (ReportDetailPage)
- Tampilkan semua detail laporan
- Foto dalam ukuran besar
- Untuk Petugas: tombol update status dan hapus laporan

### Peta Lokasi (MapPage)
- Tampilkan semua laporan di peta interaktif
- Marker untuk setiap laporan
- Popup dengan informasi singkat
- Klik untuk melihat detail

### Navbar
- Logo dan nama aplikasi
- Link navigasi (Beranda, Peta)
- User info jika sudah login
- Tombol logout

## 🛠️ Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v3
- **Routing:** React Router DOM v6
- **HTTP Client:** axios
- **Notifications:** react-hot-toast
- **Maps:** Leaflet + react-leaflet

## 📡 API Integration

Semua API calls dilakukan melalui `src/services/api.js`:

- `login(credentials)` - Login user
- `register(userData)` - Registrasi user baru
- `getReports()` - Get semua laporan
- `getReportById(id)` - Get detail laporan
- `createReport(data)` - Buat laporan baru
- `updateReportStatus(id, status)` - Update status
- `deleteReport(id)` - Hapus laporan
- `uploadPhoto(formData)` - Upload foto ke S3

## 🔒 Authentication

- User data disimpan di localStorage
- Halaman protected: CreateReportPage (redirect ke login jika belum auth)
- Logout akan menghapus user dari localStorage

## 🎯 Development Tips

### Format dan Style
- Semua styling menggunakan Tailwind CSS
- Color scheme: hijau (primary), slate (background)
- Responsive design untuk mobile, tablet, desktop

### State Management
- Menggunakan React useState
- API calls dengan axios
- Error handling dengan toast notifications

### Deployment
```bash
npm run build
```
Output akan di folder `dist/` dan siap di-deploy ke static hosting (Vercel, Netlify, GitHub Pages, dsb).

## 📝 Environment Variables

```env
VITE_API_URL=http://localhost:3000
```

Untuk production, ubah menjadi URL backend production Anda.

## 🐛 Troubleshooting

### CORS Error
- Pastikan backend CORS sudah dikonfigurasi dengan benar
- Check FRONTEND_URL di backend .env

### API 404
- Pastikan backend server sudah running
- Verify VITE_API_URL di frontend .env

### Peta tidak tampil
- Check browser console untuk error Leaflet
- Pastikan Leaflet CSS sudah ter-import

## 📄 License
MIT
