import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useUser } from '../hooks/useUser';
import { getReportById, updateReportStatus, deleteReport, confirmSchedule } from '../services/api';

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [daysUntilSchedule, setDaysUntilSchedule] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await getReportById(id);
      if (response.success) {
        setReport(response.data);
        
        // Calculate days until schedule if exists
        if (response.data.schedule) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const scheduledDate = new Date(response.data.schedule.scheduled_date);
          scheduledDate.setHours(0, 0, 0, 0);
          const diffTime = scheduledDate - today;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          setDaysUntilSchedule(diffDays);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Gagal memuat laporan');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const response = await updateReportStatus(id, { status: newStatus });
      if (response.success) {
        setReport((prev) => ({ ...prev, status: newStatus }));
        toast.success('Status laporan berhasil diperbarui');
      }
    } catch (error) {
      toast.error(error.message || 'Gagal memperbarui status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      setUpdatingStatus(true);
      try {
        const response = await deleteReport(id, user.id);
        if (response.success) {
          toast.success('Laporan berhasil dihapus');
          navigate('/');
        }
      } catch (error) {
        toast.error(error.message || 'Gagal menghapus laporan');
      } finally {
        setUpdatingStatus(false);
      }
    }
  };

  const handleConfirmSchedule = async () => {
    if (window.confirm('Konfirmasi sampah sudah diambil? Status laporan akan berubah menjadi SELESAI')) {
      setUpdatingStatus(true);
      try {
        const response = await confirmSchedule(report.schedule.id, user.id);
        if (response.success) {
          toast.success('Sampah berhasil diambil! Laporan ditandai selesai');
          // Refetch report to get updated status from server
          await fetchReport();
        }
      } catch (error) {
        toast.error(error.message || 'Gagal konfirmasi pengambilan');
      } finally {
        setUpdatingStatus(false);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-600">Laporan tidak ditemukan</p>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const getImageUrl = (url) => {
    if (!url) return null;
    return url.replace(
      'https://s3uts.s3.ap-southeast-1.amazonaws.com',
      '/s3-image'
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex gap-2 mb-8 text-sm">
          <Link to="/" className="text-green-600 hover:underline font-medium">
            Beranda
          </Link>
          <span className="text-gray-500">›</span>
          <span className="text-gray-600">Detail Laporan</span>
        </div>

        <div className="bg-white rounded-lg border-2 border-green-200 shadow-lg overflow-hidden">
          {/* Foto */}
          {report.photo_url ? (
            <div className="w-full h-96 bg-green-100 overflow-hidden">
              <img
                src={getImageUrl(report.photo_url)}
                alt={report.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-full h-96 bg-green-100 flex items-center justify-center">
              <span className="text-green-300 text-6xl">IMAGE</span>
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-green-900 mb-2">
                  {report.title}
                </h1>
                <div className="flex items-center gap-4">
                  <StatusBadge status={report.status} />
                  <span className="text-sm text-gray-500">
                    {formatDate(report.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-green-900 mb-2">Deskripsi</h2>
              <p className="text-gray-700 leading-relaxed">
                {report.description || 'Tidak ada deskripsi'}
              </p>
            </div>

            {/* Location */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold text-green-900 mb-3">Lokasi</h2>
              <p className="text-gray-700 mb-2">
                <span className="font-medium">{report.location_address || 'Tidak ditentukan'}</span>
              </p>
              <p className="text-sm text-gray-600">
                Latitude: <span className="font-mono">{report.latitude}</span>
              </p>
              <p className="text-sm text-gray-600">
                Longitude: <span className="font-mono">{report.longitude}</span>
              </p>
            </div>

          {/* Schedule Section */}
          {report.schedule && (
            <div className="mb-8 p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <h2 className="text-lg font-semibold text-green-900 mb-3">Jadwal Pengangkutan</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Tanggal</p>
                  <p className="font-semibold text-green-900">
                    {new Date(report.schedule.scheduled_date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jam Pengangkutan</p>
                  <p className="font-semibold text-green-900 font-mono">{report.schedule.scheduled_time}</p>
                </div>
              </div>

              {report.schedule.notes && (
                <div className="mb-4 p-2 bg-white rounded">
                  <p className="text-sm text-gray-600">Catatan:</p>
                  <p className="text-sm text-gray-700">{report.schedule.notes}</p>
                </div>
              )}

              {/* Countdown */}
              {daysUntilSchedule !== null && report.schedule.schedule_status === 'pending' && (
                <div className="mb-4 p-2 bg-white rounded">
                  <p className="text-sm font-semibold text-gray-700">
                    {daysUntilSchedule === 0 ? (
                      <span className="text-orange-600">Hari ini dijadwalkan - Status: Diproses</span>
                    ) : daysUntilSchedule > 0 ? (
                      <span className="text-green-600">{daysUntilSchedule} hari lagi dijadwalkan</span>
                    ) : (
                      <span className="text-gray-600">Jadwal sudah lewat</span>
                    )}
                  </p>
                </div>
              )}

              {report.schedule.schedule_status === 'selesai' && (
                <div className="p-2 bg-green-100 rounded border border-green-300">
                  <p className="text-sm font-semibold text-green-700">Sampah sudah diambil</p>
                </div>
              )}
            </div>
          )}

          {/* Confirm Schedule Section (Petugas Only) */}
          {user && user.role === 'petugas' && report.schedule && report.schedule.schedule_status === 'pending' && daysUntilSchedule === 0 && (
            <div className="mb-8 p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <h2 className="text-lg font-semibold text-green-900 mb-4">Konfirmasi Pengambilan Sampah</h2>
              <p className="text-sm text-gray-700 mb-4">
                Klik tombol di bawah untuk mengkonfirmasi bahwa sampah sudah berhasil diambil. 
                Status laporan akan otomatis berubah menjadi SELESAI.
              </p>
              <button
                onClick={handleConfirmSchedule}
                disabled={updatingStatus}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
              >
                Konfirmasi Pengambilan
              </button>
            </div>
          )}

          {/* Status Update Section (Petugas Only) */}
          {user && user.role === 'petugas' && !report.schedule && (
            <div className="mb-8 p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <h2 className="text-lg font-semibold text-green-900 mb-4">
                Perbarui Status Laporan
              </h2>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => handleStatusUpdate('diproses')}
                  disabled={
                    updatingStatus || report.status === 'diproses'
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Tandai Diproses
                </button>

                <button
                  onClick={() => handleStatusUpdate('selesai')}
                  disabled={
                    updatingStatus || report.status === 'selesai'
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Tandai Selesai
                </button>

                <button
                  onClick={handleDelete}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Hapus Laporan
                </button>
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-slate-200 text-gray-700 rounded-lg hover:bg-slate-300 transition font-medium"
            >
              ← Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
