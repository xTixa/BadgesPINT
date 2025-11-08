import React from 'react';
import { Link } from 'react-router-dom';

export default function LearningPathCard({ path }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
      <div className="p-1 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="bg-white p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {path?.name || "Learning Path Name"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {path?.description || "Description of the learning path and its objectives."}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {path?.badgeCount || "5"} Badges
                </span>
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {path?.duration || "3"} Months
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500">Progress</span>
                      <span className="text-xs font-medium text-gray-500">
                        {path?.progress || "60"}%
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 rounded bg-gray-200">
                      <div
                        className="h-2 rounded bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${path?.progress || 60}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-between items-center">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((_, i) => (
                <div
                  key={i}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                  style={{
                    background: `linear-gradient(to right, #3B82F6, #8B5CF6)`,
                  }}
                >
                  <span className="sr-only">Badge {i + 1}</span>
                </div>
              ))}
              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 ring-2 ring-white">
                <span className="text-xs font-medium text-gray-500">+2</span>
              </div>
            </div>
            <Link
              to={`/learning-paths/${path?.id || "1"}/service-lines`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Start Learning
              <svg
                className="ml-2 -mr-1 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}