import React from 'react';
import { Link } from 'react-router-dom';

export default function BadgeCard({ badge }) {
  return (
    <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="aspect-w-1 aspect-h-1 bg-gray-200 group-hover:opacity-75">
        <div className="flex items-center justify-center h-48 bg-gradient-to-br from-blue-500 to-purple-600">
          {badge?.icon || (
            <svg
              className="h-24 w-24 text-white opacity-75"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          )}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {badge?.name || "Badge Name"}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {badge?.description || "This badge represents achievement in a specific area of expertise."}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Level {badge?.level || "1"}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {badge?.points || "100"} Points
            </span>
          </div>
          <Link
            to={`/badges/${badge?.id || "1"}/requirements`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}