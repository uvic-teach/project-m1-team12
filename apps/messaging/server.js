"use strict";
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
const supabase_js_1 = require("@supabase/supabase-js");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const ably = new ably_1.default.Realtime(process.env.ABLY_KEY || 'ABLY_KEY');
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "8080");
const supabaseUrl = 'https://vtcuspkqczxhqqptkxbl.supabase.co';
const supabaseKey = process.env.API_KEY || 'API_KEY';
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
dotenv_1.default.config();
app.post('/publish', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel: channelName, message } = req.body;
    if (!channelName || !message) {
        return res.sendStatus(400);
    }
    // TODO !TM - implement safety check on the message fields
    // Note that not all the fields are required
    const channel = ably.channels.get(channelName);
    channel.publish(message.name || '', message.data, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error('Publishing failed:', err.message);
            return res.sendStatus(500);
        }
        message.timestamp = Date.now();
        try {
            const { data, error } = yield supabase
                .from('messages')
                .insert([{
                    name: message.name,
                    data: message.data,
                    channel: channelName,
                    client_id: message.clientId,
                    connection_id: message.connectionId,
                    timestamp: message.timestamp,
                    extras: message.extras,
                    encoding: message.encoding
                }]);
            if (error)
                throw error;
            res.json(data && data[0]);
        }
        catch (dbErr) {
            console.error(dbErr);
            res.sendStatus(500);
        }
    }));
}));
app.post('/subscribe', (req, res) => {
    const { channel: channelName } = req.body;
    if (!channelName) {
        return res.sendStatus(400);
    }
    const channel = ably.channels.get(channelName);
    const subscription = channel.subscribe('message', (message) => {
        console.log(message.data);
    });
    res.json({ status: 200 });
});
// TODO !TM - implement unsubscribe
app.post('/unsubscribe', (req, res) => {
    // This is an untested guess at what it might look like
    // const { channel: channelName, subscriptionId } = req.body;
    // const channel = ably.channels.get(channelName);
    // channel.unsubscribe(subscriptionId);
    // res.send('Unsubscribed!');
});
app.post('/create-or-get-channel', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user1, user2 } = req.body;
    if (!user1 || !user2) {
        return res.sendStatus(400);
    }
    const channelName = [user1, user2].sort().join('-'); // Ensures the channel name is consistent regardless of the order of users
    try {
        let { data, error } = yield supabase
            .from('channels')
            .select('*')
            .eq('name', channelName);
        if (error)
            throw error;
        if (data && data.length > 0) {
            return res.json(data[0]); // Return the existing channel if found
        }
        ({ data, error } = yield supabase
            .from('channels')
            .insert([{ name: channelName }]));
        if (error)
            throw error;
        res.json(data && data[0]); // Create and return the new channel if not found
    }
    catch (dbErr) {
        console.error(dbErr);
        res.sendStatus(500);
    }
}));
app.get('/history/:channel', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel } = req.params;
    if (!channel) {
        return res.sendStatus(400);
    }
    const limit = req.query.limit || 10;
    try {
        const { data, error } = yield supabase
            .from('messages')
            .select('*')
            .eq('channel', channel)
            .order('timestamp', { ascending: false })
            .limit(Number(limit));
        if (error)
            throw error;
        res.json(data);
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}));
// TODO !TM - implement presence
app.get('/presence/:channel', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // This is an untested guess at what it might look like
    // const { channel: channelName } = req.params;
    // const channel = ably.channels.get(channelName);
    // channel.presence.get((err, presenceSet) => {
    //     if (err) {
    //         console.error('Presence retrieval failed:', err.message);
    //         return res.sendStatus(500);
    //     }
    //     res.json(presenceSet);
    // });
}));
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
