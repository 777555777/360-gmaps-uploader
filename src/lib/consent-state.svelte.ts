const GOOGLE_GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

class ConsentState {
	private consentGiven: boolean | null = $state(null);
	private _googleScriptLoaded = $state(false);
	private _googleScriptLoading = false;

	constructor() {
		if (typeof window !== 'undefined') {
			this.loadConsentFromStorage();
		}
	}

	setConsent(consent: boolean) {
		this.consentGiven = consent;
		if (typeof window !== 'undefined') {
			localStorage.setItem('userConsent', JSON.stringify(consent));
		}
		// Load Google script when consent is given
		if (consent) {
			this.loadGoogleScript();
		}
	}

	hasConsented(): boolean | null {
		return this.consentGiven;
	}

	get googleScriptLoaded(): boolean {
		return this._googleScriptLoaded;
	}

	loadConsentFromStorage() {
		if (typeof window !== 'undefined') {
			const storedConsent = localStorage.getItem('userConsent');
			if (storedConsent !== null) {
				this.consentGiven = JSON.parse(storedConsent);
				// Load Google script if consent was previously given
				if (this.consentGiven === true) {
					this.loadGoogleScript();
				}
			}
		}
	}

	/**
	 * Dynamically load Google Identity Services script
	 * Only called when user has given consent
	 */
	loadGoogleScript(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (typeof window === 'undefined') {
				reject(new Error('Cannot load script on server'));
				return;
			}

			// Already loaded
			if (this._googleScriptLoaded || typeof google !== 'undefined') {
				this._googleScriptLoaded = true;
				resolve();
				return;
			}

			// Already loading
			if (this._googleScriptLoading) {
				// Wait for existing load
				const checkLoaded = setInterval(() => {
					if (this._googleScriptLoaded) {
						clearInterval(checkLoaded);
						resolve();
					}
				}, 50);
				return;
			}

			this._googleScriptLoading = true;

			const script = document.createElement('script');
			script.src = GOOGLE_GIS_SCRIPT_URL;
			script.async = true;
			script.defer = true;

			script.onload = () => {
				this._googleScriptLoaded = true;
				this._googleScriptLoading = false;
				resolve();
			};

			script.onerror = () => {
				this._googleScriptLoading = false;
				reject(new Error('Failed to load Google Identity Services script'));
			};

			document.head.appendChild(script);
		});
	}
}

export const consentState = new ConsentState();
