
// src/app/markets/page.jsx
'use client';

import { useState, useEffect, useMemo, useCallback, Suspense, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiDownload, FiSettings, FiAlertTriangle, FiCalendar, FiFilter, FiBarChart, FiMap, FiClock, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import Head from 'next/head';
import { jsPDF } from 'jspdf';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy-load components
const BarChart = dynamic(() => import('../production/wells/ChartComponents').then(mod => mod.BarChart), { ssr: false });
const LineChart = dynamic(() => import('../production/wells/ChartComponents').then(mod => mod.LineChart), { ssr: false });
const MarketsMap = dynamic(() => import('./MarketsMap'), { ssr: false });

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

// Sample market data (replace with API)
const initialMarketData = [
  {
    id: 1,
    ticker: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    price: 175.25,
    volume: 65000000,
    change: 2.5,
    volatility: 0.3,
    marketCap: 2800000000000,
    coordinates: { x: 100, y: 200, z: 10 },
    alerts: [
      { id: 1, severity: 'medium', message: 'Price volatility increased', timestamp: '2025-08-04T08:00:00', resolved: false, comments: [] }
    ],
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`,
      price: 175 + Math.random() * 5 - 2.5,
      volume: 65000000 + Math.floor(Math.random() * 10000000 - 5000000),
      volatility: 0.3 + (Math.random() * 0.1 - 0.05)
    }))
  },
  {
    id: 2,
    ticker: 'XOM',
    name: 'Exxon Mobil Corp.',
    sector: 'Energy',
    price: 115.75,
    volume: 20000000,
    change: -1.2,
    volatility: 0.25,
    marketCap: 460000000000,
    coordinates: { x: 150, y: 250, z: 15 },
    alerts: [],
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`,
      price: 115 + Math.random() * 4 - 2,
      volume: 20000000 + Math.floor(Math.random() * 5000000 - 2500000),
      volatility: 0.25 + (Math.random() * 0.05 - 0.025)
    }))
  },
  {
    id: 3,
    ticker: 'GLD',
    name: 'Gold ETF',
    sector: 'Commodities',
    price: 185.50,
    volume: 15000000,
    change: 0.8,
    volatility: 0.15,
    marketCap: 60000000000,
    coordinates: { x: 200, y: 300, z: 20 },
    alerts: [],
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`,
      price: 185 + Math.random() * 3 - 1.5,
      volume: 15000000 + Math.floor(Math.random() * 3000000 - 1500000),
      volatility: 0.15 + (Math.random() * 0.03 - 0.015)
    }))
  }
];

export default function MarketsPage() {
  const [theme, setTheme] = useState('industrial');
  const [marketData, setMarketData] = useState([]);
  const [filter, setFilter] = useState({ search: '', sortBy: 'price', sortOrder: 'desc', sector: 'all', timeRange: '30d' });
  const [chartError, setChartError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [alertDetails, setAlertDetails] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertComment, setAlertComment] = useState('');
  const [customAlertThresholds, setCustomAlertThresholds] = useState({ volatility: 0.5, priceChange: 5 });
  const [showCustomAlertModal, setShowCustomAlertModal] = useState(false);
  const dataFetchedRef = useRef(false);

  // Fetch data (replace with API endpoint)
  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    async function fetchData() {
      try {
        // Example API call (uncomment and configure in production)
        // const response = await fetch('/api/markets');
        // const data = await response.json();
        // setMarketData(data);
        setMarketData(initialMarketData); // Using sample data for now
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch market data');
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(asset => {
        const newPrice = asset.price + (Math.random() * 2 - 1);
        const newVolume = Math.max(0, asset.volume + Math.floor(Math.random() * 1000000 - 500000));
        const newVolatility = Math.min(1, Math.max(0, asset.volatility + (Math.random() * 0.02 - 0.01)));
        const priceChange = ((newPrice - asset.price) / asset.price) * 100;
        if (Math.abs(priceChange) > customAlertThresholds.priceChange || newVolatility > customAlertThresholds.volatility) {
          const newAlert = {
            id: Date.now(),
            severity: 'medium',
            message: `Price change: ${priceChange.toFixed(2)}% | Volatility: ${newVolatility.toFixed(2)}`,
            timestamp: new Date().toISOString(),
            resolved: false,
            comments: []
          };
          return {
            ...asset,
            price: newPrice,
            volume: newVolume,
            volatility: newVolatility,
            change: priceChange,
            alerts: [...asset.alerts, newAlert]
          };
        }
        return { ...asset, price: newPrice, volume: newVolume, volatility: newVolatility, change: priceChange };
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

  // Calculate portfolio performance
  const calculatePortfolioPerformance = useCallback((asset) => {
    const priceWeight = 0.5;
    const volatilityWeight = 0.3;
    const volumeWeight = 0.2;
    const normalizedPrice = asset.price / 200;
    const normalizedVolatility = 1 - asset.volatility;
    const normalizedVolume = asset.volume / 100000000;
    return Math.min(100, (priceWeight * normalizedPrice + volatilityWeight * normalizedVolatility + volumeWeight * normalizedVolume) * 100);
  }, []);

  // Memoized filtered and sorted assets
  const filteredAssets = useMemo(() => {
    if (!marketData.length) return [];
    return marketData
      .map(asset => ({ ...asset, performance: calculatePortfolioPerformance(asset) }))
      .filter(asset => filter.sector === 'all' || asset.sector === filter.sector)
      .filter(asset => !filter.search || asset.ticker.toLowerCase().includes(filter.search.toLowerCase()) || asset.name.toLowerCase().includes(filter.search.toLowerCase()))
      .sort((a, b) => {
        const valueA = a[filter.sortBy];
        const valueB = b[filter.sortBy];
        return filter.sortOrder === 'desc'
          ? (typeof valueA === 'string' ? valueB.localeCompare(valueA) : valueB - valueA)
          : (typeof valueA === 'string' ? valueA.localeCompare(valueB) : valueA - valueB);
      });
  }, [marketData, filter, calculatePortfolioPerformance]);

  // Memoized CSV and JSON data
  const csvData = useMemo(() => filteredAssets.map(asset => ({
    Ticker: asset.ticker,
    Name: asset.name,
    Sector: asset.sector,
    Price: `$${asset.price.toFixed(2)}`,
    Change: `${asset.change.toFixed(2)}%`,
    Volume: asset.volume.toLocaleString(),
    Volatility: asset.volatility.toFixed(2),
    MarketCap: `$${asset.marketCap.toLocaleString()}`,
    Performance: asset.performance.toFixed(1),
    Alerts: asset.alerts.length > 0 ? asset.alerts.map(a => a.message).join('; ') : 'None'
  })), [filteredAssets]);

  const jsonData = useMemo(() => JSON.stringify(filteredAssets, null, 2), [filteredAssets]);

  // PDF generation
  const generatePDF = useCallback(() => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('MarketSync Analytics Report', 10, 10);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 20);
      filteredAssets.forEach((asset, i) => {
        doc.text(`${asset.ticker} (${asset.name}): $${asset.price.toFixed(2)} | ${asset.change.toFixed(2)}%`, 10, 30 + i * 10);
      });
      doc.save(`market-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      setError('Failed to generate PDF');
    }
  }, [filteredAssets]);

  // Handle alert resolution
  const handleResolveAlert = useCallback((assetId, alertId, comment) => {
    setMarketData(prev => prev.map(asset =>
      asset.id === assetId ? {
        ...asset,
        alerts: asset.alerts.map(alert =>
          alert.id === alertId ? { ...alert, resolved: true, comments: [...alert.comments, { text: comment, timestamp: new Date().toISOString() }] } : alert
        )
      } : asset
    ));
    setActivityLog(prev => [...prev, { action: `Resolved alert for ${assetId}`, timestamp: new Date().toISOString() }]);
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
        <title>MarketSync Analytics Dashboard</title>
        <meta name="description" content="Real-time market analytics with price trends, portfolio performance, and 3D visualizations." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "MarketSync Analytics Dashboard",
            "description": "Advanced dashboard for financial market analytics."
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
              <h1 className="text-2xl font-bold tracking-tight">MarketSync Analytics Hub</h1>
              <p className={`text-sm ${themeStyles[theme].textSecondary}`}>Real-time market insights</p>
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
                filename={`market-report-${new Date().toISOString().split('T')[0]}.csv`}
                className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${theme === 'industrial' ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                aria-label="Export market data as CSV"
              >
                <FiDownload className="mr-1" /> CSV
              </CSVLink>
              <a
                href={`data:text/json;charset=utf-8,${encodeURIComponent(jsonData)}`}
                download={`market-report-${new Date().toISOString().split('T')[0]}.json`}
                className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${theme === 'industrial' ? 'bg-green-700 text-white hover:bg-green-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                aria-label="Export market data as JSON"
              >
                <FiDownload className="mr-1" /> JSON
              </a>
              <button
                onClick={generatePDF}
                className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${theme === 'industrial' ? 'bg-purple-700 text-white hover:bg-purple-600' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
                aria-label="Export market data as PDF"
              >
                <FiDownload className="mr-1" /> PDF
              </button>
              <button
                className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-all duration-200 ${theme === 'industrial' ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                aria-label="Toggle 3D market map"
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
              {/* Section 1: Market Overview */}
              <motion.section
                className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className={`px-4 py-3 transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
                  <h2 className="font-bold text-lg tracking-tight">Market Overview</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-lg text-center ${theme === 'industrial' ? 'bg-gray-900/50' : 'bg-amber-50/50'}`}>
                      <p className={`text-xs font-medium ${themeStyles[theme].textSecondary}`}>Average Price Change</p>
                      <p className="text-2xl font-bold">{(filteredAssets.reduce((sum, asset) => sum + asset.change, 0) / filteredAssets.length || 0).toFixed(2)}%</p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${theme === 'industrial' ? 'bg-gray-900/50' : 'bg-green-50/50'}`}>
                      <p className={`text-xs font-medium ${themeStyles[theme].textSecondary}`}>Total Volume</p>
                      <p className="text-2xl font-bold">{(filteredAssets.reduce((sum, asset) => sum + asset.volume, 0) / 1000000).toFixed(2)}M</p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${theme === 'industrial' ? 'bg-gray-900/50' : 'bg-blue-50/50'}`}>
                      <p className={`text-xs font-medium ${themeStyles[theme].textSecondary}`}>Average Volatility</p>
                      <p className="text-2xl font-bold">{(filteredAssets.reduce((sum, asset) => sum + asset.volatility, 0) / filteredAssets.length || 0).toFixed(2)}</p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${theme === 'industrial' ? 'bg-gray-900/50' : 'bg-purple-50/50'}`}>
                      <p className={`text-xs font-medium ${themeStyles[theme].textSecondary}`}>Total Market Cap</p>
                      <p className="text-2xl font-bold">${(filteredAssets.reduce((sum, asset) => sum + asset.marketCap, 0) / 1000000000).toFixed(2)}B</p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Section 2: Market Data Table */}
              <motion.section
                className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
                  <h2 className="font-bold text-lg tracking-tight">Market Data</h2>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search assets..."
                        value={filter.search}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                        className={`pl-10 pr-4 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                        aria-label="Search assets by ticker or name"
                      />
                    </div>
                    <select
                      value={filter.sector}
                      onChange={(e) => setFilter({ ...filter, sector: e.target.value })}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                      aria-label="Filter assets by sector"
                    >
                      <option value="all">All Sectors</option>
                      <option value="Technology">Technology</option>
                      <option value="Energy">Energy</option>
                      <option value="Commodities">Commodities</option>
                    </select>
                    <select
                      value={filter.sortBy}
                      onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                      aria-label="Sort assets by"
                    >
                      <option value="price">Price</option>
                      <option value="change">Change</option>
                      <option value="volume">Volume</option>
                      <option value="marketCap">Market Cap</option>
                    </select>
                    <button
                      onClick={() => setFilter({ ...filter, sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc' })}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                      aria-label="Toggle sort order"
                    >
                      {filter.sortOrder === 'asc' ? '↑' : '↓'}
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
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Ticker</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Sector</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Change</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Volume</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Volatility</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${themeStyles[theme].border}`}>
                      {filteredAssets.map(asset => (
                        <tr key={asset.id} className={`transition-all duration-200 ${theme === 'industrial' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50/50'}`} role="row">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium flex items-center">
                              {asset.ticker}
                              {asset.alerts.length > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                  {asset.alerts.filter(a => !a.resolved).length}
                                </span>
                              )}
                            </div>
                            <div className={`text-xs ${themeStyles[theme].textSecondary}`}>{asset.name}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{asset.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{asset.sector}</td>
                          <td className="px-4 py-3 whitespace-nowrap">${asset.price.toFixed(2)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`font-medium ${asset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {asset.change.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{asset.volume.toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{asset.volatility.toFixed(2)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedAsset(asset)}
                              className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition-all duration-200"
                              aria-label={`View details for ${asset.ticker}`}
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

              {/* Section 3: 3D Market Map */}
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
                        <h2 className="font-bold text-lg tracking-tight">3D Market Map</h2>
                      </div>
                      <div className="p-4">
                        <Suspense fallback={<SkeletonLoader />}>
                          <MarketsMap assets={filteredAssets} theme={theme} />
                        </Suspense>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>
              </ErrorBoundary>

              {/* Section 4: Price Trends */}
              <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setChartError(null)}>
                <Suspense fallback={<SkeletonLoader />}>
                  <motion.section
                    className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
                      <h2 className="font-bold text-lg tracking-tight">Price Trends</h2>
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
                            yKeys={['price', 'volume', 'volatility']}
                            colors={['#f59e0b', '#10b981', '#3b82f6']}
                            darkMode={theme === 'dark' || theme === 'industrial' || theme === 'highContrast'}
                            setChartError={setChartError}
                            onClick={(day) => console.log(`Clicked day: ${day}`)}
                          />
                        </div>
                      ) : (
                        <div className="h-80">
                          <BarChart
                            data={filteredAssets.map(asset => ({
                              name: asset.ticker,
                              price: asset.price,
                              volume: asset.volume / 1000000
                            }))}
                            xKey="name"
                            yKeys={['price', 'volume']}
                            colors={['#10b981', '#f59e0b']}
                            darkMode={theme === 'dark' || theme === 'industrial' || theme === 'highContrast'}
                            setChartError={setChartError}
                            onClick={(ticker) => setSelectedAsset(marketData.find(a => a.ticker === ticker))}
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
                              <p className={`text-sm ${theme === 'industrial' ? 'text-white' : 'text-gray-800'}`}>{alert.message} ({asset.ticker})</p>
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

              {/* Section 6: Portfolio Performance */}
              <motion.section
                className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className={`px-4 py-3 transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
                  <h2 className="font-bold text-lg tracking-tight">Portfolio Performance</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${themeStyles[theme].card}`}>
                      <p className={`text-sm font-medium ${themeStyles[theme].textSecondary}`}>Portfolio Value</p>
                      <p className="text-lg font-bold">${(filteredAssets.reduce((sum, asset) => sum + asset.price * 1000, 0)).toLocaleString()}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${themeStyles[theme].card}`}>
                      <p className={`text-sm font-medium ${themeStyles[theme].textSecondary}`}>Average Performance</p>
                      <p className="text-lg font-bold">{(filteredAssets.reduce((sum, asset) => sum + asset.performance, 0) / filteredAssets.length || 0).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Section 7: Market News */}
              <motion.section
                className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${themeStyles[theme].card}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className={`px-4 py-3 transition-colors duration-300 ${themeStyles[theme].cardHeader}`}>
                  <h2 className="font-bold text-lg tracking-tight">Market News</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${themeStyles[theme].card}`}>
                      <p className="text-sm font-medium">Tech Sector Surges on AI Advancements</p>
                      <p className={`text-xs ${themeStyles[theme].textSecondary}`}>Aug 4, 2025 • Bloomberg</p>
                      <p className="text-sm">Technology stocks rally as new AI innovations drive investor confidence.</p>
                    </div>
                    <div className={`p-4 rounded-lg ${themeStyles[theme].card}`}>
                      <p className="text-sm font-medium">Oil Prices Dip Amid Supply Concerns</p>
                      <p className={`text-xs ${themeStyles[theme].textSecondary}`}>Aug 3, 2025 • Reuters</p>
                      <p className="text-sm">Energy markets face volatility due to geopolitical tensions.</p>
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
                  <h2 className="font-bold text-lg tracking-tight">Activity Log</h2>
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
                    <p className="text-sm">{alertDetails.alert.message} (Ticker: {marketData.find(a => a.id === alertDetails.assetId)?.ticker || 'Unknown'})</p>
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
                        <label className={`block text-sm font-medium ${themeStyles[theme].textSecondary}`} htmlFor="volatility-threshold">Volatility Threshold</label>
                        <input
                          id="volatility-threshold"
                          type="number"
                          step="0.01"
                          value={customAlertThresholds.volatility}
                          onChange={(e) => setCustomAlertThresholds({ ...customAlertThresholds, volatility: parseFloat(e.target.value) || 0 })}
                          className={`w-full p-2 rounded-lg font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                          aria-label="Volatility threshold input"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${themeStyles[theme].textSecondary}`} htmlFor="price-change-threshold">Price Change Threshold (%)</label>
                        <input
                          id="price-change-threshold"
                          type="number"
                          step="0.1"
                          value={customAlertThresholds.priceChange}
                          onChange={(e) => setCustomAlertThresholds({ ...customAlertThresholds, priceChange: parseFloat(e.target.value) || 0 })}
                          className={`w-full p-2 rounded-lg font-medium transition-all duration-200 ${themeStyles[theme].card}`}
                          aria-label="Price change threshold input"
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
                  <span className="text-blue-500">Market</span>
                  <span className={theme === 'industrial' ? 'text-white' : 'text-gray-700'}>Sync</span>
                </h2>
                <p className={`text-sm ${themeStyles[theme].textSecondary}`}>Market Analytics System v1.0</p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className={`transition-all duration-200 ${themeStyles[theme].textSecondary} hover:text-white`} aria-label="Terms of service">Terms</a>
                <a href="#" className={`transition-all duration-200 ${themeStyles[theme].textSecondary} hover:text-white`} aria-label="Privacy policy">Privacy</a>
                <a href="#" className={`transition-all duration-200 ${themeStyles[theme].textSecondary} hover:text-white`} aria-label="Contact us">Contact</a>
                <a href="#" className={`transition-all duration-200 ${themeStyles[theme].textSecondary} hover:text-white`} aria-label="Support">Support</a>
              </div>
            </div>
            <div className={`mt-6 pt-6 border-t text-center text-sm ${themeStyles[theme].border}`}>
              © {new Date().getFullYear()} MarketSync Systems. All rights reserved.
            </div>
          </div>
        </footer>
      </motion.div>
    </>
  );
}
