#!/bin/sh
set -e

echo "Waiting for database..."
until node -e "const {Pool}=require('pg'); const p=new Pool({connectionString:process.env.DATABASE_URL}); p.query('SELECT 1').then(()=>{p.end(); process.exit(0)}).catch(()=>process.exit(1))" 2>/dev/null; do
  sleep 1
done
echo "Database ready!"

echo "Syncing Prisma schema..."
npx prisma db push --skip-generate

echo "Starting NestJS..."
exec node dist/src/main.js
