interface QueuedRequest {
    id: string
    execute: () => Promise<unknown>
    resolve: (value: unknown) => void
    reject: (error: unknown) => void
    timestamp: number
}

export class RequestQueueService {
    private queue: QueuedRequest[] = []
    private processing = false
    private maxConcurrent: number
    private delayBetweenRequests: number

    constructor(maxConcurrent: number = 3, delayMs: number = 500) {
        this.maxConcurrent = maxConcurrent
        this.delayBetweenRequests = delayMs
    }

    async enqueue<T>(execute: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({
                id: Math.random().toString(36).substring(7),
                execute,
                resolve: (value) => resolve(value as T),
                reject,
                timestamp: Date.now(),
            })
            void this.processQueue()
        })
    }

    private async processQueue(): Promise<void> {
        if (this.processing) return
        this.processing = true

        while (this.queue.length > 0) {
            const batch = this.queue.splice(0, this.maxConcurrent)
            const promises = batch.map(async (request) => {
                try {
                    const result = await request.execute()
                    request.resolve(result)
                } catch (error) {
                    request.reject(error)
                }
            })

            await Promise.all(promises)

            if (this.queue.length > 0) {
                await this.sleep(this.delayBetweenRequests)
            }
        }

        this.processing = false
    }

    getQueueSize(): number {
        return this.queue.length
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
}
