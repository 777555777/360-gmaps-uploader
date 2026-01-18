# Google OAuth 2.0 Setup für Street View Publish API

## Übersicht

Diese Anwendung verwendet **Google Identity Services (GIS)** für die OAuth 2.0 Authentifizierung. Dies ist der moderne und empfohlene Ansatz von Google, der sicherer ist als der veraltete implizite Flow.

## Voraussetzungen

1. **Google Cloud Project erstellen**
   - Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
   - Erstelle ein neues Projekt oder wähle ein bestehendes aus

2. **APIs aktivieren**
   - Aktiviere die **Street View Publish API**
   - Gehe zu: APIs & Services → Library → Suche nach "Street View Publish API"

3. **OAuth 2.0 Client ID erstellen**
   - Gehe zu: APIs & Services → Credentials
   - Klicke auf "Create Credentials" → "OAuth Client ID"
   - Wähle "Web application"
   - Füge autorisierte JavaScript-Ursprünge hinzu:
     - `http://localhost:5173` (für Entwicklung)
     - `https://your-domain.com` (für Produktion)
   - Füge autorisierte Weiterleitungs-URIs hinzu:
     - `http://localhost:5173`
     - `https://your-domain.com`

4. **OAuth Consent Screen konfigurieren**
   - Gehe zu: APIs & Services → OAuth consent screen
   - Wähle "External" (für Test-Apps) oder "Internal" (für Organisation)
   - Füge die erforderlichen Scopes hinzu:
     - `https://www.googleapis.com/auth/streetviewpublish`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`

## Konfiguration

Aktualisiere die Client ID in `src/lib/components/header.svelte`:

```typescript
const PUBLIC_GOOGLE_CLIENT_ID = 'DEINE-CLIENT-ID.apps.googleusercontent.com';
```

## Verwendung

### 1. Benutzer anmelden

```typescript
import { authState } from '$lib/auth-state.svelte';

// Benutzer anmelden
authState.signIn();

// Prüfen ob angemeldet
const isAuthenticated = authState.isAuthenticated;
const user = authState.user;
```

### 2. Authentifizierte API-Anfragen

```typescript
// Methode 1: Mit Helper-Funktion
const response = await authState.fetchWithAuth(
  'https://streetviewpublish.googleapis.com/v1/photos',
  {
    method: 'POST',
    body: JSON.stringify({ ... })
  }
);

// Methode 2: Token manuell abrufen
const token = await authState.getValidToken();
if (token) {
  const response = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}
```

### 3. Benutzer abmelden

```typescript
authState.signOut();
```

## Street View Publish API Beispiel

Hier ist ein Beispiel, wie du die Street View Publish API verwenden kannst:

```typescript
import { authState } from '$lib/auth-state.svelte';

async function uploadPhotoToStreetView(photoData: Blob) {
	try {
		// Schritt 1: Upload URL anfordern
		const uploadResponse = await authState.fetchWithAuth(
			'https://streetviewpublish.googleapis.com/v1/photo:startUpload',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);

		const { uploadUrl } = await uploadResponse.json();

		// Schritt 2: Foto hochladen
		const photoUploadResponse = await fetch(uploadUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'image/jpeg'
			},
			body: photoData
		});

		const uploadRef = await photoUploadResponse.json();

		// Schritt 3: Foto mit Metadaten erstellen
		const createResponse = await authState.fetchWithAuth(
			'https://streetviewpublish.googleapis.com/v1/photo',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					uploadReference: uploadRef,
					pose: {
						latLngPair: {
							latitude: 37.7749,
							longitude: -122.4194
						},
						heading: 0,
						pitch: 0,
						roll: 0
					},
					captureTime: new Date().toISOString()
				})
			}
		);

		const photo = await createResponse.json();
		console.log('Photo uploaded:', photo);
	} catch (error) {
		console.error('Upload failed:', error);
	}
}
```

## Architektur

### Auth State (`src/lib/auth-state.svelte.ts`)

Svelte 5 Runes-basierter Service, der den gesamten OAuth-Flow verwaltet:

- ✅ **Token Management**: Speichert und validiert Access Tokens
- ✅ **User Management**: Lädt und cached Benutzerinformationen
- ✅ **Local Storage**: Persistiert Auth-Daten zwischen Sessions
- ✅ **Auto-Refresh**: Prüft Token-Ablauf und fordert Neuanmeldung an
- ✅ **Helper-Methoden**: `fetchWithAuth()` für einfache API-Aufrufe

### Sicherheit

- ✅ **PKCE-Ready**: Google Identity Services verwendet moderne OAuth 2.0 Best Practices
- ✅ **Token Storage**: Tokens werden im localStorage gespeichert (für SPAs geeignet)
- ✅ **State Validation**: Schutz gegen CSRF-Angriffe
- ✅ **Token Revocation**: Ordnungsgemäßes Widerrufen beim Sign Out

## Unterschiede zum alten Implicit Flow

| Feature        | Implicit Flow (alt)  | Authorization Code Flow (neu) |
| -------------- | -------------------- | ----------------------------- |
| Sicherheit     | ❌ Weniger sicher    | ✅ Sicherer mit PKCE          |
| Token im URL   | ❌ Ja (Fragment)     | ✅ Nein                       |
| Refresh Tokens | ❌ Nicht unterstützt | ✅ Unterstützt (optional)     |
| Empfohlen      | ❌ Veraltet          | ✅ Best Practice              |
| Bibliothek     | Vanilla JS           | Google Identity Services      |

## Weitere Ressourcen

- [Google Identity Services Dokumentation](https://developers.google.com/identity/gsi/web)
- [Street View Publish API Guide](https://developers.google.com/streetview/publish/first-app)
- [OAuth 2.0 Best Practices](https://oauth.net/2.1/)

## Troubleshooting

### "Token client not initialized"

- Stelle sicher, dass das Google Identity Services Script geladen ist
- Prüfe, ob `authState.initializeGIS()` aufgerufen wurde

### "redirect_uri_mismatch"

- Überprüfe, ob deine Redirect URI in der Google Cloud Console korrekt konfiguriert ist
- Die URI muss exakt übereinstimmen (inkl. Port für localhost)

### Token läuft zu schnell ab

- Access Tokens sind nur 1 Stunde gültig
- Implementiere Token Refresh oder fordere Benutzer zur Neuanmeldung auf
- Verwende `authState.getValidToken()` um automatisch abgelaufene Tokens zu erkennen
