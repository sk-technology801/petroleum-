
// src/app/production/optimization/page.jsx
"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { FiSearch, FiDownload, FiSettings, FiAlertTriangle, FiCalendar, FiFilter, FiBarChart, FiMessageSquare } from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import Head from 'next/head';

// Lazy-load ChartComponents
const BarChart = dynamic(() => import('../wells/ChartComponents').then(mod => mod.BarChart), { ssr: false });
const LineChart = dynamic(() => import('../wells/ChartComponents').then(mod => mod.LineChart), { ssr: false });

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
    <div className="h-80 bg-gray-300 rounded"></div>
    <div className="grid grid-cols-3 gap-4">
      <div className="h-20 bg-gray-300 rounded"></div>
      <div className="h-20 bg-gray-300 rounded"></div>
      <div className="h-20 bg-gray-300 rounded"></div>
    </div>
  </div>
);

// Sample well data (replace with API in production)
const initialWellData = [
  {
    id: 1, name: 'ALPHA-1', status: 'producing', oil: 4200, gas: 22, water: 15, pressure: 1280, choke: 28,
    productionEfficiency: 88.5, artificialLift: 'ESP', depth: 12500, location: 'A-12', reservoir: 'Upper Cretaceous',
    alerts: [{ id: 1, severity: 'medium', message: 'Water cut increasing', timestamp: '2023-12-20T07:15:33', resolved: false, comments: [] }],
    historicalData: Array.from({ length: 7 }, (_, i) => ({
      day: `Day ${i + 1}`, oil: 4200 + Math.floor(Math.random() * 200 - 100),
      gas: 22 + (Math.random() * 2 - 1), water: 15 + (Math.random() * 2 - 1)
    }))
  },
  {
    id: 2, name: 'BRAVO-3', status: 'producing', oil: 3800, gas: 18, water: 12, pressure: 1150, choke: 32,
    productionEfficiency: 91.2, artificialLift: 'Gas Lift', depth: 9800, location: 'B-07', reservoir: 'Lower Jurassic',
    alerts: [], historicalData: Array.from({ length: 7 }, (_, i) => ({
      day: `Day ${i + 1}`, oil: 3800 + Math.floor(Math.random() * 200 - 100),
      gas: 18 + (Math.random() * 2 - 1), water: 12 + (Math.random() * 2 - 1)
    }))
  },
  {
    id: 3, name: 'CHARLIE-7', status: 'shut-in', oil: 0, gas: 0, water: 0, pressure: 0, choke: 0,
    productionEfficiency: 0, artificialLift: 'Rod Pump', depth: 7500, location: 'C-03', reservoir: 'Triassic',
    alerts: [], historicalData: Array.from({ length: 7 }, (_, i) => ({ day: `Day ${i + 1}`, oil: 0, gas: 0, water: 0 }))
  },
  // Add more wells as needed
];

