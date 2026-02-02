// src/pages/DashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import WebcamFeed from '../components/WebcamFeed';
import { Video, Bell, User, Clock, MapPin, TrendingUp } from 'lucide-react';

const FaceCard = ({ face }) => {
  const isAuthorized = !face.isUnknown;
  const timeAgo = getTimeAgo(new Date(face.timestamp));

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 transform transition-all hover:scale-105 ${
      isAuthorized ? 'border-green-500' : 'border-red-500'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isAuthorized ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <User className={isAuthorized ? 'text-green-600' : 'text-red-600'} size={24} />
          </div>
          <div className="ml-3">
            <p className="font-semibold text-gray-800">{face.name}</p>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <Clock size={12} className="mr-1" />
              {timeAgo}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${
            isAuthorized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isAuthorized ? 'Authorized' : 'Unknown'}
          </span>
          <p className="text-xs text-gray-500 mt-1">{face.confidence}% match</p>
        </div>
      </div>
      <div className="flex items-center text-xs text-gray-600">
        <MapPin size={12} className="mr-1" />
        <span>Main Entrance</span>
      </div>
    </div>
  );
};

const AlertItem = ({ alert }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-3 rounded-lg shadow-sm animate-pulse-once">
    <div className="flex">
      <Bell className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-bold text-red-800 text-sm">Unauthorized Detection</p>
        <p className="text-sm text-red-700 mt-1">{alert.message}</p>
        <p className="text-xs text-red-600 mt-2">{new Date(alert.timestamp).toLocaleString()}</p>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const [recognizedFaces, setRecognizedFaces] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    authorized: 0,
    unauthorized: 0,
    unique: 0
  });

  // Track seen faces to avoid duplicates
  const [seenFaces] = useState(new Set());
  const [lastAlertTime, setLastAlertTime] = useState(0);

  useEffect(() => {
    // Load recognition history from localStorage
    loadRecognitionHistory();
  }, []);

  useEffect(() => {
    // Update stats whenever recognizedFaces changes
    updateStats();
  }, [recognizedFaces]);

  const loadRecognitionHistory = () => {
    try {
      const history = localStorage.getItem('recognitionHistory');
      if (history) {
        const parsed = JSON.parse(history);
        // Only load today's recognitions
        const today = new Date().toDateString();
        const todayRecognitions = parsed.filter(face => 
          new Date(face.timestamp).toDateString() === today
        );
        setRecognizedFaces(todayRecognitions);
      }
    } catch (error) {
      console.error('Error loading recognition history:', error);
    }
  };

  const saveRecognitionHistory = (faces) => {
    try {
      localStorage.setItem('recognitionHistory', JSON.stringify(faces));
    } catch (error) {
      console.error('Error saving recognition history:', error);
    }
  };

  const handleFaceDetected = useCallback((faces) => {
    faces.forEach(face => {
      // Create unique key for this detection
      const faceKey = `${face.name}-${Math.floor(Date.now() / 5000)}`; // 5 second window

      // Only add if not seen recently
      if (!seenFaces.has(faceKey)) {
        seenFaces.add(faceKey);

        // Add to recognized faces list
        const newFace = {
          id: Date.now() + Math.random(),
          name: face.name,
          confidence: face.confidence,
          timestamp: face.timestamp,
          isUnknown: face.isUnknown,
          location: 'Main Entrance'
        };

        setRecognizedFaces(prev => {
          const updated = [newFace, ...prev].slice(0, 50); // Keep last 50
          saveRecognitionHistory(updated);
          
          // Save to logs
          saveToLogs(newFace);
          
          return updated;
        });

        // Trigger alert for unknown faces
        if (face.isUnknown) {
          const now = Date.now();
          // Only create alert if 10 seconds have passed since last alert
          if (now - lastAlertTime > 10000) {
            createAlert(newFace);
            setLastAlertTime(now);
          }
        }

        // Cleanup old entries from seenFaces Set after 5 seconds
        setTimeout(() => {
          seenFaces.delete(faceKey);
        }, 5000);
      }
    });
  }, [seenFaces, lastAlertTime]);

  const saveToLogs = (face) => {
    try {
      const logs = JSON.parse(localStorage.getItem('recognitionLogs') || '[]');
      const newLog = {
        id: Date.now(),
        date: new Date(face.timestamp).toISOString().split('T')[0],
        time: new Date(face.timestamp).toLocaleTimeString(),
        name: face.name,
        status: face.isUnknown ? 'Unknown' : 'Known',
        location: face.location,
        confidence: face.confidence
      };
      logs.unshift(newLog);
      localStorage.setItem('recognitionLogs', JSON.stringify(logs.slice(0, 500))); // Keep last 500
    } catch (error) {
      console.error('Error saving to logs:', error);
    }
  };

  const createAlert = (face) => {
    const newAlert = {
      id: Date.now(),
      message: `Unrecognized person detected at ${face.location}`,
      timestamp: face.timestamp,
      severity: 'high'
    };

    setAlerts(prev => [newAlert, ...prev].slice(0, 10)); // Keep last 10 alerts

    // Save alerts to localStorage
    try {
      const storedAlerts = JSON.parse(localStorage.getItem('alerts') || '[]');
      storedAlerts.unshift(newAlert);
      localStorage.setItem('alerts', JSON.stringify(storedAlerts.slice(0, 100)));
    } catch (error) {
      console.error('Error saving alert:', error);
    }
  };

  const updateStats = () => {
    const today = new Date().toDateString();
    const todayFaces = recognizedFaces.filter(face => 
      new Date(face.timestamp).toDateString() === today
    );

    const uniqueNames = new Set(todayFaces.map(face => face.name));

    setStats({
      totalToday: todayFaces.length,
      authorized: todayFaces.filter(face => !face.isUnknown).length,
      unauthorized: todayFaces.filter(face => face.isUnknown).length,
      unique: uniqueNames.size
    });
  };

  const clearAlerts = () => {
    setAlerts([]);
    localStorage.setItem('alerts', JSON.stringify([]));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={User} 
          label="Total Detections Today" 
          value={stats.totalToday}
          color="bg-blue-500"
        />
        <StatCard 
          icon={User} 
          label="Authorized" 
          value={stats.authorized}
          color="bg-green-500"
        />
        <StatCard 
          icon={Bell} 
          label="Unauthorized" 
          value={stats.unauthorized}
          color="bg-red-500"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Unique Individuals" 
          value={stats.unique}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Live Feed and Recognized Faces */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Feed */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Video className="mr-2" />
              Live Feed
            </h2>
            <WebcamFeed onFaceDetected={handleFaceDetected} isActive={true} />
          </div>

          {/* Recently Recognized Faces */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Recently Detected ({recognizedFaces.length})
            </h2>
            {recognizedFaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {recognizedFaces.slice(0, 6).map(face => (
                  <FaceCard key={face.id} face={face} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <User className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600">No faces detected yet</p>
                <p className="text-sm text-gray-500 mt-2">Face detections will appear here in real-time</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Alerts */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Active Alerts</h2>
            {alerts.length > 0 && (
              <button
                onClick={clearAlerts}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map(alert => <AlertItem key={alert.id} alert={alert} />)
            ) : (
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <Bell className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-600 font-medium">No Active Alerts</p>
                <p className="text-sm text-gray-500 mt-2">You'll be notified of any security concerns</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default DashboardPage;