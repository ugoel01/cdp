import React, { useEffect } from 'react';

const Notification = ({ message, type = 'error', onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'error' 
    ? 'bg-red-100 border-red-500 text-red-700' 
    : type === 'success'
      ? 'bg-green-100 border-green-500 text-green-700'
      : 'bg-blue-100 border-blue-500 text-blue-700';

  const icon = type === 'error' 
    ? '❌' 
    : type === 'success'
      ? '✅'
      : 'ℹ️';

  return (
    <div className={`fixed top-5 right-5 z-50 p-4 rounded-md shadow-lg border-l-4 ${bgColor} max-w-md animate-fade-in`}>
      <div className="flex items-center">
        <span className="mr-2">{icon}</span>
        <div className="flex-grow">{message}</div>
        <button 
          onClick={onClose} 
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Notification;
