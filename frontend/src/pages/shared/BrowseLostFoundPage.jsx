import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getItems } from '../../services/lostFoundService';
import LostFoundCard from '../../components/lostfound/LostFoundCard';
import {
  BookMarked,
  GraduationCap,
  ShieldCheck,
  HelpCircle,
  ArrowLeft,
  LogOut,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  Loader2,
  Info,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'books', label: 'Books' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'id_cards', label: 'ID/Cards' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'other', label: 'Other' },
];

const BrowseLostFoundPage = () => {
  const { user, token, logoutContext } = useAuth();
  const navigate = useNavigate();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all'); // 'all', 'lost', 'found'
  const [category, setCategory] = useState(''); // empty for 'all'
  const [status, setStatus] = useState('open'); // 'open' (default), 'all', 'claimed', 'resolved'

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8); // 8 items per page works beautifully on grids
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Data Loading States
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Navigation config based on role
  const roleConfigs = {
    student: {
      dashboard: '/student/dashboard',
      badgeClass: 'bg-amber-100 text-amber-700',
      logoBg: 'bg-amber-500',
      LogoIcon: BookMarked,
      badgeLabel: 'Student',
    },
    teacher: {
      dashboard: '/teacher/dashboard',
      badgeClass: 'bg-emerald-100 text-emerald-700',
      logoBg: 'bg-emerald-600',
      LogoIcon: GraduationCap,
      badgeLabel: 'Teacher',
    },
    admin: {
      dashboard: '/admin/dashboard',
      badgeClass: 'bg-indigo-100 text-indigo-700',
      logoBg: 'bg-indigo-600',
      LogoIcon: ShieldCheck,
      badgeLabel: 'Admin',
    },
  };

  const currentRole = user?.role || 'student';
  const config = roleConfigs[currentRole] || {
    dashboard: '/login',
    badgeClass: 'bg-primary-100 text-primary-700',
    logoBg: 'bg-primary-600',
    LogoIcon: HelpCircle,
    badgeLabel: 'User',
  };

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  // Fetch Items helper
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        type,
        category,
        status,
        search: search.trim() || undefined,
        page,
        pageSize,
      };

      const response = await getItems(filters, token);
      if (response?.success) {
        setItems(response.data.items || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalItems || 0);
      } else {
        setError('Failed to load lost/found posts.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error fetching lost/found items.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filters or page changes
  useEffect(() => {
    fetchItems();
  }, [type, category, status, page]);

  // Handle Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // reset page on new search
    fetchItems();
  };

  // Reset page when category, status or type filters change
  const handleTypeChange = (newType) => {
    setType(newType);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const LogoIconComponent = config.LogoIcon;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-250 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 ${config.logoBg} rounded-lg flex items-center justify-center`}>
              <LogoIconComponent className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CampusHive</span>
            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badgeClass}`}>
              {config.badgeLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-650 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Browse Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Navigation & Action Row */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(config.dashboard)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Lost & Found Hub
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Browse, search, and claim lost or found belongings on campus.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/lost-found/post')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Report Item</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-4 md:p-6 mb-8">
          <form onSubmit={handleSearchSubmit} className="space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all placeholder-gray-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    // Fetch list instantly with search cleared
                    setPage(1);
                    setTimeout(() => fetchItems(), 0);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-450 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Type Filter Buttons */}
            <div className="flex gap-1 p-1 bg-gray-50 border border-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('all')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  type === 'all'
                    ? 'bg-white text-amber-700 shadow-sm border border-amber-100'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('lost')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  type === 'lost'
                    ? 'bg-white text-rose-700 shadow-sm border border-rose-100'
                    : 'text-gray-500 hover:text-rose-600'
                }`}
              >
                Lost
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('found')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  type === 'found'
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                    : 'text-gray-500 hover:text-emerald-600'
                }`}
              >
                Found
              </button>
            </div>

            {/* Dropdown Filters Container */}
            <div className="grid grid-cols-2 gap-3 md:flex md:items-center">
              {/* Category Dropdown */}
              <div className="flex-1 md:w-44">
                <select
                  value={category}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-gray-700"
                >
                  <option value="">All Categories</option>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Dropdown */}
              <div className="flex-1 md:w-40">
                <select
                  value={status}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-gray-700"
                >
                  <option value="open">Open Only</option>
                  <option value="all">All Statuses</option>
                  <option value="claimed">Claimed</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              Search
            </button>
          </form>
        </div>

        {/* List Content */}
        <div className="flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
              <span className="text-gray-500 text-sm font-medium">Loading items...</span>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Could Not Load Posts</h3>
              <p className="text-sm text-gray-500 max-w-sm mb-6">{error}</p>
              <button
                onClick={fetchItems}
                className="px-4 py-2 bg-gray-950 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4 bg-white rounded-2xl border border-gray-150 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-5 border border-gray-100">
                <Grid className="w-8 h-8 stroke-[1.2]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">No items match your search</h3>
              <p className="text-sm text-gray-500 max-w-md mb-8">
                Try clearing your search query, adjusting your filters, or be the first to report this item!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSearch('');
                    setType('all');
                    setCategory('');
                    setStatus('open');
                    setPage(1);
                  }}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => navigate('/lost-found/post')}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                >
                  Report Item
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <LostFoundCard key={item.id} item={item} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-750">{items.length}</span> of{' '}
                    <span className="font-semibold text-gray-750">{totalItems}</span> reports
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="text-sm font-medium text-gray-700 px-3">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default BrowseLostFoundPage;
