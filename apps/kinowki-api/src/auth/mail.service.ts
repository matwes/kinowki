import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendActivationEmail(email: string, link: string) {
    this.resend.emails.send({
      from: process.env.RESEND_FROM,
      to: email,
      subject: 'Aktywacja konta Kinówki',
      html: `<p>Kliknij <a href="${link}">tutaj</a> aby aktywować konto.</p>`,
    });
  }
}
