import { Injectable } from '@nestjs/common';
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';

@Injectable()
export class MailService {
  async sendActivationEmail(email: string, name: string, link: string) {
    const mailerSend = new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY });

    const sentFrom = new Sender(process.env.MAILERSEND_FROM, 'Kinówki');

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo([new Recipient(email, name)])
      .setReplyTo(sentFrom)
      .setSubject('Aktywacja konta Kinówki')
      .setHtml(`<p>Kliknij <a href="${link}">tutaj</a> aby aktywować konto.</p>`);

    await mailerSend.email.send(emailParams);
  }
}
