export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-green-600 rounded-full animate-spin"></div>
        <p className="text-gray-600">Memuat...</p>
      </div>
    </div>
  );
}
