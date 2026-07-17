import { initDb } from './initDb'
import { pool } from './pool'

await initDb()
await pool.end()
