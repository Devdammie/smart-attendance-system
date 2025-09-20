import * as faceapi from 'face-api.js';
import * as canvas from 'canvas';
import path from 'path';
import fs from 'fs';

// Polyfill for face-api.js to work in Node.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Path to the models
const modelsPath = path.join(process.cwd(), 'models', 'face-api');

// Load models
export const loadModels = async () => {
    // --- START DEBUGGING ---
    // This block will help verify if the model files exist on the server.
    // You can remove this after the deployment is successful.
    try {
        const projectRoot = process.cwd();
        console.log(`[DEBUG] Project root (process.cwd()): ${projectRoot}`);
        const rootContents = fs.readdirSync(projectRoot);
        console.log(`[DEBUG] Contents of project root:`, rootContents);

        const modelsDir = path.join(projectRoot, 'models');
        console.log(`[DEBUG] Checking for models directory at: ${modelsDir}`);
        const modelsDirExists = fs.existsSync(modelsDir);
        console.log(`[DEBUG] Does 'models' directory exist? ${modelsDirExists}`);

        if (modelsDirExists) {
            const modelsDirContents = fs.readdirSync(modelsDir);
            console.log(`[DEBUG] Contents of 'models' directory:`, modelsDirContents);

            const faceApiDir = path.join(modelsDir, 'face-api');
            if (fs.existsSync(faceApiDir)) {
                const faceApiDirContents = fs.readdirSync(faceApiDir);
                console.log(`[DEBUG] Contents of 'face-api' directory:`, faceApiDirContents);
            }
        }
    } catch (e) {
        console.error('[DEBUG] Error during directory listing:', e);
    }
    // --- END DEBUGGING ---

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