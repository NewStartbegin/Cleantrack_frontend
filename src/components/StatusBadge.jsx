export default function StatusBadge({ status }) {
  const statusConfig = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Menunggu',
    },
    diproses: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'Diproses',
    },
    selesai: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Selesai',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
