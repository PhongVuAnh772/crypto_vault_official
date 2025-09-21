export const AUTH0_PERMISSIONS = [
    'openid',
    'profile',
    'email',
    'offline_access',
    'read:points',
    'delete:current-user',
];

export const AUTH0_CONFIG = {
    PROMPT: 'login consent',
    CODE_CHALLENGE_METHOD: 'S256',
    RESPONSE_TYPE: 'code',
};
