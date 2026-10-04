import { ConfigService } from '@nestjs/config';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import nodemailer from 'nodemailer';

import { EmailService } from '../src/email/email.service.js';

const { sendMailMock, createTransportMock } = vi.hoisted(() => ({
  sendMailMock: vi.fn(),

  createTransportMock: vi.fn(),
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: createTransportMock,
  },
}));

describe('EmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    createTransportMock.mockReturnValue({
      sendMail: sendMailMock,
    });
  });

  function createConfigService(overrides: Record<string, string> = {}) {
    const config: Record<string, string> = {
      SMTP_HOST: 'localhost',

      SMTP_PORT: '1025',

      SMTP_SECURE: 'false',

      EMAIL_FROM: 'Game Library <no-reply@gamelibrary.local>',

      ...overrides,
    };

    return {
      getOrThrow: vi.fn((key: string) => {
        const value = config[key];

        if (value === undefined) {
          throw new Error(`Missing ${key}`);
        }

        return value;
      }),

      get: vi.fn((key: string) => config[key]),
    } as unknown as ConfigService;
  }

  it('should create SMTP transporter without auth', () => {
    const configService = createConfigService();

    const service = new EmailService(configService);

    expect(service).toBeDefined();

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'localhost',
      port: 1025,
      secure: false,
    });
  });

  it('should create SMTP transporter with auth when credentials exist', () => {
    const configService = createConfigService({
      SMTP_USER: 'smtp-user',

      SMTP_PASS: 'smtp-password',
    });

    new EmailService(configService);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'localhost',
      port: 1025,
      secure: false,

      auth: {
        user: 'smtp-user',
        pass: 'smtp-password',
      },
    });
  });

  it('should send price drop email', async () => {
    sendMailMock.mockResolvedValue({
      messageId: 'message-123',
    });

    const service = new EmailService(createConfigService());

    await service.sendPriceDropEmail(
      'user@example.com',
      'Elden Ring',
      30,
      24.99,
      'https://example.com/deal',
    );

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'Game Library <no-reply@gamelibrary.local>',

      to: 'user@example.com',

      subject: '🔥 Price drop: Elden Ring',

      text: [
        'Elden Ring has dropped in price!',
        '',
        'Your target: $30.00',
        'Current price: $24.99',
        '',
        'Deal: https://example.com/deal',
      ].join('\n'),
    });
  });
});
