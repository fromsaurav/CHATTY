import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  constructor() {
    this.service = process.env.EMAIL_SERVICE || "sendgrid";
    this.initializeService();
  }

  initializeService() {
    if (this.service === "sendgrid") {
      if (!process.env.SENDGRID_API_KEY) {
        console.error("SENDGRID_API_KEY is not configured");
        return;
      }
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  generateOTPTemplate(otp, expiresIn = 10) {
    return {
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Chatty - Email Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                💬 Chatty
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">
                Connect with friends instantly
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 36px;">
                  🔒
                </div>
                <h2 style="margin: 0 0 8px 0; color: #1f2937; font-size: 28px; font-weight: 700;">
                  Verify Your Email
                </h2>
                <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                  Welcome to Chatty! Please use the verification code below to complete your registration.
                </p>
              </div>

              <!-- OTP Code -->
              <div style="text-align: center; margin: 40px 0;">
                <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 2px dashed #9ca3af; border-radius: 16px; padding: 30px; display: inline-block; margin: 0 auto;">
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    Your Verification Code
                  </p>
                  <div style="font-size: 40px; font-weight: 800; color: #1f2937; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${otp}
                  </div>
                </div>
              </div>

              <!-- Important Info -->
              <div style="background-color: #fef3cd; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="flex-shrink: 0; margin-right: 12px; font-size: 20px;">⚠️</div>
                  <div>
                    <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 16px; font-weight: 600;">
                      Important Security Information
                    </h3>
                    <ul style="margin: 0; padding-left: 16px; color: #92400e; font-size: 14px; line-height: 1.6;">
                      <li>This code expires in <strong>${expiresIn} minutes</strong></li>
                      <li>Never share this code with anyone</li>
                      <li>If you didn't request this, please ignore this email</li>
                      <li>Our team will never ask you for this code</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Call to Action -->
              <div style="text-align: center; margin: 40px 0 20px 0;">
                <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                  Enter this code in the Chatty app to verify your email and start chatting!
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px 0; color: #374151; font-size: 16px; font-weight: 600;">
                Thanks for joining Chatty! 🎉
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.4;">
                This is an automated message. Please do not reply to this email.<br>
                If you have questions, contact us through the app or our support center.
              </p>
            </div>
          </div>

          <!-- Email Client Compatibility -->
          <div style="text-align: center; margin: 20px 0; color: #9ca3af; font-size: 12px;">
            If you're having trouble viewing this email, please ensure images are enabled.
          </div>
        </body>
        </html>
      `,
      text: `
        🔒 CHATTY - EMAIL VERIFICATION

        Welcome to Chatty! 

        Please use the following verification code to complete your registration:

        ${otp}

        ⚠️ IMPORTANT:
        • This code expires in ${expiresIn} minutes
        • Never share this code with anyone
        • If you didn't request this, please ignore this email
        • Our team will never ask you for this code

        Enter this code in the Chatty app to verify your email and start chatting!

        Thanks for joining Chatty! 🎉

        ---
        This is an automated message. Please do not reply to this email.
        If you have questions, contact us through the app or our support center.
      `
    };
  }

  async sendOTP(email, otp, expiresIn = 10) {
    try {
      // In development mode, log the OTP for testing
      if (process.env.NODE_ENV === "development") {
        console.log("\n" + "=".repeat(60));
        console.log("📧 DEVELOPMENT MODE - SendGrid OTP EMAIL");
        console.log("=".repeat(60));
        console.log(`📧 To: ${email}`);
        console.log(`🔢 OTP: ${otp}`);
        console.log(`⏰ Valid for: ${expiresIn} minutes`);
        console.log("=".repeat(60) + "\n");
      }

      const template = this.generateOTPTemplate(otp, expiresIn);
      
      const msg = {
        to: email,
        from: {
          email: process.env.EMAIL_FROM || "chatty@yopmail.com",
          name: "Chatty Team"
        },
        subject: "🔒 Verify Your Email - Chatty App",
        html: template.html,
        text: template.text,
        trackingSettings: {
          clickTracking: {
            enable: false
          },
          openTracking: {
            enable: true
          }
        },
        mailSettings: {
          sandboxMode: {
            enable: process.env.NODE_ENV === "development" && process.env.SENDGRID_SANDBOX === "true"
          }
        }
      };

      const result = await sgMail.send(msg);
      
      console.log(`✅ OTP email sent successfully to ${email}`);
      console.log(`📨 Message ID: ${result[0].headers['x-message-id']}`);

      return {
        success: true,
        messageId: result[0].headers['x-message-id'],
        statusCode: result[0].statusCode
      };

    } catch (error) {
      console.error("❌ SendGrid email sending failed:", error);
      
      // Handle specific SendGrid errors
      if (error.response) {
        const { body } = error.response;
        console.error("SendGrid Error Details:", body);
        
        // Return specific error messages based on SendGrid response
        if (body.errors) {
          const errorMessages = body.errors.map(err => err.message).join(", ");
          return {
            success: false,
            error: `SendGrid Error: ${errorMessages}`,
            statusCode: error.code
          };
        }
      }

      return {
        success: false,
        error: error.message || "Unknown email sending error",
        statusCode: error.code || 500
      };
    }
  }

  async verifyConfiguration() {
    try {
      if (this.service === "sendgrid") {
        if (!process.env.SENDGRID_API_KEY) {
          return {
            valid: false,
            error: "SENDGRID_API_KEY is not configured"
          };
        }
        
        if (!process.env.EMAIL_FROM) {
          return {
            valid: false,
            error: "EMAIL_FROM is not configured"
          };
        }

        return {
          valid: true,
          service: "sendgrid",
          from: process.env.EMAIL_FROM
        };
      }

      return {
        valid: false,
        error: "Unsupported email service"
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

// Export the sendOTPEmail function for backward compatibility
const emailService = new EmailService();

export const sendOTPEmail = async (email, otp, expiresIn = 10) => {
  return await emailService.sendOTP(email, otp, expiresIn);
};

export default EmailService;