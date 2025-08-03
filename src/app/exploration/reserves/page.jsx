'use client';

import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-center text-red-500 p-4">Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}

// Classification Badge
const ClassificationBadge = ({ classification }) => {
  const colors = {
    'Proved Developed Producing': 'bg-green-100 text-green-800',
    'Proved Developed Non-Producing': 'bg-blue-100 text-blue-800',
    'Proved Undeveloped': 'bg-amber-100 text-amber-800',
    Probable: 'bg-purple-100 text-purple-800',
    Possible: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full ${colors[classification]}`}
      aria-label={`Classification: ${classification}`}
    >
      {classification}
    </span>
  );
};

// Category Icon
const CategoryIcon = ({ category }) => {
  return category === 'Oil' ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-gray-700"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-gray-700"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
};

// Summary Cards Component
const SummaryCards = ({ summaryMetrics, reserves }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <p className="text-sm text-gray-500">Proved Reserves</p>
      <p className="text-2xl font-bold">
        {summaryMetrics.totalProved.toLocaleString()}
        <span className="text-sm font-normal ml-1">{reserves[0]?.category === 'Oil' ? 'MMbbl' : 'BCF'}</span>
      </p>
      <p className="text-xs text-green-600">+3.2% from last year</p>
    </div>
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <p className="text-sm text-gray-500">Probable Reserves</p>
      <p className="text-2xl font-bold">
        {summaryMetrics.totalProbable.toLocaleString()}
        <span className="text-sm font-normal ml-1">{reserves[0]?.category === 'Oil' ? 'MMbbl' : 'BCF'}</span>
      </p>
      <p className="text-xs text-amber-600">-1.5% from last year</p>
    </div>
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <p className="text-sm text-gray-500">Possible Reserves</p>
      <p className="text-2xl font-bold">
        {summaryMetrics.totalPossible.toLocaleString()}
        <span className="text-sm font-normal ml-1">{reserves[0]?.category === 'Oil' ? 'MMbbl' : 'BCF'}</span>
      </p>
      <p className="text-xs text-green-600">+8.7% from last year</p>
    </div>
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <p className="text-sm text-gray-500">Oil Reserves</p>
      <p className="text-2xl font-bold">
        {summaryMetrics.oilReserves.toLocaleString()}
        <span className="text-sm font-normal ml-1">MMbbl</span>
      </p>
      <p className="text-xs text-green-600">+2.1% from last year</p>
    </div>
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <p className="text-sm text-gray-500">Gas Reserves</p>
      <p className="text-2xl font-bold">
        {summaryMetrics.gasReserves.toLocaleString()}
        <span className="text-sm font-normal ml-1">BCF</span>
      </p>
      <p className="text-xs text-amber-600">-0.8% from last year</p>
    </div>
  </div>
);

// Reserve Card Component
const ReserveCard = ({ reserve, isSelected, onSelect }) => (
  <div
    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-amber-50' : ''}`}
    onClick={() => onSelect(reserve)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onSelect(reserve)}
    aria-label={`Select ${reserve.field}`}
  >
    <div className="flex justify-between items-start">
      <h3 className="font-bold text-gray-800">{reserve.field}</h3>
      <ClassificationBadge classification={reserve.classification} />
    </div>
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
      <CategoryIcon category={reserve.category} />
      <span>{reserve.location}</span>
    </div>
    <div className="flex justify-between items-center">
      <div className="text-sm font-medium">
        {reserve.volume.toLocaleString()}
        <span className="ml-1 text-gray-500">{reserve.category === 'Oil' ? 'MMbbl' : 'BCF'}</span>
      </div>
      <div className="text-sm text-gray-500">{reserve.recoveryFactor}% RF</div>
    </div>
  </div>
);

