'use client';

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PetroleumDashboard = () => {
  // Real-time data state
  const [dashboardData, setDashboardData] = useState({
    oilPrice: 84.32,
    productionRate: 24567,
    activeWells: 42,
    reservoirPressure: 3200,
    drillingEfficiency: 78.5,
    inventoryLevel: 68.3,
    safetyIncidents: 2,
    reservoirSaturation: 71.5,
  });

  // Alert state with dismissal capability
  const [alerts, setAlerts] = useState([
    { id: 1, severity: 'high', message: 'Pressure anomaly at ALPHA-1', time: '10:23 AM' },
    { id: 2, severity: 'medium', message: 'Maintenance scheduled for BRAVO-3', time: 'Yesterday' },
  ]);

  // Simulation and unit toggle
  const [isLiveData, setIsLiveData] = useState(true);
  const [unit, setUnit] = useState('bbl/d'); // bbl/d or m³/d

  // Data simulation with useCallback
  const simulateData = useCallback(() => {
    setDashboardData((prev) => {
      const currentPrice = typeof prev.oilPrice === 'number' ? prev.oilPrice : parseFloat(prev.oilPrice);
      const currentProduction = typeof prev.productionRate === 'number' ? prev.productionRate : parseInt(prev.productionRate);

      return {
        oilPrice: parseFloat((currentPrice + (Math.random() * 0.5 - 0.25)).toFixed(2)),
        productionRate: Math.max(0, currentProduction + Math.floor(Math.random() * 100 - 50)),
        activeWells: prev.activeWells,
        reservoirPressure: Math.max(0, prev.reservoirPressure + (Math.random() * 50 - 25)),
        drillingEfficiency: Math.min(100, Math.max(0, prev.drillingEfficiency + (Math.random() * 2 - 1))),
        inventoryLevel: Math.min(100, Math.max(0, prev.inventoryLevel + (Math.random() * 3 - 1.5))),
        safetyIncidents: prev.safetyIncidents,
        reservoirSaturation: Math.min(100, Math.max(0, prev.reservoirSaturation + (Math.random() * 1 - 0.5))),
      };
    });
  }, []);

  // Data simulation control
  useEffect(() => {
    let interval;
    if (isLiveData) {
      interval = setInterval(simulateData, 3000);
    }
    return () => clearInterval(interval);
  }, [isLiveData, simulateData]);

  // Sample production data for chart
  const productionData = [
    { month: 'Jan', production: 22500 },
    { month: 'Feb', production: 23800 },
    { month: 'Mar', production: 24500 },
    { month: 'Apr', production: 25100 },
    { month: 'May', production: 24300 },
    { month: 'Jun', production: 24900 },
  ];

  // Convert production data based on unit
  const convertedProductionData = productionData.map((item) => ({
    month: item.month,
    production: unit === 'm³/d' ? (item.production * 0.158987).toFixed(0) : item.production,
  }));

  // Well status data
  const wellStatusData = [
    { status: 'Active', count: 32, color: '#22C55E' },
    { status: 'Drilling', count: 5, color: '#F59E0B' },
    { status: 'Maintenance', count: 3, color: '#3B82F6' },
    { status: 'Shut-in', count: 2, color: '#EF4444' },
  ];

  // Dismiss alert
  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white font-mono">
      

    
      {/* === REAL-TIME STATUS BAR === */}
      <div className="bg-black bg-opacity-70 py-3 px-4 border-b border-amber-900">
        <div className="container mx-auto flex flex-wrap justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-gray-400">WTI Crude: </span>
              <span className="font-mono text-amber-500">${dashboardData.oilPrice}</span>
            </div>
            <div>
              <span className="text-gray-400">Production: </span>
              <span className="font-mono text-green-500">
                {unit === 'bbl/d'
                  ? dashboardData.productionRate.toLocaleString()
                  : (dashboardData.productionRate * 0.158987).toFixed(0)}{' '}
                {unit}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Active Wells: </span>
              <span className="font-mono">{dashboardData.activeWells}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-gray-400">Reservoir Pressure: </span>
              <span className="font-mono">{dashboardData.reservoirPressure.toFixed(0)} psi</span>
            </div>
            <div>
              <span className="text-gray-400">Drilling Efficiency: </span>
              <span className="font-mono">{dashboardData.drillingEfficiency.toFixed(1)}%</span>
            </div>
            <button
              onClick={() => setIsLiveData(!isLiveData)}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isLiveData ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
              aria-label={isLiveData ? 'Pause live data' : 'Resume live data'}
            >
              {isLiveData ? 'LIVE' : 'PAUSED'}
            </button>
          </div>
        </div>
      </div>

      {/* === MAIN DASHBOARD CONTENT === */}
      <main className="container mx-auto px-4 py-8">
        {/* -- QUICK STATS -- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
          <div className="bg-gray-900 rounded-xl p-4 shadow-lg border border-amber-900">
            <div className="relative h-24 w-24 mx-auto">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path
                  className="text-gray-700 fill-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500 fill-current"
                  strokeDasharray={`${dashboardData.drillingEfficiency}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                />
              </svg>
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                <span className="text-lg font-bold">{dashboardData.drillingEfficiency.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Drilling Efficiency</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 shadow-lg border border-amber-900">
            <div className="relative h-24 w-24 mx-auto">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path
                  className="text-gray-700 fill-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-green-500 fill-current"
                  strokeDasharray={`${dashboardData.inventoryLevel}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                />
              </svg>
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                <span className="text-lg font-bold">{dashboardData.inventoryLevel.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Inventory Level</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 shadow-lg border border-amber-900">
            <div className="relative h-24 w-24 mx-auto">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path
                  className="text-gray-700 fill-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-red-500 fill-current"
                  strokeDasharray={`${100 - dashboardData.safetyIncidents * 10}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                />
              </svg>
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                <span className="text-lg font-bold">{dashboardData.safetyIncidents}</span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Safety Incidents</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 shadow-lg border border-amber-900">
            <div className="relative h-24 w-24 mx-auto">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path
                  className="text-gray-700 fill-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500 fill-current"
                  strokeDasharray="98.7, 100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                />
              </svg>
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                <span className="text-lg font-bold">98.7%</span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Equipment Uptime</p>
          </div>
        </div>

        {/* -- ALERTS AND QUICK ACTIONS -- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-slide-up">
          {/* Critical Alerts */}
          <div className="bg-gray-900 rounded-xl shadow-lg border border-amber-900 overflow-hidden">
            <div className="bg-red-800 text-white px-4 py-3 flex justify-between items-center">
              <h2 className="font-bold">Critical Alerts</h2>
              <span className="text-xs bg-amber-500 text-black px-2 py-1 rounded-full">{alerts.length} Active</span>
            </div>
            <div className="p-4">
              {alerts.length > 0 ? (
                <ul className="space-y-4">
                  {alerts.map((alert) => (
                    <li key={alert.id} className="flex items-center justify-between">
                      <div className="flex items-start">
                        <div
                          className={`flex-shrink-0 h-5 w-5 rounded-full mt-1 ${
                            alert.severity === 'high' ? 'bg-red-600' : 'bg-amber-600'
                          }`}
                        ></div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-gray-400">{alert.time}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="Dismiss alert"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-center py-4">No active alerts</p>
              )}
              <button className="mt-4 w-full bg-amber-700 hover:bg-amber-800 text-white py-2 rounded-lg text-sm">
                View All Alerts
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 rounded-xl shadow-lg border border-amber-900 overflow-hidden">
            <div className="bg-amber-800 text-white px-4 py-3">
              <h2 className="font-bold">Quick Actions</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <button className="bg-blue-900 hover:bg-blue-800 text-white p-3 rounded-lg flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-xs">New Report</span>
              </button>
              <button className="bg-green-900 hover:bg-green-800 text-white p-3 rounded-lg flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="text-xs">Create Work Order</span>
              </button>
              <button className="bg-purple-900 hover:bg-purple-800 text-white p-3 rounded-lg flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs">Schedule Inspection</span>
              </button>
              <button className="bg-red-900 hover:bg-red-800 text-white p-3 rounded-lg flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
                  />
                </svg>
                <span className="text-xs">Emergency Stop</span>
              </button>
            </div>
          </div>

          {/* Reservoir Health */}
          <div className="bg-gray-900 rounded-xl shadow-lg border border-amber-900 overflow-hidden">
            <div className="bg-blue-800 text-white px-4 py-3">
              <h2 className="font-bold">Reservoir Health</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{dashboardData.reservoirPressure.toFixed(0)} psi</p>
                  <p className="text-xs text-gray-400">Pressure</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{dashboardData.reservoirSaturation.toFixed(1)}%</p>
                  <p className="text-xs text-gray-400">Oil Saturation</p>
                </div>
              </div>
              <div className="h-32 bg-gray-800 rounded-lg mt-4 flex items-center justify-center">
                <p className="text-gray-400">Reservoir Health Trend</p>
              </div>
            </div>
          </div>
        </div>

        {/* -- PRODUCTION OVERVIEW -- */}
        <div className="bg-gray-900 rounded-xl shadow-lg border border-amber-900 mb-8 animate-slide-up">
          <div className="bg-black bg-opacity-70 text-white px-4 py-3 flex justify-between items-center">
            <h2 className="font-bold">Production Overview</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs">Daily</button>
              <button className="px-3 py-1 bg-amber-700 hover:bg-amber-800 rounded text-xs">Monthly</button>
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs">Yearly</button>
              <button
                onClick={() => setUnit(unit === 'bbl/d' ? 'm³/d' : 'bbl/d')}
                className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-xs"
              >
                {unit === 'bbl/d' ? 'Switch to m³/d' : 'Switch to bbl/d'}
              </button>
            </div>
          </div>
          <div className="p-4">
            <Bar
              data={{
                labels: convertedProductionData.map((item) => item.month),
                datasets: [
                  {
                    label: `Production (${unit})`,
                    data: convertedProductionData.map((item) => item.production),
                    backgroundColor: '#F59E0B',
                    borderColor: '#D97706',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: `Production (${unit})`, color: '#FBBF24' },
                    grid: { color: '#4B5563' },
                  },
                  x: {
                    title: { display: true, text: 'Month', color: '#FBBF24' },
                    grid: { display: false },
                  },
                },
                plugins: {
                  legend: { display: true, position: 'top', labels: { color: '#FBBF24' } },
                  title: { display: true, text: 'Monthly Production Trend', color: '#FBBF24' },
                  tooltip: { backgroundColor: '#1F2937', titleColor: '#FBBF24', bodyColor: '#FBBF24' },
                },
                animation: { duration: 1000, easing: 'easeInOutQuad' },
              }}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-amber-500 font-medium">Current Production</p>
                <p className="text-xl font-bold">
                  {unit === 'bbl/d'
                    ? dashboardData.productionRate.toLocaleString()
                    : (dashboardData.productionRate * 0.158987).toFixed(0)}{' '}
                  {unit}
                </p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-green-500 font-medium">Monthly Target</p>
                <p className="text-xl font-bold">
                  {unit === 'bbl/d' ? '750,000 bbl' : '119,240 m³'}
                </p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-blue-500 font-medium">YTD Production</p>
                <p className="text-xl font-bold">
                  {unit === 'bbl/d' ? '4.2M bbl' : '667,744 m³'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* -- WELL STATUS AND ACTIVITY -- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-slide-up">
          {/* Well Status */}
          <div className="bg-gray-900 rounded-xl shadow-lg border border-amber-900 overflow-hidden">
            <div className="bg-black bg-opacity-70 text-white px-4 py-3">
              <h2 className="font-bold">Well Status</h2>
            </div>
            <div className="p-4">
              <div className="flex justify-between mb-4">
                <p className="text-sm font-medium">Total Wells: {dashboardData.activeWells}</p>
                <button className="text-xs text-amber-500 hover:text-amber-400">View All</button>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {wellStatusData.map((status, index) => (
                  <div key={index} className="text-center">
                    <div className={`h-3 w-full rounded-t-lg`} style={{ backgroundColor: status.color }}></div>
                    <p className="text-xl font-bold mt-1">{status.count}</p>
                    <p className="text-xs text-gray-400">{status.status}</p>
                  </div>
                ))}
              </div>
              <div className="h-40 bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Well Distribution Mini-Map</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900 rounded-xl shadow-lg border border-amber-900 overflow-hidden">
            <div className="bg-black bg-opacity-70 text-white px-4 py-3">
              <h2 className="font-bold">Recent Activity</h2>
            </div>
            <div className="p-4">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-green-900 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Well CHARLIE-7 reached target depth</p>
                    <p className="text-xs text-gray-400">Today, 08:42 AM</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-900 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Maintenance completed on BRAVO-3</p>
                    <p className="text-xs text-gray-400">Yesterday, 3:15 PM</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-amber-900 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-amber-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pressure warning at ALPHA-1 (3200 psi)</p>
                    <p className="text-xs text-gray-400">Yesterday, 10:23 AM</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-purple-900 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-purple-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Production report generated for May 2023</p>
                    <p className="text-xs text-gray-400">2 days ago</p>
                  </div>
                </li>
              </ul>
              <button className="mt-4 w-full bg-amber-700 hover:bg-amber-800 text-white py-2 rounded-lg text-sm">
                View All Activity
              </button>
            </div>
          </div>
        </div>

        {/* -- INVENTORY AND EQUIPMENT -- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
          {/* Inventory Status */}
          <div className="bg-gray-900 rounded-xl shadow-lg border border-amber-900 overflow-hidden">
            <div className="bg-black bg-opacity-70 text-white px-4 py-3">
              <h2 className="font-bold">Inventory Status</h2>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Drilling Mud</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Casing Pipe</span>
                  <span className="font-medium">82%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Valves & Fittings</span>
                  <span className="font-medium">71%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '71%' }}></div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Safety Equipment</span>
                  <span className="font-medium">93%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '93%' }}></div>
                </div>
              </div>
              <button className="w-full bg-amber-700 hover:bg-amber-800 text-white py-2 rounded-lg text-sm">
                Request Inventory
              </button>
            </div>
          </div>

          {/* Equipment Monitoring */}
          <div className="bg-gray-900 rounded-xl shadow-lg border border-amber-900 overflow-hidden">
            <div className="bg-black bg-opacity-70 text-white px-4 py-3">
              <h2 className="font-bold">Equipment Monitoring</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 font-medium">Pump #1</p>
                  <p className="text-lg font-bold text-green-500">Normal</p>
                  <p className="text-xs text-gray-400">Pressure: 320 psi</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 font-medium">Compressor A</p>
                  <p className="text-lg font-bold text-amber-500">Warning</p>
                  <p className="text-xs text-gray-400">Temp: 185°F</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 font-medium">Generator 3</p>
                  <p className="text-lg font-bold text-green-500">Normal</p>
                  <p className="text-xs text-gray-400">Load: 78%</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 font-medium">Separator Unit</p>
                  <p className="text-lg font-bold text-green-500">Normal</p>
                  <p className="text-xs text-gray-400">Flow: 1200 bbl/d</p>
                </div>
              </div>
              <div className="h-40 bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Equipment Health Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      

      {/* === CUSTOM CSS === */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PetroleumDashboard;