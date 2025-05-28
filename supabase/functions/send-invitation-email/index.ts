
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Send email using SMTP
    const emailData = {
      from: `${fromName} <${fromEmail}>`,
      to: email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    };

    // Use a simple SMTP implementation
    const response = await sendSMTPEmail(emailData, {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
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
  // For this implementation, we'll use a simple HTTP-based email service
  // that works with SMTP credentials. In a production environment,
  // you might want to use a more robust SMTP client.
  
  const emailPayload = {
    smtp: smtpConfig,
    email: emailData,
  };

  // This is a simplified approach - in production you'd use a proper SMTP library
  // For now, we'll use Deno's built-in fetch with a service that handles SMTP
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: 'gmail',
      template_id: 'template_1',
      user_id: smtpConfig.auth.user,
      template_params: {
        to_email: emailData.to,
        from_name: emailData.from,
        subject: emailData.subject,
        message_html: emailData.html,
        message: emailData.text,
      },
      accessToken: smtpConfig.auth.pass,
    }),
  });

  if (!response.ok) {
    throw new Error(`SMTP send failed: ${response.statusText}`);
  }

  return response.json();
}

serve(handler);
