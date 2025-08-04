
// src/app/logistics/page.jsx
'use client';

import { useState, useEffect, useMemo, useCallback, Suspense, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiDownload, FiSettings, FiAlertTriangle, FiCalendar, FiFilter, FiBarChart, FiMap, FiClock, FiTruck, FiPackage } from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import Head from 'next/head';
import { jsPDF } from 'jspdf';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy-load components
const BarChart = dynamic(() => import('../production/wells/ChartComponents').then(mod => mod.BarChart), { ssr: false });
const LineChart = dynamic(() => import('../production/wells/ChartComponents').then(mod => mod.LineChart), { ssr: false });
const LogisticsMap = dynamic(() => import('./LogisticsMap'), { ssr: false });

// Error Boundary Fallback
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-4 bg-red-100 text-red-800 rounded-lg flex flex-col items-center">
    <FiAlertTriangle className="h-8 w-8 mb-2" aria-hidden="true" />
    <p>Error: {error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200"
      aria-label="Retry rendering component"
    >
      Retry
    </button>
  </div>
);

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
  </div>
);

// Sample logistics data (replace with API)
const initialLogisticsData = [
  {
    id: 1, asset: 'Truck-001', type: 'truck', status: 'en-route', location: 'Houston, TX', eta: '2025-08-05T14:00:00',
    load: 5000, fuelEfficiency: 6.5, distanceTraveled: 320, deliveryScore: 92, lastMaintenance: '2025-07-20',
    coordinates: { x: 100, y: 200, z: 10 },
    alerts: [{ id: 1, severity: 'medium', message: 'High fuel consumption', timestamp: '2025-08-04T08:00:00', resolved: false, comments: [] }],
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`, distance: 320 + Math.floor(Math.random() * 50 - 25),
      fuelEfficiency: 6.5 + (Math.random() * 0.5 - 0.25), deliveryScore: 92 + (Math.random() * 5 - 2.5)
    }))
  },
  {
    id: 2, asset: 'Warehouse-A', type: 'warehouse', status: 'operational', location: 'Dallas, TX', eta: null,
    load: 12000, fuelEfficiency: 0, distanceTraveled: 0, deliveryScore: 88, lastMaintenance: '2025-06-15',
    coordinates: { x: 150, y: 250, z: 20 },
    alerts: [], historicalData: Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`, load: 12000 + Math.floor(Math.random() * 1000 - 500),
      deliveryScore: 88 + (Math.random() * 4 - 2), fuelEfficiency: 0
    }))
  },
  {
    id: 3, asset: 'Truck-002', type: 'truck', status: 'maintenance', location: 'Austin, TX', eta: null,
    load: 0, fuelEfficiency: 0, distanceTraveled: 0, deliveryScore: 0, lastMaintenance: '2025-08-03',
    coordinates: { x: 200, y: 300, z: 15 },
    alerts: [], historicalData: Array.from({ length: 30 }, (_, i) => ({ day: `Day ${i + 1}`, distance: 0, fuelEfficiency: 0, deliveryScore: 0 }))
  }
];

