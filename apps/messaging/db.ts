import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'messaging',
    password: process.env.DB_PASSWORD,
    port: 5432,
});

const query = (text: string, params: any[]) => pool.query(text, params);

export default {
    query,
};
