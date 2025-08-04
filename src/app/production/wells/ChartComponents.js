
// src/app/production/wells/ChartComponents.js
'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export const LineChart = ({ data, xKey, yKeys, colors, darkMode, setChartError }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const ctx = canvasRef.current.getContext('2d');
      if (chartRef.current) chartRef.current.destroy();

      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(item => item[xKey]),
          datasets: yKeys.map((key, i) => ({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            data: data.map(item => item[key]),
            borderColor: colors[i],
            backgroundColor: colors[i] + '33',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: darkMode ? '#e5e7eb' : '#1f2937',
                font: { size: 12 }
              }
            },
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            x: {
              title: { display: true, text: xKey.toUpperCase(), color: darkMode ? '#e5e7eb' : '#1f2937' },
              ticks: { color: darkMode ? '#e5e7eb' : '#1f2937' }
            },
            y: {
              title: { display: true, text: 'Value', color: darkMode ? '#e5e7eb' : '#1f2937' },
              ticks: { color: darkMode ? '#e5e7eb' : '#1f2937' },
              beginAtZero: true
            }
          }
        }
      });
    } catch (error) {
      setChartError(error.message);
    }

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [data, xKey, yKeys, colors, darkMode, setChartError]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export const BarChart = ({ data, xKey, yKeys, colors, darkMode, setChartError }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const ctx = canvasRef.current.getContext('2d');
      if (chartRef.current) chartRef.current.destroy();

      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(item => item[xKey]),
          datasets: yKeys.map((key, i) => ({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            data: data.map(item => item[key]),
            backgroundColor: colors[i] + '80',
            borderColor: colors[i],
            borderWidth: 1
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: darkMode ? '#e5e7eb' : '#1f2937',
                font: { size: 12 }
              }
            },
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            x: {
              title: { display: true, text: xKey.toUpperCase(), color: darkMode ? '#e5e7eb' : '#1f2937' },
              ticks: { color: darkMode ? '#e5e7eb' : '#1f2937' }
            },
            y: {
              title: { display: true, text: 'Value', color: darkMode ? '#e5e7eb' : '#1f2937' },
              ticks: { color: darkMode ? '#e5e7eb' : '#1f2937' },
              beginAtZero: true
            }
          }
        }
      });
    } catch (error) {
      setChartError(error.message);
    }

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [data, xKey, yKeys, colors, darkMode, setChartError]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};
