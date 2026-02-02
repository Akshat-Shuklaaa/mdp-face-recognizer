// src/pages/SettingsPage.js
import React, { useState, useEffect } from 'react';
import FaceRegistration from '../components/FaceRegistration';
import faceRecognitionService from '../utils/faceRecognition';
import { UserPlus, Bell, Shield, Trash2, Users, Database } from 'lucide-react';

const ToggleSwitch = ({ label, enabled, setEnabled }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-700">{label}</span>
    <div 
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-300'
      }`}
      onClick={() => setEnabled(!enabled)}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
        enabled ? 'translate-x-6' : ''
      }`}></div>
    </div>
  </div>
);

const RegisteredUserCard = ({ user, onRemove }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Users className="text-blue-600" size={24} />
        </div>
        <div className="ml-3">
          <p className="font-semibold text-gray-800">{user.name}</p>
          <p className="text-sm text-gray-600">{user.role || 'Employee'}</p>
          <p className="text-xs text-gray-500">
            {user.descriptors?.length || 0} face sample{user.descriptors?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <button
        onClick={() => onRemove(user.name)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Remove user"
      >
        <Trash2 size={20} />
      </button>
    </div>
  </div>
);

const SettingsPage = () => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [settings, setSettings] = useState({
    notifications: {
      unauthorized: true,
      system_errors: true,
      daily_summary: false,
    },
    detection: {
      confidence_threshold: 60,
      auto_save_logs: true,
    }
  });

  useEffect(() => {
    loadRegisteredUsers();
    loadSettings();
  }, []);

  const loadRegisteredUsers = () => {
    const users = faceRecognitionService.getAllRegisteredFaces();
    setRegisteredUsers(users);
  };

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem('appSettings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = (newSettings) => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleNotificationChange = (key) => {
    const updated = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    };
    saveSettings(updated);
  };

  const handleRemoveUser = async (name) => {
    if (window.confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)) {
      const success = await faceRecognitionService.removeFace(name);
      if (success) {
        loadRegisteredUsers();
        alert(`${name} has been removed successfully.`);
      } else {
        alert('Failed to remove user. Please try again.');
      }
    }
  };

  const handleRegistrationComplete = (data) => {
    loadRegisteredUsers();
    setShowRegistration(false);
    alert(`Successfully registered ${data.name}!`);
  };

  const clearAllData = () => {
    if (window.confirm('⚠️ WARNING: This will delete ALL registered faces and logs. This action cannot be undone. Are you absolutely sure?')) {
      if (window.confirm('This is your last chance to cancel. Proceed with deletion?')) {
        localStorage.removeItem('knownFaces');
        localStorage.removeItem('recognitionLogs');
        localStorage.removeItem('recognitionHistory');
        localStorage.removeItem('alerts');
        loadRegisteredUsers();
        alert('All data has been cleared.');
      }
    }
  };

  const exportData = () => {
    try {
      const data = {
        users: registeredUsers,
        settings: settings,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `face-recognition-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  if (showRegistration) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <FaceRegistration 
          onRegistrationComplete={handleRegistrationComplete}
          onClose={() => setShowRegistration(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Users className="mr-2" />
              Registered Users ({registeredUsers.length})
            </h2>
            <button 
              onClick={() => setShowRegistration(true)}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <UserPlus className="mr-2" size={20} />
              Register New Face
            </button>
          </div>

          {registeredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {registeredUsers.map((user, index) => (
                <RegisteredUserCard 
                  key={index} 
                  user={user} 
                  onRemove={handleRemoveUser}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Users className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">No registered users yet</p>
              <p className="text-sm text-gray-500 mt-2">Click "Register New Face" to add your first user</p>
            </div>
          )}
        </div>

        {/* Notification Settings Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Bell className="mr-2" />
            Notification Preferences
          </h2>
          <div className="space-y-4">
            <ToggleSwitch 
              label="Unauthorized Detections"
              enabled={settings.notifications.unauthorized}
              setEnabled={() => handleNotificationChange('unauthorized')}
            />
            <ToggleSwitch 
              label="System Errors"
              enabled={settings.notifications.system_errors}
              setEnabled={() => handleNotificationChange('system_errors')}
            />
            <ToggleSwitch 
              label="Daily Summary"
              enabled={settings.notifications.daily_summary}
              setEnabled={() => handleNotificationChange('daily_summary')}
            />
          </div>
        </div>

        {/* Detection Settings */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Shield className="mr-2" />
            Detection Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence Threshold: {settings.detection.confidence_threshold}%
              </label>
              <input
                type="range"
                min="40"
                max="90"
                value={settings.detection.confidence_threshold}
                onChange={(e) => saveSettings({
                  ...settings,
                  detection: {
                    ...settings.detection,
                    confidence_threshold: parseInt(e.target.value)
                  }
                })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher values = more strict matching (fewer false positives)
              </p>
            </div>
            <ToggleSwitch 
              label="Auto-save Recognition Logs"
              enabled={settings.detection.auto_save_logs}
              setEnabled={() => saveSettings({
                ...settings,
                detection: {
                  ...settings.detection,
                  auto_save_logs: !settings.detection.auto_save_logs
                }
              })}
            />
          </div>
        </div>

        {/* Data Management Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Database className="mr-2" />
            Data Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={exportData}
              className="py-3 px-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              Export Backup
            </button>
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const data = JSON.parse(event.target.result);
                      if (data.users) {
                        localStorage.setItem('knownFaces', JSON.stringify(data.users));
                        loadRegisteredUsers();
                        alert('Data imported successfully!');
                      }
                    } catch (error) {
                      alert('Failed to import data. Please check the file format.');
                    }
                  };
                  reader.readAsText(file);
                };
                input.click();
              }}
              className="py-3 px-4 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              Import Backup
            </button>
            <button
              onClick={clearAllData}
              className="py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
            >
              <Trash2 className="mr-2" size={18} />
              Clear All Data
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            <strong>Note:</strong> All face data is stored locally in your browser. 
            Export backups regularly to prevent data loss.
          </p>
        </div>

        {/* System Info */}
        <div className="lg:col-span-2 bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">System Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Registered Users</p>
              <p className="text-2xl font-bold text-gray-800">{registeredUsers.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Face Samples</p>
              <p className="text-2xl font-bold text-gray-800">
                {registeredUsers.reduce((sum, user) => sum + (user.descriptors?.length || 0), 0)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-gray-800">
                {Math.round((JSON.stringify(localStorage).length / 1024))}KB
              </p>
            </div>
            <div>
              <p className="text-gray-600">Version</p>
              <p className="text-2xl font-bold text-gray-800">1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;