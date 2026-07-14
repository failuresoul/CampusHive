import React, { useState, useEffect } from 'react';
import { BookMarked, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import CourseCard from '../../components/student/CourseCard';

const MOCK_COURSES = [
  {
    id: '1',
    code: 'CS101',
    title: 'Introduction to Programming',
    creditHours: 3,
    teacherName: 'Dr. Alan Turing',
  },
  {
    id: '2',
    code: 'CS201',
    title: 'Data Structures',
    creditHours: 4,
    teacherName: 'Grace Hopper',
  },
  {
    id: '3',
    code: 'PHY101',
    title: 'General Physics I',
    creditHours: 4,
    teacherName: 'Albert Einstein',
  },
];

const StudentCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: connect to GET /api/students/me/courses in Story 2
    const fetchCourses = async () => {
      setLoading(true);
      // Simulate network request
      setTimeout(() => {
        setCourses(MOCK_COURSES); // Set to empty array to test empty state
        setLoading(false);
      }, 1000);
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/student/dashboard" 
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="h-10 w-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <BookMarked className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
              <p className="text-sm text-gray-500">View and access your enrolled courses</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
                <div className="w-16 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="w-3/4 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="w-full h-4 bg-gray-100 rounded mb-2"></div>
                <div className="mt-8 pt-4 border-t border-gray-50 flex justify-between">
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center">
            <BookMarked className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Courses Yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              You are not enrolled in any courses yet. Check back later or contact your administrator.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCoursesPage;
