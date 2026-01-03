# Pano Publisher

![alt text](/docs/assets/dummy-ui-example.png)

Pano Publisher is a simple webapp for uploading Equirectangular 360-Images to Google Maps via the Google Street View API. It is built with Svelte 5 and processes everything locally on the client up until publishing images to Google.

A deployed version can be found here: [https://pano-publisher.net](https://pano-publisher.net)

## Features

- 🗺️ **Interactive Map** - visualize your panorama locations with OpenStreetMap integration
- 📸 **Batch Upload** - queue and publish multiple 360° images
- 🌐 **Built-in 360° Preview** - inspect your panoramas directly in the app before publishing
- 🔐 **Privacy First** - all data processing happens locally in your browser until you publish to Google
- ✏️ **Geo-Data-Editing** - edit or add geo data via text input or by setting the marker's position on the map
- 📱 **Responsive UI** - clean, user-friendly interface

## Prerequisites

- Node.js 18+
- Google Cloud Project with Street View Publish API enabled
- OAuth 2.0 Client ID (see [Google Auth Setup](docs/GOOGLE_AUTH_SETUP.md))

## Installation & Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/777555777/360-gmaps-uploader
   cd 360-gmaps-uploader
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the template file `.env-template` and add your Google credentials:

   ```bash
   cp .env-template .env
   ```

   Edit `.env` and enter your values:

   ```bash
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   VITE_DRY_RUN=true  # For local testing without actual upload
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   The app will be running at `http://localhost:5173`
