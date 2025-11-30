import nodemailer from 'nodemailer';

// Email configuration - can be customized via environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    } : undefined,
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@ridenbite.com',
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });
        console.log(`Email sent to ${options.to}`);
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}

// Email templates
export const emailTemplates = {
    verification: (name: string, token: string) => {
        const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${token}`;
        return {
            subject: 'Verify your RideN\'Bite account',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #EA580C;">Welcome to RideN'Bite!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" 
               style="background: linear-gradient(to right, #F97316, #DC2626); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 8px;
                      display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verifyUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #888; font-size: 12px;">
            RideN'Bite - The fastest way to your next bite
          </p>
        </div>
      `,
            text: `Welcome to RideN'Bite! Please verify your email by visiting: ${verifyUrl}`,
        };
    },

    restaurantPending: (name: string, businessName: string) => ({
        subject: 'Your restaurant application is under review',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EA580C;">Thank You for Applying!</h1>
        <p>Hi ${name},</p>
        <p>We've received your application to list <strong>${businessName}</strong> on RideN'Bite.</p>
        <div style="background: #FFF7ED; border-left: 4px solid #F97316; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #EA580C;">What's Next?</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Our team will review your documents within 24-48 hours</li>
            <li>We'll verify your business license and permits</li>
            <li>You'll receive an email once your account is approved</li>
          </ul>
        </div>
        <p>Once approved, you'll be able to:</p>
        <ul>
          <li>Add your menu items</li>
          <li>Manage orders</li>
          <li>Track revenue</li>
          <li>Update your restaurant details</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #888; font-size: 12px;">
          RideN'Bite - Grow your business with us
        </p>
      </div>
    `,
        text: `Your restaurant application for ${businessName} is under review. We'll notify you within 24-48 hours.`,
    }),

    riderPending: (name: string) => ({
        subject: 'Your rider application is under review',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EA580C;">Thank You for Applying!</h1>
        <p>Hi ${name},</p>
        <p>We've received your application to become a RideN'Bite delivery rider.</p>
        <div style="background: #FFF7ED; border-left: 4px solid #F97316; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #EA580C;">What's Next?</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Document verification (24-48 hours)</li>
            <li>Background check</li>
            <li>Activate your account</li>
            <li>Complete in-app onboarding</li>
          </ul>
        </div>
        <p>Once approved, you can start accepting delivery requests and earning money!</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #888; font-size: 12px;">
          RideN'Bite - Deliver & Earn
        </p>
      </div>
    `,
        text: `Your rider application is under review. We'll verify your documents within 24-48 hours.`,
    }),

    approved: (name: string, role: string) => ({
        subject: '🎉 Your RideN\'Bite account has been approved!',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Congratulations!</h1>
        <p>Hi ${name},</p>
        <p>Great news! Your ${role} account has been approved and is now active.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" 
             style="background: linear-gradient(to right, #F97316, #DC2626); 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 8px;
                    display: inline-block;">
            Get Started
          </a>
        </div>
        <p>You can now login and start using all the features of your account.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #888; font-size: 12px;">
          RideN'Bite - Welcome aboard!
        </p>
      </div>
    `,
        text: `Congratulations! Your ${role} account has been approved. Login now at ${process.env.CLIENT_URL}/login`,
    }),

    rejected: (name: string, role: string, reason: string) => ({
        subject: 'Update on your RideN\'Bite application',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #DC2626;">Application Update</h1>
        <p>Hi ${name},</p>
        <p>Thank you for your interest in joining RideN'Bite as a ${role}.</p>
        <p>Unfortunately, we're unable to approve your application at this time.</p>
        <div style="background: #FEE2E2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #DC2626;">Reason:</h3>
          <p style="margin: 0;">${reason}</p>
        </div>
        <p>If you believe this is an error or would like to reapply, please contact our support team.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #888; font-size: 12px;">
          RideN'Bite Support Team
        </p>
      </div>
    `,
        text: `Your ${role} application was not approved. Reason: ${reason}. Contact support for more information.`,
    }),
};
