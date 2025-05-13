// Make MediaPipe Face Mesh optional to prevent build failures
let FaceMesh = null;

// We'll try to load MediaPipe at runtime instead of build time
const loadFaceMesh = () => {
  try {
    // Check if the module is available in the window/global scope
    if (window.FaceMesh) {
      return window.FaceMesh;
    }
    
    // Try dynamic import if available in browser
    if (typeof require !== 'undefined') {
      return require('@mediapipe/face_mesh').FaceMesh;
    }
    
    return null;
  } catch (error) {
    console.warn('MediaPipe Face Mesh not available, beautification features will be limited');
    return null;
  }
};

let cv = null;
let faceMesh = null;
let isInitialized = false;

// Global variable to track if OpenCV is currently being loaded
let isLoadingOpenCV = false;
let openCVLoadPromise = null;

// Load OpenCV.js
const loadOpenCV = async () => {
  // If OpenCV is already loaded, use it
  if (window.cv) {
    cv = window.cv;
    return Promise.resolve();
  }
  
  // If OpenCV is currently being loaded, return the existing promise
  if (isLoadingOpenCV && openCVLoadPromise) {
    return openCVLoadPromise;
  }
  
  // Start loading OpenCV
  isLoadingOpenCV = true;
  openCVLoadPromise = new Promise((resolve) => {
    // Check again in case it loaded between our first check and here
    if (window.cv) {
      cv = window.cv;
      isLoadingOpenCV = false;
      resolve();
      return;
    }

    // Create a script element to load OpenCV
    const script = document.createElement('script');
    script.setAttribute('async', '');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', 'https://docs.opencv.org/4.7.0/opencv.js');
    script.onload = () => {
      try {
        cv = window.cv;
        console.log('OpenCV.js loaded successfully');
      } catch (error) {
        console.error('Error initializing OpenCV:', error);
      } finally {
        isLoadingOpenCV = false;
        resolve();
      }
    };
    script.onerror = () => {
      console.error('Failed to load OpenCV.js');
      isLoadingOpenCV = false;
      resolve(); // Resolve anyway to prevent hanging promises
    };
    document.head.appendChild(script);
  });
  
  return openCVLoadPromise;
};

// Initialize MediaPipe FaceMesh
const initFaceMesh = async () => {
  if (faceMesh) return Promise.resolve();
  
  // Try to load FaceMesh at runtime
  if (!FaceMesh) {
    FaceMesh = loadFaceMesh();
  }
  
  // Skip if MediaPipe is still not available
  if (!FaceMesh) {
    console.warn('MediaPipe Face Mesh not available, skipping initialization');
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    try {
      faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });
      
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      resolve();
    } catch (error) {
      console.warn('Error initializing FaceMesh, beautification will be limited:', error);
      resolve(); // Resolve anyway to continue with limited functionality
    }
  });
};

// Initialize both libraries
export const initBeautificationTools = async () => {
  if (isInitialized) return;
  
  try {
    // Load OpenCV first, then FaceMesh (sequential to avoid race conditions)
    await loadOpenCV();
    await initFaceMesh();
    isInitialized = true;
    console.log('Beautification tools initialized successfully');
  } catch (error) {
    console.error('Failed to initialize beautification tools:', error);
    throw error;
  }
};

// Process facial landmarks and return them
const detectFacialLandmarks = async (imageData) => {
  if (!faceMesh) {
    // Return null if FaceMesh is not available
    return Promise.resolve(null);
  }
  
  return new Promise((resolve) => {
    try {
      faceMesh.onResults((results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          resolve(results.multiFaceLandmarks[0]);
        } else {
          resolve(null);
        }
      });
      
      faceMesh.send({image: imageData});
    } catch (error) {
      console.warn('Error detecting facial landmarks:', error);
      resolve(null); // Resolve with null to continue with limited functionality
    }
  });
};

// Apply skin smoothing effect
const applySkinSmoothing = (src, strength = 0.6) => {
  try {
    // Convert strength (0-1) to bilateralFilter parameters
    const diameter = Math.round(9 * strength);
    const sigmaColor = 75 * strength;
    const sigmaSpace = 75 * strength;
    
    // Create destination matrix
    const dst = new cv.Mat();
    
    // Apply bilateral filter for edge-preserving smoothing
    cv.bilateralFilter(src, dst, diameter, sigmaColor, sigmaSpace);
    
    return dst;
  } catch (error) {
    console.error('Error in skin smoothing:', error);
    return src.clone(); // Return a clone of the source on error
  }
};

