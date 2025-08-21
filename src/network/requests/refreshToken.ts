import axios from "axios";
import { refreshTokenResponse } from "../apiResponses/IRefreshToken";

type RefreshTokenType = {
  refresh_token: string;
};

async function callRefreshToken({ refresh_token }: RefreshTokenType) {
  const resultRefresh = await axios.post<refreshTokenResponse>(
    "/auth/refresh-token",
    {
      refresh_token: refresh_token,
    }
  );
  return resultRefresh;
}
export default callRefreshToken;
