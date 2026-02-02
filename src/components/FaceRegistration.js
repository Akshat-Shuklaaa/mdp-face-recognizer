// src/utils/faceRecognition.js - FIXED VERSION
import * as faceapi from 'face-api.js';

class FaceRecognitionService {
  constructor() {
    this.isModelLoaded = false;
    this.labeledDescriptors = [];
    this.detectionOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: 416,
      scoreThreshold: 0.5
    });
  }

  async loadModels() {
    if (this.isModelLoaded) return;
    
    const MODEL_URL = process.env.PUBLIC_URL + '/models';
    
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      ]);
      
      this.isModelLoaded = true;
      console.log('Face recognition models loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
      throw error;
    }
  }

  async detectFaces(input) {
    if (!this.isModelLoaded) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    // Validate input
    if (!input) {
      console.warn('No input provided to detectFaces');
      return [];
    }

    try {
      const detections = await faceapi
        .detectAllFaces(input, this.detectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptors();
      
      // Validate detections
      if (!detections) return [];
      
      // Filter out invalid detections
      const validDetections = detections.filter(detection => {
        if (!detection || !detection.detection || !detection.detection.box) {
          return false;
        }
        const box = detection.detection.box;
        return (
          box.x != null && 
          box.y != null && 
          box.width != null && 
          box.height != null &&
          box.width > 0 &&
          box.height > 0
        );
      });
      
      return validDetections;
    } catch (error) {
      console.error('Error detecting faces:', error);
      return [];
    }
  }

  async loadKnownFaces() {
    try {
      const storedFaces = localStorage.getItem('knownFaces');
      if (!storedFaces) {
        this.labeledDescriptors = [];
        return;
      }

      const facesData = JSON.parse(storedFaces);
      this.labeledDescriptors = facesData.map(person => {
        const descriptors = person.descriptors.map(d => new Float32Array(d));
        return new faceapi.LabeledFaceDescriptors(person.name, descriptors);
      });

      console.log(`Loaded ${this.labeledDescriptors.length} known faces`);
    } catch (error) {
      console.error('Error loading known faces:', error);
      this.labeledDescriptors = [];
    }
  }

  async recognizeFace(faceDescriptor) {
    if (!faceDescriptor) {
      return { name: 'Unknown', confidence: 0, distance: 1, isUnknown: true };
    }

    if (this.labeledDescriptors.length === 0) {
      return { name: 'Unknown', confidence: 0, distance: 1, isUnknown: true };
    }

    try {
      const faceMatcher = new faceapi.FaceMatcher(this.labeledDescriptors, 0.6);
      const bestMatch = faceMatcher.findBestMatch(faceDescriptor);

      return {
        name: bestMatch.label,
        confidence: Math.round((1 - bestMatch.distance) * 100),
        distance: bestMatch.distance,
        isUnknown: bestMatch.label === 'unknown'
      };
    } catch (error) {
      console.error('Error recognizing face:', error);
      return { name: 'Unknown', confidence: 0, distance: 1, isUnknown: true };
    }
  }

  async registerFace(name, descriptors) {
    try {
      const storedFaces = localStorage.getItem('knownFaces');
      const facesData = storedFaces ? JSON.parse(storedFaces) : [];

      const existingPersonIndex = facesData.findIndex(p => p.name === name);
      
      const descriptorsArray = descriptors.map(d => Array.from(d));

      if (existingPersonIndex >= 0) {
        facesData[existingPersonIndex].descriptors.push(...descriptorsArray);
      } else {
        facesData.push({
          name,
          descriptors: descriptorsArray,
          role: 'Employee',
          registeredAt: new Date().toISOString()
        });
      }

      localStorage.setItem('knownFaces', JSON.stringify(facesData));
      await this.loadKnownFaces();

      console.log(`Registered face for ${name}`);
      return true;
    } catch (error) {
      console.error('Error registering face:', error);
      return false;
    }
  }

  async removeFace(name) {
    try {
      const storedFaces = localStorage.getItem('knownFaces');
      if (!storedFaces) return false;

      const facesData = JSON.parse(storedFaces);
      const filteredFaces = facesData.filter(p => p.name !== name);

      localStorage.setItem('knownFaces', JSON.stringify(filteredFaces));
      await this.loadKnownFaces();

      console.log(`Removed face for ${name}`);
      return true;
    } catch (error) {
      console.error('Error removing face:', error);
      return false;
    }
  }

  getAllRegisteredFaces() {
    try {
      const storedFaces = localStorage.getItem('knownFaces');
      return storedFaces ? JSON.parse(storedFaces) : [];
    } catch (error) {
      console.error('Error getting registered faces:', error);
      return [];
    }
  }

  drawDetections(canvas, detections, recognitionResults = []) {
    if (!canvas || !detections) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detection, index) => {
      // Validate detection has proper box
      if (!detection || !detection.detection || !detection.detection.box) {
        return;
      }

      const box = detection.detection.box;
      
      // Validate box dimensions
      if (box.x == null || box.y == null || box.width == null || box.height == null) {
        return;
      }

      if (box.width <= 0 || box.height <= 0) {
        return;
      }

      const result = recognitionResults[index];

      try {
        // Draw bounding box
        ctx.strokeStyle = result && !result.isUnknown ? '#10B981' : '#EF4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        // Draw label background
        const label = result ? `${result.name} (${result.confidence}%)` : 'Detecting...';
        ctx.font = '16px Arial';
        const textWidth = ctx.measureText(label).width;
        
        ctx.fillStyle = result && !result.isUnknown ? '#10B981' : '#EF4444';
        ctx.fillRect(box.x, box.y - 30, textWidth + 10, 30);

        // Draw label text
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(label, box.x + 5, box.y - 10);
      } catch (error) {
        console.error('Error drawing detection:', error);
      }
    });
  }
}

const faceRecognitionService = new FaceRecognitionService();

export default faceRecognitionService;