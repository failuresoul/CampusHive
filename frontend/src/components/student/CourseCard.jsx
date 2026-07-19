import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';

const CourseCard = ({ course }) => {
  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md hover:border-amber-200 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-xs font-bold tracking-wide border border-amber-200">
          {course.code}
        </span>
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
          {course.department || 'Academic'}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
        {course.title}
      </h3>
      
      <div className="pt-4 flex items-center justify-between text-sm text-gray-500 border-t border-gray-50 mb-5">
        <div className="flex items-center gap-1.5 font-medium">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>{course.creditHours} Credits</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium min-w-0">
          <User className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="truncate max-w-[120px]">{course.teacherName || 'Not Assigned'}</span>
        </div>
      </div>

      <div className="flex gap-2.5 mt-auto pt-3 border-t border-gray-100">
        <Link 
          to={`/student/courses/${course.id}/materials`}
          className="flex-1 text-center py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-amber-500/10"
        >
          Materials
        </Link>
        <Link 
          to={`/student/courses/${course.id}/labtrack`}
          className="flex-1 text-center py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition-all"
        >
          Lab Reports
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
