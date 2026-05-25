import { Redis } from 'ioredis'
import { config } from '../config/env.js'
import { logger } from '../utils/logger.js'
import type { WsBroadcastEvent } from '../types/wsBroadcast.js'

/**
 * Redis Pub/Sub для WebSocket-событий между инстансами backend.
 * Без REDIS_URL — fallback: событие обрабатывается только в текущем процессе.
 */
export class RedisWsPubSub {
    private publisher: Redis | null = null
    private subscriber: Redis | null = null
    private enabled = false
    private handler: ((event: WsBroadcastEvent) => void) | null = null

    async connect(handler: (event: WsBroadcastEvent) => void): Promise<void> {
        this.handler = handler

        if (!config.redis.url) {
            logger.info('redis ws pub/sub - disabled (REDIS_URL not set), local-only broadcasts')
            return
        }

        this.publisher = new Redis(config.redis.url, { maxRetriesPerRequest: 3 })
        this.subscriber = new Redis(config.redis.url, { maxRetriesPerRequest: 3 })

        await this.subscriber.subscribe(config.redis.wsChannel)

        this.subscriber.on('message', (channel: string, raw: string) => {
            if (channel !== config.redis.wsChannel) return
            try {
                const event = JSON.parse(raw) as WsBroadcastEvent
                this.handler?.(event)
            } catch (error) {
                logger.warn('redis ws pub/sub - invalid message', error)
            }
        })

        this.publisher.on('error', (error) => {
            logger.error('redis ws publisher error', error)
        })
        this.subscriber.on('error', (error) => {
            logger.error('redis ws subscriber error', error)
        })

        this.enabled = true
        logger.info(
            `redis ws pub/sub - connected (channel: ${config.redis.wsChannel}, instance: ${config.instanceId})`
        )
    }

    async publish(event: WsBroadcastEvent): Promise<void> {
        if (!this.enabled || !this.publisher) {
            this.handler?.(event)
            return
        }

        await this.publisher.publish(config.redis.wsChannel, JSON.stringify(event))
    }

    async disconnect(): Promise<void> {
        if (this.subscriber) {
            try {
                await this.subscriber.unsubscribe(config.redis.wsChannel)
                await this.subscriber.quit()
            } catch {
                this.subscriber.disconnect()
            }
            this.subscriber = null
        }

        if (this.publisher) {
            try {
                await this.publisher.quit()
            } catch {
                this.publisher.disconnect()
            }
            this.publisher = null
        }

        this.enabled = false
        this.handler = null
    }
}
