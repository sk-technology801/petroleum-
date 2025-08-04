
// src/components/PetroleumAnalyticsHeader.jsx
"use client"
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const PetroleumAnalyticsHeader = () => {
  const [realTimeData, setRealTimeData] = useState({
    oilPrice: 82.45,
    productionRate: 1245,
    alerts: 3
  });
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      // Simulate real-time data updates
      setRealTimeData(prev => ({
        oilPrice: (82.45 + (Math.random() * 2 - 1)).toFixed(2),
        productionRate: Math.floor(1245 + (Math.random() * 100 - 50)),
        alerts: prev.alerts + (Math.random() > 0.9 ? 1 : 0)
      }));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-black border-b-4 border-white">
      {/* Top Utility Bar */}
      <div className="bg-black py-1 px-4 text-xs">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-6">
            <div className="flex items-center">
              <span className="text-white mr-1">WTI:</span>
              <span className="font-mono text-white">${realTimeData.oilPrice}</span>
            </div>
            <div className="flex items-center">
              <span className="text-white mr-1">Production:</span>
              <span className="font-mono text-white">{realTimeData.productionRate.toLocaleString()} bbl/d</span>
            </div>
          </div>
          <div className="text-gray-300">
            {time.toLocaleTimeString()} | {time.toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and App Name */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center group">
              <div className="relative h-12 w-12">
                <Image 
                  src="https://images.pexels.com/photos/2569842/pexels-photo-2569842.jpeg?_gl=1*eelq0f*_ga*MTU3NjA0MjQ0NS4xNzUwMzMyOTg3*_ga_8JE65Q40S6*czE3NTQyNTQ5NzkkbzQ2JGcxJHQxNzU0MjU0OTkzJGo0NiRsMCRoMA.." 
                  alt="Petroleum Analytics Logo"
                  fill
                  className="object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="ml-2">
                <h1 className="text-2xl font-extrabold text-white">
                  ANSARI<span className="text-gray-300">PETROLEUM</span>
                </h1>
                <p className="text-xs text-gray-300 -mt-1">INDUSTRIAL ANALYTICS PLATFORM</p>
              </div>
            </Link>
          </div>

          {/* Central Navigation with Dropdowns */}
          <nav className="hidden xl:flex space-x-1">
            <div className="group relative">
              <button className="px-4 py-2 bg-black hover:bg-gray-800 rounded-t-lg flex items-center space-x-2 text-white">
                <span>Exploration</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute z-10 hidden group-hover:block w-48 bg-black shadow-xl rounded-b-lg rounded-tr-lg">
                <Link href="/exploration/maps" className="block px-4 py-2 text-white hover:bg-gray-800">Seismic Maps</Link>
                <Link href="/exploration/prospects" className="block px-4 py-2 text-white hover:bg-gray-800">Prospect Analysis</Link>
                <Link href="/exploration/reserves" className="block px-4 py-2 text-white hover:bg-gray-800">Reserve Estimates</Link>
              </div>
            </div>

            <div className="group relative">
              <button className="px-4 py-2 bg-black hover:bg-gray-800 rounded-t-lg flex items-center space-x-2 text-white">
                <span>Production</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute z-10 hidden group-hover:block w-48 bg-black shadow-xl rounded-b-lg rounded-tr-lg">
                <Link href="/production/dashboard" className="block px-4 py-2 text-white hover:bg-gray-800">Real-time Dashboard</Link>
                <Link href="/production/wells" className="block px-4 py-2 text-white hover:bg-gray-800">Well Performance</Link>
                <Link href="/production/optimization" className="block px-4 py-2 text-white hover:bg-gray-800">Optimization</Link>
              </div>
            </div>

            <Link href="/refining" className="px-4 py-2 bg-black hover:bg-gray-800 rounded-lg text-white">
              Refining
            </Link>
            <Link href="/logistics" className="px-4 py-2 bg-black hover:bg-gray-800 rounded-lg text-white">
              Logistics
            </Link>
            <Link href="/markets" className="px-4 py-2 bg-black hover:bg-gray-800 rounded-lg text-white">
              Markets
            </Link>
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button className="p-2 rounded-full bg-black hover:bg-gray-800 transition-colors relative text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {realTimeData.alerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {realTimeData.alerts}
                  </span>
                )}
              </button>
            </div>

            <div className="hidden lg:flex items-center space-x-3 bg-black rounded-full pl-1 pr-4 py-1 cursor-pointer hover:bg-gray-800">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-lg font-bold text-black">
                SK
              </div>
              <div>
                <div className="text-sm font-medium text-white">Sardar Saadi</div>
                <div className="text-xs text-gray-300">Sr. Petroleum Engineer</div>
              </div>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <button className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg hidden lg:block text-black">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PetroleumAnalyticsHeader;
