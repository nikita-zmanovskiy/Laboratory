import { initDb } from './initDb.js'
import { pool } from './pool.js'

await initDb()
await pool.end()
