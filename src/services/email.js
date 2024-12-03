import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { config } from '../config/index.js';

const resend = new Resend(config.resend_apikey);

export const emailLogger = async (name, zoomLink, date, clientEmail) => {
  try {
    const emailInvite = await resend.emails.send({
      from: 'ClientFy Logger <onboarding@resend.dev>',
      to: 'clientfy0@gmail.com',
      subject: 'Registro de Nueva Cita',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Nueva Cita Registrada</h2>
          <p><strong>Detalles de la cita:</strong></p>
          <ul>
            <li><strong>Cliente:</strong> ${name}</li>
            <li><strong>Email del cliente:</strong> ${clientEmail}</li>
            <li><strong>Fecha de creación del evento:</strong> ${new Date().toLocaleString(
              'es-ES',
              {
                dateStyle: 'full',
                timeStyle: 'short',
              }
            )}</li>
            <li><strong>Fecha de la cita:</strong> ${date}</li>
            <li><strong>Link de Zoom:</strong> ${
              zoomLink ?? 'No disponible'
            }</li>
          </ul>
          <p>Este es un mensaje automático de registro - No responder</p>
        </div>
      `,
    });
    console.log('Log de cita enviado:', emailInvite);
    return true;
  } catch (error) {
    console.error('Error en emailLogger:', error);
    return false;
  }
};

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: config.gmail_user,
    pass: config.gmail_pass,
  },
});

export const emailInvite = async (clientEmail, name, date, zoomLink) => {
  try {
    date = new Date(date).toLocaleString('es-ES', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
    await emailLogger(name, zoomLink, date, clientEmail);

    await transporter.sendMail({
      from: `"ClientFy" <${config.gmail_user}>`,
      to: clientEmail,
      subject: 'Invitación a una reunión',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hola ${name},</h2>
          <p>Te invitamos a una reunión programada. Aquí están los detalles:</p>
          <p><strong>Fecha de la cita:</strong> ${date}</p>
          <p><strong>Enlace de Zoom:</strong> <a href="${
            zoomLink ?? ''
          }" style="color: #1a73e8;">${zoomLink ?? ''}</a></p>

          <p>Esperamos verte allí!</p>
          <p>Saludos,<br>El equipo</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error('No se pudo enviar el email de invitación');
  }
};
