// src/app/production/dashboard/DashboardClient.jsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { FiAlertTriangle, FiDroplet, FiWind, FiThermometer, FiHome, FiHardDrive, FiTrendingUp } from 'react-icons/fi';

// Chart components
const LineChart = ({ data, xKey, yKeys, colors, darkMode }) => {
  const maxValue = Math.max(...data.map(d => Math.max(...yKeys.map(key => d[key]))));
  
  return (
    <div className="w-full h-full p-4">
      <div className="flex items-end justify-between h-full">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="flex items-end space-x-1 w-full h-40">
              {yKeys.map((key, i) => (
                <div
                  key={key}
                  className="w-full"
                  style={{
                    height: `${(item[key] / maxValue) * 100}%`,
                    backgroundColor: colors[i],
                    opacity: 0.8
                  }}
                  title={`${key}: ${item[key]}`}
                ></div>
              ))}
            </div>
            <span className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {item[xKey]}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        {yKeys.map((key, i) => (
          <div key={key} className="flex items-center">
            <div 
              className="w-3 h-3 mr-1" 
              style={{ backgroundColor: colors[i] }}
            ></div>
            <span className="text-xs capitalize">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ data, xKey, yKeys, colors, darkMode }) => {
  const maxValue = Math.max(...data.map(d => Math.max(...yKeys.map(key => d[key]))));

  return (
    <div className="w-full h-full p-4">
      <div className="flex items-end justify-between h-full">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="flex items-end space-x-1 w-full h-40">
              {yKeys.map((key, i) => (
                <div
                  key={key}
                  className="w-full"
                  style={{
                    height: `${(item[key] / maxValue) * 100}%`,
                    backgroundColor: colors[i],
                    opacity: 0.8
                  }}
                  title={`${key}: ${item[key]}`}
                ></div>
              ))}
            </div>
            <span className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {item[xKey]}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        {yKeys.map((key, i) => (
          <div key={key} className="flex items-center">
            <div 
              className="w-3 h-3 mr-1" 
              style={{ backgroundColor: colors[i] }}
            ></div>
            <span className="text-xs capitalize">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PieChart = ({ data, darkMode }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;

  return (
    <div className="w-full h-full p-4 flex flex-col items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        {data.map((item, index) => {
          const percent = (item.value / total) * 100;
          const startX = 50 + 50 * Math.cos(2 * Math.PI * cumulativePercent / 100);
          const startY = 50 + 50 * Math.sin(2 * Math.PI * cumulativePercent / 100);
          cumulativePercent += percent;
          const endX = 50 + 50 * Math.cos(2 * Math.PI * cumulativePercent / 100);
          const endY = 50 + 50 * Math.sin(2 * Math.PI * cumulativePercent / 100);
          
          const largeArcFlag = percent > 50 ? 1 : 0;
          const pathData = [
            `M 50 50`,
            `L ${startX} ${startY}`,
            `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `Z`
          ].join(' ');

          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              stroke={darkMode ? '#374151' : '#f3f4f6'}
              strokeWidth="0.5"
            />
          );
        })}
        <circle cx="50" cy="50" r="30" fill={darkMode ? '#1f2937' : '#ffffff'} />
      </svg>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="w-3 h-3 rounded-full mb-1" 
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-xs">{item.name}</span>
            <span className="text-xs font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ProductionDashboard() {
  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  
  // Real-time production data
  const [productionData, setProductionData] = useState({
    oilRate: 24567, // bbl/d
    gasRate: 125, // MMscf/d
    waterCut: 18.5, // %
    wellheadPressure: 1250, // psi
    chokeSize: 32, // 1/64"
    downtime: 2.3, // %
    efficiency: 92.7, // %
    target: 26000, // bbl/d
    flareRate: 2.4, // MMscf/d
    co2Emissions: 420, // tons/d
    energyConsumption: 28500 // kWh
  });

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
      location: 'A-12'
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
      location: 'B-07'
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
      location: 'C-03'
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
      location: 'D-09'
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
      location: 'E-14'
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
      location: 'F-05'
    }
  ]);

  // Equipment status
  const [equipmentStatus, setEquipmentStatus] = useState([
    { 
      id: 1, 
      name: 'Separator A', 
      status: 'normal', 
      pressure: 150, 
      temp: 120,
      type: '3-Phase Separator',
      lastInspection: '2023-11-15',
      nextInspection: '2024-05-15',
      manufacturer: 'Cameron',
      model: 'SS-3000'
    },
    { 
      id: 2, 
      name: 'Pump Station 1', 
      status: 'warning', 
      pressure: 85, 
      temp: 185,
      type: 'Centrifugal Pump',
      lastInspection: '2023-12-01',
      nextInspection: '2024-01-15',
      manufacturer: 'Flowserve',
      model: 'HPS-450'
    },
    { 
      id: 3, 
      name: 'Compressor B', 
      status: 'normal', 
      pressure: 110, 
      temp: 135,
      type: 'Reciprocating Compressor',
      lastInspection: '2023-10-20',
      nextInspection: '2024-04-20',
      manufacturer: 'Ariel',
      model: 'JGC-4'
    },
    { 
      id: 4, 
      name: 'Heater Treater', 
      status: 'normal', 
      pressure: 75, 
      temp: 210,
      type: 'Direct Fired Heater',
      lastInspection: '2023-11-05',
      nextInspection: '2024-05-05',
      manufacturer: 'Exterran',
      model: 'HT-200'
    },
    { 
      id: 5, 
      name: 'Flare Stack', 
      status: 'normal', 
      pressure: 5, 
      temp: 650,
      type: 'Enclosed Ground Flare',
      lastInspection: '2023-12-10',
      nextInspection: '2024-06-10',
      manufacturer: 'Zeeco',
      model: 'EF-1000'
    }
  ]);

  // Time range selection
  const [timeRange, setTimeRange] = useState('7d');
  const [isLive, setIsLive] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedWell, setSelectedWell] = useState(null);
  const [alerts, setAlerts] = useState([
    { id: 1, severity: 'high', message: 'High pressure detected at Pump Station 1', timestamp: '2023-12-20T08:42:15', resolved: false },
    { id: 2, severity: 'medium', message: 'Water cut increasing in ALPHA-1', timestamp: '2023-12-20T07:15:33', resolved: false },
    { id: 3, severity: 'low', message: 'Scheduled maintenance for ECHO-9', timestamp: '2023-12-19T14:30:00', resolved: true }
  ]);

  // Simulate real-time data updates
  useEffect(() => {
    let interval;
    
    if (isLive) {
      interval = setInterval(() => {
        setProductionData(prev => ({
          oilRate: Math.max(0, prev.oilRate + Math.floor(Math.random() * 200 - 100)),
          gasRate: Math.max(0, prev.gasRate + (Math.random() * 2 - 1)),
          waterCut: Math.min(30, Math.max(5, prev.waterCut + (Math.random() * 1 - 0.5))),
          wellheadPressure: Math.min(2000, Math.max(800, prev.wellheadPressure + (Math.random() * 50 - 25))),
          chokeSize: prev.chokeSize,
          downtime: Math.min(5, Math.max(0, prev.downtime + (Math.random() * 0.2 - 0.1))),
          efficiency: Math.min(100, Math.max(85, prev.efficiency + (Math.random() * 1 - 0.5))),
          target: prev.target,
          flareRate: Math.max(0, prev.flareRate + (Math.random() * 0.2 - 0.1)),
          co2Emissions: Math.max(0, prev.co2Emissions + (Math.random() * 10 - 5)),
          energyConsumption: Math.max(0, prev.energyConsumption + (Math.random() * 500 - 250))
        }));

        // Simulate well performance changes
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

        // Simulate equipment status changes
        if (Math.random() > 0.9) {
          setEquipmentStatus(prev => prev.map(item => {
            if (Math.random() > 0.7) {
              return {
                ...item,
                status: ['normal', 'warning', 'critical'][Math.floor(Math.random() * 3)],
                temp: item.temp + (Math.random() * 10 - 5),
                pressure: item.pressure + (Math.random() * 5 - 2.5)
              };
            }
            return item;
          }));
        }

        // Simulate occasional alerts
        if (Math.random() > 0.95) {
          const alertTypes = [
            'High pressure detected at ',
            'Temperature spike in ',
            'Flow rate anomaly in ',
            'Maintenance required for ',
            'Performance degradation in '
          ];
          const equipment = ['Separator', 'Pump', 'Compressor', 'Heater', 'Well'];
          const newAlert = {
            id: Date.now(),
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            message: alertTypes[Math.floor(Math.random() * alertTypes.length)] + 
                    equipment[Math.floor(Math.random() * equipment.length)] + 
                    ' ' + (Math.floor(Math.random() * 5) + 1),
            timestamp: new Date().toISOString(),
            resolved: false
          };
          setAlerts(prev => [newAlert, ...prev]);
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [isLive]);

  // Historical production data
  const historicalData = {
    '7d': [
      { day: 'Mon', oil: 22500, gas: 115, water: 18, flare: 2.1, energy: 27500 },
      { day: 'Tue', oil: 23800, gas: 122, water: 17, flare: 2.3, energy: 28200 },
      { day: 'Wed', oil: 24500, gas: 128, water: 19, flare: 2.5, energy: 29000 },
      { day: 'Thu', oil: 25100, gas: 130, water: 20, flare: 2.4, energy: 28700 },
      { day: 'Fri', oil: 24300, gas: 125, water: 18, flare: 2.2, energy: 28000 },
      { day: 'Sat', oil: 23000, gas: 118, water: 16, flare: 2.0, energy: 27000 },
      { day: 'Sun', oil: 21000, gas: 108, water: 15, flare: 1.8, energy: 26000 }
    ],
    '30d': Array.from({ length: 30 }, (_, i) => ({
      day: `${i+1}`,
      oil: 22000 + Math.floor(Math.random() * 6000 - 2000),
      gas: 110 + Math.floor(Math.random() * 30 - 15),
      water: 15 + Math.floor(Math.random() * 10 - 5),
      flare: 1.5 + Math.random() * 1.5,
      energy: 25000 + Math.floor(Math.random() * 7000 - 3000)
    })),
    '12m': [
      { month: 'Jan', oil: 22500, gas: 115, water: 18, flare: 2.1, energy: 27500 },
      { month: 'Feb', oil: 23800, gas: 122, water: 17, flare: 2.3, energy: 28200 },
      { month: 'Mar', oil: 24500, gas: 128, water: 19, flare: 2.5, energy: 29000 },
      { month: 'Apr', oil: 25100, gas: 130, water: 20, flare: 2.4, energy: 28700 },
      { month: 'May', oil: 24300, gas: 125, water: 18, flare: 2.2, energy: 28000 },
      { month: 'Jun', oil: 24900, gas: 128, water: 19, flare: 2.3, energy: 28500 },
      { month: 'Jul', oil: 25500, gas: 132, water: 21, flare: 2.6, energy: 29500 },
      { month: 'Aug', oil: 25200, gas: 130, water: 20, flare: 2.5, energy: 29200 },
      { month: 'Sep', oil: 24800, gas: 127, water: 19, flare: 2.4, energy: 28800 },
      { month: 'Oct', oil: 24200, gas: 124, water: 18, flare: 2.3, energy: 28300 },
      { month: 'Nov', oil: 23500, gas: 120, water: 17, flare: 2.2, energy: 27800 },
      { month: 'Dec', oil: 24000, gas: 123, water: 18, flare: 2.3, energy: 28100 }
    ]
  };

  // Calculate totals
  const totalProduction = useMemo(() => ({
    oil: wellPerformance.reduce((sum, well) => sum + well.oil, 0),
    gas: wellPerformance.reduce((sum, well) => sum + well.gas, 0),
    water: wellPerformance.reduce((sum, well) => sum + well.water, 0),
    efficiency: wellPerformance.reduce((sum, well) => sum + (well.productionEfficiency || 0), 0) / 
                wellPerformance.filter(w => w.status === 'producing').length
  }), [wellPerformance]);

  // Calculate water cut percentage
  const waterCutPercentage = useMemo(() => {
    const totalLiquids = totalProduction.oil + totalProduction.water;
    return totalLiquids > 0 ? (totalProduction.water / totalLiquids) * 100 : 0;
  }, [totalProduction]);

  // Critical alerts count
  const criticalAlerts = useMemo(() => alerts.filter(a => !a.resolved && a.severity === 'high').length, [alerts]);
  const warningAlerts = useMemo(() => alerts.filter(a => !a.resolved && a.severity === 'medium').length, [alerts]);

  // Equipment status counts
  const equipmentStatusCounts = useMemo(() => ({
    normal: equipmentStatus.filter(e => e.status === 'normal').length,
    warning: equipmentStatus.filter(e => e.status === 'warning').length,
    critical: equipmentStatus.filter(e => e.status === 'critical').length
  }), [equipmentStatus]);

  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Resolve alert
  const resolveAlert = (id) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, resolved: true } : alert
    ));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation */}
      <nav className={`sticky top-0 z-40 shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-300 ${selectedTab === 'overview' ? (darkMode ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-700') : (darkMode ? 'border-transparent text-gray-300 hover:text-gray-200' : 'border-transparent text-gray-600 hover:text-gray-900')}`}
            >
              <FiHome className="inline mr-2" /> Overview
            </button>
            <button
              onClick={() => setSelectedTab('wells')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-300 ${selectedTab === 'wells' ? (darkMode ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-700') : (darkMode ? 'border-transparent text-gray-300 hover:text-gray-200' : 'border-transparent text-gray-600 hover:text-gray-900')}`}
            >
              <FiDroplet className="inline mr-2" /> Wells
            </button>
            <button
              onClick={() => setSelectedTab('equipment')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-300 ${selectedTab === 'equipment' ? (darkMode ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-700') : (darkMode ? 'border-transparent text-gray-300 hover:text-gray-200' : 'border-transparent text-gray-600 hover:text-gray-900')}`}
            >
              <FiHardDrive className="inline mr-2" /> Equipment
            </button>
            <button
              onClick={() => setSelectedTab('analytics')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-300 ${selectedTab === 'analytics' ? (darkMode ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-700') : (darkMode ? 'border-transparent text-gray-300 hover:text-gray-200' : 'border-transparent text-gray-600 hover:text-gray-900')}`}
            >
              <FiTrendingUp className="inline mr-2" /> Analytics
            </button>
            <button
              onClick={() => setSelectedTab('alerts')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-300 relative ${selectedTab === 'alerts' ? (darkMode ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-700') : (darkMode ? 'border-transparent text-gray-300 hover:text-gray-200' : 'border-transparent text-gray-600 hover:text-gray-900')}`}
            >
              <FiAlertTriangle className="inline mr-2" /> Alerts
              {criticalAlerts > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {criticalAlerts}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Status Bar */}
      <div className={`py-2 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
        <div className="container mx-auto flex flex-wrap justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Oil Production: </span>
              <span className={`font-mono ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                {productionData.oilRate.toLocaleString()} bbl/d
              </span>
            </div>
            <div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Gas Production: </span>
              <span className={`font-mono ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                {productionData.gasRate.toFixed(1)} MMscf/d
              </span>
            </div>
            <div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Water Cut: </span>
              <span className="font-mono">
                {productionData.waterCut.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Flare: </span>
              <span className="font-mono">
                {productionData.flareRate.toFixed(1)} MMscf/d
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Efficiency: </span>
              <span className="font-mono">
                {productionData.efficiency.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Downtime: </span>
              <span className="font-mono">
                {productionData.downtime.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>CO₂: </span>
              <span className="font-mono">
                {productionData.co2Emissions.toFixed(0)} t/d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {selectedTab === 'overview' && (
          <>
            {/* Production Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Production Summary */}
              <div className={`rounded-xl shadow-md overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h2 className="font-bold">Production Summary</h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setTimeRange('7d')}
                      className={`px-2 py-1 rounded text-xs ${timeRange === '7d' ? (darkMode ? 'bg-blue-600' : 'bg-blue-700 text-white') : (darkMode ? 'bg-gray-600' : 'bg-gray-200')}`}
                    >
                      7D
                    </button>
                    <button 
                      onClick={() => setTimeRange('30d')}
                      className={`px-2 py-1 rounded text-xs ${timeRange === '30d' ? (darkMode ? 'bg-blue-600' : 'bg-blue-700 text-white') : (darkMode ? 'bg-gray-600' : 'bg-gray-200')}`}
                    >
                      30D
                    </button>
                    <button 
                      onClick={() => setTimeRange('12m')}
                      className={`px-2 py-1 rounded text-xs ${timeRange === '12m' ? (darkMode ? 'bg-blue-600' : 'bg-blue-700 text-white') : (darkMode ? 'bg-gray-600' : 'bg-gray-200')}`}
                    >
                      12M
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className={`p-3 rounded-lg text-center transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>Oil Production</p>
                      <p className="text-xl font-bold">
                        {productionData.oilRate.toLocaleString()}
                        <span className="text-sm ml-1">bbl/d</span>
                      </p>
                      <p className={`text-xs ${
                        productionData.oilRate >= productionData.target 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {((productionData.oilRate / productionData.target) * 100).toFixed(1)}% of target
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg text-center transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Gas Production</p>
                      <p className="text-xl font-bold">
                        {productionData.gasRate.toFixed(1)}
                        <span className="text-sm ml-1">MMscf/d</span>
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Flare: {productionData.flareRate.toFixed(1)} MMscf/d
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg text-center transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Water Cut</p>
                      <p className="text-xl font-bold">
                        {productionData.waterCut.toFixed(1)}%
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total: {waterCutPercentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg text-center transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>Efficiency</p>
                      <p className="text-xl font-bold">
                        {productionData.efficiency.toFixed(1)}%
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Wells: {totalProduction.efficiency.toFixed(1)}%
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg text-center transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-red-300' : 'text-red-800'}`}>Downtime</p>
                      <p className="text-xl font-bold">
                        {productionData.downtime.toFixed(1)}%
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Last 7d: {(productionData.downtime * 1.2).toFixed(1)}%
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg text-center transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Energy Use</p>
                      <p className="text-xl font-bold">
                        {(productionData.energyConsumption / 1000).toFixed(1)}
                        <span className="text-sm ml-1">MWh/d</span>
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        CO₂: {productionData.co2Emissions.toFixed(0)} t/d
                      </p>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Wellhead Pressure</span>
                      <span className="font-medium">
                        {productionData.wellheadPressure.toLocaleString()} psi
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-2.5 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div 
                        className="h-2.5 rounded-full" 
                        style={{ 
                          width: `${(productionData.wellheadPressure / 2000) * 100}%`,
                          backgroundColor: productionData.wellheadPressure > 1800 ? '#ef4444' : '#3b82f6'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Production Trend */}
              <div className={`rounded-xl shadow-md overflow-hidden lg:col-span-2 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h2 className="font-bold">Production Trend</h2>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setTimeRange('7d')}
                      className={`px-2 py-1 rounded text-xs ${timeRange === '7d' ? (darkMode ? 'bg-blue-600' : 'bg-blue-700 text-white') : (darkMode ? 'bg-gray-600' : 'bg-gray-200')}`}
                    >
                      7D
                    </button>
                    <button 
                      onClick={() => setTimeRange('30d')}
                      className={`px-2 py-1 rounded text-xs ${timeRange === '30d' ? (darkMode ? 'bg-blue-600' : 'bg-blue-700 text-white') : (darkMode ? 'bg-gray-600' : 'bg-gray-200')}`}
                    >
                      30D
                    </button>
                    <button 
                      onClick={() => setTimeRange('12m')}
                      className={`px-2 py-1 rounded text-xs ${timeRange === '12m' ? (darkMode ? 'bg-blue-600' : 'bg-blue-700 text-white') : (darkMode ? 'bg-gray-600' : 'bg-gray-200')}`}
                    >
                      12M
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="h-80">
                    <LineChart 
                      data={historicalData[timeRange]} 
                      xKey={timeRange === '12m' ? 'month' : 'day'} 
                      yKeys={['oil', 'gas', 'water']}
                      colors={['#f59e0b', '#10b981', '#3b82f6']}
                      darkMode={darkMode}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts and KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Critical Alerts */}
              <div className={`rounded-xl shadow-md overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`px-4 py-3 flex justify-between items-center transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h2 className="font-bold">Critical Alerts</h2>
                  <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'}`}>
                    {criticalAlerts} Active
                  </span>
                </div>
                <div className="p-4">
                  {alerts.filter(a => a.severity === 'high' && !a.resolved).length > 0 ? (
                    <ul className="space-y-3">
                      {alerts
                        .filter(a => a.severity === 'high' && !a.resolved)
                        .slice(0, 3)
                        .map(alert => (
                          <li key={alert.id} className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                              <div className={`h-3 w-3 rounded-full ${darkMode ? 'bg-red-500' : 'bg-red-600'}`}></div>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{alert.message}</p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatDate(alert.timestamp)}
                              </p>
                            </div>
                            <button 
                              onClick={() => resolveAlert(alert.id)}
                              className={`ml-2 text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                            >
                              Resolve
                            </button>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FiAlertTriangle className="mx-auto h-8 w-8 mb-2" />
                      <p>No critical alerts</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Performance Indicators */}
              <div className={`rounded-xl shadow-md overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`px-4 py-3 transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h2 className="font-bold">Key Performance Indicators</h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Production Efficiency</p>
                      <div className="flex items-end mt-1">
                        <p className="text-2xl font-bold">
                          {productionData.efficiency.toFixed(1)}%
                        </p>
                        <p className={`ml-2 text-sm ${productionData.efficiency > 90 ? 'text-green-600' : productionData.efficiency > 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {productionData.efficiency > 90 ? 'Excellent' : productionData.efficiency > 80 ? 'Good' : 'Poor'}
                        </p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Downtime</p>
                      <div className="flex items-end mt-1">
                        <p className="text-2xl font-bold">
                          {productionData.downtime.toFixed(1)}%
                        </p>
                        <p className={`ml-2 text-sm ${productionData.downtime < 2 ? 'text-green-600' : productionData.downtime < 4 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {productionData.downtime < 2 ? 'Low' : productionData.downtime < 4 ? 'Medium' : 'High'}
                        </p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Flare Intensity</p>
                      <div className="flex items-end mt-1">
                        <p className="text-2xl font-bold">
                          {(productionData.flareRate / productionData.gasRate * 100).toFixed(1)}%
                        </p>
                        <p className={`ml-2 text-sm ${(productionData.flareRate / productionData.gasRate * 100) < 5 ? 'text-green-600' : (productionData.flareRate / productionData.gasRate * 100) < 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {(productionData.flareRate / productionData.gasRate * 100) < 5 ? 'Good' : (productionData.flareRate / productionData.gasRate * 100) < 10 ? 'Fair' : 'Poor'}
                        </p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Energy Intensity</p>
                      <div className="flex items-end mt-1">
                        <p className="text-2xl font-bold">
                          {(productionData.energyConsumption / productionData.oilRate).toFixed(1)}
                        </p>
                        <span className="text-sm ml-1">kWh/bbl</span>
                        <p className={`ml-2 text-sm ${(productionData.energyConsumption / productionData.oilRate) < 1.2 ? 'text-green-600' : (productionData.energyConsumption / productionData.oilRate) < 1.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {(productionData.energyConsumption / productionData.oilRate) < 1.2 ? 'Good' : (productionData.energyConsumption / productionData.oilRate) < 1.5 ? 'Fair' : 'Poor'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Status */}
              <div className={`rounded-xl shadow-md overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`px-4 py-3 transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h2 className="font-bold">Equipment Health</h2>
                </div>
                <div className="p-4">
                  <div className="h-48">
                    <PieChart 
                      data={[
                        { name: 'Normal', value: equipmentStatusCounts.normal, color: '#10b981' },
                        { name: 'Warning', value: equipmentStatusCounts.warning, color: '#f59e0b' },
                        { name: 'Critical', value: equipmentStatusCounts.critical, color: '#ef4444' }
                      ]}
                      darkMode={darkMode}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Normal</p>
                      <p className="text-xl font-bold text-green-600">{equipmentStatusCounts.normal}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Warning</p>
                      <p className="text-xl font-bold text-yellow-600">{equipmentStatusCounts.warning}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Critical</p>
                      <p className="text-xl font-bold text-red-600">{equipmentStatusCounts.critical}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Well Performance Summary */}
            <div className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`px-4 py-3 transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h2 className="font-bold">Well Performance Summary</h2>
              </div>
              <div className="p-4">
                <div className="h-80">
                  <BarChart 
                    data={wellPerformance.filter(w => w.status === 'producing')} 
                    xKey="name" 
                    yKeys={['oil', 'gas', 'water']}
                    colors={['#f59e0b', '#10b981', '#3b82f6']}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'wells' && (
          <div className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-4 py-3 transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h2 className="font-bold">Well Management</h2>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
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
                  {wellPerformance.map(well => (
                    <tr key={well.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium">{well.name}</div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{well.location}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          well.status === 'producing' ? 'bg-green-100 text-green-800' :
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
                        <span className={`px-2 py-1 rounded text-xs ${
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
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
                        >
                          Details
                        </button>
                        <button className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded">
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'equipment' && (
          <div className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-4 py-3 transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h2 className="font-bold">Equipment Monitoring</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipmentStatus.map(item => (
                  <div 
                    key={item.id} 
                    className={`border rounded-lg p-4 transition-colors duration-300 ${
                      item.status === 'normal' ? (darkMode ? 'border-green-700 bg-gray-700' : 'border-green-200 bg-green-50') :
                      item.status === 'warning' ? (darkMode ? 'border-amber-700 bg-gray-700' : 'border-amber-200 bg-amber-50') :
                      (darkMode ? 'border-red-700 bg-gray-700' : 'border-red-200 bg-red-50')
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'normal' ? (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') :
                        item.status === 'warning' ? (darkMode ? 'bg-amber-900 text-amber-300' : 'bg-amber-100 text-amber-800') :
                        (darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800')
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pressure</p>
                        <div className="flex items-end mt-1">
                          <p className="text-xl font-bold">{item.pressure.toFixed(1)}</p>
                          <span className="text-xs ml-1">psi</span>
                        </div>
                        <div className={`w-full h-1 rounded-full mt-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <div 
                            className="h-1 rounded-full" 
                            style={{ 
                              width: `${(item.pressure / 200) * 100}%`,
                              backgroundColor: item.pressure > 180 ? '#ef4444' : item.pressure > 150 ? '#f59e0b' : '#10b981'
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Temperature</p>
                        <div className="flex items-end mt-1">
                          <p className="text-xl font-bold">{item.temp.toFixed(1)}</p>
                          <span className="text-xs ml-1">°F</span>
                        </div>
                        <div className={`w-full h-1 rounded-full mt-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <div 
                            className="h-1 rounded-full" 
                            style={{ 
                              width: `${(item.temp / 300) * 100}%`,
                              backgroundColor: item.temp > 250 ? '#ef4444' : item.temp > 200 ? '#f59e0b' : '#10b981'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Manufacturer</p>
                          <p>{item.manufacturer}</p>
                        </div>
                        <div>
                          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Model</p>
                          <p>{item.model}</p>
                        </div>
                        <div>
                          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Last Inspection</p>
                          <p>{item.lastInspection}</p>
                        </div>
                        <div>
                          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Next Inspection</p>
                          <p>{item.nextInspection}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'alerts' && (
          <div className={`rounded-xl shadow-md overflow-hidden mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-4 py-3 transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-center">
                <h2 className="font-bold">Alerts & Notifications</h2>
                <div className="flex space-x-2">
                  <button 
                    className={`px-3 py-1 rounded text-xs ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    All
                  </button>
                  <button 
                    className={`px-3 py-1 rounded text-xs ${darkMode ? 'bg-red-900 hover:bg-red-800 text-red-300' : 'bg-red-100 hover:bg-red-200 text-red-800'}`}
                  >
                    Critical
                  </button>
                  <button 
                    className={`px-3 py-1 rounded text-xs ${darkMode ? 'bg-amber-900 hover:bg-amber-800 text-amber-300' : 'bg-amber-100 hover:bg-amber-200 text-amber-800'}`}
                  >
                    Warnings
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Message</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {alerts.map(alert => (
                    <tr key={alert.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          alert.severity === 'high' ? (darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800') :
                          alert.severity === 'medium' ? (darkMode ? 'bg-amber-900 text-amber-300' : 'bg-amber-100 text-amber-800') :
                          (darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-800')
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{alert.message}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(alert.timestamp)}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          alert.resolved ? (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') :
                          (darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-800')
                        }`}>
                          {alert.resolved ? 'RESOLVED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {!alert.resolved && (
                          <button 
                            onClick={() => resolveAlert(alert.id)}
                            className={`text-xs px-3 py-1 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`py-6 mt-8 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">
                <span className="text-blue-500">PETRO</span>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>VISION</span>
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Advanced Production Monitoring System v2.1</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>Terms</a>
              <a href="#" className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>Privacy</a>
              <a href="#" className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>Contact</a>
              <a href="#" className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>Support</a>
            </div>
          </div>
          <div className={`mt-6 pt-6 border-t text-center text-sm ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
            © {new Date().getFullYear()} PetroVision Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}