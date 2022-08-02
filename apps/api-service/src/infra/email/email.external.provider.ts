import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@sendgrid/mail';

@Injectable()
export class EmailExternalProvider {
  private readonly emailService: MailService;
  private readonly sender: string;

  constructor(private readonly configService: ConfigService) {
    this.emailService = new MailService();
    this.emailService.setApiKey(this.configService.get('SENDGRID_KEY') ?? '');
    this.sender = this.configService.get('SENDGRID_SENDER') ?? '';
  }

  public async sendEmail(email: string, subject: string, text: string) {
    const msg = {
      to: email,
      from: this.sender,
      subject: subject,
      text: text,
    };
    return this.emailService.send(msg);
  }

  public async sendPasswordResetEmail(email: string, newJwtToken: string) {
    const subject = 'Your new your password';
    const text = `
      This is your new password: ${newJwtToken}`;
    return this.sendEmail(email, subject, text);
  }
}
