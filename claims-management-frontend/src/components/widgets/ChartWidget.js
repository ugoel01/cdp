import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import WidgetBase from './WidgetBase';
import './widget-styles.css';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title
);

const ChartWidget = ({ id, title, chartType, data, onRemove }) => {
  const chartRef = useRef(null);
  
  // Default empty data if none provided
  const defaultData = {
    labels: ['No Data'],
    datasets: [
      {
        data: [1],
        backgroundColor: ['#e0e0e0'],
        borderColor: ['#e0e0e0'],
        borderWidth: 1,
      },
    ],
  };
  
  // Use provided data or default if not available
  const chartData = data || defaultData;
  
  // Chart options based on chart type
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#111827',
          bodyColor: '#4B5563',
          bodyFont: {
            size: 12
          },
          borderColor: '#E5E7EB',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6
        }
      },
    };
    
    switch (chartType) {
      case 'bar':
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#F3F4F6'
              },
              ticks: {
                precision: 0,
                color: '#6B7280'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#6B7280'
              }
            }
          },
        };
      case 'line':
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#F3F4F6'
              },
              ticks: {
                color: '#6B7280'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#6B7280'
              }
            }
          },
        };
      default: // pie
        return baseOptions;
    }
  };
  
  // Render the appropriate chart based on type
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={getChartOptions()} />;
      case 'line':
        return <Line data={chartData} options={getChartOptions()} />;
      default: // pie
        return <Pie data={chartData} options={getChartOptions()} />;
    }
  };
  
  return (
    <WidgetBase 
      id={id} 
      title={title || `${chartType?.charAt(0).toUpperCase() + chartType?.slice(1) || 'Chart'}`}
      onRemove={onRemove}
    >
      <div className="h-64 w-full">
        {renderChart()}
      </div>
    </WidgetBase>
  );
};

export default ChartWidget;
