# Photobooth App

A web-based photobooth application that allows users to take photos, select their favorites, and create custom photo templates.

## Project Structure

This repository is organized as follows:

- `/photobooth-app` - Main application code
- `/public` - Public assets

## Features

- Background music and sound effects
- Timer mode that takes 8 photos and lets users select 4 favorites
- Multiple template selection options
- User-friendly interface for photo editing
- Session timer (3 minutes)

## Deployment

This application is deployed using Vercel. The deployment configuration is handled by:

1. Root `package.json` - Forwards commands to the photobooth-app directory
2. Root `vercel.json` - Configures the build process for Vercel deployment

## Development

To run the application locally:

```bash
# Navigate to the app directory
cd photobooth-app

# Install dependencies
npm install

# Start the development server
npm start
```

## Building for Production

```bash
# Navigate to the app directory
cd photobooth-app

# Build for production
npm run build
```

The production build will be generated in the `photobooth-app/dist` directory. 