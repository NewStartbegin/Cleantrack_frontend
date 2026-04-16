import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUser } from '../hooks/useUser';
import { getReports, createSchedule } from '../services/api';

export default function CreateSchedulePage() {
  const navigate = useNavigate();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  const [form, setForm] = useState({
    report_id: '',
    scheduled_date: '',
    scheduled_time: '09:00',
    notes: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'petugas') {
      navigate('/');
      return;
    }

    fetchReports();
  }, [user, navigate]);

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const response = await getReports();
      if (response.success) {
        const pendingReports = (response.data || []).filter(r => r.status !== 'selesai');
        setReports(pendingReports);
      }
    } catch (error) {
      toast.error(error.message || 'Gagal memuat laporan');
    } finally {
      setReportsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.report_id || !form.scheduled_date || !form.scheduled_time) {
      toast.error('Laporan, tanggal, dan jam harus diisi');
      return;
    }

    // Validate date (tidak boleh tanggal kemarin)
    const selectedDate = new Date(form.scheduled_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Tanggal pengangkutan tidak boleh di masa lalu');
      return;
    }

    setLoading(true);
    try {
      const response = await createSchedule({
        report_id: parseInt(form.report_id),
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time,
        notes: form.notes,
        created_by: user.id,
      });

      if (response.success) {
        toast.success('Jadwal pengangkutan berhasil dibuat!');
        navigate('/schedules');
      }
    } catch (error) {
      toast.error(error.message || 'Gagal membuat jadwal');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'petugas') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border-2 border-emerald-200 shadow-lg p-8">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">Buat Jadwal Pengangkutan</h1>
          <p className="text-emerald-700 mb-8">
            Atur jadwal pengangkutan sampah untuk laporan yang masuk
          </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pilih Laporan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Laporan <span className="text-red-500">*</span>
            </label>
            {reportsLoading ? (
              <div className="text-gray-500 py-2">Memuat laporan...</div>
            ) : reports.length > 0 ? (
              <select
                name="report_id"
                value={form.report_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
              >
                <option value="">-- Pilih Laporan --</option>
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.title} ({report.location_address || 'Lokasi tidak ditentukan'})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-gray-500 py-2">Tidak ada laporan yang tersedia</div>
            )}
          </div>

          {/* Tanggal Pengangkutan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Pengangkutan <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="scheduled_date"
              value={form.scheduled_date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
            />
          </div>

          {/* Jam Pengangkutan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jam Pengangkutan <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="scheduled_time"
              value={form.scheduled_time}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Optional)
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleInputChange}
              placeholder="Contoh: Gunakan armada besar, lokasi sulit dijangkau, dll"
              rows="4"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || reportsLoading}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Membuat...' : 'Buat Jadwal'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/schedules')}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              Batal
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
