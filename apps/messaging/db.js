"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    user: 'postgres',
    host: 'https://messaging-db.fly.dev',
    database: 'messaging-db',
    password: process.env.DB_PASSWORD,
    port: 5432,
});
const query = (text, params) => pool.query(text, params);
exports.default = {
    query,
};
