import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Map, LayoutDashboard, Bell } from 'lucide-react';
import { searchSuppliers } from '../../data/mockData';
import type { Supplier } from '../../types';
import { getCountryFlag } from '../../types';

export default function TopNav() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Supplier[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const results = searchSuppliers(query);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleResultClick = (supplierId: string) => {
    setSearchQuery('');
    setShowResults(false);
    navigate(`/supplier/${supplierId}`);
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 px-6 flex items-center justify-between">
      {/* Left: Logo and Navigation */}
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-800">RADAR</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/') && !isActive('/map')
                ? 'bg-blue-50 text-blue-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link
            to="/map"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/map')
                ? 'bg-blue-50 text-blue-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Map size={18} />
            Map View
          </Link>
          <Link
            to="/signals"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/signals') || isActive('/preview')
                ? 'bg-blue-50 text-blue-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bell size={18} />
            Signals
          </Link>
        </div>
      </div>

      {/* Center: Search */}
      <div ref={searchRef} className="relative w-96">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search suppliers, parts, or locations..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery && setShowResults(true)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {searchResults.map((supplier) => (
              <button
                key={supplier.id}
                onClick={() => handleResultClick(supplier.id)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <div className="font-medium text-gray-900">{supplier.name}</div>
                  <div className="text-sm text-gray-500">
                    {getCountryFlag(supplier.location.countryCode)} {supplier.location.city}, {supplier.location.country}
                  </div>
                </div>
                <div className={`text-sm font-semibold tabular-nums ${
                  supplier.overallRiskScore >= 70 ? 'text-red-600' :
                  supplier.overallRiskScore >= 40 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {supplier.overallRiskScore}
                </div>
              </button>
            ))}
          </div>
        )}

        {showResults && searchQuery && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
            No suppliers found matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">Karen Wilson</div>
          <div className="text-xs text-gray-500">VP Supply Chain</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="text-blue-800" size={20} />
        </div>
      </div>
    </nav>
  );
}
