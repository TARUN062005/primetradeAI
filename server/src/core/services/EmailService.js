const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

class EmailService {
  constructor() {
    const isProduction = process.env.NODE_ENV === "production";

    this.appName = process.env.APP_NAME || "AuthSystem";
    this.templatesPath = path.join(__dirname, "../../../templates/emails");

    // ✅ Create transporter once
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        // ✅ in production: true -> reject unauthorized
        // ✅ in dev: false -> allow self-signed (avoid smtp debug pain)
        rejectUnauthorized: isProduction,
      },
    });

    // Ensure template directory & templates
    this.initTemplates();

    // Optional quick SMTP verification
    if (!isProduction) {
      this.verifyConnection().catch(() => {});
    }
  }

  // ---------------------------------------------------------
  // ✅ Transporter helper (fixes your crash)
  // ---------------------------------------------------------
  getTransporter() {
    if (!this.transporter) {
      throw new Error("Email transporter not initialized");
    }
    return this.transporter;
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("✅ SMTP transporter verified successfully");
    } catch (err) {
      console.error("❌ SMTP verify failed:", err.message);
    }
  }

  // ---------------------------------------------------------
  // URL helpers
  // ---------------------------------------------------------
  getPrimaryClientUrl() {
    if (process.env.CLIENT_URL) {
      const urls = process.env.CLIENT_URL.split(",").map((u) => u.trim());
      return urls[0];
    }
    return process.env.CLIENT_USER
      ? `http://localhost:${process.env.CLIENT_USER}`
      : "http://localhost:5173";
  }

  getFromAddress() {
    return `"${this.appName}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`;
  }

  // ---------------------------------------------------------
  // Templates
  // ---------------------------------------------------------
  initTemplates() {
    const required = [
      "welcome",
      "otp",
      "magic-link",
      "password-reset",
      "account-locked",
      "verification-email",
    ];

    required.forEach((t) => this.ensureTemplateExists(t));
  }

  ensureTemplateExists(templateName) {
    const templatePath = path.join(this.templatesPath, `${templateName}.ejs`);

    if (!fs.existsSync(this.templatesPath)) {
      fs.mkdirSync(this.templatesPath, { recursive: true });
    }

    if (!fs.existsSync(templatePath)) {
      console.warn(`⚠️ Template ${templateName} missing. Generating default...`);
      this.generateDefaultTemplate(templateName, templatePath);
    }
  }

  generateDefaultTemplate(templateName, templatePath) {
    let content = "";

    switch (templateName) {
      case "verification-email":
        content = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Verify Your Email</title></head>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>Verify Your Email Address</h2>
  <p>Hi <%= name %>,</p>
  <p>Please verify your email address by clicking the link below:</p>
  <p><a href="<%= verificationUrl %>" style="background:#667eea;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;">
    Verify Email
  </a></p>
  <p>Or copy this link:<br/>
    <code style="background:#f1f5f9;padding:5px;border-radius:3px;"><%= verificationUrl %></code>
  </p>
  <p>This link expires in 15 minutes.</p>
  <p>If you didn't create this account, you can ignore this email.</p>
  <p style="margin-top:30px;color:#718096;font-size:14px;">
    © <%= year %> <%= appName %>
  </p>
</body>
</html>
`;
        break;

      default:
        content = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title><%= appName %></title></head>
<body style="font-family:sans-serif;padding:20px;">
  <h2><%= appName %></h2>
  <p>Auto-generated template: <b>${templateName}</b></p>
</body>
</html>
`;
    }

    fs.writeFileSync(templatePath, content);
  }

  async sendTemplate(templateName, data, options) {
    const templatePath = path.join(this.templatesPath, `${templateName}.ejs`);

    const templateData = {
      ...data,
      appName: this.appName,
      year: new Date().getFullYear(),
      clientUrl: this.getPrimaryClientUrl(),
    };

    let renderedHtml;

    try {
      const templateStr = fs.readFileSync(templatePath, "utf-8");
      renderedHtml = ejs.render(templateStr, templateData);
    } catch (err) {
      console.error(`❌ EJS Render Error (${templateName}):`, err.message);
      renderedHtml = `<p>Notification from ${this.appName}</p>`;
    }

    return await this.sendHtmlEmail(
      options.to,
      options.subject || `${this.appName} Update`,
      renderedHtml,
      options.text || renderedHtml.replace(/<[^>]*>/g, "")
    );
  }

  // ---------------------------------------------------------
  // ✅ Main email senders
  // ---------------------------------------------------------
  async sendHtmlEmail(to, subject, htmlContent, textFallback = "") {
    const transporter = this.getTransporter();

    const mailOptions = {
      from: this.getFromAddress(),
      to,
      subject,
      html: htmlContent,
      text: textFallback || "Please view this email in HTML mode.",
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`📧 HTML Email Sent -> ${to} (${info.messageId})`);
      return info;
    } catch (error) {
      console.error("❌ Failed to send HTML email:", error.message);
      throw error;
    }
  }

  async sendGenericEmail(email, subject, message) {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>${subject}</h2>
  <div style="white-space: pre-line;">${message}</div>
  <p style="margin-top: 30px; color: #718096; font-size: 14px;">
    © ${new Date().getFullYear()} ${this.appName}
  </p>
</body>
</html>`;

    return await this.sendHtmlEmail(email, subject, html, message);
  }

  // ---------------------------------------------------------
  // Wrapper methods (your existing API)
  // ---------------------------------------------------------
  async sendWelcome(email, name) {
    return await this.sendTemplate(
      "welcome",
      {
        name: name || "User",
        loginUrl: `${this.getPrimaryClientUrl()}/login`,
      },
      {
        to: email,
        subject: `Welcome to ${this.appName}!`,
      }
    );
  }

  async sendMagicLink(email, magicLink) {
    return await this.sendTemplate(
      "magic-link",
      { magicLink },
      {
        to: email,
        subject: `Your ${this.appName} Login Link`,
      }
    );
  }

  async sendOTP(email, otp, type = "verification") {
    return await this.sendTemplate(
      "otp",
      {
        otp,
        type: type.toUpperCase(),
        expiresIn: "15 minutes",
      },
      {
        to: email,
        subject: `Your ${this.appName} ${type.toUpperCase()} Code`,
      }
    );
  }

  async sendPasswordReset(email, resetLink) {
    return await this.sendTemplate(
      "password-reset",
      { resetLink, expiresIn: "1 hour" },
      {
        to: email,
        subject: `Reset your ${this.appName} password`,
      }
    );
  }

  async sendAccountLocked(email, unlockTime) {
    return await this.sendTemplate(
      "account-locked",
      {
        unlockTime: new Date(unlockTime).toLocaleString(),
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
      },
      {
        to: email,
        subject: `Security Alert: Account Locked`,
      }
    );
  }

  async sendVerificationEmail(email, verificationUrl, name) {
    return await this.sendTemplate(
      "verification-email",
      {
        name: name || "User",
        verificationUrl,
        expiryTime: new Date(Date.now() + 15 * 60 * 1000).toLocaleString(),
      },
      {
        to: email,
        subject: `Verify Your Email - ${this.appName}`,
      }
    );
  }
}

module.exports = EmailService;
