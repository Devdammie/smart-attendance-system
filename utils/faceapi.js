import * as faceapi from 'face-api.js';
import * as canvas from 'canvas';
import path from 'path';

// Polyfill for face-api.js to work in Node.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Path to the models
const modelsPath = path.join(process.cwd(), 'models', 'face-api');

// Load models
export const loadModels = async () => {
    try {
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
        console.log('Face-api models loaded successfully');
    } catch (error) {
        console.error('Error loading face-api models:', error);
        process.exit(1); // Exit if models can't be loaded
    }
};

// Helper to get image data from a buffer
export const image = (buffer) => {
    return canvas.loadImage(buffer);
};

export { faceapi };