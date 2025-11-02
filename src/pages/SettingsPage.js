import React, { useState } from 'react';
import { users } from '../data/mockData';
import { UserPlus, Bell, Shield, Upload } from 'lucide-react';

const ToggleSwitch = ({ label, enabled, setEnabled }) => (
    <div className="flex items-center justify-between">
        <span className="text-gray-700">{label}</span>
        <div 
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
            onClick={() => setEnabled(!enabled)}
        >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${enabled ? 'translate-x-6' : ''}`}></div>
        </div>
    </div>
);

const SettingsPage = () => {
    // TODO: Replace with GET /api/users/current
    const [currentUser, setCurrentUser] = useState(users[0]);

    const handleNotificationChange = (key) => {
        const updatedUser = {
            ...currentUser,
            notifications: {
                ...currentUser.notifications,
                [key]: !currentUser.notifications[key]
            }
        };
        setCurrentUser(updatedUser);
        // TODO: Add PUT /api/users/current/notifications
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Management Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><UserPlus className="mr-2"/> User Management</h2>
                    <p className="text-gray-600 mb-4">Add or remove authorized users.</p>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center">
                        <Upload className="mr-2" size={20}/> Upload New Face Profile
                    </button>
                     {/* TODO: Add user list and remove functionality */}
                </div>

                {/* Notification Settings Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><Bell className="mr-2"/> Notification Preferences</h2>
                    <div className="space-y-4">
                        <ToggleSwitch 
                            label="Unauthorized Detections"
                            enabled={currentUser.notifications.unauthorized}
                            setEnabled={() => handleNotificationChange('unauthorized')}
                        />
                        <ToggleSwitch 
                            label="System Errors"
                            enabled={currentUser.notifications.system_errors}
                            setEnabled={() => handleNotificationChange('system_errors')}
                        />
                    </div>
                </div>

                {/* Security Settings Section */}
                <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><Shield className="mr-2"/> Security</h2>
                    <p className="text-gray-600">Further security settings would be configured here, such as password changes or two-factor authentication.</p>
                    {/* Placeholder for more security settings */}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
