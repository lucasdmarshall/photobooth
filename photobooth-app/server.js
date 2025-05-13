const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const archiver = require('archiver');

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory storage for photo sessions (in a real app, this would be a database)
const photoSessions = new Map();

// Enable CORS
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));

// API endpoint to store photos for download
app.post('/api/photos', (req, res) => {
  const { photos, templateId } = req.body;
  
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    return res.status(400).json({ error: 'Invalid photos data' });
  }
  
  // Generate a unique session ID
  const sessionId = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
  
  // Store the photos in memory (in a real app, save to disk or cloud storage)
  photoSessions.set(sessionId, {
    photos,
    templateId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  });
  
  // Return the session ID for QR code generation
  res.json({
    id: sessionId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
});

// API endpoint to get photos by session ID
app.get('/api/photos/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (!photoSessions.has(sessionId)) {
    return res.status(404).json({ error: 'Photo session not found or expired' });
  }
  
  const session = photoSessions.get(sessionId);
  
  // Check if session has expired
  if (new Date() > session.expiresAt) {
    photoSessions.delete(sessionId);
    return res.status(404).json({ error: 'Photo session has expired' });
  }
  
  // Return the photos
  res.json({
    photos: session.photos,
    templateId: session.templateId,
    expiresAt: session.expiresAt.toISOString()
  });
});

// API endpoint to download photos as a ZIP file
app.get('/api/download/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (!photoSessions.has(sessionId)) {
    return res.status(404).json({ error: 'Photo session not found or expired' });
  }
  
  const session = photoSessions.get(sessionId);
  
  // Check if session has expired
  if (new Date() > session.expiresAt) {
    photoSessions.delete(sessionId);
    return res.status(404).json({ error: 'Photo session has expired' });
  }
  
  // Set the appropriate headers for a ZIP file download
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename=photobooth_${sessionId}.zip`);
  
  // Create a ZIP archive
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });
  
  // Pipe the archive to the response
  archive.pipe(res);
  
  // Add each photo to the archive
  session.photos.forEach((photo, index) => {
    // Convert data URI to buffer
    const matches = photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (matches && matches.length === 3) {
      const buffer = Buffer.from(matches[2], 'base64');
      
      // Add the buffer to the archive
      archive.append(buffer, { name: `photo_${index + 1}.jpg` });
    }
  });
  
  // Finalize the archive
  archive.finalize();
});

// The "catchall" handler: for any request that doesn't match one above, send back the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
