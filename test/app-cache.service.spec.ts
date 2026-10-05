import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Test, TestingModule } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppCacheService } from '../src/cache/app-cache.service.js';

describe('AppCacheService', () => {
  let service: AppCacheService;

  const cacheManagerMock = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    cacheManagerMock.get.mockResolvedValue(undefined);

    cacheManagerMock.set.mockResolvedValue(undefined);

    cacheManagerMock.del.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppCacheService,

        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    service = module.get<AppCacheService>(AppCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return cached value', async () => {
      const cachedValue = {
        id: 1,
        title: 'Elden Ring',
      };

      cacheManagerMock.get.mockResolvedValue(cachedValue);

      const result = await service.get('game:1');

      expect(cacheManagerMock.get).toHaveBeenCalledWith('game:1');

      expect(result).toEqual(cachedValue);
    });

    it('should return undefined when key does not exist', async () => {
      cacheManagerMock.get.mockResolvedValue(undefined);

      const result = await service.get('missing:key');

      expect(result).toBeUndefined();
    });

    it('should return undefined when cache manager returns null', async () => {
      cacheManagerMock.get.mockResolvedValue(null);

      const result = await service.get('missing:key');

      expect(result).toBeUndefined();
    });

    it('should return undefined when cache get fails', async () => {
      cacheManagerMock.get.mockRejectedValue(new Error('Redis unavailable'));

      const result = await service.get('test:key');

      expect(result).toBeUndefined();
    });
  });

  describe('set', () => {
    it('should store value with ttl', async () => {
      const value = {
        id: 1,
        title: 'Elden Ring',
      };

      await service.set('game:1', value, 60_000);

      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        'game:1',
        value,
        60_000,
      );
    });

    it('should not throw when cache set fails', async () => {
      cacheManagerMock.set.mockRejectedValue(new Error('Redis unavailable'));

      await expect(
        service.set(
          'test:key',
          {
            value: 123,
          },
          60_000,
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete cached value', async () => {
      await service.delete('game:1');

      expect(cacheManagerMock.del).toHaveBeenCalledWith('game:1');
    });

    it('should not throw when cache delete fails', async () => {
      cacheManagerMock.del.mockRejectedValue(new Error('Redis unavailable'));

      await expect(service.delete('game:1')).resolves.toBeUndefined();
    });
  });
});
