import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastProps extends Toast {
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: '✅',
    bgColor: 'bg-green-500',
    borderColor: 'border-green-400'
  },
  error: {
    icon: '❌',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-400'
  },
  warning: {
    icon: '⚠️',
    bgColor: 'bg-yellow-500',
    borderColor: 'border-yellow-400'
  },
  info: {
    icon: 'ℹ️',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-400'
  }
};

export const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const config = toastConfig[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`
        relative max-w-sm w-full ${config.bgColor} shadow-lg rounded-lg pointer-events-auto 
        ring-1 ring-black ring-opacity-5 overflow-hidden
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">{config.icon}</span>
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-white">
              {title}
            </p>
            <p className="mt-1 text-sm text-white/90">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white/20 rounded-md inline-flex text-white hover:bg-white/30 focus:outline-none"
              onClick={() => onClose(id)}
            >
              <span className="sr-only">Close</span>
              <span className="text-lg leading-none px-2 py-1">×</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className="h-1 bg-white/30"
      />
    </motion.div>
  );
};

// Toast Container
interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message: string) => {
    addToast({ type: 'success', title, message });
  };

  const error = (title: string, message: string) => {
    addToast({ type: 'error', title, message });
  };

  const warning = (title: string, message: string) => {
    addToast({ type: 'warning', title, message });
  };

  const info = (title: string, message: string) => {
    addToast({ type: 'info', title, message });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};