// Reserve Details Component
const ReserveDetails = ({ reserve, activeTab, setActiveTab, reportYear, setReportYear }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
    {/* Reserve Header */}
    <div className="bg-gray-800 text-white p-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{reserve.field}</h2>
          <p className="text-gray-300">{reserve.location}</p>
        </div>
        <div className="flex space-x-2">
          <ClassificationBadge classification={reserve.classification} />
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px">
        {['overview', 'recovery', 'economics', 'history', 'documents'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === tab
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            aria-label={`Switch to ${tab} tab`}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>
    </div>

    {/* Tab Content */}
    <div className="p-6">
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Reserve Attributes</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Operator</p>
                <p className="font-medium">{reserve.operator}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Classification</p>
                <p className="font-medium">{reserve.classification}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{reserve.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Volume</p>
                <p className="font-medium">
                  {reserve.volume.toLocaleString()}
                  <span className="ml-1 text-gray-500">
                    {reserve.category === 'Oil' ? 'million barrels' : 'billion cubic feet'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Uncertainty Level</p>
                <p className="font-medium">{reserve.uncertainty}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Dates & Audits</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">As of Date</p>
                <p className="font-medium">{reserve.asOfDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Audit</p>
                <p className="font-medium">{reserve.lastAudit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Audit Due</p>
                <p className="font-medium">{reserve.nextAudit}</p>
              </div>
            </div>
            <h3 className="font-bold text-gray-800 mt-6 mb-3">Notes</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{reserve.notes}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recovery' && (
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Recovery Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Recovery Factors</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Primary Recovery</span>
                    <span className="font-medium">{reserve.recoveryFactor}%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Secondary Potential</span>
                    <span className="font-medium">{reserve.category === 'Oil' ? '12-18%' : 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Tertiary Potential</span>
                    <span className="font-medium">{reserve.category === 'Oil' ? '5-8%' : 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Drive Mechanism</span>
                    <span className="font-medium">{reserve.category === 'Oil' ? 'Water Drive' : 'Gas Expansion'}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Reservoir Characteristics</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Porosity</span>
                    <span className="font-medium">18-24%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Permeability</span>
                    <span className="font-medium">150-300 mD</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Net/Gross</span>
                    <span className="font-medium">0.65</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Pressure</span>
                    <span className="font-medium">3,200 psi</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Recovery Plan</h4>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Recovery Plan Visualization</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'economics' && (
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Economic Evaluation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Key Metrics</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-gray-600">NPV (10% discount)</span>
                    <span className="font-medium">${(reserve.volume * 12).toLocaleString()}M</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">IRR</span>
                    <span className="font-medium">{reserve.classification.includes('Proved') ? '18-24%' : '12-18%'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Payback Period</span>
                    <span className="font-medium">{reserve.classification.includes('Proved') ? '4.5 years' : '6.2 years'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Break-even Price</span>
                    <span className="font-medium">{reserve.category === 'Oil' ? '$48/bbl' : '$2.85/MCF'}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Development Plan</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Development Type</span>
                    <span className="font-medium">
                      {reserve.classification.includes('Developed') ? 'Existing Infrastructure' : 'New Development'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">CAPEX</span>
                    <span className="font-medium">${(reserve.volume * 0.8).toLocaleString()}M</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">OPEX</span>
                    <span className="font-medium">{reserve.category === 'Oil' ? '$12/bbl' : '$0.85/MCF'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">FID Date</span>
                    <span className="font-medium">{reserve.classification.includes('Proved') ? 'Q3 2023' : 'Q2 2024'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Price Sensitivity</h4>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Economic Sensitivity Chart</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Reserve History</h3>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-700">Annual Changes</h4>
            <select
              className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm"
              value={reportYear}
              onChange={(e) => setReportYear(e.target.value)}
              aria-label="Select report year"
            >
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Opening Balance</p>
                <p className="font-medium">
                  {(reserve.volume * 0.95).toLocaleString()}
                  <span className="text-xs ml-1">{reserve.category === 'Oil' ? 'MMbbl' : 'BCF'}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Additions</p>
                <p className="font-medium text-green-600">
                  +{(reserve.volume * 0.12).toLocaleString()}
                  <span className="text-xs ml-1">{reserve.category === 'Oil' ? 'MMbbl' : 'BCF'}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Production</p>
                <p className="font-medium text-red-600">
                  -{(reserve.volume * 0.08).toLocaleString()}
                  <span className="text-xs ml-1">{reserve.category === 'Oil' ? 'MMbbl' : 'BCF'}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Revisions</p>
                <p className="font-medium text-amber-600">
                  {(reserve.volume * 0.03).toLocaleString()}
                  <span className="text-xs ml-1">{reserve.category === 'Oil' ? 'MMbbl' : 'BCF'}</span>
                </p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Historical Trend</h4>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Reserve History Chart</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Reserve Documentation</h3>
          <div className="space-y-4">
            {[
              { name: `Reserve Audit Report ${reportYear}`, type: 'PDF', size: '8 MB', updated: reserve.lastAudit },
              { name: 'Reservoir Simulation Model', type: 'ZIP', size: '125 MB', updated: '2023-02-15' },
              { name: 'Economic Evaluation', type: 'XLSX', size: '5 MB', updated: '2023-01-30' },
              { name: 'Regulatory Filing', type: 'PDF', size: '3 MB', updated: '2023-03-01' },
            ].map(doc => (
              <div key={doc.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.type} • {doc.size} • Updated {doc.updated}</p>
                </div>
                <button
                  className="text-amber-600 hover:text-amber-700"
                  aria-label={`Download ${doc.name}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

const ReservesPage = () => {
  const [reserves, setReserves] = useState([]);
  const [selectedReserve, setSelectedReserve] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('volume');
  const [reportYear, setReportYear] = useState(new Date().getFullYear().toString());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Debounced Search Handler
  const debouncedSetSearchQuery = useCallback(
    debounce((value) => setSearchQuery(value), 300),
    []
  );

  // Load Reserves Data
  useEffect(() => {
    const loadReservesData = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReserves([
          {
            id: 'rs-001',
            field: 'Titan Field',
            location: 'Gulf of Mexico',
            operator: 'ExxonMobil',
            classification: 'Proved Developed Producing',
            category: 'Oil',
            volume: 450,
            uncertainty: 'P90',
            recoveryFactor: 32.5,
            asOfDate: '2023-01-01',
            lastAudit: '2023-03-15',
            nextAudit: '2024-03-15',
            notes: 'Primary recovery with waterflood potential',
          },
          {
            id: 'rs-002',
            field: 'Atlas Structure',
            location: 'North Sea',
            operator: 'Shell',
            classification: 'Proved Undeveloped',
            category: 'Gas',
            volume: 2800,
            uncertainty: 'P50',
            recoveryFactor: 68.2,
            asOfDate: '2023-01-01',
            lastAudit: '2023-02-28',
            nextAudit: '2024-02-28',
            notes: 'Requires new platform installation',
          },
          {
            id: 'rs-003',
            field: 'Phoenix Prospect',
            location: 'Offshore Brazil',
            operator: 'Petrobras',
            classification: 'Probable',
            category: 'Oil',
            volume: 220,
            uncertainty: 'P10',
            recoveryFactor: 24.8,
            asOfDate: '2023-01-01',
            lastAudit: '2023-04-10',
            nextAudit: '2024-04-10',
            notes: 'Appraisal drilling ongoing',
          },
          {
            id: 'rs-004',
            field: 'Olympus Lead',
            location: 'West Africa',
            operator: 'TotalEnergies',
            classification: 'Possible',
            category: 'Gas',
            volume: 1500,
            uncertainty: 'P10',
            recoveryFactor: 55.7,
            asOfDate: '2023-01-01',
            lastAudit: '2023-01-20',
            nextAudit: '2024-01-20',
            notes: 'Contingent on FID by Q2 2024',
          },
          {
            id: 'rs-005',
            field: 'Neptune Field',
            location: 'South China Sea',
            operator: 'CNOOC',
            classification: 'Proved Developed Non-Producing',
            category: 'Oil',
            volume: 320,
            uncertainty: 'P90',
            recoveryFactor: 28.3,
            asOfDate: '2023-01-01',
            lastAudit: '2023-05-05',
            nextAudit: '2024-05-05',
            notes: 'Shut-in pending facility upgrades',
          },
        ]);
      } catch (error) {
        console.error('Failed to load reserves data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadReservesData();
  }, []);

  // Calculate Summary Metrics
  const summaryMetrics = useMemo(
    () => ({
      totalProved: reserves
        .filter(r => r.classification.includes('Proved'))
        .reduce((sum, r) => sum + r.volume, 0),
      totalProbable: reserves
        .filter(r => r.classification === 'Probable')
        .reduce((sum, r) => sum + r.volume, 0),
      totalPossible: reserves
        .filter(r => r.classification === 'Possible')
        .reduce((sum, r) => sum + r.volume, 0),
      oilReserves: reserves
        .filter(r => r.category === 'Oil')
        .reduce((sum, r) => sum + r.volume, 0),
      gasReserves: reserves
        .filter(r => r.category === 'Gas')
        .reduce((sum, r) => sum + r.volume, 0),
    }),
    [reserves]
  );

  // Filter and Search Reserves
  const filteredReserves = useMemo(() => {
    return reserves.filter(reserve => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'proved' && reserve.classification.includes('Proved')) ||
        (filter === 'unproved' && !reserve.classification.includes('Proved')) ||
        reserve.classification === filter ||
        reserve.category === filter;
      const matchesSearch =
        reserve.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reserve.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reserve.operator.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [reserves, filter, searchQuery]);

  // Sort Reserves
  const sortedReserves = useMemo(() => {
    return [...filteredReserves].sort((a, b) => {
      if (sortBy === 'volume') return b.volume - a.volume;
      if (sortBy === 'recovery') return b.recoveryFactor - a.recoveryFactor;
      if (sortBy === 'date') return new Date(b.asOfDate) - new Date(a.asOfDate);
      return a.field.localeCompare(b.field);
    });
  }, [filteredReserves, sortBy]);

  // Event Handlers
  const handleSelectReserve = useCallback((reserve) => {
    setSelectedReserve(reserve);
  }, []);

  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
  }, []);

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);

  const handleReportYearChange = useCallback((e) => {
    setReportYear(e.target.value);
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>PETROVISION | Reserves Management</title>
          <meta name="description" content="Petroleum reserves tracking and reporting system" />
        </Head>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Hydrocarbon Reserves</h2>
              <p className="text-gray-600">SPE-PRMS compliant reserves reporting and analysis</p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center"
                aria-label="Add new report"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                New Report
              </button>
              <button
                className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg flex items-center"
                aria-label="Export data"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Export
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <SummaryCards summaryMetrics={summaryMetrics} reserves={reserves} />

          {/* Reserves Grid and Detail View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reserves List Panel */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-100 p-4 border-b">
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <input
                    type="text"
                    placeholder="Search reserves..."
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={searchQuery}
                    onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                    aria-label="Search reserves by field, location, or operator"
                  />
                  <select
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={filter}
                    onChange={handleFilterChange}
                    aria-label="Filter reserves"
                  >
                    <option value="all">All Reserves</option>
                    <option value="proved">All Proved</option>
                    <option value="unproved">Unproved</option>
                    <option value="Proved Developed Producing">PDP</option>
                    <option value="Proved Developed Non-Producing">PDNP</option>
                    <option value="Proved Undeveloped">PUD</option>
                    <option value="Probable">Probable</option>
                    <option value="Possible">Possible</option>
                    <option value="Oil">Oil</option>
                    <option value="Gas">Gas</option>
                  </select>
                  <select
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={sortBy}
                    onChange={handleSortChange}
                    aria-label="Sort reserves"
                  >
                    <option value="volume">Sort by Volume</option>
                    <option value="recovery">Sort by Recovery</option>
                    <option value="date">Sort by Date</option>
                    <option value="field">Sort by Field</option>
                  </select>
                </div>
              </div>
              <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
                  </div>
                ) : sortedReserves.length > 0 ? (
                  sortedReserves.map(reserve => (
                    <ReserveCard
                      key={reserve.id}
                      reserve={reserve}
                      isSelected={selectedReserve?.id === reserve.id}
                      onSelect={handleSelectReserve}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No reserves match your filters or search
                  </div>
                )}
              </div>
            </div>

            {/* Reserves Detail View */}
            <div className="lg:col-span-2">
              {selectedReserve ? (
                <ReserveDetails
                  reserve={selectedReserve}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  reportYear={reportYear}
                  setReportYear={handleReportYearChange}
                />
              ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Reserve Selected</h3>
                    <p className="text-gray-500 mb-4">Select a reserve from the list to view detailed information</p>
                    <button
                      className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
                      onClick={() => {
                        const firstReserve = sortedReserves.length > 0 ? sortedReserves[0] : null;
                        setSelectedReserve(firstReserve);
                      }}
                      disabled={sortedReserves.length === 0}
                      aria-label="View first reserve"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View First Reserve
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 border-t border-gray-200 py-6 mt-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-gray-800">
                  <span className="text-amber-600">PETRO</span>VISION
                </h2>
                <p className="text-sm text-gray-600">Reserves Management System</p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Terms
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Privacy
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Contact
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Support
                </a>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              © 2025 PetroVision Systems. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

// PropTypes for Type Checking
ClassificationBadge.propTypes = {
  classification: PropTypes.string.isRequired,
};

CategoryIcon.propTypes = {
  category: PropTypes.string.isRequired,
};

SummaryCards.propTypes = {
  summaryMetrics: PropTypes.shape({
    totalProved: PropTypes.number.isRequired,
    totalProbable: PropTypes.number.isRequired,
    totalPossible: PropTypes.number.isRequired,
    oilReserves: PropTypes.number.isRequired,
    gasReserves: PropTypes.number.isRequired,
  }).isRequired,
  reserves: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
    })
  ).isRequired,
};

ReserveCard.propTypes = {
  reserve: PropTypes.shape({
    id: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    classification: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    volume: PropTypes.number.isRequired,
    recoveryFactor: PropTypes.number.isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

ReserveDetails.propTypes = {
  reserve: PropTypes.shape({
    id: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    operator: PropTypes.string.isRequired,
    classification: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    volume: PropTypes.number.isRequired,
    uncertainty: PropTypes.string.isRequired,
    recoveryFactor: PropTypes.number.isRequired,
    asOfDate: PropTypes.string.isRequired,
    lastAudit: PropTypes.string.isRequired,
    nextAudit: PropTypes.string.isRequired,
    notes: PropTypes.string.isRequired,
  }).isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  reportYear: PropTypes.string.isRequired,
  setReportYear: PropTypes.func.isRequired,
};

export default ReservesPage;