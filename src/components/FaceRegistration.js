// src/components/FaceRegistration.js
import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import faceRecognitionService from '../utils/faceRecognition';
import { Camera, UserPlus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const FaceRegistration = ({ onRegistrationComplete, onClose }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Employee');
  const [status, setStatus] = useState('idle'); // idle, capturing, processing, success, error
  const [message, setMessage] = useState('');
  const [capturedImages, setCapturedImages] = useState([]);
  const webcamRef = useRef(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
  };

  const captureImage = async () => {
    if (!webcamRef.current) return;

    try {
      setStatus('capturing');
      const imageSrc = webcamRef.current.getScreenshot();
      
      // Create image element to process
      const img = new Image();
      img.src = imageSrc;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Detect face in captured image
      const detections = await faceRecognitionService.detectFaces(img);

      if (detections.length === 0) {
        setMessage('No face detected. Please try again.');
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
        return;
      }

      if (detections.length > 1) {
        setMessage('Multiple faces detected. Please ensure only one person is in frame.');
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
        return;
      }

      // Add to captured images
      setCapturedImages(prev => [...prev, {
        src: imageSrc,
        descriptor: detections[0].descriptor
      }]);

      setMessage(`Captured ${capturedImages.length + 1}/3 images`);
      setStatus('idle');

    } catch (error) {
      console.error('Error capturing image:', error);
      setMessage('Error capturing image. Please try again.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const registerFace = async () => {
    if (!name.trim()) {
      setMessage('Please enter a name');
      return;
    }

    if (capturedImages.length < 1) {
      setMessage('Please capture at least 1 image');
      return;
    }

    try {
      setStatus('processing');
      setMessage('Registering face...');

      // Extract descriptors from captured images
      const descriptors = capturedImages.map(img => img.descriptor);

      // Register the face
      const success = await faceRecognitionService.registerFace(name, descriptors);

      if (success) {
        setStatus('success');
        setMessage(`Successfully registered ${name}!`);
        
        // Notify parent component
        if (onRegistrationComplete) {
          onRegistrationComplete({
            name,
            role,
            imageCount: capturedImages.length,
            registeredAt: new Date().toISOString()
          });
        }

        // Reset form after 2 seconds
        setTimeout(() => {
          resetForm();
          if (onClose) onClose();
        }, 2000);
      } else {
        setStatus('error');
        setMessage('Failed to register face. Please try again.');
      }
    } catch (error) {
      console.error('Error registering face:', error);
      setStatus('error');
      setMessage('Error registering face. Please try again.');
    }
  };

  const resetForm = () => {
    setName('');
    setRole('Employee');
    setCapturedImages([]);
    setStatus('idle');
    setMessage('');
  };

  const removeCapturedImage = (index) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <UserPlus className="mr-2" />
        Register New Face
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Webcam */}
        <div>
          <div className="mb-4">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full rounded-lg border-2 border-gray-300"
            />
          </div>

          <button
            onClick={captureImage}
            disabled={status === 'capturing' || status === 'processing' || capturedImages.length >= 3}
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
              status === 'capturing' || status === 'processing' || capturedImages.length >= 3
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Camera className="mr-2" />
            {status === 'capturing' ? 'Capturing...' : `Capture Image (${capturedImages.length}/3)`}
          </button>

          {/* Captured Images Preview */}
          {capturedImages.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Captured Images:</p>
              <div className="flex space-x-2">
                {capturedImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={img.src} 
                      alt={`Capture ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border-2 border-green-500"
                    />
                    <button
                      onClick={() => removeCapturedImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Form */}
        <div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={status === 'processing'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={status === 'processing'}
              >
                <option value="Employee">Employee</option>
                <option value="Visitor">Visitor</option>
                <option value="Contractor">Contractor</option>
                <option value="Security">Security</option>
                <option value="Management">Management</option>
              </select>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800 font-medium mb-2">Instructions:</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Look directly at the camera</li>
                <li>Ensure good lighting</li>
                <li>Capture 1-3 images from different angles</li>
                <li>Keep your face clearly visible</li>
              </ul>
            </div>

            {/* Status Message */}
            {message && (
              <div className={`p-3 rounded-lg flex items-center ${
                status === 'success' ? 'bg-green-100 text-green-800' :
                status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {status === 'success' && <CheckCircle className="mr-2" size={20} />}
                {status === 'error' && <AlertCircle className="mr-2" size={20} />}
                <span className="text-sm">{message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={registerFace}
                disabled={status === 'processing' || capturedImages.length === 0 || !name.trim()}
                className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                  status === 'processing' || capturedImages.length === 0 || !name.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {status === 'processing' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2" size={20} />
                    Register
                  </>
                )}
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  disabled={status === 'processing'}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRegistration;