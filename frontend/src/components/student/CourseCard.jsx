import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Clock, User } from 'lucide-react';

const CourseCard = ({ course }) => {
  return (
    <Link 
      to={`/student/courses/${course.id}/labtrack`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md hover:border-amber-200 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-sm font-bold tracking-wide">
          {course.code}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
        {course.title}
      </h3>
      
      <div className="mt-auto pt-4 flex items-center justify-between text-sm text-gray-500 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{course.creditHours} Credits</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4 text-gray-400" />
          <span className="truncate max-w-[120px]">{course.teacherName || 'Not Assigned'}</span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