// Apply skin tone enhancement
const applySkinToneEnhancement = (src, warmth = 0.2, brightness = 0.1) => {
  try {
    // Convert to HSV color space for better color manipulation
    const hsv = new cv.Mat();
    cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
    cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);
    
    // Split the channels
    const channels = new cv.MatVector();
    cv.split(hsv, channels);
    
    // Adjust hue (0) for warmth, saturation (1) for richness, and value (2) for brightness
    let hue = channels.get(0);
    let saturation = channels.get(1);
    let value = channels.get(2);
    
    // Adjust warmth by shifting hue towards yellow/orange
    const hueShift = new cv.Mat();
    hue.convertTo(hueShift, -1, 1, warmth * 10);
    
    // Increase brightness
    const brightValue = new cv.Mat();
    value.convertTo(brightValue, -1, 1 + brightness, 0);
    
    // Merge back the channels
    const newHsv = new cv.Mat();
    const newChannels = new cv.MatVector();
    newChannels.push_back(hueShift);
    newChannels.push_back(saturation);
    newChannels.push_back(brightValue);
    cv.merge(newChannels, newHsv);
    
    // Convert back to RGB
    const dst = new cv.Mat();
    cv.cvtColor(newHsv, dst, cv.COLOR_HSV2RGB);
    cv.cvtColor(dst, dst, cv.COLOR_RGB2RGBA);
    
    // Clean up
    hue.delete();
    saturation.delete();
    value.delete();
    hueShift.delete();
    brightValue.delete();
    hsv.delete();
    channels.delete();
    newChannels.delete();
    newHsv.delete();
    
    return dst;
  } catch (error) {
    console.error('Error in skin tone enhancement:', error);
    // Clean up any potentially created resources
    try {
      if (hue) hue.delete();
      if (saturation) saturation.delete();
      if (value) value.delete();
      if (hueShift) hueShift.delete();
      if (brightValue) brightValue.delete();
      if (hsv) hsv.delete();
      if (channels) channels.delete();
      if (newChannels) newChannels.delete();
      if (newHsv) newHsv.delete();
    } catch (e) {
      // Ignore cleanup errors
    }
    return src.clone(); // Return a clone of the source on error
  }
};

// Add subtle face warping for slimming effect
const applyFacialWarping = (src, landmarks, slimFactor = 0.2) => {
  if (!landmarks) return src.clone();
  
  try {
    // Create destination matrix
    const dst = src.clone();
    
    // Get image dimensions
    const height = src.rows;
    const width = src.cols;
    
    // Define facial mesh points for facial warping
    // We need key points that define the face outline
    const jawPoints = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const jawLandmarks = jawPoints.map(index => landmarks[index]);
    
    // Calculate face center
    const centerX = width / 2;
    
    // Create mesh grid for warping
    const map_x = new cv.Mat(height, width, cv.CV_32FC1);
    const map_y = new cv.Mat(height, width, cv.CV_32FC1);
    
    // Generate the warping maps
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        // Calculate distance from center line
        const distFromCenter = Math.abs(j - centerX);
        const normalizedDist = distFromCenter / (width / 2);
        
        // Calculate warping factor (higher near face edges)
        let warpFactor = 0;
        
        // Check if pixel is near jawline based on landmarks
        const isNearJawline = jawLandmarks.some(point => {
          const dx = j - point.x * width;
          const dy = i - point.y * height;
          const dist = Math.sqrt(dx * dx + dy * dy);
          return dist < 50; // pixel distance threshold
        });
        
        if (isNearJawline) {
          warpFactor = slimFactor * normalizedDist;
        }
        
        // Apply warping: move points toward center
        if (j < centerX) {
          map_x.floatPtr(i, j)[0] = j + warpFactor * distFromCenter;
        } else {
          map_x.floatPtr(i, j)[0] = j - warpFactor * distFromCenter;
        }
        map_y.floatPtr(i, j)[0] = i;
      }
    }
    
    // Apply remapping
    cv.remap(src, dst, map_x, map_y, cv.INTER_LINEAR);
    
    // Clean up
    map_x.delete();
    map_y.delete();
    
    return dst;
  } catch (error) {
    console.error('Error in facial warping:', error);
    // Clean up any potentially created resources
    try {
      if (map_x) map_x.delete();
      if (map_y) map_y.delete();
    } catch (e) {
      // Ignore cleanup errors
    }
    return src.clone(); // Return a clone of the source on error
  }
};

