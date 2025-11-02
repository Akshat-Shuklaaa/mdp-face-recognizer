import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Video, History, Settings } from 'lucide-react';

const FeatureCard = ({ icon, title, description, to }) => (
  <Link to={to} className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </Link>
);

const HomePage = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 sm:text-5xl">
          Welcome to <span className="text-blue-600">SmartMonitor</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          A modern, real-time face recognition and monitoring system designed to enhance your security with cutting-edge technology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FeatureCard 
          to="/dashboard"
          icon={<Video size={24} />} 
          title="Live Monitoring"
          description="View real-time camera feeds and get instant alerts for recognized individuals."
        />
        <FeatureCard 
          to="/logs"
          icon={<History size={24} />} 
          title="Event Logs"
          description="Access a detailed and searchable history of all recognition events and alerts."
        />
        <FeatureCard 
          to="/settings"
          icon={<ShieldCheck size={24} />} 
          title="User Management"
          description="Easily manage authorized personnel and visitors from a centralized dashboard."
        />
        <FeatureCard 
          to="/settings"
          icon={<Settings size={24} />} 
          title="Custom Settings"
          description="Configure system alerts, notification preferences, and camera settings."
        />
      </div>
    </div>
  );
};

export default HomePage;
