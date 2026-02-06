// src/pages/HomePage.js - ENHANCED VERSION
import React from 'react';
import { Link } from 'react-router-dom';
import { Video, FileText, Users, Settings, ChevronRight, Shield, Zap, Eye } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, to, delay }) => (
  <Link
    to={to}
    className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
        <Icon className="text-white" size={24} />
      </div>
      <ChevronRight className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" size={20} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
      {description}
    </p>
  </Link>
);

const StatCard = ({ icon: Icon, value, label }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          {value}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</p>
      </div>
      <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg">
        <Icon className="text-blue-600 dark:text-blue-400" size={24} />
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const features = [
    {
      icon: Video,
      title: 'Live Monitoring',
      description: 'Real-time face detection and recognition with instant alerts for unauthorized access attempts.',
      to: '/dashboard',
      delay: 100
    },
    {
      icon: FileText,
      title: 'Event Logs',
      description: 'Comprehensive history of all recognition events with advanced search and filtering capabilities.',
      to: '/logs',
      delay: 200
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Easy enrollment and management of authorized personnel with role-based access control.',
      to: '/settings',
      delay: 300
    },
    {
      icon: Settings,
      title: 'Custom Settings',
      description: 'Configure detection sensitivity, notifications, and system preferences to match your needs.',
      to: '/settings',
      delay: 400
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
              <Shield className="text-blue-600 dark:text-blue-400 mr-2" size={20} />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Advanced Security System
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              Face Recognition
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mt-2">
                Dashboard
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Cutting-edge facial recognition technology for secure access control and real-time monitoring. 
              Protect your premises with AI-powered intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Video className="mr-2" size={20} />
                Go to Dashboard
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-200 dark:border-gray-700"
              >
                <Settings className="mr-2" size={20} />
                Manage Users
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in">
          <StatCard icon={Eye} value="24/7" label="Real-time Monitoring" />
          <StatCard icon={Shield} value="99.9%" label="Accuracy Rate" />
          <StatCard icon={Zap} value="<100ms" label="Detection Speed" />
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need for comprehensive security management in one intuitive platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${feature.delay}ms` }}>
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>

      {/* Key Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 rounded-2xl shadow-2xl p-8 sm:p-12 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <Shield className="mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold mb-2">Secure</h3>
              <p className="text-blue-100 dark:text-gray-300">
                Advanced encryption and privacy-focused design
              </p>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <Zap className="mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold mb-2">Fast</h3>
              <p className="text-blue-100 dark:text-gray-300">
                Lightning-quick recognition in under 100ms
              </p>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <Eye className="mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold mb-2">Accurate</h3>
              <p className="text-blue-100 dark:text-gray-300">
                99.9% accuracy with advanced AI algorithms
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to get started?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Begin monitoring your premises with intelligent face recognition technology
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          Start Monitoring Now
          <ChevronRight className="ml-2" size={20} />
        </Link>
      </div>
    </div>
  );
};

export default HomePage;