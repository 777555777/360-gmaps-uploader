# Pano Publisher

![alt text](/docs/assets/dummy-ui-example.png)

![](https://img.shields.io/badge/license-AGPL--3.0-blue)

Pano Publisher is a simple web app for uploading equirectangular 360° images to Google Maps via the Google Street View API. Built with Svelte 5, it is designed to be local-first, with all image processing happening in the browser. Optional features, such as OpenStreetMap place search, make use of external services but can be disabled via configuration.

A deployed version ready to use can be found here: [https://panopublisher.net](https://panopublisher.net)

## Features

- 🗺️ **Interactive Map** - visualize your panorama locations with OpenStreetMap integration
- 📸 **Batch Upload** - queue and publish multiple 360° images
- 🌐 **Built-in 360° Preview** - inspect your panoramas directly in the app before publishing
- 🔐 **Privacy First** - all data processing happens locally in your browser until you publish to Google
- ✏️ **Geo-Data-Editing** - edit or add geo data via text input or by setting the marker's position on the map
- 🔍 **Geo Search (optional)** - autocomplete search field to find locations fast
- 📱 **Responsive UI** - clean, user-friendly interface

## Prerequisites

- Node.js 18+
- Google Cloud Project with Street View Publish API enabled
- OAuth 2.0 Client ID (see [Google Auth Setup](docs/GOOGLE_AUTH_SETUP.md))
- **Optional** if search is enabled: MapTiler API Key (free tier available at [MapTiler](https://www.maptiler.com/cloud/))

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

   PUBLIC_MAPTILER_API_KEY=your_maptiler_api_key_here # Public key with domain restrictions
   PUBLIC_ENABLE_MAP_SEARCH=true # Set to false to disable map search feature
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   The app will be running at `http://localhost:5173`

## Deployment

```bash
npm run build
npm run preview  # Test production build on port 4173
```

## Legal & Disclaimer

This project uses the **Google Street View Publish API**. By using this application, you agree to:

- Google's [Terms of Service](https://developers.google.com/terms)
- Google's [Street View Publish API Terms](https://developers.google.com/streetview/publish/terms)

**Important:** You are responsible for:

- Your own Google Cloud API usage and any associated costs
- Compliance with Google's usage policies
- The content you publish to Google Street View

### Optional External Services

When enabled, the search feature uses the **MapTiler API** for geocoding. By enabling this feature, you agree to:

- MapTiler's [Terms of Service](https://www.maptiler.com/terms/)
- MapTiler's [Privacy Policy](https://www.maptiler.com/privacy-policy/).

This software is provided "as-is" without warranty of any kind. The author assumes no liability for any damages or costs arising from the use of this software or the Google Street View API.

## License

This project is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE).