export default function OptimizationPage() {
  const [theme, setTheme] = useState('dark');
  const [wellPerformance, setWellPerformance] = useState(initialWellData);
  const [filter, setFilter] = useState({ search: '', sortBy: 'optimizationScore', sortOrder: 'desc', status: 'all' });
  const [chartError, setChartError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adjustWellIds, setAdjustWellIds] = useState([]);
  const [adjustSettings, setAdjustSettings] = useState({ choke: 0, artificialLift: '' });
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedWell, setSelectedWell] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertDetails, setAlertDetails] = useState(null);
  const [alertComment, setAlertComment] = useState('');

  // Simulate real-time data updates
  useEffect(() => {
    setIsLoading(false);
    const interval = setInterval(() => {
      setWellPerformance(prev => prev.map(well => {
        if (well.status !== 'producing') return well;
        return {
          ...well,
          oil: Math.max(0, well.oil + Math.floor(Math.random() * 50 - 25)),
          gas: Math.max(0, well.gas + (Math.random() * 0.5 - 0.25)),
          water: Math.min(30, Math.max(0, well.water + (Math.random() * 1 - 0.5))),
          pressure: Math.min(2000, Math.max(800, well.pressure + (Math.random() * 20 - 10))),
          productionEfficiency: Math.min(100, Math.max(75, well.productionEfficiency + (Math.random() * 1 - 0.5)))
        };
      }));
      if (Math.random() > 0.95) {
        const alertTypes = ['High pressure detected', 'Water cut increasing', 'Flow rate anomaly', 'Maintenance required'];
        const randomWell = wellPerformance[Math.floor(Math.random() * wellPerformance.length)];
        const newAlert = {
          id: Date.now(),
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          message: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          timestamp: new Date().toISOString(),
          resolved: false,
          comments: []
        };
        setWellPerformance(prev => prev.map(well =>
          well.id === randomWell.id ? { ...well, alerts: [...well.alerts, newAlert] } : well
        ));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [wellPerformance]);

  // Theme styles
  const themeStyles = useMemo(() => ({
    dark: { bg: 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100', card: 'bg-gray-800/80 backdrop-blur-sm', cardHeader: 'bg-gray-700/50', border: 'border-gray-700' },
    light: { bg: 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900', card: 'bg-white/80 backdrop-blur-sm', cardHeader: 'bg-gray-100/50', border: 'border-gray-200' },
    highContrast: { bg: 'bg-black text-white', card: 'bg-gray-900/80', cardHeader: 'bg-gray-800/50', border: 'border-white' }
  }), []);

  // Calculate optimization score
  const calculateOptimizationScore = useCallback((well) => {
    const efficiencyWeight = 0.4;
    const waterCutWeight = 0.3;
    const pressureStabilityWeight = 0.2;
    const alertWeight = 0.1;
    const normalizedEfficiency = well.productionEfficiency / 100;
    const normalizedWaterCut = 1 - (well.water / 30);
    const pressureStability = 1 - Math.abs(well.pressure - 1200) / 1200; // Ideal pressure: 1200 psi
    const alertScore = well.alerts.filter(a => !a.resolved).length === 0 ? 1 : 0.5;
    return (efficiencyWeight * normalizedEfficiency + waterCutWeight * normalizedWaterCut + pressureStabilityWeight * pressureStability + alertWeight * alertScore) * 100;
  }, []);

  // Recommend choke setting
  const recommendChoke = useCallback((well) => {
    const efficiency = well.productionEfficiency;
    const waterCut = well.water;
    return efficiency < 85 && waterCut > 20 ? Math.max(16, well.choke - 4) : efficiency > 90 ? Math.min(48, well.choke + 4) : well.choke;
  }, []);

  // Memoized filtered and sorted wells
  const filteredWells = useMemo(() => {
    return wellPerformance
      .map(well => ({ ...well, optimizationScore: calculateOptimizationScore(well), recommendedChoke: recommendChoke(well) }))
      .filter(well => filter.status === 'all' || well.status === filter.status)
      .filter(well => !filter.search || well.name.toLowerCase().includes(filter.search.toLowerCase()) || well.location.toLowerCase().includes(filter.search.toLowerCase()))
      .sort((a, b) => {
        const valueA = a[filter.sortBy];
        const valueB = b[filter.sortBy];
        return filter.sortOrder === 'desc'
          ? (typeof valueA === 'string' ? valueB.localeCompare(valueA) : valueB - valueA)
          : (typeof valueA === 'string' ? valueA.localeCompare(valueB) : valueA - valueB);
      });
  }, [wellPerformance, filter, calculateOptimizationScore, recommendChoke]);

  // Memoized CSV and JSON data
  const csvData = useMemo(() => filteredWells.map(well => ({
    Name: well.name,
    Status: well.status,
    'Optimization Score': well.optimizationScore.toFixed(1),
    Oil: `${well.oil} bbl/d`,
    Gas: `${well.gas.toFixed(1)} MMscf/d`,
    Water: `${well.water.toFixed(1)}%`,
    Pressure: `${well.pressure} psi`,
    Efficiency: `${well.productionEfficiency.toFixed(1)}%`,
    'Choke Size': `${well.choke}/64"`,
    'Recommended Choke': `${well.recommendedChoke}/64"`,
    Alerts: well.alerts.length > 0 ? well.alerts.map(a => a.message).join('; ') : 'None'
  })), [filteredWells]);

  const jsonData = useMemo(() => JSON.stringify(filteredWells, null, 2), [filteredWells]);

  // Handle well adjustments
  const handleAdjustWell = useCallback((wellIds) => {
    setAdjustWellIds(wellIds);
    const well = wellPerformance.find(w => w.id === wellIds[0]);
    setAdjustSettings({ choke: well.choke, artificialLift: well.artificialLift });
    setShowAdjustModal(true);
  }, [wellPerformance]);

  const saveAdjustment = useCallback(() => {
    setWellPerformance(prev => prev.map(well =>
      adjustWellIds.includes(well.id) ? { ...well, choke: adjustSettings.choke, artificialLift: adjustSettings.artificialLift } : well
    ));
    setShowAdjustModal(false);
    setAdjustWellIds([]);
  }, [adjustWellIds, adjustSettings]);

  // Handle alert resolution
  const handleResolveAlert = useCallback((wellId, alertId, comment) => {
    setWellPerformance(prev => prev.map(well =>
      well.id === wellId ? {
        ...well,
        alerts: well.alerts.map(alert =>
          alert.id === alertId ? { ...alert, resolved: true, comments: [...alert.comments, { text: comment, timestamp: new Date().toISOString() }] } : alert
        )
      } : well
    ));
    setShowAlertModal(false);
    setAlertComment('');
  }, []);

  const openAlertModal = useCallback((wellId, alert) => {
    setAlertDetails({ wellId, alert });
    setShowAlertModal(true);
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);

  return (
    <>
      <Head>
        <title>WellSync Advanced Optimization Dashboard</title>
        <meta name="description" content="Optimize well performance with real-time analytics, predictive recommendations, and interactive controls." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={`min-h-screen transition-colors duration-300 ${themeStyles[theme].bg}`}>
        {/* Header */}
        <header className={`py-4 px-6 transition-colors duration-300 ${themeStyles[theme].cardHeader} shadow-lg shadow-gray-900/50`}>
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">WellSync Optimization Hub</h1>
              <p className={`text-sm ${theme === 'highContrast' ? 'text-gray-300' : 'text-gray-400'}`}>Advanced analytics for maximizing well performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                aria-label="Select theme"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="highContrast">High Contrast</option>
              </select>
              <CSVLink
                data={csvData}
                filename={`optimization-report-${new Date().toISOString().split('T')[0]}.csv`}
                className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${theme === 'highContrast' ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                aria-label="Export optimization data as CSV"
              >
                <FiDownload className="mr-1" /> CSV
              </CSVLink>
              <a
                href={`data:text/json;charset=utf-8,${encodeURIComponent(jsonData)}`}
                download={`optimization-report-${new Date().toISOString().split('T')[0]}.json`}
                className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${theme === 'highContrast' ? 'bg-green-700 text-white hover:bg-green-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                aria-label="Export optimization data as JSON"
              >
                <FiDownload className="mr-1" /> JSON
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {/* Optimization Summary */}
          <section className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}>
            <div className={`px-4 py-3 transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
              <h2 className="font-bold text-lg tracking-tight">Optimization Summary</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg text-center ${theme === 'highContrast' ? 'bg-gray-900' : 'bg-amber-50/50'}`}>
                  <p className={`text-xs font-medium ${theme === 'highContrast' ? 'text-amber-300' : 'text-amber-800'}`}>Average Optimization Score</p>
                  <p className="text-2xl font-bold">{filteredWells.reduce((sum, well) => sum + well.optimizationScore, 0).toFixed(1) / filteredWells.length || 0}%</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${theme === 'highContrast' ? 'bg-gray-900' : 'bg-green-50/50'}`}>
                  <p className={`text-xs font-medium ${theme === 'highContrast' ? 'text-green-300' : 'text-green-800'}`}>Active Wells</p>
                  <p className="text-2xl font-bold">{filteredWells.filter(w => w.status === 'producing').length}</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${theme === 'highContrast' ? 'bg-gray-900' : 'bg-blue-50/50'}`}>
                  <p className={`text-xs font-medium ${theme === 'highContrast' ? 'text-blue-300' : 'text-blue-800'}`}>Total Alerts</p>
                  <p className="text-2xl font-bold">{filteredWells.reduce((sum, well) => sum + well.alerts.filter(a => !a.resolved).length, 0)}</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${theme === 'highContrast' ? 'bg-gray-900' : 'bg-purple-50/50'}`}>
                  <p className={`text-xs font-medium ${theme === 'highContrast' ? 'text-purple-300' : 'text-purple-800'}`}>Optimization Potential</p>
                  <p className="text-2xl font-bold">{filteredWells.filter(w => w.optimizationScore < 80).length} wells</p>
                </div>
              </div>
            </div>
          </section>

          {/* Well Optimization Table */}
          <section className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}>
            <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
              <h2 className="font-bold text-lg tracking-tight">Well Optimization</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search wells..."
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    className={`pl-10 pr-4 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                    aria-label="Search wells by name or location"
                  />
                </div>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                  aria-label="Filter wells by status"
                >
                  <option value="all">All Status</option>
                  <option value="producing">Producing</option>
                  <option value="shut-in">Shut-in</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                <select
                  value={filter.sortBy}
                  onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                  aria-label="Sort wells by"
                >
                  <option value="optimizationScore">Optimization Score</option>
                  <option value="name">Name</option>
                  <option value="productionEfficiency">Efficiency</option>
                </select>
                <button
                  onClick={() => setFilter({ ...filter, sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc' })}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                  aria-label="Toggle sort order"
                >
                  {filter.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
                <button
                  onClick={() => handleAdjustWell(filteredWells.filter(w => w.status === 'producing').map(w => w.id))}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-all duration-200"
                  aria-label="Optimize all producing wells"
                >
                  Optimize All
                </button>
              </div>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" role="grid">
                <thead className={themeStyles[theme].cardHeader}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Well</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Optimization Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Oil</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Water</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Efficiency</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Recommended Choke</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${themeStyles[theme].border}`}>
                  {filteredWells.map(well => (
                    <tr key={well.id} className={`transition-all duration-200 ${theme === 'highContrast' ? 'hover:bg-gray-800' : 'hover:bg-gray-50/50'}`} role="row">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium flex items-center">
                          {well.name}
                          {well.alerts.length > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                              {well.alerts.filter(a => !a.resolved).length}
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${theme === 'highContrast' ? 'text-gray-300' : 'text-gray-500'}`}>{well.location} • {well.reservoir}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          well.status === 'producing' ? 'bg-emerald-100 text-emerald-800' :
                          well.status === 'shut-in' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {well.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`font-medium ${well.optimizationScore > 80 ? 'text-green-500' : well.optimizationScore > 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {well.optimizationScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{well.oil.toLocaleString()} <span className="text-xs">bbl/d</span></td>
                      <td className="px-4 py-3 whitespace-nowrap">{well.water.toFixed(1)}%</td>
                      <td className="px-4 py-3 whitespace-nowrap">{well.productionEfficiency.toFixed(1)}%</td>
                      <td className="px-4 py-3 whitespace-nowrap">{well.recommendedChoke}/64"</td>
                      <td className="px-4 py-3 whitespace-nowrap flex space-x-2">
                        <button
                          onClick={() => handleAdjustWell([well.id])}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-all duration-200"
                          aria-label={`Optimize ${well.name}`}
                        >
                          Optimize
                        </button>
                        <button
                          onClick={() => setSelectedWell(well)}
                          className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition-all duration-200"
                          aria-label={`View details for ${well.name}`}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Optimization Trends */}
          <Suspense fallback={<SkeletonLoader />}>
            <section className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}>
              <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
                <h2 className="font-bold text-lg tracking-tight">Optimization Trends</h2>
                <button
                  onClick={() => setSelectedWell(null)}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition-all duration-200"
                  aria-label="Clear selected well"
                >
                  Clear Selection
                </button>
              </div>
              <div className="p-4">
                {chartError ? (
                  <div className={`text-center py-4 ${theme === 'highContrast' ? 'text-gray-300' : 'text-gray-500'}`}>
                    <FiAlertTriangle className="mx-auto h-8 w-8 mb-2" aria-hidden="true" />
                    <p>Error rendering chart: {chartError}</p>
                  </div>
                ) : selectedWell ? (
                  <div className="h-80">
                    <LineChart
                      data={selectedWell.historicalData}
                      xKey="day"
                      yKeys={['oil', 'gas', 'water']}
                      colors={['#f59e0b', '#10b981', '#3b82f6']}
                      darkMode={theme === 'dark' || theme === 'highContrast'}
                      setChartError={setChartError}
                      onClick={(wellName) => setSelectedWell(wellPerformance.find(w => w.name === wellName))}
                    />
                  </div>
                ) : (
                  <div className="h-80">
                    <BarChart
                      data={filteredWells.map(well => ({
                        name: well.name,
                        optimizationScore: well.optimizationScore,
                        productionEfficiency: well.productionEfficiency
                      }))}
                      xKey="name"
                      yKeys={['optimizationScore', 'productionEfficiency']}
                      colors={['#10b981', '#f59e0b']}
                      darkMode={theme === 'dark' || theme === 'highContrast'}
                      setChartError={setChartError}
                      onClick={(wellName) => setSelectedWell(wellPerformance.find(w => w.name === wellName))}
                    />
                  </div>
                )}
              </div>
            </section>
          </Suspense>

          {/* Alerts Management */}
          <section className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}>
            <div className={`px-4 py-3 transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
              <h2 className="font-bold text-lg tracking-tight">Alert Management</h2>
            </div>
            <div className="p-4">
              {filteredWells.some(well => well.alerts.length > 0) ? (
                <div className="space-y-4">
                  {filteredWells.map(well => well.alerts.map(alert => (
                    <div key={alert.id} className={`p-4 rounded-lg border ${themeStyles[theme].border}`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`h-3 w-3 rounded-full ${
                            alert.severity === 'high' ? 'bg-red-600' :
                            alert.severity === 'medium' ? 'bg-amber-600' : 'bg-gray-600'
                          }`}></div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className={`text-sm ${theme === 'highContrast' ? 'text-white' : 'text-gray-800'}`}>{alert.message} ({well.name})</p>
                          <p className={`text-xs ${theme === 'highContrast' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {formatDate(alert.timestamp)} • {alert.severity.toUpperCase()}
                          </p>
                          {alert.comments.length > 0 && (
                            <div className="mt-2">
                              <p className={`text-xs font-medium ${theme === 'highContrast' ? 'text-gray-300' : 'text-gray-600'}`}>Comments:</p>
                              <ul className="text-xs list-disc pl-4">
                                {alert.comments.map((comment, i) => (
                                  <li key={i}>{comment.text} ({formatDate(comment.timestamp)})</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        {!alert.resolved && (
                          <button
                            onClick={() => openAlertModal(well.id, alert)}
                            className={`ml-2 text-xs px-2 py-1 rounded-lg font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                            aria-label={`Resolve alert: ${alert.message}`}
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  )))}
                </div>
              ) : (
                <div className={`text-center py-4 ${theme === 'highContrast' ? 'text-gray-300' : 'text-gray-500'}`}>
                  <FiAlertTriangle className="mx-auto h-8 w-8 mb-2" aria-hidden="true" />
                  <p>No active alerts</p>
                </div>
              )}
            </div>
          </section>

          {/* Well Details */}
          {selectedWell && (
            <section className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}>
              <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
                <h2 className="font-bold text-lg tracking-tight">{selectedWell.name} Optimization Details</h2>
                <button
                  onClick={() => setSelectedWell(null)}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition-all duration-200"
                  aria-label="Back to overview"
                >
                  Back
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`p-4 rounded-lg ${themeStyles[theme].card}`}>
                  <h3 className="font-medium mb-4 text-lg">Well Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className={theme === 'highContrast' ? 'text-gray-300' : 'text-gray-600'}>Location</p>
                      <p>{selectedWell.location}</p>
                    </div>
                    <div>
                      <p className={theme === 'highContrast' ? 'text-gray-300' : 'text-gray-600'}>Reservoir</p>
                      <p>{selectedWell.reservoir}</p>
                    </div>
                    <div>
                      <p className={theme === 'highContrast' ? 'text-gray-300' : 'text-gray-600'}>Depth</p>
                      <p>{selectedWell.depth.toLocaleString()} ft</p>
                    </div>
                    <div>
                      <p className={theme === 'highContrast' ? 'text-gray-300' : 'text-gray-600'}>Artificial Lift</p>
                      <p>{selectedWell.artificialLift}</p>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles[theme].card}`}>
                  <h3 className="font-medium mb-4 text-lg">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className={`text-xs font-medium ${theme === 'highContrast' ? 'text-amber-300' : 'text-amber-800'}`}>Oil Production</p>
                      <p className="text-xl font-bold">{selectedWell.oil.toLocaleString()} <span className="text-sm">bbl/d</span></p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${theme === 'highContrast' ? 'text-green-300' : 'text-green-800'}`}>Gas Production</p>
                      <p className="text-xl font-bold">{selectedWell.gas.toFixed(1)} <span className="text-sm">MMscf/d</span></p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${theme === 'highContrast' ? 'text-blue-300' : 'text-blue-800'}`}>Water Cut</p>
                      <p className="text-xl font-bold">{selectedWell.water.toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${theme === 'highContrast' ? 'text-gray-300' : 'text-gray-600'}`}>Pressure</p>
                      <p className="text-xl font-bold">{selectedWell.pressure.toLocaleString()} <span className="text-sm">psi</span></p>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles[theme].card}`}>
                  <h3 className="font-medium mb-4 text-lg">Optimization Recommendations</h3>
                  <div className="text-sm">
                    <p className={theme === 'highContrast' ? 'text-gray-300' : 'text-gray-600'}>Recommended Choke Size</p>
                    <p className="font-bold">{selectedWell.recommendedChoke}/64"</p>
                    <p className={theme === 'highContrast' ? 'text-gray-300' : 'text-gray-600'}>Optimization Score</p>
                    <p className={`font-bold ${selectedWell.optimizationScore > 80 ? 'text-green-500' : selectedWell.optimizationScore > 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {selectedWell.optimizationScore.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Adjust Well Modal */}
          {showAdjustModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
              <div className={`rounded-lg p-6 w-full max-w-md transition-all duration-200 ${themeStyles[theme].card}`}>
                <h3 className="text-lg font-bold mb-4">Optimize Well Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'highContrast' ? 'text-gray-300' : 'text-gray-600'}`} htmlFor="choke-size">Choke Size (1/64")</label>
                    <input
                      id="choke-size"
                      type="number"
                      value={adjustSettings.choke}
                      onChange={(e) => setAdjustSettings({ ...adjustSettings, choke: parseInt(e.target.value) })}
                      className={`w-full p-2 rounded-lg font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                      aria-label="Choke size input"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'highContrast' ? 'text-gray-300' : 'text-gray-600'}`} htmlFor="artificial-lift">Artificial Lift</label>
                    <select
                      id="artificial-lift"
                      value={adjustSettings.artificialLift}
                      onChange={(e) => setAdjustSettings({ ...adjustSettings, artificialLift: e.target.value })}
                      className={`w-full p-2 rounded-lg font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                      aria-label="Artificial lift selection"
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
                    aria-label="Cancel optimization"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveAdjustment}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium transition-all duration-200"
                    aria-label="Save optimization settings"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Alert Resolution Modal */}
          {showAlertModal && alertDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
              <div className={`rounded-lg p-6 w-full max-w-md transition-all duration-200 ${themeStyles[theme].card}`}>
                <h3 className="text-lg font-bold mb-4">Resolve Alert</h3>
                <p className="text-sm">{alertDetails.alert.message} (Well: {wellPerformance.find(w => w.id === alertDetails.wellId).name})</p>
                <p className={`text-xs ${theme === 'highContrast' ? 'text-gray-300' : 'text-gray-500'}`}>{formatDate(alertDetails.alert.timestamp)}</p>
                <div className="mt-4">
                  <label className={`block text-sm font-medium ${theme === 'highContrast' ? 'text-gray-300' : 'text-gray-600'}`} htmlFor="alert-comment">Resolution Comment</label>
                  <textarea
                    id="alert-comment"
                    value={alertComment}
                    onChange={(e) => setAlertComment(e.target.value)}
                    className={`w-full p-2 rounded-lg font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                    rows="4"
                    aria-label="Alert resolution comment"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setShowAlertModal(false)}
                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-lg font-medium transition-all duration-200"
                    aria-label="Cancel alert resolution"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleResolveAlert(alertDetails.wellId, alertDetails.alert.id, alertComment)}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium transition-all duration-200"
                    aria-label="Resolve alert"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

      
      </div>
    </>
  );
}
