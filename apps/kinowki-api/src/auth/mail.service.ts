import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendActivationEmail(email: string, link: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Aktywacja konta Kinówki',
      html: `<p>Kliknij <a href="${link}">tutaj</a> aby aktywować konto.</p>`,
    });
  }
}
