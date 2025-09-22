import Auth0, { Credentials } from 'react-native-auth0';
import appErrorMessage from 'src/core/constants/AppErrorMessage';
import EnvConfig from 'src/core/constants/EnvConfig';
import Utils from 'src/core/utils/commonUtils';
import { AUTH0_CONFIG, AUTH0_PERMISSIONS } from '../constants';
import { AuthorizeResponse } from '../types';
import {
    ExchangeParams,
    IAuth0AuthService,
    RefreshTokenParams,
} from '../types/auth';
import { generatePKCEValues, generateSecureCode } from '../Utils';

/**
 * Handles Auth0 authentication-related operations
 *
 * @class Auth0AuthService
 * @implements {IAuth0AuthService}
 * @description Manages authentication flows using Auth0 with PKCE (Proof Key for Code Exchange)
 */
export class Auth0AuthService implements IAuth0AuthService {
    private auth0: Auth0;
    private callBackURL: string;
    private verifier?: string;

    /**
     * Creates an instance of Auth0AuthService
     *
     * @constructor
     * @param {Auth0} auth0 - The Auth0 client instance
     * @param {string} callBackURL - The redirect URI registered in Auth0 application settings
     */
    constructor(auth0: Auth0, callBackURL: string) {
        this.auth0 = auth0;
        this.callBackURL = callBackURL;
    }

    /**
     * Generates the authorization URL for the Auth0 login process
     *
     * @async
     * @method authorizeUrl
     * @returns {Promise<AuthorizeResponse>} An object containing the authorization URL and state code
     * @throws {Error} Throws an error if URL generation fails
     *
     * @description
     * - Generates a secure state code for CSRF protection
     * - Creates PKCE challenge and verifier
     * - Constructs an authorization URL with necessary parameters
     *
     * @example
     * const {url, stateCode} = await auth0Service.authorizeUrl();
     * // Redirect user to 'url' for authentication
     */
    async authorizeUrl(): Promise<AuthorizeResponse> {
        try {
            // Use Promise.all for concurrent execution
            const [stateCode, { verifier, challenge }] = await Promise.all([
                generateSecureCode(),
                generatePKCEValues(),
            ]);

            // Store verifier for later use
            this.verifier = verifier;

            const resultUrl = this.auth0.auth.authorizeUrl({
                codeChallenge: challenge,
                codeChallengeMethod: AUTH0_CONFIG.CODE_CHALLENGE_METHOD,
                redirectUri: this.callBackURL,
                responseType: AUTH0_CONFIG.RESPONSE_TYPE,
                state: stateCode,
                prompt: AUTH0_CONFIG.PROMPT,
                scope: AUTH0_PERMISSIONS.join(' '),
                audience: EnvConfig.AUTH0_AUDIENCE,
            });

            return { url: resultUrl, stateCode };
        } catch (error) {
            console.error('Auth0 authorizeUrl error:', error);
            throw error;
        }
    }

    /**
     * Exchanges the authorization code for user credentials
     *
     * @async
     * @method exchange
     * @param {ExchangeParams} params - Parameters for token exchange
     * @param {string} params.authorizationCode - The authorization code received from Auth0
     * @returns {Promise<Credentials>} User authentication credentials
     * @throws {Error} Throws an error if:
     * - PKCE verifier is not available
     * - Token exchange fails
     *
     * @description
     * Completes the OAuth 2.0 authorization code flow by exchanging
     * the authorization code for access and ID tokens
     *
     * @example
     * const credentials = await auth0Service.exchange({
     *   authorizationCode: 'received_code_from_auth0'
     * });
     */
    async exchange({
        authorizationCode,
    }: ExchangeParams): Promise<Credentials> {
        if (!this.verifier) {
            throw new Error(appErrorMessage.couldNotGetVerifier);
        }

        try {
            const credentials = await this.auth0.auth.exchange({
                code: authorizationCode,
                verifier: this.verifier,
                redirectUri: this.callBackURL,
            });
            return credentials;
        } catch (error) {
            console.error('Auth0 exchange error:', error);
            throw error;
        }
    }

    /**
     * Refreshes an expired authentication token
     *
     * @async
     * @method refreshToken
     * @param {RefreshTokenParams} params - Parameters for token refresh
     * @param {string} params.refreshToken - The refresh token to obtain new credentials
     * @returns {Promise<Credentials>} New authentication credentials
     * @throws {Error} Throws an error if token refresh fails
     *
     * @description
     * Obtains a new set of tokens using the provided refresh token
     *
     * @example
     * const newCredentials = await auth0Service.refreshToken({
     *   refreshToken: 'stored_refresh_token'
     * });
     */
    async refreshToken({
        refreshToken,
    }: RefreshTokenParams): Promise<Credentials> {
        try {
            console.log('🚀 ~ refreshToken ~ called');
            const credentials = await this.auth0.auth.refreshToken({
                refreshToken: refreshToken,
                scope: AUTH0_PERMISSIONS.join(' '),
            });
            await this.saveCredentials(credentials);
            return credentials;
        } catch (error) {
            console.error('Auth0 refreshToken error:', error);
            throw error;
        }
    }

    /**
     * Saves the user's credentials
     * @param {Credentials} credentials - The user's credentials to save
     * @returns {Promise<void>} A promise that resolves when the credentials are saved
     */
    async saveCredentials(credentials: Credentials): Promise<void> {
        return await this.auth0.credentialsManager.saveCredentials(credentials);
    }

    /**
     * Retrieves the user's credentials
     * @returns {Promise<Credentials>} A promise that resolves to the user's credentials
     */
    async getCredentials(): Promise<Credentials> {
        const credentials =
            await this.auth0.credentialsManager.getCredentials();

        const isExpired = Utils.isExpired(credentials.expiresAt);
        if (isExpired) {
            return await this.refreshToken({
                refreshToken: credentials.refreshToken || '',
            });
        }
        return credentials;
    }

    /**
     * Clears the user's credentials
     * @returns {Promise<void>} A promise that resolves when the credentials are cleared
     */
    async clearCredentials(): Promise<void> {
        return await this.auth0.credentialsManager.clearCredentials();
    }
}
