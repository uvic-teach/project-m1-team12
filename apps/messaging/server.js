const Ably = require('ably');
const ably = new Ably.Realtime('Zq2E3w.pv_Uog:ddShQDXgQsFi1NvKCpjFcbXxZw0zdgvYdDCGNjCuxnU');
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// called whenever a user sends a message
app.post('/send', (req, res) => {
    const channel = ably.channels.get('channel-name');
    channel.publish('message', req.body.text);
    res.send('Message sent!');
});

// called whenever a user joins a chat
app.get('/subscribe', (req, res) => {
    const channel = ably.channels.get('channel-name');
    channel.subscribe('message', (message) => {
        res.send(message.data);
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

