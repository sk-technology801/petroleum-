
// src/app/production/wells/page.jsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { FiAlertTriangle, FiDroplet, FiWind, FiThermometer, FiCalendar, FiFilter, FiSearch, FiSettings, FiDownload } from 'react-icons/fi';
import { LineChart, BarChart } from './ChartComponents'; // Chart.js-based components
import { CSVLink } from 'react-csv'; // For CSV export

export default function WellsClient() {
  // Theme state
  const [darkMode, setDarkMode] = useState(false);

  // Well performance data
  const [wellPerformance, setWellPerformance] = useState([
    {
      id: 1,
      name: 'ALPHA-1',
      status: 'producing',
      oil: 4200,
      gas: 22,
      water: 15,
      pressure: 1280,
      choke: 28,
      lastMaintenance: '2023-10-15',
      nextMaintenance: '2024-02-20',
      productionEfficiency: 88.5,
      artificialLift: 'ESP',
      depth: 12500,
      location: 'A-12',
      reservoir: 'Upper Cretaceous',
      alerts: [
        { id: 1, severity: 'medium', message: 'Water cut increasing', timestamp: '2023-12-20T07:15:33', resolved: false }
      ],
      historicalData: Array.from({ length: 7 }, (_, i) => ({
        day: `Day ${i + 1}`,
        oil: 4200 + Math.floor(Math.random() * 200 - 100),
        gas: 22 + (Math.random() * 2 - 1),
        water: 15 + (Math.random() * 2 - 1)
      }))
    },
    {
      id: 2,
      name: 'BRAVO-3',
      status: 'producing',
      oil: 3800,
      gas: 18,
      water: 12,
      pressure: 1150,
      choke: 32,
      lastMaintenance: '2023-11-02',
      nextMaintenance: '2024-03-10',
      productionEfficiency: 91.2,
      artificialLift: 'Gas Lift',
      depth: 9800,
      location: 'B-07',
      reservoir: 'Lower Jurassic',
      alerts: [],
      historicalData: Array.from({ length: 7 }, (_, i) => ({
        day: `Day ${i + 1}`,
        oil: 3800 + Math.floor(Math.random() * 200 - 100),
        gas: 18 + (Math.random() * 2 - 1),
        water: 12 + (Math.random() * 2 - 1)
      }))
    },
    {
      id: 3,
      name: 'CHARLIE-7',
      status: 'shut-in',
      oil: 0,
      gas: 0,
      water: 0,
      pressure: 0,
      choke: 0,
      lastMaintenance: '2023-09-28',
      nextMaintenance: '2024-01-15',
      productionEfficiency: 0,
      artificialLift: 'Rod Pump',
      depth: 7500,
      location: 'C-03',
      reservoir: 'Triassic',
      alerts: [],
      historicalData: Array.from({ length: 7 }, (_, i) => ({
        day: `Day ${i + 1}`,
        oil: 0,
        gas: 0,
        water: 0
      }))
    },
    {
      id: 4,
      name: 'DELTA-4',
      status: 'producing',
      oil: 5200,
      gas: 28,
      water: 22,
      pressure: 1350,
      choke: 24,
      lastMaintenance: '2023-12-05',
      nextMaintenance: '2024-04-22',
      productionEfficiency: 85.7,
      artificialLift: 'ESP',
      depth: 14200,
      location: 'D-09',
      reservoir: 'Upper Jurassic',
      alerts: [],
      historicalData: Array.from({ length: 7 }, (_, i) => ({
        day: `Day ${i + 1}`,
        oil: 5200 + Math.floor(Math.random() * 200 - 100),
        gas: 28 + (Math.random() * 2 - 1),
        water: 22 + (Math.random() * 2 - 1)
      }))
    },
    {
      id: 5,
      name: 'ECHO-9',
      status: 'maintenance',
      oil: 0,
      gas: 0,
      water: 0,
      pressure: 0,
      choke: 0,
      lastMaintenance: '2023-12-18',
      nextMaintenance: '2024-01-05',
      productionEfficiency: 0,
      artificialLift: 'Gas Lift',
      depth: 11000,
      location: 'E-14',
      reservoir: 'Cretaceous',
      alerts: [
        { id: 2, severity: 'low', message: 'Scheduled maintenance', timestamp: '2023-12-19T14:30:00', resolved: true }
      ],
      historicalData: Array.from({ length: 7 }, (_, i) => ({
        day: `Day ${i + 1}`,
        oil: 0,
        gas: 0,
        water: 0
      }))
    },
    {
      id: 6,
      name: 'FOXTROT-2',
      status: 'producing',
      oil: 4600,
      gas: 25,
      water: 18,
      pressure: 1220,
      choke: 30,
      lastMaintenance: '2023-10-30',
      nextMaintenance: '2024-03-15',
      productionEfficiency: 89.3,
      artificialLift: 'ESP',
      depth: 13200,
      location: 'F-05',
      reservoir: 'Upper Cretaceous',
      alerts: [],
      historicalData: Array.from({ length: 7 }, (_, i) => ({
        day: `Day ${i + 1}`,
        oil: 4600 + Math.floor(Math.random() * 200 - 100),
        gas: 25 + (Math.random() * 2 - 1),
        water: 18 + (Math.random() * 2 - 1)
      }))
    }
  ]);

  // State for UI interactions
  const [selectedWell, setSelectedWell] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [filter, setFilter] = useState({ status: 'all', search: '', sortBy: 'name', sortOrder: 'asc' });
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustWellId, setAdjustWellId] = useState(null);
  const [adjustSettings, setAdjustSettings] = useState({ choke: 0, artificialLift: '' });
  const [chartError, setChartError] = useState(null);

  // Simulate real-time data updates
  useEffect(() => {
    let interval;
    if (isLive) {
      interval = setInterval(() => {
        setWellPerformance(prev => prev.map(well => {
          if (well.status !== 'producing') return well;
          return {
            ...well,
            oil: Math.max(0, well.oil + Math.floor(Math.random() * 50 - 25)),
            gas: Math.max(0, well.gas + (Math.random() * 0.5 - 0.25)),
            water: Math.min(30, Math.max(0, well.water + (Math.random() * 1 - 0.5))),
            pressure: Math.min(2000, Math.max(800, well.pressure + (Math.random() * 20 - 10))),
            productionEfficiency: Math.min(100, Math.max(75, well.productionEfficiency + (Math.random() * 1 - 0.5))),
            historicalData: [
              ...well.historicalData.slice(1),
              {
                day: `Day 7`,
                oil: Math.max(0, well.oil + Math.floor(Math.random() * 50 - 25)),
                gas: Math.max(0, well.gas + (Math.random() * 0.5 - 0.25)),
                water: Math.min(30, Math.max(0, well.water + (Math.random() * 1 - 0.5)))
              }
            ]
          };
        }));

        // Simulate occasional alerts
        if (Math.random() > 0.95) {
          const alertTypes = [
            'High pressure detected',
            'Water cut increasing',
            'Flow rate anomaly',
            'Maintenance required',
            'Performance degradation'
          ];
          const randomWell = wellPerformance[Math.floor(Math.random() * wellPerformance.length)];
          const newAlert = {
            id: Date.now(),
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            message: alertTypes[Math.floor(Math.random() * alertTypes.length)],
            timestamp: new Date().toISOString(),
            resolved: false
          };
          setWellPerformance(prev => prev.map(well =>
            well.id === randomWell.id
              ? { ...well, alerts: [...well.alerts, newAlert] }
              : well
          ));
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLive, wellPerformance]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Resolve alert
  const resolveAlert = (wellId, alertId) => {
    setWellPerformance(prev => prev.map(well =>
      well.id === wellId
        ? {
            ...well,
            alerts: well.alerts.map(alert =>
              alert.id === alertId ? { ...alert, resolved: true } : alert
            )
          }
        : well
    ));
  };

  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Handle well adjustment
  const handleAdjustWell = (wellId) => {
    const well = wellPerformance.find(w => w.id === wellId);
    setAdjustWellId(wellId);
    setAdjustSettings({ choke: well.choke, artificialLift: well.artificialLift });
    setShowAdjustModal(true);
  };

  // Save adjustment
  const saveAdjustment = () => {
    setWellPerformance(prev => prev.map(well =>
      well.id === adjustWellId
        ? { ...well, choke: adjustSettings.choke, artificialLift: adjustSettings.artificialLift }
        : well
    ));
    setShowAdjustModal(false);
  };

  // Prepare CSV data
  const csvData = useMemo(() => wellPerformance.map(well => ({
    Name: well.name,
    Status: well.status,
    Oil: `${well.oil} bbl/d`,
    Gas: `${well.gas.toFixed(1)} MMscf/d`,
    Water: `${well.water.toFixed(1)}%`,
    Pressure: `${well.pressure} psi`,
    Efficiency: `${well.productionEfficiency.toFixed(1)}%`,
    'Artificial Lift': well.artificialLift,
    Location: well.location,
    Reservoir: well.reservoir,
    Depth: `${well.depth} ft`,
    'Last Maintenance': formatDate(well.lastMaintenance),
    'Next Maintenance': formatDate(well.nextMaintenance),
    Alerts: well.alerts.length > 0 ? well.alerts.map(a => a.message).join('; ') : 'None'
  })), [wellPerformance]);

  // Filtered and sorted wells
  const filteredWells = useMemo(() => {
    let wells = [...wellPerformance];
    if (filter.status !== 'all') {
      wells = wells.filter(well => well.status === filter.status);
    }
    if (filter.search) {
      wells = wells.filter(well =>
        well.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        well.location.toLowerCase().includes(filter.search.toLowerCase())
      );
    }
    wells.sort((a, b) => {
      const valueA = a[filter.sortBy];
      const valueB = b[filter.sortBy];
      if (filter.sortOrder === 'asc') {
        return typeof valueA === 'string' ? valueA.localeCompare(valueB) : valueA - valueB;
      } else {
        return typeof valueB === 'string' ? valueB.localeCompare(valueA) : valueB - valueA;
      }
    });
    return wells;
  }, [wellPerformance, filter]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => ({
    totalOil: wellPerformance.reduce((sum, well) => sum + well.oil, 0),
    totalGas: wellPerformance.reduce((sum, well) => sum + well.gas, 0),
    averageEfficiency: wellPerformance.reduce((sum, well) => sum + (well.productionEfficiency || 0), 0) /
      wellPerformance.filter(w => w.status === 'producing').length || 0,
    activeWells: wellPerformance.filter(w => w.status === 'producing').length
  }), [wellPerformance]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`py-4 px-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800 shadow-lg shadow-gray-900/50' : 'bg-gray-200 shadow-lg shadow-gray-300/50'}`}>
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">WellSync Dashboard</h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Real-time well monitoring and analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${isLive ? 'bg-emerald-600 text-white shadow-md' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-700'}`}
            >
              {isLive ? 'Live' : 'Paused'}
            </button>
            <button
              onClick={toggleTheme}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-700'}`}
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <CSVLink
              data={csvData}
              filename={`wells-data-${new Date().toISOString().split('T')[0]}.csv`}
              className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${darkMode ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              <FiDownload className="mr-1" /> Export Data
            </CSVLink>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Summary Section */}
        <section className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
          <div className={`px-4 py-3 transition-colors duration-300 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
            <h2 className="font-bold text-lg tracking-tight">Field Overview</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700/50' : 'bg-amber-50/50'}`}>
                <p className={`text-xs font-medium ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>Total Oil Production</p>
                <p className="text-2xl font-bold">{summaryMetrics.totalOil.toLocaleString()} <span className="text-sm">bbl/d</span></p>
              </div>
              <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700/50' : 'bg-green-50/50'}`}>
                <p className={`text-xs font-medium ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Total Gas Production</p>
                <p className="text-2xl font-bold">{summaryMetrics.totalGas.toFixed(1)} <span className="text-sm">MMscf/d</span></p>
              </div>
              <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700/50' : 'bg-blue-50/50'}`}>
                <p className={`text-xs font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Average Efficiency</p>
                <p className="text-2xl font-bold">{summaryMetrics.averageEfficiency.toFixed(1)}%</p>
              </div>
              <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700/50' : 'bg-purple-50/50'}`}>
                <p className={`text-xs font-medium ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>Active Wells</p>
                <p className="text-2xl font-bold">{summaryMetrics.activeWells}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Well List Section */}
        {!selectedWell && (
          <>
            <section className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
              <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                <h2 className="font-bold text-lg tracking-tight">Well Overview</h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search wells..."
                      value={filter.search}
                      onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                      className={`pl-10 pr-4 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${darkMode ? 'bg-gray-600 text-gray-300 border-gray-600' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
                    />
                  </div>
                  <select
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${darkMode ? 'bg-gray-600 text-gray-300 border-gray-600' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
                  >
                    <option value="all">All Status</option>
                    <option value="producing">Producing</option>
                    <option value="shut-in">Shut-in</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <select
                    value={filter.sortBy}
                    onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${darkMode ? 'bg-gray-600 text-gray-300 border-gray-600' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
                  >
                    <option value="name">Name</option>
                    <option value="oil">Oil Production</option>
                    <option value="productionEfficiency">Efficiency</option>
                  </select>
                  <button
                    onClick={() => setFilter({ ...filter, sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc' })}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${darkMode ? 'bg-gray-600 text-gray-300 border-gray-600' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
                  >
                    {filter.sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={darkMode ? 'bg-gray-700/50' : 'bg-gray-50/50'}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Well</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Oil</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Gas</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Water</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Pressure</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Efficiency</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Lift Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredWells.map(well => (
                      <tr key={well.id} className={`transition-all duration-200 ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50/50'}`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium flex items-center">
                            {well.name}
                            {well.alerts.length > 0 && (
                              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {well.alerts.filter(a => !a.resolved).length}
                              </span>
                            )}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{well.location} • {well.reservoir}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            well.status === 'producing' ? 'bg-emerald-100 text-emerald-800' :
                            well.status === 'shut-in' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {well.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {well.oil.toLocaleString()}
                          <span className="text-xs ml-1">bbl/d</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {well.gas.toFixed(1)}
                          <span className="text-xs ml-1">MMscf/d</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {well.water.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {well.pressure.toLocaleString()}
                          <span className="text-xs ml-1">psi</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-16 h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} mr-2`}>
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${well.productionEfficiency}%`,
                                  backgroundColor: well.productionEfficiency > 90 ? '#10b981' : well.productionEfficiency > 80 ? '#f59e0b' : '#ef4444'
                                }}
                              ></div>
                            </div>
                            {well.productionEfficiency.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            well.artificialLift === 'ESP' ? 'bg-blue-100 text-blue-800' :
                            well.artificialLift === 'Gas Lift' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {well.artificialLift}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedWell(well)}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2 transition-all duration-200"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleAdjustWell(well.id)}
                            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition-all duration-200"
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Well Performance Trends */}
            <section className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
              <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                <h2 className="font-bold text-lg tracking-tight">Performance Trends</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTimeRange('7d')}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${timeRange === '7d' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-700 text-white') : (darkMode ? 'bg-gray-600' : 'bg-gray-200')}`}
                  >
                    7D
                  </button>
                  <button
                    onClick={() => setTimeRange('30d')}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${timeRange === '30d' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-700 text-white') : (darkMode ? 'bg-gray-600' : 'bg-gray-200')}`}
                  >
                    30D
                  </button>
                </div>
              </div>
              <div className="p-4">
                {chartError ? (
                  <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FiAlertTriangle className="mx-auto h-8 w-8 mb-2" />
                    <p>Error rendering chart: {chartError}</p>
                  </div>
                ) : (
                  <div className="h-80">
                    <LineChart
                      data={wellPerformance.filter(w => w.status === 'producing').map(w => ({
                        name: w.name,
                        oil: w.oil,
                        gas: w.gas,
                        water: w.water
                      }))}
                      xKey="name"
                      yKeys={['oil', 'gas', 'water']}
                      colors={['#f59e0b', '#10b981', '#3b82f6']}
                      darkMode={darkMode}
                      setChartError={setChartError}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Maintenance Schedule */}
            <section className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
              <div className={`px-4 py-3 transition-colors duration-300 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                <h2 className="font-bold text-lg tracking-tight">Maintenance Schedule</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wellPerformance.map(well => (
                    <div
                      key={well.id}
                      className={`p-4 rounded-lg border transition-all duration-200 ${darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-100/50'}`}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{well.name}</h3>
                        <FiCalendar className="text-gray-400" />
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{well.location}</p>
                      <div className="mt-2">
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Maintenance</p>
                        <p className="text-sm">{formatDate(well.lastMaintenance)}</p>
                      </div>
                      <div className="mt-2">
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Next Maintenance</p>
                        <p className="text-sm font-medium">{formatDate(well.nextMaintenance)}</p>
                      </div>
                      <button
                        className={`mt-3 text-xs px-3 py-1 rounded-lg font-medium transition-all duration-200 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                      >
                        Schedule Maintenance
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Well Details Section */}
        {selectedWell && (
          <section className={`rounded-xl shadow-md overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
            <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
              <h2 className="font-bold text-lg tracking-tight">{selectedWell.name} Details</h2>
              <button
                onClick={() => setSelectedWell(null)}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-lg transition-all duration-200"
              >
                Back to Wells
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Well Information */}
                <div className={`p-4 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                  <h3 className="font-medium mb-4 text-lg">Well Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Location</p>
                      <p>{selectedWell.location}</p>
                    </div>
                    <div>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Reservoir</p>
                      <p>{selectedWell.reservoir}</p>
                    </div>
                    <div>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Depth</p>
                      <p>{selectedWell.depth.toLocaleString()} ft</p>
                    </div>
                    <div>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Artificial Lift</p>
                      <p>{selectedWell.artificialLift}</p>
                    </div>
                    <div>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Last Maintenance</p>
                      <p>{formatDate(selectedWell.lastMaintenance)}</p>
                    </div>
                    <div>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Next Maintenance</p>
                      <p>{formatDate(selectedWell.nextMaintenance)}</p>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className={`p-4 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                  <h3 className="font-medium mb-4 text-lg">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className={`text-xs font-medium ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>Oil Production</p>
                      <p className="text-xl font-bold">{selectedWell.oil.toLocaleString()} <span className="text-sm">bbl/d</span></p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Gas Production</p>
                      <p className="text-xl font-bold">{selectedWell.gas.toFixed(1)} <span className="text-sm">MMscf/d</span></p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Water Cut</p>
                      <p className="text-xl font-bold">{selectedWell.water.toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Pressure</p>
                      <p className="text-xl font-bold">{selectedWell.pressure.toLocaleString()} <span className="text-sm">psi</span></p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>Efficiency</p>
                      <p className="text-xl font-bold">{selectedWell.productionEfficiency.toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Choke Size</p>
                      <p className="text-xl font-bold">{selectedWell.choke}/64"</p>
                    </div>
                  </div>
                </div>

                {/* Well Alerts */}
                <div className={`p-4 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                  <h3 className="font-medium mb-4 text-lg">Active Alerts</h3>
                  {selectedWell.alerts.length > 0 ? (
                    <ul className="space-y-3">
                      {selectedWell.alerts.map(alert => (
                        <li key={alert.id} className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <div className={`h-3 w-3 rounded-full ${
                              alert.severity === 'high' ? 'bg-red-600' :
                              alert.severity === 'medium' ? 'bg-amber-600' : 'bg-gray-600'
                            }`}></div>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{alert.message}</p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatDate(alert.timestamp)} • {alert.severity.toUpperCase()}
                            </p>
                          </div>
                          {!alert.resolved && (
                            <button
                              onClick={() => resolveAlert(selectedWell.id, alert.id)}
                              className={`ml-2 text-xs px-2 py-1 rounded-lg font-medium transition-all duration-200 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                            >
                              Resolve
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FiAlertTriangle className="mx-auto h-8 w-8 mb-2" />
                      <p>No active alerts</p>
                    </div>
                  )}
                </div>

                {/* Historical Performance */}
                <div className="lg:col-span-3">
                  <h3 className="font-medium mb-4 text-lg">Historical Performance</h3>
                  {chartError ? (
                    <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FiAlertTriangle className="mx-auto h-8 w-8 mb-2" />
                      <p>Error rendering chart: {chartError}</p>
                    </div>
                  ) : (
                    <div className="h-80">
                      <BarChart
                        data={selectedWell.historicalData}
                        xKey="day"
                        yKeys={['oil', 'gas', 'water']}
                        colors={['#f59e0b', '#10b981', '#3b82f6']}
                        darkMode={darkMode}
                        setChartError={setChartError}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Adjust Well Modal */}
        {showAdjustModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg p-6 w-full max-w-md transition-all duration-200 ${darkMode ? 'bg-gray-800/80 text-gray-100 backdrop-blur-sm' : 'bg-white/80 text-gray-900 backdrop-blur-sm'}`}>
              <h3 className="text-lg font-bold mb-4">Adjust Well Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Choke Size (1/64")</label>
                  <input
                    type="number"
                    value={adjustSettings.choke}
                    onChange={(e) => setAdjustSettings({ ...adjustSettings, choke: parseInt(e.target.value) })}
                    className={`w-full p-2 rounded-lg font-medium transition-all duration-200 ${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Artificial Lift</label>
                  <select
                    value={adjustSettings.artificialLift}
                    onChange={(e) => setAdjustSettings({ ...adjustSettings, artificialLift: e.target.value })}
                    className={`w-full p-2 rounded-lg font-medium transition-all duration-200 ${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
                  >
                    <option value="ESP">ESP</option>
                    <option value="Gas Lift">Gas Lift</option>
                    <option value="Rod Pump">Rod Pump</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAdjustment}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium transition-all duration-200"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

    
    </div>
  );
}
