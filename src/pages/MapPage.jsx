import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { getReports } from '../services/api';

// Fix leaflet marker icon
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

export default function MapPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            Peta Lokasi Sampah Liar
          </h1>
          <p className="text-gray-600">
            Total lokasi: <span className="font-semibold text-green-700">{reports.length}</span> titik
          </p>
        </div>

        <div className="bg-white rounded-lg border-2 border-green-200 shadow-lg overflow-hidden">
          {reports.length > 0 ? (
            <MapContainer
              center={[-6.2, 106.8]}
              zoom={12}
              style={{ height: '600px', width: '100%' }}
            >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            />

            {reports.map((report) => (
              <Marker
                key={report.id}
                position={[parseFloat(report.latitude), parseFloat(report.longitude)]}
                icon={defaultIcon}
              >
                <Popup className="w-48">
                  <div className="p-2">
                    <h3 className="font-bold text-sm mb-1">{report.title}</h3>
                    <div className="mb-2">
                      <StatusBadge status={report.status} />
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {report.location_address || 'Lokasi tidak ditentukan'}
                    </p>
                    <button
                      onClick={() => navigate(`/report/${report.id}`)}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition w-full"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="h-96 flex items-center justify-center bg-green-50">
            <p className="text-gray-500">Belum ada laporan dengan koordinat lokasi</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
