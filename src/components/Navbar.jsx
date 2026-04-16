import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

export default function Navbar() {
  const navigate = useNavigate();
  const user = useUser();

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('userChanged'));
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b-2 border-green-600 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CT</span>
            </div>
            <span className="text-lg font-bold text-green-700">CleanTrack</span>
          </Link>

          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-green-700 transition font-medium"
            >
              Beranda
            </Link>
            <Link
              to="/map"
              className="text-sm text-gray-600 hover:text-green-700 transition font-medium"
            >
              Peta
            </Link>
            <Link
              to="/schedules"
              className="text-sm text-gray-600 hover:text-green-700 transition font-medium"
            >
              Jadwal
            </Link>

            {user ? (
              <div className="flex items-center gap-4 pl-8 border-l border-gray-200">
                <span className="text-sm text-gray-600">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-medium"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
