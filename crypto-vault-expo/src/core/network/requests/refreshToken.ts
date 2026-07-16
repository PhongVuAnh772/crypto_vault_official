import {refreshTokenResponse} from 'src/core/network/apiResponses/IRefreshToken';
import axios from 'axios';

type RefreshTokenType = {
    refresh_token: string;
};

async function callRefreshToken({refresh_token}: RefreshTokenType) {
    const resultRefresh = await axios.post<refreshTokenResponse>(
        '/auth/refresh-token',
        {
            refresh_token: refresh_token,
        },
    );
    return resultRefresh;
}
export default callRefreshToken;
