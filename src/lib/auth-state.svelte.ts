/**
 * Google OAuth 2.0 Authentication State with Google Identity Services (GIS)
 *
 * Uses the Authorization Code Flow instead of the deprecated Implicit Flow.
 * For Street View Publish API: https://developers.google.com/streetview/publish/first-app
 */

interface GoogleUser {
	email: string;
	name: string;
	picture: string;
	sub: string; // Google User ID
}

interface TokenResponse {
	access_token: string;
	expires_in: number;
	scope: string;
	token_type: string;
}

class AuthState {
	private _user = $state<GoogleUser | null>(null);
	private _accessToken = $state<string | null>(null);
	private _tokenExpiry = $state<number | null>(null);
	private _isLoading = $state<boolean>(false);
	private _error = $state<string | null>(null);

	// Google Identity Services Client
	private tokenClient: google.accounts.oauth2.TokenClient | null = null;

	constructor() {
		// Load saved token on initialization
		if (typeof window !== 'undefined') {
			this.loadFromStorage();
		}
	}

	get user() {
		return this._user;
	}

	get accessToken() {
		return this._accessToken;
	}

	get isAuthenticated() {
		return this._user !== null && this._accessToken !== null && !this.isTokenExpired();
	}

	get isLoading() {
		return this._isLoading;
	}

	get error() {
		return this._error;
	}

	/**
	 * Initialize Google Identity Services Token Client
	 */
	initializeGIS(clientId: string, scopes: string[]) {
		if (typeof google === 'undefined' || !google.accounts) {
			console.error('Google Identity Services not loaded');
			return;
		}

		this.tokenClient = google.accounts.oauth2.initTokenClient({
			client_id: clientId,
			scope: scopes.join(' '),
			callback: (response: TokenResponse) => {
				if (response.access_token) {
					this._accessToken = response.access_token;
					this._tokenExpiry = Date.now() + response.expires_in * 1000;
					this._error = null;

					// Save first, then load user info
					this.saveToStorage();
					this.fetchUserInfo();
				} else {
					// Can happen if user denies consent
					console.warn('No access token received');
					this._error = 'Authentication was cancelled or failed';
					this._isLoading = false;
				}
			},
			error_callback: (error) => {
				console.error('OAuth Error:', error);
				this._error = error.message || 'Authentication failed';
				this._isLoading = false;
			}
		});
	}

	/**
	 * Start OAuth 2.0 Flow
	 */
	async signIn() {
		if (!this.tokenClient) {
			this._error = 'Token client not initialized. Call initializeGIS first.';
			return;
		}

		this._isLoading = true;
		this._error = null;

		try {
			// Request access token
			// 'consent' prompt always shows the consent screen (good for testing)
			// For production, you can use '' for better UX
			this.tokenClient.requestAccessToken({ prompt: 'consent' });
		} catch (error) {
			console.error('Sign in error:', error);
			this._error = 'Failed to initiate sign in';
			this._isLoading = false;
		}
	}

	/**
	 * Fetch user info from Google API
	 */
	private async fetchUserInfo() {
		if (!this._accessToken) return;

		try {
			const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
				headers: {
					Authorization: `Bearer ${this._accessToken}`
				}
			});

			if (response.ok) {
				const userData = await response.json();
				this._user = {
					email: userData.email,
					name: userData.name,
					picture: userData.picture,
					sub: userData.id
				};
				this.saveToStorage();
			} else {
				throw new Error('Failed to fetch user info');
			}
		} catch (error) {
			console.error('Error fetching user info:', error);
			this._error = 'Failed to fetch user information';
		} finally {
			this._isLoading = false;
		}
	}

	/**
	 * Sign out and clear all auth data
	 */
	signOut() {
		if (this._accessToken && typeof google !== 'undefined' && google.accounts?.oauth2) {
			google.accounts.oauth2.revoke(this._accessToken, () => {
				console.log('Token revoked successfully');
			});
		}

		this._user = null;
		this._accessToken = null;
		this._tokenExpiry = null;
		this._error = null;
		this.clearStorage();
	}

	/**
	 * Check if token is expired
	 */
	private isTokenExpired(): boolean {
		if (!this._tokenExpiry) return true;
		return Date.now() >= this._tokenExpiry;
	}

	/**
	 * Get valid access token (refresh if needed)
	 */
	async getValidToken(): Promise<string | null> {
		if (!this._accessToken) return null;

		if (this.isTokenExpired()) {
			// Token expired, need to re-authenticate
			this.signOut();
			return null;
		}

		return this._accessToken;
	}

	/**
	 * Make authenticated API request
	 */
	async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
		const token = await this.getValidToken();

		if (!token) {
			throw new Error('Not authenticated');
		}

		const headers = new Headers(options.headers);
		headers.set('Authorization', `Bearer ${token}`);

		return fetch(url, {
			...options,
			headers
		});
	}

	/**
	 * Save auth data to localStorage
	 */
	private saveToStorage() {
		if (typeof window === 'undefined') return;

		try {
			localStorage.setItem('auth_user', JSON.stringify(this._user));
			localStorage.setItem('auth_token', this._accessToken || '');
			localStorage.setItem('auth_expiry', String(this._tokenExpiry || ''));
		} catch (error) {
			console.error('Failed to save auth data:', error);
		}
	}

	/**
	 * Load auth data from localStorage
	 */
	private loadFromStorage() {
		if (typeof window === 'undefined') return;

		try {
			const user = localStorage.getItem('auth_user');
			const token = localStorage.getItem('auth_token');
			const expiry = localStorage.getItem('auth_expiry');

			// Only load if all data is present
			if (user && token && expiry) {
				this._user = JSON.parse(user);
				this._accessToken = token;
				this._tokenExpiry = Number(expiry);

				// Check if token is expired
				if (this.isTokenExpired()) {
					console.log('Stored token expired, clearing auth data');
					this.clearStorage();
					this._user = null;
					this._accessToken = null;
					this._tokenExpiry = null;
				}
			}
		} catch (error) {
			console.error('Failed to load auth data:', error);
			this.clearStorage();
		}
	}

	/**
	 * Clear localStorage
	 */
	private clearStorage() {
		if (typeof window === 'undefined') return;

		localStorage.removeItem('auth_user');
		localStorage.removeItem('auth_token');
		localStorage.removeItem('auth_expiry');
	}
}

// Export singleton instance
export const authState = new AuthState();
