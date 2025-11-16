/**
 * TypeScript definitions for Google Identity Services
 * https://developers.google.com/identity/gsi/web/reference/js-reference
 */

declare namespace google {
	namespace accounts {
		namespace oauth2 {
			interface TokenClient {
				requestAccessToken(options?: { prompt?: 'consent' | 'select_account' | 'none' }): void;
			}

			interface TokenResponse {
				access_token: string;
				expires_in: number;
				scope: string;
				token_type: string;
				error?: string;
				error_description?: string;
			}

			interface ErrorResponse {
				type: string;
				message: string;
			}

			interface TokenClientConfig {
				client_id: string;
				scope: string;
				callback: (response: TokenResponse) => void;
				error_callback?: (error: ErrorResponse) => void;
				prompt?: 'consent' | 'select_account' | 'none';
			}

			function initTokenClient(config: TokenClientConfig): TokenClient;
			function revoke(token: string, callback?: () => void): void;
		}
	}
}
