import React from 'react';
import { recognizedFaces, alerts } from '../data/mockData';
import { Video, UserCheck, UserX, Bell } from 'lucide-react';

const FaceCard = ({ face }) => (
  <div className={`bg-white rounded-lg shadow-md p-4 flex items-center border-l-4 ${face.status === 'Authorized' ? 'border-green-500' : 'border-red-500'}`}>
    <img src={face.imageUrl} alt={face.name} className="w-16 h-16 rounded-full mr-4" />
    <div>
      <p className="font-semibold text-gray-800">{face.name}</p>
      <p className="text-sm text-gray-600">{face.role}</p>
      <p className={`text-xs font-bold ${face.status === 'Authorized' ? 'text-green-600' : 'text-red-600'}`}>{face.status}</p>
      <p className="text-xs text-gray-500">{new Date(face.timestamp).toLocaleTimeString()}</p>
    </div>
  </div>
);

const AlertItem = ({ alert }) => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
        <div className="flex">
            <div className="py-1"><Bell className="h-6 w-6 text-red-500 mr-4" /></div>
            <div>
                <p className="font-bold">Unauthorized Alert</p>
                <p className="text-sm">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
            </div>
        </div>
    </div>
);

const DashboardPage = () => {
  // TODO: Replace with GET /api/recognized-faces
  const faces = recognizedFaces;
  // TODO: Replace with GET /api/alerts
  const currentAlerts = alerts;

  return (
    <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><Video className="mr-2"/>Live Feed</h2>
        <div className="bg-black text-white aspect-video rounded-lg flex items-center justify-center mb-8 shadow-lg">
          <p className="text-gray-400">Live camera feed placeholder</p>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recognized Faces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* TODO: Replace with GET /api/recognized-faces */}
          {faces.map(face => <FaceCard key={face.id} face={face} />)}
        </div>
      </div>

      <div className="lg:col-span-1">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Alerts</h2>
        <div>
            {/* TODO: Replace with GET /api/alerts */}
            {currentAlerts.length > 0 ? (
                currentAlerts.map(alert => <AlertItem key={alert.id} alert={alert} />)
            ) : (
                <p className="text-gray-500">No active alerts.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
