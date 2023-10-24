"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'messaging',
    password: 'EasyLife',
    port: 5432,
});
const query = (text, params) => pool.query(text, params);
exports.default = {
    query,
};
