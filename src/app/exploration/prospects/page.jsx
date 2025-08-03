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

// Prospect Potential Badge
const PotentialBadge = ({ potential }) => {
  const colors = {
    'very high': 'bg-purple-600 text-white',
    high: 'bg-green-600 text-white',
    medium: 'bg-amber-500 text-white',
    low: 'bg-gray-500 text-white',
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[potential]}`} aria-label={`Potential: ${potential}`}>
      {potential.toUpperCase()}
    </span>
  );
};

// Prospect Status Badge
const StatusBadge = ({ status }) => {
  const colors = {
    evaluation: 'bg-blue-100 text-blue-800',
    drilling: 'bg-amber-100 text-amber-800',
    discovery: 'bg-green-100 text-green-800',
    abandoned: 'bg-gray-100 text-gray-800',
  };
  const labels = {
    evaluation: 'Evaluation',
    drilling: 'Drilling',
    discovery: 'Discovery',
    abandoned: 'Abandoned',
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[status]}`} aria-label={`Status: ${labels[status]}`}>
      {labels[status]}
    </span>
  );
};

// Prospect Card Component
const ProspectCard = ({ prospect, isSelected, onSelect }) => (
  <div
    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-amber-50' : ''}`}
    onClick={() => onSelect(prospect)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onSelect(prospect)}
    aria-label={`Select ${prospect.name}`}
  >
    <div className="flex justify-between items-start">
      <h3 className="font-bold text-gray-800">{prospect.name}</h3>
      <PotentialBadge potential={prospect.potential} />
    </div>
    <p className="text-sm text-gray-600 mb-2">{prospect.location}</p>
    <div className="flex justify-between items-center">
      <StatusBadge status={prospect.status} />
      <div className="text-sm text-gray-500">
        {prospect.estimatedReserves} MMbbl | {prospect.probability}% Prob
      </div>
    </div>
  </div>
);

