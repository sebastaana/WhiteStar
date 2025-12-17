import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function ErrorMessage({ message, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
      <div className="flex-1">
        <p className="text-red-700 text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="text-red-400 hover:text-red-600"
      >
        <X size={18} />
      </button>
    </div>
  );
}
