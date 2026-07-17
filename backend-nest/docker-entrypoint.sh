#!/bin/sh
echo "Waiting for database..."
until node -e "require('pg').Pool({connectionString:process.env.DATABASE_URL}).query('SELECT 1').then(()=>process.exit(0)).catch(()=>process.exit(1))" 2>/dev/null; do
  sleep 1
done
echo "Database ready!"
node dist/src/main.js
