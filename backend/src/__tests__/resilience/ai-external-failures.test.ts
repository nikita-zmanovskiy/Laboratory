import type { AxiosRequestConfig } from 'axios'
import { AppError } from '../../utils/errors.js'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const { axiosClientMock, axiosCreateMock } = vi.hoisted(() => {
    const axiosClientMock = vi.fn()
    const axiosCreateMock = vi.fn(() => axiosClientMock)

    return {
        axiosClientMock,
        axiosCreateMock,
    }
})

vi.mock('axios', () => {
    const isAxiosError = (error: unknown): boolean => {
        return Boolean(
            error &&
            typeof error === 'object' &&
            'isAxiosError' in error &&
            error.isAxiosError === true
        )
    }

    return {
        default: {
            create: axiosCreateMock,
            isAxiosError,
        },
        isAxiosError,
    }
})

vi.mock('../../utils/logger.js', () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}))

import { AI_TIMEOUT_MS, BaseAiService } from '../../services/ai/baseAiService.js'

class TestAiService extends BaseAiService {
    public request(config: AxiosRequestConfig): Promise<unknown> {
        return this.makeRequest(config)
    }

    public retry<T>(operation: () => Promise<T>, maxRetries = 1): Promise<T> {
        return this.withRetry(operation, maxRetries, 'TestAI') as Promise<T>
    }
}

describe('AI external API resilience', () => {
    beforeEach(() => {
        vi.useRealTimers()
        axiosClientMock.mockReset()
        axiosCreateMock.mockClear()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    test('LAB-75: configures external AI request timeout as 60 seconds', () => {
        new TestAiService('GigaChat', 'https://example.ai')

        expect(AI_TIMEOUT_MS).toBe(60_000)

        expect(axiosCreateMock).toHaveBeenCalledWith(
            expect.objectContaining({
                timeout: 60_000,
                baseURL: 'https://example.ai',
            })
        )
    })

    test('LAB-75: converts 60 second timeout into AppError 504', async () => {
        const service = new TestAiService('GigaChat', 'https://example.ai')

        axiosClientMock.mockRejectedValueOnce({
            isAxiosError: true,
            code: 'ECONNABORTED',
            message: `timeout of ${AI_TIMEOUT_MS}ms exceeded`,
        })

        await expect(
            service.request({
                method: 'POST',
                url: '/chat/completions',
                data: {
                    prompt: 'timeout test',
                },
            })
        ).rejects.toMatchObject({
            statusCode: 504,
            message: expect.stringContaining('timed out'),
        })
    })

    test('LAB-75: also treats ETIMEDOUT as timeout and returns 504', async () => {
        const service = new TestAiService('GigaChat', 'https://example.ai')

        axiosClientMock.mockRejectedValueOnce({
            isAxiosError: true,
            code: 'ETIMEDOUT',
            message: 'socket timed out',
        })

        await expect(
            service.request({
                method: 'POST',
                url: '/chat/completions',
            })
        ).rejects.toMatchObject({
            statusCode: 504,
            message: expect.stringContaining('timed out'),
        })
    })

    test('LAB-76: converts external API 503 response into controlled AppError', async () => {
        const service = new TestAiService('GigaChat', 'https://example.ai')

        axiosClientMock.mockRejectedValueOnce({
            isAxiosError: true,
            response: {
                status: 503,
                data: {
                    message: 'GigaChat temporarily unavailable',
                },
            },
            message: 'Request failed with status code 503',
        })

        await expect(
            service.request({
                method: 'POST',
                url: '/chat/completions',
            })
        ).rejects.toMatchObject({
            statusCode: 503,
            message: expect.stringContaining('GigaChat error'),
        })
    })

    test('LAB-76: converts external API 500 response into controlled AppError', async () => {
        const service = new TestAiService('Kandinsky', 'https://example.ai')

        axiosClientMock.mockRejectedValueOnce({
            isAxiosError: true,
            response: {
                status: 500,
                data: {
                    message: 'Internal provider error',
                },
            },
            message: 'Request failed with status code 500',
        })

        await expect(
            service.request({
                method: 'POST',
                url: '/generate',
            })
        ).rejects.toMatchObject({
            statusCode: 500,
            message: expect.stringContaining('Kandinsky error'),
        })
    })

    test('LAB-76: retries temporary 503 provider failure before final fallback error', async () => {
        vi.useFakeTimers()

        const service = new TestAiService('GigaChat', 'https://example.ai')

        const operation = vi
            .fn<() => Promise<string>>()
            .mockRejectedValue(new AppError(503, 'provider is down'))

        const resultPromise = service.retry(operation, 1)

        const assertion = expect(resultPromise).rejects.toMatchObject({
            statusCode: 503,
            message: expect.stringContaining('unavailable after 1 retries'),
        })

        await vi.advanceTimersByTimeAsync(1_000)

        await assertion

        expect(operation).toHaveBeenCalledTimes(2)
    })

    test.each([
        ['ENOTFOUND', 'DNS lookup failed'],
        ['EAI_AGAIN', 'temporary DNS failure'],
        ['ECONNRESET', 'connection reset by peer'],
        ['ECONNREFUSED', 'connection refused'],
        ['EHOSTUNREACH', 'host unreachable'],
    ])('LAB-77: converts network error %s into controlled 503', async (code, message) => {
        const service = new TestAiService('GigaChat', 'https://example.ai')

        axiosClientMock.mockRejectedValueOnce({
            isAxiosError: true,
            code,
            message,
        })

        await expect(
            service.request({
                method: 'POST',
                url: '/chat/completions',
            })
        ).rejects.toMatchObject({
            statusCode: 503,
            message: expect.stringContaining('temporarily unavailable'),
        })
    })

    test('LAB-77: unknown non-Axios network failure is also converted into 503', async () => {
        const service = new TestAiService('Kandinsky', 'https://example.ai')

        axiosClientMock.mockRejectedValueOnce(new Error('Unexpected socket error'))

        await expect(
            service.request({
                method: 'POST',
                url: '/generate',
            })
        ).rejects.toMatchObject({
            statusCode: 503,
            message: expect.stringContaining('temporarily unavailable'),
        })
    })

    test('does not retry client validation errors except 429', async () => {
        const service = new TestAiService('GigaChat', 'https://example.ai')

        const operation = vi
            .fn<() => Promise<string>>()
            .mockRejectedValue(new AppError(400, 'bad request'))

        await expect(service.retry(operation, 2)).rejects.toMatchObject({
            statusCode: 400,
            message: 'bad request',
        })

        expect(operation).toHaveBeenCalledTimes(1)
    })

    test('retries 429 rate limit error because it can be temporary', async () => {
        vi.useFakeTimers()

        const service = new TestAiService('GigaChat', 'https://example.ai')

        const operation = vi
            .fn<() => Promise<string>>()
            .mockRejectedValue(new AppError(429, 'rate limited'))

        const resultPromise = service.retry(operation, 1)

        const assertion = expect(resultPromise).rejects.toMatchObject({
            statusCode: 503,
            message: expect.stringContaining('unavailable after 1 retries'),
        })

        await vi.advanceTimersByTimeAsync(1_000)

        await assertion

        expect(operation).toHaveBeenCalledTimes(2)
    })
})
