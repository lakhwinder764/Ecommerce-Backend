import { Injectable, Logger } from '@nestjs/common';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private smtpConfigured = false;
  private fromEmail = 'noreply@example.com';

  constructor() {
    const user = (process.env.SMTP_USER || '').trim().replace(/^['"]|['"]$/g, '');
    const pass = (process.env.SMTP_PASS || '').trim().replace(/^['"]|['"]$/g, '');
    const host = (process.env.SMTP_HOST || '').trim();
    const isPlaceholder =
      !user ||
      !pass ||
      user.includes('your-') ||
      pass.includes('your-');

    if (!isPlaceholder) {
      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const isGmail = host.includes('gmail.com');

      if (isGmail) {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: { user, pass },
          requireTLS: true,
          tls: { rejectUnauthorized: false },
        });
      } else {
        this.transporter = nodemailer.createTransport({
          host: host || 'smtp.ethereal.email',
          port,
          secure: port === 465,
          auth: { user, pass },
        });
      }
      this.smtpConfigured = true;
      this.fromEmail = user;
      this.logger.log(`SMTP configured (${isGmail ? 'Gmail' : host})`);
    } else {
      this.logger.log('SMTP not configured - emails will be saved to ./emails/');
    }
  }

  private saveEmailToFile(html: string, to: string): string {
    const emailsDir = join(process.cwd(), 'emails');
    if (!existsSync(emailsDir)) mkdirSync(emailsDir, { recursive: true });

    const filePath = join(emailsDir, 'latest-reset.html');
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Password Reset</title></head><body>${html}</body></html>`;
    writeFileSync(filePath, fullHtml, 'utf-8');
    return filePath;
  }

  async sendPasswordResetEmail(
    to: string,
    userName: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const appName = process.env.APP_NAME || 'Ecommerce';
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@example.com';

    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const html = `
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password for your ${appName} account.</p>
      <p>To reset your password, please click the link below:</p>
      <p><a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Reset My Password</a></p>
      <p>Or copy this link: ${resetLink}</p>
      <p>This link will expire in 5 minutes for security reasons.</p>
      <p>If you didn't request a password reset, you can safely ignore this email—your password will remain unchanged.</p>
      <p>Need help or have questions? Contact our support team at ${supportEmail}.</p>
      <p>Stay secure,<br>The ${appName} Team</p>
    `;

    if (this.smtpConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"${appName}" <${this.fromEmail}>`,
          to,
          subject: `Reset Password on ${appName}!`,
          html,
        });
        this.logger.log(`Password reset email sent to ${to}`);
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`SMTP send failed: ${msg}`);
        this.logger.warn('Falling back to file. Check: 1) App password is correct 2) 2-Step Verification is on 3) No firewall blocking port 587');
      }
    }

    const filePath = this.saveEmailToFile(html, to);
    this.logger.log(
      `[DEV] Password reset saved. Open this file in your browser: ${filePath}`,
    );
  }
}
