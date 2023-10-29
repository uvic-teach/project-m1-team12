import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import Ably from 'ably';
import { Message, Subscription, PresenceData } from './types';
import { createClient } from '@supabase/supabase-js'
import cors from 'cors';
import dotenv from 'dotenv';



const ably = new Ably.Realtime(process.env.ABLY_KEY || 'ABLY_KEY');
const app = express();
const PORT =  parseInt(process.env.PORT || "8080");

const supabaseUrl = 'https://vtcuspkqczxhqqptkxbl.supabase.co'
const supabaseKey = process.env.API_KEY || 'API_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

app.use(cors());
app.use(bodyParser.json());
dotenv.config();

app.post('/publish', async (req: Request, res: Response) => {
    const { channel: channelName, message }: { channel: string, message: Message } = req.body;
    if (!channelName || !message) {
        return res.sendStatus(400);
    }

    // Check Message is well formed
    if (message?.data == undefined || message?.id == undefined || message?.timestamp == undefined) {
        console.error('Missing Parameters.');
        return res.sendStatus(400);
    }


    const channel = ably.channels.get(channelName);

    channel.publish(message.name || '', message.data, async (err) => {
        if (err) {
            console.error('Publishing failed:', err.message);
            return res.sendStatus(500);
        }

        message.timestamp = Date.now();

        try {
            const { data, error } = await supabase
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
            if (error) throw error;
            res.json(data && data[0]);
        } catch (dbErr) {
            console.error(dbErr);
            res.sendStatus(500);
        }
    });
});

app.post('/subscribe', (req: Request, res: Response) => {
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

app.post('/unsubscribe', (req: Request, res: Response) => {
    const { channel: channelName, subscriptionId } = req.body;
    const channel = ably.channels.get(channelName);
    channel.unsubscribe(subscriptionId);
    res.send('Unsubscribed!');
});

app.post('/create-or-get-channel', async (req: Request, res: Response) => {
    const { user1, user2 } = req.body;
    if (!user1 || !user2) {
        return res.sendStatus(400);
    }
    const channelName = [user1, user2].sort().join('-'); // Ensures the channel name is consistent regardless of the order of users

    try {
        let { data, error } = await supabase
            .from('channels')
            .select('*')
            .eq('name', channelName);
        if (error) throw error;

        if (data && data.length > 0) {
            return res.json(data[0]);  // Return the existing channel if found
        }

        ({ data, error } = await supabase
            .from('channels')
            .insert([{ name: channelName }]));
        if (error) throw error;
        res.json(data && data[0]);  // Create and return the new channel if not found
    } catch (dbErr) {
        console.error(dbErr);
        res.sendStatus(500);
    }
});


app.get('/history/:channel', async (req: Request, res: Response) => {
    const { channel } = req.params;
    if (!channel) {
        return res.sendStatus(400);
    }
    const limit = req.query.limit || 10;

    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('channel', channel)
            .order('timestamp', { ascending: false })
            .limit(Number(limit));
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


app.get('/presence/:channel', async (req: Request, res: Response) => {
    const { channel: channelName } = req.params;
    const channel = ably.channels.get(channelName);
    // Attach
    await channel.attach((err) => {
        if (err) {
            return console.error("Error attaching to the channel."); 
        }
    });
    // Enter the presence set
    await channel.presence.enter("test", (err) => {
        if (err) {
            return console.error("Error entering presence set.");
        }
        console.log("Entered the presence set.");
    });

});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
