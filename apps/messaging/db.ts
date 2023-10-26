import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    user: 'postgres',
    host: 'https://messaging-db.fly.dev',
    database: 'messaging-db',
    password: process.env.DB_PASSWORD,
    port: 5432,
});

const query = (text: string, params: any[]) => pool.query(text, params);

export default {
    query,
};
