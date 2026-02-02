// src/components/WebcamFeed.js - FIXED VERSION
import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import faceRecognitionService from '../utils/faceRecognition';
import { AlertCircle } from 'lucide-react';

const WebcamFeed = ({ onFaceDetected, isActive = true }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fps, setFps] = useState(0);
  const detectionIntervalRef = useRef(null);
  const fpsIntervalRef = useRef(null);
  const frameCountRef = useRef(0);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    initializeFaceRecognition();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isActive && !isLoading && isVideoReady) {
      startDetection();
    } else {
      stopDetection();
    }
  }, [isActive, isLoading, isVideoReady]);

  const cleanup = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    if (fpsIntervalRef.current) {
      clearInterval(fpsIntervalRef.current);
    }
  };

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
    stopDetection();

    detectionIntervalRef.current = setInterval(() => {
      detectFaces();
    }, 100);

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
    // CRITICAL: Extensive null checks
    if (!webcamRef.current) return;
    if (!webcamRef.current.video) return;
    if (!canvasRef.current) return;
    
    const video = webcamRef.current.video;
    
    // Check if video is ready and has valid dimensions
    if (video.readyState !== 4) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    try {
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video (only if changed)
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Detect faces
      const detections = await faceRecognitionService.detectFaces(video);

      // Only proceed if we have valid detections
      if (detections && detections.length > 0) {
        // Validate detections have proper structure
        const validDetections = detections.filter(d => 
          d && 
          d.detection && 
          d.detection.box &&
          d.detection.box.x != null &&
          d.detection.box.y != null &&
          d.detection.box.width != null &&
          d.detection.box.height != null
        );

        if (validDetections.length > 0) {
          // Recognize each detected face
          const recognitionResults = await Promise.all(
            validDetections.map(detection => 
              faceRecognitionService.recognizeFace(detection.descriptor)
            )
          );

          // Draw detections on canvas
          faceRecognitionService.drawDetections(canvas, validDetections, recognitionResults);

          // Notify parent component
          if (onFaceDetected) {
            const facesData = recognitionResults.map((result, index) => ({
              ...result,
              detection: validDetections[index],
              timestamp: new Date().toISOString(),
            }));
            onFaceDetected(facesData);
          }

          frameCountRef.current++;
        }
      } else {
        // Clear canvas if no faces detected
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    } catch (err) {
      console.error('Error in face detection:', err);
      // Don't set error state for individual detection failures
    }
  };

  const handleUserMedia = () => {
    // Wait a bit for video to be fully ready
    setTimeout(() => {
      setIsVideoReady(true);
    }, 500);
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
            <button 
              onClick={initializeFaceRecognition}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try Again
            </button>
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
        onUserMedia={handleUserMedia}
        onUserMediaError={(err) => {
          console.error('Webcam error:', err);
          setError('Failed to access webcam. Please check permissions.');
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white text-lg">Loading face recognition models...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
        </div>
      )}

      {!isVideoReady && !isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
          <p className="text-white text-lg">Initializing camera...</p>
        </div>
      )}

      {/* Status overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isActive && !isLoading && isVideoReady ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
        <span className="text-sm font-medium">
          {isLoading ? 'Loading...' : !isVideoReady ? 'Starting...' : isActive ? 'Live' : 'Paused'}
        </span>
      </div>

      {/* FPS counter */}
      {!isLoading && isVideoReady && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
          <span className="text-sm font-medium">{fps} FPS</span>
        </div>
      )}
    </div>
  );
};

export default WebcamFeed;