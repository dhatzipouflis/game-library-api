import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;

  private readonly from: string;

  constructor(configService: ConfigService) {
    const host = configService.getOrThrow<string>('SMTP_HOST');

    const port = Number(configService.getOrThrow<string>('SMTP_PORT'));

    const secure = configService.get<string>('SMTP_SECURE') === 'true';

    const user = configService.get<string>('SMTP_USER');

    const pass = configService.get<string>('SMTP_PASS');

    this.from = configService.getOrThrow<string>('EMAIL_FROM');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,

      ...(user && pass
        ? {
            auth: {
              user,
              pass,
            },
          }
        : {}),
    });
  }

  async sendPriceDropEmail(
    email: string,
    gameTitle: string,
    targetPrice: number,
    currentPrice: number,
    dealUrl: string,
  ) {
    await this.transporter.sendMail({
      from: this.from,

      to: email,

      subject: `🔥 Price drop: ${gameTitle}`,

      text: [
        `${gameTitle} has dropped in price!`,
        '',
        `Your target: $${targetPrice.toFixed(2)}`,
        `Current price: $${currentPrice.toFixed(2)}`,
        '',
        `Deal: ${dealUrl}`,
      ].join('\n'),
    });
  }
}
