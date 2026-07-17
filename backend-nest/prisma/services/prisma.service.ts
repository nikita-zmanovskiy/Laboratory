import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL?.trim() ?? '';

    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    if (
      connectionString.startsWith('prisma+') ||
      connectionString.startsWith('prisma://')
    ) {
      throw new Error(
        'DATABASE_URL must be a direct postgresql:// URL for Nest + @prisma/adapter-pg. ' +
          'Remove the prisma+postgres:// line from .env (that URL is only for `prisma dev`).',
      );
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
    await this.pool.query('SELECT 1');
    this.logger.log('PostgreSQL connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
