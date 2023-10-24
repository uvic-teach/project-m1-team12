'use client'

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const backendUrl = 'http://localhost:8080';  // Replace with your backend URL

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

/*

'use client'

import Link from "@mui/material/Link";
import { useState } from "react";
import { ExampleFetch } from "../components/ExampleFetch";

const mockContacts = [
    {
        name: "John Doe",
        lid: 1
    },
    {
        name: "Jane Doe",
        id: 2
    },
    {
        name: "Toby Murray",
        id: 3
    }
]

type ContactProps = {
    name: string;
    id: number;
}

const backendUrl = 'http://localhost:8080';  // Replace with your backend URL

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

export default function Messaging() {
    const [message, setMessage] = useState<string>('');  // State to hold the message
    const [channel] = useState<string>('default-channel');  // Assume a default channel for now
    const [contacts, setContacts] = useState<Array<{name: string, id: number}>>([]);  // Initialize with an empty array
    
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

    const handleCreateChannel = () => {
        const newChannelName = prompt("Enter new channel name:");
        if (newChannelName) {
            setContacts(prevContacts => [...prevContacts, { name: newChannelName, id: prevContacts.length + 1 }]);
        }
    };

    
    return (
        <div className="w-screen min-h-screen p-8 bg-orange-100 flex flex-col justify-start gap-8">
            <input type="text" defaultValue="Search..." className="border-2 border-gray-400 rounded-md text-gray-600 px-4" />
            <button onClick={handleCreateChannel} className="bg-green-500 rounded text-white py-2 px-4 font-bold mb-4">Create New Channel</button>
            <div className="flex">
                <div className="flex flex-col w-1/4 h-100 rounded-lg bg-white gap-2 divide-y-2">
                    {contacts.map(contact => {
                        return <Contact key={contact.id} {...contact} />
                    })}
                </div>
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
        </div>
    )
}

const Contact = ({ name }: ContactProps) => {
    return (
        <Link href={`/messaging/${name}`} underline="none" className="text-black">
            <div className="flex justify-between items-center px-1 m-1">
                <div className="flex flex-col gap-1">
                    <h1 className="text-lg font-semibold">{name}</h1>
                </div>
            </div>
        </Link>
    )
}

*/