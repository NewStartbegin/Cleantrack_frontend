import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function ReportCard({ report }) {
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '-';
    }
  };
  const getImageUrl = (url) => {
    if (!url) return null;
    return url.replace(
      'https://s3uts.s3.ap-southeast-1.amazonaws.com',
      '/s3-image'
    );
  };

  return (
    <Link
      to={`/report/${report.id}`}
      className="block bg-white rounded-lg border-2 border-green-200 shadow-sm hover:shadow-lg hover:border-green-400 transition overflow-hidden"
    >
      {report.photo_url ? (
        <div className="w-full h-40 overflow-hidden bg-green-100">
          <img
            src={getImageUrl(report.photo_url)}
            alt={report.title}
            className="w-full h-full object-cover hover:scale-105 transition"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="w-full h-40 bg-green-100 flex items-center justify-center">
          <span className="text-green-300 text-4xl">IMAGE</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 flex-1 line-clamp-2">
            {report.title}
          </h3>
          <StatusBadge status={report.status} />
        </div>

        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {report.description || 'Tanpa deskripsi'}
        </p>

        <p className="text-xs text-gray-500 mb-2">
          {report.location_address || 'Lokasi tidak ditentukan'}
        </p>

        {/* Schedule Info */}
        {report.schedule && (
          <div className="mb-2 p-2 bg-green-50 rounded border border-green-200">
            <p className="text-xs font-semibold text-green-700">Jadwal Diatur:</p>
            <p className="text-xs text-green-600">
              {new Date(report.schedule.scheduled_date).toLocaleDateString('id-ID')} 
              {' '} {report.schedule.scheduled_time}
            </p>
            {report.schedule.schedule_status === 'selesai' && (
              <p className="text-xs text-green-700 font-semibold">Sudah Diambil</p>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400">
          {formatDate(report.created_at)}
        </p>
      </div>
    </Link>
  );
}
