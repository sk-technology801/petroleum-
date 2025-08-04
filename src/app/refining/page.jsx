
// src/app/refining/page.jsx
"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiDownload, FiSettings, FiAlertTriangle, FiCalendar, FiFilter, FiBarChart, FiMessageSquare, FiMap, FiClock, FiGauge } from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import Head from 'next/head';
import { jsPDF } from 'jspdf';

// Lazy-load ChartComponents and RefineryMap
const BarChart = dynamic(() => import('../production/wells/ChartComponents').then(mod => mod.BarChart), { ssr: false });
const LineChart = dynamic(() => import('../production/wells/ChartComponents').then(mod => mod.LineChart), { ssr: false });
const RefineryMap = dynamic(() => import('./RefineryMap'), { ssr: false });

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
    <div className="h-80 bg-gray-300 rounded"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="h-20 bg-gray-300 rounded"></div>
      <div className="h-20 bg-gray-300 rounded"></div>
      <div className="h-20 bg-gray-300 rounded"></div>
      <div className="h-20 bg-gray-300 rounded"></div>
    </div>
    <div className="h-60 bg-gray-300 rounded"></div>
    <div className="h-40 bg-gray-300 rounded"></div>
  </div>
);

// Sample refinery unit data (replace with API in production)
const initialUnitData = [
  {
    id: 1, name: 'Crude Distillation Unit (CDU-1)', status: 'operational', throughput: 50000, yield: 85.5, energyConsumption: 1200, emissions: 150,
    temperature: 350, pressure: 2.5, feedRate: 48000, healthScore: 88, lastMaintenance: '2025-06-15',
    coordinates: { x: 100, y: 200, z: 50 },
    alerts: [{ id: 1, severity: 'medium', message: 'High emissions detected', timestamp: '2025-08-01T09:00:00', resolved: false, comments: [] }],
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`, throughput: 50000 + Math.floor(Math.random() * 1000 - 500),
      yield: 85.5 + (Math.random() * 2 - 1), emissions: 150 + (Math.random() * 10 - 5)
    }))
  },
  {
    id: 2, name: 'Fluid Catalytic Cracker (FCC-1)', status: 'operational', throughput: 30000, yield: 90.2, energyConsumption: 800, emissions: 100,
    temperature: 500, pressure: 1.8, feedRate: 29000, healthScore: 92, lastMaintenance: '2025-07-10',
    coordinates: { x: 150, y: 250, z: 60 },
    alerts: [], historicalData: Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`, throughput: 30000 + Math.floor(Math.random() * 800 - 400),
      yield: 90.2 + (Math.random() * 1.5 - 0.75), emissions: 100 + (Math.random() * 8 - 4)
    }))
  },
  {
    id: 3, name: 'Hydrotreater (HT-1)', status: 'maintenance', throughput: 0, yield: 0, energyConsumption: 0, emissions: 0,
    temperature: 0, pressure: 0, feedRate: 0, healthScore: 0, lastMaintenance: '2025-08-02',
    coordinates: { x: 200, y: 300, z: 40 },
    alerts: [], historicalData: Array.from({ length: 30 }, (_, i) => ({ day: `Day ${i + 1}`, throughput: 0, yield: 0, emissions: 0 }))
  },
];

