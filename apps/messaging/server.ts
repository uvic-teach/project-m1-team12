// server.ts

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import Ably from 'ably';
import db from './db';
import { Message, Subscription, PresenceData } from './types';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const ably = new Ably.Realtime(process.env.ABLY_KEY || 'ABLY_KEY');
const app = express();
app.use(cors());
const PORT =  parseInt(process.env.PORT || "8080");

app.use(bodyParser.json());

app.post('/publish', async (req: Request, res: Response) => {
    const { channel: channelName, message }: { channel: string, message: Message } = req.body;
    const channel = ably.channels.get(channelName);

    channel.publish(message.name || '', message.data, async (err) => {
        if (err) {
            console.error('Publishing failed:', err.message);
            return res.sendStatus(500);
        }

        message.timestamp = Date.now();

        const text = 'INSERT INTO messages (name, data, channel, client_id, connection_id, timestamp, extras, encoding) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
        const values = [message.name, message.data, channelName, message.clientId, message.connectionId, message.timestamp, JSON.stringify(message.extras), message.encoding];

        try {
            const result = await db.query(text, values);
            res.json(result.rows[0]);
        } catch (dbErr) {
            console.error(dbErr);
            res.sendStatus(500);
        }
    });
});

app.post('/subscribe', (req: Request, res: Response) => {
    const { channel: channelName } = req.body;
    const channel = ably.channels.get(channelName);
  
    const subscription = channel.subscribe('message', (message) => {
        console.log(message.data);
    });
  
    res.json({ status: 200 });
});

// TODO !TM - implement unsubscribe
app.post('/unsubscribe', (req: Request, res: Response) => {
    // This is an untested guess at what it might look like
    // const { channel: channelName, subscriptionId } = req.body;
    // const channel = ably.channels.get(channelName);
    // channel.unsubscribe(subscriptionId);
    // res.send('Unsubscribed!');
});

app.post('/create-or-get-channel', async (req: Request, res: Response) => {
    const { user1, user2 } = req.body;
    const channelName = [user1, user2].sort().join('-'); // Ensures the channel name is consistent regardless of the order of users

    const checkChannelText = 'SELECT * FROM channels WHERE name = $1';
    try {
        const existingChannel = await db.query(checkChannelText, [channelName]);
        if (existingChannel.rows.length > 0) {
            return res.json(existingChannel.rows[0]);  // Return the existing channel if found
        }
    } catch (dbErr) {
        console.error(dbErr);
        return res.sendStatus(500);
    }

    const createChannelText = 'INSERT INTO channels (name) VALUES ($1) RETURNING *';
    try {
        const result = await db.query(createChannelText, [channelName]);
        res.json(result.rows[0]);  // Create and return the new channel if not found
    } catch (dbErr) {
        console.error(dbErr);
        res.sendStatus(500);
    }
});


app.get('/history/:channel', async (req: Request, res: Response) => {
    const { channel } = req.params;
    const limit = req.query.limit || 10;

    const text = 'SELECT * FROM messages WHERE channel = $1 ORDER BY timestamp DESC LIMIT $2';
    const values = [channel, limit];
  
    try {
        const result = await db.query(text, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// TODO !TM - implement presence
app.get('/presence/:channel', async (req: Request, res: Response) => {
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
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