export default function LogisticsPage() {
  const [theme, setTheme] = useState('industrial');
  const [logisticsData, setLogisticsData] = useState([]);
  const [filter, setFilter] = useState({ search: '', sortBy: 'deliveryScore', sortOrder: 'desc', type: 'all', status: 'all', timeRange: '30d' });
  const [chartError, setChartError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adjustAssetIds, setAdjustAssetIds] = useState([]);
  const [adjustSettings, setAdjustSettings] = useState({ load: 0, routePriority: 'fastest' });
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertDetails, setAlertDetails] = useState(null);
  const [alertComment, setAlertComment] = useState('');
  const [customAlertThresholds, setCustomAlertThresholds] = useState({ fuelEfficiency: 5, deliveryDelay: 2 });
  const [showCustomAlertModal, setShowCustomAlertModal] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const dataFetchedRef = useRef(false);

  // Fetch data (replace with your API endpoint)
  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    async function fetchData() {
      try {
        // Example API call (uncomment and configure in production)
        // const response = await fetch('/api/logistics');
        // const data = await response.json();
        // setLogisticsData(data);
        setLogisticsData(initialLogisticsData); // Using sample data for now
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch logistics data');
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLogisticsData(prev => prev.map(asset => {
        if (asset.status !== 'en-route') return asset;
        const newDistance = Math.max(0, asset.distanceTraveled + Math.floor(Math.random() * 50 - 25));
        const newFuelEfficiency = Math.min(10, Math.max(4, asset.fuelEfficiency + (Math.random() * 0.2 - 0.1)));
        const newDeliveryScore = Math.min(100, Math.max(70, asset.deliveryScore + (Math.random() * 2 - 1)));
        if (newFuelEfficiency < customAlertThresholds.fuelEfficiency) {
          const newAlert = {
            id: Date.now(),
            severity: 'medium',
            message: `Fuel efficiency dropped below ${customAlertThresholds.fuelEfficiency} mpg`,
            timestamp: new Date().toISOString(),
            resolved: false,
            comments: []
          };
          return {
            ...asset,
            distanceTraveled: newDistance,
            fuelEfficiency: newFuelEfficiency,
            deliveryScore: newDeliveryScore,
            alerts: [...asset.alerts, newAlert]
          };
        }
        return {
          ...asset,
          distanceTraveled: newDistance,
          fuelEfficiency: newFuelEfficiency,
          deliveryScore: newDeliveryScore
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

  // Calculate delivery score
  const calculateDeliveryScore = useCallback((asset) => {
    const efficiencyWeight = 0.4;
    const loadWeight = 0.3;
    const alertWeight = 0.2;
    const distanceWeight = 0.1;
    const normalizedEfficiency = asset.fuelEfficiency / 10;
    const normalizedLoad = asset.load / 15000;
    const alertScore = asset.alerts.filter(a => !a.resolved).length === 0 ? 1 : 0.5;
    const normalizedDistance = asset.distanceTraveled / 1000;
    return Math.min(100, (efficiencyWeight * normalizedEfficiency + loadWeight * normalizedLoad + alertWeight * alertScore + distanceWeight * normalizedDistance) * 100);
  }, []);

  // Recommend maintenance schedule
  const recommendMaintenance = useCallback((asset) => {
    const lastMaintenanceDate = new Date(asset.lastMaintenance);
    const daysSinceMaintenance = (new Date() - lastMaintenanceDate) / (1000 * 60 * 60 * 24);
    return asset.deliveryScore < 80 || daysSinceMaintenance > 90 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null;
  }, []);

  // Memoized filtered and sorted assets
  const filteredAssets = useMemo(() => {
    if (!logisticsData.length) return [];
    return logisticsData
      .map(asset => ({ ...asset, deliveryScore: calculateDeliveryScore(asset), recommendedMaintenance: recommendMaintenance(asset) }))
      .filter(asset => filter.type === 'all' || asset.type === filter.type)
      .filter(asset => filter.status === 'all' || asset.status === filter.status)
      .filter(asset => !filter.search || asset.asset.toLowerCase().includes(filter.search.toLowerCase()))
      .sort((a, b) => {
        const valueA = a[filter.sortBy];
        const valueB = b[filter.sortBy];
        return filter.sortOrder === 'desc'
          ? (typeof valueA === 'string' ? valueB.localeCompare(valueA) : valueB - valueA)
          : (typeof valueA === 'string' ? valueA.localeCompare(valueB) : valueA - valueB);
      });
  }, [logisticsData, filter, calculateDeliveryScore, recommendMaintenance]);

  // Memoized CSV and JSON data
  const csvData = useMemo(() => filteredAssets.map(asset => ({
    Asset: asset.asset,
    Type: asset.type,
    Status: asset.status,
    'Delivery Score': asset.deliveryScore.toFixed(1),
    Load: `${asset.load} units`,
    'Fuel Efficiency': asset.type === 'truck' ? `${asset.fuelEfficiency.toFixed(1)} mpg` : 'N/A',
    'Distance Traveled': asset.type === 'truck' ? `${asset.distanceTraveled} miles` : 'N/A',
    Location: asset.location,
    ETA: asset.eta ? new Date(asset.eta).toLocaleString() : 'N/A',
    'Recommended Maintenance': asset.recommendedMaintenance || 'N/A',
    Alerts: asset.alerts.length > 0 ? asset.alerts.map(a => a.message).join('; ') : 'None'
  })), [filteredAssets]);

  const jsonData = useMemo(() => JSON.stringify(filteredAssets, null, 2), [filteredAssets]);

  // PDF generation
  const generatePDF = useCallback(() => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('LogiSync Operations Report', 10, 10);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 20);
      filteredAssets.forEach((asset, i) => {
        doc.text(`${asset.asset} (${asset.type}): Score ${asset.deliveryScore.toFixed(1)} | Load ${asset.load} units`, 10, 30 + i * 10);
      });
      doc.save(`logistics-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      setError('Failed to generate PDF');
    }
  }, [filteredAssets]);

  // Handle asset adjustments
  const handleAdjustAsset = useCallback((assetIds) => {
    setAdjustAssetIds(assetIds);
    const asset = logisticsData.find(a => a.id === assetIds[0]);
    setAdjustSettings({ load: asset.load, routePriority: 'fastest' });
    setShowAdjustModal(true);
    setActivityLog(prev => [...prev, { action: `Opened adjustment for ${assetIds.length} asset(s)`, timestamp: new Date().toISOString() }]);
  }, [logisticsData]);

  const saveAdjustment = useCallback(() => {
    setLogisticsData(prev => prev.map(asset =>
      adjustAssetIds.includes(asset.id) ? { ...asset, load: adjustSettings.load, routePriority: adjustSettings.routePriority } : asset
    ));
    setActivityLog(prev => [...prev, { action: `Adjusted ${adjustAssetIds.length} asset(s)`, timestamp: new Date().toISOString() }]);
    setShowAdjustModal(false);
    setAdjustAssetIds([]);
  }, [adjustAssetIds, adjustSettings]);

  // Handle alert resolution
  const handleResolveAlert = useCallback((assetId, alertId, comment) => {
    setLogisticsData(prev => prev.map(asset =>
      asset.id === assetId ? {
        ...asset,
        alerts: asset.alerts.map(alert =>
          alert.id === alertId ? { ...alert, resolved: true, comments: [...alert.comments, { text: comment, timestamp: new Date().toISOString() }] } : alert
        )
      } : asset
    ));
    setActivityLog(prev => [...prev, { action: `Resolved alert for asset ${assetId}`, timestamp: new Date().toISOString() }]);
    setShowAlertModal(false);
    setAlertComment('');
  }, []);

  const openAlertModal = useCallback((assetId, alert) => {
    setAlertDetails({ assetId, alert });
    setShowAlertModal(true);
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return dateString ? new Date(dateString).toLocaleDateString('en-US', options) : 'N/A';
  }, []);

  // Handle custom alert thresholds
  const saveCustomAlertThresholds = useCallback(() => {
    setActivityLog(prev => [...prev, { action: `Updated custom alert thresholds`, timestamp: new Date().toISOString() }]);
    setShowCustomAlertModal(false);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <FiAlertTriangle className="mx-auto h-12 w-12 mb-4" aria-hidden="true" />
          <p className="text-lg">{error}</p>
          <button
            onClick={() => { setError(null); dataFetchedRef.current = false; }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
            aria-label="Retry fetching data"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>LogiSync Advanced Logistics Dashboard</title>
        <meta name="description" content="Optimize logistics operations with real-time tracking, fleet analytics, and 3D visualizations." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "LogiSync Logistics Dashboard",
            "description": "Advanced dashboard for managing logistics operations."
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
              <h1 className="text-2xl font-bold tracking-tight">LogiSync Operations Hub</h1>
              <p className={`text-sm ${themeStyles[theme].textSecondary}`}>Real-time logistics management</p>
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
                filename={`logistics-report-${new Date().toISOString().split('T')[0]}.csv`}
                className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${theme === 'industrial' ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                aria-label="Export logistics data as CSV"
              >
                <FiDownload className="mr-1" /> CSV
              </CSVLink>
              <a
                href={`data:text/json;charset=utf-8,${encodeURIComponent(jsonData)}`}
                download={`logistics-report-${new Date().toISOString().split('T')[0]}.json`}
                className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${theme === 'industrial' ? 'bg-green-700 text-white hover:bg-green-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                aria-label="Export logistics data as JSON"
              >
                <FiDownload className="mr-1" /> JSON
              </a>
              <button
                onClick={generatePDF}
                className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${theme === 'industrial' ? 'bg-purple-700 text-white hover:bg-purple-600' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
                aria-label="Export logistics data as PDF"
              >
                <FiDownload className="mr-1" /> PDF
              </button>
              <button
                className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${theme === 'industrial' ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                aria-label="Toggle 3D logistics map"
                onClick={() => setShowMap(!showMap)}
              >
                <FiMap className="mr-1" /> {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            <>
              {/* Section 1: Fleet KPIs */}
              <motion.section
                className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className={`px-4 py-3 transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
                  <h2 className="font-bold text-lg tracking-tight">Fleet KPIs</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-lg text-center ${theme === 'industrial' ? 'bg-gray-900/50' : 'bg-amber-50/50'}`}>
                      <p className={`text-xs font-medium ${themeStyles[theme].textSecondary}`}>Average Delivery Score</p>
                      <p className="text-2xl font-bold">{(filteredAssets.reduce((sum, asset) => sum + asset.deliveryScore, 0) / filteredAssets.length || 0).toFixed(1)}%</p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${theme === 'industrial' ? 'bg-gray-900/50' : 'bg-green-50/50'}`}>
                      <p className={`text-xs font-medium ${themeStyles[theme].textSecondary}`}>Total Load</p>
                      <p className="text-2xl font-bold">{filteredAssets.reduce((sum, asset) => sum + asset.load, 0).toLocaleString()} units</p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${theme === 'industrial' ? 'bg-gray-900/50' : 'bg-blue-50/50'}`}>
                      <p className={`text-xs font-medium ${themeStyles[theme].textSecondary}`}>Active Trucks</p>
                      <p className="text-2xl font-bold">{filteredAssets.filter(a => a.type === 'truck' && a.status === 'en-route').length}</p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${theme === 'industrial' ? 'bg-gray-900/50' : 'bg-purple-50/50'}`}>
                      <p className={`text-xs font-medium ${themeStyles[theme].textSecondary}`}>Assets Needing Maintenance</p>
                      <p className="text-2xl font-bold">{filteredAssets.filter(a => a.recommendedMaintenance).length}</p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Section 2: Asset Management Table */}
              <motion.section
                className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
                  <h2 className="font-bold text-lg tracking-tight">Asset Management</h2>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search assets..."
                        value={filter.search}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                        className={`pl-10 pr-4 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                        aria-label="Search assets by name"
                      />
                    </div>
                    <select
                      value={filter.type}
                      onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                      aria-label="Filter assets by type"
                    >
                      <option value="all">All Types</option>
                      <option value="truck">Truck</option>
                      <option value="warehouse">Warehouse</option>
                    </select>
                    <select
                      value={filter.status}
                      onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                      aria-label="Filter assets by status"
                    >
                      <option value="all">All Status</option>
                      <option value="en-route">En-Route</option>
                      <option value="operational">Operational</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                    <select
                      value={filter.sortBy}
                      onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                      aria-label="Sort assets by"
                    >
                      <option value="deliveryScore">Delivery Score</option>
                      <option value="asset">Name</option>
                      <option value="load">Load</option>
                    </select>
                    <button
                      onClick={() => setFilter({ ...filter, sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc' })}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                      aria-label="Toggle sort order"
                    >
                      {filter.sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                    <button
                      onClick={() => handleAdjustAsset(filteredAssets.filter(a => a.status === 'en-route' || a.status === 'operational').map(a => a.id))}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-all duration-200"
                      aria-label="Optimize all active assets"
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
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Asset</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Delivery Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Load</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">ETA</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Maintenance</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${themeStyles[theme].border}`}>
                      {filteredAssets.map(asset => (
                        <tr key={asset.id} className={`transition-all duration-200 ${theme === 'industrial' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50/50'}`} role="row">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium flex items-center">
                              {asset.asset}
                              {asset.alerts.length > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                  {asset.alerts.filter(a => !a.resolved).length}
                                </span>
                              )}
                            </div>
                            <div className={`text-xs ${themeStyles[theme].textSecondary}`}>Last Maintenance: {formatDate(asset.lastMaintenance)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{asset.type.toUpperCase()}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              asset.status === 'en-route' ? 'bg-emerald-100 text-emerald-800' :
                              asset.status === 'operational' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {asset.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`font-medium ${asset.deliveryScore > 80 ? 'text-green-500' : asset.deliveryScore > 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                              {asset.deliveryScore.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{asset.load.toLocaleString()} units</td>
                          <td className="px-4 py-3 whitespace-nowrap">{asset.location}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{formatDate(asset.eta)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{asset.recommendedMaintenance ? formatDate(asset.recommendedMaintenance) : 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap flex space-x-2">
                            <button
                              onClick={() => handleAdjustAsset([asset.id])}
                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-all duration-200"
                              aria-label={`Optimize ${asset.asset}`}
                            >
                              Optimize
                            </button>
                            <button
                              onClick={() => setSelectedAsset(asset)}
                              className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition-all duration-200"
                              aria-label={`View details for ${asset.asset}`}
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

              {/* Section 3: 3D Logistics Map */}
              <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setShowMap(false)}>
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
                        <h2 className="font-bold text-lg tracking-tight">3D Logistics Map</h2>
                      </div>
                      <div className="p-4">
                        <Suspense fallback={<SkeletonLoader />}>
                          <LogisticsMap assets={filteredAssets} theme={theme} />
                        </Suspense>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>
              </ErrorBoundary>

              {/* Section 4: Performance Trends */}
              <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setChartError(null)}>
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
                        onClick={() => setSelectedAsset(null)}
                        className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition-all duration-200"
                        aria-label="Clear selected asset"
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
                      ) : selectedAsset ? (
                        <div className="h-80">
                          <LineChart
                            data={selectedAsset.historicalData}
                            xKey="day"
                            yKeys={['distance', 'fuelEfficiency', 'deliveryScore']}
                            colors={['#f59e0b', '#10b981', '#3b82f6']}
                            darkMode={theme === 'dark' || theme === 'industrial' || theme === 'highContrast'}
                            setChartError={setChartError}
                            onClick={(assetName) => setSelectedAsset(logisticsData.find(a => a.asset === assetName))}
                          />
                        </div>
                      ) : (
                        <div className="h-80">
                          <BarChart
                            data={filteredAssets.map(asset => ({
                              name: asset.asset,
                              deliveryScore: asset.deliveryScore,
                              load: asset.load
                            }))}
                            xKey="name"
                            yKeys={['deliveryScore', 'load']}
                            colors={['#10b981', '#f59e0b']}
                            darkMode={theme === 'dark' || theme === 'industrial' || theme === 'highContrast'}
                            setChartError={setChartError}
                            onClick={(assetName) => setSelectedAsset(logisticsData.find(a => a.asset === assetName))}
                          />
                        </div>
                      )}
                    </div>
                  </motion.section>
                </Suspense>
              </ErrorBoundary>

              {/* Section 5: Alerts Management */}
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
                  {filteredAssets.some(asset => asset.alerts.length > 0) ? (
                    <div className="space-y-4">
                      {filteredAssets.map(asset => asset.alerts.map(alert => (
                        <div key={alert.id} className={`p-4 rounded-lg border ${themeStyles[theme].border}`}>
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                              <div className={`h-3 w-3 rounded-full ${
                                alert.severity === 'high' ? 'bg-red-600' :
                                alert.severity === 'medium' ? 'bg-amber-600' : 'bg-gray-600'
                              }`}></div>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className={`text-sm ${theme === 'industrial' ? 'text-white' : 'text-gray-800'}`}>{alert.message} ({asset.asset})</p>
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
                                onClick={() => openAlertModal(asset.id, alert)}
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

              {/* Section 6: Asset Details */}
              {selectedAsset && (
                <motion.section
                  className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
                    <h2 className="font-bold text-lg tracking-tight">{selectedAsset.asset} Details</h2>
                    <button
                      onClick={() => setSelectedAsset(null)}
                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition-all duration-200"
                      aria-label="Back to overview"
                    >
                      Back
                    </button>
                  </div>
                  <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className={`p-4 rounded-lg ${themeStyles[theme].card}`}>
                      <h3 className="font-medium mb-4 text-lg">Asset Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className={themeStyles[theme].textSecondary}>Type</p>
                          <p>{selectedAsset.type.toUpperCase()}</p>
                        </div>
                        <div>
                          <p className={themeStyles[theme].textSecondary}>Status</p>
                          <p>{selectedAsset.status.toUpperCase()}</p>
                        </div>
                        <div>
                          <p className={themeStyles[theme].textSecondary}>Location</p>
                          <p>{selectedAsset.location}</p>
                        </div>
                        <div>
                          <p className={themeStyles[theme].textSecondary}>Last Maintenance</p>
                          <p>{formatDate(selectedAsset.lastMaintenance)}</p>
                        </div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${themeStyles[theme].card}`}>
                      <h3 className="font-medium mb-4 text-lg">Performance Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className={`text-xs font-medium ${theme === 'industrial' ? 'text-amber-300' : 'text-amber-800'}`}>Load</p>
                          <p className="text-xl font-bold">{selectedAsset.load.toLocaleString()} <span className="text-sm">units</span></p>
                        </div>
                        <div className="text-center">
                          <p className={`text-xs font-medium ${theme === 'industrial' ? 'text-green-300' : 'text-green-800'}`}>Fuel Efficiency</p>
                          <p className="text-xl font-bold">{selectedAsset.type === 'truck' ? `${selectedAsset.fuelEfficiency.toFixed(1)} mpg` : 'N/A'}</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-xs font-medium ${theme === 'industrial' ? 'text-blue-300' : 'text-blue-800'}`}>Distance Traveled</p>
                          <p className="text-xl font-bold">{selectedAsset.type === 'truck' ? `${selectedAsset.distanceTraveled} miles` : 'N/A'}</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-xs font-medium ${themeStyles[theme].textSecondary}`}>ETA</p>
                          <p className="text-xl font-bold">{formatDate(selectedAsset.eta)}</p>
                        </div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${themeStyles[theme].card}`}>
                      <h3 className="font-medium mb-4 text-lg">Optimization Recommendations</h3>
                      <div className="text-sm">
                        <p className={themeStyles[theme].textSecondary}>Delivery Score</p>
                        <p className={`font-bold ${selectedAsset.deliveryScore > 80 ? 'text-green-500' : selectedAsset.deliveryScore > 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {selectedAsset.deliveryScore.toFixed(1)}
                        </p>
                        <p className={themeStyles[theme].textSecondary}>Recommended Maintenance</p>
                        <p className="font-bold">{selectedAsset.recommendedMaintenance ? formatDate(selectedAsset.recommendedMaintenance) : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Section 7: Route Optimization */}
              <motion.section
                className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className={`px-4 py-3 transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
                  <h2 className="font-bold text-lg tracking-tight">Route Optimization</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${themeStyles[theme].card}`}>
                      <p className={`text-sm font-medium ${themeStyles[theme].textSecondary}`}>Recommended Strategy</p>
                      <p className="text-lg font-bold">Fastest Route</p>
                      <p className={`text-sm ${themeStyles[theme].textSecondary}`}>Prioritizes shortest travel time based on current traffic data.</p>
                    </div>
                    <div className={`p-4 rounded-lg ${themeStyles[theme].card}`}>
                      <p className={`text-sm font-medium ${themeStyles[theme].textSecondary}`}>Fuel-Saving Route</p>
                      <p className="text-lg font-bold">Eco Route</p>
                      <p className={`text-sm ${themeStyles[theme].textSecondary}`}>Optimizes for minimal fuel consumption.</p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Section 8: Activity Log */}
              <motion.section
                className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
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

              {/* Adjust Asset Modal */}
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
                    <h3 className="text-lg font-bold mb-4">Optimize Asset Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium ${themeStyles[theme].textSecondary}`} htmlFor="load">Load (units)</label>
                        <input
                          id="load"
                          type="number"
                          value={adjustSettings.load}
                          onChange={(e) => setAdjustSettings({ ...adjustSettings, load: parseInt(e.target.value) || 0 })}
                          className={`w-full p-2 rounded-lg font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                          aria-label="Load input"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${themeStyles[theme].textSecondary}`} htmlFor="route-priority">Route Priority</label>
                        <select
                          id="route-priority"
                          value={adjustSettings.routePriority}
                          onChange={(e) => setAdjustSettings({ ...adjustSettings, routePriority: e.target.value })}
                          className={`w-full p-2 rounded-lg font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                          aria-label="Route priority selection"
                        >
                          <option value="fastest">Fastest</option>
                          <option value="eco">Eco</option>
                          <option value="balanced">Balanced</option>
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
                    <p className="text-sm">{alertDetails.alert.message} (Asset: {logisticsData.find(a => a.id === alertDetails.assetId)?.asset || 'Unknown'})</p>
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
                        onClick={() => handleResolveAlert(alertDetails.assetId, alertDetails.alert.id, alertComment)}
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
                        <label className={`block text-sm font-medium ${themeStyles[theme].textSecondary}`} htmlFor="fuel-efficiency-threshold">Fuel Efficiency Threshold (mpg)</label>
                        <input
                          id="fuel-efficiency-threshold"
                          type="number"
                          value={customAlertThresholds.fuelEfficiency}
                          onChange={(e) => setCustomAlertThresholds({ ...customAlertThresholds, fuelEfficiency: parseFloat(e.target.value) || 0 })}
                          className={`w-full p-2 rounded-lg font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                          aria-label="Fuel efficiency threshold input"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${themeStyles[theme].textSecondary}`} htmlFor="delivery-delay-threshold">Delivery Delay Threshold (hours)</label>
                        <input
                          id="delivery-delay-threshold"
                          type="number"
                          value={customAlertThresholds.deliveryDelay}
                          onChange={(e) => setCustomAlertThresholds({ ...customAlertThresholds, deliveryDelay: parseInt(e.target.value) || 0 })}
                          className={`w-full p-2 rounded-lg font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                          aria-label="Delivery delay threshold input"
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
            </>
          )}
        </main>

        {/* Footer */}
        <footer className={`py-6 mt-8 transition-colors duration-300 ${themeStyles[theme].card}`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold tracking-tight">
                  <span className="text-blue-500">Logi</span>
                  <span className={theme === 'industrial' ? 'text-white' : 'text-gray-700'}>Sync</span>
                </h2>
                <p className={`text-sm ${themeStyles[theme].textSecondary}`}>Advanced Logistics System v1.0</p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className={`transition-all duration-200 ${themeStyles[theme].textSecondary} hover:text-white`} aria-label="Terms of service">Terms</a>
                <a href="#" className={`transition-all duration-200 ${themeStyles[theme].textSecondary} hover:text-white`} aria-label="Privacy policy">Privacy</a>
                <a href="#" className={`transition-all duration-200 ${themeStyles[theme].textSecondary} hover:text-white`} aria-label="Contact us">Contact</a>
                <a href="#" className={`transition-all duration-200 ${themeStyles[theme].textSecondary} hover:text-white`} aria-label="Support">Support</a>
              </div>
            </div>
            <div className={`mt-6 pt-6 border-t text-center text-sm ${themeStyles[theme].border}`}>
              © {new Date().getFullYear()} LogiSync Systems. All rights reserved.
            </div>
          </div>
        </footer>
      </motion.div>
    </>
  );
}