export default function RefiningPage() {
  const [theme, setTheme] = useState('industrial');
  const [unitPerformance, setUnitPerformance] = useState(initialUnitData);
  const [filter, setFilter] = useState({ search: '', sortBy: 'healthScore', sortOrder: 'desc', status: 'all', timeRange: '30d' });
  const [chartError, setChartError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adjustUnitIds, setAdjustUnitIds] = useState([]);
  const [adjustSettings, setAdjustSettings] = useState({ feedRate: 0, temperature: 0 });
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertDetails, setAlertDetails] = useState(null);
  const [alertComment, setAlertComment] = useState('');
  const [customAlertThresholds, setCustomAlertThresholds] = useState({ emissions: 200, yieldDrop: 5 });
  const [showCustomAlertModal, setShowCustomAlertModal] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [showMap, setShowMap] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    setIsLoading(false);
    const interval = setInterval(() => {
      setUnitPerformance(prev => prev.map(unit => {
        if (unit.status !== 'operational') return unit;
        const newThroughput = Math.max(0, unit.throughput + Math.floor(Math.random() * 500 - 250));
        const newYield = Math.min(100, Math.max(70, unit.yield + (Math.random() * 1 - 0.5)));
        const newEmissions = Math.max(0, unit.emissions + (Math.random() * 5 - 2.5));
        if (newEmissions > customAlertThresholds.emissions || (unit.yield - newYield) > customAlertThresholds.yieldDrop) {
          const newAlert = {
            id: Date.now(),
            severity: 'medium',
            message: newEmissions > customAlertThresholds.emissions ? `Emissions exceeded ${customAlertThresholds.emissions} tCO2` : `Yield dropped by ${customAlertThresholds.yieldDrop}%`,
            timestamp: new Date().toISOString(),
            resolved: false,
            comments: []
          };
          return {
            ...unit,
            throughput: newThroughput,
            yield: newYield,
            emissions: newEmissions,
            temperature: Math.min(600, Math.max(200, unit.temperature + (Math.random() * 10 - 5))),
            pressure: Math.min(5, Math.max(1, unit.pressure + (Math.random() * 0.2 - 0.1))),
            alerts: [...unit.alerts, newAlert]
          };
        }
        return {
          ...unit,
          throughput: newThroughput,
          yield: newYield,
          emissions: newEmissions,
          temperature: Math.min(600, Math.max(200, unit.temperature + (Math.random() * 10 - 5))),
          pressure: Math.min(5, Math.max(1, unit.pressure + (Math.random() * 0.2 - 0.1)))
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [customAlertThresholds]);

  // Theme styles
  const themeStyles = useMemo(() => ({
    dark: { bg: 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100', card: 'bg-gray-800/80 backdrop-blur-md', cardHeader: 'bg-gray-700/50', border: 'border-gray-700', textSecondary: 'text-gray-400' },
    light: { bg: 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900', card: 'bg-white/80 backdrop-blur-md', cardHeader: 'bg-gray-100/50', border: 'border-gray-200', textSecondary: 'text-gray-600' },
    highContrast: { bg: 'bg-black text-white', card: 'bg-gray-900/90 backdrop-blur-md', cardHeader: 'bg-gray-800/50', border: 'border-white', textSecondary: 'text-gray-300' },
    industrial: { bg: 'bg-gradient-to-br from-gray-700 to-blue-900 text-white', card: 'bg-gray-800/80 backdrop-blur-md', cardHeader: 'bg-blue-900/50', border: 'border-gray-600', textSecondary: 'text-gray-300' }
  }), []);

  // Calculate health score
  const calculateHealthScore = useCallback((unit) => {
    const yieldWeight = 0.4;
    const emissionsWeight = 0.3;
    const energyWeight = 0.2;
    const alertWeight = 0.1;
    const normalizedYield = unit.yield / 100;
    const normalizedEmissions = 1 - (unit.emissions / 300);
    const normalizedEnergy = 1 - (unit.energyConsumption / 2000);
    const alertScore = unit.alerts.filter(a => !a.resolved).length === 0 ? 1 : 0.5;
    return (yieldWeight * normalizedYield + emissionsWeight * normalizedEmissions + energyWeight * normalizedEnergy + alertWeight * alertScore) * 100;
  }, []);

  // Recommend maintenance schedule
  const recommendMaintenance = useCallback((unit) => {
    const lastMaintenanceDate = new Date(unit.lastMaintenance);
    const daysSinceMaintenance = (new Date() - lastMaintenanceDate) / (1000 * 60 * 60 * 24);
    return unit.healthScore < 80 || daysSinceMaintenance > 180 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null;
  }, []);

  // Memoized filtered and sorted units
  const filteredUnits = useMemo(() => {
    return unitPerformance
      .map(unit => ({ ...unit, healthScore: calculateHealthScore(unit), recommendedMaintenance: recommendMaintenance(unit) }))
      .filter(unit => filter.status === 'all' || unit.status === filter.status)
      .filter(unit => !filter.search || unit.name.toLowerCase().includes(filter.search.toLowerCase()))
      .sort((a, b) => {
        const valueA = a[filter.sortBy];
        const valueB = b[filter.sortBy];
        return filter.sortOrder === 'desc'
          ? (typeof valueA === 'string' ? valueB.localeCompare(valueA) : valueB - valueA)
          : (typeof valueA === 'string' ? valueA.localeCompare(valueB) : valueA - valueB);
      });
  }, [unitPerformance, filter, calculateHealthScore, recommendMaintenance]);

  // Memoized CSV and JSON data
  const csvData = useMemo(() => filteredUnits.map(unit => ({
    Name: unit.name,
    Status: unit.status,
    'Health Score': unit.healthScore.toFixed(1),
    Throughput: `${unit.throughput} bbl/d`,
    Yield: `${unit.yield.toFixed(1)}%`,
    Emissions: `${unit.emissions} tCO2`,
    'Energy Consumption': `${unit.energyConsumption} kWh`,
    Temperature: `${unit.temperature}°C`,
    Pressure: `${unit.pressure.toFixed(1)} bar`,
    'Recommended Maintenance': unit.recommendedMaintenance || 'N/A',
    Alerts: unit.alerts.length > 0 ? unit.alerts.map(a => a.message).join('; ') : 'None'
  })), [filteredUnits]);

  const jsonData = useMemo(() => JSON.stringify(filteredUnits, null, 2), [filteredUnits]);

  // PDF generation
  const generatePDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('RefineSync Operations Report', 10, 10);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 20);
    filteredUnits.forEach((unit, i) => {
      doc.text(`${unit.name}: Health Score ${unit.healthScore.toFixed(1)} | Throughput ${unit.throughput} bbl/d | Yield ${unit.yield.toFixed(1)}%`, 10, 30 + i * 10);
    });
    doc.save(`refining-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }, [filteredUnits]);

  // Handle unit adjustments
  const handleAdjustUnit = useCallback((unitIds) => {
    setAdjustUnitIds(unitIds);
    const unit = unitPerformance.find(u => u.id === unitIds[0]);
    setAdjustSettings({ feedRate: unit.feedRate, temperature: unit.temperature });
    setShowAdjustModal(true);
    setActivityLog(prev => [...prev, { action: `Opened adjustment for ${unitIds.length} unit(s)`, timestamp: new Date().toISOString() }]);
  }, [unitPerformance]);

  const saveAdjustment = useCallback(() => {
    setUnitPerformance(prev => prev.map(unit =>
      adjustUnitIds.includes(unit.id) ? { ...unit, feedRate: adjustSettings.feedRate, temperature: adjustSettings.temperature } : unit
    ));
    setActivityLog(prev => [...prev, { action: `Adjusted ${adjustUnitIds.length} unit(s)`, timestamp: new Date().toISOString() }]);
    setShowAdjustModal(false);
    setAdjustUnitIds([]);
  }, [adjustUnitIds, adjustSettings]);

  // Handle alert resolution
  const handleResolveAlert = useCallback((unitId, alertId, comment) => {
    setUnitPerformance(prev => prev.map(unit =>
      unit.id === unitId ? {
        ...unit,
        alerts: unit.alerts.map(alert =>
          alert.id === alertId ? { ...alert, resolved: true, comments: [...alert.comments, { text: comment, timestamp: new Date().toISOString() }] } : alert
        )
      } : unit
    ));
    setActivityLog(prev => [...prev, { action: `Resolved alert for unit ${unitId}`, timestamp: new Date().toISOString() }]);
    setShowAlertModal(false);
    setAlertComment('');
  }, []);

  const openAlertModal = useCallback((unitId, alert) => {
    setAlertDetails({ unitId, alert });
    setShowAlertModal(true);
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }, []);

  // Handle custom alert thresholds
  const saveCustomAlertThresholds = useCallback(() => {
    setActivityLog(prev => [...prev, { action: `Updated custom alert thresholds`, timestamp: new Date().toISOString() }]);
    setShowCustomAlertModal(false);
  }, []);

  return (
    <>
      <Head>
        <title>RefineSync Advanced Refining Dashboard</title>
        <meta name="description" content="Optimize refinery operations with real-time analytics, predictive maintenance, and interactive 3D visualizations." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "RefineSync Refining Dashboard",
            "description": "Advanced dashboard for monitoring and optimizing refinery processes."
          })}
        </script>
      </Head>
      <motion.div
        className={`min-h-screen transition-colors duration-500 ${themeStyles[theme].bg}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <header className={`py-4 px-6 transition-colors duration-300 ${themeStyles[theme].cardHeader} shadow-lg shadow-gray-900/50`}>
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">RefineSync Operations Hub</h1>
              <p className={`text-sm ${themeStyles[theme].textSecondary}`}>Advanced analytics for refinery optimization</p>
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
                <option value="industrial">Industrial</option>
              </select>
              <CSVLink
                data={csvData}
                filename={`refining-report-${new Date().toISOString().split('T')[0]}.csv`}
                className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${theme === 'industrial' ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                aria-label="Export refining data as CSV"
              >
                <FiDownload className="mr-1" /> CSV
              </CSVLink>
              <a
                href={`data:text/json;charset=utf-8,${encodeURIComponent(jsonData)}`}
                download={`refining-report-${new Date().toISOString().split('T')[0]}.json`}
                className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${theme === 'industrial' ? 'bg-green-700 text-white hover:bg-green-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                aria-label="Export refining data as JSON"
              >
                <FiDownload className="mr-1" /> JSON
              </a>
              <button
                onClick={generatePDF}
                className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${theme === 'industrial' ? 'bg-purple-700 text-white hover:bg-purple-600' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
                aria-label="Export refining data as PDF"
              >
                <FiDownload className="mr-1" /> PDF
              </button>
              <button
                className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${theme === 'industrial' ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                aria-label="Toggle 3D refinery map"
                onClick={() => setShowMap(!showMap)}
              >
                <FiMap className="mr-1" /> {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {/* KPI Dashboard */}
          <motion.section
            className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`px-4 py-3 transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
              <h2 className="font-bold text-lg tracking-tight">Refinery KPIs</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg text-center ${theme === 'industrial' ? 'bg-gray-900/50' : 'bg-amber-50/50'}`}>
                  <p className={`text-xs font-medium ${themeStyles[theme].textSecondary}`}>Average Health Score</p>
                  <p className="text-2xl font-bold">{(filteredUnits.reduce((sum, unit) => sum + unit.healthScore, 0) / filteredUnits.length || 0).toFixed(1)}%</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${theme === 'industrial' ? 'bg-gray-900/50' : 'bg-green-50/50'}`}>
                  <p className={`text-xs font-medium ${themeStyles[theme].textSecondary}`}>Total Throughput</p>
                  <p className="text-2xl font-bold">{filteredUnits.reduce((sum, unit) => sum + unit.throughput, 0).toLocaleString()} bbl/d</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${theme === 'industrial' ? 'bg-gray-900/50' : 'bg-blue-50/50'}`}>
                  <p className={`text-xs font-medium ${themeStyles[theme].textSecondary}`}>Total Emissions</p>
                  <p className="text-2xl font-bold">{filteredUnits.reduce((sum, unit) => sum + unit.emissions, 0)} tCO2</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${theme === 'industrial' ? 'bg-gray-900/50' : 'bg-purple-50/50'}`}>
                  <p className={`text-xs font-medium ${themeStyles[theme].textSecondary}`}>Units Needing Maintenance</p>
                  <p className="text-2xl font-bold">{filteredUnits.filter(u => u.recommendedMaintenance).length}</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Unit Optimization Table */}
          <motion.section
            className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
              <h2 className="font-bold text-lg tracking-tight">Unit Optimization</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search units..."
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    className={`pl-10 pr-4 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                    aria-label="Search units by name"
                  />
                </div>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                  aria-label="Filter units by status"
                >
                  <option value="all">All Status</option>
                  <option value="operational">Operational</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                <select
                  value={filter.sortBy}
                  onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                  aria-label="Sort units by"
                >
                  <option value="healthScore">Health Score</option>
                  <option value="name">Name</option>
                  <option value="yield">Yield</option>
                </select>
                <button
                  onClick={() => setFilter({ ...filter, sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc' })}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                  aria-label="Toggle sort order"
                >
                  {filter.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
                <button
                  onClick={() => handleAdjustUnit(filteredUnits.filter(u => u.status === 'operational').map(u => u.id))}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-all duration-200"
                  aria-label="Optimize all operational units"
                >
                  Optimize All
                </button>
                <button
                  onClick={() => setShowCustomAlertModal(true)}
                  className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-all duration-200"
                  aria-label="Set custom alert thresholds"
                >
                  <FiSettings className="mr-1 inline" /> Alerts
                </button>
              </div>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" role="grid">
                <thead className={themeStyles[theme].cardHeader}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Health Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Throughput</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Yield</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Emissions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Maintenance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${themeStyles[theme].border}`}>
                  {filteredUnits.map(unit => (
                    <tr key={unit.id} className={`transition-all duration-200 ${theme === 'industrial' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50/50'}`} role="row">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium flex items-center">
                          {unit.name}
                          {unit.alerts.length > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                              {unit.alerts.filter(a => !a.resolved).length}
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${themeStyles[theme].textSecondary}`}>Last Maintenance: {formatDate(unit.lastMaintenance)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          unit.status === 'operational' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {unit.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`font-medium ${unit.healthScore > 80 ? 'text-green-500' : unit.healthScore > 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {unit.healthScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{unit.throughput.toLocaleString()} <span className="text-xs">bbl/d</span></td>
                      <td className="px-4 py-3 whitespace-nowrap">{unit.yield.toFixed(1)}%</td>
                      <td className="px-4 py-3 whitespace-nowrap">{unit.emissions} tCO2</td>
                      <td className="px-4 py-3 whitespace-nowrap">{unit.recommendedMaintenance ? formatDate(unit.recommendedMaintenance) : 'N/A'}</td>
                      <td className="px-4 py-3 whitespace-nowrap flex space-x-2">
                        <button
                          onClick={() => handleAdjustUnit([unit.id])}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-all duration-200"
                          aria-label={`Optimize ${unit.name}`}
                        >
                          Optimize
                        </button>
                        <button
                          onClick={() => setSelectedUnit(unit)}
                          className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition-all duration-200"
                          aria-label={`View details for ${unit.name}`}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* 3D Refinery Map */}
          <AnimatePresence>
            {showMap && (
              <motion.section
                className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className={`px-4 py-3 transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
                  <h2 className="font-bold text-lg tracking-tight">3D Refinery Map</h2>
                </div>
                <div className="p-4">
                  <Suspense fallback={<SkeletonLoader />}>
                    <RefineryMap units={filteredUnits} theme={theme} />
                  </Suspense>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Performance Trends */}
          <Suspense fallback={<SkeletonLoader />}>
            <motion.section
              className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
                <h2 className="font-bold text-lg tracking-tight">Performance Trends</h2>
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition-all duration-200"
                  aria-label="Clear selected unit"
                >
                  Clear Selection
                </button>
              </div>
              <div className="p-4">
                {chartError ? (
                  <div className={`text-center py-4 ${themeStyles[theme].textSecondary}`}>
                    <FiAlertTriangle className="mx-auto h-8 w-8 mb-2" aria-hidden="true" />
                    <p>Error rendering chart: {chartError}</p>
                  </div>
                ) : selectedUnit ? (
                  <div className="h-80">
                    <LineChart
                      data={selectedUnit.historicalData}
                      xKey="day"
                      yKeys={['throughput', 'yield', 'emissions']}
                      colors={['#f59e0b', '#10b981', '#3b82f6']}
                      darkMode={theme === 'dark' || theme === 'industrial' || theme === 'highContrast'}
                      setChartError={setChartError}
                      onClick={(unitName) => setSelectedUnit(unitPerformance.find(u => u.name === unitName))}
                    />
                  </div>
                ) : (
                  <div className="h-80">
                    <BarChart
                      data={filteredUnits.map(unit => ({
                        name: unit.name,
                        healthScore: unit.healthScore,
                        yield: unit.yield
                      }))}
                      xKey="name"
                      yKeys={['healthScore', 'yield']}
                      colors={['#10b981', '#f59e0b']}
                      darkMode={theme === 'dark' || theme === 'industrial' || theme === 'highContrast'}
                      setChartError={setChartError}
                      onClick={(unitName) => setSelectedUnit(unitPerformance.find(u => u.name === unitName))}
                    />
                  </div>
                )}
              </div>
            </motion.section>
          </Suspense>

          {/* Alerts Management */}
          <motion.section
            className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className={`px-4 py-3 transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
              <h2 className="font-bold text-lg tracking-tight">Alert Management</h2>
            </div>
            <div className="p-4">
              {filteredUnits.some(unit => unit.alerts.length > 0) ? (
                <div className="space-y-4">
                  {filteredUnits.map(unit => unit.alerts.map(alert => (
                    <div key={alert.id} className={`p-4 rounded-lg border ${themeStyles[theme].border}`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`h-3 w-3 rounded-full ${
                            alert.severity === 'high' ? 'bg-red-600' :
                            alert.severity === 'medium' ? 'bg-amber-600' : 'bg-gray-600'
                          }`}></div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className={`text-sm ${theme === 'industrial' ? 'text-white' : 'text-gray-800'}`}>{alert.message} ({unit.name})</p>
                          <p className={`text-xs ${themeStyles[theme].textSecondary}`}>
                            {formatDate(alert.timestamp)} • {alert.severity.toUpperCase()}
                          </p>
                          {alert.comments.length > 0 && (
                            <div className="mt-2">
                              <p className={`text-xs font-medium ${themeStyles[theme].textSecondary}`}>Comments:</p>
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
                            onClick={() => openAlertModal(unit.id, alert)}
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
                <div className={`text-center py-4 ${themeStyles[theme].textSecondary}`}>
                  <FiAlertTriangle className="mx-auto h-8 w-8 mb-2" aria-hidden="true" />
                  <p>No active alerts</p>
                </div>
              )}
            </div>
          </motion.section>

          {/* Unit Details */}
          {selectedUnit && (
            <motion.section
              className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
                <h2 className="font-bold text-lg tracking-tight">{selectedUnit.name} Details</h2>
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition-all duration-200"
                  aria-label="Back to overview"
                >
                  Back
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`p-4 rounded-lg ${themeStyles[theme].card}`}>
                  <h3 className="font-medium mb-4 text-lg">Unit Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className={themeStyles[theme].textSecondary}>Status</p>
                      <p>{selectedUnit.status.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className={themeStyles[theme].textSecondary}>Last Maintenance</p>
                      <p>{formatDate(selectedUnit.lastMaintenance)}</p>
                    </div>
                    <div>
                      <p className={themeStyles[theme].textSecondary}>Coordinates</p>
                      <p>X: {selectedUnit.coordinates.x}, Y: {selectedUnit.coordinates.y}, Z: {selectedUnit.coordinates.z}</p>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles[theme].card}`}>
                  <h3 className="font-medium mb-4 text-lg">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className={`text-xs font-medium ${theme === 'industrial' ? 'text-amber-300' : 'text-amber-800'}`}>Throughput</p>
                      <p className="text-xl font-bold">{selectedUnit.throughput.toLocaleString()} <span className="text-sm">bbl/d</span></p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${theme === 'industrial' ? 'text-green-300' : 'text-green-800'}`}>Yield</p>
                      <p className="text-xl font-bold">{selectedUnit.yield.toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${theme === 'industrial' ? 'text-blue-300' : 'text-blue-800'}`}>Emissions</p>
                      <p className="text-xl font-bold">{selectedUnit.emissions} <span className="text-sm">tCO2</span></p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${themeStyles[theme].textSecondary}`}>Energy Consumption</p>
                      <p className="text-xl font-bold">{selectedUnit.energyConsumption} <span className="text-sm">kWh</span></p>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${themeStyles[theme].card}`}>
                  <h3 className="font-medium mb-4 text-lg">Optimization Recommendations</h3>
                  <div className="text-sm">
                    <p className={themeStyles[theme].textSecondary}>Health Score</p>
                    <p className={`font-bold ${selectedUnit.healthScore > 80 ? 'text-green-500' : selectedUnit.healthScore > 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {selectedUnit.healthScore.toFixed(1)}
                    </p>
                    <p className={themeStyles[theme].textSecondary}>Recommended Maintenance</p>
                    <p className="font-bold">{selectedUnit.recommendedMaintenance ? formatDate(selectedUnit.recommendedMaintenance) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Activity Log */}
          <motion.section
            className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className={`px-4 py-3 transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
              <h2 className="font-bold text-lg tracking-tight">Operator Activity Log</h2>
            </div>
            <div className="p-4">
              {activityLog.length > 0 ? (
                <ul className="space-y-2">
                  {activityLog.map((log, i) => (
                    <li key={i} className={`text-sm ${themeStyles[theme].textSecondary}`}>
                      {log.action} • {formatDate(log.timestamp)}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={`text-center py-4 ${themeStyles[theme].textSecondary}`}>
                  <FiClock className="mx-auto h-8 w-8 mb-2" aria-hidden="true" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </motion.section>

          {/* Adjust Unit Modal */}
          {showAdjustModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="dialog"
              aria-modal="true"
            >
              <div className={`rounded-lg p-6 w-full max-w-md transition-all duration-200 ${themeStyles[theme].card}`}>
                <h3 className="text-lg font-bold mb-4">Optimize Unit Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${themeStyles[theme].textSecondary}`} htmlFor="feed-rate">Feed Rate (bbl/d)</label>
                    <input
                      id="feed-rate"
                      type="number"
                      value={adjustSettings.feedRate}
                      onChange={(e) => setAdjustSettings({ ...adjustSettings, feedRate: parseInt(e.target.value) || 0 })}
                      className={`w-full p-2 rounded-lg font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                      aria-label="Feed rate input"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeStyles[theme].textSecondary}`} htmlFor="temperature">Temperature (°C)</label>
                    <input
                      id="temperature"
                      type="number"
                      value={adjustSettings.temperature}
                      onChange={(e) => setAdjustSettings({ ...adjustSettings, temperature: parseInt(e.target.value) || 0 })}
                      className={`w-full p-2 rounded-lg font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                      aria-label="Temperature input"
                    />
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
            </motion.div>
          )}

          {/* Alert Resolution Modal */}
          {showAlertModal && alertDetails && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="dialog"
              aria-modal="true"
            >
              <div className={`rounded-lg p-6 w-full max-w-md transition-all duration-200 ${themeStyles[theme].card}`}>
                <h3 className="text-lg font-bold mb-4">Resolve Alert</h3>
                <p className="text-sm">{alertDetails.alert.message} (Unit: {unitPerformance.find(u => u.id === alertDetails.unitId).name})</p>
                <p className={`text-xs ${themeStyles[theme].textSecondary}`}>{formatDate(alertDetails.alert.timestamp)}</p>
                <div className="mt-4">
                  <label className={`block text-sm font-medium ${themeStyles[theme].textSecondary}`} htmlFor="alert-comment">Resolution Comment</label>
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
                    onClick={() => handleResolveAlert(alertDetails.unitId, alertDetails.alert.id, alertComment)}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium transition-all duration-200"
                    aria-label="Resolve alert"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Custom Alert Thresholds Modal */}
          {showCustomAlertModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="dialog"
              aria-modal="true"
            >
              <div className={`rounded-lg p-6 w-full max-w-md transition-all duration-200 ${themeStyles[theme].card}`}>
                <h3 className="text-lg font-bold mb-4">Set Custom Alert Thresholds</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${themeStyles[theme].textSecondary}`} htmlFor="emissions-threshold">Emissions Threshold (tCO2)</label>
                    <input
                      id="emissions-threshold"
                      type="number"
                      value={customAlertThresholds.emissions}
                      onChange={(e) => setCustomAlertThresholds({ ...customAlertThresholds, emissions: parseInt(e.target.value) || 0 })}
                      className={`w-full p-2 rounded-lg font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                      aria-label="Emissions threshold input"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeStyles[theme].textSecondary}`} htmlFor="yield-drop-threshold">Yield Drop Threshold (%)</label>
                    <input
                      id="yield-drop-threshold"
                      type="number"
                      value={customAlertThresholds.yieldDrop}
                      onChange={(e) => setCustomAlertThresholds({ ...customAlertThresholds, yieldDrop: parseInt(e.target.value) || 0 })}
                      className={`w-full p-2 rounded-lg font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                      aria-label="Yield drop threshold input"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setShowCustomAlertModal(false)}
                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-lg font-medium transition-all duration-200"
                    aria-label="Cancel alert threshold settings"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCustomAlertThresholds}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium transition-all duration-200"
                    aria-label="Save alert threshold settings"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className={`py-6 mt-8 transition-colors duration-300 ${themeStyles[theme].card}`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold tracking-tight">
                  <span className="text-blue-500">Refine</span>
                  <span className={theme === 'industrial' ? 'text-white' : 'text-gray-700'}>Sync</span>
                </h2>
                <p className={`text-sm ${themeStyles[theme].textSecondary}`}>Advanced Refining System v1.0</p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className={`transition-all duration-200 ${themeStyles[theme].textSecondary} hover:text-white`} aria-label="Terms of service">Terms</a>
                <a href="#" className={`transition-all duration-200 ${themeStyles[theme].textSecondary} hover:text-white`} aria-label="Privacy policy">Privacy</a>
                <a href="#" className={`transition-all duration-200 ${themeStyles[theme].textSecondary} hover:text-white`} aria-label="Contact us">Contact</a>
                <a href="#" className={`transition-all duration-200 ${themeStyles[theme].textSecondary} hover:text-white`} aria-label="Support">Support</a>
              </div>
            </div>
            <div className={`mt-6 pt-6 border-t text-center text-sm ${themeStyles[theme].border}`}>
              © {new Date().getFullYear()} RefineSync Systems. All rights reserved.
            </div>
          </div>
        </footer>
      </motion.div>
    </>
  );
}
