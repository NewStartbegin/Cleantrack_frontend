import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUser } from '../hooks/useUser';
import { createReport, uploadPhoto } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CreateReportPage() {
  const navigate = useNavigate();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location_address: '',
    latitude: '',
    longitude: '',
    photo: null,
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (user === null) {
      // user is explicitly null (checked and not logged in)
      console.log('❌ Not authenticated, redirecting to login');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, photo: file }));

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 Form submit started');

    if (!form.title || !form.latitude || !form.longitude) {
      toast.error('Judul, latitude, dan longitude harus diisi');
      return;
    }

    if (isNaN(parseFloat(form.latitude)) || isNaN(parseFloat(form.longitude))) {
      toast.error('Latitude dan longitude harus berupa angka');
      return;
    }

    setLoading(true);
    try {
      let photoUrl = null;

      // Upload photo if exists
      if (form.photo) {
        console.log('🔄 Uploading photo...');
        const photoFormData = new FormData();
        photoFormData.append('photo', form.photo);

        const uploadResponse = await uploadPhoto(photoFormData);
        console.log('✅ Upload response:', uploadResponse);
        
        if (!uploadResponse || !uploadResponse.success) {
          throw new Error('Gagal upload foto: ' + (uploadResponse?.message || 'Unknown error'));
        }

        if (uploadResponse.data && uploadResponse.data.url) {
          photoUrl = uploadResponse.data.url;
          console.log('📸 Photo URL:', photoUrl);
        }
      }

      // Create report
      console.log('📝 Creating report with data:', {
        user_id: user.id,
        title: form.title,
        photo_url: photoUrl,
      });

      const reportResponse = await createReport({
        user_id: user.id,
        title: form.title,
        description: form.description,
        location_address: form.location_address,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        photo_url: photoUrl,
      });

      console.log('✅ Report response:', reportResponse);

      if (!reportResponse || !reportResponse.success) {
        throw new Error('Gagal membuat laporan: ' + (reportResponse?.message || 'Unknown error'));
      }

      toast.success('Laporan berhasil dibuat!');
      console.log('🎉 Success! Navigating to home...');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('❌ Submit error caught:', error);
      toast.error(error.message || 'Gagal membuat laporan');
    } finally {
      console.log('📊 Setting loading to false');
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Redirecting via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border-2 border-green-200 shadow-lg p-8">
          <h1 className="text-3xl font-bold text-green-900 mb-2">Buat Laporan Baru</h1>
          <p className="text-green-700 mb-8">
            Laporkan lokasi sampah liar untuk membantu menjaga kebersihan lingkungan
          </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Laporan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              placeholder="Contoh: Sampah di Jalan Merdeka"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Jelaskan kondisi dan jenis sampah yang ada"
              rows="4"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
            />
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alamat Lengkap
            </label>
            <input
              type="text"
              name="location_address"
              value={form.location_address}
              onChange={handleInputChange}
              placeholder="Jalan, Kelurahan, Kecamatan, Kota"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
            />
          </div>

          {/* Koordinat */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="latitude"
                value={form.latitude}
                onChange={handleInputChange}
                placeholder="-6.200000"
                step="0.000001"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="longitude"
                value={form.longitude}
                onChange={handleInputChange}
                placeholder="106.816666"
                step="0.000001"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Upload Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Foto
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            />

            {photoPreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preview Foto:</p>
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
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
