class PasswordlessStrategy {
  constructor(authManager, userService, emailService) {
    this.authManager = authManager;
    this.userService = userService;
    this.emailService = emailService;
  }

  async sendMagicLink(email, redirectUrl = null) {
    if (!this.authManager.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Check if user exists
    let user = await this.userService.findByEmail(email);

    // If user doesn't exist, create a temporary one
    if (!user) {
      user = await this.userService.create({
        email,
        authProvider: 'MAGIC_LINK',
        isActive: true,
        emailVerified: false
      });
    }

    // Generate magic link
    const magicLink = this.authManager.generateMagicToken(email, redirectUrl);

    // Save OTP record (using magic token)
    await this.userService.createOTP({
      userId: user.id,
      identifier: email,
      code: magicLink.token,
      type: 'LOGIN',
      expiresAt: magicLink.expiresAt,
      metadata: { redirectUrl }
    });

    // Send email with magic link
    await this.emailService.sendMagicLink(email, magicLink.url);

    return {
      success: true,
      message: 'Magic link sent to your email',
      // Don't expose the URL in production, this is just for testing
      link: process.env.NODE_ENV === 'development' ? magicLink.url : undefined
    };
  }

  async verifyMagicLink(token) {
    try {
      const decoded = this.authManager.verifyMagicToken(token);
      const { email } = decoded;

      const user = await this.userService.findByEmail(email);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify OTP
      const otp = await this.userService.verifyOTP(email, token, 'LOGIN');
      
      if (!otp) {
        throw new Error('Invalid or expired magic link');
      }

      // Update user email verification status
      await this.userService.update(user.id, {
        emailVerified: true,
        lastLogin: new Date()
      });

      // Generate JWT token
      const jwtToken = this.authManager.generateToken(user);

      // Create session
      await this.userService.createSession(user.id, {
        token: jwtToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      return {
        token: jwtToken,
        user: this.sanitizeUser(user),
        redirectUrl: otp.metadata?.redirectUrl || null
      };
    } catch (error) {
      throw new Error('Invalid magic link');
    }
  }

  sanitizeUser(user) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

module.exports = PasswordlessStrategy;