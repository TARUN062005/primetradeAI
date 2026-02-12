const axios = require("axios");
const qs = require("qs");

class OAuthStrategy {
  constructor(provider, config) {
    this.provider = provider;
    this.config = config;
  }

  async getProfileFromCode(code) {
    if (!code) throw new Error("Missing OAuth code");

    let accessToken;

    switch (this.provider) {
      case "google":
        accessToken = await this.exchangeGoogleCode(code);
        break;
      case "github":
        accessToken = await this.exchangeGitHubCode(code);
        break;
      default:
        throw new Error(`Code exchange not implemented for: ${this.provider}`);
    }

    return await this.authenticate(accessToken);
  }

  // ✅ GOOGLE TOKEN EXCHANGE (FORM URLENCODED)
  async exchangeGoogleCode(code) {
    try {
      const response = await axios.post(
        "https://oauth2.googleapis.com/token",
        qs.stringify({
          code,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.callbackUrl,
          grant_type: "authorization_code",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!response?.data?.access_token) {
        throw new Error("Missing access token in Google response");
      }

      return response.data.access_token;
    } catch (error) {
      console.error("Google Token Exchange Error:", {
        data: error.response?.data,
        message: error.message,
        redirect_uri: this.config.callbackUrl,
      });

      throw new Error("Failed to exchange Google authorization code");
    }
  }

  async exchangeGitHubCode(code) {
    try {
      const response = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.callbackUrl,
        },
        {
          headers: { Accept: "application/json" },
        }
      );

      if (!response?.data?.access_token) {
        throw new Error("Missing access token in GitHub response");
      }

      return response.data.access_token;
    } catch (error) {
      console.error("GitHub Token Exchange Error:", error.response?.data || error.message);
      throw new Error("Failed to exchange GitHub authorization code");
    }
  }

  async authenticate(accessToken) {
    if (!accessToken) throw new Error("Missing access token");

    switch (this.provider) {
      case "google":
        return await this.getGoogleProfile(accessToken);
      case "github":
        return await this.getGitHubProfile(accessToken);
      case "facebook":
        return await this.getFacebookProfile(accessToken);
      default:
        throw new Error(`Unsupported OAuth provider: ${this.provider}`);
    }
  }

  async getGoogleProfile(accessToken) {
    try {
      const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return {
        id: response.data.sub,
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture,
        email_verified: response.data.email_verified,
      };
    } catch {
      throw new Error("Failed to fetch Google profile");
    }
  }

  async getGitHubProfile(accessToken) {
    try {
      const response = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `token ${accessToken}` },
      });

      let email = response.data.email;

      if (!email) {
        const emailsResponse = await axios.get("https://api.github.com/user/emails", {
          headers: { Authorization: `token ${accessToken}` },
        });
        const primaryEmail = emailsResponse.data.find((e) => e.primary);
        email = primaryEmail ? primaryEmail.email : null;
      }

      return {
        id: response.data.id.toString(),
        email,
        name: response.data.name || response.data.login,
        picture: response.data.avatar_url,
        email_verified: !!email,
      };
    } catch {
      throw new Error("Failed to fetch GitHub profile");
    }
  }

  async getFacebookProfile(accessToken) {
    try {
      const response = await axios.get("https://graph.facebook.com/me", {
        params: {
          access_token: accessToken,
          fields: "id,name,email,picture",
        },
      });

      return {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture?.data?.url,
        email_verified: !!response.data.email,
      };
    } catch {
      throw new Error("Failed to fetch Facebook profile");
    }
  }
}

module.exports = OAuthStrategy;
