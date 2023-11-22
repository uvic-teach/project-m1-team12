'use client'

import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

const backendUrl = 'https://messaging-microservice.fly.dev'; 
// const backendUrl = 'http://localhost:8080'; 

// Retry function
async function retry(fn: Function, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function publishMessage(channel: string, message: string, clientId: string) {
    return retry(async () => {
        const response = await fetch(`${backendUrl}/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ channel, message: { data: message, clientId: clientId} })
        });
        const data = await response.json();
        return data;
    });
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
    const [clientId, setClientId] = useState("1");
    const [messages, setMessages] = useState([]);
    const [channel, setChannel] = useState("");
    const [message, setMessage] = useState('');

    let messagesContainer = useRef<any>(null);

    // fetch message history
    const messageHistory = async () => {
        try {
            const history = await fetchHistory(channel);
            setMessages(history.reverse());
            // scroll not working
            messagesContainer.current.scrollIntoView({ block: "end" });
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    // fetch channel if it exists, create channel otherwise
    useEffect(() => {
        setClientId(localStorage.getItem('userId') || "1");
        if (clientId) {
            const createOrGetChannel = async () => {
                try {
                    const response = await fetch(`${backendUrl}/create-or-get-channel`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ user1: clientId, user2: userId }),
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


    // fetch history when channel name is loaded
    // TODO: fix scroll and merge into one useEffect hook
    useEffect(() => {
        if (channel) {
            messageHistory();
        }
    }, [channel]);

    const handlePublish = async () => {
        try {
            await publishMessage(channel, message, clientId);
            setMessage('');
            messageHistory();
            console.log('Message published');
        } catch (error) {
            console.error('Error publishing message:', error);
        }
    };

    return (
        <div className="w-screen h-screen p-8 bg-gray-900 flex flex-col justify-start gap-8">
            <div className="flex flex-col max-w-xl mx-auto h-100 gap-6">
                <div ref={messagesContainer} className="flex flex-col bg-gray-800 border-2 border-gray-700 h-[75vh] overflow-y-scroll py-4 rounded-lg gap-y-4 max-w-lg no-scrollbar">
                    {messages.map((message: any) => <Message key={message.id} message={message} clientId={clientId}/>)}
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

const Message = ({ message, clientId }: { message: {data: string, client_id: string}, clientId: string }) => {
    return (
            message.client_id == clientId ?
            <div className="flex flex-col max-w-[16rem] ml-auto p-4 rounded-l-lg bg-blue-500 gap-4">
                <p className="text-white text-sm">{message.data}</p>
            </div>
            :
            <div className="flex flex-col max-w-[16rem] p-4 rounded-r-lg bg-gray-300 gap-4">
                <p className="text-black">{message.data}</p>
            </div>
    );
}

export default Messaging;