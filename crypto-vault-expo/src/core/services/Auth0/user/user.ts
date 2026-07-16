import Auth0, { User, UserInfoOptions } from 'react-native-auth0';

/**
 * Handles user-related operations for Auth0
 */
export class Auth0UserService {
    private readonly auth0: Auth0;
    constructor(auth0: Auth0) {
        this.auth0 = auth0;
    }

    /**
     * Retrieves user information from Auth0.
     *
     * @param {UserInfoOptions} params - The options to retrieve user information.
     * @returns {Promise<User>} A promise that resolves to the user information.
     * @throws Will throw an error if the request fails.
     */
    async getUserInfo(params: UserInfoOptions): Promise<User> {
        try {
            const userInfo = await this.auth0.auth.userInfo(params);
            return userInfo;
        } catch (error) {
            console.log('🚀 ~ Auth0UserService ~ getUserInfo ~ error:', error);
            throw error;
        }
    }
}
