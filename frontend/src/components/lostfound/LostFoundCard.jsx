import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, Image as ImageIcon, User, AlertCircle } from 'lucide-react';

const CATEGORY_LABELS = {
  electronics: 'Electronics',
  books: 'Books',
  clothing: 'Clothing',
  id_cards: 'ID/Cards',
  accessories: 'Accessories',
  other: 'Other',
};

const LostFoundCard = ({ item }) => {
  const {
    id,
    title,
    type,
    category,
    location,
    itemDate,
    status,
    photoPath,
    reporter,
  } = item;

  const imageUrl = photoPath ? `http://localhost:5000/${photoPath}` : null;
  const categoryLabel = CATEGORY_LABELS[category] || category || 'Other';

  return (
    <Link
      to={`/lost-found/${id}`}
      className="group bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-amber-250 transition-all duration-300 flex flex-col h-full"
    >
      {/* Photo Container */}
      <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // fallback if image fails to load
              e.target.onerror = null;
              e.target.src = '';
              e.target.className = 'hidden';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 p-4">
            <ImageIcon className="w-12 h-12 stroke-[1.2] mb-2 text-gray-300 group-hover:text-amber-400 transition-colors" />
            <span className="text-xs font-medium">No Image Provided</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm border uppercase ${
              type === 'lost'
                ? 'bg-rose-50 text-rose-700 border-rose-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}
          >
            {type === 'lost' ? 'Lost' : 'Found'}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider border shadow-sm ${
              status === 'open'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : status === 'claimed'
                ? 'bg-blue-50 text-blue-700 border-blue-250'
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-2">
          <Tag className="w-3.5 h-3.5 text-gray-350" />
          <span>{categoryLabel}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-1">
          {title}
        </h3>

        {/* Metadata Details */}
        <div className="space-y-2 mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{new Date(itemDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="bg-gray-50/50 px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-medium text-gray-600 line-clamp-1">
            {reporter?.name || 'Anonymous'}
          </span>
        </div>
        <span className="text-[10px] text-gray-400 font-mono">ID: #{id}</span>
      </div>
    </Link>
  );
};

export default LostFoundCard;
