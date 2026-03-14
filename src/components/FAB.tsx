import { Camera } from 'lucide-react';

export default function FAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 hover:bg-green-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-2 disabled:bg-gray-300 disabled:text-gray-400"
      aria-label="Tomar foto"
    >
      <Camera className="h-8 w-8" />
    </button>
  );
}
