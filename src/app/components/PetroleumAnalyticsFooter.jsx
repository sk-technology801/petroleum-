
// src/components/PetroleumAnalyticsFooter.jsx
"use client";
import Link from 'next/link';
import { FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const PetroleumAnalyticsFooter = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Branding */}
          <div>
            <Link href="/" className="flex items-center group">
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                ANSARI<span className="text-gray-300">PETROLEUM</span>
              </h2>
            </Link>
            <p className="text-sm text-gray-300 mt-2">Industrial Analytics Platform for Energy Excellence</p>
            <div className="flex space-x-4 mt-4">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-all duration-200"
                aria-label="Follow us on Twitter/X"
              >
                <FaTwitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-all duration-200"
                aria-label="Connect with us on LinkedIn"
              >
                <FaLinkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@ansaripetroleum.com"
                className="text-gray-300 hover:text-white transition-all duration-200"
                aria-label="Contact us via email"
              >
                <FaEnvelope className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/exploration" className="text-gray-300 hover:text-white transition-all duration-200" aria-label="Exploration page">
                  Exploration
                </Link>
              </li>
              <li>
                <Link href="/production" className="text-gray-300 hover:text-white transition-all duration-200" aria-label="Production page">
                  Production
                </Link>
              </li>
              <li>
                <Link href="/refining" className="text-gray-300 hover:text-white transition-all duration-200" aria-label="Refining page">
                  Refining
                </Link>
              </li>
              <li>
                <Link href="/logistics" className="text-gray-300 hover:text-white transition-all duration-200" aria-label="Logistics page">
                  Logistics
                </Link>
              </li>
              <li>
                <Link href="/markets" className="text-gray-300 hover:text-white transition-all duration-200" aria-label="Markets page">
                  Markets
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-all duration-200" aria-label="Terms of service">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-all duration-200" aria-label="Privacy policy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-all duration-200" aria-label="Contact us">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-white transition-all duration-200" aria-label="Support">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-300">
          © {new Date().getFullYear()} Ansari Petroleum Systems. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default PetroleumAnalyticsFooter;
