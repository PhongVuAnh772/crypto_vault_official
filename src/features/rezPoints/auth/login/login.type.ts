export type LoginResult = {
    error: string;
    type: string;
    url: string;
};
export enum LoginError {
    ACCESS_DENIED = 'access_denied',
    INVALID_REQUEST = 'invalid_request',
}
