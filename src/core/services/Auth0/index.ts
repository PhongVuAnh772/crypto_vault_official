import Auth0 from "react-native-auth0";
import EnvConfig from "src/core/constants/EnvConfig";
import { Auth0AuthService } from "./auth/auth";
import { Auth0UserService } from "./user/user";
import { getCallbackURL } from "./Utils";

/**
 * Comprehensive Auth0 Service that combines authentication and user operations
 */
class Auth0Service {
  private readonly auth0: Auth0;
  private readonly callBackURL: string;
  // Specialized service instances
  public auth: Auth0AuthService;
  public user: Auth0UserService;

  constructor() {
    const domain = EnvConfig?.AUTH0_DOMAIN || "";
    const clientId = EnvConfig?.AUTH0_CLIENT_ID || "";

    this.auth0 = new Auth0({
      domain: "dev-eeczycwj8h12hym0.us.auth0.com",
      clientId: "MrGxZnr0DlrGepzy5MKOQNG1ePvzIhCT",
    });

    this.callBackURL = getCallbackURL();

    // Initialize specialized services
    this.auth = new Auth0AuthService(this.auth0, this.callBackURL);
    this.user = new Auth0UserService(this.auth0);
  }
}

export default Auth0Service;
