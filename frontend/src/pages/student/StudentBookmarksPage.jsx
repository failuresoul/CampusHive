import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bookmark, 
  Search, 
  SlidersHorizontal,
  FolderOpen,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courseHubService } from '../../services/courseHubService';
import MaterialCard from '../../components/coursehub/MaterialCard';

const StudentBookmarksPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Page States
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch bookmarks
  const fetchBookmarks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await courseHubService.getMyBookmarks(token);
      if (res && res.success) {
        setBookmarks(res.data || []);
      } else {
        setError(res?.message || 'Failed to fetch bookmarked materials.');
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError(err.response?.data?.message || 'Failed to load bookmarks.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // Handle unbookmark action
  const handleBookmarkToggle = async (material, newStatus) => {
    try {
      setError(null);
      await courseHubService.toggleBookmark(material.id, newStatus, token);
      if (!newStatus) {
        // Optimistically filter out of list
        setBookmarks((prev) => prev.filter((m) => m.id !== material.id));
      }
      return true;
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setError('Failed to update bookmark.');
      return false;
    }
  };

  // Handle download file
  const handleDownloadClick = async (material) => {
    try {
      setError(null);
      await courseHubService.downloadMaterial(material.id, token, material.originalFileName);
    } catch (err) {
      console.error('Error downloading material:', err);
      setError(err.response?.data?.message || 'Failed to download material.');
    }
  };

  // Extract unique courses and categories for filter dropdowns
  const uniqueCourses = Array.from(
    new Set(bookmarks.map((b) => b.course?.code).filter(Boolean))
  ).sort();

  const uniqueCategories = Array.from(
    new Set(bookmarks.map((b) => b.category).filter(Boolean))
  ).sort();

  // Client-side filtering & search
  const filteredBookmarks = bookmarks.filter((m) => {
    const matchesSearch = searchQuery.trim() === '' || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === '' || m.category === selectedCategory;
    
    const matchesCourse = selectedCourse === '' || m.course?.code === selectedCourse;
    
    return matchesSearch && matchesCategory && matchesCourse;
  });

  // Client-side sorting
  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    }
    if (sortBy === 'oldest') {
      return new Date(a.uploadedAt) - new Date(b.uploadedAt);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
              aria-label="Go to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-0.5">
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                <span>Bookmarks • My Files</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                My Bookmarked Materials
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Filters Section (render only if there are bookmarks in database) */}
        {bookmarks.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="w-full lg:flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bookmarks by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium placeholder-gray-400"
              />
            </div>

            {/* Select Dropdowns */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
              {/* Course Filter */}
              {uniqueCourses.length > 0 && (
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full sm:w-44 pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-sm font-semibold text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                  >
                    <option value="">All Courses</option>
                    {uniqueCourses.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <SlidersHorizontal className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}

              {/* Category Filter */}
              {uniqueCategories.length > 0 && (
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-44 pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-sm font-semibold text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <SlidersHorizontal className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}

              {/* Sort selector */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-44 pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-sm font-semibold text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                </select>
                <SlidersHorizontal className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Content grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse flex flex-col h-64">
                <div className="w-12 h-12 bg-gray-200/60 rounded-2xl mb-4"></div>
                <div className="w-1/3 h-4 bg-gray-200/60 rounded-md mb-2"></div>
                <div className="w-3/4 h-5 bg-gray-200/60 rounded-md mb-2"></div>
                <div className="w-full h-12 bg-gray-100/60 rounded-md mt-auto"></div>
              </div>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          /* Empty State: No Bookmarks in DB */
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center max-w-xl mx-auto shadow-sm mt-8 animate-fade-in">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Bookmark className="w-8 h-8 text-amber-500 fill-current" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No bookmarked materials</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
              You haven't bookmarked any learning materials yet. Star items from your Course Hub lists to keep track of important slides and references here.
            </p>
            <Link
              to="/student/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all shadow-md shadow-amber-500/10"
            >
              <FolderOpen className="w-4 h-4" />
              Browse Enrolled Courses
            </Link>
          </div>
        ) : sortedBookmarks.length === 0 ? (
          /* Empty State: Filters returned no results */
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center max-w-xl mx-auto shadow-sm mt-8 animate-fade-in">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              We couldn't find any bookmarks matching your filters. Try resetting your search query or selections.
            </p>
          </div>
        ) : (
          /* Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {sortedBookmarks.map((material) => (
              <MaterialCard 
                key={material.id} 
                material={material} 
                onDownloadClick={handleDownloadClick} 
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentBookmarksPage;
