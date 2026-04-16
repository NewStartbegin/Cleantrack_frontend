import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useUser } from '../hooks/useUser';
import { getSchedules, updateScheduleStatus, deleteSchedule } from '../services/api';

export default function SchedulesPage() {
  const user = useUser();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, selesai

  // Helper functions - defined first before being used
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysUntil = (scheduledDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduled = new Date(scheduledDate);
    scheduled.setHours(0, 0, 0, 0);
    const diffTime = scheduled - today;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyBadge = (daysUntil) => {
    if (daysUntil < 0) return { color: 'bg-red-100 text-red-800', label: 'Terlewat' };
    if (daysUntil === 0) return { color: 'bg-red-100 text-red-800', label: 'Hari ini' };
    if (daysUntil === 1) return { color: 'bg-orange-100 text-orange-800', label: 'Besok' };
    if (daysUntil <= 7) return { color: 'bg-yellow-100 text-yellow-800', label: `${daysUntil} hari lagi` };
    return { color: 'bg-blue-100 text-blue-800', label: `${daysUntil} hari lagi` };
  };

  const getSortedSchedules = (schedules) => {
    return [...schedules].sort((a, b) => {
      const dateA = new Date(a.scheduled_date);
      const dateB = new Date(b.scheduled_date);
      return dateA - dateB;
    });
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await getSchedules();
      if (response.success) {
        setSchedules(response.data || []);
      }
    } catch (error) {
      toast.error(error.message || 'Gagal memuat jadwal');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (scheduleId) => {
    try {
      const response = await updateScheduleStatus(scheduleId, { status: 'selesai' });
      if (response.success) {
        setSchedules(schedules.map(s => 
          s.id === scheduleId ? { ...s, status: 'selesai' } : s
        ));
        toast.success('Jadwal ditandai selesai');
      }
    } catch (error) {
      toast.error(error.message || 'Gagal update jadwal');
    }
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      try {
        const response = await deleteSchedule(scheduleId, user.id);
        if (response.success) {
          setSchedules(schedules.filter(s => s.id !== scheduleId));
          toast.success('Jadwal dihapus');
        }
      } catch (error) {
        toast.error(error.message || 'Gagal hapus jadwal');
      }
    }
  };

  const filteredSchedules = getSortedSchedules(
    filter === 'all'
      ? schedules
      : schedules.filter(s => s.status === filter)
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold text-emerald-900 mb-2">
              Jadwal Pengangkutan
            </h1>
            <p className="text-emerald-700">
              Total: <span className="font-semibold text-emerald-900">{schedules.length}</span> jadwal
            </p>
          </div>

          {user && user.role === 'petugas' && (
            <Link
              to="/schedule/create"
              className="px-6 py-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition font-semibold shadow-md"
            >
              Buat Jadwal
            </Link>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-emerald-700 text-white'
                : 'bg-white text-gray-700 border-2 border-emerald-300 hover:border-emerald-500'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 border-2 border-yellow-300 hover:border-yellow-500'
            }`}
          >
            Menunggu
          </button>
          <button
            onClick={() => setFilter('selesai')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'selesai'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border-2 border-green-300 hover:border-green-500'
            }`}
          >
            Selesai
          </button>
        </div>

        {/* Alert untuk Jadwal Urgent */}
      {(() => {
        const pendingSchedules = schedules.filter(s => s.status === 'pending');
        const urgentSchedules = pendingSchedules.filter(s => {
          const daysUntil = getDaysUntil(s.scheduled_date);
          return daysUntil <= 1;
        });
        
        if (urgentSchedules.length > 0) {
          return (
            <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 p-4 rounded-lg shadow-md">
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-3">
                  {urgentSchedules.length} jadwal perlu dikerjakan segera
                </h3>
                <div className="space-y-2">
                  {urgentSchedules.map(schedule => {
                    const daysUntil = getDaysUntil(schedule.scheduled_date);
                    return (
                      <p key={schedule.id} className="text-sm text-red-800">
                        <strong>{schedule.report_title}</strong> di {schedule.location_address} 
                        {daysUntil === 0 ? ' - HARI INI!' : ' - Besok!'}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }
      })()}

      {/* Schedules Table */}
      {filteredSchedules.length > 0 ? (
        <div className="bg-white rounded-lg border-2 border-emerald-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-700 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Laporan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Lokasi</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Jadwal</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Kapan Dikerjakan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Petugas</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((schedule) => {
                  const daysUntil = getDaysUntil(schedule.scheduled_date);
                  const urgency = getUrgencyBadge(daysUntil);
                  return (
                    <tr key={schedule.id} className="border-b border-gray-200 hover:bg-emerald-50 transition">
                      <td className="px-6 py-4 text-sm text-emerald-900 font-medium">
                        <Link
                          to={`/report/${schedule.report_id}`}
                          className="text-emerald-600 hover:text-emerald-700 font-medium underline"
                        >
                          {schedule.report_title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {schedule.location_address || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>{formatDate(schedule.scheduled_date)}</div>
                        <div className="text-xs text-gray-500 font-mono">{schedule.scheduled_time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${urgency.color}`}>
                          {urgency.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {schedule.created_by_name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            schedule.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {schedule.status === 'pending' ? 'Menunggu' : 'Selesai'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center items-center">
                          {user && user.role === 'petugas' && schedule.status === 'pending' && (
                            <button
                              onClick={() => handleMarkCompleted(schedule.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition font-semibold"
                          >
                            Ambil
                          </button>
                        )}
                        {user && user.role === 'petugas' && (
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition font-semibold"
                          >
                            Hapus
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-emerald-200">
          <p className="text-gray-500 text-lg">
            {filter === 'all'
              ? 'Belum ada jadwal pengangkutan'
              : `Belum ada jadwal dengan status "${filter}"`}
          </p>
        </div>
        )}
    </div>
    </div>
  );
}
