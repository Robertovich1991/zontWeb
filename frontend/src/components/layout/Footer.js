import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="text-2xl font-bold text-blue-500 mb-4">ZONT</div>
            <p className="text-gray-400 text-sm">
              The smartest way to move around your city.
            </p>
          </div>

          {/* About Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Cities */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Top Cities</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/cities/paris" className="text-gray-400 hover:text-white transition-colors">
                  Paris
                </Link>
              </li>
              <li>
                <Link to="/cities/lyon" className="text-gray-400 hover:text-white transition-colors">
                  Lyon
                </Link>
              </li>
              <li>
                <Link to="/cities/berlin" className="text-gray-400 hover:text-white transition-colors">
                  Berlin
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/Zontcab-390761701681460/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://www.instagram.com/zont.cab/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram size={24} />
              </a>
            </div>
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-2">Download the app</p>
              <div className="space-y-2">
                <a
                  href="https://apps.apple.com/am/app/zont-cab/id1468482270"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-sm">
                    📱 App Store
                  </div>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.zont.rider"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-sm">
                    📱 Google Play
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2025 Zont Technologies Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
