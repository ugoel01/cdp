import React from 'react';
import WidgetBase from './WidgetBase';
import { 
  FiUsers, 
  FiFileText, 
  FiClock, 
  FiShield, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiBarChart2 
} from 'react-icons/fi';

const StatisticCard = ({ icon: Icon, title, value, colorClass }) => {
  return (
    <div className="bg-white rounded-lg shadow p-5 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`p-2 rounded-full ${colorClass.bg}`}>
          <Icon className={`h-5 w-5 ${colorClass.text}`} />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
};

const StatisticsWidget = ({ id, title, stats, onRemove }) => {
  const getDefaultStats = () => [
    { 
      icon: FiUsers, 
      title: 'Total Users', 
      value: '0', 
      colorClass: { bg: 'bg-blue-100', text: 'text-blue-600' } 
    },
    { 
      icon: FiShield, 
      title: 'Active Policies', 
      value: '0', 
      colorClass: { bg: 'bg-green-100', text: 'text-green-600' } 
    },
    { 
      icon: FiClock, 
      title: 'Pending Claims', 
      value: '0', 
      colorClass: { bg: 'bg-yellow-100', text: 'text-yellow-600' } 
    },
    { 
      icon: FiCheckCircle, 
      title: 'Approved Claims', 
      value: '0', 
      colorClass: { bg: 'bg-teal-100', text: 'text-teal-600' } 
    }
  ];

  const displayStats = stats || getDefaultStats();

  return (
    <WidgetBase id={id} title={title} onRemove={onRemove}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat, index) => (
          <StatisticCard 
            key={index}
            icon={stat.icon} 
            title={stat.title} 
            value={stat.value} 
            colorClass={stat.colorClass || { bg: 'bg-gray-100', text: 'text-gray-600' }} 
          />
        ))}
      </div>
    </WidgetBase>
  );
};

export default StatisticsWidget;
