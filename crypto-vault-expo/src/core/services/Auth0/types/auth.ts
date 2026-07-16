import Auth0, {Credentials} from 'react-native-auth0';
import {AuthorizeResponse} from '.';

export interface ExchangeParams {
    authorizationCode: string;
}

export interface RefreshTokenParams {
    refreshToken: string;
}

export interface IAuth0AuthService {
    /**
     * Generates the authorization URL for Auth0 login
     * @returns Promise resolving to authorization URL and state code
     */
    authorizeUrl(): Promise<AuthorizeResponse>;

    /**
     * Exchanges authorization code for credentials
     * @param params - The authorization code received from Auth0
     * @returns Promise resolving to user credentials
     */
    exchange(params: ExchangeParams): Promise<Credentials>;

    /**
     * Refreshes an expired authentication token
     * @param params - The refresh token to use for obtaining new credentials
     * @returns Promise resolving to new credentials
     */
    refreshToken(params: RefreshTokenParams): Promise<Credentials>;

    /**
     * Get the current user's credentials
     * @returns Promise resolving to user credentials
     */
    getCredentials(): Promise<Credentials>;
}

// Optional: Create a constructor interface if needed
export interface IAuth0AuthServiceConstructor {
    new (auth0: Auth0, callBackURL: string): IAuth0AuthService;
}