// Processing lock to prevent multiple simultaneous operations
let isCurrentlyProcessing = false;

// Main function to apply beautification effects
export const applyBeautificationEffects = async (imageData, options = {}) => {
  // If already processing, return the original image
  if (isCurrentlyProcessing) {
    console.log('Skipping beautification - already processing another request');
    return imageData;
  }
  
  // Set processing lock
  isCurrentlyProcessing = true;
  
  // Default options
  const defaultOptions = {
    smoothing: 0.5,      // 0-1: Skin smoothing strength
    skinTone: 0.2,       // 0-1: Skin tone enhancement
    brightness: 0.1,     // 0-1: Brightness adjustment
    faceSlimming: 0.2,   // 0-1: Face slimming effect
  };
  
  // Merge with user options
  const settings = { ...defaultOptions, ...options };
  
  // Ensure libs are initialized
  if (!isInitialized) {
    try {
      await initBeautificationTools();
    } catch (error) {
      console.error('Failed to initialize beautification tools:', error);
      isCurrentlyProcessing = false; // Release lock
      return imageData; // Return original image if initialization fails
    }
  }
  
  // If OpenCV is not available, return the original image
  if (!cv) {
    console.error('OpenCV not available');
    isCurrentlyProcessing = false; // Release lock
    return imageData;
  }
  
  let src = null;
  let result = null;
  
  try {
    // Create HTML Image element from imageData
    const imageElement = new Image();
    imageElement.src = imageData;
    
    // Wait for image to load
    await new Promise(resolve => {
      imageElement.onload = resolve;
    });
    
    // If OpenCV is not available, return original image
    if (!cv) {
      console.warn('OpenCV not available, skipping beautification');
      isCurrentlyProcessing = false;
      return imageData;
    }
    
    // Apply beautification effects based on settings
    let src = cv.imread(imageElement);
    let result = src;
    
    try {
      // Apply effects based on settings
      if (settings.smoothing > 0) {
        const smoothed = applySkinSmoothing(result, settings.smoothing);
        if (result !== src) result.delete();
        result = smoothed;
      }
      
      if (settings.skinTone > 0 || settings.brightness > 0) {
        const enhanced = applySkinToneEnhancement(result, settings.skinTone, settings.brightness);
        if (result !== src) result.delete();
        result = enhanced;
      }
      
      // Only apply face slimming if FaceMesh is available
      if (settings.faceSlimming > 0 && faceMesh) {
        const landmarks = await detectFacialLandmarks(imageElement);
        if (landmarks) {
          const warped = applyFacialWarping(result, landmarks, settings.faceSlimming);
          if (result !== src) result.delete();
          result = warped;
        }
      }
      
      // Create canvas to get resulting image data
      const canvas = document.createElement('canvas');
      canvas.width = result.cols;
      canvas.height = result.rows;
      
      // Render result to canvas
      cv.imshow(canvas, result);
      
      // Get final image as data URL
      const outputImageData = canvas.toDataURL('image/jpeg', 0.9);
      
      return outputImageData;
    } finally {
      // Clean up OpenCV resources
      try {
        if (result && result !== src) result.delete();
        if (src) src.delete();
      } catch (e) {
        console.error('Error cleaning up OpenCV resources:', e);
      }
      
      isCurrentlyProcessing = false;
    }
  } catch (error) {
    console.error('Error applying beautification effects:', error);
    isCurrentlyProcessing = false; // Release lock
    return imageData;
  }
};

// For debugging: Visualize facial landmarks on canvas
export const visualizeFacialLandmarks = async (imageData, canvasElement) => {
  if (!isInitialized) {
    await initBeautificationTools();
  }
  
  try {
    // Create HTML Image element from imageData
    const imageElement = new Image();
    imageElement.src = imageData;
    
    // Wait for image to load
    await new Promise(resolve => {
      imageElement.onload = resolve;
    });
    
    // Detect facial landmarks
    const landmarks = await detectFacialLandmarks(imageElement);
    
    if (!landmarks) {
      console.warn('No facial landmarks detected');
      return;
    }
    
    // Set canvas dimensions
    const canvas = canvasElement;
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    
    // Draw landmarks
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageElement, 0, 0);
    
    // Draw points
    landmarks.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x * canvas.width, point.y * canvas.height, 2, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    });
    
    console.log(`Visualized ${landmarks.length} facial landmarks`);
  } catch (error) {
    console.error('Error visualizing facial landmarks:', error);
  }
}; 