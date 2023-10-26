'use client'

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const backendUrl = 'http://localhost:8080'; 

async function publishMessage(channel: string, message: string) {
    try {
        const response = await fetch(`${backendUrl}/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ channel, message: { data: message } })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error publishing message:', error);
        throw error;
    }
}

async function fetchHistory(channel: string, limit: number = 10) {
    try {
        const response = await fetch(`${backendUrl}/history/${channel}?limit=${limit}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching history:', error);
        throw error;
    }
}

const Messaging = ({ params }: { params: { userId: string } }) => {
    const { userId } = params;
    const [channel, setChannel] = useState("default");
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (userId) {
            const createOrGetChannel = async () => {
                try {
                    const response = await fetch(`${backendUrl}/create-or-get-channel`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user1: 1, user2: userId }),
                    });
                    const data = await response.json();
                    setChannel(data.name);
                } catch (error) {
                    console.error('Error:', error);
                }
            };

            createOrGetChannel();
        }
    }, [userId]);

    const handlePublish = async () => {
        try {
            await publishMessage(channel, message);
            console.log('Message published');
        } catch (error) {
            console.error('Error publishing message:', error);
        }
    };
    
    const handleFetchHistory = async () => {
        try {
            const history = await fetchHistory(channel);
            console.log('Message history:', history);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    return (
        <div className="w-screen min-h-screen p-8 bg-orange-100 flex flex-col justify-start gap-8">
            <div className="flex flex-col w-3/4 ml-4 p-4 rounded-lg bg-white">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="border-2 border-gray-400 rounded-md text-gray-600 px-4 mb-4"
                />
                <button onClick={handlePublish} className="bg-blue-500 rounded text-white py-2 px-4 font-bold">Publish</button>
                <button onClick={handleFetchHistory} className="bg-blue-500 rounded text-white py-2 px-4 font-bold mt-4">Fetch History</button>
            </div>
        </div>
    );
};

export default Messaging;