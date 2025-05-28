
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvitationEmailRequest {
  email: string;
  token: string;
  role: string;
  tenantName: string;
  inviterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, token, role, tenantName, inviterName }: InvitationEmailRequest = await req.json();

    // Get SMTP configuration from environment
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '465');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');
    const smtpSecure = Deno.env.get('SMTP_SECURE') === 'true';
    const fromEmail = Deno.env.get('SMTP_FROM_EMAIL');
    const fromName = Deno.env.get('SMTP_FROM_NAME');

    if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
      throw new Error('SMTP configuration is incomplete');
    }

    console.log('SMTP Config:', { smtpHost, smtpPort, smtpUser: smtpUser.substring(0, 5) + '***', smtpSecure });

    // Create invitation URL
    const inviteUrl = `${req.headers.get('origin')}/invite-accept?token=${token}`;

    // Create email content
    const emailSubject = `Invitation to join ${tenantName} on Aura HRMS`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation to Aura HRMS</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Aura HRMS</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">You're Invited!</h2>
            
            <p>Hello,</p>
            
            <p><strong>${inviterName}</strong> has invited you to join <strong>${tenantName}</strong> as a <strong>${role}</strong> on Aura HRMS.</p>
            
            <p>Aura HRMS is a comprehensive human resource management system that will help you manage your work more efficiently.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accept Invitation</a>
            </div>
            
            <p style="font-size: 14px; color: #666;">If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 14px;">${inviteUrl}</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="font-size: 12px; color: #999;">
              This invitation will expire in 7 days. If you have any questions, please contact your administrator.
            </p>
            
            <p style="font-size: 12px; color: #999;">
              Best regards,<br>
              ${fromName}<br>
              Aura HRMS Team
            </p>
          </div>
        </body>
      </html>
    `;

    const emailText = `
      You're invited to join ${tenantName} on Aura HRMS!
      
      ${inviterName} has invited you to join ${tenantName} as a ${role}.
      
      To accept this invitation, please visit: ${inviteUrl}
      
      This invitation will expire in 7 days.
      
      Best regards,
      ${fromName}
      Aura HRMS Team
    `;

    // Send email using native SMTP
    const response = await sendSMTPEmail({
      from: `${fromName} <${fromEmail}>`,
      to: email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    }, {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      user: smtpUser,
      pass: smtpPass,
    });

    console.log('Email sent successfully:', response);

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation email sent successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error sending invitation email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function sendSMTPEmail(emailData: any, smtpConfig: any) {
  try {
    console.log('Attempting to send email via SMTP...');
    
    // Create SMTP connection
    const conn = await Deno.connect({
      hostname: smtpConfig.host,
      port: smtpConfig.port,
    });

    // For SSL/TLS connection
    const tlsConn = smtpConfig.secure 
      ? await Deno.startTls(conn, { hostname: smtpConfig.host })
      : conn;

    // SMTP commands
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper function to send command and read response
    async function sendCommand(command: string, expectCode?: string): Promise<string> {
      console.log('SMTP >', command.replace(/AUTH PLAIN.*/, 'AUTH PLAIN [credentials hidden]'));
      await tlsConn.write(encoder.encode(command + '\r\n'));
      
      const buffer = new Uint8Array(1024);
      const bytesRead = await tlsConn.read(buffer);
      const response = decoder.decode(buffer.subarray(0, bytesRead || 0));
      console.log('SMTP <', response.trim());
      
      // Check if response starts with expected code or 2xx/3xx for success
      const responseCode = response.substring(0, 3);
      if (expectCode) {
        if (!response.startsWith(expectCode)) {
          throw new Error(`SMTP Error: Expected ${expectCode}, got ${response.trim()}`);
        }
      } else if (!responseCode.startsWith('2') && !responseCode.startsWith('3')) {
        throw new Error(`SMTP Error: ${response.trim()}`);
      }
      
      return response;
    }

    // SMTP conversation
    await sendCommand('EHLO localhost');
    
    if (!smtpConfig.secure) {
      await sendCommand('STARTTLS');
      // Upgrade to TLS
      const tlsUpgraded = await Deno.startTls(tlsConn, { hostname: smtpConfig.host });
      await sendCommand('EHLO localhost');
    }

    // Authentication
    const authString = btoa(`\0${smtpConfig.user}\0${smtpConfig.pass}`);
    await sendCommand(`AUTH PLAIN ${authString}`, '235');

    // Send email
    await sendCommand(`MAIL FROM:<${smtpConfig.user}>`, '250');
    await sendCommand(`RCPT TO:<${emailData.to}>`, '250');
    await sendCommand('DATA', '354');

    // Email headers and body - send as one block
    const emailContent = [
      `From: ${emailData.from}`,
      `To: ${emailData.to}`,
      `Subject: ${emailData.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="boundary123"',
      '',
      '--boundary123',
      'Content-Type: text/plain; charset=utf-8',
      '',
      emailData.text,
      '',
      '--boundary123',
      'Content-Type: text/html; charset=utf-8',
      '',
      emailData.html,
      '',
      '--boundary123--',
      '.',
    ].join('\r\n');

    console.log('SMTP > [EMAIL CONTENT]');
    await tlsConn.write(encoder.encode(emailContent + '\r\n'));
    
    // Read final response
    const finalBuffer = new Uint8Array(1024);
    const finalBytesRead = await tlsConn.read(finalBuffer);
    const finalResponse = decoder.decode(finalBuffer.subarray(0, finalBytesRead || 0));
    console.log('SMTP <', finalResponse.trim());

    // Check for successful delivery
    if (!finalResponse.startsWith('250')) {
      throw new Error(`Email delivery failed: ${finalResponse.trim()}`);
    }

    await sendCommand('QUIT', '221');
    tlsConn.close();

    return { success: true, messageId: 'smtp-sent' };

  } catch (error) {
    console.error('SMTP Error:', error);
    throw new Error(`SMTP send failed: ${error.message}`);
  }
}

serve(handler);
