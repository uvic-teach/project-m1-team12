"use strict";
// server.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const ably_1 = __importDefault(require("ably"));
const db_1 = __importDefault(require("./db"));
const cors_1 = __importDefault(require("cors"));
const ably = new ably_1.default.Realtime('Zq2E3w.pv_Uog:ddShQDXgQsFi1NvKCpjFcbXxZw0zdgvYdDCGNjCuxnU');
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const PORT = parseInt(process.env.PORT || "8080");
app.use(body_parser_1.default.json());
app.post('/publish', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel: channelName, message } = req.body;
    const channel = ably.channels.get(channelName);
    channel.publish(message.name || '', message.data, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error('Publishing failed:', err.message);
            return res.sendStatus(500);
        }
        message.timestamp = Date.now();
        const text = 'INSERT INTO messages (name, data, client_id, connection_id, timestamp, extras, encoding) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
        const values = [message.name, message.data, message.clientId, message.connectionId, message.timestamp, JSON.stringify(message.extras), message.encoding];
        try {
            const result = yield db_1.default.query(text, values);
            res.json(result.rows[0]);
        }
        catch (dbErr) {
            console.error(dbErr);
            res.sendStatus(500);
        }
    }));
}));
app.post('/subscribe', (req, res) => {
    const { channel: channelName } = req.body;
    const channel = ably.channels.get(channelName);
    const subscription = channel.subscribe('message', (message) => {
        console.log(message.data);
    });
    res.json({ status: 200 });
});
// TODO !TM - implement unsubscribe
app.post('/unsubscribe', (req, res) => {
    const { channel: channelName, subscriptionId } = req.body;
    const channel = ably.channels.get(channelName);
    channel.unsubscribe(subscriptionId);
    res.send('Unsubscribed!');
});
app.post('/create-or-get-channel', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user1, user2 } = req.body;
    const channelName = [user1, user2].sort().join('-'); // Ensures the channel name is consistent regardless of the order of users
    const checkChannelText = 'SELECT * FROM channels WHERE name = $1';
    try {
        const existingChannel = yield db_1.default.query(checkChannelText, [channelName]);
        if (existingChannel.rows.length > 0) {
            return res.json(existingChannel.rows[0]); // Return the existing channel if found
        }
    }
    catch (dbErr) {
        console.error(dbErr);
        return res.sendStatus(500);
    }
    const createChannelText = 'INSERT INTO channels (name) VALUES ($1) RETURNING *';
    try {
        const result = yield db_1.default.query(createChannelText, [channelName]);
        res.json(result.rows[0]); // Create and return the new channel if not found
    }
    catch (dbErr) {
        console.error(dbErr);
        res.sendStatus(500);
    }
}));
app.get('/history/:channel', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel } = req.params;
    const limit = req.query.limit || 10;
    const text = 'SELECT * FROM messages WHERE channel = $1 ORDER BY timestamp DESC LIMIT $2';
    const values = [channel, limit];
    try {
        const result = yield db_1.default.query(text, values);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}));
// TODO !TM - implement presence
app.get('/presence/:channel', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel: channelName } = req.params;
    const channel = ably.channels.get(channelName);
    channel.presence.get((err, presenceSet) => {
        if (err) {
            console.error('Presence retrieval failed:', err.message);
            return res.sendStatus(500);
        }
        res.json(presenceSet);
    });
}));
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
