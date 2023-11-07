'use client'

import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

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
    const [messages, setMessages] = useState([]);
    const [channel, setChannel] = useState("default");
    const [message, setMessage] = useState('');

    let messagesContainer = useRef<any>(null);

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
            handleFetchHistory();
        }

    }, [userId]);

    useEffect(() => {
        if (channel) {
            const messageHistory = async () => {
                try {
                    const history = await fetchHistory(channel);
                    setMessages(history.reverse());
                    messagesContainer.current.scrollIntoView({ block: "end" });
                } catch (error) {
                    console.error('Error fetching history:', error);
                }
            };

            messageHistory();
            // scroll to bottom of continer
        }
    }, [channel]);

    const handlePublish = async () => {
        try {
            await publishMessage(channel, message);
            setMessage('');
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
        <div className="w-screen h-screen p-8 bg-gradient-to-r from-slate-800 via-gray-800 to-indigo-950 flex flex-col justify-start gap-8">
            <div className="flex flex-col max-w-xl mx-auto h-100 gap-6">
                <div ref={messagesContainer} className="flex flex-col bg-gray-700 h-[75vh] overflow-y-scroll py-4 rounded-lg gap-y-4 max-w-lg no-scrollbar">
                    {messages.map((message: any) => <Message key={message.id} message={message} />)}
                </div>
                <div className="flex w-full text-lg rounded-lg gap-4">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="border-2 border-gray-400 rounded-md text-gray-600 w-full p-2"
                        />
                    <button onClick={handlePublish} className="w-sm bg-blue-500 rounded text-white px-4 font-bold">Send</button>
                </div>
            </div>
        </div>
    );
};

const Message = ({ message }: { message: any }) => {
    return (
            message.data[0] === "t" ?
            <div className="flex flex-col max-w-[16rem] p-4 rounded-r-lg bg-gray-300 gap-4">
                <p className="text-black">{message.data}</p>
            </div>
            :
            <div className="flex flex-col max-w-sm ml-auto p-4 rounded-l-lg bg-blue-500 gap-4">
                <p className="text-white">{message.data}</p>
            </div>
    );
}

export default Messaging;