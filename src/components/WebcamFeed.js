// src/components/WebcamFeed.js
import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import faceRecognitionService from '../utils/faceRecognition';
import { Video, AlertCircle } from 'lucide-react';

const WebcamFeed = ({ onFaceDetected, isActive = true }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fps, setFps] = useState(0);
  const detectionIntervalRef = useRef(null);
  const fpsIntervalRef = useRef(null);
  const frameCountRef = useRef(0);

  useEffect(() => {
    initializeFaceRecognition();
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && !isLoading) {
      startDetection();
    } else {
      stopDetection();
    }
  }, [isActive, isLoading]);

  const initializeFaceRecognition = async () => {
    try {
      setIsLoading(true);
      await faceRecognitionService.loadModels();
      await faceRecognitionService.loadKnownFaces();
      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to load face recognition models');
      setIsLoading(false);
      console.error(err);
    }
  };

  const startDetection = () => {
    // Stop any existing interval
    stopDetection();

    // Start face detection loop
    detectionIntervalRef.current = setInterval(() => {
      detectFaces();
    }, 100); // Check every 100ms (10 FPS)

    // Start FPS counter
    fpsIntervalRef.current = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (fpsIntervalRef.current) {
      clearInterval(fpsIntervalRef.current);
      fpsIntervalRef.current = null;
    }
  };

  const detectFaces = async () => {
    if (
      !webcamRef.current ||
      !webcamRef.current.video ||
      webcamRef.current.video.readyState !== 4 ||
      !canvasRef.current
    ) {
      return;
    }

    try {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;

      // Set canvas size to match video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Detect faces
      const detections = await faceRecognitionService.detectFaces(video);

      if (detections.length > 0) {
        // Recognize each detected face
        const recognitionResults = await Promise.all(
          detections.map(detection => 
            faceRecognitionService.recognizeFace(detection.descriptor)
          )
        );

        // Draw detections on canvas
        faceRecognitionService.drawDetections(canvas, detections, recognitionResults);

        // Notify parent component
        if (onFaceDetected) {
          const facesData = recognitionResults.map((result, index) => ({
            ...result,
            detection: detections[index],
            timestamp: new Date().toISOString(),
          }));
          onFaceDetected(facesData);
        }

        frameCountRef.current++;
      } else {
        // Clear canvas if no faces detected
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    } catch (err) {
      console.error('Error in face detection:', err);
    }
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user',
  };

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
        <div className="flex items-center">
          <AlertCircle className="mr-2" />
          <div>
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="w-full h-auto"
        onUserMediaError={(err) => {
          console.error('Webcam error:', err);
          setError('Failed to access webcam. Please check permissions.');
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white text-lg">Loading face recognition models...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
        </div>
      )}

      {/* Status overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isActive && !isLoading ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
        <span className="text-sm font-medium">
          {isLoading ? 'Loading...' : isActive ? 'Live' : 'Paused'}
        </span>
      </div>

      {/* FPS counter */}
      {!isLoading && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
          <span className="text-sm font-medium">{fps} FPS</span>
        </div>
      )}
    </div>
  );
};

export default WebcamFeed;