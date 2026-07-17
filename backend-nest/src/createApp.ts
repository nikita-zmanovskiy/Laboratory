import { NestFactory } from '@nestjs/core'
import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { json } from 'express'
import { AppModule } from './app.module'
import { config } from './config/env'
import { corsOptions } from './config/cors'

export async function createApp(): Promise<INestApplication> {
    const app = await NestFactory.create(AppModule, {
        bodyParser: true,
        rawBody: false,
    })

    app.use(
        helmet({
            contentSecurityPolicy: config.csp.enabled
                ? {
                      directives: {
                          defaultSrc: ["'self'"],
                          baseUri: ["'self'"],
                          fontSrc: ["'self'", 'https:', 'data:'],
                          formAction: ["'self'"],
                          frameAncestors: ["'self'"],
                          imgSrc: ["'self'", 'data:', 'blob:'],
                          objectSrc: ["'none'"],
                          scriptSrc: ["'self'"],
                          scriptSrcAttr: ["'none'"],
                          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
                          connectSrc: ["'self'", ...config.cors.origins, 'ws:', 'wss:'],
                          upgradeInsecureRequests: config.csp.upgradeInsecureRequests ? [] : null,
                      },
                  }
                : false,
            crossOriginEmbedderPolicy: false,
        })
    )

    app.enableCors(corsOptions)
    app.use(cookieParser())
    app.use(json({ limit: config.jsonLimit }))

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Лаборатория ИИ API')
        .setDescription(
            'API для учебного веб-сервиса промт-инжиниринга\n\n' +
                'Основные возможности:\n' +
                '- Генерация текста через GigaChat\n' +
                '- Генерация изображений через GigaChat\n' +
                '- Управление классами\n' +
                '- Просмотр логов и статистики\n\n' +
                'Безопасность:\n' +
                '- CSRF токен обязателен для POST запросов\n' +
                '- Rate limit: 10 запросов в минуту\n' +
                '- Classroom code для изоляции сессий'
        )
        .setVersion('1.0.0')
        .addTag('Generate', 'Генерация текста и изображений')
        .addTag('Classrooms', 'Управление классами')
        .addTag('Logs', 'Логи запросов')
        .addTag('Stats', 'Статистика')
        .addTag('CSRF', 'CSRF токены')
        .addTag('Health', 'Проверка здоровья сервиса')
        .addTag('WebSocket', 'Токены для WebSocket')
        .addServer('http://localhost:3000', 'Development server')
        .addCookieAuth('lab_student')
        .addApiKey({ type: 'apiKey', name: 'x-csrf-token', in: 'header' }, 'csrf')
        .addApiKey({ type: 'apiKey', name: 'x-classroom-code', in: 'header' }, 'classroom')
        .build()

    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('api-docs', app, document, {
        jsonDocumentUrl: 'api-docs.json',
    })

    return app
}
