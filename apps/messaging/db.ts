import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'messaging',
    password: 'EasyLife',
    port: 5432,
});

const query = (text: string, params: any[]) => pool.query(text, params);

export default {
    query,
};
