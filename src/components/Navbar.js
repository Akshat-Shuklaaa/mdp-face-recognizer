import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Home, List, Settings } from 'lucide-react';

const Navbar = () => {
  const navLinks = [
    { to: '/', text: 'Home', icon: <Home size={20} /> },
    { to: '/dashboard', text: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/logs', text: 'Logs', icon: <List size={20} /> },
    { to: '/settings', text: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-2xl font-bold text-gray-800">
              <span className="text-blue-600">Smart</span>Monitor
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`
                  }
                >
                  {link.icon}
                  <span className="ml-2">{link.text}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
