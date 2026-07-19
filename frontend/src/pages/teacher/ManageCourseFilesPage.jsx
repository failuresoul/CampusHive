import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Upload, 
  Search, 
  SlidersHorizontal,
  FolderOpen,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courseHubService } from '../../services/courseHubService';
import { getCourses } from '../../services/courseService';
import MaterialsTable from '../../components/coursehub/MaterialsTable';

const ManageCourseFilesPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  // Page States
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const coursesList = await getCourses('', token);
        const matched = coursesList.find(c => c.id.toString() === courseId.toString());
        if (matched) {
          setCourse(matched);
        } else {
          setCourse({
            id: courseId,
            code: 'COURSE-' + courseId,
            title: 'Learning Materials',
          });
        }
      } catch (err) {
        console.error('Failed to load courses details:', err);
        setCourse({
          id: courseId,
          code: 'COURSE-' + courseId,
          title: 'Learning Materials',
        });
      }
    };
    if (token) {
      fetchCourseDetails();
    }
  }, [courseId, token]);

  // Fetch Course Materials with filters
  useEffect(() => {
    const loadMaterials = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (debouncedSearch) params.search = debouncedSearch;

        const res = await courseHubService.getMaterials(courseId, params, token);
        if (res && res.success) {
          setMaterials(res.data);
        } else {
          setError(res?.message || 'Failed to fetch course materials.');
        }
      } catch (err) {
        console.error('Error fetching materials:', err);
        setError(err.response?.data?.message || 'Failed to load course materials.');
      } finally {
        setIsLoading(false);
      }
    };
    if (token) {
      loadMaterials();
    }
  }, [courseId, debouncedSearch, selectedCategory, token]);

  // Client-side sorting
  const sortedMaterials = [...materials].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    }
    if (sortBy === 'oldest') {
      return new Date(a.uploadedAt) - new Date(b.uploadedAt);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'downloads') {
      return (b.downloadCount ?? 0) - (a.downloadCount ?? 0);
    }
    return 0;
  });

  const handleDeleteClick = (material) => {
    // Story 4 placeholder
    alert(`Deletion will be implemented in Story 4. Selected item: "${material.title}"`);
  };

  if (isLoading && !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/teacher/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
              aria-label="Go to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{course?.code || 'Course'} • {course?.title || 'Learning Materials'}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Manage Course Materials
              </h1>
            </div>
          </div>
          <Link
            to={`/teacher/courses/${courseId}/materials/upload`}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md shadow-emerald-600/10"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Materials</span>
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="w-full lg:flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search materials by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder-gray-400"
            />
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            {/* Category Filter */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-48 pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-sm font-semibold text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Lecture Notes">Lecture Notes</option>
                <option value="Assignment">Assignment</option>
                <option value="Reference">Reference</option>
                <option value="Other">Other</option>
              </select>
              <SlidersHorizontal className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Filter */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-48 pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-sm font-semibold text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="downloads">Most Downloaded</option>
              </select>
              <SlidersHorizontal className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-12 bg-gray-200/60 rounded-xl animate-pulse"></div>
            <div className="h-16 bg-gray-200/60 rounded-2xl animate-pulse"></div>
            <div className="h-16 bg-gray-200/60 rounded-2xl animate-pulse"></div>
          </div>
        ) : sortedMaterials.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center max-w-xl mx-auto shadow-sm mt-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FolderOpen className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No learning materials found</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
              {searchQuery || selectedCategory 
                ? "No materials match your current search queries or filters. Try resetting them."
                : "No learning materials have been uploaded for this course yet. Start sharing slides, assignments, and notes with your students."}
            </p>
            <Link
              to={`/teacher/courses/${courseId}/materials/upload`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/10"
            >
              <Upload className="w-4 h-4" />
              Upload First Material
            </Link>
          </div>
        ) : (
          /* Real Data Table */
          <MaterialsTable 
            materials={sortedMaterials} 
            onDeleteClick={handleDeleteClick} 
          />
        )}
      </main>
    </div>
  );
};

export default ManageCourseFilesPage;
