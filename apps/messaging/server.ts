import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import Ably from 'ably';
import { Message, Subscription, PresenceData } from './types';
import { createClient } from '@supabase/supabase-js'
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT =  parseInt(process.env.PORT || "8080");

app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", 
    allowedHeaders: ["Content-Type", "Authorization"] 
  }));
  
app.use(bodyParser.json());

const ably = new Ably.Realtime(process.env.ABLY_KEY || 'ABLY_KEY');
const supabaseUrl = 'https://vtcuspkqczxhqqptkxbl.supabase.co'
const supabaseKey = process.env.API_KEY || 'API_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

app.post('/publish', async (req: Request, res: Response) => {
    const { channel: channelName, message }: { channel: string, message: Message } = req.body;

    if (message.data == undefined || message.clientId == undefined) {
        console.error('Missing Parameters' + JSON.stringify(message) + ' ' + JSON.stringify(message.data) + ' ' + JSON.stringify(message.clientId));
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
        } catch (dbErr: any) {
            console.error(dbErr);
            if (dbErr.code === '23505') {  // Unique constraint violation
                return res.sendStatus(200);
            }
            res.sendStatus(500);
        }
    });
})

app.post('/announce', async (req: Request, res: Response) => {
    const { message }: { message: Message } = req.body;
    if (!message) {
        return res.sendStatus(400);
    }

    // Check Message is well formed
    if (message.data == undefined) {
        console.error('Missing Parameters' + JSON.stringify(message) + ' ' + JSON.stringify(message.data) + ' ' + JSON.stringify(message.clientId));
        return res.sendStatus(400);
    }

    const channel = ably.channels.get("announcements");

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
                    channel: 'announcements',
                    client_id: message.clientId,
                    connection_id: message.connectionId,
                    timestamp: message.timestamp,
                    extras: message.extras,
                    encoding: message.encoding
                }]);
            if (error) throw error;
            res.json({ status: 200 })
        } catch (dbErr: any) {
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

    console.log(channelName)

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
        if (error?.code === '23505')  {
            //do nothing
        } else {
            throw(error);
        }
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
    const limit = 10; // Make dynamic?

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

app.get('/announcements', async (req: Request, res: Response) => {
    const limit = 2; // Make dynamic?

    try {
        // Calculate the timestamp for 24 hours ago
        const date24HoursAgo = new Date();
        date24HoursAgo.setHours(date24HoursAgo.getHours() - 24);

        // Convert to Unix timestamp (milliseconds since the epoch)
        const timestamp24HoursAgo = date24HoursAgo.getTime();

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('channel', 'announcements')
            // Use the Unix timestamp for comparison
            .gte('timestamp', timestamp24HoursAgo)
            .order('timestamp', { ascending: false })
            .limit(Number(limit));
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// currently unused and untested
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
