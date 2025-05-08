# Cute Photobooth System

A photobooth application with a cute aesthetic UI, smooth animations, and a seamless user experience. This application is designed for use in a kiosk environment, with a focus on a playful and enjoyable user interface.

## Key Features

- 🎀 Cute, playful UI with pastel colors and animations
- 📸 Session-based workflow with countdown timer
- 🖼️ Photo capturing with manual or timer options
- ✨ Photo editing with filters, backgrounds, and templates
- 🖨️ Multiple delivery options: printing or QR code for digital downloads
- ⏱️ Timeout management for booth sessions

## System Flow

1. **Idle Attract Mode**: Displays a looping branded animation until the user taps to begin.
2. **Start Session**: User taps to begin the photobooth experience.
3. **Choose Image Quantity**: User selects 4, 6, 8, or 12 photos.
4. **Payment**: User makes payment, which starts a 5-minute (300-second) countdown timer.
5. **Photo Capture**: User can choose between manual capture or timer (3s, 5s, or 10s).
6. **Photo Selection**: User selects their preferred photos from those captured.
7. **Photo Editing**: User applies filters, backgrounds, and templates to their photos.
8. **Delivery Options**: User chooses between printing photos or generating a QR code for digital download.
9. **Thank You**: System displays a thank you message and returns to idle mode after 60 seconds.

## Technical Overview

- Built with React for the user interface
- Styled with styled-components for theming and styling
- Framer Motion for smooth animations and transitions
- Context API for global state management
- Responsive design suitable for touchscreen kiosks

## Running the Application

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Build for production:
   ```
   npm run build
   ```

## Hardware Integration Notes

In a production environment, this application would need hardware integration for:

- Camera input for photo capture
- Payment processing (cash/check)
- Printer for photo printing
- Touchscreen for user interaction

These integrations would require additional software development to communicate with the specific hardware components.

## Credits

- Developed as a proof-of-concept photobooth system
- Uses React, styled-components, and Framer Motion 