import React from 'react';
import { FiSettings, FiX, FiMaximize, FiMinimize } from 'react-icons/fi';
import './widget-styles.css';

const WidgetBase = ({ id, title, children, onConfigure, onRemove }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div className="px-4 py-3 bg-gray-50 flex justify-between items-center border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        <div className="flex space-x-2">
          {onConfigure && (
            <button 
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
              onClick={onConfigure}
              title="Configure widget"
            >
              <FiSettings className="h-4 w-4" />
            </button>
          )}
          {onRemove && (
            <button 
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
              onClick={onRemove}
              title="Remove widget"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="px-4 py-4">
        {children}
      </div>
    </div>
  );
};

export default WidgetBase;
