import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { HttpAdapterHost } from '@nestjs/core';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';

describe('AllExceptionsFilter', () => {
  const reply = vi.fn();
  const getRequestUrl = vi.fn();

  let filter: AllExceptionsFilter;

  const request = {};
  const response = {};

  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;

  beforeEach(() => {
    vi.clearAllMocks();

    getRequestUrl.mockReturnValue('/games/999');

    const httpAdapterHost = {
      httpAdapter: {
        reply,
        getRequestUrl,
      },
    } as unknown as HttpAdapterHost;

    filter = new AllExceptionsFilter(httpAdapterHost);

    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('should return the status and message for HttpException', () => {
    const exception = new NotFoundException('Game not found');

    filter.catch(exception, host);

    expect(reply).toHaveBeenCalledWith(
      response,
      expect.objectContaining({
        statusCode: 404,
        message: 'Game not found',
        path: '/games/999',
      }),
      404,
    );
  });

  it('should handle string HttpException responses', () => {
    const exception = new HttpException('Bad request', HttpStatus.BAD_REQUEST);

    filter.catch(exception, host);

    expect(reply).toHaveBeenCalledWith(
      response,
      expect.objectContaining({
        statusCode: 400,
        message: 'Bad request',
      }),
      400,
    );
  });

  it('should hide unexpected internal error details', () => {
    const exception = new Error('database connection exploded');

    filter.catch(exception, host);

    expect(reply).toHaveBeenCalledWith(
      response,
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        path: '/games/999',
      }),
      500,
    );
  });
});
