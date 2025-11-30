import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Check if SMTP credentials are provided
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        // Use real SMTP configuration
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });
        console.log('✅ Email service initialized with SMTP');
      } else {
        // Use Ethereal Email for testing (auto-generated test account)
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log('📧 Email service initialized with TEST account');
        console.log(`   View emails at: https://ethereal.email/`);
        console.log(`   Username: ${testAccount.user}`);
      }

      this.initialized = true;
    } catch (error) {
      console.error('⚠️  Email service initialization failed:', error);
      this.transporter = null;
    }
  }

  async sendLinkCodeEmail(
    parentEmail: string,
    studentName: string,
    linkCode: string
  ): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
    if (!this.transporter) {
      await this.initialize();
      if (!this.transporter) {
        return {
          success: false,
          error: 'Email service is not available. Please configure SMTP settings.',
        };
      }
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || '"StudySpotAI" <noreply@studyspotai.com>',
        to: parentEmail,
        subject: `${studentName} invited you to monitor their progress on StudySpotAI`,
        html: this.getLinkCodeEmailTemplate(studentName, linkCode),
        text: this.getLinkCodeEmailText(studentName, linkCode),
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Get preview URL for test emails (Ethereal)
      const previewUrl = nodemailer.getTestMessageUrl(info);

      console.log('✅ Link code email sent successfully');
      if (previewUrl) {
        console.log(`   Preview: ${previewUrl}`);
      }

      return {
        success: true,
        previewUrl: previewUrl || undefined,
      };
    } catch (error: any) {
      console.error('❌ Failed to send email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  private getLinkCodeEmailTemplate(studentName: string, linkCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            padding: 40px;
            color: white;
          }
          .content {
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin-top: 20px;
            color: #333;
          }
          .link-code {
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            padding: 20px;
            margin: 20px 0;
            border: 3px solid #667eea;
            border-radius: 10px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: bold;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
          h1 {
            margin: 0;
            font-size: 28px;
          }
          .highlight {
            color: #667eea;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎓 StudySpotAI Parent Invitation</h1>
          <p style="font-size: 18px; margin-top: 10px;">
            ${studentName} wants you to monitor their learning progress!
          </p>
        </div>

        <div class="content">
          <h2>Your Child's Link Code:</h2>
          <div class="link-code">${linkCode}</div>

          <h3>How to Get Started:</h3>
          <ol>
            <li>Visit <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}" class="highlight">StudySpotAI</a></li>
            <li>Create a <strong>Parent Account</strong></li>
            <li>Go to "My Children" section</li>
            <li>Click "Add Child" and enter the code above</li>
          </ol>

          <p>
            Once linked, you'll be able to:
          </p>
          <ul>
            <li>📊 Track homework completion</li>
            <li>🎯 Monitor quiz scores and progress</li>
            <li>🏆 Celebrate achievements and milestones</li>
            <li>📈 View detailed performance analytics</li>
            <li>💬 Stay connected with their learning journey</li>
          </ul>

          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/register?role=parent" class="button">
              Create Parent Account
            </a>
          </center>
        </div>

        <div class="footer">
          <p>
            This invitation was sent by ${studentName} through StudySpotAI.<br>
            If you didn't expect this email, you can safely ignore it.
          </p>
          <p style="color: #999; margin-top: 20px;">
            © ${new Date().getFullYear()} StudySpotAI - Empowering Learning Together
          </p>
        </div>
      </body>
      </html>
    `;
  }

  private getLinkCodeEmailText(studentName: string, linkCode: string): string {
    return `
StudySpotAI Parent Invitation

${studentName} wants you to monitor their learning progress!

Your Child's Link Code: ${linkCode}

How to Get Started:
1. Visit ${process.env.FRONTEND_URL || 'http://localhost:3001'}
2. Create a Parent Account
3. Go to "My Children" section
4. Click "Add Child" and enter the code: ${linkCode}

Once linked, you'll be able to:
- Track homework completion
- Monitor quiz scores and progress
- Celebrate achievements and milestones
- View detailed performance analytics
- Stay connected with their learning journey

Create your account now: ${process.env.FRONTEND_URL || 'http://localhost:3001'}/register?role=parent

This invitation was sent by ${studentName} through StudySpotAI.
If you didn't expect this email, you can safely ignore it.

© ${new Date().getFullYear()} StudySpotAI - Empowering Learning Together
    `.trim();
  }
}

export const emailService = new EmailService();