// Prospect Details Component
const ProspectDetails = ({ prospect, activeTab, setActiveTab, mapView, setMapView, seismicData }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
    {/* Prospect Header */}
    <div className="bg-gray-800 text-white p-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{prospect.name}</h2>
          <p className="text-gray-300">{prospect.location}</p>
        </div>
        <div className="flex space-x-2">
          <PotentialBadge potential={prospect.potential} />
          <StatusBadge status={prospect.status} />
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px">
        {['summary', 'geology', 'seismic', 'economics', 'documents'].map(tab => (
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
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Key Attributes</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Operator</p>
                <p className="font-medium">{prospect.operator}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Reserves</p>
                <p className="font-medium">{prospect.estimatedReserves} million barrels</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Probability of Success</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${prospect.probability}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{prospect.probability}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Water Depth</p>
                <p className="font-medium">{prospect.waterDepth} meters</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Lease Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Lease Expiry</p>
                <p className="font-medium">{prospect.leaseExpiry}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Seismic Quality</p>
                <p className="font-medium capitalize">{prospect.seismicQuality}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{prospect.lastUpdated}</p>
              </div>
            </div>
            <h3 className="font-bold text-gray-800 mt-6 mb-3">Map View</h3>
            <div className="flex space-x-2 mb-3">
              <button
                onClick={() => setMapView('2d')}
                className={`px-3 py-1 rounded text-sm ${
                  mapView === '2d' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-800'
                }`}
                aria-label="Switch to 2D map view"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setMapView('2d')}
              >
                2D Map
              </button>
              <button
                onClick={() => setMapView('3d')}
                className={`px-3 py-1 rounded text-sm ${
                  mapView === '3d' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-800'
                }`}
                aria-label="Switch to 3D model view"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setMapView('3d')}
              >
                3D Model
              </button>
            </div>
            <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              {mapView === '2d' ? (
                <p className="text-gray-500">2D Map of {prospect.name}</p>
              ) : (
                <p className="text-gray-500">3D Geological Model</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'geology' && (
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Geological Characteristics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Stratigraphy</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Reservoir Age</span>
                    <span className="font-medium">Miocene</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Reservoir Type</span>
                    <span className="font-medium">Deepwater Turbidite</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Seal Rock</span>
                    <span className="font-medium">Shale</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Source Rock</span>
                    <span className="font-medium">Type II Kerogen</span>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Trap Characteristics</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Trap Type</span>
                    <span className="font-medium">Structural/Stratigraphic</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Closure Area</span>
                    <span className="font-medium">15.2 km²</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Net Pay</span>
                    <span className="font-medium">45-85 m</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Porosity</span>
                    <span className="font-medium">18-24%</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-2">Cross Section</h4>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Geological Cross Section Diagram</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'seismic' && seismicData && (
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Seismic Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Survey Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Survey Name</span>
                    <span className="font-medium">{seismicData.name}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Acquisition Date</span>
                    <span className="font-medium">{seismicData.acquisitionDate}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Resolution</span>
                    <span className="font-medium capitalize">{seismicData.resolution}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Area Covered</span>
                    <span className="font-medium">{seismicData.area} km²</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Processing</span>
                    <span className="font-medium">{seismicData.processing}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Interpretation Status</span>
                    <span className="font-medium capitalize">{seismicData.interpretationStatus}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Seismic Attributes</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Amplitude Anomaly</span>
                    <span className="font-medium">Strong</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">AVO Class</span>
                    <span className="font-medium">III</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Flat Spot</span>
                    <span className="font-medium">Present</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Faulting</span>
                    <span className="font-medium">Moderate</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Data Quality</span>
                    <span className="font-medium">{prospect.seismicQuality}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Seismic Sections</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Inline 1250</p>
              </div>
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Crossline 780</p>
              </div>
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Time Slice 2200ms</p>
              </div>
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Arbitrary Line A-A'</p>
              </div>
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
                    <span className="font-medium">$1.2B</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">IRR</span>
                    <span className="font-medium">22%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Payback Period</span>
                    <span className="font-medium">5.2 years</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Break-even Price</span>
                    <span className="font-medium">$48/bbl</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">CAPEX</span>
                    <span className="font-medium">$3.8B</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">OPEX</span>
                    <span className="font-medium">$12/bbl</span>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Production Profile</h4>
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <p className="text-gray-500">Production Forecast Chart</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-gray-600">Peak Rate</p>
                  <p className="font-medium">85,000 bbl/d</p>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-gray-600">Plateau</p>
                  <p className="font-medium">4 years</p>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-gray-600">Decline Rate</p>
                  <p className="font-medium">12%/yr</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Sensitivity Analysis</h4>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Tornado Diagram</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Documents & Reports</h3>
          <div className="space-y-4">
            {[
              { name: 'Geological Evaluation Report', type: 'PDF', size: '15 MB', updated: '2023-05-15' },
              { name: 'Seismic Interpretation', type: 'ZIP', size: '245 MB', updated: '2023-04-28' },
              { name: 'Reservoir Simulation Results', type: 'XLSX', size: '8 MB', updated: '2023-06-02' },
              { name: 'Economic Model', type: 'XLSX', size: '3 MB', updated: '2023-05-30' },
            ].map(doc => (
              <div key={doc.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.type} • {doc.size} • Updated {doc.updated}</p>
                </div>
                <button className="text-amber-600 hover:text-amber-700" aria-label={`Download ${doc.name}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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

const ProspectsPage = () => {
  const [prospects, setProspects] = useState([]);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('potential');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapView, setMapView] = useState('2d');
  const [seismicData, setSeismicData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Debounced Search Handler
  const debouncedSetSearchQuery = useCallback(
    debounce((value) => setSearchQuery(value), 300),
    []
  );

  // Load Prospect Data
  useEffect(() => {
    const loadProspectData = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setProspects([
          {
            id: 'pr-001',
            name: 'Titan Field',
            location: 'Gulf of Mexico',
            coordinates: [28.5, -89.0],
            status: 'evaluation',
            potential: 'high',
            estimatedReserves: 450,
            probability: 65,
            waterDepth: 1500,
            leaseExpiry: '2025-12-31',
            seismicQuality: 'excellent',
            lastUpdated: '2023-06-15',
            operator: 'ExxonMobil',
          },
          {
            id: 'pr-002',
            name: 'Atlas Structure',
            location: 'North Sea',
            coordinates: [58.0, 1.5],
            status: 'drilling',
            potential: 'very high',
            estimatedReserves: 780,
            probability: 45,
            waterDepth: 320,
            leaseExpiry: '2026-08-15',
            seismicQuality: 'good',
            lastUpdated: '2023-05-22',
            operator: 'Shell',
          },
          {
            id: 'pr-003',
            name: 'Phoenix Prospect',
            location: 'Offshore Brazil',
            coordinates: [-22.0, -38.0],
            status: 'discovery',
            potential: 'medium',
            estimatedReserves: 220,
            probability: 80,
            waterDepth: 2100,
            leaseExpiry: '2027-03-30',
            seismicQuality: 'fair',
            lastUpdated: '2023-06-01',
            operator: 'Petrobras',
          },
          {
            id: 'pr-004',
            name: 'Olympus Lead',
            location: 'West Africa',
            coordinates: [-5.0, 8.0],
            status: 'evaluation',
            potential: 'high',
            estimatedReserves: 380,
            probability: 55,
            waterDepth: 1800,
            leaseExpiry: '2025-09-30',
            seismicQuality: 'good',
            lastUpdated: '2023-04-18',
            operator: 'TotalEnergies',
          },
        ]);
        setSeismicData({
          id: 'seismic-001',
          name: 'Gulf Coast 3D Survey',
          acquisitionDate: '2022-10-15',
          resolution: 'high',
          area: 1200,
          processing: 'pre-stack depth migration',
          interpretationStatus: 'in progress',
        });
      } catch (error) {
        console.error('Failed to load prospect data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProspectData();
  }, []);

  // Memoized Filter and Search
  const filteredProspects = useMemo(() => {
    return prospects.filter(prospect => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'high-potential' && ['high', 'very high'].includes(prospect.potential)) ||
        (filter === 'near-expiry' &&
          new Date(prospect.leaseExpiry) <= new Date(new Date().setMonth(new Date().getMonth() + 6))) ||
        prospect.status === filter;
      const matchesSearch =
        prospect.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prospect.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prospect.operator.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [prospects, filter, searchQuery]);

  // Memoized Sort
  const sortedProspects = useMemo(() => {
    return [...filteredProspects].sort((a, b) => {
      if (sortBy === 'potential') {
        const potentialOrder = { 'very high': 4, high: 3, medium: 2, low: 1 };
        return potentialOrder[b.potential] - potentialOrder[a.potential];
      }
      if (sortBy === 'reserves') return b.estimatedReserves - a.estimatedReserves;
      if (sortBy === 'probability') return b.probability - a.probability;
      if (sortBy === 'waterDepth') return b.waterDepth - a.waterDepth;
      return new Date(b.lastUpdated) - new Date(a.lastUpdated);
    });
  }, [filteredProspects, sortBy]);

  // Event Handlers
  const handleSelectProspect = useCallback((prospect) => {
    setSelectedProspect(prospect);
  }, []);

  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
  }, []);

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>PETROVISION | Prospects & Exploration</title>
          <meta name="description" content="Petroleum prospect evaluation and exploration management system" />
        </Head>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Exploration Prospects</h2>
              <p className="text-gray-600">Manage and evaluate your exploration portfolio</p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center"
                aria-label="Add new prospect"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Prospect
              </button>
              <button
                className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg flex items-center"
                aria-label="Export data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prospect List Panel */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-100 p-4 border-b">
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <input
                    type="text"
                    placeholder="Search prospects..."
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={searchQuery}
                    onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                    aria-label="Search prospects by name, location, or operator"
                  />
                  <select
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={filter}
                    onChange={handleFilterChange}
                    aria-label="Filter prospects"
                  >
                    <option value="all">All Prospects</option>
                    <option value="high-potential">High Potential</option>
                    <option value="evaluation">Under Evaluation</option>
                    <option value="drilling">Drilling</option>
                    <option value="discovery">Discovery</option>
                    <option value="near-expiry">Near Lease Expiry</option>
                  </select>
                  <select
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={sortBy}
                    onChange={handleSortChange}
                    aria-label="Sort prospects"
                  >
                    <option value="potential">Sort by Potential</option>
                    <option value="reserves">Sort by Reserves</option>
                    <option value="probability">Sort by Probability</option>
                    <option value="waterDepth">Sort by Water Depth</option>
                    <option value="recent">Sort by Recent</option>
                  </select>
                </div>
              </div>
              <div className="divide-y divide-gray-200 max-h-[calc(100vh-250px)] overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
                  </div>
                ) : sortedProspects.length > 0 ? (
                  sortedProspects.map(prospect => (
                    <ProspectCard
                      key={prospect.id}
                      prospect={prospect}
                      isSelected={selectedProspect?.id === prospect.id}
                      onSelect={handleSelectProspect}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No prospects match your filters or search
                  </div>
                )}
              </div>
            </div>

            {/* Prospect Detail View */}
            <div className="lg:col-span-2">
              {selectedProspect ? (
                <ProspectDetails
                  prospect={selectedProspect}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  mapView={mapView}
                  setMapView={setMapView}
                  seismicData={seismicData}
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
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Prospect Selected</h3>
                    <p className="text-gray-500 mb-4">Select a prospect from the list to view detailed information</p>
                    <button
                      className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
                      onClick={() => {
                        const firstProspect = sortedProspects.length > 0 ? sortedProspects[0] : null;
                        setSelectedProspect(firstProspect);
                      }}
                      disabled={sortedProspects.length === 0}
                      aria-label="View first prospect"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View First Prospect
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

      </div>
    </ErrorBoundary>
  );
};

// PropTypes for Type Checking
ProspectCard.propTypes = {
  prospect: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    potential: PropTypes.string.isRequired,
    estimatedReserves: PropTypes.number.isRequired,
    probability: PropTypes.number.isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

ProspectDetails.propTypes = {
  prospect: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    potential: PropTypes.string.isRequired,
    estimatedReserves: PropTypes.number.isRequired,
    probability: PropTypes.number.isRequired,
    waterDepth: PropTypes.number.isRequired,
    leaseExpiry: PropTypes.string.isRequired,
    seismicQuality: PropTypes.string.isRequired,
    lastUpdated: PropTypes.string.isRequired,
    operator: PropTypes.string.isRequired,
    coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  mapView: PropTypes.string.isRequired,
  setMapView: PropTypes.func.isRequired,
  seismicData: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    acquisitionDate: PropTypes.string,
    resolution: PropTypes.string,
    area: PropTypes.number,
    processing: PropTypes.string,
    interpretationStatus: PropTypes.string,
  }),
};

PotentialBadge.propTypes = {
  potential: PropTypes.string.isRequired,
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

export default ProspectsPage;