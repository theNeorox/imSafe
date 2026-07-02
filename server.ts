/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper to delay execution (used for retries)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request parsing with high limit
  app.use(express.json({ limit: '10mb' }));

  // API Route: Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // API Route: Send Twilio SMS, Voice Call, and Nodemailer Email Alerts
  app.post('/api/send-alert', async (req, res) => {
    const { type, userName, contacts, location, twilioConfig, emailConfig } = req.body;

    // Determine Twilio Credentials
    const accountSid = twilioConfig?.accountSid || process.env.TWILIO_ACCOUNT_SID;
    const authToken = twilioConfig?.authToken || process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = twilioConfig?.fromNumber || process.env.TWILIO_FROM_NUMBER;

    // Determine Email SMTP Credentials
    const smtpHost = emailConfig?.smtpHost || process.env.SMTP_HOST;
    const smtpPort = Number(emailConfig?.smtpPort) || Number(process.env.SMTP_PORT) || 587;
    const smtpUser = emailConfig?.smtpUser || process.env.SMTP_USER;
    const smtpPass = emailConfig?.smtpPass || process.env.SMTP_PASS;
    const fromEmail = emailConfig?.fromEmail || process.env.SMTP_FROM || 'alertas@imsafe.com.br';

    const hasTwilio = accountSid && authToken && fromNumber;
    const hasEmail = smtpHost && smtpUser && smtpPass;

    if (!hasTwilio && !hasEmail) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum serviço de envio (Twilio ou E-mail SMTP) foi configurado na Central de Alertas do imSafe.',
        missingCredentials: {
          twilio: !hasTwilio,
          email: !hasEmail
        }
      });
    }

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum contato de emergência cadastrado para receber alertas.'
      });
    }

    const results: Array<{
      contactName: string;
      contactAddress: string;
      actionType: 'SMS' | 'Call' | 'Email';
      status: 'success' | 'failed';
      error?: string;
      attempts: number;
    }> = [];

    // Format Alert Details
    const formattedDate = new Date().toLocaleDateString('pt-BR');
    const formattedTime = new Date().toLocaleTimeString('pt-BR');
    const mapsLink = location?.latitude && location?.longitude 
      ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
      : 'Localização indisponível';

    let emergencyTypeLabel = '';
    let speechCallText = '';
    let emailSubject = '';

    switch (type) {
      case 'not_well':
        emergencyTypeLabel = 'Mal-estar (Protocolo "Não estou bem")';
        speechCallText = `Atenção! Alerta de emergência de saúde imSafe de ${userName}. Protocolo de mal-estar acionado em ${formattedDate} às ${formattedTime}. Por favor, verifique as mensagens e entre em contato imediatamente.`;
        emailSubject = `🚨 ALERTA MÉDICO imSafe: ${userName} informou mal-estar`;
        break;
      case 'danger':
        emergencyTypeLabel = 'EMERGÊNCIA / SITUAÇÃO DE PERIGO';
        speechCallText = `Atenção! Alerta urgente de perigo imSafe de ${userName}. O protocolo de perigo extremo foi acionado em ${formattedDate} às ${formattedTime}. Verifique a localização imediatamente ou chame as autoridades se necessário.`;
        emailSubject = `⚠️ ALERTA DE PERIGO imSafe: ${userName} está em perigo!`;
        break;
      case 'missed':
        emergencyTypeLabel = 'Check-in de segurança ausente';
        speechCallText = `Atenção! Alerta de segurança imSafe. O usuário ${userName} não respondeu aos check-ins agendados em ${formattedDate} às ${formattedTime} e pode precisar de ajuda urgente.`;
        emailSubject = `🚨 ALERTA AUTOMÁTICO imSafe: Check-in ausente de ${userName}`;
        break;
      default:
        emergencyTypeLabel = 'Alerta de Segurança Geral';
        speechCallText = `Alerta de segurança imSafe acionado por ${userName} em ${formattedDate} às ${formattedTime}.`;
        emailSubject = `ℹ️ Alerta de Segurança imSafe: ${userName}`;
    }

    // Build the SMS and Plain Email Message Body
    const mainMessageContent = `🚨 ALERTA DE SEGURANÇA [imSafe] 🚨\n\nOlá, este é um alerta automatizado de segurança sobre: ${userName}\n\nTipo do Alerta: ${emergencyTypeLabel}\nData: ${formattedDate}\nHora: ${formattedTime}\n\n📍 Link da Localização no Google Maps:\n${mapsLink}\n\nPor favor, entre em contato com o usuário de imediato.`;

    // 1. Helper for Twilio SMS with retry mechanism
    const sendSMSWithRetry = async (client: any, to: string, message: string, maxRetries = 3) => {
      let attempts = 0;
      while (attempts < maxRetries) {
        attempts++;
        try {
          await client.messages.create({
            body: message,
            from: fromNumber,
            to: to,
          });
          return { status: 'success' as const, attempts };
        } catch (error: any) {
          if (attempts >= maxRetries) {
            return { status: 'failed' as const, error: error.message || String(error), attempts };
          }
          await sleep(1000 * attempts); // Exponential backoff
        }
      }
      return { status: 'failed' as const, error: 'Maximum retries exceeded', attempts };
    };

    // 2. Helper for Twilio Voice Call with retry mechanism
    const triggerCallWithRetry = async (client: any, to: string, twimlMarkup: string, maxRetries = 3) => {
      let attempts = 0;
      while (attempts < maxRetries) {
        attempts++;
        try {
          await client.calls.create({
            twiml: twimlMarkup,
            from: fromNumber,
            to: to,
          });
          return { status: 'success' as const, attempts };
        } catch (error: any) {
          if (attempts >= maxRetries) {
            return { status: 'failed' as const, error: error.message || String(error), attempts };
          }
          await sleep(1000 * attempts); // Exponential backoff
        }
      }
      return { status: 'failed' as const, error: 'Maximum retries exceeded', attempts };
    };

    // 3. Helper for Nodemailer Email with retry mechanism
    const sendEmailWithRetry = async (to: string, subject: string, plainText: string, htmlMarkup: string, maxRetries = 3) => {
      let attempts = 0;
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        timeout: 8000
      } as any);

      while (attempts < maxRetries) {
        attempts++;
        try {
          await transporter.sendMail({
            from: `Alertas imSafe <${fromEmail}>`,
            to,
            subject,
            text: plainText,
            html: htmlMarkup,
          });
          return { status: 'success' as const, attempts };
        } catch (error: any) {
          if (attempts >= maxRetries) {
            return { status: 'failed' as const, error: error.message || String(error), attempts };
          }
          await sleep(1000 * attempts); // Exponential backoff
        }
      }
      return { status: 'failed' as const, error: 'Maximum retries exceeded', attempts };
    };

    // Initialize Twilio client if configured
    let twilioClient: any = null;
    if (hasTwilio) {
      twilioClient = twilio(accountSid, authToken);
    }

    // HTML Email body template
    const htmlEmailTemplate = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f1f5f9; border-radius: 24px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px;">🚨</span>
          <h2 style="color: #0f172a; margin-top: 10px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase; font-size: 18px;">Alerta de Emergência imSafe</h2>
          <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Este é um alerta de segurança automatizado e prioritário.</p>
        </div>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #475569;"><strong style="color: #0f172a;">Usuário:</strong> ${userName}</p>
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #475569;"><strong style="color: #0f172a;">Tipo de Alerta:</strong> <span style="background-color: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">${emergencyTypeLabel}</span></p>
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #475569;"><strong style="color: #0f172a;">Data:</strong> ${formattedDate}</p>
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #475569;"><strong style="color: #0f172a;">Hora:</strong> ${formattedTime}</p>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <p style="color: #334155; font-size: 14px; margin-bottom: 16px; font-weight: 500;">Veja a localização exata do usuário no mapa abaixo:</p>
          <a href="${mapsLink}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: bold; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Visualizar no Google Maps</a>
        </div>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.6;">
          Este e-mail foi disparado de forma automática através do aplicativo <strong>imSafe - Segurança Pessoal</strong>.<br />
          Por favor, tente entrar em contato imediato com o usuário.
        </div>
      </div>
    `;

    // Iterate and execute alerts for each emergency contact
    for (const contact of contacts) {
      // 1. Process phone-based alerts (Twilio SMS and Calls)
      if (hasTwilio && twilioClient) {
        const cleanPhone = contact.phone.replace(/[^\d+]/g, '');
        let targetPhone = cleanPhone;
        if (!targetPhone.startsWith('+')) {
          if (targetPhone.length >= 10 && targetPhone.length <= 11) {
            targetPhone = `+55${targetPhone}`;
          } else {
            targetPhone = `+${targetPhone}`;
          }
        }

        // 1.1 Dispatch SMS Alert
        const smsRes = await sendSMSWithRetry(twilioClient, targetPhone, mainMessageContent);
        results.push({
          contactName: contact.name,
          contactAddress: contact.phone,
          actionType: 'SMS',
          status: smsRes.status,
          error: smsRes.error,
          attempts: smsRes.attempts,
        });

        // 1.2 Dispatch Voice Call Alert (Now enabled for all emergency triggers to guarantee maximum safety!)
        const callTwiml = `<Response><Say voice="alice" language="pt-BR">${speechCallText}</Say><Play>http://demo.twilio.com/docs/classic.mp3</Play></Response>`;
        const callRes = await triggerCallWithRetry(twilioClient, targetPhone, callTwiml);
        results.push({
          contactName: contact.name,
          contactAddress: contact.phone,
          actionType: 'Call',
          status: callRes.status,
          error: callRes.error,
          attempts: callRes.attempts,
        });
      } else {
        // Log skip
        results.push({
          contactName: contact.name,
          contactAddress: contact.phone,
          actionType: 'SMS',
          status: 'failed',
          error: 'Twilio não configurado',
          attempts: 0
        });
        results.push({
          contactName: contact.name,
          contactAddress: contact.phone,
          actionType: 'Call',
          status: 'failed',
          error: 'Twilio não configurado',
          attempts: 0
        });
      }

      // 2. Process email-based alerts (Nodemailer SMTP)
      if (hasEmail && contact.email) {
        const emailRes = await sendEmailWithRetry(contact.email, emailSubject, mainMessageContent, htmlEmailTemplate);
        results.push({
          contactName: contact.name,
          contactAddress: contact.email,
          actionType: 'Email',
          status: emailRes.status,
          error: emailRes.error,
          attempts: emailRes.attempts,
        });
      } else if (contact.email) {
        results.push({
          contactName: contact.name,
          contactAddress: contact.email,
          actionType: 'Email',
          status: 'failed',
          error: 'Servidor SMTP não configurado',
          attempts: 0
        });
      }
    }

    const hasFailures = results.some(r => r.status === 'failed');

    res.json({
      success: !hasFailures,
      results,
      meta: {
        totalAlerts: results.length,
        failures: results.filter(r => r.status === 'failed').length,
      }
    });
  });

  // Serve static files in production or hook up Vite developer server in dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[imSafe Backend] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[imSafe Backend] Failed to start:', err);
});
