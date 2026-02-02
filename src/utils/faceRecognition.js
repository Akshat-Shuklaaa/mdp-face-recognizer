// src/utils/faceRecognition.js
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

  // Load face-api.js models
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

  // Detect faces in an image/video element
  async detectFaces(input) {
    if (!this.isModelLoaded) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    try {
      const detections = await faceapi
        .detectAllFaces(input, this.detectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptors();
      
      return detections;
    } catch (error) {
      console.error('Error detecting faces:', error);
      return [];
    }
  }

  // Load known faces from localStorage
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

  // Recognize a face by comparing with known faces
  async recognizeFace(faceDescriptor) {
    if (this.labeledDescriptors.length === 0) {
      return { name: 'Unknown', confidence: 0, distance: 1 };
    }

    const faceMatcher = new faceapi.FaceMatcher(this.labeledDescriptors, 0.6);
    const bestMatch = faceMatcher.findBestMatch(faceDescriptor);

    return {
      name: bestMatch.label,
      confidence: Math.round((1 - bestMatch.distance) * 100),
      distance: bestMatch.distance,
      isUnknown: bestMatch.label === 'unknown'
    };
  }

  // Register a new face
  async registerFace(name, descriptors) {
    try {
      // Get existing faces
      const storedFaces = localStorage.getItem('knownFaces');
      const facesData = storedFaces ? JSON.parse(storedFaces) : [];

      // Check if person already exists
      const existingPersonIndex = facesData.findIndex(p => p.name === name);
      
      // Convert Float32Array to regular array for storage
      const descriptorsArray = descriptors.map(d => Array.from(d));

      if (existingPersonIndex >= 0) {
        // Add to existing person's descriptors
        facesData[existingPersonIndex].descriptors.push(...descriptorsArray);
      } else {
        // Add new person
        facesData.push({
          name,
          descriptors: descriptorsArray,
          role: 'Employee',
          registeredAt: new Date().toISOString()
        });
      }

      // Save to localStorage
      localStorage.setItem('knownFaces', JSON.stringify(facesData));

      // Reload known faces
      await this.loadKnownFaces();

      console.log(`Registered face for ${name}`);
      return true;
    } catch (error) {
      console.error('Error registering face:', error);
      return false;
    }
  }

  // Remove a person from known faces
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

  // Get all registered faces
  getAllRegisteredFaces() {
    try {
      const storedFaces = localStorage.getItem('knownFaces');
      return storedFaces ? JSON.parse(storedFaces) : [];
    } catch (error) {
      console.error('Error getting registered faces:', error);
      return [];
    }
  }

  // Draw detection results on canvas
  drawDetections(canvas, detections, recognitionResults = []) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detection, index) => {
      const box = detection.detection.box;
      const result = recognitionResults[index];

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
    });
  }
}

// Create singleton instance
const faceRecognitionService = new FaceRecognitionService();

export default faceRecognitionService;