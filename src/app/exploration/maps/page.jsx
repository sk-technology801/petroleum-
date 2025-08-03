'use client';

import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import mapboxgl from 'mapbox-gl';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

const PetroleumExplorationSuite = () => {
  // Core State Management
  const [activeLayer, setActiveLayer] = useState('seismic');
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/dark-v10');
  const [is3DView, setIs3DView] = useState(false);
  const [measurementMode, setMeasurementMode] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [crossSectionMode, setCrossSectionMode] = useState(false);
  const [isSimulatingData, setIsSimulatingData] = useState(true);
  const [alerts, setAlerts] = useState([
    { id: 1, severity: 'high', message: 'Pressure anomaly at ALPHA-1 (3200 psi)', time: '10:23 AM' },
    { id: 2, severity: 'medium', message: 'Maintenance scheduled for BRAVO-3', time: 'Yesterday' },
  ]);

  // Real-time Data
  const [realTimeData, setRealTimeData] = useState({
    oilPrice: 84.32,
    productionRate: 24567,
    activeWells: 42,
    reservoirPressure: 3200,
    drillingEfficiency: 78.5,
  });

  // GIS Tools State
  const [layerVisibility, setLayerVisibility] = useState({
    reservoirPressure: true,
    faultLines: true,
    productionZones: false,
    seismicData: true,
    licenseBlocks: true,
  });

  // Mapbox Reference
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Sample Oilfield Data
  const fieldData = {
    wells: [
      {
        id: 1,
        name: 'ALPHA-1',
        type: 'production',
        coords: [29.7604, -95.3698],
        depth: 12500,
        status: 'active',
        pressure: 3200,
        production: 2450,
        lastInspection: '2023-11-15',
        operator: 'ExxonMobil',
      },
      {
        id: 2,
        name: 'BRAVO-3',
        type: 'injection',
        coords: [29.7610, -95.3705],
        depth: 9800,
        status: 'active',
        pressure: 2800,
        production: 0,
        lastInspection: '2023-10-22',
        operator: 'Chevron',
      },
      {
        id: 3,
        name: 'CHARLIE-7',
        type: 'exploration',
        coords: [29.7590, -95.3680],
        depth: 15000,
        status: 'drilling',
        pressure: 0,
        production: 0,
        lastInspection: '2023-12-01',
        operator: 'Shell',
      },
    ],
    pipelines: [
      {
        id: 'pipe-1',
        name: 'Main Export Line',
        coords: [
          [29.7600, -95.3700],
          [29.7650, -95.3750],
          [29.7700, -95.3800],
        ],
        diameter: 24,
        material: 'Carbon Steel',
        maxPressure: 1440,
        lastInspection: '2023-09-10',
      },
      {
        id: 'pipe-2',
        name: 'Gas Injection Network',
        coords: [
          [29.7590, -95.3680],
          [29.7580, -95.3670],
          [29.7570, -95.3660],
        ],
        diameter: 12,
        material: 'Stainless Steel',
        maxPressure: 960,
        lastInspection: '2023-11-05',
      },
    ],
    seismicSurveys: [
      {
        id: 'survey-1',
        name: 'Gulf Coast 3D Survey 2024',
        coords: [
          [29.75, -95.38],
          [29.77, -95.38],
          [29.77, -95.36],
          [29.75, -95.36],
        ],
        resolution: 'High',
        date: '2024-01-15',
        contractor: 'Schlumberger',
      },
    ],
    licenseBlocks: [
      {
        id: 'block-a',
        name: 'Offshore Block A',
        coords: [
          [29.7, -95.4],
          [29.7, -95.3],
          [29.8, -95.3],
          [29.8, -95.4],
        ],
        licenseHolder: 'BP',
        expiryDate: '2030-12-31',
        estimatedReserves: 450000000,
      },
    ],
  };

  // Production Data for Chart
  const productionData = [
    { month: 'Jan', production: 22000 },
    { month: 'Feb', production: 23500 },
    { month: 'Mar', production: 24500 },
    { month: 'Apr', production: 25000 },
    { month: 'May', production: 24000 },
    { month: 'Jun', production: 24800 },
  ];

  // Simulate Real-time Data
  const simulateRealTimeData = useCallback(() => {
    setRealTimeData((prev) => {
      const currentPrice = typeof prev.oilPrice === 'number' ? prev.oilPrice : parseFloat(prev.oilPrice);
      const currentProduction = typeof prev.productionRate === 'number' ? prev.productionRate : parseInt(prev.productionRate);

      return {
        oilPrice: parseFloat((currentPrice + (Math.random() * 0.5 - 0.25)).toFixed(2)),
        productionRate: Math.max(0, currentProduction + Math.floor(Math.random() * 100 - 50)),
        activeWells: prev.activeWells,
        reservoirPressure: prev.reservoirPressure + (Math.random() * 50 - 25),
        drillingEfficiency: Math.min(100, Math.max(0, prev.drillingEfficiency + (Math.random() * 2 - 1))),
      };
    });
  }, []);

  // Data Simulation Control
  useEffect(() => {
    let interval;
    if (isSimulatingData) {
      interval = setInterval(simulateRealTimeData, 3000);
    }
    return () => clearInterval(interval);
  }, [isSimulatingData, simulateRealTimeData]);

  // Initialize Mapbox
  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN';
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [-95.3698, 29.7604],
      zoom: 14,
    });

    map.current.on('load', () => {
      // Add wells
      map.current.addSource('wells', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: fieldData.wells.map((well) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [well.coords[1], well.coords[0]],
            },
            properties: well,
          })),
        },
      });

      map.current.addLayer({
        id: 'wells',
        type: 'circle',
        source: 'wells',
        paint: {
          'circle-radius': 8,
          'circle-color': ['match', ['get', 'status'], 'active', '#22C55E', 'drilling', '#F59E0B', '#EF4444'],
          'circle-opacity': layerVisibility.wells ? 1 : 0,
        },
      });

      // Add pipelines
      map.current.addSource('pipelines', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: fieldData.pipelines.map((pipeline) => ({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: pipeline.coords.map((coord) => [coord[1], coord[0]]),
            },
            properties: pipeline,
          })),
        },
      });

      map.current.addLayer({
        id: 'pipelines',
        type: 'line',
        source: 'pipelines',
        paint: {
          'line-color': '#3B82F6',
          'line-width': 4,
          'line-opacity': layerVisibility.pipelines ? 1 : 0,
        },
      });

      // Add seismic surveys
      map.current.addSource('seismicSurveys', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: fieldData.seismicSurveys.map((survey) => ({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [survey.coords.map((coord) => [coord[1], coord[0]])],
            },
            properties: survey,
          })),
        },
      });

      map.current.addLayer({
        id: 'seismicSurveys',
        type: 'fill',
        source: 'seismicSurveys',
        paint: {
          'fill-color': '#8B5CF6',
          'fill-opacity': layerVisibility.seismicData ? 0.5 : 0,
        },
      });

      // Add click handlers
      ['wells', 'pipelines', 'seismicSurveys'].forEach((layer) => {
        map.current.on('click', layer, (e) => {
          const props = e.features[0].properties;
          handleAssetClick({ ...props, type: layer });
        });

        map.current.on('mouseenter', layer, () => {
          map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', layer, () => {
          map.current.getCanvas().style.cursor = '';
        });
      });
    });

    return () => map.current.remove();
  }, [mapStyle, layerVisibility]);

  // Asset Selection Handler
  const handleAssetClick = (asset) => {
    setSelectedAsset({
      ...asset,
      type: asset.type || (asset.diameter ? 'pipeline' : asset.resolution ? 'seismic' : 'well'),
    });
  };

  // Toggle Cross Section Mode
  const toggleCrossSection = () => {
    setCrossSectionMode((prev) => !prev);
  };

  // Dismiss Alert
  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // 3D Subsurface Visualization
  const render3DSubsurface = () => (
    <div className="absolute inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4 animate-slide-up">
      <div className="bg-gray-900 border-2 border-amber-600 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] relative transform perspective-1000 rotate-x-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-amber-500">3D Reservoir Simulation</h3>
            <p className="text-gray-300">Real-time subsurface modeling with geological insights</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg text-sm">
              Export Model
            </button>
            <button
              onClick={() => setIs3DView(false)}
              className="bg-red-600 hover:bg-red-700 p-2 rounded-lg"
              aria-label="Close 3D view"
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-4rem)]">
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-4 border border-amber-800 shadow-lg">
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-full h-64 bg-gradient-to-b from-amber-900 to-amber-600 rounded-lg shadow-2xl overflow-hidden transform rotate-x-15">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-300 text-lg font-mono">3D Reservoir Visualization</span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-xs text-gray-200">
                    <p>Fault Planes: 4 | Layers: 12</p>
                    <p>Depth Range: 9,500 - 14,200 ft</p>
                  </div>
                </div>
                <p className="text-gray-300 mt-3 font-mono">
                  Pressure Gradient: 0.48 psi/ft | Volume: 1.2M bbl
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-4 border border-amber-800">
              <h4 className="font-bold text-amber-500 mb-3">Reservoir Properties</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-300">Porosity</p>
                  <p className="font-mono">18.7 ± 2.3%</p>
                </div>
                <div>
                  <p className="text-gray-300">Permeability</p>
                  <p className="font-mono">285 mD</p>
                </div>
                <div>
                  <p className="text-gray-300">Oil Saturation</p>
                  <p className="font-mono">71.5%</p>
                </div>
                <div>
                  <p className="text-gray-300">API Gravity</p>
                  <p className="font-mono">32.1°</p>
                </div>
                <div>
                  <p className="text-gray-300">Water Cut</p>
                  <p className="font-mono">22.4%</p>
                </div>
                <div>
                  <p className="text-gray-300">GOR</p>
                  <p className="font-mono">850 scf/bbl</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 border border-amber-800">
              <h4 className="font-bold text-amber-500 mb-3">Simulation Controls</h4>
              <div className="space-y-3">
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Pressure Contours</span>
                    <input type="checkbox" className="toggle bg-amber-600" defaultChecked />
                  </label>
                </div>
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Fluid Migration</span>
                    <input type="checkbox" className="toggle bg-amber-600" />
                  </label>
                </div>
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Fault Visualization</span>
                    <input type="checkbox" className="toggle bg-amber-600" defaultChecked />
                  </label>
                </div>
                <button className="w-full bg-amber-600 hover:bg-amber-700 py-2 rounded-lg text-sm mt-2">
                  Run Simulation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Measurement Tools Panel
  const renderMeasurementTools = () => (
    <div className="absolute bottom-20 right-4 z-30 bg-gray-900 rounded-xl border border-amber-800 shadow-2xl p-4 w-64 animate-slide-up">
      <h4 className="font-bold text-amber-500 mb-3">Measurement Tools</h4>
      <div className="space-y-3">
        <button
          onClick={() => setMeasurementMode('distance')}
          className={`w-full text-left p-2 rounded-lg flex items-center ${
            measurementMode === 'distance' ? 'bg-amber-700' : 'bg-gray-800 hover:bg-gray-700'
          }`}
          aria-label="Activate distance measurement"
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
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
          Distance Measurement
        </button>
        <button
          onClick={() => setMeasurementMode('area')}
          className={`w-full text-left p-2 rounded-lg flex items-center ${
            measurementMode === 'area' ? 'bg-amber-700' : 'bg-gray-800 hover:bg-gray-700'
          }`}
          aria-label="Activate area measurement"
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
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            />
          </svg>
          Area Measurement
        </button>
        <button
          onClick={() => setMeasurementMode('volume')}
          className={`w-full text-left p-2 rounded-lg flex items-center ${
            measurementMode === 'volume' ? 'bg-amber-700' : 'bg-gray-800 hover:bg-gray-700'
          }`}
          aria-label="Activate volume estimation"
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          Volume Estimation
        </button>
        <div className="pt-2 border-t border-gray-700">
          <button
            onClick={() => setMeasurementMode(null)}
            className="w-full bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-sm"
            aria-label="Cancel measurement"
          >
            Cancel Measurement
          </button>
        </div>
      </div>
    </div>
  );

  // Drilling Dashboard with Chart
  const renderDrillingDashboard = () => (
    <div className="absolute top-20 left-4 z-30 bg-gray-900 rounded-xl border border-amber-800 shadow-2xl p-4 w-80 animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-amber-500">Drilling Operations</h4>
        <button
          onClick={() => setIsSimulatingData(!isSimulatingData)}
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            isSimulatingData ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
          aria-label={isSimulatingData ? 'Pause live data' : 'Resume live data'}
        >
          {isSimulatingData ? 'LIVE' : 'PAUSED'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Drilling Efficiency</span>
            <span className="font-mono">{realTimeData.drillingEfficiency.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-amber-500 h-2.5 rounded-full"
              style={{ width: `${realTimeData.drillingEfficiency}%` }}
            ></div>
          </div>
        </div>

        <div className="h-32">
          <Line
            data={{
              labels: productionData.map((item) => item.month),
              datasets: [
                {
                  label: 'Production (bbl/d)',
                  data: productionData.map((item) => item.production),
                  borderColor: '#F59E0B',
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  tension: 0.4,
                },
              ],
            }}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: 'Production (bbl/d)', color: '#FBBF24' },
                  grid: { color: '#4B5563' },
                },
                x: {
                  title: { display: true, text: 'Month', color: '#FBBF24' },
                  grid: { display: false },
                },
              },
              plugins: {
                legend: { display: true, position: 'top', labels: { color: '#FBBF24' } },
                title: { display: true, text: 'Production Trend', color: '#FBBF24' },
                tooltip: { backgroundColor: '#1F2937', titleColor: '#FBBF24', bodyColor: '#FBBF24' },
              },
              animation: { duration: 1000, easing: 'easeInOutQuad' },
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-gray-300 text-xs">Avg. ROP</p>
            <p className="font-mono text-lg">42.3 ft/hr</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-gray-300 text-xs">Bit Depth</p>
            <p className="font-mono text-lg">12,450 ft</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-gray-300 text-xs">Mud Weight</p>
            <p className="font-mono text-lg">12.4 ppg</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-gray-300 text-xs">Circulation</p>
            <p className="font-mono text-lg">480 gpm</p>
          </div>
        </div>

        <button className="w-full bg-amber-600 hover:bg-amber-700 py-2 rounded-lg text-sm">
          View Drilling Report
        </button>
      </div>
    </div>
  );

  // Alerts Panel
  const renderAlertsPanel = () => (
    <div className="absolute top-20 right-4 z-30 bg-gray-900 rounded-xl border border-amber-800 shadow-2xl p-4 w-80 animate-slide-up">
      <h4 className="font-bold text-amber-500 mb-3">Critical Alerts</h4>
      {alerts.length > 0 ? (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li key={alert.id} className="flex items-center justify-between">
              <div className="flex items-start">
                <div
                  className={`flex-shrink-0 h-5 w-5 rounded-full mt-1 ${
                    alert.severity === 'high' ? 'bg-red-600' : 'bg-amber-600'
                  }`}
                ></div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-200">{alert.message}</p>
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
      <button className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg text-sm">
        View All Alerts
      </button>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white font-mono overflow-hidden">
        <Head>
          <title>PETROVISION | Advanced Exploration Suite</title>
          <meta name="description" content="Industrial-grade petroleum exploration and production mapping system" />
          <link href="https://api.mapbox.com/mapbox-gl-js/v2.9.2/mapbox-gl.css" rel="stylesheet" />
        </Head>

        {/* Real-time Status Bar */}
        <div className="bg-black bg-opacity-70 text-amber-500 text-xs py-2 px-4 flex justify-between border-b border-amber-900">
          <div className="flex space-x-6">
            <div className="flex items-center">
              <span className="font-bold mr-1">WTI:</span>
              <span className="font-mono">${realTimeData.oilPrice}</span>
              <span className="ml-1 text-gray-400">/bbl</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-1">PROD:</span>
              <span className="font-mono">{realTimeData.productionRate.toLocaleString()}</span>
              <span className="ml-1 text-gray-400">bbl/day</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-1">WELLS:</span>
              <span className="font-mono">{realTimeData.activeWells}</span>
              <span className="ml-1 text-gray-400">active</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-1">RES PRES:</span>
              <span className="font-mono">{realTimeData.reservoirPressure.toFixed(0)}</span>
              <span className="ml-1 text-gray-400">psi</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <span className="font-mono">29.7604° N, 95.3698° W</span>
            <span className="text-gray-400">|</span>
            <span>CRS: EPSG:3857</span>
            <span className="text-gray-400">|</span>
            <span>ZOOM: 14x</span>
          </div>
        </div>

        {/* Main Map Container */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="absolute inset-0" />
          {!is3DView && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-gray-800 bg-opacity-90 rounded-xl border border-amber-900 shadow-2xl p-6 animate-slide-up">
              <h2 className="text-2xl font-bold text-amber-500 mb-2">PETROLEUM EXPLORATION SUITE</h2>
              <p className="text-gray-300 mb-4">{activeLayer.toUpperCase()} ANALYSIS</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {fieldData.wells.map((well) => (
                  <div
                    key={well.id}
                    className={`p-2 rounded-lg cursor-pointer border transition-all ${
                      selectedAsset?.id === well.id
                        ? 'bg-amber-700 border-amber-400 scale-105'
                        : 'bg-gray-900 border-gray-700 hover:bg-gray-700'
                    }`}
                    onClick={() => handleAssetClick(well)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleAssetClick(well)}
                  >
                    <div className="font-mono font-bold">{well.name}</div>
                    <div className="text-xs text-gray-400 flex justify-between">
                      <span>{well.type.toUpperCase()}</span>
                      <span>{well.depth.toLocaleString()} ft</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-500 font-mono">
                {measurementMode ? `[ACTIVE TOOL: ${measurementMode.toUpperCase()}]` : '[SELECT ASSET OR TOOL]'}
              </p>
            </div>
          )}

          {/* 3D Reservoir View */}
          {is3DView && render3DSubsurface()}

          {/* Left Control Panel */}
          <div className="absolute top-4 left-4 z-10 space-y-3">
            {/* Base Map Selector */}
            <div className="bg-gray-900 p-3 rounded-xl border border-amber-900 shadow-2xl animate-slide-up">
              <h3 className="font-bold text-sm text-amber-500 mb-2">BASE MAP</h3>
              <select
                className="w-full bg-gray-800 border border-amber-700 text-amber-300 rounded-lg p-2 text-xs"
                value={mapStyle}
                onChange={(e) => setMapStyle(e.target.value)}
                aria-label="Select base map style"
              >
                <option value="mapbox://styles/mapbox/dark-v10">Geological</option>
                <option value="mapbox://styles/mapbox/satellite-v9">Satellite</option>
                <option value="mapbox://styles/mapbox/streets-v11">Topographic</option>
                <option value="mapbox://styles/mapbox/light-v10">Infrared</option>
                <option value="mapbox://styles/mapbox/navigation-night-v1">Magnetic Anomaly</option>
              </select>
            </div>

            {/* Data Layers Control */}
            <div className="bg-gray-900 p-3 rounded-xl border border-amber-900 shadow-2xl animate-slide-up">
              <h3 className="font-bold text-sm text-amber-500 mb-2">DATA LAYERS</h3>
              <div className="space-y-2">
                {Object.entries(layerVisibility).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between text-xs text-gray-300">
                    <span>{key.split(/(?=[A-Z])/).join(' ').toUpperCase()}</span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() =>
                        setLayerVisibility((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                      className="toggle bg-amber-600"
                      aria-label={`Toggle ${key} layer`}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Advanced Tools */}
            <div className="bg-gray-900 p-3 rounded-xl border border-amber-900 shadow-2xl animate-slide-up">
              <h3 className="font-bold text-sm text-amber-500 mb-2">ADVANCED TOOLS</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMeasurementMode('distance')}
                  className={`p-2 rounded-lg text-xs flex flex-col items-center ${
                    measurementMode === 'distance'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                  aria-label="Activate distance measurement"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setMeasurementMode('distance')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                  Distance
                </button>
                <button
                  onClick={() => setMeasurementMode('area')}
                  className={`p-2 rounded-lg text-xs flex flex-col items-center ${
                    measurementMode === 'area'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                  aria-label="Activate area measurement"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setMeasurementMode('area')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                    />
                  </svg>
                  Area
                </button>
                <button
                  onClick={() => setMeasurementMode('volume')}
                  className={`p-2 rounded-lg text-xs flex flex-col items-center ${
                    measurementMode === 'volume'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                  aria-label="Activate volume estimation"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setMeasurementMode('volume')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  Volume
                </button>
                <button
                  onClick={toggleCrossSection}
                  className={`p-2 rounded-lg text-xs flex flex-col items-center ${
                    crossSectionMode
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                  aria-label="Toggle cross section mode"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggleCrossSection()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                  Cross Section
                </button>
                <button
                  onClick={() => setIs3DView(!is3DView)}
                  className={`p-2 rounded-lg text-xs flex flex-col items-center ${
                    is3DView
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                  aria-label={is3DView ? 'Switch to 2D map' : 'Switch to 3D view'}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setIs3DView(!is3DView)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 22V12h6v10" />
                  </svg>
                  {is3DView ? '2D Map' : '3D View'}
                </button>
                <button
                  className="p-2 rounded-lg text-xs flex flex-col items-center bg-gray-800 hover:bg-gray-700 text-gray-300"
                  aria-label="Export data"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && alert('Exporting data...')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mb-1"
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
          </div>

          {/* Right Asset Details Panel */}
          {selectedAsset && (
            <div className="absolute top-4 right-4 z-30 bg-gray-900 rounded-xl border border-amber-900 shadow-2xl w-80 animate-slide-up">
              <div className="p-4 border-b border-amber-900 flex justify-between items-center">
                <h3 className="font-bold text-amber-500">{selectedAsset.name}</h3>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-amber-400" aria-label="Edit asset">
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedAsset(null)}
                    className="text-gray-400 hover:text-white"
                    aria-label="Close asset details"
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
                </div>
              </div>

              <div className="p-4 space-y-4">
                {selectedAsset.type === 'well' && (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-300">Type</p>
                        <p className="font-mono">{selectedAsset.type.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Status</p>
                        <p
                          className={`font-mono ${
                            selectedAsset.status === 'active'
                              ? 'text-green-500'
                              : selectedAsset.status === 'drilling'
                              ? 'text-amber-500'
                              : 'text-gray-400'
                          }`}
                        >
                          {selectedAsset.status.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">Depth</p>
                        <p className="font-mono">{selectedAsset.depth.toLocaleString()} ft</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Pressure</p>
                        <p className="font-mono">{selectedAsset.pressure} psi</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Production</p>
                        <p className="font-mono">{selectedAsset.production} bbl/d</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Operator</p>
                        <p className="font-mono">{selectedAsset.operator}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <button className="w-full bg-amber-600 hover:bg-amber-700 py-2 rounded-lg text-sm">
                        Open Well Dashboard
                      </button>
                    </div>
                  </>
                )}

                {selectedAsset.type === 'pipeline' && (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-300">Diameter</p>
                        <p className="font-mono">{selectedAsset.diameter} in</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Material</p>
                        <p className="font-mono">{selectedAsset.material}</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Max Pressure</p>
                        <p className="font-mono">{selectedAsset.maxPressure} psi</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Last Inspection</p>
                        <p className="font-mono">{selectedAsset.lastInspection}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <button className="w-full bg-amber-600 hover:bg-amber-700 py-2 rounded-lg text-sm">
                        View Integrity Report
                      </button>
                    </div>
                  </>
                )}

                {selectedAsset.type === 'seismic' && (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-300">Resolution</p>
                        <p className="font-mono">{selectedAsset.resolution}</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Date</p>
                        <p className="font-mono">{selectedAsset.date}</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Contractor</p>
                        <p className="font-mono">{selectedAsset.contractor}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <button className="w-full bg-amber-600 hover:bg-amber-700 py-2 rounded-lg text-sm">
                        View Seismic Report
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Bottom Layer Selector */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex bg-gray-900 rounded-xl border border-amber-900 shadow-2xl overflow-hidden">
              {['seismic', 'reservoir', 'production', 'infrastructure', 'licenses'].map((layer) => (
                <button
                  key={layer}
                  className={`px-5 py-2 text-xs font-bold ${
                    activeLayer === layer
                      ? 'bg-amber-700 text-white'
                      : 'bg-gray-800 text-amber-500 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveLayer(layer)}
                  aria-label={`Switch to ${layer} layer`}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveLayer(layer)}
                >
                  {layer.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Measurement Tools Panel */}
          {measurementMode && renderMeasurementTools()}

          {/* Drilling Dashboard */}
          {activeLayer === 'production' && renderDrillingDashboard()}

          {/* Alerts Panel */}
          {alerts.length > 0 && renderAlertsPanel()}

          {/* Cross Section View */}
          {crossSectionMode && (
            <div className="absolute bottom-4 left-4 z-30 bg-gray-900 rounded-xl border border-amber-900 shadow-2xl p-4 w-96 animate-slide-up">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-amber-500">Cross Section Analysis</h4>
                <button
                  onClick={toggleCrossSection}
                  className="text-gray-400 hover:text-white"
                  aria-label="Close cross section view"
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
              </div>
              <div className="h-48 bg-gray-800 rounded-lg mb-3 flex items-center justify-center">
                <p className="text-gray-300">Cross Section Visualization</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-800 p-2 rounded">
                  <p className="text-gray-300">Start Point</p>
                  <p className="font-mono">29.7604, -95.3698</p>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <p className="text-gray-300">End Point</p>
                  <p className="font-mono">29.7650, -95.3750</p>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <p className="text-gray-300">Length</p>
                  <p className="font-mono">0.68 mi</p>
                </div>
              </div>
              <button className="w-full bg-amber-600 hover:bg-amber-700 py-2 rounded-lg text-sm mt-3">
                Save Cross Section
              </button>
            </div>
          )}
        </div>

        {/* Custom CSS */}
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
          .perspective-1000 {
            perspective: 1000px;
          }
          .rotate-x-10 {
            transform: rotateX(10deg);
          }
          .rotate-x-15 {
            transform: rotateX(15deg);
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
};

export default PetroleumExplorationSuite;