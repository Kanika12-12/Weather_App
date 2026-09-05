import React from 'react';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    <p className="mt-4 text-lg text-gray-400">Fetching weather data...</p>
  </div>
);

export default LoadingSpinner;