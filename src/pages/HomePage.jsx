import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ReportCard from '../components/ReportCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useUser } from '../hooks/useUser';
import { getReports, getSchedules } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const user = useUser();

  useEffect(() => {
    if (user?.role === 'petugas') {
      fetchSchedules();
    } else {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await getReports();
      if (response.success) {
        setReports(response.data || []);
      }
    } catch (error) {
      toast.error(error.message || 'Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const [reportsRes, schedulesRes] = await Promise.all([
        getReports(),
        getSchedules(),
      ]);
      if (reportsRes.success) setReports(reportsRes.data || []);
      if (schedulesRes.success) setSchedules(schedulesRes.data || []);
    } catch (error) {
      toast.error(error.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports =
    selectedStatus === 'all'
      ? reports
      : reports.filter((report) => report.status === selectedStatus);

  const getDaysUntil = (scheduledDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduled = new Date(scheduledDate);
    scheduled.setHours(0, 0, 0, 0);
    const diffTime = scheduled - today;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const todaySchedules = schedules.filter(s => {
    const daysUntil = getDaysUntil(s.scheduled_date);
    return daysUntil === 0 && s.status === 'pending';
  });

  const pendingSchedules = schedules.filter(s => s.status === 'pending');
  const completedSchedules = schedules.filter(s => s.status === 'selesai');

  if (loading) {
    return <LoadingSpinner />;
  }

  // Dashboard untuk PETUGAS
  if (user?.role === 'petugas') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-emerald-900 mb-2">
              Dashboard Petugas
            </h1>
            <p className="text-emerald-700">
              Selamat datang, <span className="font-semibold">{user.name}</span>
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border-2 border-emerald-200 shadow-sm hover:shadow-md transition">
              <div className="text-sm text-emerald-600 font-semibold mb-2">Total Jadwal</div>
              <div className="text-3xl font-bold text-emerald-900">{schedules.length}</div>
              <p className="text-xs text-emerald-500 mt-2">Semua jadwal pengangkutan</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border-2 border-orange-200 shadow-sm hover:shadow-md transition">
              <div className="text-sm text-orange-600 font-semibold mb-2">Jadwal Hari Ini</div>
              <div className="text-3xl font-bold text-orange-600">{todaySchedules.length}</div>
              <p className="text-xs text-orange-500 mt-2">Perlu dikerjakan segera</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border-2 border-yellow-200 shadow-sm hover:shadow-md transition">
              <div className="text-sm text-yellow-600 font-semibold mb-2">Menunggu Proses</div>
              <div className="text-3xl font-bold text-yellow-600">{pendingSchedules.length}</div>
              <p className="text-xs text-yellow-500 mt-2">Jadwal mendatang</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border-2 border-green-200 shadow-sm hover:shadow-md transition">
              <div className="text-sm text-green-600 font-semibold mb-2">Selesai</div>
              <div className="text-3xl font-bold text-green-600">{completedSchedules.length}</div>
              <p className="text-xs text-green-500 mt-2">Sudah diambil</p>
            </div>
          </div>

          {/* Jadwal Hari Ini */}
          {todaySchedules.length > 0 && (
            <div className="mb-8 bg-white border-2 border-orange-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-emerald-900 mb-4">
                Jadwal Pengangkutan Hari Ini ({todaySchedules.length})
              </h2>
              <div className="space-y-3">
                {todaySchedules.map(schedule => (
                  <Link
                    key={schedule.id}
                    to={`/report/${schedule.report_id}`}
                    className="block p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 hover:border-orange-400 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-emerald-900">{schedule.report_title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{schedule.location_address}</p>
                        <p className="text-sm text-gray-500 mt-1 font-mono">Jam: {schedule.scheduled_time}</p>
                      </div>
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                        URGENT
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Jadwal Mendatang */}
          {pendingSchedules.length > 0 && (
            <div className="bg-white border-2 border-emerald-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-emerald-900">
                  Jadwal Mendatang ({pendingSchedules.length})
                </h2>
                <Link to="/schedules" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  Lihat Semua
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-emerald-200">
                      <th className="text-left py-3 px-4 font-bold text-emerald-900">Laporan</th>
                      <th className="text-left py-3 px-4 font-bold text-emerald-900">Lokasi</th>
                      <th className="text-left py-3 px-4 font-bold text-emerald-900">Jadwal</th>
                      <th className="text-left py-3 px-4 font-bold text-emerald-900">Hari</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSchedules.slice(0, 8).map(schedule => {
                      const daysUntil = getDaysUntil(schedule.scheduled_date);
                      return (
                        <tr key={schedule.id} className="border-b border-gray-200 hover:bg-emerald-50 transition">
                          <td className="py-3 px-4 text-emerald-900 font-medium">
                            <Link to={`/report/${schedule.report_id}`} className="text-emerald-600 hover:text-emerald-700">
                              {schedule.report_title}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{schedule.location_address}</td>
                          <td className="py-3 px-4 text-gray-600">{new Date(schedule.scheduled_date).toLocaleDateString('id-ID')}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded ${
                              daysUntil === 1 ? 'bg-yellow-100 text-yellow-700' :
                              daysUntil <= 3 ? 'bg-emerald-100 text-emerald-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {daysUntil <= 0 ? 'Hari ini' : daysUntil === 1 ? 'Besok' : `${daysUntil}h`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Info Section */}
          {schedules.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-emerald-200">
              <p className="text-gray-600 text-lg mb-4">Belum ada jadwal pengangkutan</p>
              <Link
                to="/schedules"
                className="inline-block px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
              >
                Buat Jadwal Baru
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dashboard untuk WARGA
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold text-green-900 mb-2">
              Laporan Sampah Liar
            </h1>
            <p className="text-green-700">
              Total: <span className="font-semibold text-green-900">{reports.length}</span> laporan
            </p>
          </div>

          {user && (
            <Link
              to="/report/create"
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold shadow-md"
            >
              Buat Laporan Baru
            </Link>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedStatus === 'all'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-green-300 hover:border-green-500'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedStatus === 'pending'
                ? 'bg-yellow-500 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-yellow-200 hover:border-yellow-400'
            }`}
          >
            Menunggu
          </button>
          <button
            onClick={() => setSelectedStatus('diproses')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedStatus === 'diproses'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-blue-200 hover:border-blue-400'
            }`}
          >
            Diproses
          </button>
          <button
            onClick={() => setSelectedStatus('selesai')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedStatus === 'selesai'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-green-300 hover:border-green-500'
            }`}
          >
            Selesai
          </button>
        </div>

        {/* Reports Grid */}
        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-green-300">
            <p className="text-gray-600 text-lg mb-4">
              {selectedStatus === 'all'
                ? 'Belum ada laporan'
                : `Belum ada laporan dengan status "${selectedStatus}"`}
            </p>
            {user && (
              <Link
                to="/report/create"
                className="inline-block px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
              >
                Buat Laporan Pertama
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
